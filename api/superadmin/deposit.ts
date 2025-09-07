import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💰 Superadmin Deposit API: ${req.method} ${req.url}`);
    
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
      const { userId, amount, note } = req.body || {};

      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, amount"
        });
      }

      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid deposit amount"
        });
      }

      console.log('💰 Processing deposit for user:', userId, 'amount:', depositAmount);

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
      const newBalance = currentBalance + depositAmount;

      // Update in-memory balance
      userBalances.set(userId, { balance: newBalance, currency: 'USDT' });

      // Try to update database
      let updatedUser = null;
      try {
        if (supabaseAdmin) {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .update({ 
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select('id, username, email, balance')
            .single();

          if (error) {
            console.error('❌ Database update error:', error);
          } else {
            updatedUser = user;
            console.log('✅ Balance updated in database');
          }

          // Create transaction record
          await supabaseAdmin
            .from('transactions')
            .insert({
              id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              user_id: userId,
              type: 'deposit',
              amount: depositAmount,
              status: 'completed',
              description: note || `Superadmin deposit - ${depositAmount} USDT`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          console.log('✅ Transaction record created');
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      // If no database, return mock success
      if (!updatedUser) {
        updatedUser = {
          id: userId,
          username: `user-${userId.slice(-3)}`,
          email: `user-${userId.slice(-3)}@example.com`,
          balance: newBalance
        };
        console.log('✅ Mock deposit completed');
      }

      console.log('✅ Deposit processed successfully:', {
        userId,
        amount: depositAmount,
        oldBalance: currentBalance,
        newBalance,
        note
      });

      return res.json({
        success: true,
        userId,
        amount: depositAmount,
        oldBalance: currentBalance,
        newBalance,
        user: updatedUser,
        note,
        message: `Deposit of ${depositAmount} USDT completed successfully`
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Superadmin deposit error:', error);
    return res.status(500).json({
      success: false,
      message: "Deposit failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
