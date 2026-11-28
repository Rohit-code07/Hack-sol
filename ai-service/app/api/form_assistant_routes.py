"""
FastAPI Routes for KisanSetu Universal Smart Form Assistant.
Exposes endpoints for Voice-to-Form and Document-to-Form autofilling.
"""

import json
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from app.schemas.form_assistant_schema import (
    VoiceFormExtractRequest,
    FormSchemaDefinition,
    FormExtractResponse,
)
from app.services.form_assistant_service import FormAssistantService

logger = logging.getLogger(__name__)

form_assistant_router = APIRouter(prefix="/form-assistant", tags=["Universal Form Assistant"])


@form_assistant_router.post("/voice-extract", response_model=FormExtractResponse)
async def extract_from_voice(request: VoiceFormExtractRequest):
    """
    Extracts structured form fields from natural spoken text (Hindi, English, Hinglish).
    Identifies target fields according to the provided active form schema.
    """
    try:
        response = await FormAssistantService.extract_from_voice(
            spoken_text=request.audioText or "",
            form_schema=request.formSchema,
            language=request.language,
            current_values=request.currentValues,
        )
        return response
    except Exception as e:
        logger.error("Error in voice form extraction: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice form extraction failed: {str(e)}",
        )


@form_assistant_router.post("/document-extract", response_model=FormExtractResponse)
async def extract_from_document(
    file: UploadFile = File(...),
    formSchema: str = Form(..., description="JSON string of FormSchemaDefinition"),
    language: str = Form("hi"),
    currentValues: Optional[str] = Form(None, description="JSON string of current form values"),
):
    """
    Extracts structured form fields from uploaded document (PDF, JPG, PNG, WEBP)
    matching the active form schema.
    """
    # Validate file size (10MB limit)
    MAX_SIZE = 10 * 1024 * 1024
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum permitted limit of 10MB.",
        )

    # Parse formSchema JSON
    try:
        schema_dict = json.loads(formSchema)
        schema_obj = FormSchemaDefinition(**schema_dict)
    except Exception as e:
        logger.error("Invalid formSchema JSON payload: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid formSchema JSON: {str(e)}",
        )

    # Parse currentValues JSON if provided
    curr_vals_dict = {}
    if currentValues:
        try:
            curr_vals_dict = json.loads(currentValues)
        except Exception:
            curr_vals_dict = {}

    try:
        response = await FormAssistantService.extract_from_document(
            file_bytes=content,
            filename=file.filename or "uploaded_document",
            content_type=file.content_type or "application/octet-stream",
            form_schema=schema_obj,
            language=language,
            current_values=curr_vals_dict,
        )
        return response
    except Exception as e:
        logger.error("Error in document form extraction: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document form extraction failed: {str(e)}",
        )
