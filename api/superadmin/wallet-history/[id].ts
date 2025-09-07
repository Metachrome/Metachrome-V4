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

// Mock wallet history data
function generateMockWalletHistory(userId: string) {
  const now = new Date();
  const history = [];
  
  // Generate 20 mock transactions for the user
  for (let i = 1; i <= 20; i++) {
    const createdTime = new Date(now.getTime() - (i * 3 * 60 * 60 * 1000)); // 3 hours apart
    const types = ['deposit', 'withdrawal', 'trade_win', 'trade_loss', 'bonus', 'admin_adjustment'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let amount;
    let status = 'completed';
    let description;
    
    switch (type) {
      case 'deposit':
        amount = Math.floor(Math.random() * 5000) + 100;
        description = `Deposit of ${amount} USDT`;
        break;
      case 'withdrawal':
        amount = -(Math.floor(Math.random() * 2000) + 50);
        description = `Withdrawal of ${Math.abs(amount)} USDT`;
        status = Math.random() > 0.8 ? 'pending' : 'completed';
        break;
      case 'trade_win':
        amount = Math.floor(Math.random() * 500) + 10;
        description = `Trading profit: +${amount} USDT`;
        break;
      case 'trade_loss':
        amount = -(Math.floor(Math.random() * 300) + 10);
        description = `Trading loss: ${amount} USDT`;
        break;
      case 'bonus':
        amount = Math.floor(Math.random() * 100) + 5;
        description = `Bonus: +${amount} USDT`;
        break;
      case 'admin_adjustment':
        amount = Math.random() > 0.5 ? 
          Math.floor(Math.random() * 1000) + 50 : 
          -(Math.floor(Math.random() * 500) + 25);
        description = `Admin adjustment: ${amount > 0 ? '+' : ''}${amount} USDT`;
        break;
      default:
        amount = 0;
        description = 'Unknown transaction';
    }

    history.push({
      id: `wallet-${userId}-${i}`,
      user_id: userId,
      type,
      amount,
      status,
      description,
      balance_before: Math.floor(Math.random() * 10000) + 1000,
      balance_after: Math.floor(Math.random() * 10000) + 1000,
      created_at: createdTime.toISOString(),
      updated_at: createdTime.toISOString()
    });
  }

  return history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
        // Try to get from database first
        if (supabaseAdmin) {
          let query = supabaseAdmin
            .from('transactions')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false });

          // Apply filters
          if (type) {
            query = query.eq('type', type);
          }
          if (status) {
            query = query.eq('status', status);
          }

          // Apply limit
          const limitNum = parseInt(limit as string);
          if (!isNaN(limitNum)) {
            query = query.limit(limitNum);
          }

          const { data: transactions, error } = await query;

          if (!error && transactions && transactions.length > 0) {
            console.log(`💰 Wallet history from database - Count: ${transactions.length}`);
            return res.json({
              success: true,
              history: transactions,
              total: transactions.length,
              source: 'database'
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      let mockHistory = generateMockWalletHistory(id);

      // Apply filters to mock data
      if (type) {
        mockHistory = mockHistory.filter(item => item.type === type);
      }
      if (status) {
        mockHistory = mockHistory.filter(item => item.status === status);
      }

      // Apply limit
      const limitNum = parseInt(limit as string);
      if (!isNaN(limitNum)) {
        mockHistory = mockHistory.slice(0, limitNum);
      }

      console.log(`💰 Using mock wallet history - Count: ${mockHistory.length}`);
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
