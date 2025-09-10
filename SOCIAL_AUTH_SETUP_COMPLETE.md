# 🔐 Complete Social Authentication Setup Guide

## 📋 Current Status

✅ **MetaMask** - Fully functional (no setup required)
✅ **Google OAuth** - Backend ready (needs credentials)
✅ **LinkedIn OAuth** - Backend ready (needs credentials)  
✅ **Twitter OAuth** - Backend ready (needs credentials)
⏳ **Apple OAuth** - Placeholder (complex setup required)

## 🚀 Quick Setup Instructions

### 1. Google OAuth Setup

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing one
3. Enable Google+ API (APIs & Services > Library)

**Step 2: Configure OAuth**
1. Go to APIs & Services > OAuth consent screen
2. Fill in app information:
   - App name: `METACHROME`
   - User support email: Your email
   - Developer contact: Your email
3. Add authorized domains: `your-domain.com`

**Step 3: Create Credentials**
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "METACHROME Web Client"
5. Authorized redirect URIs: `https://your-domain.com/api/auth/google/callback`
6. Copy Client ID and Client Secret

**Environment Variables:**
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 2. LinkedIn OAuth Setup

**Step 1: Create LinkedIn App**
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in app details:
   - App name: `METACHROME`
   - LinkedIn Page: Your company page
   - App logo: Upload your logo

**Step 2: Configure OAuth**
1. In "Auth" tab, add redirect URL: `https://your-domain.com/api/auth/linkedin/callback`
2. Request access to "Sign In with LinkedIn using OpenID Connect"
3. Copy Client ID and Client Secret from "Auth" tab

**Environment Variables:**
```bash
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
```

### 3. Twitter OAuth Setup

**Step 1: Create Twitter App**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for developer account if needed
3. Create new app in your project
4. Fill in app details:
   - App name: `METACHROME`
   - Description: Your app description
   - Website: Your website URL

**Step 2: Configure OAuth 2.0**
1. In app settings, go to "User authentication settings"
2. Enable OAuth 2.0
3. Type of App: Web App
4. Callback URI: `https://your-domain.com/api/auth/twitter/callback`
5. Website URL: Your website
6. Copy Client ID and Client Secret

**Environment Variables:**
```bash
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
```

### 4. MetaMask (Already Working) ✅

No setup required! MetaMask authentication works out of the box.
Users just need MetaMask browser extension installed.

## 🔧 Environment Variables Setup

### For Local Development (.env file):
```bash
# Social Authentication
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here

# Session Security
SESSION_SECRET=your_session_secret_here
JWT_SECRET=your_jwt_secret_here

# Database
DATABASE_URL=your_database_url_here
```

### For Vercel Production:
1. Go to Vercel Dashboard > Project Settings > Environment Variables
2. Add each variable above with "Production" environment selected
3. Redeploy your application

## 🎯 Testing Your Setup

### 1. Test Each Provider:
- **Google**: Visit `/api/auth/google` - should redirect to Google
- **LinkedIn**: Visit `/api/auth/linkedin` - should redirect to LinkedIn  
- **Twitter**: Visit `/api/auth/twitter` - should redirect to Twitter
- **MetaMask**: Click MetaMask button - should open MetaMask popup

### 2. Check Callback URLs:
Make sure these URLs are added to each provider:
- Google: `https://your-domain.com/api/auth/google/callback`
- LinkedIn: `https://your-domain.com/api/auth/linkedin/callback`
- Twitter: `https://your-domain.com/api/auth/twitter/callback`

### 3. Verify User Creation:
After successful OAuth, users should be:
- ✅ Created in your database
- ✅ Automatically logged in
- ✅ Redirected to dashboard

## 🚨 Common Issues & Solutions

### Issue 1: "OAuth Error" or "Callback Error"
**Cause**: Wrong callback URL or missing environment variables
**Fix**: Double-check callback URLs match exactly in provider settings

### Issue 2: "Client ID not found"
**Cause**: Environment variables not set or wrong values
**Fix**: Verify environment variables are set correctly

### Issue 3: "Scope not authorized"
**Cause**: Missing permissions in OAuth app
**Fix**: Request proper scopes in provider settings

### Issue 4: "Redirect URI mismatch"
**Cause**: Callback URL doesn't match provider settings
**Fix**: Ensure exact match including https:// and trailing paths

## 📱 User Experience

After setup, users can:
1. **Sign up/Login** with any social provider
2. **Automatic account creation** on first login
3. **Seamless authentication** across sessions
4. **Multiple login methods** for same account (if same email)

## 🔒 Security Features

✅ **Secure session management** with express-session
✅ **JWT token authentication** for API calls
✅ **Password hashing** with bcrypt
✅ **CORS protection** for cross-origin requests
✅ **Rate limiting** to prevent abuse
✅ **Environment-based configuration** for security

## 📞 Need Help?

If you encounter issues:
1. Check browser console for error messages
2. Verify all environment variables are set
3. Ensure callback URLs match exactly
4. Test each provider individually
5. Check server logs for detailed error information

Your social authentication system is now ready! 🎉
