import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';
import { userBalances } from '../balances';
import { userTradingModes } from './trading-controls';

// Import shared trades
let sharedTrades: Map<string, any>;

try {
  const tradesModule = require('../trades');
  sharedTrades = tradesModule.trades || new Map();
} catch {
  sharedTrades = new Map();
}

function calculateSystemStats() {
  const now = new Date();
  
  // Calculate user statistics
  const totalUsers = userBalances.size;
  const activeUsers = Array.from(userTradingModes.values()).filter(mode => mode !== 'suspended').length;
  
  // Calculate balance statistics
  let totalBalance = 0;
  let controlledUsers = 0;
  
  userBalances.forEach((balance, userId) => {
    totalBalance += balance.balance;
    const tradingMode = userTradingModes.get(userId);
    if (tradingMode && tradingMode !== 'normal') {
      controlledUsers++;
    }
  });

  // Calculate trade statistics
  const trades = Array.from(sharedTrades.values());
  const activeTrades = trades.filter(trade => trade.status === 'active').length;
  const completedTrades = trades.filter(trade => trade.status === 'completed');
  
  let totalVolume = 0;
  let totalPnL = 0;
  let winCount = 0;
  
  completedTrades.forEach(trade => {
    totalVolume += trade.amount;
    if (trade.result === 'win') {
      winCount++;
      totalPnL += (trade.profit || 0);
    } else if (trade.result === 'lose') {
      totalPnL -= trade.amount;
    }
  });

  const winRate = completedTrades.length > 0 ? (winCount / completedTrades.length) * 100 : 0;

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      controlled: controlledUsers
    },
    trading: {
      activeTrades,
      totalTrades: trades.length,
      winRate: Math.round(winRate),
      totalVolume: Math.round(totalVolume),
      totalPnL: Math.round(totalPnL)
    },
    balances: {
      totalBalance: Math.round(totalBalance),
      averageBalance: totalUsers > 0 ? Math.round(totalBalance / totalUsers) : 0
    },
    system: {
      uptime: '99.9%',
      lastUpdate: now.toISOString(),
      status: 'operational'
    }
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📊 System Stats API: ${req.method} ${req.url}`);

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
          const [usersResult, tradesResult] = await Promise.all([
            supabaseAdmin.from('users').select('id, balance, trading_mode, status'),
            supabaseAdmin.from('trades').select('id, amount, status, result, profit, created_at')
          ]);

          if (!usersResult.error && !tradesResult.error && 
              usersResult.data && tradesResult.data) {
            
            const users = usersResult.data;
            const trades = tradesResult.data;
            
            // Calculate stats from database data
            const totalUsers = users.length;
            const activeUsers = users.filter(u => u.status === 'active').length;
            const controlledUsers = users.filter(u => u.trading_mode && u.trading_mode !== 'normal').length;
            
            const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
            const averageBalance = totalUsers > 0 ? totalBalance / totalUsers : 0;
            
            const activeTrades = trades.filter(t => t.status === 'active').length;
            const completedTrades = trades.filter(t => t.status === 'completed');
            
            let totalVolume = 0;
            let totalPnL = 0;
            let winCount = 0;
            
            completedTrades.forEach(trade => {
              totalVolume += trade.amount || 0;
              if (trade.result === 'win') {
                winCount++;
                totalPnL += (trade.profit || 0);
              } else if (trade.result === 'lose') {
                totalPnL -= (trade.amount || 0);
              }
            });

            const winRate = completedTrades.length > 0 ? (winCount / completedTrades.length) * 100 : 0;

            const stats = {
              users: {
                total: totalUsers,
                active: activeUsers,
                controlled: controlledUsers
              },
              trading: {
                activeTrades,
                totalTrades: trades.length,
                winRate: Math.round(winRate),
                totalVolume: Math.round(totalVolume),
                totalPnL: Math.round(totalPnL)
              },
              balances: {
                totalBalance: Math.round(totalBalance),
                averageBalance: Math.round(averageBalance)
              },
              system: {
                uptime: '99.9%',
                lastUpdate: new Date().toISOString(),
                status: 'operational'
              }
            };
            
            console.log('📊 Stats from database');
            return res.json({
              success: true,
              stats,
              source: 'database'
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using calculated stats');
      }

      // Fallback to calculated stats
      const stats = calculateSystemStats();
      
      console.log('📊 Using calculated stats');
      return res.json({
        success: true,
        stats,
        source: 'calculated'
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ System stats error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to get system statistics",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
