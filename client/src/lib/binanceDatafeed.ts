/**
 * TradingView Custom Datafeed for Binance API
 * 
 * This datafeed connects TradingView Advanced Charts to Binance API
 * ensuring all price data comes from a single source (Binance)
 * 
 * Based on: https://github.com/tradingview/charting_library/wiki/JS-Api
 */

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SymbolInfo {
  name: string;
  ticker: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  exchange: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  volume_precision: number;
  data_status: string;
}

// Map TradingView intervals to Binance intervals
const resolutionMap: { [key: string]: string } = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '120': '2h',
  '240': '4h',
  '360': '6h',
  '480': '8h',
  '720': '12h',
  'D': '1d',
  '1D': '1d',
  '3D': '3d',
  'W': '1w',
  '1W': '1w',
  'M': '1M',
  '1M': '1M'
};

class BinanceDatafeed {
  private lastBar: Bar | null = null;
  private subscribers: { [key: string]: any } = {};

  // Configuration
  onReady(callback: (config: any) => void) {
    console.log('📊 [Binance Datafeed] onReady called');
    
    setTimeout(() => {
      callback({
        supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', 'D', '3D', 'W', 'M'],
        exchanges: [{ value: 'Binance', name: 'Binance', desc: 'Binance' }],
        symbols_types: [{ name: 'crypto', value: 'crypto' }]
      });
    }, 0);
  }

  // Search symbols
  searchSymbols(userInput: string, exchange: string, symbolType: string, onResult: (symbols: any[]) => void) {
    console.log('📊 [Binance Datafeed] searchSymbols:', userInput);
    
    const symbols = [
      {
        symbol: 'BTCUSDT',
        full_name: 'Binance:BTCUSDT',
        description: 'Bitcoin / Tether',
        exchange: 'Binance',
        type: 'crypto'
      },
      {
        symbol: 'ETHUSDT',
        full_name: 'Binance:ETHUSDT',
        description: 'Ethereum / Tether',
        exchange: 'Binance',
        type: 'crypto'
      }
    ];

    const filtered = symbols.filter(s => 
      s.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
      s.description.toLowerCase().includes(userInput.toLowerCase())
    );

    onResult(filtered);
  }

  // Resolve symbol
  resolveSymbol(symbolName: string, onResolve: (symbolInfo: SymbolInfo) => void, onError: (error: string) => void) {
    console.log('📊 [Binance Datafeed] resolveSymbol:', symbolName);

    const symbol = symbolName.replace('Binance:', '').toUpperCase();

    const symbolInfo: SymbolInfo = {
      name: symbol,
      ticker: symbol,
      description: `${symbol} / USDT`,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: 'Binance',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', 'D', '3D', 'W', 'M'],
      volume_precision: 2,
      data_status: 'streaming'
    };

    setTimeout(() => onResolve(symbolInfo), 0);
  }

  // Get historical bars
  async getBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    periodParams: any,
    onResult: (bars: Bar[], meta: { noData: boolean }) => void,
    onError: (error: string) => void
  ) {
    const { from, to, firstDataRequest } = periodParams;
    
    console.log('📊 [Binance Datafeed] getBars:', {
      symbol: symbolInfo.name,
      resolution,
      from: new Date(from * 1000).toISOString(),
      to: new Date(to * 1000).toISOString(),
      firstDataRequest
    });

    try {
      const interval = resolutionMap[resolution] || '1m';
      const symbol = symbolInfo.name;

      // Calculate limit based on time range
      const limit = Math.min(1000, Math.ceil((to - from) / this.getIntervalSeconds(interval)));

      // Fetch from our API endpoint
      const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        console.log('📊 [Binance Datafeed] No data available');
        onResult([], { noData: true });
        return;
      }

      // Filter bars within the requested time range
      const bars: Bar[] = result.data
        .filter((bar: any) => bar.time >= from && bar.time <= to)
        .map((bar: any) => ({
          time: bar.time * 1000, // TradingView expects milliseconds
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: bar.volume
        }));

      if (bars.length > 0) {
        this.lastBar = {
          time: bars[bars.length - 1].time / 1000,
          open: bars[bars.length - 1].open,
          high: bars[bars.length - 1].high,
          low: bars[bars.length - 1].low,
          close: bars[bars.length - 1].close,
          volume: bars[bars.length - 1].volume
        };
      }

      console.log('✅ [Binance Datafeed] Loaded', bars.length, 'bars');
      console.log('📊 [Binance Datafeed] Latest bar:', this.lastBar);

      onResult(bars, { noData: false });

    } catch (error) {
      console.error('❌ [Binance Datafeed] Error fetching bars:', error);
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Subscribe to real-time updates
  subscribeBars(
    symbolInfo: SymbolInfo,
    resolution: string,
    onTick: (bar: Bar) => void,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ) {
    console.log('📊 [Binance Datafeed] subscribeBars:', symbolInfo.name, resolution);

    this.subscribers[listenerGuid] = {
      symbolInfo,
      resolution,
      onTick,
      interval: setInterval(async () => {
        try {
          // Fetch latest price from our API
          const response = await fetch(`/api/binance/price?symbol=${symbolInfo.name}`);
          const result = await response.json();

          if (result.success && result.data) {
            const price = result.data.price;
            const now = Math.floor(Date.now() / 1000);

            if (this.lastBar) {
              // Update last bar
              const updatedBar: Bar = {
                ...this.lastBar,
                close: price,
                high: Math.max(this.lastBar.high, price),
                low: Math.min(this.lastBar.low, price),
                volume: this.lastBar.volume
              };

              this.lastBar = updatedBar;
              onTick({ ...updatedBar, time: updatedBar.time * 1000 });

              console.log('📊 [Binance Datafeed] Real-time update:', price);
            }
          }
        } catch (error) {
          console.error('❌ [Binance Datafeed] Error in real-time update:', error);
        }
      }, 2000) // Update every 2 seconds
    };
  }

  // Unsubscribe from real-time updates
  unsubscribeBars(listenerGuid: string) {
    console.log('📊 [Binance Datafeed] unsubscribeBars:', listenerGuid);
    
    if (this.subscribers[listenerGuid]) {
      clearInterval(this.subscribers[listenerGuid].interval);
      delete this.subscribers[listenerGuid];
    }
  }

  // Helper: Get interval in seconds
  private getIntervalSeconds(interval: string): number {
    const map: { [key: string]: number } = {
      '1m': 60,
      '3m': 180,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1h': 3600,
      '2h': 7200,
      '4h': 14400,
      '6h': 21600,
      '8h': 28800,
      '12h': 43200,
      '1d': 86400,
      '3d': 259200,
      '1w': 604800,
      '1M': 2592000
    };
    return map[interval] || 60;
  }
}

// Export singleton instance
export const binanceDatafeed = new BinanceDatafeed();

