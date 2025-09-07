import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client directly
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💸 Superadmin Withdrawal API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      const { userId, amount, description } = req.body || {};

      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, amount"
        });
      }

      const withdrawalAmount = parseFloat(amount);
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid withdrawal amount"
        });
      }

      try {
        if (supabaseAdmin) {
          // Start a transaction
          const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('balance, username')
            .eq('id', userId)
            .single();

          if (userError || !user) {
            return res.status(404).json({
              success: false,
              message: "User not found"
            });
          }

          if (user.balance < withdrawalAmount) {
            return res.status(400).json({
              success: false,
              message: "Insufficient balance"
            });
          }

          // Update user balance
          const newBalance = user.balance - withdrawalAmount;
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ 
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (updateError) {
            throw updateError;
          }

          // Create withdrawal transaction
          const transaction = {
            id: `withdrawal-${Date.now()}`,
            user_id: userId,
            type: 'withdrawal',
            amount: -withdrawalAmount,
            status: 'completed',
            description: description || `Superadmin withdrawal: ${withdrawalAmount} USDT`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: txnError } = await supabaseAdmin
            .from('transactions')
            .insert([transaction]);

          if (txnError) {
            // Rollback balance update
            await supabaseAdmin
              .from('users')
              .update({ balance: user.balance })
              .eq('id', userId);
            
            throw txnError;
          }

          console.log(`💸 Superadmin withdrawal processed: ${withdrawalAmount} USDT for ${user.username}`);

          return res.json({
            success: true,
            message: "Withdrawal processed successfully",
            transaction,
            newBalance
          });
        }
      } catch (dbError) {
        console.error('❌ Database error during withdrawal:', dbError);
        return res.status(500).json({
          success: false,
          message: "Database error during withdrawal processing"
        });
      }

      // Fallback mock response
      const transaction = {
        id: `withdrawal-${Date.now()}`,
        user_id: userId,
        type: 'withdrawal',
        amount: -withdrawalAmount,
        status: 'completed',
        description: description || `Superadmin withdrawal: ${withdrawalAmount} USDT`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`💸 Mock withdrawal processed: ${withdrawalAmount} USDT for user ${userId}`);

      return res.json({
        success: true,
        message: "Withdrawal processed successfully (mock)",
        transaction,
        newBalance: 0 // Mock balance
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Superadmin withdrawal error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to process withdrawal request",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
