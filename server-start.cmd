@echo off
title Metachrome V2 Development Server
echo Starting Metachrome V2 Development Server...
echo Server will run at http://127.0.0.1:4000
echo Close this window to stop the server
echo.

cd /d "%~dp0"
npm run dev:tsx
pause
