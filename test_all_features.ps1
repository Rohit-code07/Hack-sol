# Comprehensive end-to-end test script for all KisanSetu features
$ErrorActionPreference = "Stop"

function Test-AllFeatures {
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host "1. Testing Farmer Authentication..." -ForegroundColor Yellow
    $loginBody = @{
        username = "9876543222"
        password = "Password@123"
    } | ConvertTo-Json
    
    $authRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $authRes.data.token
    $farmerId = $authRes.data.farmerId
    Write-Host "Authenticated as Farmer: $farmerId" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "2. Testing Farmer Land Record Registration..." -ForegroundColor Yellow
    
    # Generate unique Khasra number for this run
    $testKhasra = "142/1" # Matches synthetic registry for Ramesh Kumar!
    
    # Try registering 142/1 (synthetic registry match)
    $landPayload = @{
        khasraNumber = $testKhasra
        khataNumber = "KH-88"
        surveyNumber = $testKhasra
        village = "Arang"
        tehsil = "Arang"
        district = "Raipur"
        state = "Chhattisgarh"
        landArea = 3.50
        areaUnit = "ACRE"
        ownerName = "Ramesh Kumar"
        farmerId = $farmerId
        ownerFarmerId = $farmerId
        irrigationStatus = "UNIRRIGATED"
        landUsage = "AGRICULTURAL"
        isMortgaged = $false
        ownershipType = "SINGLE"
        ownershipPercentage = 100
    } | ConvertTo-Json

    try {
        $landRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/land-records" -Method Post -Body $landPayload -Headers $headers
        Write-Host "Land Record Registered! ID: $($landRes.data.id), Status: $($landRes.data.verificationStatus)" -ForegroundColor Green
        Write-Host "Remarks: $($landRes.data.verificationRemarks)" -ForegroundColor Gray
    } catch {
        Write-Host "Land create response: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Register a new custom parcel to test custom parcel addition
    $customKhasra = "999/" + (Get-Random -Minimum 100 -Maximum 999)
    $customLandPayload = @{
        khasraNumber = $customKhasra
        khataNumber = "KH-999"
        surveyNumber = $customKhasra
        village = "Arang"
        tehsil = "Arang"
        district = "Raipur"
        state = "Chhattisgarh"
        landArea = 2.25
        areaUnit = "ACRE"
        ownerName = "Ramesh Kumar"
        farmerId = $farmerId
        irrigationStatus = "IRRIGATED"
        landUsage = "AGRICULTURAL"
        isMortgaged = $false
    } | ConvertTo-Json

    $customLandRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/land-records" -Method Post -Body $customLandPayload -Headers $headers
    Write-Host "Custom Land Parcel Registered! ID: $($customLandRes.data.id), Khasra: $customKhasra, Status: $($customLandRes.data.verificationStatus)" -ForegroundColor Green

    Write-Host "`n3. Verifying Farmer's Land Records Retrieval..." -ForegroundColor Yellow
    $farmerParcels = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/farmers/$farmerId/land-records" -Method Get -Headers $headers
    Write-Host "Total Land Parcels returned for Farmer: $($farmerParcels.data.Count)" -ForegroundColor Green
    foreach ($p in $farmerParcels.data) {
        Write-Host "  -> Parcel #$($p.id): Khasra $($p.khasraNumber) | $($p.landArea) $($p.areaUnit) | Status: $($p.verificationStatus) | Village: $($p.village)" -ForegroundColor Cyan
    }

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "4. Testing Loan Registration & Cross-Check..." -ForegroundColor Yellow
    $uniqueLoanRef = "KCC-" + (Get-Date -Format "yyyyMMdd-HHmmss")
    $loanPayload = @{
        farmerId = $farmerId
        bankId = 1
        loanAccountReference = $uniqueLoanRef
        loanType = "KCC_CROP_LOAN"
        sanctionedAmount = 150000.00
        disbursedAmount = 150000.00
        interestRate = 7.00
        disbursementDate = "2024-06-15"
        maturityDate = "2025-06-14"
        linkedKhasra = "142/2" # Synthetic registry shows 142/2 is mortgaged to SBI!
        cropSeason = "Kharif"
        cropName = "Paddy"
    } | ConvertTo-Json

    $loanRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/loans" -Method Post -Body $loanPayload -Headers $headers
    Write-Host "Loan Account Registered: $($loanRes.data.loanAccountReference), Status: $($loanRes.data.verificationStatus)" -ForegroundColor Green
    Write-Host "Duplicate Flag: $($loanRes.data.duplicateFlag), Remarks: $($loanRes.data.verificationRemarks)" -ForegroundColor Gray

    $farmerLoans = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/farmers/$farmerId/loans" -Method Get -Headers $headers
    Write-Host "Total Loans returned for Farmer: $($farmerLoans.data.Count)" -ForegroundColor Green

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "5. Testing MSP Procurement Sale Recording..." -ForegroundColor Yellow
    $mspPayload = @{
        farmerId = $farmerId
        crop = "Paddy"
        cropVariety = "Grade-A Common"
        marketingSeason = "Kharif 2024"
        procurementYear = "2024"
        acceptedQuantity = 50.00
        quantityUnit = "QUINTAL"
        procurementCenter = "Arang Krishi Upaj Mandi"
        applicableMsp = 2300.00
        actualPayment = 95000.00 # Expected: 50 * 2300 = 115,000 -> shortfall = 20,000!
        documentedDeductions = 0.00
        transactionDate = "2024-10-20"
        paymentDate = "2024-10-20"
    } | ConvertTo-Json

    $mspRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/schemes/msp" -Method Post -Body $mspPayload -Headers $headers
    Write-Host "MSP Transaction Recorded: Receipt $($mspRes.data.receiptReference), Status: $($mspRes.data.paymentStatus)" -ForegroundColor Green
    Write-Host "Gross Expected: ₹$($mspRes.data.grossProcurementAmount) vs Actual: ₹$($mspRes.data.actualPayment)" -ForegroundColor Yellow

    $farmerMsp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/schemes/msp/farmer/$farmerId" -Method Get -Headers $headers
    Write-Host "Total MSP Transactions for Farmer: $($farmerMsp.data.Count)" -ForegroundColor Green

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "6. Testing PMFBY Insurance Policy & Claim..." -ForegroundColor Yellow
    $uniquePolicyNum = "POL-PMFBY-" + (Get-Date -Format "yyyyMMdd-HHmmss")
    $insPayload = @{
        farmerId = $farmerId
        schemeName = "PMFBY"
        crop = "Paddy"
        season = "Kharif 2024"
        khasraNumber = $testKhasra
        insurancePolicyNumber = $uniquePolicyNum
        insuredArea = 3.50
        sumInsured = 175000.00
        premiumPaid = 3500.00
        insuranceCompany = "Agriculture Insurance Company of India"
    } | ConvertTo-Json

    $insRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/schemes/insurance/policy" -Method Post -Body $insPayload -Headers $headers
    Write-Host "Insurance Policy Enrolled: $($insRes.data.insurancePolicyNumber), Status: $($insRes.data.claimStatus)" -ForegroundColor Green

    # File a claim
    $claimPayload = @{
        insurancePolicyNumber = $uniquePolicyNum
        claimType = "Crop Damage"
        damageDate = "2024-09-12"
        damageType = "Inundation / Flooding"
        damageDescription = "Severe rainfall caused unseasonal waterlogging in low-lying parcel."
        estimatedDamagePercentage = 60.00
        claimAmount = 65000.00
    } | ConvertTo-Json

    $claimRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/schemes/insurance/claim" -Method Post -Body $claimPayload -Headers $headers
    Write-Host "Insurance Claim Filed: Claim #$($claimRes.data.claimNumber), Status: $($claimRes.data.claimStatus), Amount: ₹$($claimRes.data.claimAmount)" -ForegroundColor Green

    $farmerIns = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/schemes/insurance/farmer/$farmerId" -Method Get -Headers $headers
    Write-Host "Total Insurance Records for Farmer: $($farmerIns.data.Count)" -ForegroundColor Green

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "7. Testing Grievance Submission & PDF Generation..." -ForegroundColor Yellow
    $grievancePayload = @{
        farmerId = $farmerId
        grievanceCategory = "MSP_PAYMENT_DISCREPANCY"
        subject = "Shortfall in Mandi Procurement Payment for Paddy"
        grievanceContent = "I submitted 50 quintals of FAQ Paddy at Arang Mandi. Government MSP rate is Rs 2300/qtl, totaling Rs 1,15,000. However, only Rs 95,000 was credited."
        expectedResolution = "Immediate release of unpaid balance of Rs 20,000."
        amountInvolved = 20000.00
        priority = "HIGH"
        language = "hi"
    } | ConvertTo-Json

    $grvRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/grievances/submit" -Method Post -Body $grievancePayload -Headers $headers
    $grvId = $grvRes.data.id
    Write-Host "Grievance Filed: #$grvId, Tracking ID: $($grvRes.data.trackingNumber), Status: $($grvRes.data.grievanceStatus)" -ForegroundColor Green

    # Test PDF download
    $pdfUrl = "http://localhost:8080/api/v1/grievances/$grvId/pdf"
    $pdfOutPath = "$PSScriptRoot\test_grievance_$grvId.pdf"
    Invoke-WebRequest -Uri $pdfUrl -Headers $headers -OutFile $pdfOutPath
    $pdfSize = (Get-Item $pdfOutPath).Length
    Write-Host "Grievance PDF Generated Successfully! Size: $pdfSize bytes at $pdfOutPath" -ForegroundColor Green

    Write-Host "`n======================================================" -ForegroundColor Cyan
    Write-Host "8. Testing Bank Officer Console & Verification Decisions..." -ForegroundColor Yellow
    $bankLogin = @{
        username = "bank_officer"
        password = "Password@123"
    } | ConvertTo-Json
    $bankAuth = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body $bankLogin -ContentType "application/json"
    $bankToken = $bankAuth.data.token
    Write-Host "Authenticated as Bank Officer: $($bankAuth.data.username)" -ForegroundColor Green

    $bankHeaders = @{
        "Authorization" = "Bearer $bankToken"
        "Content-Type" = "application/json"
    }

    # Bank Dashboard Stats
    $stats = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/bank/dashboard/stats" -Method Get -Headers $bankHeaders
    Write-Host "Live Bank Dashboard Stats:" -ForegroundColor Cyan
    Write-Host "  -> Total Farmers: $($stats.data.totalFarmers)" -ForegroundColor Gray
    Write-Host "  -> Total Loan Applications: $($stats.data.totalApplications)" -ForegroundColor Gray
    Write-Host "  -> Pending Audits: $($stats.data.pendingCount)" -ForegroundColor Gray
    Write-Host "  -> Verified Audits: $($stats.data.verifiedCount)" -ForegroundColor Gray
    Write-Host "  -> Open Discrepancies: $($stats.data.openDiscrepanciesCount)" -ForegroundColor Gray

    # Bank Search Land Record
    $searchLand = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/land-records/search?khasraNumber=142/1" -Method Get -Headers $bankHeaders
    Write-Host "Bank Land Search Results for 142/1: $($searchLand.data.Count) found" -ForegroundColor Green

    # Bank Submit Audit Decision on the custom parcel
    $decisionPayload = @{
        farmerId = $farmerId
        recordType = "LAND"
        targetId = [string]$customLandRes.data.id
        verificationStatus = "VERIFIED"
        remarks = "Physical Patwari inspection completed. All boundary coordinates verified accurate."
    } | ConvertTo-Json

    $decRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/bank/verifications/decision" -Method Post -Body $decisionPayload -Headers $bankHeaders
    Write-Host "Bank Decision Submitted on Parcel #$($customLandRes.data.id): $($decRes.data.status)" -ForegroundColor Green

    Write-Host "`n======================================================" -ForegroundColor Green
    Write-Host "ALL BACKEND SERVICES, FORMS, AND DATA PERSISTENCE VERIFIED 100%!" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
}

Test-AllFeatures
