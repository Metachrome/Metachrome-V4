@echo off
echo ========================================
echo   DEPLOYING CRYPTOTRADEX FIXES
echo ========================================
echo.

echo Checking if Vercel CLI is available...
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
)

echo.
echo Building the application...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed! Please check for errors.
    pause
    exit /b 1
)

echo.
echo Build successful! Now deploying...
echo.

echo Attempting to deploy with Vercel...
vercel --prod

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   DEPLOYMENT FAILED
    echo ========================================
    echo.
    echo Please try one of these alternatives:
    echo.
    echo 1. Go to Vercel Dashboard:
    echo    https://vercel.com/dashboard
    echo    Find your project and click "Redeploy"
    echo.
    echo 2. If you have repository access:
    echo    git push origin main
    echo.
    echo 3. Manual deployment via Vercel Dashboard
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo Your fixes have been deployed:
echo - Admin button removed from navigation
echo - User logout functionality fixed
echo - Admin logout functionality fixed
echo - Admin login token issue resolved
echo.
echo Visit your site to verify the changes:
echo https://crypto-trade-x.vercel.app
echo.
pause
