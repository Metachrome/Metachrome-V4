@echo off
title METACHROME V2 - Admin Server with User Editing
color 0A
cls

echo.
echo ========================================
echo    METACHROME V2 - ADMIN SERVER
echo    WITH USER EDITING FUNCTIONALITY
echo ========================================
echo.

echo [INFO] Killing any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo [INFO] Starting METACHROME V2 Admin Server...
echo.

node quick-admin-server.js

echo.
echo [INFO] Server has stopped.
pause
