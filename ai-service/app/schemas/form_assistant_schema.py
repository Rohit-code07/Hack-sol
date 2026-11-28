"""
Pydantic schemas for KisanSetu Universal Smart Form Assistant.
Supports voice, document OCR, natural language field mapping, and conflict detection.
"""

from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class FormFieldOption(BaseModel):
    value: str
    label: str


class FormFieldMetadata(BaseModel):
    fieldId: str
    label: str
    type: str = "text"  # text, number, date, select, tel, textarea
    description: Optional[str] = None
    required: bool = False
    options: Optional[List[FormFieldOption]] = None
    currentValue: Optional[Any] = None


class FormSchemaDefinition(BaseModel):
    formId: str
    title: str
    description: Optional[str] = None
    fields: List[FormFieldMetadata]


class ExtractedFieldValue(BaseModel):
    fieldId: str
    label: str
    value: Any
    confidence: float = 0.90
    source: str = "VOICE"  # VOICE, DOCUMENT, COMBINED
    reasoning: Optional[str] = None
    requiresConfirmation: bool = False


class FieldConflict(BaseModel):
    fieldId: str
    label: str
    currentValue: Any
    newValue: Any
    sourceA: str = "EXISTING_OR_DOCUMENT"
    sourceB: str = "NEW_VOICE_OR_DOCUMENT"
    conflictReason: str


class VoiceFormExtractRequest(BaseModel):
    audioText: Optional[str] = None
    formSchema: FormSchemaDefinition
    language: str = "hi"  # hi, en, hinglish
    currentValues: Optional[Dict[str, Any]] = None


class FormExtractResponse(BaseModel):
    formId: str
    status: str = "COMPLETED"  # COMPLETED, PARTIAL, FAILED
    extractedFields: List[ExtractedFieldValue] = Field(default_factory=list)
    unmappedFields: List[str] = Field(default_factory=list)
    conflicts: List[FieldConflict] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    rawTranscript: Optional[str] = None
