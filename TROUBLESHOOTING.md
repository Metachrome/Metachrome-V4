# Troubleshooting Guide - Document Upload & User Registration

## Common Issues and Solutions

### Issue 1: Policy Already Exists Error
**Error:** `ERROR: 42710: policy "Users can view their own documents" for table "user_verification_documents" already exists`

**Solution:**
- Use the updated `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql` (now includes DROP POLICY IF EXISTS)
- Or see `FIX_POLICY_ERROR.md` for manual fix

**Status:** ✅ FIXED in updated script

---

### Issue 2: Document Upload Still Fails After SQL Migration

**Symptoms:**
- Upload fails with "Invalid authentication" error
- Error appears in browser console

**Causes & Solutions:**

1. **Server not restarted after code deployment**
   - Restart the server after deploying `working-server.js`
   - Check that new code is running: look for new log messages

2. **Supabase credentials not set**
   - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in environment
   - Check `.env` or environment variables

3. **User not saved to Supabase**
   - Check server logs for "User created in Supabase" message
   - Query Supabase: `SELECT * FROM users ORDER BY created_at DESC LIMIT 1;`

4. **Token decoding issue**
   - Check server logs for "Token format analysis" messages
   - Verify token is being generated correctly

**Debug Steps:**
```bash
# Check server logs
tail -f /path/to/server/logs

# Look for these messages:
# ✅ User created in Supabase
# 📄 Getting user from token
# 📄 User from token: {id, username}
```

---

### Issue 3: New Users Not Appearing in Admin Dashboard

**Symptoms:**
- User signs up successfully
- User doesn't appear in admin dashboard
- But user can log in

**Causes & Solutions:**

1. **Admin dashboard not refreshing**
   - Refresh the page (F5 or Cmd+R)
   - Clear browser cache
   - Try incognito/private window

2. **User not saved to Supabase**
   - Check server logs for errors during user creation
   - Query: `SELECT COUNT(*) FROM users;`
   - Query: `SELECT * FROM users WHERE email = 'user@example.com';`

3. **Admin dashboard filtering**
   - Check if user has verification_status set
   - Superadmin should see all users
   - Regular admin might see filtered list

**Debug Steps:**
```sql
-- Check if user exists
SELECT id, username, email, created_at FROM users 
ORDER BY created_at DESC LIMIT 5;

-- Check verification status
SELECT id, username, verification_status, has_uploaded_documents 
FROM users WHERE email = 'user@example.com';
```

---

### Issue 4: Verification Columns Missing

**Error:** `column "verification_status" does not exist`

**Solution:**
1. Run `ADD_VERIFICATION_COLUMNS_TO_USERS.sql` in Supabase
2. Verify columns exist:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('verification_status', 'has_uploaded_documents', 'verified_at');
```

---

### Issue 5: user_verification_documents Table Missing

**Error:** `relation "user_verification_documents" does not exist`

**Solution:**
1. Run `CREATE_VERIFICATION_DOCUMENTS_TABLE.sql` in Supabase
2. Verify table exists:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_verification_documents';
```

---

### Issue 6: 401 Unauthorized During Document Upload

**Symptoms:**
- Document upload fails with 401 error
- "Invalid authentication" message

**Causes:**
1. Token not being sent in request
2. Token format incorrect
3. User not found in database

**Debug:**
1. Check browser console for token value
2. Check server logs for token analysis
3. Verify user exists in Supabase

**Server Log to Look For:**
```
📄 Auth token (first 50 chars): user-session-...
📄 User from token: {id, username}
```

---

### Issue 7: Supabase Connection Error

**Error:** `Failed to connect to Supabase` or similar

**Causes:**
1. Invalid Supabase URL
2. Invalid service role key
3. Network connectivity issue

**Solutions:**
1. Verify credentials in `.env`:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

2. Test connection:
   ```bash
   curl https://xxxxx.supabase.co/rest/v1/users?limit=1 \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
   ```

---

## Verification Checklist

After fixes, verify:

- [ ] SQL migrations ran without errors
- [ ] Verification columns exist in users table
- [ ] user_verification_documents table exists
- [ ] RLS policies are set up correctly
- [ ] Server code deployed and restarted
- [ ] New user can sign up with document
- [ ] Document upload succeeds
- [ ] New user appears in admin dashboard
- [ ] Verification status shows "Pending"

---

## Getting Help

1. **Check server logs** - Most issues are logged
2. **Check Supabase dashboard** - Verify data is being saved
3. **Check browser console** - Look for JavaScript errors
4. **Review documentation** - See VERIFICATION_SETUP_GUIDE.md

---

## Quick Diagnostic Query

Run this in Supabase SQL Editor to check everything:

```sql
-- Check users table
SELECT 'Users table' as check_name, COUNT(*) as count FROM users;

-- Check verification columns
SELECT 'Verification columns' as check_name, 
  COUNT(*) as count 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('verification_status', 'has_uploaded_documents', 'verified_at');

-- Check verification documents table
SELECT 'Verification documents table' as check_name, COUNT(*) as count 
FROM user_verification_documents;

-- Check RLS policies
SELECT 'RLS policies' as check_name, COUNT(*) as count 
FROM pg_policies 
WHERE tablename = 'user_verification_documents';
```

All counts should be > 0 if setup is correct.

