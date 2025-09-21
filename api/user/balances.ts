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

      // Handle admin users - map them to their trading profile for balance display
      if (targetUserId === 'superadmin-001' || targetUserId === 'admin-001') {
        targetUserId = `${targetUserId}-trading`;
        console.log(`🔧 Admin user ${userId} balance mapped to ${targetUserId}`);
      }

      console.log('💰 Getting balance for user:', targetUserId);

      // Try to get from database first
      let balanceData = null;
      try {
        if (supabaseAdmin) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('balance')
            .eq('id', targetUserId)
            .single();

          if (user) {
            balanceData = [
              {
                symbol: 'USDT',
                available: user.balance.toString(),
                locked: '0'
              },
              {
                symbol: 'BTC',
                available: '0.5', // Default BTC balance for testing
                locked: '0'
              },
              {
                symbol: 'ETH',
                available: '2.0', // Default ETH balance for testing
                locked: '0'
              },
              {
                symbol: 'SOL',
                available: '10.0', // Default SOL balance for testing
                locked: '0'
              }
            ];
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using in-memory balance');
      }

      // Fallback to in-memory balance
      if (!balanceData) {
        const userBalance = userBalances.get(targetUserId) || { balance: 0, currency: 'USDT' };
        balanceData = [
          {
            symbol: 'USDT',
            available: userBalance.balance.toString(),
            locked: '0'
          },
          {
            symbol: 'BTC',
            available: '0.5', // Default BTC balance for testing
            locked: '0'
          },
          {
            symbol: 'ETH',
            available: '2.0', // Default ETH balance for testing
            locked: '0'
          },
          {
            symbol: 'SOL',
            available: '10.0', // Default SOL balance for testing
            locked: '0'
          }
        ];
      }

      console.log('✅ Balance data:', balanceData);

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
            available: '0.5', // Default BTC balance for testing
            locked: '0'
          },
          {
            symbol: 'ETH',
            available: '2.0', // Default ETH balance for testing
            locked: '0'
          },
          {
            symbol: 'SOL',
            available: '10.0', // Default SOL balance for testing
            locked: '0'
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
