Write-Host "🚀 COMPREHENSIVE TRADE TEST STARTING..." -ForegroundColor Green

try {
    # Step 1: Check initial trade count
    Write-Host "`n📊 Step 1: Checking initial trade count..." -ForegroundColor Yellow
    $initialResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
    $initialTrades = $initialResponse.Content | ConvertFrom-Json
    Write-Host "📊 Initial trade count: $($initialTrades.Length)" -ForegroundColor Cyan
    
    # Step 2: Place a new trade
    Write-Host "`n📈 Step 2: Placing new trade..." -ForegroundColor Yellow
    $tradeData = @{
        userId = "user-angela-1758195715"
        symbol = "BTCUSDT"
        direction = "up"
        amount = 100
        duration = 30
    } | ConvertTo-Json
    
    $tradeResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/trades/place" -Method POST -Body $tradeData -ContentType "application/json"
    $tradeResult = $tradeResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Trade response status: $($tradeResponse.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Trade success: $($tradeResult.success)" -ForegroundColor Green
    
    if (-not $tradeResult.success) {
        Write-Host "❌ Trade placement failed!" -ForegroundColor Red
        Write-Host "Error: $($tradeResult.message)" -ForegroundColor Red
        return
    }
    
    $tradeId = $tradeResult.trade.id
    Write-Host "✅ Trade placed successfully with ID: $tradeId" -ForegroundColor Green
    
    # Step 3: Check trade count after placement
    Write-Host "`n📊 Step 3: Checking trade count after placement..." -ForegroundColor Yellow
    $afterResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
    $afterTrades = $afterResponse.Content | ConvertFrom-Json
    Write-Host "📊 Trade count after placement: $($afterTrades.Length)" -ForegroundColor Cyan
    
    # Find the new trade
    $newTrade = $afterTrades | Where-Object { $_.id -eq $tradeId }
    if ($newTrade) {
        Write-Host "✅ New trade found in database:" -ForegroundColor Green
        Write-Host "   ID: $($newTrade.id)" -ForegroundColor White
        Write-Host "   Result: $($newTrade.result)" -ForegroundColor White
        Write-Host "   Entry Price: $($newTrade.entry_price)" -ForegroundColor White
        Write-Host "   Amount: $($newTrade.amount)" -ForegroundColor White
        Write-Host "   Created: $($newTrade.created_at)" -ForegroundColor White
    } else {
        Write-Host "❌ New trade NOT found in database!" -ForegroundColor Red
        Write-Host "Available trade IDs:" -ForegroundColor Yellow
        $afterTrades | ForEach-Object { Write-Host "   $($_.id)" -ForegroundColor Gray }
        return
    }
    
    # Step 4: Wait for automatic completion
    Write-Host "`n⏳ Step 4: Waiting 35 seconds for automatic completion..." -ForegroundColor Yellow
    Start-Sleep -Seconds 35
    
    # Step 5: Check final trade status
    Write-Host "`n📊 Step 5: Checking final trade status..." -ForegroundColor Yellow
    $finalResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
    $finalTrades = $finalResponse.Content | ConvertFrom-Json
    Write-Host "📊 Final trade count: $($finalTrades.Length)" -ForegroundColor Cyan
    
    $finalTrade = $finalTrades | Where-Object { $_.id -eq $tradeId }
    if ($finalTrade) {
        Write-Host "✅ Trade found in final results:" -ForegroundColor Green
        Write-Host "   ID: $($finalTrade.id)" -ForegroundColor White
        Write-Host "   Result: $($finalTrade.result)" -ForegroundColor White
        Write-Host "   Entry Price: $($finalTrade.entry_price)" -ForegroundColor White
        Write-Host "   Exit Price: $($finalTrade.exit_price)" -ForegroundColor White
        Write-Host "   Profit/Loss: $($finalTrade.profit_loss)" -ForegroundColor White
        Write-Host "   Updated: $($finalTrade.updated_at)" -ForegroundColor White
        
        if ($finalTrade.result -eq "pending") {
            Write-Host "❌ FAILED! Trade is still pending after 35 seconds" -ForegroundColor Red
            
            # Step 6: Try manual completion
            Write-Host "`n🔧 Step 6: Attempting manual completion..." -ForegroundColor Yellow
            $completionData = @{
                tradeId = $tradeId
                userId = "user-angela-1758195715"
                won = $false
                amount = 100
                payout = 0
            } | ConvertTo-Json
            
            $completionResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/trades/complete" -Method POST -Body $completionData -ContentType "application/json"
            $completionResult = $completionResponse.Content | ConvertFrom-Json
            
            Write-Host "🔧 Manual completion status: $($completionResponse.StatusCode)" -ForegroundColor Green
            Write-Host "🔧 Manual completion success: $($completionResult.success)" -ForegroundColor Green
            Write-Host "🔧 Manual completion message: $($completionResult.message)" -ForegroundColor Green
            
            # Check trade status after manual completion
            Write-Host "`n📊 Step 7: Checking trade status after manual completion..." -ForegroundColor Yellow
            $manualResponse = Invoke-WebRequest -Uri "http://localhost:3005/api/users/user-angela-1758195715/trades" -Method GET
            $manualTrades = $manualResponse.Content | ConvertFrom-Json
            $manualTrade = $manualTrades | Where-Object { $_.id -eq $tradeId }
            
            if ($manualTrade) {
                Write-Host "✅ Trade after manual completion:" -ForegroundColor Green
                Write-Host "   ID: $($manualTrade.id)" -ForegroundColor White
                Write-Host "   Result: $($manualTrade.result)" -ForegroundColor White
                Write-Host "   Exit Price: $($manualTrade.exit_price)" -ForegroundColor White
                Write-Host "   Profit/Loss: $($manualTrade.profit_loss)" -ForegroundColor White
                Write-Host "   Updated: $($manualTrade.updated_at)" -ForegroundColor White
                
                if ($manualTrade.result -ne "pending") {
                    Write-Host "✅ SUCCESS! Manual completion worked" -ForegroundColor Green
                } else {
                    Write-Host "❌ FAILED! Manual completion did not update trade" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "✅ SUCCESS! Trade was automatically completed" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Trade not found in final results" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
}
