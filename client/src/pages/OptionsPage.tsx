import { useState, useEffect, useRef } from "react";
import { Navigation } from "../components/ui/navigation";
import { Footer } from "../components/ui/footer";
import TradingViewWidget from "../components/TradingViewWidget";
import TradeNotification from "../components/TradeNotification";
import TradeOverlay from "../components/TradeOverlay";
import { playTradeSound } from "../utils/sounds";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import type { MarketData } from '@shared/schema';

interface ActiveTrade {
  id: string;
  direction: 'up' | 'down';
  entryPrice: number;
  amount: number;
  duration: number;
  startTime: number;
  endTime: number;
  profitPercentage: number;
  status: 'active' | 'won' | 'lost';
  currentPrice?: number;
  payout?: number;
}

export default function OptionsPage() {
  const { user } = useAuth();
  const { lastMessage, subscribe, connected } = useWebSocket();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("open");
  const [selectedDuration, setSelectedDuration] = useState("30s");
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isTrading, setIsTrading] = useState(false);
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ActiveTrade[]>([]);
  const [completedTrade, setCompletedTrade] = useState<ActiveTrade | null>(null);
  const priceHistoryRef = useRef<number[]>([]);

  // Real-time price state
  const [realTimePrice, setRealTimePrice] = useState<string>('0.00');
  const [priceChange, setPriceChange] = useState<string>('0.00%');
  const [orderBookPrice, setOrderBookPrice] = useState<number>(166373.87); // Separate state for slower order book updates
  const [orderBookData, setOrderBookData] = useState<{sellOrders: any[], buyOrders: any[]}>({sellOrders: [], buyOrders: []}); // Cache order book data

  // Fetch Binance price data
  const fetchBinancePrice = async () => {
    try {
      const response = await fetch('/api/market-data');
      const data = await response.json();
      const btcData = data.find((item: any) => item.symbol === 'BTCUSDT');
      if (btcData) {
        setRealTimePrice(btcData.price);
        setPriceChange(btcData.priceChange24h);
        setCurrentPrice(parseFloat(btcData.price));

        // Update price history for chart
        priceHistoryRef.current.push(parseFloat(btcData.price));
        if (priceHistoryRef.current.length > 100) {
          priceHistoryRef.current = priceHistoryRef.current.slice(-100);
        }
      }
    } catch (error) {
      console.error('Error fetching Binance price:', error);
    }
  };

  // Update price display in left panel
  const updatePriceDisplay = () => {
    const priceElement = document.querySelector('.price-display');
    const changeElement = document.querySelector('.price-change');

    if (priceElement) {
      priceElement.textContent = `$${realTimePrice}`;
    }
    if (changeElement) {
      changeElement.textContent = priceChange;
      changeElement.className = `price-change ${priceChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`;
    }
  };

  // Handle price updates from TradingView widget
  const handlePriceUpdate = (price: number) => {
    console.log('📊 TradingView price update:', price);
    setCurrentPrice(price);
    // Update price history for trade calculations
    priceHistoryRef.current.push(price);
    if (priceHistoryRef.current.length > 1000) {
      priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
    }
  };

  // Generate dynamic order book data based on current price
  const generateOrderBookData = (basePrice: number) => {
    const sellOrders = [];
    const buyOrders = [];

    // Generate sell orders (above current price)
    for (let i = 0; i < 8; i++) {
      const priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
      const price = basePrice + priceOffset;
      const volume = (Math.random() * 2 + 0.1).toFixed(4);
      const turnover = (price * parseFloat(volume)).toFixed(2);

      sellOrders.push({
        price: price.toFixed(2),
        volume,
        turnover
      });
    }

    // Generate buy orders (below current price)
    for (let i = 0; i < 8; i++) {
      const priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
      const price = basePrice - priceOffset;
      const volume = (Math.random() * 2 + 0.1).toFixed(4);
      const turnover = (price * parseFloat(volume)).toFixed(2);

      buyOrders.push({
        price: price.toFixed(2),
        volume,
        turnover
      });
    }

    return { sellOrders, buyOrders };
  };

  // Fetch real market data
  const { data: marketData } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
    refetchInterval: 5000,
  });

  // Fetch user balance
  const { data: userBalances } = useQuery({
    queryKey: ['/api/user/balances'],
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Get current USDT balance - handle both 'available' and 'balance' properties
  const balanceData = Array.isArray(userBalances) ? userBalances.find((b: any) => b.currency === 'USDT' || b.symbol === 'USDT') : null;
  const balance = Number(balanceData?.balance || balanceData?.available || 50000); // Default to superadmin balance

  // Get current BTC price from real market data
  const btcMarketData = marketData?.find(item => item.symbol === 'BTCUSDT');
  const realPrice = btcMarketData ? parseFloat(btcMarketData.price) : 0;

  // Ensure currentPrice is always a valid number
  const safeCurrentPrice = Number(currentPrice) || Number(realPrice) || 166373.87;

  // Initialize real-time price fetching
  useEffect(() => {
    fetchBinancePrice(); // Initial fetch
    const interval = setInterval(fetchBinancePrice, 6000); // Update every 6 seconds (slower)
    return () => clearInterval(interval);
  }, []);

  // Throttled order book updates (much slower than real-time price)
  useEffect(() => {
    const updateOrderBook = () => {
      const latestPrice = safeCurrentPrice || parseFloat(realTimePrice) || 166373.87;
      setOrderBookPrice(latestPrice);

      // Generate new order book data
      const newOrderBookData = generateOrderBookData(latestPrice);
      setOrderBookData(newOrderBookData);
      console.log('📊 Order book updated with price:', latestPrice.toFixed(2));
    };

    updateOrderBook(); // Initial update
    const interval = setInterval(updateOrderBook, 30000); // Update every 30 seconds (very slow)
    return () => clearInterval(interval);
  }, [safeCurrentPrice, realTimePrice]);

  // Update price display when realTimePrice changes
  useEffect(() => {
    updatePriceDisplay();
  }, [realTimePrice, priceChange]);

  // Update current price from real market data (fallback)
  useEffect(() => {
    if (realPrice > 0 && !realTimePrice) {
      setCurrentPrice(realPrice);
      // Keep price history for trade calculations
      priceHistoryRef.current.push(realPrice);
      if (priceHistoryRef.current.length > 1000) {
        priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
      }
      console.log('📈 Real Price Update:', realPrice.toFixed(2));
    }
  }, [realPrice, realTimePrice]);

  // Subscribe to BTC price updates via WebSocket
  useEffect(() => {
    if (connected) {
      subscribe(['BTCUSDT']);
      console.log('🔌 Subscribed to BTCUSDT price updates');
    }
  }, [connected, subscribe]);

  // Fallback polling for Vercel deployment (no WebSocket support)
  useEffect(() => {
    const isVercel = window.location.hostname.includes('vercel.app');

    if (isVercel || !connected) {
      console.log('🔄 Using polling fallback for price updates');

      const fetchPriceData = async () => {
        try {
          const response = await fetch('/api/market-data');
          const data = await response.json();
          const btcData = data.find((item: any) => item.symbol === 'BTCUSDT');
          if (btcData) {
            const price = parseFloat(btcData.price);
            if (price > 0) {
              setCurrentPrice(price);
              priceHistoryRef.current.push(price);
              if (priceHistoryRef.current.length > 1000) {
                priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
              }
              console.log('📈 Polling Price Update:', price.toFixed(2));
            }
          }
        } catch (error) {
          console.error('Error fetching price data:', error);
        }
      };

      // Initial fetch
      fetchPriceData();

      // Set up polling interval
      const interval = setInterval(fetchPriceData, 3000);
      return () => clearInterval(interval);
    }
  }, [connected]);

  // Handle WebSocket price updates
  useEffect(() => {
    if (lastMessage?.type === 'price_update' && lastMessage.data?.symbol === 'BTCUSDT') {
      const price = parseFloat(lastMessage.data.price);
      if (price > 0) {
        setCurrentPrice(price);
        priceHistoryRef.current.push(price);
        if (priceHistoryRef.current.length > 1000) {
          priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
        }
        console.log('📈 WebSocket Price Update:', price.toFixed(2));
      }
    }
  }, [lastMessage]);

  // Helper function to complete a trade and update balance
  const completeTrade = async (trade: ActiveTrade, won: boolean, finalPrice: number) => {
    const updatedTrade: ActiveTrade = {
      ...trade,
      status: won ? 'won' : 'lost',
      currentPrice: finalPrice,
      payout: won ? trade.amount * (1 + (trade.profitPercentage || 10) / 100) : 0
    };

    // Update balance based on trade outcome
    try {
      const response = await fetch('/api/trades/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          tradeId: trade.id,
          userId: user?.id || 'user-1',
          won: won,
          amount: trade.amount,
          payout: updatedTrade.payout
        })
      });

      if (response.ok) {
        // Refresh balance to show updated amount
        queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
        console.log(`💰 Balance updated: Trade ${won ? 'WON' : 'LOST'} - Amount: ${trade.amount} USDT`);
      } else {
        console.error('Failed to update balance after trade completion');
      }
    } catch (balanceError) {
      console.error('Error updating balance:', balanceError);
    }

    // Move to history and show notification
    try {
      setTradeHistory(prev => [updatedTrade, ...prev].slice(0, 50));
      setCompletedTrade(updatedTrade);
    } catch (historyError) {
      console.error('Trade history update error:', historyError);
    }

    return updatedTrade;
  };

  // Trade management and countdown
  useEffect(() => {
    try {
      const now = Date.now();
      let hasCompletedTrades = false;

      // Update active trades
      setActiveTrades(prevTrades => {
        const updatedTrades: ActiveTrade[] = [];

        prevTrades.forEach(trade => {
          const timeRemaining = Math.max(0, Math.ceil((trade.endTime - now) / 1000));

          if (timeRemaining === 0 && trade.status === 'active') {
            // Trade expired, determine outcome
            const finalPrice = safeCurrentPrice || trade.entryPrice; // Fallback to entry price
            const priceChange = finalPrice - trade.entryPrice;
            const won = (trade.direction === 'up' && priceChange > 0) ||
                       (trade.direction === 'down' && priceChange < 0);

            // Complete the trade asynchronously
            completeTrade(trade, won, finalPrice);
            hasCompletedTrades = true;

            // Play sound effect safely
            try {
              if (typeof playTradeSound === 'function') {
                playTradeSound(won ? 'win' : 'lose');
              }
            } catch (soundError) {
              console.error('Sound play error:', soundError);
            }

            console.log(`🎯 Trade completed: ${won ? 'WON' : 'LOST'} - ${trade.direction.toUpperCase()} $${trade.amount}`);
            // Don't add completed trades to active trades
          } else {
            // Keep active trades
            updatedTrades.push({ ...trade, currentPrice: currentPrice || trade.entryPrice });
          }
        });

        return updatedTrades;
      });

      // Update countdown for UI (separate from trade updates to prevent loops)
      const activeTrade = activeTrades.find(t => t.status === 'active');
      if (activeTrade) {
        const timeRemaining = Math.max(0, Math.ceil((activeTrade.endTime - now) / 1000));
        setCountdown(timeRemaining);
        setIsTrading(timeRemaining > 0);
      } else if (!hasCompletedTrades) {
        // Only update if no trades just completed to prevent state conflicts
        setCountdown(0);
        setIsTrading(false);
      }
    } catch (error) {
      console.error('Trade management error:', error);
      // Prevent crash by resetting to safe state
      setIsTrading(false);
      setCountdown(0);
    }
  }, [safeCurrentPrice]); // Remove activeTrades dependency to prevent infinite loops

  // Get profit percentage based on duration
  const getProfitPercentage = (duration: string) => {
    const profitMap: { [key: string]: number } = {
      '30s': 10,
      '60s': 15,
      '120s': 25,
      '180s': 35,
      '240s': 50,
      '300s': 75,
      '600s': 100
    };
    return profitMap[duration] || 10;
  };

  const handleTrade = async (direction: 'up' | 'down') => {
    try {
      const durationSeconds = parseInt(selectedDuration.replace('s', '')) || 30;
      const minAmount = durationSeconds === 30 ? 100 : 1000;

      if (selectedAmount < minAmount) {
        alert(`Minimum trade amount is ${minAmount} USDT for ${selectedDuration} duration`);
        return;
      }

      if (balance < selectedAmount) {
        alert('Insufficient balance');
        return;
      }

      if (activeTrades.length >= 3) {
        alert('Maximum 3 active trades allowed');
        return;
      }

      // Duration already calculated above

      if (!safeCurrentPrice || safeCurrentPrice <= 0) {
        alert('Price data not available. Please wait a moment and try again.');
        return;
      }

      // Call backend API to create trade and deduct balance
      const response = await fetch('/api/trades/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: user?.id || 'user-1',
          symbol: 'BTCUSDT',
          direction,
          amount: selectedAmount.toString(),
          duration: durationSeconds
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to place trade');
      }

      const result = await response.json();

      if (result.success) {
        const now = Date.now();
        const profitPercentage = getProfitPercentage(selectedDuration);

        const newTrade: ActiveTrade = {
          id: result.trade?.id || `trade_${now}_${Math.random().toString(36).substring(2, 11)}`,
          direction,
          entryPrice: safeCurrentPrice,
          amount: selectedAmount,
          duration: durationSeconds,
          startTime: now,
          endTime: now + (durationSeconds * 1000),
          profitPercentage,
          status: 'active'
        };

        setActiveTrades(prev => [...prev, newTrade]);
        setCountdown(durationSeconds);
        setIsTrading(true);

        // Refresh balance to show updated amount
        queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });

        // Play trade placement sound safely
        try {
          playTradeSound('place');
        } catch (soundError) {
          console.warn('Sound play failed:', soundError);
        }

        // Show trade confirmation
        console.log(`🚀 Trade Executed:`, {
          direction: direction.toUpperCase(),
          amount: `${selectedAmount} USDT`,
          duration: selectedDuration,
          entryPrice: `$${safeCurrentPrice.toFixed(2)}`,
          potentialProfit: `${profitPercentage}%`,
          potentialPayout: `${(selectedAmount * (1 + profitPercentage / 100)).toFixed(2)} USDT`
        });
      } else {
        throw new Error(result.message || 'Failed to place trade');
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Failed to execute trade: ${errorMessage}`);
    }
  };

  // Error boundary wrapper
  try {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
      
      {/* Top Header with BTC/USDT Info */}
      <div className="bg-[#10121E] px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-white font-bold text-lg">BTC/USDT</div>
            <div className="text-white text-2xl font-bold">{safeCurrentPrice.toFixed(2)}</div>
            <div className="text-gray-400 text-sm">$ {safeCurrentPrice.toFixed(2)}</div>
          </div>
          <div className={`text-lg font-semibold ${btcMarketData?.priceChangePercent24h?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
            {btcMarketData?.priceChangePercent24h || '+0.00%'}
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <div className="text-gray-400">Change 24h</div>
              <div className="text-white">{btcMarketData?.priceChange24h || '0.00'} {btcMarketData?.priceChangePercent24h || '0.00%'}</div>
            </div>
            <div>
              <div className="text-gray-400">24h High</div>
              <div className="text-white">{btcMarketData?.high24h || currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400">24h Low</div>
              <div className="text-white">{btcMarketData?.low24h || currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400">Volume 24h (BTC)</div>
              <div className="text-white">{btcMarketData?.volume24h ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(2) + 'M' : '0.00'}</div>
            </div>
            <div>
              <div className="text-gray-400">Turnover 24h (USDT)</div>
              <div className="text-white">{btcMarketData?.volume24h ? (parseFloat(btcMarketData.volume24h) * parseFloat(btcMarketData.price) / 1000000).toFixed(2) + 'M' : '0.00'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Layout */}
      <div className="bg-[#10121E] flex">
        {/* Left Panel - Order Book */}
        <div className="w-64 border-r border-gray-700">
          {/* Order Book Header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold">BTC/USDT</div>
              <div className="text-right">
                <div className={`font-bold price-display ${priceChange?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {realTimePrice || safeCurrentPrice.toFixed(2)}
                </div>
                <div className={`text-sm price-change ${priceChange?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {priceChange || btcMarketData?.priceChangePercent24h || '+0.00%'}
                </div>
                <div className={`text-sm ${btcMarketData?.priceChangePercent24h?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {btcMarketData?.priceChange24h || '0.00'} {btcMarketData?.priceChangePercent24h || '0.00%'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-white text-sm">0.01</span>
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>

          {/* Order Book Headers */}
          <div className="grid grid-cols-3 gap-2 p-2 text-xs text-gray-400 border-b border-gray-700">
            <span>Price (USDT)</span>
            <span>Volume (BTC)</span>
            <span>Turnover</span>
          </div>

          {/* Order Book Data */}
          <div className="h-[400px] overflow-y-auto">
            {/* Sell Orders (Red) */}
            <div className="space-y-0">
              {orderBookData.sellOrders.map((order, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-gray-800">
                  <span className="text-red-400">{order.price}</span>
                  <span className="text-gray-300">{order.volume}</span>
                  <span className="text-gray-300">{order.turnover}</span>
                </div>
              ))}
            </div>

            {/* Current Price */}
            <div className={`p-2 my-1 ${btcMarketData?.priceChangePercent24h?.startsWith('-') ? 'bg-red-900/20' : 'bg-green-900/20'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-lg ${btcMarketData?.priceChangePercent24h?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {currentPrice.toFixed(2)}
                </span>
                <span className={`${btcMarketData?.priceChangePercent24h?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {btcMarketData?.priceChangePercent24h?.startsWith('-') ? '↓' : '↑'}
                </span>
                <span className="text-gray-400 text-sm">${currentPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Buy Orders (Green) */}
            <div className="space-y-0">
              {orderBookData.buyOrders.map((order, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-gray-800">
                  <span className="text-green-400">{order.price}</span>
                  <span className="text-gray-300">{order.volume}</span>
                  <span className="text-gray-300">{order.turnover}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Chart and Options Trading */}
        <div className="flex-1 flex flex-col">
          {/* Chart Controls - Removed timeframe buttons, keeping only chart controls */}
          <div className="p-2 border-b border-gray-700">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button className="text-xs text-gray-400 hover:text-white">Basic version</button>
                  <button className="text-xs text-gray-400 hover:text-white">Trading view</button>
                  <button className="text-xs text-gray-400 hover:text-white">Depth</button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area - TradingView Widget */}
          <div className="h-[400px] relative bg-[#10121E] p-2">
            <TradeOverlay
              trades={activeTrades}
              currentPrice={currentPrice}
            />
            <TradingViewWidget
              type="chart"
              symbol="BINANCE:BTCUSDT"
              height="100%"
              interval="1"
              theme="dark"
              style="1"
              locale="en"
              timezone="Etc/UTC"
              allow_symbol_change={true}
              container_id="options_tradingview_widget"
              onPriceUpdate={handlePriceUpdate}
              onSymbolChange={(newSymbol) => {
                console.log('Symbol changed to:', newSymbol);
              }}
            />
          </div>

          {/* Options Trading Controls */}
          <div className="p-4 border-t border-gray-700">
            {/* Current Price Display */}
            <div className="mb-4 p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Current Price:</span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {connected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold text-lg">
                    ${safeCurrentPrice > 0 ? safeCurrentPrice.toFixed(2) : 'Loading...'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400">Balance:</span>
                {user ? (
                  <span className="text-green-400 font-bold">{balance.toFixed(2)} USDT</span>
                ) : (
                  <span className="text-yellow-400 font-bold">Sign in required</span>
                )}
              </div>
              {isTrading && activeTrades.length > 0 && (
                <div className="mt-3 space-y-2">
                  {activeTrades.map(trade => {
                    const timeRemaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
                    const priceChange = safeCurrentPrice - trade.entryPrice;
                    const isWinning = (trade.direction === 'up' && priceChange > 0) ||
                                     (trade.direction === 'down' && priceChange < 0);

                    return (
                      <div key={trade.id} className="p-2 bg-gray-700 rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.direction.toUpperCase()} ${trade.amount}
                          </span>
                          <span className="text-yellow-400 font-bold">{timeRemaining}s</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-400">
                            Entry: ${trade.entryPrice.toFixed(2)}
                          </span>
                          <span className={`font-bold ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                            {priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-center mt-1">
                          <span className={`text-xs ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                            {isWinning ? '🟢 WINNING' : '🔴 LOSING'} • Profit: {trade.profitPercentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Duration Buttons */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {[
                { duration: '30s', profit: '10.00%' },
                { duration: '60s', profit: '15.00%' },
                { duration: '120s', profit: '25.00%' },
                { duration: '180s', profit: '35.00%' },
                { duration: '240s', profit: '50.00%' },
                { duration: '300s', profit: '75.00%' },
                { duration: '600s', profit: '100.00%' }
              ].map((option) => (
                <button
                  key={option.duration}
                  onClick={() => {
                    setSelectedDuration(option.duration);
                    // Update minimum amount based on duration
                    const durationSeconds = parseInt(option.duration.replace('s', ''));
                    const minAmount = durationSeconds === 30 ? 100 : 1000;
                    if (selectedAmount < minAmount) {
                      setSelectedAmount(minAmount);
                    }
                  }}
                  className={`p-2 rounded text-center border transition-colors ${
                    selectedDuration === option.duration
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  disabled={isTrading}
                >
                  <div className="text-sm font-medium">{option.duration}</div>
                  <div className="text-xs text-green-400">{option.profit}</div>
                </button>
              ))}
            </div>

            {/* Amount Selection */}
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-2">
                Minimum buy: {parseInt(selectedDuration.replace('s', '')) === 30 ? '100' : '1000'} USDT | Selected: {selectedAmount} USDT
              </div>
              <div className="grid grid-cols-8 gap-2 mb-2">
                {[10, 20, 50, 100, 200, 500, 1000, 2000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`p-2 rounded text-sm transition-colors ${
                      selectedAmount === amount
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                    disabled={isTrading}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="mt-2">
                <input
                  type="number"
                  min={parseInt(selectedDuration.replace('s', '')) === 30 ? "100" : "1000"}
                  value={selectedAmount}
                  onChange={(e) => {
                    const minAmount = parseInt(selectedDuration.replace('s', '')) === 30 ? 100 : 1000;
                    setSelectedAmount(Math.max(minAmount, parseInt(e.target.value) || minAmount));
                  }}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder={`Custom amount (min ${parseInt(selectedDuration.replace('s', '')) === 30 ? '100' : '1000'} USDT)`}
                  disabled={isTrading}
                />
              </div>
            </div>

            <div className="text-gray-400 text-sm mb-4">
              {user ? (
                <>Available: {balance.toFixed(2)} USDT | Active Trades: {activeTrades.length}/3</>
              ) : (
                <>Sign in to view balance and start trading</>
              )}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    console.log('🔧 Debug Info:', {
                      currentPrice,
                      activeTrades: activeTrades.length,
                      balance,
                      selectedAmount,
                      selectedDuration
                    });
                  }}
                  className="ml-4 text-xs bg-blue-600 px-2 py-1 rounded"
                >
                  Debug
                </button>
              )}
            </div>

            {/* Buy Up / Buy Down Buttons */}
            {!user ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled
                    className="bg-gray-600 cursor-not-allowed text-white py-4 rounded font-medium text-lg"
                  >
                    <div>Buy Up</div>
                    <div className="text-xs mt-1">Sign in required</div>
                  </button>
                  <button
                    disabled
                    className="bg-gray-600 cursor-not-allowed text-white py-4 rounded font-medium text-lg"
                  >
                    <div>Buy Down</div>
                    <div className="text-xs mt-1">Sign in required</div>
                  </button>
                </div>
                <p className="text-center text-yellow-400 text-sm">
                  <a href="/login" className="underline hover:text-yellow-300">
                    Sign in to start options trading
                  </a>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTrade('up')}
                  disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded font-medium text-lg transition-colors relative"
                >
                  <div>Buy Up</div>
                  <div className="text-xs mt-1">
                    Profit: {getProfitPercentage(selectedDuration)}% •
                    Payout: {(selectedAmount * (1 + getProfitPercentage(selectedDuration) / 100)).toFixed(0)} USDT
                  </div>
                </button>
                <button
                  onClick={() => handleTrade('down')}
                  disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded font-medium text-lg transition-colors relative"
                >
                  <div>Buy Down</div>
                  <div className="text-xs mt-1">
                    Profit: {getProfitPercentage(selectedDuration)}% •
                    Payout: {(selectedAmount * (1 + getProfitPercentage(selectedDuration) / 100)).toFixed(0)} USDT
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Trading Pairs */}
        <div className="w-80 border-l border-gray-700">
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1b2e] text-white pl-10 pr-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 mb-4">
            <div className="flex space-x-6">
              <button className="text-gray-400 text-sm hover:text-white">Favorites</button>
              <button className="text-gray-400 text-sm hover:text-white">Spot</button>
              <button className="text-blue-400 text-sm border-b-2 border-blue-400 pb-1">Options</button>
            </div>
          </div>

          {/* Trading Pairs */}
          <div className="px-4 space-y-2 mb-6 max-h-[300px] overflow-y-auto">
            {(marketData || [
              { symbol: 'BTCUSDT', price: realTimePrice || '118099.98', priceChangePercent24h: priceChange || '+1.44%' },
              { symbol: 'ETHUSDT', price: '3776.75', priceChangePercent24h: '+1.06%' },
              { symbol: 'DOGEUSDT', price: '0.238780', priceChangePercent24h: '+0.80%' },
              { symbol: 'XRPUSDT', price: '3.188300', priceChangePercent24h: '+1.47%' },
              { symbol: 'ADAUSDT', price: '0.827200', priceChangePercent24h: '+0.60%' }
            ]).slice(0, 6).map((marketItem, index) => {
              const symbol = marketItem.symbol.replace('USDT', '/USDT');
              const coin = marketItem.symbol.replace('USDT', '');
              const isPositive = !marketItem.priceChangePercent24h?.startsWith('-');
              const iconMap: { [key: string]: { icon: string, bg: string } } = {
                'BTC': { icon: '₿', bg: 'bg-orange-500' },
                'ETH': { icon: 'Ξ', bg: 'bg-purple-500' },
                'DOGE': { icon: 'D', bg: 'bg-yellow-500' },
                'XRP': { icon: '✕', bg: 'bg-gray-600' },
                'ADA': { icon: 'A', bg: 'bg-blue-500' },
              };
              const iconInfo = iconMap[coin] || { icon: coin[0], bg: 'bg-gray-500' };
              const pair = {
                symbol,
                coin,
                price: parseFloat(marketItem.price).toFixed(marketItem.price.includes('.') && parseFloat(marketItem.price) < 1 ? 6 : 2),
                change: marketItem.priceChangePercent24h || '+0.00%',
                isPositive,
                icon: iconInfo.icon,
                iconBg: iconInfo.bg
              };

              return (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-[#1a1b2e] rounded cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${pair.iconBg}`}>
                      {pair.icon}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{pair.symbol}</div>
                      <div className="text-gray-400 text-xs">{pair.coin}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{pair.price}</div>
                    <div className={`text-xs ${pair.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {pair.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Latest Transactions */}
          <div className="border-t border-gray-700">
            <div className="px-4 py-3">
              <div className="text-white font-medium text-sm">Latest transaction</div>
            </div>

            {/* Transaction Headers */}
            <div className="px-4 py-2 border-b border-gray-700">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Time</span>
                <span>Price (USDT)</span>
                <span>Amount</span>
              </div>
            </div>

            {/* Transaction List */}
            <div className="h-[200px] overflow-y-auto px-4">
              <div className="space-y-1 py-2">
                {[
                  { time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0080', type: 'buy' },
                  { time: new Date(Date.now() - 1000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0001700', type: 'buy' },
                  { time: new Date(Date.now() - 2000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.1000', type: 'sell' },
                  { time: new Date(Date.now() - 3000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0004200', type: 'buy' },
                  { time: new Date(Date.now() - 5000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0047', type: 'sell' },
                  { time: new Date(Date.now() - 6000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0016', type: 'buy' },
                  { time: new Date(Date.now() - 7000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.00070000', type: 'sell' },
                  { time: new Date(Date.now() - 8000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0243', type: 'buy' },
                ].map((transaction, index) => (
                  <div key={index} className="flex justify-between text-xs py-1 hover:bg-gray-800/50 rounded px-2 -mx-2">
                    <span className="text-gray-400 font-mono">{transaction.time}</span>
                    <span className={`font-mono ${transaction.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.price}
                    </span>
                    <span className="text-gray-300 font-mono">{transaction.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Order History Section */}
      <div className="bg-[#10121E] border-t border-gray-700 min-h-[200px]">
        {/* Tabs Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab("open")}
              className={`pb-1 text-sm font-medium ${
                activeTab === "open"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Active Trades({activeTrades.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-1 text-sm font-medium ${
                activeTab === "history"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Trade History({tradeHistory.length})
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm text-gray-400">
              <input type="checkbox" className="mr-2" />
              Hide other trading pairs
            </label>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Trade Table Headers */}
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="grid grid-cols-8 gap-4 text-xs text-gray-400">
            <span>Direction</span>
            <span>Entry Price</span>
            <span>Current Price</span>
            <span>Amount</span>
            <span>Profit %</span>
            <span>P&L (USDT)</span>
            <span>Time</span>
            <span>Status</span>
          </div>
        </div>

        {/* Trade Content */}
        <div className="px-4 py-2 max-h-[300px] overflow-y-auto">
          {activeTab === "open" && (
            <>
              {activeTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 mb-4 opacity-50">
                    <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className="text-gray-400 text-sm">No active trades</div>
                </div>
              ) : (
                activeTrades.map(trade => {
                  const timeRemaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
                  const priceChange = safeCurrentPrice - trade.entryPrice;
                  const isWinning = (trade.direction === 'up' && priceChange > 0) ||
                                   (trade.direction === 'down' && priceChange < 0);
                  const potentialPayout = isWinning ? (trade.amount * (1 + trade.profitPercentage / 100)) - trade.amount : -trade.amount;

                  return (
                    <div key={trade.id} className="grid grid-cols-8 gap-4 text-xs py-3 border-b border-gray-800 hover:bg-gray-800/30">
                      <span className={`font-bold ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.direction.toUpperCase()}
                      </span>
                      <span className="text-gray-300">${trade.entryPrice.toFixed(2)}</span>
                      <span className="text-white">${currentPrice.toFixed(2)}</span>
                      <span className="text-gray-300">{trade.amount} USDT</span>
                      <span className="text-gray-300">{trade.profitPercentage}%</span>
                      <span className={`font-bold ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                        {potentialPayout > 0 ? '+' : ''}{potentialPayout.toFixed(2)}
                      </span>
                      <span className="text-yellow-400 font-bold">{timeRemaining}s</span>
                      <span className={`font-bold ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                        {isWinning ? '🟢 WINNING' : '🔴 LOSING'}
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}

          {activeTab === "history" && (
            <>
              {tradeHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 mb-4 opacity-50">
                    <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className="text-gray-400 text-sm">No trade history</div>
                </div>
              ) : (
                tradeHistory.map(trade => {
                  const pnl = trade.status === 'won' ? (trade.payout! - trade.amount) : -trade.amount;
                  const endTime = new Date(trade.endTime).toLocaleTimeString();

                  return (
                    <div key={trade.id} className="grid grid-cols-8 gap-4 text-xs py-3 border-b border-gray-800 hover:bg-gray-800/30">
                      <span className={`font-bold ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.direction.toUpperCase()}
                      </span>
                      <span className="text-gray-300">${trade.entryPrice.toFixed(2)}</span>
                      <span className="text-gray-300">${trade.currentPrice?.toFixed(2) || 'N/A'}</span>
                      <span className="text-gray-300">{trade.amount} USDT</span>
                      <span className="text-gray-300">{trade.profitPercentage}%</span>
                      <span className={`font-bold ${pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
                      </span>
                      <span className="text-gray-400">{endTime}</span>
                      <span className={`font-bold ${trade.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.status === 'won' ? '✅ WON' : '❌ LOST'}
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      {/* Trade Notification */}
      <TradeNotification
        trade={completedTrade ? {
          id: completedTrade.id,
          direction: completedTrade.direction,
          amount: completedTrade.amount,
          entryPrice: completedTrade.entryPrice,
          finalPrice: completedTrade.currentPrice || completedTrade.entryPrice,
          status: completedTrade.status as 'won' | 'lost',
          payout: completedTrade.payout,
          profitPercentage: completedTrade.profitPercentage
        } : null}
        onClose={() => setCompletedTrade(null)}
      />
    </div>
  );
  } catch (error) {
    console.error('OptionsPage render error:', error);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Trading Page Error</div>
          <div className="text-gray-300 mb-4">Something went wrong. Please refresh the page.</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
