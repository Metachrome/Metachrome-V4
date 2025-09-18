@echo off
echo ⚡ METACHROME V2 - Auto Build & Restart
echo.

:BUILD_LOOP
echo 🔨 Building client...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Press any key to retry...
    pause > nul
    goto BUILD_LOOP
)

echo ✅ Build completed successfully!
echo.
echo 🔄 Changes applied! Your admin dashboard should now show:
echo   📱 Responsive table with horizontal scrolling
echo   ✂️ Proper text truncation for long wallet addresses
echo   🎨 Custom scrollbar styling
echo   ⚡ Real-time user updates
echo.
echo 🌐 Open: http://localhost:3001/admin
echo 💡 Use Ctrl+F5 to force refresh if needed
echo.
echo Press any key to build again, or close this window...
pause > nul
goto BUILD_LOOP
