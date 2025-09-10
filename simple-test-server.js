import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// OAuth status endpoint
app.get('/api/auth/status', (req, res) => {
  const status = {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    linkedin: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
    twitter: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
    metamask: true,
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 OAuth Status requested:', status);
  res.json(status);
});

// Environment check endpoint
app.get('/api/env-check', (req, res) => {
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_ID_PREFIX: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || '',
    LINKEDIN_CLIENT_ID_SET: !!process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || '',
    TWITTER_CLIENT_ID_SET: !!process.env.TWITTER_CLIENT_ID,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    SESSION_SECRET_SET: !!process.env.SESSION_SECRET,
    DATABASE_URL_SET: !!process.env.DATABASE_URL
  };
  
  console.log('🔧 Environment check requested:', envStatus);
  res.json(envStatus);
});

// OAuth redirect simulation endpoints
app.get('/api/auth/google', (req, res) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    res.json({ 
      message: 'Google OAuth is configured!',
      status: 'ready',
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUrl: `http://localhost:${PORT}/api/auth/google/callback`,
      note: 'In production, this would redirect to Google OAuth'
    });
  } else {
    res.status(501).json({ 
      message: 'Google OAuth not configured',
      status: 'missing_credentials',
      required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    });
  }
});

app.get('/api/auth/linkedin', (req, res) => {
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    res.json({ 
      message: 'LinkedIn OAuth is configured!',
      status: 'ready',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      redirectUrl: `http://localhost:${PORT}/api/auth/linkedin/callback`,
      note: 'In production, this would redirect to LinkedIn OAuth'
    });
  } else {
    res.status(501).json({ 
      message: 'LinkedIn OAuth not configured',
      status: 'missing_credentials',
      required: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET']
    });
  }
});

app.get('/api/auth/twitter', (req, res) => {
  if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
    res.json({ 
      message: 'Twitter OAuth is configured!',
      status: 'ready',
      clientId: process.env.TWITTER_CLIENT_ID,
      redirectUrl: `http://localhost:${PORT}/api/auth/twitter/callback`,
      note: 'In production, this would redirect to Twitter OAuth'
    });
  } else {
    res.status(501).json({ 
      message: 'Twitter OAuth not configured (optional)',
      status: 'missing_credentials',
      required: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET']
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>OAuth Test Server</title></head>
      <body style="font-family: Arial; padding: 20px; background: #1a1a1a; color: white;">
        <h1>🔐 OAuth Test Server</h1>
        <p>Your OAuth credentials test server is running!</p>
        <ul>
          <li><a href="/test-oauth.html" style="color: #4CAF50;">OAuth Test Page</a></li>
          <li><a href="/api/auth/status" style="color: #4CAF50;">OAuth Status</a></li>
          <li><a href="/api/env-check" style="color: #4CAF50;">Environment Check</a></li>
          <li><a href="/api/auth/google" style="color: #4CAF50;">Test Google OAuth</a></li>
          <li><a href="/api/auth/linkedin" style="color: #4CAF50;">Test LinkedIn OAuth</a></li>
          <li><a href="/api/auth/twitter" style="color: #4CAF50;">Test Twitter OAuth</a></li>
        </ul>
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
  
  console.log('\n🔐 OAuth Configuration Status:');
  console.log('Google:', !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? '✅ Ready' : '❌ Not configured');
  console.log('LinkedIn:', !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) ? '✅ Ready' : '❌ Not configured');
  console.log('Twitter:', !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) ? '✅ Ready' : '⚠️ Optional');
  console.log('MetaMask: ✅ Always available');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Visit http://localhost:5000/test-oauth.html to test your setup');
  console.log('2. Add callback URLs to your OAuth provider settings');
  console.log('3. Deploy to production with environment variables');
});
