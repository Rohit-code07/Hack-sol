# KisanSetu End-to-End API Integration Test Script
$baseUrl = "http://localhost:8080/api/v1"
$ErrorActionPreference = "Stop"

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "KISANSETU END-TO-END FULL INTEGRATION VERIFICATION SUITE" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# ==========================================
# PART 1: FARMER WORKFLOW VERIFICATION
# ==========================================
Write-Host "`n--- [PART 1: FARMER WORKFLOW VERIFICATION] ---" -ForegroundColor Yellow

# Step 1 & 2: Farmer Login & JWT Received
Write-Host "Step 1 & 2: Farmer Login (farmer_ramesh) & JWT acquisition..."
$loginBody = @{
    username = "farmer_ramesh"
    password = "password123"
} | ConvertTo-Json
$authRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
if (-not $authRes.success -or -not $authRes.data.token) { throw "Farmer login failed!" }
$farmerToken = $authRes.data.token
$farmerId = $authRes.data.farmerId
$farmerHeaders = @{ Authorization = "Bearer $farmerToken" }
Write-Host "  -> SUCCESS: Authenticated! Token acquired. Role: $($authRes.data.role), Farmer ID: $farmerId" -ForegroundColor Green

# Step 3: Farmer Dashboard Fetched
Write-Host "Step 3: Fetching Farmer Comprehensive Dashboard..."
$dashRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/dashboard" -Method Get -Headers $farmerHeaders
if (-not $dashRes.success) { throw "Farmer dashboard fetch failed!" }
Write-Host "  -> SUCCESS: Total Land Parcels: $($dashRes.data.totalLandParcels), Active Loans: $($dashRes.data.activeLoansCount), Detected Discrepancies: $($dashRes.data.detectedDiscrepanciesCount)" -ForegroundColor Green

# Step 4: Farmer Profile Fetched
Write-Host "Step 4: Fetching Farmer Profile..."
$profRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId" -Method Get -Headers $farmerHeaders
if (-not $profRes.success) { throw "Farmer profile fetch failed!" }
Write-Host "  -> SUCCESS: Name: $($profRes.data.farmerName), Village: $($profRes.data.village), District: $($profRes.data.district)" -ForegroundColor Green

# Step 5: Land Records Fetched
Write-Host "Step 5: Fetching Land Records for Farmer..."
$landRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/land-records" -Method Get -Headers $farmerHeaders
if (-not $landRes.success -or $landRes.data.Count -eq 0) { throw "Farmer land records fetch failed!" }
Write-Host "  -> SUCCESS: Retrieved $($landRes.data.Count) parcels (First Khasra: $($landRes.data[0].khasraNumber), Area: $($landRes.data[0].landArea) $($landRes.data[0].areaUnit))" -ForegroundColor Green

# Step 6: Loan Records Fetched
Write-Host "Step 6: Fetching Loan Records for Farmer..."
$loanRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/loans" -Method Get -Headers $farmerHeaders
if (-not $loanRes.success -or $loanRes.data.Count -eq 0) { throw "Farmer loans fetch failed!" }
Write-Host "  -> SUCCESS: Retrieved $($loanRes.data.Count) loan accounts (First Loan: $($loanRes.data[0].loanAccountReference), Sanctioned: INR $($loanRes.data[0].sanctionedAmount))" -ForegroundColor Green

# Step 7 & 8: KCC Calculation Submitted & Result Displayed
Write-Host "Step 7 & 8: Submitting KCC Interest Subvention Evaluation..."
$kccBody = @{
    farmerId = $farmerId
    loanId = $loanRes.data[0].id
    loanAmount = 150000.00
    loanType = "KCC_CROP_LOAN"
    disbursementDate = "2023-05-10"
    repaymentDate = "2024-05-09"
    repaymentStatus = "CLOSED"
    actualInterestCharged = 10500.00
} | ConvertTo-Json
$kccRes = Invoke-RestMethod -Uri "$baseUrl/entitlements/kcc/evaluate" -Method Post -Body $kccBody -ContentType "application/json" -Headers $farmerHeaders
if (-not $kccRes.success) { throw "KCC calculation failed!" }
Write-Host "  -> SUCCESS: Scheme: $($kccRes.data.applicableScheme), Status: $($kccRes.data.eligibilityStatus), Expected Interest: INR $($kccRes.data.expectedAmount), Overcharge Diff: INR $($kccRes.data.differenceAmount)" -ForegroundColor Green

# Step 9, 10 & 11: MSP Verification Submitted & Result Displayed
Write-Host "Step 9, 10 & 11: Submitting CACP Mandi MSP Verification..."
$mspBody = @{
    farmerId = $farmerId
    crop = "PADDY_GRADE_A"
    cropGrade = "GRADE_A"
    marketingSeason = "KHARIF_2023"
    acceptedQuantity = 50.00
    actualPayment = 95000.00
    documentedDeductions = 150.00
    receiptReference = "MSP-E2E-TEST-001"
} | ConvertTo-Json
$mspRes = Invoke-RestMethod -Uri "$baseUrl/entitlements/msp/verify" -Method Post -Body $mspBody -ContentType "application/json" -Headers $farmerHeaders
if (-not $mspRes.success) { throw "MSP verification failed!" }
Write-Host "  -> SUCCESS: Expected Net: INR $($mspRes.data.expectedAmount), Actual Received: INR $($mspRes.data.actualAmount), Underpayment Shortfall: INR $($mspRes.data.differenceAmount)" -ForegroundColor Green

# Step 12: Insurance Reconciliation Submitted
Write-Host "Step 12: Submitting PMFBY Crop Insurance Claim Reconciliation..."
$insBody = @{
    farmerId = $farmerId
    insurancePolicyNumber = "PMFBY-E2E-TEST-001"
    crop = "Paddy"
    season = "KHARIF_2023"
    sanctionedClaimAmount = 45000.00
    actualPayout = 30000.00
} | ConvertTo-Json
$insRes = Invoke-RestMethod -Uri "$baseUrl/entitlements/insurance/reconcile" -Method Post -Body $insBody -ContentType "application/json" -Headers $farmerHeaders
if (-not $insRes.success) { throw "Insurance reconciliation failed!" }
Write-Host "  -> SUCCESS: Sanctioned Order: INR $($insRes.data.expectedAmount), Disbursed: INR $($insRes.data.actualAmount), Shortfall: INR $($insRes.data.differenceAmount)" -ForegroundColor Green

# Step 13: Discrepancies Fetched
Write-Host "Step 13: Fetching Discrepancies for Farmer..."
$discRes = Invoke-RestMethod -Uri "$baseUrl/discrepancies/farmer/$farmerId" -Method Get -Headers $farmerHeaders
if (-not $discRes.success) { throw "Discrepancy fetch failed!" }
Write-Host "  -> SUCCESS: Retrieved $($discRes.data.Count) tracked discrepancies (First Category: $($discRes.data[0].category), Diff: INR $($discRes.data[0].differenceAmount))" -ForegroundColor Green

# Step 14: Grievance Generated
Write-Host "Step 14: Generating Official Bilingual Grievance Petition..."
$grvBody = @{
    farmerId = $farmerId
    discrepancyId = $discRes.data[0].id
    language = "hi"
    additionalNotes = "मंडी तौल पर्ची के अनुसार पूरी राशि का भुगतान नहीं हुआ है।"
} | ConvertTo-Json
$grvRes = Invoke-RestMethod -Uri "$baseUrl/grievances/generate" -Method Post -Body $grvBody -ContentType "application/json" -Headers $farmerHeaders
if (-not $grvRes.success) { throw "Grievance generation failed!" }
$grievanceId = $grvRes.data.id
Write-Host "  -> SUCCESS: Grievance Petition ID: $grievanceId, Subject: $($grvRes.data.subject)" -ForegroundColor Green

# Step 15: PDF Downloaded
Write-Host "Step 15: Downloading Official Grievance Petition as PDF stream..."
$pdfBytes = Invoke-RestMethod -Uri "$baseUrl/grievances/$grievanceId/pdf" -Method Get -Headers $farmerHeaders
if ($pdfBytes.Length -lt 500) { throw "PDF download failed or returned invalid bytes!" }
Write-Host "  -> SUCCESS: Official PDF downloaded successfully ($($pdfBytes.Length) bytes, Valid PDF binary stream)" -ForegroundColor Green


# ==========================================
# PART 2: BANK OFFICER WORKFLOW VERIFICATION
# ==========================================
Write-Host "`n--- [PART 2: BANK OFFICER WORKFLOW VERIFICATION] ---" -ForegroundColor Yellow

# Step 1 & 2: Bank Officer Login & JWT Received
Write-Host "Step 1 & 2: Bank Officer Login (bank_officer_sharma)..."
$bankLoginBody = @{
    username = "bank_officer_sharma"
    password = "password123"
} | ConvertTo-Json
$bankAuthRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $bankLoginBody -ContentType "application/json"
if (-not $bankAuthRes.success -or -not $bankAuthRes.data.token) { throw "Bank officer login failed!" }
$bankToken = $bankAuthRes.data.token
$bankHeaders = @{ Authorization = "Bearer $bankToken" }
Write-Host "  -> SUCCESS: Bank Officer authenticated! Role: $($bankAuthRes.data.role)" -ForegroundColor Green

# Step 3: Bank Dashboard / Loan Accounts Fetched
Write-Host "Step 3: Fetching Bank Branch Loan Portfolio (SBI Branch 1)..."
$bankLoans = Invoke-RestMethod -Uri "$baseUrl/loans/bank/1" -Method Get -Headers $bankHeaders
if (-not $bankLoans.success) { throw "Bank loans fetch failed!" }
Write-Host "  -> SUCCESS: Retrieved $($bankLoans.data.Count) active/closed agricultural loan facilities in branch" -ForegroundColor Green

# Step 4: Farmer Search Performed
Write-Host "Step 4: Performing Real Farmer Search (query='Ramesh')..."
$searchRes = Invoke-RestMethod -Uri "$baseUrl/bank/farmers/search?query=Ramesh" -Method Get -Headers $bankHeaders
if (-not $searchRes.success -or $searchRes.data.Count -eq 0) { throw "Farmer search failed!" }
Write-Host "  -> SUCCESS: Found $($searchRes.data.Count) matching farmers (Farmer: $($searchRes.data[0].farmerName), Location: $($searchRes.data[0].village), $($searchRes.data[0].district))" -ForegroundColor Green

# Step 5: Land Records Fetched
Write-Host "Step 5: Inspecting Land Cadastre Records (khasraNumber='215/3')..."
$landSearchRes = Invoke-RestMethod -Uri "$baseUrl/land-records/search?khasraNumber=215/3" -Method Get -Headers $bankHeaders
if (-not $landSearchRes.success -or $landSearchRes.data.Count -eq 0) { throw "Land search failed!" }
$parcelId = $landSearchRes.data[0].id
Write-Host "  -> SUCCESS: Found Parcel ID: $parcelId (Khasra: $($landSearchRes.data[0].khasraNumber), Status: $($landSearchRes.data[0].ownershipStatus), Area: $($landSearchRes.data[0].landArea) ACRES)" -ForegroundColor Green

# Step 6: Ownership Verified
Write-Host "Step 6: Verifying Land Title Ownership Record..."
$ownerRes = Invoke-RestMethod -Uri "$baseUrl/land-records/$parcelId/ownership" -Method Get -Headers $bankHeaders
if (-not $ownerRes.success -or $ownerRes.data.Count -eq 0) { throw "Ownership verification failed!" }
Write-Host "  -> SUCCESS: Title Owner: $($ownerRes.data[0].farmerName), Ownership Type: $($ownerRes.data[0].ownershipType) ($($ownerRes.data[0].ownershipPercentage)%)" -ForegroundColor Green

# Step 7: Mortgage Information Displayed
Write-Host "Step 7: Checking Active Mortgage Encumbrances for Parcel $parcelId..."
$mortRes = Invoke-RestMethod -Uri "$baseUrl/land-records/$parcelId/mortgage" -Method Get -Headers $bankHeaders
if (-not $mortRes.success) { throw "Mortgage check failed!" }
Write-Host "  -> SUCCESS: Found $($mortRes.data.Count) active registered mortgage(s) totaling INR $($mortRes.data[0].mortgageAmount) ($($mortRes.data[0].bankName))" -ForegroundColor Green

# Step 8: Existing Loans Exposure Fetched
Write-Host "Step 8: Fetching Multi-Bank Agricultural Loan History for Farmer..."
$exposureRes = Invoke-RestMethod -Uri "$baseUrl/bank/loan-history/$farmerId" -Method Get -Headers $bankHeaders
if (-not $exposureRes.success) { throw "Loan exposure check failed!" }
Write-Host "  -> SUCCESS: Farmer has $($exposureRes.data.Count) multi-bank institutional loans across system" -ForegroundColor Green

# Step 9 & 10: Verification Request Submitted & Duplicate Financing Report Displayed
Write-Host "Step 9 & 10: Submitting Cross-Verification Application for Parcel $parcelId..."
$verifyAppBody = @{
    farmerId = $farmerId
    landRecordIds = @($parcelId)
    requestedLoanAmount = 200000.00
    proposedPledgedArea = 3.20
    declaredExistingMortgage = $false
} | ConvertTo-Json
$verifyRes = Invoke-RestMethod -Uri "$baseUrl/bank/verify-application" -Method Post -Body $verifyAppBody -ContentType "application/json" -Headers $bankHeaders
if (-not $verifyRes.success) { throw "Cross-verification application failed!" }
Write-Host "  -> SUCCESS: Verification Report ID: $($verifyRes.data.reportId)" -ForegroundColor Green
Write-Host "     * Risk Level: $($verifyRes.data.riskLevel)" -ForegroundColor Green
Write-Host "     * Has Duplicate Financing: $($verifyRes.data.hasDuplicateFinancing)" -ForegroundColor Green
Write-Host "     * Has Mortgage Alert: $($verifyRes.data.hasMortgageAlert)" -ForegroundColor Green
Write-Host "     * Total Active Loans Detected: $($verifyRes.data.activeLoansFound)" -ForegroundColor Green
Write-Host "     * Generated Alerts Count: $($verifyRes.data.alerts.Count)" -ForegroundColor Green
foreach ($alert in $verifyRes.data.alerts) {
    Write-Host "       - [$($alert.severity)] $($alert.alertTitle)" -ForegroundColor Cyan
}

Write-Host "`n===========================================================" -ForegroundColor Green
Write-Host "ALL 25 WORKFLOW STEPS (FARMER & BANK) VERIFIED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
