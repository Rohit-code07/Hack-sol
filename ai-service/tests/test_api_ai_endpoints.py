"""
Comprehensive tests for Section 10 API specifications:
- GET  /api/ai/health
- POST /api/ai/chat (Hindi, English, Hinglish)
- POST /api/ai/search
- POST /api/ai/grievance/generate
- POST /api/ai/discrepancy/explain
- GET  /api/ai/documents
- GET  /api/ai/documents/{id}/status
- Security and validation verification
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)
AUTH_HEADERS = {
    settings.API_KEY_HEADER_NAME: settings.AI_SERVICE_API_KEY
}


def test_api_ai_health():
    res = client.get("/api/ai/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["UP", "DEGRADED"]
    assert data["dependencies"]["chroma_vectorstore"]["total_chunks"] >= 400


def test_api_ai_chat_unauthorized():
    res = client.post("/api/ai/chat", json={"question": "KCC loan kya hai?"})
    assert res.status_code == 401


def test_api_ai_chat_hindi():
    res = client.post(
        "/api/ai/chat",
        headers=AUTH_HEADERS,
        json={
            "question": "खरीफ फसल के लिए कितना प्रीमियम देना होता है?",
            "language": "Hindi",
            "scheme": "PMFBY"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "answer" in data
    assert len(data["sources"]) >= 1
    # Check that citations are 1-indexed
    for s in data["sources"]:
        assert s["page"] >= 1


def test_api_ai_chat_english():
    res = client.post(
        "/api/ai/chat",
        headers=AUTH_HEADERS,
        json={
            "question": "What is the maximum interest rate on KCC crop loans?",
            "language": "English",
            "scheme": "KCC"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "answer" in data
    assert len(data["sources"]) >= 1


def test_api_ai_search():
    res = client.post(
        "/api/ai/search",
        headers=AUTH_HEADERS,
        json={
            "query": "Prompt Repayment Incentive 3%",
            "scheme": "KCC",
            "topK": 3
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data["results"]) >= 1
    assert data["results"][0]["page"] >= 1


def test_api_ai_grievance_generate():
    res = client.post(
        "/api/ai/grievance/generate",
        headers=AUTH_HEADERS,
        json={
            "farmerName": "Ramesh Kumar",
            "category": "MSP_PAYMENT_SHORTFALL",
            "crop": "Paddy",
            "expectedAmount": 100000.0,
            "actualAmount": 85000.0,
            "difference": 15000.0,
            "language": "Hindi",
            "ruleReference": "MSP 2026 Procurement Norms"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "subject" in data
    assert "body" in data
    assert "15,000" in data["body"]
    assert len(data["evidenceChecklist"]) >= 1


def test_api_ai_discrepancy_explain():
    res = client.post(
        "/api/ai/discrepancy/explain",
        headers=AUTH_HEADERS,
        json={
            "category": "KCC_INTEREST_RATE_MISMATCH",
            "expectedAmount": 100000.0,
            "actualAmount": 107000.0,
            "difference": 7000.0,
            "status": "POTENTIAL_DISCREPANCY",
            "reason": "Bank applied standard 11% commercial interest instead of subsidized 7%",
            "language": "Hindi"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "explanation" in data
    assert "recommendedAction" in data
    assert len(data["documentsToVerify"]) >= 1


def test_api_ai_documents_listing_and_status():
    res = client.get("/api/ai/documents", headers=AUTH_HEADERS)
    assert res.status_code == 200
    docs = res.json()
    assert len(docs) >= 1
    doc_id = docs[0]["document_id"]

    status_res = client.get(f"/api/ai/documents/{doc_id}/status", headers=AUTH_HEADERS)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "INDEXED"
    assert status_data["total_chunks"] >= 1
