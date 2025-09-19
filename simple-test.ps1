Write-Host "🚀 SIMPLE TRADE TEST STARTING..." -ForegroundColor Green

try {
    # Step 1: Check initial trade count
    Write-Host "`n📊 Checking initial trade count..." -ForegroundColor Yellow
    $initialResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
    $initialTrades = $initialResponse.Content | ConvertFrom-Json
    Write-Host "📊 Initial trade count: $($initialTrades.Length)" -ForegroundColor Cyan
    
    # Step 2: Place a new trade
    Write-Host "`n📈 Placing new trade..." -ForegroundColor Yellow
    $tradeData = @{
        userId = "user-angela-1758195715"
        symbol = "BTCUSDT"
        direction = "up"
        amount = 100
        duration = 30
    } | ConvertTo-Json
    
    $tradeResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/trades/place" -Method POST -Body $tradeData -ContentType "application/json"
    $tradeResult = $tradeResponse.Content | ConvertFrom-Json
    
    if ($tradeResult.success) {
        $tradeId = $tradeResult.trade.id
        Write-Host "✅ Trade placed successfully with ID: $tradeId" -ForegroundColor Green
        
        # Step 3: Check if trade was saved to database
        Write-Host "`n📊 Checking if trade was saved to database..." -ForegroundColor Yellow
        $afterResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
        $afterTrades = $afterResponse.Content | ConvertFrom-Json
        Write-Host "📊 Trade count after placement: $($afterTrades.Length)" -ForegroundColor Cyan
        
        $newTrade = $afterTrades | Where-Object { $_.id -eq $tradeId }
        if ($newTrade) {
            Write-Host "✅ Trade found in database:" -ForegroundColor Green
            Write-Host "   ID: $($newTrade.id)" -ForegroundColor White
            Write-Host "   Result: $($newTrade.result)" -ForegroundColor White
            Write-Host "   Entry Price: $($newTrade.entry_price)" -ForegroundColor White
            Write-Host "   Amount: $($newTrade.amount)" -ForegroundColor White
        } else {
            Write-Host "❌ Trade NOT found in database!" -ForegroundColor Red
        }
        
        # Step 4: Wait and check for auto-completion
        Write-Host "`n⏳ Waiting 35 seconds for auto-completion..." -ForegroundColor Yellow
        Start-Sleep -Seconds 35
        
        $finalResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
        $finalTrades = $finalResponse.Content | ConvertFrom-Json
        $finalTrade = $finalTrades | Where-Object { $_.id -eq $tradeId }
        
        if ($finalTrade) {
            Write-Host "✅ Final trade status:" -ForegroundColor Green
            Write-Host "   Result: $($finalTrade.result)" -ForegroundColor White
            Write-Host "   Exit Price: $($finalTrade.exit_price)" -ForegroundColor White
            Write-Host "   Profit/Loss: $($finalTrade.profit_loss)" -ForegroundColor White
            
            if ($finalTrade.result -eq "pending") {
                Write-Host "❌ FAILED! Trade still pending" -ForegroundColor Red
            } else {
                Write-Host "✅ SUCCESS! Trade completed automatically" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "❌ Trade placement failed: $($tradeResult.message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}
