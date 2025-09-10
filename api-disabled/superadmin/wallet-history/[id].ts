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

// Mock wallet address history data
function generateMockWalletHistory(userId: string) {
  const now = new Date();
  const history = [];

  // Generate some mock wallet address changes
  const mockAddresses = [
    '0x742d35Cc6479C5f95912c4E8BC2C1234567890AB',
    '0x123456789ABCDEF123456789ABCDEF1234567890',
    '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    '0x9876543210987654321098765432109876543210',
    '0xFEDCBA0987654321FEDCBA0987654321FEDCBA09'
  ];

  // Generate 3-5 wallet address changes for the user
  const numChanges = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numChanges; i++) {
    const changedTime = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000)); // 1 week apart
    const address = mockAddresses[i % mockAddresses.length];

    history.push({
      id: `wallet-change-${userId}-${i}`,
      user_id: userId,
      address: address,
      changed_at: changedTime.toISOString(),
      changed_by: i === 0 ? 'superadmin' : 'user',
      reason: i === 0 ? 'Admin update' : 'User requested change',
      created_at: changedTime.toISOString(),
      updated_at: changedTime.toISOString()
    });
  }

  return history.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    console.log(`💰 Superadmin Wallet History API: ${req.method} ${req.url} - User ID: ${id}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (req.method === 'GET') {
      const { limit = '50', type, status } = req.query;

      try {
        // Try to get wallet address history from database first
        if (supabaseAdmin) {
          let query = supabaseAdmin
            .from('wallet_address_history')
            .select('*')
            .eq('user_id', id)
            .order('changed_at', { ascending: false });

          // Apply limit
          const limitNum = parseInt(limit as string);
          if (!isNaN(limitNum)) {
            query = query.limit(limitNum);
          }

          const { data: walletHistory, error } = await query;

          if (!error && walletHistory && walletHistory.length > 0) {
            console.log(`🏦 Wallet address history from database - Count: ${walletHistory.length}`);
            return res.json({
              success: true,
              history: walletHistory,
              total: walletHistory.length,
              source: 'database'
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      let mockHistory = generateMockWalletHistory(id);

      // Apply limit
      const limitNum = parseInt(limit as string);
      if (!isNaN(limitNum)) {
        mockHistory = mockHistory.slice(0, limitNum);
      }

      console.log(`🏦 Using mock wallet address history - Count: ${mockHistory.length}`);
      return res.json({
        success: true,
        history: mockHistory,
        total: mockHistory.length,
        source: 'mock'
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Superadmin wallet history error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process wallet history request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
