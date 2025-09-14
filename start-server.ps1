Write-Host "🚀 Starting METACHROME server..." -ForegroundColor Green
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

try {
    Write-Host "🔍 Checking if Node.js is available..." -ForegroundColor Cyan
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    Write-Host "🔍 Checking if test-minimal-server.js exists..." -ForegroundColor Cyan
    if (Test-Path "test-minimal-server.js") {
        Write-Host "✅ Server file found" -ForegroundColor Green
        
        Write-Host "🚀 Starting server..." -ForegroundColor Green
        node test-minimal-server.js
    } else {
        Write-Host "❌ Server file not found" -ForegroundColor Red
        Write-Host "📁 Files in current directory:" -ForegroundColor Yellow
        Get-ChildItem -Name "*.js" | ForEach-Object { Write-Host "  - $_" }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
