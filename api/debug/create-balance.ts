import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, symbol, available, locked } = req.body;

    if (!userId || !symbol) {
      return res.status(400).json({ message: 'userId and symbol are required' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ message: 'Supabase not configured' });
    }

    // Check if balance already exists
    const { data: existingBalance, error: fetchError } = await supabaseAdmin
      .from('balances')
      .select('*')
      .eq('userId', userId)
      .eq('symbol', symbol)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(500).json({ 
        message: 'Error checking existing balance',
        error: fetchError.message 
      });
    }

    if (existingBalance) {
      // Update existing balance
      const newAvailable = parseFloat(existingBalance.available) + parseFloat(available || '0');
      const newLocked = parseFloat(existingBalance.locked) + parseFloat(locked || '0');

      const { data: updatedBalance, error: updateError } = await supabaseAdmin
        .from('balances')
        .update({
          available: newAvailable.toFixed(8),
          locked: newLocked.toFixed(8),
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)
        .eq('symbol', symbol)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({
          message: 'Error updating balance',
          error: updateError.message
        });
      }

      return res.json({
        success: true,
        action: 'updated',
        balance: updatedBalance
      });

    } else {
      // Create new balance
      const { data: newBalance, error: insertError } = await supabaseAdmin
        .from('balances')
        .insert({
          userId,
          symbol,
          available: parseFloat(available || '0').toFixed(8),
          locked: parseFloat(locked || '0').toFixed(8)
        })
        .select()
        .single();

      if (insertError) {
        return res.status(500).json({
          message: 'Error creating balance',
          error: insertError.message
        });
      }

      return res.json({
        success: true,
        action: 'created',
        balance: newBalance
      });
    }

  } catch (error: any) {
    return res.status(500).json({
      message: 'Create balance endpoint failed',
      error: error.message
    });
  }
}
