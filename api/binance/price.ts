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

