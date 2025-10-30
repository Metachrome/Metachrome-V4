import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * Binance Real-Time Price Endpoint
 * 
 * Fetches current price and 24h statistics from Binance API
 * This is the SINGLE SOURCE OF TRUTH for all price displays
 * 
 * Query Parameters:
 * - symbol: Trading pair (e.g., BTCUSDT)
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('💰 [Binance Price] Request:', req.query);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse query parameters
    const symbol = (req.query.symbol as string) || 'BTCUSDT';

    // Special handling for HYPEHUSD (not available on Binance)
    if (symbol === 'HYPEHUSD') {
      console.log('💰 [Binance Price] HYPEHUSD detected - fetching from CoinGecko');
      try {
        const coingeckoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hyperliquid&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_market_cap_change_24h=true');

        if (coingeckoResponse.ok) {
          const data: any = await coingeckoResponse.json();
          const hypeData = data.hyperliquid;

          if (hypeData && hypeData.usd) {
            const priceData = {
              symbol: 'HYPEHUSD',
              price: hypeData.usd,
              priceChange24h: (hypeData.usd_24h_change / 100) * hypeData.usd || 0,
              priceChangePercent24h: hypeData.usd_24h_change || 0,
              high24h: hypeData.usd * (1 + Math.abs(hypeData.usd_24h_change) / 100) || hypeData.usd,
              low24h: hypeData.usd * (1 - Math.abs(hypeData.usd_24h_change) / 100) || hypeData.usd,
              volume24h: hypeData.usd_market_cap || 0,
              quoteVolume24h: hypeData.usd_market_cap || 0,
              openPrice: hypeData.usd - ((hypeData.usd_24h_change / 100) * hypeData.usd) || hypeData.usd,
              timestamp: Date.now()
            };

            console.log('✅ [Binance Price] HYPEHUSD price:', priceData.price);
            return res.json({ success: true, data: priceData });
          }
        }
      } catch (coingeckoError) {
        console.error('❌ [Binance Price] CoinGecko error:', coingeckoError);
      }
    }

    // Fetch from Binance 24hr Ticker API
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
    console.log('💰 [Binance Price] Fetching from:', binanceUrl);

    const response = await fetch(binanceUrl);

    if (!response.ok) {
      console.error('❌ [Binance Price] Binance API error:', response.status, response.statusText);
      return res.status(response.status).json({ error: 'Binance API error' });
    }

    const data: any = await response.json();

    // Transform to our format
    const priceData = {
      symbol: data.symbol,
      price: parseFloat(data.lastPrice),
      priceChange24h: parseFloat(data.priceChange),
      priceChangePercent24h: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume24h: parseFloat(data.volume),
      quoteVolume24h: parseFloat(data.quoteVolume),
      openPrice: parseFloat(data.openPrice),
      timestamp: Date.now()
    };

    console.log('✅ [Binance Price] Current price:', priceData.price, 'Change:', priceData.priceChangePercent24h + '%');

    return res.json({
      success: true,
      data: priceData
    });

  } catch (error) {
    console.error('❌ [Binance Price] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

