"""
ChromaDB Vector Store Service for KisanSetu.
Manages persistent Chroma storage for the BGE-M3 collection: 'kisansetu_policy_bge_m3'.
Reuses and hardens the Chroma service from Enterprise RAG System.
"""

import logging
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path

import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.core.config import settings
from app.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)


class ChromaVectorStoreService:
    """
    Manages persistent ChromaDB vector storage using BGE-M3 dense embeddings.
    Dedicated collection ensures complete isolation from legacy 768-dim embeddings.
    """

    def __init__(
        self,
        persist_directory: str = settings.CHROMA_PERSIST_DIRECTORY,
        collection_name: str = settings.CHROMA_COLLECTION_NAME
    ):
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.embeddings = get_embeddings()

        # Ensure persist directory exists
        Path(self.persist_directory).mkdir(parents=True, exist_ok=True)

        logger.info(
            "Initializing Chroma PersistentClient at '%s' with collection '%s'",
            self.persist_directory,
            self.collection_name
        )

        self.client = chromadb.PersistentClient(path=self.persist_directory)
        self.vectorstore = Chroma(
            client=self.client,
            collection_name=self.collection_name,
            embedding_function=self.embeddings
        )

    def add_documents(self, documents: List[Document]) -> int:
        """
        Adds a batch of document chunks to the Chroma collection.
        Returns the count of added chunks.
        """
        if not documents:
            return 0
        self.vectorstore.add_documents(documents)
        logger.info("Successfully added %d chunks to collection '%s'", len(documents), self.collection_name)
        return len(documents)

    def delete_document(self, document_id: str) -> bool:
        """
        Deletes all chunks associated with a given document_id.
        """
        try:
            collection = self.client.get_collection(self.collection_name)
            collection.delete(where={"document_id": document_id})
            logger.info("Deleted document chunks with document_id '%s'", document_id)
            return True
        except Exception as e:
            logger.error("Failed to delete document '%s': %s", document_id, e)
            return False

    def get_all_documents_info(self) -> List[Dict[str, Any]]:
        """
        Aggregates and returns metadata information for all documents currently indexed.
        """
        try:
            collection = self.client.get_collection(self.collection_name)
            results = collection.get(include=["metadatas"])
            metadatas = results.get("metadatas", [])

            doc_map: Dict[str, Dict[str, Any]] = {}
            for meta in metadatas:
                if not meta:
                    continue
                doc_id = meta.get("document_id")
                if not doc_id:
                    continue

                if doc_id not in doc_map:
                    doc_map[doc_id] = {
                        "document_id": doc_id,
                        "filename": meta.get("source", "Unknown"),
                        "scheme": meta.get("scheme", "GENERAL"),
                        "total_chunks": 0,
                        "chunk_size": meta.get("chunk_size"),
                        "chunk_overlap": meta.get("chunk_overlap"),
                        "authority": meta.get("authority", "Government of India"),
                        "url": meta.get("url", ""),
                        "effective_date": meta.get("effective_date", "")
                    }
                doc_map[doc_id]["total_chunks"] += 1

            return list(doc_map.values())
        except Exception as e:
            logger.warning("Could not fetch document metadata from collection '%s': %s", self.collection_name, e)
            return []

    def get_retriever(
        self,
        search_kwargs: Dict[str, Any],
        filter_kwargs: Optional[Dict[str, Any]] = None
    ):
        """
        Returns a LangChain retriever configured with Maximal Marginal Relevance (MMR).
        """
        kwargs = dict(search_kwargs)
        if filter_kwargs:
            kwargs["filter"] = filter_kwargs

        return self.vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs=kwargs
        )

    def similarity_search_with_score(
        self,
        query: str,
        k: int = settings.RETRIEVER_K,
        filter_kwargs: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[Document, float]]:
        """
        Runs vector similarity search and returns documents with L2 distance scores.
        Lower score signifies higher similarity.
        """
        return self.vectorstore.similarity_search_with_score(
            query=query,
            k=k,
            filter=filter_kwargs
        )

    def get_stats(self) -> Dict[str, Any]:
        """
        Returns collection status and count of indexed vectors.
        """
        try:
            collection = self.client.get_collection(self.collection_name)
            count = collection.count()
            return {
                "collection_name": self.collection_name,
                "persist_directory": self.persist_directory,
                "total_chunks": count,
                "status": "READY"
            }
        except Exception as e:
            return {
                "collection_name": self.collection_name,
                "persist_directory": self.persist_directory,
                "total_chunks": 0,
                "status": f"EMPTY_OR_UNINITIALIZED: {str(e)}"
            }


# Singleton instance
vector_store_service = ChromaVectorStoreService()
