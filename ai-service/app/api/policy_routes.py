"""
Policy RAG and Document Management API Routes for KisanSetu.
Endpoints:
- POST /ai/v1/policy/ask
- POST /ai/v1/policy/documents
- POST /ai/v1/policy/documents/preview
- GET /ai/v1/policy/documents
- DELETE /ai/v1/policy/documents/{document_id}
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, status

from app.core.config import settings
from app.schemas.policy_schema import (
    PolicyAskRequest,
    PolicyAskResponse,
    DocumentUploadResponse,
    DocumentPreviewResponse,
    DocumentPreviewChunk,
    DocumentInfo
)
from app.services.ai_service import ai_service
from app.rag.document_loader import PolicyDocumentLoader

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/policy", tags=["Government Policy RAG"])


async def verify_service_api_key(
    x_ai_service_key: Optional[str] = Header(None, alias=settings.API_KEY_HEADER_NAME)
):
    """
    Validates the shared internal service key between Spring Boot and FastAPI.
    """
    if settings.AI_SERVICE_API_KEY:
        if not x_ai_service_key or x_ai_service_key.strip() != settings.AI_SERVICE_API_KEY.strip():
            logger.warning("Unauthorized access attempt: invalid or missing %s header", settings.API_KEY_HEADER_NAME)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unauthorized: Valid '{settings.API_KEY_HEADER_NAME}' header required."
            )
    return True


@router.post("/ask", response_model=PolicyAskResponse, summary="Query official government scheme policy")
async def ask_policy(
    request: PolicyAskRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Answers farmer questions strictly using official retrieved agricultural policy context.
    Returns 1-indexed citations and confidence determinations.
    """
    return await ai_service.ask_policy(request)


@router.post("/documents", response_model=DocumentUploadResponse, summary="Upload & index an official policy PDF")
async def upload_policy_document(
    file: UploadFile = File(...),
    scheme: str = Form(..., description="Scheme category: KCC, MSP, or PMFBY"),
    chunk_size: int = Form(settings.DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Form(settings.DEFAULT_CHUNK_OVERLAP),
    authority: Optional[str] = Form("Government of India"),
    url: Optional[str] = Form(None),
    effective_date: Optional[str] = Form(None),
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Ingests, chunks, embeds, and indexes an official scheme PDF into ChromaDB with BGE-M3.
    """
    if chunk_overlap >= chunk_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="chunk_overlap must be strictly less than chunk_size"
        )
    return await ai_service.ingest_policy_pdf(
        file=file,
        scheme=scheme,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        authority=authority,
        url=url,
        effective_date=effective_date
    )


@router.post("/documents/preview", response_model=DocumentPreviewResponse, summary="Preview chunking for PDF without saving")
async def preview_policy_document(
    file: UploadFile = File(...),
    scheme: str = Form("KCC"),
    chunk_size: int = Form(settings.DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Form(settings.DEFAULT_CHUNK_OVERLAP),
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Previews first 5 chunks of a PDF to verify chunking quality and 1-indexed page extraction.
    """
    if chunk_overlap >= chunk_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="chunk_overlap must be strictly less than chunk_size"
        )

    result = await PolicyDocumentLoader.process_upload(
        file=file,
        scheme=scheme,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    preview_chunks = [
        DocumentPreviewChunk(
            chunk_index=c.metadata["chunk_index"],
            page=c.metadata["page"],
            text=c.page_content
        )
        for c in result["chunks"][:5]
    ]

    return DocumentPreviewResponse(
        filename=result["filename"],
        scheme=result["scheme"],
        total_chunks=result["total_chunks"],
        preview=preview_chunks
    )


@router.get("/documents", response_model=List[DocumentInfo], summary="List all indexed official documents")
async def list_documents(
    authenticated: bool = Depends(verify_service_api_key)
):
    """Returns aggregated metadata for all documents currently indexed in ChromaDB."""
    return ai_service.list_policy_documents()


@router.delete("/documents/{document_id}", summary="Delete document from ChromaDB vector store")
async def delete_document(
    document_id: str,
    authenticated: bool = Depends(verify_service_api_key)
):
    """Deletes all chunks associated with a document_id."""
    success = ai_service.delete_policy_document(document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found or could not be deleted."
        )
    return {"status": "success", "message": f"Document '{document_id}' successfully removed from vector index."}
