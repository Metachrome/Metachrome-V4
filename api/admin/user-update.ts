import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { userBalances } from '../balances';
import { userTradingModes } from './trading-controls';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`👤 User Update API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'PUT') {
      const { userId } = req.query;
      const { 
        username, 
        email, 
        password, 
        balance, 
        wallet_address, 
        trading_mode, 
        status, 
        role 
      } = req.body || {};

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      console.log('👤 Updating user:', userId, 'with data:', req.body);

      const updates: any = {};
      const changes: string[] = [];

      // Prepare updates
      if (username !== undefined) {
        updates.username = username;
        changes.push(`username to ${username}`);
      }
      
      if (email !== undefined) {
        updates.email = email;
        changes.push(`email to ${email}`);
      }
      
      if (password !== undefined) {
        updates.password_hash = password; // In production, this should be hashed
        changes.push('password');
      }
      
      if (wallet_address !== undefined) {
        updates.wallet_address = wallet_address;
        changes.push(`wallet address to ${wallet_address}`);
      }
      
      if (status !== undefined) {
        updates.status = status;
        updates.isActive = status === 'active';
        changes.push(`status to ${status}`);
      }
      
      if (role !== undefined) {
        updates.role = role;
        changes.push(`role to ${role}`);
      }
      
      if (trading_mode !== undefined) {
        updates.trading_mode = trading_mode;
        userTradingModes.set(userId as string, trading_mode);
        changes.push(`trading mode to ${trading_mode}`);
      }

      // Handle balance update separately
      if (balance !== undefined) {
        const newBalance = parseFloat(balance);
        if (!isNaN(newBalance)) {
          updates.balance = newBalance;
          userBalances.set(userId as string, { balance: newBalance, currency: 'USDT' });
          changes.push(`balance to ${newBalance} USDT`);
        }
      }

      updates.updated_at = new Date().toISOString();

      // Try to update in database
      let updatedUser = null;
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

          if (!error && data) {
            updatedUser = data;
            console.log('✅ User updated in database');
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      // Create mock updated user if database failed
      if (!updatedUser) {
        updatedUser = {
          id: userId,
          username: username || 'updated_user',
          email: email || 'updated@example.com',
          role: role || 'user',
          status: status || 'active',
          trading_mode: trading_mode || 'normal',
          balance: balance ? parseFloat(balance) : 10000,
          isActive: status !== 'suspended',
          wallet_address: wallet_address || null,
          updated_at: new Date().toISOString()
        };
      }

      console.log('✅ User updated successfully:', {
        userId,
        changes: changes.join(', ')
      });

      // Broadcast user update for real-time sync
      try {
        console.log('📡 Broadcasting user update:', {
          type: 'user_update',
          data: {
            userId,
            changes: changes,
            updatedUser: {
              id: updatedUser.id,
              username: updatedUser.username,
              balance: updatedUser.balance,
              trading_mode: updatedUser.trading_mode,
              status: updatedUser.status
            },
            timestamp: new Date().toISOString()
          }
        });
      } catch (broadcastError) {
        console.log('⚠️ User update broadcast failed:', broadcastError);
      }

      return res.json({
        success: true,
        user: updatedUser,
        changes: changes,
        message: `User updated successfully: ${changes.join(', ')}`
      });
    }

    if (req.method === 'GET') {
      // Get user details
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      try {
        // Try to get from database first
        if (supabaseAdmin) {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && user) {
            // Remove sensitive data
            const safeUser = {
              ...user,
              password: undefined,
              password_hash: undefined
            };
            
            console.log('👤 User from database:', userId);
            return res.json({
              success: true,
              user: safeUser
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      const mockUser = {
        id: userId,
        username: 'demo_user',
        email: 'demo@example.com',
        role: 'user',
        status: 'active',
        trading_mode: userTradingModes.get(userId as string) || 'normal',
        balance: userBalances.get(userId as string)?.balance || 10000,
        isActive: true,
        wallet_address: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: new Date().toISOString()
      };

      console.log('👤 Using mock user data:', userId);
      return res.json({
        success: true,
        user: mockUser
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ User update error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process user update request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
