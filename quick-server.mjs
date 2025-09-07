import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
const distPath = path.resolve(__dirname, 'dist', 'public');
app.use(express.static(distPath));

// Simple admin users
const adminUsers = [
  { username: 'admin', password: 'admin123', role: 'admin', id: '1' },
  { username: 'superadmin', password: 'superadmin123', role: 'super_admin', id: '2' }
];

// Store logged in users (in memory for demo)
let loggedInUsers = new Map();

// Mock data stores
let users = [
  {
    id: '1',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    balance: 1000,
    isActive: true,
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    balance: 2500,
    isActive: true,
    walletAddress: '0x2345678901bcdef2345678901bcdef234567890',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'trader1',
    email: 'trader1@example.com',
    role: 'user',
    balance: 5000,
    isActive: false,
    walletAddress: '0x3456789012cdef3456789012cdef345678901234',
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

let trades = [
  {
    id: '1',
    userId: '1',
    symbol: 'BTCUSDT',
    type: 'options',
    amount: '100',
    price: '45000.00',
    direction: 'up',
    duration: 60,
    status: 'completed',
    result: 'win',
    profit: '80',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: { username: 'user1', email: 'user1@example.com' }
  },
  {
    id: '2',
    userId: '2',
    symbol: 'ETHUSDT',
    type: 'options',
    amount: '250',
    price: '3200.00',
    direction: 'down',
    duration: 30,
    status: 'completed',
    result: 'lose',
    profit: '-250',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: { username: 'user2', email: 'user2@example.com' }
  },
  {
    id: '3',
    userId: '3',
    symbol: 'BTCUSDT',
    type: 'options',
    amount: '500',
    price: '45200.00',
    direction: 'up',
    duration: 60,
    status: 'completed',
    result: 'win',
    profit: '400',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    user: { username: 'trader1', email: 'trader1@example.com' }
  }
];

let transactions = [
  { id: '1', userId: '1', type: 'deposit', amount: 1000, status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', userId: '2', type: 'withdrawal', amount: 500, status: 'pending', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', userId: '3', type: 'deposit', amount: 2000, status: 'completed', createdAt: new Date(Date.now() - 7200000).toISOString() }
];

let adminControls = [
  {
    id: '1',
    userId: '1',
    adminId: '2', // superadmin
    controlType: 'normal',
    winRate: 75,
    normalRate: 15,
    loseRate: 10,
    isActive: true,
    notes: 'Standard control settings',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    userId: '2',
    adminId: '2', // superadmin
    controlType: 'win',
    winRate: 60,
    normalRate: 25,
    loseRate: 15,
    isActive: true,
    notes: 'Increased win rate for VIP user',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    userId: '3',
    adminId: '2', // superadmin
    controlType: 'lose',
    winRate: 80,
    normalRate: 10,
    loseRate: 10,
    isActive: false,
    notes: 'Temporary loss control - disabled',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

let systemSettings = {
  tradingEnabled: true,
  maintenanceMode: false,
  minTradeAmount: 10,
  maxTradeAmount: 10000,
  defaultWinRate: 70,
  defaultNormalRate: 20,
  defaultLoseRate: 10
};

// Admin login endpoint
app.post('/api/auth/admin/login', (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);

  const { username, password } = req.body;
  const user = adminUsers.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate a simple session token
  const sessionToken = `admin-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store user session
  loggedInUsers.set(sessionToken, {
    id: user.id,
    username: user.username,
    role: user.role,
    email: `${user.username}@metachrome.io`
  });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      email: `${user.username}@metachrome.io`
    },
    message: "Login successful",
    token: sessionToken
  });
});

// Get current user endpoint
app.get('/api/auth', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const user = loggedInUsers.get(token);
  if (!user) {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.json(user);
});

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
  console.log(`🔐 requireAdmin middleware called for: ${req.method} ${req.url}`);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log(`🔑 Token received:`, token ? `${token.substring(0, 10)}...` : 'none');

  if (!token) {
    console.log(`❌ No token provided`);
    return res.status(401).json({ message: "No token provided" });
  }

  const user = loggedInUsers.get(token);
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return res.status(403).json({ message: "Admin access required" });
  }

  req.user = user;
  next();
};

// Admin Dashboard Stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const totalUsers = users.length;
  const activeControls = adminControls.filter(c => c.isActive).length;
  const totalTrades = trades.length;
  const totalVolume = trades.reduce((sum, trade) => sum + trade.amount, 0);

  res.json({
    totalUsers,
    activeControls,
    totalTrades,
    totalVolume
  });
});

// Users Management
app.get('/api/admin/users', requireAdmin, (req, res) => {
  console.log('📊 Sending users data:', JSON.stringify(users, null, 2));
  res.json(users);
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { username, email, role, balance } = req.body;
  const newUser = {
    id: (users.length + 1).toString(),
    username,
    email,
    role: role || 'user',
    balance: balance || 0,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  res.json(newUser);
});

app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users[userIndex] = { ...users[userIndex], ...req.body };
  res.json(users[userIndex]);
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

// Transactions Management
app.get('/api/admin/transactions', requireAdmin, (req, res) => {
  res.json(transactions);
});

app.put('/api/admin/transactions/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const transactionIndex = transactions.findIndex(t => t.id === id);

  if (transactionIndex === -1) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  transactions[transactionIndex] = { ...transactions[transactionIndex], ...req.body };
  res.json(transactions[transactionIndex]);
});

// Controls Management
app.get('/api/admin/controls', requireAdmin, (req, res) => {
  const controlsWithUserInfo = adminControls.map(control => {
    const user = users.find(u => u.id === control.userId);
    return {
      ...control,
      // Ensure all required fields are present
      controlType: control.controlType || 'normal',
      isActive: control.isActive !== undefined ? control.isActive : true,
      notes: control.notes || '',
      username: user ? user.username : 'Unknown',
      email: user ? user.email : 'Unknown',
      user: user ? { username: user.username, email: user.email } : null
    };
  });
  console.log('📊 Sending controls data:', JSON.stringify(controlsWithUserInfo, null, 2));
  res.json(controlsWithUserInfo);
});

app.post('/api/admin/controls', requireAdmin, (req, res) => {
  const { userId, winRate, normalRate, loseRate, isActive } = req.body;
  const newControl = {
    id: (adminControls.length + 1).toString(),
    userId,
    winRate: winRate || systemSettings.defaultWinRate,
    normalRate: normalRate || systemSettings.defaultNormalRate,
    loseRate: loseRate || systemSettings.defaultLoseRate,
    isActive: isActive !== undefined ? isActive : true
  };
  adminControls.push(newControl);
  res.json(newControl);
});

app.put('/api/admin/controls/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const controlIndex = adminControls.findIndex(c => c.id === id);

  if (controlIndex === -1) {
    return res.status(404).json({ message: 'Control not found' });
  }

  adminControls[controlIndex] = { ...adminControls[controlIndex], ...req.body };
  res.json(adminControls[controlIndex]);
});

app.delete('/api/admin/controls/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const controlIndex = adminControls.findIndex(c => c.id === id);

  if (controlIndex === -1) {
    return res.status(404).json({ message: 'Control not found' });
  }

  adminControls.splice(controlIndex, 1);
  res.json({ message: 'Control deleted successfully' });
});

// Trades Management
app.get('/api/admin/trades', requireAdmin, (req, res) => {
  const tradesWithUserInfo = trades.map(trade => {
    const user = users.find(u => u.id === trade.userId);
    return {
      ...trade,
      username: user ? user.username : 'Unknown',
      user: user ? { username: user.username, email: user.email } : { username: 'Unknown', email: 'Unknown' }
    };
  });
  res.json(tradesWithUserInfo);
});

// All trades endpoint (what the dashboard expects)
app.get('/api/trades', requireAdmin, (req, res) => {
  const tradesWithDefaults = trades.map(trade => ({
    ...trade,
    // Ensure all required fields are present with defaults
    type: trade.type || 'options',
    direction: trade.direction || 'up',
    price: trade.price || '0',
    status: trade.status || 'completed',
    profit: trade.profit || '0'
  }));
  console.log('📊 Sending trades data:', JSON.stringify(tradesWithDefaults, null, 2));
  res.json(tradesWithDefaults);
});

app.put('/api/admin/trades/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const tradeIndex = trades.findIndex(t => t.id === id);

  if (tradeIndex === -1) {
    return res.status(404).json({ message: 'Trade not found' });
  }

  trades[tradeIndex] = { ...trades[tradeIndex], ...req.body };
  res.json(trades[tradeIndex]);
});

// Settings Management
app.get('/api/admin/settings', requireAdmin, (req, res) => {
  res.json(systemSettings);
});

app.put('/api/admin/settings', requireAdmin, (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  res.json(systemSettings);
});

// Balance Management
app.get('/api/admin/balances', requireAdmin, (req, res) => {
  const balances = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    balance: user.balance,
    lastUpdated: new Date().toISOString()
  }));
  res.json(balances);
});

app.put('/api/admin/balances/:userId', requireAdmin, (req, res) => {
  const { userId } = req.params;
  const { balance, action } = req.body; // action can be 'set', 'add', 'subtract'

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  let newBalance = users[userIndex].balance;

  switch (action) {
    case 'set':
      newBalance = balance;
      break;
    case 'add':
      newBalance += balance;
      break;
    case 'subtract':
      newBalance -= balance;
      break;
    default:
      newBalance = balance;
  }

  users[userIndex].balance = Math.max(0, newBalance); // Ensure balance doesn't go negative

  // Add transaction record
  const transaction = {
    id: (transactions.length + 1).toString(),
    userId,
    type: action === 'add' ? 'admin_credit' : action === 'subtract' ? 'admin_debit' : 'admin_adjustment',
    amount: action === 'subtract' ? -balance : balance,
    status: 'completed',
    createdAt: new Date().toISOString(),
    adminId: req.user.id
  };
  transactions.push(transaction);

  res.json({
    user: users[userIndex],
    transaction
  });
});

// User Management (additional endpoints)
app.get('/api/admin/user-management', requireAdmin, (req, res) => {
  const userStats = users.map(user => {
    const userTrades = trades.filter(t => t.userId === user.id);
    const userTransactions = transactions.filter(t => t.userId === user.id);
    const totalTradeVolume = userTrades.reduce((sum, trade) => sum + trade.amount, 0);
    const totalProfit = userTrades.reduce((sum, trade) => sum + (trade.profit || 0), 0);

    return {
      ...user,
      totalTrades: userTrades.length,
      totalVolume: totalTradeVolume,
      totalProfit,
      totalTransactions: userTransactions.length,
      lastTradeDate: userTrades.length > 0 ? userTrades[userTrades.length - 1].createdAt : null
    };
  });

  res.json(userStats);
});

// System Management
app.get('/api/admin/system', requireAdmin, (req, res) => {
  const now = new Date();
  const systemStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalTrades: trades.length,
    totalVolume: trades.reduce((sum, trade) => sum + parseFloat(trade.amount || 0), 0),
    totalProfit: trades.reduce((sum, trade) => sum + parseFloat(trade.profit || 0), 0),
    activeControls: adminControls.filter(c => c.isActive).length,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    systemSettings,
    serverUptime: Math.floor(process.uptime()),
    memoryUsage: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    },
    systemHealth: {
      status: 'healthy',
      database: 'connected',
      api: 'operational',
      lastCheck: now.toISOString()
    },
    performance: {
      responseTime: Math.random() * 50 + 10, // Mock response time
      cpuUsage: Math.random() * 30 + 5, // Mock CPU usage
      requestsPerMinute: Math.floor(Math.random() * 100 + 50)
    }
  };

  console.log('📊 System stats requested:', JSON.stringify(systemStats, null, 2));
  res.json(systemStats);
});

app.post('/api/admin/system/reset', requireAdmin, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  const { resetType } = req.body;

  switch (resetType) {
    case 'trades':
      trades.length = 0;
      break;
    case 'transactions':
      transactions.length = 0;
      break;
    case 'controls':
      adminControls.length = 0;
      break;
    case 'all':
      trades.length = 0;
      transactions.length = 0;
      adminControls.length = 0;
      users.forEach(user => user.balance = 0);
      break;
    default:
      return res.status(400).json({ message: 'Invalid reset type' });
  }

  res.json({ message: `${resetType} data reset successfully` });
});

// System maintenance endpoints
app.post('/api/admin/system/maintenance', requireAdmin, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  const { enabled } = req.body;
  systemSettings.maintenanceMode = enabled;

  console.log(`🔧 Maintenance mode ${enabled ? 'enabled' : 'disabled'} by ${req.user.username}`);
  res.json({
    message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    maintenanceMode: systemSettings.maintenanceMode
  });
});

app.post('/api/admin/system/trading', requireAdmin, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  const { enabled } = req.body;
  systemSettings.tradingEnabled = enabled;

  console.log(`📈 Trading ${enabled ? 'enabled' : 'disabled'} by ${req.user.username}`);
  res.json({
    message: `Trading ${enabled ? 'enabled' : 'disabled'}`,
    tradingEnabled: systemSettings.tradingEnabled
  });
});

app.get('/api/admin/system/logs', requireAdmin, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  // Generate downloadable system logs
  const logEntries = [
    `[${new Date(Date.now() - 300000).toISOString()}] INFO: User login successful - userId: 1, ip: 192.168.1.100`,
    `[${new Date(Date.now() - 600000).toISOString()}] WARN: High memory usage detected - usage: 85%`,
    `[${new Date(Date.now() - 900000).toISOString()}] INFO: Trade executed successfully - tradeId: 123, amount: 100`,
    `[${new Date(Date.now() - 1200000).toISOString()}] ERROR: Database connection timeout - duration: 5000ms`,
    `[${new Date().toISOString()}] INFO: System logs exported by ${req.user.username}`,
  ];

  const logs = logEntries.join('\n');

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.txt"`);
  res.send(logs);
});

// Full system logs endpoint (for viewing in modal)
app.get('/api/admin/system/logs/full', requireAdmin, (req, res) => {
  console.log(`🔍 Full logs endpoint hit by user:`, req.user);

  if (req.user.role !== 'super_admin') {
    console.log(`❌ Access denied - user role: ${req.user.role}`);
    return res.status(403).json({ message: 'Super admin access required' });
  }

  console.log(`📋 Full system logs requested by ${req.user.username}`);

  // Generate comprehensive mock log entries
  const now = new Date();
  const logEntries = [];

  // Generate logs for the last 24 hours
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now.getTime() - (i * 15 * 60 * 1000)); // Every 15 minutes
    const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const logType = logTypes[Math.floor(Math.random() * logTypes.length)];

    const messages = {
      'INFO': [
        'System startup completed',
        'User authentication successful',
        'Trading session started',
        'Database connection established',
        'Cache cleared successfully',
        'Backup process initiated',
        'WebSocket connection established',
        'API request processed',
        'User session created',
        'Trade executed successfully'
      ],
      'WARN': [
        'High memory usage detected',
        'Slow database query detected',
        'Rate limit approaching',
        'Disk space running low',
        'Connection timeout warning',
        'Invalid API request format',
        'User session expired',
        'Cache miss detected'
      ],
      'ERROR': [
        'Database connection timeout',
        'Failed to process payment',
        'Authentication failed',
        'API rate limit exceeded',
        'WebSocket connection lost',
        'Trade execution failed',
        'File system error',
        'Network connectivity issue'
      ],
      'DEBUG': [
        'Processing user request',
        'Validating trade parameters',
        'Checking user permissions',
        'Loading configuration',
        'Initializing components',
        'Cleaning up resources'
      ]
    };

    const message = messages[logType][Math.floor(Math.random() * messages[logType].length)];
    logEntries.push(`[${timestamp.toISOString()}] ${logType}: ${message}`);
  }

  const logs = logEntries.reverse().join('\n');
  res.setHeader('Content-Type', 'text/plain');
  res.send(logs);
});

// System backup endpoint
app.post('/api/admin/system/backup', requireAdmin, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  console.log(`💾 Database backup initiated by ${req.user.username}`);

  // Simulate backup process
  setTimeout(() => {
    console.log(`✅ Database backup completed`);
  }, 1000);

  res.json({
    message: 'Database backup initiated successfully',
    timestamp: new Date().toISOString(),
    initiatedBy: req.user.username
  });
});

// Clear cache endpoint
app.post('/api/admin/system/clear-cache', requireAdmin, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }

  console.log(`🗑️ Cache cleared by ${req.user.username}`);

  // Clear any in-memory caches here
  // For now, just simulate cache clearing

  res.json({
    message: 'System cache cleared successfully',
    timestamp: new Date().toISOString(),
    clearedBy: req.user.username
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`Admin: username=admin, password=admin123`);
  console.log(`Super Admin: username=superadmin, password=superadmin123`);
});
