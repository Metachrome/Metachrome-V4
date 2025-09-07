const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 4000;

// Basic middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Simple in-memory session store
const sessions = new Map();

// Comprehensive demo data
const demoData = {
  users: [
    {
      id: 'user-1',
      email: 'user@demo.com',
      username: 'demo_user',
      role: 'USER',
      status: 'Inactive',
      control: 'None',
      lastLogin: 'Never',
      balance: { USDT: '10000', BTC: '0.5', ETH: '2.0' },
      createdAt: '2024-01-15T10:30:00Z',
      kycStatus: 'pending',
      tradingEnabled: false
    },
    {
      id: 'user-2',
      email: 'trader@demo.com',
      username: 'active_trader',
      role: 'USER',
      status: 'Active',
      control: 'Premium',
      lastLogin: '2024-01-20T14:22:00Z',
      balance: { USDT: '25000', BTC: '1.2', ETH: '5.5' },
      createdAt: '2024-01-10T09:15:00Z',
      kycStatus: 'verified',
      tradingEnabled: true
    },
    {
      id: 'user-3',
      email: 'vip@demo.com',
      username: 'vip_trader',
      role: 'USER',
      status: 'Active',
      control: 'VIP',
      lastLogin: '2024-01-20T16:45:00Z',
      balance: { USDT: '100000', BTC: '3.8', ETH: '15.2' },
      createdAt: '2024-01-05T11:00:00Z',
      kycStatus: 'verified',
      tradingEnabled: true
    },
    {
      id: 'user-4',
      email: 'new@demo.com',
      username: 'new_user',
      role: 'USER',
      status: 'Pending',
      control: 'Basic',
      lastLogin: 'Never',
      balance: { USDT: '1000', BTC: '0', ETH: '0' },
      createdAt: '2024-01-21T08:30:00Z',
      kycStatus: 'pending',
      tradingEnabled: false
    }
  ],
  trades: [
    {
      id: 'trade-1',
      userId: 'user-2',
      symbol: 'BTCUSDT',
      type: 'CALL',
      amount: '1000',
      strikePrice: '45000',
      expiry: '2024-01-25T00:00:00Z',
      status: 'Active',
      profitLoss: '150',
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: 'trade-2',
      userId: 'user-3',
      symbol: 'ETHUSDT',
      type: 'PUT',
      amount: '2000',
      strikePrice: '2800',
      expiry: '2024-01-26T00:00:00Z',
      status: 'Active',
      profitLoss: '-80',
      createdAt: '2024-01-20T11:15:00Z'
    },
    {
      id: 'trade-3',
      userId: 'user-2',
      symbol: 'BNBUSDT',
      type: 'CALL',
      amount: '500',
      strikePrice: '320',
      expiry: '2024-01-24T00:00:00Z',
      status: 'Expired',
      profitLoss: '0',
      createdAt: '2024-01-19T14:20:00Z'
    }
  ],
  transactions: [
    {
      id: 'tx-1',
      userId: 'user-2',
      type: 'DEPOSIT',
      amount: '5000',
      currency: 'USDT',
      status: 'Completed',
      timestamp: '2024-01-20T09:00:00Z',
      txHash: '0x1234...abcd'
    },
    {
      id: 'tx-2',
      userId: 'user-3',
      type: 'WITHDRAWAL',
      amount: '2000',
      currency: 'USDT',
      status: 'Pending',
      timestamp: '2024-01-20T15:30:00Z',
      txHash: '0x5678...efgh'
    },
    {
      id: 'tx-3',
      userId: 'user-1',
      type: 'DEPOSIT',
      amount: '1000',
      currency: 'USDT',
      status: 'Completed',
      timestamp: '2024-01-19T16:45:00Z',
      txHash: '0x9abc...ijkl'
    }
  ],
  controls: [
    {
      id: 'control-1',
      name: 'Trading Limit',
      type: 'TRADING_LIMIT',
      value: '10000',
      currency: 'USDT',
      status: 'Active',
      description: 'Maximum trading amount per day'
    },
    {
      id: 'control-2',
      name: 'Withdrawal Limit',
      type: 'WITHDRAWAL_LIMIT',
      value: '5000',
      currency: 'USDT',
      status: 'Active',
      description: 'Maximum withdrawal amount per day'
    },
    {
      id: 'control-3',
      name: 'KYC Required',
      type: 'KYC_REQUIRED',
      value: 'true',
      status: 'Active',
      description: 'KYC verification required for trading'
    }
  ],
  balances: [
    {
      userId: 'user-1',
      USDT: '10000',
      BTC: '0.5',
      ETH: '2.0',
      BNB: '0',
      lastUpdated: '2024-01-20T17:00:00Z'
    },
    {
      userId: 'user-2',
      USDT: '25000',
      BTC: '1.2',
      ETH: '5.5',
      BNB: '10.5',
      lastUpdated: '2024-01-20T17:00:00Z'
    },
    {
      userId: 'user-3',
      USDT: '100000',
      BTC: '3.8',
      ETH: '15.2',
      BNB: '25.0',
      lastUpdated: '2024-01-20T17:00:00Z'
    },
    {
      userId: 'user-4',
      USDT: '1000',
      BTC: '0',
      ETH: '0',
      BNB: '0',
      lastUpdated: '2024-01-20T17:00:00Z'
    }
  ],
  systemSettings: {
    maintenanceMode: false,
    tradingEnabled: true,
    registrationEnabled: true,
    kycRequired: true,
    maxLeverage: 100,
    minDeposit: 100,
    maxWithdrawal: 10000,
    tradingHours: '24/7',
    serverStatus: 'Online',
    lastBackup: '2024-01-20T02:00:00Z'
  }
};

// Serve static files from dist/public directory
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Quick start server running' });
});

// Mock API endpoints for basic functionality
app.get('/api/auth', (req, res) => {
  // Check for Authorization header to simulate authenticated user
  const authHeader = req.headers.authorization;
  const sessionId = req.cookies?.sessionId;
  
  console.log('🔍 /api/auth called with headers:', req.headers);
  console.log('🔍 Authorization header:', authHeader);
  console.log('🔍 Session cookie:', sessionId);
  
  // First check session cookie
  if (sessionId && sessions.has(sessionId)) {
    const userData = sessions.get(sessionId);
    console.log('✅ Valid session found, returning user data directly:', userData);
    return res.json(userData); // Return user object directly, not wrapped
  }
  
  // Then check Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('🔍 Token received:', token);
    
    // Mock token validation - return user based on token
    if (token === 'mock-jwt-token-for-superadmin') {
      console.log('✅ Valid superadmin token, returning user data directly');
      res.json({
        id: 'superadmin-1',
        username: 'superadmin',
        role: 'super_admin',
        email: 'superadmin@metachrome.io'
      });
    } else if (token === 'mock-jwt-token-for-admin') {
      console.log('✅ Valid admin token, returning user data directly');
      res.json({
        id: 'admin-1',
        username: 'admin',
        role: 'admin',
        email: 'admin@metachrome.io'
      });
    } else {
      console.log('❌ Invalid token:', token);
      res.json(null);
    }
  } else {
    console.log('❌ No Authorization header or valid session found');
    res.json(null);
  }
});

// Admin login endpoint
app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('🔐 Login attempt:', { username, password });
  
  // Check for superadmin first (has full capabilities)
  if (username === 'superadmin' && password === 'superadmin123') {
    const sessionId = 'session_' + Date.now();
    const userData = {
      id: 'superadmin-1',
      username: 'superadmin',
      role: 'super_admin',
      email: 'superadmin@metachrome.io'
    };
    
    // Store session
    sessions.set(sessionId, userData);
    
    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    console.log('✅ Superadmin login successful, session created:', sessionId);
    
    res.json({
      success: true,
      user: userData,
      token: 'mock-jwt-token-for-superadmin'
    });
  }
  // Check for regular admin (limited capabilities)
  else if (username === 'admin' && password === 'admin123') {
    const sessionId = 'session_' + Date.now();
    const userData = {
      id: 'admin-1',
      username: 'admin',
      role: 'admin',
      email: 'admin@metachrome.io'
    };
    
    // Store session
    sessions.set(sessionId, userData);
    
    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    console.log('✅ Admin login successful, session created:', sessionId);
    
    res.json({
      success: true,
      user: userData,
      token: 'mock-jwt-token-for-admin'
    });
  } else {
    console.log('❌ Login failed: Invalid credentials');
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// User login endpoint
app.post('/api/auth/user/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock user credentials for development
  if (email === 'user@demo.com' && password === 'demo123') {
    res.json({
      success: true,
      user: {
        id: 'user-1',
        email: 'user@demo.com',
        role: 'user',
        balance: { USDT: '10000' }
      },
      token: 'mock-jwt-token-for-development'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Dashboard summary data
app.get('/api/admin/dashboard/summary', (req, res) => {
  const summary = {
    totalUsers: demoData.users.length,
    activeControls: demoData.controls.filter(c => c.status === 'Active').length,
    totalTrades: demoData.trades.length,
    totalVolume: demoData.trades.reduce((sum, trade) => sum + parseFloat(trade.amount), 0).toFixed(2)
  };
  res.json(summary);
});

// Enhanced users endpoint with pagination and filtering
app.get('/api/admin/users', (req, res) => {
  const { page = 1, limit = 10, status, role, search } = req.query;
  
  let filteredUsers = [...demoData.users];
  
  // Apply filters
  if (status) {
    filteredUsers = filteredUsers.filter(user => user.status.toLowerCase() === status.toLowerCase());
  }
  if (role) {
    filteredUsers = filteredUsers.filter(user => user.role.toLowerCase() === role.toLowerCase());
  }
  if (search) {
    filteredUsers = filteredUsers.filter(user => 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  res.json({
    users: paginatedUsers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit)
    }
  });
});

// User management endpoints
app.get('/api/admin/users/:userId', (req, res) => {
  const user = demoData.users.find(u => u.id === req.params.userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.put('/api/admin/users/:userId', (req, res) => {
  const userIndex = demoData.users.findIndex(u => u.id === req.params.userId);
  if (userIndex !== -1) {
    demoData.users[userIndex] = { ...demoData.users[userIndex], ...req.body };
    res.json(demoData.users[userIndex]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/admin/users/:userId', (req, res) => {
  const userIndex = demoData.users.findIndex(u => u.id === req.params.userId);
  if (userIndex !== -1) {
    const deletedUser = demoData.users.splice(userIndex, 1)[0];
    res.json({ success: true, user: deletedUser });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Trades endpoints
app.get('/api/admin/trades', (req, res) => {
  const { page = 1, limit = 10, status, symbol, userId } = req.query;
  
  let filteredTrades = [...demoData.trades];
  
  if (status) {
    filteredTrades = filteredTrades.filter(trade => trade.status.toLowerCase() === status.toLowerCase());
  }
  if (symbol) {
    filteredTrades = filteredTrades.filter(trade => trade.symbol.toLowerCase().includes(symbol.toLowerCase()));
  }
  if (userId) {
    filteredTrades = filteredTrades.filter(trade => trade.userId === userId);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTrades = filteredTrades.slice(startIndex, endIndex);
  
  res.json({
    trades: paginatedTrades,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredTrades.length,
      totalPages: Math.ceil(filteredTrades.length / limit)
    }
  });
});

// Transactions endpoints
app.get('/api/admin/transactions', (req, res) => {
  const { page = 1, limit = 10, type, status, userId } = req.query;
  
  let filteredTransactions = [...demoData.transactions];
  
  if (type) {
    filteredTransactions = filteredTransactions.filter(tx => tx.type.toLowerCase() === type.toLowerCase());
  }
  if (status) {
    filteredTransactions = filteredTransactions.filter(tx => tx.status.toLowerCase() === status.toLowerCase());
  }
  if (userId) {
    filteredTransactions = filteredTransactions.filter(tx => tx.userId === userId);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  res.json({
    transactions: paginatedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredTransactions.length,
      totalPages: Math.ceil(filteredTransactions.length / limit)
    }
  });
});

// Controls endpoints
app.get('/api/admin/controls', (req, res) => {
  res.json(demoData.controls);
});

app.put('/api/admin/controls/:controlId', (req, res) => {
  const controlIndex = demoData.controls.findIndex(c => c.id === req.params.controlId);
  if (controlIndex !== -1) {
    demoData.controls[controlIndex] = { ...demoData.controls[controlIndex], ...req.body };
    res.json(demoData.controls[controlIndex]);
  } else {
    res.status(404).json({ error: 'Control not found' });
  }
});

// Balances endpoints
app.get('/api/admin/balances', (req, res) => {
  const { userId } = req.query;
  
  if (userId) {
    const balance = demoData.balances.find(b => b.userId === userId);
    if (balance) {
      res.json(balance);
    } else {
      res.status(404).json({ error: 'Balance not found' });
    }
  } else {
    res.json(demoData.balances);
  }
});

// System settings endpoints
app.get('/api/admin/system/settings', (req, res) => {
  res.json(demoData.systemSettings);
});

app.put('/api/admin/system/settings', (req, res) => {
  Object.assign(demoData.systemSettings, req.body);
  res.json(demoData.systemSettings);
});

// Mock trading endpoints
app.post('/api/trades/options', (req, res) => {
  const newTrade = {
    id: `trade-${Date.now()}`,
    userId: req.body.userId || 'user-1',
    symbol: req.body.symbol || 'BTCUSDT',
    type: req.body.type || 'CALL',
    amount: req.body.amount || '1000',
    strikePrice: req.body.strikePrice || '45000',
    expiry: req.body.expiry || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'Active',
    profitLoss: '0',
    createdAt: new Date().toISOString()
  };
  
  demoData.trades.push(newTrade);
  
  res.json({
    success: true,
    message: 'Trade created successfully',
    trade: newTrade
  });
});

// Mock logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Session-based auth check (for compatibility)
app.get('/api/auth/session', (req, res) => {
  // Check for Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    if (token === 'mock-jwt-token-for-superadmin') {
      res.json({
        user: {
          id: 'superadmin-1',
          username: 'superadmin',
          role: 'super_admin',
          email: 'superadmin@metachrome.io'
        }
      });
    } else if (token === 'mock-jwt-token-for-admin') {
      res.json({
        user: {
          id: 'superadmin-1',
          username: 'admin',
          role: 'admin',
          email: 'admin@metachrome.io'
        }
      });
    } else {
      res.json({ user: null });
    }
  } else {
    res.json({ user: null });
  }
});

// Dashboard stats endpoint (alternative name)
app.get('/api/admin/stats', (req, res) => {
  const stats = {
    totalUsers: demoData.users.length,
    activeControls: demoData.controls.filter(c => c.status === 'Active').length,
    totalTrades: demoData.trades.length,
    totalVolume: demoData.trades.reduce((sum, trade) => sum + parseFloat(trade.amount), 0).toFixed(2)
  };
  res.json(stats);
});

// Options settings endpoint
app.get('/api/options-settings', (req, res) => {
  res.json([
    {
      id: 'setting-1',
      name: 'Max Leverage',
      value: '100',
      description: 'Maximum leverage allowed for options trading'
    },
    {
      id: 'setting-2',
      name: 'Min Trade Amount',
      value: '100',
      description: 'Minimum trade amount in USDT'
    },
    {
      id: 'setting-3',
      name: 'Expiry Times',
      value: '1h,4h,1d,1w',
      description: 'Available expiry timeframes'
    }
  ]);
});

// Dashboard endpoint (main dashboard data)
app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    summary: {
      totalUsers: demoData.users.length,
      activeControls: demoData.controls.filter(c => c.status === 'Active').length,
      totalTrades: demoData.trades.length,
      totalVolume: demoData.trades.reduce((sum, trade) => sum + parseFloat(trade.amount), 0).toFixed(2)
    },
    recentTrades: demoData.trades.slice(-5),
    recentTransactions: demoData.transactions.slice(-5),
    systemStatus: demoData.systemSettings
  });
});

// System endpoint
app.get('/api/admin/system', (req, res) => {
  res.json({
    settings: demoData.systemSettings,
    controls: demoData.controls,
    status: 'online'
  });
});

// Pending transactions endpoint
app.get('/api/admin/transactions/pending', (req, res) => {
  const pendingTransactions = demoData.transactions.filter(tx => tx.status === 'Pending');
  res.json(pendingTransactions);
});

// Market data endpoint
app.get('/api/market-data', (req, res) => {
  res.json([
    {
      symbol: 'BTCUSDT',
      price: '45000.50',
      change24h: '2.5%',
      volume24h: '1.2B'
    },
    {
      symbol: 'ETHUSDT',
      price: '2800.25',
      change24h: '-1.2%',
      volume24h: '800M'
    },
    {
      symbol: 'BNBUSDT',
      price: '320.75',
      change24h: '0.8%',
      volume24h: '200M'
    }
  ]);
});

// Balances endpoint (for all users)
app.get('/api/balances', (req, res) => {
  res.json(demoData.balances);
});

// Trades endpoint (for all trades)
app.get('/api/trades', (req, res) => {
  res.json(demoData.trades);
});

// Transactions endpoint (for all transactions)
app.get('/api/transactions', (req, res) => {
  res.json(demoData.transactions);
});

// Messages endpoints
app.get('/api/messages/:userId', (req, res) => {
  res.json([
    {
      id: 'msg-1',
      userId: req.params.userId,
      type: 'SYSTEM',
      title: 'Welcome to Metachrome',
      message: 'Your account has been successfully created.',
      read: false,
      createdAt: '2024-01-20T10:00:00Z'
    }
  ]);
});

app.get('/api/messages', (req, res) => {
  res.json([
    {
      id: 'msg-1',
      userId: 'user-1',
      type: 'SYSTEM',
      title: 'Welcome to Metachrome',
      message: 'Your account has been successfully created.',
      read: false,
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: 'msg-2',
      userId: 'user-2',
      type: 'TRADE',
      title: 'Trade Executed',
      message: 'Your BTCUSDT CALL option has been executed successfully.',
      read: true,
      createdAt: '2024-01-20T11:30:00Z'
    }
  ]);
});

// Serve the main app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Quick start server running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`🔐 Demo Credentials:`);
  console.log(`   Superadmin: superadmin / superadmin123`);
  console.log(`   Admin: admin / admin123`);
  console.log(`   User: user@demo.com / demo123`);
  console.log(`📊 Demo data loaded: ${demoData.users.length} users, ${demoData.trades.length} trades, ${demoData.transactions.length} transactions`);
});
