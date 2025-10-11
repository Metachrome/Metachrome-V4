import axios from 'axios';
import WebSocket from 'ws';
import { storage } from './storage';

interface PriceData {
  symbol: string;
  price: string;
  priceChange24h: string;
  priceChangePercent24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

interface BinanceTickerData {
  s: string; // symbol
  c: string; // close price
  P: string; // price change percent
  p: string; // price change
  h: string; // high price
  l: string; // low price
  v: string; // volume
}

class PriceService {
  private updateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 5000; // 5 seconds
  private binanceWs: WebSocket | null = null;
  private priceCallbacks: Map<string, ((price: string) => void)[]> = new Map();
  private lastPrices: Map<string, PriceData> = new Map();
  private updateCount: number = 0;

  // Major trading pairs to track - Updated to match TradingViewWidget currencies
  private readonly MAJOR_PAIRS = [
    'BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'LTCUSDT', 'BNBUSDT',
    'SOLUSDT', 'TONUSDT', 'DOGEUSDT', 'ADAUSDT', 'TRXUSDT',
    'HYPEUSDT', 'LINKUSDT', 'AVAXUSDT', 'SUIUSDT', 'SHIBUSDT',
    'BCHUSDT', 'DOTUSDT', 'MATICUSDT', 'XLMUSDT'
  ];

  constructor() {
    // Skip external connections in development mode for faster startup
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Development mode: Skipping external price feeds for faster startup');
      console.log('📊 Using mock price data for development');
      this.startPriceUpdates(); // Use local mock data instead
    } else {
      // Production mode - delay WebSocket initialization
      setTimeout(() => {
        this.initializeWebSocket();
      }, 2000); // 2 second delay
    }
  }

  // Initialize Binance WebSocket for real-time prices
  private initializeWebSocket() {
    try {
      const streams = this.MAJOR_PAIRS.map(pair => `${pair.toLowerCase()}@ticker`).join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

      console.log('🔌 Attempting to connect to Binance WebSocket...');
      
      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        console.log('⏰ WebSocket connection timeout, falling back to polling mode');
        this.fallbackToPolling();
      }, 10000); // 10 second timeout

      this.binanceWs = new WebSocket(wsUrl);

      this.binanceWs.on('open', () => {
        clearTimeout(connectionTimeout);
        console.log('✅ Connected to Binance WebSocket for real-time prices');
      });

      this.binanceWs.on('message', (data) => {
        try {
          const ticker: BinanceTickerData = JSON.parse(data.toString());
          this.handlePriceUpdate(ticker);
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      });

      this.binanceWs.on('error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('Binance WebSocket error:', error);
        this.fallbackToPolling();
      });

      this.binanceWs.on('close', () => {
        clearTimeout(connectionTimeout);
        console.log('Binance WebSocket closed, falling back to polling mode');
        this.fallbackToPolling();
      });
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.fallbackToPolling();
    }
  }

  private reconnectWebSocket() {
    setTimeout(() => {
      this.initializeWebSocket();
    }, 5000);
  }

  private fallbackToPolling() {
    console.log('Falling back to polling mode');
    this.startPriceUpdates();
  }

  private handlePriceUpdate(ticker: BinanceTickerData) {
    const priceData: PriceData = {
      symbol: ticker.s,
      price: ticker.c,
      priceChange24h: ticker.p,
      priceChangePercent24h: ticker.P,
      high24h: ticker.h,
      low24h: ticker.l,
      volume24h: ticker.v,
    };

    this.lastPrices.set(ticker.s, priceData);

    // Update database
    this.updateMarketDataInDB(priceData);

    // Notify callbacks
    const callbacks = this.priceCallbacks.get(ticker.s);
    if (callbacks) {
      callbacks.forEach(callback => callback(ticker.c));
    }
  }

  private async updateMarketDataInDB(priceData: PriceData) {
    try {
      await storage.updateMarketData(priceData.symbol, {
        price: priceData.price,
        priceChange24h: priceData.priceChange24h,
        priceChangePercent24h: priceData.priceChangePercent24h,
        high24h: priceData.high24h,
        low24h: priceData.low24h,
        volume24h: priceData.volume24h,
      });
    } catch (error) {
      console.error(`Error updating market data for ${priceData.symbol}:`, error);
    }
  }

  // Subscribe to price updates for a specific symbol
  subscribeToPriceUpdates(symbol: string, callback: (price: string) => void) {
    if (!this.priceCallbacks.has(symbol)) {
      this.priceCallbacks.set(symbol, []);
    }
    this.priceCallbacks.get(symbol)!.push(callback);
  }

  // Unsubscribe from price updates
  unsubscribeFromPriceUpdates(symbol: string, callback: (price: string) => void) {
    const callbacks = this.priceCallbacks.get(symbol);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Binance API for initial data load
  async fetchBinancePrices(): Promise<PriceData[]> {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const data = response.data;

      return data
        .filter((ticker: any) => this.MAJOR_PAIRS.includes(ticker.symbol))
        .map((ticker: any) => ({
          symbol: ticker.symbol,
          price: ticker.lastPrice,
          priceChange24h: ticker.priceChange,
          priceChangePercent24h: ticker.priceChangePercent,
          high24h: ticker.highPrice,
          low24h: ticker.lowPrice,
          volume24h: ticker.volume,
        }));
    } catch (error) {
      console.error('Error fetching Binance prices:', error);
      return this.getFallbackPrices();
    }
  }

  // Fallback mock prices if API fails
  getFallbackPrices(): PriceData[] {
    return [
      {
        symbol: 'BTCUSDT',
        price: '118113.00',
        priceChange24h: '1200.50',
        priceChangePercent24h: '1.03',
        high24h: '119500.00',
        low24h: '117200.00',
        volume24h: '28547.85',
      },
      {
        symbol: 'ETHUSDT',
        price: '3776.75',
        priceChange24h: '85.30',
        priceChangePercent24h: '2.31',
        high24h: '3850.00',
        low24h: '3650.00',
        volume24h: '185647.25',
      },
      {
        symbol: 'BNBUSDT',
        price: '720.50',
        priceChange24h: '12.80',
        priceChangePercent24h: '1.81',
        high24h: '735.00',
        low24h: '705.20',
        volume24h: '2547896.30',
      },
      {
        symbol: 'DOGEUSDT',
        price: '0.238780',
        priceChange24h: '0.008',
        priceChangePercent24h: '3.47',
        high24h: '0.245000',
        low24h: '0.230000',
        volume24h: '15847963.25',
      },
      {
        symbol: 'XRPUSDT',
        price: '3.188300',
        priceChange24h: '0.125',
        priceChangePercent24h: '4.08',
        high24h: '3.250000',
        low24h: '3.050000',
        volume24h: '8547896.30',
      },
      {
        symbol: 'TRUMPUSDT',
        price: '10.2300',
        priceChange24h: '0.128',
        priceChangePercent24h: '1.26',
        high24h: '10.5000',
        low24h: '10.0000',
        volume24h: '1547896.30',
      },
    ];
  }

  // Update market data in database
  async updateMarketData(): Promise<void> {
    try {
      // Skip Binance API calls in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Development mode: Using mock price data instead of Binance API');
        const prices = this.getFallbackPrices();
        
        for (const priceData of prices) {
          await storage.updateMarketData(priceData.symbol, {
            price: priceData.price,
            priceChange24h: priceData.priceChange24h,
            priceChangePercent24h: priceData.priceChangePercent24h,
            high24h: priceData.high24h,
            low24h: priceData.low24h,
            volume24h: priceData.volume24h,
          });
        }
        
        // Only log every 10th update in development to reduce noise
        if (!this.updateCount || this.updateCount % 10 === 0) {
          console.log(`Updated market data for ${prices.length} symbols (mock data) - update #${this.updateCount || 1}`);
        }
        this.updateCount = (this.updateCount || 0) + 1;
      } else {
        // Production mode - use real Binance API
        const prices = await this.fetchBinancePrices();
        
        for (const priceData of prices) {
          await storage.updateMarketData(priceData.symbol, {
            price: priceData.price,
            priceChange24h: priceData.priceChange24h,
            priceChangePercent24h: priceData.priceChangePercent24h,
            high24h: priceData.high24h,
            low24h: priceData.low24h,
            volume24h: priceData.volume24h,
          });
        }
        
        console.log(`Updated market data for ${prices.length} symbols (Binance API)`);
      }
    } catch (error) {
      console.error('Error updating market data:', error);
    }
  }

  // Start automatic price updates
  startPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Initial update
    this.updateMarketData();

    // Set up recurring updates - less frequent in development
    const interval = process.env.NODE_ENV === 'development' ? 30000 : this.UPDATE_INTERVAL; // 30s in dev, 5s in prod
    this.updateInterval = setInterval(() => {
      this.updateMarketData();
    }, interval);

    console.log(`Started price updates every ${interval / 1000} seconds (${process.env.NODE_ENV === 'development' ? 'development mode' : 'production mode'})`);
  }

  // Stop automatic price updates
  stopPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('Stopped price updates');
    }
  }

  // Get current price for a specific symbol
  async getCurrentPrice(symbol: string): Promise<string | null> {
    try {
      const marketData = await storage.getMarketData(symbol);
      return marketData?.price || null;
    } catch (error) {
      console.error(`Error getting current price for ${symbol}:`, error);
      return null;
    }
  }

  // Simulate price movement for admin-controlled trades
  simulatePriceMovement(currentPrice: string, direction: 'up' | 'down', percentage: number = 0.1): string {
    const price = parseFloat(currentPrice);
    const change = price * (percentage / 100);
    
    if (direction === 'up') {
      return (price + change).toFixed(8);
    } else {
      return (price - change).toFixed(8);
    }
  }
}

export const priceService = new PriceService();
