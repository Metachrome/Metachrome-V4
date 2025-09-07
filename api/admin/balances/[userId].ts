import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

// Import shared user balances
let userBalances: Map<string, { balance: number; currency: string }>;

// Initialize shared balance storage
try {
  const balancesModule = require('../../balances');
  userBalances = balancesModule.userBalances;
} catch {
  userBalances = new Map([
    ['user-1', { balance: 10000, currency: 'USDT' }],
    ['demo-user-1', { balance: 10000, currency: 'USDT' }],
    ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
  ]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💰 Admin Balance Management API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Extract userId from URL path
    const urlParts = req.url?.split('/') || [];
    const userId = urlParts[urlParts.length - 1];

    if (!userId || userId === '[userId]') {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (req.method === 'GET') {
      // Get user balance
      console.log('💰 Getting balance for user:', userId);

      // Try to get from database first
      let balanceData = null;
      try {
        if (supabaseAdmin) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

          if (user) {
            balanceData = {
              userId,
              balance: user.balance,
              currency: 'USDT'
            };
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using in-memory balance');
      }

      // Fallback to in-memory balance
      if (!balanceData) {
        const userBalance = userBalances.get(userId) || { balance: 0, currency: 'USDT' };
        balanceData = {
          userId,
          balance: userBalance.balance,
          currency: userBalance.currency
        };
      }

      console.log('✅ Balance data:', balanceData);
      return res.json(balanceData);
    }

    if (req.method === 'PUT') {
      // Update user balance
      const { balance, action, note } = req.body || {};

      if (!balance || !action) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: balance, action"
        });
      }

      const changeAmount = parseFloat(balance);
      if (isNaN(changeAmount) || changeAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid balance amount"
        });
      }

      // Get current balance
      let currentBalance = userBalances.get(userId)?.balance || 0;

      // Try to get from database first
      try {
        if (supabaseAdmin) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

          if (user) {
            currentBalance = user.balance || 0;
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using in-memory balance');
      }

      // Calculate new balance
      let newBalance = currentBalance;
      if (action === 'add') {
        newBalance = currentBalance + changeAmount;
      } else if (action === 'subtract') {
        newBalance = Math.max(0, currentBalance - changeAmount);
      } else if (action === 'set') {
        newBalance = Math.max(0, changeAmount);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid action. Must be 'add', 'subtract', or 'set'"
        });
      }

      // Update in-memory balance
      userBalances.set(userId, { balance: newBalance, currency: 'USDT' });

      // Try to update database
      try {
        if (supabaseAdmin) {
          const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update({ 
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

          if (error) {
            console.error('❌ Database update error:', error);
          } else {
            console.log('✅ Database balance updated successfully');
          }

          // Create transaction record
          await supabaseAdmin
            .from('transactions')
            .insert({
              id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              user_id: userId,
              type: action === 'add' ? 'deposit' : 'withdrawal',
              amount: action === 'add' ? changeAmount : -changeAmount,
              status: 'completed',
              description: note || `Admin ${action} - ${changeAmount} USDT`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      console.log('✅ Balance updated:', {
        userId,
        action,
        amount: changeAmount,
        oldBalance: currentBalance,
        newBalance,
        note
      });

      return res.json({
        success: true,
        userId,
        action,
        amount: changeAmount,
        oldBalance: currentBalance,
        newBalance,
        note,
        message: `Balance ${action} successful`
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin balance management error:', error);
    return res.status(500).json({
      success: false,
      message: "Balance management failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
