import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';

// Import shared user balances
let userBalances: Map<string, { balance: number; currency: string }>;

// Initialize shared balance storage
try {
  const balancesModule = require('../balances');
  userBalances = balancesModule.userBalances;
} catch {
  userBalances = new Map([
    ['user-1', { balance: 10000, currency: 'USDT' }],
    ['demo-user-1', { balance: 10000, currency: 'USDT' }],
    ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
  ]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`👤 User Profile API: ${req.method} ${req.url}`);
    
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

      console.log('👤 Getting profile for user:', targetUserId);

      // Try to get from database first
      let userProfile = null;
      try {
        if (supabaseAdmin) {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, username, email, role, status, trading_mode, balance, wallet_address, created_at, updated_at, last_login')
            .eq('id', targetUserId)
            .single();

          if (!error && user) {
            userProfile = {
              ...user,
              password: undefined,
              password_hash: undefined,
              isActive: user.status === 'active'
            };
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      if (!userProfile) {
        const userBalance = userBalances.get(targetUserId) || { balance: 10000, currency: 'USDT' };
        userProfile = {
          id: targetUserId,
          username: targetUserId.replace('demo-user-', 'user'),
          email: `${targetUserId.replace('demo-user-', 'user')}@example.com`,
          role: 'user',
          status: 'active',
          trading_mode: 'normal',
          balance: userBalance.balance,
          wallet_address: null,
          isActive: true,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
      }

      console.log('✅ User profile:', userProfile);

      return res.json({
        success: true,
        user: userProfile
      });
    }

    if (req.method === 'PUT') {
      // Update user profile
      const { userId, updates } = req.body || {};

      if (!userId || !updates) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, updates"
        });
      }

      console.log('👤 Updating profile for user:', userId, 'updates:', updates);

      // Try to update in database
      let updatedUser = null;
      try {
        if (supabaseAdmin) {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select('id, username, email, role, status, trading_mode, balance, wallet_address, created_at, updated_at, last_login')
            .single();

          if (error) {
            console.error('❌ Database update error:', error);
            return res.status(500).json({
              success: false,
              message: "Failed to update profile in database"
            });
          }

          updatedUser = {
            ...user,
            password: undefined,
            password_hash: undefined,
            isActive: user.status === 'active'
          };
          console.log('✅ Profile updated in database');
        }
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: "Database operation failed"
        });
      }

      // If no database, return mock success
      if (!updatedUser) {
        const userBalance = userBalances.get(userId) || { balance: 10000, currency: 'USDT' };
        updatedUser = {
          id: userId,
          username: userId.replace('demo-user-', 'user'),
          email: `${userId.replace('demo-user-', 'user')}@example.com`,
          role: 'user',
          status: 'active',
          trading_mode: 'normal',
          balance: userBalance.balance,
          wallet_address: null,
          isActive: true,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          ...updates
        };
        console.log('✅ Mock profile update completed');
      }

      console.log('✅ Profile updated successfully for user:', userId);

      return res.json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ User profile error:', error);
    return res.status(500).json({
      success: false,
      message: "Profile operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
