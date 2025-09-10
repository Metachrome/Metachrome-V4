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
  ['demo-user-2', { balance: 25000, currency: 'USDT' }],
  ['demo-user-3', { balance: 5000, currency: 'USDT' }],
  ['demo-user-4', { balance: 1500, currency: 'USDT' }],
  ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
]);

// Export userBalances for use in other modules
export { userBalances };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💰 Balances API: ${req.method} ${req.url}`);
    
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
      
      // Extract user ID from auth token or use default
      let targetUserId = userId as string;
      
      // Try to extract from Authorization header if no userId provided
      if (!targetUserId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // In a real app, you'd decode the JWT token here
          // For now, we'll use a default user
          targetUserId = 'demo-user-1';
        } else {
          targetUserId = 'demo-user-1';
        }
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
            balanceData = {
              USDT: {
                available: user.balance.toString(),
                locked: '0',
                symbol: 'USDT'
              }
            };
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using in-memory balance');
      }

      // Fallback to in-memory balance
      if (!balanceData) {
        const userBalance = userBalances.get(targetUserId) || { balance: 10000, currency: 'USDT' };
        balanceData = {
          USDT: {
            available: userBalance.balance.toString(),
            locked: '0',
            symbol: 'USDT'
          }
        };
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

      // Broadcast balance update for real-time sync (if WebSocket is available)
      try {
        // This would be handled by the WebSocket server in a full implementation
        // For now, we'll just log the broadcast intent
        console.log('📡 Broadcasting balance update:', {
          type: 'balance_update',
          data: {
            userId,
            symbol: 'USDT',
            newBalance: currentBalance.balance,
            action,
            amount: changeAmount
          }
        });
      } catch (broadcastError) {
        console.log('⚠️ Balance broadcast failed:', broadcastError);
      }

      return res.json({
        success: true,
        userId,
        action,
        amount: changeAmount,
        newBalance: currentBalance.balance,
        balance: {
          USDT: {
            available: currentBalance.balance.toString(),
            locked: '0',
            symbol: 'USDT'
          }
        }
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Balances error:', error);
    return res.status(500).json({
      success: false,
      message: "Balance operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export the userBalances map so other modules can access it
export { userBalances };
