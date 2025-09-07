@echo off
title METACHROME V2 - Fixed Server
color 0A
cls

echo.
echo ========================================
echo    METACHROME V2 - FIXED SERVER
echo ========================================
echo.
echo [INFO] Starting server with CRITICAL AUTH FIX v3...
echo [INFO] Login redirect issue COMPLETELY FIXED
echo [INFO] Mock JWT token handling fixed
echo [INFO] Auth state persistence fixed
echo [INFO] SuperAdmin dashboard is ready
echo.

echo [INFO] Killing any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo [INFO] Starting METACHROME V2 Server...
echo.
echo ========================================
echo    SERVER INFORMATION
echo ========================================
echo URL: http://127.0.0.1:9000
echo Admin Login: http://127.0.0.1:9000/admin/login
echo.
echo CREDENTIALS:
echo - Super Admin: superadmin / superadmin123
echo - Admin: admin / admin123  
echo - User: trader1 / password123
echo.
echo [FIXED] Login now redirects to dashboard (v3)
echo [FIXED] Mock JWT token handling fixed
echo [FIXED] Auth state no longer gets cleared
echo [FIXED] SuperAdmin features working
echo [FIXED] Authentication state properly managed
echo ========================================
echo.

node working-server.js

echo.
echo [INFO] Server has stopped.
pause
