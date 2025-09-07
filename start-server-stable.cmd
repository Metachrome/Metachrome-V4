@echo off
title Metachrome Server
color 0A
echo.
echo ====================================
echo   METACHROME SERVER STARTUP
echo ====================================
echo.

echo [1/3] Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Starting server...
start /B npm run dev:tsx

echo [3/3] Waiting for server to initialize...
timeout /t 8 /nobreak >nul

echo.
echo Testing connection...
powershell -Command "if (Test-NetConnection -ComputerName 127.0.0.1 -Port 4000 -InformationLevel Quiet) { Write-Host 'SUCCESS: Server is running at http://127.0.0.1:4000' -ForegroundColor Green; Write-Host 'Admin Dashboard: http://127.0.0.1:4000/admin' -ForegroundColor Cyan } else { Write-Host 'FAILED: Server is not responding' -ForegroundColor Red }"

echo.
echo Server should now be accessible in your browser.
echo Press any key to close this window...
pause >nul
