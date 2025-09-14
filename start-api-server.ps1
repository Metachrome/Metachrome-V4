Write-Host "🚀 Starting METACHROME API Server on port 9999..." -ForegroundColor Green

# Kill any existing node processes
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Killed existing node processes" -ForegroundColor Yellow
} catch {
    Write-Host "ℹ️ No existing node processes to kill" -ForegroundColor Gray
}

# Wait a moment
Start-Sleep -Seconds 2

# Start the server
Write-Host "🌐 Starting server..." -ForegroundColor Cyan
Write-Host "📍 URL: http://localhost:9999/admin/dashboard" -ForegroundColor Yellow

try {
    node test-minimal-server.js
} catch {
    Write-Host "❌ Error starting server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
