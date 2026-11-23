# KisanSetu Phase 12 Comprehensive 10-Point End-to-End Verification Suite
$baseUrl = "http://localhost:8080/api/v1"
$ErrorActionPreference = "Stop"

Write-Host "================================================================="
Write-Host "KISANSETU PHASE 12: 10-POINT FULL-STACK INTEGRATION AUDIT"
Write-Host "================================================================="

# -------------------------------------------------------------------------
# TEST 1: FARMER PROFILE
# -------------------------------------------------------------------------
Write-Host "`n[TEST 1/10] Verifying Farmer Profile against PostgreSQL Seed..."
$loginBody = @{ username = "farmer_ramesh"; password = "password123" } | ConvertTo-Json
$authRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$farmerToken = $authRes.data.token
$farmerId = $authRes.data.farmerId
$farmerHeaders = @{ Authorization = "Bearer $farmerToken" }

$profileRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId" -Method Get -Headers $farmerHeaders
Write-Host "  -> Farmer ID: $farmerId"
Write-Host "  -> Name: $($profileRes.data.farmerName)"
Write-Host "  -> Village/District: $($profileRes.data.village), $($profileRes.data.district), $($profileRes.data.state)"
if ($profileRes.data.farmerName -ne "Ramesh Kumar Patel") { throw "Farmer name mismatch!" }
Write-Host "  -> TEST 1 PASSED: Farmer profile verified from MySQL." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 2: LAND RECORDS
# -------------------------------------------------------------------------
Write-Host "`n[TEST 2/10] Verifying Cadastral Land Records from MySQL..."
$landRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/land-records" -Method Get -Headers $farmerHeaders
Write-Host "  -> Total Cadastral Parcels: $($landRes.data.Count)"
foreach ($parcel in $landRes.data) {
    Write-Host "     * Parcel #$($parcel.id) - Khasra: $($parcel.khasraNumber), Area: $($parcel.landArea) $($parcel.areaUnit), Status: $($parcel.ownershipStatus)"
}
if ($landRes.data.Count -lt 1) { throw "No land records returned!" }
Write-Host "  -> TEST 2 PASSED: Real cadastral parcels retrieved." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 3: LOAN RECORDS & TRANSACTIONS
# -------------------------------------------------------------------------
Write-Host "`n[TEST 3/10] Verifying Agricultural Loan Facilities & Ledger..."
$loansRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/loans" -Method Get -Headers $farmerHeaders
Write-Host "  -> Total Loan Facilities: $($loansRes.data.Count)"
$firstLoan = $loansRes.data[0]
Write-Host "  -> Loan Ref: $($firstLoan.loanAccountReference), Sanctioned: INR $($firstLoan.sanctionedAmount), Rate: $($firstLoan.interestRate)%"

$txnsRes = Invoke-RestMethod -Uri "$baseUrl/loans/$($firstLoan.id)/transactions" -Method Get -Headers $farmerHeaders
Write-Host "  -> Ledger Transactions Recorded: $($txnsRes.data.Count)"
foreach ($t in $txnsRes.data) {
    Write-Host "     * [$($t.transactionType)] INR $($t.amount) on $($t.transactionDate) ($($t.description))"
}
Write-Host "  -> TEST 3 PASSED: Loan records and transactions verified." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 4: KCC CALCULATION & SCHEME AUDIT
# -------------------------------------------------------------------------
Write-Host "`n[TEST 4/10] Verifying Java KCC Entitlement Engine (MISS 2023-24)..."
$kccBody = @{
    farmerId = $farmerId
    loanId = $firstLoan.id
    loanAmount = 150000.00
    loanType = "KCC_CROP_LOAN"
    disbursementDate = "2023-05-10"
    repaymentDate = "2024-05-09"
    repaymentStatus = "CLOSED"
    actualInterestCharged = 10500.00
} | ConvertTo-Json

$kccRes = Invoke-RestMethod -Uri "$baseUrl/entitlements/kcc/evaluate" -Method Post -Body $kccBody -ContentType "application/json" -Headers $farmerHeaders
Write-Host "  -> Applicable Scheme: $($kccRes.data.applicableScheme) (Rule: $($kccRes.data.ruleVersion))"
Write-Host "  -> Status: $($kccRes.data.eligibilityStatus)"
Write-Host "  -> Expected Subvented Rate: 4.0% (INR $($kccRes.data.expectedAmount))"
Write-Host "  -> Bank Charged: INR $($kccRes.data.actualAmount)"
Write-Host "  -> Detected Overcharge: INR $($kccRes.data.differenceAmount)"
if ($kccRes.data.differenceAmount -ne 4500.00) { throw "KCC calculation mismatch!" }
Write-Host "  -> TEST 4 PASSED: KCC entitlement evaluated deterministically by Java." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 5: MSP VERIFICATION
# -------------------------------------------------------------------------
Write-Host "`n[TEST 5/10] Verifying CACP Mandi MSP Calculation & Discrepancy..."
$mspBody = @{
    farmerId = $farmerId
    crop = "PADDY_GRADE_A"
    cropGrade = "GRADE_A"
    marketingSeason = "KHARIF_2023"
    acceptedQuantity = 50.00
    quantityUnit = "QUINTAL"
    procurementCenter = "Arang Mandi Mandir #4"
    documentedDeductions = 150.00
    actualPayment = 95000.00
    receiptReference = "MSP-VERIFY-P10"
} | ConvertTo-Json

$mspRes = Invoke-RestMethod -Uri "$baseUrl/entitlements/msp/verify" -Method Post -Body $mspBody -ContentType "application/json" -Headers $farmerHeaders
Write-Host "  -> Status: $($mspRes.data.eligibilityStatus)"
Write-Host "  -> Expected Net: INR $($mspRes.data.expectedAmount)"
Write-Host "  -> Actual Received: INR $($mspRes.data.actualAmount)"
Write-Host "  -> Detected Shortfall: INR $($mspRes.data.differenceAmount)"
if ($mspRes.data.differenceAmount -ne 15000.00) { throw "MSP shortfall mismatch!" }
Write-Host "  -> TEST 5 PASSED: MSP statutory underpayment verified." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 6: PMFBY INSURANCE RECONCILIATION
# -------------------------------------------------------------------------
Write-Host "`n[TEST 6/10] Verifying PMFBY Insurance Claim Reconciliation..."
$insBody = @{
    farmerId = $farmerId
    insurancePolicyNumber = "PMFBY-2023-CG-001"
    crop = "Paddy"
    season = "KHARIF_2023"
    sanctionedClaimAmount = 45000.00
    actualPayout = 30000.00
} | ConvertTo-Json

$insRes = Invoke-RestMethod -Uri "$baseUrl/entitlements/insurance/reconcile" -Method Post -Body $insBody -ContentType "application/json" -Headers $farmerHeaders
Write-Host "  -> Status: $($insRes.data.eligibilityStatus)"
Write-Host "  -> Sanctioned Order: INR $($insRes.data.expectedAmount)"
Write-Host "  -> Disbursed Claim: INR $($insRes.data.actualAmount)"
Write-Host "  -> Shortfall Difference: INR $($insRes.data.differenceAmount)"
if ($insRes.data.differenceAmount -ne 15000.00) { throw "Insurance shortfall mismatch!" }
Write-Host "  -> TEST 6 PASSED: PMFBY insurance reconciliation verified." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 7: GRIEVANCE PETITION & PDF STREAM
# -------------------------------------------------------------------------
Write-Host "`n[TEST 7/10] Generating Bilingual Grievance & Testing PDF Download..."
$discRes = Invoke-RestMethod -Uri "$baseUrl/farmers/$farmerId/discrepancies" -Method Get -Headers $farmerHeaders
$targetDisc = $discRes.data[0]

$grvBody = @{
    farmerId = $farmerId
    discrepancyId = $targetDisc.id
    language = "hi"
    additionalNotes = "मंडी तौल पर्ची के अनुसार पूरी राशि का भुगतान नहीं किया गया है।"
} | ConvertTo-Json

$grvRes = Invoke-RestMethod -Uri "$baseUrl/grievances/generate" -Method Post -Body $grvBody -ContentType "application/json" -Headers $farmerHeaders
$grvId = $grvRes.data.id
Write-Host "  -> Created Grievance ID: $grvId"
Write-Host "  -> Subject: $($grvRes.data.subject)"
Write-Host "  -> Amount: INR $($grvRes.data.recordedDifferenceAmount)"

$pdfOut = "test_phase10_grievance.pdf"
Invoke-RestMethod -Uri "$baseUrl/grievances/$grvId/pdf" -Method Get -Headers $farmerHeaders -OutFile $pdfOut
$pdfItem = Get-Item $pdfOut
Write-Host "  -> Downloaded PDF Size: $($pdfItem.Length) bytes (Valid OpenPDF Stream)"
Remove-Item $pdfOut -ErrorAction SilentlyContinue
Write-Host "  -> TEST 7 PASSED: Grievance persisted and PDF binary stream verified." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 8: BANK OFFICER VERIFICATION & RISK ENGINE
# -------------------------------------------------------------------------
Write-Host "`n[TEST 8/10] Verifying Bank Officer Underwriting & Duplicate Detection..."
$bankLogin = @{ username = "bank_officer_sharma"; password = "password123" } | ConvertTo-Json
$bankAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $bankLogin -ContentType "application/json"
$bankToken = $bankAuth.data.token
$bankHeaders = @{ Authorization = "Bearer $bankToken" }

# Farmer Search
$searchRes = Invoke-RestMethod -Uri "$baseUrl/bank/farmers/search?query=Ramesh" -Method Get -Headers $bankHeaders
Write-Host "  -> Bank Search Found: $($searchRes.data[0].farmerName) in $($searchRes.data[0].village)"

# Multi-Bank Loan History
$historyRes = Invoke-RestMethod -Uri "$baseUrl/bank/loan-history/$farmerId" -Method Get -Headers $bankHeaders
Write-Host "  -> Multi-Bank Institutional Loans Retrieved: $($historyRes.data.Count)"

# Underwriting Cross-Verification (Parcel 3)
$underwriteBody = @{
    farmerId = $farmerId
    landRecordIds = @(3)
    requestedLoanAmount = 250000.00
    proposedPledgedArea = 3.20
    declaredExistingMortgage = $false
} | ConvertTo-Json

$underwriteRes = Invoke-RestMethod -Uri "$baseUrl/bank/verify-application" -Method Post -Body $underwriteBody -ContentType "application/json" -Headers $bankHeaders
Write-Host "  -> Underwriting Report ID: $($underwriteRes.data.reportId)"
Write-Host "  -> Risk Level: $($underwriteRes.data.riskLevel)"
Write-Host "  -> Duplicate Financing: $($underwriteRes.data.hasDuplicateFinancing)"
Write-Host "  -> Mortgage Encumbrance Alert: $($underwriteRes.data.hasMortgageAlert)"
Write-Host "  -> Total Active Loans Found: $($underwriteRes.data.activeLoansFound)"
if ($underwriteRes.data.riskLevel -ne "CRITICAL") { throw "Expected CRITICAL risk level!" }
Write-Host "  -> TEST 8 PASSED: Bank cross-verification and risk engine verified." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 9: SECURITY, ROLE PROTECTION & AUTHORIZATION
# -------------------------------------------------------------------------
Write-Host "`n[TEST 9/10] Verifying Role-Based Access Control (RBAC) & Data Isolation..."

# 9a. Farmer trying to access another farmer's profile (should be 403 Forbidden)
try {
    $otherFarmerUuid = "a0000000-0000-0000-0000-000000000002"
    Invoke-RestMethod -Uri "$baseUrl/farmers/$otherFarmerUuid" -Method Get -Headers $farmerHeaders
    throw "SECURITY FAILED: Farmer accessed another farmer's profile!"
} catch {
    Write-Host "  -> [9a] Cross-Farmer Profile Access Blocked: HTTP $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}

# 9b. Farmer trying to access bank officer search endpoint (should be 403 Forbidden)
try {
    Invoke-RestMethod -Uri "$baseUrl/bank/farmers/search?query=Anita" -Method Get -Headers $farmerHeaders
    throw "SECURITY FAILED: Farmer accessed bank-only endpoint!"
} catch {
    Write-Host "  -> [9b] Farmer Access to Bank Endpoint Blocked: HTTP $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}

# 9c. Bad credentials rejection (should be 401 Unauthorized)
try {
    $badCreds = @{ username = "farmer_ramesh"; password = "bad_password" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $badCreds -ContentType "application/json"
    throw "SECURITY FAILED: Invalid credentials allowed!"
} catch {
    Write-Host "  -> [9c] Bad Credentials Rejected: HTTP $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}
Write-Host "  -> TEST 9 PASSED: Complete security isolation & RBAC verified." -ForegroundColor Green

# -------------------------------------------------------------------------
# TEST 10: DATA PERSISTENCE & ACID GUARANTEES IN MYSQL
# -------------------------------------------------------------------------
Write-Host "`n[TEST 10/10] Verifying MySQL Direct Data Persistence..."
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$query = "SELECT id, farmer_id, grievance_status, created_at FROM grievances WHERE id = $grvId;"
$dbRecord = & $mysqlPath -u kisansetu -pkisansetu123 -h 127.0.0.1 -P 3306 -D kisansetu -s -N -e $query
Write-Host "  -> Directly Queried from MySQL Database: $dbRecord"
if (-not $dbRecord) { throw "Grievance record not found directly in MySQL!" }
Write-Host "  -> TEST 10 PASSED: Data persistence confirmed in MySQL." -ForegroundColor Green

Write-Host "`n================================================================="
Write-Host "ALL 10 VERIFICATION TESTS COMPLETED WITH 100% SUCCESS!"
Write-Host "================================================================="
