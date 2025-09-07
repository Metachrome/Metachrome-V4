import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simplified user balances - no external imports
const userBalances = new Map([
  ['user-1', { balance: 10000, currency: 'USDT' }],
  ['demo-user-1', { balance: 10000, currency: 'USDT' }],
  ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
]);

// Mock asset balances for spot trading
const assetBalances = new Map([
  ['demo-user-1', {
    USDT: 10000,
    BTC: 0.5,
    ETH: 5.0,
    BNB: 10.0,
    ADA: 1000.0,
    SOL: 20.0
  }],
  ['superadmin-001', {
    USDT: 1000000,
    BTC: 10.0,
    ETH: 100.0,
    BNB: 500.0,
    ADA: 50000.0,
    SOL: 1000.0
  }]
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`💰 Spot Balances API: ${req.method} ${req.url}`);
    
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
      const targetUserId = userId as string || 'demo-user-1';

      console.log('💰 Getting spot balances for user:', targetUserId);

      // Get USDT balance from shared storage
      const userBalance = userBalances.get(targetUserId) || { balance: 0, currency: 'USDT' };
      
      // Get asset balances
      let balances = assetBalances.get(targetUserId) || {
        USDT: userBalance.balance,
        BTC: 0,
        ETH: 0,
        BNB: 0,
        ADA: 0,
        SOL: 0
      };

      // Update USDT balance from shared storage
      balances.USDT = userBalance.balance;

      // Try to get from database
      try {
        if (supabaseAdmin) {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('balance, spot_balances')
            .eq('id', targetUserId)
            .single();

          if (user) {
            balances.USDT = user.balance || 0;
            if (user.spot_balances) {
              balances = { ...balances, ...user.spot_balances };
            }
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Calculate total value in USDT (mock prices)
      const mockPrices = {
        USDT: 1,
        BTC: 117000,
        ETH: 3500,
        BNB: 600,
        ADA: 0.5,
        SOL: 150
      };

      const balanceDetails = Object.entries(balances).map(([asset, amount]) => ({
        asset,
        free: amount,
        locked: 0,
        total: amount,
        usdValue: amount * (mockPrices[asset as keyof typeof mockPrices] || 0)
      }));

      const totalUsdValue = balanceDetails.reduce((sum, balance) => sum + balance.usdValue, 0);

      console.log('✅ Spot balances:', balanceDetails);

      return res.json({
        success: true,
        balances: balanceDetails,
        totalUsdValue,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      // Update asset balance (for admin use)
      const { userId, asset, amount, operation } = req.body || {};

      if (!userId || !asset || amount === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: userId, asset, amount"
        });
      }

      const targetUserId = userId;
      const assetAmount = parseFloat(amount);

      if (isNaN(assetAmount)) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount"
        });
      }

      console.log('💰 Updating asset balance:', { userId: targetUserId, asset, amount: assetAmount, operation });

      // Get current balances
      let balances = assetBalances.get(targetUserId) || {
        USDT: 0,
        BTC: 0,
        ETH: 0,
        BNB: 0,
        ADA: 0,
        SOL: 0
      };

      // Update balance
      if (operation === 'set') {
        balances[asset as keyof typeof balances] = assetAmount;
      } else if (operation === 'add') {
        balances[asset as keyof typeof balances] = (balances[asset as keyof typeof balances] || 0) + assetAmount;
      } else if (operation === 'subtract') {
        balances[asset as keyof typeof balances] = Math.max(0, (balances[asset as keyof typeof balances] || 0) - assetAmount);
      } else {
        balances[asset as keyof typeof balances] = assetAmount;
      }

      // Update storage
      assetBalances.set(targetUserId, balances);

      // If updating USDT, also update shared balance storage
      if (asset === 'USDT') {
        userBalances.set(targetUserId, { balance: balances.USDT, currency: 'USDT' });
      }

      // Try to update database
      try {
        if (supabaseAdmin) {
          const updateData: any = {
            spot_balances: balances,
            updated_at: new Date().toISOString()
          };

          if (asset === 'USDT') {
            updateData.balance = balances.USDT;
          }

          await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', targetUserId);

          console.log('✅ Asset balance updated in database');
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      console.log('✅ Asset balance updated:', { userId: targetUserId, asset, newAmount: balances[asset as keyof typeof balances] });

      return res.json({
        success: true,
        userId: targetUserId,
        asset,
        newAmount: balances[asset as keyof typeof balances],
        allBalances: balances,
        message: `${asset} balance updated successfully`
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Spot balances error:', error);
    return res.status(500).json({
      success: false,
      message: "Spot balances operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
