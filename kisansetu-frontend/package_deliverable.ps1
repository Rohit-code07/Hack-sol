$sourceDir = "C:\Users\dewan\Downloads\kisansetu-frontend1\kisansetu-frontend"
$scratchDir = "C:\Users\dewan\.gemini\antigravity\scratch\kisansetu-frontend"
$zipPath = "C:\Users\dewan\Downloads\kisansetu-frontend-fixed.zip"
$artifactZip = "C:\Users\dewan\.gemini\antigravity\brain\8b881883-2b15-4eb5-b9ac-1ba7371c3590\kisansetu-frontend-fixed.zip"

Write-Host "Syncing files to scratch directory..."
Copy-Item (Join-Path $sourceDir "index.html") (Join-Path $scratchDir "index.html") -Force
Copy-Item (Join-Path $sourceDir "src\*") (Join-Path $scratchDir "src") -Recurse -Force

Write-Host "Preparing zip archive..."
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$tempStage = Join-Path $env:TEMP ("ks_stage_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempStage | Out-Null

Get-ChildItem -Path $sourceDir -Exclude "node_modules", "dist", ".git" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempStage -Recurse -Force
}

Compress-Archive -Path "$tempStage\*" -DestinationPath $zipPath -Force
Remove-Item -Path $tempStage -Recurse -Force

Copy-Item -Path $zipPath -Destination $artifactZip -Force
Write-Host "Deliverable created successfully. Size:" (Get-Item $zipPath).Length
