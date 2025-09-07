# PowerShell script to run development server with auto-restart
# This script will keep the server running and restart it if it crashes

Write-Host "🚀 Starting Metachrome V2 Development Server..." -ForegroundColor Green
Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Function to cleanup processes
function Stop-DevServer {
    Write-Host "🔄 Stopping development server..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name tsx -ErrorAction SilentlyContinue | Stop-Process -Force
    exit 0
}

# Handle Ctrl+C gracefully
$null = Register-EngineEvent PowerShell.Exiting -Action { Stop-DevServer }

# Retry loop
$maxRetries = 5
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        Write-Host "📊 Attempt $($retryCount + 1) of $maxRetries" -ForegroundColor Cyan
        
        # Stop any existing processes
        Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        
        # Start the development server
        npm run dev
        
        # If we reach here, the server exited normally
        Write-Host "⚠️  Server exited. Restarting in 3 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        $retryCount++
        
    } catch {
        Write-Host "❌ Error starting server: $($_.Exception.Message)" -ForegroundColor Red
        $retryCount++
        Start-Sleep -Seconds 3
    }
}

Write-Host "❌ Failed to start server after $maxRetries attempts" -ForegroundColor Red
exit 1
