"""
Deterministic grievance and explanation fallback templates.
Used when Gemini API is unavailable or rate-limited.
Guarantees zero-failure operation for the Java Spring Boot backend while maintaining 100% financial accuracy.
"""

from typing import Dict, Any, List
from app.schemas.grievance_schema import (
    GrievanceGenerateRequest,
    GrievanceGenerateResponse,
    DiscrepancyExplanationRequest,
    DiscrepancyExplanationResponse,
)


def generate_fallback_grievance(request: GrievanceGenerateRequest) -> GrievanceGenerateResponse:
    """
    Generates a deterministic, legally structured grievance draft without relying on LLM.
    """
    lang = (request.language or "Hindi").strip().lower()
    is_hindi = "hi" in lang

    farmer_name = request.farmerName
    crop = request.crop or ("फसल" if is_hindi else "Crop")
    issue_type = request.issueType
    exp = f"₹{request.expectedAmount:,.2f}" if request.expectedAmount is not None else "निर्धारित राशि"
    act = f"₹{request.actualAmount:,.2f}" if request.actualAmount is not None else "प्राप्त राशि"
    diff = f"₹{request.difference:,.2f}" if request.difference is not None else "अंतर राशि"
    rule = request.ruleReference or "लागू सरकारी दिशा-निर्देश"

    if is_hindi:
        subject = f"{crop} के भुगतान में {diff} के अंतर की जांच एवं समाधान हेतु आवेदन"
        body = (
            f"सेवा में,\n"
            f"सक्षम प्राधिकारी / शाखा प्रबंधक,\n\n"
            f"विषय: {subject}\n\n"
            f"महोदय,\n"
            f"सविनय निवेदन है कि मैं {farmer_name}, एक पंजीकृत कृषक हूँ। मेरे द्वारा {crop} के संदर्भ में दर्ज "
            f"विवरण के अनुसार मुझे नियमानुसार कुल {exp} का भुगतान प्राप्त होना अपेक्षित था।\n\n"
            f"किन्तु वर्तमान बैंक खाते / भुगतान रिकॉर्ड के अनुसार मुझे केवल {act} प्राप्त हुए हैं, जिससे कुल {diff} "
            f"की राशि का अंतर (Discrepancy) परिलक्षित हो रहा है। (संदर्भ: {rule})\n\n"
            f"अतः आपसे सादर अनुरोध है कि कृपया मेरे उक्त लेनदेन तथा प्रासंगिक अभिलेखों की अविलंब जांच कराने की कृपा करें, "
            f"तथा शेष देय राशि का शीघ्र भुगतान सुनिश्चित करें।\n\n"
            f"संलग्न दस्तावेज: कृपया नीचे दिए गए साक्ष्य अवलोकनार्थ स्वीकार करें।\n\n"
            f"भवदीय,\n"
            f"{farmer_name}\n"
            f"दिनांक: यथा प्रस्तुत"
        )
        evidence = [
            f"{crop} खरीद / मंडी रसीद (J-Form / Procurement Receipt)",
            "संबंधित बैंक पासबुक / खाता विवरण की प्रति",
            "किसान पंजीकरण अथवा गिरदावरी पर्ची",
            "आधार कार्ड एवं किसान क्रेडिट कार्ड की छायाप्रति"
        ]
    else:
        subject = f"Application for Verification & Resolution of ₹{diff} Discrepancy regarding {crop}"
        body = (
            f"To,\n"
            f"The Competent Authority / Branch Manager,\n\n"
            f"Subject: {subject}\n\n"
            f"Respected Sir/Madam,\n"
            f"I, {farmer_name}, am a registered farmer. According to official scheme guidelines ({rule}) and verified records "
            f"for {crop}, my expected payable entitlement is {exp}.\n\n"
            f"However, the credit received in my registered account is only {act}, reflecting an unresolved discrepancy of {diff}.\n\n"
            f"I respectfully request you to kindly examine the procurement and transaction records, verify the shortfall, "
            f"and disburse the remaining balance at the earliest.\n\n"
            f"Thanking you,\n\n"
            f"Yours faithfully,\n"
            f"{farmer_name}"
        )
        evidence = [
            f"Official Procurement / Mandi Receipt for {crop}",
            "Updated Bank Passbook / Account Statement",
            "Farmer Registration Certificate / Land Record Copy",
            "Identification and Scheme Passbook Copy"
        ]

    return GrievanceGenerateResponse(
        subject=subject,
        body=body,
        evidenceChecklist=evidence,
        language="Hindi" if is_hindi else "English",
        generatedBy="DETERMINISTIC_FALLBACK"
    )


def generate_fallback_explanation(request: DiscrepancyExplanationRequest) -> DiscrepancyExplanationResponse:
    """
    Generates a deterministic discrepancy explanation without relying on LLM.
    """
    lang = (request.language or "Hindi").strip().lower()
    is_hindi = "hi" in lang

    cat = request.category
    exp = f"₹{request.expectedAmount:,.2f}" if request.expectedAmount is not None else "निर्धारित राशि"
    act = f"₹{request.actualAmount:,.2f}" if request.actualAmount is not None else "प्राप्त राशि"
    diff = f"₹{request.difference:,.2f}" if request.difference is not None else "अंतर"
    reason = request.reason or ("रिकॉर्ड में अंतर पाया गया है।" if is_hindi else "A discrepancy was detected in records.")

    if is_hindi:
        explanation = (
            f"आपके {cat} योजना के अंतर्गत अपेक्षित राशि {exp} और प्राप्त राशि {act} के मध्य "
            f"{diff} का अंतर पाया गया है। सिस्टम विवरण: {reason} "
            f"यह एक संभावित विसंगति (Potential Discrepancy) है, जिसकी पुष्टि के लिए अपने दस्तावेजों की जांच करें।"
        )
        action = "कृपया अपनी खरीद रसीद और बैंक पासबुक लेकर नजदीकी संबंधित केंद्र या बैंक शाखा से संपर्क करें।"
        docs = [
            "नवीनतम बैंक पासबुक प्रविष्टि",
            "मंडी / समिति द्वारा जारी खरीद रसीद",
            "किसान पंजीकरण पर्ची"
        ]
    else:
        explanation = (
            f"Under your {cat} scheme records, an expected entitlement of {exp} was computed, "
            f"while the actual recorded credit is {act}, showing a discrepancy of {diff}. "
            f"System Note: {reason}"
        )
        action = "Please verify your procurement slip and bank passbook with your local branch or society."
        docs = [
            "Latest Bank Passbook / Statement entry",
            "Procurement Receipt / Mandi Gate Pass",
            "Farmer Registration / Sowing Certificate"
        ]

    return DiscrepancyExplanationResponse(
        explanation=explanation,
        recommendedAction=action,
        documentsToVerify=docs,
        language="Hindi" if is_hindi else "English",
        category=cat,
        generatedBy="DETERMINISTIC_FALLBACK"
    )
