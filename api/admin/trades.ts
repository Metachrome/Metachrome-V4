import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';

// Generate dynamic mock trades data for demo
function generateMockTrades() {
  const now = new Date();
  const trades = [];

  // Add some completed trades
  for (let i = 1; i <= 8; i++) {
    const createdTime = new Date(now.getTime() - (i * 5 * 60 * 1000)); // 5 minutes apart
    const duration = Math.random() > 0.5 ? 30 : 60;
    const amount = Math.floor(Math.random() * 1000) + 100;
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const result = Math.random() > 0.3 ? 'win' : 'lose';
    const profit = result === 'win' ? amount * (duration === 30 ? 0.1 : 0.15) : -amount;

    trades.push({
      id: `trade-${i}`,
      user_id: `demo-user-${(i % 3) + 1}`,
      username: ['john_trader', 'sarah_crypto', 'mike_hodler'][i % 3],
      symbol: 'BTCUSDT',
      amount,
      direction,
      duration,
      entry_price: 117000 + (Math.random() * 2000),
      exit_price: 117000 + (Math.random() * 2000),
      result,
      profit,
      status: 'completed',
      created_at: createdTime.toISOString(),
      expires_at: new Date(createdTime.getTime() + duration * 1000).toISOString(),
      updated_at: new Date(createdTime.getTime() + duration * 1000).toISOString(),
      users: { username: ['john_trader', 'sarah_crypto', 'mike_hodler'][i % 3] }
    });
  }

  // Add some active trades
  for (let i = 9; i <= 12; i++) {
    const createdTime = new Date(now.getTime() - (Math.random() * 30 * 1000)); // Within last 30 seconds
    const duration = Math.random() > 0.5 ? 30 : 60;
    const amount = Math.floor(Math.random() * 1000) + 100;
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const expiresAt = new Date(createdTime.getTime() + duration * 1000);

    // Only add if not expired
    if (expiresAt > now) {
      trades.push({
        id: `trade-${i}`,
        user_id: `demo-user-${(i % 3) + 1}`,
        username: ['john_trader', 'sarah_crypto', 'mike_hodler'][i % 3],
        symbol: 'BTCUSDT',
        amount,
        direction,
        duration,
        entry_price: 117000 + (Math.random() * 2000),
        exit_price: null,
        result: 'pending',
        profit: 0,
        status: 'active',
        created_at: createdTime.toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: createdTime.toISOString(),
        users: { username: ['john_trader', 'sarah_crypto', 'mike_hodler'][i % 3] }
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
