"""
Grievance Generation API Routes for KisanSetu.
Endpoint: POST /ai/v1/grievance/generate
Consumes structured discrepancy payloads from Spring Boot and drafts formal administrative petitions.
"""

import logging
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.config import settings
from app.schemas.grievance_schema import GrievanceGenerateRequest, GrievanceGenerateResponse
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/grievance", tags=["Farmer Grievance Generation"])


async def verify_service_api_key(
    x_ai_service_key: Optional[str] = Header(None, alias=settings.API_KEY_HEADER_NAME)
):
    if settings.AI_SERVICE_API_KEY:
        if not x_ai_service_key or x_ai_service_key.strip() != settings.AI_SERVICE_API_KEY.strip():
            logger.warning("Unauthorized access to grievance endpoint: invalid %s header", settings.API_KEY_HEADER_NAME)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Unauthorized: Valid '{settings.API_KEY_HEADER_NAME}' header required."
            )
    return True


@router.post("/generate", response_model=GrievanceGenerateResponse, summary="Generate formal grievance draft")
async def generate_grievance(
    request: GrievanceGenerateRequest,
    authenticated: bool = Depends(verify_service_api_key)
):
    """
    Generates a formal, respectful grievance petition based strictly on verified backend data.
    Preserves all financial figures calculated by Spring Boot as immutable values.
    Includes an actionable evidence checklist.
    """
    return await ai_service.generate_grievance(request)
