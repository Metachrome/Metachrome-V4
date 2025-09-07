import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

// Import shared user balances to keep data synchronized
import { userBalances } from '../balances';

// Mock users data for demo - synchronized with balance data
function getMockUsers() {
  const now = new Date();
  const users = [
    {
      id: 'demo-user-1',
      username: 'john_trader',
      email: 'john@example.com',
      role: 'user',
      status: 'active',
      trading_mode: 'normal',
      balance: userBalances.get('demo-user-1')?.balance || 10000,
      isActive: true,
      wallet_address: '0x742d35Cc6479C5f95912c4E8BC2C1234567890AB',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: now.toISOString(),
      last_login: '2024-01-20T14:45:00Z'
    },
    {
      id: 'demo-user-2',
      username: 'sarah_crypto',
      email: 'sarah@example.com',
      role: 'user',
      status: 'active',
      trading_mode: 'win',
      balance: userBalances.get('demo-user-2')?.balance || 25000,
      isActive: true,
      wallet_address: '0x123456789ABCDEF123456789ABCDEF1234567890',
      created_at: '2024-01-10T08:15:00Z',
      updated_at: now.toISOString(),
      last_login: '2024-01-20T12:30:00Z'
    },
    {
      id: 'demo-user-3',
      username: 'mike_hodler',
      email: 'mike@example.com',
      role: 'user',
      status: 'active',
      trading_mode: 'lose',
      balance: userBalances.get('demo-user-3')?.balance || 5000,
      isActive: true,
      wallet_address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
      created_at: '2024-01-05T16:20:00Z',
      updated_at: now.toISOString(),
      last_login: '2024-01-19T09:15:00Z'
    },
    {
      id: 'demo-user-4',
      username: 'emma_trader',
      email: 'emma@example.com',
      role: 'user',
      status: 'suspended',
      trading_mode: 'normal',
      balance: userBalances.get('demo-user-4')?.balance || 1500,
      isActive: false,
      wallet_address: '0x9876543210987654321098765432109876543210',
      created_at: '2024-01-01T12:00:00Z',
      updated_at: now.toISOString(),
      last_login: '2024-01-15T11:20:00Z'
    },
    {
      id: 'demo-admin-1',
      username: 'admin_user',
      email: 'admin@metachrome.io',
      role: 'admin',
      status: 'active',
      trading_mode: 'normal',
      balance: userBalances.get('demo-admin-1')?.balance || 100000,
      isActive: true,
      wallet_address: '0xADMIN123456789ABCDEF123456789ABCDEF123456',
      created_at: '2023-12-01T00:00:00Z',
      updated_at: now.toISOString(),
      last_login: '2024-01-20T16:00:00Z'
    },
    {
      id: 'superadmin-001',
      username: 'superadmin',
      email: 'superadmin@metachrome.io',
      role: 'super_admin',
      status: 'active',
      trading_mode: 'normal',
      balance: userBalances.get('superadmin-001')?.balance || 1000000,
      isActive: true,
      wallet_address: '0xSUPERADMIN123456789ABCDEF123456789ABCDEF',
      created_at: '2023-11-01T00:00:00Z',
      updated_at: now.toISOString(),
      last_login: now.toISOString()
    }
  ];

  return users;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`👥 Admin Users API: ${req.method} ${req.url}`);
    
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
          const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && users && users.length > 0) {
            // Remove passwords from response and format data
            const safeUsers = users.map(user => ({
              ...user,
              password: undefined,
              password_hash: undefined,
              isActive: user.status === 'active'
            }));
            
            console.log('👥 Users from database - Count:', safeUsers.length);
            return res.json(safeUsers);
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      const mockUsers = getMockUsers();
      console.log('👥 Using mock users - Count:', mockUsers.length);
      return res.json(mockUsers);
    }

    if (req.method === 'POST') {
      // Create new user
      const { username, email, password, balance, role, trading_mode } = req.body || {};

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: username, email, password"
        });
      }

      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username,
        email,
        role: role || 'user',
        status: 'active',
        trading_mode: trading_mode || 'normal',
        balance: parseFloat(balance) || 1000,
        isActive: true,
        wallet_address: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null
      };

      // Try to create in database
      try {
        if (supabaseAdmin) {
          const { data: createdUser, error } = await supabaseAdmin
            .from('users')
            .insert({
              ...newUser,
              password_hash: password // In production, this should be hashed
            })
            .select()
            .single();

          if (!error && createdUser) {
            console.log('✅ User created in database:', createdUser.id);
            return res.json({
              success: true,
              user: { ...createdUser, password: undefined, password_hash: undefined },
              message: "User created successfully"
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database creation failed, returning mock response');
      }

      // Fallback response
      console.log('✅ Mock user created:', newUser.id);
      return res.json({
        success: true,
        user: newUser,
        message: "User created successfully (mock)"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin users error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process users request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
