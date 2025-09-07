@echo off
title Metachrome Server - FINAL
echo Starting Metachrome Server with maximum stability...
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start the server with proper process isolation
start /B /WAIT npm run dev:tsx

echo.
echo If you see this message, the server has stopped.
echo Press any key to restart...
pause >nul
goto :start
