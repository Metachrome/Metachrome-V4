@echo off
title Port Availability Test
echo Testing port availability...
echo.

echo [TEST 1] Checking port 3001...
netstat -an | find ":3001" >nul
if %errorLevel% == 0 (
    echo ❌ Port 3001 is BUSY
    echo Processes using port 3001:
    netstat -ano | find ":3001"
) else (
    echo ✅ Port 3001 is AVAILABLE
)

echo.
echo [TEST 2] Checking port 4000...
netstat -an | find ":4000" >nul
if %errorLevel% == 0 (
    echo ❌ Port 4000 is BUSY
    echo Processes using port 4000:
    netstat -ano | find ":4000"
) else (
    echo ✅ Port 4000 is AVAILABLE
)

echo.
echo [TEST 3] Checking for node.exe processes...
tasklist | find "node.exe" >nul
if %errorLevel% == 0 (
    echo ⚠️ Node.exe processes found:
    tasklist | find "node.exe"
) else (
    echo ✅ No node.exe processes running
)

echo.
pause
