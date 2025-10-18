# 🧪 Test One-Time Use Redeem Code

## Quick Test Steps

### Setup
1. Open browser at `http://localhost:3005`
2. Open DevTools (F12) → Console tab
3. Login as a user (or create test account)

---

## Test 1: First Redemption ✅

### Steps
1. Go to **Profile** → **Redeem**
2. Enter code: `FIRSTBONUS`
3. Click **Redeem**

### Expected Result
- ✅ Toast: "Bonus of 100 USDT added!"
- ✅ Balance increases by 100 USDT
- ✅ Console shows: `✅ One-time use check passed`

### Console Output
```
🔍 CHECKING ONE-TIME USE - User: user-123 Code: FIRSTBONUS
✅ One-time use check passed, proceeding with redemption
✅ Code redeemed successfully
```

---

## Test 2: Second Redemption (Same Code) ❌

### Steps
1. Same user, same page
2. Enter code: `FIRSTBONUS` again
3. Click **Redeem**

### Expected Result
- ❌ Error: "You have already used this redeem code"
- ❌ Balance does NOT increase
- ❌ Console shows: `❌ ONE-TIME USE VIOLATION`

### Console Output
```
🔍 CHECKING ONE-TIME USE - User: user-123 Code: FIRSTBONUS
❌ ONE-TIME USE VIOLATION: User already used this code: FIRSTBONUS
```

---

## Test 3: Different Code (Same User) ✅

### Steps
1. Same user
2. Enter code: `WELCOME50`
3. Click **Redeem**

### Expected Result
- ✅ Toast: "Bonus of 50 USDT added!"
- ✅ Balance increases by 50 USDT
- ✅ Console shows: `✅ One-time use check passed`

### Console Output
```
🔍 CHECKING ONE-TIME USE - User: user-123 Code: WELCOME50
✅ One-time use check passed, proceeding with redemption
✅ Code redeemed successfully
```

---

## Test 4: Same Code (Different User) ✅

### Steps
1. Logout current user
2. Login as different user
3. Go to **Profile** → **Redeem**
4. Enter code: `FIRSTBONUS`
5. Click **Redeem**

### Expected Result
- ✅ Toast: "Bonus of 100 USDT added!"
- ✅ Balance increases by 100 USDT
- ✅ Each user can redeem each code once

### Console Output
```
🔍 CHECKING ONE-TIME USE - User: user-456 Code: FIRSTBONUS
✅ One-time use check passed, proceeding with redemption
✅ Code redeemed successfully
```

---

## Test 5: Admin Dashboard Verification

### Steps
1. Login as Super Admin
2. Go to **Admin Dashboard** → **Redeem Codes**
3. Check **User Redemption History** table

### Expected Result
- ✅ Shows all users who redeemed codes
- ✅ Each user-code combination appears only once
- ✅ Stats show correct totals

### Example Table
```
Code       | User    | Amount | Redeemed Date      | Status         | Trades
FIRSTBONUS | user-1  | 100    | 1/15/2025 10:30 AM | Pending Trades | 0/10
WELCOME50  | user-1  | 50     | 1/15/2025 10:35 AM | Pending Trades | 0/10
FIRSTBONUS | user-2  | 100    | 1/15/2025 10:40 AM | Pending Trades | 0/10
```

---

## Available Test Codes

| Code | Amount | Max Uses |
|------|--------|----------|
| FIRSTBONUS | 100 USDT | Unlimited |
| LETSGO1000 | 1000 USDT | Unlimited |
| WELCOME50 | 50 USDT | 100 |
| BONUS500 | 500 USDT | 50 |

---

## Success Criteria

✅ Test 1: First redemption works
✅ Test 2: Second redemption blocked
✅ Test 3: Different code works
✅ Test 4: Different user can redeem same code
✅ Test 5: Admin dashboard shows correct history

---

## Troubleshooting

### Issue: Second redemption still works
**Solution**:
- Check console for errors
- Verify server restarted with new code
- Check if using different browser/incognito
- Clear browser cache

### Issue: Error message not showing
**Solution**:
- Check browser console (F12)
- Look for network errors
- Verify authentication token is valid
- Check server logs

### Issue: Balance not updating
**Solution**:
- Refresh page to see updated balance
- Check admin dashboard for redemption history
- Verify Supabase connection
- Check server logs for errors

---

## Console Debugging

### Enable Full Logging
Open browser console and look for:
- 🔍 = One-time use check
- ✅ = Success
- ❌ = Error/Violation
- 💰 = Balance update
- 📝 = History recording

### Check Server Logs
Terminal should show:
```
🔍 CHECKING ONE-TIME USE - User: ... Code: ...
❌ ONE-TIME USE VIOLATION: ...
```

---

## Status: Ready to Test! 🚀

The one-time use enforcement is now active. Test it out and verify that users can only redeem each code once!

