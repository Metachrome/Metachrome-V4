import { useState, useEffect, useCallback } from 'react';

/**
 * Multi-Symbol Price Hook
 * 
 * Fetches real-time price data for multiple cryptocurrency symbols
 * This hook provides synchronized price data for all trading pairs
 * used in the left panel and currency lists
 */

interface PriceData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  openPrice: number;
  timestamp: number;
}

interface MultiSymbolPriceData {
  [symbol: string]: PriceData;
}

interface UseMultiSymbolPriceReturn {
  priceData: MultiSymbolPriceData;
  isLoading: boolean;
  error: string | null;
  refreshPrices: () => Promise<void>;
  getPriceForSymbol: (symbol: string) => PriceData | null;
}

// Default symbols to fetch
const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT', 
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT'
];

export function useMultiSymbolPrice(
  symbols: string[] = DEFAULT_SYMBOLS,
  updateInterval: number = 5000 // Update every 5 seconds
): UseMultiSymbolPriceReturn {
  const [priceData, setPriceData] = useState<MultiSymbolPriceData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceForSymbol = useCallback(async (symbol: string): Promise<PriceData | null> => {
    try {
      const response = await fetch(`/api/binance/price?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error(`❌ [MultiSymbolPrice] Error fetching ${symbol}:`, err);
      return null;
    }
  }, []);

  const fetchAllPrices = useCallback(async () => {
    try {
      console.log('💰 [MultiSymbolPrice] Fetching prices for:', symbols);
      
      // Fetch all symbols in parallel for better performance
      const pricePromises = symbols.map(symbol => 
        fetchPriceForSymbol(symbol).then(data => ({ symbol, data }))
      );
      
      const results = await Promise.all(pricePromises);
      
      const newPriceData: MultiSymbolPriceData = {};
      let successCount = 0;
      
      results.forEach(({ symbol, data }) => {
        if (data) {
          newPriceData[symbol] = data;
          successCount++;
        }
      });
      
      if (successCount > 0) {
        setPriceData(newPriceData);
        setError(null);
        console.log(`✅ [MultiSymbolPrice] Updated ${successCount}/${symbols.length} symbols`);
      } else {
        throw new Error('Failed to fetch any price data');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [MultiSymbolPrice] Error fetching prices:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [symbols, fetchPriceForSymbol]);

  // Helper function to get price data for a specific symbol
  const getPriceForSymbol = useCallback((symbol: string): PriceData | null => {
    return priceData[symbol] || null;
  }, [priceData]);

  // Initial fetch
  useEffect(() => {
    fetchAllPrices();
  }, [fetchAllPrices]);

  // Periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllPrices();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [fetchAllPrices, updateInterval]);

  return {
    priceData,
    isLoading,
    error,
    refreshPrices: fetchAllPrices,
    getPriceForSymbol
  };
}
