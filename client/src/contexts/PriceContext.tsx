import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/**
 * Price Context - SINGLE SOURCE OF TRUTH for all price data
 * 
 * This context provides real-time price data from Binance API
 * All components (chart, panels, headers) should use this context
 * to ensure price synchronization across the entire application
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

interface PriceContextType {
  priceData: PriceData | null;
  isLoading: boolean;
  error: string | null;
  refreshPrice: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

interface PriceProviderProps {
  children: ReactNode;
  symbol?: string;
  updateInterval?: number; // in milliseconds
}

export function PriceProvider({ 
  children, 
  symbol = 'BTCUSDT',
  updateInterval = 2000 // Update every 2 seconds (like CoinsCyclone)
}: PriceProviderProps) {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      console.log('💰 [PriceContext] Fetching price for:', symbol);
      
      const response = await fetch(`/api/binance/price?symbol=${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setPriceData(result.data);
        setError(null);
        console.log('✅ [PriceContext] Price updated:', result.data.price);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [PriceContext] Error fetching price:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Initial fetch
  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Periodic updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPrice();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [fetchPrice, updateInterval]);

  const value: PriceContextType = {
    priceData,
    isLoading,
    error,
    refreshPrice: fetchPrice
  };

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  );
}

/**
 * Hook to access price data
 * 
 * Usage:
 * ```tsx
 * const { priceData, isLoading, error } = usePrice();
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * 
 * return <div>BTC Price: ${priceData?.price.toFixed(2)}</div>;
 * ```
 */
export function usePrice() {
  const context = useContext(PriceContext);
  
  if (context === undefined) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  
  return context;
}

/**
 * Hook to get formatted price string
 * 
 * Usage:
 * ```tsx
 * const formattedPrice = useFormattedPrice();
 * return <div>{formattedPrice}</div>; // "$95,234.56"
 * ```
 */
export function useFormattedPrice(decimals: number = 2): string {
  const { priceData } = usePrice();
  
  if (!priceData) return '$0.00';
  
  return `$${priceData.price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/**
 * Hook to get price change indicator
 * 
 * Usage:
 * ```tsx
 * const { changeText, changeColor, isPositive } = usePriceChange();
 * return <span style={{ color: changeColor }}>{changeText}</span>;
 * ```
 */
export function usePriceChange() {
  const { priceData } = usePrice();
  
  if (!priceData) {
    return {
      changeText: '+0.00%',
      changeColor: '#10B981',
      isPositive: true
    };
  }
  
  const isPositive = priceData.priceChangePercent24h >= 0;
  const changeText = `${isPositive ? '+' : ''}${priceData.priceChangePercent24h.toFixed(2)}%`;
  const changeColor = isPositive ? '#10B981' : '#EF4444'; // green : red
  
  return {
    changeText,
    changeColor,
    isPositive,
    changeValue: priceData.priceChange24h,
    changePercent: priceData.priceChangePercent24h
  };
}

/**
 * Hook to get 24h statistics
 * 
 * Usage:
 * ```tsx
 * const { high, low, volume } = use24hStats();
 * ```
 */
export function use24hStats() {
  const { priceData } = usePrice();
  
  if (!priceData) {
    return {
      high: 0,
      low: 0,
      volume: 0,
      quoteVolume: 0,
      openPrice: 0
    };
  }
  
  return {
    high: priceData.high24h,
    low: priceData.low24h,
    volume: priceData.volume24h,
    quoteVolume: priceData.quoteVolume24h,
    openPrice: priceData.openPrice
  };
}

