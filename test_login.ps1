try {
    $res = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/auth/login' -Method Post -Body (@{username='bank_officer'; password='Password@123'} | ConvertTo-Json) -ContentType 'application/json'
    Write-Host "SUCCESS: $($res.data.username) token: $($res.data.token.Substring(0,15))..."
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
}
