@echo off
echo 🚀 DEPLOYING METACHROME TO RAILWAY
echo ===================================

echo.
echo 📋 Step 1: Checking git status...
git status

echo.
echo 📋 Step 2: Adding all changes...
git add .

echo.
echo 📋 Step 3: Committing changes...
git commit -m "Fix: Add real-time deposit sync and admin approval endpoints"

echo.
echo 📋 Step 4: Pushing to Railway...
git push origin main

echo.
echo ✅ DEPLOYMENT INITIATED!
echo.
echo 📊 Next steps:
echo 1. Wait 2-3 minutes for Railway to build and deploy
echo 2. Check Railway dashboard for deployment status
echo 3. Test deposit creation again
echo 4. Verify admin dashboard shows pending deposits
echo.
echo 🌐 Railway Dashboard: https://railway.app/dashboard
echo 🌐 Production URL: https://metachrome-v2-production.up.railway.app
echo.
pause
