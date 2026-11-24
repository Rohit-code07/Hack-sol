# KisanSetu (किसान सेतु) – API Integration Mapping

**Version:** 1.0.0  
**Backend Base URL:** `http://localhost:8080/api/v1`  
**Frontend App Directory:** `kisansetuFrontend`  
**Standard Response Envelope:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-11-23T02:13:45.123"
}
```

---

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Request DTO | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `AuthRequest` (`username`, `password`) | `AuthResponse` (`token`, `tokenType`, `userId`, `username`, `role`, `farmerId`) | Public | `LoginPage.jsx` / `authApi.ts` / `AuthContext.jsx` |
| `POST` | `/api/v1/auth/register` | `RegisterRequest` (`username`, `password`, `role`, `farmerName`, `mobileNumber`, `village`, `tehsil`, `district`, `state`, `preferredLanguage`) | `AuthResponse` (`token`, `tokenType`, `userId`, `username`, `role`, `farmerId`) | Public | `RegisterPage.jsx` / `authApi.ts` |

---

## 2. Farmer Endpoints (`/api/v1/farmers`)

| Method | Endpoint | Request DTO | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `POST` | `/api/v1/farmers` | `FarmerRequest` | `FarmerResponse` | Authenticated | `FarmerRegistration` / `farmerApi.ts` |
| `GET` | `/api/v1/farmers/{farmerId}` | Path: `farmerId` (UUID) | `FarmerResponse` (`id`, `farmerName`, `mobileNumber`, `village`, `tehsil`, `district`, `state`, `preferredLanguage`) | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `FarmerLayout.jsx`, `FarmerDashboard.jsx` / `farmerApi.ts` |
| `PUT` | `/api/v1/farmers/{farmerId}` | Path: `farmerId` (UUID), `FarmerRequest` | `FarmerResponse` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | Profile Editor / `farmerApi.ts` |
| `GET` | `/api/v1/farmers/{farmerId}/dashboard` | Path: `farmerId` (UUID) | `FarmerDashboardResponse` (`profile`, `totalLandParcels`, `totalLandAreaInAcres`, `activeLoansCount`, `totalDisbursedLoanAmount`, `detectedDiscrepanciesCount`, `totalDiscrepancyDifferenceAmount`, `recentDiscrepancies`) | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `FarmerDashboard.jsx` / `farmerApi.ts` |
| `GET` | `/api/v1/farmers/{farmerId}/land-records` | Path: `farmerId` (UUID) | `List<LandRecordResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `LandRecordsPage.jsx` / `farmerApi.ts`, `landApi.ts` |
| `GET` | `/api/v1/farmers/{farmerId}/loans` | Path: `farmerId` (UUID) | `List<LoanRecordResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `LoanLedgerPage.jsx` / `loanApi.ts` |
| `GET` | `/api/v1/farmers/{farmerId}/discrepancies` | Path: `farmerId` (UUID) | `List<DiscrepancyResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `DiscrepanciesPage.jsx` / `discrepancyApi.ts` |
| `GET` | `/api/v1/farmers/{farmerId}/grievances` | Path: `farmerId` (UUID) | `List<GrievanceResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `GrievanceHistoryPage.jsx` / `grievanceApi.ts` |

---

## 3. Land Registry Endpoints (`/api/v1/land-records`)

| Method | Endpoint | Request DTO | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `POST` | `/api/v1/land-records` | `LandRecordRequest` | `LandRecordResponse` | `ROLE_FARMER` or `ROLE_BANK_OFFICER` | Land Parcel Form / `landApi.ts` |
| `GET` | `/api/v1/land-records/{id}` | Path: `id` (Long) | `LandRecordResponse` | Authenticated | `LandRecordsPage.jsx` / `landApi.ts` |
| `GET` | `/api/v1/land-records/search` | Query: `state`, `district`, `tehsil`, `village`, `khasraNumber` | `List<LandRecordResponse>` | Authenticated | `LandVerificationPage.jsx` / `landApi.ts` |
| `GET` | `/api/v1/land-records/farmer/{farmerId}` | Path: `farmerId` (UUID) | `List<LandRecordResponse>` | Authenticated | `LandRecordsPage.jsx` / `landApi.ts` |
| `GET` | `/api/v1/land-records/{id}/ownership` | Path: `id` (Long) | `List<LandOwnershipResponse>` | Authenticated | `LandRecordsPage.jsx` / `landApi.ts` |
| `GET` | `/api/v1/land-records/{id}/mortgage` | Path: `id` (Long) | `List<MortgageResponse>` | Authenticated | `LandRecordsPage.jsx` / `landApi.ts` |

---

## 4. Agricultural Loan Endpoints (`/api/v1/loans`)

| Method | Endpoint | Request DTO | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `POST` | `/api/v1/loans` | `LoanRecordRequest` | `LoanRecordResponse` | `ROLE_BANK_OFFICER` | Loan Creation Form / `loanApi.ts` |
| `GET` | `/api/v1/loans/{loanId}` | Path: `loanId` (Long) | `LoanRecordResponse` | Authenticated | `LoanLedgerPage.jsx` / `loanApi.ts` |
| `GET` | `/api/v1/loans/farmer/{farmerId}` | Path: `farmerId` (UUID) | `List<LoanRecordResponse>` | Authenticated | `LoanLedgerPage.jsx` / `loanApi.ts` |
| `GET` | `/api/v1/loans/bank/{bankId}` | Path: `bankId` (Long) | `List<LoanRecordResponse>` | `ROLE_BANK_OFFICER` | Bank Loan List / `loanApi.ts` |
| `GET` | `/api/v1/loans/{loanId}/transactions` | Path: `loanId` (Long) | `List<LoanTransactionResponse>` | Authenticated | `LoanLedgerPage.jsx` (Transaction Drawer) / `loanApi.ts` |
| `POST` | `/api/v1/loans/{loanId}/transactions` | Path: `loanId` (Long), `LoanTransactionRequest` | `LoanTransactionResponse` | `ROLE_BANK_OFFICER` | Transaction Form / `loanApi.ts` |

---

## 5. Entitlement Rule Engine Endpoints (`/api/v1/entitlements`)

| Method | Endpoint | Request DTO | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `POST` | `/api/v1/entitlements/kcc/evaluate` | `KccEvaluationRequest` (`farmerId`, `loanId`, `loanAmount`, `loanType`, `disbursementDate`, `repaymentDate`, `repaymentStatus`, `applicableSchemeYear`, `actualInterestCharged`) | `EntitlementCalculationResponse` (`applicableScheme`, `ruleVersion`, `eligibilityStatus`, `expectedAmount`, `actualAmount`, `differenceAmount`, `explanation`, `calculationBreakdown`) | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `KCCCalculatorTab.jsx` / `entitlementApi.ts` |
| `POST` | `/api/v1/entitlements/msp/verify` | `MspVerificationRequest` (`farmerId`, `crop`, `cropGrade`, `marketingSeason`, `acceptedQuantity`, `quantityUnit`, `procurementCenter`, `applicableMsp`, `actualPayment`, `documentedDeductions`, `transactionDate`, `receiptReference`) | `EntitlementCalculationResponse` (`applicableScheme`, `ruleVersion`, `eligibilityStatus`, `expectedAmount`, `actualAmount`, `differenceAmount`, `explanation`, `calculationBreakdown`) | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `MSPVerifierTab.jsx` / `entitlementApi.ts` |
| `POST` | `/api/v1/entitlements/insurance/reconcile` | `InsuranceReconciliationRequest` (`farmerId`, `insurancePolicyNumber`, `crop`, `season`, `sanctionedClaimAmount`, `actualPayout`, `claimDate`, `paymentDate`) | `EntitlementCalculationResponse` (`applicableScheme`, `eligibilityStatus`, `expectedAmount`, `actualAmount`, `differenceAmount`, `explanation`, `calculationBreakdown`) | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `InsuranceReconcilerTab.jsx` / `entitlementApi.ts` |
| `GET` | `/api/v1/entitlements/farmer/{farmerId}` | Path: `farmerId` (UUID) | `List<EntitlementCalculationResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `EntitlementCenter.jsx` / `entitlementApi.ts` |
| `GET` | `/api/v1/entitlements/{resultId}` | Path: `resultId` (Long) | `EntitlementCalculationResponse` | Authenticated | Entitlement Detail / `entitlementApi.ts` |

---

## 6. Discrepancy Detection Endpoints (`/api/v1/discrepancies`)

| Method | Endpoint | Request DTO | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `POST` | `/api/v1/discrepancies/detect` | `DiscrepancyDetectionRequest` (`farmerId`) | `List<DiscrepancyResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `DiscrepanciesPage.jsx` ("Scan" action) / `discrepancyApi.ts` |
| `GET` | `/api/v1/discrepancies/{id}` | Path: `id` (Long) | `DiscrepancyResponse` | Authenticated | Discrepancy Detail Modal / `discrepancyApi.ts` |
| `GET` | `/api/v1/discrepancies/farmer/{farmerId}` | Path: `farmerId` (UUID) | `List<DiscrepancyResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `DiscrepanciesPage.jsx`, `FarmerDashboard.jsx` / `discrepancyApi.ts` |
| `GET` | `/api/v1/discrepancies` | None | `List<DiscrepancyResponse>` | `ROLE_BANK_OFFICER` | System Audit / `discrepancyApi.ts` |

---

## 7. Grievance Management Endpoints (`/api/v1/grievances`)

| Method | Endpoint | Request DTO | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `POST` | `/api/v1/grievances/generate` | `GrievanceGenerateRequest` (`farmerId`, `discrepancyId`, `language`, `additionalNotes`) | `GrievanceResponse` (`id`, `farmerId`, `discrepancyId`, `subject`, `grievanceContent`, `language`, `recordedDifferenceAmount`, `evidenceChecklist`, `status`) | `ROLE_FARMER` (own) | `DiscrepanciesPage.jsx` ("Draft Grievance" modal) / `grievanceApi.ts` |
| `GET` | `/api/v1/grievances/{id}` | Path: `id` (Long) | `GrievanceResponse` | Authenticated | `GrievanceHistoryPage.jsx` / `grievanceApi.ts` |
| `GET` | `/api/v1/grievances/farmer/{farmerId}` | Path: `farmerId` (UUID) | `List<GrievanceResponse>` | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `GrievanceHistoryPage.jsx` / `grievanceApi.ts` |
| `GET` | `/api/v1/grievances/{id}/pdf` | Path: `id` (Long) | Binary Stream (`application/pdf`) | `ROLE_FARMER` (own) or `ROLE_BANK_OFFICER` | `GrievanceHistoryPage.jsx` (Download PDF) / `grievanceApi.ts` |

---

## 8. Bank Officer Verification Endpoints (`/api/v1/bank`)

| Method | Endpoint | Request / Params | Response DTO (`data`) | Auth Required | Frontend Component / Service |
|---|---|---|---|---|---|
| `GET` | `/api/v1/bank/farmers/search` | Query: `query` | `List<FarmerResponse>` | `ROLE_BANK_OFFICER` | `FarmerSearchPage.jsx`, `BankDashboard.jsx` / `bankApi.ts` |
| `GET` | `/api/v1/bank/land/search` | Query: `state`, `district`, `tehsil`, `village`, `khasraNumber` | `List<LandRecordResponse>` | `ROLE_BANK_OFFICER` | `LandVerificationPage.jsx` / `bankApi.ts` |
| `GET` | `/api/v1/bank/loan-history/{farmerId}` | Path: `farmerId` (UUID) | `List<LoanRecordResponse>` | `ROLE_BANK_OFFICER` | `ApplicationAuditPage.jsx` / `bankApi.ts` |
| `POST` | `/api/v1/bank/verify-application` | `VerificationRequest` (`farmerId`, `landRecordIds`, `requestedLoanAmount`, `proposedPledgedArea`, `declaredExistingMortgage`, `remarks`) | `VerificationReportResponse` (`reportId`, `riskLevel`, `hasDuplicateFinancing`, `hasMortgageAlert`, `hasAreaMismatch`, `hasOwnershipMismatch`, `activeLoansFound`, `alerts`) | `ROLE_BANK_OFFICER` | `ApplicationAuditPage.jsx` / `bankApi.ts` |
| `GET` | `/api/v1/bank/verification-reports/{reportId}` | Path: `reportId` (String) | `VerificationReportResponse` | `ROLE_BANK_OFFICER` | `ApplicationAuditPage.jsx` / `bankApi.ts` |

---

## 9. Pre-Seeded Verification & Demo Credentials

| Role | Username | Password | Linked Farmer UUID | Full Name | Location |
|---|---|---|---|---|---|
| `FARMER` | `farmer_ramesh` | `password123` | `a0000000-0000-0000-0000-000000000001` | Ramesh Kumar Patel | Arang, Raipur, CG |
| `FARMER` | `farmer_suresh` | `password123` | `a0000000-0000-0000-0000-000000000002` | Suresh Chandra Verma | Patan, Durg, CG |
| `FARMER` | `farmer_anita` | `password123` | `a0000000-0000-0000-0000-000000000003` | Anita Bai Sahu | Kota, Bilaspur, CG |
| `BANK_OFFICER` | `bank_officer_sharma` | `password123` | N/A | State Bank Officer Sharma | Raipur Main Branch |
