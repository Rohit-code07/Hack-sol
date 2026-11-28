"""
Voice Service for KisanSetu.
Provides:
- Multilingual Speech-to-Text (STT) supporting Hindi, English, and Hinglish.
- Audio normalization and query translation where appropriate.
- Fallback processing when Gemini API key is absent or audio is in browser format.
"""

import json
import logging
from typing import Optional, Dict, Any

from app.core.config import settings
from app.core.llm import llm_service
from app.schemas.document_schema import VoiceTranscriptionResponse

logger = logging.getLogger(__name__)


class VoiceService:
    """
    Handles speech transcription for voice-based interaction with KisanSetu RAG.
    """

    @classmethod
    async def transcribe_audio(
        cls,
        audio_bytes: bytes,
        content_type: str = "audio/webm",
        language_preference: str = "Hindi"
    ) -> VoiceTranscriptionResponse:
        """
        Transcribes speech audio into text using Gemini Multimodal Audio or returns fallback.
        Preserves scheme names, numbers, crop terms, and farmer names accurately.
        """
        if not llm_service.is_configured():
            logger.info("Gemini unconfigured; returning placeholder transcription guidance.")
            is_hindi = language_preference.lower() in ["hi", "hindi"]
            msg = (
                "ऑडियो प्राप्त हुआ। ध्वनि पहचान हेतु कृपया ब्राउज़र स्पीच इनपुट का उपयोग करें अथवा प्रश्न टाइप करें।"
                if is_hindi else
                "Audio received. Please use browser speech-to-text or type your question for instant policy answers."
            )
            return VoiceTranscriptionResponse(
                transcription=msg,
                detected_language="Hindi" if is_hindi else "English",
                confidence=0.85,
                success=True
            )

        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)

            prompt = """
You are an expert Speech-to-Text transcriber for Indian farmers using the KisanSetu agricultural platform.
Transcribe the speech in the attached audio accurately.

GUIDELINES:
1. Detect whether the speaker spoke in Hindi (Devanagari), English, or Hinglish (Hindi written in Roman/English script or mixed).
2. If Hindi: provide accurate Devanagari Hindi transcription.
3. If English: provide clean English transcription.
4. If Hinglish: transcribe accurately preserving words like 'KCC loan', 'MSP mandi', 'PMFBY fasal bima', 'khasra', 'rokda', 'subsidy'.
5. Do not summarize or alter numbers, dates, or scheme names.
6. Return JSON strictly matching this schema:
{
  "transcription": "Exact transcribed text of user speech",
  "detected_language": "Hindi" | "English" | "Hinglish",
  "confidence": 0.95,
  "normalized_query": "Standard normalized question suitable for search without losing original meaning"
}
"""
            # Clean content_type if needed
            clean_mime = content_type.split(";")[0].strip()
            if not clean_mime or clean_mime == "application/octet-stream":
                clean_mime = "audio/webm"

            response = await model.generate_content_async([
                prompt,
                {"mime_type": clean_mime, "data": audio_bytes}
            ])

            text = response.text.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                text = "\n".join(lines).strip()

            data = json.loads(text)
            return VoiceTranscriptionResponse(
                transcription=data.get("transcription", "").strip(),
                detected_language=data.get("detected_language", "Hindi"),
                confidence=float(data.get("confidence", 0.95)),
                normalized_query=data.get("normalized_query"),
                success=True
            )

        except Exception as e:
            logger.warning("Gemini audio transcription error: %s", e)
            is_hindi = language_preference.lower() in ["hi", "hindi"]
            return VoiceTranscriptionResponse(
                transcription="कृपया प्रश्न पुनः बोलें या टाइप करें।" if is_hindi else "Please repeat or type your query.",
                detected_language="Hindi" if is_hindi else "English",
                confidence=0.50,
                success=False
            )


voice_service = VoiceService()
