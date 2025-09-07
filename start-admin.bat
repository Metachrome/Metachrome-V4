@echo off
title Metachrome Server - Administrator Mode
echo ==========================================
echo   METACHROME SERVER - ADMINISTRATOR MODE
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ NOT running as Administrator
    echo Please right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo [STEP 1] Killing any existing node processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Killed existing node processes
) else (
    echo ℹ️ No existing node processes found
)

echo.
echo [STEP 2] Checking port 3001 availability...
netstat -an | find ":3001" >nul
if %errorLevel% == 0 (
    echo ⚠️ Port 3001 is in use, attempting to free it...
    REM Kill any process using port 3001
    for /f "tokens=5" %%a in ('netstat -ano ^| find ":3001"') do taskkill /F /PID %%a >nul 2>&1
) else (
    echo ✅ Port 3001 is available
)

echo.
echo [STEP 3] Temporarily disabling Windows Defender real-time protection...
echo Note: This requires administrator privileges
powershell -Command "Set-MpPreference -DisableRealtimeMonitoring $true" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Windows Defender real-time protection disabled
    echo ⚠️ Remember to re-enable it later!
) else (
    echo ⚠️ Could not disable Windows Defender (this is normal on some systems)
)

echo.
echo [STEP 4] Starting Metachrome server on port 3001...
echo Server will be available at: http://127.0.0.1:3001/admin
echo.

REM Start the server
npm run dev:tsx

echo.
echo [STEP 5] Re-enabling Windows Defender real-time protection...
powershell -Command "Set-MpPreference -DisableRealtimeMonitoring $false" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Windows Defender real-time protection re-enabled
)

echo.
echo Server has stopped. Press any key to exit...
pause >nul
