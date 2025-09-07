import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../../lib/supabase';

// Mock users data
const mockUsers = {
  'demo-user-1': {
    id: 'demo-user-1',
    username: 'john_trader',
    email: 'john@example.com',
    balance: 25000,
    status: 'active',
    role: 'user',
    trading_mode: 'normal',
    created_at: '2025-01-15T10:30:00Z',
    last_login: '2025-09-07T12:00:00Z'
  },
  'demo-user-2': {
    id: 'demo-user-2',
    username: 'sarah_crypto',
    email: 'sarah@example.com',
    balance: 5000,
    status: 'active',
    role: 'user',
    trading_mode: 'lose',
    created_at: '2025-01-10T08:15:00Z',
    last_login: '2025-09-07T11:30:00Z'
  },
  'demo-user-3': {
    id: 'demo-user-3',
    username: 'mike_hodler',
    email: 'mike@example.com',
    balance: 1500,
    status: 'suspended',
    role: 'user',
    trading_mode: 'normal',
    created_at: '2025-01-05T14:20:00Z',
    last_login: '2025-09-06T16:45:00Z'
  },
  'demo-user-4': {
    id: 'demo-user-4',
    username: 'emma_trader',
    email: 'emma@example.com',
    balance: 100000,
    status: 'active',
    role: 'admin',
    trading_mode: 'normal',
    created_at: '2025-01-01T09:00:00Z',
    last_login: '2025-09-07T13:15:00Z'
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    console.log(`👤 Admin User API: ${req.method} ${req.url} - User ID: ${id}`);
    
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
      try {
        // Try to get from database first
        if (supabaseAdmin) {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && user) {
            console.log('👤 User from database:', user.username);
            return res.json({
              success: true,
              user,
              source: 'database'
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      const mockUser = mockUsers[id as keyof typeof mockUsers];
      if (mockUser) {
        console.log('👤 Using mock user:', mockUser.username);
        return res.json({
          success: true,
          user: mockUser,
          source: 'mock'
        });
      }

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (req.method === 'PUT') {
      const { username, email, balance, status, role, trading_mode } = req.body || {};

      try {
        // Try to update in database first
        if (supabaseAdmin) {
          const updateData: any = {};
          
          if (username !== undefined) updateData.username = username;
          if (email !== undefined) updateData.email = email;
          if (balance !== undefined) updateData.balance = parseFloat(balance);
          if (status !== undefined) updateData.status = status;
          if (role !== undefined) updateData.role = role;
          if (trading_mode !== undefined) updateData.trading_mode = trading_mode;

          updateData.updated_at = new Date().toISOString();

          const { data: updatedUser, error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

          if (!error && updatedUser) {
            console.log('👤 User updated in database:', updatedUser.username);
            return res.json({
              success: true,
              user: updatedUser,
              message: "User updated successfully"
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, using mock response');
      }

      // Fallback to mock update
      const mockUser = mockUsers[id as keyof typeof mockUsers];
      if (mockUser) {
        const updatedMockUser = {
          ...mockUser,
          ...(username !== undefined && { username }),
          ...(email !== undefined && { email }),
          ...(balance !== undefined && { balance: parseFloat(balance) }),
          ...(status !== undefined && { status }),
          ...(role !== undefined && { role }),
          ...(trading_mode !== undefined && { trading_mode }),
          updated_at: new Date().toISOString()
        };

        // Update the mock data
        mockUsers[id as keyof typeof mockUsers] = updatedMockUser;

        console.log('👤 Mock user updated:', updatedMockUser.username);
        return res.json({
          success: true,
          user: updatedMockUser,
          message: "User updated successfully"
        });
      }

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (req.method === 'DELETE') {
      try {
        // Try to delete from database first
        if (supabaseAdmin) {
          const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

          if (!error) {
            console.log('👤 User deleted from database:', id);
            return res.json({
              success: true,
              message: "User deleted successfully"
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database delete failed, using mock response');
      }

      // Fallback to mock delete
      if (mockUsers[id as keyof typeof mockUsers]) {
        delete mockUsers[id as keyof typeof mockUsers];
        console.log('👤 Mock user deleted:', id);
        return res.json({
          success: true,
          message: "User deleted successfully"
        });
      }

      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin user error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process user request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
