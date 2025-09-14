Write-Host "🚀 Starting METACHROME Unified Server..." -ForegroundColor Green
Write-Host "📁 Current directory: $PWD" -ForegroundColor Yellow

# Kill any existing node processes
Write-Host "🔄 Stopping existing servers..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Check if unified-server.js exists
if (Test-Path "unified-server.js") {
    Write-Host "✅ Found unified-server.js" -ForegroundColor Green
} else {
    Write-Host "❌ unified-server.js not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "🌐 Admin Dashboard will be available at: http://localhost:9999/admin/dashboard" -ForegroundColor Cyan
Write-Host "⚠️  Keep this window open to keep the server running!" -ForegroundColor Yellow
Write-Host ""

# Start the server
& node unified-server.js
