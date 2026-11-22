from typing import List, Optional
from pydantic import BaseModel, Field


class SourceCitation(BaseModel):
    document: str = Field(..., description="Document filename or title")
    page: int = Field(..., description="1-indexed human-readable page number")
    scheme: Optional[str] = Field(None, description="Scheme category (KCC, MSP, PMFBY)")
    authority: Optional[str] = Field(None, description="Government authority or issuing department")
    url: Optional[str] = Field(None, description="Source official URL if available")
    excerpt: Optional[str] = Field(None, description="Grounded excerpt from official document")


class PolicyAskRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=4000, description="Farmer query in Hindi, English or Hinglish")
    language: Optional[str] = Field("hi", description="Preferred output language: 'hi' or 'en'")
    scheme: Optional[str] = Field(None, description="Optional scheme filter: 'KCC', 'MSP', 'PMFBY'")
    document_id: Optional[str] = Field(None, description="Optional document filter by document_id")


class PolicyAskResponse(BaseModel):
    answer: str = Field(..., description="Grounded, farmer-friendly answer strictly based on retrieved documents")
    sources: List[SourceCitation] = Field(default_factory=list, description="List of official document citations")
    confidence: str = Field(
        ...,
        description="Confidence category: RETRIEVAL_SUPPORTED, PARTIALLY_SUPPORTED, or INSUFFICIENT_EVIDENCE"
    )
    language: str = Field("hi", description="Response language")


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    scheme: str
    chunks_added: int
    chunk_size: int
    chunk_overlap: int


class DocumentPreviewChunk(BaseModel):
    chunk_index: int
    page: int
    text: str


class DocumentPreviewResponse(BaseModel):
    filename: str
    scheme: str
    total_chunks: int
    preview: List[DocumentPreviewChunk]


class DocumentInfo(BaseModel):
    document_id: str
    filename: str
    scheme: Optional[str] = None
    total_chunks: int
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None
