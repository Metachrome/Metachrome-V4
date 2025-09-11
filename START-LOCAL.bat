@echo off
echo ========================================
echo    METACHROME Local Server Starter
echo ========================================
echo.

REM Kill any existing processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1

REM Clear environment
set NODE_OPTIONS=
set NODE_ENV=development

echo Current directory: %CD%
echo Node.js version:
node --version
echo.

echo Starting METACHROME local server...
echo Server will be available at: http://127.0.0.1:3001
echo.

REM Start the CommonJS server
node local-server.cjs

echo.
echo Server stopped.
pause
