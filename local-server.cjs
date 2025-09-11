console.log('🔍 Starting METACHROME local server (CommonJS)...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

try {
  console.log('📦 Loading express...');
  const express = require('express');
  console.log('✅ Express loaded successfully');

  console.log('📦 Loading path...');
  const path = require('path');
  console.log('✅ Path loaded successfully');

  console.log('📦 Loading fs...');
  const fs = require('fs');
  console.log('✅ FS loaded successfully');

  console.log('📦 Loading cors...');
  const cors = require('cors');
  console.log('✅ CORS loaded successfully');

  console.log('🚀 Creating Express app...');
  const app = express();
  console.log('✅ Express app created');

  const PORT = 3001;
  const HOST = '127.0.0.1';

  // In-memory data
  let users = [
    {
      id: 'superadmin-1',
      username: 'superadmin',
      email: 'superadmin@metachrome.io',
      password: 'superadmin123',
      balance: 50000,
      role: 'superadmin',
      status: 'active',
      trading_mode: 'normal',
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-1',
      username: 'trader1',
      email: 'trader1@metachrome.io',
      password: 'password123',
      balance: 10000,
      role: 'user',
      status: 'active',
      trading_mode: 'normal',
      createdAt: new Date().toISOString()
    }
  ];

  let transactions = [];
  let pendingDeposits = [];

  // Basic middleware
  console.log('🔧 Setting up middleware...');
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('✅ Middleware configured');

  // Authentication endpoints
  app.post('/api/auth/login', (req, res) => {
    console.log('🔐 Login attempt:', req.body);
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    console.log('✅ Login successful for:', user.username);
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance
      },
      token
    });
  });

  // Balance endpoints
  app.get('/api/balances', (req, res) => {
    console.log('💰 Balance request');
    const mockBalances = [
      { id: 'balance-1', userId: 'user-1', currency: 'USDT', balance: 10000 },
      { id: 'balance-2', userId: 'user-1', currency: 'BTC', balance: 0.5 },
      { id: 'balance-3', userId: 'user-1', currency: 'ETH', balance: 2.0 }
    ];
    res.json(mockBalances);
  });

  // Test route
  app.get('/test', (req, res) => {
    console.log('📨 Test route hit');
    res.json({ 
      message: 'METACHROME local server is working!', 
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      features: ['authentication', 'balances', 'static-files']
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    console.log('🏥 Health check hit');
    res.json({ 
      status: 'OK', 
      message: 'METACHROME local server is running',
      timestamp: new Date().toISOString(),
      users: users.length,
      transactions: transactions.length
    });
  });

  // Static files
  const distPath = path.join(__dirname, 'dist', 'public');
  console.log('📁 Static path:', distPath);
  
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist folder exists');
    const files = fs.readdirSync(distPath);
    console.log('📁 Files in dist/public:', files.slice(0, 5), files.length > 5 ? '...' : '');
    app.use(express.static(distPath));
  } else {
    console.log('❌ Dist folder not found');
  }

  // Catch all route for SPA
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    console.log('🌐 SPA route hit:', req.path);
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ Serving index.html');
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html not found');
      res.send(`
        <h1>🚀 METACHROME Local Server</h1>
        <p><strong>Server is running successfully!</strong></p>
        <p>But index.html not found at: ${indexPath}</p>
        <hr>
        <h3>Available Endpoints:</h3>
        <ul>
          <li><a href="/test">🧪 Test endpoint</a></li>
          <li><a href="/api/health">🏥 Health check</a></li>
          <li><a href="/api/balances">💰 Balances</a></li>
        </ul>
        <hr>
        <p><strong>Node.js:</strong> ${process.version}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Status:</strong> ✅ Server is working properly</p>
      `);
    }
  });

  console.log('🚀 Starting server...');
  const server = app.listen(PORT, HOST, () => {
    console.log('🎉 ================================');
    console.log('✅ METACHROME LOCAL SERVER STARTED!');
    console.log(`🌐 URL: http://${HOST}:${PORT}`);
    console.log(`🧪 Test: http://${HOST}:${PORT}/test`);
    console.log(`🏥 Health: http://${HOST}:${PORT}/api/health`);
    console.log(`🔐 Login: superadmin / superadmin123`);
    console.log('🎉 ================================');
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.log('💡 Try killing the process and restart');
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('❌ Fatal error:', error);
  console.error('Stack trace:', error.stack);
}
