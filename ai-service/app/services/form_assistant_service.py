"""
Universal Form Assistant Service for KisanSetu.
Extracts form fields from Voice (Hindi, English, Hinglish) and Documents (PDF, JPG, PNG).
Handles dynamic field mapping, schema validation, confidence calculation, and conflict detection.
"""

import io
import re
import json
import logging
from typing import List, Optional, Dict, Any, Tuple
import pymupdf  # PyMuPDF fitz
from PIL import Image

from app.core.config import settings
from app.core.llm import GeminiLLMService
from app.schemas.form_assistant_schema import (
    FormFieldMetadata,
    FormSchemaDefinition,
    ExtractedFieldValue,
    FieldConflict,
    FormExtractResponse,
)

logger = logging.getLogger(__name__)


class FormAssistantService:
    """
    Universal service for AI-powered voice and document form filling.
    """

    @classmethod
    def _is_conflict(cls, old_val: Any, new_val: Any, field_type: str) -> bool:
        """Determines if new extracted value materially conflicts with an existing value."""
        if old_val is None or new_val is None:
            return False

        old_str = str(old_val).strip()
        new_str = str(new_val).strip()

        if not old_str or not new_str:
            return False

        # If identical (case-insensitive)
        if old_str.lower() == new_str.lower():
            return False

        # If numeric (amounts, land area, percentages)
        if field_type in ["number", "float", "int"]:
            try:
                old_num = float(re.sub(r"[^\d.]", "", old_str))
                new_num = float(re.sub(r"[^\d.]", "", new_str))
                # allow minute float tolerance (0.01)
                if abs(old_num - new_num) > 0.01:
                    return True
                return False
            except ValueError:
                pass

        # String or categorical difference
        return True

    @classmethod
    def _clean_json_markdown(cls, raw_text: str) -> str:
        """Extracts JSON substring from LLM markdown code blocks."""
        text = raw_text.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return text

    # =========================================================================
    # VOICE EXTRACTOR
    # =========================================================================
    @classmethod
    async def extract_from_voice(
        cls,
        spoken_text: str,
        form_schema: FormSchemaDefinition,
        language: str = "hi",
        current_values: Optional[Dict[str, Any]] = None,
    ) -> FormExtractResponse:
        """
        Extracts form fields from natural language speech (Hindi, English, Hinglish).
        """
        spoken_text = (spoken_text or "").strip()
        if not spoken_text:
            return FormExtractResponse(
                formId=form_schema.formId,
                status="FAILED",
                warnings=["Empty speech transcript provided."],
            )

        current_values = current_values or {}

        # If Gemini is configured, use LLM prompt
        if GeminiLLMService.is_configured():
            try:
                return await cls._gemini_voice_extract(
                    spoken_text=spoken_text,
                    form_schema=form_schema,
                    language=language,
                    current_values=current_values,
                )
            except Exception as e:
                logger.warning(
                    "Gemini voice extraction failed (%s). Falling back to deterministic extractor.",
                    e,
                )

        # Fallback deterministic extractor
        return cls._deterministic_extract(
            text_corpus=spoken_text,
            form_schema=form_schema,
            source="VOICE",
            current_values=current_values,
        )

    @classmethod
    async def _gemini_voice_extract(
        cls,
        spoken_text: str,
        form_schema: FormSchemaDefinition,
        language: str,
        current_values: Dict[str, Any],
    ) -> FormExtractResponse:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        fields_summary = []
        for f in form_schema.fields:
            opts = (
                f", allowed options: {[o.value for o in f.options]}"
                if f.options
                else ""
            )
            desc = f", description: {f.description}" if f.description else ""
            fields_summary.append(
                f"- fieldId: '{f.fieldId}', label: '{f.label}', type: '{f.type}'{desc}{opts}"
            )

        fields_str = "\n".join(fields_summary)
        current_str = json.dumps(current_values, ensure_ascii=False)

        prompt = f"""
You are the KisanSetu Universal Smart Form Assistant.
Your task is to listen to the farmer's natural spoken voice instruction and extract ONLY information that maps into the active form's fields.

ACTIVE FORM DETAILS:
- Form ID: {form_schema.formId}
- Form Title: {form_schema.title}
- Form Purpose: {form_schema.description or 'Government agricultural scheme/record form'}

TARGET FORM FIELDS:
{fields_str}

EXISTING FIELD VALUES (ALREADY ENTERED IN FORM):
{current_str}

USER NATURAL LANGUAGE SPOKEN STATEMENT (May be in Hindi, English, or Hinglish):
"{spoken_text}"

INSTRUCTIONS:
1. Extract matching values for ANY of the target form fields mentioned in the speech.
2. The user speaks naturally, NOT in key-value pairs (e.g. "Mera naam Ramesh Kumar hai, gaon Arang, zameen 3.5 acre, crop paddy hai").
3. Convert Indian currency words to numbers (e.g., "ek lakh pachaas hazaar" -> 150000, "do lakh" -> 200000, "pachas hazaar" -> 50000).
4. For select/dropdown fields, map to the closest matching allowed option value.
5. If a field was NOT mentioned in the speech, DO NOT hallucinate or include it.
6. Check for conflicts: If an EXISTING FIELD VALUE is different from the newly spoken value, note it as a conflict!

Return ONLY valid JSON in this exact structure:
{{
  "extractedFields": [
    {{
      "fieldId": "name",
      "label": "Farmer Full Name",
      "value": "Ramesh Kumar",
      "confidence": 0.95,
      "reasoning": "Explicitly stated in speech: 'Mera naam Ramesh Kumar hai'",
      "requiresConfirmation": false
    }}
  ],
  "conflicts": [
    {{
      "fieldId": "sanctionedAmount",
      "label": "Sanctioned Amount",
      "currentValue": 150000,
      "newValue": 200000,
      "conflictReason": "Existing form has 150000, but spoken input says 200000"
    }}
  ],
  "warnings": []
}}
"""

        response = model.generate_content(prompt)
        cleaned_text = cls._clean_json_markdown(response.text)
        data = json.loads(cleaned_text)

        extracted_list: List[ExtractedFieldValue] = []
        for item in data.get("extractedFields", []):
            fid = item.get("fieldId")
            # Ensure fieldId exists in target schema
            matching_field = next(
                (f for f in form_schema.fields if f.fieldId == fid), None
            )
            if matching_field:
                extracted_list.append(
                    ExtractedFieldValue(
                        fieldId=fid,
                        label=matching_field.label,
                        value=item.get("value"),
                        confidence=float(item.get("confidence", 0.90)),
                        source="VOICE",
                        reasoning=item.get("reasoning"),
                        requiresConfirmation=bool(
                            item.get("requiresConfirmation", False)
                        )
                        or (matching_field.required and matching_field.type in ["number", "tel"]),
                    )
                )

        conflict_list: List[FieldConflict] = []
        for c in data.get("conflicts", []):
            conflict_list.append(
                FieldConflict(
                    fieldId=c.get("fieldId", ""),
                    label=c.get("label", c.get("fieldId", "")),
                    currentValue=c.get("currentValue"),
                    newValue=c.get("newValue"),
                    sourceA="EXISTING_FORM",
                    sourceB="VOICE_INPUT",
                    conflictReason=c.get(
                        "conflictReason", "Spoken value differs from current value"
                    ),
                )
            )

        # In-code safety check: also check conflicts directly against current_values
        schema_dict = {f.fieldId: f for f in form_schema.fields}
        for item in extracted_list:
            if item.fieldId in current_values:
                old_val = current_values[item.fieldId]
                f_meta = schema_dict.get(item.fieldId)
                f_type = f_meta.type if f_meta else "text"
                if cls._is_conflict(old_val, item.value, f_type):
                    # Check if already recorded in conflict_list
                    already = any(c.fieldId == item.fieldId for c in conflict_list)
                    if not already:
                        conflict_list.append(
                            FieldConflict(
                                fieldId=item.fieldId,
                                label=item.label,
                                currentValue=old_val,
                                newValue=item.value,
                                sourceA="EXISTING_FORM",
                                sourceB="VOICE_INPUT",
                                conflictReason=f"Spoken input ({item.value}) differs from existing value ({old_val}).",
                            )
                        )

        return FormExtractResponse(
            formId=form_schema.formId,
            status="COMPLETED" if extracted_list else "PARTIAL",
            extractedFields=extracted_list,
            conflicts=conflict_list,
            warnings=data.get("warnings", []),
            rawTranscript=spoken_text,
        )

    # =========================================================================
    # DOCUMENT EXTRACTOR
    # =========================================================================
    @classmethod
    async def extract_from_document(
        cls,
        file_bytes: bytes,
        filename: str,
        content_type: str,
        form_schema: FormSchemaDefinition,
        language: str = "hi",
        current_values: Optional[Dict[str, Any]] = None,
    ) -> FormExtractResponse:
        """
        Extracts form fields from uploaded document (PDF, JPG, PNG, WEBP) matching active schema.
        """
        current_values = current_values or {}
        extracted_text = ""
        preview_image = None

        # 1. Extract text and preview via PyMuPDF
        try:
            if content_type == "application/pdf" or filename.lower().endswith(".pdf"):
                doc = pymupdf.open(stream=file_bytes, filetype="pdf")
                pages_text = []
                for p_idx in range(min(len(doc), 3)):
                    page = doc[p_idx]
                    pages_text.append(page.get_text())
                extracted_text = "\n".join(pages_text).strip()

                if len(doc) > 0:
                    page0 = doc[0]
                    pix = page0.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("jpeg")
                    preview_image = Image.open(io.BytesIO(img_bytes))
            else:
                preview_image = Image.open(io.BytesIO(file_bytes))
        except Exception as e:
            logger.warning("Error pre-parsing document with PyMuPDF: %s", e)

        # 2. Invoke Gemini Multimodal if configured
        if GeminiLLMService.is_configured():
            try:
                return await cls._gemini_document_extract(
                    file_bytes=file_bytes,
                    content_type=content_type,
                    pdf_text=extracted_text,
                    preview_image=preview_image,
                    filename=filename,
                    form_schema=form_schema,
                    language=language,
                    current_values=current_values,
                )
            except Exception as e:
                logger.warning(
                    "Gemini document extraction failed (%s). Falling back to deterministic parser.",
                    e,
                )

        # 3. Fallback deterministic text parser
        return cls._deterministic_extract(
            text_corpus=extracted_text or filename,
            form_schema=form_schema,
            source="DOCUMENT",
            current_values=current_values,
        )

    @classmethod
    async def _gemini_document_extract(
        cls,
        file_bytes: bytes,
        content_type: str,
        pdf_text: str,
        preview_image: Optional[Image.Image],
        filename: str,
        form_schema: FormSchemaDefinition,
        language: str,
        current_values: Dict[str, Any],
    ) -> FormExtractResponse:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        fields_summary = []
        for f in form_schema.fields:
            opts = (
                f", allowed options: {[o.value for o in f.options]}"
                if f.options
                else ""
            )
            desc = f", description: {f.description}" if f.description else ""
            fields_summary.append(
                f"- fieldId: '{f.fieldId}', label: '{f.label}', type: '{f.type}'{desc}{opts}"
            )

        fields_str = "\n".join(fields_summary)
        current_str = json.dumps(current_values, ensure_ascii=False)

        prompt = f"""
You are the KisanSetu Universal Smart Form Document Reader.
Inspect the attached agricultural or financial document and extract ONLY fields that match the active form schema.

ACTIVE FORM DETAILS:
- Form ID: {form_schema.formId}
- Form Title: {form_schema.title}
- Document Filename: {filename}

TARGET FORM FIELDS TO EXTRACT:
{fields_str}

EXISTING FORM FIELD VALUES (CURRENTLY IN FORM):
{current_str}

EMBEDDED OCR TEXT (IF DETECTED):
{pdf_text[:3000] if pdf_text else 'None - perform OCR directly from visual image'}

RULES:
1. Extract data ONLY if it is clearly visible in the document. Do not invent or assume values!
2. Match extracted data strictly to the specified 'fieldId' and expected 'type'.
3. If an existing form value differs from the document value, record a conflict!
4. Assign an honest confidence score between 0.0 and 1.0 (>= 0.85 for clear crisp text, 0.60 - 0.84 for faded/handwritten text).

Return ONLY valid JSON:
{{
  "extractedFields": [
    {{
      "fieldId": "khasraNumber",
      "label": "Khasra Number",
      "value": "102/1",
      "confidence": 0.95,
      "reasoning": "Clearly read from 7/12 extract header box",
      "requiresConfirmation": false
    }}
  ],
  "conflicts": [],
  "warnings": []
}}
"""

        content_parts = [prompt]
        if preview_image:
            img_byte_arr = io.BytesIO()
            preview_image.save(img_byte_arr, format="JPEG", quality=85)
            content_parts.append(
                {"mime_type": "image/jpeg", "data": img_byte_arr.getvalue()}
            )
        elif (
            content_type.startswith("image/")
            and content_type in ["image/jpeg", "image/png", "image/webp"]
        ):
            content_parts.append({"mime_type": content_type, "data": file_bytes})

        response = model.generate_content(content_parts)
        cleaned_text = cls._clean_json_markdown(response.text)
        data = json.loads(cleaned_text)

        extracted_list: List[ExtractedFieldValue] = []
        for item in data.get("extractedFields", []):
            fid = item.get("fieldId")
            matching_field = next(
                (f for f in form_schema.fields if f.fieldId == fid), None
            )
            if matching_field:
                extracted_list.append(
                    ExtractedFieldValue(
                        fieldId=fid,
                        label=matching_field.label,
                        value=item.get("value"),
                        confidence=float(item.get("confidence", 0.90)),
                        source="DOCUMENT",
                        reasoning=item.get("reasoning"),
                        requiresConfirmation=bool(
                            item.get("requiresConfirmation", False)
                        )
                        or (matching_field.required and matching_field.type in ["number", "tel"]),
                    )
                )

        conflict_list: List[FieldConflict] = []
        schema_dict = {f.fieldId: f for f in form_schema.fields}
        for item in extracted_list:
            if item.fieldId in current_values:
                old_val = current_values[item.fieldId]
                f_meta = schema_dict.get(item.fieldId)
                f_type = f_meta.type if f_meta else "text"
                if cls._is_conflict(old_val, item.value, f_type):
                    conflict_list.append(
                        FieldConflict(
                            fieldId=item.fieldId,
                            label=item.label,
                            currentValue=old_val,
                            newValue=item.value,
                            sourceA="EXISTING_FORM",
                            sourceB="DOCUMENT_EXTRACT",
                            conflictReason=f"Document value ({item.value}) differs from existing value ({old_val}).",
                        )
                    )

        return FormExtractResponse(
            formId=form_schema.formId,
            status="COMPLETED" if extracted_list else "PARTIAL",
            extractedFields=extracted_list,
            conflicts=conflict_list,
            warnings=data.get("warnings", []),
        )

    # =========================================================================
    # DETERMINISTIC REGEX & PATTERN-BASED FALLBACK
    # =========================================================================
    @classmethod
    def _deterministic_extract(
        cls,
        text_corpus: str,
        form_schema: FormSchemaDefinition,
        source: str = "VOICE",
        current_values: Optional[Dict[str, Any]] = None,
    ) -> FormExtractResponse:
        """
        Extracts common agricultural fields using regex and keyword rules.
        Runs when Gemini is offline or unconfigured.
        """
        current_values = current_values or {}
        extracted: List[ExtractedFieldValue] = []
        conflicts: List[FieldConflict] = []
        text = text_corpus

        patterns = {
            "mobile": r"\b[6-9]\d{9}\b",
            "aadhaar": r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b",
            "khasra": r"(?:khasra|survey|खसरा|सर्वे)\s*(?:no\.?|num\.?|number|क्रमांक)?\s*[:\-]?\s*([0-9]+(?:\/[0-9]+)?)",
            "area": r"(\d+(?:\.\d+)?)\s*(?:acre|acres|एकड़|hectare|ha|हेक्टेयर)",
            "amount": r"(?:rs\.?|inr|₹|amount|रुपये|राशि)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)\s*(?:lakh|हज़ार|हजार|lakhs|rupees|rs|/-)?",
            "pin": r"\b\d{6}\b",
            "crop": r"(paddy|wheat|cotton|soybean|dhan|gehu|धान|गेहूं|कपास|सोयाबीन)",
            "bank": r"(state bank of india|sbi|punjab national bank|pnb|bank of maharashtra|gramin bank|ग्रामीण बैंक)",
        }

        # Check each field in schema
        for f in form_schema.fields:
            fid = f.fieldId.lower()
            val = None
            confidence = 0.85
            reasoning = None

            # 1. Mobile number
            if any(k in fid for k in ["mobile", "phone", "contact"]):
                m = re.search(patterns["mobile"], text)
                if m:
                    val = m.group(0)
                    confidence = 0.96
                    reasoning = f"Matched 10-digit mobile number: {val}"

            # 2. Aadhaar / ID
            elif "aadhaar" in fid or "uid" in fid:
                m = re.search(patterns["aadhaar"], text)
                if m:
                    val = m.group(0)
                    confidence = 0.90
                    reasoning = f"Matched Aadhaar format: {val}"

            # 3. Khasra / Survey
            elif any(k in fid for k in ["khasra", "survey", "plot"]):
                m = re.search(patterns["khasra"], text, re.IGNORECASE)
                if m:
                    val = m.group(1)
                    confidence = 0.92
                    reasoning = f"Matched Khasra pattern: {val}"
                else:
                    m2 = re.search(r"\b\d{1,4}\/\d{1,4}\b", text)
                    if m2:
                        val = m2.group(0)
                        confidence = 0.88
                        reasoning = f"Matched survey fractional format: {val}"

            # 4. Land Area
            elif any(k in fid for k in ["area", "landarea", "acre"]):
                m = re.search(patterns["area"], text, re.IGNORECASE)
                if m:
                    try:
                        val = float(m.group(1))
                        confidence = 0.94
                        reasoning = f"Matched land area in acres: {val}"
                    except ValueError:
                        pass

            # 5. Financial Amount / Loan / Sum / Payout
            elif any(k in fid for k in ["amount", "limit", "suminsured", "premium", "disbursed"]):
                # check for lakh words
                lakh_m = re.search(
                    r"(\d+(?:\.\d+)?)\s*(?:lakh|लाख)", text, re.IGNORECASE
                )
                if lakh_m:
                    try:
                        val = int(float(lakh_m.group(1)) * 100000)
                        confidence = 0.95
                        reasoning = f"Extracted lakh currency amount: ₹{val}"
                    except ValueError:
                        pass
                else:
                    hazar_m = re.search(
                        r"(\d+(?:\.\d+)?)\s*(?:thousand|हज़ार|हजार)",
                        text,
                        re.IGNORECASE,
                    )
                    if hazar_m:
                        try:
                            val = int(float(hazar_m.group(1)) * 1000)
                            confidence = 0.95
                            reasoning = f"Extracted thousand currency amount: ₹{val}"
                        except ValueError:
                            pass
                    else:
                        num_m = re.search(r"\b\d{4,8}\b", text)
                        if num_m:
                            val = int(num_m.group(0))
                            confidence = 0.85
                            reasoning = f"Extracted numeric amount: {val}"

            # 6. Crop Name
            elif any(k in fid for k in ["crop", "croptype"]):
                m = re.search(patterns["crop"], text, re.IGNORECASE)
                if m:
                    matched_crop = m.group(1).lower()
                    if matched_crop in ["paddy", "dhan", "धान"]:
                        val = "Paddy"
                    elif matched_crop in ["wheat", "gehu", "गेहूं"]:
                        val = "Wheat"
                    elif matched_crop in ["cotton", "कपास"]:
                        val = "Cotton"
                    elif matched_crop in ["soybean", "सोयाबीन"]:
                        val = "Soybean"
                    confidence = 0.90
                    reasoning = f"Identified crop: {val}"

            # 7. Bank Name
            elif "bank" in fid:
                m = re.search(patterns["bank"], text, re.IGNORECASE)
                if m:
                    b_match = m.group(1).lower()
                    if "sbi" in b_match or "state bank" in b_match:
                        val = "State Bank of India"
                    elif "pnb" in b_match or "punjab national" in b_match:
                        val = "Punjab National Bank"
                    elif "maharashtra" in b_match:
                        val = "Bank of Maharashtra"
                    elif "gramin" in b_match or "ग्रामीण" in b_match:
                        val = "Chhattisgarh Rajya Gramin Bank"
                    confidence = 0.95
                    reasoning = f"Matched institutional bank: {val}"

            # 8. Village / District keywords
            elif "village" in fid:
                m = re.search(
                    r"(?:gaon|village|ग्राम|गांव)\s*(?:is|hai|है|:)?\s*([a-zA-Z\u0900-\u097F]+)",
                    text,
                    re.IGNORECASE,
                )
                if m:
                    val = m.group(1)
                    confidence = 0.88
                    reasoning = f"Identified village name: {val}"
            elif "district" in fid:
                m = re.search(
                    r"(?:district|zila|जिला)\s*(?:is|hai|है|:)?\s*([a-zA-Z\u0900-\u097F]+)",
                    text,
                    re.IGNORECASE,
                )
                if m:
                    val = m.group(1)
                    confidence = 0.88
                    reasoning = f"Identified district name: {val}"

            # 9. Name
            elif "name" in fid and "bank" not in fid and "crop" not in fid:
                m = re.search(
                    r"(?:naam|name|नाम)\s*(?:is|hai|है|:)?\s*([a-zA-Z\u0900-\u097F\s]{3,25})(?:\s+hai|\s+is|\.|\,|$)",
                    text,
                    re.IGNORECASE,
                )
                if m:
                    val = m.group(1).strip()
                    confidence = 0.89
                    reasoning = f"Extracted person name: {val}"

            if val is not None:
                # Conflict detection
                if f.fieldId in current_values:
                    old_val = current_values[f.fieldId]
                    if cls._is_conflict(old_val, val, f.type):
                        conflicts.append(
                            FieldConflict(
                                fieldId=f.fieldId,
                                label=f.label,
                                currentValue=old_val,
                                newValue=val,
                                sourceA="EXISTING_FORM",
                                sourceB=source,
                                conflictReason=f"{source} extracted value '{val}' differs from current '{old_val}'.",
                            )
                        )

                extracted.append(
                    ExtractedFieldValue(
                        fieldId=f.fieldId,
                        label=f.label,
                        value=val,
                        confidence=confidence,
                        source=source,
                        reasoning=reasoning,
                        requiresConfirmation=f.required and f.type in ["number", "tel"],
                    )
                )

        return FormExtractResponse(
            formId=form_schema.formId,
            status="COMPLETED" if extracted else "PARTIAL",
            extractedFields=extracted,
            conflicts=conflicts,
            warnings=["Fallback pattern extractor utilized."] if not GeminiLLMService.is_configured() else [],
            rawTranscript=text_corpus if source == "VOICE" else None,
        )
