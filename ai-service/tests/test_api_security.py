"""
Security and Health Endpoint Tests for KisanSetu AI Service.
Verifies non-blocking startup without Gemini key, header authentication, and error validation.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)
AUTH_HEADERS = {settings.API_KEY_HEADER_NAME: settings.AI_SERVICE_API_KEY}


def test_health_endpoint_available_without_gemini():
    """Verifies that /health is UP and returns component status even without Gemini key."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["UP", "DEGRADED"]
    assert "dependencies" in data
    assert "gemini_llm" in data["dependencies"]
    assert "chroma_vectorstore" in data["dependencies"]
    assert data["dependencies"]["embedding_model"]["dimension"] in [384, 768, 1024]


def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "service" in data
    assert data["docs_url"] == "/docs"


def test_unauthorized_access_rejected():
    """Calls without the internal service key must be rejected with 401."""
    endpoints = [
        ("/ai/v1/policy/ask", {"question": "KCC par interest kitna hai?"}),
        ("/ai/v1/grievance/generate", {"farmerName": "Test", "issueType": "MSP"}),
        ("/ai/v1/explanation/generate", {"category": "MSP", "status": "POTENTIAL_DISCREPANCY"}),
        ("/ai/v1/policy/documents", None)
    ]
    for endpoint, payload in endpoints:
        if payload is not None:
            res = client.post(endpoint, json=payload)
        else:
            res = client.get(endpoint)
        assert res.status_code == 401, f"Endpoint {endpoint} allowed unauthorized access"


def test_invalid_api_key_rejected():
    """Calls with wrong key must be rejected with 401."""
    bad_headers = {settings.API_KEY_HEADER_NAME: "wrong-key"}
    res = client.post(
        "/ai/v1/grievance/generate",
        headers=bad_headers,
        json={"farmerName": "Test", "issueType": "MSP"}
    )
    assert res.status_code == 401


def test_invalid_json_validation():
    """Malformed request payload must return 422 Unprocessable Content."""
    res = client.post(
        "/ai/v1/grievance/generate",
        headers=AUTH_HEADERS,
        json={"wrongField": 123}
    )
    assert res.status_code == 422
