$body = @{
    tradeId = "28991cdd-2a1b-43f1-8971-722e7b76cc41"
    userId = "user-angela-1758195715"
    won = $false
    amount = 100
    payout = 0
} | ConvertTo-Json

try {
    Write-Host "Testing completion for trade: 28991cdd-2a1b-43f1-8971-722e7b76cc41"
    $response = Invoke-WebRequest -Uri "http://localhost:3005/api/trades/complete" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Status:" $response.StatusCode
    Write-Host "Response:" $response.Content
    
    # Check if trade was updated
    Write-Host "`nChecking if trade was updated..."
    $tradesResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
    $trades = $tradesResponse.Content | ConvertFrom-Json
    $trade = $trades | Where-Object { $_.id -eq "28991cdd-2a1b-43f1-8971-722e7b76cc41" }
    
    if ($trade) {
        Write-Host "Trade found after completion:"
        Write-Host "ID:" $trade.id
        Write-Host "Result:" $trade.result
        Write-Host "Profit/Loss:" $trade.profit_loss
        Write-Host "Exit Price:" $trade.exit_price
        Write-Host "Updated:" $trade.updated_at
        
        if ($trade.result -ne "pending") {
            Write-Host "SUCCESS! Trade was updated properly"
        } else {
            Write-Host "FAILED! Trade is still pending"
        }
    } else {
        Write-Host "Trade not found"
    }
} catch {
    Write-Host "Error:" $_.Exception.Message
}
