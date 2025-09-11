@echo off
echo Starting METACHROME Local Server...
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

REM Clear environment variables that might interfere
set NODE_OPTIONS=
set NODE_ENV=development

REM Show current directory
echo Current directory: %CD%
echo.

REM Check Node.js version
echo Checking Node.js...
node --version
echo.

REM Try to start the server
echo Starting local debug server...
echo.
node fixed-debug.js

pause
