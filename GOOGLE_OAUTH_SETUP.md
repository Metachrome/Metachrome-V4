# Google OAuth Setup for METACHROME

This guide explains how to set up Google OAuth for login and signup on www.metachrome.io.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter project name: `METACHROME Trading Platform`
5. Click "CREATE"
6. Wait for the project to be created

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "ENABLE"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, click "CONFIGURE CONSENT SCREEN" first:
   - Choose "External" user type
   - Fill in the form:
     - App name: `METACHROME`
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
   - Click "SAVE AND CONTINUE"
   - On "Scopes" page, click "SAVE AND CONTINUE"
   - On "Test users" page, click "SAVE AND CONTINUE"
   - Review and click "BACK TO DASHBOARD"

4. Now create the OAuth client ID:
   - Click "CREATE CREDENTIALS" > "OAuth client ID"
   - Application type: "Web application"
   - Name: `METACHROME Web Client`
   - Authorized JavaScript origins:
     - `https://www.metachrome.io`
     - `https://metachrome.io`
     - `https://metachrome-v2-production.up.railway.app` (Railway domain)
     - `http://localhost:5000` (for local development)
   - Authorized redirect URIs:
     - `https://www.metachrome.io/api/auth/google/callback`
     - `https://metachrome.io/api/auth/google/callback`
     - `https://metachrome-v2-production.up.railway.app/api/auth/google/callback` (Railway domain)
     - `http://localhost:5000/api/auth/google/callback`
   - Click "CREATE"

5. Copy the credentials:
   - Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-xxxxx`)

## Step 4: Set Environment Variables on Railway

1. Go to your Railway project dashboard
2. Click on your METACHROME service
3. Go to "Variables" tab
4. Add these environment variables:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```
5. Click "Deploy" to redeploy with the new variables

## Step 5: Test Google OAuth

1. Go to https://www.metachrome.io/login
2. Click "Continue with Google"
3. You should be redirected to Google's login page
4. After logging in, you should be redirected back to the dashboard

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches the domain you're using:
  - For www.metachrome.io: `https://www.metachrome.io/api/auth/google/callback`
  - For Railway: `https://metachrome-v2-production.up.railway.app/api/auth/google/callback`
  - For localhost: `http://localhost:5000/api/auth/google/callback`
- Check that you've added both the origin and the callback URI
- **IMPORTANT**: After updating Google Cloud Console, you must redeploy your Railway service for changes to take effect

### "Client ID not found" error
- Verify that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in Railway
- Restart the Railway service after adding the variables

### OAuth button not working
- Check browser console for errors
- Verify that the domain www.metachrome.io is authorized in Google Cloud Console
- Make sure the service is redeployed after setting environment variables

## Additional OAuth Providers

The same setup process applies to:
- **LinkedIn**: Set `LINKEDIN_CLIENT_ID` and `LINKEDIN_CLIENT_SECRET`
- **Twitter**: Set `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET`

All callback URLs follow the same pattern:
- `https://www.metachrome.io/api/auth/{provider}/callback`

