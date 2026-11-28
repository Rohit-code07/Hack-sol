"""
Pydantic schemas for Document Intelligence and Voice RAG features.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ExtractedField(BaseModel):
    field_key: str = Field(..., description="Unique field identifier (e.g., farmerName, loanAmount)")
    field_label: str = Field(..., description="Human-readable label in interface language")
    extracted_value: Optional[str] = Field(None, description="Extracted text value or UNREADABLE")
    confidence: str = Field("HIGH", description="Confidence level: HIGH, MEDIUM, LOW, UNREADABLE")
    is_verified: bool = Field(False, description="Whether field has been verified against backend records")


class DocumentIssue(BaseModel):
    severity: str = Field(..., description="CRITICAL, WARNING, INFORMATIONAL, NO_ISSUE")
    issue_title: str = Field(..., description="Concise title of the detected issue")
    issue_description: str = Field(..., description="Detailed explanation of the issue")
    supporting_evidence: Optional[str] = Field(None, description="Exact text or numbers from document serving as evidence")
    recommended_action: Optional[str] = Field(None, description="Clear, practical action required by the farmer")


class QualityAssessment(BaseModel):
    readability: str = Field("GOOD", description="EXCELLENT, GOOD, POOR_BLURRY, PARTIALLY_OBSCURED")
    lighting: str = Field("NORMAL", description="NORMAL, LOW_LIGHT, OVEREXPOSED")
    damage_detected: bool = Field(False, description="Whether document appears torn, folded, or stained")
    score: int = Field(85, description="Overall document quality score between 0 and 100")
    notes: Optional[str] = Field(None, description="Quality notes or suggestions for better capture")


class DocumentAnalysisResponse(BaseModel):
    document_category: str = Field(..., description="Classified category (e.g. KCC_LOAN_DOCUMENT, LAND_RECORD_KHASRA)")
    category_label: str = Field(..., description="Human-readable category name in Hindi/English")
    document_purpose: str = Field(..., description="Primary administrative or legal purpose of the document")
    quality: QualityAssessment = Field(default_factory=QualityAssessment)
    extracted_text: Optional[str] = Field(None, description="Raw OCR or extracted text")
    extracted_fields: List[ExtractedField] = Field(default_factory=list)
    analysis_summary: str = Field(..., description="Comprehensive explanation of what the document represents")
    issues: List[DocumentIssue] = Field(default_factory=list)
    recommended_next_steps: List[str] = Field(default_factory=list)
    overall_verdict: str = Field("REQUIRES_REVIEW", description="VALID_CLEAR, MINOR_ISSUES, POTENTIAL_DISCREPANCY, REQUIRES_REVIEW")
    confidence_score: float = Field(0.9, description="Overall analysis confidence score (0.0 to 1.0)")
    language: str = Field("Hindi", description="Language of analysis summary and next steps")
    generated_by: str = Field("GEMINI", description="GEMINI or DETERMINISTIC_PARSER")
    success: bool = True


class DocumentAskRequest(BaseModel):
    document_id: Optional[str] = None
    question: str
    language: Optional[str] = "Hindi"
    document_context: Optional[Dict[str, Any]] = None
    extracted_text: Optional[str] = None


class DocumentAskResponse(BaseModel):
    answer: str
    language: str = "Hindi"
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: str = "HIGH"
    success: bool = True


class VoiceTranscriptionResponse(BaseModel):
    transcription: str
    detected_language: str = "Hindi"
    confidence: float = 0.95
    normalized_query: Optional[str] = None
    success: bool = True
