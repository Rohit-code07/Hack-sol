from typing import List, Optional, Any
from pydantic import BaseModel, Field


class GrievanceGenerateRequest(BaseModel):
    farmerName: str = Field(..., description="Farmer full name")
    issueType: str = Field(
        ..., 
        description="Type of grievance, e.g. MSP_PAYMENT_DISCREPANCY, KCC_INTEREST_OVERCHARGE, PMFBY_CLAIM_DELAY"
    )
    crop: Optional[str] = Field(None, description="Crop name, e.g. Paddy, Wheat")
    expectedAmount: Optional[float] = Field(None, description="Expected amount calculated by Spring Boot")
    actualAmount: Optional[float] = Field(None, description="Actual amount received")
    difference: Optional[float] = Field(None, description="Difference amount calculated by Spring Boot")
    language: Optional[str] = Field("Hindi", description="Preferred language: Hindi or English")
    ruleReference: Optional[str] = Field(None, description="Official scheme or rule reference from Spring Boot")
    farmerId: Optional[str] = Field(None, description="Farmer identification reference (safe ID, no Aadhaar)")
    kccAccountNumber: Optional[str] = Field(None, description="Masked account or application reference")
    details: Optional[str] = Field(None, description="Additional contextual notes from Spring Boot")


class GrievanceGenerateResponse(BaseModel):
    subject: str = Field(..., description="Formal subject line for the grievance letter")
    body: str = Field(..., description="Formal grievance letter draft addressed to relevant authorities")
    evidenceChecklist: List[str] = Field(
        default_factory=list, 
        description="Recommended supporting documents for the farmer to attach"
    )
    language: str = Field("Hindi", description="Language of generated grievance")
    generatedBy: str = Field("GEMINI", description="'GEMINI' or 'DETERMINISTIC_FALLBACK'")


class DiscrepancyExplanationRequest(BaseModel):
    category: str = Field(..., description="Category: MSP, KCC, PMFBY, etc.")
    expectedAmount: Optional[float] = Field(None, description="Expected amount calculated by Spring Boot")
    actualAmount: Optional[float] = Field(None, description="Actual amount received")
    difference: Optional[float] = Field(None, description="Discrepancy difference")
    status: str = Field(
        ..., 
        description="Status from Spring Boot, e.g. POTENTIAL_DISCREPANCY, RESOLVED, PENDING_VERIFICATION"
    )
    reason: Optional[str] = Field(None, description="Deterministic reason message computed by Java backend")
    language: Optional[str] = Field("Hindi", description="Preferred language: Hindi or English")
    additionalContext: Optional[dict[str, Any]] = Field(None, description="Any supporting context from Spring Boot")


class DiscrepancyExplanationResponse(BaseModel):
    explanation: str = Field(..., description="Farmer-friendly explanation in requested language")
    recommendedAction: str = Field(..., description="Actionable next step for the farmer")
    documentsToVerify: List[str] = Field(
        default_factory=list, 
        description="Specific documents the farmer should check"
    )
    language: str = Field("Hindi", description="Language of the explanation")
    category: str = Field(..., description="Category of the discrepancy")
    generatedBy: str = Field("GEMINI", description="'GEMINI' or 'DETERMINISTIC_FALLBACK'")
