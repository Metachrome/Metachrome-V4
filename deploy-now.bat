@echo off
echo 🚀 DEPLOYING METACHROME TO RAILWAY
echo ===================================

echo.
echo 📋 Adding test files to git...
git add create-deposits-table.js final-deposits-test.js fix-deposits-table.js test-real-deposit.js

echo.
echo 📋 Committing database fixes...
git commit -m "Database: Fix deposits table structure and add real-time sync support"

echo.
echo 📋 Pushing to Railway...
git push origin main

echo.
echo ✅ DEPLOYMENT INITIATED!
echo.
echo 📊 What happens next:
echo 1. Railway detects the push
echo 2. Builds the updated server with real-time sync
echo 3. Deploys to production (2-3 minutes)
echo 4. Your deposits will start appearing in admin dashboard
echo.
echo 🌐 URLs to test after deployment:
echo    User Wallet: https://metachrome-v2-production.up.railway.app/wallet
echo    Admin Dashboard: https://metachrome-v2-production.up.railway.app/admin/dashboard
echo.
echo 🧪 Test steps:
echo 1. Submit a deposit from user wallet
echo 2. Check admin dashboard - should show pending deposit
echo 3. Approve/reject from admin dashboard
echo 4. Verify user balance updates
echo.
pause
