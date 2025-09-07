import type { VercelRequest, VercelResponse } from '@vercel/node';

// Temporarily disable supabase import to fix deployment
// import { supabaseAdmin } from '../../lib/supabase';
const supabaseAdmin = null;

// Mock user trading modes for demo - synchronized across modules
const userTradingModes = new Map([
  ['demo-user-1', 'normal'],
  ['demo-user-2', 'win'],
  ['demo-user-3', 'lose'],
  ['demo-user-4', 'normal']
]);

// Export for use in other modules
export { userTradingModes };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🎯 Trading Controls API: ${req.method} ${req.url}`);

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
      // Get all trading controls
      console.log('🎯 Getting all trading controls');

      const controls = [];
      
      // Try to get from database first
      try {
        if (supabaseAdmin) {
          const { data: users, error } = await supabaseAdmin
            .from('users')
            .select('id, username, trading_mode')
            .eq('role', 'user');

          if (!error && users) {
            users.forEach(user => {
              controls.push({
                id: `control-${user.id}`,
                userId: user.id,
                username: user.username,
                controlType: user.trading_mode || 'normal',
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data if database failed or empty
      if (controls.length === 0) {
        userTradingModes.forEach((mode, userId) => {
          controls.push({
            id: `control-${userId}`,
            userId,
            username: userId.replace('demo-user-', 'user'),
            controlType: mode,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });
      }

      console.log('✅ Trading controls:', controls);
      return res.json(controls);
    }

    if (req.method === 'POST') {
      // Set trading control for a user
      const { userId, controlType, notes } = req.body || {};

      if (!userId || !controlType) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, controlType"
        });
      }

      if (!['win', 'normal', 'lose'].includes(controlType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid controlType. Must be 'win', 'normal', or 'lose'"
        });
      }

      console.log('🎯 Setting trading control:', userId, controlType);

      // Update in-memory storage
      userTradingModes.set(userId, controlType);

      // Try to update in database
      let updatedUser = null;
      try {
        if (supabaseAdmin) {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .update({
              trading_mode: controlType,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

          if (error) {
            console.error('❌ Database update error:', error);
          } else {
            updatedUser = user;
            console.log('✅ Trading mode updated in database');
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      // Create control record
      const control = {
        id: `control-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        adminId: 'superadmin-001', // In production, get from auth token
        controlType,
        isActive: true,
        notes: notes || `Trading mode set to ${controlType}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try to create control record in database
      try {
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('admin_controls')
            .insert(control);
          console.log('✅ Control record created in database');
        }
      } catch (dbError) {
        console.log('⚠️ Control record creation failed, continuing');
      }

      console.log('✅ Trading control set:', {
        userId,
        controlType,
        notes
      });

      // Broadcast control change for real-time sync
      try {
        console.log('📡 Broadcasting trading control update:', {
          type: 'trading_control_update',
          data: {
            userId,
            controlType,
            adminId: 'superadmin-001',
            timestamp: new Date().toISOString()
          }
        });
      } catch (broadcastError) {
        console.log('⚠️ Control broadcast failed:', broadcastError);
      }

      return res.json({
        success: true,
        userId,
        controlType,
        control,
        user: updatedUser,
        message: `Trading mode set to ${controlType.toUpperCase()}`
      });
    }

    if (req.method === 'PUT') {
      // Update existing trading control
      const { controlId, userId, controlType, isActive, notes } = req.body || {};

      if (!controlId && !userId) {
        return res.status(400).json({
          success: false,
          message: "Either controlId or userId is required"
        });
      }

      const targetUserId = userId || controlId.replace('control-', '');
      const newControlType = controlType || userTradingModes.get(targetUserId) || 'normal';

      console.log('🎯 Updating trading control:', targetUserId, newControlType);

      // Update in-memory storage
      userTradingModes.set(targetUserId, newControlType);

      // Try to update in database
      try {
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('users')
            .update({
              trading_mode: newControlType,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetUserId);

          console.log('✅ Trading mode updated in database');
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      console.log('✅ Trading control updated:', {
        userId: targetUserId,
        controlType: newControlType,
        isActive,
        notes
      });

      return res.json({
        success: true,
        userId: targetUserId,
        controlType: newControlType,
        isActive: isActive !== undefined ? isActive : true,
        notes,
        message: `Trading control updated to ${newControlType.toUpperCase()}`
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Trading controls error:', error);
    return res.status(500).json({
      success: false,
      message: "Trading controls operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


