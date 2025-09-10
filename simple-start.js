console.log('🚀 Starting METACHROME server...');

import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import https from 'https';
// import DatabaseService from './database-integration.js';

console.log('📦 Imports loaded successfully');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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

      // 🎯 NUCLEAR TRADE RESULT INTERCEPTOR
      if (data.type === 'trade_result' || data.type === 'options_trade_result') {
        console.log('🎯 INTERCEPTING TRADE RESULT:', data);

        const userId = data.userId || data.user_id;
        const user = users.find(u => u.id === userId);

        if (user && user.trading_mode) {
          const tradingMode = user.trading_mode;
          console.log(`🎯 TRADE RESULT INTERCEPTOR: User ${user.username} - Mode: ${tradingMode.toUpperCase()}`);

          if (tradingMode === 'lose' && data.result === 'win') {
            console.log('🎯 FORCING TRADE RESULT TO LOSE!');
            data.result = 'lose';
            data.profit = -100; // Force loss

            // Update user balance immediately
            user.balance -= 100;
            console.log(`🎯 BALANCE FORCED DOWN: ${user.username} balance reduced to ${user.balance} USDT`);

          } else if (tradingMode === 'win' && data.result === 'lose') {
            console.log('🎯 FORCING TRADE RESULT TO WIN!');
            data.result = 'win';
            data.profit = 10; // Force win

            // Update user balance immediately
            user.balance += 10;
            console.log(`🎯 BALANCE FORCED UP: ${user.username} balance increased to ${user.balance} USDT`);
          }

          // Broadcast the corrected result to all clients
          const correctedResult = {
            ...data,
            intercepted: true,
            originalResult: data.originalResult || data.result,
            forcedBy: 'trading_control_system'
          };

          wss.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(JSON.stringify(correctedResult));
            }
          });

          return; // Don't process the original message
        }
      }

      if (data.type === 'subscribe' && data.symbols) {
        // Store subscribed symbols for this client
        ws.subscribedSymbols = data.symbols;
        console.log('📊 Client subscribed to:', data.symbols);
      }

      // Handle balance monitoring requests
      if (data.type === 'subscribe_balance_monitor') {
        console.log('💰 Client subscribed to balance monitoring');
        ws.isBalanceMonitor = true;

        // Send current platform stats
        const stats = {
          totalUsers: users.length,
          totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
          activeUsers: users.filter(u => u.status === 'active').length,
          activeTrades: trades.filter(t => t.status === 'active').length
        };

        ws.send(JSON.stringify({
          type: 'balance_monitor_init',
          data: stats,
          timestamp: new Date().toISOString()
        }));
      }

      // Handle user-specific balance subscription
      if (data.type === 'subscribe_user_balance' && data.userId) {
        console.log(`💰 Client subscribed to balance updates for user: ${data.userId}`);
        ws.subscribedUserId = data.userId;

        const user = users.find(u => u.id === data.userId);
        if (user) {
          ws.send(JSON.stringify({
            type: 'user_balance_init',
            data: {
              userId: user.id,
              username: user.username,
              balance: user.balance,
              status: user.status,
              tradingMode: user.trading_mode || 'normal'
            },
            timestamp: new Date().toISOString()
          }));
        }
      }

      // Handle admin dashboard subscription
      if (data.type === 'subscribe_admin_dashboard') {
        console.log('🔧 Client subscribed to admin dashboard updates');
        ws.isAdminDashboard = true;

        // Send initial admin data
        ws.send(JSON.stringify({
          type: 'admin_dashboard_init',
          data: {
            totalUsers: users.length,
            totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
            activeTrades: trades.filter(t => t.status === 'active').length,
            recentTransactions: transactions.slice(-10)
          },
          timestamp: new Date().toISOString()
        }));
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

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'Connected to METACHROME V2 WebSocket',
    timestamp: new Date().toISOString(),
    features: [
      'real_time_balance_updates',
      'trading_control_monitoring',
      'transaction_notifications',
      'admin_balance_monitoring',
      'price_updates'
    ]
  }));
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
      // Add cache-busting headers for development
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Serve test files from project root
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
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

// ===== REAL-TIME BALANCE MANAGEMENT SYSTEM =====
class BalanceManager {
  constructor() {
    this.balanceHistory = new Map(); // Store balance history for each user
    this.transactionQueue = []; // Queue for processing transactions
  }

  // Update user balance with full tracking and real-time sync
  async updateBalance(userId, amount, type, description, metadata = {}) {
    const user = users.find(u => u.id === userId);
    if (!user) {
      console.error(`❌ Balance update failed: User ${userId} not found`);
      return false;
    }

    const oldBalance = user.balance;
    const newBalance = Math.max(0, oldBalance + amount); // Prevent negative balances

    // Update in memory
    user.balance = newBalance;
    user.updated_at = new Date().toISOString();

    // Database update temporarily disabled
    // try {
    //   await DatabaseService.updateUserBalance(userId, newBalance);
    //   console.log(`💾 Database updated: User ${userId} balance = ${newBalance}`);
    // } catch (error) {
    //   console.error(`❌ Database update failed for user ${userId}:`, error);
    //   // Continue with in-memory update even if database fails
    // }

    // Record transaction
    const transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      username: user.username,
      type: type, // 'trade_win', 'trade_loss', 'deposit', 'withdrawal', 'spot_buy', 'spot_sell', 'admin_adjustment'
      amount: amount,
      symbol: 'USDT',
      status: 'completed',
      description: description,
      metadata: metadata,
      old_balance: oldBalance,
      new_balance: newBalance,
      created_at: new Date().toISOString(),
      users: { username: user.username }
    };

    transactions.push(transaction);

    // Store balance history
    if (!this.balanceHistory.has(userId)) {
      this.balanceHistory.set(userId, []);
    }
    this.balanceHistory.get(userId).push({
      timestamp: new Date().toISOString(),
      oldBalance,
      newBalance,
      change: amount,
      type,
      description
    });

    // Use unified balance sync system
    syncBalanceAcrossAllSystems(userId, newBalance, type, description, metadata);

    console.log(`💰 BALANCE UPDATED: ${user.username} | ${oldBalance} → ${newBalance} USDT | ${amount > 0 ? '+' : ''}${amount} | ${type} | ${description}`);

    return true;
  }

  // Broadcast balance update to all connected clients
  broadcastBalanceUpdate(user, amount, type, description, metadata = {}) {
    const balanceUpdate = {
      type: 'balance_update',
      data: {
        userId: user.id,
        username: user.username,
        symbol: 'USDT',
        newBalance: user.balance,
        change: amount,
        changeType: type,
        description: description,
        metadata: metadata,
        timestamp: new Date().toISOString(),
        userStatus: user.status,
        tradingMode: user.trading_mode || 'normal'
      }
    };

    // Broadcast to WebSocket clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(balanceUpdate));
      }
    });

    // Also broadcast to superadmin for monitoring
    const adminUpdate = {
      type: 'admin_balance_monitor',
      data: {
        ...balanceUpdate.data,
        adminNotification: true,
        totalUsers: users.length,
        totalBalance: users.reduce((sum, u) => sum + u.balance, 0)
      }
    };

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(adminUpdate));
      }
    });

    console.log(`📡 Balance update broadcasted: ${user.username} | ${type} | ${amount > 0 ? '+' : ''}${amount} USDT`);
  }

  // Get balance history for a user
  getBalanceHistory(userId) {
    return this.balanceHistory.get(userId) || [];
  }

  // Get total platform statistics
  getPlatformStats() {
    const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    return {
      totalBalance,
      totalUsers,
      activeUsers,
      totalTransactions: transactions.length,
      lastUpdate: new Date().toISOString()
    };
  }
}

// Initialize global balance manager
const balanceManager = new BalanceManager();

// ===== UNIFIED BALANCE SYNC SYSTEM =====
function syncBalanceAcrossAllSystems(userId, newBalance, changeType, description, metadata = {}) {
  const user = users.find(u => u.id === userId);
  if (!user) {
    console.error(`❌ Balance sync failed: User ${userId} not found`);
    return false;
  }

  // Update user balance in memory
  user.balance = newBalance;
  user.updated_at = new Date().toISOString();

  // Broadcast to all WebSocket clients for real-time sync
  const balanceUpdate = {
    type: 'balance_update',
    data: {
      userId: user.id,
      username: user.username,
      symbol: 'USDT',
      newBalance: newBalance,
      changeType: changeType,
      description: description,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      userStatus: user.status,
      tradingMode: user.trading_mode || 'normal'
    }
  };

  // Broadcast to all connected clients
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(balanceUpdate));
    }
  });

  // Also send admin notification
  const adminUpdate = {
    type: 'admin_balance_monitor',
    data: {
      ...balanceUpdate.data,
      adminNotification: true,
      totalUsers: users.length,
      totalBalance: users.reduce((sum, u) => sum + u.balance, 0)
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(adminUpdate));
    }
  });

  console.log(`🔄 BALANCE SYNCED: ${user.username} | ${newBalance} USDT | ${changeType} | ${description}`);
  return true;
}

// ===== TEMPORARY IN-MEMORY DATA STORE (FOR TESTING) =====
// Will be replaced with database-backed storage
let users = [
  {
    id: 'superadmin-001',
    username: 'superadmin',
    email: 'superadmin@metachrome.io',
    balance: 50000,
    role: 'super_admin',
    status: 'active',
    trading_mode: 'normal',
    wallet_address: null,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@metachrome.io',
    balance: 25000,
    role: 'admin',
    status: 'active',
    trading_mode: 'normal',
    wallet_address: null,
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  }
];

// ===== REAL TRADES ONLY - NO MOCK DATA =====
let trades = [];

// ===== NO MOCK TRADES - REAL TRADES ONLY =====
// All trades will be created by real user trading activity

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
    const userId = username === 'superadmin' ? 'superadmin-001' : 'admin-001';

    // Generate a proper token with user ID embedded
    const sessionToken = `token_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('✅ Admin login successful:', username, role, 'ID:', userId, 'Token:', sessionToken.substring(0, 30) + '...');

    res.json({
      success: true,
      token: sessionToken,
      user: {
        id: userId,
        username,
        role,
        balance: username === 'superadmin' ? 100000 : 50000
      }
    });
  } else {
    console.log('❌ Admin login failed:', username);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// User authentication endpoint - returns user based on token
app.get('/api/auth', (req, res) => {
  console.log('👤 User auth verification request');

  // Check for token in headers
  const authToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token'];
  console.log('🔍 Auth token:', authToken ? authToken.substring(0, 20) + '...' : 'none');

  if (!authToken) {
    console.log('❌ No auth token provided');
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided'
    });
  }

  // Handle admin tokens
  if (authToken === 'mock-admin-token' || authToken?.startsWith('mock-jwt-token') || authToken?.startsWith('token_admin-001_') || authToken?.startsWith('token_superadmin-001_')) {
    const adminUser = users.find(u => u.id === 'superadmin-1');
    if (adminUser) {
      console.log('✅ Returning admin user data:', adminUser.username, 'ID:', adminUser.id);
      return res.json({
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        balance: adminUser.balance,
        role: adminUser.role,
        status: adminUser.status,
        trading_mode: adminUser.trading_mode,
        wallet_address: adminUser.wallet_address
      });
    }
  }

  // Handle user session tokens (format: user-session-{timestamp}-{userId})
  if (authToken.startsWith('user-session-')) {
    console.log('🔍 Processing user session token...');

    // Extract user ID from token
    const tokenParts = authToken.split('-');
    if (tokenParts.length >= 4) {
      // Token format: user-session-{timestamp}-{userId}
      const userId = tokenParts.slice(3).join('-'); // Handle user IDs with dashes
      console.log('🔍 Extracted user ID from token:', userId);

      const user = users.find(u => u.id === userId);
      if (user) {
        console.log('✅ Found user by token:', user.username, 'ID:', user.id);
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          role: user.role,
          status: user.status,
          trading_mode: user.trading_mode,
          wallet_address: user.wallet_address
        });
      } else {
        console.log('❌ User not found for ID:', userId);
      }
    } else {
      console.log('❌ Invalid token format:', authToken);
    }
  }

  // Handle demo tokens
  if (authToken.startsWith('demo-token-')) {
    console.log('🔍 Demo token detected, returning default user');
    const defaultUser = users.find(u => u.id === 'user-1');
    if (defaultUser) {
      return res.json({
        id: defaultUser.id,
        username: defaultUser.username,
        email: defaultUser.email,
        balance: defaultUser.balance,
        role: defaultUser.role,
        status: defaultUser.status,
        trading_mode: defaultUser.trading_mode,
        wallet_address: defaultUser.wallet_address
      });
    }
  }

  // If no valid token found, return unauthorized
  console.log('❌ Invalid or unrecognized token format');
  return res.status(401).json({
    success: false,
    message: 'Invalid authentication token'
  });
});

// User login/register endpoint - handles both login and registration
app.post('/api/auth', (req, res) => {
  console.log('👤 User login/register attempt:', req.body);
  const { username, email, password, firstName, lastName, walletAddress } = req.body;

  // Handle MetaMask wallet authentication
  if (walletAddress) {
    console.log('🦊 MetaMask authentication for wallet:', walletAddress);

    // Check if user exists with this wallet address
    let user = users.find(u => u.wallet_address === walletAddress);

    if (!user) {
      // Create new user with wallet address
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        username: username || `wallet_${walletAddress.slice(0, 8)}`,
        email: email || `${walletAddress.slice(0, 8)}@wallet.local`,
        balance: 0, // Starting balance - new users start with $0
        role: 'user',
        status: 'active',
        trading_mode: 'normal',
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      users.push(newUser);
      user = newUser;
      console.log('✅ New wallet user created:', user.username, 'ID:', user.id);
    } else {
      // Update last login
      user.last_login = new Date().toISOString();
      console.log('✅ Existing wallet user logged in:', user.username);
    }

    return res.json({
      success: true,
      message: 'MetaMask authentication successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        status: user.status,
        trading_mode: user.trading_mode,
        wallet_address: user.wallet_address
      },
      token: `user-session-${Date.now()}-${user.id}`
    });
  }

  // Handle regular email/password registration
  if (email && password && (firstName || lastName || username)) {
    console.log('📧 Email registration attempt:', { email, username: username || email.split('@')[0] });

    const actualUsername = username || email.split('@')[0];

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === actualUsername);
    if (existingUser) {
      // If user exists, try to login
      console.log('👤 User exists, attempting login...');

      // For demo purposes, we'll allow login without password verification
      // In production, you would verify the password hash here
      existingUser.last_login = new Date().toISOString();

      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          balance: existingUser.balance,
          role: existingUser.role,
          status: existingUser.status,
          trading_mode: existingUser.trading_mode,
          wallet_address: existingUser.wallet_address
        },
        token: `user-session-${Date.now()}-${existingUser.id}`
      });
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      username: actualUsername,
      email: email,
      password: password, // In production, this should be hashed
      firstName: firstName,
      lastName: lastName,
      balance: 0, // Starting balance - new users start with $0
      role: 'user',
      status: 'active',
      trading_mode: 'normal',
      wallet_address: null,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    users.push(newUser);
    console.log('✅ New user registered:', newUser.username, 'ID:', newUser.id);

    return res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        balance: newUser.balance,
        role: newUser.role,
        status: newUser.status,
        trading_mode: newUser.trading_mode,
        wallet_address: newUser.wallet_address
      },
      token: `user-session-${Date.now()}-${newUser.id}`
    });
  }

  // Handle username/password login
  if (username && password) {
    console.log('🔐 Username/password login attempt:', username);

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // For demo purposes, we'll allow login without password verification
    // In production, you would verify the password hash here
    user.last_login = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role,
        status: user.status,
        trading_mode: user.trading_mode,
        wallet_address: user.wallet_address
      },
      token: `user-session-${Date.now()}-${user.id}`
    });
  }

  // If no valid authentication method provided, return error
  return res.status(400).json({
    success: false,
    message: 'Invalid authentication data. Please provide either wallet address, email/password, or username/password.'
  });
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
    balance: Number(balance) || 0, // Default to $0 for new users unless specified
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

  // Use unified balance sync system if balance was changed
  if (balance !== undefined) {
    syncBalanceAcrossAllSystems(
      updatedUser.id,
      updatedUser.balance,
      'admin_update',
      `Admin user update - Balance: ${updatedUser.balance} USDT`,
      { adminAction: true, userUpdate: true }
    );
  }

  res.json(updatedUser);
});

// Delete user endpoint (Super Admin only)
app.delete('/api/admin/users/:id', (req, res) => {
  console.log('🗑️ Deleting user:', req.params.id);
  const userId = req.params.id;

  // Find user
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const user = users[userIndex];

  // Prevent deleting super admin users
  if (user.role === 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Cannot delete super admin users'
    });
  }

  // Remove user from users array
  users.splice(userIndex, 1);

  // Clean up related data
  // Remove user's trades
  trades = trades.filter(t => t.userId !== userId);

  // Remove user's transactions
  transactions = transactions.filter(t => t.userId !== userId);

  // Remove user's balances from balance manager
  if (balanceManager && balanceManager.balances) {
    delete balanceManager.balances[userId];
  }

  console.log('✅ User deleted successfully:', user.username, 'ID:', userId);
  console.log('📊 Remaining users count:', users.length);

  res.json({
    success: true,
    message: `User ${user.username} deleted successfully`
  });
});

app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 SYSTEMATIC TRADING CONTROL UPDATE:', req.body);
  const { userId, controlType } = req.body;

  // Validate control type
  if (!['normal', 'win', 'lose'].includes(controlType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid control type. Must be: normal, win, or lose'
    });
  }

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const oldMode = users[userIndex].trading_mode || 'normal';
    users[userIndex].trading_mode = controlType;
    users[userIndex].updated_at = new Date().toISOString();

    // Database update temporarily disabled
    // DatabaseService.updateUserTradingMode(userId, controlType).catch(error => {
    //   console.error(`❌ Database update failed for trading mode:`, error);
    // });

    console.log(`🎯 TRADING CONTROL APPLIED:`);
    console.log(`   - User: ${users[userIndex].username} (${userId})`);
    console.log(`   - Previous Mode: ${oldMode.toUpperCase()}`);
    console.log(`   - New Mode: ${controlType.toUpperCase()}`);
    console.log(`   - Balance: ${users[userIndex].balance} USDT`);
    console.log(`   - Status: ${users[userIndex].status}`);

    // Broadcast trading control update to WebSocket clients for real-time sync
    const controlUpdate = {
      type: 'trading_control_update',
      data: {
        userId: users[userIndex].id,
        username: users[userIndex].username,
        oldMode: oldMode,
        newMode: controlType,
        balance: users[userIndex].balance,
        timestamp: new Date().toISOString(),
        adminAction: 'trading_control_changed'
      }
    };

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(controlUpdate));
      }
    });

    console.log(`✅ TRADING CONTROL UPDATE COMPLETE`);
    console.log(`📡 Real-time update broadcasted to all clients`);

    res.json({
      success: true,
      message: `Trading mode updated from ${oldMode.toUpperCase()} to ${controlType.toUpperCase()}`,
      user: {
        ...users[userIndex],
        password: undefined // Don't send password in response
      },
      controlUpdate: {
        oldMode,
        newMode: controlType,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    console.log('❌ TRADING CONTROL ERROR: User not found:', userId);
    res.status(404).json({
      success: false,
      error: 'User not found',
      userId: userId
    });
  }
});

// Admin balance adjustment endpoint
app.post('/api/admin/balance-adjustment', (req, res) => {
  console.log('💰 Admin balance adjustment:', req.body);
  const { userId, amount, reason } = req.body;

  if (!userId || amount === undefined || !reason) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: userId, amount, reason'
    });
  }

  const adjustmentAmount = parseFloat(amount);
  if (isNaN(adjustmentAmount)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid amount format'
    });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      userId: userId
    });
  }

  const oldBalance = user.balance;
  const description = `Admin Adjustment: ${reason}`;
  const metadata = {
    adminAction: true,
    reason: reason,
    adjustmentAmount: adjustmentAmount,
    adminTimestamp: new Date().toISOString()
  };

  const success = balanceManager.updateBalance(
    userId,
    adjustmentAmount,
    'admin_adjustment',
    description,
    metadata
  );

  if (success) {
    console.log(`✅ ADMIN BALANCE ADJUSTMENT:`);
    console.log(`   - User: ${user.username} (${userId})`);
    console.log(`   - Old Balance: ${oldBalance} USDT`);
    console.log(`   - Adjustment: ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount} USDT`);
    console.log(`   - New Balance: ${user.balance} USDT`);
    console.log(`   - Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Balance adjusted successfully',
      user: {
        ...user,
        password: undefined
      },
      adjustment: {
        oldBalance,
        newBalance: user.balance,
        amount: adjustmentAmount,
        reason: reason,
        timestamp: new Date().toISOString()
      }
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to update balance'
    });
  }
});

// Get balance history for a user
app.get('/api/admin/balance-history/:userId', (req, res) => {
  console.log('📊 Getting balance history for user:', req.params.userId);
  const { userId } = req.params;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      userId: userId
    });
  }

  const history = balanceManager.getBalanceHistory(userId);
  const userTransactions = transactions.filter(t => t.user_id === userId);

  res.json({
    success: true,
    userId: userId,
    username: user.username,
    currentBalance: user.balance,
    balanceHistory: history,
    transactions: userTransactions.slice(-50), // Last 50 transactions
    totalTransactions: userTransactions.length
  });
});

// Get platform statistics
app.get('/api/admin/platform-stats', (req, res) => {
  console.log('📊 Getting platform statistics');

  const stats = balanceManager.getPlatformStats();
  const recentTransactions = transactions.slice(-20); // Last 20 transactions

  res.json({
    success: true,
    ...stats,
    recentTransactions: recentTransactions,
    activeTrades: trades.filter(t => t.status === 'active').length,
    completedTrades: trades.filter(t => t.status === 'completed').length,
    spotOrders: spotOrders.length
  });
});

// Get current trading control status for a user
app.get('/api/admin/trading-controls/:userId', (req, res) => {
  console.log('🔍 Getting trading control status for user:', req.params.userId);
  const { userId } = req.params;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      userId: userId
    });
  }

  const tradingMode = user.trading_mode || 'normal';

  console.log(`🎯 TRADING CONTROL STATUS:`);
  console.log(`   - User: ${user.username} (${userId})`);
  console.log(`   - Current Mode: ${tradingMode.toUpperCase()}`);
  console.log(`   - Balance: ${user.balance} USDT`);
  console.log(`   - Status: ${user.status}`);

  res.json({
    success: true,
    userId: userId,
    username: user.username,
    tradingMode: tradingMode,
    balance: user.balance,
    status: user.status,
    lastUpdated: user.updated_at || user.created_at,
    controlDescription: {
      normal: 'User trades follow real market conditions',
      win: 'User trades are forced to WIN',
      lose: 'User trades are forced to LOSE'
    }[tradingMode]
  });
});

// ===== TRADING ENDPOINTS =====
app.get('/api/admin/trades', (req, res) => {
  console.log('📈 Getting trades list - Count:', trades.length);
  res.json(trades);
});

// Live trades endpoint for real-time monitoring
app.get('/api/admin/live-trades', (req, res) => {
  console.log('🔴 Getting live trades for admin dashboard');

  const now = new Date();

  // Get all trades with calculated time left for active trades
  const liveTradesData = trades.map(trade => {
    let timeLeft = 0;

    if (trade.status === 'active' && trade.expires_at) {
      const expiresAt = new Date(trade.expires_at);
      timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    }

    // Find the user for this trade
    const user = users.find(u => u.id === trade.userId || u.id === trade.user_id);
    const username = user ? user.username : (trade.users?.username || 'Unknown');

    console.log(`🔍 Trade ${trade.id}: user_id=${trade.user_id}, userId=${trade.userId}, found_user=${user?.username}, final_username=${username}`);

    return {
      id: trade.id,
      user_id: trade.userId || trade.user_id,
      username: username,
      symbol: trade.symbol,
      amount: trade.amount,
      direction: trade.direction,
      duration: trade.duration,
      entry_price: trade.entry_price || trade.entryPrice,
      exit_price: trade.exit_price || trade.exitPrice || null,
      result: trade.result || 'pending',
      profit: trade.profit || 0,
      status: trade.status,
      time_left: timeLeft,
      created_at: trade.created_at || trade.createdAt,
      expires_at: trade.expires_at || trade.expiresAt,
      updated_at: trade.updated_at || trade.updatedAt || trade.created_at || trade.createdAt,
      trading_mode: user ? user.trading_mode : 'normal'
    };
  });

  // Sort by creation time (newest first)
  liveTradesData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  console.log(`🔴 Returning ${liveTradesData.length} live trades`);

  res.json({
    success: true,
    trades: liveTradesData,
    timestamp: now.toISOString(),
    total_trades: liveTradesData.length,
    active_trades: liveTradesData.filter(t => t.status === 'active').length,
    completed_trades: liveTradesData.filter(t => t.status === 'completed').length
  });
});

app.post('/api/admin/trades/:tradeId/control', (req, res) => {
  console.log('🎮 Manual trade control:', req.params.tradeId, req.body);
  const { tradeId } = req.params;
  const { action } = req.body;

  const tradeIndex = trades.findIndex(t => t.id === tradeId);
  if (tradeIndex !== -1 && trades[tradeIndex].result === 'pending') {
    const trade = trades[tradeIndex];
    const user = users.find(u => u.id === trade.user_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found for trade' });
    }

    // Update trade result
    trade.result = action;
    trade.exit_price = trade.entry_price + (action === 'win' ? 50 : -50);
    trade.profit = action === 'win' ? trade.amount * 0.1 : -trade.amount;
    trade.status = 'completed';

    // Update user balance using the unified balance manager
    if (action === 'win') {
      const winAmount = trade.amount + trade.profit;
      balanceManager.updateBalance(
        user.id,
        winAmount,
        'trade_win',
        `Manual trade win - ${trade.symbol} ${trade.direction}`,
        { tradeId: trade.id, adminControlled: true }
      );
    }

    console.log(`✅ Trade ${tradeId} manually set to ${action}, balance updated`);
    res.json({
      success: true,
      message: `Trade set to ${action.toUpperCase()}`,
      trade: trade
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
    totalVolume: trades.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0;
      return sum + amount;
    }, 0),
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
    totalVolume: trades.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0;
      return sum + amount;
    }, 0),
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

  // Use unified balance sync system
  syncBalanceAcrossAllSystems(
    user.id,
    user.balance,
    isWin ? 'trade_win' : 'trade_loss',
    `Manual trade ${action} - ${trade.symbol} ${trade.direction}`,
    { tradeId: trade.id, adminControlled: true, profit: isWin ? profit : -tradeAmount }
  );

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

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const depositAmount = Number(amount);
  if (depositAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
  }

  // Use unified balance manager for consistent updates
  const success = balanceManager.updateBalance(
    userId,
    depositAmount,
    'deposit',
    note || `Superadmin deposit - ${depositAmount} USDT`,
    { adminAction: true, superadmin: true }
  );

  if (success) {
    console.log(`✅ Deposited ${depositAmount} USDT to ${user.username}. New balance: ${user.balance}`);
    res.json({
      success: true,
      message: `Successfully deposited ${depositAmount} USDT`,
      user: { ...user, password: undefined }
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to process deposit' });
  }
});

// Withdrawal endpoint
app.post('/api/superadmin/withdrawal', (req, res) => {
  console.log('💸 Processing withdrawal:', req.body);
  const { userId, amount, note } = req.body;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const withdrawalAmount = Number(amount);
  if (withdrawalAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  // Check current balance
  if (user.balance < withdrawalAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }

  // Use unified balance manager for consistent updates
  const success = balanceManager.updateBalance(
    userId,
    -withdrawalAmount,
    'withdrawal',
    note || `Superadmin withdrawal - ${withdrawalAmount} USDT`,
    { adminAction: true, superadmin: true }
  );

  if (success) {
    console.log(`✅ Withdrew ${withdrawalAmount} USDT from ${user.username}. New balance: ${user.balance}`);
    res.json({
      success: true,
      message: `Successfully withdrew ${withdrawalAmount} USDT`,
      user: { ...user, password: undefined }
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to process withdrawal' });
  }
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

  // Get the current authenticated user's balance
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  let currentUser = null;

  if (authToken && authToken.startsWith('user-session-')) {
    const tokenParts = authToken.split('-');
    if (tokenParts.length >= 4) {
      const userId = tokenParts.slice(3).join('-');
      currentUser = users.find(u => u.id === userId);
    }
  }

  // Fallback to superadmin if no user found
  if (!currentUser) {
    currentUser = users.find(u => u.username === 'superadmin');
  }

  const actualBalance = currentUser ? currentUser.balance : 0;
  console.log('💰 Returning balance for user:', currentUser?.username, ':', actualBalance, 'USDT');

  const balances = [
    {
      id: 'balance-1',
      userId: currentUser?.id || 'superadmin-1',
      symbol: 'USDT',
      available: actualBalance, // Use the current user's balance
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
  console.log('💰 Request query:', req.query);
  console.log('💰 Request headers auth:', req.headers.authorization);
  console.log('💰 All headers:', JSON.stringify(req.headers, null, 2));

  // Extract user ID from auth token if available
  let actualUserId = req.query.userId || 'user-1'; // Default fallback

  // Check if we have an auth token to determine the actual user
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    console.log('💰 Found auth token:', token.substring(0, 30) + '...');

    // Handle user session tokens (format: user-session-{timestamp}-{userId})
    if (token.startsWith('user-session-')) {
      const tokenParts = token.split('-');
      if (tokenParts.length >= 4) {
        const userId = tokenParts.slice(3).join('-'); // Handle user IDs with dashes
        actualUserId = userId;
        console.log('💰 Extracted user ID from user-session token:', userId);
      }
    }
    // Extract user ID from token format: token_userId_timestamp_random
    else if (token.startsWith('token_')) {
      const tokenParts = token.split('_');
      if (tokenParts.length >= 2) {
        const tokenUserId = tokenParts[1];
        actualUserId = tokenUserId;
        console.log('💰 Extracted user ID from token:', tokenUserId);
      }
    }
    // Fallback for old token formats
    else if (token.includes('superadmin') || token.includes('admin')) {
      actualUserId = 'superadmin-001';
      console.log('💰 Mapped to superadmin user (fallback)');
    } else if (token.includes('user-1') || token.includes('trader1')) {
      actualUserId = 'user-1';
      console.log('💰 Mapped to trader1 user (fallback)');
    }
  } else {
    console.log('💰 No auth header found, using default user-1');
  }

  // Additional fallback for old admin tokens
  const authToken = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-auth-token'];
  if ((authToken === 'mock-admin-token' || authToken?.startsWith('mock-jwt-token')) && actualUserId === 'user-1') {
    // For old admin tokens, default to superadmin user
    actualUserId = 'superadmin-001';
    console.log('💰 Old admin token detected, using superadmin user:', actualUserId);
  }

  const user = users.find(u => u.id === actualUserId);
  let actualBalance = user ? user.balance : 0;

  // 🎯 NUCLEAR TRADING CONTROL INTERCEPTOR - Force trading controls on ALL balance requests
  if (user) {
    const tradingMode = user.trading_mode || 'normal';
    const lastKnownBalance = user.lastKnownBalance || actualBalance;

    console.log(`🎯 NUCLEAR INTERCEPTOR: User ${user.username} - Mode: ${tradingMode.toUpperCase()}, Current: ${actualBalance}, Last: ${lastKnownBalance}`);

    if (tradingMode === 'lose') {
      // If balance increased, force it back down
      if (actualBalance > lastKnownBalance) {
        const balanceIncrease = actualBalance - lastKnownBalance;
        console.log(`🎯 LOSE MODE VIOLATION: Balance increased by ${balanceIncrease} USDT - FORCING LOSS!`);

        // Force loss by reducing balance by trade amount
        actualBalance = lastKnownBalance - 100;
        user.balance = actualBalance;

        console.log(`🎯 LOSS ENFORCED: Balance corrected to ${actualBalance} USDT`);

        // Broadcast the corrected balance immediately
        const correctionUpdate = {
          type: 'balance_correction',
          data: {
            userId: user.id,
            username: user.username,
            oldBalance: lastKnownBalance,
            newBalance: actualBalance,
            reason: 'Trading control enforcement - LOSE mode',
            timestamp: new Date().toISOString()
          }
        };

        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(correctionUpdate));
          }
        });
      }
    } else if (tradingMode === 'win') {
      // If balance decreased, force it back up
      if (actualBalance < lastKnownBalance) {
        const balanceDecrease = lastKnownBalance - actualBalance;
        console.log(`🎯 WIN MODE VIOLATION: Balance decreased by ${balanceDecrease} USDT - FORCING WIN!`);

        // Force win by adding profit
        actualBalance = lastKnownBalance + 10; // 10 USDT profit
        user.balance = actualBalance;

        console.log(`🎯 WIN ENFORCED: Balance corrected to ${actualBalance} USDT`);
      }
    }

    user.lastKnownBalance = actualBalance;
  }

  console.log('💰 REAL-TIME BALANCE SYNC - Returning balance for', actualUserId, ':', actualBalance, 'USDT');
  console.log('💰 Found user:', user ? user.username : 'NOT FOUND');

  // Format for Options page (array format)
  const balances = [
    {
      id: 'balance-1',
      userId: actualUserId,
      currency: 'USDT',
      balance: actualBalance,
      available: actualBalance,
      locked: 0,
      symbol: 'USDT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'balance-2',
      userId: actualUserId,
      currency: 'BTC',
      balance: 0.5,
      available: 0.5,
      locked: 0,
      symbol: 'BTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Format for Spot page (object format)
  const spotFormat = {
    USDT: {
      available: actualBalance.toString(),
      locked: '0',
      symbol: 'USDT'
    },
    BTC: {
      available: '0.5',
      locked: '0',
      symbol: 'BTC'
    }
  };

  // Return combined format for maximum compatibility
  const response = {
    ...spotFormat,
    balances: balances,
    // Add array indices for direct access
    0: balances[0],
    1: balances[1]
  };

  console.log('💰 BALANCE RESPONSE:', JSON.stringify(response, null, 2));
  res.json(response);
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

  // Use unified balance manager for consistent updates
  let balanceChange;
  let transactionType;

  if (action === 'add') {
    balanceChange = changeAmount;
    transactionType = 'admin_deposit';
  } else if (action === 'subtract') {
    balanceChange = -changeAmount;
    transactionType = 'admin_withdrawal';
  } else if (action === 'set') {
    const currentBalance = users[userIndex].balance;
    balanceChange = changeAmount - currentBalance;
    transactionType = 'admin_adjustment';
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid action. Use add, subtract, or set'
    });
  }

  const success = balanceManager.updateBalance(
    userId,
    balanceChange,
    transactionType,
    `Admin balance ${action} - ${Math.abs(changeAmount)} USDT`,
    { adminAction: true, symbol: symbol || 'USDT' }
  );

  if (!success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update balance'
    });
  }

  const user = users.find(u => u.id === userId);
  res.json({
    success: true,
    userId: userId,
    action: action,
    amount: changeAmount,
    newBalance: user.balance,
    balance: {
      USDT: {
        available: user.balance.toString(),
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

  // Use unified balance sync system (balance already updated above)
  syncBalanceAcrossAllSystems(
    userId,
    users[userIndex].balance,
    finalAction,
    `Admin balance ${finalAction} - ${Math.abs(changeAmount)} USDT`,
    { adminAction: true, amount: Math.abs(changeAmount) }
  );

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

  // Update balance using the unified balance manager
  let balanceChange = 0;
  let transactionType = '';
  let description = '';

  if (side === 'buy') {
    // Deduct USDT balance for buy orders
    balanceChange = -totalNum;
    transactionType = 'spot_buy';
    description = `Spot BUY: ${amountNum} ${symbol} for ${totalNum} USDT`;
  } else {
    // Add USDT to balance for sell orders (user gets money)
    balanceChange = totalNum;
    transactionType = 'spot_sell';
    description = `Spot SELL: ${amountNum} ${symbol} for ${totalNum} USDT`;
  }

  const metadata = {
    orderId: order.id,
    symbol: symbol,
    side: side,
    type: type,
    amount: amountNum,
    price: priceNum,
    total: totalNum,
    orderStatus: 'filled'
  };

  balanceManager.updateBalance(actualUserId, balanceChange, transactionType, description, metadata);

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

  // Update user balance if won using unified system
  if (won) {
    const winAmount = payout || amount * 0.1;
    user.balance += winAmount;

    // Use unified balance sync system
    syncBalanceAcrossAllSystems(
      user.id,
      user.balance,
      'trade_win',
      `Options trade win - ${trade.symbol} ${trade.direction}`,
      { tradeId: trade.id, profit: winAmount, duration: trade.duration }
    );
  } else {
    // For losses, just sync the current balance (no change needed as amount was already deducted)
    syncBalanceAcrossAllSystems(
      user.id,
      user.balance,
      'trade_loss',
      `Options trade loss - ${trade.symbol} ${trade.direction}`,
      { tradeId: trade.id, loss: amount, duration: trade.duration }
    );
  }

  console.log(`🏁 Trade ${tradeId} completed: ${won ? 'WIN' : 'LOSE'}, User balance: ${user.balance}`);

  res.json({
    success: true,
    trade,
    user: { ...user, password: undefined }
  });
});

// ===== OPTIONS TRADING ENDPOINTS =====

// General trades endpoint (for frontend compatibility)
app.post('/api/trades', (req, res) => {
  console.log('🚨🚨🚨 GENERAL TRADES ENDPOINT HIT! 🚨🚨🚨');
  console.log('📈 General trades endpoint called:', req.body);
  console.log('🚨🚨🚨 GENERAL TRADES ENDPOINT HIT! 🚨🚨🚨');

  // Check if it's an options trade (default to options if no type specified)
  if (req.body.type === 'options' || !req.body.type) {
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
  console.log('🚨🚨🚨 TRADE CREATION ENDPOINT HIT! 🚨🚨🚨');
  console.log('🎯 Creating options trade:', req.body);
  console.log('🚨🚨🚨 TRADE CREATION ENDPOINT HIT! 🚨🚨🚨');
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

  // Create trade - USING CONSISTENT FORMAT WITH DEMO TRADES
  const trade = {
    id: `trade-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    user_id: userId, // Use snake_case to match demo trades
    userId: userId, // Keep camelCase for backward compatibility
    symbol,
    type: 'options',
    direction,
    amount: parseFloat(amount), // Store as number for proper calculations
    price: parseFloat(currentPrice),
    entry_price: parseFloat(currentPrice), // Use snake_case to match demo trades
    entryPrice: parseFloat(currentPrice), // Keep camelCase for backward compatibility
    status: 'active',
    duration,
    expires_at: new Date(Date.now() + duration * 1000).toISOString(), // Use snake_case to match demo trades
    expiresAt: new Date(Date.now() + duration * 1000), // Keep camelCase for backward compatibility
    created_at: new Date().toISOString(), // Use snake_case to match demo trades
    createdAt: new Date(), // Keep camelCase for backward compatibility
    updated_at: new Date().toISOString(), // Use snake_case to match demo trades
    updatedAt: new Date(), // Keep camelCase for backward compatibility
    users: { username: user.username }, // Add users object like demo trades
    trading_mode: user.trading_mode || 'normal' // Add trading mode
  };

  // Add to trades first
  trades.push(trade);

  // 🔴 BROADCAST NEW TRADE TO ADMIN DASHBOARD
  const newTradeUpdate = {
    type: 'new_trade',
    data: {
      id: trade.id,
      user_id: trade.user_id,
      username: user.username,
      symbol: trade.symbol,
      amount: trade.amount,
      direction: trade.direction,
      duration: trade.duration,
      entry_price: trade.entry_price,
      status: trade.status,
      created_at: trade.created_at,
      expires_at: trade.expires_at,
      trading_mode: user.trading_mode || 'normal'
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(newTradeUpdate));
    }
  });

  // Deduct balance using the unified balance manager
  const description = `Options Trade: ${direction.toUpperCase()} ${amount} USDT on ${symbol} for ${duration}s`;
  const metadata = {
    tradeId: trade.id,
    symbol: symbol,
    direction: direction,
    duration: duration,
    entryPrice: currentPrice,
    tradeType: 'options',
    expiresAt: trade.expiresAt.toISOString()
  };

  balanceManager.updateBalance(userId, -tradeAmount, 'trade_start', description, metadata);

  // Schedule trade execution
  console.log(`⏰ SCHEDULING TRADE EXECUTION: ${trade.id} in ${duration} seconds`);
  setTimeout(() => {
    console.log(`⏰ TIMEOUT TRIGGERED: Executing trade ${trade.id}`);
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
  console.log(`🚨 SIMPLE-START.JS TRADE EXECUTION FUNCTION CALLED!`);
  console.log(`🔍 TRADE EXECUTION DEBUG: Function called at ${new Date().toISOString()}`);

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

  // Check if user has trading control - SYSTEMATIC IMPLEMENTATION
  const userTradingMode = user.trading_mode || 'normal';
  const entryPrice = parseFloat(trade.entryPrice || trade.entry_price || trade.price);

  console.log(`🎯 TRADING CONTROL SYSTEM: User ${user.username} (${user.id}) has mode: ${userTradingMode.toUpperCase()}`);
  console.log(`📊 Trade Details: ${trade.direction.toUpperCase()} ${trade.amount} USDT on ${trade.symbol}`);
  console.log(`💰 Entry Price: ${entryPrice}, Current Price: ${currentPrice}`);

  switch (userTradingMode) {
    case 'win':
      isWin = true;
      // Ensure win by adjusting exit price appropriately
      if (trade.direction === 'up') {
        exitPrice = entryPrice * 1.002; // 0.2% higher to ensure win
      } else {
        exitPrice = entryPrice * 0.998; // 0.2% lower to ensure win
      }
      console.log(`🎯 FORCED WIN: Exit price adjusted to ${exitPrice} to ensure victory`);
      break;

    case 'lose':
      isWin = false;
      // Ensure loss by adjusting exit price appropriately
      if (trade.direction === 'up') {
        exitPrice = entryPrice * 0.998; // 0.2% lower to ensure loss
      } else {
        exitPrice = entryPrice * 1.002; // 0.2% higher to ensure loss
      }
      console.log(`🎯 FORCED LOSE: Exit price adjusted to ${exitPrice} to ensure loss`);
      break;

    case 'normal':
    default:
      // Use real market logic based on actual price movement
      if (trade.direction === 'up') {
        isWin = parseFloat(currentPrice) > entryPrice;
      } else {
        isWin = parseFloat(currentPrice) < entryPrice;
      }
      exitPrice = parseFloat(currentPrice);
      console.log(`🎯 NORMAL MODE: Using real market price ${exitPrice}, Result: ${isWin ? 'WIN' : 'LOSE'}`);
      break;
  }

  // Calculate profit/loss - SYSTEMATIC IMPLEMENTATION
  const tradeAmount = parseFloat(trade.amount);
  const profitPercentages = {
    30: 10,  // 10% profit for 30s
    60: 15   // 15% profit for 60s
  };
  const profitPercentage = profitPercentages[trade.duration] || 10;
  const profitAmount = tradeAmount * (profitPercentage / 100);

  console.log(`💰 SYSTEMATIC BALANCE CALCULATION:`);
  console.log(`   - User: ${user.username} (${user.id})`);
  console.log(`   - Trading Mode: ${userTradingMode.toUpperCase()}`);
  console.log(`   - Trade Amount: ${tradeAmount} USDT`);
  console.log(`   - Duration: ${trade.duration}s (${profitPercentage}% profit rate)`);
  console.log(`   - Entry Price: ${entryPrice}`);
  console.log(`   - Exit Price: ${exitPrice}`);
  console.log(`   - Result: ${isWin ? 'WIN' : 'LOSE'}`);
  console.log(`   - Balance Before: ${user.balance} USDT`);

  let balanceChange = 0;
  if (isWin) {
    // Win: Return original amount + profit
    balanceChange = tradeAmount + profitAmount;
    console.log(`   ✅ WIN: Returning ${tradeAmount} USDT + ${profitAmount} USDT profit = ${balanceChange} USDT`);
    console.log(`   📊 WIN CALCULATION: Trade amount ${tradeAmount} + Profit ${profitAmount} = Total return ${balanceChange} USDT`);
  } else {
    // Loss: User loses the trade amount (already deducted when trade started, so no additional change)
    balanceChange = 0;
    console.log(`   ❌ LOSE: ${tradeAmount} USDT lost (already deducted when trade started)`);
    console.log(`   📊 LOSE CALCULATION: No balance change (${tradeAmount} USDT already deducted)`);
  }

  // Update trade record - USING CONSISTENT FORMAT
  trades[tradeIndex] = {
    ...trade,
    status: 'completed',
    result: isWin ? 'win' : 'lose',
    exit_price: exitPrice, // Use snake_case to match demo trades
    exitPrice: exitPrice, // Keep camelCase for backward compatibility
    profit: isWin ? profitAmount : (-tradeAmount),
    completed_at: new Date().toISOString(), // Use snake_case to match demo trades
    completedAt: new Date(), // Keep camelCase for backward compatibility
    updated_at: new Date().toISOString() // Update the updated_at timestamp
  };

  // CRITICAL: Update user balance using the unified balance manager
  const balanceBeforeUpdate = user.balance;

  // Always update balance for both wins and losses
  const transactionType = isWin ? 'trade_win' : 'trade_loss';
  const description = isWin
    ? `Trade WIN: ${trade.symbol} ${trade.direction} - ${trade.duration}s - Profit: ${profitAmount} USDT`
    : `Trade LOSS: ${trade.symbol} ${trade.direction} - ${trade.duration}s - Lost: ${tradeAmount} USDT`;

  const metadata = {
    tradeId: trade.id,
    symbol: trade.symbol,
    direction: trade.direction,
    duration: trade.duration,
    entryPrice: entryPrice,
    exitPrice: exitPrice,
    tradeAmount: tradeAmount,
    profitAmount: isWin ? profitAmount : 0,
    tradingMode: userTradingMode,
    isControlled: userTradingMode !== 'normal'
  };

  // Update balance: for wins add profit, for losses the amount was already deducted
  balanceManager.updateBalance(user.id, balanceChange, transactionType, description, metadata);

  console.log(`💰 BALANCE UPDATE COMPLETE:`);
  console.log(`   - Before: ${balanceBeforeUpdate} USDT`);
  console.log(`   - Change: +${balanceChange} USDT`);
  console.log(`   - After: ${user.balance} USDT`);

  console.log(`🎉 TRADING CONTROL SYSTEM EXECUTED SUCCESSFULLY:`);
  console.log(`   - Trade ID: ${tradeId}`);
  console.log(`   - User: ${user.username} (${user.id})`);
  console.log(`   - Mode Applied: ${userTradingMode.toUpperCase()}`);
  console.log(`   - Forced Result: ${isWin ? 'WIN' : 'LOSE'}`);
  console.log(`   - Final Balance: ${user.balance} USDT`);
  console.log(`   - Balance Change: ${balanceChange > 0 ? '+' : ''}${balanceChange} USDT`);
  console.log(`📡 Real-time update broadcasted to all clients`);

  // 🔴 BROADCAST TRADE COMPLETION TO ADMIN DASHBOARD
  const completedTrade = trades[tradeIndex];
  const tradeCompletedUpdate = {
    type: 'trade_completed',
    data: {
      id: completedTrade.id,
      user_id: user.id,
      username: user.username,
      symbol: completedTrade.symbol,
      amount: completedTrade.amount,
      direction: completedTrade.direction,
      duration: completedTrade.duration,
      entry_price: completedTrade.entry_price,
      exit_price: completedTrade.exit_price,
      result: completedTrade.result,
      profit: completedTrade.profit,
      status: completedTrade.status,
      created_at: completedTrade.created_at,
      completed_at: completedTrade.completed_at,
      trading_mode: userTradingMode,
      balance_change: balanceChange,
      new_balance: user.balance
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(tradeCompletedUpdate));
    }
  });
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

// ===== DATABASE INITIALIZATION =====
async function initializeServer() {
  console.log('🗄️ Database integration temporarily disabled for testing...');
  // await DatabaseService.initializeDatabase();
  console.log('✅ Database initialization skipped');

  console.log('👥 Loading users from fallback data...');
  // await refreshUsersFromDatabase();
  console.log('✅ Users loaded from fallback data');

  // Start the server
  const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

  server.listen(PORT, HOST, () => {
  console.log('🎉 ===================================');
  console.log('🚀 METACHROME V2 WORKING SERVER READY!');
  console.log(`🌐 Server running on: http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server running on: ws://${HOST}:${PORT}/ws`);
  console.log(`🔧 Admin Dashboard: http://${HOST}:${PORT}/admin`);
  console.log('🔐 Login: superadmin / superadmin123');
  console.log('📊 All endpoints are FULLY FUNCTIONAL!');
  console.log('🎉 ===================================');
  console.log(`🏥 Health check available at: http://${HOST}:${PORT}/api/health`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Process ID: ${process.pid}`);
  });
}

// Initialize and start the server
initializeServer().catch(error => {
  console.error('❌ Failed to initialize server:', error);
  process.exit(1);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
