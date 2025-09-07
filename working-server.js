const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 9000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

console.log('🚀 METACHROME V2 - WORKING ADMIN SERVER STARTING...');
console.log('📁 Serving static files from:', distPath);

// ===== IN-MEMORY DATA STORE =====
let users = [
  {
    id: 'user-1',
    username: 'trader1',
    email: 'trader1@metachrome.io',
    balance: 10000,
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@metachrome.io',
    balance: 50000,
    role: 'admin',
    status: 'active',
    trading_mode: 'normal',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'user-2',
    username: 'trader2',
    email: 'trader2@metachrome.io',
    balance: 5000,
    role: 'user',
    status: 'active',
    trading_mode: 'win',
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'user-3',
    username: 'trader3',
    email: 'trader3@metachrome.io',
    balance: 15000,
    role: 'user',
    status: 'active',
    trading_mode: 'lose',
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 7200000).toISOString()
  }
];

let trades = [
  {
    id: 'trade-1',
    user_id: 'user-1',
    symbol: 'BTC/USD',
    amount: 1000,
    direction: 'up',
    duration: 30,
    entry_price: 45000,
    exit_price: null,
    result: 'pending',
    profit: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 25000).toISOString(),
    users: { username: 'trader1' }
  },
  {
    id: 'trade-2',
    user_id: 'user-2',
    symbol: 'ETH/USD',
    amount: 500,
    direction: 'down',
    duration: 60,
    entry_price: 3200,
    exit_price: 3180,
    result: 'win',
    profit: 75,
    created_at: new Date(Date.now() - 120000).toISOString(),
    expires_at: new Date(Date.now() - 60000).toISOString(),
    users: { username: 'trader2' }
  },
  {
    id: 'trade-3',
    user_id: 'user-3',
    symbol: 'BTC/USD',
    amount: 2000,
    direction: 'up',
    duration: 30,
    entry_price: 44800,
    exit_price: 44750,
    result: 'lose',
    profit: -2000,
    created_at: new Date(Date.now() - 300000).toISOString(),
    expires_at: new Date(Date.now() - 270000).toISOString(),
    users: { username: 'trader3' }
  },
  {
    id: 'trade-4',
    user_id: 'user-1',
    symbol: 'ETH/USD',
    amount: 750,
    direction: 'down',
    duration: 60,
    entry_price: 3210,
    exit_price: null,
    result: 'pending',
    profit: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 45000).toISOString(),
    users: { username: 'trader1' }
  }
];

let transactions = [
  {
    id: 'tx-1',
    user_id: 'user-1',
    type: 'deposit',
    amount: 10000,
    status: 'completed',
    created_at: new Date().toISOString(),
    users: { username: 'trader1' }
  },
  {
    id: 'tx-2',
    user_id: 'user-2',
    type: 'withdrawal',
    amount: 2000,
    status: 'pending',
    created_at: new Date().toISOString(),
    users: { username: 'trader2' }
  },
  {
    id: 'tx-3',
    user_id: 'user-3',
    type: 'deposit',
    amount: 15000,
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    users: { username: 'trader3' }
  },
  {
    id: 'tx-4',
    user_id: 'user-1',
    type: 'withdrawal',
    amount: 500,
    status: 'completed',
    created_at: new Date(Date.now() - 43200000).toISOString(),
    users: { username: 'trader1' }
  }
];

// ===== AUTHENTICATION ENDPOINTS =====
app.post('/api/admin/login', (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);
  const { username, password } = req.body;
  
  if ((username === 'superadmin' && password === 'superadmin123') ||
      (username === 'admin' && password === 'admin123')) {
    const role = username === 'superadmin' ? 'super_admin' : 'admin';
    console.log('✅ Admin login successful:', username, role);
    res.json({
      success: true,
      token: 'mock-admin-token',
      user: { username, role }
    });
  } else {
    console.log('❌ Admin login failed:', username);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ===== USER MANAGEMENT ENDPOINTS =====
app.get('/api/admin/users', (req, res) => {
  console.log('👥 Getting users list - Count:', users.length);
  res.json(users);
});

app.post('/api/admin/users', (req, res) => {
  console.log('👤 Creating new user:', req.body);
  const { username, email, password, balance, role, trading_mode } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    balance: Number(balance) || 10000,
    role: role || 'user',
    status: 'active',
    trading_mode: trading_mode || 'normal',
    created_at: new Date().toISOString(),
    last_login: null
  };
  
  users.push(newUser);
  console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
  res.json(newUser);
});

// ===== USER UPDATE ENDPOINT =====
app.put('/api/admin/users/:id', (req, res) => {
  console.log('✏️ Updating user:', req.params.id, req.body);
  const userId = req.params.id;
  const { username, email, balance, role, status, trading_mode } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if username already exists (excluding current user)
  if (username && users.find(u => u.username === username && u.id !== userId)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Update user data
  const updatedUser = {
    ...users[userIndex],
    ...(username && { username }),
    ...(email && { email }),
    ...(balance !== undefined && { balance: Number(balance) }),
    ...(role && { role }),
    ...(status && { status }),
    ...(trading_mode && { trading_mode }),
    updated_at: new Date().toISOString()
  };

  users[userIndex] = updatedUser;
  console.log('✅ User updated successfully:', updatedUser.username, 'ID:', updatedUser.id);
  res.json(updatedUser);
});

app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 Updating trading control:', req.body);
  const { userId, controlType } = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].trading_mode = controlType;
    console.log(`✅ Updated ${users[userIndex].username} trading mode to ${controlType}`);
    res.json({ 
      success: true, 
      message: `Trading mode updated to ${controlType.toUpperCase()}`,
      user: users[userIndex]
    });
  } else {
    console.log('❌ User not found:', userId);
    res.status(404).json({ error: 'User not found' });
  }
});

// ===== TRADING ENDPOINTS =====
app.get('/api/admin/trades', (req, res) => {
  console.log('📈 Getting trades list - Count:', trades.length);
  res.json(trades);
});

app.post('/api/admin/trades/:tradeId/control', (req, res) => {
  console.log('🎮 Manual trade control:', req.params.tradeId, req.body);
  const { tradeId } = req.params;
  const { action } = req.body;
  
  const tradeIndex = trades.findIndex(t => t.id === tradeId);
  if (tradeIndex !== -1 && trades[tradeIndex].result === 'pending') {
    trades[tradeIndex].result = action;
    trades[tradeIndex].exit_price = trades[tradeIndex].entry_price + (action === 'win' ? 50 : -50);
    trades[tradeIndex].profit = action === 'win' ? 
      trades[tradeIndex].amount * 0.1 : 
      -trades[tradeIndex].amount;
    
    console.log(`✅ Trade ${tradeId} manually set to ${action}`);
    res.json({ 
      success: true, 
      message: `Trade set to ${action.toUpperCase()}`,
      trade: trades[tradeIndex]
    });
  } else {
    console.log('❌ Trade not found or already completed:', tradeId);
    res.status(404).json({ error: 'Trade not found or already completed' });
  }
});

// ===== TRANSACTION ENDPOINTS =====
app.get('/api/admin/transactions', (req, res) => {
  console.log('💰 Getting transactions list - Count:', transactions.length);
  res.json(transactions);
});

// ===== SYSTEM STATS ENDPOINT =====
app.get('/api/superadmin/system-stats', (req, res) => {
  console.log('📊 Getting system stats');
  
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    bannedUsers: users.filter(u => u.status === 'banned').length,
    totalTrades: trades.length,
    pendingTrades: trades.filter(t => t.result === 'pending').length,
    winningTrades: trades.filter(t => t.result === 'win').length,
    losingTrades: trades.filter(t => t.result === 'lose').length,
    totalTransactions: transactions.length,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0)
  };
  
  console.log('📊 Stats calculated:', stats);
  res.json(stats);
});

// ===== TRADING SETTINGS ENDPOINT =====
app.get('/api/admin/trading-settings', (req, res) => {
  console.log('⚙️ Getting trading settings');
  res.json([
    {
      id: 'setting-30s',
      duration: 30,
      min_amount: 100,
      profit_percentage: 10,
      enabled: true
    },
    {
      id: 'setting-60s',
      duration: 60,
      min_amount: 1000,
      profit_percentage: 15,
      enabled: true
    }
  ]);
});

// ===== SPA ROUTING =====
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('📄 Serving SPA route:', req.path);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <h1>METACHROME V2 - File Not Found</h1>
      <p>Index file not found at: ${indexPath}</p>
      <p>Please run 'npm run build' first</p>
    `);
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log('🎉 ===================================');
  console.log('🚀 METACHROME V2 WORKING SERVER READY!');
  console.log('🌐 Server running on: http://127.0.0.1:' + PORT);
  console.log('🔧 Admin Dashboard: http://127.0.0.1:' + PORT + '/admin');
  console.log('🔐 Login: superadmin / superadmin123');
  console.log('📊 All endpoints are FULLY FUNCTIONAL!');
  console.log('🎉 ===================================');
});
