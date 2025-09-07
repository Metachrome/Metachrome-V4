import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';

// Mock transactions data for demo
const MOCK_TRANSACTIONS = [
  {
    id: 'txn-1',
    user_id: 'demo-user-1',
    username: 'john_trader',
    type: 'deposit',
    amount: 1000,
    status: 'completed',
    description: 'Initial deposit',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'txn-2',
    user_id: 'demo-user-2',
    username: 'sarah_crypto',
    type: 'deposit',
    amount: 5000,
    status: 'completed',
    description: 'Account funding',
    created_at: '2024-01-10T08:15:00Z',
    updated_at: '2024-01-10T08:15:00Z'
  },
  {
    id: 'txn-3',
    user_id: 'demo-user-1',
    username: 'john_trader',
    type: 'trade_win',
    amount: 10,
    status: 'completed',
    description: 'Options trade win - BTCUSDT up',
    created_at: '2024-01-20T14:30:30Z',
    updated_at: '2024-01-20T14:30:30Z'
  },
  {
    id: 'txn-4',
    user_id: 'demo-user-3',
    username: 'mike_hodler',
    type: 'trade_loss',
    amount: -200,
    status: 'completed',
    description: 'Options trade loss - BTCUSDT up',
    created_at: '2024-01-20T14:20:30Z',
    updated_at: '2024-01-20T14:20:30Z'
  },
  {
    id: 'txn-5',
    user_id: 'demo-user-2',
    username: 'sarah_crypto',
    type: 'trade_win',
    amount: 75,
    status: 'completed',
    description: 'Options trade win - BTCUSDT down',
    created_at: '2024-01-20T14:26:00Z',
    updated_at: '2024-01-20T14:26:00Z'
  },
  {
    id: 'txn-6',
    user_id: 'demo-user-4',
    username: 'emma_trader',
    type: 'withdrawal',
    amount: -500,
    status: 'pending',
    description: 'Withdrawal request',
    created_at: '2024-01-18T15:45:00Z',
    updated_at: '2024-01-18T15:45:00Z'
  },
  {
    id: 'txn-7',
    user_id: 'demo-user-2',
    username: 'sarah_crypto',
    type: 'trade_win',
    amount: 150,
    status: 'completed',
    description: 'Options trade win - BTCUSDT up',
    created_at: '2024-01-20T14:16:00Z',
    updated_at: '2024-01-20T14:16:00Z'
  },
  {
    id: 'txn-8',
    user_id: 'demo-user-1',
    username: 'john_trader',
    type: 'bonus',
    amount: 100,
    status: 'completed',
    description: 'Welcome bonus',
    created_at: '2024-01-15T10:35:00Z',
    updated_at: '2024-01-15T10:35:00Z'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💰 Admin Transactions API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      try {
        // Try to get from database first
        if (supabaseAdmin) {
          const { data: transactions, error } = await supabaseAdmin
            .from('transactions')
            .select(`
              *,
              users!inner(username)
            `)
            .order('created_at', { ascending: false });

          if (!error && transactions && transactions.length > 0) {
            // Format transactions data
            const formattedTransactions = transactions.map(txn => ({
              ...txn,
              username: txn.users?.username || 'Unknown User'
            }));
            
            console.log('💰 Transactions from database - Count:', formattedTransactions.length);
            return res.json(formattedTransactions);
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      console.log('💰 Using mock transactions - Count:', MOCK_TRANSACTIONS.length);
      return res.json(MOCK_TRANSACTIONS);
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin transactions error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process transactions request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
