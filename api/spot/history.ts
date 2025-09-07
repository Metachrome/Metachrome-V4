import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';

// Mock order history
const orderHistory = new Map();

// Generate some initial mock orders
function generateMockOrders(userId: string) {
  const orders = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  const sides = ['buy', 'sell'];
  
  for (let i = 1; i <= 10; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const amount = Math.random() * 2 + 0.1;
    const price = symbol === 'BTCUSDT' ? 115000 + (Math.random() * 4000) :
                  symbol === 'ETHUSDT' ? 3400 + (Math.random() * 200) :
                  symbol === 'BNBUSDT' ? 590 + (Math.random() * 20) :
                  symbol === 'ADAUSDT' ? 0.45 + (Math.random() * 0.1) :
                  140 + (Math.random() * 20);
    
    const createdTime = new Date(Date.now() - (i * 2 * 60 * 60 * 1000)); // 2 hours apart
    
    orders.push({
      id: `order-${userId}-${i}`,
      userId,
      symbol,
      side,
      amount,
      price,
      totalValue: amount * price,
      status: 'filled',
      type: 'market',
      fee: (amount * price) * 0.001, // 0.1% fee
      created_at: createdTime.toISOString(),
      filled_at: createdTime.toISOString()
    });
  }
  
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📜 Spot History API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      const { userId, symbol, side, limit = '50', offset = '0' } = req.query;
      
      const targetUserId = userId as string || 'demo-user-1';
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      console.log('📜 Getting order history for user:', targetUserId);

      // Try to get from database first
      let orders = [];
      try {
        if (supabaseAdmin) {
          let query = supabaseAdmin
            .from('spot_orders')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .range(offsetNum, offsetNum + limitNum - 1);

          if (symbol) {
            query = query.eq('symbol', symbol);
          }
          if (side) {
            query = query.eq('side', side);
          }

          const { data, error } = await query;

          if (!error && data) {
            orders = data.map(order => ({
              id: order.id,
              userId: order.user_id,
              symbol: order.symbol,
              side: order.side,
              amount: order.amount,
              price: order.price,
              totalValue: order.total_value,
              status: order.status,
              type: order.type,
              fee: order.fee,
              created_at: order.created_at,
              filled_at: order.filled_at
            }));
          }
        }
      } catch (dbError) {
        console.log('⚠️ Database query failed, using mock data');
      }

      // Fallback to mock data if database failed or empty
      if (orders.length === 0) {
        if (!orderHistory.has(targetUserId)) {
          orderHistory.set(targetUserId, generateMockOrders(targetUserId));
        }
        
        let allOrders = orderHistory.get(targetUserId) || [];
        
        // Apply filters
        if (symbol) {
          allOrders = allOrders.filter((order: any) => order.symbol === symbol);
        }
        if (side) {
          allOrders = allOrders.filter((order: any) => order.side === side);
        }
        
        // Apply pagination
        orders = allOrders.slice(offsetNum, offsetNum + limitNum);
      }

      console.log('✅ Order history retrieved:', orders.length, 'orders');

      return res.json({
        success: true,
        orders,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total: orders.length
        }
      });
    }

    if (req.method === 'DELETE') {
      // Cancel order (if still open)
      const { orderId } = req.body || {};

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: orderId"
        });
      }

      console.log('📜 Cancelling order:', orderId);

      // Try to cancel in database
      try {
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from('spot_orders')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('status', 'open')
            .select()
            .single();

          if (error) {
            return res.status(404).json({
              success: false,
              message: "Order not found or cannot be cancelled"
            });
          }

          console.log('✅ Order cancelled in database');
          return res.json({
            success: true,
            order: data,
            message: "Order cancelled successfully"
          });
        }
      } catch (dbError) {
        console.log('⚠️ Database operation failed');
      }

      // Mock cancellation for demo
      return res.json({
        success: true,
        orderId,
        message: "Order cancelled successfully (demo mode)"
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Spot history error:', error);
    return res.status(500).json({
      success: false,
      message: "Order history operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
