import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock market data with realistic price movements
const marketData = {
  BTCUSDT: {
    symbol: 'BTCUSDT',
    price: 117000,
    change24h: 2.5,
    volume24h: 28500000000,
    high24h: 119500,
    low24h: 115200,
    lastUpdate: Date.now()
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    price: 3500,
    change24h: 1.8,
    volume24h: 15200000000,
    high24h: 3580,
    low24h: 3420,
    lastUpdate: Date.now()
  },
  BNBUSDT: {
    symbol: 'BNBUSDT',
    price: 600,
    change24h: -0.5,
    volume24h: 2100000000,
    high24h: 615,
    low24h: 595,
    lastUpdate: Date.now()
  },
  ADAUSDT: {
    symbol: 'ADAUSDT',
    price: 0.5,
    change24h: 3.2,
    volume24h: 850000000,
    high24h: 0.52,
    low24h: 0.48,
    lastUpdate: Date.now()
  },
  SOLUSDT: {
    symbol: 'SOLUSDT',
    price: 150,
    change24h: 4.1,
    volume24h: 1200000000,
    high24h: 158,
    low24h: 145,
    lastUpdate: Date.now()
  }
};

// Function to simulate price movements
function updatePrices() {
  Object.values(marketData).forEach(market => {
    // Random price movement between -0.5% and +0.5%
    const changePercent = (Math.random() - 0.5) * 1.0; // 1% max change
    const priceChange = market.price * (changePercent / 100);
    market.price = Math.max(0.01, market.price + priceChange);
    market.lastUpdate = Date.now();
  });
}

// Update prices every 5 seconds
setInterval(updatePrices, 5000);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📊 Spot Market API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'GET') {
      const { symbol } = req.query;

      if (symbol) {
        // Get specific symbol data
        const symbolStr = symbol as string;
        const market = marketData[symbolStr as keyof typeof marketData];
        
        if (!market) {
          return res.status(404).json({
            success: false,
            message: `Symbol ${symbolStr} not found`
          });
        }

        console.log('📊 Getting market data for:', symbolStr, 'Price:', market.price);
        return res.json({
          success: true,
          data: market
        });
      } else {
        // Get all market data
        console.log('📊 Getting all market data');
        return res.json({
          success: true,
          data: Object.values(marketData)
        });
      }
    }

    if (req.method === 'POST') {
      // Update market data (for admin/testing purposes)
      const { symbol, price, change24h, volume24h } = req.body || {};

      if (!symbol) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: symbol"
        });
      }

      const market = marketData[symbol as keyof typeof marketData];
      if (!market) {
        return res.status(404).json({
          success: false,
          message: `Symbol ${symbol} not found`
        });
      }

      // Update market data
      if (price !== undefined) market.price = parseFloat(price);
      if (change24h !== undefined) market.change24h = parseFloat(change24h);
      if (volume24h !== undefined) market.volume24h = parseFloat(volume24h);
      market.lastUpdate = Date.now();

      console.log('📊 Market data updated for:', symbol, 'New price:', market.price);

      return res.json({
        success: true,
        data: market,
        message: `Market data updated for ${symbol}`
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (error) {
    console.error('❌ Spot market error:', error);
    return res.status(500).json({
      success: false,
      message: "Market data operation failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
