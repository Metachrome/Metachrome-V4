import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

// Mock stats for demo
const MOCK_STATS = {
  totalUsers: 5,
  activeUsers: 4,
  totalTrades: 5,
  activeTrades: 1,
  totalTransactions: 8,
  totalVolume: 2100,
  totalBalance: 141500,
  winRate: 60,
  totalProfit: 335,
  totalLoss: -200
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📊 Admin Stats API: ${req.method} ${req.url}`);
    console.log('🔧 Environment check:', {
      supabaseUrl: process.env.SUPABASE_URL ? 'configured' : 'missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
      supabaseAdmin: supabaseAdmin ? 'initialized' : 'null'
    });

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
        // Try to calculate from database first
        if (supabaseAdmin) {
          const [usersResult, tradesResult, transactionsResult] = await Promise.allSettled([
            supabaseAdmin.from('users').select('id, balance, status'),
            supabaseAdmin.from('trades').select('id, amount, result, status'),
            supabaseAdmin.from('transactions').select('id, amount, type')
          ]);

          let stats = { ...MOCK_STATS };

          // Calculate users stats
          if (usersResult.status === 'fulfilled' && usersResult.value.data) {
            const users = usersResult.value.data;
            stats.totalUsers = users.length;
            stats.activeUsers = users.filter(u => u.status === 'active').length;
            stats.totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);
          }

          // Calculate trades stats
          if (tradesResult.status === 'fulfilled' && tradesResult.value.data) {
            const trades = tradesResult.value.data;
            stats.totalTrades = trades.length;
            stats.activeTrades = trades.filter(t => t.status === 'active').length;
            stats.totalVolume = trades.reduce((sum, t) => sum + (t.amount || 0), 0);
            
            const completedTrades = trades.filter(t => t.result && t.result !== 'pending');
            const winTrades = completedTrades.filter(t => t.result === 'win');
            stats.winRate = completedTrades.length > 0 ? Math.round((winTrades.length / completedTrades.length) * 100) : 0;
          }

          // Calculate transactions stats
          if (transactionsResult.status === 'fulfilled' && transactionsResult.value.data) {
            const transactions = transactionsResult.value.data;
            stats.totalTransactions = transactions.length;
            stats.totalProfit = transactions
              .filter(t => t.type === 'trade_win' || t.type === 'bonus')
              .reduce((sum, t) => sum + (t.amount || 0), 0);
            stats.totalLoss = transactions
              .filter(t => t.type === 'trade_loss')
              .reduce((sum, t) => sum + (t.amount || 0), 0);
          }

          console.log('📊 Stats calculated from database:', stats);
          return res.json(stats);
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock stats');
      }

      // Fallback to mock stats
      console.log('📊 Using mock stats:', MOCK_STATS);
      return res.json(MOCK_STATS);
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process stats request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
