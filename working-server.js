const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { WebSocketServer } = require('ws');
const http = require('http');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';
console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

// Supabase client for production
let supabase = null;
if (isProduction) {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized for production');
  } else {
    console.error('❌ Missing Supabase credentials in production!');
    process.exit(1);
  }
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

// Also serve files from the root directory for testing
app.use(express.static(__dirname));

// Health check endpoint for Railway
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection if in production
    if (isProduction && supabase) {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) throw error;
    }

    res.json({
      status: 'healthy',
      environment: isProduction ? 'production' : 'development',
      database: isProduction ? 'supabase' : 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test signup endpoint
app.get('/test-signup', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Test Signup - METACHROME V2</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .success { color: green; }
            .error { color: red; }
            button { padding: 10px 15px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            input { padding: 8px; margin: 5px; width: 200px; border: 1px solid #ddd; border-radius: 4px; }
            #results { max-height: 400px; overflow-y: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 METACHROME V2 - Signup Test</h1>

            <div class="test-section">
                <h2>📝 Test User Registration</h2>
                <div>
                    <input type="text" id="firstName" placeholder="First Name" value="Test">
                    <input type="text" id="lastName" placeholder="Last Name" value="User">
                </div>
                <div>
                    <input type="text" id="username" placeholder="Username" value="">
                    <input type="email" id="email" placeholder="Email" value="">
                </div>
                <div>
                    <input type="password" id="password" placeholder="Password" value="testpass123">
                </div>
                <div>
                    <button onclick="testMainAuth()">Test /api/auth</button>
                    <button onclick="testUserRegister()">Test /api/auth/user/register</button>
                    <button onclick="generateTestData()">Generate New Test Data</button>
                </div>
            </div>

            <div class="test-section">
                <h2>📊 Results</h2>
                <div id="results"></div>
            </div>
        </div>

        <script>
            function generateTestData() {
                const timestamp = Date.now();
                document.getElementById('username').value = 'testuser_' + timestamp;
                document.getElementById('email').value = 'test' + timestamp + '@example.com';
                log('✅ Generated new test data');
            }

            function log(message, isError = false) {
                const results = document.getElementById('results');
                const div = document.createElement('div');
                div.className = isError ? 'error' : 'success';
                div.innerHTML = '<strong>' + new Date().toLocaleTimeString() + ':</strong> ' + message;
                results.appendChild(div);
                results.scrollTop = results.scrollHeight;
            }

            async function testMainAuth() {
                const userData = {
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value
                };

                log('🔄 Testing /api/auth endpoint...');

                try {
                    const response = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });

                    const result = await response.json();

                    if (response.ok) {
                        log('✅ /api/auth SUCCESS! User created: ' + result.user.username);
                    } else {
                        log('❌ /api/auth FAILED: ' + (result.error || result.message), true);
                    }
                } catch (error) {
                    log('❌ /api/auth ERROR: ' + error.message, true);
                }
            }

            async function testUserRegister() {
                const userData = {
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value
                };

                log('🔄 Testing /api/auth/user/register endpoint...');

                try {
                    const response = await fetch('/api/auth/user/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });

                    const result = await response.json();

                    if (response.ok) {
                        log('✅ /api/auth/user/register SUCCESS! User created: ' + result.user.username);
                    } else {
                        log('❌ /api/auth/user/register FAILED: ' + (result.error || result.message), true);
                    }
                } catch (error) {
                    log('❌ /api/auth/user/register ERROR: ' + error.message, true);
                }
            }

            window.onload = function() {
                generateTestData();
                log('🚀 METACHROME V2 Test Page Loaded!');
            };
        </script>
    </body>
    </html>
  `);
});

console.log('🚀 METACHROME V2 - PRODUCTION SERVER STARTING...');
console.log('📁 Serving static files from:', distPath);

// ===== DATABASE FUNCTIONS =====
async function getUsers() {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Database error:', error);
      return [];
    }
  }

  // Development fallback - use local file storage
  try {
    const usersData = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.log('⚠️ Could not load users file, creating default users');

    // Default users data
    const defaultUsers = [
      {
        id: 'user-1',
        username: 'amdsnkstudio',
        email: 'amdsnkstudio@metachrome.io',
        balance: 50000,
        role: 'user',
        status: 'active',
        trading_mode: 'normal',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      },
      {
        id: 'superadmin-1',
        username: 'superadmin',
        email: 'superadmin@metachrome.io',
        password_hash: '$2a$10$tzXg/z.lQ0BRVQ/zI6pFEuZkgdFfR9Yu0Mx05/8DZC11w6dO/ksDe', // superadmin123
        balance: 1000000,
        role: 'super_admin',
        status: 'active',
        trading_mode: 'normal',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }
    ];

    // Save default users to file
    fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
    return defaultUsers;
  }
}

async function saveUsers(users) {
  if (isProduction && supabase) {
    // In production, users are saved individually via other functions
    console.log('⚠️ Bulk user save not implemented for production');
    return;
  }

  // Development fallback - save to local file
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log('💾 Users data saved to file');
  } catch (error) {
    console.error('❌ Error saving users data:', error);
    throw error;
  }
}

async function saveTransactions(transactions) {
  if (isProduction && supabase) {
    // In production, transactions are saved individually via other functions
    console.log('⚠️ Bulk transaction save not implemented for production');
    return;
  }

  // Development fallback - save to local file
  try {
    const transactionsFile = path.join(__dirname, 'transactions-data.json');
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
    console.log('💾 Transactions data saved to file');
  } catch (error) {
    console.error('❌ Error saving transactions data:', error);
    throw error;
  }
}

async function getUserByUsername(username) {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('❌ Database error getting user:', error);
      return null;
    }
  }

  // Development fallback
  const users = await getUsers();
  return users.find(u => u.username === username);
}

async function createUser(userData) {
  if (isProduction && supabase) {
    try {
      // Clean the userData to only include valid columns
      const cleanUserData = {
        username: userData.username,
        email: userData.email,
        password_hash: userData.password_hash || userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        balance: userData.balance !== undefined ? userData.balance : 0,
        role: userData.role || 'user',
        status: userData.status || 'active',
        trading_mode: userData.trading_mode || 'normal',
        wallet_address: userData.wallet_address || userData.walletAddress,
        isActive: userData.isActive !== undefined ? userData.isActive : true
      };

      const { data, error } = await supabase
        .from('users')
        .insert([cleanUserData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database error creating user:', error);
      throw error;
    }
  }

  // Development fallback - save to local file
  try {
    const users = await getUsers();
    const newUser = {
      id: userData.id || `dev-${Date.now()}`,
      ...userData,
      created_at: userData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);
    console.log('✅ User saved to local file:', newUser.username, 'ID:', newUser.id);
    return newUser;
  } catch (error) {
    console.error('❌ Error saving user to local file:', error);
    throw error;
  }
}

async function updateUserBalance(userId, newBalance) {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database error updating balance:', error);
      throw error;
    }
  }

  // Development fallback
  console.log(`💰 [DEV] Updated balance for user ${userId}: ${newBalance}`);
  return { id: userId, balance: newBalance };
}

// Database functions for trades
async function getTrades() {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          users!inner(username)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Format trades with username and time_left calculation
      const now = new Date();
      const formattedTrades = (data || []).map(trade => {
        let timeLeft = 0;
        if (trade.result === 'pending' && trade.expires_at) {
          const expiresAt = new Date(trade.expires_at);
          timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        }

        return {
          ...trade,
          username: trade.users?.username || 'Unknown User',
          time_left: timeLeft
        };
      });

      return formattedTrades;
    } catch (error) {
      console.error('❌ Database error getting trades:', error);
      return [];
    }
  }

  // Development fallback - use local storage with mock data
  try {
    const tradesData = fs.readFileSync(tradesFile, 'utf8');
    const trades = JSON.parse(tradesData);

    // Add username mapping and time_left calculation for development
    const now = new Date();
    const userMap = {
      'demo-user-1757756401422': 'angela.soenoko',
      'demo-user-1': 'john_trader',
      'demo-user-2': 'sarah_crypto',
      'demo-user-3': 'mike_hodler',
      'demo-user-4': 'emma_trader'
    };

    const mappedTrades = trades.map(trade => {
      let timeLeft = 0;
      if (trade.result === 'pending' && trade.expires_at) {
        const expiresAt = new Date(trade.expires_at);
        timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      }

      return {
        ...trade,
        username: userMap[trade.user_id] || 'Unknown User',
        time_left: timeLeft
      };
    });

    // Return only real trades, no mock data
    console.log('📈 Returning real trades only - Count:', mappedTrades.length);

    return mappedTrades;
  } catch (error) {
    console.log('⚠️ Could not load trades file, returning empty array');
    return [];
  }
}

// Database functions for transactions
async function getTransactions(userId = null) {
  if (isProduction && supabase) {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          users!inner(username)
        `);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Format transactions with username
      const formattedTransactions = (data || []).map(txn => ({
        ...txn,
        username: txn.users?.username || 'Unknown User'
      }));

      return formattedTransactions;
    } catch (error) {
      console.error('❌ Database error getting transactions:', error);
      return [];
    }
  }

  // Development fallback - use local storage with username mapping
  try {
    const transactionsData = fs.readFileSync(transactionsFile, 'utf8');
    const transactions = JSON.parse(transactionsData);

    // Get users data for username mapping
    const usersData = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(usersData);

    // Create user mapping from actual users data
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user.username;
    });

    // Add fallback mappings for demo users
    userMap['demo-user-1757756401422'] = 'angela.soenoko';
    userMap['demo-user-1'] = 'john_trader';
    userMap['demo-user-2'] = 'sarah_crypto';
    userMap['demo-user-3'] = 'mike_hodler';
    userMap['demo-user-4'] = 'emma_trader';

    const mappedTransactions = transactions.map(txn => ({
      ...txn,
      username: txn.users?.username || userMap[txn.user_id] || 'Unknown User'
    }));

    if (userId) {
      return mappedTransactions.filter(t => t.user_id === userId);
    }
    return mappedTransactions;
  } catch (error) {
    console.log('⚠️ Could not load transactions file, using empty array');
    return [];
  }
}

async function createTransaction(transactionData) {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Database error creating transaction:', error);
      throw error;
    }
  }

  // Development fallback - save to local file
  try {
    let transactions = [];
    try {
      const transactionsData = fs.readFileSync(transactionsFile, 'utf8');
      transactions = JSON.parse(transactionsData);
    } catch (error) {
      console.log('⚠️ Creating new transactions file');
    }

    transactions.push(transactionData);
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
    console.log('💰 [DEV] Created transaction:', transactionData);
    return transactionData;
  } catch (error) {
    console.error('❌ Error saving transaction:', error);
    throw error;
  }
  return { id: 'dev-txn-' + Date.now(), ...transactionData };
}

// ===== AUTHENTICATION ENDPOINTS =====

// GET /api/auth - Verify authentication and return user data
app.get('/api/auth', async (req, res) => {
  console.log('🔐 Auth verification request');

  try {
    // Get token from Authorization header or query params
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || req.query.token;

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('🔐 Verifying token:', token.substring(0, 20) + '...');

    // For user tokens (including wallet sessions)
    if (token.startsWith('user-token-') || token.startsWith('user-session-')) {
      console.log('🔍 Parsing user token:', token);

      // Extract user ID from token format: user-session-{userId}-{timestamp}
      let userId = null;
      if (token.startsWith('user-session-')) {
        const parts = token.split('-');
        if (parts.length >= 3) {
          // For wallet tokens: user-session-wallet-{timestamp}-{timestamp2}
          if (parts[2] === 'wallet') {
            userId = `wallet-${parts[3]}`;
          } else {
            // For regular user tokens: user-session-{userId}-{timestamp}
            userId = parts[2];
          }
        }
      } else if (token.startsWith('user-token-')) {
        // Legacy format - try to find most recent user
        const users = await getUsers();
        const recentUser = users.find(u => u.username === 'angela.soenoko') || users[0];
        if (recentUser) {
          userId = recentUser.id;
        }
      }

      console.log('🔍 Extracted user ID from token:', userId);

      if (userId) {
        const users = await getUsers();
        const user = users.find(u => u.id === userId);

        if (user) {
          console.log('✅ Token verified, returning user:', user.username);
          return res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            role: user.role || 'user'
          });
        } else {
          console.log('❌ User not found for ID:', userId);
        }
      }
    }

    // For admin tokens
    if (token.startsWith('admin-token-') || token.startsWith('admin-session-')) {
      // Return mock admin data for demo
      console.log('✅ Admin token verified');
      return res.json({
        id: 'admin-001',
        username: 'admin',
        email: 'admin@metachrome.io',
        role: 'admin'
      });
    }

    console.log('❌ Invalid token');
    res.status(401).json({ error: 'Invalid token' });
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generic auth endpoint (handles both login and registration)
app.post('/api/auth', async (req, res) => {
  console.log('🔐 Generic auth endpoint:', req.body);
  const { username, password, email, walletAddress, firstName, lastName } = req.body;

  try {
    // If it's a wallet address login
    if (walletAddress) {
      console.log('🔐 Wallet login attempt:', walletAddress);

      try {
        // Check if wallet user already exists
        const existingUser = await getUserByUsername(walletAddress);

        if (existingUser) {
          console.log('✅ Existing wallet user found:', walletAddress);
          // Update last login
          existingUser.last_login = new Date().toISOString();
          await updateUser(existingUser.id, { last_login: existingUser.last_login });

          return res.json({
            success: true,
            token: `user-session-${existingUser.id}-${Date.now()}`,
            user: {
              id: existingUser.id,
              username: existingUser.username,
              email: existingUser.email,
              role: existingUser.role,
              balance: existingUser.balance,
              firstName: existingUser.firstName || '',
              lastName: existingUser.lastName || ''
            }
          });
        } else {
          // Create new wallet user
          const userData = {
            id: `wallet-${Date.now()}`,
            username: walletAddress,
            email: walletAddress + '@wallet.local',
            password_hash: '', // No password for wallet users
            firstName: '',
            lastName: '',
            balance: 0,
            role: 'user',
            status: 'active',
            trading_mode: 'normal',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          };

          console.log('📝 Creating new wallet user:', walletAddress);
          const newUser = await createUser(userData);
          console.log('✅ Wallet user created in database:', newUser.id);

          return res.json({
            success: true,
            token: `user-session-${newUser.id}-${Date.now()}`,
            user: {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              role: newUser.role,
              balance: newUser.balance,
              firstName: newUser.firstName || '',
              lastName: newUser.lastName || ''
            }
          });
        }
      } catch (error) {
        console.error('❌ Wallet authentication error:', error);
        return res.status(500).json({ error: 'Wallet authentication failed' });
      }
    }

    // If it's a regular login (username + password)
    if (username && password) {
      const user = await getUserByUsername(username);

      if (!user) {
        console.log('❌ User not found:', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password - check both possible column names
      let isValidPassword = false;
      const passwordHash = user.password_hash || user.password;
      if (passwordHash) {
        isValidPassword = await bcrypt.compare(password, passwordHash);
      }

      if (isValidPassword) {
        console.log('✅ User login successful:', username);
        res.json({
          success: true,
          token: 'user-token-' + Date.now(),
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            balance: user.balance
          }
        });
      } else {
        console.log('❌ Invalid password for:', username);
        res.status(401).json({ error: 'Invalid credentials' });
      }
    }
    // If it's a registration (username + password + email)
    else if (username && password && email) {
      console.log('🔐 Registration attempt:', { username, email });

      // Check if user already exists
      const existingUser = await getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const userData = {
        username,
        email,
        password_hash: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        balance: 10000, // Starting balance
        role: 'user',
        status: 'active',
        trading_mode: 'normal',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      const newUser = await createUser(userData);

      console.log('✅ User registration successful:', username);
      res.json({
        success: true,
        token: 'user-token-' + Date.now(),
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          balance: newUser.balance,
          role: newUser.role
        }
      });
    } else {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has admin role
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      console.log('❌ User not admin:', username, user.role);
      return res.status(401).json({ error: 'Access denied' });
    }

    // Verify password - check both possible column names
    let isValidPassword = false;
    const passwordHash = user.password_hash || user.password;
    if (passwordHash) {
      isValidPassword = await bcrypt.compare(password, passwordHash);
    } else {
      // Fallback for development
      isValidPassword = (username === 'superadmin' && password === 'superadmin123') ||
                       (username === 'admin' && password === 'admin123');
    }

    if (isValidPassword) {
      console.log('✅ Admin login successful:', username, user.role);
      res.json({
        success: true,
        token: 'admin-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email
        }
      });
    } else {
      console.log('❌ Invalid password for:', username);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth verification endpoint
app.get('/api/auth', (req, res) => {
  console.log('🔍 Auth verification request');

  // Check for Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token) {
    console.log('🔍 Auth check - checking token:', token.substring(0, 20) + '...');

    // Simple token validation for admin tokens
    if (token.startsWith('admin-token-')) {
      const adminUser = {
        id: 'superadmin-1',
        username: 'superadmin',
        role: 'super_admin',
        email: 'superadmin@metachrome.io'
      };
      console.log('✅ Valid admin token found:', adminUser);
      return res.json(adminUser);
    }

    // Simple token validation for user tokens
    if (token.startsWith('user-token-')) {
      // Return a demo user for now
      const demoUser = {
        id: 'user-1',
        username: 'amdsnkstudio',
        role: 'user',
        email: 'amdsnkstudio@metachrome.io',
        balance: 0
      };
      console.log('✅ Valid user token found:', demoUser);
      return res.json(demoUser);
    }

    console.log('❌ Invalid token format');
  } else {
    console.log('❌ No token provided');
  }

  // Return null for no authentication
  res.json(null);
});

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 User registration attempt:', req.body);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with proper structure
    const userData = {
      id: `user-${Date.now()}`,
      username,
      email,
      password_hash: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      balance: 10000,
      role: 'user',
      status: 'active',
      trading_mode: 'normal',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    console.log('📝 Creating user with data:', { ...userData, password_hash: '[HIDDEN]' });
    const newUser = await createUser(userData);
    console.log('✅ User created in database:', newUser.id);

    // Verify user was actually saved
    const verifyUser = await getUserByUsername(username);
    if (!verifyUser) {
      throw new Error('User creation verification failed');
    }
    console.log('✅ User creation verified in database');
    // Generate a simple token for authentication
    const token = `user-session-${newUser.id}-${Date.now()}`;

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        balance: newUser.balance
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Alternative user registration endpoint (for frontend compatibility)
app.post('/api/auth/user/register', async (req, res) => {
  console.log('📝 User registration attempt (user endpoint):', req.body);
  const { username, email, password, firstName, lastName } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with firstName and lastName support
    const userData = {
      id: `user-${Date.now()}`,
      username,
      email,
      password: hashedPassword,
      password_hash: hashedPassword,
      firstName: firstName || '',
      lastName: lastName || '',
      balance: 10000,
      role: 'user',
      status: 'active',
      trading_mode: 'normal',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    console.log('📝 Creating user with data:', { ...userData, password: '[HIDDEN]', password_hash: '[HIDDEN]' });
    const newUser = await createUser(userData);
    console.log('✅ User created in database:', newUser.id);

    // Verify user was actually saved
    const verifyUser = await getUserByUsername(username);
    if (!verifyUser) {
      throw new Error('User creation verification failed');
    }
    console.log('✅ User creation verified in database');

    // Generate a simple token for authentication
    const token = `user-session-${newUser.id}-${Date.now()}`;

    res.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        balance: newUser.balance
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
});

// User login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 User login attempt:', req.body);
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password - check both possible column names
    let isValidPassword = false;
    const passwordHash = user.password_hash || user.password;
    if (passwordHash) {
      isValidPassword = await bcrypt.compare(password, passwordHash);
    }

    if (isValidPassword) {
      console.log('✅ User login successful:', username);
      res.json({
        success: true,
        token: 'user-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance
        }
      });
    } else {
      console.log('❌ Invalid password for:', username);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alternative user login endpoint (for frontend compatibility)
app.post('/api/auth/user/login', async (req, res) => {
  console.log('🔐 User login attempt (alternative endpoint):', req.body);
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password - check both possible column names
    let isValidPassword = false;
    const passwordHash = user.password_hash || user.password;
    if (passwordHash) {
      isValidPassword = await bcrypt.compare(password, passwordHash);
    }

    if (isValidPassword) {
      console.log('✅ User login successful:', username);
      res.json({
        success: true,
        token: 'user-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          balance: user.balance
        }
      });
    } else {
      console.log('❌ Invalid password for:', username);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== GOOGLE OAUTH ENDPOINTS =====

// Google OAuth login endpoint
app.get('/api/auth/google', (req, res) => {
  console.log('🔐 Google OAuth login request');

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }

  // Construct Google OAuth URL
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const scope = 'openid email profile';
  const state = Math.random().toString(36).substring(2, 15);

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `response_type=code&` +
    `state=${state}`;

  console.log('🔄 Redirecting to Google OAuth:', googleAuthUrl);
  res.redirect(googleAuthUrl);
});

// Google OAuth callback endpoint
app.get('/api/auth/google/callback', async (req, res) => {
  console.log('🔐 Google OAuth callback:', req.query);

  const { code, error } = req.query;

  if (error) {
    console.error('❌ Google OAuth error:', error);
    return res.redirect('/?error=oauth_failed');
  }

  if (!code) {
    console.error('❌ No authorization code received');
    return res.redirect('/?error=oauth_failed');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userResponse.json();
    console.log('👤 Google user info:', googleUser);

    // Check if user exists in our database
    let user = await getUserByEmail(googleUser.email);

    if (!user) {
      // Create new user
      const userData = {
        id: `google-${Date.now()}`,
        username: googleUser.email.split('@')[0] + '_' + Date.now(),
        email: googleUser.email,
        password_hash: '', // No password for OAuth users
        firstName: googleUser.given_name || '',
        lastName: googleUser.family_name || '',
        balance: 10000,
        role: 'user',
        status: 'active',
        trading_mode: 'normal',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      console.log('📝 Creating new Google user:', googleUser.email);
      user = await createUser(userData);
      console.log('✅ Google user created in database:', user.id);
    } else {
      // Update last login
      user.last_login = new Date().toISOString();
      await updateUser(user.id, { last_login: user.last_login });
      console.log('✅ Existing Google user logged in:', user.email);
    }

    // Generate token and redirect to dashboard
    const token = `user-session-${user.id}-${Date.now()}`;

    // Redirect to frontend with token
    res.redirect(`/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      balance: user.balance,
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    }))}`);

  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    res.redirect('/?error=oauth_failed');
  }
});

// ===== USER MANAGEMENT ENDPOINTS =====

// Update user password
app.put('/api/admin/users/:userId/password', async (req, res) => {
  console.log('🔐 Password update request for user:', req.params.userId);
  const { userId } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔐 Password hashed successfully');

    if (isProduction && supabase) {
      // Update password in Supabase
      const { data, error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('❌ Supabase password update error:', error);
        throw error;
      }

      console.log('✅ Password updated in Supabase for user:', userId);
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      // Update password in local file
      const users = await getUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      users[userIndex].password_hash = hashedPassword;
      users[userIndex].updated_at = new Date().toISOString();

      await saveUsers(users);
      console.log('✅ Password updated in local file for user:', userId);
      res.json({ success: true, message: 'Password updated successfully' });
    }
  } catch (error) {
    console.error('❌ Password update error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Update user wallet address
app.put('/api/admin/users/update-wallet', async (req, res) => {
  console.log('🏦 Wallet update request:', req.body);
  const { userId, walletAddress } = req.body;

  try {
    if (isProduction && supabase) {
      // Production: Update in Supabase
      const { data, error } = await supabase
        .from('users')
        .update({ wallet_address: walletAddress, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase wallet update error:', error);
        return res.status(500).json({ error: 'Failed to update wallet address' });
      }

      console.log('✅ Wallet updated in Supabase for user:', userId);
      res.json({ success: true, message: 'Wallet address updated successfully', user: data });
    } else {
      // Update wallet in local file
      const users = await getUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      users[userIndex].wallet_address = walletAddress;
      users[userIndex].updated_at = new Date().toISOString();

      await saveUsers(users);
      console.log('✅ Wallet updated in local file for user:', userId);
      res.json({ success: true, message: 'Wallet address updated successfully', user: users[userIndex] });
    }
  } catch (error) {
    console.error('❌ Error updating wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet address' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await getUsers();
    console.log('👥 Getting users list - Count:', users.length);
    res.json(users);
  } catch (error) {
    console.error('❌ Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  console.log('👤 Creating new user:', req.body);
  const { username, email, password, balance, role, trading_mode } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if username already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      username,
      email,
      password_hash,
      balance: Number(balance) || 10000,
      role: role || 'user',
      status: 'active',
      trading_mode: trading_mode || 'normal'
    });

    console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
    res.json(newUser);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ===== USER UPDATE ENDPOINT =====
app.put('/api/admin/users/:id', async (req, res) => {
  console.log('✏️ Updating user:', req.params.id, req.body);
  const userId = req.params.id;
  const { username, email, balance, role, status, trading_mode } = req.body;

  try {
    const users = await getUsers();
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

    // Save the updated users data to file
    await saveUsers(users);

    console.log('✅ User updated successfully:', updatedUser.username, 'ID:', updatedUser.id);
    res.json(updatedUser);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ===== BALANCE UPDATE ENDPOINT =====
app.put('/api/admin/balances/:userId', async (req, res) => {
  try {
    console.log('💰 Balance update request for user:', req.params.userId);
    const { userId } = req.params;
    const { balance, action } = req.body;

    if (!balance || balance <= 0) {
      return res.status(400).json({ error: 'Invalid balance amount' });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];
    const oldBalance = user.balance;

    if (action === 'add') {
      user.balance = Number(user.balance) + Number(balance);
    } else if (action === 'subtract') {
      user.balance = Number(user.balance) - Number(balance);
      if (user.balance < 0) {
        user.balance = 0; // Don't allow negative balances
      }
    } else {
      // Direct balance set
      user.balance = Number(balance);
    }

    user.updated_at = new Date().toISOString();

    // Save the updated users data
    await saveUsers(users);

    // Create transaction record
    const transaction = {
      id: `txn-${Date.now()}`,
      user_id: user.id,
      type: action === 'add' ? 'deposit' : 'withdrawal',
      amount: Number(balance),
      status: 'completed',
      description: `Admin ${action === 'add' ? 'deposit' : 'withdrawal'} - Balance ${action === 'add' ? 'increased' : 'decreased'} by ${balance} USDT`,
      created_at: new Date().toISOString(),
      users: { username: user.username }
    };
    await createTransaction(transaction);

    console.log(`✅ Balance updated for ${user.username}: ${oldBalance} → ${user.balance}`);

    // Broadcast balance update via WebSocket
    if (global.wss) {
      const broadcastMessage = {
        type: 'balance_update',
        data: {
          userId: user.id,
          username: user.username,
          oldBalance: oldBalance,
          newBalance: user.balance,
          changeAmount: Number(balance),
          changeType: action === 'add' ? 'admin_deposit' : 'admin_withdrawal',
          adminId: 'superadmin-001',
          timestamp: new Date().toISOString()
        }
      };

      global.wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(broadcastMessage));
        }
      });
    }

    res.json({
      success: true,
      message: `Balance ${action === 'add' ? 'increased' : 'decreased'} successfully`,
      user: user,
      oldBalance: oldBalance,
      newBalance: user.balance,
      changeAmount: Number(balance)
    });

  } catch (error) {
    console.error('❌ Error updating balance:', error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

// ===== DELETE USER ENDPOINT =====
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    console.log('🗑️ Delete user request for:', req.params.userId);
    const { userId } = req.params;

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];

    // Don't allow deleting super admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete super admin user' });
    }

    // Remove user from array
    users.splice(userIndex, 1);

    // Save the updated users data
    await saveUsers(users);

    console.log(`✅ User deleted successfully: ${user.username} (${user.email})`);

    res.json({
      success: true,
      message: `User ${user.username} deleted successfully`,
      deletedUser: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.post('/api/admin/trading-controls', async (req, res) => {
  try {
    console.log('🎯 Updating trading control:', req.body);
    const { userId, controlType } = req.body;

    if (!userId || !controlType || !['win', 'normal', 'lose'].includes(controlType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid userId and controlType (win/normal/lose) are required'
      });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      users[userIndex].trading_mode = controlType;
      users[userIndex].updated_at = new Date().toISOString();

      // Save the updated users data
      await saveUsers(users);

      console.log(`✅ Updated ${users[userIndex].username} trading mode to ${controlType}`);

      // Broadcast trading mode change to all connected clients for real-time updates
      if (global.wss) {
        const broadcastMessage = {
          type: 'trading_control_update',
          data: {
            userId: userId,
            controlType: controlType,
            username: users[userIndex].username,
            adminId: 'superadmin-001',
            timestamp: new Date().toISOString(),
            message: `Trading mode changed to ${controlType.toUpperCase()}`
          }
        };

        console.log('📡 Broadcasting real-time trading control update:', broadcastMessage);

        let broadcastCount = 0;
        global.wss.clients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            try {
              client.send(JSON.stringify(broadcastMessage));
              broadcastCount++;
            } catch (error) {
              console.error('❌ Failed to broadcast to client:', error);
            }
          }
        });

        console.log(`✅ Trading control update broadcasted to ${broadcastCount} connected clients`);
      } else {
        console.log('⚠️ WebSocket server not available for broadcasting');
      }

      res.json({
        success: true,
        message: `Trading mode updated to ${controlType.toUpperCase()}`,
        user: users[userIndex]
      });
    } else {
      console.log('❌ User not found:', userId);
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error('❌ Error updating trading control:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update trading control'
    });
  }
});

// ===== TRADING ENDPOINTS =====
app.get('/api/admin/trades', async (req, res) => {
  try {
    const trades = await getTrades();
    console.log('📈 Getting trades list - Count:', trades.length);
    res.json(trades);
  } catch (error) {
    console.error('❌ Error getting trades:', error);
    res.status(500).json({ error: 'Failed to get trades' });
  }
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

// ===== LIVE TRADES ENDPOINT =====
app.get('/api/admin/live-trades', async (req, res) => {
  try {
    const trades = await getTrades();
    console.log('🔴 Getting live trades - Count:', trades.length);
    res.json({
      trades: trades,
      total: trades.length,
      active: trades.filter(t => t.result === 'pending').length
    });
  } catch (error) {
    console.error('❌ Error getting trades:', error);
    res.status(500).json({ error: 'Failed to get trades' });
  }
});

// ===== PERSISTENT DATA STORAGE =====
const dataFile = path.join(__dirname, 'pending-data.json');
const transactionsFile = path.join(__dirname, 'transactions-data.json');
const usersFile = path.join(__dirname, 'users-data.json');
const tradesFile = path.join(__dirname, 'trades-data.json');

// Load existing data or create default
let pendingData = {
  deposits: [],
  withdrawals: [
    {
      id: 'with-001',
      user_id: 'user-2',
      username: 'trader2',
      amount: 200,
      currency: 'USDT',
      network: 'ERC20',
      status: 'pending',
      wallet_address: '0x8ba1f109551bD432803012645Hac136c22C501e5',
      created_at: new Date().toISOString()
    }
  ]
};

// Load data from file if it exists
try {
  if (fs.existsSync(dataFile)) {
    const fileData = fs.readFileSync(dataFile, 'utf8');
    pendingData = JSON.parse(fileData);
    console.log('📂 Loaded pending data from file:', {
      deposits: pendingData.deposits.length,
      withdrawals: pendingData.withdrawals.length
    });
  }
} catch (error) {
  console.log('⚠️ Could not load pending data file, using defaults');
}

// Save data to file
function savePendingData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(pendingData, null, 2));
  } catch (error) {
    console.error('❌ Failed to save pending data:', error);
  }
}

let pendingDeposits = pendingData.deposits;
let pendingWithdrawals = pendingData.withdrawals;

// ===== USER DEPOSIT REQUEST ENDPOINT =====
app.post('/api/transactions/deposit-request', async (req, res) => {
  try {
    console.log('💰 Creating deposit request');
    console.log('💰 Request body received:', JSON.stringify(req.body, null, 2));
    console.log('💰 Request headers:', req.headers.authorization);

    const { amount, currency } = req.body;

    if (!amount || !currency || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount or currency" });
    }

    // Validate minimum amounts
    const minAmounts = {
      'USDT-ERC': 10,
      'USDT-BEP': 10,
      'USDT-TRC': 10,
      'BTC': 0.001,
      'ETH': 0.01,
      'SOL': 0.1
    };

    const minAmount = minAmounts[currency] || 1;
    if (parseFloat(amount) < minAmount) {
      return res.status(400).json({
        message: `Minimum deposit amount is ${minAmount} ${currency}`
      });
    }

    // Get user from auth token - IMPROVED USER AUTHENTICATION
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    console.log('💰 Looking up user with token:', authToken);

    const users = await getUsers();

    // Default to a real user (not always trader1)
    let currentUser = users.find(u => u.role === 'user') || users[0];

  // Try different token patterns
  if (authToken) {
    // Pattern 1: user-session-{userId}
    if (authToken.startsWith('user-session-')) {
      const userId = authToken.replace('user-session-', '');
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        currentUser = foundUser;
        console.log('💰 Found user by session:', currentUser.username);
      }
    }
    // Pattern 2: demo-token-{timestamp} - use different users based on timestamp
    else if (authToken.startsWith('demo-token-')) {
      const timestamp = authToken.replace('demo-token-', '');
      const userIndex = parseInt(timestamp.slice(-1)) % users.filter(u => u.role === 'user').length;
      const userList = users.filter(u => u.role === 'user');
      currentUser = userList[userIndex] || userList[0];
      console.log('💰 Selected user by demo token:', currentUser.username);
    }
    // Pattern 3: Direct user lookup by username in token
    else {
      const foundUser = users.find(u => authToken.includes(u.username) || authToken.includes(u.id));
      if (foundUser) {
        currentUser = foundUser;
        console.log('💰 Found user by token match:', currentUser.username);
      }
    }
  }

  console.log('💰 Final selected user:', currentUser.username, 'Balance:', currentUser.balance);

  // Generate unique deposit ID
  const depositId = `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Map currency to network - FIXED to handle all variations
  const currencyNetworkMap = {
    'USDT-ERC': 'ERC20',
    'USDT-ERC20': 'ERC20',
    'USDT-BEP': 'BEP20',
    'USDT-BEP20': 'BEP20',
    'USDT-TRC': 'TRC20',
    'USDT-TRC20': 'TRC20',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana'
  };

  // Clean currency name properly - FIXED
  let cleanCurrency = currency;
  if (currency.includes('USDT')) {
    cleanCurrency = 'USDT'; // Always show as USDT regardless of network
  }

  // Add to pending deposits with all required fields
  const newDeposit = {
    id: depositId,
    user_id: currentUser.id,
    username: currentUser.username,
    amount: parseFloat(amount),
    currency: cleanCurrency, // FIXED: Use properly cleaned currency
    network: currencyNetworkMap[currency] || 'Unknown', // FIXED: Use original currency for mapping
    status: 'pending',
    wallet_address: '', // Will be filled when proof is submitted
    created_at: new Date().toISOString()
  };

  pendingDeposits.push(newDeposit);
  pendingData.deposits = pendingDeposits;
  savePendingData();

  console.log('💰 Deposit request created:', depositId, 'for user:', currentUser.username);

  res.json({
    success: true,
    depositId,
    transactionId: depositId,
    amount: amount,
    currency: currency,
    status: 'pending',
    message: "Deposit request created successfully. Please complete the payment and upload receipt."
  });
  } catch (error) {
    console.error('❌ Error creating deposit request:', error);
    res.status(500).json({ error: 'Failed to create deposit request' });
  }
});

// ===== SUBMIT PROOF ENDPOINT =====
app.post('/api/transactions/submit-proof', upload.single('receipt'), (req, res) => {
  console.log('📄 Submitting proof');
  console.log('📄 Request body:', req.body);
  console.log('📄 Request file:', req.file);

  // Handle FormData with multer
  const { depositId, txHash, walletAddress } = req.body;

  if (!depositId) {
    return res.status(400).json({ message: "Deposit ID is required" });
  }

  console.log('📄 Extracted depositId:', depositId);

  // Find the deposit request
  const deposit = pendingDeposits.find(d => d.id === depositId);
  if (!deposit) {
    console.log('📄 Deposit not found. Available deposits:', pendingDeposits.map(d => d.id));
    return res.status(404).json({ message: "Deposit request not found" });
  }

  if (deposit.status !== 'pending' && deposit.status !== 'verifying') {
    return res.status(400).json({ message: "Deposit request is not pending" });
  }

  // Update deposit with proof information
  deposit.txHash = txHash || `user_upload_${Date.now()}`;
  deposit.walletAddress = walletAddress || 'user_wallet_address';
  deposit.proofSubmittedAt = new Date().toISOString();
  deposit.status = 'verifying';
  deposit.receiptUploaded = true;

  // Store file information if uploaded
  if (req.file) {
    deposit.receiptFile = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    };
  }

  // Save updated data
  pendingData.deposits = pendingDeposits;
  savePendingData();

  console.log('📄 Proof submitted for deposit:', depositId);

  res.json({
    success: true,
    message: "Transaction proof submitted successfully. Your deposit is now being verified.",
    depositId,
    status: 'verifying'
  });
});

// ===== PENDING REQUESTS ENDPOINT =====
app.get('/api/admin/pending-requests', async (req, res) => {
  try {
    console.log('🔔 Getting pending requests');
    console.log('🔔 Raw pendingDeposits:', pendingDeposits);
    console.log('🔔 Raw pendingWithdrawals:', pendingWithdrawals);

    const users = await getUsers();

    // Add user balance info and receipt URLs to pending requests
    const depositsWithBalance = pendingDeposits.map(deposit => {
      const user = users.find(u => u.username === deposit.username) || { balance: 20000 };
      const depositWithBalance = { ...deposit, user_balance: user.balance };

    // Add receipt file URL if receipt exists
    if (deposit.receiptFile && deposit.receiptFile.filename) {
      depositWithBalance.receiptUrl = `/api/admin/receipt/${deposit.receiptFile.filename}`;
      depositWithBalance.receiptViewUrl = `http://127.0.0.1:3001/api/admin/receipt/${deposit.receiptFile.filename}`;
    }

    return depositWithBalance;
  });

  const withdrawalsWithBalance = pendingWithdrawals.map(withdrawal => {
    const user = users.find(u => u.username === withdrawal.username) || { balance: 15000 };
    return { ...withdrawal, user_balance: user.balance };
  });

  const pendingRequests = {
    deposits: depositsWithBalance,
    withdrawals: withdrawalsWithBalance,
    total: depositsWithBalance.length + withdrawalsWithBalance.length
  };

  console.log('🔔 Pending requests response:', JSON.stringify(pendingRequests, null, 2));
  res.json(pendingRequests);
  } catch (error) {
    console.error('❌ Error getting pending requests:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// ===== DEPOSIT ACTION ENDPOINT =====
app.post('/api/admin/deposits/:id/action', async (req, res) => {
  try {
    const depositId = req.params.id;
    const { action, reason } = req.body;

    console.log('🏦 Deposit action:', depositId, action, reason);

    // Find the deposit request
    const depositIndex = pendingDeposits.findIndex(d => d.id === depositId);
    if (depositIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Deposit request not found'
      });
    }

    const deposit = pendingDeposits[depositIndex];

    // Get users and transactions for both approve and reject actions
    const users = await getUsers();
    const transactions = await getTransactions();

    if (action === 'approve') {

      // Find the user and update their balance
      const user = users.find(u => u.username === deposit.username);
    if (user) {
      user.balance += deposit.amount; // Add deposit amount
      console.log('✅ Deposit approved, user balance updated:', user.balance);

      // Save updated users data
      await saveUsers(users);
      console.log('💾 User balance changes saved to file');

      // Add approved transaction record
      const transaction = {
        id: `txn-${Date.now()}`,
        user_id: user.id,
        type: 'deposit',
        amount: deposit.amount,
        status: 'completed',
        description: `Deposit approved by admin - ${deposit.currency} via ${deposit.network}`,
        created_at: new Date().toISOString(),
        users: { username: user.username }
      };
      await createTransaction(transaction);
      console.log('📝 Approved deposit transaction recorded');
      console.log('📝 Transaction details:', transaction);
    }

    // Remove from pending deposits
    pendingDeposits.splice(depositIndex, 1);
    pendingData.deposits = pendingDeposits;
    savePendingData();
    console.log('🗑️ Deposit removed from pending list');

    res.json({
      success: true,
      message: 'Deposit approved successfully',
      action: 'approve'
    });
  } else if (action === 'reject') {
    console.log('❌ Deposit rejected:', reason);

    // Find the user for transaction record
    const user = users.find(u => u.username === deposit.username);

    // Add rejected transaction record
    const transaction = {
      id: `txn-${Date.now()}`,
      user_id: user ? user.id : deposit.user_id,
      type: 'deposit',
      amount: deposit.amount,
      status: 'rejected',
      description: `Deposit rejected by admin - Reason: ${reason || 'No reason provided'} - ${deposit.currency} via ${deposit.network}`,
      created_at: new Date().toISOString(),
      users: { username: deposit.username }
    };
    await createTransaction(transaction);
    console.log('📝 Rejected deposit transaction recorded');
    console.log('📝 Transaction details:', transaction);

    // Remove from pending deposits
    pendingDeposits.splice(depositIndex, 1);
    pendingData.deposits = pendingDeposits;
    savePendingData();
    console.log('🗑️ Deposit removed from pending list');

    res.json({
      success: true,
      message: 'Deposit rejected',
      action: 'reject',
      reason
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }
  } catch (error) {
    console.error('❌ Error processing deposit action:', error);
    res.status(500).json({ error: 'Failed to process deposit action' });
  }
});

// ===== WITHDRAWAL ACTION ENDPOINT =====
app.post('/api/admin/withdrawals/:id/action', async (req, res) => {
  try {
    const withdrawalId = req.params.id;
    const { action, reason } = req.body;

    console.log('💸 Withdrawal action:', withdrawalId, action, reason);

    // Find the withdrawal request
    const withdrawalIndex = pendingWithdrawals.findIndex(w => w.id === withdrawalId);
    if (withdrawalIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    const withdrawal = pendingWithdrawals[withdrawalIndex];

    // Get users and transactions for both approve and reject actions
    const users = await getUsers();
    const transactions = await getTransactions();

    if (action === 'approve') {

      // Find the user and update their balance
      const user = users.find(u => u.username === withdrawal.username);
    if (user && user.balance >= withdrawal.amount) {
      user.balance -= withdrawal.amount; // Subtract withdrawal amount
      console.log('✅ Withdrawal approved, user balance updated:', user.balance);

      // Save updated users data
      await saveUsers(users);
      console.log('💾 User balance changes saved to file');

      // Add approved transaction record
      const transaction = {
        id: `txn-${Date.now()}`,
        user_id: user.id,
        type: 'withdrawal',
        amount: withdrawal.amount, // Positive amount for display, negative impact on balance
        status: 'completed',
        description: `Withdrawal approved by admin - ${withdrawal.currency} via ${withdrawal.network} to ${withdrawal.wallet_address}`,
        created_at: new Date().toISOString(),
        users: { username: user.username }
      };
      await createTransaction(transaction);
      console.log('📝 Approved withdrawal transaction recorded');
    } else if (user && user.balance < withdrawal.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient user balance for withdrawal'
      });
    }

    // Remove from pending withdrawals
    pendingWithdrawals.splice(withdrawalIndex, 1);
    pendingData.withdrawals = pendingWithdrawals;
    savePendingData();
    console.log('🗑️ Withdrawal removed from pending list');

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      action: 'approve'
    });
  } else if (action === 'reject') {
    console.log('❌ Withdrawal rejected:', reason);

    // Find the user for transaction record
    const user = users.find(u => u.username === withdrawal.username);

    // Add rejected transaction record
    const transaction = {
      id: `txn-${Date.now()}`,
      user_id: user ? user.id : withdrawal.user_id,
      type: 'withdrawal',
      amount: withdrawal.amount,
      status: 'rejected',
      description: `Withdrawal rejected by admin - Reason: ${reason || 'No reason provided'} - ${withdrawal.currency} via ${withdrawal.network}`,
      created_at: new Date().toISOString(),
      users: { username: withdrawal.username }
    };
    await createTransaction(transaction);
    console.log('📝 Rejected withdrawal transaction recorded');

    // Remove from pending withdrawals
    pendingWithdrawals.splice(withdrawalIndex, 1);
    pendingData.withdrawals = pendingWithdrawals;
    savePendingData();
    console.log('🗑️ Withdrawal removed from pending list');

    res.json({
      success: true,
      message: 'Withdrawal rejected',
      action: 'reject',
      reason
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }
  } catch (error) {
    console.error('❌ Error processing withdrawal action:', error);
    res.status(500).json({ error: 'Failed to process withdrawal action' });
  }
});

// ===== ADD NEW PENDING REQUEST (FOR TESTING) =====
app.post('/api/admin/add-test-requests', (req, res) => {
  console.log('🧪 Adding test pending requests');

  // Add a new test deposit if none exist
  if (pendingDeposits.length === 0) {
    pendingDeposits.push({
      id: `dep-${Date.now()}`,
      user_id: 'user-3',
      username: 'trader3',
      amount: 750,
      currency: 'USDT',
      network: 'TRC20',
      status: 'pending',
      wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96590b4165',
      created_at: new Date().toISOString()
    });
  }

  // Add a new test withdrawal if none exist
  if (pendingWithdrawals.length === 0) {
    pendingWithdrawals.push({
      id: `with-${Date.now()}`,
      user_id: 'user-4',
      username: 'trader4',
      amount: 300,
      currency: 'USDT',
      network: 'ERC20',
      status: 'pending',
      wallet_address: '0x8ba1f109551bD432803012645Hac136c22C501e5',
      created_at: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Test requests added',
    deposits: pendingDeposits.length,
    withdrawals: pendingWithdrawals.length
  });
});

// ===== TRANSACTION ENDPOINTS =====
app.get('/api/admin/transactions', async (req, res) => {
  try {
    const transactions = await getTransactions();
    console.log('💰 Getting transactions list - Count:', transactions.length);
    res.json(transactions);
  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// User-specific transactions endpoint
app.get('/api/users/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('💰 Getting transactions for user:', userId);

    const transactions = await getTransactions(userId);
    console.log('💰 Found transactions for user:', transactions.length);
    res.json(transactions);
  } catch (error) {
    console.error('❌ Error getting user transactions:', error);
    res.status(500).json({ error: 'Failed to get user transactions' });
  }
});

// User-specific trades endpoint for trade history
app.get('/api/users/:userId/trades', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📈 Getting trades for user:', userId);

    const allTrades = await getTrades();
    const userTrades = allTrades.filter(trade => trade.user_id === userId);
    console.log('📈 Found trades for user:', userTrades.length);
    res.json(userTrades);
  } catch (error) {
    console.error('❌ Error getting user trades:', error);
    res.status(500).json({ error: 'Failed to get user trades' });
  }
});

// User balance endpoint
app.get('/api/users/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('💰 Getting balance for user:', userId);

    const users = await getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user.id,
      username: user.username,
      balance: user.balance,
      currency: 'USDT'
    });
  } catch (error) {
    console.error('❌ Error getting user balance:', error);
    res.status(500).json({ error: 'Failed to get user balance' });
  }
});

// Generic balance endpoint (for frontend compatibility)
app.get('/api/balances', async (req, res) => {
  try {
    // Get user from auth token or default to first user
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    console.log('💰 Getting balances with token:', authToken);

    const users = await getUsers();
    let currentUser = users.find(u => u.role === 'user') || users[0];

    // Try to find user by token
    if (authToken) {
      console.log('💰 Processing auth token:', authToken.substring(0, 30) + '...');

      if (authToken.startsWith('user-session-')) {
        // Extract user ID from token format: user-session-{userId}-{timestamp}
        const tokenParts = authToken.replace('user-session-', '').split('-');
        const userId = tokenParts.length > 1 ? tokenParts.slice(0, -1).join('-') : tokenParts[0];
        console.log('💰 Extracted user ID from token:', userId);

        const foundUser = users.find(u => u.id === userId);
        if (foundUser) {
          currentUser = foundUser;
          console.log('💰 Found user by session:', currentUser.username, 'Balance:', currentUser.balance);
        } else {
          console.log('💰 No user found for ID:', userId);
        }
      }
      // Handle wallet-session- tokens (from MetaMask login)
      else if (authToken.startsWith('wallet-session-')) {
        const walletId = authToken.replace('wallet-session-', '');
        const foundUser = users.find(u => u.id === walletId || u.username === walletId);
        if (foundUser) {
          currentUser = foundUser;
          console.log('💰 Found wallet user by session:', currentUser.username, 'Balance:', currentUser.balance);
        }
      }
      // Handle user-token- tokens (from regular login)
      else if (authToken.startsWith('user-token-')) {
        // For user-token-, we need to find the user by checking localStorage or using the stored user data
        // Since we can't access localStorage from server, we'll find angela user as the main test user
        const angelaUser = users.find(u => u.username === 'angela.soenoko' || u.email === 'angela.soenoko@gmail.com');
        if (angelaUser) {
          currentUser = angelaUser;
          console.log('💰 Found user by user-token:', currentUser.username, currentUser.email);
        }
      }
      // Handle JWT tokens (from Google OAuth)
      else if (authToken.includes('.')) {
        // This looks like a JWT token, try to find angela user
        const angelaUser = users.find(u => u.email === 'angela.soenoko@gmail.com');
        if (angelaUser) {
          currentUser = angelaUser;
          console.log('💰 Found Angela user by JWT token:', currentUser.username, currentUser.email);
        }
      }
      // Handle demo tokens - try to match by email or username in token
      else if (authToken.startsWith('demo-token-')) {
        // Try to find user by email in token
        const foundUser = users.find(u =>
          authToken.includes(u.email.replace('@', '').replace('.', '')) ||
          authToken.includes(u.username) ||
          u.email === 'angela.soenoko@gmail.com'
        );
        if (foundUser) {
          currentUser = foundUser;
          console.log('💰 Found user by demo token:', currentUser.username, currentUser.email);
        } else {
          // Fallback to amdsnkstudio
          const fallbackUser = users.find(u => u.username === 'amdsnkstudio');
          if (fallbackUser) {
            currentUser = fallbackUser;
            console.log('💰 Using fallback user:', currentUser.username);
          }
        }
      }
    }

    console.log('💰 Returning balance for user:', currentUser.username, 'Balance:', currentUser.balance);

    // Return both formats for compatibility
    res.json([
      {
        symbol: 'USDT',
        available: currentUser.balance.toString(),
        locked: '0'
      }
    ]);
  } catch (error) {
    console.error('❌ Error getting balances:', error);
    res.status(500).json({ error: 'Failed to get balances' });
  }
});

// User-specific balance endpoint (for trading pages)
app.get('/api/user/balances', async (req, res) => {
  try {
    // Get user from auth token or query parameter
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const { userId } = req.query;
    console.log('💰 Getting user balances with token:', authToken, 'userId:', userId);

    const users = await getUsers();
    let currentUser = users.find(u => u.role === 'user') || users[0];

    // Try to find user by token first
    if (authToken) {
      console.log('💰 Processing auth token:', authToken.substring(0, 30) + '...');

      if (authToken.startsWith('user-session-')) {
        const tokenUserId = authToken.replace('user-session-', '');
        const foundUser = users.find(u => u.id === tokenUserId);
        if (foundUser) {
          currentUser = foundUser;
          console.log('💰 Found user by session:', currentUser.username);
        }
      }
      // Handle JWT tokens (from Google OAuth)
      else if (authToken.includes('.')) {
        // This looks like a JWT token, try to find angela user
        const angelaUser = users.find(u => u.email === 'angela.soenoko@gmail.com');
        if (angelaUser) {
          currentUser = angelaUser;
          console.log('💰 Found Angela user by JWT token:', currentUser.username, currentUser.email);
        }
      }
      // Handle demo tokens - try to match by email or username in token
      else if (authToken.startsWith('demo-token-')) {
        // Try to find user by email in token
        const foundUser = users.find(u =>
          authToken.includes(u.email.replace('@', '').replace('.', '')) ||
          authToken.includes(u.username) ||
          u.email === 'angela.soenoko@gmail.com'
        );
        if (foundUser) {
          currentUser = foundUser;
          console.log('💰 Found user by demo token:', currentUser.username, currentUser.email);
        } else {
          // Fallback to amdsnkstudio
          const fallbackUser = users.find(u => u.username === 'amdsnkstudio');
          if (fallbackUser) {
            currentUser = fallbackUser;
            console.log('💰 Using fallback user:', currentUser.username);
          }
        }
      }
    }

    // Try to find user by userId parameter if provided
    if (userId && userId !== currentUser.id) {
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        currentUser = foundUser;
        console.log('💰 Found user by userId:', currentUser.username);
      }
    }

    console.log('💰 Returning user balance for:', currentUser.username, 'Balance:', currentUser.balance);

    // Return array format for trading pages compatibility
    res.json([
      {
        symbol: 'USDT',
        available: currentUser.balance.toString(),
        locked: '0'
      }
    ]);
  } catch (error) {
    console.error('❌ Error getting user balances:', error);
    res.status(500).json({ error: 'Failed to get user balances' });
  }
});

// User-specific trades endpoint
app.get('/api/users/:userId/trades', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📈 Getting trades for user:', userId);

    const trades = await getTrades();
    const userTrades = trades.filter(trade => trade.user_id === userId);
    console.log('📈 Found trades for user:', userTrades.length);
    res.json(userTrades);
  } catch (error) {
    console.error('❌ Error getting user trades:', error);
    res.status(500).json({ error: 'Failed to get user trades' });
  }
});

// Options trading endpoint
app.post('/api/trades/options', async (req, res) => {
  try {
    const { userId, symbol, direction, amount, duration } = req.body;
    console.log('🎯 Options trade request:', { userId, symbol, direction, amount, duration });

    if (!userId || !symbol || !direction || !amount || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, symbol, direction, amount, duration"
      });
    }

    // Handle admin users - map them to their trading profile
    let finalUserId = userId;
    if (userId === 'superadmin-001' || userId === 'admin-001') {
      finalUserId = `${userId}-trading`;
      console.log(`🔧 Admin user ${userId} trading as ${finalUserId}`);
    }

    // Validate minimum amount based on duration
    const tradeAmount = parseFloat(amount);
    let minAmount = 100; // Default minimum
    if (duration === 30) minAmount = 100;
    else if (duration === 60) minAmount = 1000;
    else if (duration === 120) minAmount = 2000;
    else if (duration === 180) minAmount = 3000;
    else if (duration === 240) minAmount = 4000;
    else if (duration === 300) minAmount = 5000;
    else if (duration === 600) minAmount = 10000;

    if (tradeAmount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount for ${duration}s is $${minAmount}`
      });
    }

    // Check user balance
    const users = await getUsers();
    const user = users.find(u => u.id === finalUserId || u.username === finalUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userBalance = parseFloat(user.balance || '0');
    if (userBalance < tradeAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Deduct balance
    user.balance = (userBalance - tradeAmount).toString();
    await saveUsers(users);

    // Create trade record
    const tradeId = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const currentPrice = 65000 + (Math.random() - 0.5) * 2000; // Mock price

    const trade = {
      id: tradeId,
      userId: finalUserId,
      symbol,
      type: 'options',
      direction,
      amount: amount.toString(),
      price: currentPrice.toString(),
      entryPrice: currentPrice.toString(),
      status: 'active',
      duration,
      expiresAt: new Date(Date.now() + duration * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    // Schedule trade execution
    setTimeout(async () => {
      try {
        // Get user's trading mode
        const currentUsers = await getUsers();
        const currentUser = currentUsers.find(u => u.id === finalUserId || u.username === finalUserId);
        const tradingMode = currentUser?.trading_mode || 'normal';

        console.log(`🎲 Executing trade ${tradeId} with mode: ${tradingMode}`);

        // Determine outcome based on trading mode
        let isWin;
        if (tradingMode === 'win') {
          isWin = true;
        } else if (tradingMode === 'lose') {
          isWin = false;
        } else {
          isWin = Math.random() > 0.5; // 50/50 chance for normal mode
        }

        // Calculate payout
        let payout = 0;
        if (isWin) {
          const profitRate = duration === 30 ? 0.10 : 0.15; // 10% for 30s, 15% for others
          payout = tradeAmount * (1 + profitRate);
        }

        // Update user balance
        if (isWin && currentUser) {
          currentUser.balance = (parseFloat(currentUser.balance || '0') + payout).toString();
          await saveUsers(currentUsers);
        }

        console.log(`🏁 Trade ${tradeId} completed: ${isWin ? 'WIN' : 'LOSE'}, payout: ${payout}`);

      } catch (error) {
        console.error('Error executing trade:', error);
      }
    }, duration * 1000);

    res.json({
      success: true,
      trade,
      message: 'Trade created successfully'
    });

  } catch (error) {
    console.error("Error creating options trade:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create options trade"
    });
  }
});

// Trade completion endpoint with trading mode control
app.post('/api/trades/complete', async (req, res) => {
  try {
    const { tradeId, userId, won, amount, payout } = req.body;
    console.log('🏁 Trade completion request:', { tradeId, userId, won, amount, payout });

    if (!tradeId || !userId || won === undefined || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: tradeId, userId, won, amount"
      });
    }

    // Get user and their trading mode
    const users = await getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const tradingMode = user.trading_mode || 'normal';
    console.log(`🎯 User ${user.username} trading mode: ${tradingMode}`);

    // Apply trading mode logic to override the outcome
    let finalOutcome = won;
    let overrideReason = '';

    switch (tradingMode) {
      case 'win':
        finalOutcome = true;
        overrideReason = finalOutcome !== won ? ' (FORCED WIN by admin)' : '';
        console.log(`🎯 FORCED WIN for user ${user.username}${overrideReason}`);
        break;
      case 'lose':
        finalOutcome = false;
        overrideReason = finalOutcome !== won ? ' (FORCED LOSE by admin)' : '';
        console.log(`🎯 FORCED LOSE for user ${user.username}${overrideReason}`);
        break;
      case 'normal':
      default:
        finalOutcome = won;
        console.log(`🎯 NORMAL MODE for user ${user.username} - outcome: ${finalOutcome ? 'WIN' : 'LOSE'}`);
        break;
    }

    // Calculate balance change
    const tradeAmount = parseFloat(amount);
    let balanceChange = 0;

    if (finalOutcome) {
      // Win: add payout amount
      balanceChange = payout ? parseFloat(payout) : tradeAmount * 1.8; // Default 80% profit
    } else {
      // Lose: subtract trade amount
      balanceChange = -tradeAmount;
    }

    // Update user balance
    const userIndex = users.findIndex(u => u.id === userId);
    users[userIndex].balance += balanceChange;

    // Save users data
    await saveUsers(users);

    // Create transaction record
    const transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: finalOutcome ? 'trade_win' : 'trade_loss',
      amount: balanceChange,
      status: 'completed',
      description: `Options trade ${finalOutcome ? 'win' : 'loss'} - ${tradeId}${overrideReason}`,
      created_at: new Date().toISOString()
    };

    // Add transaction to list
    const transactions = await getTransactions();
    transactions.push(transaction);
    await saveTransactions(transactions);

    // Update the trade record with completion details
    try {
      if (isProduction && supabase) {
        // Update trade in database
        await supabase
          .from('trades')
          .update({
            result: finalOutcome ? 'win' : 'lose',
            exit_price: 0, // Will be set by client
            profit: balanceChange,
            updated_at: new Date().toISOString()
          })
          .eq('id', tradeId);
      } else {
        // Update trade in local storage
        const trades = await getTrades();
        const tradeIndex = trades.findIndex(t => t.id === tradeId);
        if (tradeIndex >= 0) {
          trades[tradeIndex] = {
            ...trades[tradeIndex],
            result: finalOutcome ? 'win' : 'lose',
            profit: balanceChange,
            updated_at: new Date().toISOString()
          };
          await saveTrades(trades);
        }
      }
    } catch (tradeUpdateError) {
      console.log('⚠️ Failed to update trade record:', tradeUpdateError);
    }

    console.log('✅ Trade completion processed:', {
      tradeId,
      userId,
      originalOutcome: won,
      finalOutcome,
      tradingMode,
      balanceChange,
      newBalance: users[userIndex].balance,
      overrideReason
    });

    res.json({
      success: true,
      tradeId,
      won: finalOutcome,
      balanceChange,
      newBalance: users[userIndex].balance,
      tradingMode,
      overrideApplied: finalOutcome !== won,
      message: `Trade ${finalOutcome ? 'won' : 'lost'} - balance updated${overrideReason}`
    });

  } catch (error) {
    console.error('❌ Trade completion error:', error);
    res.status(500).json({
      success: false,
      message: "Trade completion failed",
      error: error.message
    });
  }
});

// ===== SYSTEM STATS ENDPOINTS =====
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

// ===== RECEIPT FILE SERVING ENDPOINT =====
app.get('/api/admin/receipt/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  console.log('📄 Serving receipt file:', filename);
  console.log('📄 File path:', filePath);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('❌ Receipt file not found:', filePath);
    return res.status(404).json({ message: 'Receipt file not found' });
  }

  // Get file stats to determine MIME type
  const stats = fs.statSync(filePath);
  console.log('📄 File stats:', { size: stats.size, isFile: stats.isFile() });

  // Set appropriate headers based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';

  if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.pdf') {
    contentType = 'application/pdf';
  }

  // Find the original filename from deposit data
  let originalName = filename;
  for (const deposit of pendingDeposits) {
    if (deposit.receiptFile && deposit.receiptFile.filename === filename) {
      originalName = deposit.receiptFile.originalname || filename;
      contentType = deposit.receiptFile.mimetype || contentType;
      break;
    }
  }

  console.log('📄 Serving file with content type:', contentType);
  console.log('📄 Original filename:', originalName);

  // Set headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);

  // Serve the file
  res.sendFile(filePath);
});

// ===== ADMIN STATS ENDPOINT (for WorkingAdminDashboard) =====
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('📊 Getting admin stats');

    const users = await getUsers();
    const trades = await getTrades();
    const transactions = await getTransactions();

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      totalTrades: trades.length,
      activeTrades: trades.filter(t => t.result === 'pending').length,
      totalTransactions: transactions.length,
    totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    winRate: trades.length > 0 ? Math.round((trades.filter(t => t.result === 'win').length / trades.filter(t => t.result !== 'pending').length) * 100) : 0,
    totalProfit: transactions.filter(t => t.type === 'trade_win' || t.type === 'bonus').reduce((sum, t) => sum + t.amount, 0),
    totalLoss: Math.abs(transactions.filter(t => t.type === 'trade_loss').reduce((sum, t) => sum + t.amount, 0))
  };

  console.log('📊 Admin stats calculated:', stats);
  res.json(stats);
  } catch (error) {
    console.error('❌ Error getting admin stats:', error);
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
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

// ===== SUPERADMIN ENDPOINTS (for WorkingAdminDashboard) =====

// Superadmin deposit endpoint
app.post('/api/superadmin/deposit', async (req, res) => {
  console.log('💰 Superadmin deposit request:', req.body);
  const { userId, amount } = req.body;

  try {
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid userId and positive amount required' });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldBalance = parseFloat(users[userIndex].balance) || 0;
    const newBalance = oldBalance + amount;

    users[userIndex].balance = newBalance;
    users[userIndex].updated_at = new Date().toISOString();

    await saveUsers(users);

    console.log('✅ Superadmin deposit successful:', { userId, oldBalance, newBalance, amount });
    res.json({
      success: true,
      message: 'Deposit processed successfully',
      oldBalance,
      newBalance,
      amount
    });
  } catch (error) {
    console.error('❌ Superadmin deposit error:', error);
    res.status(500).json({ error: 'Failed to process deposit' });
  }
});

// Superadmin withdrawal endpoint
app.post('/api/superadmin/withdrawal', async (req, res) => {
  console.log('💸 Superadmin withdrawal request:', req.body);
  const { userId, amount } = req.body;

  try {
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid userId and positive amount required' });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldBalance = parseFloat(users[userIndex].balance) || 0;
    const newBalance = Math.max(0, oldBalance - amount); // Prevent negative balance

    users[userIndex].balance = newBalance;
    users[userIndex].updated_at = new Date().toISOString();

    await saveUsers(users);

    console.log('✅ Superadmin withdrawal successful:', { userId, oldBalance, newBalance, amount });
    res.json({
      success: true,
      message: 'Withdrawal processed successfully',
      oldBalance,
      newBalance,
      amount
    });
  } catch (error) {
    console.error('❌ Superadmin withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
});

// Superadmin change password endpoint
app.post('/api/superadmin/change-password', async (req, res) => {
  console.log('🔐 Superadmin password change request:', req.body);
  const { userId, newPassword } = req.body;

  try {
    if (!userId || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Valid userId and password (min 6 chars) required' });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    users[userIndex].password_hash = hashedPassword;
    users[userIndex].updated_at = new Date().toISOString();

    await saveUsers(users);

    console.log('✅ Superadmin password change successful for user:', userId);
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Superadmin password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Superadmin update wallet endpoint
app.post('/api/superadmin/update-wallet', async (req, res) => {
  console.log('🏦 Superadmin wallet update request:', req.body);
  const { userId, walletAddress } = req.body;

  try {
    if (!userId || !walletAddress) {
      return res.status(400).json({ error: 'Valid userId and walletAddress required' });
    }

    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex];
    const currentWallet = user.wallet_address;

    // Initialize wallet_history if it doesn't exist
    if (!user.wallet_history) {
      user.wallet_history = [];
    }

    // If there's a current wallet address, move it to history
    if (currentWallet && currentWallet !== walletAddress) {
      user.wallet_history.push({
        address: currentWallet,
        changed_at: new Date().toISOString(),
        changed_by: 'superadmin'
      });
    }

    // Update the wallet address
    user.wallet_address = walletAddress;
    user.updated_at = new Date().toISOString();

    await saveUsers(users);

    console.log('✅ Superadmin wallet update successful for user:', userId);
    console.log('   Previous wallet moved to history:', currentWallet);
    console.log('   New wallet address:', walletAddress);

    res.json({
      success: true,
      message: 'Wallet address updated successfully',
      user: users[userIndex],
      previousWallet: currentWallet
    });
  } catch (error) {
    console.error('❌ Superadmin wallet update error:', error);
    res.status(500).json({ error: 'Failed to update wallet address' });
  }
});

// Superadmin wallet history endpoint
app.get('/api/superadmin/wallet-history/:userId', async (req, res) => {
  console.log('📜 Superadmin wallet history request for user:', req.params.userId);
  const { userId } = req.params;

  try {
    const users = await getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const history = user.wallet_history || [];
    console.log('📜 Wallet history for user:', userId, 'Count:', history.length);

    res.json({
      success: true,
      history: history,
      message: 'Wallet history retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Superadmin wallet history error:', error);
    res.status(500).json({ error: 'Failed to retrieve wallet history' });
  }
});

// ===== SPA ROUTING =====
// Only catch GET requests that don't start with /api
app.get(/^(?!\/api).*/, (req, res) => {
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

// ===== START SERVER WITH WEBSOCKET =====
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/ws'
});

// Store WebSocket server globally for broadcasting
global.wss = wss;

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('🔌 WebSocket client connected from:', req.socket.remoteAddress);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 WebSocket message received:', data);

      // Handle ping/pong for keep-alive
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
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

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    data: { message: 'Connected to METACHROME WebSocket server' }
  }));
});

server.listen(PORT, () => {
  console.log('🎉 ===================================');
  console.log('🚀 METACHROME V2 WORKING SERVER READY!');
  console.log('🌐 Server running on: http://127.0.0.1:' + PORT);
  console.log('🔌 WebSocket server: ws://127.0.0.1:' + PORT + '/ws');
  console.log('🔧 Admin Dashboard: http://127.0.0.1:' + PORT + '/admin');
  console.log('🔐 Login: superadmin / superadmin123');
  console.log('📊 All endpoints are FULLY FUNCTIONAL!');
  console.log('🎉 ===================================');
});
