# KisanSetu AI Service

Production-grade Python AI Service for **KisanSetu**, integrating an Enterprise RAG System upgraded with **BAAI/bge-m3** multilingual embeddings, ChromaDB vector store, Google Gemini LLM, formal administrative grievance generation, and farmer-friendly discrepancy explanations.

---

## 🌾 Architecture & Responsibility Boundaries

KisanSetu adheres strictly to a **Modular Monolith (Java 21 + Spring Boot) + Python AI Service (FastAPI)** architecture:

```text
       REACT FRONTEND
              │
              ▼
    SPRING BOOT BACKEND
              │ (Financial single-source-of-truth: KCC limits, MSP payouts, PMFBY reconciliation)
              │
              ▼ REST (Protected by X-AI-Service-Key)
      PYTHON AI SERVICE (FastAPI)
              │
     ┌────────┼────────┐
     ▼        ▼        ▼
Policy RAG  Gemini  Grievance & Explanation
 (BGE-M3 +   LLM     (Deterministic Fallback)
 ChromaDB)
```

### Critical Architectural Rules
1. **Financial Immutability**: The Java Spring Boot backend is the sole authority for financial calculations and farmer entitlements. The Python service **never** recalculates, rounds, or alters any financial figure. Figures from Java are preserved verbatim.
2. **Database Isolation**: PostgreSQL belongs exclusively to Spring Boot. ChromaDB is used strictly for agricultural policy document vector indexing (`kisansetu_policy_bge_m3`).
3. **No Direct Frontend Access**: React communicates exclusively with Spring Boot. Python endpoints are secured by `X-AI-Service-Key`.

---

## 🚀 Key Features

### 1. Government Policy RAG (`POST /ai/v1/policy/ask`)
- **Multilingual Support**: Supports queries in Hindi, English, and Hinglish.
- **Dense Embeddings**: Employs `BAAI/bge-m3` generating 1024-dimensional normalized dense vectors.
- **MMR Retrieval**: Maximal Marginal Relevance retrieval ensures diverse, relevant chunks ($k=5$, $\text{fetch\_k}=20$, $\lambda=0.5$).
- **Strict Anti-Hallucination**: Grounded answering instructions prevent hallucination. Returns `INSUFFICIENT_EVIDENCE` with official refusal if documents lack supporting context.
- **Exact Citations**: 1-indexed human-readable page citations without double-increment bugs.

### 2. Grievance Generator (`POST /ai/v1/grievance/generate`)
- Consumes structured discrepancy data from Spring Boot (`farmerName`, `issueType`, `crop`, `expectedAmount`, `actualAmount`, `difference`, `ruleReference`).
- Drafts dignified, formal petitions addressed to competent authorities (Mandi Secretary, Bank Branch Manager, District Agriculture Officer).
- Includes an actionable **evidence checklist** for the farmer.
- **Deterministic Fallback**: If Gemini is unconfigured or rate-limited, immediately generates a legally sound fallback draft.

### 3. Discrepancy Explanation (`POST /ai/v1/explanation/generate`)
- Explains calculation breakdowns and status (`POTENTIAL_DISCREPANCY`) in simple, compassionate farmer language.
- Recommends concrete next steps and documents to verify without altering underlying calculations.

---

## 🛠️ Environment Configuration

Create a `.env` file in `ai-service/kisansetu-ai-service/`:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Shared Authentication with Spring Boot
AI_SERVICE_API_KEY=kisansetu-secret-key

# ChromaDB & Vector Store
CHROMA_PERSIST_DIRECTORY=./chroma_db
CHROMA_COLLECTION_NAME=kisansetu_policy_bge_m3

# Multilingual Embeddings
BGE_M3_MODEL=BAAI/bge-m3
EMBEDDING_DEVICE=cpu

# Retrieval Parameters (MMR)
RETRIEVER_K=5
RETRIEVER_FETCH_K=20
RETRIEVER_LAMBDA_MULT=0.5
MAX_DISTANCE_THRESHOLD=1.2
```

> **Note**: The service starts cleanly even if `GEMINI_API_KEY` is not provided. `/health` reports application readiness, and grievance/explanation endpoints operate using deterministic fallback templates.

---

## 🏃 How to Run the Service

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Start the FastAPI Server
```powershell
cd ai-service\kisansetu-ai-service
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive OpenAPI documentation will be accessible at `http://localhost:8000/docs`.

---

## 📡 API Endpoints Reference

### 1. Health Check
- **`GET /health`**
- Returns service status and component readiness (`gemini_llm`, `chroma_vectorstore`, `embedding_model`).

### 2. Policy RAG
- **`POST /ai/v1/policy/ask`**
- **Header**: `X-AI-Service-Key: kisansetu-secret-key`
- **Request**:
```json
{
  "question": "PMFBY योजना के अंतर्गत खरीफ और रबी फसलों के लिए कितना प्रीमियम देना होता है?",
  "language": "hi",
  "scheme": "PMFBY"
}
```
- **Response**:
```json
{
  "answer": "प्रधानमंत्री फसल बीमा योजना (PMFBY) के तहत किसानों द्वारा देय अधिकतम प्रीमियम खरीफ फसलों के लिए 2% और रबी खाद्य एवं तिलहन फसलों के लिए 1.5% है। वाणिज्यिक/बागवानी फसलों के लिए यह 5% है।",
  "sources": [
    {
      "document": "PMFBY_Revised_Operational_Guidelines.pdf",
      "page": 16,
      "scheme": "PMFBY",
      "authority": "Ministry of Agriculture & Farmers Welfare, Government of India"
    }
  ],
  "confidence": "RETRIEVAL_SUPPORTED",
  "language": "hi"
}
```

### 3. Grievance Generation
- **`POST /ai/v1/grievance/generate`**
- **Header**: `X-AI-Service-Key: kisansetu-secret-key`
- **Request**:
```json
{
  "farmerName": "Ram Prasad",
  "issueType": "MSP_PAYMENT_DISCREPANCY",
  "crop": "Paddy",
  "expectedAmount": 48820.00,
  "actualAmount": 47820.00,
  "difference": 1000.00,
  "language": "Hindi",
  "ruleReference": "MSP_KMS_2026_27"
}
```

### 4. Discrepancy Explanation
- **`POST /ai/v1/explanation/generate`**
- **Header**: `X-AI-Service-Key: kisansetu-secret-key`
- **Request**:
```json
{
  "category": "MSP",
  "expectedAmount": 48820.00,
  "actualAmount": 47820.00,
  "difference": 1000.00,
  "status": "POTENTIAL_DISCREPANCY",
  "reason": "Recorded payment is lower than expected net payable.",
  "language": "Hindi"
}
```

### 5. Document Administration
- **`POST /ai/v1/policy/documents`**: Upload and index an official government PDF.
- **`POST /ai/v1/policy/documents/preview`**: Preview first 5 chunks without persisting.
- **`GET /ai/v1/policy/documents`**: List indexed policy documents and chunk counts.
- **`DELETE /ai/v1/policy/documents/{document_id}`**: Delete document from vector database.

---

## 🧪 Running Automated Tests

Run the full automated test suite:
```powershell
pytest ai-service/kisansetu-ai-service/tests/ -v
```
