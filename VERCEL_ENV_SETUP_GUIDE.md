# 🔧 Vercel Environment Variables Setup Guide

## 🚨 Current Issue
The admin dashboard is failing because environment variables are not properly configured in Vercel production.

## 📊 Check Current Status
Visit: https://metachrome-v2.vercel.app/api/env-check

This will show you which environment variables are currently set.

## 📋 Required Environment Variables

### **CRITICAL: Copy these EXACT values**

```bash
# Database Connection
DATABASE_URL=postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres

# Security Keys
JWT_SECRET=036ff29bd784e58a11b82982ef4f0eca6e7d94f9df28d51f98ea1a729cc30827
SESSION_SECRET=81a419d14338a01de910f95eb82b5af27f86a30a9e214374edf1a75202546b8e

# Environment Settings
NODE_ENV=production
ALLOWED_ORIGINS=https://metachrome-v2.vercel.app
```

## 🔗 Step-by-Step Setup

### **Step 1: Access Vercel Dashboard**
1. Go to: https://vercel.com/temanly-ids-projects/metachrome-v2/settings/environment-variables
2. Make sure you're on the **Environment Variables** tab

### **Step 2: Add Each Variable**
For **EACH** variable above:

1. **Click "Add New"**
2. **Name**: Enter the variable name (e.g., `DATABASE_URL`)
3. **Value**: Copy the EXACT value from above
4. **Environment**: Select **"Production"** (IMPORTANT!)
5. **Click "Save"**

### **Step 3: Verify Variables Added**
After adding all variables, you should see:
- ✅ DATABASE_URL (Production)
- ✅ JWT_SECRET (Production)
- ✅ SESSION_SECRET (Production)
- ✅ NODE_ENV (Production)
- ✅ ALLOWED_ORIGINS (Production)

### **Step 4: Redeploy**
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Select **"Use existing Build Cache"**
4. Click **"Redeploy"**

## ✅ Verification Steps

### **1. Check Environment Variables**
Visit: https://metachrome-v2.vercel.app/api/env-check

Should show:
```json
{
  "NODE_ENV": "production",
  "DATABASE_URL_SET": true,
  "DATABASE_URL_LENGTH": 108,
  "DATABASE_URL_PREFIX": "postgresql://postgres:HopeAmdH",
  "JWT_SECRET_SET": true,
  "SESSION_SECRET_SET": true,
  "ALLOWED_ORIGINS": "https://metachrome-v2.vercel.app"
}
```

### **2. Check Admin Dashboard**
Visit: https://metachrome-v2.vercel.app/admin

Should show:
- ✅ Real user data from Supabase
- ✅ No 500 errors in console
- ✅ Proper database connectivity

### **3. Check Function Logs**
In Vercel dashboard → Functions → View logs

Should show:
- ✅ "Database connection created"
- ✅ "Found X users in database"
- ❌ No "ENOTFOUND" errors

## 🚨 Common Issues

### **Issue 1: Variables Not Set**
**Symptom**: `DATABASE_URL_SET: false`
**Fix**: Add the environment variables as described above

### **Issue 2: Wrong Environment**
**Symptom**: Variables set but still failing
**Fix**: Make sure Environment is set to "Production" for each variable

### **Issue 3: Not Redeployed**
**Symptom**: Variables set but old deployment running
**Fix**: Redeploy the application after adding variables

### **Issue 4: Wrong DATABASE_URL**
**Symptom**: Different connection errors
**Fix**: Use EXACT URL with `%5E%28` encoding

## 🎯 Expected Final Result

After correct setup:
- 🔐 **Admin Login**: admin / admin123
- 👥 **Real Users**: Shows actual Supabase users
- 💰 **Real Balances**: Shows actual user balances (may be 0)
- 📈 **Real Trades**: Shows actual trades (may be 0)
- ⚙️ **Real Controls**: Shows actual admin controls
- 🔧 **Real Settings**: Shows actual options settings

## 📞 Need Help?

If you're still having issues:
1. Check the env-check endpoint first
2. Verify all variables are set to "Production"
3. Make sure you redeployed after adding variables
4. Check the Vercel function logs for specific errors
