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
    const { userId, symbol, side, amount, price, type } = req.body;
    
    console.log('💰 Spot trade request:', { userId, symbol, side, amount, price, type });

    if (!userId || !symbol || !side || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, symbol, side, amount"
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        message: "Database not configured"
      });
    }

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const tradeAmount = parseFloat(amount);
    const tradePrice = parseFloat(price || '65000'); // Default BTC price if not provided
    const userBalance = parseFloat(user.balance || '0');

    // Extract cryptocurrency symbol from trading pair (e.g., BTCUSDT -> BTC)
    const cryptoSymbol = symbol.replace('USDT', '');
    
    if (side === 'buy') {
      // BUY ORDER: Deduct USDT, Add Cryptocurrency
      const totalCost = tradeAmount * tradePrice;
      if (userBalance < totalCost) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient USDT balance'
        });
      }

      // Deduct USDT balance
      const newUsdtBalance = userBalance - totalCost;
      
      // Update user USDT balance
      const { error: balanceError } = await supabaseAdmin
        .from('users')
        .update({
          balance: newUsdtBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (balanceError) {
        console.error('❌ Error updating USDT balance:', balanceError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update USDT balance'
        });
      }

      // Add cryptocurrency to user's balance
      try {
        // Check if user already has this cryptocurrency balance
        const { data: existingBalance, error: fetchError } = await supabaseAdmin
          .from('balances')
          .select('*')
          .eq('user_id', userId)
          .eq('currency', cryptoSymbol)  // FIXED: Use 'currency' column, not 'symbol'
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('❌ Error fetching crypto balance:', fetchError);
        }

        if (existingBalance) {
          // Update existing balance
          const newCryptoAmount = parseFloat(existingBalance.balance || '0') + tradeAmount;  // FIXED: Use 'balance' column
          const { error: updateError } = await supabaseAdmin
            .from('balances')
            .update({
              balance: newCryptoAmount.toFixed(8),  // FIXED: Use 'balance' column, not 'available'
              updated_at: new Date().toISOString()  // FIXED: Use 'updated_at' (snake_case)
            })
            .eq('user_id', userId)
            .eq('currency', cryptoSymbol);  // FIXED: Use 'currency' column

          if (updateError) {
            console.error('❌ Error updating crypto balance:', updateError);
          } else {
            console.log(`✅ Updated ${cryptoSymbol} balance: +${tradeAmount} (total: ${newCryptoAmount.toFixed(8)})`);
          }
        } else {
          // Create new balance
          const { error: insertError } = await supabaseAdmin
            .from('balances')
            .insert({
              user_id: userId,
              currency: cryptoSymbol,  // FIXED: Use 'currency' column, not 'symbol'
              balance: tradeAmount.toFixed(8)  // FIXED: Use 'balance' column, not 'available'
            });

          if (insertError) {
            console.error('❌ Error creating crypto balance:', insertError);
          } else {
            console.log(`✅ Created ${cryptoSymbol} balance: ${tradeAmount.toFixed(8)}`);
          }
        }
      } catch (cryptoError) {
        console.error('❌ Error managing crypto balance:', cryptoError);
      }

      console.log(`💰 BUY ORDER: ${tradeAmount} ${cryptoSymbol} at ${tradePrice} = ${totalCost} USDT`);
      console.log(`💰 USDT Balance: ${userBalance} → ${newUsdtBalance}`);
      
    } else if (side === 'sell') {
      // SELL ORDER: Deduct Cryptocurrency, Add USDT
      const totalReceived = tradeAmount * tradePrice;
      
      // Check if user has enough cryptocurrency to sell
      try {
        const { data: cryptoBalance, error: fetchError } = await supabaseAdmin
          .from('balances')
          .select('*')
          .eq('user_id', userId)
          .eq('currency', cryptoSymbol)  // FIXED: Use 'currency' column, not 'symbol'
          .single();

        if (fetchError || !cryptoBalance) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${cryptoSymbol} balance`
          });
        }

        const availableCrypto = parseFloat(cryptoBalance.balance || '0');  // FIXED: Use 'balance' column
        if (availableCrypto < tradeAmount) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${cryptoSymbol} balance. Have ${availableCrypto.toFixed(8)}, need ${tradeAmount.toFixed(8)}`
          });
        }

        // Deduct cryptocurrency
        const newCryptoAmount = availableCrypto - tradeAmount;
        const { error: updateError } = await supabaseAdmin
          .from('balances')
          .update({
            balance: newCryptoAmount.toFixed(8),  // FIXED: Use 'balance' column, not 'available'
            updated_at: new Date().toISOString()  // FIXED: Use 'updated_at' (snake_case)
          })
          .eq('user_id', userId)
          .eq('currency', cryptoSymbol);  // FIXED: Use 'currency' column

        if (updateError) {
          console.error('❌ Error updating crypto balance:', updateError);
          return res.status(500).json({
            success: false,
            message: 'Failed to update cryptocurrency balance'
          });
        }

        console.log(`✅ Updated ${cryptoSymbol} balance: -${tradeAmount} (remaining: ${newCryptoAmount.toFixed(8)})`);
      } catch (cryptoError) {
        console.error('❌ Error checking crypto balance:', cryptoError);
        return res.status(500).json({
          success: false,
          message: 'Failed to verify cryptocurrency balance'
        });
      }

      // Add USDT to balance
      const newUsdtBalance = userBalance + totalReceived;
      
      // Update user USDT balance
      const { error: balanceError } = await supabaseAdmin
        .from('users')
        .update({
          balance: newUsdtBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (balanceError) {
        console.error('❌ Error updating USDT balance:', balanceError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update USDT balance'
        });
      }
      
      console.log(`💰 SELL ORDER: ${tradeAmount} ${cryptoSymbol} at ${tradePrice} = ${totalReceived} USDT`);
      console.log(`💰 USDT Balance: ${userBalance} → ${newUsdtBalance}`);
    }

    // Create order record
    const orderId = `spot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const order = {
      id: orderId,
      user_id: userId,
      symbol: symbol,
      side: side,
      type: type || 'market',
      amount: tradeAmount.toString(),
      price: tradePrice.toString(),
      status: 'filled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Spot order completed successfully:', orderId);

    return res.json({
      success: true,
      order: order,
      message: `${side.toUpperCase()} order completed successfully`
    });

  } catch (error: any) {
    console.error('❌ Spot trading error:', error);
    return res.status(500).json({
      success: false,
      message: 'Spot trading failed',
      error: error.message
    });
  }
}
