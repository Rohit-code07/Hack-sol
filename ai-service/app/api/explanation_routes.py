"""
Discrepancy Explanation API Routes for KisanSetu.
Endpoint: POST /ai/v1/explanation/generate
Generates farmer-friendly multi-lingual explanations of entitlement calculation discrepancies.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.config import settings
from app.schemas.grievance_schema import (
    DiscrepancyExplanationRequest,
    DiscrepancyExplanationResponse
)
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/explanation", tags=["Discrepancy Explanation"])


async def verify_service_api_key(
    x_ai_service_key: Optional[str] = Header(None, alias=settings.API_KEY_HEADER_NAME)
):
    if settings.AI_SERVICE_API_KEY:
        if not x_ai_service_key or x_ai_service_key.strip() != settings.AI_SERVICE_API_KEY.strip():
            logger.warning("Unauthorized access to explanation endpoint: invalid %s header", settings.API_KEY_HEADER_NAME)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unauthorized: Valid '{settings.API_KEY_HEADER_NAME}' header required."
            )
    return True


@router.post("/generate", response_model=DiscrepancyExplanationResponse, summary="Generate farmer-friendly discrepancy explanation")
async def explain_discrepancy(
    request: DiscrepancyExplanationRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Explains calculation differences in accessible, non-technical language.
    Strictly forbids recalculation or alteration of figures received from Java.
    Suggests verified documents to cross-check and practical next steps.
    """
    return await ai_service.explain_discrepancy(request)
