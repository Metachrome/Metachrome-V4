// Cryptocurrency Data Service
import { useState, useEffect } from 'react';

// Real-time cryptocurrency data using CoinGecko API
export const useCryptoData = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try internal API first (our own market data)
      try {
        console.log('🔄 Fetching from internal market data API...');
        const internalResponse = await fetch('/api/market-data');

        if (internalResponse.ok) {
          const internalData = await internalResponse.json();
          console.log('✅ Internal API data:', internalData);

          if (internalData && internalData.length > 0) {
            // Transform internal data to match component structure
            const transformedInternalData = internalData.map(item => ({
              id: item.symbol.toLowerCase().replace('usdt', ''),
              symbol: item.symbol.replace('USDT', '/USDT'),
              name: item.symbol.replace('USDT', ''),
              price: `$${parseFloat(item.price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: parseFloat(item.price) < 1 ? 6 : 2
              })}`,
              change: `${parseFloat(item.priceChangePercent24h || 0).toFixed(2)}%`,
              high: `$${parseFloat(item.high24h || item.price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: parseFloat(item.high24h || item.price) < 1 ? 6 : 2
              })}`,
              low: `$${parseFloat(item.low24h || item.price).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: parseFloat(item.low24h || item.price) < 1 ? 6 : 2
              })}`,
              isPositive: parseFloat(item.priceChangePercent24h || 0) >= 0,
              marketCap: 0,
              volume: parseFloat(item.volume24h || 0),
              image: `https://cryptoicons.org/api/icon/${item.symbol.replace('USDT', '').toLowerCase()}/200`,
              coinGeckoId: item.symbol.toLowerCase().replace('usdt', ''),
              rawPrice: parseFloat(item.price),
              rawChange: parseFloat(item.priceChangePercent24h || 0)
            }));

            setCryptoData(transformedInternalData);
            setLoading(false);
            console.log('✅ Using internal market data');
            return;
          }
        }
      } catch (internalError) {
        console.log('⚠️ Internal API failed, trying external APIs:', internalError.message);
      }

      // Fallback to CoinGecko API
      console.log('🔄 Fetching from CoinGecko API...');
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano,ripple,dogecoin,polygon,avalanche-2,chainlink&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h',
        {
          headers: {
            'Accept': 'application/json',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ CoinGecko API data received');
      
      // Transform data to match our component structure
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
      setError(null);
      console.log('✅ CoinGecko data processed successfully');
    } catch (err) {
      console.error('❌ All crypto data sources failed:', err);
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();

    // Update data every 30 seconds, but retry more frequently if there's an error
    const interval = setInterval(() => {
      fetchCryptoData();
    }, error ? 10000 : 30000); // Retry every 10 seconds if error, otherwise 30 seconds

    return () => clearInterval(interval);
  }, [error]);

  // Manual retry function
  const retryFetch = () => {
    console.log('🔄 Manual retry triggered');
    fetchCryptoData();
  };

  return {
    cryptoData,
    loading,
    error,
    refetch: fetchCryptoData,
    retry: retryFetch
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
