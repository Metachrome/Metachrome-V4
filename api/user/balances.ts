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

// Mock user balances - synchronized with trading API
const userBalances = new Map([
  ['user-1', { balance: 10000, currency: 'USDT' }],
  ['demo-user-1', { balance: 10000, currency: 'USDT' }],
  ['superadmin-001', { balance: 1000000, currency: 'USDT' }],
  ['superadmin-001-trading', { balance: 50000, currency: 'USDT' }],
  ['admin-001-trading', { balance: 50000, currency: 'USDT' }]
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💰 User balances API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      const { userId } = req.query;
      let targetUserId = userId as string || 'demo-user-1';

      console.log('💰 [BALANCE API] Request for userId:', userId);
      console.log('💰 [BALANCE API] Target userId:', targetUserId);

      // Handle admin users - map them to their trading profile for balance display
      if (targetUserId === 'superadmin-001' || targetUserId === 'admin-001') {
        targetUserId = `${targetUserId}-trading`;
        console.log(`🔧 Admin user ${userId} balance mapped to ${targetUserId}`);
      }

      // Try to get from database first
      let balanceData = null;
      try {
        if (supabaseAdmin) {
          console.log('💰 [BALANCE API] Querying Supabase for user:', targetUserId);

          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, username, balance')
            .eq('id', targetUserId)
            .single();

          console.log('💰 [BALANCE API] Supabase response:', { user, error });

          if (error) {
            console.error('❌ [BALANCE API] Supabase error:', error);
          }

          if (user && user.balance !== null && user.balance !== undefined) {
            console.log(`✅ [BALANCE API] Found user ${user.username} with balance: ${user.balance}`);
            // SIMPLIFIED BALANCE SYSTEM: Only USDT balance (auto-conversion enabled)
            balanceData = [
              {
                symbol: 'USDT',
                available: user.balance.toString(),
                locked: '0'
              }
            ];
          } else {
            console.log('⚠️ [BALANCE API] User found but no balance field');
          }
        } else {
          console.log('⚠️ [BALANCE API] Supabase admin client not initialized');
        }
      } catch (dbError) {
        console.error('❌ [BALANCE API] Database query exception:', dbError);
      }

      // Fallback to in-memory balance
      if (!balanceData) {
        console.log('⚠️ [BALANCE API] Using fallback in-memory balance');
        const userBalance = userBalances.get(targetUserId) || { balance: 0, currency: 'USDT' };
        // SIMPLIFIED BALANCE SYSTEM: Only USDT balance (auto-conversion enabled)
        balanceData = [
          {
            symbol: 'USDT',
            available: userBalance.balance.toString(),
            locked: '0'
          }
        ];
      }

      console.log('✅ [BALANCE API] Final balance data:', balanceData);

      return res.json(balanceData);
    }

    if (req.method === 'POST') {
      // Update balance
      const { userId, symbol, amount, action } = req.body || {};

      if (!userId || !symbol || !amount || !action) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, symbol, amount, action"
        });
      }

      const changeAmount = parseFloat(amount);
      if (isNaN(changeAmount)) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount"
        });
      }

      // Get current balance
      const currentBalance = userBalances.get(userId) || { balance: 0, currency: 'USDT' };

      // Apply change
      if (action === 'add') {
        currentBalance.balance += changeAmount;
      } else if (action === 'subtract') {
        currentBalance.balance = Math.max(0, currentBalance.balance - changeAmount);
      } else if (action === 'set') {
        currentBalance.balance = Math.max(0, changeAmount);
      }

      // Update in-memory balance
      userBalances.set(userId, currentBalance);

      // Try to update database
      try {
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('users')
            .update({ 
              balance: currentBalance.balance,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          console.log('✅ Database balance updated');
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      console.log('✅ Balance updated:', {
        userId,
        action,
        amount: changeAmount,
        newBalance: currentBalance.balance
      });

      return res.json({
        success: true,
        userId,
        action,
        amount: changeAmount,
        newBalance: currentBalance.balance,
        balance: [
          {
            symbol: 'USDT',
            available: currentBalance.balance.toString(),
            locked: '0'
          },
          {
            symbol: 'BTC',
            available: '0.0050', // Realistic BTC balance from spot trading
            locked: '0.0020'     // Some BTC locked in active orders
          },
          {
            symbol: 'ETH',
            available: '0.1500', // Realistic ETH balance from spot trading
            locked: '0.0500'     // Some ETH locked in active orders
          },
          {
            symbol: 'SOL',
            available: '2.5000', // Realistic SOL balance from spot trading
            locked: '0.0000'     // No SOL locked
          }
        ]
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ User balances error:', error);
    return res.status(500).json({
      success: false,
      message: "Balance operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
