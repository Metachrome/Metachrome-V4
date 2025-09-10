import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  console.log('📊 OAuth Status Check:', status);
  res.json(status);
});

// Environment check endpoint
app.get('/api/env-check', (req, res) => {
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
    DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) || '',
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    SESSION_SECRET_SET: !!process.env.SESSION_SECRET,
    GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
    LINKEDIN_CLIENT_ID_SET: !!process.env.LINKEDIN_CLIENT_ID,
    TWITTER_CLIENT_ID_SET: !!process.env.TWITTER_CLIENT_ID,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
  };
  
  console.log('🔧 Environment Check:', envStatus);
  res.json(envStatus);
});

// OAuth redirect endpoints (for testing)
app.get('/api/auth/google', (req, res) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    res.json({ 
      message: 'Google OAuth configured! In production, this would redirect to Google.',
      clientId: process.env.GOOGLE_CLIENT_ID,
      redirectUrl: `http://localhost:${PORT}/api/auth/google/callback`
    });
  } else {
    res.status(501).json({ 
      message: 'Google OAuth not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.' 
    });
  }
});

app.get('/api/auth/linkedin', (req, res) => {
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    res.json({ 
      message: 'LinkedIn OAuth configured! In production, this would redirect to LinkedIn.',
      clientId: process.env.LINKEDIN_CLIENT_ID,
      redirectUrl: `http://localhost:${PORT}/api/auth/linkedin/callback`
    });
  } else {
    res.status(501).json({ 
      message: 'LinkedIn OAuth not configured. Missing LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET.' 
    });
  }
});

app.get('/api/auth/twitter', (req, res) => {
  if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
    res.json({ 
      message: 'Twitter OAuth configured! In production, this would redirect to Twitter.',
      clientId: process.env.TWITTER_CLIENT_ID,
      redirectUrl: `http://localhost:${PORT}/api/auth/twitter/callback`
    });
  } else {
    res.status(501).json({ 
      message: 'Twitter OAuth not configured. Missing TWITTER_CLIENT_ID or TWITTER_CLIENT_SECRET.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OAuth Test Server running on http://localhost:${PORT}`);
  console.log(`📊 Test OAuth status: http://localhost:${PORT}/test-oauth.html`);
  console.log(`🔧 Environment check: http://localhost:${PORT}/api/env-check`);
  console.log(`📋 OAuth status: http://localhost:${PORT}/api/auth/status`);
  
  console.log('\n🔐 OAuth Configuration Status:');
  console.log('Google:', !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) ? '✅' : '❌');
  console.log('LinkedIn:', !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) ? '✅' : '❌');
  console.log('Twitter:', !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) ? '✅' : '❌');
  console.log('MetaMask: ✅ (Always available)');
});
