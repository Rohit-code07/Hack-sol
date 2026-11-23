import os
from pathlib import Path
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory for the kisansetu-ai-service package
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # Service Metadata
    PROJECT_NAME: str = "KisanSetu AI Service"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/ai/v1"

    # Security & Shared Authentication with Spring Boot
    AI_SERVICE_API_KEY: Optional[str] = "kisansetu-secret-key"
    API_KEY_HEADER_NAME: str = "X-AI-Service-Key"

    # LLM Settings (Google Gemini)
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    LLM_TEMPERATURE: float = 0.1
    LLM_TIMEOUT_SECONDS: int = 30

    # Vector Database & ChromaDB Settings
    CHROMA_PERSIST_DIRECTORY: str = str(BASE_DIR / "chroma_db")
    CHROMA_COLLECTION_NAME: str = "kisansetu_policy_bge_m3"

    # Embedding Model (BAAI/bge-m3 or local sentence-transformers)
    BGE_M3_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-mpnet-base-v2")
    EMBEDDING_DEVICE: str = "cpu"
    NORMALIZE_EMBEDDINGS: bool = True

    # Retrieval Defaults
    RETRIEVER_K: int = 5
    RETRIEVER_FETCH_K: int = 20
    RETRIEVER_LAMBDA_MULT: float = 0.5
    MAX_DISTANCE_THRESHOLD: float = 1.2

    # Ingestion & Document Processing Defaults
    DEFAULT_CHUNK_SIZE: int = 800
    DEFAULT_CHUNK_OVERLAP: int = 120
    MAX_UPLOAD_SIZE_MB: int = 30
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt"]

    # Documents directory
    DOCUMENTS_DIRECTORY: str = str(BASE_DIR / "documents")
    DOCUMENT_STORAGE_DIRECTORY: str = str(BASE_DIR / "documents")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
