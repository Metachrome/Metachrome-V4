import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../../../lib/supabase';

// Import shared user balances
let userBalances: Map<string, { balance: number; currency: string }>;

// Initialize shared balance storage
try {
  const balancesModule = require('../../../balances');
  userBalances = balancesModule.userBalances;
} catch {
  userBalances = new Map([
    ['user-1', { balance: 10000, currency: 'USDT' }],
    ['demo-user-1', { balance: 10000, currency: 'USDT' }],
    ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
  ]);
}

// Mock trades storage for demo
const trades = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🎮 Trade Control API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Extract tradeId from URL path
    const urlParts = req.url?.split('/') || [];
    const tradeIdIndex = urlParts.findIndex(part => part === 'trades') + 1;
    const tradeId = urlParts[tradeIdIndex];

    if (!tradeId || tradeId === '[tradeId]') {
      return res.status(400).json({
        success: false,
        message: "Trade ID is required"
      });
    }

    if (req.method === 'POST') {
      const { action } = req.body || {};

      if (!action || !['win', 'lose', 'cancel'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Invalid action. Must be 'win', 'lose', or 'cancel'"
        });
      }

      console.log('🎮 Manual trade control:', tradeId, action);

      // Try to get trade from database first
      let trade = null;
      try {
        if (supabaseAdmin) {
          const { data: dbTrade, error } = await supabaseAdmin
            .from('trades')
            .select('*')
            .eq('id', tradeId)
            .single();

          if (!error && dbTrade) {
            trade = dbTrade;
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock trade');
      }

      // Fallback to mock trade if not found in database
      if (!trade) {
        trade = trades.get(tradeId);
        if (!trade) {
          return res.status(404).json({
            success: false,
            message: "Trade not found"
          });
        }
      }

      // Check if trade is still active
      if (trade.result && trade.result !== 'pending') {
        return res.status(400).json({
          success: false,
          message: "Trade is already completed"
        });
      }

      // Calculate profit/loss based on action
      const tradeAmount = parseFloat(trade.amount) || 0;
      let profit = 0;
      let exitPrice = trade.entry_price || 117000;

      if (action === 'win') {
        // Calculate profit based on duration
        const profitPercentage = trade.duration === 30 ? 0.10 : 0.15; // 10% for 30s, 15% for 60s
        profit = tradeAmount * profitPercentage;
        exitPrice = trade.direction === 'up' ? trade.entry_price * 1.01 : trade.entry_price * 0.99;
      } else if (action === 'lose') {
        profit = -tradeAmount; // Lose the entire amount
        exitPrice = trade.direction === 'up' ? trade.entry_price * 0.99 : trade.entry_price * 1.01;
      } else if (action === 'cancel') {
        profit = 0; // Return the original amount
        exitPrice = trade.entry_price;
      }

      // Update trade
      const updatedTrade = {
        ...trade,
        result: action === 'cancel' ? 'cancelled' : action,
        profit,
        exit_price: exitPrice,
        status: 'completed',
        updated_at: new Date().toISOString()
      };

      // Try to update in database
      try {
        if (supabaseAdmin) {
          const { error: updateError } = await supabaseAdmin
            .from('trades')
            .update({
              result: updatedTrade.result,
              profit: updatedTrade.profit,
              exit_price: updatedTrade.exit_price,
              status: updatedTrade.status,
              updated_at: updatedTrade.updated_at
            })
            .eq('id', tradeId);

          if (updateError) {
            console.error('❌ Trade update error:', updateError);
          } else {
            console.log('✅ Trade updated in database');
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with mock response');
      }

      // Update mock trade storage
      trades.set(tradeId, updatedTrade);

      // Update user balance
      const userId = trade.user_id || trade.userId;
      if (userId && (action === 'win' || action === 'cancel')) {
        const currentBalance = userBalances.get(userId) || { balance: 0, currency: 'USDT' };
        
        if (action === 'win') {
          // Add original amount + profit
          currentBalance.balance += tradeAmount + profit;
        } else if (action === 'cancel') {
          // Return original amount
          currentBalance.balance += tradeAmount;
        }

        userBalances.set(userId, currentBalance);

        // Try to update balance in database
        try {
          if (supabaseAdmin) {
            await supabaseAdmin
              .from('users')
              .update({ 
                balance: currentBalance.balance,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            // Create transaction record
            await supabaseAdmin
              .from('transactions')
              .insert({
                id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                user_id: userId,
                type: action === 'win' ? 'trade_win' : action === 'cancel' ? 'trade_cancel' : 'trade_loss',
                amount: action === 'win' ? profit : action === 'cancel' ? 0 : -tradeAmount,
                status: 'completed',
                description: `Manual trade ${action} - ${tradeId}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            console.log('✅ Balance updated in database');
          }
        } catch (dbError) {
          console.log('⚠️ Balance update failed, continuing with in-memory state');
        }
      }

      console.log('✅ Trade control executed:', {
        tradeId,
        action,
        profit,
        newBalance: userId ? userBalances.get(userId)?.balance : 'N/A'
      });

      return res.json({
        success: true,
        tradeId,
        action,
        trade: updatedTrade,
        profit,
        message: `Trade ${action} executed successfully`
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Trade control error:', error);
    return res.status(500).json({
      success: false,
      message: "Trade control failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
