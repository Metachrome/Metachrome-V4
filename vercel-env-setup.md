# 🔧 Vercel Environment Variables Setup

## 🚨 Current Issue
The admin dashboard is failing because environment variables are not set in Vercel production.

**Error**: `ENOTFOUND db.pybsyzbxyliufkgywtpf.supabase.co`
**Cause**: DATABASE_URL environment variable not set in Vercel

## 📋 Required Environment Variables

Copy these EXACT values to your Vercel dashboard:

### 1. DATABASE_URL
```
postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres
```

### 2. JWT_SECRET
```
036ff29bd784e58a11b82982ef4f0eca6e7d94f9df28d51f98ea1a729cc30827
```

### 3. SESSION_SECRET
```
81a419d14338a01de910f95eb82b5af27f86a30a9e214374edf1a75202546b8e
```

### 4. NODE_ENV
```
production
```

### 5. ALLOWED_ORIGINS
```
https://metachrome-v2.vercel.app
```

## 🔗 How to Add Environment Variables

1. **Go to**: https://vercel.com/temanly-ids-projects/metachrome-v2/settings/environment-variables

2. **For each variable above**:
   - Click "Add New"
   - Enter the **Name** (e.g., `DATABASE_URL`)
   - Enter the **Value** (copy exactly from above)
   - Set **Environment** to "Production"
   - Click "Save"

3. **After adding all variables**:
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Select "Use existing Build Cache" 
   - Click "Redeploy"

## ✅ Expected Result

After setting environment variables and redeploying:
- ✅ Database connection will work
- ✅ Admin dashboard will show real data from Supabase
- ✅ No more 500 errors
- ✅ User table will populate with real users

## 🔍 How to Verify

1. Check Vercel Function logs for database connection success
2. Admin dashboard should show real user data
3. No more "ENOTFOUND" errors in logs

## ⚠️ Important Notes

- **Use EXACT values** above (especially DATABASE_URL with URL encoding)
- **Set Environment to "Production"** for each variable
- **Redeploy after adding all variables**
- The `%5E%28` in DATABASE_URL is URL encoding for `^(`
