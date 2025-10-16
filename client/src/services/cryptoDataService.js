// Cryptocurrency Data Service
import { useState, useEffect } from 'react';

// Real-time cryptocurrency data using CoinMarketCap API via our server
export const useCryptoData = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from our CoinMarketCap proxy endpoint
      console.log('🪙 Fetching from CoinMarketCap via server proxy...');
      const response = await fetch('/api/market-data', {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`Server API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check if we got fallback data due to API error
      if (data.error && data.fallback) {
        console.log('⚠️ Server returned fallback data due to CoinMarketCap API error');
        setCryptoData(data.fallback);
        setError('Using cached data');
        return;
      }

      console.log('✅ CoinMarketCap data received via server proxy');
      setCryptoData(data);
      setError(null);

    } catch (err) {
      console.error('❌ Server proxy failed, trying direct CoinGecko fallback:', err);

      // Fallback to CoinGecko API if server fails
      try {
        console.log('🔄 Fallback: Fetching from CoinGecko API...');
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano,ripple,dogecoin,polygon,avalanche-2,chainlink,litecoin,polkadot,uniswap,shiba-inu&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h',
          {
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          }
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ CoinGecko fallback data received');

        // Transform CoinGecko data to match our format
        const transformedData = data.map(coin => ({
          id: coin.id,
          symbol: `${coin.symbol.toUpperCase()}/USDT`,
          name: coin.name,
          price: `$${coin.current_price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: coin.current_price < 1 ? 6 : 2
          })}`,
          change: `${coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%`,
          high: `$${coin.high_24h?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: coin.high_24h < 1 ? 6 : 2
          }) || 'N/A'}`,
          low: `$${coin.low_24h?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: coin.low_24h < 1 ? 6 : 2
          }) || 'N/A'}`,
          isPositive: (coin.price_change_percentage_24h || 0) >= 0,
          marketCap: coin.market_cap,
          volume: coin.total_volume,
          image: coin.image,
          coinGeckoId: coin.id,
          rawPrice: coin.current_price,
          rawChange: coin.price_change_percentage_24h || 0
        }));

        setCryptoData(transformedData);
        setError('Using CoinGecko fallback');
        console.log('✅ CoinGecko fallback data processed successfully');

      } catch (fallbackErr) {
        console.error('❌ All crypto data sources failed:', fallbackErr);
        setError('Failed to fetch');

        // Enhanced fallback data with more realistic prices
        console.log('🔄 Using enhanced fallback data...');
        setCryptoData([
        {
          id: 'bitcoin',
          symbol: "BTC/USDT",
          name: "Bitcoin",
          price: "$43,250.50",
          change: "+2.45%",
          high: "$44,100",
          low: "$42,800",
          isPositive: true,
          marketCap: 850000000000,
          volume: 25000000000,
          image: "https://cryptoicons.org/api/icon/btc/200",
          coinGeckoId: 'bitcoin',
          rawPrice: 43250.50,
          rawChange: 2.45
        },
        {
          id: 'ethereum',
          symbol: "ETH/USDT",
          name: "Ethereum",
          price: "$2,650.75",
          change: "-1.23%",
          high: "$2,720",
          low: "$2,580",
          isPositive: false,
          marketCap: 320000000000,
          volume: 15000000000,
          image: "https://cryptoicons.org/api/icon/eth/200",
          coinGeckoId: 'ethereum',
          rawPrice: 2650.75,
          rawChange: -1.23
        },
        { 
          id: 'binancecoin',
          symbol: "BNB/USDT", 
          name: "BNB", 
          price: "$315.20", 
          change: "+3.67%", 
          high: "$325", 
          low: "$305", 
          isPositive: true,
          marketCap: 50000000000,
          volume: 2000000000,
          image: "https://cryptoicons.org/api/icon/bnb/200",
          coinGeckoId: 'binancecoin',
          rawPrice: 315.20,
          rawChange: 3.67
        },
        { 
          id: 'solana',
          symbol: "SOL/USDT", 
          name: "Solana", 
          price: "$98.45", 
          change: "+5.12%", 
          high: "$102", 
          low: "$94", 
          isPositive: true,
          marketCap: 45000000000,
          volume: 3000000000,
          image: "https://cryptoicons.org/api/icon/sol/200",
          coinGeckoId: 'solana',
          rawPrice: 98.45,
          rawChange: 5.12
        },
        {
          id: 'cardano',
          symbol: "ADA/USDT",
          name: "Cardano",
          price: "$0.485",
          change: "-2.34%",
          high: "$0.52",
          low: "$0.47",
          isPositive: false,
          marketCap: 15000000000,
          volume: 800000000,
          image: "https://cryptoicons.org/api/icon/ada/200",
          coinGeckoId: 'cardano',
          rawPrice: 0.485,
          rawChange: -2.34
        },
        {
          id: 'ripple',
          symbol: "XRP/USDT",
          name: "XRP",
          price: "$0.6234",
          change: "+4.12%",
          high: "$0.65",
          low: "$0.59",
          isPositive: true,
          marketCap: 35000000000,
          volume: 1500000000,
          image: "https://cryptoicons.org/api/icon/xrp/200",
          coinGeckoId: 'ripple',
          rawPrice: 0.6234,
          rawChange: 4.12
        },
        {
          id: 'dogecoin',
          symbol: "DOGE/USDT",
          name: "Dogecoin",
          price: "$0.0823",
          change: "+6.78%",
          high: "$0.087",
          low: "$0.076",
          isPositive: true,
          marketCap: 12000000000,
          volume: 900000000,
          image: "https://cryptoicons.org/api/icon/doge/200",
          coinGeckoId: 'dogecoin',
          rawPrice: 0.0823,
          rawChange: 6.78
        },
        {
          id: 'polygon',
          symbol: "MATIC/USDT",
          name: "Polygon",
          price: "$0.8945",
          change: "+3.21%",
          high: "$0.92",
          low: "$0.86",
          isPositive: true,
          marketCap: 8500000000,
          volume: 650000000,
          image: "https://cryptoicons.org/api/icon/matic/200",
          coinGeckoId: 'polygon',
          rawPrice: 0.8945,
          rawChange: 3.21
        },
        {
          id: 'avalanche-2',
          symbol: "AVAX/USDT",
          name: "Avalanche",
          price: "$36.78",
          change: "-1.45%",
          high: "$38.20",
          low: "$35.90",
          isPositive: false,
          marketCap: 14000000000,
          volume: 750000000,
          image: "https://cryptoicons.org/api/icon/avax/200",
          coinGeckoId: 'avalanche-2',
          rawPrice: 36.78,
          rawChange: -1.45
        },
        {
          id: 'chainlink',
          symbol: "LINK/USDT",
          name: "Chainlink",
          price: "$14.56",
          change: "+2.89%",
          high: "$15.10",
          low: "$14.20",
          isPositive: true,
          marketCap: 8800000000,
          volume: 420000000,
          image: "https://cryptoicons.org/api/icon/link/200",
          coinGeckoId: 'chainlink',
          rawPrice: 14.56,
          rawChange: 2.89
        },
        {
          id: 'litecoin',
          symbol: "LTC/USDT",
          name: "Litecoin",
          price: "$73.45",
          change: "+1.67%",
          high: "$75.20",
          low: "$71.80",
          isPositive: true,
          marketCap: 5400000000,
          volume: 380000000,
          image: "https://cryptoicons.org/api/icon/ltc/200",
          coinGeckoId: 'litecoin',
          rawPrice: 73.45,
          rawChange: 1.67
        },
        {
          id: 'polkadot',
          symbol: "DOT/USDT",
          name: "Polkadot",
          price: "$5.89",
          change: "-3.12%",
          high: "$6.15",
          low: "$5.75",
          isPositive: false,
          marketCap: 7200000000,
          volume: 290000000,
          image: "https://cryptoicons.org/api/icon/dot/200",
          coinGeckoId: 'polkadot',
          rawPrice: 5.89,
          rawChange: -3.12
        },
        {
          id: 'uniswap',
          symbol: "UNI/USDT",
          name: "Uniswap",
          price: "$6.78",
          change: "+4.56%",
          high: "$7.05",
          low: "$6.45",
          isPositive: true,
          marketCap: 5100000000,
          volume: 340000000,
          image: "https://cryptoicons.org/api/icon/uni/200",
          coinGeckoId: 'uniswap',
          rawPrice: 6.78,
          rawChange: 4.56
        },
        {
          id: 'shiba-inu',
          symbol: "SHIB/USDT",
          name: "Shiba Inu",
          price: "$0.000009234",
          change: "+8.92%",
          high: "$0.000009850",
          low: "$0.000008650",
          isPositive: true,
          marketCap: 5400000000,
          volume: 280000000,
          image: "https://cryptoicons.org/api/icon/shib/200",
          coinGeckoId: 'shiba-inu',
          rawPrice: 0.000009234,
          rawChange: 8.92
        }
      ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();

    // Update data more frequently for real-time feel
    const interval = setInterval(() => {
      fetchCryptoData();
    }, error ? 30000 : 60000); // Retry every 30 seconds if error, otherwise 1 minute

    return () => clearInterval(interval);
  }, [error]);

  // Manual retry function
  const retryFetch = () => {
    console.log('🔄 Manual retry triggered');
    fetchCryptoData();
  };

  // Force refresh function that clears server cache
  const forceRefresh = async () => {
    try {
      console.log('🔄 Force refreshing data from server...');
      setLoading(true);

      // Call server refresh endpoint to clear cache
      await fetch('/api/market-data/refresh', { method: 'POST' });

      // Then fetch fresh data
      await fetchCryptoData();
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      // Fallback to regular fetch
      fetchCryptoData();
    }
  };

  return {
    cryptoData,
    loading,
    error,
    refetch: fetchCryptoData,
    retry: retryFetch,
    forceRefresh
  };
};

// Helper function to get trading route based on crypto symbol
export const getTradingRoute = (symbol, tradingType = 'spot') => {
  const baseSymbol = symbol.split('/')[0].toLowerCase();
  
  if (tradingType === 'options') {
    return `/trade/options?symbol=${baseSymbol}usdt`;
  } else {
    return `/trade/spot?symbol=${baseSymbol}usdt`;
  }
};

// Helper function to format large numbers
export const formatNumber = (num) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toString();
};

export default useCryptoData;
