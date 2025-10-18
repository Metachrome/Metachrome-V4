# 🧪 Redeem Code Testing Guide

## Overview
This guide walks you through testing all redeem code functionality in the admin dashboard.

---

## Prerequisites
- Server running at `http://localhost:3005`
- Logged in as Super Admin
- Browser DevTools open (F12) to see console logs

---

## Test 1: View Redeem Codes

### Steps
1. Navigate to Admin Dashboard
2. Click "Redeem Codes" tab
3. Verify you see:
   - **Stats Section** (top):
     - Active Codes: 4
     - Total Redeemed: (actual count)
     - Bonus Distributed: (actual total)
     - Usage Rate: (percentage)
   - **Redeem Codes Table** (middle):
     - FIRSTBONUS | $100 | 0/∞ | Unknown | 1/15/2024
     - LETSGO1000 | $1000 | 0/∞ | Unknown | 1/15/2024
     - WELCOME50 | $50 | 0/100 | Unknown | 2/1/2024
     - BONUS500 | $500 | 0/50 | Unknown | 2/15/2024
   - **User Redemption History Table** (bottom):
     - Shows all users who redeemed codes
     - Columns: Code, User, Amount, Redeemed Date, Status, Trades Progress

### Expected Result
✅ All three sections display correctly with real data

---

## Test 2: Create New Code

### Steps
1. Click "Create Code" button (purple button, top right)
2. Fill in the modal:
   - **Code**: TESTCODE
   - **Bonus Amount**: 250
   - **Max Uses**: 10
   - **Description**: Test code for verification
3. Click "Create Code" button
4. Check console for: `🎁 Creating redeem code: TESTCODE 250`

### Expected Result
✅ Toast notification: "Code Created - Redeem code TESTCODE created successfully"
✅ New code appears in table
✅ Console shows: `✅ Redeem code created: {...}`

### Verification
- Refresh page
- New code should still be in the table
- Stats should update if applicable

---

## Test 3: Edit Code

### Steps
1. Find TESTCODE in the table
2. Click "Edit" button
3. In the modal:
   - Change Bonus Amount: 250 → 300
   - Change Description: "Updated test code"
4. Click "Update Code"
5. Check console for: `🎁 Updating redeem code: TESTCODE`

### Expected Result
✅ Toast notification: "Code Updated - Redeem code TESTCODE updated successfully"
✅ Table updates with new amount ($300)
✅ Console shows: `✅ Redeem code updated: {...}`

### Verification
- Refresh page
- Changes should persist
- Amount should show $300

---

## Test 4: Disable Code

### Steps
1. Find TESTCODE in the table
2. Click "Disable" button (red button)
3. Check console for: `🎁 Disabling redeem code: TESTCODE`

### Expected Result
✅ Toast notification: "Code Disabled - Code disabled successfully"
✅ Code status changes to "Disabled"
✅ Console shows: `✅ Redeem code disabled: {...}`

### Verification
- Refresh page
- Code should still show as disabled
- Disable button should be grayed out

---

## Test 5: Delete Code

### Steps
1. Find TESTCODE in the table
2. Click "Delete" button (trash icon)
3. Check console for: `🎁 Deleting redeem code: TESTCODE`

### Expected Result
✅ Toast notification: "Code Deleted - Code deleted successfully"
✅ Code disappears from table
✅ Console shows: `✅ Redeem code deleted: {...}`

### Verification
- Refresh page
- Code should be completely gone
- Table should have one fewer row

---

## Test 6: User Redemption History

### Steps
1. As a regular user, go to Profile → Redeem
2. Enter code: FIRSTBONUS
3. Click "Redeem"
4. Go back to Admin Dashboard
5. Refresh page
6. Check User Redemption History table

### Expected Result
✅ New row appears in User Redemption History:
   - Code: FIRSTBONUS
   - User: (your username)
   - Amount: 100
   - Redeemed Date: (today's date/time)
   - Status: Pending Trades (or Completed if trades done)
   - Trades Progress: 0/10

### Verification
- Stats should update:
  - Total Redeemed: +1
  - Bonus Distributed: +100

---

## Test 7: One-Time Use Enforcement

### Steps
1. As same user, try to redeem FIRSTBONUS again
2. Should get error: "You have already used this redeem code"

### Expected Result
✅ Error message appears
✅ Balance doesn't increase
✅ Admin dashboard still shows only 1 redemption

---

## Console Logs to Watch For

### Successful Operations
```
🎁 Creating redeem code: TESTCODE 250
✅ Redeem code created: {...}

🎁 Updating redeem code: TESTCODE {...}
✅ Redeem code updated: {...}

🎁 Disabling redeem code: TESTCODE
✅ Redeem code disabled: {...}

🎁 Deleting redeem code: TESTCODE
✅ Redeem code deleted: {...}
```

### Error Logs
```
❌ Supabase update error: {...}
❌ Supabase delete error: {...}
❌ Error creating redeem code: {...}
```

---

## Troubleshooting

### Issue: "Code Deleted" but code still appears
**Solution**: 
- Check console for errors
- Verify Supabase table exists
- Try refreshing page
- Check if code was deleted by id instead of code field

### Issue: Edit doesn't save changes
**Solution**:
- Check console for update errors
- Verify bonus amount is a valid number
- Try refreshing page
- Check Supabase table permissions

### Issue: Create code fails
**Solution**:
- Verify code and bonus amount are filled
- Check console for specific error
- Verify Supabase table exists
- Check for duplicate code names

---

## Success Criteria

✅ All 7 tests pass
✅ No console errors
✅ Stats update correctly
✅ User Redemption History shows real data
✅ One-time use enforcement works
✅ Changes persist after refresh

---

## Next Steps

Once all tests pass:
1. Deploy to Railway
2. Test with production Supabase
3. Monitor for any issues
4. Celebrate! 🎉

