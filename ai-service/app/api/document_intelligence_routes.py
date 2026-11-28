"""
Document Intelligence & Voice Interaction Endpoints for KisanSetu.
Endpoints:
- POST /api/ai/document/analyze
- POST /api/ai/document/ask
- POST /api/ai/voice/transcribe
"""

import json
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, Form, status

from app.core.config import settings
from app.services.document_intelligence_service import document_intelligence_service
from app.services.voice_service import voice_service
from app.schemas.document_schema import (
    DocumentAnalysisResponse,
    DocumentAskRequest,
    DocumentAskResponse,
    VoiceTranscriptionResponse
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["Document Intelligence & Voice"])


async def verify_service_api_key(
    x_ai_service_key: Optional[str] = Header(None, alias=settings.API_KEY_HEADER_NAME),
    x_internal_api_key: Optional[str] = Header(None, alias="X-Internal-API-Key")
):
    key = x_ai_service_key or x_internal_api_key
    if settings.AI_SERVICE_API_KEY:
        if not key or key.strip() != settings.AI_SERVICE_API_KEY.strip():
            logger.warning("Unauthorized access to Document Intelligence: invalid service key")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unauthorized: Valid '{settings.API_KEY_HEADER_NAME}' or 'X-Internal-API-Key' header required."
            )
    return True


@router.post("/document/analyze", response_model=DocumentAnalysisResponse, summary="Analyze Uploaded Agricultural/Financial Document")
async def analyze_document_endpoint(
    file: UploadFile = File(...),
    preferred_language: str = Form("hi"),
    farmer_context: Optional[str] = Form(None),
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Ingests document image (JPG/PNG/WEBP) or PDF, extracts OCR, classifies document,
    extracts structured fields, audits discrepancies against farmer profile, and returns next steps.
    """
    try:
        file_bytes = await file.read()
        filename = file.filename or "uploaded_document"
        content_type = file.content_type or "image/jpeg"

        parsed_context = None
        if farmer_context:
            try:
                parsed_context = json.loads(farmer_context)
            except Exception:
                parsed_context = {"farmerName": farmer_context}

        return await document_intelligence_service.analyze_document(
            file_bytes=file_bytes,
            filename=filename,
            content_type=content_type,
            farmer_context=parsed_context,
            preferred_language=preferred_language
        )
    except Exception as e:
        logger.error("Error analyzing document: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )


@router.post("/document/ask", response_model=DocumentAskResponse, summary="Ask AI About an Uploaded Document")
async def ask_document_endpoint(
    request: DocumentAskRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Answers questions strictly grounded in the uploaded document's extracted fields, text, and identified issues.
    """
    try:
        return await document_intelligence_service.ask_about_document(
            question=request.question,
            document_context=request.document_context or {},
            extracted_text=request.extracted_text,
            language=request.language or "Hindi"
        )
    except Exception as e:
        logger.error("Error in document Q&A: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer question about document: {str(e)}"
        )


@router.post("/voice/transcribe", response_model=VoiceTranscriptionResponse, summary="Speech-to-Text Transcription for Hindi/English/Hinglish")
async def voice_transcribe_endpoint(
    file: UploadFile = File(...),
    language_preference: str = Form("Hindi"),
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Transcribes audio into text preserving Hindi, English, and Hinglish agricultural terms.
    """
    try:
        audio_bytes = await file.read()
        content_type = file.content_type or "audio/webm"

        return await voice_service.transcribe_audio(
            audio_bytes=audio_bytes,
            content_type=content_type,
            language_preference=language_preference
        )
    except Exception as e:
        logger.error("Error transcribing voice audio: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transcribe voice audio: {str(e)}"
        )
