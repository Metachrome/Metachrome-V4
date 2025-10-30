import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client directly
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// User management functions
async function getUsers() {
  try {
    const usersPath = path.join(process.cwd(), 'users.json');
    if (fs.existsSync(usersPath)) {
      const data = fs.readFileSync(usersPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('⚠️ Could not read users.json, using fallback data');
  }

  // Fallback users
  return [
    { id: 'user-1', username: 'demo-user', balance: '10000', role: 'user' },
    { id: 'demo-user-1', username: 'demo-user-1', balance: '10000', role: 'user' },
    { id: 'superadmin-001', username: 'superadmin', balance: '1000000', role: 'super_admin' }
  ];
}

async function saveUsers(users: any[]) {
  try {
    const usersPath = path.join(process.cwd(), 'users.json');
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    console.log('✅ Users saved to users.json');
  } catch (error) {
    console.error('❌ Failed to save users:', error);
  }
}

// Mock trades storage
const trades = new Map();

// Export trades for use in other modules
export { trades };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📈 Trading API: ${req.method} ${req.url}`);

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

    // Handle different trading endpoints
    if (url.includes('/spot')) {
      return handleSpotTrading(req, res);
    } else if (url.includes('/options')) {
      return handleOptionsTrading(req, res);
    } else if (url.includes('/complete')) {
      return handleTradeCompletion(req, res);
    } else if (req.method === 'GET') {
      // Get user trades
      return handleGetTrades(req, res);
    }

    return res.status(404).json({
      success: false,
      message: "Trading endpoint not found"
    });

  } catch (error) {
    console.error('❌ Trading API error:', error);
    return res.status(500).json({
      success: false,
      message: "Trading error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleSpotTrading(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { symbol, side, amount, price, userId } = req.body || {};

      console.log('📈 Spot trade request:', { symbol, side, amount, price, userId });

      if (!symbol || !side || !amount || !userId) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: symbol, side, amount, userId"
        });
      }

      // Get users and find the user
      const users = await getUsers();
      const user = users.find(u => u.id === userId || u.username === userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const tradeAmount = parseFloat(amount);
      const userBalance = parseFloat(user.balance || '0');

      if (userBalance < tradeAmount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance"
        });
      }

      // Create trade
      const trade = {
        id: `trade-${Date.now()}`,
        userId: userId,
        symbol,
        side,
        amount: tradeAmount,
        price: parseFloat(price) || 0,
        type: 'spot',
        status: 'completed',
        profit_loss: (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 100).toFixed(2),
        created_at: new Date().toISOString()
      };

      trades.set(trade.id, trade);

      // Update balance
      if (side === 'buy') {
        user.balance = (userBalance - tradeAmount).toString();
      } else {
        user.balance = (userBalance + tradeAmount).toString();
      }
      await saveUsers(users);

      console.log('✅ Spot trade executed:', trade);
      return res.json({
        success: true,
        trade,
        message: "Spot trade executed successfully"
      });
    } catch (error) {
      console.error('❌ Spot trading error:', error);
      return res.status(500).json({
        success: false,
        message: "Spot trading failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleOptionsTrading(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { symbol, side, direction, amount, duration, userId } = req.body || {};

      // Accept either 'side' or 'direction' for compatibility
      const tradeDirection = side || direction;

      console.log('📈 Options trade request:', { symbol, side, direction, tradeDirection, amount, duration, userId });

      // Validate required fields
      if (!symbol || !tradeDirection || !amount || !duration || !userId) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: symbol, direction/side, amount, duration, userId"
        });
      }

      // Validate trade direction
      if (!['up', 'down'].includes(tradeDirection)) {
        return res.status(400).json({
          success: false,
          message: "Direction must be 'up' or 'down'"
        });
      }

      // Validate amount
      const tradeAmount = parseFloat(amount);
      if (isNaN(tradeAmount) || tradeAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid trade amount"
        });
      }

      // Validate duration
      const tradeDuration = parseInt(duration);
      if (isNaN(tradeDuration) || tradeDuration < 30) {
        return res.status(400).json({
          success: false,
          message: "Duration must be at least 30 seconds"
        });
      }

      // Check minimum amounts based on duration
      let minAmount = 100; // Default minimum
      if (tradeDuration === 30) minAmount = 100;
      else if (tradeDuration === 60) minAmount = 1000;
      else if (tradeDuration === 120) minAmount = 2000;
      else if (tradeDuration === 180) minAmount = 3000;
      else if (tradeDuration === 240) minAmount = 4000;
      else if (tradeDuration === 300) minAmount = 5000;
      else if (tradeDuration === 600) minAmount = 10000;

      if (tradeAmount < minAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum amount for ${tradeDuration}s is $${minAmount}`
        });
      }

      // Get users and find the actual user
      const users = await getUsers();
      let finalUserId = userId;

      // Handle admin users - find the actual admin user in database
      let adminUser = users.find(u => u.id === userId);
      if (!adminUser) {
        adminUser = users.find(u => u.username === userId);
      }

      // If user has admin role, use their actual ID for trading
      if (adminUser && (adminUser.role === 'super_admin' || adminUser.role === 'admin')) {
        finalUserId = adminUser.id;
        console.log(`🔧 Admin user ${userId} (${adminUser.username}) trading with ID: ${finalUserId}`);
      } else if (userId === 'superadmin-001' || userId === 'admin-001') {
        // Legacy support - try to find by username
        const legacyAdmin = users.find(u => u.username === 'superadmin' || u.username === 'admin');
        if (legacyAdmin) {
          finalUserId = legacyAdmin.id;
          console.log(`🔧 Legacy admin user ${userId} mapped to ${legacyAdmin.username} with ID: ${finalUserId}`);
        }
      }

      // Find the user for balance check
      const user = users.find(u => u.id === finalUserId || u.username === finalUserId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check user balance
      const userBalance = parseFloat(user.balance || '0');
      if (userBalance < tradeAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Required: ${tradeAmount} USDT, Available: ${userBalance} USDT`
        });
      }

      // Deduct balance immediately
      user.balance = (userBalance - tradeAmount).toString();
      await saveUsers(users);
      console.log(`💰 IMMEDIATE DEDUCTION: ${user.username} balance: ${userBalance} → ${user.balance}`);

      // Get current market price (mock for now)
      const currentPrice = 65000 + (Math.random() - 0.5) * 2000;

      // Create trade record
      const tradeId = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const trade = {
        id: tradeId,
        userId: finalUserId,
        username: user.username,
        symbol,
        direction: tradeDirection,
        side: tradeDirection === 'up' ? 'call' : 'put',
        amount: tradeAmount,
        duration: tradeDuration,
        type: 'options',
        status: 'active',
        entry_price: currentPrice,
        target_price: null,
        profit_loss: '0.00',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + tradeDuration * 1000).toISOString()
      };

      // Store trade
      trades.set(trade.id, trade);

      console.log('✅ Options trade created:', {
        tradeId: trade.id,
        userId: finalUserId,
        username: user.username,
        amount: tradeAmount,
        newBalance: user.balance
      });

      // Try to save to database
      try {
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('trades')
            .insert({
              id: trade.id,
              user_id: finalUserId,
              symbol: trade.symbol,
              amount: trade.amount,
              direction: trade.direction,
              duration: trade.duration,
              entry_price: trade.entry_price,
              status: 'active',
              created_at: trade.created_at,
              expires_at: trade.expires_at
            });

          // Update user balance in database
          await supabaseAdmin
            .from('users')
            .update({
              balance: user.balance,
              updated_at: new Date().toISOString()
            })
            .eq('id', finalUserId);

          console.log('✅ Trade and balance saved to database');
        }
      } catch (dbError) {
        console.log('⚠️ Database save failed, continuing with in-memory state:', dbError);
      }

      // Simulate trade completion after duration
      setTimeout(async () => {
        await completeOptionsTrade(trade.id, finalUserId, user.username);
      }, Math.min(tradeDuration * 1000, 30000)); // Max 30 seconds for demo

      return res.json({
        success: true,
        trade,
        message: "Options trade created successfully"
      });

    } catch (error) {
      console.error('❌ Options trading error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to create options trade",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleTradeCompletion(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { tradeId, userId, won, amount, payout } = req.body || {};

      console.log('🏁 Trade completion request:', { tradeId, userId, won, amount, payout });

      if (!tradeId || !userId || won === undefined || !amount) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: tradeId, userId, won, amount"
        });
      }

      // Get users and find the user
      const users = await getUsers();
      const user = users.find(u => u.id === userId || u.username === userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const tradeAmount = parseFloat(amount);
      let balanceChange = 0;

      if (won) {
        // Calculate profit based on payout or default percentage
        const profitAmount = payout ? parseFloat(payout) : tradeAmount * 0.8; // 80% profit default
        balanceChange = profitAmount;
        const currentBalance = parseFloat(user.balance);
        user.balance = (currentBalance + profitAmount).toString();
        await saveUsers(users);
        console.log(`💰 Trade WON: +${profitAmount} USDT, New balance: ${user.balance}`);
      } else {
        // Trade lost - amount was already deducted when trade was placed
        console.log(`💸 Trade LOST: -${tradeAmount} USDT (already deducted)`);
      }

      console.log('✅ Trade completion processed:', {
        tradeId,
        userId,
        won,
        balanceChange,
        newBalance: user.balance
      });

      return res.json({
        success: true,
        tradeId,
        won,
        balanceChange,
        newBalance: parseFloat(user.balance),
        message: `Trade ${won ? 'won' : 'lost'} - balance updated`
      });

    } catch (error) {
      console.error('❌ Trade completion error:', error);
      return res.status(500).json({
        success: false,
        message: "Trade completion failed",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function completeOptionsTrade(tradeId: string, userId: string, username?: string) {
  try {
    const trade = trades.get(tradeId);
    if (!trade || trade.status !== 'active') {
      console.log('⚠️ Trade not found or already completed:', tradeId);
      return;
    }

    // Get users to find trading mode
    const users = await getUsers();
    const user = users.find(u => u.id === userId || u.username === userId);
    if (!user) {
      console.log('⚠️ User not found for trade completion:', userId);
      return;
    }

    // Get user's trading mode
    let tradingMode = user.trading_mode || 'normal';

    // Also try to import from trading controls for real-time updates
    try {
      const tradingControlsModule = require('./admin/trading-controls');
      const userTradingModes = tradingControlsModule.userTradingModes;
      if (userTradingModes && userTradingModes.has(userId)) {
        tradingMode = userTradingModes.get(userId);
        console.log('🎯 Trading mode from controls:', tradingMode);
      }
    } catch (importError) {
      console.log('🎯 Using trading mode from user data:', tradingMode);
    }

    // Determine win/loss based on admin settings
    let isWin: boolean;
    if (tradingMode === 'win') {
      isWin = true; // Force win
      console.log('🎯 FORCED WIN for user:', userId);
    } else if (tradingMode === 'lose') {
      isWin = false; // Force lose
      console.log('🎯 FORCED LOSE for user:', userId);
    } else {
      isWin = Math.random() > 0.5; // Normal 50% win rate
      console.log('🎯 NORMAL MODE - Random outcome:', isWin ? 'WIN' : 'LOSE');
    }

    // Calculate profit based on duration
    const tradeAmount = trade.amount;
    let profitPercentage = 0.10; // Default 10%
    if (trade.duration === 30) profitPercentage = 0.10;
    else if (trade.duration === 60) profitPercentage = 0.15;
    else if (trade.duration === 90) profitPercentage = 0.20;
    else if (trade.duration === 120) profitPercentage = 0.25;
    else if (trade.duration === 180) profitPercentage = 0.30;
    else if (trade.duration === 240) profitPercentage = 0.50;
    else if (trade.duration === 300) profitPercentage = 0.75;
    else if (trade.duration === 600) profitPercentage = 1.00;

    const profit = isWin ? tradeAmount * profitPercentage : 0;
    const exitPrice = trade.entry_price * (isWin ? 1.01 : 0.99);

    // Update trade status
    trade.status = 'completed';
    trade.exit_price = exitPrice;
    trade.result = isWin ? 'win' : 'lose';
    trade.profit_loss = isWin ? `+${profit.toFixed(2)}` : `-${tradeAmount.toFixed(2)}`;

    // Update user balance if won
    if (isWin) {
      const currentBalance = parseFloat(user.balance);
      user.balance = (currentBalance + profit).toString(); // Add only the profit (amount was already deducted at trade start)
      await saveUsers(users);
      console.log(`💰 TRADE WON: ${user.username} balance: ${currentBalance} → ${user.balance} (+${profit})`);
    } else {
      console.log(`💸 TRADE LOST: ${user.username} - amount already deducted: -${tradeAmount}`);
    }

    trades.set(tradeId, trade);

    console.log('✅ Options trade completed:', {
      tradeId: trade.id,
      isWin,
      tradingMode,
      profit: trade.profit_loss,
      newBalance: user.balance
    });

    // Try to update database if available
    try {
      if (supabaseAdmin) {
        // Update trade record
        await supabaseAdmin
          .from('trades')
          .update({
            status: 'completed',
            exit_price: exitPrice,
            result: isWin ? 'win' : 'lose',
            profit: isWin ? profit : -tradeAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', trade.id);

        // Update user balance in database
        await supabaseAdmin
          .from('users')
          .update({
            balance: user.balance,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        console.log('✅ Trade and balance updated in database');
      }
    } catch (dbError) {
      console.log('⚠️ Database update failed, continuing with in-memory state:', dbError);
    }

  } catch (error) {
    console.error('❌ Error completing options trade:', error);
  }
}

function handleGetTrades(req: VercelRequest, res: VercelResponse) {
  const userId = req.query.userId as string || 'demo-user-1';
  const userTrades = Array.from(trades.values()).filter(trade => trade.userId === userId);
  
  console.log('📈 Getting trades for user:', userId, 'Count:', userTrades.length);
  return res.json(userTrades);
}
