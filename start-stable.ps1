#!/usr/bin/env powershell
# Start Metachrome Server with stable process isolation

Write-Host "🚀 Starting Metachrome Server..." -ForegroundColor Green
Write-Host "📍 Working Directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "⚡ Node Version: $(node --version)" -ForegroundColor Cyan

# Kill any existing node processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start server in a new process group to avoid SIGINT
Write-Host "🔄 Starting server..." -ForegroundColor Green
Start-Process -FilePath "npm" -ArgumentList "run", "dev:tsx" -NoNewWindow -PassThru

# Wait and test connection
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test connection
$connection = Test-NetConnection -ComputerName 127.0.0.1 -Port 4000 -InformationLevel Quiet
if ($connection) {
    Write-Host "✅ Server is running at http://127.0.0.1:4000" -ForegroundColor Green
    Write-Host "🌐 Admin Dashboard: http://127.0.0.1:4000/admin" -ForegroundColor Cyan
} else {
    Write-Host "❌ Server failed to start" -ForegroundColor Red
}
