"""
Unified AI Service Orchestrator for KisanSetu.
Provides a clean interface connecting RAG retrieval, Gemini generation,
document ingestion, grievance generation, and discrepancy explanations.
"""

import logging
from typing import List, Dict, Any, Optional

from fastapi import UploadFile, HTTPException

from app.schemas.policy_schema import (
    PolicyAskRequest,
    PolicyAskResponse,
    DocumentUploadResponse,
    DocumentInfo
)
from app.schemas.grievance_schema import (
    GrievanceGenerateRequest,
    GrievanceGenerateResponse,
    DiscrepancyExplanationRequest,
    DiscrepancyExplanationResponse
)
from app.rag.retriever import retriever_service
from app.rag.vector_store import vector_store_service
from app.rag.document_loader import PolicyDocumentLoader
from app.core.llm import llm_service
from app.grievance.grievance_generator import grievance_generator
from app.explanation.policy_explainer import policy_explainer
from app.explanation.language_handler import normalize_language_code

logger = logging.getLogger(__name__)


class KisanSetuAIService:
    """
    Main service layer consumed by API route controllers.
    """

    @staticmethod
    async def ask_policy(request: PolicyAskRequest) -> PolicyAskResponse:
        """
        Executes Policy RAG:
        1. Normalizes query and language.
        2. Retrieves relevant BGE-M3 vectors via MMR with scheme filtering.
        3. Invokes Gemini with strict grounding.
        4. Returns grounded answer with exact 1-indexed page citations.
        """
        lang_code = normalize_language_code(request.language or "hi")
        question = request.question.strip()

        # Retrieve relevant chunks from BGE-M3 vector store
        chunks, best_score = await retriever_service.retrieve_relevant_chunks(
            query=question,
            scheme=request.scheme,
            document_id=request.document_id
        )

        # Generate strictly grounded response
        return await llm_service.generate_policy_answer(
            question=question,
            language=lang_code,
            documents=chunks,
            best_distance=best_score
        )

    @staticmethod
    async def generate_grievance(request: GrievanceGenerateRequest) -> GrievanceGenerateResponse:
        """
        Drafts a formal grievance petition based on verified backend discrepancy data.
        """
        return await grievance_generator.generate(request)

    @staticmethod
    async def explain_discrepancy(request: DiscrepancyExplanationRequest) -> DiscrepancyExplanationResponse:
        """
        Explains calculation differences in accessible, non-technical language.
        """
        return await policy_explainer.explain(request)

    @staticmethod
    async def ingest_policy_pdf(
        file: UploadFile,
        scheme: str,
        chunk_size: int,
        chunk_overlap: int,
        authority: Optional[str] = None,
        url: Optional[str] = None,
        effective_date: Optional[str] = None
    ) -> DocumentUploadResponse:
        """
        Uploads and indexes an official government policy PDF.
        """
        result = await PolicyDocumentLoader.process_upload(
            file=file,
            scheme=scheme,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            authority=authority,
            url=url,
            effective_date=effective_date
        )

        # Store chunks in BGE-M3 Chroma vector store
        vector_store_service.add_documents(result["chunks"])

        return DocumentUploadResponse(
            document_id=result["document_id"],
            filename=result["filename"],
            scheme=result["scheme"],
            chunks_added=result["total_chunks"],
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

    @staticmethod
    def list_policy_documents() -> List[DocumentInfo]:
        """
        Lists all official documents currently indexed in ChromaDB.
        """
        doc_infos = vector_store_service.get_all_documents_info()
        return [
            DocumentInfo(
                document_id=d["document_id"],
                filename=d["filename"],
                scheme=d.get("scheme"),
                total_chunks=d["total_chunks"],
                chunk_size=d.get("chunk_size"),
                chunk_overlap=d.get("chunk_overlap")
            )
            for d in doc_infos
        ]

    @staticmethod
    def delete_policy_document(document_id: str) -> bool:
        """
        Deletes a policy document and its embeddings from the vector store.
        """
        return vector_store_service.delete_document(document_id)


ai_service = KisanSetuAIService()
