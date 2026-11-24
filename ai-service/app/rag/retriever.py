"""
Hybrid Retrieval Service for KisanSetu Policy Documents.
Combines Dense Semantic Vector Search (ChromaDB + Sentence Transformers)
with Sparse Keyword Search (BM25) using Reciprocal Rank Fusion (RRF).
Supports scheme-level ('KCC', 'MSP', 'PMFBY') and document-level filtering.
"""

import logging
from typing import List, Optional, Tuple, Dict, Any
from langchain_core.documents import Document

from app.core.config import settings
from app.rag.vector_store import vector_store_service

logger = logging.getLogger(__name__)


class PolicyRetrieverService:
    """
    Manages hybrid document retrieval for farmer policy queries.
    Blends Dense Semantic Search (embeddings) with Sparse Keyword Search (BM25)
    via Reciprocal Rank Fusion (RRF).
    """

    _bm25_retriever = None
    _bm25_doc_count = 0
    _corpus_documents: List[Document] = []

    @classmethod
    def _ensure_bm25_index(cls) -> Optional[Any]:
        """
        Initializes or refreshes the in-memory BM25 sparse retriever from the
        persisted ChromaDB collection. Rebuilds if collection size changes.
        """
        try:
            from langchain_community.retrievers.bm25 import BM25Retriever

            collection = vector_store_service.client.get_collection(
                vector_store_service.collection_name
            )
            count = collection.count()

            if count == 0:
                cls._bm25_retriever = None
                cls._corpus_documents = []
                cls._bm25_doc_count = 0
                return None

            # If retriever exists and chunk count has not changed, reuse cached instance
            if cls._bm25_retriever is not None and cls._bm25_doc_count == count:
                return cls._bm25_retriever

            # Retrieve all document contents and metadata from Chroma
            results = collection.get(include=["documents", "metadatas"])
            raw_docs = results.get("documents", [])
            raw_metas = results.get("metadatas", [])

            documents = [
                Document(page_content=content, metadata=meta or {})
                for content, meta in zip(raw_docs, raw_metas)
            ]

            cls._corpus_documents = documents
            cls._bm25_doc_count = len(documents)
            cls._bm25_retriever = BM25Retriever.from_documents(
                documents=documents,
                k=settings.RETRIEVER_FETCH_K
            )
            logger.info("BM25 sparse index built successfully with %d chunks", len(documents))
            return cls._bm25_retriever

        except Exception as e:
            logger.warning("BM25 index initialization failed (%s); continuing with dense retrieval only", e)
            return None

    @classmethod
    def refresh_bm25_index(cls):
        """Forces a rebuild of the BM25 sparse index."""
        cls._bm25_doc_count = -1
        cls._ensure_bm25_index()

    @classmethod
    async def retrieve_relevant_chunks(
        cls,
        query: str,
        scheme: Optional[str] = None,
        document_id: Optional[str] = None,
        k: int = settings.RETRIEVER_K,
        fetch_k: int = settings.RETRIEVER_FETCH_K,
        lambda_mult: float = settings.RETRIEVER_LAMBDA_MULT
    ) -> Tuple[List[Document], Optional[float]]:
        """
        Performs Hybrid Search (Dense Semantic MMR + Sparse BM25) with Reciprocal Rank Fusion (RRF).

        Returns:
            Tuple of (fused_retrieved_documents, best_distance_score).
            For L2 distance, lower score = higher similarity.
        """
        clean_query = query.strip()
        if not clean_query:
            return [], None

        # Build Chroma metadata filter
        filter_kwargs: Optional[Dict[str, Any]] = None
        if scheme and document_id:
            filter_kwargs = {
                "$and": [
                    {"scheme": scheme.upper()},
                    {"document_id": document_id}
                ]
            }
        elif scheme:
            filter_kwargs = {"scheme": scheme.upper()}
        elif document_id:
            filter_kwargs = {"document_id": document_id}

        # -----------------------------------------------------------------
        # 1. Dense Semantic Retrieval (MMR + Distance Inspection)
        # -----------------------------------------------------------------
        try:
            results_with_score = vector_store_service.similarity_search_with_score(
                query=clean_query,
                k=fetch_k,
                filter_kwargs=filter_kwargs
            )
        except Exception as e:
            logger.warning("Similarity search pre-flight error: %s. Retrying without filter.", e)
            results_with_score = vector_store_service.similarity_search_with_score(
                query=clean_query,
                k=fetch_k
            )

        if not results_with_score:
            logger.info("No matching chunks found in vector database for query: '%s'", clean_query[:50])
            return [], None

        best_score = min(score for doc, score in results_with_score)
        logger.info(
            "Dense Search: retrieved %d candidates. Best score: %.4f (threshold: %.2f)",
            len(results_with_score),
            best_score,
            settings.MAX_DISTANCE_THRESHOLD
        )

        # Dense MMR retrieval
        search_kwargs = {
            "k": max(k, 5),
            "fetch_k": fetch_k,
            "lambda_mult": lambda_mult
        }
        retriever = vector_store_service.get_retriever(
            search_kwargs=search_kwargs,
            filter_kwargs=filter_kwargs
        )

        try:
            dense_docs = await retriever.ainvoke(clean_query)
        except Exception as e:
            logger.warning("Async MMR retrieval failed (%s), falling back to synchronous invoke", e)
            dense_docs = retriever.invoke(clean_query)

        # -----------------------------------------------------------------
        # 2. Sparse Keyword Retrieval (BM25)
        # -----------------------------------------------------------------
        sparse_docs: List[Document] = []
        try:
            bm25 = cls._ensure_bm25_index()
            if bm25 is not None:
                bm25_hits = bm25.invoke(clean_query)
                # Apply scheme / document_id filtering to BM25 results if requested
                for d in bm25_hits:
                    meta = d.metadata or {}
                    if scheme and meta.get("scheme", "").upper() != scheme.upper():
                        continue
                    if document_id and meta.get("document_id") != document_id:
                        continue
                    sparse_docs.append(d)
        except Exception as e:
            logger.warning("BM25 retrieval encountered an error: %s", e)

        # -----------------------------------------------------------------
        # 3. Reciprocal Rank Fusion (RRF)
        # -----------------------------------------------------------------
        if not sparse_docs:
            # Fallback to pure dense results if sparse produced no matches
            return dense_docs[:k], best_score

        rrf_k = 60
        dense_weight = 0.6
        sparse_weight = 0.4

        fused_scores: Dict[str, float] = {}
        doc_registry: Dict[str, Document] = {}

        for rank, doc in enumerate(dense_docs):
            key = doc.metadata.get("chunk_id") or doc.page_content[:100]
            doc_registry[key] = doc
            fused_scores[key] = fused_scores.get(key, 0.0) + (dense_weight / (rrf_k + rank + 1))

        for rank, doc in enumerate(sparse_docs):
            key = doc.metadata.get("chunk_id") or doc.page_content[:100]
            if key not in doc_registry:
                doc_registry[key] = doc
            fused_scores[key] = fused_scores.get(key, 0.0) + (sparse_weight / (rrf_k + rank + 1))

        # Sort documents by fused score descending
        ranked_keys = sorted(fused_scores.keys(), key=lambda x: fused_scores[x], reverse=True)
        fused_docs = [doc_registry[k_id] for k_id in ranked_keys[:k]]

        logger.info(
            "Hybrid RRF Fused: %d dense + %d sparse -> %d top candidates",
            len(dense_docs),
            len(sparse_docs),
            len(fused_docs)
        )

        return fused_docs, best_score


retriever_service = PolicyRetrieverService()
