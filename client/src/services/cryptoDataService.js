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
      
      // Using CoinGecko API for real-time data
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,cardano,ripple,dogecoin,polygon,avalanche-2,chainlink&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency data');
      }
      
      const data = await response.json();
      
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
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError(err.message);
      
      // Fallback to mock data if API fails
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
          image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          coinGeckoId: 'bitcoin'
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
          image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
          coinGeckoId: 'ethereum'
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
          image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
          coinGeckoId: 'binancecoin'
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
          image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
          coinGeckoId: 'solana'
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
          image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
          coinGeckoId: 'cardano'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    
    // Update data every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { cryptoData, loading, error, refetch: fetchCryptoData };
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
