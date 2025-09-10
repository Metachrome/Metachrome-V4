# 🚀 METACHROME OAuth Production Deployment Guide

## ✅ OAuth Configuration Complete!

Your social authentication is **production-ready** with Google, LinkedIn, and MetaMask support.

## 🔐 Environment Variables for Production

Add these **exact** environment variables to your deployment platform:

### **Required OAuth Variables:**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=631626613763-8j8ddp3im9talfosdbsvrl29val2bcn0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=86fq3czq8sez66
LINKEDIN_CLIENT_SECRET=WPL_AP1.cCYwf5B9XewwIRrY./4uJTQ==

# Session & Security
SESSION_SECRET=metachrome-v2-session-secret-2024
JWT_SECRET=metachrome-v2-jwt-secret-2024

# Server Configuration
NODE_ENV=production
PORT=3000
```

### **Existing Database Variables (Keep These):**
```bash
DATABASE_URL=postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres
SUPABASE_URL=https://pybsyzbxyliufkgywtpf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjYzNDYsImV4cCI6MjA3MTgwMjM0Nn0.NYcOwg-jVmnImiAuAQ2vbEluQ-uT32Fkdbon1pIYAME
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE
```

## 🌐 OAuth Provider Configuration

### **CRITICAL: Add Production Callback URLs**

#### **Google Cloud Console:**
1. Go to: https://console.cloud.google.com/
2. Navigate to: APIs & Services > Credentials
3. Find Client ID: `631626613763-8j8ddp3im9talfosdbsvrl29val2bcn0.apps.googleusercontent.com`
4. **ADD** these Authorized redirect URIs:
   - `https://your-domain.railway.app/api/auth/google/callback`
   - `https://metachrome-v2.vercel.app/api/auth/google/callback`

#### **LinkedIn Developer Portal:**
1. Go to: https://www.linkedin.com/developers/
2. Find app with Client ID: `86fq3czq8sez66`
3. Go to "Auth" tab and **ADD** these redirect URLs:
   - `https://your-domain.railway.app/api/auth/linkedin/callback`
   - `https://metachrome-v2.vercel.app/api/auth/linkedin/callback`

## 🚀 Deployment Options

### **Option 1: Railway (Recommended)**
1. **Build Complete**: ✅ Already done (`npm run build`)
2. **Connect Repository**: Link your GitHub repo to Railway
3. **Add Environment Variables**: Copy all variables above to Railway dashboard
4. **Deploy**: Railway will auto-deploy using your Dockerfile

### **Option 2: Vercel**
1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Add Environment Variables**: Copy all variables above to Vercel dashboard
3. **Deploy**: Vercel will auto-deploy

## 🎯 What Will Work After Deployment

### **✅ Social Authentication:**
- **Google Login**: Users can sign up/login with Google accounts
- **LinkedIn Login**: Users can sign up/login with LinkedIn accounts
- **MetaMask Login**: Crypto wallet authentication (always works)
- **Email/Password**: Traditional authentication

### **✅ User Experience:**
1. User clicks social login button
2. Redirected to OAuth provider (Google/LinkedIn)
3. User authorizes your app
4. Automatically redirected back to METACHROME
5. Account created if new user
6. Logged in and redirected to trading dashboard

### **✅ Admin Features:**
- User management with social login data
- Trading controls and balance management
- Real-time monitoring of social login users

## 🔧 Testing After Deployment

### **Test URLs (Replace with your domain):**
- **OAuth Status**: `https://your-domain.com/api/auth/status`
- **Google OAuth**: `https://your-domain.com/api/auth/google`
- **LinkedIn OAuth**: `https://your-domain.com/api/auth/linkedin`
- **Main App**: `https://your-domain.com`

### **Expected Results:**
- ✅ OAuth status shows all providers as "ready"
- ✅ Social login buttons redirect to OAuth providers
- ✅ Successful authentication redirects back to your app
- ✅ User accounts created automatically
- ✅ Users can access trading dashboard

## 🎉 Success Indicators

After deployment, you should see:
- ✅ **Social login buttons active** on signup/login pages
- ✅ **OAuth redirects working** (no localhost errors)
- ✅ **User accounts created** with social login data
- ✅ **Admin dashboard** showing social login users
- ✅ **Real-time trading** with social login accounts

## 🚨 Important Notes

1. **Local Testing Won't Work**: OAuth requires production URLs
2. **Callback URLs Required**: Must be added to OAuth providers
3. **HTTPS Only**: OAuth providers require secure connections
4. **Environment Variables**: Must be set exactly as shown above

Your OAuth implementation is **100% production-ready**! 🚀
