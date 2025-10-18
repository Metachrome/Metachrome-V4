# 🧪 Quick Test Checklist - Redeem Code System

## Pre-Test Setup
- [ ] Server running at `http://localhost:3005`
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible
- [ ] Have test user account ready

---

## Test 1: One-Time Use Enforcement ✅

### First Redemption
- [ ] Login as user
- [ ] Go to Profile → Redeem Codes
- [ ] Enter: `FIRSTBONUS`
- [ ] Click Redeem
- [ ] **Expected**: Toast shows "Bonus of 100 USDT added!"
- [ ] **Expected**: Balance increases by 100 USDT
- [ ] **Expected**: Console shows: `✅ One-time use check passed`

### Second Redemption (Same Code)
- [ ] Same user, same page
- [ ] Enter: `FIRSTBONUS` again
- [ ] Click Redeem
- [ ] **Expected**: Error toast "You have already used this redeem code"
- [ ] **Expected**: Balance does NOT increase
- [ ] **Expected**: Console shows: `❌ ONE-TIME USE VIOLATION`

### Different Code (Same User)
- [ ] Enter: `WELCOME50`
- [ ] Click Redeem
- [ ] **Expected**: Toast shows "Bonus of 50 USDT added!"
- [ ] **Expected**: Balance increases by 50 USDT
- [ ] **Expected**: Console shows: `✅ One-time use check passed`

---

## Test 2: Admin Delete ✅

### Delete Code
- [ ] Logout user
- [ ] Login as Super Admin
- [ ] Go to Admin Dashboard → Redeem Codes
- [ ] Click Delete (trash icon) on any code
- [ ] **Expected**: Toast shows "Code Deleted"
- [ ] **Expected**: Console shows: `✅ Redeem code deleted`
- [ ] Refresh page
- [ ] **Expected**: Code is gone from list

---

## Test 3: Admin Edit ✅

### Edit Code Amount
- [ ] Click Edit on a code
- [ ] Change amount to 999
- [ ] Click Save
- [ ] **Expected**: Toast shows "Code Updated"
- [ ] **Expected**: Console shows: `✅ Redeem code updated`
- [ ] Refresh page
- [ ] **Expected**: Amount shows 999

---

## Test 4: Admin Create ✅

### Create New Code
- [ ] Click Create Code button
- [ ] Enter Code: `TEST123`
- [ ] Enter Amount: 500
- [ ] Click Create
- [ ] **Expected**: Toast shows "Code Created"
- [ ] **Expected**: Console shows: `✅ Redeem code created`
- [ ] Refresh page
- [ ] **Expected**: `TEST123` appears in list with 500 USDT

---

## Test 5: Admin Disable ✅

### Disable Code
- [ ] Click Disable on a code
- [ ] **Expected**: Toast shows "Code Disabled"
- [ ] **Expected**: Console shows: `✅ Redeem code disabled`
- [ ] Refresh page
- [ ] **Expected**: Code status shows "Disabled"

---

## Test 6: Real-Time Sync ✅

### User Redeems → Admin Sees It
- [ ] Open two browser windows
- [ ] Window 1: User logged in, Profile → Redeem
- [ ] Window 2: Admin logged in, Admin Dashboard → Redeem Codes
- [ ] User redeems `LETSGO1000`
- [ ] **Expected**: Window 1 shows success
- [ ] **Expected**: Window 2 auto-updates (or refresh)
- [ ] **Expected**: "User Redemption History" shows the redemption

---

## Test 7: Different User Same Code ✅

### User 2 Redeems Same Code
- [ ] Logout current user
- [ ] Login as different user
- [ ] Go to Profile → Redeem
- [ ] Enter: `FIRSTBONUS`
- [ ] Click Redeem
- [ ] **Expected**: Toast shows "Bonus of 100 USDT added!"
- [ ] **Expected**: Balance increases by 100 USDT
- [ ] **Expected**: Each user can redeem each code once

---

## Console Verification

### Look for these messages:

**Successful Redemption**:
```
🔍 CHECKING ONE-TIME USE - User: ... Code: FIRSTBONUS
✅ One-time use check passed, proceeding with redemption
✅ Code redeemed successfully
```

**Blocked Redemption**:
```
🔍 CHECKING ONE-TIME USE - User: ... Code: FIRSTBONUS
❌ ONE-TIME USE VIOLATION: User already used this code: FIRSTBONUS
```

**Admin Delete**:
```
🎁 Redeem code action: FIRSTBONUS delete
🎁 Supabase available: true
✅ Redeem code deleted
```

---

## Success Criteria

✅ All 7 tests pass
✅ Console shows correct messages
✅ No errors in console
✅ Admin actions persist after refresh
✅ One-time use is enforced
✅ Real-time sync works

---

## If Tests Fail

### One-Time Use Still Allows Duplicates
- [ ] Check console for error messages
- [ ] Verify server restarted with new code
- [ ] Check if using different browser/incognito
- [ ] Clear browser cache

### Admin Actions Don't Work
- [ ] Check if Supabase is connected
- [ ] Look for error messages in console
- [ ] Verify admin authentication token
- [ ] Check server logs

### Real-Time Sync Not Working
- [ ] Refresh admin dashboard manually
- [ ] Check if WebSocket is connected
- [ ] Verify Supabase connection
- [ ] Check server logs for errors

---

## Status: Ready to Test! 🚀

All fixes are in place. Run through these tests to verify everything works!

