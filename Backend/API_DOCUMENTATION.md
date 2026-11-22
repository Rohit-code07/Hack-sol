# KisanSetu (किसान सेतु) – Backend REST API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:8080/api/v1`  
**Swagger UI:** `http://localhost:8080/swagger-ui/index.html`  
**OpenAPI v3 JSON:** `http://localhost:8080/v3/api-docs`

---

## 📑 Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Standard Response Envelope](#2-standard-response-envelope)
3. [Pre-Seeded Demo Credentials](#3-pre-seeded-demo-credentials)
4. [Authentication APIs](#4-authentication-apis)
5. [Farmer APIs](#5-farmer-apis)
6. [Land Record APIs](#6-land-record-apis)
7. [Loan & Credit APIs](#7-loan--credit-apis)
8. [Entitlement & Calculator APIs](#8-entitlement--calculator-apis)
9. [Bank Officer Verification APIs](#9-bank-officer-verification-apis)
10. [Discrepancy Detection APIs](#10-discrepancy-detection-apis)
11. [Grievance & PDF Export APIs](#11-grievance--pdf-export-apis)
12. [Error Codes & Handling](#12-error-codes--handling)

---

## 1. Authentication & Authorization

All protected endpoints require a JWT Bearer token in the `Authorization` header:
```http
Authorization: Bearer <your_jwt_token_here>
```

### Roles:
* `ROLE_FARMER`: Can manage their own profile, view land parcels, track loans, run entitlement checks, view discrepancies, and generate grievances.
* `ROLE_BANK_OFFICER`: Can search farmers across districts, inspect Khasra records, run cross-verification audits (detecting duplicate financing & mortgages), and generate verification risk reports.

---

## 2. Standard Response Envelope

All API responses (success and error) are wrapped in a unified JSON envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-11-23T02:13:45.123"
}
```

---

## 3. Pre-Seeded Demo Credentials

| Role | Username | Password | Linked Farmer UUID |
|---|---|---|---|
| **FARMER** | `farmer_ramesh` | `password123` | `a0000000-0000-0000-0000-000000000001` |
| **FARMER** | `farmer_suresh` | `password123` | `a0000000-0000-0000-0000-000000000002` |
| **FARMER** | `farmer_anita` | `password123` | `a0000000-0000-0000-0000-000000000003` |
| **BANK_OFFICER** | `bank_officer_sharma` | `password123` | *N/A (State Bank of India officer)* |

---

## 4. Authentication APIs

### 4.1 Login
* **Endpoint:** `POST /api/v1/auth/login`
* **Access:** Public
* **Request Body:**
```json
{
  "username": "farmer_ramesh",
  "password": "password123"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "username": "farmer_ramesh",
    "role": "FARMER",
    "farmerId": "a0000000-0000-0000-0000-000000000001"
  },
  "timestamp": "2026-11-23T02:13:45.123"
}
```

### 4.2 Register
* **Endpoint:** `POST /api/v1/auth/register`
* **Access:** Public
* **Request Body:**
```json
{
  "username": "farmer_new",
  "password": "password123",
  "role": "FARMER",
  "farmerName": "Mahesh Patel",
  "mobileNumber": "9827199999",
  "village": "Arang",
  "tehsil": "Arang",
  "district": "Raipur",
  "state": "Chhattisgarh",
  "preferredLanguage": "hi"
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "username": "farmer_new",
    "role": "FARMER",
    "farmerId": "c1a2b3c4-d5e6-7890-abcd-ef1234567890"
  }
}
```

---

## 5. Farmer APIs

### 5.1 Fetch Farmer Profile
* **Endpoint:** `GET /api/v1/farmers/{farmerId}`
* **Access:** `ROLE_FARMER` (Own records only) or `ROLE_BANK_OFFICER`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "a0000000-0000-0000-0000-000000000001",
    "farmerName": "Ramesh Kumar Patel",
    "mobileNumber": "9827100001",
    "village": "Arang",
    "tehsil": "Arang",
    "district": "Raipur",
    "state": "Chhattisgarh",
    "preferredLanguage": "hi"
  }
}
```

### 5.2 Fetch Farmer Dashboard Summary
* **Endpoint:** `GET /api/v1/farmers/{farmerId}/dashboard`
* **Access:** `ROLE_FARMER` (Own records only) or `ROLE_BANK_OFFICER`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "a0000000-0000-0000-0000-000000000001",
      "farmerName": "Ramesh Kumar Patel"
    },
    "totalLandParcels": 3,
    "totalLandAreaInAcres": 7.5000,
    "activeLoansCount": 3,
    "totalDisbursedLoanAmount": 450000.00,
    "detectedDiscrepanciesCount": 3,
    "totalDiscrepancyDifferenceAmount": 30000.00,
    "recentDiscrepancies": [ ... ]
  }
}
```

### 5.3 Fetch Farmer Registered Land Parcels
* **Endpoint:** `GET /api/v1/farmers/{farmerId}/land-records`
* **Access:** `ROLE_FARMER` (Own records only) or `ROLE_BANK_OFFICER`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "khasraNumber": "104/1",
      "village": "Arang",
      "tehsil": "Arang",
      "district": "Raipur",
      "state": "Chhattisgarh",
      "landArea": 2.5000,
      "areaUnit": "ACRES",
      "ownershipStatus": "INDIVIDUAL",
      "ownershipPercentage": 100.00,
      "mortgages": []
    }
  ]
}
```

### 5.4 Fetch Farmer Loans
* **Endpoint:** `GET /api/v1/farmers/{farmerId}/loans`
* **Access:** `ROLE_FARMER` (Own records only) or `ROLE_BANK_OFFICER`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bankName": "State Bank of India",
      "branchName": "Raipur Main Branch",
      "loanAccountReference": "KCC-SBI-2023-1001",
      "loanType": "KCC_CROP_LOAN",
      "sanctionedAmount": 150000.00,
      "disbursedAmount": 150000.00,
      "interestRate": 7.00,
      "disbursementDate": "2023-05-10",
      "maturityDate": "2024-05-09",
      "repaymentStatus": "CLOSED",
      "collaterals": [
        { "landRecordId": 1, "khasraNumber": "104/1", "collateralStatus": "ACTIVE" }
      ]
    }
  ]
}
```

---

## 6. Land Record APIs

### 6.1 Register Land Parcel
* **Endpoint:** `POST /api/v1/land/records`
* **Access:** `ROLE_FARMER` or `ROLE_BANK_OFFICER`
* **Request Body:**
```json
{
  "khasraNumber": "215/4",
  "village": "Arang",
  "tehsil": "Arang",
  "district": "Raipur",
  "state": "Chhattisgarh",
  "landArea": 1.7500,
  "areaUnit": "ACRES",
  "ownershipStatus": "INDIVIDUAL"
}
```

### 6.2 Get Land Record By ID (with Encumbrances & Ownership)
* **Endpoint:** `GET /api/v1/land/records/{id}`
* **Access:** Authenticated Users

---

## 7. Loan & Credit APIs

### 7.1 Create Loan Record
* **Endpoint:** `POST /api/v1/loans`
* **Access:** `ROLE_BANK_OFFICER`
* **Request Body:**
```json
{
  "farmerId": "a0000000-0000-0000-0000-000000000001",
  "bankId": 1,
  "loanAccountReference": "KCC-SBI-2024-9999",
  "loanType": "KCC_CROP_LOAN",
  "sanctionedAmount": 200000.00,
  "disbursedAmount": 200000.00,
  "interestRate": 7.00,
  "disbursementDate": "2024-06-01",
  "maturityDate": "2025-05-31",
  "repaymentStatus": "ACTIVE"
}
```

### 7.2 Post Loan Transaction (Repayment / Interest Charged)
* **Endpoint:** `POST /api/v1/loans/{id}/transactions`
* **Access:** `ROLE_BANK_OFFICER`
* **Request Body:**
```json
{
  "transactionType": "REPAYMENT",
  "amount": 208000.00,
  "transactionDate": "2025-05-20",
  "referenceNumber": "TXN-SBI-998811",
  "description": "Full prompt principal and interest repayment"
}
```

---

## 8. Entitlement & Calculator APIs

### 8.1 Evaluate KCC Interest Subvention (MISS Scheme)
* **Endpoint:** `POST /api/v1/entitlements/kcc/evaluate`
* **Access:** `ROLE_FARMER` (Own records) or `ROLE_BANK_OFFICER`
* **Description:** Evaluates 2% statutory interest subvention and 3% Prompt Repayment Incentive (PRI). Detects bank overcharges.
* **Request Body:**
```json
{
  "farmerId": "a0000000-0000-0000-0000-000000000001",
  "loanId": 1,
  "loanAmount": 150000.00,
  "loanType": "KCC_CROP_LOAN",
  "disbursementDate": "2023-05-10",
  "repaymentDate": "2024-05-09",
  "repaymentStatus": "CLOSED",
  "actualInterestCharged": 10500.00
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applicableScheme": "Modified Interest Subvention Scheme (MISS) 2023-24",
    "ruleVersion": "v2023.1",
    "eligibilityStatus": "DISCREPANCY_DETECTED",
    "expectedAmount": 6000.00,
    "actualAmount": 10500.00,
    "differenceAmount": 4500.00,
    "explanation": "Potential interest overcharge of INR 4500.00 detected. Expected interest was INR 6000.00 at 4.0%, but INR 10500.00 was charged.",
    "breakdown": {
      "baseInterestRate": "7.00%",
      "promptRepaymentIncentive": "3.00%",
      "effectivePromptRate": "4.00%",
      "promptEligible": "true",
      "overcharge": "4500.00"
    }
  }
}
```

### 8.2 Verify Mandi MSP Payout
* **Endpoint:** `POST /api/v1/entitlements/msp/verify`
* **Access:** `ROLE_FARMER` (Own records) or `ROLE_BANK_OFFICER`
* **Description:** Compares Mandi procurement weight × official CACP MSP rate minus statutory deductions against actual bank credit.
* **Request Body:**
```json
{
  "farmerId": "a0000000-0000-0000-0000-000000000001",
  "crop": "PADDY_GRADE_A",
  "cropGrade": "GRADE_A",
  "marketingSeason": "KHARIF_2023",
  "acceptedQuantity": 50.00,
  "quantityUnit": "QUINTAL",
  "procurementCenter": "Arang Mandi Center #4",
  "documentedDeductions": 150.00,
  "actualPayment": 95000.00,
  "receiptReference": "MSP-LIVE-TEST-001"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applicableScheme": "CACP Minimum Support Price Scheme (KHARIF_2023)",
    "ruleVersion": "v2023.1",
    "eligibilityStatus": "DISCREPANCY_DETECTED",
    "expectedAmount": 110000.00,
    "actualAmount": 95000.00,
    "differenceAmount": 15000.00,
    "explanation": "Potential MSP underpayment detected! Expected net payment is INR 110000.00, but actual bank payout received was INR 95000.00 (Shortfall: INR 15000.00).",
    "breakdown": {
      "officialMspPerQuintal": "2203.00",
      "grossProcurementAmount": "110150.00",
      "documentedDeductions": "150.00",
      "expectedNetPayment": "110000.00",
      "actualReceived": "95000.00",
      "underpaymentShortfall": "15000.00"
    }
  }
}
```

### 8.3 Reconcile PMFBY Insurance Claim
* **Endpoint:** `POST /api/v1/entitlements/insurance/reconcile`
* **Access:** `ROLE_FARMER` (Own records) or `ROLE_BANK_OFFICER`
* **Request Body:**
```json
{
  "farmerId": "a0000000-0000-0000-0000-000000000001",
  "insurancePolicyNumber": "PMFBY-LIVE-TEST-001",
  "crop": "Paddy",
  "season": "KHARIF_2023",
  "sanctionedClaimAmount": 45000.00,
  "actualPayout": 30000.00
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applicableScheme": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    "eligibilityStatus": "DISCREPANCY_DETECTED",
    "expectedAmount": 45000.00,
    "actualAmount": 30000.00,
    "differenceAmount": 15000.00,
    "explanation": "Insurance claim payout shortfall detected. Sanctioned order amount was INR 45000.00, but bank credit received was INR 30000.00.",
    "breakdown": {
      "sanctionedAmount": "45000.00",
      "disbursedAmount": "30000.00",
      "unpaidClaimBalance": "15000.00"
    }
  }
}
```

---

## 9. Bank Officer Verification APIs

### 9.1 Search Farmers
* **Endpoint:** `GET /api/v1/bank/farmers/search?query=Ramesh`
* **Access:** `ROLE_BANK_OFFICER` only (403 for farmers)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "a0000000-0000-0000-0000-000000000001",
      "farmerName": "Ramesh Kumar Patel",
      "mobileNumber": "9827100001",
      "village": "Arang",
      "district": "Raipur"
    }
  ]
}
```

### 9.2 Loan Application Cross-Verification & Duplicate Financing Scan
* **Endpoint:** `POST /api/v1/bank/verify-application`
* **Access:** `ROLE_BANK_OFFICER` only
* **Description:** Audits proposed loan applications against state land records and existing multi-bank loan collaterals.
* **Request Body:**
```json
{
  "farmerId": "a0000000-0000-0000-0000-000000000001",
  "landRecordIds": [3],
  "requestedLoanAmount": 200000.00,
  "proposedPledgedArea": 3.20,
  "declaredExistingMortgage": false
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reportId": "VR-24B71264",
    "farmerId": "a0000000-0000-0000-0000-000000000001",
    "riskLevel": "CRITICAL",
    "hasDuplicateFinancing": true,
    "hasMortgageAlert": true,
    "hasAreaMismatch": false,
    "hasOwnershipMismatch": false,
    "activeLoansFound": 3,
    "alerts": [
      {
        "alertType": "DUPLICATE_FINANCING",
        "severity": "CRITICAL",
        "alertTitle": "Potential Duplicate Financing Alert",
        "description": "Land parcel 'Chhattisgarh, Raipur, Arang, Arang, Khasra 215/3' is already active collateral in 2 existing loan(s): KCC-SBI-2023-1001 (State Bank of India), KCC-CRGB-2023-2002 (Chhattisgarh Rajya Gramin Bank)."
      },
      {
        "alertType": "MORTGAGE_ALERT",
        "severity": "HIGH",
        "alertTitle": "Undisclosed Prior Mortgage Registered",
        "description": "Parcel 'Chhattisgarh, Raipur, Arang, Arang, Khasra 215/3' carries 1 active mortgage encumbrance(s) totaling INR 150000.00."
      }
    ]
  }
}
```

---

## 10. Discrepancy Detection APIs

### 10.1 Detect & Persist Discrepancies
* **Endpoint:** `POST /api/v1/discrepancies/detect`
* **Access:** `ROLE_FARMER` (Own records) or `ROLE_BANK_OFFICER`
* **Request Body:**
```json
{
  "farmerId": "a0000000-0000-0000-0000-000000000001"
}
```
* **Response (200 OK):** Returns all detected financial gaps with severity rankings (`CRITICAL`, `HIGH`, `MEDIUM`).

### 10.2 List Farmer Discrepancies
* **Endpoint:** `GET /api/v1/discrepancies/farmer/{farmerId}`
* **Access:** `ROLE_FARMER` (Own records) or `ROLE_BANK_OFFICER`

---

## 11. Grievance & PDF Export APIs

### 11.1 Generate Bilingual Grievance
* **Endpoint:** `POST /api/v1/grievances/generate`
* **Access:** `ROLE_FARMER` (Own records)
* **Request Body:**
```json
{
  "farmerId": "a0000000-0000-0000-0000-000000000001",
  "discrepancyId": 1,
  "language": "hi",
  "additionalNotes": "कृषि मंडी में तौल पर्ची के अनुसार पूरी राशि का भुगतान नहीं हुआ है।"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "farmerId": "a0000000-0000-0000-0000-000000000001",
    "discrepancyId": 1,
    "subject": "योजना भुगतान विसंगति सुधार हेतु आवेदन - संदर्भ संख्या: MSP-ARNG-2023-001",
    "grievanceContent": "सेवा में, \nजिला कृषि अधिकारी / शाखा प्रबंधक...\nउपरोक्त विषयांतर्गत निवेदन है कि धान विक्रय के उपरांत ₹15,000.00 की राशि का कम भुगतान प्राप्त हुआ है...",
    "language": "hi",
    "recordedDifferenceAmount": 15000.00,
    "evidenceChecklist": [
      "Mandi Weighment Receipt (तौल पर्ची)",
      "Bank Account Statement (बैंक पासबुक प्रति)",
      "Khasra B1 / P-II Land Record Document"
    ],
    "status": "DRAFTED"
  }
}
```

### 11.2 Download Grievance PDF
* **Endpoint:** `GET /api/v1/grievances/{id}/pdf`
* **Access:** `ROLE_FARMER` (Own records) or `ROLE_BANK_OFFICER`
* **Response:** Binary Stream (`Content-Type: application/pdf; filename=grievance_{id}.pdf`)
* **Features:** Official government format, tabular financial audit breakdown, statutory rule citation, and evidence checklist.

---

## 12. Error Codes & Handling

KisanSetu returns standard RFC 7807 problem details in error cases:

| HTTP Status | Error Type | Scenario |
|---|---|---|
| **400 Bad Request** | `BusinessValidationException` | Invalid dates, negative financial amounts, or missing required fields. |
| **401 Unauthorized** | `BadCredentialsException` | Invalid username/password or expired JWT token. |
| **403 Forbidden** | `AccessDeniedException` | Farmer accessing another farmer's UUID, or farmer accessing bank officer endpoints. |
| **404 Not Found** | `ResourceNotFoundException` | Khasra, loan ID, or farmer UUID does not exist. |
| **409 Conflict** | `DuplicateResourceException` | Username or unique reference number already registered. |
| **500 Internal Error** | `Exception` | Unexpected server condition (triggers fallback without crashing). |

### Error Payload Example:
```json
{
  "success": false,
  "message": "Access Denied: You are not authorized to view another farmer's data",
  "data": null,
  "timestamp": "2026-11-23T02:13:45.999"
}
```
