# KisanSetu (किसान सेतु) – Frontend-Backend API Mapping Documentation

**Document Version:** 1.0.0  
**Backend Base URL:** `http://localhost:8080/api/v1`  
**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`  
**OpenAPI v3 JSON:** `http://localhost:8080/v3/api-docs`  

---

## 1. Overview & Standard Envelope

All Spring Boot REST endpoints return responses wrapped in a uniform response envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-11-23T02:13:45.123"
}
```

Protected endpoints require standard JWT Bearer Authorization header:
```http
Authorization: Bearer <jwt_token>
```

---

## 2. Pre-Seeded Demo Credentials

| Role | Username | Password | Linked Farmer UUID / Note |
|---|---|---|---|
| **FARMER** | `farmer_ramesh` | `password123` | `a0000000-0000-0000-0000-000000000001` (Ramesh Kumar Patel, Arang, Raipur) |
| **FARMER** | `farmer_suresh` | `password123` | `a0000000-0000-0000-0000-000000000002` (Suresh Chandra Verma, Patan, Durg) |
| **FARMER** | `farmer_anita` | `password123` | `a0000000-0000-0000-0000-000000000003` (Anita Bai Sahu, Kota, Bilaspur) |
| **BANK_OFFICER** | `bank_officer_sharma` | `password123` | State Bank of India officer |

---

## 3. Comprehensive Endpoint Mapping Table

| Feature / Domain | HTTP Method & Endpoint | Request Structure | Response Structure (`data`) | Auth Requirement | Frontend Component / Hook | Integration Status & Notes |
|---|---|---|---|---|---|---|
| **User Login** | `POST /api/v1/auth/login` | `{ "username": "...", "password": "..." }` | `{ "token": "...", "type": "Bearer", "username": "...", "role": "FARMER" \| "BANK_OFFICER", "farmerId": "UUID" }` | Public | `LoginPage.jsx`, `authService.login()` | Connected. Replaces old mock role-only login. |
| **User Registration** | `POST /api/v1/auth/register` | `{ "username": "...", "password": "...", "role": "FARMER", "farmerName": "...", "mobileNumber": "...", "village": "...", "tehsil": "...", "district": "...", "state": "...", "preferredLanguage": "hi" }` | `{ "token": "...", "type": "Bearer", "username": "...", "role": "FARMER", "farmerId": "UUID" }` | Public | `RegisterPage.jsx`, `authService.register()` | Connected. Creates both User entity and Farmer entity. |
| **Farmer Profile** | `GET /api/v1/farmers/{farmerId}` | None | `{ "id": "UUID", "farmerName": "...", "mobileNumber": "...", "village": "...", "tehsil": "...", "district": "...", "state": "...", "preferredLanguage": "hi" }` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `FarmerProfileCard.jsx`, `FarmerLayout.jsx`, `useAuth.js` | Connected. |
| **Farmer Dashboard** | `GET /api/v1/farmers/{farmerId}/dashboard` | None | `{ "profile": {...}, "totalLandParcels": 3, "totalLandAreaInAcres": 7.5, "activeLoansCount": 3, "totalDisbursedLoanAmount": 450000.0, "detectedDiscrepanciesCount": 3, "totalDiscrepancyDifferenceAmount": 30000.0, "recentDiscrepancies": [...] }` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `FarmerDashboard.jsx`, `farmerService.getDashboard()` | Connected. Feeds summary metrics directly. |
| **Farmer Land Records** | `GET /api/v1/farmers/{farmerId}/land-records` | None | `[ { "id": 1, "khasraNumber": "104/1", "village": "Arang", "tehsil": "Arang", "district": "Raipur", "state": "Chhattisgarh", "landArea": 2.5, "areaUnit": "ACRES", "ownershipStatus": "INDIVIDUAL", "ownershipPercentage": 100.0, "mortgages": [...] } ]` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `LandRecordsPage.jsx`, `farmerService.getFarmerLandRecords()` | Connected. |
| **Farmer Loans** | `GET /api/v1/farmers/{farmerId}/loans` | None | `[ { "id": 1, "bankName": "...", "branchName": "...", "loanAccountReference": "...", "loanType": "KCC_CROP_LOAN", "sanctionedAmount": 150000.0, "disbursedAmount": 150000.0, "interestRate": 7.0, "disbursementDate": "...", "maturityDate": "...", "repaymentStatus": "CLOSED", "collaterals": [...] } ]` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `LoanLedgerPage.jsx`, `farmerService.getFarmerLoans()` | Connected. |
| **Loan Transactions** | `GET /api/v1/loans/{loanId}/transactions` | None | `[ { "id": 1, "loanId": 1, "transactionType": "REPAYMENT", "amount": 208000.0, "transactionDate": "...", "referenceNumber": "...", "description": "..." } ]` | Authenticated | `LoanLedgerPage.jsx`, `loanService.getTransactions()` | Connected. Shows repayments and interest subventions. |
| **KCC Interest Subvention Evaluation** | `POST /api/v1/entitlements/kcc/evaluate` | `{ "farmerId": "UUID", "loanId": 1, "loanAmount": 150000.0, "loanType": "KCC_CROP_LOAN", "disbursementDate": "...", "repaymentDate": "...", "repaymentStatus": "CLOSED", "actualInterestCharged": 10500.0 }` | `{ "applicableScheme": "...", "ruleVersion": "v2023.1", "eligibilityStatus": "DISCREPANCY_DETECTED", "expectedAmount": 6000.0, "actualAmount": 10500.0, "differenceAmount": 4500.0, "explanation": "...", "breakdown": { "baseInterestRate": "7.00%", "promptRepaymentIncentive": "3.00%", "effectivePromptRate": "4.00%", "promptEligible": "true", "overcharge": "4500.00" } }` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `KCCCalculatorTab.jsx`, `entitlementService.evaluateKcc()` | Connected. Evaluates 2% subvention + 3% PRI. |
| **MSP Mandi Payout Verification** | `POST /api/v1/entitlements/msp/verify` | `{ "farmerId": "UUID", "crop": "PADDY_GRADE_A", "cropGrade": "GRADE_A", "marketingSeason": "KHARIF_2023", "acceptedQuantity": 50.0, "quantityUnit": "QUINTAL", "procurementCenter": "...", "documentedDeductions": 150.0, "actualPayment": 95000.0, "receiptReference": "..." }` | `{ "applicableScheme": "...", "ruleVersion": "v2023.1", "eligibilityStatus": "DISCREPANCY_DETECTED", "expectedAmount": 110000.0, "actualAmount": 95000.0, "differenceAmount": 15000.0, "explanation": "...", "breakdown": { "officialMspPerQuintal": "2203.00", "grossProcurementAmount": "110150.00", "documentedDeductions": "150.00", "expectedNetPayment": "110000.00", "actualReceived": "95000.00", "underpaymentShortfall": "15000.00" } }` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `MSPVerifierTab.jsx`, `entitlementService.verifyMsp()` | Connected. Deterministic CACP MSP calculation. |
| **PMFBY Insurance Claim Reconciliation** | `POST /api/v1/entitlements/insurance/reconcile` | `{ "farmerId": "UUID", "insurancePolicyNumber": "...", "crop": "Paddy", "season": "KHARIF_2023", "sanctionedClaimAmount": 45000.0, "actualPayout": 30000.0 }` | `{ "applicableScheme": "...", "eligibilityStatus": "DISCREPANCY_DETECTED", "expectedAmount": 45000.0, "actualAmount": 30000.0, "differenceAmount": 15000.0, "explanation": "...", "breakdown": { "sanctionedAmount": "45000.00", "disbursedAmount": "30000.00", "unpaidClaimBalance": "15000.00" } }` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `InsuranceReconcilerTab.jsx`, `entitlementService.reconcileInsurance()` | Connected. Handles partial claim payouts & flags shortfalls. |
| **Farmer Entitlements History** | `GET /api/v1/entitlements/farmer/{farmerId}` | None | `[ { "id": 1, "schemeType": "...", ... } ]` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `EntitlementCenter.jsx`, `entitlementService.getEntitlementsByFarmer()` | Connected. |
| **Detect Farmer Discrepancies** | `POST /api/v1/discrepancies/detect` | `{ "farmerId": "UUID" }` | `[ { "id": 1, "category": "MSP_PAYMENT_DISCREPANCY", "severity": "HIGH", "expectedValue": 110000.0, "actualValue": 95000.0, "differenceAmount": 15000.0, "status": "OPEN", "description": "..." } ]` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `DiscrepanciesPage.jsx`, `discrepancyService.detect()` | Connected. Scans and creates persistent discrepancies. |
| **List Farmer Discrepancies** | `GET /api/v1/discrepancies/farmer/{farmerId}` | None | `[ { "id": 1, "category": "...", "severity": "...", "differenceAmount": 15000.0, "status": "OPEN", ... } ]` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `DiscrepanciesPage.jsx`, `discrepancyService.getFarmerDiscrepancies()` | Connected. |
| **Generate Grievance Petition** | `POST /api/v1/grievances/generate` | `{ "farmerId": "UUID", "discrepancyId": 1, "language": "hi", "additionalNotes": "..." }` | `{ "id": 1, "farmerId": "UUID", "discrepancyId": 1, "subject": "...", "grievanceContent": "...", "language": "hi", "recordedDifferenceAmount": 15000.0, "evidenceChecklist": [ "Mandi Weighment Receipt", ... ], "status": "DRAFTED" }` | `ROLE_FARMER` (own) | `GrievanceHistoryPage.jsx`, `GrievanceModal.jsx`, `grievanceService.generate()` | Connected. Deterministic & AI-assisted petition in Hindi/English. |
| **Farmer Grievance History** | `GET /api/v1/grievances/farmer/{farmerId}` | None | `[ { "id": 1, "subject": "...", "status": "DRAFTED", "language": "hi", "createdAt": "..." } ]` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `GrievanceHistoryPage.jsx`, `grievanceService.getByFarmer()` | Connected. |
| **Download Grievance PDF** | `GET /api/v1/grievances/{id}/pdf` | None (Binary stream) | `application/pdf` binary stream | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `GrievanceHistoryPage.jsx`, `grievanceService.downloadPdf()` | Connected. Handles Blob response directly with file download. |
| **Bank Search Farmers** | `GET /api/v1/bank/farmers/search?query=...` | Query param `query` | `[ { "id": "UUID", "farmerName": "...", "mobileNumber": "...", "village": "...", "district": "..." } ]` | `ROLE_BANK_OFFICER` | `FarmerSearchPage.jsx`, `bankService.searchFarmers()` | Connected. |
| **Bank Land Cadastre Search** | `GET /api/v1/bank/land/search?state=...&district=...&tehsil=...&village=...&khasraNumber=...` | Query params | `[ { "id": 1, "khasraNumber": "...", "village": "...", "tehsil": "...", "district": "...", "state": "...", "landArea": 2.5, "ownershipStatus": "INDIVIDUAL", ... } ]` | `ROLE_BANK_OFFICER` | `LandVerificationPage.jsx`, `bankService.searchLand()` | Connected. Composite geographic identity search. |
| **Bank Farmer Loan Exposure** | `GET /api/v1/bank/loan-history/{farmerId}` | None | `[ { "id": 1, "bankName": "...", "loanAccountReference": "...", "sanctionedAmount": 150000.0, ... } ]` | `ROLE_BANK_OFFICER` | `ApplicationAuditPage.jsx`, `bankService.getLoanHistory()` | Connected. Multi-bank exposure check. |
| **Bank Application Cross-Verification** | `POST /api/v1/bank/verify-application` | `{ "farmerId": "UUID", "landRecordIds": [3], "requestedLoanAmount": 200000.0, "proposedPledgedArea": 3.2, "declaredExistingMortgage": false }` | `{ "reportId": "VR-24B71264", "riskLevel": "CRITICAL", "hasDuplicateFinancing": true, "hasMortgageAlert": true, "hasAreaMismatch": false, "hasOwnershipMismatch": false, "activeLoansFound": 3, "alerts": [ { "alertType": "DUPLICATE_FINANCING", "severity": "CRITICAL", "alertTitle": "...", "description": "..." } ] }` | `ROLE_BANK_OFFICER` | `ApplicationAuditPage.jsx`, `bankService.verifyApplication()` | Connected. Multi-rule audit: Duplicate financing, Undisclosed mortgage, Area & Ownership mismatches. |
| **Bank Verification Report Lookup** | `GET /api/v1/bank/verification-reports/{reportId}` | None | `{ "reportId": "VR-24B71264", "riskLevel": "CRITICAL", ... }` | `ROLE_BANK_OFFICER` | `ApplicationAuditPage.jsx`, `bankService.getReport()` | Connected. |

---

## 4. Backend Dependencies & External Integrations

- **External AI Service (`AI_SERVICE_BASE_URL` - default `http://localhost:8000`)**:
  - The Spring Boot backend interacts with this service asynchronously via WebClient when generating enhanced Hindi/Chhattisgarhi phrasing for grievances.
  - If the AI service is not running, Spring Boot safely falls back to deterministic bilingual templates without failing.
- **Mock Fallback Flag (`VITE_USE_MOCK_API`)**:
  - Setting `VITE_USE_MOCK_API=true` allows offline UI evaluation with pre-seeded demonstration data.
  - Setting `VITE_USE_MOCK_API=false` connects directly to Spring Boot at `http://localhost:8080/api/v1`.
