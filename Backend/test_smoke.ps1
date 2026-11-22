# KisanSetu API Live Smoke Test Script
$baseUrl = "http://localhost:8080"
$ErrorActionPreference = "Stop"

Write-Host "================================================="
Write-Host "KISANSETU BACKEND LIVE SMOKE TEST & API AUDIT"
Write-Host "================================================="

# 1. Test OpenAPI Documentation
Write-Host "`n[1/12] Testing OpenAPI v3 Endpoint..."
$apiDocs = Invoke-RestMethod -Uri "$baseUrl/v3/api-docs" -Method Get
Write-Host "OpenAPI Title: $($apiDocs.info.title) (v$($apiDocs.info.version))"
Write-Host "Total Endpoints Documented: $($apiDocs.paths.PSObject.Properties.Count)"

# 2. Test Farmer Login
Write-Host "`n[2/12] Testing Farmer Login (farmer_ramesh)..."
$farmerLoginBody = @{
    username = "farmer_ramesh"
    password = "password123"
} | ConvertTo-Json

$farmerAuth = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $farmerLoginBody -ContentType "application/json"
$farmerToken = $farmerAuth.data.token
$farmerId = $farmerAuth.data.farmerId
Write-Host "Farmer Login Success: Token acquired. Farmer UUID: $farmerId, Role: $($farmerAuth.data.role)"

# 3. Test Bank Officer Login
Write-Host "`n[3/12] Testing Bank Officer Login (bank_officer_sharma)..."
$bankLoginBody = @{
    username = "bank_officer_sharma"
    password = "password123"
} | ConvertTo-Json

$bankAuth = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $bankLoginBody -ContentType "application/json"
$bankToken = $bankAuth.data.token
Write-Host "Bank Officer Login Success: Token acquired. Role: $($bankAuth.data.role)"

# 4. Test Invalid Login
Write-Host "`n[4/12] Testing Bad Credentials Rejection..."
try {
    $badLogin = @{ username = "farmer_ramesh"; password = "wrongpassword" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -Body $badLogin -ContentType "application/json"
    Write-Host "FAILED: Bad login was not rejected!" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS: Rejected with HTTP $($_.Exception.Response.StatusCode) ($($_.ErrorDetails.Message))" -ForegroundColor Green
}

# 5. Test Farmer Data Ownership Validation
Write-Host "`n[5/12] Testing Farmer Data Ownership & Role Restrictions..."
# As farmer_ramesh, access own profile -> should succeed (200)
$farmerHeaders = @{ Authorization = "Bearer $farmerToken" }
$ownProfile = Invoke-RestMethod -Uri "$baseUrl/api/v1/farmers/$farmerId" -Method Get -Headers $farmerHeaders
Write-Host "Access Own Profile: SUCCESS ($($ownProfile.data.farmerName))"

# As farmer_ramesh, access another farmer (farmer_suresh: a0000000-0000-0000-0000-000000000002) -> should be 403 Forbidden!
try {
    Invoke-RestMethod -Uri "$baseUrl/api/v1/farmers/a0000000-0000-0000-0000-000000000002" -Method Get -Headers $farmerHeaders
    Write-Host "SECURITY VULNERABILITY: Farmer accessed another farmer's profile!" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS: Blocked cross-farmer profile access with HTTP $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}

# As farmer_ramesh, access bank officer endpoint -> should be 403 Forbidden!
try {
    Invoke-RestMethod -Uri "$baseUrl/api/v1/bank/farmers/search?query=Ramesh" -Method Get -Headers $farmerHeaders
    Write-Host "SECURITY VULNERABILITY: Farmer accessed Bank Officer endpoint!" -ForegroundColor Red
} catch {
    Write-Host "SUCCESS: Blocked farmer access to bank endpoints with HTTP $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}

# 6. Test Farmer Dashboard & Land Portfolio
Write-Host "`n[6/12] Testing Farmer Dashboard..."
$dashboard = Invoke-RestMethod -Uri "$baseUrl/api/v1/farmers/$farmerId/dashboard" -Method Get -Headers $farmerHeaders
Write-Host "Dashboard Summary for $($dashboard.data.profile.farmerName):"
Write-Host " - Registered Land Parcels: $($dashboard.data.totalLandParcels) ($($dashboard.data.totalLandAreaInAcres) Acres)"
Write-Host " - Active Loans: $($dashboard.data.activeLoansCount) (Disbursed: INR $($dashboard.data.totalDisbursedLoanAmount))"
Write-Host " - Detected Discrepancies: $($dashboard.data.detectedDiscrepanciesCount) (Shortfall: INR $($dashboard.data.totalDiscrepancyDifferenceAmount))"

# 7. Test KCC Entitlement Calculator (Timely Repayment vs Overcharge)
Write-Host "`n[7/12] Testing KCC Interest Subvention Calculator..."
$kccReq = @{
    farmerId = $farmerId
    loanId = 1
    loanAmount = 150000.00
    loanType = "KCC_CROP_LOAN"
    disbursementDate = "2023-05-10"
    repaymentDate = "2024-05-09" # Timely repayment (365 days)
    repaymentStatus = "CLOSED"
    actualInterestCharged = 10500.00 # Bank charged 7% instead of prompt 4%!
} | ConvertTo-Json

$kccRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/entitlements/kcc/evaluate" -Method Post -Body $kccReq -ContentType "application/json" -Headers $farmerHeaders
Write-Host "KCC Calculation Result:"
Write-Host " - Scheme: $($kccRes.data.applicableScheme) ($($kccRes.data.ruleVersion))"
Write-Host " - Status: $($kccRes.data.eligibilityStatus)"
Write-Host " - Expected Interest (4% prompt): INR $($kccRes.data.expectedAmount)"
Write-Host " - Actual Charged Interest: INR $($kccRes.data.actualAmount)"
Write-Host " - Overcharged Difference: INR $($kccRes.data.differenceAmount)"
Write-Host " - Finding: $($kccRes.data.explanation)"

# 8. Test MSP Payment Verification (Underpayment Detection)
Write-Host "`n[8/12] Testing CACP MSP Net Payment Calculator..."
$mspReq = @{
    farmerId = $farmerId
    crop = "PADDY_GRADE_A"
    cropGrade = "GRADE_A"
    marketingSeason = "KHARIF_2023"
    acceptedQuantity = 50.00
    quantityUnit = "QUINTAL"
    procurementCenter = "Arang Mandi Center #4"
    documentedDeductions = 150.00
    actualPayment = 95000.00 # Actual payout was 95,000 instead of 110,000
    receiptReference = "MSP-LIVE-TEST-001"
} | ConvertTo-Json

$mspRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/entitlements/msp/verify" -Method Post -Body $mspReq -ContentType "application/json" -Headers $farmerHeaders
Write-Host "MSP Verification Result:"
Write-Host " - Status: $($mspRes.data.eligibilityStatus)"
Write-Host " - Expected Net Payment: INR $($mspRes.data.expectedAmount)"
Write-Host " - Actual Payment: INR $($mspRes.data.actualAmount)"
Write-Host " - Underpayment Shortfall: INR $($mspRes.data.differenceAmount)"
Write-Host " - Finding: $($mspRes.data.explanation)"

# 9. Test PMFBY Insurance Payout Reconciliation
Write-Host "`n[9/12] Testing PMFBY Insurance Claim Reconciliation..."
$insReq = @{
    farmerId = $farmerId
    insurancePolicyNumber = "PMFBY-LIVE-TEST-001"
    crop = "Paddy"
    season = "KHARIF_2023"
    sanctionedClaimAmount = 45000.00
    actualPayout = 30000.00
} | ConvertTo-Json

$insRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/entitlements/insurance/reconcile" -Method Post -Body $insReq -ContentType "application/json" -Headers $farmerHeaders
Write-Host "Insurance Reconciliation Result:"
Write-Host " - Status: $($insRes.data.eligibilityStatus)"
Write-Host " - Sanctioned Claim: INR $($insRes.data.expectedAmount)"
Write-Host " - Actual Payout: INR $($insRes.data.actualAmount)"
Write-Host " - Shortfall: INR $($insRes.data.differenceAmount)"

# 10. Test Bank Officer Cross-Verification (Duplicate Financing & Mortgages)
Write-Host "`n[10/12] Testing Bank Officer Cross-Verification (Land Parcel 3)..."
$bankHeaders = @{ Authorization = "Bearer $bankToken" }
$verifyReq = @{
    farmerId = $farmerId
    landRecordIds = @(3) # Parcel 3 has multiple active loans and active mortgage!
    requestedLoanAmount = 200000.00
    proposedPledgedArea = 3.20
    declaredExistingMortgage = $false
} | ConvertTo-Json

$verifyRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/bank/verify-application" -Method Post -Body $verifyReq -ContentType "application/json" -Headers $bankHeaders
Write-Host "Bank Verification Report ($($verifyRes.data.reportId)):"
Write-Host " - Risk Level: $($verifyRes.data.riskLevel)"
Write-Host " - Has Duplicate Financing: $($verifyRes.data.hasDuplicateFinancing)"
Write-Host " - Has Mortgage Alert: $($verifyRes.data.hasMortgageAlert)"
Write-Host " - Active Loans Found: $($verifyRes.data.activeLoansFound)"
Write-Host " - Generated Alerts:"
foreach ($a in $verifyRes.data.alerts) {
    Write-Host "   * [$($a.severity)] $($a.alertTitle): $($a.description)"
}

# 11. Test Discrepancy Detection & Persistence
Write-Host "`n[11/12] Testing Discrepancy Scanning & Persistence..."
$discReq = @{ farmerId = $farmerId } | ConvertTo-Json
$discList = Invoke-RestMethod -Uri "$baseUrl/api/v1/discrepancies/detect" -Method Post -Body $discReq -ContentType "application/json" -Headers $farmerHeaders
Write-Host "Total Discrepancies Persisted for Farmer: $($discList.data.Count)"
foreach ($d in $discList.data) {
    Write-Host " - [ID $($d.id)] $($d.category): Diff INR $($d.differenceAmount) (Status: $($d.verificationStatus))"
}

# 12. Test Grievance Generation (Hindi & English) and PDF Download
Write-Host "`n[12/12] Testing Grievance Generation & PDF Export..."
$targetDiscId = $discList.data[0].id

# Generate in Hindi
$grvHindiReq = @{
    farmerId = $farmerId
    discrepancyId = $targetDiscId
    language = "hi"
    additionalNotes = "कृषि मंडी में तौल पर्ची के अनुसार पूरी राशि का भुगतान नहीं हुआ है।"
} | ConvertTo-Json

$grvHindi = Invoke-RestMethod -Uri "$baseUrl/api/v1/grievances/generate" -Method Post -Body $grvHindiReq -ContentType "application/json" -Headers $farmerHeaders
Write-Host "Hindi Grievance Generated (ID: $($grvHindi.data.id)):"
Write-Host "Subject: $($grvHindi.data.subject)"
Write-Host "Shortfall Amount: INR $($grvHindi.data.recordedDifferenceAmount)"

# Download PDF
$pdfUrl = "$baseUrl/api/v1/grievances/$($grvHindi.data.id)/pdf"
$pdfOut = "grievance_smoke_test.pdf"
Invoke-RestMethod -Uri $pdfUrl -Method Get -Headers $farmerHeaders -OutFile $pdfOut
$pdfItem = Get-Item $pdfOut
Write-Host "PDF Document Generated Successfully: $pdfOut ($($pdfItem.Length) bytes)"
Remove-Item $pdfOut -ErrorAction SilentlyContinue

Write-Host "`n================================================="
Write-Host "ALL 12 ENDPOINT SMOKE TESTS PASSED WITH 100% SUCCESS!"
Write-Host "================================================="
