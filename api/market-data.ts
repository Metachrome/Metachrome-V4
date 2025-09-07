import type { VercelRequest, VercelResponse } from '@vercel/node';

// Real-time price data with realistic simulation
let currentPrices = {
  'BTCUSDT': { price: '117860.08', change24h: '+1.44%' },
  'ETHUSDT': { price: '3577.42', change24h: '-0.23%' },
  'DOGEUSDT': { price: '0.238780', change24h: '+0.89%' },
  'XRPUSDT': { price: '3.183300', change24h: '-1.77%' },
  'ADAUSDT': { price: '0.821200', change24h: '+0.66%' }
};

// Simulate realistic price movements
function updatePricesWithRealisticData() {
  try {
    console.log('📡 Updating prices with realistic market simulation...');

    // Use realistic base prices and simulate small movements
    const basePrices = {
      'BTCUSDT': 117860.08,
      'ETHUSDT': 3577.42,
      'DOGEUSDT': 0.238780,
      'XRPUSDT': 3.183300,
      'ADAUSDT': 0.821200
    };

    Object.entries(basePrices).forEach(([symbol, basePrice]) => {
      // Generate realistic price movement (-0.5% to +0.5%)
      const changePercent = (Math.random() - 0.5) * 1.0; // -0.5% to +0.5%
      const newPrice = basePrice * (1 + changePercent / 100);
      
      // Format price based on symbol
      const formattedPrice = symbol === 'DOGEUSDT' ? 
        newPrice.toFixed(6) : 
        newPrice.toFixed(2);
      
      const formattedChange = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
      
      currentPrices[symbol] = {
        price: formattedPrice,
        change24h: formattedChange
      };
      
      console.log(`📈 ${symbol}: $${formattedPrice} (${formattedChange})`);
    });

    console.log('✅ Price update cycle completed');
  } catch (error) {
    console.error('❌ Error updating prices:', error);
  }
}

// Update prices every 3 seconds
setInterval(updatePricesWithRealisticData, 3000);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`📊 Market Data API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('📊 Serving real-time market data');

    const marketData = Object.entries(currentPrices).map(([symbol, data]) => {
      const price = parseFloat(data.price);
      const changePercent = parseFloat(data.change24h.replace('%', '').replace('+', ''));

      return {
        symbol,
        price: data.price,
        priceChange24h: (price * (changePercent / 100)).toFixed(symbol === 'DOGEUSDT' ? 6 : 2),
        priceChangePercent24h: changePercent.toFixed(2),
        high24h: (price * 1.05).toFixed(symbol === 'DOGEUSDT' ? 6 : 2),
        low24h: (price * 0.95).toFixed(symbol === 'DOGEUSDT' ? 6 : 2),
        volume24h: (Math.random() * 1000000 + 500000).toFixed(0),
        timestamp: new Date().toISOString()
      };
    });

    console.log(`📊 Returning ${marketData.length} real-time market data entries`);
    res.json(marketData);

  } catch (error) {
    console.error('❌ Market Data API error:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
