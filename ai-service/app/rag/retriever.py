"""
Retrieval Service for KisanSetu Policy Documents.
Combines L2 distance inspection with Maximal Marginal Relevance (MMR) retrieval.
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
    Manages document retrieval for farmer policy queries.
    Provides MMR diverse retrieval and score diagnostics.
    """

    @staticmethod
    async def retrieve_relevant_chunks(
        query: str,
        scheme: Optional[str] = None,
        document_id: Optional[str] = None,
        k: int = settings.RETRIEVER_K,
        fetch_k: int = settings.RETRIEVER_FETCH_K,
        lambda_mult: float = settings.RETRIEVER_LAMBDA_MULT
    ) -> Tuple[List[Document], Optional[float]]:
        """
        Retrieves relevant policy chunks for a farmer query.
        Returns:
            Tuple of (retrieved_documents, best_distance_score).
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

        # Step 1: Pre-flight distance inspection
        try:
            results_with_score = vector_store_service.similarity_search_with_score(
                query=clean_query,
                k=fetch_k,
                filter_kwargs=filter_kwargs
            )
        except Exception as e:
            logger.warning("Similarity search pre-flight error: %s. Retrying without filter if applicable.", e)
            results_with_score = vector_store_service.similarity_search_with_score(
                query=clean_query,
                k=fetch_k
            )

        if not results_with_score:
            logger.info("No matching chunks found in vector database for query: '%s'", clean_query[:50])
            return [], None

        best_score = min(score for doc, score in results_with_score)
        logger.info(
            "Retrieved %d candidates. Best L2 distance score: %.4f (threshold: %.2f)",
            len(results_with_score),
            best_score,
            settings.MAX_DISTANCE_THRESHOLD
        )

        # Step 2: MMR Diverse Retrieval
        search_kwargs = {
            "k": k,
            "fetch_k": fetch_k,
            "lambda_mult": lambda_mult
        }

        retriever = vector_store_service.get_retriever(
            search_kwargs=search_kwargs,
            filter_kwargs=filter_kwargs
        )

        try:
            mmr_docs = await retriever.ainvoke(clean_query)
        except Exception as e:
            logger.warning("Async MMR retrieval failed (%s), falling back to synchronous invoke", e)
            mmr_docs = retriever.invoke(clean_query)

        return mmr_docs, best_score


retriever_service = PolicyRetrieverService()
