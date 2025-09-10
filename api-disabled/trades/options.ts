import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import shared user balances
let userBalances: Map<string, { balance: number; currency: string }>;

// Initialize shared balance storage
try {
  const balancesModule = require('../balances');
  userBalances = balancesModule.userBalances;
} catch {
  userBalances = new Map([
    ['user-1', { balance: 10000, currency: 'USDT' }],
    ['demo-user-1', { balance: 10000, currency: 'USDT' }],
    ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
  ]);
}

// Store active trades
const trades = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🚨🚨🚨 VERCEL API ROUTE HIT! 🚨🚨🚨`);
    console.log(`📈 Options Trading API: ${req.method} ${req.url}`);
    console.log(`🚨🚨🚨 VERCEL API ROUTE HIT! 🚨🚨🚨`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
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

      // Validate direction
      if (!['up', 'down', 'call', 'put'].includes(tradeDirection.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Direction must be 'up', 'down', 'call', or 'put'"
        });
      }

      // Parse and validate amount
      const tradeAmount = parseFloat(amount);
      if (isNaN(tradeAmount) || tradeAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number"
        });
      }

      // Parse and validate duration
      const tradeDuration = parseInt(duration);
      if (isNaN(tradeDuration) || tradeDuration < 30) {
        return res.status(400).json({
          success: false,
          message: "Duration must be at least 30 seconds"
        });
      }

      // Check minimum amounts based on duration
      const minAmounts: { [key: number]: number } = {
        30: 100,  // 30s minimum 100 USDT
        60: 1000, // 60s minimum 1000 USDT
      };

      const minAmount = minAmounts[tradeDuration] || 100;
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

      // Simulate trade completion after duration
      setTimeout(async () => {
        await completeOptionsTrade(trade.id, finalUserId);
      }, Math.min(tradeDuration * 1000, 30000)); // Max 30 seconds for demo

      return res.json({
        success: true,
        trade,
        message: "Options trade created successfully"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
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

async function completeOptionsTrade(tradeId: string, userId: string) {
  try {
    const trade = trades.get(tradeId);
    if (!trade || trade.status !== 'active') {
      console.log('⚠️ Trade not found or already completed:', tradeId);
      return;
    }

    // Get user's trading mode from admin controls
    let tradingMode = 'normal';

    try {
      // Import trading controls
      const { userTradingModes } = await import('../admin/trading-controls');
      tradingMode = userTradingModes.get(userId) || 'normal';
      console.log(`🎯 TRADING CONTROL SYSTEM: User ${userId} has mode: ${tradingMode.toUpperCase()}`);
    } catch (error) {
      console.log('⚠️ Could not load trading controls, using normal mode');
    }

    // Simulate market movement
    const currentPrice = 117000 + (Math.random() * 2000);
    const priceChange = currentPrice - trade.entry_price;

    // Determine win/loss based on trading mode
    let isWin = false;

    if (tradingMode === 'win') {
      isWin = true;
      console.log(`🎯 FORCED WIN: Trading control system forcing WIN for user ${userId}`);
    } else if (tradingMode === 'lose') {
      isWin = false;
      console.log(`🎯 FORCED LOSE: Trading control system forcing LOSE for user ${userId}`);
    } else {
      // Normal mode - actual market logic
      if (trade.direction === 'up' || trade.direction === 'call') {
        isWin = priceChange > 0;
      } else {
        isWin = priceChange < 0;
      }
      console.log(`🎯 NORMAL MODE: Market-based result for user ${userId}: ${isWin ? 'WIN' : 'LOSE'} (price change: ${priceChange.toFixed(2)})`);
    }

    // Calculate profit/loss
    const profitPercentages: { [key: number]: number } = {
      30: 10,  // 30s = 10% profit
      60: 15,  // 60s = 15% profit
    };

    const profitPercentage = profitPercentages[trade.duration] || 10;
    const profitAmount = isWin ? trade.amount * (profitPercentage / 100) : 0;
    const totalPayout = isWin ? trade.amount + profitAmount : 0;

    // Update trade status
    trade.status = 'completed';
    trade.exit_price = currentPrice;
    trade.profit_loss = isWin ? `+${profitAmount.toFixed(2)}` : `-${trade.amount}`;
    trade.completed_at = new Date().toISOString();

    // Update user balance if won
    if (isWin) {
      const userBalance = userBalances.get(userId) || { balance: 0, currency: 'USDT' };
      userBalance.balance += totalPayout;
      userBalances.set(userId, userBalance);
      console.log(`💰 Trade WON: +${totalPayout} USDT, New balance: ${userBalance.balance} USDT`);
    } else {
      console.log(`💸 Trade LOST: -${trade.amount} USDT (already deducted)`);
    }

    console.log('🏁 Trade completed:', {
      tradeId,
      userId,
      isWin,
      profitAmount,
      totalPayout
    });

  } catch (error) {
    console.error('❌ Error completing trade:', error);
  }
}
