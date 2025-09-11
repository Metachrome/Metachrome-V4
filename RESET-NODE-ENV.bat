@echo off
echo Resetting Node.js Environment...
echo.

REM Kill all Node processes
echo Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1

REM Clear environment variables
echo Clearing environment variables...
set NODE_OPTIONS=
set NODE_ENV=
set NPM_CONFIG_CACHE=
set NPM_CONFIG_PREFIX=

REM Show Node.js info
echo.
echo Node.js Information:
node --version
npm --version

REM Show current directory
echo.
echo Current Directory: %CD%

REM Try to start server
echo.
echo Starting METACHROME server...
echo.
node fixed-debug.js

pause
