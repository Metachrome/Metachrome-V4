@echo off
echo 🧹 Cleaning up any existing node processes...
taskkill /F /IM node.exe 2>nul || echo No node processes found

echo 🔄 Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo 🚀 Starting METACHROME server...
node working-server.js

pause
