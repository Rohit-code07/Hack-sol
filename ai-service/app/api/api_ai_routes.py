"""
Unified API routes under /api/ai/ to fulfill Section 10 API Specifications:
- GET  /api/ai/health
- POST /api/ai/chat
- POST /api/ai/search
- POST /api/ai/grievance/generate
- POST /api/ai/discrepancy/explain
- POST /api/ai/documents/upload
- GET  /api/ai/documents
- GET  /api/ai/documents/{documentId}/status
- DELETE /api/ai/documents/{documentId}
- POST /api/ai/documents/reindex
"""

import os
import uuid
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.llm import llm_service
from app.rag.vector_store import vector_store_service
from app.rag.retriever import retriever_service
from app.rag.document_loader import PolicyDocumentLoader
from app.schemas.policy_schema import PolicyAskRequest, SourceCitation
from app.schemas.grievance_schema import GrievanceGenerateRequest, DiscrepancyExplanationRequest
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["KisanSetu Standard AI Endpoints"])


async def verify_service_api_key(
    x_ai_service_key: Optional[str] = Header(None, alias=settings.API_KEY_HEADER_NAME),
    x_internal_api_key: Optional[str] = Header(None, alias="X-Internal-API-Key")
):
    key = x_ai_service_key or x_internal_api_key
    if settings.AI_SERVICE_API_KEY:
        if not key or key.strip() != settings.AI_SERVICE_API_KEY.strip():
            logger.warning("Unauthorized access to /api/ai: invalid service key")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unauthorized: Valid '{settings.API_KEY_HEADER_NAME}' or 'X-Internal-API-Key' header required."
            )
    return True


# Schemas for /api/ai endpoints
class AIChatRequest(BaseModel):
    question: Optional[str] = Field(None, description="Farmer question")
    query: Optional[str] = Field(None, description="Alternative field for farmer question")
    language: Optional[str] = Field("Hindi", description="Preferred language (Hindi, English, Hinglish)")
    scheme: Optional[str] = Field(None, description="Optional scheme filter (KCC, MSP, PMFBY)")
    conversationId: Optional[str] = Field(None, description="Optional conversation tracking ID")
    document_id: Optional[str] = Field(None, description="Optional document filter")

    def get_effective_question(self) -> str:
        q = self.question or self.query
        if not q or not q.strip():
            raise HTTPException(status_code=400, detail="Either 'question' or 'query' must be provided.")
        return q.strip()


class AISearchRequest(BaseModel):
    query: Optional[str] = Field(None, description="Search query")
    question: Optional[str] = Field(None, description="Alternative field for search query")
    scheme: Optional[str] = Field(None, description="Scheme filter")
    topK: Optional[int] = Field(5, description="Number of results to retrieve")


class AIFlexGrievanceRequest(BaseModel):
    farmerName: Optional[str] = Field("Kisan", description="Farmer full name")
    issueType: Optional[str] = Field(None, description="Issue code or category")
    category: Optional[str] = Field(None, description="Alternative field for issue category")
    crop: Optional[str] = Field(None, description="Crop name")
    expectedAmount: Optional[float] = Field(None, description="Expected statutory amount")
    actualAmount: Optional[float] = Field(None, description="Actual received amount")
    difference: Optional[float] = Field(None, description="Difference amount")
    differenceAmount: Optional[float] = Field(None, description="Alternative field for difference")
    language: Optional[str] = Field("Hindi", description="Language preference")
    ruleReference: Optional[str] = Field(None, description="Scheme reference")
    details: Optional[str] = Field(None, description="Complaint details")
    description: Optional[str] = Field(None, description="Alternative field for complaint details")
    village: Optional[str] = Field(None, description="Village name")
    district: Optional[str] = Field(None, description="District name")
    referenceId: Optional[str] = Field(None, description="Reference ID")


class AIFlexExplanationRequest(BaseModel):
    category: Optional[str] = Field(None, description="Category code (KCC, MSP, PMFBY)")
    schemeCode: Optional[str] = Field(None, description="Alternative field for category code")
    discrepancyType: Optional[str] = Field(None, description="Alternative field for category code")
    scheme: Optional[str] = Field(None, description="Alternative field for scheme name")
    expectedAmount: Optional[float] = Field(None, description="Expected amount")
    actualAmount: Optional[float] = Field(None, description="Actual amount")
    difference: Optional[float] = Field(None, description="Difference amount")
    differenceAmount: Optional[float] = Field(None, description="Alternative field for difference")
    status: Optional[str] = Field("POTENTIAL_DISCREPANCY", description="Discrepancy status")
    reason: Optional[str] = Field(None, description="Reason calculated by Spring Boot")
    description: Optional[str] = Field(None, description="Alternative description")
    language: Optional[str] = Field("Hindi", description="Language preference")
    targetLanguage: Optional[str] = Field(None, description="Alternative language field")
    additionalContext: Optional[Dict[str, Any]] = Field(None, description="Additional context from Spring Boot")
    calculationBreakdown: Optional[Dict[str, Any]] = Field(None, description="Breakdown dictionary")


# ==============================================================================
# Endpoints Implementation
# ==============================================================================

@router.get("/health", summary="Check AI Service Health")
async def ai_health():
    """
    Returns service status, LLM availability, vector database, and embedding status.
    """
    gemini_configured = llm_service.is_configured()
    chroma_stats = vector_store_service.get_stats()
    dim = vector_store_service.embeddings.get_dimension() if hasattr(vector_store_service.embeddings, "get_dimension") else 768

    return {
        "status": "UP",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "dependencies": {
            "gemini_llm": {
                "status": "READY" if gemini_configured else "UNCONFIGURED",
                "model": settings.GEMINI_MODEL,
                "note": "Active" if gemini_configured else "Deterministic fallbacks active"
            },
            "chroma_vectorstore": {
                "status": chroma_stats.get("status", "READY"),
                "collection": settings.CHROMA_COLLECTION_NAME,
                "total_chunks": chroma_stats.get("total_chunks", 0)
            },
            "embedding_model": {
                "model": settings.BGE_M3_MODEL,
                "dimension": dim,
                "multilingual": True
            }
        }
    }


@router.post("/chat", summary="Query Agricultural Policy RAG Assistant")
async def ai_chat(
    request: AIChatRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    RAG chat answering farmer questions with 1-indexed citations and zero hallucination.
    """
    question = request.get_effective_question()
    policy_req = PolicyAskRequest(
        question=question,
        language=request.language or "Hindi",
        scheme=request.scheme,
        document_id=request.document_id
    )
    res = await ai_service.ask_policy(policy_req)
    return {
        "answer": res.answer,
        "responseText": res.answer,
        "sources": [s.model_dump() for s in res.sources],
        "language": res.language,
        "confidence": res.confidence,
        "requiresVerification": False,
        "success": True
    }


@router.post("/search", summary="Semantic Search Across Policy Documents")
async def ai_search(
    request: AISearchRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Retrieves relevant policy clauses without generating an LLM response.
    """
    query = request.query or request.question
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Search query is required.")

    chunks, best_score = await retriever_service.retrieve_relevant_chunks(
        query=query.strip(),
        scheme=request.scheme,
        k=request.topK or 5
    )

    results = []
    for doc in chunks:
        results.append({
            "document": doc.metadata.get("source", "Document"),
            "page": int(doc.metadata.get("page", 1)),
            "scheme": doc.metadata.get("scheme", "GENERAL"),
            "authority": doc.metadata.get("authority", "Government of India"),
            "text": doc.page_content.strip()
        })

    return {
        "query": query,
        "results": results,
        "total_results": len(results),
        "best_score": best_score
    }


@router.post("/grievance/generate", summary="Generate Structured Grievance Draft")
async def ai_grievance_generate(
    request: AIFlexGrievanceRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Generates structured grievance petition without altering backend financial figures.
    """
    cat = request.issueType or request.category or "AGRICULTURAL_ENTITLEMENT_DISCREPANCY"
    diff = request.difference if request.difference is not None else request.differenceAmount
    notes = request.details or request.description

    norm_req = GrievanceGenerateRequest(
        farmerName=request.farmerName or "Kisan",
        issueType=cat,
        crop=request.crop,
        expectedAmount=request.expectedAmount,
        actualAmount=request.actualAmount,
        difference=diff,
        language=request.language or "Hindi",
        ruleReference=request.ruleReference,
        details=notes
    )

    resp = await ai_service.generate_grievance(norm_req)
    return {
        "subject": resp.subject,
        "body": resp.body,
        "responseText": resp.body,
        "evidenceChecklist": resp.evidenceChecklist,
        "language": resp.language,
        "generatedBy": resp.generatedBy,
        "success": True
    }


@router.post("/discrepancy/explain", summary="Explain Discrepancy")
async def ai_discrepancy_explain(
    request: AIFlexExplanationRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Explains calculation differences in accessible language without recalculating figures.
    """
    cat = request.category or request.schemeCode or request.discrepancyType or request.scheme or "GENERAL_DISCREPANCY"
    diff = request.difference if request.difference is not None else request.differenceAmount
    reason = request.reason or request.description or "Calculation record discrepancy detected"
    lang = request.language or request.targetLanguage or "Hindi"
    context = request.additionalContext or request.calculationBreakdown

    norm_req = DiscrepancyExplanationRequest(
        category=cat,
        expectedAmount=request.expectedAmount,
        actualAmount=request.actualAmount,
        difference=diff,
        status=request.status or "POTENTIAL_DISCREPANCY",
        reason=reason,
        language=lang,
        additionalContext=context
    )

    resp = await ai_service.explain_discrepancy(norm_req)
    return {
        "explanation": resp.explanation,
        "responseText": resp.explanation,
        "recommendedAction": resp.recommendedAction,
        "documentsToVerify": resp.documentsToVerify,
        "language": resp.language,
        "category": resp.category,
        "generatedBy": resp.generatedBy,
        "success": True
    }


@router.post("/documents/upload", summary="Upload Policy Document")
async def ai_document_upload(
    file: UploadFile = File(...),
    scheme: str = Form("KCC"),
    authority: Optional[str] = Form("Government of India"),
    chunk_size: int = Form(settings.DEFAULT_CHUNK_SIZE),
    chunk_overlap: int = Form(settings.DEFAULT_CHUNK_OVERLAP),
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Uploads and indexes policy document (PDF or TXT) into ChromaDB.
    """
    return await ai_service.ingest_policy_pdf(
        file=file,
        scheme=scheme,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        authority=authority
    )


@router.get("/documents", summary="List All Indexed Documents")
async def ai_documents_list(
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Lists metadata and chunk statistics for all indexed policy documents.
    """
    return vector_store_service.get_all_documents_info()


@router.get("/documents/{document_id}/status", summary="Get Document Indexing Status")
async def ai_document_status(
    document_id: str,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Returns indexing status and chunk count for a specific document.
    """
    docs = vector_store_service.get_all_documents_info()
    match = next((d for d in docs if d["document_id"] == document_id), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Document with id '{document_id}' not found.")
    return {
        "document_id": document_id,
        "status": "INDEXED",
        "total_chunks": match.get("total_chunks", 0),
        "filename": match.get("filename"),
        "scheme": match.get("scheme")
    }


@router.delete("/documents/{document_id}", summary="Delete Document from Index")
async def ai_document_delete(
    document_id: str,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Deletes all chunks belonging to a document from ChromaDB.
    """
    deleted = vector_store_service.delete_document(document_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Failed to delete document '{document_id}'.")
    return {"status": "SUCCESS", "deleted_document_id": document_id}


@router.post("/documents/reindex", summary="Reindex All Policy Documents")
async def ai_documents_reindex(
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Re-scans documents directory and re-indexes all PDF and TXT files.
    """
    docs_dir = Path(settings.DOCUMENTS_DIRECTORY)
    files = list(docs_dir.rglob("*.pdf")) + list(docs_dir.rglob("*.txt"))

    indexed = []
    for fpath in files:
        filename = fpath.name
        scheme = "PMFBY" if "pmfby" in filename.lower() or "pmfby" in str(fpath).lower() else \
                 "KCC" if "kcc" in filename.lower() or "kcc" in str(fpath).lower() else \
                 "MSP" if "msp" in filename.lower() or "msp" in str(fpath).lower() else "GENERAL"

        try:
            chunks = PolicyDocumentLoader.split_and_annotate(
                file_path=str(fpath),
                filename=filename,
                scheme=scheme
            )
            count = vector_store_service.add_documents(chunks)
            indexed.append({"filename": filename, "scheme": scheme, "chunks": count})
        except Exception as e:
            logger.error("Failed to reindex %s: %s", filename, e)

    return {
        "status": "SUCCESS",
        "reindexed_files": indexed,
        "total_files": len(indexed)
    }
