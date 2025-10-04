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
    console.log(`💰 [/api/balances] API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      // Get user from auth token
      const authToken = req.headers.authorization?.replace('Bearer ', '');
      console.log('💰 [/api/balances] Auth token:', authToken?.substring(0, 30) + '...');

      if (!authToken) {
        console.log('💰 [/api/balances] ERROR: No auth token provided');
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Extract user ID from token or get from query
      let userId = req.query.userId as string;

      // Try to get user ID from Supabase session if not in query
      if (!userId && supabaseAdmin) {
        try {
          // For admin tokens, extract from token pattern
          if (authToken.startsWith('admin-session-') || authToken.startsWith('token_superadmin-')) {
            // Extract user ID from admin dashboard or use query
            console.log('💰 [/api/balances] Admin token detected');
          }
        } catch (error) {
          console.error('💰 [/api/balances] Error extracting user from token:', error);
        }
      }

      // Fallback: try to get user from localStorage pattern (for demo)
      if (!userId) {
        // Check if it's a known demo user
        if (authToken.includes('superadmin')) {
          userId = 'superadmin-001';
        } else if (authToken.includes('admin')) {
          userId = 'admin-001';
        }
      }

      console.log('💰 [/api/balances] Target userId:', userId);

      // Try to get from database first
      let balanceData = null;
      try {
        if (supabaseAdmin && userId) {
          console.log('💰 [/api/balances] Querying Supabase for user:', userId);
          
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, username, balance')
            .eq('id', userId)
            .single();

          console.log('💰 [/api/balances] Supabase response:', { user, error });

          if (error) {
            console.error('❌ [/api/balances] Supabase error:', error);
          }

          if (user && user.balance !== null && user.balance !== undefined) {
            console.log(`✅ [/api/balances] Found user ${user.username} with balance: ${user.balance}`);
            // SIMPLIFIED BALANCE SYSTEM: Only USDT balance (auto-conversion enabled)
            balanceData = [
              {
                symbol: 'USDT',
                available: user.balance.toString(),
                locked: '0'
              }
            ];
          } else {
            console.log('⚠️ [/api/balances] User found but no balance field');
          }
        } else {
          console.log('⚠️ [/api/balances] Supabase admin client not initialized or no userId');
        }
      } catch (dbError) {
        console.error('❌ [/api/balances] Database query exception:', dbError);
      }

      // Fallback to in-memory balance
      if (!balanceData) {
        console.log('⚠️ [/api/balances] Using fallback in-memory balance');
        const userBalance = userBalances.get(userId || 'demo-user-1') || { balance: 0, currency: 'USDT' };
        // SIMPLIFIED BALANCE SYSTEM: Only USDT balance (auto-conversion enabled)
        balanceData = [
          {
            symbol: 'USDT',
            available: userBalance.balance.toString(),
            locked: '0'
          }
        ];
      }

      console.log('✅ [/api/balances] Final balance data:', balanceData);

      return res.json(balanceData);
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ [/api/balances] error:', error);
    return res.status(500).json({
      success: false,
      message: "Balance operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

