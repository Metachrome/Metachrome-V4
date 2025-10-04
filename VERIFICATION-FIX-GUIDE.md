# 🔧 Verification Status Fix Guide

## Problem
After deploying to Railway, user verification status is reset to "unverified" even though they were previously verified.

## Root Cause
- Database data is not persistent between deployments
- Verification status is stored in the database but gets reset
- Need to re-verify users after each deployment

## Solution

### Option 1: Quick Fix - Run Verification Script

#### Step 1: Get Railway Database URL
1. Go to Railway dashboard
2. Click on your PostgreSQL database
3. Go to "Variables" tab
4. Copy the `DATABASE_URL` value

#### Step 2: Update Script
Open `fix-railway-verification.js` and replace the DATABASE_URL:

```javascript
const DATABASE_URL = "YOUR_RAILWAY_DATABASE_URL_HERE";
```

#### Step 3: Run the Script
```bash
node fix-railway-verification.js
```

This script will:
- ✅ Check all users and their verification status
- ✅ Find users with approved documents
- ✅ Auto-verify users who have approved documents
- ✅ Auto-verify all superadmin accounts (they don't need verification)
- ✅ Show final verification status

#### Step 4: Restart Railway Server
After running the script:
1. Go to Railway dashboard
2. Click "Restart" on your server
3. Wait for deployment to complete

#### Step 5: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use: `Ctrl + Shift + Delete` → Clear cache

#### Step 6: Login Again
1. Logout from the application
2. Login again
3. Verification status should now be "verified"

---

### Option 2: Check Current Status

To just check the current verification status without making changes:

```bash
node check-railway-users.js
```

This will show:
- All users and their verification status
- All verification documents
- Summary of verified/unverified users

---

## Permanent Solution

### Make Superadmin Bypass Verification

The code has been updated so that **superadmin accounts don't need verification**.

**Changes made in `OptionsPage.tsx`:**

```typescript
// Desktop View (Line 1149)
{(!user?.verification_status || user?.verification_status === 'unverified') && user?.role !== 'superadmin' ? (
  // Show verification warning
) : (
  // Show trading buttons
)}

// Mobile View (Line 1567)
{(!user?.verification_status || user?.verification_status === 'unverified') && user?.role !== 'superadmin' ? (
  // Show verification warning
) : (
  // Show trading buttons
)}
```

**Result:**
- ✅ Superadmin → Can trade immediately (no verification needed)
- ✅ Regular users with verified status → Can trade
- ❌ Regular users without verification → Must upload documents

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin', 'superadmin'
  verification_status VARCHAR(20) DEFAULT 'unverified', -- 'unverified', 'pending', 'verified', 'rejected'
  has_uploaded_documents BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  ...
);
```

### Verification Documents Table
```sql
CREATE TABLE user_verification_documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  document_type VARCHAR(50),
  document_url TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  verified_at TIMESTAMP,
  admin_notes TEXT,
  ...
);
```

---

## Verification Flow

### For Regular Users:
1. User uploads verification documents
2. Document status: `pending`
3. User verification_status: `pending`
4. Admin reviews and approves/rejects
5. If approved:
   - Document status: `approved`
   - User verification_status: `verified`
   - User can now trade

### For Superadmin:
1. No verification needed
2. Can trade immediately
3. Bypass all verification checks

---

## Troubleshooting

### Issue: Still showing "Verification Required" after running script

**Solution:**
1. Check if user role is correctly set to 'superadmin' in database
2. Clear browser cache completely
3. Logout and login again
4. Check browser console for errors

### Issue: Script fails to connect to database

**Solution:**
1. Verify DATABASE_URL is correct
2. Check if Railway database is running
3. Check if your IP is whitelisted (if applicable)
4. Try running from Railway CLI: `railway run node fix-railway-verification.js`

### Issue: Verification status changes back to unverified

**Solution:**
1. This means database is being reset on deployment
2. Check Railway volume/persistence settings
3. Make sure database is not ephemeral
4. Consider using Railway's persistent PostgreSQL addon

---

## Testing

### Test Superadmin Bypass:
1. Login as superadmin
2. Go to Options Trading page
3. Should NOT see "Verification Required" warning
4. Should see UP/DOWN trading buttons immediately

### Test Regular User:
1. Login as regular user
2. If verified → Can trade
3. If unverified → See "Upload Documents" button

---

## Scripts Reference

### `fix-railway-verification.js`
- Fixes verification status for all users
- Auto-verifies superadmin accounts
- Updates users with approved documents

### `check-railway-users.js`
- Read-only script
- Shows current verification status
- Lists all users and documents

---

## Environment Variables

Make sure these are set in Railway:

```env
DATABASE_URL=postgresql://...
NODE_ENV=production
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
```

---

## Next Steps

1. ✅ Run `fix-railway-verification.js` to fix current users
2. ✅ Restart Railway server
3. ✅ Clear browser cache
4. ✅ Test login as superadmin
5. ✅ Test login as regular user
6. ✅ Verify trading works without verification warning

---

## Support

If issues persist:
1. Check Railway logs: `railway logs`
2. Check browser console for errors
3. Run `check-railway-users.js` to see current status
4. Verify database connection is working

