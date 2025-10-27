# METACHROME V2 - Document Upload & User Registration Fixes

## Issues Fixed

### Issue 1: Document Upload Failing with "Invalid authentication" Error
**Root Cause:** 
- Newly created users were not being saved to Supabase with all required fields
- Token decoding was failing for newly created users
- User lookup from token was not retrying or falling back properly

**Fix Applied:**
- Enhanced `createUser()` function to save all user fields to Supabase:
  - `verification_status` (default: 'unverified')
  - `has_uploaded_documents` (default: false)
  - `balance`, `status`, `trading_mode`, `referral_code`, `total_trades`
- Improved `getUserFromToken()` function with:
  - Better Base64 decoding error handling
  - Retry logic with 500ms delays (up to 5 attempts)
  - Fallback to Supabase lookup for newly created users
  - Fallback to local storage if Supabase fails

### Issue 2: New Users Not Appearing in Superadmin Dashboard
**Root Cause:**
- User data was not being properly persisted to Supabase
- Missing verification columns in the users table

**Fix Applied:**
- Updated `createUser()` to include all required fields
- Added proper error handling and logging
- Ensured users are saved to Supabase before token generation

### Issue 3: Missing Verification Columns in Supabase
**Root Cause:**
- Database schema was incomplete
- Missing `user_verification_documents` table

**Fix Applied:**
- Created SQL migration files:
  - `ADD_VERIFICATION_COLUMNS_TO_USERS.sql` - Adds verification columns
  - `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql` - Creates documents table
- Created setup guide: `VERIFICATION_SETUP_GUIDE.md`

## Code Changes

### File: working-server.js

#### Change 1: Enhanced createUser() function (lines 739-773)
```javascript
// Now includes all required fields:
- verification_status
- has_uploaded_documents
- balance
- status
- trading_mode
- referral_code
- referred_by
- total_trades
```

#### Change 2: Improved getUserFromToken() with retry logic (lines 8472-8550)
```javascript
// Added:
- Better error logging
- Retry logic with 500ms delays
- Supabase fallback lookup
- Local storage fallback
- Enhanced token format analysis
```

## Database Setup Required

Run these SQL scripts in Supabase SQL Editor:

1. **ADD_VERIFICATION_COLUMNS_TO_USERS.sql**
   - Adds: verification_status, has_uploaded_documents, verified_at
   - Creates index for verification_status

2. **CREATE_VERIFICATION_DOCUMENTS_TABLE.sql**
   - Creates user_verification_documents table
   - Sets up RLS policies
   - Creates indexes for performance

## Testing Checklist

- [ ] Run SQL migration scripts in Supabase
- [ ] Sign up as new user with document upload
- [ ] Verify document upload succeeds
- [ ] Check new user appears in admin dashboard
- [ ] Verify verification status shows "Pending"
- [ ] Test document approval/rejection in admin panel

## Deployment Steps

1. Deploy updated `working-server.js` to production
2. Run SQL migration scripts in Supabase dashboard
3. Test signup flow with document upload
4. Monitor server logs for any errors
5. Verify new users appear in admin dashboard

## Rollback Plan

If issues occur:
1. Revert `working-server.js` to previous version
2. SQL changes are backward compatible (use IF NOT EXISTS)
3. No data loss - only adding new columns/tables

## Performance Impact

- Minimal: Added retry logic with 500ms delays (only for new users)
- Database queries are indexed for fast lookups
- No impact on existing functionality

