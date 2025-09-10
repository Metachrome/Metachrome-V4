require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OAuth2Strategy = require('passport-oauth2');

const app = express();
const PORT = 3000;

// Session middleware
app.use(session({
  secret: 'local-test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Serialize/deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${PORT}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('✅ Google OAuth Success:', profile.displayName);
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
    console.log('✅ LinkedIn OAuth Success');
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
      console.error('LinkedIn API Error:', error);
      return done(error, null);
    }
  }));
}

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Home page with OAuth test buttons
app.get('/', (req, res) => {
  const googleReady = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const linkedinReady = !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET);
  
  res.send(`
    <html>
      <head>
        <title>Local OAuth Test - METACHROME</title>
        <style>
          body { font-family: Arial; padding: 20px; background: #1a1a1a; color: white; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            margin: 10px; 
            border-radius: 5px; 
            text-decoration: none; 
            font-weight: bold;
          }
          .google { background: #db4437; color: white; }
          .linkedin { background: #0077b5; color: white; }
          .disabled { background: #666; color: #ccc; cursor: not-allowed; }
          .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
          .ready { background: #2d5a2d; }
          .not-ready { background: #5a2d2d; }
        </style>
      </head>
      <body>
        <h1>🔐 METACHROME Local OAuth Test</h1>
        
        <div class="status ${googleReady ? 'ready' : 'not-ready'}">
          <strong>Google OAuth:</strong> ${googleReady ? '✅ Ready' : '❌ Not configured'}
        </div>
        
        <div class="status ${linkedinReady ? 'ready' : 'not-ready'}">
          <strong>LinkedIn OAuth:</strong> ${linkedinReady ? '✅ Ready' : '❌ Not configured'}
        </div>
        
        <h2>Test OAuth Login:</h2>
        
        ${googleReady ? 
          '<a href="/api/auth/google" class="button google">🔐 Login with Google</a>' : 
          '<span class="button disabled">🔐 Google (Not Configured)</span>'
        }
        
        ${linkedinReady ? 
          '<a href="/api/auth/linkedin" class="button linkedin">🔐 Login with LinkedIn</a>' : 
          '<span class="button disabled">🔐 LinkedIn (Not Configured)</span>'
        }
        
        <h2>Debug Info:</h2>
        <ul>
          <li><a href="/api/auth/status" style="color: #4CAF50;">OAuth Status JSON</a></li>
          <li><a href="/api/env-check" style="color: #4CAF50;">Environment Check</a></li>
        </ul>
        
        <h2>Instructions:</h2>
        <ol>
          <li>Add <code>http://localhost:3000/api/auth/google/callback</code> to Google Cloud Console</li>
          <li>Add <code>http://localhost:3000/api/auth/linkedin/callback</code> to LinkedIn Developer Portal</li>
          <li>Click the OAuth buttons above to test</li>
        </ol>
      </body>
    </html>
  `);
});

// OAuth status endpoint
app.get('/api/auth/status', (req, res) => {
  const status = {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    linkedin: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    twitter: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
    metamask: true,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
  res.json(status);
});

// Environment check endpoint
app.get('/api/env-check', (req, res) => {
  const envStatus = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? 'SET' : 'NOT_SET',
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
  res.json(envStatus);
});

// Google OAuth routes
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  
  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/?error=google_failed' }),
    (req, res) => {
      console.log('✅ Google login successful:', req.user);
      res.redirect('/success?provider=google&name=' + encodeURIComponent(req.user.name));
    }
  );
}

// LinkedIn OAuth routes
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  app.get('/api/auth/linkedin', passport.authenticate('linkedin'));
  
  app.get('/api/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/?error=linkedin_failed' }),
    (req, res) => {
      console.log('✅ LinkedIn login successful:', req.user);
      res.redirect('/success?provider=linkedin&name=' + encodeURIComponent(req.user.name));
    }
  );
}

// Success page
app.get('/success', (req, res) => {
  const provider = req.query.provider;
  const name = req.query.name;
  
  res.send(`
    <html>
      <head><title>OAuth Success!</title></head>
      <body style="font-family: Arial; padding: 20px; background: #1a1a1a; color: white;">
        <h1>🎉 OAuth Login Successful!</h1>
        <p><strong>Provider:</strong> ${provider}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Status:</strong> ✅ Authentication working perfectly!</p>
        <a href="/" style="color: #4CAF50;">← Back to Test Page</a>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local OAuth Test Server running on http://localhost:${PORT}`);
  console.log(`🔧 Environment Variables:`);
  console.log(`   Google: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   LinkedIn: ${process.env.LINKEDIN_CLIENT_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`\n📝 Next Steps:`);
  console.log(`1. Add callback URLs to your OAuth providers`);
  console.log(`2. Visit http://localhost:${PORT} to test`);
});
