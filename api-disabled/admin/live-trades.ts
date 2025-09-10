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

// Import shared trades from trading API
let sharedTrades: Map<string, any>;

try {
  const tradesModule = require('../trades');
  sharedTrades = tradesModule.trades || new Map();
} catch {
  sharedTrades = new Map();
}

// Generate live trading data with real-time updates
function generateLiveTradesData() {
  const now = new Date();
  const trades = [];
  const users = ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4'];
  const usernames = ['john_trader', 'sarah_crypto', 'mike_hodler', 'emma_trader'];

  // Add real trades from the trading system
  if (sharedTrades && sharedTrades.size > 0) {
    sharedTrades.forEach((trade, tradeId) => {
      const userIndex = users.indexOf(trade.userId);
      const username = userIndex >= 0 ? usernames[userIndex] : 'Unknown User';
      
      // Calculate time left for active trades
      let timeLeft = 0;
      if (trade.status === 'active' && trade.expires_at) {
        const expiresAt = new Date(trade.expires_at);
        timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      }
      
      trades.push({
        id: trade.id,
        user_id: trade.userId,
        username,
        symbol: trade.symbol,
        amount: trade.amount,
        direction: trade.direction,
        duration: trade.duration,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price || null,
        result: trade.result || 'pending',
        profit: trade.profit || 0,
        status: trade.status,
        time_left: timeLeft,
        created_at: trade.created_at,
        expires_at: trade.expires_at,
        updated_at: trade.updated_at || trade.created_at
      });
    });
  }

  // Add some mock active trades if we don't have enough real ones
  const activeTrades = trades.filter(t => t.status === 'active');
  const targetActiveTrades = 3;
  
  for (let i = activeTrades.length; i < targetActiveTrades; i++) {
    const createdTime = new Date(now.getTime() - (Math.random() * 60 * 1000)); // Within last minute
    const duration = Math.random() > 0.5 ? 30 : 60;
    const amount = Math.floor(Math.random() * 500) + 100;
    const direction = Math.random() > 0.5 ? 'up' : 'down';
    const expiresAt = new Date(createdTime.getTime() + duration * 1000);
    const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    if (timeLeft > 0) {
      trades.push({
        id: `live-${i}-${Date.now()}`,
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
        updated_at: createdTime.toISOString()
      });
    }
  }

  // Sort by creation time (newest first)
  return trades.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🔴 Live Trades API: ${req.method} ${req.url}`);

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
      const { status, limit = '20' } = req.query;

      try {
        // Try to get from database first
        if (supabaseAdmin) {
          let query = supabaseAdmin
            .from('trades')
            .select(`
              *,
              users!inner(username)
            `)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit as string));

          // Filter by status if specified
          if (status) {
            query = query.eq('status', status);
          }

          const { data: trades, error } = await query;

          if (!error && trades && trades.length > 0) {
            // Format trades data with time left calculation
            const now = new Date();
            const formattedTrades = trades.map(trade => {
              let timeLeft = 0;
              if (trade.status === 'active' && trade.expires_at) {
                const expiresAt = new Date(trade.expires_at);
                timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
              }

              return {
                ...trade,
                username: trade.users?.username || 'Unknown User',
                time_left: timeLeft
              };
            });
            
            console.log('🔴 Live trades from database - Count:', formattedTrades.length);
            return res.json({
              success: true,
              trades: formattedTrades,
              timestamp: now.toISOString()
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      const liveTradesData = generateLiveTradesData();
      
      // Filter by status if specified
      let filteredTrades = liveTradesData;
      if (status) {
        filteredTrades = liveTradesData.filter(trade => trade.status === status);
      }

      // Apply limit
      const limitedTrades = filteredTrades.slice(0, parseInt(limit as string));

      console.log('🔴 Using live mock trades - Count:', limitedTrades.length);
      return res.json({
        success: true,
        trades: limitedTrades,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      // Manual trade control
      const { tradeId, action } = req.body || {};

      if (!tradeId || !action || !['win', 'lose', 'cancel'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid request. Provide tradeId and action (win/lose/cancel)"
        });
      }

      console.log('🎮 Manual trade control:', tradeId, action);

      // Try to update in shared trades first
      if (sharedTrades && sharedTrades.has(tradeId)) {
        const trade = sharedTrades.get(tradeId);
        
        if (trade.status === 'active') {
          trade.status = 'completed';
          trade.result = action === 'cancel' ? 'cancelled' : action;
          trade.updated_at = new Date().toISOString();
          
          // Calculate profit/loss
          if (action === 'win') {
            const profitPercentage = trade.duration === 30 ? 0.10 : 0.15;
            trade.profit = trade.amount * profitPercentage;
          } else if (action === 'lose') {
            trade.profit = -trade.amount;
          } else {
            trade.profit = 0; // cancelled
          }
          
          sharedTrades.set(tradeId, trade);
          
          console.log('✅ Trade manually controlled:', tradeId, action);
          return res.json({
            success: true,
            trade,
            message: `Trade ${action} executed successfully`
          });
        }
      }

      // Try database update
      try {
        if (supabaseAdmin) {
          const { data: updatedTrade, error } = await supabaseAdmin
            .from('trades')
            .update({
              status: 'completed',
              result: action === 'cancel' ? 'cancelled' : action,
              updated_at: new Date().toISOString()
            })
            .eq('id', tradeId)
            .eq('status', 'active')
            .select()
            .single();

          if (!error && updatedTrade) {
            console.log('✅ Trade manually controlled in database:', tradeId, action);
            return res.json({
              success: true,
              trade: updatedTrade,
              message: `Trade ${action} executed successfully`
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed');
      }

      return res.status(404).json({
        success: false,
        message: "Trade not found or already completed"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Live trades error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process live trades request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
