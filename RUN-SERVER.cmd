@echo off
cls
echo.
echo ========================================
echo          METACHROME SERVER
echo ========================================
echo.

echo Killing any existing processes...
taskkill /F /IM node.exe >nul 2>&1

echo Starting server on port 4000...
echo Open your browser to: http://127.0.0.1:4000/admin
echo.
echo Press Ctrl+C to stop the server
echo.

set PORT=4000
set ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4000,http://127.0.0.1:4000
npm run dev:tsx

echo.
echo Server stopped.
pause
