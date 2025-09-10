import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

// Import shared user balances from balances API
let userBalances: Map<string, { balance: number; currency: string }>;

// Initialize shared balance storage
try {
  // Try to import from balances module
  const balancesModule = require('./balances');
  userBalances = balancesModule.userBalances;
} catch {
  // Fallback to local storage if import fails
  userBalances = new Map([
    ['user-1', { balance: 10000, currency: 'USDT' }],
    ['demo-user-1', { balance: 10000, currency: 'USDT' }],
    ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
  ]);
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

function handleSpotTrading(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { symbol, side, amount, price, userId } = req.body || {};
    
    console.log('📈 Spot trade request:', { symbol, side, amount, price, userId });
    
    if (!symbol || !side || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: symbol, side, amount"
      });
    }

    // Check user balance
    const userBalance = userBalances.get(userId || 'demo-user-1') || { balance: 0, currency: 'USDT' };
    const tradeAmount = parseFloat(amount);
    
    if (userBalance.balance < tradeAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }

    // Create trade
    const trade = {
      id: `trade-${Date.now()}`,
      userId: userId || 'demo-user-1',
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

    // Update balance (simplified)
    if (side === 'buy') {
      userBalance.balance -= tradeAmount;
    } else {
      userBalance.balance += tradeAmount;
    }
    userBalances.set(userId || 'demo-user-1', userBalance);

    console.log('✅ Spot trade executed:', trade);
    return res.json({
      success: true,
      trade,
      message: "Spot trade executed successfully"
    });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

async function handleOptionsTrading(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const { symbol, side, direction, amount, duration, userId } = req.body || {};

      // Accept either 'side' or 'direction' for compatibility
      const tradeDirection = side || direction;

      // Handle admin users - map them to their trading profile
      let finalUserId = userId || 'demo-user-1';
      if (userId === 'superadmin-001' || userId === 'admin-001') {
        // Create a virtual trading profile for admin users
        finalUserId = `${userId}-trading`;
        console.log(`🔧 Admin user ${userId} trading as ${finalUserId}`);
      }

      console.log('📈 Options trade request:', { symbol, side, direction, tradeDirection, amount, duration, originalUserId: userId, finalUserId });

      // Validate required fields
      if (!symbol || !tradeDirection || !amount || !duration) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: symbol, direction/side, amount, duration"
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
      const minAmount = tradeDuration === 30 ? 100 : 1000;
      if (tradeAmount < minAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum amount for ${tradeDuration}s is ${minAmount} USDT`
        });
      }

      // Get or initialize user balance
      let userBalance = userBalances.get(finalUserId);
      if (!userBalance) {
        userBalance = { balance: 10000, currency: 'USDT' }; // Default balance for new users
        userBalances.set(finalUserId, userBalance);
      }

      // Check balance
      if (userBalance.balance < tradeAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Required: ${tradeAmount} USDT, Available: ${userBalance.balance} USDT`
        });
      }

      // Deduct amount from balance immediately (before trade creation)
      const newBalance = userBalance.balance - tradeAmount;
      userBalances.set(finalUserId, { balance: newBalance, currency: 'USDT' });

      console.log(`💰 Balance deducted: ${tradeAmount} USDT, New balance: ${newBalance} USDT`);

      // Get current market price (mock for now)
      const currentPrice = 117000 + (Math.random() * 2000);

      // Create options trade
      const trade = {
        id: `options-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: finalUserId,
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
        amount: tradeAmount,
        newBalance: newBalance
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
              balance: userBalance.balance,
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
        await completeOptionsTrade(trade.id, finalUserId);
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

      // Get current balance
      const currentBalance = userBalances.get(userId) || { balance: 0, currency: 'USDT' };
      const tradeAmount = parseFloat(amount);
      let balanceChange = 0;

      if (won) {
        // Calculate profit based on payout or default percentage
        const profitAmount = payout ? parseFloat(payout) : tradeAmount * 0.8; // 80% profit default
        balanceChange = profitAmount;
        currentBalance.balance += profitAmount;
        console.log(`💰 Trade WON: +${profitAmount} USDT`);
      } else {
        // Trade lost - amount was already deducted when trade was placed
        console.log(`💸 Trade LOST: -${tradeAmount} USDT (already deducted)`);
      }

      // Update balance
      userBalances.set(userId, currentBalance);

      console.log('✅ Trade completion processed:', {
        tradeId,
        userId,
        won,
        balanceChange,
        newBalance: currentBalance.balance
      });

      return res.json({
        success: true,
        tradeId,
        won,
        balanceChange,
        newBalance: currentBalance.balance,
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

async function completeOptionsTrade(tradeId: string, userId: string) {
  try {
    const trade = trades.get(tradeId);
    if (!trade || trade.status !== 'active') {
      console.log('⚠️ Trade not found or already completed:', tradeId);
      return;
    }

    // Get user's trading mode from multiple sources
    let tradingMode = 'normal';

    // First try to import from trading controls
    try {
      const tradingControlsModule = require('./admin/trading-controls');
      const userTradingModes = tradingControlsModule.userTradingModes;
      if (userTradingModes && userTradingModes.has(userId)) {
        tradingMode = userTradingModes.get(userId);
        console.log('🎯 Trading mode from controls:', tradingMode);
      }
    } catch (importError) {
      console.log('⚠️ Could not import trading controls, trying database');
    }

    // Fallback to database
    if (tradingMode === 'normal') {
      try {
        if (supabaseAdmin) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('trading_mode')
            .eq('id', userId)
            .single();

          if (user && user.trading_mode) {
            tradingMode = user.trading_mode;
            console.log('🎯 Trading mode from database:', tradingMode);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch user trading mode from database');
      }
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
    const profitPercentage = trade.duration === 30 ? 0.10 : 0.15; // 10% for 30s, 15% for 60s
    const profit = isWin ? tradeAmount * profitPercentage : 0;
    const exitPrice = trade.entry_price * (isWin ? 1.01 : 0.99);

    // Update trade status
    trade.status = 'completed';
    trade.exit_price = exitPrice;
    trade.result = isWin ? 'win' : 'lose';
    trade.profit_loss = isWin ? `+${profit.toFixed(2)}` : `-${tradeAmount.toFixed(2)}`;

    // Update user balance
    const currentBalance = userBalances.get(userId) || { balance: 0, currency: 'USDT' };
    if (isWin) {
      currentBalance.balance += tradeAmount + profit; // Return original amount + profit
    }
    // If lose, amount was already deducted when trade was created
    userBalances.set(userId, currentBalance);

    trades.set(tradeId, trade);

    console.log('✅ Options trade completed:', {
      tradeId: trade.id,
      isWin,
      tradingMode,
      profit: trade.profit_loss,
      newBalance: currentBalance.balance
    });

    // Broadcast balance update for real-time sync
    try {
      console.log('📡 Broadcasting trade completion and balance update:', {
        type: 'trade_completed',
        data: {
          tradeId: trade.id,
          userId,
          result: isWin ? 'win' : 'lose',
          profit: isWin ? profit : -tradeAmount,
          newBalance: currentBalance.balance
        }
      });
    } catch (broadcastError) {
      console.log('⚠️ Trade completion broadcast failed:', broadcastError);
    }

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
            balance: currentBalance.balance,
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
