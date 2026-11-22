"""
Discrepancy Explanation Service for KisanSetu.
Translates complex entitlement calculation breakdowns into clear, accessible language.
Strictly forbids recalculation or alteration of figures received from Java.
"""

import logging
from app.schemas.grievance_schema import (
    DiscrepancyExplanationRequest,
    DiscrepancyExplanationResponse
)
from app.core.llm import llm_service

logger = logging.getLogger(__name__)


class PolicyExplainer:
    """
    Generates farmer-friendly explanations of calculation outputs.
    """

    @staticmethod
    async def explain(request: DiscrepancyExplanationRequest) -> DiscrepancyExplanationResponse:
        logger.info(
            "Explaining discrepancy for category: '%s', status: '%s', diff: %s",
            request.category,
            request.status,
            request.difference
        )
        return await llm_service.generate_explanation(request)


policy_explainer = PolicyExplainer()
