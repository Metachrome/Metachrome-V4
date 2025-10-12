import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      userId,
      supabaseConfigured: !!supabaseAdmin,
      environment: process.env.NODE_ENV || 'development'
    };

    if (supabaseAdmin) {
      try {
        // Check if balances table exists and get user balances
        const { data: balances, error: balancesError } = await supabaseAdmin
          .from('balances')
          .select('*')
          .eq('user_id', userId);

        debugInfo.balancesQuery = {
          success: !balancesError,
          error: balancesError?.message,
          count: balances?.length || 0,
          data: balances
        };

        // Check user table
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('id, username, balance')
          .eq('id', userId)
          .single();

        debugInfo.userQuery = {
          success: !userError,
          error: userError?.message,
          data: user
        };

        // Try to get table schema info
        const { data: tableInfo, error: tableError } = await supabaseAdmin
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_name', 'balances');

        debugInfo.tableExists = {
          success: !tableError,
          exists: tableInfo && tableInfo.length > 0,
          error: tableError?.message
        };

      } catch (dbError: any) {
        debugInfo.databaseError = dbError.message;
      }
    } else {
      debugInfo.supabaseError = 'Supabase not configured - missing URL or service key';
    }

    return res.json(debugInfo);

  } catch (error: any) {
    return res.status(500).json({
      message: 'Debug endpoint failed',
      error: error.message
    });
  }
}
