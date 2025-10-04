import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * Binance Klines (Candlestick) Data Endpoint
 * 
 * Fetches historical candlestick data from Binance API
 * This is used to populate the Lightweight Charts component
 * 
 * Query Parameters:
 * - symbol: Trading pair (e.g., BTCUSDT)
 * - interval: Timeframe (1m, 5m, 15m, 1h, 4h, 1d)
 * - limit: Number of candles to fetch (default: 500, max: 1000)
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('📊 [Binance Klines] Request:', req.query);

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
    const interval = (req.query.interval as string) || '1m';
    const limit = parseInt((req.query.limit as string) || '500');

    // Validate parameters
    const validIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
    if (!validIntervals.includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval' });
    }

    if (limit < 1 || limit > 1000) {
      return res.status(400).json({ error: 'Limit must be between 1 and 1000' });
    }

    // Fetch from Binance API
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    console.log('📊 [Binance Klines] Fetching from:', binanceUrl);

    const response = await fetch(binanceUrl);
    
    if (!response.ok) {
      console.error('❌ [Binance Klines] Binance API error:', response.status, response.statusText);
      return res.status(response.status).json({ error: 'Binance API error' });
    }

    const data = await response.json();

    // Transform Binance data to Lightweight Charts format
    // Binance format: [openTime, open, high, low, close, volume, closeTime, ...]
    // Lightweight Charts format: { time: timestamp, open, high, low, close, volume }
    const klines = data.map((candle: any) => ({
      time: Math.floor(candle[0] / 1000), // Convert ms to seconds
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));

    console.log('✅ [Binance Klines] Fetched', klines.length, 'candles for', symbol, interval);
    console.log('📊 [Binance Klines] Latest candle:', klines[klines.length - 1]);

    return res.json({
      success: true,
      symbol,
      interval,
      data: klines
    });

  } catch (error) {
    console.error('❌ [Binance Klines] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

