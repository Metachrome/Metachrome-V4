const express = require('express');
const cors = require('cors');
const path = require('path');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const port = 3000;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 WebSocket message received:', data);

      if (data.type === 'subscribe' && data.symbols) {
        // Store subscribed symbols for this client
        ws.subscribedSymbols = data.symbols;
        console.log('📊 Client subscribed to:', data.symbols);
      }
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
  });
});

// In-memory storage for balances
const userBalances = new Map();

// In-memory storage for chat messages
const chatMessages = new Map(); // userId -> array of messages

// Initialize demo balances
userBalances.set('demo-user-1', { symbol: 'USDT', available: 5000.00, locked: 0.00 });
userBalances.set('demo-user-2', { symbol: 'USDT', available: 3000.00, locked: 500.00 });
userBalances.set('demo-user-3', { symbol: 'USDT', available: 1000.00, locked: 0.00 });
userBalances.set('demo-admin-1', { symbol: 'USDT', available: 10000.00, locked: 0.00 });
userBalances.set('demo-superadmin-1', { symbol: 'USDT', available: 50000.00, locked: 0.00 });

// Initialize demo chat messages
chatMessages.set('demo-user-1', [
  {
    id: 'msg-1',
    fromUserId: 'demo-user-1',
    toUserId: 'admin',
    message: 'Hello, I need help with my account balance.',
    type: 'user_message',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: true,
    sender: 'user'
  },
  {
    id: 'msg-2',
    fromUserId: 'admin',
    toUserId: 'demo-user-1',
    message: 'Hi! I can help you with that. What specific issue are you experiencing?',
    type: 'admin_message',
    timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
    isRead: true,
    sender: 'admin'
  },
  {
    id: 'msg-3',
    fromUserId: 'demo-user-1',
    toUserId: 'admin',
    message: 'My deposit hasn\'t been credited yet.',
    type: 'user_message',
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    isRead: false,
    sender: 'user'
  }
]);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/public')));

// Simple session storage
const sessions = new Map();

// ===== REAL-TIME PRICE SERVICE =====
let currentPrices = {
  'BTCUSDT': { price: '117860.08', change24h: '+1.44%' },
  'ETHUSDT': { price: '3577.42', change24h: '-0.23%' },
  'DOGEUSDT': { price: '0.238780', change24h: '+0.89%' },
  'XRPUSDT': { price: '3.183300', change24h: '-1.77%' },
  'TRUMPUSDT': { price: '10.2300', change24h: '+1.28%' }
};

// Simulate real-time price updates
function startPriceUpdates() {
  console.log('🔌 Starting simulated real-time price updates...');

  setInterval(() => {
    // Update each price with small random changes
    Object.keys(currentPrices).forEach(symbol => {
      const currentPrice = parseFloat(currentPrices[symbol].price);
      const changePercent = (Math.random() - 0.5) * 0.4; // -0.2% to +0.2% change
      const newPrice = currentPrice * (1 + changePercent / 100);

      // Format price based on symbol
      const decimals = symbol === 'DOGEUSDT' ? 6 : 2;
      const formattedPrice = newPrice.toFixed(decimals);

      // Update the price
      currentPrices[symbol] = {
        price: formattedPrice,
        change24h: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
      };

      // Broadcast price update to WebSocket clients
      const priceUpdate = {
        type: 'price_update',
        data: {
          symbol: symbol,
          price: formattedPrice,
          change24h: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
        }
      };

      wss.clients.forEach(client => {
        if (client.readyState === 1 && client.subscribedSymbols && client.subscribedSymbols.includes(symbol)) {
          client.send(JSON.stringify(priceUpdate));
        }
      });
    });
  }, 8000); // Update every 8 seconds
}

// Start real-time price updates
setTimeout(startPriceUpdates, 2000);

// ===== MARKET DATA ENDPOINTS =====
app.get('/api/market-data', (req, res) => {
  console.log('📊 Serving real-time market data');

  const marketData = Object.entries(currentPrices).map(([symbol, data]) => ({
    symbol,
    price: data.price,
    priceChange24h: data.change24h,
    priceChangePercent24h: data.change24h,
    high24h: (parseFloat(data.price) * 1.05).toFixed(2),
    low24h: (parseFloat(data.price) * 0.95).toFixed(2),
    volume24h: (Math.random() * 1000000).toFixed(0),
    timestamp: new Date().toISOString()
  }));

  res.json(marketData);
});

console.log('🚀 Starting minimal server...');

// Health check
app.get('/api/health', (req, res) => {
  console.log('🔄 Health check request received');
  res.json({ status: 'OK', message: 'Server is running' });
});

// Admin login endpoint
app.post('/api/auth/admin/login', (req, res) => {
  console.log('🔄 Admin login request received:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('❌ Missing username or password');
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Demo admin credentials
  if ((username === 'superadmin' && password === 'superadmin123') || 
      (username === 'admin' && password === 'admin123')) {
    console.log('✅ Admin login successful for:', username);
    
    const user = {
      id: username === 'superadmin' ? 'demo-superadmin-1' : 'demo-admin-1',
      username: username,
      email: username === 'superadmin' ? 'superadmin@metachrome.io' : 'admin@metachrome.io',
      role: username === 'superadmin' ? 'super_admin' : 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    // Create session
    const sessionId = 'session-' + Date.now();
    sessions.set(sessionId, user);

    console.log('✅ Session created:', sessionId);

    return res.status(200).json({
      user: user,
      token: sessionId,
      message: "Admin login successful"
    });
  }

  console.log('❌ Invalid admin credentials for:', username);
  return res.status(401).json({ message: "Invalid admin credentials" });
});

// Auth check endpoint
app.get('/api/auth', (req, res) => {
  console.log('🔄 Auth check request received');
  const authToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-session-id'];
  
  if (authToken && sessions.has(authToken)) {
    const user = sessions.get(authToken);
    console.log('✅ Auth check successful:', user.username);
    res.json(user);
  } else {
    console.log('❌ Auth check failed - no valid session');
    res.json(null);
  }
});

// Helper function to get balance for user
const getBalanceForUser = (userId) => {
  const balance = userBalances.get(userId);
  return balance ? balance.available : 0;
};

// Global demo users array
const demoUsers = [
    {
      id: 'demo-user-1',
      username: 'trader1',
      email: 'trader1@metachrome.io',
      role: 'user',
      isActive: true,
      status: 'active',
      trading_mode: 'normal',
      balance: 0, // Will be set dynamically
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-08-30'),
      wallet_address: '0x1234567890abcdef1234567890abcdef12345678'
    },
    {
      id: 'demo-user-2',
      username: 'trader2',
      email: 'trader2@metachrome.io',
      role: 'user',
      isActive: true,
      status: 'active',
      trading_mode: 'win',
      balance: 0, // Will be set dynamically
      createdAt: new Date('2024-02-10'),
      lastLogin: new Date('2024-08-29'),
      wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12'
    },
    {
      id: 'demo-user-3',
      username: 'trader3',
      email: 'trader3@metachrome.io',
      role: 'user',
      isActive: false,
      status: 'inactive',
      trading_mode: 'lose',
      balance: 0, // Will be set dynamically
      createdAt: new Date('2024-03-05'),
      lastLogin: new Date('2024-08-25'),
      wallet_address: null
    },
    {
      id: 'demo-admin-1',
      username: 'admin',
      email: 'admin@metachrome.io',
      role: 'admin',
      isActive: true,
      status: 'active',
      trading_mode: 'normal',
      balance: 0, // Will be set dynamically
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date('2024-08-30'),
      wallet_address: null
    },
    {
      id: 'demo-superadmin-1',
      username: 'superadmin',
      email: 'superadmin@metachrome.io',
      role: 'super_admin',
      isActive: true,
      status: 'active',
      trading_mode: 'normal',
      balance: 0, // Will be set dynamically
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date('2024-08-30'),
      wallet_address: null
    }
  ];

// Demo users endpoint
app.get('/api/admin/users', (req, res) => {
  console.log('🔄 Users list request received');

  // Add current balance to each user and ensure proper field names
  const usersWithBalances = demoUsers.map(user => {
    const balance = userBalances.get(user.id) || { available: 0.00 };
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      status: user.status,
      trading_mode: user.trading_mode,
      balance: parseFloat(balance.available),
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      wallet_address: user.wallet_address
    };
  });

  console.log('🔄 Returning users with current balances:', usersWithBalances);
  res.json(usersWithBalances);
});

// Demo balances endpoint
app.get('/api/admin/balances', (req, res) => {
  console.log('🔄 Balances list request received');
  const demoBalances = [
    {
      id: 'balance-1',
      userId: 'demo-user-1',
      symbol: 'USDT',
      available: '5000.00',
      locked: '0.00',
      user: {
        id: 'demo-user-1',
        username: 'trader1',
        email: 'trader1@metachrome.io'
      }
    },
    {
      id: 'balance-2',
      userId: 'demo-user-2',
      symbol: 'USDT',
      available: '3000.00',
      locked: '500.00',
      user: {
        id: 'demo-user-2',
        username: 'trader2',
        email: 'trader2@metachrome.io'
      }
    },
    {
      id: 'balance-3',
      userId: 'demo-user-3',
      symbol: 'USDT',
      available: '1000.00',
      locked: '0.00',
      user: {
        id: 'demo-user-3',
        username: 'trader3',
        email: 'trader3@metachrome.io'
      }
    }
  ];
  res.json(demoBalances);
});

// Balance management endpoints
app.post('/api/admin/deposit', (req, res) => {
  console.log('🔄 Manual deposit request received:', req.body);
  const { userId, amount, note } = req.body;

  // Get current balance or create new one
  const currentBalance = userBalances.get(userId) || { symbol: 'USDT', available: 0.00, locked: 0.00 };

  // Add deposit amount to available balance
  const newBalance = {
    ...currentBalance,
    available: currentBalance.available + parseFloat(amount)
  };

  // Update balance in storage
  userBalances.set(userId, newBalance);

  console.log('🔄 Updated balance after deposit for', userId, ':', newBalance);

  res.json({
    message: 'Deposit processed successfully',
    transaction: {
      id: 'tx-' + Date.now(),
      userId: userId,
      type: 'deposit',
      amount: amount,
      status: 'completed',
      note: note,
      createdAt: new Date().toISOString()
    },
    newBalance: {
      available: newBalance.available.toFixed(2),
      locked: newBalance.locked.toFixed(2)
    }
  });
});

app.post('/api/admin/withdraw', (req, res) => {
  console.log('🔄 Manual withdrawal request received:', req.body);
  const { userId, amount, note } = req.body;

  // Get current balance
  const currentBalance = userBalances.get(userId) || { symbol: 'USDT', available: 0.00, locked: 0.00 };

  // Check if sufficient balance
  const withdrawAmount = parseFloat(amount);
  if (currentBalance.available < withdrawAmount) {
    return res.status(400).json({
      error: 'Insufficient balance',
      available: currentBalance.available.toFixed(2),
      requested: withdrawAmount.toFixed(2)
    });
  }

  // Subtract withdrawal amount from available balance
  const newBalance = {
    ...currentBalance,
    available: currentBalance.available - withdrawAmount
  };

  // Update balance in storage
  userBalances.set(userId, newBalance);

  console.log('🔄 Updated balance after withdrawal for', userId, ':', newBalance);

  res.json({
    message: 'Withdrawal processed successfully',
    transaction: {
      id: 'tx-' + Date.now(),
      userId: userId,
      type: 'withdraw',
      amount: amount,
      status: 'completed',
      note: note,
      createdAt: new Date().toISOString()
    },
    newBalance: {
      available: newBalance.available.toFixed(2),
      locked: newBalance.locked.toFixed(2)
    }
  });
});

// User balance endpoint for individual users
app.get('/api/balances', (req, res) => {
  console.log('🔄 User balance request received');
  // Return balance for the current user (demo)
  const userBalance = [
    {
      id: 'balance-user-1',
      userId: 'demo-user-1',
      symbol: 'USDT',
      available: '5000.00',
      locked: '0.00'
    }
  ];
  res.json(userBalance);
});

// Individual user balance endpoints
app.get('/api/admin/balances/:userId', (req, res) => {
  console.log('🔄 Individual user balance request received for:', req.params.userId);
  const userId = req.params.userId;

  // Get balance from storage or default
  const balance = userBalances.get(userId) || { symbol: 'USDT', available: 0.00, locked: 0.00 };

  const userBalance = {
    id: 'balance-' + userId,
    userId: userId,
    symbol: balance.symbol,
    available: balance.available.toFixed(2),
    locked: balance.locked.toFixed(2)
  };

  console.log('🔄 Returning balance for', userId, ':', userBalance);
  res.json(userBalance);
});

// Mock balances for spot trading (persistent) - Using superadmin balance
let mockBalancesSpot = [
  {
    id: 'balance-1',
    userId: 'demo-superadmin-1',
    currency: 'USDT',
    balance: 50000,
    available: 50000,
    locked: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'balance-2',
    userId: 'demo-superadmin-1',
    currency: 'BTC',
    balance: 0.5,
    available: 0.5,
    locked: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// User balances endpoint for spot trading
app.get('/api/user/balances', (req, res) => {
  console.log('💰 User balances requested for spot trading');

  // For now, always return superadmin balance (50,000 USDT)
  console.log('💰 Returning superadmin balances:', mockBalancesSpot);
  res.json(mockBalancesSpot);
});

// Options trading endpoint
app.post('/api/trades/options', (req, res) => {
  console.log('🎯 Options trade request received:', req.body);

  const { userId, symbol, direction, amount, duration } = req.body;

  if (!userId || !symbol || !direction || !amount || !duration) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const tradeAmount = parseFloat(amount);

  // Check minimum amount
  if (tradeAmount < 10) {
    return res.status(400).json({
      success: false,
      message: "Minimum trade amount is 10 USDT"
    });
  }

  // Get current balance
  const currentBalance = userBalances.get(userId);
  if (!currentBalance || currentBalance.available < tradeAmount) {
    return res.status(400).json({
      success: false,
      message: "Insufficient balance"
    });
  }

  // Deduct balance
  const newBalance = currentBalance.available - tradeAmount;
  userBalances.set(userId, {
    available: newBalance,
    locked: currentBalance.locked + tradeAmount
  });

  // Update mock balances for consistency
  mockBalancesSpot[0].balance = newBalance;
  mockBalancesSpot[0].available = newBalance;
  mockBalancesSpot[0].locked = currentBalance.locked + tradeAmount;

  // Create trade record
  const trade = {
    id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    userId,
    symbol,
    direction,
    amount: tradeAmount,
    duration,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  console.log(`💰 Balance updated: ${currentBalance.available} -> ${newBalance} USDT`);
  console.log(`🎯 Options trade created:`, trade);

  res.json({
    success: true,
    trade,
    message: 'Trade created successfully'
  });
});

// Trade completion endpoint - handles balance updates when trades finish
app.post('/api/trades/complete', (req, res) => {
  console.log('🏁 Trade completion request received:', req.body);

  const { tradeId, userId, won, amount, payout } = req.body;

  if (!tradeId || !userId || won === undefined || !amount) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  // Get current balance
  const currentBalance = userBalances.get(userId);
  if (!currentBalance) {
    return res.status(400).json({
      success: false,
      message: "User balance not found"
    });
  }

  const tradeAmount = parseFloat(amount);
  let balanceChange = 0;

  if (won) {
    // User won - add payout to available balance and unlock the locked amount
    balanceChange = parseFloat(payout) || (tradeAmount * 1.8); // Default 80% profit if no payout specified
    const newAvailable = currentBalance.available + balanceChange;
    const newLocked = Math.max(0, currentBalance.locked - tradeAmount);

    userBalances.set(userId, {
      available: newAvailable,
      locked: newLocked
    });

    // Update mock balances for consistency
    mockBalancesSpot[0].balance = newAvailable;
    mockBalancesSpot[0].available = newAvailable;
    mockBalancesSpot[0].locked = newLocked;

    console.log(`🎉 Trade WON: +${balanceChange} USDT (New balance: ${newAvailable})`);
  } else {
    // User lost - just unlock the locked amount (money is already deducted)
    const newLocked = Math.max(0, currentBalance.locked - tradeAmount);

    userBalances.set(userId, {
      available: currentBalance.available,
      locked: newLocked
    });

    // Update mock balances for consistency
    mockBalancesSpot[0].locked = newLocked;

    console.log(`💸 Trade LOST: -${tradeAmount} USDT (Balance unchanged: ${currentBalance.available})`);
  }

  res.json({
    success: true,
    message: `Trade completed: ${won ? 'WON' : 'LOST'}`,
    balanceChange: won ? balanceChange : -tradeAmount
  });
});

// ===== SUPER ADMIN ENDPOINTS =====

// Deposit endpoint
app.post('/api/superadmin/deposit', (req, res) => {
  console.log('💰 Processing deposit:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const depositAmount = Number(amount);
  if (depositAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
  }

  // Update user balance
  const currentBalance = userBalances.get(userId) || { available: 0, locked: 0 };
  const newBalance = currentBalance.available + depositAmount;

  userBalances.set(userId, {
    available: newBalance,
    locked: currentBalance.locked
  });

  // Update demo user balance for consistency
  demoUsers[userIndex].balance = newBalance;

  console.log(`✅ Deposited ${depositAmount} USDT to ${demoUsers[userIndex].username}. New balance: ${newBalance}`);

  res.json({
    success: true,
    message: `Successfully deposited ${depositAmount} USDT`,
    user: { ...demoUsers[userIndex], password: undefined }
  });
});

// Withdrawal endpoint
app.post('/api/superadmin/withdrawal', (req, res) => {
  console.log('💸 Processing withdrawal:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const withdrawalAmount = Number(amount);
  if (withdrawalAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  // Check current balance
  const currentBalance = userBalances.get(userId) || { available: 0, locked: 0 };
  if (currentBalance.available < withdrawalAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }

  // Update user balance
  const newBalance = currentBalance.available - withdrawalAmount;

  userBalances.set(userId, {
    available: newBalance,
    locked: currentBalance.locked
  });

  // Update demo user balance for consistency
  demoUsers[userIndex].balance = newBalance;

  console.log(`✅ Withdrew ${withdrawalAmount} USDT from ${demoUsers[userIndex].username}. New balance: ${newBalance}`);

  res.json({
    success: true,
    message: `Successfully withdrew ${withdrawalAmount} USDT`,
    user: { ...demoUsers[userIndex], password: undefined }
  });
});

// Change password endpoint
app.post('/api/superadmin/change-password', (req, res) => {
  console.log('🔑 Changing user password:', req.body);
  const { userId, newPassword } = req.body;

  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  demoUsers[userIndex].password = newPassword;

  console.log(`✅ Password changed for ${demoUsers[userIndex].username}`);

  res.json({
    success: true,
    message: 'Password updated successfully',
    user: { ...demoUsers[userIndex], password: undefined }
  });
});

// Update wallet address endpoint
app.post('/api/superadmin/update-wallet', (req, res) => {
  console.log('🏦 Updating wallet address:', req.body);
  const { userId, walletAddress } = req.body;

  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  demoUsers[userIndex].wallet_address = walletAddress || null;

  console.log(`✅ Wallet address updated for ${demoUsers[userIndex].username}: ${walletAddress || 'removed'}`);

  res.json({
    success: true,
    message: 'Wallet address updated successfully',
    user: { ...demoUsers[userIndex], password: undefined }
  });
});

// Wallet history endpoint
app.get('/api/superadmin/wallet-history/:userId', (req, res) => {
  console.log('📜 Getting wallet history for user:', req.params.userId);
  const { userId } = req.params;

  // Mock wallet history data
  const walletHistory = [
    {
      id: 'wh-1',
      date: new Date().toISOString(),
      action: 'Updated',
      oldAddress: '0x1234...5678',
      newAddress: '0xabcd...efgh',
      note: 'Admin updated wallet address'
    }
  ];

  res.json({
    success: true,
    history: walletHistory
  });
});

// Trading controls endpoint
app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 Setting trading controls:', req.body);
  const { userId, controlType } = req.body;

  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Update trading mode
  demoUsers[userIndex].trading_mode = controlType;

  console.log(`✅ Trading mode set to ${controlType} for ${demoUsers[userIndex].username}`);

  res.json({
    success: true,
    message: `Trading mode updated to ${controlType}`,
    user: { ...demoUsers[userIndex], password: undefined }
  });
});

// Spot trading endpoints
let spotOrders = [];

app.post('/api/spot/orders', (req, res) => {
  console.log('📊 Creating spot order:', req.body);
  const { symbol, side, type, amount, price, total } = req.body;

  // Validate required fields
  if (!symbol || !side || !type || !amount || !total) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!['buy', 'sell'].includes(side)) {
    return res.status(400).json({ message: "Invalid side. Must be 'buy' or 'sell'" });
  }

  if (!['limit', 'market'].includes(type)) {
    return res.status(400).json({ message: "Invalid type. Must be 'limit' or 'market'" });
  }

  const amountNum = parseFloat(amount);
  const totalNum = parseFloat(total);

  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (isNaN(totalNum) || totalNum <= 0) {
    return res.status(400).json({ message: "Invalid total" });
  }

  const order = {
    id: `spot-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'demo-user',
    symbol,
    side,
    type,
    amount: amountNum.toString(),
    price: price || null,
    total: totalNum.toString(),
    status: 'filled', // Auto-fill for demo
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  spotOrders.push(order);
  console.log('✅ Spot order created:', order.id, side.toUpperCase(), amountNum, symbol);

  // Update mock balances for spot trading
  if (side === 'buy') {
    // Deduct USDT, add BTC
    mockBalancesSpot[0].balance -= totalNum;
    mockBalancesSpot[1].balance += amountNum;
    console.log(`💰 Balance updated: -${totalNum} USDT, +${amountNum} BTC`);
  } else {
    // Deduct BTC, add USDT
    mockBalancesSpot[1].balance -= amountNum;
    mockBalancesSpot[0].balance += totalNum;
    console.log(`💰 Balance updated: -${amountNum} BTC, +${totalNum} USDT`);
  }

  console.log('💰 New balances:', mockBalancesSpot);

  res.json(order);
});

app.get('/api/spot/orders', (req, res) => {
  console.log('📊 Getting spot orders');
  res.json(spotOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

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

// Demo user login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 User login attempt:', req.body);
  const { username, password } = req.body;

  // Demo user credentials
  if (username === 'demo' && password === 'demo123') {
    console.log('✅ Demo user login successful');
    res.json({
      success: true,
      token: 'demo-token-123',
      user: {
        id: 'demo-user',
        username: 'demo',
        email: 'demo@metachrome.io',
        role: 'user',
        balance: 10000
      }
    });
  } else {
    console.log('❌ User login failed:', username);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ===== ADMIN MANAGEMENT ENDPOINTS =====
// Mock data for admin dashboard
// Mock data for trades and transactions (keeping these for the dashboard)
const mockTrades = [
  {
    id: 'trade-1',
    user_id: 'demo-user-1',
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
    user_id: 'demo-user-2',
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
  }
];

const mockTransactions = [
  {
    id: 'tx-1',
    user_id: 'demo-user-1',
    type: 'deposit',
    amount: 10000,
    status: 'completed',
    created_at: new Date().toISOString(),
    users: { username: 'trader1' }
  },
  {
    id: 'tx-2',
    user_id: 'demo-user-2',
    type: 'withdrawal',
    amount: 2000,
    status: 'pending',
    created_at: new Date().toISOString(),
    users: { username: 'trader2' }
  },
  {
    id: 'tx-3',
    user_id: 'demo-user-3',
    type: 'deposit',
    amount: 15000,
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    users: { username: 'trader3' }
  }
];

// Admin Trades endpoint
app.get('/api/admin/trades', (req, res) => {
  console.log('📈 Getting trades list - Count:', mockTrades.length);
  res.json(mockTrades);
});

// Admin Transactions endpoint
app.get('/api/admin/transactions', (req, res) => {
  console.log('💰 Getting transactions list - Count:', mockTransactions.length);
  res.json(mockTransactions);
});

// Admin Stats endpoint
app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Getting admin stats');
  const stats = {
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter(u => u.status === 'active').length,
    totalTrades: mockTrades.length,
    totalTransactions: mockTransactions.length,
    totalVolume: mockTrades.reduce((sum, t) => sum + t.amount, 0),
    totalBalance: mockUsers.reduce((sum, u) => sum + u.balance, 0)
  };
  console.log('📊 Admin stats calculated:', stats);
  res.json(stats);
});

// Super Admin System Stats endpoint
app.get('/api/superadmin/system-stats', (req, res) => {
  console.log('📊 Getting system stats');
  const stats = {
    totalUsers: mockUsers.length,
    activeUsers: mockUsers.filter(u => u.status === 'active').length,
    suspendedUsers: mockUsers.filter(u => u.status === 'suspended').length,
    bannedUsers: mockUsers.filter(u => u.status === 'banned').length,
    totalTrades: mockTrades.length,
    pendingTrades: mockTrades.filter(t => t.result === 'pending').length,
    winningTrades: mockTrades.filter(t => t.result === 'win').length,
    losingTrades: mockTrades.filter(t => t.result === 'lose').length,
    totalTransactions: mockTransactions.length,
    pendingTransactions: mockTransactions.filter(t => t.status === 'pending').length,
    totalVolume: mockTrades.reduce((sum, t) => sum + t.amount, 0),
    totalBalance: mockUsers.reduce((sum, u) => sum + u.balance, 0)
  };
  console.log('📊 System stats calculated:', stats);
  res.json(stats);
});

// Create User endpoint
app.post('/api/admin/users', (req, res) => {
  console.log('👤 Creating new user:', req.body);
  const { username, email, password, balance, role, trading_mode } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields: username, email, and password are required' });
  }

  // Check if username already exists
  if (mockUsers.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  // Check if email already exists
  if (mockUsers.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    password,
    balance: Number(balance) || 10000,
    role: role || 'user',
    status: 'active',
    trading_mode: trading_mode || 'normal',
    created_at: new Date().toISOString(),
    last_login: null
  };

  mockUsers.push(newUser);
  console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
  res.json({ success: true, user: { ...newUser, password: undefined } });
});

// Update User endpoint
app.put('/api/admin/users/:id', (req, res) => {
  console.log('✏️ Updating user:', req.params.id, req.body);
  const userId = req.params.id;
  const { username, email, balance, role, status, trading_mode } = req.body;

  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if username already exists (excluding current user)
  if (username && mockUsers.find(u => u.username === username && u.id !== userId)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Update user data
  const updatedUser = {
    ...mockUsers[userIndex],
    ...(username && { username }),
    ...(email && { email }),
    ...(balance !== undefined && { balance: Number(balance) }),
    ...(role && { role }),
    ...(status && { status }),
    ...(trading_mode && { trading_mode }),
    updated_at: new Date().toISOString()
  };

  mockUsers[userIndex] = updatedUser;
  console.log('✅ User updated successfully:', updatedUser.username, 'ID:', updatedUser.id, 'Balance:', updatedUser.balance);
  res.json(updatedUser);
});

// Trading Controls endpoint
app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 Updating trading control:', req.body);
  const { userId, controlType } = req.body;

  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    demoUsers[userIndex].trading_mode = controlType;
    console.log(`✅ Updated ${demoUsers[userIndex].username} trading mode to ${controlType}`);
    res.json({
      success: true,
      message: `Trading mode updated to ${controlType.toUpperCase()}`,
      user: demoUsers[userIndex]
    });
  } else {
    console.log('❌ User not found:', userId);
    res.status(404).json({ error: 'User not found' });
  }
});

// Trading Settings endpoint
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

// Manual Trade Control endpoint
app.post('/api/admin/trades/:tradeId/control', (req, res) => {
  console.log('🎮 Manual trade control:', req.params.tradeId, req.body);
  const { tradeId } = req.params;
  const { action } = req.body;

  const tradeIndex = mockTrades.findIndex(t => t.id === tradeId);
  if (tradeIndex !== -1 && mockTrades[tradeIndex].result === 'pending') {
    mockTrades[tradeIndex].result = action;
    mockTrades[tradeIndex].exit_price = mockTrades[tradeIndex].entry_price + (action === 'win' ? 50 : -50);
    mockTrades[tradeIndex].profit = action === 'win' ?
      mockTrades[tradeIndex].amount * 0.1 :
      -mockTrades[tradeIndex].amount;

    console.log(`✅ Trade ${tradeId} manually set to ${action}`);
    res.json({
      success: true,
      message: `Trade set to ${action.toUpperCase()}`,
      trade: mockTrades[tradeIndex]
    });
  } else {
    console.log('❌ Trade not found or already completed:', tradeId);
    res.status(404).json({ error: 'Trade not found or already completed' });
  }
});

app.put('/api/admin/balances/:userId', (req, res) => {
  try {
    console.log('🔄 Update user balance request received for:', req.params.userId);
    console.log('🔄 Balance update data:', req.body);
    const userId = req.params.userId;
    const { symbol, available, locked, balance, action, note } = req.body;

  // Get current balance
  const currentBalance = userBalances.get(userId) || { symbol: 'USDT', available: 0.00, locked: 0.00 };

  let newBalance;

  // Handle different request formats
  if (action && balance !== undefined) {
    // Frontend deposit/withdraw format: {balance: amount, action: 'add'/'subtract', note: ''}
    const amount = parseFloat(balance);
    if (action === 'add') {
      newBalance = {
        ...currentBalance,
        available: currentBalance.available + amount
      };
    } else if (action === 'subtract') {
      newBalance = {
        ...currentBalance,
        available: Math.max(0, currentBalance.available - amount)
      };
    } else {
      newBalance = currentBalance;
    }
  } else {
    // Direct balance update format: {symbol: 'USDT', available: '1000.00', locked: '0.00'}
    newBalance = {
      symbol: symbol || currentBalance.symbol,
      available: parseFloat(available) || currentBalance.available,
      locked: parseFloat(locked) || currentBalance.locked
    };
  }

  // Update balance in storage
  userBalances.set(userId, newBalance);
  console.log('🔄 Updated balance for', userId, ':', newBalance);

  // ALSO UPDATE THE USER'S BALANCE FIELD FOR USER MANAGEMENT TABLE
  const userIndex = demoUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    demoUsers[userIndex].balance = newBalance.available;
    demoUsers[userIndex].updatedAt = new Date().toISOString();
    console.log('🔄 Updated user record balance for', userId, ':', demoUsers[userIndex].balance);
  }

    res.json({
      message: 'Balance updated successfully',
      balance: {
        id: 'balance-' + userId,
        userId: userId,
        symbol: newBalance.symbol,
        available: newBalance.available.toFixed(2),
        locked: newBalance.locked.toFixed(2),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error updating balance:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Demo transactions endpoints
app.get('/api/admin/transactions/pending', (req, res) => {
  console.log('🔄 Pending transactions request received');
  const demoTransactions = [
    {
      id: 'tx-1',
      userId: 'demo-user-1',
      username: 'trader1',
      type: 'deposit',
      amount: '500.00',
      symbol: 'USDT',
      status: 'pending',
      method: 'crypto',
      createdAt: new Date('2024-01-15T08:00:00Z'),
      txHash: '0x1234567890abcdef1234567890abcdef12345678',
      metadata: JSON.stringify({ method: 'crypto', network: 'TRC20' })
    },
    {
      id: 'tx-2',
      userId: 'demo-user-2',
      username: 'trader2',
      type: 'withdraw',
      amount: '200.00',
      symbol: 'USDT',
      status: 'pending',
      method: 'crypto',
      createdAt: new Date('2024-01-15T07:30:00Z'),
      txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      metadata: JSON.stringify({ method: 'crypto', network: 'TRC20', address: '0x742d35Cc6634C0532925a3b8D' })
    }
  ];
  res.json(demoTransactions);
});

app.get('/api/admin/transactions', (req, res) => {
  console.log('🔄 All transactions request received');
  const demoTransactions = [
    {
      id: 'tx-1',
      userId: 'demo-user-1',
      username: 'trader1',
      type: 'deposit',
      amount: '500.00',
      symbol: 'USDT',
      status: 'pending',
      method: 'crypto',
      createdAt: new Date('2024-01-15T08:00:00Z'),
      txHash: '0x1234567890abcdef1234567890abcdef12345678',
      metadata: JSON.stringify({ method: 'crypto', network: 'TRC20' })
    },
    {
      id: 'tx-2',
      userId: 'demo-user-2',
      username: 'trader2',
      type: 'withdraw',
      amount: '200.00',
      symbol: 'USDT',
      status: 'pending',
      method: 'crypto',
      createdAt: new Date('2024-01-15T07:30:00Z'),
      txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      metadata: JSON.stringify({ method: 'crypto', network: 'TRC20', address: '0x742d35Cc6634C0532925a3b8D' })
    },
    {
      id: 'tx-3',
      userId: 'demo-user-3',
      username: 'trader3',
      type: 'deposit',
      amount: '0.01',
      symbol: 'BTC',
      status: 'completed',
      method: 'crypto',
      createdAt: new Date('2024-01-14T15:20:00Z'),
      txHash: '0x9876543210fedcba9876543210fedcba98765432',
      metadata: JSON.stringify({ method: 'crypto', network: 'Bitcoin' })
    }
  ];
  res.json(demoTransactions);
});

// Transaction approval endpoint
app.post('/api/admin/transactions/:id/approve', (req, res) => {
  console.log('🔄 Transaction approval request received for tx:', req.params.id);
  const { action, reason } = req.body;
  res.json({
    message: `Transaction ${action}d successfully`,
    action,
    reason
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// User management endpoints
app.put('/api/admin/users/:id', (req, res) => {
  console.log('🔄 User update request received for user:', req.params.id);
  console.log('🔄 Update data:', req.body);

  const { username, email, walletAddress, role, isActive, password, adminNotes } = req.body;
  const userId = req.params.id;

  // Find and update the user in demoUsers array
  const userIndex = demoUsers.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    // Update the user data
    demoUsers[userIndex] = {
      ...demoUsers[userIndex],
      username: username || demoUsers[userIndex].username,
      email: email || demoUsers[userIndex].email,
      wallet_address: walletAddress || demoUsers[userIndex].wallet_address,
      role: role || demoUsers[userIndex].role,
      isActive: isActive !== undefined ? isActive : demoUsers[userIndex].isActive,
      adminNotes: adminNotes || demoUsers[userIndex].adminNotes,
      updatedAt: new Date().toISOString()
    };

    console.log('✅ User updated in memory:', demoUsers[userIndex]);

    // Return the updated user
    res.json({
      message: 'User updated successfully',
      user: demoUsers[userIndex]
    });
  } else {
    console.log('❌ User not found:', userId);
    res.status(404).json({
      message: 'User not found'
    });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  console.log('🔄 User delete request received for user:', req.params.id);
  const userId = req.params.id;

  // Find and remove the user from demoUsers array
  const userIndex = demoUsers.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    const deletedUser = demoUsers.splice(userIndex, 1)[0];
    console.log('✅ User deleted from memory:', deletedUser.username);

    res.json({
      message: 'User deleted successfully',
      userId: userId,
      deletedAt: new Date().toISOString()
    });
  } else {
    console.log('❌ User not found for deletion:', userId);
    res.status(404).json({
      message: 'User not found'
    });
  }
});

// Chat/messaging endpoints
app.post('/api/admin/send-message', (req, res) => {
  console.log('🔄 Send message request received:', req.body);
  const { userId, message } = req.body;

  // Simulate successful message sending
  res.json({
    message: 'Message sent successfully',
    messageId: 'msg-' + Date.now(),
    userId,
    content: message,
    sentAt: new Date().toISOString()
  });
});

// Admin messages endpoint (used by AdminDashboard)
app.post('/api/admin/messages', (req, res) => {
  console.log('🔄 Admin messages request received:', req.body);
  const { userId, message, type } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ message: "User ID and message are required" });
  }

  // Check if target user exists
  const user = demoUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Create message record
  const messageData = {
    id: Date.now().toString(),
    fromUserId: 'admin',
    toUserId: userId,
    message,
    type: type || 'admin_message',
    timestamp: new Date().toISOString(),
    isRead: false,
    sender: 'admin'
  };

  // Store message in chat history
  if (!chatMessages.has(userId)) {
    chatMessages.set(userId, []);
  }
  chatMessages.get(userId).push(messageData);

  console.log('✅ Message sent successfully:', messageData);

  res.json({
    message: 'Message sent successfully',
    data: messageData
  });
});

// Get chat messages for a user
app.get('/api/admin/messages/:userId', (req, res) => {
  console.log('🔄 Get chat messages request for user:', req.params.userId);
  const userId = req.params.userId;

  // Get messages for this user
  const messages = chatMessages.get(userId) || [];

  console.log('✅ Returning', messages.length, 'messages for user:', userId);
  res.json(messages);
});

// User sends message to admin
app.post('/api/messages', (req, res) => {
  console.log('🔄 User message request received:', req.body);
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ message: "Message and user ID are required" });
  }

  // Create message record
  const messageData = {
    id: Date.now().toString(),
    fromUserId: userId,
    toUserId: 'admin',
    message,
    type: 'user_message',
    timestamp: new Date().toISOString(),
    isRead: false,
    sender: 'user'
  };

  // Store message in chat history
  if (!chatMessages.has(userId)) {
    chatMessages.set(userId, []);
  }
  chatMessages.get(userId).push(messageData);

  console.log('✅ User message sent successfully:', messageData);

  res.json({
    message: 'Message sent successfully',
    data: messageData
  });
});

// Get user's own chat messages
app.get('/api/messages/:userId', (req, res) => {
  console.log('🔄 Get user chat messages request for user:', req.params.userId);
  const userId = req.params.userId;

  // Get messages for this user
  const messages = chatMessages.get(userId) || [];

  console.log('✅ Returning', messages.length, 'messages for user:', userId);
  res.json(messages);
});

// Admin controls endpoints
app.get('/api/admin/controls', (req, res) => {
  console.log('🔄 Admin controls request received');
  const demoControls = [
    {
      id: 'control-1',
      userId: 'demo-user-1',
      adminId: 'demo-superadmin-1',
      controlType: 'win',
      isActive: true,
      notes: 'Test control - user should always win',
      createdAt: new Date('2024-08-25').toISOString(),
      user: {
        id: 'demo-user-1',
        username: 'trader1',
        email: 'trader1@metachrome.io'
      }
    }
  ];
  res.json(demoControls);
});

app.post('/api/admin/controls', (req, res) => {
  console.log('🔄 Create control request received:', req.body);
  const { userId, controlType, notes } = req.body;

  res.json({
    message: 'Control created successfully',
    control: {
      id: 'control-' + Date.now(),
      userId,
      adminId: 'demo-superadmin-1',
      controlType,
      isActive: true,
      notes,
      createdAt: new Date().toISOString()
    }
  });
});

// Trades endpoint
app.get('/api/admin/trades', (req, res) => {
  console.log('🔄 Trades request received');
  const demoTrades = [];
  res.json(demoTrades);
});

// Serve static files from dist/public
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Catch-all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Start server with WebSocket support
server.listen(port, () => {
  console.log('🎉 METACHROME V2 - Complete server started successfully!');
  console.log(`🌐 Server running on: http://localhost:${port}`);
  console.log(`🔌 WebSocket server running on: ws://localhost:${port}/ws`);
  console.log(`📊 Real-time market data enabled`);
  console.log(`💰 Spot trading with balance updates enabled`);
  console.log(`🔗 Try: http://localhost:${port}/api/health`);
  console.log(`🔗 Admin login: http://localhost:${port}/admin/login`);
  console.log(`🔗 Spot trading: http://localhost:${port}/trade/spot`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
});
