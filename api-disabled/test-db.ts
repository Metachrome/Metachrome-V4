import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🧪 Test DB API called');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    console.log('🔧 Environment check:', {
      supabaseUrl: supabaseUrl ? 'configured' : 'missing',
      serviceKey: supabaseServiceKey ? 'configured' : 'missing',
      nodeEnv: process.env.NODE_ENV
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        success: false,
        message: 'Supabase configuration missing',
        env: {
          supabaseUrl: supabaseUrl ? 'configured' : 'missing',
          serviceKey: supabaseServiceKey ? 'configured' : 'missing'
        }
      });
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test database connection
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, balance, status, trading_mode')
      .limit(10);
    
    if (error) {
      console.error('❌ Database query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: error.message
      });
    }
    
    console.log('✅ Database query successful, users found:', users?.length || 0);
    
    // Calculate stats
    const stats = {
      totalUsers: users?.length || 0,
      activeUsers: users?.filter(u => u.status === 'active').length || 0,
      totalBalance: users?.reduce((sum, u) => sum + (u.balance || 0), 0) || 0,
      timestamp: new Date().toISOString()
    };
    
    return res.json({
      success: true,
      message: 'Database connection successful',
      stats,
      users: users || [],
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      }
    });
    
  } catch (error) {
    console.error('❌ Test DB error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
