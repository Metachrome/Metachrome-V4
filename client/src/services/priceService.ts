import { apiRequest } from "../lib/queryClient";
import type { MarketData, InsertMarketData } from "@shared/schema";

export class PriceService {
  private static instance: PriceService;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<(data: MarketData) => void>> = new Map();

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getMarketData(symbol?: string): Promise<MarketData[]> {
    try {
      const url = symbol ? `/api/market-data/${symbol}` : "/api/market-data";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error("Error fetching market data:", error);
      return [];
    }
  }

  async updateMarketData(data: InsertMarketData): Promise<MarketData | null> {
    try {
      const response = await apiRequest("POST", "/api/market-data", data);
      return await response.json();
    } catch (error) {
      console.error("Error updating market data:", error);
      return null;
    }
  }

  subscribe(symbol: string, callback: (data: MarketData) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    
    this.subscribers.get(symbol)!.add(callback);

    // Return unsubscribe function
    return () => {
      const symbolSubscribers = this.subscribers.get(symbol);
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback);
        if (symbolSubscribers.size === 0) {
          this.subscribers.delete(symbol);
        }
      }
    };
  }

  private notifySubscribers(symbol: string, data: MarketData) {
    const symbolSubscribers = this.subscribers.get(symbol);
    if (symbolSubscribers) {
      symbolSubscribers.forEach(callback => callback(data));
    }
  }

  startPriceUpdates(intervalMs: number = 5000) {
    if (this.updateInterval) {
      this.stopPriceUpdates();
    }

    this.updateInterval = setInterval(async () => {
      try {
        const marketData = await this.getMarketData();
        marketData.forEach(data => {
          this.notifySubscribers(data.symbol, data);
        });
      } catch (error) {
        console.error("Error in price update interval:", error);
      }
    }, intervalMs);
  }

  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Calculate technical indicators
  calculateMovingAverage(prices: number[], period: number): number[] {
    const result: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    
    return result;
  }

  calculateRSI(prices: number[], period: number = 14): number[] {
    if (prices.length < period + 1) return [];

    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return [rsi];
  }

  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateMovingAverage(prices, period);
    const bands = [];

    for (let i = 0; i < sma.length; i++) {
      const slice = prices.slice(i, i + period);
      const mean = sma[i];
      const variance = slice.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);

      bands.push({
        upper: mean + (standardDeviation * stdDev),
        middle: mean,
        lower: mean - (standardDeviation * stdDev)
      });
    }

    return bands;
  }

  // Format price for display
  formatPrice(price: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(price);
  }

  // Format percentage change
  formatPercentage(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  }

  // Get price color based on change
  getPriceColor(change: number): 'green' | 'red' | 'gray' {
    if (change > 0) return 'green';
    if (change < 0) return 'red';
    return 'gray';
  }
}

// Export singleton instance
export const priceService = PriceService.getInstance();
