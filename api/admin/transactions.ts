import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

// Generate dynamic mock transactions data for demo
function generateMockTransactions() {
  const now = new Date();
  const transactions = [];
  const users = ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4'];
  const usernames = ['john_trader', 'sarah_crypto', 'mike_hodler', 'emma_trader'];
  const types = ['deposit', 'withdrawal', 'trade_win', 'trade_loss', 'admin_adjustment'];

  // Add some static base transactions
  transactions.push(
    {
      id: 'txn-1',
      user_id: 'demo-user-1',
      username: 'john_trader',
      type: 'deposit',
      amount: 1000,
      symbol: 'USDT',
      status: 'completed',
      description: 'Initial deposit',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      users: { username: 'john_trader' }
    },
    {
      id: 'txn-2',
      user_id: 'demo-user-2',
      username: 'sarah_crypto',
      type: 'deposit',
      amount: 5000,
      symbol: 'USDT',
      status: 'completed',
      description: 'Account funding',
      created_at: '2024-01-10T08:15:00Z',
      updated_at: '2024-01-10T08:15:00Z',
      users: { username: 'sarah_crypto' }
    }
  );

  // Generate recent dynamic transactions
  for (let i = 3; i <= 25; i++) {
    const userIndex = Math.floor(Math.random() * users.length);
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 1000) + 50;
    const createdTime = new Date(now.getTime() - (i * 20 * 60 * 1000)); // 20 minutes apart

    let status = 'completed';
    if (type === 'withdrawal' && Math.random() > 0.8) {
      status = 'pending';
    }

    transactions.push({
      id: `txn-${i}`,
      user_id: users[userIndex],
      username: usernames[userIndex],
      type,
      amount: type.includes('loss') ? -amount : amount,
      symbol: 'USDT',
      status,
      description: getTransactionDescription(type, amount),
      created_at: createdTime.toISOString(),
      updated_at: createdTime.toISOString(),
      users: { username: usernames[userIndex] }
    });
  }

  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function getTransactionDescription(type: string, amount: number): string {
  switch (type) {
    case 'deposit':
      return `Deposit of ${amount} USDT`;
    case 'withdrawal':
      return `Withdrawal of ${amount} USDT`;
    case 'trade_win':
      return `Trading profit: +${amount} USDT`;
    case 'trade_loss':
      return `Trading loss: -${amount} USDT`;
    case 'admin_adjustment':
      return `Admin balance adjustment: ${amount > 0 ? '+' : ''}${amount} USDT`;
    default:
      return `Transaction: ${amount} USDT`;
  }
}

// Generate mock transactions
const MOCK_TRANSACTIONS = generateMockTransactions();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💰 Admin Transactions API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

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
