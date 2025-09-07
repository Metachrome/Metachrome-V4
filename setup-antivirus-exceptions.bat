@echo off
title Metachrome - Setup Antivirus Exceptions
echo ============================================
echo   METACHROME ANTIVIRUS EXCEPTION SETUP
echo ============================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ This script must be run as Administrator
    echo Please right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Setting up Windows Defender exceptions for Metachrome...
echo.

REM Add current directory to Windows Defender exclusions
echo [1/4] Adding project folder to exclusions...
powershell -Command "Add-MpPreference -ExclusionPath '%CD%'" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Added %CD% to Windows Defender exclusions
) else (
    echo ⚠️ Could not add folder exclusion
)

REM Add node.exe to process exclusions
echo [2/4] Adding node.exe to process exclusions...
powershell -Command "Add-MpPreference -ExclusionProcess 'node.exe'" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Added node.exe to Windows Defender process exclusions
) else (
    echo ⚠️ Could not add process exclusion
)

REM Add npm to process exclusions
echo [3/4] Adding npm to process exclusions...
powershell -Command "Add-MpPreference -ExclusionProcess 'npm.exe'" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Added npm.exe to Windows Defender process exclusions
) else (
    echo ⚠️ Could not add npm exclusion
)

REM Add ports to firewall exceptions
echo [4/4] Adding firewall exceptions for ports 3001 and 4000...
netsh advfirewall firewall add rule name="Metachrome Port 3001" dir=in action=allow protocol=TCP localport=3001 >nul 2>&1
netsh advfirewall firewall add rule name="Metachrome Port 4000" dir=in action=allow protocol=TCP localport=4000 >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Added firewall exceptions for ports 3001 and 4000
) else (
    echo ⚠️ Could not add firewall exceptions
)

echo.
echo ============================================
echo   SETUP COMPLETE!
echo ============================================
echo.
echo You can now run start-admin.bat to start the server.
echo.
echo IMPORTANT: Remember to check your third-party antivirus
echo software and add exceptions for:
echo - This project folder: %CD%
echo - node.exe process
echo - npm.exe process
echo.
pause
