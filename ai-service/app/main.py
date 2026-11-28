"""
KisanSetu AI Service — Main Application Entrypoint.
FastAPI service exposing:
- GET  /health (and /api/health)
- POST /ai/v1/policy/ask
- POST /ai/v1/policy/documents
- POST /ai/v1/policy/documents/preview
- GET  /ai/v1/policy/documents
- DELETE /ai/v1/policy/documents/{document_id}
- POST /ai/v1/grievance/generate
- POST /ai/v1/explanation/generate
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.llm import LLMProviderError, llm_service
from app.rag.vector_store import vector_store_service
from app.api.policy_routes import router as policy_router
from app.api.grievance_routes import router as grievance_router
from app.api.explanation_routes import router as explanation_router
from app.api.api_ai_routes import router as api_ai_router
from app.api.document_intelligence_routes import router as document_intelligence_router
from app.api.form_assistant_routes import form_assistant_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("kisansetu.ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Non-blocking application lifecycle manager.
    Validates components on startup without crashing the app if external API keys are pending.
    """
    logger.info("==================================================================")
    logger.info("Starting %s v%s", settings.PROJECT_NAME, settings.VERSION)
    logger.info("ChromaDB Persist Directory : %s", settings.CHROMA_PERSIST_DIRECTORY)
    logger.info("ChromaDB Collection Name   : %s", settings.CHROMA_COLLECTION_NAME)
    logger.info("Multilingual Embeddings    : %s", settings.BGE_M3_MODEL)

    gemini_ready = llm_service.is_configured()
    if gemini_ready:
        logger.info("Gemini LLM Provider        : CONFIGURED (Model: %s)", settings.GEMINI_MODEL)
    else:
        logger.warning(
            "Gemini LLM Provider        : NOT CONFIGURED (GEMINI_API_KEY is empty). "
            "Grievance and Explanation modules will use safe deterministic fallbacks."
        )

    # Pre-check Chroma collection without blocking
    try:
        stats = vector_store_service.get_stats()
        logger.info("ChromaDB Collection Status : %s (Chunks indexed: %d)", stats["status"], stats["total_chunks"])
    except Exception as e:
        logger.warning("ChromaDB initialization note: %s", e)

    logger.info("==================================================================")
    yield
    logger.info("Shutting down %s", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "KisanSetu Python AI Service providing Government Policy RAG (BGE-M3 + ChromaDB), "
        "formal administrative grievance drafting, and farmer-friendly discrepancy explanations."
    ),
    lifespan=lifespan
)

# CORS Middleware for internal services
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler for LLM provider errors
@app.exception_handler(LLMProviderError)
async def llm_provider_exception_handler(request: Request, exc: LLMProviderError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "error_type": type(exc).__name__}
    )


# Register API Routers under /ai/v1 prefix and /api/ai
app.include_router(policy_router, prefix=settings.API_V1_PREFIX)
app.include_router(grievance_router, prefix=settings.API_V1_PREFIX)
app.include_router(explanation_router, prefix=settings.API_V1_PREFIX)
app.include_router(api_ai_router)
app.include_router(document_intelligence_router)
app.include_router(document_intelligence_router, prefix=settings.API_V1_PREFIX)
app.include_router(form_assistant_router, prefix="/api/ai")
app.include_router(form_assistant_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "openapi_url": "/openapi.json"
    }


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"], include_in_schema=False)
async def health_check():
    """
    Comprehensive health check endpoint.
    Remains UP even if GEMINI_API_KEY is temporarily absent.
    Distinguishes service availability from external dependency readiness.
    """
    gemini_configured = llm_service.is_configured()
    chroma_stats = vector_store_service.get_stats()

    is_healthy = True
    status_str = "UP" if is_healthy else "DEGRADED"

    return {
        "status": status_str,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "dependencies": {
            "gemini_llm": {
                "status": "READY" if gemini_configured else "UNCONFIGURED",
                "model": settings.GEMINI_MODEL,
                "note": "Deterministic fallbacks active" if not gemini_configured else "Active"
            },
            "chroma_vectorstore": {
                "status": chroma_stats.get("status", "READY"),
                "collection": settings.CHROMA_COLLECTION_NAME,
                "total_chunks": chroma_stats.get("total_chunks", 0)
            },
            "embedding_model": {
                "model": settings.BGE_M3_MODEL,
                "dimension": vector_store_service.embeddings.get_dimension() if hasattr(vector_store_service.embeddings, "get_dimension") else 768,
                "multilingual": True
            }
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
