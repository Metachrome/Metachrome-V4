import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin } from '../lib/supabase';

// Mock user balances for fallback
const userBalances = new Map([
  ['user-1', { balance: 10000, currency: 'USDT' }],
  ['user-2', { balance: 5000, currency: 'USDT' }],
  ['user-3', { balance: 15000, currency: 'USDT' }],
  ['user-4', { balance: 7500, currency: 'USDT' }],
  ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
]);

// Mock wallet history for fallback
const walletHistory = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🔧 SuperAdmin API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const url = req.url || '';
    
    // Route to different handlers based on URL
    if (url.includes('/deposit')) {
      return handleDeposit(req, res);
    } else if (url.includes('/withdrawal')) {
      return handleWithdrawal(req, res);
    } else if (url.includes('/change-password')) {
      return handleChangePassword(req, res);
    } else if (url.includes('/update-wallet')) {
      return handleUpdateWallet(req, res);
    } else if (url.includes('/wallet-history')) {
      return handleWalletHistory(req, res);
    } else if (url.includes('/system-stats')) {
      return handleSystemStats(req, res);
    } else if (url.includes('/test-connection')) {
      return handleTestConnection(req, res);
    } else if (url.includes('/test-database')) {
      return handleTestDatabase(req, res);
    } else if (url.includes('/health-check')) {
      return handleHealthCheck(req, res);
    } else if (url.includes('/test')) {
      return res.json({ success: true, message: "SuperAdmin API working", timestamp: new Date().toISOString() });
    }

    return res.status(404).json({
      success: false,
      message: "SuperAdmin endpoint not found"
    });

  } catch (error) {
    console.error('❌ SuperAdmin API error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleDeposit(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { userId, amount, note } = req.body || {};

    console.log('💰 Deposit request received:', { userId, amount, note });

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, amount"
      });
    }

    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    try {
      // Check if Supabase is available
      if (!supabaseAdmin) {
        console.error('❌ Supabase admin client not available');
        return res.status(500).json({
          success: false,
          message: "Database connection not available"
        });
      }

      // Get current user balance from Supabase
      const { data: user, error: getUserError } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (getUserError || !user) {
        console.error('❌ User not found:', userId, getUserError);
        return res.status(404).json({
          success: false,
          message: "User not found",
          error: getUserError?.message
        });
      }

      const currentBalance = user.balance || 0;
      const newBalance = currentBalance + depositAmount;

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
      const { error: transactionError } = await supabaseAdmin
        .from('transactions')
        .insert({
          id: `deposit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          type: 'deposit',
          amount: depositAmount,
          status: 'completed',
          description: note || 'Admin deposit',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('❌ Transaction record error:', transactionError);
        // Don't fail the deposit if transaction record fails
      }

      console.log('✅ Deposit processed:', { userId, amount: depositAmount, newBalance });

      return res.json({
        success: true,
        message: `Successfully deposited ${depositAmount} USDT`,
        newBalance,
        user: { ...updatedUser, password: undefined }
      });
    } catch (error) {
      console.error('❌ Deposit error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to process deposit"
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

function handleWithdrawal(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { userId, amount, note } = req.body || {};
    
    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, amount"
      });
    }

    const currentBalance = userBalances.get(userId) || { balance: 0, currency: 'USDT' };
    const withdrawalAmount = parseFloat(amount);
    
    if (currentBalance.balance < withdrawalAmount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance for withdrawal"
      });
    }

    currentBalance.balance -= withdrawalAmount;
    userBalances.set(userId, currentBalance);

    // Add to wallet history
    const history = walletHistory.get(userId) || [];
    history.push({
      id: `withdrawal-${Date.now()}`,
      type: 'withdrawal',
      amount: withdrawalAmount,
      note: note || 'Admin withdrawal',
      timestamp: new Date().toISOString(),
      admin: 'superadmin'
    });
    walletHistory.set(userId, history);

    console.log('✅ Withdrawal processed:', { userId, amount: withdrawalAmount, newBalance: currentBalance.balance });
    
    return res.json({
      success: true,
      message: `Successfully withdrew ${withdrawalAmount} USDT`,
      newBalance: currentBalance.balance
    });
  }
  
  return res.status(405).json({ message: "Method not allowed" });
}

function handleWalletHistory(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const userId = req.url?.split('/').pop();
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID required"
      });
    }

    const history = walletHistory.get(userId) || [];
    console.log('📊 Getting wallet history for user:', userId, 'Count:', history.length);
    
    return res.json({
      success: true,
      history: history.reverse() // Most recent first
    });
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
      totalDeposits: 1234567.89,
      totalWithdrawals: 987654.32,
      systemUptime: '99.8%',
      serverLoad: Math.random() * 30 + 20,
      activeConnections: Math.floor(Math.random() * 500) + 100,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 SuperAdmin system stats generated');
    return res.json(stats);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleChangePassword(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { userId, newPassword } = req.body || {};

    console.log('🔑 Change password request received:', { userId, hasPassword: !!newPassword });

    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, newPassword"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    try {
      // Check if Supabase is available
      if (!supabaseAdmin) {
        console.error('❌ Supabase admin client not available');
        return res.status(500).json({
          success: false,
          message: "Database connection not available"
        });
      }

      // Update password in Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Password update error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to update password",
          error: error.message
        });
      }

      if (!data) {
        console.error('❌ No user found with ID:', userId);
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      console.log('✅ Password updated for user:', userId);

      return res.json({
        success: true,
        message: "Password updated successfully",
        user: { ...data, password: undefined }
      });
    } catch (error) {
      console.error('❌ Password update error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to update password",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleUpdateWallet(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { userId, walletAddress } = req.body || {};

    console.log('🏦 Update wallet request received:', { userId, walletAddress });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: userId"
      });
    }

    try {
      // Check if Supabase is available
      if (!supabaseAdmin) {
        console.error('❌ Supabase admin client not available');
        return res.status(500).json({
          success: false,
          message: "Database connection not available"
        });
      }

      // Update wallet address in Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          wallet_address: walletAddress || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Wallet update error:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to update wallet address",
          error: error.message
        });
      }

      if (!data) {
        console.error('❌ No user found with ID:', userId);
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      console.log('✅ Wallet address updated for user:', userId, 'Address:', walletAddress || 'removed');

      return res.json({
        success: true,
        message: "Wallet address updated successfully",
        user: { ...data, password: undefined }
      });
    } catch (error) {
      console.error('❌ Wallet update error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to update wallet address",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

function handleTestConnection(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const testData = {
      success: true,
      message: "API connection working",
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY
      }
    };

    console.log('✅ Test connection successful:', testData);
    return res.json(testData);
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleTestDatabase(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      // Test database connection by trying to query users table
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, username, email, balance, trading_mode')
        .limit(5);

      const { data: trades, error: tradesError } = await supabaseAdmin
        .from('trades')
        .select('id, user_id, symbol, amount, result')
        .limit(5);

      const { data: transactions, error: transactionsError } = await supabaseAdmin
        .from('transactions')
        .select('id, user_id, type, amount, status')
        .limit(5);

      const testResult = {
        success: true,
        message: "Database connection test completed",
        timestamp: new Date().toISOString(),
        tables: {
          users: {
            accessible: !usersError,
            count: users?.length || 0,
            error: usersError?.message || null,
            sample: users?.slice(0, 2) || []
          },
          trades: {
            accessible: !tradesError,
            count: trades?.length || 0,
            error: tradesError?.message || null,
            sample: trades?.slice(0, 2) || []
          },
          transactions: {
            accessible: !transactionsError,
            count: transactions?.length || 0,
            error: transactionsError?.message || null,
            sample: transactions?.slice(0, 2) || []
          }
        }
      };

      console.log('✅ Database test completed:', testResult);
      return res.json(testResult);

    } catch (error) {
      console.error('❌ Database test error:', error);
      return res.status(500).json({
        success: false,
        message: "Database test failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

function handleHealthCheck(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const healthData = {
      success: true,
      message: "Health check completed",
      timestamp: new Date().toISOString(),
      server: {
        environment: process.env.NODE_ENV || 'unknown',
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || 'unknown'
      },
      database: {
        hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasSupabaseKey: !!(process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY
      },
      endpoints: {
        superadmin: [
          '/api/superadmin/deposit',
          '/api/superadmin/change-password',
          '/api/superadmin/update-wallet',
          '/api/superadmin/system-stats'
        ],
        admin: [
          '/api/admin/trading-controls',
          '/api/admin/balances',
          '/api/admin/trades',
          '/api/admin/users'
        ]
      }
    };

    console.log('✅ Health check completed');
    return res.json(healthData);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
