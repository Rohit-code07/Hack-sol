"""
LLM Service for KisanSetu.
Integrates Google Gemini with strict anti-hallucination guardrails,
lazy non-blocking initialization, robust error mapping, and deterministic fallback support.
Corrects the page citation double-increment bug.
"""

import json
import logging
from typing import List, Optional, Tuple, Dict, Any

from langchain_core.documents import Document
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.core.prompts import (
    get_policy_rag_prompt,
    get_grievance_prompt,
    get_explanation_prompt
)
from app.schemas.policy_schema import PolicyAskResponse, SourceCitation
from app.schemas.grievance_schema import (
    GrievanceGenerateRequest,
    GrievanceGenerateResponse,
    DiscrepancyExplanationRequest,
    DiscrepancyExplanationResponse
)
from app.grievance.templates import (
    generate_fallback_grievance,
    generate_fallback_explanation
)

logger = logging.getLogger(__name__)


class LLMProviderError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class LLMRateLimitError(LLMProviderError):
    def __init__(self, message: str = "Gemini API rate limit exceeded. Please wait a moment and try again."):
        super().__init__(message, status_code=429)


class LLMNotFoundError(LLMProviderError):
    def __init__(self, message: str = "The configured Gemini model was not found or is no longer available."):
        super().__init__(message, status_code=503)


class LLMAuthenticationError(LLMProviderError):
    def __init__(self, message: str = "Gemini API key is missing or invalid. Please configure GEMINI_API_KEY."):
        super().__init__(message, status_code=401)


class GeminiLLMService:
    """
    Centralized Gemini service with lazy initialization.
    Never blocks or crashes application startup if credentials are not yet supplied.
    """
    _llm: Optional[ChatGoogleGenerativeAI] = None

    @classmethod
    def is_configured(cls) -> bool:
        """Checks if a non-empty, non-placeholder Gemini API key is configured."""
        key = settings.GEMINI_API_KEY
        if not key or not key.strip():
            return False
        clean_key = key.strip().lower()
        if clean_key in ["your_gemini_api_key_here", "none", "null", "your_api_key"]:
            return False
        return True

    @classmethod
    def get_llm(cls) -> ChatGoogleGenerativeAI:
        """
        Lazily returns the cached ChatGoogleGenerativeAI instance.
        Raises LLMAuthenticationError on invocation if the key is missing.
        """
        if cls._llm is not None:
            return cls._llm

        if not cls.is_configured():
            raise LLMAuthenticationError(
                "GEMINI_API_KEY is not configured on the AI service. "
                "Please configure GEMINI_API_KEY in your .env file or environment variables."
            )

        try:
            cls._llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=settings.LLM_TEMPERATURE,
                timeout=settings.LLM_TIMEOUT_SECONDS
            )
            logger.info("Initialized Gemini LLM successfully with model: %s", settings.GEMINI_MODEL)
            return cls._llm
        except Exception as e:
            logger.error("Failed to initialize ChatGoogleGenerativeAI: %s", e)
            cls._llm = None
            raise LLMProviderError(f"Error initializing Gemini client: {str(e)}", status_code=502) from e

    @classmethod
    def _parse_response_text(cls, response: Any) -> str:
        """
        Extracts clean text string from diverse LangChain response formats.
        Specifically handles Gemini's structured content block lists.
        """
        if isinstance(response.content, list):
            parts = []
            for block in response.content:
                if isinstance(block, dict) and "text" in block:
                    parts.append(block["text"])
                elif isinstance(block, str):
                    parts.append(block)
            return "".join(parts).strip()
        return str(response.content).strip()

    @classmethod
    def _handle_exception(cls, error: Exception) -> None:
        """Maps diverse API exceptions to standardized HTTP-ready exceptions."""
        err_msg = str(error).lower()
        logger.exception("LLM execution error: %s", error)

        if "429" in err_msg or "resource_exhausted" in err_msg or "rate limit" in err_msg:
            raise LLMRateLimitError()
        elif "401" in err_msg or "403" in err_msg or "unauthorized" in err_msg or "api_key_invalid" in err_msg:
            raise LLMAuthenticationError()
        elif "404" in err_msg or "not found" in err_msg:
            raise LLMNotFoundError()
        elif "timeout" in err_msg or "deadline_exceeded" in err_msg:
            raise LLMProviderError("Gemini API request timed out. Please try again.", status_code=504)
        raise LLMProviderError(f"Error communicating with Gemini: {str(error)}", status_code=502)

    @classmethod
    async def generate_policy_answer(
        cls,
        question: str,
        language: str,
        documents: List[Document],
        best_distance: Optional[float] = None
    ) -> PolicyAskResponse:
        """
        Generates a strictly grounded answer to a farmer policy question.
        Guarantees 1-indexed page citations without double-incrementation.
        """
        lang = language.strip().lower()
        is_hindi = lang in ["hi", "hindi"]

        # Case 1: Zero documents retrieved or vector distance indicates complete absence of evidence
        if not documents:
            refusal_msg = (
                "दिए गए आधिकारिक नीति दस्तावेजों में इस प्रश्न का स्पष्ट उत्तर उपलब्ध नहीं है।"
                if is_hindi else
                "The provided official policy documents do not contain sufficient information to answer this question."
            )
            return PolicyAskResponse(
                answer=refusal_msg,
                sources=[],
                confidence="INSUFFICIENT_EVIDENCE",
                language=language
            )

        # Assemble grounded context from retrieved chunks
        context_blocks = []
        for idx, doc in enumerate(documents, start=1):
            src = doc.metadata.get("source", "Official Document")
            # CRITICAL BUG FIX: doc.metadata['page'] is ALREADY 1-indexed. Never add +1 again.
            page = int(doc.metadata.get("page", 1))
            scheme = doc.metadata.get("scheme", "SCHEME")
            auth = doc.metadata.get("authority", "Government of India")

            block = (
                f"[Document {idx} | Scheme: {scheme} | Source: {src} | Page: {page} | Authority: {auth}]\n"
                f"{doc.page_content.strip()}"
            )
            context_blocks.append(block)

        context_text = "\n\n---\n\n".join(context_blocks)

        # Build clean citations (deduplicated by source + page)
        sources: List[SourceCitation] = []
        seen = set()
        for doc in documents:
            src = doc.metadata.get("source", "Official Document")
            page = int(doc.metadata.get("page", 1))  # 1-indexed
            key = (src, page)
            if key not in seen:
                seen.add(key)
                excerpt = doc.page_content.strip()
                if len(excerpt) > 220:
                    excerpt = excerpt[:220] + "..."
                sources.append(
                    SourceCitation(
                        document=src,
                        page=page,
                        scheme=doc.metadata.get("scheme"),
                        authority=doc.metadata.get("authority"),
                        url=doc.metadata.get("url") or None,
                        excerpt=excerpt
                    )
                )

        # Check if Gemini is configured before invoking LLM
        if not cls.is_configured():
            logger.info("Gemini not configured; returning retrieved official policy sources in fallback mode.")
            fallback_answer = (
                "आधिकारिक सरकारी दस्तावेज़ (PMFBY Guidelines) सफलतापूर्वक प्राप्त कर लिए गए हैं। चूंकि GEMINI_API_KEY अभी कॉन्फ़िगर नहीं है, "
                "अतः स्वचालित भाषा संश्लेषण के स्थान पर सत्यापित आधिकारिक उद्धरण और पृष्ठ संख्या नीचे संदर्भ हेतु प्रस्तुत हैं।"
                if is_hindi else
                "Official policy documents were successfully retrieved from the vector store. Since GEMINI_API_KEY is not yet configured, "
                "verified official excerpts and page citations are provided below for reference."
            )
            return PolicyAskResponse(
                answer=fallback_answer,
                sources=sources,
                confidence="RETRIEVAL_SUPPORTED",
                language=language
            )

        prompt = get_policy_rag_prompt(language=language)

        try:
            llm = cls.get_llm()
            chain = prompt | llm
            raw_response = await chain.ainvoke({
                "context": context_text,
                "question": question,
                "language": "Hindi" if is_hindi else "English"
            })
            answer = cls._parse_response_text(raw_response)
        except Exception as e:
            logger.warning("LLM invocation failed (%s); providing retrieved policy excerpts.", e)
            answer = (
                "आधिकारिक सरकारी दस्तावेज़ों से संबंधित अंश सफलतापूर्वक प्राप्त कर लिए गए हैं। "
                "विस्तृत जानकारी हेतु कृपया नीचे दिए गए सत्यापित उद्धरण देखें।"
                if is_hindi else
                "Official scheme documents were successfully retrieved. "
                "Please review the verified excerpts and page citations below for official details."
            )

        # Determine confidence category
        if "उपलब्ध नहीं है" in answer or "not contain sufficient information" in answer.lower():
            confidence = "INSUFFICIENT_EVIDENCE"
        elif best_distance is not None and best_distance <= 0.95:
            confidence = "RETRIEVAL_SUPPORTED"
        elif best_distance is not None and best_distance <= settings.MAX_DISTANCE_THRESHOLD:
            confidence = "PARTIALLY_SUPPORTED"
        else:
            confidence = "RETRIEVAL_SUPPORTED" if sources else "INSUFFICIENT_EVIDENCE"

        return PolicyAskResponse(
            answer=answer,
            sources=sources,
            confidence=confidence,
            language=language
        )

    @classmethod
    async def generate_grievance(cls, request: GrievanceGenerateRequest) -> GrievanceGenerateResponse:
        """
        Generates a formal grievance draft.
        If Gemini is unconfigured or unavailable, seamlessly uses deterministic fallback.
        """
        if not cls.is_configured():
            logger.info("Gemini not configured; using deterministic fallback grievance generation.")
            return generate_fallback_grievance(request)

        prompt = get_grievance_prompt()

        try:
            llm = cls.get_llm()
            chain = prompt | llm
            raw_response = await chain.ainvoke({
                "farmerName": request.farmerName,
                "issueType": request.issueType,
                "crop": request.crop or "N/A",
                "expectedAmount": f"{request.expectedAmount:,.2f}" if request.expectedAmount is not None else "N/A",
                "actualAmount": f"{request.actualAmount:,.2f}" if request.actualAmount is not None else "N/A",
                "difference": f"{request.difference:,.2f}" if request.difference is not None else "N/A",
                "ruleReference": request.ruleReference or "Applicable Guidelines",
                "language": request.language or "Hindi",
                "details": request.details or "None provided"
            })
            text = cls._parse_response_text(raw_response)

            # Clean JSON markdown if wrapped in ```json ... ```
            cleaned = text.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()

            data = json.loads(cleaned)
            return GrievanceGenerateResponse(
                subject=data.get("subject", "Grievance Application"),
                body=data.get("body", text),
                evidenceChecklist=data.get("evidenceChecklist", []),
                language=request.language or "Hindi",
                generatedBy="GEMINI"
            )
        except Exception as e:
            logger.warning("Gemini grievance generation failed (%s); reverting to deterministic template.", e)
            return generate_fallback_grievance(request)

    @classmethod
    async def generate_explanation(cls, request: DiscrepancyExplanationRequest) -> DiscrepancyExplanationResponse:
        """
        Generates a farmer-friendly explanation of calculation results.
        If Gemini is unconfigured or unavailable, seamlessly uses deterministic fallback.
        """
        if not cls.is_configured():
            logger.info("Gemini not configured; using deterministic fallback explanation.")
            return generate_fallback_explanation(request)

        prompt = get_explanation_prompt()

        try:
            llm = cls.get_llm()
            chain = prompt | llm
            raw_response = await chain.ainvoke({
                "category": request.category,
                "expectedAmount": f"{request.expectedAmount:,.2f}" if request.expectedAmount is not None else "N/A",
                "actualAmount": f"{request.actualAmount:,.2f}" if request.actualAmount is not None else "N/A",
                "difference": f"{request.difference:,.2f}" if request.difference is not None else "N/A",
                "status": request.status,
                "reason": request.reason or "Record discrepancy detected",
                "language": request.language or "Hindi"
            })
            text = cls._parse_response_text(raw_response)

            cleaned = text.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()

            data = json.loads(cleaned)
            return DiscrepancyExplanationResponse(
                explanation=data.get("explanation", text),
                recommendedAction=data.get("recommendedAction", "Verify records at your local society."),
                documentsToVerify=data.get("documentsToVerify", []),
                language=request.language or "Hindi",
                category=request.category,
                generatedBy="GEMINI"
            )
        except Exception as e:
            logger.warning("Gemini explanation generation failed (%s); reverting to deterministic fallback.", e)
            return generate_fallback_explanation(request)


# Singleton
llm_service = GeminiLLMService()
