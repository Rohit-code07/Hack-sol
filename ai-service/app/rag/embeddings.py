"""
BGE-M3 Multilingual Embedding Service for KisanSetu.
Replaces sentence-transformers/all-mpnet-base-v2 with BAAI/bge-m3.
Generates 1024-dimensional dense vectors with multilingual support (Hindi, English, regional variants).
Implements LangChain Embeddings interface for native ChromaDB and MMR integration.
"""

import logging
import threading
from typing import List, Optional, Any
import numpy as np

from langchain_core.embeddings import Embeddings
from app.core.config import settings

logger = logging.getLogger(__name__)


class BGEM3Embeddings(Embeddings):
    """
    LangChain-compatible Embeddings adapter for BAAI/bge-m3.
    Loads model once as a thread-safe singleton.
    Provides 1024-dimensional dense embeddings for document indexing and query retrieval.
    """
    _instance: Optional["BGEM3Embeddings"] = None
    _lock = threading.Lock()
    _model: Any = None
    _model_type: Optional[str] = None  # 'flag_embedding' or 'sentence_transformer'

    def __init__(
        self,
        model_name: str = settings.BGE_M3_MODEL,
        device: str = settings.EMBEDDING_DEVICE,
        normalize: bool = settings.NORMALIZE_EMBEDDINGS
    ):
        self.model_name = model_name
        self.device = device
        self.normalize = normalize

    @classmethod
    def get_model(cls, model_name: str = settings.BGE_M3_MODEL, device: str = settings.EMBEDDING_DEVICE):
        """
        Thread-safe lazy initialization of the BGE-M3 model.
        Prioritizes official FlagEmbedding, falling back to SentenceTransformers.
        """
        if cls._model is not None:
            return cls._model, cls._model_type

        with cls._lock:
            if cls._model is not None:
                return cls._model, cls._model_type

            logger.info("Initializing BGE-M3 embedding model: %s on device: %s", model_name, device)

            # Strategy 1: Official FlagEmbedding BGEM3FlagModel
            try:
                from FlagEmbedding import BGEM3FlagModel
                logger.info("Loading BGE-M3 via FlagEmbedding.BGEM3FlagModel...")
                cls._model = BGEM3FlagModel(
                    model_name_or_path=model_name,
                    use_fp16=False,
                    device=device
                )
                cls._model_type = "flag_embedding"
                logger.info("BGE-M3 model loaded successfully via FlagEmbedding.")
                return cls._model, cls._model_type
            except Exception as e:
                logger.warning("FlagEmbedding loader failed: %s. Attempting SentenceTransformer fallback...", e)

            # Strategy 2: SentenceTransformer BGE-M3 loader
            try:
                from sentence_transformers import SentenceTransformer
                logger.info("Loading BGE-M3 via SentenceTransformer...")
                cls._model = SentenceTransformer(model_name, device=device)
                cls._model_type = "sentence_transformer"
                logger.info("BGE-M3 model loaded successfully via SentenceTransformer.")
                return cls._model, cls._model_type
            except Exception as e:
                logger.error("Failed to load BGE-M3 model via all loaders: %s", e)
                raise RuntimeError(
                    f"Unable to load mandatory embedding model '{model_name}'. "
                    f"Ensure internet connectivity for initial weight download or pre-cache weights. Error: {e}"
                ) from e

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generates dense embeddings for a list of document chunks.
        Returns a list of 1024-dimensional float lists.
        """
        if not texts:
            return []

        model, mtype = self.get_model(self.model_name, self.device)

        if mtype == "flag_embedding":
            # BGEM3FlagModel returns a dict containing 'dense_vecs'
            output = model.encode(
                texts,
                batch_size=12,
                max_length=8192,
                return_dense=True,
                return_sparse=False,
                return_colbert_vecs=False
            )
            dense_vectors = output["dense_vecs"]
            if isinstance(dense_vectors, np.ndarray):
                return dense_vectors.tolist()
            return [v.tolist() if hasattr(v, "tolist") else list(v) for v in dense_vectors]

        elif mtype == "sentence_transformer":
            vectors = model.encode(
                texts,
                batch_size=12,
                normalize_embeddings=self.normalize,
                show_progress_bar=False
            )
            return vectors.tolist() if hasattr(vectors, "tolist") else [list(v) for v in vectors]

        raise ValueError(f"Unknown model type: {mtype}")

    def embed_query(self, text: str) -> List[float]:
        """
        Generates a dense embedding for a single user search query.
        Returns a single 1024-dimensional float list.
        """
        if not text or not text.strip():
            # Return a zero vector of dimension 1024 if query is empty
            return [0.0] * 1024

        model, mtype = self.get_model(self.model_name, self.device)

        if mtype == "flag_embedding":
            output = model.encode(
                [text],
                max_length=8192,
                return_dense=True,
                return_sparse=False,
                return_colbert_vecs=False
            )
            dense_vector = output["dense_vecs"][0]
            return dense_vector.tolist() if hasattr(dense_vector, "tolist") else list(dense_vector)

        elif mtype == "sentence_transformer":
            vector = model.encode(
                text,
                normalize_embeddings=self.normalize,
                show_progress_bar=False
            )
            return vector.tolist() if hasattr(vector, "tolist") else list(vector)

        raise ValueError(f"Unknown model type: {mtype}")


class EmbeddingService:
    """
    Centralized singleton manager for BGE-M3 embeddings.
    """
    _instance: Optional[BGEM3Embeddings] = None
    _lock = threading.Lock()

    @classmethod
    def get_embeddings(cls) -> BGEM3Embeddings:
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = BGEM3Embeddings()
        return cls._instance

    @classmethod
    def reset(cls):
        """Allows resetting for testing or re-configuration."""
        with cls._lock:
            cls._instance = None
            BGEM3Embeddings._model = None
            BGEM3Embeddings._model_type = None


get_embeddings = EmbeddingService.get_embeddings
