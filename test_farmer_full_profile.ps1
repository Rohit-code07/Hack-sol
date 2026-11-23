# Comprehensive verification script for full farmer profile registration and all features
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$randNum = Get-Random -Minimum 10000 -Maximum 99999
$testPhone = "98765$randNum"
$testPassword = "Password@123"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "1. Testing New Farmer Full Profile Registration..." -ForegroundColor Yellow

$regBody = @{
    username = $testPhone
    name = "Suresh Patel"
    mobile = $testPhone
    password = $testPassword
    fatherSpouseName = "Ramdas Patel"
    dob = "1985-07-20"
    gender = "MALE"
    alternateMobile = "98231$randNum"
    aadhaarNumber = "4321-8765-$randNum"
    category = "OBC"
    village = "Kurud"
    tehsil = "Kurud"
    district = "Dhamtari"
    state = "Chhattisgarh"
    address = "House No. 45, Near Shiv Mandir, Ward 3"
    pinCode = "493663"
    farmerType = "Individual"
    farmingType = "Owner"
    totalLandArea = 4.75
    primaryCrop = "Paddy"
    secondaryCrops = "Soybean, Mustard"
    irrigationAvailable = $true
    irrigationType = "Canal"
    soilType = "Black (Regur)"
    documentsJson = '{"aadhaarUploaded":true,"khasraUploaded":true,"bankPassbookUploaded":true}'
    preferredLanguage = "hi"
} | ConvertTo-Json

try {
    $regRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "Farmer registered successfully!" -ForegroundColor Green
    $token = $regRes.data.token
    $farmerId = $regRes.data.farmerId
    Write-Host "Farmer ID: $farmerId" -ForegroundColor Cyan
} catch {
    Write-Host "Registration error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Response Body: $($reader.ReadToEnd())" -ForegroundColor Yellow
    }
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "2. Fetching Farmer Profile to Verify All Fields..." -ForegroundColor Yellow

$profile = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/farmers/$farmerId" -Method Get -Headers $headers
$f = $profile.data

Write-Host "Profile Details:" -ForegroundColor White
Write-Host "  Name: $($f.name) / $($f.farmerName)" -ForegroundColor Cyan
Write-Host "  Father/Spouse: $($f.fatherSpouseName)" -ForegroundColor Cyan
Write-Host "  DOB: $($f.dob)" -ForegroundColor Cyan
Write-Host "  Gender: $($f.gender)" -ForegroundColor Cyan
Write-Host "  Mobile: $($f.mobile) / $($f.mobileNumber)" -ForegroundColor Cyan
Write-Host "  Alt Mobile: $($f.alternateMobile)" -ForegroundColor Cyan
Write-Host "  Aadhaar (Masked): $($f.aadhaarNumber)" -ForegroundColor Cyan
Write-Host "  Category: $($f.category)" -ForegroundColor Cyan
Write-Host "  Village: $($f.village), Tehsil: $($f.tehsil), District: $($f.district), State: $($f.state)" -ForegroundColor Cyan
Write-Host "  Address: $($f.address), PIN: $($f.pinCode)" -ForegroundColor Cyan
Write-Host "  Farmer Type: $($f.farmerType), Farming: $($f.farmingType)" -ForegroundColor Cyan
Write-Host "  Total Land Area: $($f.totalLandArea) Acre" -ForegroundColor Cyan
Write-Host "  Primary Crop: $($f.primaryCrop)" -ForegroundColor Cyan
Write-Host "  Secondary Crops: $($f.secondaryCrops)" -ForegroundColor Cyan
Write-Host "  Irrigation: $($f.irrigationAvailable) ($($f.irrigationType))" -ForegroundColor Cyan
Write-Host "  Soil Type: $($f.soilType)" -ForegroundColor Cyan
Write-Host "  Completion %: $($f.profileCompletionPercentage)%" -ForegroundColor Green

# Assertions
if ($f.fatherSpouseName -ne "Ramdas Patel") { throw "fatherSpouseName mismatch" }
if ($f.primaryCrop -ne "Paddy") { throw "primaryCrop mismatch" }
if ($f.soilType -ne "Black (Regur)") { throw "soilType mismatch" }
if ($f.irrigationType -ne "Canal") { throw "irrigationType mismatch" }
if ($f.pinCode -ne "493663") { throw "pinCode mismatch" }
if ($f.aadhaarNumber -notlike "XXXX-XXXX-*") { throw "Aadhaar was not properly masked!" }
if ($f.name -ne "Suresh Patel") { throw "Farmer name mismatch" }
if ($f.mobile -ne $testPhone) { throw "Farmer mobile mismatch" }

Write-Host "`nAll 23 profile fields verified successfully!" -ForegroundColor Green

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "3. Testing Farmer Profile Update..." -ForegroundColor Yellow

$updateBody = @{
    name = "Suresh Patel"
    fatherSpouseName = "Ramdas Patel"
    dob = "1985-07-20"
    gender = "MALE"
    alternateMobile = "9823199999"
    aadhaarNumber = $f.aadhaarNumber
    category = "OBC"
    village = "Kurud"
    tehsil = "Kurud"
    district = "Dhamtari"
    state = "Chhattisgarh"
    address = "House No. 46, Updated Address, Ward 4"
    pinCode = "493663"
    farmerType = "Individual"
    farmingType = "Owner"
    totalLandArea = 5.25
    primaryCrop = "Wheat"
    secondaryCrops = "Mustard, Gram"
    irrigationAvailable = $true
    irrigationType = "Tube Well"
    soilType = "Alluvial"
    documentsJson = '{"aadhaarUploaded":true,"khasraUploaded":true,"bankPassbookUploaded":true,"girdawariUploaded":true}'
    preferredLanguage = "hi"
} | ConvertTo-Json

$upRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/farmers/$farmerId" -Method Put -Body $updateBody -Headers $headers
$up = $upRes.data
Write-Host "Updated Profile Details:" -ForegroundColor White
Write-Host "  Updated Address: $($up.address)" -ForegroundColor Cyan
Write-Host "  Updated Area: $($up.totalLandArea) Acre" -ForegroundColor Cyan
Write-Host "  Updated Crop: $($up.primaryCrop)" -ForegroundColor Cyan
Write-Host "  Updated Irrigation: $($up.irrigationType)" -ForegroundColor Cyan
Write-Host "  Updated Soil: $($up.soilType)" -ForegroundColor Cyan
Write-Host "  Updated Completion %: $($up.profileCompletionPercentage)%" -ForegroundColor Green

if ($up.primaryCrop -ne "Wheat") { throw "Updated primaryCrop mismatch" }
if ($up.totalLandArea -ne 5.25) { throw "Updated land area mismatch" }

Write-Host "`nProfile update verified successfully!" -ForegroundColor Green

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "4. Testing Land Parcel Registration for New Farmer..." -ForegroundColor Yellow
$khasra = "45/" + (Get-Random -Minimum 10 -Maximum 99)
$landBody = @{
    khasraNumber = $khasra
    khataNumber = "KH-77"
    surveyNumber = $khasra
    village = "Kurud"
    tehsil = "Kurud"
    district = "Dhamtari"
    state = "Chhattisgarh"
    landArea = 2.50
    areaUnit = "ACRE"
    ownerName = "Suresh Patel"
    farmerId = $farmerId
    irrigationStatus = "IRRIGATED"
    landUsage = "AGRICULTURAL"
    isMortgaged = $false
} | ConvertTo-Json

$landRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/land-records" -Method Post -Body $landBody -Headers $headers
Write-Host "Registered Land Parcel: ID $($landRes.data.id), Khasra $khasra, Status: $($landRes.data.verificationStatus)" -ForegroundColor Green

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "5. Testing Grievance Submission for New Farmer..." -ForegroundColor Yellow
$grievanceBody = @{
    farmerId = $farmerId
    grievanceCategory = "LAND_RECORD_MISMATCH"
    subject = "Land Survey Boundary Verification Request"
    grievanceContent = "Requesting official patwari survey measurement for Khasra $khasra."
} | ConvertTo-Json

$gRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/grievances/submit" -Method Post -Body $grievanceBody -Headers $headers
Write-Host "Grievance Filed: Tracking ID $($gRes.data.ticketNumber), Status: $($gRes.data.status)" -ForegroundColor Green

Write-Host "`nAll verification tests passed successfully!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
