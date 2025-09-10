import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import session from 'express-session';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('dist/public'));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${PORT}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('🔐 Google OAuth callback received:', profile.displayName);
    // In a real app, you'd save the user to database here
    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
      provider: 'google'
    };
    return done(null, user);
  }));
}

// Configure LinkedIn OAuth
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use('linkedin', new OAuth2Strategy({
    authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: `http://localhost:${PORT}/api/auth/linkedin/callback`,
    scope: ['openid', 'profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('🔐 LinkedIn OAuth callback received');
    // Fetch user profile
    try {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const linkedinProfile = await response.json();
      const user = {
        id: linkedinProfile.sub,
        name: linkedinProfile.name,
        email: linkedinProfile.email,
        provider: 'linkedin'
      };
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Serialize/deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// OAuth status endpoint
app.get('/api/auth/status', (req, res) => {
  const status = {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    linkedin: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    twitter: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
    metamask: true,
    timestamp: new Date().toISOString()
  };
  res.json(status);
});

// Environment check endpoint
app.get('/api/env-check', (req, res) => {
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
    LINKEDIN_CLIENT_ID_SET: !!process.env.LINKEDIN_CLIENT_ID,
    TWITTER_CLIENT_ID_SET: !!process.env.TWITTER_CLIENT_ID,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    SESSION_SECRET_SET: !!process.env.SESSION_SECRET
  };
  res.json(envStatus);
});

// Google OAuth routes
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
    (req, res) => {
      console.log('✅ Google login successful:', req.user);
      res.redirect('/dashboard?success=google_login');
    }
  );
} else {
  app.get('/api/auth/google', (req, res) => {
    res.status(501).json({ message: 'Google OAuth not configured' });
  });
}

// LinkedIn OAuth routes
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  app.get('/api/auth/linkedin', passport.authenticate('linkedin', { scope: ['openid', 'profile', 'email'] }));
  
  app.get('/api/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login?error=linkedin_failed' }),
    (req, res) => {
      console.log('✅ LinkedIn login successful:', req.user);
      res.redirect('/dashboard?success=linkedin_login');
    }
  );
} else {
  app.get('/api/auth/linkedin', (req, res) => {
    res.status(501).json({ message: 'LinkedIn OAuth not configured' });
  });
}

// Test success page
app.get('/dashboard', (req, res) => {
  const success = req.query.success;
  res.send(`
    <html>
      <head><title>OAuth Success</title></head>
      <body style="font-family: Arial; padding: 20px; background: #1a1a1a; color: white;">
        <h1>🎉 OAuth Login Successful!</h1>
        <p>Login method: <strong>${success}</strong></p>
        <p>User: <strong>${req.user?.name || 'Unknown'}</strong></p>
        <p>Email: <strong>${req.user?.email || 'Not provided'}</strong></p>
        <a href="/test-oauth.html" style="color: #4CAF50;">← Back to OAuth Test</a>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OAuth Test Server running on http://localhost:${PORT}`);
  console.log(`📊 Test OAuth: http://localhost:${PORT}/test-oauth.html`);
  console.log(`🔧 Environment check: http://localhost:${PORT}/api/env-check`);
  console.log(`📋 OAuth status: http://localhost:${PORT}/api/auth/status`);
  
  console.log('\n🔐 OAuth Configuration:');
  console.log('Google:', !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? '✅ Ready' : '❌ Not configured');
  console.log('LinkedIn:', !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) ? '✅ Ready' : '❌ Not configured');
  console.log('Twitter:', !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) ? '✅ Ready' : '⚠️ Optional');
});
