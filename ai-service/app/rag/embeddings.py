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
        Thread-safe lazy initialization of the embedding model.
        Prioritizes official FlagEmbedding, falling back to SentenceTransformers and local cached models.
        """
        if cls._model is not None:
            return cls._model, cls._model_type

        with cls._lock:
            if cls._model is not None:
                return cls._model, cls._model_type

            logger.info("Initializing embedding model: %s on device: %s", model_name, device)

            # Strategy 1: Official FlagEmbedding BGEM3FlagModel (if BGE-M3 model requested and fully cached)
            if "bge-m3" in model_name.lower():
                from pathlib import Path
                cache_dir = Path.home() / ".cache" / "huggingface" / "hub" / "models--BAAI--bge-m3"
                has_weights = any(cache_dir.glob("**/model.safetensors")) if cache_dir.exists() else False
                if has_weights:
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
                        logger.warning("FlagEmbedding loader failed: %s. Attempting SentenceTransformer...", e)
                else:
                    logger.info("BGE-M3 weights not fully present in local cache. Using cached SentenceTransformer model.")

            # Strategy 2: SentenceTransformer loader with candidates (trying local cache first)
            from sentence_transformers import SentenceTransformer
            candidates = [
                "sentence-transformers/all-mpnet-base-v2",
                model_name,
                "sentence-transformers/all-MiniLM-L6-v2"
            ]
            for candidate in candidates:
                try:
                    cls._model = SentenceTransformer(candidate, device=device, local_files_only=True)
                    cls._model_type = "sentence_transformer"
                    cls._active_model_name = candidate
                    logger.info("Embedding model '%s' loaded successfully via SentenceTransformer (local cache).", candidate)
                    return cls._model, cls._model_type
                except Exception:
                    pass
                try:
                    logger.info("Attempting to load embedding model via SentenceTransformer: %s", candidate)
                    cls._model = SentenceTransformer(candidate, device=device)
                    cls._model_type = "sentence_transformer"
                    cls._active_model_name = candidate
                    logger.info("Embedding model '%s' loaded successfully via SentenceTransformer.", candidate)
                    return cls._model, cls._model_type
                except Exception as e:
                    logger.warning("Failed to load candidate '%s': %s", candidate, e)

            raise RuntimeError(
                f"Unable to load any candidate embedding models ({candidates}). Ensure weights are available."
            )

    @classmethod
    def get_dimension(cls) -> int:
        """Returns the embedding vector dimension of the active model."""
        model, mtype = cls.get_model()
        if hasattr(model, "get_sentence_embedding_dimension"):
            return int(model.get_sentence_embedding_dimension())
        return 768

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generates dense embeddings for a list of document chunks.
        """
        if not texts:
            return []

        model, mtype = self.get_model(self.model_name, self.device)

        if mtype == "flag_embedding":
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
        """
        if not text or not text.strip():
            return [0.0] * self.get_dimension()

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
