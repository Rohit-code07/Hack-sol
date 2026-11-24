# KisanSetu: End-to-End Database → API → Frontend Architecture Mapping

This document provides the definitive 8-tier architectural mapping for the **KisanSetu** platform:
`PostgreSQL Table` → `JPA Entity` → `Spring Data Repository` → `Service Layer` → `REST Controller` → `Endpoint Path & Method` → `React API Service` → `React UI Component`.

---

## Complete 8-Tier Architecture Matrix

| # | PostgreSQL Table | JPA Entity | Spring Data Repository | Service Layer | Spring Boot Controller | REST Endpoint & Method | React API Service | React UI Component |
|---|------------------|------------|------------------------|---------------|------------------------|------------------------|-------------------|-------------------|
| 1 | `users` | `User` | `UserRepository` | `AuthService` | `AuthController` | `POST /api/v1/auth/login` | `authApi.login` | `LoginPage.jsx` |
| 2 | `users`, `farmers` | `User`, `Farmer` | `UserRepository`, `FarmerRepository` | `AuthService` | `AuthController` | `POST /api/v1/auth/register` | `authApi.register` | `RegisterPage.jsx` |
| 3 | `farmers` | `Farmer` | `FarmerRepository` | `FarmerService` | `FarmerController` | `GET /api/v1/farmers/{farmerId}` | `farmerApi.getProfile` | `FarmerProfileModal.jsx`, `Header.jsx` |
| 4 | `farmers` | `Farmer` | `FarmerRepository` | `FarmerService` | `FarmerController` | `PUT /api/v1/farmers/{farmerId}` | `farmerApi.updateProfile` | `FarmerProfileModal.jsx` |
| 5 | `farmers`, `land_records`, `loan_records`, `discrepancies` | `Farmer`, `LandRecord`, `LoanRecord`, `Discrepancy` | `FarmerRepository`, `LandRecordRepository`, `LoanRecordRepository`, `DiscrepancyRepository` | `FarmerService` | `FarmerController` | `GET /api/v1/farmers/{farmerId}/dashboard` | `farmerApi.getDashboard` | `FarmerDashboard.jsx` |
| 6 | `land_records`, `land_ownership` | `LandRecord`, `LandOwnership` | `LandRecordRepository`, `LandOwnershipRepository` | `LandService` | `FarmerController` | `GET /api/v1/farmers/{farmerId}/land-records` | `farmerApi.getLandRecords` | `LandRecordsPage.jsx` |
| 7 | `loan_records`, `banks` | `LoanRecord`, `Bank` | `LoanRecordRepository` | `LoanService` | `FarmerController` | `GET /api/v1/farmers/{farmerId}/loans` | `farmerApi.getLoans` | `LoanLedgerPage.jsx` |
| 8 | `discrepancies` | `Discrepancy` | `DiscrepancyRepository` | `DiscrepancyService` | `FarmerController` | `GET /api/v1/farmers/{farmerId}/discrepancies` | `farmerApi.getDiscrepancies` | `DiscrepanciesPage.jsx` |
| 9 | `grievances` | `Grievance` | `GrievanceRepository` | `GrievanceService` | `FarmerController` | `GET /api/v1/farmers/{farmerId}/grievances` | `farmerApi.getGrievances` | `GrievanceHistoryPage.jsx` |
| 10 | `land_records`, `land_ownership` | `LandRecord`, `LandOwnership` | `LandRecordRepository`, `LandOwnershipRepository` | `LandService` | `LandController` | `POST /api/v1/land-records` | `landApi.create` | `LandRecordsPage.jsx` (Add Parcel Modal) |
| 11 | `land_records` | `LandRecord` | `LandRecordRepository` | `LandService` | `LandController` | `GET /api/v1/land-records/{id}` | `landApi.getById` | `LandRecordsPage.jsx` (Parcel Details Drawer) |
| 12 | `land_records` | `LandRecord` | `LandRecordRepository` | `LandService` | `LandController` | `GET /api/v1/land-records/search` | `landApi.search` | `LandVerificationPage.jsx` |
| 13 | `land_ownership`, `farmers` | `LandOwnership`, `Farmer` | `LandOwnershipRepository` | `LandService` | `LandController` | `GET /api/v1/land-records/{id}/ownership` | `landApi.getOwnership` | `LandRecordsPage.jsx`, `LandVerificationPage.jsx` |
| 14 | `mortgages`, `banks` | `Mortgage`, `Bank` | `MortgageRepository` | `LandService` | `LandController` | `GET /api/v1/land-records/{id}/mortgage` | `landApi.getMortgages` | `LandRecordsPage.jsx`, `LandVerificationPage.jsx` |
| 15 | `loan_records`, `banks` | `LoanRecord`, `Bank` | `LoanRecordRepository` | `LoanService` | `LoanController` | `POST /api/v1/loans` | `loanApi.create` | `LoanLedgerPage.jsx` |
| 16 | `loan_records`, `banks` | `LoanRecord`, `Bank` | `LoanRecordRepository` | `LoanService` | `LoanController` | `GET /api/v1/loans/{id}` | `loanApi.getById` | `LoanLedgerPage.jsx` |
| 17 | `loan_records` | `LoanRecord` | `LoanRecordRepository` | `LoanService` | `LoanController` | `GET /api/v1/loans/bank/{bankId}` | `loanApi.getByBank` | `BankDashboard.jsx` |
| 18 | `loan_transactions` | `LoanTransaction` | `LoanTransactionRepository` | `LoanService` | `LoanController` | `GET /api/v1/loans/{loanId}/transactions` | `loanApi.getTransactions` | `LoanLedgerPage.jsx` |
| 19 | `loan_transactions` | `LoanTransaction` | `LoanTransactionRepository` | `LoanService` | `LoanController` | `POST /api/v1/loans/{loanId}/transactions` | `loanApi.addTransaction` | `LoanLedgerPage.jsx` (Payment Modal) |
| 20 | `scheme_rules`, `entitlement_results` | `SchemeRule`, `EntitlementResult` | `SchemeRuleRepository`, `EntitlementResultRepository` | `KCCCalculator`, `EntitlementService` | `EntitlementController` | `POST /api/v1/entitlements/kcc/evaluate` | `entitlementApi.evaluateKcc` | `EntitlementCenter.jsx` (KCC Tab) |
| 21 | `msp_transactions`, `scheme_rules` | `MspTransaction`, `SchemeRule` | `MspTransactionRepository`, `SchemeRuleRepository` | `MSPCalculator`, `EntitlementService` | `EntitlementController` | `POST /api/v1/entitlements/msp/verify` | `entitlementApi.verifyMsp` | `EntitlementCenter.jsx` (MSP Tab) |
| 22 | `insurance_records`, `scheme_rules` | `InsuranceRecord`, `SchemeRule` | `InsuranceRecordRepository`, `SchemeRuleRepository` | `InsuranceCalculator`, `EntitlementService` | `EntitlementController` | `POST /api/v1/entitlements/insurance/reconcile` | `entitlementApi.reconcileInsurance` | `EntitlementCenter.jsx` (Insurance Tab) |
| 23 | `entitlement_results` | `EntitlementResult` | `EntitlementResultRepository` | `EntitlementService` | `EntitlementController` | `GET /api/v1/entitlements/farmer/{farmerId}` | `entitlementApi.getByFarmer` | `EntitlementCenter.jsx` |
| 24 | `entitlement_results` | `EntitlementResult` | `EntitlementResultRepository` | `EntitlementService` | `EntitlementController` | `GET /api/v1/entitlements/{id}` | `entitlementApi.getById` | `EntitlementCenter.jsx` |
| 25 | `discrepancies` | `Discrepancy` | `DiscrepancyRepository` | `DiscrepancyDetectionEngine`, `DiscrepancyService` | `DiscrepancyController` | `POST /api/v1/discrepancies/detect` | `discrepancyApi.detect` | `DiscrepanciesPage.jsx` |
| 26 | `discrepancies` | `Discrepancy` | `DiscrepancyRepository` | `DiscrepancyService` | `DiscrepancyController` | `GET /api/v1/discrepancies/{id}` | `discrepancyApi.getById` | `DiscrepanciesPage.jsx` |
| 27 | `discrepancies` | `Discrepancy` | `DiscrepancyRepository` | `DiscrepancyService` | `DiscrepancyController` | `GET /api/v1/discrepancies/farmer/{farmerId}` | `discrepancyApi.getByFarmer` | `DiscrepanciesPage.jsx` |
| 28 | `discrepancies` | `Discrepancy` | `DiscrepancyRepository` | `DiscrepancyService` | `DiscrepancyController` | `GET /api/v1/discrepancies` | `discrepancyApi.getAll` | `BankDashboard.jsx`, `ApplicationAuditPage.jsx` |
| 29 | `discrepancies` | `Discrepancy` | `DiscrepancyRepository` | `DiscrepancyService` | `DiscrepancyController` | `PUT /api/v1/discrepancies/{id}/status` | `discrepancyApi.updateStatus` | `DiscrepanciesPage.jsx`, `BankDashboard.jsx` |
| 30 | `grievances`, `discrepancies` | `Grievance`, `Discrepancy` | `GrievanceRepository`, `DiscrepancyRepository` | `GrievanceDraftingEngine`, `GrievanceService` | `GrievanceController` | `POST /api/v1/grievances/generate` | `grievanceApi.generate` | `DiscrepanciesPage.jsx`, `GrievanceHistoryPage.jsx` |
| 31 | `grievances` | `Grievance` | `GrievanceRepository` | `GrievanceService` | `GrievanceController` | `GET /api/v1/grievances/{id}` | `grievanceApi.getById` | `GrievanceHistoryPage.jsx` |
| 32 | `grievances` | `Grievance` | `GrievanceRepository` | `GrievanceService` | `GrievanceController` | `GET /api/v1/grievances/farmer/{farmerId}` | `grievanceApi.getByFarmer` | `GrievanceHistoryPage.jsx` |
| 33 | `grievances` | `Grievance` | `GrievanceRepository` | `PdfGenerationService`, `GrievanceService` | `GrievanceController` | `GET /api/v1/grievances/{id}/pdf` | `grievanceApi.downloadPdf` | `GrievanceHistoryPage.jsx` (Download PDF) |
| 34 | `farmers` | `Farmer` | `FarmerRepository` | `VerificationService` | `VerificationController` | `GET /api/v1/bank/farmers/search` | `bankApi.searchFarmers` | `FarmerSearchPage.jsx`, `BankDashboard.jsx` |
| 35 | `land_records` | `LandRecord` | `LandRecordRepository` | `LandVerificationService` | `VerificationController` | `GET /api/v1/bank/land/search` | `bankApi.searchLand` | `LandVerificationPage.jsx` |
| 36 | `loan_records`, `banks` | `LoanRecord`, `Bank` | `LoanRecordRepository` | `LoanVerificationService` | `VerificationController` | `GET /api/v1/bank/loan-history/{farmerId}` | `bankApi.getFarmerLoanHistory` | `ApplicationAuditPage.jsx`, `FarmerSearchPage.jsx` |
| 37 | `loan_records`, `land_records`, `mortgages` | `LoanRecord`, `LandRecord`, `Mortgage` | Multiple Repositories | `DuplicateDetectionService` | `VerificationController` | `POST /api/v1/bank/verify-application` | `bankApi.verifyApplication` | `LandVerificationPage.jsx`, `ApplicationAuditPage.jsx` |
| 38 | *In-Memory Report Cache* | `VerificationReportResponse` | N/A | `DuplicateDetectionService` | `VerificationController` | `GET /api/v1/bank/verification-reports/{reportId}` | `bankApi.getVerificationReport` | `ApplicationAuditPage.jsx` |

---

## Architectural Responsibility Boundaries

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                 REACT FRONTEND (Vite / SPA)                 │
  │     - UI rendering, forms, animations, data tables          │
  │     - Zero synthetic business databases / mock math         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ HTTP / JSON (JWT Bearer)
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              SPRING BOOT 3.3.5 / JAVA 21 BACKEND            │
  │     - Spring Security 6.3 JWT validation & role enforcement │
  │     - Entitlement Rule Engine (KCC MISS, MSP, PMFBY)        │
  │     - Bank Cross-Verification & Duplicate Financing Engine  │
  │     - OpenPDF generation with security timestamps           │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │ JPA / JDBC                   │ HTTP REST (X-AI-Service-Key)
                 ▼                              ▼
  ┌──────────────────────────────┐ ┌────────────────────────────┐
  │    POSTGRESQL 16 DATABASE    │ │      FASTAPI AI SERVICE    │
  │  - Single source of truth    │ │  - BGE-M3 + ChromaDB RAG   │
  │  - Seed records via Flyway   │ │  - Gemini LLM explanations │
  │  - ACID transaction safety   │ │  - Financial amounts kept  │
  │                              │ │    strictly immutable      │
  └──────────────────────────────┘ └────────────────────────────┘
```
