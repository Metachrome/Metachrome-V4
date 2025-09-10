import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simplified user balances - no external imports
const userBalances = new Map([
  ['user-1', { balance: 10000, currency: 'USDT' }],
  ['demo-user-1', { balance: 10000, currency: 'USDT' }],
  ['superadmin-001', { balance: 1000000, currency: 'USDT' }]
]);

// Mock orders storage
const orders = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📈 Spot Orders API: ${req.method} ${req.url} - Updated`);
    
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
      const { symbol, side, amount, price, userId } = req.body || {};

      console.log('📈 Spot order request:', { symbol, side, amount, price, userId });

      // Validate required fields
      if (!symbol || !side || !amount) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: symbol, side, amount"
        });
      }

      // Validate side
      if (!['buy', 'sell'].includes(side)) {
        return res.status(400).json({
          success: false,
          message: "Invalid side. Must be 'buy' or 'sell'"
        });
      }

      // Validate amount
      const orderAmount = parseFloat(amount);
      if (isNaN(orderAmount) || orderAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid amount"
        });
      }

      // Get current market price if no price provided
      const orderPrice = parseFloat(price) || (117000 + (Math.random() * 2000));

      // Calculate total cost/value
      const totalValue = orderAmount * orderPrice;

      // Get user ID from auth or use provided
      const targetUserId = userId || 'demo-user-1';

      // Check user balance
      const userBalance = userBalances.get(targetUserId) || { balance: 0, currency: 'USDT' };

      if (side === 'buy') {
        // For buy orders, check USDT balance
        if (userBalance.balance < totalValue) {
          return res.status(400).json({
            success: false,
            message: `Insufficient USDT balance. Required: ${totalValue.toFixed(2)}, Available: ${userBalance.balance.toFixed(2)}`
          });
        }
      } else {
        // For sell orders, we'd need to check the asset balance (BTC, ETH, etc.)
        // For now, we'll assume they have enough to sell
        console.log('📈 Sell order - assuming sufficient asset balance');
      }

      // Create order
      const order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: targetUserId,
        symbol,
        side,
        amount: orderAmount,
        price: orderPrice,
        totalValue,
        status: 'filled', // Instantly fill for demo
        type: 'market',
        created_at: new Date().toISOString(),
        filled_at: new Date().toISOString()
      };

      // Execute the order immediately (market order simulation)
      if (side === 'buy') {
        // Deduct USDT, add asset (for demo, we'll just deduct USDT)
        userBalance.balance -= totalValue;
        console.log(`💰 Buy executed: -${totalValue.toFixed(2)} USDT, +${orderAmount} ${symbol.replace('USDT', '')}`);
      } else {
        // Add USDT, deduct asset (for demo, we'll just add USDT)
        userBalance.balance += totalValue;
        console.log(`💰 Sell executed: +${totalValue.toFixed(2)} USDT, -${orderAmount} ${symbol.replace('USDT', '')}`);
      }

      // Update balance storage
      userBalances.set(targetUserId, userBalance);

      // Store order
      orders.set(order.id, order);

      // Try to update database
      try {
        // Database update disabled for now
        if (false) {
          // Update user balance
          await supabaseAdmin
            .from('users')
            .update({ 
              balance: userBalance.balance,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetUserId);

          // Create transaction record
          await supabaseAdmin
            .from('transactions')
            .insert({
              id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              user_id: targetUserId,
              type: side === 'buy' ? 'spot_buy' : 'spot_sell',
              amount: side === 'buy' ? -totalValue : totalValue,
              status: 'completed',
              description: `Spot ${side} - ${orderAmount} ${symbol} at ${orderPrice}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          console.log('✅ Database updated successfully');
        }
      } catch (dbError) {
        console.log('⚠️ Database update failed, continuing with in-memory state');
      }

      console.log('✅ Spot order executed:', order);

      return res.json({
        success: true,
        order,
        newBalance: userBalance.balance,
        message: `${side.toUpperCase()} order executed successfully`
      });
    }

    if (req.method === 'GET') {
      // Get user orders
      const { userId } = req.query;
      const targetUserId = userId as string || 'demo-user-1';

      const userOrders = Array.from(orders.values()).filter(order => order.userId === targetUserId);
      
      console.log('📈 Getting orders for user:', targetUserId, 'Count:', userOrders.length);
      return res.json(userOrders);
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Spot orders error:', error);
    return res.status(500).json({
      success: false,
      message: "Spot order failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
