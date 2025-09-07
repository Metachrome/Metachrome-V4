import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

// Import shared user balances from balances API
let userBalances: Map<string, { balance: number; currency: string }>;

// Initialize shared balance storage
try {
  // Try to import from balances module
  const balancesModule = require('../balances');
  userBalances = balancesModule.userBalances;
} catch {
  // Fallback to local storage if import fails
  userBalances = new Map([
    ['user-1', { balance: 10000, currency: 'USDT' }],
    ['demo-user-1', { balance: 10000, currency: 'USDT' }],
    ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
  ]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🏁 Trade completion API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
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

      // Try to update database if available
      try {
        if (supabaseAdmin) {
          // Update user balance in database
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
              type: won ? 'trade_win' : 'trade_loss',
              amount: won ? balanceChange : -tradeAmount,
              status: 'completed',
              description: `Options trade ${won ? 'win' : 'loss'} - ${tradeId}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          console.log('✅ Database updated successfully');
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state:', dbError);
      }

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
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
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
