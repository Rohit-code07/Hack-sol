# KisanSetu (किसान सेतु) – Agricultural Policy, Loan & Subsidy Transparency Platform

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-10-red.svg)](https://flywaydb.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Backend service for **KisanSetu**, an agricultural financial entitlement and verification system built for **Problem Statement GT-01 Option A**. 

KisanSetu empowers Indian farmers with deterministic clarity on their agricultural entitlements under government schemes (KCC Interest Subvention, CACP Minimum Support Prices, and PMFBY Crop Insurance), while providing lending banks with automated cross-verification tools to detect duplicate financing and land record discrepancies.

---

## 🌾 Core Features & Business Architecture

### 1. Deterministic Rule-Based Entitlement Engine (Zero-LLM Math)
All financial entitlements are calculated strictly using versioned rules loaded from PostgreSQL, never estimated by generative AI:
- **KCC Interest Subvention & Incentive Calculator (`KCCCalculator`)**: Evaluates borrower eligibility under the Modified Interest Subvention Scheme (MISS) across financial year rule versions (`v2023.1`, `v2024.1`). Calculates 2% subvention on loans up to ₹3,00,000 and 3% Prompt Repayment Incentive (PRI) for loans repaid within 365 days (yielding an effective interest rate of 4.00%). Detects interest overcharging and missed subventions.
- **MSP Payment Calculator (`MSPCalculator`)**: Verifies crop sale proceeds against CACP official Minimum Support Prices across marketing seasons (`KHARIF_2023`, `KHARIF_2024`, `RABI_2023`). Computes gross procurement (`Quantity × Applicable MSP`) minus documented deductions, and compares against actual bank deposits to detect underpayments.
- **Crop Insurance Sanctioned Payout Reconciliation (`InsuranceReconciliationCalculator`)**: Reconciles officially sanctioned PMFBY compensation orders against actual bank credit amounts. Flags shortfalls while returning `INSUFFICIENT_DATA` if sanction orders are missing (refusing to hallucinate claim payouts from insured values alone).

### 2. Bank Officer Land & Loan Cross-Verification
- **Composite Geographical Land Identity**: Guarantees land uniqueness using `State + District + Tehsil + Village + Khasra Number`, properly handling geographically distinct parcels sharing identical Khasra numbers (e.g., Khasra `104/1` in Arang/Raipur vs Patan/Durg).
- **Rule 1: Duplicate Financing Alert**: Detects when an active land parcel is pledged as collateral in multiple active loans across different financial institutions.
- **Rule 2: Ownership Mismatch Alert**: Validates loan applicant identity against official recorded titleholders in the land registry.
- **Rule 3: Undisclosed Prior Mortgage Alert**: Detects pre-existing active bank mortgages not disclosed in credit applications.
- **Rule 4: Area Mismatch Alert**: Alerts bank officers when proposed pledged acreage exceeds verified land title area.
- *Note:* Multi-loan alerts are flagged for manual investigation without automatic punitive loan cancellation.

### 3. Automated Discrepancy Detection & Grievance Generation
- Categorizes financial gaps into `LOAN_INTEREST_DISCREPANCY`, `MSP_PAYMENT_DISCREPANCY`, `INSURANCE_PAYOUT_DISCREPANCY`, `LAND_RECORD_MISMATCH`, and `POTENTIAL_DUPLICATE_FINANCING`.
- Generates official grievance representations in **Hindi** or **English** with exact recorded shortfalls, structured statutory reasoning, and suggested documentary evidence checklists.
- Exports formal petitions directly as downloadable, audit-ready **PDF documents** via OpenPDF.
- Integrates with an external Python FastAPI service for natural linguistic phrasing (Chhattisgarhi/Hindi) while maintaining Spring Boot as the uncompromised source of truth for all financial numbers.

### 4. Enterprise Security & Role-Based Authorization
- Stateless Spring Security with JWT (`jjwt 0.12.6`).
- Two distinct roles:
  - `FARMER`: Restricted to accessing and updating their own land records, loans, entitlements, and grievances.
  - `BANK_OFFICER`: Authorized to perform farmer searches, Khasra title lookups, loan exposure checks, and application risk verification reports.
- BCrypt password hashing.

---

## 🏛️ Project Directory Structure

```
Backend/
├── pom.xml                               # Maven Project Descriptor (Java 21, Spring Boot 3.3.5)
├── mvnw.cmd / mvnw                       # Maven Wrapper Executable
├── docker-compose.yml                    # PostgreSQL 16 container definition
├── .env.example                          # Environment variable template
├── src/
│   ├── main/
│   │   ├── java/com/kisansetu/
│   │   │   ├── KisanSetuApplication.java
│   │   │   ├── config/                   # SecurityConfig, JwtConfig, CorsConfig, WebClientConfig, OpenApiConfig
│   │   │   ├── auth/                     # JWT authentication, Login, Register, User entities
│   │   │   ├── farmer/                   # Farmer profiles, land portfolio, loan history, dashboard
│   │   │   ├── land/                     # Composite Khasra registry, Land ownership, Mortgages
│   │   │   ├── loan/                     # Agricultural crop loans, Collaterals, Transactions
│   │   │   ├── bank/                     # Synthetic bank branches and IFSC directory
│   │   │   ├── scheme/                   # Scheme rules (JSONB), MSP transactions, PMFBY insurance records
│   │   │   ├── entitlement/              # Deterministic Rule Engine, KCC, MSP, Insurance calculators
│   │   │   ├── verification/             # Bank officer cross-verification, Duplicate financing engine
│   │   │   ├── discrepancy/              # Automatic financial gap detection and classification
│   │   │   ├── grievance/                # Grievance petition drafting, PDF export service
│   │   │   ├── integration/ai/           # WebClient client for external Python FastAPI service
│   │   │   └── common/                   # Enums, ApiResponse, GlobalExceptionHandler, FinancialUtils
│   │   └── resources/
│   │       ├── application.yml           # Base application configuration
│   │       ├── application-dev.yml       # Dev profile settings
│   │       └── db/migration/
│   │           ├── V1__init_schema.sql   # Complete PostgreSQL schema (15 tables, indexes, constraints)
│   │           └── V2__seed_synthetic_data.sql # Synthetic demo data (31 farmers, 41 parcels, 35 loans, rules)
│   └── test/
│       ├── java/com/kisansetu/           # 30 JUnit 5 + Mockito tests covering all functional requirements
│       └── resources/
│           └── application-test.yml      # In-memory H2 PostgreSQL-compatible test configuration
```

---

## 🚀 Getting Started & Execution Instructions

### Prerequisites
- **Java Development Kit (JDK)**: Java 21 or higher
- **Docker & Docker Compose** (for running PostgreSQL), or a local PostgreSQL 16 instance

### 1. Database Setup with Docker Compose
To launch PostgreSQL with the default `kisansetu` database:
```bash
docker compose up -d
```
The database will be reachable at `localhost:5432` with username `postgres` and password `change_me`.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or set environment variables as needed:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kisansetu
DB_USERNAME=postgres
DB_PASSWORD=change_me
SERVER_PORT=8080
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
AI_SERVICE_BASE_URL=http://localhost:8000
```

### 3. Run Automated Tests
Execute the full JUnit 5 test suite:
```powershell
.\mvnw.cmd test
```
*Current test status: 30 tests run, 0 failures, 0 errors.*

### 4. Run the Application
Start the Spring Boot backend:
```powershell
.\mvnw.cmd spring-boot:run
```
Or package and execute the fat JAR:
```powershell
.\mvnw.cmd package -DskipTests
java -jar target/kisansetu-backend-1.0.0-SNAPSHOT.jar
```

Flyway will automatically execute migrations `V1__init_schema.sql` and `V2__seed_synthetic_data.sql` on startup, preparing all tables and sample datasets.

---

## 📖 API Documentation & Swagger UI

Once the application is running, access interactive OpenAPI 3.0 documentation:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI v3 JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 👥 Demo Credentials & Seed Scenarios

| User Role | Username | Password | Notes / Associated Profile |
| :--- | :--- | :--- | :--- |
| **FARMER** | `farmer_ramesh` | `password123` | Ramesh Kumar Patel (`a0000000-0000-0000-0000-000000000001`), Arang, Raipur |
| **FARMER** | `farmer_suresh` | `password123` | Suresh Chandra Verma (`a0000000-0000-0000-0000-000000000002`), Patan, Durg |
| **FARMER** | `farmer_anita` | `password123` | Anita Bai Sahu (`a0000000-0000-0000-0000-000000000003`), Kota, Bilaspur |
| **BANK_OFFICER** | `bank_officer_sharma` | `password123` | Authorized bank loan officer with full verification privileges |

### Pre-Seeded Verification Scenarios:
1. **Scenario 1: MSP Payment Discrepancy** (`MSP-ARNG-2023-001`)
   - Farmer: Ramesh Patel
   - 50 Quintals Paddy Grade-A @ ₹2,203 = ₹1,10,150. Documented deductions = ₹150.
   - Expected Net = ₹1,10,000. Actual payment received = ₹95,000 (Shortfall: ₹15,000).
2. **Scenario 2: Duplicate Financing Detection**
   - Land parcel ID `3` (Khasra `215/3`, Arang) is pledged in active Loan `1` (SBI) and active Loan `2` (CRGB).
   - Calling `/api/v1/bank/verify-application` on parcel `3` flags `DUPLICATE_FINANCING` with `CRITICAL` risk level.
3. **Scenario 3: Undisclosed Prior Mortgage**
   - Land parcel ID `3` has an active mortgage of ₹1,50,000 to SBI (`MORT-SBI-ARP-2022-001`).
   - If not declared in loan application, generates `MORTGAGE_ALERT`.
4. **Scenario 4: Crop Insurance Payout Shortfall** (`PMFBY-CG-2023-0001`)
   - Sanctioned Claim Order = ₹45,000. Actual bank payout = ₹30,000.
   - Reconciles to an underpayment of ₹15,000 and auto-generates discrepancy ID `2`.
5. **Scenario 5: Valid Transaction Baseline**
   - Farmer: Suresh Verma (`MSP-PATAN-2023-002`)
   - 40 Quintals Paddy Common @ ₹2,183 = ₹87,320. Deductions = ₹120. Actual = ₹87,200 (Matches `VERIFIED_MATCH`).

---

## 🔑 Key API Endpoints Reference

### Authentication
- `POST /api/v1/auth/login` – Authenticate with username and password, returns JWT token and role.
- `POST /api/v1/auth/register` – Register new user and automatically initialize profile.

### Farmer Operations
- `GET /api/v1/farmers/{farmerId}/dashboard` – Consolidated dashboard (land holdings, active credit, discrepancies, grievances).
- `GET /api/v1/farmers/{farmerId}/land-records` – Fetch farmer's registered land parcels.
- `GET /api/v1/farmers/{farmerId}/loans` – View loan facilities and repayment statuses.
- `GET /api/v1/farmers/{farmerId}/discrepancies` – View flagged financial gaps.
- `GET /api/v1/farmers/{farmerId}/grievances` – Retrieve grievance filing history.

### Entitlement Calculation Engine
- `POST /api/v1/entitlements/kcc/evaluate` – Deterministic calculation of KCC interest and prompt repayment incentives.
- `POST /api/v1/entitlements/msp/verify` – Verify crop sale against official CACP MSP rates.
- `POST /api/v1/entitlements/insurance/reconcile` – Reconcile sanctioned insurance compensation vs bank credit.
- `GET /api/v1/entitlements/farmer/{farmerId}` – Retrieve farmer's calculation audit logs.

### Bank Officer Verification (`ROLE_BANK_OFFICER`)
- `GET /api/v1/bank/farmers/search?query={term}` – Search farmers by name, phone, village, or district.
- `GET /api/v1/bank/land/search?state=...&district=...&khasraNumber=...` – Search land records by composite geographic criteria.
- `GET /api/v1/bank/loan-history/{farmerId}` – Inspect applicant agricultural debt exposure.
- `POST /api/v1/bank/verify-application` – Cross-verify application against duplicate loans, title ownership, mortgages, and acreage.
- `GET /api/v1/bank/verification-reports/{reportId}` – Retrieve verification report and audit recommendations.

### Discrepancy & Grievance Generation
- `POST /api/v1/discrepancies/detect` – Scan records to detect underpayments and interest overcharges.
- `POST /api/v1/grievances/generate` – Generate structured grievance petition in Hindi/English from a discrepancy.
- `GET /api/v1/grievances/{id}/pdf` – Download formal grievance application as a PDF document.
