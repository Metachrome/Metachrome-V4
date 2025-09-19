$body = @{
    tradeId = "07caa236-65f8-41cc-8f78-7fafb63c647c"
    userId = "user-angela-1758195715"
    won = $false
    amount = 100
    payout = 0
} | ConvertTo-Json

try {
    Write-Host "Testing completion for trade: 07caa236-65f8-41cc-8f78-7fafb63c647c"
    $response = Invoke-WebRequest -Uri "http://localhost:3005/api/trades/complete" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Status:" $response.StatusCode
    Write-Host "Response:" $response.Content
} catch {
    Write-Host "Error:" $_.Exception.Message
}
