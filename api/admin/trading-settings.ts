import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

// Mock trading settings for demo
const MOCK_TRADING_SETTINGS = [
  {
    id: 'setting-30s',
    duration: 30,
    min_amount: 100,
    profit_percentage: 10,
    enabled: true,
    max_amount: 10000,
    risk_multiplier: 1.0,
    market_hours_only: false,
    allowed_symbols: ['BTCUSDT', 'ETHUSDT'],
    cooldown_period: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T16:00:00Z'
  },
  {
    id: 'setting-60s',
    duration: 60,
    min_amount: 1000,
    profit_percentage: 15,
    enabled: true,
    max_amount: 50000,
    risk_multiplier: 1.2,
    market_hours_only: false,
    allowed_symbols: ['BTCUSDT', 'ETHUSDT'],
    cooldown_period: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T16:00:00Z'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`⚙️ Admin Trading Settings API: ${req.method} ${req.url}`);

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
          const { data: settings, error } = await supabaseAdmin
            .from('trading_settings')
            .select('*')
            .order('duration', { ascending: true });

          if (!error && settings && settings.length > 0) {
            console.log('⚙️ Trading settings from database - Count:', settings.length);
            return res.json(settings);
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data
      console.log('⚙️ Using mock trading settings - Count:', MOCK_TRADING_SETTINGS.length);
      return res.json(MOCK_TRADING_SETTINGS);
    }

    if (req.method === 'PUT') {
      // Update trading settings
      const { id, ...updates } = req.body || {};

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Setting ID is required"
        });
      }

      try {
        // Try to update in database
        if (supabaseAdmin) {
          const { data: updatedSetting, error } = await supabaseAdmin
            .from('trading_settings')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

          if (!error && updatedSetting) {
            console.log('✅ Trading setting updated in database:', id);
            return res.json({
              success: true,
              setting: updatedSetting,
              message: "Trading setting updated successfully"
            });
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, returning mock response');
      }

      // Fallback response
      const mockUpdatedSetting = MOCK_TRADING_SETTINGS.find(s => s.id === id);
      if (mockUpdatedSetting) {
        Object.assign(mockUpdatedSetting, updates, { updated_at: new Date().toISOString() });
      }

      console.log('✅ Mock trading setting updated:', id);
      return res.json({
        success: true,
        setting: mockUpdatedSetting,
        message: "Trading setting updated successfully (mock)"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Admin trading settings error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process trading settings request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
