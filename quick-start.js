require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('dist/public'));

// Basic OAuth status endpoint
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
    LINKEDIN_CLIENT_ID_SET: !!process.env.LINKEDIN_CLIENT_ID,
    TWITTER_CLIENT_ID_SET: !!process.env.TWITTER_CLIENT_ID,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    SESSION_SECRET_SET: !!process.env.SESSION_SECRET
  };
  
  console.log('🔧 Environment check requested:', envStatus);
  res.json(envStatus);
});

// Serve the main app
app.get('/', (req, res) => {
  // Try to serve the built index.html first
  const builtIndexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(builtIndexPath)) {
    res.sendFile(builtIndexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    res.send(`
      <html>
        <head><title>METACHROME V2</title></head>
        <body style="font-family: Arial; padding: 20px; background: #1a1a1a; color: white;">
          <h1>🚀 METACHROME V2 Server Running</h1>
          <p>Your trading platform server is active!</p>
          <ul>
            <li><a href="/api/auth/status" style="color: #4CAF50;">OAuth Status</a></li>
            <li><a href="/api/env-check" style="color: #4CAF50;">Environment Check</a></li>
          </ul>
          <p><strong>Note:</strong> Build your frontend with <code>npm run build</code> to see the full app.</p>
        </body>
      </html>
    `);
  }
});

// OAuth simulation endpoints
app.get('/api/auth/google', (req, res) => {
  res.json({ 
    message: 'Google OAuth endpoint',
    status: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not_configured',
    note: 'This would redirect to Google OAuth in production'
  });
});

app.get('/api/auth/linkedin', (req, res) => {
  res.json({ 
    message: 'LinkedIn OAuth endpoint',
    status: process.env.LINKEDIN_CLIENT_ID ? 'configured' : 'not_configured',
    note: 'This would redirect to LinkedIn OAuth in production'
  });
});

// Catch all other routes
app.get('*', (req, res) => {
  const builtIndexPath = path.join(__dirname, 'dist', 'public', 'index.html');
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(builtIndexPath)) {
    res.sendFile(builtIndexPath);
  } else if (fs.existsSync(publicIndexPath)) {
    res.sendFile(publicIndexPath);
  } else {
    res.status(404).json({ message: 'Page not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 METACHROME V2 Server running on http://localhost:${PORT}`);
  console.log(`📊 OAuth Status: http://localhost:${PORT}/api/auth/status`);
  console.log(`🔧 Environment: http://localhost:${PORT}/api/env-check`);
  
  console.log('\n🔐 OAuth Configuration:');
  console.log('Google:', !!process.env.GOOGLE_CLIENT_ID ? '✅ Ready' : '❌ Not configured');
  console.log('LinkedIn:', !!process.env.LINKEDIN_CLIENT_ID ? '✅ Ready' : '❌ Not configured');
  console.log('Twitter:', !!process.env.TWITTER_CLIENT_ID ? '✅ Ready' : '⚠️ Optional');
  console.log('MetaMask: ✅ Always available');
});
