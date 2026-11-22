"""
Language Normalization and Handling Utilities.
Provides standard language detection, formatting, and translation routing for KisanSetu.
"""

import re
from typing import Tuple


def normalize_language_code(language_input: str) -> str:
    """
    Maps diverse language inputs ('hi', 'Hindi', 'hindi', 'en', 'English') to standardized codes: 'hi' or 'en'.
    """
    if not language_input:
        return "hi"

    lang = language_input.strip().lower()
    if any(k in lang for k in ["hi", "hin", "हिंदी", "hindi"]):
        return "hi"
    elif any(k in lang for k in ["en", "eng", "english"]):
        return "en"
    elif any(k in lang for k in ["ch", "chhat", "छत्तीसगढ़ी"]):
        # Chhattisgarhi falls back gracefully to Hindi for LLM grounding
        return "hi"
    return "hi"


def get_display_language_name(code: str) -> str:
    return "Hindi" if code == "hi" else "English"


def is_devanagari_script(text: str) -> bool:
    """Detects whether text contains Devanagari Unicode characters."""
    return bool(re.search(r"[\u0900-\u097F]", text))
