$body = @{
    tradeId = "3ec6227d-50e3-42e9-b4ac-6b73a9d0d1b6"
    userId = "user-angela-1758195715"
    won = $false
    amount = 100
    payout = 0
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3005/api/trades/complete" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Status:" $response.StatusCode
    Write-Host "Response:" $response.Content
} catch {
    Write-Host "Error:" $_.Exception.Message
}
