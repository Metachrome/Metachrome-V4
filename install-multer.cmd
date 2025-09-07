@echo off
echo Installing multer package for file uploads...
echo.

REM Install multer package
echo [1/2] Installing multer...
npm install multer

echo.
echo [2/2] Installing multer types...
npm install @types/multer

echo.
echo ✅ Multer installation complete!
echo.
echo You can now restart the server to enable full file upload functionality.
echo Run: RUN-SERVER.cmd
echo.
pause
