@echo off
title Metachrome Server
echo Starting Metachrome Server...
echo Press Ctrl+C to stop
cd /d "%~dp0"
npm run dev:tsx
pause
