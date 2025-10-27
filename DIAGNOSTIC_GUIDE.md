# 🔍 Diagnostic Guide - Why Issues Still Persist

## The Real Problem

The system is likely **falling back to local file storage** instead of using Supabase. This happens when:

1. `SUPABASE_URL` environment variable is NOT set on Railway
2. `SUPABASE_SERVICE_ROLE_KEY` environment variable is NOT set on Railway
3. The server falls back to saving users to local JSON files
4. Token generation uses a different ID format than the stored user ID
5. Document upload fails because user lookup fails

## Step 1: Check System Status

**Go to your app and visit:**
```
https://your-railway-app.up.railway.app/api/system-status
```

**You should see something like:**
```json
{
  "isSupabaseConfigured": true,
  "supabaseUrl": "https://xxxxx.supabase.co...",
  "supabaseKeySet": true,
  "nodeEnv": "production",
  "port": 3000,
  "timestamp": "2025-10-27T..."
}
```

**If you see:**
```json
{
  "isSupabaseConfigured": false,
  "supabaseUrl": "NOT SET",
  "supabaseKeySet": false,
  ...
}
```

**THEN THE PROBLEM IS: Supabase is not configured on Railway!**

## Step 2: Check Railway Environment Variables

1. Go to **Railway Dashboard**
2. Select your **Metachrome project**
3. Click on the **server service**
4. Go to **Variables** tab
5. Look for:
   - `SUPABASE_URL` - Should be like `https://xxxxx.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` - Should be a long string

**If these are missing, you need to add them!**

## Step 3: Get Your Supabase Credentials

1. Go to **Supabase Dashboard** (https://app.supabase.com)
2. Select your **Metachrome project**
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → This is `SUPABASE_URL`
   - **Service Role Key** → This is `SUPABASE_SERVICE_ROLE_KEY`

## Step 4: Add to Railway

1. Go back to **Railway Dashboard**
2. Click on your **server service**
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add:
   ```
   SUPABASE_URL = https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
6. Click **Deploy** or **Restart**

## Step 5: Verify Deployment

1. Wait 2-3 minutes for Railway to restart
2. Visit `/api/system-status` again
3. Check if `isSupabaseConfigured` is now `true`

## Step 6: Test the Flow

1. Sign up as a new user
2. Upload a verification document
3. Check admin dashboard
4. Check if document appears in pending verifications

## If Still Not Working

**Check Railway Logs:**
1. Go to Railway Dashboard
2. Select your server service
3. Click **Logs** tab
4. Look for errors like:
   - `❌ Supabase insert error`
   - `🔄 Falling back to file storage`
   - `❌ Database error`

**Share these logs with me and I'll help debug!**

## What I Fixed in Latest Code

✅ Added `/api/system-status` endpoint to diagnose configuration
✅ Fixed UUID generation for local storage fallback
✅ Improved error logging for debugging
✅ Enhanced retry logic for document uploads
✅ Removed verification filter in admin dashboard

## Next Steps

1. **Check `/api/system-status`** - Is Supabase configured?
2. **If NO** - Add environment variables to Railway
3. **If YES** - Check Railway logs for errors
4. **Test signup and document upload**
5. **Report back with results**

