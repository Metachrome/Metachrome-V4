# OAuth Setup Guide for METACHROME

## Current OAuth Status

✅ **Google OAuth** - Configured and ready (needs Google Cloud Console setup)
⏳ **Apple OAuth** - Placeholder (awaiting Apple Developer credentials)
⏳ **LinkedIn OAuth** - Placeholder (awaiting LinkedIn App credentials)
✅ **MetaMask** - Fully functional Web3 wallet authentication
✅ **Email/Password** - Fully functional with demo user

## Google OAuth Setup Required

The Google OAuth is configured but needs the redirect URL to be added in Google Cloud Console:

### Steps to Complete Google OAuth:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** or create a new one
3. **Enable Google+ API**:
   - Go to APIs & Services > Library
   - Search for "Google+ API" and enable it
4. **Configure OAuth Consent Screen**:
   - Go to APIs & Services > OAuth consent screen
   - Add your app name: "METACHROME"
   - Add authorized domains: `aloyarapbravy.repl.co`
5. **Create OAuth 2.0 Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "METACHROME Web Client"
   - **Authorized redirect URIs**: Add this exact URL:
     ```
     https://3c7a35fd-79ac-4f92-ba48-58a12079c65a-00-2w6k32ig2m9pa.sisko.replit.dev/api/auth/google/callback
     ```
6. **Update the existing GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET** in Replit Secrets with the new credentials

## Current Callback URL  
```
https://3c7a35fd-79ac-4f92-ba48-58a12079c65a-00-2w6k32ig2m9pa.sisko.replit.dev/api/auth/google/callback
```

## Working Authentication Methods

### 1. Email/Password Login
- **Demo User**: trader1@example.com
- **Password**: password123
- Status: ✅ Fully functional

### 2. MetaMask Wallet
- Connects to real MetaMask wallet
- Authenticates with blockchain signature
- Status: ✅ Fully functional

### 3. Google OAuth
- Redirects to Google authentication
- Status: ⚠️ Needs redirect URL configured in Google Cloud Console

### 4. Apple & LinkedIn
- Placeholder implementations
- Status: ⏳ Awaiting proper OAuth credentials

## Next Steps

1. Add the callback URL to Google Cloud Console OAuth settings
2. Test Google authentication
3. Provide Apple Developer and LinkedIn App credentials for full OAuth support