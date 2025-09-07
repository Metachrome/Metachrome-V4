@echo off
title METACHROME V2 - Clean Server
color 0A

echo.
echo ========================================
echo   METACHROME V2 - CLEAN SERVER
echo ========================================
echo.
echo Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Starting clean server...
node clean-server.js

echo.
echo Server stopped. Press any key to exit...
pause >nul
