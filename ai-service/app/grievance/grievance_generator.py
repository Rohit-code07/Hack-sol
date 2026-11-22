"""
Grievance Generator Service for KisanSetu.
Coordinates grievance petition generation while enforcing the non-negotiable rule
that financial amounts computed by Spring Boot are immutable.
"""

import logging
from app.schemas.grievance_schema import GrievanceGenerateRequest, GrievanceGenerateResponse
from app.core.llm import llm_service

logger = logging.getLogger(__name__)


class GrievanceGenerator:
    """
    Handles formal administrative grievance drafting for farmers.
    """

    @staticmethod
    async def generate(request: GrievanceGenerateRequest) -> GrievanceGenerateResponse:
        logger.info(
            "Generating grievance for farmer '%s', issueType: '%s', difference: %s",
            request.farmerName,
            request.issueType,
            request.difference
        )
        return await llm_service.generate_grievance(request)


grievance_generator = GrievanceGenerator()
