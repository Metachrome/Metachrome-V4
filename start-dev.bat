@echo off
echo 🚀 Starting Metachrome V2 Development Server...
echo ⏹️  Press Ctrl+C to stop the server
echo.

:retry
echo 📊 Starting server...
call npm run dev
if errorlevel 1 (
    echo ⚠️  Server crashed. Restarting in 3 seconds...
    timeout /t 3 /nobreak >nul
    goto retry
)

echo ✅ Server stopped gracefully
pause
