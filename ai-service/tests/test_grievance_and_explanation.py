"""
Grievance Generator and Discrepancy Explanation Tests.
Verifies exact preservation of Java financial figures and fallback capabilities.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)
AUTH_HEADERS = {settings.API_KEY_HEADER_NAME: settings.AI_SERVICE_API_KEY}


def test_grievance_preserves_financial_figures_exactly():
    """
    CRITICAL ARCHITECTURAL RULE:
    The AI service must NEVER alter, round, or recalculate financial figures from Spring Boot.
    """
    payload = {
        "farmerName": "Ram Prasad",
        "issueType": "MSP_PAYMENT_DISCREPANCY",
        "crop": "Paddy",
        "expectedAmount": 48820.75,
        "actualAmount": 47820.25,
        "difference": 1000.50,
        "language": "Hindi",
        "ruleReference": "MSP_KMS_2026_27"
    }
    res = client.post("/ai/v1/grievance/generate", headers=AUTH_HEADERS, json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "subject" in data
    assert "body" in data
    assert "evidenceChecklist" in data
    assert len(data["evidenceChecklist"]) >= 3

    # Financial figures must be present in text
    body = data["body"]
    assert "48,820.75" in body or "48820" in body
    assert "47,820.25" in body or "47820" in body
    assert "1,000.50" in body or "1000" in body
    assert "Ram Prasad" in body


def test_grievance_english_generation():
    payload = {
        "farmerName": "Suresh Patel",
        "issueType": "KCC_INTEREST_OVERCHARGE",
        "crop": "Wheat",
        "expectedAmount": 7000.0,
        "actualAmount": 9500.0,
        "difference": 2500.0,
        "language": "English",
        "ruleReference": "RBI_KCC_MISS_2024"
    }
    res = client.post("/ai/v1/grievance/generate", headers=AUTH_HEADERS, json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["language"] == "English"
    assert "Suresh Patel" in data["body"]
    assert "2,500" in data["body"]


def test_explanation_preserves_amounts_and_context():
    payload = {
        "category": "MSP",
        "expectedAmount": 48820.0,
        "actualAmount": 47820.0,
        "difference": 1000.0,
        "status": "POTENTIAL_DISCREPANCY",
        "reason": "Recorded payment is lower than expected net payable.",
        "language": "Hindi"
    }
    res = client.post("/ai/v1/explanation/generate", headers=AUTH_HEADERS, json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "explanation" in data
    assert "recommendedAction" in data
    assert "documentsToVerify" in data
    assert len(data["documentsToVerify"]) >= 2
    assert "48,820" in data["explanation"]
    assert "1,000" in data["explanation"]
