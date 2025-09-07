import type { VercelRequest, VercelResponse } from '@vercel/node';

// Temporarily disable supabase import to fix deployment
// import { supabaseAdmin } from '../../lib/supabase';
const supabaseAdmin = null;

// Import shared trades from trading API
let sharedTrades: Map<string, any>;

try {
  const tradesModule = require('../trades');
  sharedTrades = tradesModule.trades || new Map();
} catch {
  sharedTrades = new Map();
}

// Generate dynamic mock trades data for demo
function generateMockTrades() {
  const now = new Date();
  const trades = [];
  const users = ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4'];
  const usernames = ['john_trader', 'sarah_crypto', 'mike_hodler', 'emma_trader'];

  // First, add any real trades from the trading system
  if (sharedTrades && sharedTrades.size > 0) {
    sharedTrades.forEach((trade, tradeId) => {
      const userIndex = users.indexOf(trade.userId);
      const username = userIndex >= 0 ? usernames[userIndex] : 'Unknown User';

      trades.push({
        ...trade,
        username,
        users: { username }
      });
    });
  }

  // Add some completed mock trades if we don't have enough real ones
  const existingTradesCount = trades.length;
  const targetCompletedTrades = Math.max(8, existingTradesCount);

  for (let i = existingTradesCount + 1; i <= targetCompletedTrades; i++) {
    const createdTime = new Date(now.getTime() - (i * 5 * 60 * 1000)); // 5 minutes apart
    const duration = Math.random() > 0.5 ? 30 : 60;
    const amount = Math.floor(Math.random() * 1000) + 100;
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const result = Math.random() > 0.3 ? 'win' : 'lose';
    const entryPrice = 117000 + (Math.random() * 2000);
    const exitPrice = entryPrice * (result === 'win' ? 1.01 : 0.99);
    const profit = result === 'win' ? amount * (duration === 30 ? 0.1 : 0.15) : -amount;

    trades.push({
      id: `mock-trade-${i}`,
      user_id: users[i % users.length],
      username: usernames[i % users.length],
      symbol: 'BTCUSDT',
      amount,
      direction,
      duration,
      entry_price: entryPrice,
      exit_price: exitPrice,
      result,
      profit,
      status: 'completed',
      created_at: createdTime.toISOString(),
      expires_at: new Date(createdTime.getTime() + duration * 1000).toISOString(),
      updated_at: new Date(createdTime.getTime() + duration * 1000).toISOString(),
      users: { username: usernames[i % users.length] }
    });
  }

  // Add some active mock trades
  for (let i = 1; i <= 3; i++) {
    const createdTime = new Date(now.getTime() - (Math.random() * 30 * 1000)); // Within last 30 seconds
    const duration = Math.random() > 0.5 ? 30 : 60;
    const amount = Math.floor(Math.random() * 500) + 100;
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const expiresAt = new Date(createdTime.getTime() + duration * 1000);
    const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    // Only add if not expired
    if (timeLeft > 0) {
      trades.push({
        id: `mock-active-${i}`,
        user_id: users[i % users.length],
        username: usernames[i % users.length],
        symbol: 'BTCUSDT',
        amount,
        direction,
        duration,
        entry_price: 117000 + (Math.random() * 2000),
        exit_price: null,
        result: 'pending',
        profit: 0,
        status: 'active',
        time_left: timeLeft,
        created_at: createdTime.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: createdTime.toISOString(),
        users: { username: usernames[i % users.length] }
      });
    }
  }

  return trades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

const MOCK_TRADES = generateMockTrades();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📈 Admin Trades API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      try {
        // Try to get from database first
        if (supabaseAdmin) {
          const { data: trades, error } = await supabaseAdmin
            .from('trades')
            .select(`
              *,
              users!inner(username)
            `)
            .order('created_at', { ascending: false });

          if (!error && trades && trades.length > 0) {
            // Format trades data
            const formattedTrades = trades.map(trade => ({
              ...trade,
              username: trade.users?.username || 'Unknown User'
            }));
            
            console.log('📈 Trades from database - Count:', formattedTrades.length);
            return res.json(formattedTrades);
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      console.log('📈 Using mock trades - Count:', MOCK_TRADES.length);
      return res.json(MOCK_TRADES);
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin trades error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process trades request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
