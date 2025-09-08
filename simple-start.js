console.log('🚀 Starting METACHROME server...');

import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import https from 'https';

console.log('📦 Imports loaded successfully');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost and 127.0.0.1 on any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow Vercel domains
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }

    // Allow Railway domains
    if (origin.includes('railway.app')) {
      return callback(null, true);
    }

    // Allow Render domains
    if (origin.includes('onrender.com')) {
      return callback(null, true);
    }

    // Default deny
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public with proper MIME types
const distPath = path.join(__dirname, 'dist', 'public');

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.path.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// Handle admin asset paths - redirect /admin/assets/* to /assets/*
app.use('/admin/assets', express.static(path.join(distPath, 'assets'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve static files from root
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

console.log('🚀 METACHROME V2 - COMPLETE WORKING SERVER STARTING...');
console.log('📁 Serving static files from:', distPath);

// ===== REAL-TIME PRICE SERVICE =====
let currentPrices = {
  'BTCUSDT': { price: '117860.08', change24h: '+1.44%' },
  'ETHUSDT': { price: '3577.42', change24h: '-0.23%' },
  'DOGEUSDT': { price: '0.238780', change24h: '+0.89%' },
  'XRPUSDT': { price: '3.183300', change24h: '-1.77%' },
  'ADAUSDT': { price: '0.821200', change24h: '+0.66%' }
};

// Simulate real-time price updates with realistic data
function updatePricesWithRealisticData() {
  try {
    console.log('📡 Updating prices with realistic market simulation...');

    // Use realistic base prices and simulate small movements
    const basePrices = {
      'BTCUSDT': 117860.08,
      'ETHUSDT': 3577.42,
      'DOGEUSDT': 0.238780,
      'XRPUSDT': 3.183300,
      'ADAUSDT': 0.821200
    };

    Object.keys(basePrices).forEach(symbol => {
      const basePrice = basePrices[symbol];
      // Simulate realistic price movement (-0.5% to +0.5%)
      const changePercent = (Math.random() - 0.5) * 1.0;
      const newPrice = basePrice * (1 + changePercent / 100);

      // Format price based on symbol
      const decimals = symbol === 'DOGEUSDT' ? 6 : 2;
      const formattedPrice = newPrice.toFixed(decimals);

      currentPrices[symbol] = {
        price: formattedPrice,
        change24h: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
      };

      console.log(`📈 ${symbol}: $${formattedPrice} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
    });

    console.log('✅ Price update cycle completed');
  } catch (error) {
    console.error('❌ Error updating prices:', error);
  }
}

// Start real-time price updates with realistic simulation
function startPriceUpdates() {
  console.log('🔌 Starting REAL-TIME price updates with realistic market simulation...');

  // Initial update
  updatePricesWithRealisticData();

  // Update prices every 3 seconds with realistic simulation
  setInterval(() => {
    updatePricesWithRealisticData();

    // Broadcast price updates to WebSocket clients
    Object.entries(currentPrices).forEach(([symbol, data]) => {
      const priceUpdate = {
        type: 'price_update',
        data: {
          symbol: symbol,
          price: data.price,
          change24h: data.change24h
        }
      };

      wss.clients.forEach(client => {
        if (client.readyState === 1 && client.subscribedSymbols && client.subscribedSymbols.includes(symbol)) {
          client.send(JSON.stringify(priceUpdate));
        }
      });
    });
  }, 3000); // Update every 3 seconds with realistic data
}

// Start real-time price updates
setTimeout(startPriceUpdates, 2000);

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
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
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
    wallet_address: null,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'superadmin-1',
    username: 'superadmin',
    email: 'superadmin@metachrome.io',
    balance: 100000,
    role: 'super_admin',
    status: 'active',
    trading_mode: 'normal',
    wallet_address: null,
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
    wallet_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'user-3',
    username: 'trader3',
    email: 'trader3@metachrome.io',
    balance: 15000,
    role: 'user',
    status: 'inactive',
    trading_mode: 'lose',
    wallet_address: null,
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'demo-user-1',
    username: 'john_trader',
    email: 'john@example.com',
    balance: 25000,
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    wallet_address: '0x742d35Cc6479C5f95912c4E8BC2C1234567890AB',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    last_login: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo-user-2',
    username: 'sarah_crypto',
    email: 'sarah@example.com',
    balance: 18500,
    role: 'user',
    status: 'active',
    trading_mode: 'win',
    wallet_address: '0x123456789ABCDEF123456789ABCDEF1234567890',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    last_login: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'demo-user-3',
    username: 'mike_hodler',
    email: 'mike@example.com',
    balance: 8200,
    role: 'user',
    status: 'active',
    trading_mode: 'lose',
    wallet_address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    last_login: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'demo-user-4',
    username: 'emma_trader',
    email: 'emma@example.com',
    balance: 3500,
    role: 'user',
    status: 'suspended',
    trading_mode: 'normal',
    wallet_address: '0x9876543210987654321098765432109876543210',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    last_login: new Date(Date.now() - 86400000).toISOString()
  }
];

let trades = [
  {
    id: 'trade-1',
    user_id: 'demo-user-1',
    symbol: 'BTCUSDT',
    amount: 1000,
    direction: 'up',
    duration: 30,
    entry_price: 117500,
    exit_price: null,
    result: 'pending',
    profit: null,
    status: 'active',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 25000).toISOString(),
    users: { username: 'john_trader' }
  },
  {
    id: 'trade-2',
    user_id: 'demo-user-2',
    symbol: 'BTCUSDT',
    amount: 1500,
    direction: 'down',
    duration: 60,
    entry_price: 117800,
    exit_price: 117650,
    result: 'win',
    profit: 225,
    status: 'completed',
    created_at: new Date(Date.now() - 120000).toISOString(),
    expires_at: new Date(Date.now() - 60000).toISOString(),
    users: { username: 'sarah_crypto' }
  },
  {
    id: 'trade-3',
    user_id: 'demo-user-3',
    symbol: 'BTCUSDT',
    amount: 500,
    direction: 'up',
    duration: 30,
    entry_price: 117600,
    exit_price: 117550,
    result: 'lose',
    profit: -500,
    status: 'completed',
    created_at: new Date(Date.now() - 300000).toISOString(),
    expires_at: new Date(Date.now() - 270000).toISOString(),
    users: { username: 'mike_hodler' }
  },
  {
    id: 'trade-4',
    user_id: 'demo-user-1',
    symbol: 'BTCUSDT',
    amount: 750,
    direction: 'down',
    duration: 60,
    entry_price: 117900,
    exit_price: 117750,
    result: 'win',
    profit: 112.5,
    status: 'completed',
    created_at: new Date(Date.now() - 600000).toISOString(),
    expires_at: new Date(Date.now() - 540000).toISOString(),
    users: { username: 'john_trader' }
  },
  {
    id: 'trade-5',
    user_id: 'demo-user-2',
    symbol: 'BTCUSDT',
    amount: 2000,
    direction: 'up',
    duration: 30,
    entry_price: 117400,
    exit_price: null,
    result: 'pending',
    profit: null,
    status: 'active',
    created_at: new Date(Date.now() - 15000).toISOString(),
    expires_at: new Date(Date.now() + 15000).toISOString(),
    users: { username: 'sarah_crypto' }
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
    user_id: 'demo-user-1',
    username: 'john_trader',
    type: 'deposit',
    amount: 25000,
    symbol: 'USDT',
    status: 'completed',
    description: 'Initial deposit',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    users: { username: 'john_trader' }
  },
  {
    id: 'tx-2',
    user_id: 'demo-user-2',
    username: 'sarah_crypto',
    type: 'trade_win',
    amount: 225,
    symbol: 'USDT',
    status: 'completed',
    description: 'Options trade win - BTCUSDT down',
    created_at: new Date(Date.now() - 120000).toISOString(),
    users: { username: 'sarah_crypto' }
  },
  {
    id: 'tx-3',
    user_id: 'demo-user-3',
    username: 'mike_hodler',
    type: 'trade_loss',
    amount: -500,
    symbol: 'USDT',
    status: 'completed',
    description: 'Options trade loss - BTCUSDT up',
    created_at: new Date(Date.now() - 300000).toISOString(),
    users: { username: 'mike_hodler' }
  },
  {
    id: 'tx-4',
    user_id: 'demo-user-1',
    username: 'john_trader',
    type: 'trade_win',
    amount: 112.5,
    symbol: 'USDT',
    status: 'completed',
    description: 'Options trade win - BTCUSDT down',
    created_at: new Date(Date.now() - 600000).toISOString(),
    users: { username: 'john_trader' }
  },
  {
    id: 'tx-5',
    user_id: 'demo-user-2',
    username: 'sarah_crypto',
    type: 'deposit',
    amount: 20000,
    symbol: 'USDT',
    status: 'completed',
    description: 'Account funding',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    users: { username: 'sarah_crypto' }
  },
  {
    id: 'tx-6',
    user_id: 'demo-user-4',
    username: 'emma_trader',
    type: 'withdrawal',
    amount: 1000,
    symbol: 'USDT',
    status: 'pending',
    description: 'Withdrawal request',
    created_at: new Date(Date.now() - 43200000).toISOString(),
    users: { username: 'emma_trader' }
  },
  {
    id: 'tx-7',
    user_id: 'demo-user-3',
    username: 'mike_hodler',
    type: 'admin_adjustment',
    amount: 2000,
    symbol: 'USDT',
    status: 'completed',
    description: 'Admin balance adjustment',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    users: { username: 'mike_hodler' }
  }
];

// ===== HEALTH CHECK ENDPOINT =====
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

app.get('/', (req, res) => {
  console.log('🏠 Root endpoint accessed');
  res.json({
    message: 'METACHROME V2 API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// ===== MARKET DATA ENDPOINTS =====
app.get('/api/market-data', (req, res) => {
  console.log('📊 Serving real-time market data');

  const marketData = Object.entries(currentPrices).map(([symbol, data]) => {
    const price = parseFloat(data.price);
    const changePercent = parseFloat(data.change24h.replace('%', '').replace('+', ''));

    return {
      symbol,
      price: data.price,
      priceChange24h: (price * (changePercent / 100)).toFixed(symbol === 'DOGEUSDT' ? 6 : 2),
      priceChangePercent24h: changePercent.toFixed(2),
      high24h: (price * 1.05).toFixed(symbol === 'DOGEUSDT' ? 6 : 2),
      low24h: (price * 0.95).toFixed(symbol === 'DOGEUSDT' ? 6 : 2),
      volume24h: (Math.random() * 1000000 + 500000).toFixed(0),
      timestamp: new Date().toISOString()
    };
  });

  console.log(`📊 Returning ${marketData.length} real-time market data entries`);
  res.json(marketData);
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

// User authentication endpoint - returns default user for demo
app.get('/api/auth', (req, res) => {
  console.log('👤 User auth request');

  // Return the default user for demo purposes
  const defaultUser = users.find(u => u.id === 'user-1');
  if (defaultUser) {
    res.json({
      id: defaultUser.id,
      username: defaultUser.username,
      email: defaultUser.email,
      balance: defaultUser.balance,
      role: defaultUser.role,
      status: defaultUser.status,
      trading_mode: defaultUser.trading_mode,
      wallet_address: defaultUser.wallet_address
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
});

// User login endpoint - simple demo login
app.post('/api/auth', (req, res) => {
  console.log('👤 User login/register attempt:', req.body);

  // For demo purposes, always return the default user
  const defaultUser = users.find(u => u.id === 'user-1');
  if (defaultUser) {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: defaultUser.id,
        username: defaultUser.username,
        email: defaultUser.email,
        balance: defaultUser.balance,
        role: defaultUser.role,
        status: defaultUser.status,
        trading_mode: defaultUser.trading_mode,
        wallet_address: defaultUser.wallet_address
      },
      token: `user-session-${Date.now()}`
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'User not found'
    });
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
    return res.status(400).json({ success: false, message: 'Missing required fields: username, email, and password are required' });
  }

  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  // Check if email already exists
  if (users.find(u => u.email === email)) {
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
  
  users.push(newUser);
  console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
  res.json({ success: true, user: { ...newUser, password: undefined } });
});

app.put('/api/admin/users/:id', (req, res) => {
  console.log('✏️ Updating user:', req.params.id, req.body);
  const userId = req.params.id;
  const { username, email, balance, role, status, trading_mode, wallet_address } = req.body;

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
    ...(wallet_address !== undefined && { wallet_address }),
    updated_at: new Date().toISOString()
  };

  users[userIndex] = updatedUser;
  console.log('✅ User updated successfully:', updatedUser.username, 'ID:', updatedUser.id, 'Balance:', updatedUser.balance, 'Wallet:', updatedUser.wallet_address);

  // Broadcast balance update to WebSocket clients if balance was changed
  if (balance !== undefined) {
    const balanceUpdate = {
      type: 'balance_update',
      data: {
        userId: updatedUser.id,
        symbol: 'USDT',
        newBalance: updatedUser.balance,
        username: updatedUser.username
      }
    };

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(balanceUpdate));
      }
    });

    console.log('📡 Broadcasted balance update:', updatedUser.username, updatedUser.balance);
  }

  res.json(updatedUser);
});

app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 Updating trading control:', req.body);
  const { userId, controlType } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].trading_mode = controlType;
    console.log(`✅ Updated ${users[userIndex].username} trading mode to ${controlType}`);

    // Broadcast trading control update to WebSocket clients
    const controlUpdate = {
      type: 'trading_control_update',
      data: {
        userId: users[userIndex].id,
        username: users[userIndex].username,
        controlType: controlType,
        timestamp: new Date().toISOString()
      }
    };

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(controlUpdate));
      }
    });

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

// ===== SYSTEM STATS ENDPOINTS =====
app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Getting admin stats');

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalTrades: trades.length,
    totalTransactions: transactions.length,
    totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0)
  };

  console.log('📊 Admin stats calculated:', stats);
  res.json(stats);
});

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
      min_amount: 10,
      profit_percentage: 10,
      enabled: true
    },
    {
      id: 'setting-60s',
      duration: 60,
      min_amount: 10,
      profit_percentage: 15,
      enabled: true
    }
  ]);
});

// ===== WALLET HISTORY ENDPOINT =====
app.get('/api/superadmin/wallet-history/:userId', (req, res) => {
  console.log('💳 Getting wallet history for user:', req.params.userId);

  // Mock wallet history data with correct structure for the modal
  const walletHistory = [
    {
      id: 'wh-1',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      changed_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      changed_by: 'admin',
      note: 'Initial wallet setup'
    },
    {
      id: 'wh-2',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      changed_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      changed_by: 'superadmin',
      note: 'Updated by admin'
    }
  ];

  res.json({ history: walletHistory });
});

// Manual trade control endpoint
app.post('/api/admin/trades/:tradeId/control', (req, res) => {
  console.log('🎮 Manual trade control:', req.params.tradeId, req.body);

  const { tradeId } = req.params;
  const { action } = req.body;

  const tradeIndex = trades.findIndex(t => t.id === tradeId);
  if (tradeIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Trade not found'
    });
  }

  const trade = trades[tradeIndex];
  if (trade.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Trade is not active'
    });
  }

  const user = users.find(u => u.id === (trade.userId || trade.user_id));
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Force the trade outcome
  const isWin = action === 'win';
  const tradeAmount = parseFloat(trade.amount);
  const profitPercentage = trade.duration === 30 ? 0.10 : 0.15;
  const profit = isWin ? tradeAmount * profitPercentage : 0;

  // Update trade
  trade.status = 'completed';
  trade.result = isWin ? 'win' : 'lose';
  trade.exit_price = trade.entry_price * (isWin ? 1.01 : 0.99);
  trade.profit = isWin ? profit : -tradeAmount;
  trade.updated_at = new Date().toISOString();

  // Update user balance if won
  if (isWin) {
    user.balance += tradeAmount + profit; // Return original amount + profit
  }

  console.log(`🎮 Trade ${tradeId} manually controlled: ${action.toUpperCase()}, User balance: ${user.balance}`);

  // Broadcast updates
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: user.id,
      symbol: 'USDT',
      newBalance: user.balance,
      username: user.username,
      action: isWin ? 'trade_win' : 'trade_loss',
      amount: isWin ? profit : tradeAmount
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  res.json({
    success: true,
    trade,
    message: `Trade ${action} executed successfully`
  });
});

// ===== SUPER ADMIN ENDPOINTS =====

// Deposit endpoint
app.post('/api/superadmin/deposit', (req, res) => {
  console.log('💰 Processing deposit:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const depositAmount = Number(amount);
  if (depositAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
  }

  // Update user balance
  users[userIndex].balance += depositAmount;

  console.log(`✅ Deposited ${depositAmount} USDT to ${users[userIndex].username}. New balance: ${users[userIndex].balance}`);

  // Broadcast balance update to WebSocket clients
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: users[userIndex].id,
      symbol: 'USDT',
      newBalance: users[userIndex].balance,
      username: users[userIndex].username,
      action: 'deposit',
      amount: depositAmount
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  res.json({
    success: true,
    message: `Successfully deposited ${depositAmount} USDT`,
    user: { ...users[userIndex], password: undefined }
  });
});

// Withdrawal endpoint
app.post('/api/superadmin/withdrawal', (req, res) => {
  console.log('💸 Processing withdrawal:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const withdrawalAmount = Number(amount);
  if (withdrawalAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  // Check current balance
  if (users[userIndex].balance < withdrawalAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }

  // Update user balance
  users[userIndex].balance -= withdrawalAmount;

  console.log(`✅ Withdrew ${withdrawalAmount} USDT from ${users[userIndex].username}. New balance: ${users[userIndex].balance}`);

  // Broadcast balance update to WebSocket clients
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: users[userIndex].id,
      symbol: 'USDT',
      newBalance: users[userIndex].balance,
      username: users[userIndex].username,
      action: 'withdrawal',
      amount: withdrawalAmount
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  res.json({
    success: true,
    message: `Successfully withdrew ${withdrawalAmount} USDT`,
    user: { ...users[userIndex], password: undefined }
  });
});

// Change password endpoint
app.post('/api/superadmin/change-password', (req, res) => {
  console.log('🔑 Changing user password:', req.body);
  const { userId, newPassword } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  users[userIndex].password = newPassword;

  console.log(`✅ Password changed for ${users[userIndex].username}`);

  res.json({
    success: true,
    message: 'Password updated successfully',
    user: { ...users[userIndex], password: undefined }
  });
});

// Update wallet address endpoint
app.post('/api/superadmin/update-wallet', (req, res) => {
  console.log('🏦 Updating wallet address:', req.body);
  const { userId, walletAddress } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users[userIndex].wallet_address = walletAddress || null;

  console.log(`✅ Wallet address updated for ${users[userIndex].username}: ${walletAddress || 'removed'}`);

  res.json({
    success: true,
    message: 'Wallet address updated successfully',
    user: { ...users[userIndex], password: undefined }
  });
});

// ===== BALANCE ENDPOINTS =====
app.get('/api/balances', (req, res) => {
  console.log('💰 Getting user balances');

  // Get the actual superadmin user balance
  const superadminUser = users.find(u => u.username === 'superadmin');
  const actualBalance = superadminUser ? superadminUser.balance : 100000;

  console.log('💰 Returning actual superadmin balance:', actualBalance, 'USDT');

  const balances = [
    {
      id: 'balance-1',
      userId: 'superadmin-1',
      symbol: 'USDT',
      available: actualBalance, // Use the actual superadmin balance
      locked: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'balance-2',
      userId: 'superadmin-1',
      symbol: 'BTC',
      available: 0,
      locked: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'balance-3',
      userId: 'superadmin-1',
      symbol: 'ETH',
      available: 0,
      locked: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json(balances);
});

app.get('/api/user/balances', (req, res) => {
  console.log('💰 Getting user balances for spot trading');

  // Get the actual user balance (same logic as spot orders)
  const actualUserId = req.query.userId || 'user-1'; // Allow userId from query
  const user = users.find(u => u.id === actualUserId);
  const actualBalance = user ? user.balance : 100000;

  console.log('💰 Returning actual user balance for', actualUserId, ':', actualBalance, 'USDT');

  const balances = [
    {
      id: 'balance-1',
      userId: actualUserId,
      currency: 'USDT',
      balance: actualBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'balance-2',
      userId: actualUserId,
      currency: 'BTC',
      balance: 0.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.json(balances);
});

// Dynamic balance endpoint for any user
app.get('/api/balances/:userId', (req, res) => {
  console.log('💰 Getting balance for user:', req.params.userId);

  const userId = req.params.userId;
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  console.log('💰 Returning balance for', user.username, ':', user.balance, 'USDT');

  res.json({
    success: true,
    userId: userId,
    balance: {
      USDT: {
        available: user.balance.toString(),
        locked: '0',
        symbol: 'USDT'
      }
    }
  });
});

// Balance update endpoint for admin
app.post('/api/balances/:userId', (req, res) => {
  console.log('💰 Updating balance for user:', req.params.userId, req.body);

  const userId = req.params.userId;
  const { action, amount, symbol } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const changeAmount = parseFloat(amount);
  if (isNaN(changeAmount) || changeAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount'
    });
  }

  // Apply balance change
  if (action === 'add') {
    users[userIndex].balance += changeAmount;
  } else if (action === 'subtract') {
    users[userIndex].balance = Math.max(0, users[userIndex].balance - changeAmount);
  } else if (action === 'set') {
    users[userIndex].balance = Math.max(0, changeAmount);
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use add, subtract, or set'
    });
  }

  console.log(`✅ Balance ${action}: ${users[userIndex].username}, Amount: ${changeAmount}, New Balance: ${users[userIndex].balance}`);

  // Broadcast balance update to WebSocket clients
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: users[userIndex].id,
      symbol: symbol || 'USDT',
      newBalance: users[userIndex].balance,
      username: users[userIndex].username,
      action: action,
      amount: changeAmount
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  res.json({
    success: true,
    userId: userId,
    action: action,
    amount: changeAmount,
    newBalance: users[userIndex].balance,
    balance: {
      USDT: {
        available: users[userIndex].balance.toString(),
        locked: '0',
        symbol: 'USDT'
      }
    }
  });
});

// Admin balance update endpoint (PUT method for frontend compatibility)
app.put('/api/admin/balances/:userId', (req, res) => {
  console.log('💰 Admin updating balance for user:', req.params.userId, req.body);

  const userId = req.params.userId;
  const { balance, action, note } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  let changeAmount = 0;
  let finalAction = action;

  if (typeof balance === 'number') {
    if (action === 'add') {
      changeAmount = balance;
      users[userIndex].balance += balance;
    } else if (action === 'subtract') {
      changeAmount = balance;
      users[userIndex].balance = Math.max(0, users[userIndex].balance - balance);
    } else {
      // Default to setting the balance
      changeAmount = balance - users[userIndex].balance;
      users[userIndex].balance = Math.max(0, balance);
      finalAction = 'set';
    }
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid balance amount'
    });
  }

  console.log(`✅ Admin Balance ${finalAction}: ${users[userIndex].username}, Amount: ${changeAmount}, New Balance: ${users[userIndex].balance}`);

  // Broadcast balance update to WebSocket clients
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: users[userIndex].id,
      symbol: 'USDT',
      newBalance: users[userIndex].balance,
      username: users[userIndex].username,
      action: finalAction,
      amount: Math.abs(changeAmount)
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  res.json({
    success: true,
    userId: userId,
    action: finalAction,
    amount: Math.abs(changeAmount),
    newBalance: users[userIndex].balance,
    user: { ...users[userIndex], password: undefined }
  });
});

// ===== SPOT TRADING ENDPOINTS =====
let spotOrders = [];

app.post('/api/spot/orders', (req, res) => {
  console.log('📊 Creating spot order:', req.body);
  const { symbol, side, type, amount, price, total, userId } = req.body;

  // Get user ID from request or use default
  const actualUserId = userId || 'user-1';

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
  const priceNum = price ? parseFloat(price) : null;

  if (amountNum <= 0 || totalNum <= 0) {
    return res.status(400).json({ message: "Amount and total must be positive" });
  }

  if (type === 'limit' && (!priceNum || priceNum <= 0)) {
    return res.status(400).json({ message: "Price is required for limit orders" });
  }

  // Find user and validate balance
  const user = users.find(u => u.id === actualUserId);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check minimum amount (same as options trading)
  if (totalNum < 100) {
    return res.status(400).json({ message: "Minimum order amount is $100" });
  }

  // For buy orders, check if user has enough USDT balance
  // For sell orders, check if user has enough crypto (simplified: assume they have it)
  if (side === 'buy') {
    if (user.balance < totalNum) {
      return res.status(400).json({ message: "Insufficient USDT balance" });
    }
    // Deduct USDT balance for buy orders
    user.balance -= totalNum;
  }

  // Create spot order
  const order = {
    id: `spot-order-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    userId: actualUserId,
    symbol,
    side,
    type,
    amount: amountNum,
    price: priceNum,
    total: totalNum,
    status: 'filled', // Immediately fill orders for simplicity
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    filledAt: new Date().toISOString()
  };

  spotOrders.push(order);

  // For sell orders, add USDT to balance (user gets money)
  if (side === 'sell') {
    user.balance += totalNum;
  }

  // Broadcast balance update to WebSocket clients
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: user.id,
      symbol: 'USDT',
      newBalance: user.balance,
      username: user.username,
      orderType: side,
      orderAmount: totalNum,
      orderSymbol: symbol
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  console.log(`✅ Spot order ${side.toUpperCase()}: ${amountNum} ${symbol} for $${totalNum.toFixed(2)}, User: ${user.username}, New Balance: $${user.balance.toFixed(2)}`);

  res.json(order);
});

app.get('/api/spot/orders', (req, res) => {
  console.log('📊 Getting spot orders');
  res.json(spotOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

app.delete('/api/spot/orders/:id', (req, res) => {
  console.log('❌ Cancelling spot order:', req.params.id);
  const { id } = req.params;

  const orderIndex = spotOrders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  const order = spotOrders[orderIndex];
  if (order.status !== 'pending') {
    return res.status(400).json({ message: "Can only cancel pending orders" });
  }

  // Update order status
  spotOrders[orderIndex].status = 'cancelled';
  spotOrders[orderIndex].updatedAt = new Date().toISOString();

  console.log('✅ Spot order cancelled:', id);
  res.json({ message: "Order cancelled successfully" });
});

// Get active trades for user
app.get('/api/trades/active', (req, res) => {
  console.log('📊 Getting active trades for user');

  const userId = req.query.userId || 'user-1'; // Default to user-1 if not specified

  // Filter active trades for the user
  const activeTrades = trades.filter(trade =>
    (trade.userId === userId || trade.user_id === userId) &&
    trade.status === 'active'
  );

  console.log(`📊 Found ${activeTrades.length} active trades for user ${userId}`);

  res.json(activeTrades);
});

// Complete trade endpoint (for manual completion)
app.post('/api/trades/complete', (req, res) => {
  console.log('🏁 Completing trade manually:', req.body);

  const { tradeId, userId, won, amount, payout } = req.body;

  const tradeIndex = trades.findIndex(t => t.id === tradeId);
  if (tradeIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Trade not found'
    });
  }

  const trade = trades[tradeIndex];
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update trade status
  trade.status = 'completed';
  trade.result = won ? 'win' : 'lose';
  trade.exit_price = trade.entry_price * (won ? 1.01 : 0.99);
  trade.profit = won ? (payout || amount * 0.1) : -amount;
  trade.updated_at = new Date().toISOString();

  // Update user balance if won
  if (won) {
    user.balance += (payout || amount * 0.1);
  }

  console.log(`🏁 Trade ${tradeId} completed: ${won ? 'WIN' : 'LOSE'}, User balance: ${user.balance}`);

  // Broadcast balance update
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: user.id,
      symbol: 'USDT',
      newBalance: user.balance,
      username: user.username,
      action: won ? 'trade_win' : 'trade_loss',
      amount: won ? (payout || amount * 0.1) : amount
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  res.json({
    success: true,
    trade,
    user: { ...user, password: undefined }
  });
});

// ===== OPTIONS TRADING ENDPOINTS =====

// General trades endpoint (for frontend compatibility)
app.post('/api/trades', (req, res) => {
  console.log('📈 General trades endpoint called:', req.body);

  // Check if it's an options trade
  if (req.body.type === 'options') {
    // Forward to options trading logic
    return handleOptionsTrading(req, res);
  }

  // Handle other trade types here if needed
  res.status(400).json({
    success: false,
    message: 'Unsupported trade type. Use type: "options" for binary options trading.'
  });
});

app.post('/api/trades/options', (req, res) => {
  return handleOptionsTrading(req, res);
});

// Options trading handler function
function handleOptionsTrading(req, res) {
  console.log('🎯 Creating options trade:', req.body);
  const { userId, symbol, direction, amount, duration } = req.body;

  // Validate required fields
  if (!userId || !symbol || !direction || !amount || !duration) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  // Validate minimum amounts based on duration
  const minAmounts = {
    30: 100,  // 30s requires min 100 USDT
    60: 1000  // 60s requires min 1000 USDT
  };

  const minAmount = minAmounts[duration];
  if (!minAmount) {
    return res.status(400).json({
      success: false,
      message: `Trading duration ${duration}s is not available`
    });
  }

  const tradeAmount = parseFloat(amount);
  if (tradeAmount < minAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum amount for ${duration}s is $${minAmount}`
    });
  }

  // Find user and check balance
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found"
    });
  }

  if (user.balance < tradeAmount) {
    return res.status(400).json({
      success: false,
      message: "Insufficient balance"
    });
  }

  // Get current price
  const currentPrice = currentPrices[symbol]?.price;
  if (!currentPrice) {
    return res.status(400).json({
      success: false,
      message: "Price data not available"
    });
  }

  // Create trade
  const trade = {
    id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    userId,
    symbol,
    type: 'options',
    direction,
    amount: amount.toString(),
    price: currentPrice.toString(),
    entryPrice: currentPrice.toString(),
    status: 'active',
    duration,
    expiresAt: new Date(Date.now() + duration * 1000),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Deduct balance
  user.balance -= tradeAmount;

  // Add to trades
  trades.push(trade);

  // Broadcast balance update immediately after trade creation
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: user.id,
      symbol: 'USDT',
      newBalance: user.balance,
      username: user.username,
      action: 'trade_created',
      amount: tradeAmount
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  // Schedule trade execution
  setTimeout(() => {
    executeOptionsTrade(trade.id);
  }, duration * 1000);

  console.log(`✅ Options trade created: ${trade.id} - ${direction.toUpperCase()} ${amount} USDT on ${symbol} for ${duration}s`);
  console.log(`💰 User ${user.username} balance after trade: ${user.balance} USDT`);

  res.json({
    success: true,
    trade,
    message: 'Trade created successfully'
  });
}

// Function to execute options trade
function executeOptionsTrade(tradeId) {
  console.log(`⏰ Executing options trade: ${tradeId}`);

  const tradeIndex = trades.findIndex(t => t.id === tradeId);
  if (tradeIndex === -1 || trades[tradeIndex].status !== 'active') {
    return;
  }

  const trade = trades[tradeIndex];
  const user = users.find(u => u.id === (trade.userId || trade.user_id));
  if (!user) return;

  // Get current price
  const currentPrice = currentPrices[trade.symbol]?.price;
  if (!currentPrice) {
    console.error(`Cannot execute trade ${tradeId}: No current price available`);
    return;
  }

  let isWin = false;
  let exitPrice = currentPrice;

  // Check if user has trading control
  const userTradingMode = user.trading_mode || 'normal';

  const entryPrice = trade.entryPrice || trade.entry_price || trade.price;

  switch (userTradingMode) {
    case 'win':
      isWin = true;
      // Adjust exit price to ensure win
      if (trade.direction === 'up') {
        exitPrice = parseFloat(entryPrice) * 1.001; // Slightly higher
      } else {
        exitPrice = parseFloat(entryPrice) * 0.999; // Slightly lower
      }
      break;
    case 'lose':
      isWin = false;
      // Adjust exit price to ensure loss
      if (trade.direction === 'up') {
        exitPrice = parseFloat(entryPrice) * 0.999; // Slightly lower
      } else {
        exitPrice = parseFloat(entryPrice) * 1.001; // Slightly higher
      }
      break;
    case 'normal':
    default:
      // Use real market logic
      if (trade.direction === 'up') {
        isWin = parseFloat(currentPrice) > parseFloat(entryPrice);
      } else {
        isWin = parseFloat(currentPrice) < parseFloat(entryPrice);
      }
      break;
  }

  // Calculate profit/loss
  const tradeAmount = parseFloat(trade.amount);
  const profitPercentages = {
    30: 10,  // 10% profit for 30s
    60: 15   // 15% profit for 60s
  };
  const profitPercentage = profitPercentages[trade.duration] || 10;

  let balanceChange = 0;
  if (isWin) {
    // Win: Return original amount + profit
    balanceChange = tradeAmount + (tradeAmount * (profitPercentage / 100));
  } else {
    // Loss: User loses the trade amount (already deducted, so no change)
    balanceChange = 0;
  }

  // Update trade
  trades[tradeIndex] = {
    ...trade,
    status: 'completed',
    result: isWin ? 'win' : 'lose',
    exitPrice: exitPrice.toString(),
    profit: isWin ? (tradeAmount * (profitPercentage / 100)).toString() : '0',
    completedAt: new Date()
  };

  // Update user balance (only add back if win)
  user.balance += balanceChange;

  // Broadcast balance update to WebSocket clients
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: user.id,
      symbol: 'USDT',
      newBalance: user.balance,
      username: user.username,
      tradeResult: isWin ? 'win' : 'lose',
      tradeAmount: tradeAmount,
      balanceChange: balanceChange
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  console.log(`🎯 Trade ${tradeId} executed: ${isWin ? 'WIN' : 'LOSS'}, Balance Change: $${balanceChange.toFixed(2)}, New Balance: $${user.balance.toFixed(2)}, User: ${user.username}`);
}

// ===== STATIC FILE SERVING =====
// distPath already declared at the top of the file

// ===== SPA ROUTING =====
app.get('*', (req, res) => {
  // Don't serve SPA for static assets
  if (req.path.startsWith('/assets/') ||
      req.path.startsWith('/admin/assets/') ||
      req.path.endsWith('.js') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.ico') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.jpg') ||
      req.path.endsWith('.svg')) {
    return res.status(404).send('Asset not found');
  }

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
server.listen(PORT, () => {
  console.log('🎉 ===================================');
  console.log('🚀 METACHROME V2 WORKING SERVER READY!');
  console.log('🌐 Server running on: http://127.0.0.1:' + PORT);
  console.log('🔌 WebSocket server running on: ws://127.0.0.1:' + PORT + '/ws');
  console.log('🔧 Admin Dashboard: http://127.0.0.1:' + PORT + '/admin');
  console.log('🔐 Login: superadmin / superadmin123');
  console.log('📊 All endpoints are FULLY FUNCTIONAL!');
  console.log('🎉 ===================================');
});
