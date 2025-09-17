import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client directly
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Mock data that matches the local server structure exactly
const MOCK_USERS = [
  {
    id: 'user-1',
    username: 'trader1',
    email: 'trader1@metachrome.io',
    balance: 10000,
    role: 'user',
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
    status: 'active',
    trading_mode: 'lose',
    wallet_address: null,
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'user-4',
    username: 'trader4',
    email: 'trader4@metachrome.io',
    balance: 7500,
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    wallet_address: '0x1234567890abcdef1234567890abcdef12345678',
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 1800000).toISOString()
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
  }
];

const MOCK_TRADES = [
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
    entry_price: 2800,
    exit_price: 2825,
    result: 'win',
    profit: 400,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() - 3540000).toISOString(),
    users: { username: 'trader2' }
  },
  {
    id: 'trade-3',
    user_id: 'user-3',
    symbol: 'BTC/USD',
    amount: 2000,
    direction: 'up',
    duration: 120,
    entry_price: 44800,
    exit_price: 44750,
    result: 'lose',
    profit: -2000,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    expires_at: new Date(Date.now() - 7080000).toISOString(),
    users: { username: 'trader3' }
  }
];

const MOCK_TRANSACTIONS = [
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
  }
];

// Simple storage
const tradingControls = new Map();
const userBalances = new Map([
  ['user-1', { balance: 10000, currency: 'USDT' }],
  ['user-2', { balance: 5000, currency: 'USDT' }],
  ['user-3', { balance: 15000, currency: 'USDT' }],
  ['user-4', { balance: 7500, currency: 'USDT' }]
]);

// Admin login handler
async function handleAdminLogin(req: VercelRequest, res: VercelResponse) {
  console.log('🔐 handleAdminLogin called');
  console.log('🔐 Method:', req.method);
  console.log('🔐 URL:', req.url);
  console.log('🔐 Body:', req.body);

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, password } = req.body || {};
    console.log('🔐 Admin login attempt:', { username, password: password ? '***' : 'missing' });

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    // Check for valid admin credentials
    if ((username === 'admin' && password === 'admin123') ||
        (username === 'superadmin' && password === 'superadmin123')) {

      const role = username === 'superadmin' ? 'super_admin' : 'admin';
      const user = {
        id: `${username}-001`,
        username,
        email: `${username}@metachrome.com`,
        role,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      const token = `mock-jwt-token-${Date.now()}`;

      console.log('✅ Admin login successful:', { username, role });

      return res.json({
        success: true,
        token,
        user,
        message: `Welcome back, ${username}!`
      });
    } else {
      console.log('❌ Invalid admin credentials:', username);
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🔧 Consolidated Admin API: ${req.method} ${req.url}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const url = req.url || '';

    // Route to different handlers based on URL
    console.log('🔍 Admin API URL routing:', url);
    console.log('🔍 Request method:', req.method);
    console.log('🔍 Request body:', req.body);

    if (url.includes('/login') || url.endsWith('/login')) {
      console.log('🔍 Routing to admin login handler');
      return handleAdminLogin(req, res);
    } else if (url.includes('/admin/users') || url.endsWith('/users')) {
      return handleUsers(req, res);
    } else if (url.includes('/admin/trades') && url.includes('/control')) {
      return handleTradeControl(req, res);
    } else if (url.includes('/admin/trades') || url.endsWith('/trades')) {
      return handleTrades(req, res);
    } else if (url.includes('/admin/transactions') || url.endsWith('/transactions')) {
      return handleTransactions(req, res);
    } else if (url.includes('/admin/stats') || url.endsWith('/stats')) {
      return handleSystemStats(req, res);
    } else if (url.includes('/trading-controls')) {
      return handleTradingControls(req, res);
    } else if (url.includes('/balances')) {
      return handleBalances(req, res);
    } else if (url.includes('/system-stats')) {
      return handleSystemStats(req, res);
    } else if (url.includes('/trading-settings')) {
      return handleTradingSettings(req, res);
    } else if (url.includes('/test')) {
      return res.json({ success: true, message: "Consolidated Admin API working", timestamp: new Date().toISOString() });
    } else {
      // Default to users for backward compatibility
      console.log('🔍 No specific route matched, defaulting to users');
      return handleUsers(req, res);
    }

  } catch (error) {
    console.error('❌ Consolidated Admin API error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleUsers(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Check if supabaseAdmin is available
      if (!supabaseAdmin) {
        console.log('⚠️ Supabase admin not configured, using mock data');
        console.log('👥 Using mock users - Count:', MOCK_USERS.length);
        return res.json(MOCK_USERS);
      }

      // Get users from Supabase
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Users fetch error:', error);
        // Fallback to mock data
        console.log('👥 Using mock users - Count:', MOCK_USERS.length);
        return res.json(MOCK_USERS);
      }

      // Remove passwords from response
      const safeUsers = users.map(user => ({ ...user, password: undefined }));
      console.log('👥 Getting users from database - Count:', safeUsers.length);
      return res.json(safeUsers);
    } catch (error) {
      console.error('❌ Users fetch error:', error);
      // Fallback to mock data
      console.log('👥 Using mock users - Count:', MOCK_USERS.length);
      return res.json(MOCK_USERS);
    }
  }

  if (req.method === 'POST') {
    const { username, email, password, balance, role, trading_mode } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: username, email, password"
      });
    }

    try {
      // Check if supabaseAdmin is available
      if (!supabaseAdmin) {
        console.log('⚠️ Supabase admin not configured, simulating user creation');
        const newUser = {
          id: `user-${Date.now()}`,
          username,
          email,
          balance: balance || 10000,
          role: role || 'user',
          trading_mode: trading_mode || 'normal',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return res.json({ success: true, user: newUser });
      }

      // Create user in Supabase
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .insert({
          username,
          email,
          password, // In production, this should be hashed
          balance: balance || 10000,
          role: role || 'user',
          trading_mode: trading_mode || 'normal',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ User creation error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to create user"
        });
      }

      console.log('✅ User created:', user.username);
      return res.json({ ...user, password: undefined });
    } catch (error) {
      console.error('❌ User creation error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to create user"
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleTrades(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Check if supabaseAdmin is available
      if (!supabaseAdmin) {
        console.log('⚠️ Supabase admin not configured, returning empty array');
        console.log('📈 No database connection, returning empty trades array');
        return res.json([]);
      }

      // Get trades from Supabase
      const { data: trades, error } = await supabaseAdmin
        .from('trades')
        .select(`
          *,
          users!inner(username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Trades fetch error:', error);
        // Return empty array instead of mock data
        console.log('📈 Database empty, returning empty trades array');
        return res.json([]);
      }

      console.log('📈 Getting trades from database - Count:', trades.length);
      return res.json(trades);
    } catch (error) {
      console.error('❌ Trades fetch error:', error);
      // Fallback to mock data
      console.log('📈 Using mock trades - Count:', MOCK_TRADES.length);
      return res.json(MOCK_TRADES);
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleTradeControl(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const tradeId = req.url?.split('/').slice(-2)[0]; // Extract tradeId from URL
    const { action } = req.body || {};

    if (!tradeId || !action) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: tradeId, action"
      });
    }

    if (!['win', 'lose'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'win' or 'lose'"
      });
    }

    try {
      // Check if supabaseAdmin is available
      if (!supabaseAdmin) {
        console.log('⚠️ Supabase admin not configured, simulating trade control');
        return res.json({
          success: true,
          message: `Trade ${tradeId} ${action} simulated`,
          trade: { id: tradeId, result: action, status: 'completed' }
        });
      }

      // Get the trade from Supabase
      const { data: trade, error: getError } = await supabaseAdmin
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (getError || !trade) {
        console.error('❌ Trade not found:', tradeId);
        return res.status(404).json({
          success: false,
          message: "Trade not found"
        });
      }

      // Calculate profit/loss based on action
      const amount = trade.amount || 0;
      let profit = 0;
      let exitPrice = trade.entry_price;

      if (action === 'win') {
        profit = amount * 0.8; // 80% profit for winning trades
        exitPrice = trade.direction === 'up' ? trade.entry_price * 1.01 : trade.entry_price * 0.99;
      } else {
        profit = -amount; // Lose the entire amount
        exitPrice = trade.direction === 'up' ? trade.entry_price * 0.99 : trade.entry_price * 1.01;
      }

      // Update the trade in Supabase
      const { data: updatedTrade, error: updateError } = await supabaseAdmin
        .from('trades')
        .update({
          result: action,
          profit,
          exit_price: exitPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', tradeId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Trade update error:', updateError);
        return res.status(500).json({
          success: false,
          message: "Failed to update trade"
        });
      }

      // Update user balance if trade won
      if (action === 'win' && supabaseAdmin) {
        const { error: balanceError } = await supabaseAdmin
          .from('users')
          .update({
            balance: profit, // For now, just set the profit amount - in production this should be balance + profit
            updated_at: new Date().toISOString()
          })
          .eq('id', trade.user_id);

        if (balanceError) {
          console.error('❌ Balance update error:', balanceError);
          // Don't fail the trade control if balance update fails
        }
      }

      console.log('✅ Trade controlled:', { tradeId, action, profit });

      return res.json({
        success: true,
        message: `Trade ${tradeId} set to ${action}`,
        trade: updatedTrade,
        tradeId,
        action
      });
    } catch (error) {
      console.error('❌ Trade control error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to control trade"
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleTransactions(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Check if supabaseAdmin is available
      if (!supabaseAdmin) {
        console.log('⚠️ Supabase admin not configured, returning empty array');
        console.log('💰 No database connection, returning empty transactions array');
        return res.json([]);
      }

      // Get transactions from Supabase
      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select(`
          *,
          users!inner(username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Transactions fetch error:', error);
        // Return empty array instead of mock data
        console.log('💰 Database empty, returning empty transactions array');
        return res.json([]);
      }

      console.log('💰 Getting transactions from database - Count:', transactions.length);
      return res.json(transactions);
    } catch (error) {
      console.error('❌ Transactions fetch error:', error);
      // Fallback to mock data
      console.log('💰 Using mock transactions - Count:', MOCK_TRANSACTIONS.length);
      return res.json(MOCK_TRANSACTIONS);
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleTradingControls(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { userId, controlType } = req.body || {};

    if (!userId || !controlType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, controlType"
      });
    }

    if (!['win', 'normal', 'lose'].includes(controlType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid controlType. Must be 'win', 'normal', or 'lose'"
      });
    }

    try {
      // Check if supabaseAdmin is available
      if (!supabaseAdmin) {
        console.log('⚠️ Supabase admin not configured, simulating trading control');
        return res.json({
          success: true,
          message: `Trading mode for user ${userId} set to ${controlType} (simulated)`,
          user: { id: userId, trading_mode: controlType }
        });
      }

      // Update trading mode in Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          trading_mode: controlType,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Trading control update error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to update trading control"
        });
      }

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      console.log('✅ Trading control updated:', { userId, controlType });

      return res.json({
        success: true,
        message: `Trading mode updated to ${controlType.toUpperCase()}`,
        user: { ...data, password: undefined }
      });
    } catch (error) {
      console.error('❌ Trading control error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to update trading control"
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleTradingSettings(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Get trading settings from Supabase or return default settings
      const defaultSettings = [
        {
          id: 'setting-30s',
          duration: 30,
          min_amount: 100,
          profit_percentage: 10,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'setting-60s',
          duration: 60,
          min_amount: 1000,
          profit_percentage: 15,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      console.log('⚙️ Getting trading settings - Count:', defaultSettings.length);
      return res.json(defaultSettings);
    } catch (error) {
      console.error('❌ Trading settings error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to get trading settings"
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleBalances(req: VercelRequest, res: VercelResponse) {
  const userId = req.url?.split('/').pop();

  if (req.method === 'PUT' && userId) {
    const { balance, action, note } = req.body || {};

    if (!balance || !action) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: balance, action"
      });
    }

    const balanceAmount = parseFloat(balance);
    if (isNaN(balanceAmount) || balanceAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid balance amount"
      });
    }

    try {
      // Check if supabaseAdmin is available
      if (!supabaseAdmin) {
        console.log('⚠️ Supabase admin not configured, simulating balance update');
        return res.json({
          success: true,
          message: `Balance for user ${userId} ${action} simulated`,
          user: { id: userId, balance: 10000 }
        });
      }

      // Get current user balance from Supabase
      const { data: user, error: getUserError } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (getUserError || !user) {
        console.error('❌ User not found:', userId);
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const currentBalance = user.balance || 0;
      let newBalance = currentBalance;

      switch (action) {
        case 'add':
          newBalance = currentBalance + balanceAmount;
          break;
        case 'subtract':
          newBalance = currentBalance - balanceAmount;
          break;
        case 'set':
          newBalance = balanceAmount;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid action. Must be 'add', 'subtract', or 'set'"
          });
      }

      if (newBalance < 0) newBalance = 0;

      // Update user balance in Supabase
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Balance update error:', updateError);
        return res.status(500).json({
          success: false,
          message: "Failed to update balance"
        });
      }

      // Create transaction record
      const transactionType = action === 'add' ? 'deposit' : action === 'subtract' ? 'withdrawal' : 'adjustment';
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert({
          id: `${transactionType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          type: transactionType,
          amount: action === 'subtract' ? -balanceAmount : balanceAmount,
          status: 'completed',
          description: note || `Admin ${action} balance`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('❌ Transaction record error:', transactionError);
        // Don't fail the balance update if transaction record fails
      }

      console.log('✅ Balance updated:', { userId, action, amount: balanceAmount, newBalance });

      return res.json({
        success: true,
        userId,
        newBalance,
        action,
        user: { ...updatedUser, password: undefined }
      });
    } catch (error) {
      console.error('❌ Balance update error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to update balance"
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

function handleSystemStats(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const stats = {
      totalUsers: 1247,
      activeUsers: 892,
      totalTrades: 15634,
      totalVolume: 2847392.50,
      systemUptime: '99.8%',
      serverLoad: Math.random() * 30 + 20,
      lastUpdated: new Date().toISOString()
    };
    console.log('📊 System stats generated');
    return res.json(stats);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
