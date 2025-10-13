import { useState, useEffect, useRef } from "react";
import { Navigation } from "../components/ui/navigation";
import { Footer } from "../components/ui/footer";
import { MobileBottomNav } from "../components/ui/mobile-bottom-nav";
import TradingViewWidget from "../components/TradingViewWidget";
import LightweightChart from "../components/LightweightChart";
import CustomTradingChart from "../components/CustomTradingChart";
import ErrorBoundary from "../components/ErrorBoundary";
import { PriceProvider, usePrice, usePriceChange, use24hStats } from "../contexts/PriceContext";
import TradeNotification from "../components/TradeNotification";
import TradeOverlay from "../components/TradeOverlay";
import { playTradeSound } from "../utils/sounds";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { useIsMobile } from '../hooks/use-mobile';
import { useMultiSymbolPrice } from '../hooks/useMultiSymbolPrice';
import { apiRequest } from '../lib/queryClient';

import type { MarketData } from '../../../shared/schema';

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
  profit?: number;
  expiryTime?: number;
  exitPrice?: number;
  symbol?: string;
}

// Inner component that uses price context
function OptionsPageContent({
  selectedSymbol,
  setSelectedSymbol
}: {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
}) {
  const { user } = useAuth();
  const { lastMessage, subscribe, connected, sendMessage } = useWebSocket();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Debug WebSocket connection status
  useEffect(() => {
    console.log('🔌 WEBSOCKET STATUS:', { connected, hasLastMessage: !!lastMessage });
    if (connected) {
      console.log('✅ WebSocket is connected and ready');
    } else {
      console.log('❌ WebSocket is NOT connected');
    }
  }, [connected, lastMessage]);

  // Use price context for synchronized price data
  const { priceData } = usePrice();
  const { changeText, changeColor, isPositive } = usePriceChange();
  const { high, low, volume } = use24hStats();

  // Multi-symbol price data for all trading pairs
  const { priceData: multiSymbolPriceData, getPriceForSymbol } = useMultiSymbolPrice();

  // Chart view state - Default to TradingView to avoid red line issues
  const [chartView, setChartView] = useState<'basic' | 'tradingview' | 'depth'>('tradingview');

  // Debug user data
  console.log('🔍 OPTIONS PAGE - User data:', {
    id: user?.id,
    role: user?.role,
    verificationStatus: user?.verificationStatus,
    username: user?.username
  });

  // Debug price data from context
  console.log('💰 OPTIONS PAGE - Price from context:', priceData?.price);



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
  const [notificationKey, setNotificationKey] = useState<string>(''); // Force re-render



  // ROBUST NOTIFICATION TRIGGER FUNCTION
  const triggerNotification = (trade: ActiveTrade) => {
    console.log('🔔 TRIGGER: Starting notification trigger for trade:', trade.id);

    // Generate unique key to force re-render
    const uniqueKey = `${trade.id}-${Date.now()}`;
    setNotificationKey(uniqueKey);

    // Clear existing notification
    setCompletedTrade(null);

    // Set new notification with delay to ensure React re-renders
    setTimeout(() => {
      console.log('🔔 TRIGGER: Setting notification state with key:', uniqueKey);
      setCompletedTrade(trade);
      localStorage.setItem('completedTrade', JSON.stringify(trade));

      // Auto-hide after 60 seconds
      setTimeout(() => {
        console.log('🔔 TRIGGER: Auto-hiding notification');
        setCompletedTrade(null);
        localStorage.removeItem('completedTrade');
      }, 60000);
    }, 200);
  };

  // GLOBAL FUNCTION FOR CONSOLE TESTING
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testMobileNotification = () => {
        console.log('🧪 GLOBAL: Testing mobile notification from console');
        const testTrade = {
          id: 'console-test-' + Date.now(),
          direction: 'up' as const,
          amount: 100,
          entryPrice: 50000,
          currentPrice: 51000,
          status: 'won' as const,
          payout: 110,
          profitPercentage: 10
        };
        triggerNotification(testTrade);
      };

      (window as any).testDirectNotification = () => {
        console.log('🧪 GLOBAL: Creating direct DOM notification from console');

        // Remove existing
        const existing = document.querySelectorAll('[data-mobile-notification="true"]');
        existing.forEach(el => el.remove());

        // Test the complete flow
        const testTrade = {
          id: 'flow-test-' + Date.now(),
          direction: 'up' as const,
          amount: 100,
          entryPrice: 50000,
          currentPrice: 51000,
          status: 'won' as const,
          payout: 110,
          profitPercentage: 10,
          symbol: 'BTC/USDT',
          duration: 30,
          profit: 10
        };

        console.log('🧪 GLOBAL: Testing complete notification flow with trade:', testTrade);
        triggerNotification(testTrade);
      };

      (window as any).testTradeCompletion = () => {
        console.log('🧪 GLOBAL: Simulating trade completion WebSocket message');

        // Simulate a WebSocket message
        const mockMessage = {
          type: 'trigger_mobile_notification',
          data: {
            tradeId: 'mock-test-' + Date.now(),
            userId: user?.id,
            direction: 'up',
            amount: 100,
            entryPrice: 50000,
            currentPrice: 51000,
            status: 'won',
            payout: 110,
            profitPercentage: 10,
            symbol: 'BTC/USDT',
            duration: 30
          }
        };

        console.log('🧪 GLOBAL: Simulating WebSocket message:', mockMessage);
        // Manually trigger the useEffect by setting lastMessage
        // This simulates what would happen when a real WebSocket message arrives
      };

      (window as any).testOldDirectNotification = () => {
        console.log('🧪 GLOBAL: Creating direct DOM notification from console');

        // Remove existing
        const existing = document.querySelectorAll('[data-mobile-notification="true"]');
        existing.forEach(el => el.remove());

        // Create new
        const notification = document.createElement('div');
        notification.setAttribute('data-mobile-notification', 'true');
        notification.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 999999999 !important;
          background-color: rgba(0, 0, 0, 0.95) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 16px !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        `;

        notification.innerHTML = `
          <div style="
            background-color: #1a1b3a;
            border-radius: 16px;
            padding: 20px;
            max-width: 320px;
            width: 90%;
            border: 3px solid #10b981;
            color: white;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
            text-align: center;
          ">
            <div style="font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 16px;">
              🎉 CONSOLE TEST SUCCESS!
            </div>
            <div style="margin-bottom: 16px; color: #9ca3af;">
              This notification was triggered from the browser console.
            </div>
            <button onclick="this.closest('[data-mobile-notification]').remove()" style="
              background-color: #10b981;
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px 24px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              width: 100%;
            ">
              Close Console Test
            </button>
          </div>
        `;

        document.body.appendChild(notification);
        console.log('✅ GLOBAL: Direct notification created from console');
      };

      console.log('🧪 GLOBAL FUNCTIONS AVAILABLE:');
      console.log('- testMobileNotification() - Test React notification');
      console.log('- testDirectNotification() - Test direct DOM notification');
    }
  }, []);
  const [currentTradingMode, setCurrentTradingMode] = useState<'normal' | 'win' | 'lose'>(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('currentTradingMode');
    return (stored === 'win' || stored === 'lose' || stored === 'normal') ? stored : 'normal';
  });
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mobileTradeData, setMobileTradeData] = useState<any>(null);
  const priceHistoryRef = useRef<number[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Mobile trade modal function
  const showMobileTradeModal = (data: any) => {
    setMobileTradeData(data);
    setIsMobileModalOpen(true);

    // Force body scroll prevention
    document.body.style.overflow = 'hidden';
  };

  // Load trade history function (moved outside useEffect for reusability)
  const loadTradeHistory = async () => {
      if (!user?.id) return;

      setIsLoadingHistory(true);

      // CRITICAL FIX: Invalidate React Query cache to prevent conflicts with TransactionHistory.tsx
      try {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/trades`] });
        console.log('🗑️ Invalidated React Query cache for trade history to prevent conflicts');
      } catch (error) {
        console.error('❌ Error invalidating React Query cache:', error);
      }

      // Clear any existing localStorage cache to prevent conflicts
      try {
        localStorage.removeItem(`tradeHistory_${user.id}`);
        console.log('🗑️ Cleared any existing localStorage trade history cache');
      } catch (error) {
        console.error('❌ Error clearing localStorage cache:', error);
      }

      // Always fetch fresh data from server
      console.log('📈 Loading fresh trade history from server (no caching)');

      // Then fetch fresh data from server
      try {
        const response = await fetch(`/api/users/${user.id}/trades`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const serverTrades = await response.json();
          console.log('📈 Loaded trade history from server:', serverTrades.length);
          console.log('📈 Raw server trades:', serverTrades);

          // Convert server trades to ActiveTrade format - IMPROVED FILTERING
          console.log('📈 Raw server trades before filtering:', serverTrades);
          const formattedTrades = serverTrades
            .filter((trade: any) => {
              // More lenient filtering - include any trade with a result
              const hasResult = trade.result && (trade.result === 'win' || trade.result === 'lose' || trade.result === 'won' || trade.result === 'lost');
              const notPending = trade.status !== 'pending' && trade.result !== 'pending';
              console.log(`📈 Trade ${trade.id}: result=${trade.result}, status=${trade.status}, hasResult=${hasResult}, notPending=${notPending}`);
              return hasResult && notPending;
            })
            .map((trade: any) => {
              const entryPrice = parseFloat(trade.entry_price || '0');
              let exitPrice = parseFloat(trade.exit_price || '0');
              const isWon = (trade.result === 'win' || trade.result === 'won');

              console.log(`📊 Trade ${trade.id}: Entry=${entryPrice}, Exit=${exitPrice}, Status=${trade.status}, Result=${trade.result}`);

              // ONLY generate exit price if it's truly missing from database (should be rare)
              if (!exitPrice || exitPrice === 0) {
                console.log(`⚠️ Missing exit price for trade ${trade.id}, generating consistent fallback`);
                // Use trade ID as seed for consistent price generation
                const seed = parseInt(trade.id.toString().slice(-6)) || 123456;
                const seededRandom = (seed * 9301 + 49297) % 233280 / 233280; // Simple seeded random

                // Generate realistic price movement for Bitcoin (0.01% to 0.5% max for 30-60 second trades)
                const maxMovement = 0.005; // 0.5% maximum movement for short-term trades
                const minMovement = 0.0001; // 0.01% minimum movement
                const movementRange = maxMovement - minMovement;
                const movementPercent = (seededRandom * movementRange + minMovement);

                // Determine direction based on trade outcome and direction
                let priceDirection = 1; // Default up
                if (trade.direction === 'up') {
                  // For UP trades: WIN means price goes up, LOSE means price goes down
                  priceDirection = isWon ? 1 : -1;
                } else if (trade.direction === 'down') {
                  // For DOWN trades: WIN means price goes down, LOSE means price goes up
                  priceDirection = isWon ? -1 : 1;
                }

                // Calculate realistic exit price
                exitPrice = entryPrice * (1 + (movementPercent * priceDirection));

                // Ensure minimum price difference (at least $0.01 for Bitcoin)
                const minDifference = 0.01;
                if (Math.abs(exitPrice - entryPrice) < minDifference) {
                  exitPrice = entryPrice + (priceDirection * minDifference);
                }

                console.log(`✅ Generated fallback exit price for trade ${trade.id}: ${exitPrice}`);
              } else {
                console.log(`✅ Using stored exit price for trade ${trade.id}: ${exitPrice}`);
              }

              const formattedTrade = {
                id: trade.id,
                symbol: trade.symbol || 'BTCUSDT',
                amount: parseFloat(trade.amount),
                direction: trade.direction,
                duration: trade.duration || 30,
                entryPrice: entryPrice,
                currentPrice: exitPrice, // Use calculated realistic exit price
                payout: isWon ? parseFloat(trade.amount) + parseFloat(trade.profit_loss || '0') : 0,
                status: isWon ? 'won' : 'lost',
                endTime: trade.updated_at || trade.created_at,
                startTime: trade.created_at,
                profit: parseFloat(trade.profit_loss || '0'),
                profitPercentage: trade.duration === 30 ? 10 : 15
              };
              console.log(`📈 Formatted trade ${trade.id}:`, formattedTrade);
              return formattedTrade;
            });

          console.log('📈 Formatted trades count:', formattedTrades.length);
          setTradeHistory(formattedTrades);

          // Don't cache trade history to prevent conflicts with fresh data
          console.log('📈 Trade history loaded fresh from server (no caching):', user.id);
        } else {
          console.log('⚠️ Failed to load trade history from server, using cached data');
        }
      } catch (error) {
        console.error('❌ Error loading trade history from server, using cached data:', error);
      } finally {
        setIsLoadingHistory(false);
      }
  };

  // Load trade history from server on component mount (no auto-refresh)
  useEffect(() => {
    loadTradeHistory();
  }, [user?.id]);

  // Sync trading mode from localStorage on mount and when it changes
  useEffect(() => {
    const syncTradingMode = () => {
      const stored = localStorage.getItem('currentTradingMode');
      if (stored && (stored === 'win' || stored === 'lose' || stored === 'normal')) {
        setCurrentTradingMode(stored);
        console.log(`🔄 Synced trading mode from localStorage: ${stored.toUpperCase()}`);
      }
    };

    // Sync on mount
    syncTradingMode();

    // Listen for localStorage changes (from other tabs or WebSocket updates)
    window.addEventListener('storage', syncTradingMode);

    return () => {
      window.removeEventListener('storage', syncTradingMode);
    };
  }, []);

  // Real-time price state - NOW USING PRICE CONTEXT (SINGLE SOURCE OF TRUTH)
  // REMOVED local state - using priceData from context instead
  // const [realTimePrice, setRealTimePrice] = useState<string>('0.00');
  // const [priceChange, setPriceChange] = useState<string>('0.00%');
  // const [orderBookPrice, setOrderBookPrice] = useState<number>(166373.87);

  // Use price from context - ALL components will show SAME price
  const realTimePrice = priceData?.price.toFixed(2) || '0.00';
  const orderBookPrice = priceData?.price || 166373.87;

  // SINGLE SOURCE OF TRUTH for display price - ALWAYS use priceData from context
  // This ensures ALL numbers across the page are SYNCHRONIZED
  const displayPrice = priceData?.price || currentPrice || 166373.87;

  // Trading pairs data - Dynamic with real-time prices (All 19 supported currencies)
  const tradingPairs = [
    'BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'LTCUSDT', 'BNBUSDT',
    'SOLUSDT', 'TONUSDT', 'DOGEUSDT', 'ADAUSDT', 'TRXUSDT',
    'HYPEUSDT', 'LINKUSDT', 'AVAXUSDT', 'SUIUSDT', 'SHIBUSDT',
    'BCHUSDT', 'DOTUSDT', 'MATICUSDT', 'XLMUSDT'
  ].map(rawSymbol => {
    // Get real-time price data for this symbol
    const symbolPriceData = getPriceForSymbol(rawSymbol);

    // For the currently selected symbol, use the PriceContext data (more frequent updates)
    const isCurrentSymbol = rawSymbol === selectedSymbol;
    const price = isCurrentSymbol && priceData ? priceData.price : (symbolPriceData?.price || 0);
    const priceChangePercent = isCurrentSymbol && priceData ?
      priceData.priceChangePercent24h :
      (symbolPriceData?.priceChangePercent24h || 0);

    // Format price change percentage
    const formattedChange = priceChangePercent >= 0 ?
      `+${priceChangePercent.toFixed(2)}%` :
      `${priceChangePercent.toFixed(2)}%`;

    return {
      symbol: rawSymbol.replace('USDT', '/USDT'),
      coin: rawSymbol.replace('USDT', ''),
      rawSymbol,
      price: price.toString(),
      priceChangePercent24h: formattedChange
    };
  });

  // Filter trading pairs based on search term
  const filteredTradingPairs = tradingPairs.filter(pair =>
    pair.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current selected pair data
  const currentPairData = tradingPairs.find(pair => pair.rawSymbol === selectedSymbol) || tradingPairs[0];

  // Handle trading pair selection
  const handlePairSelect = (rawSymbol: string) => {
    console.log('🔄 Selected trading pair:', rawSymbol);
    setSelectedSymbol(rawSymbol);
    // Clear search when a pair is selected
    setSearchTerm("");
  };

  // Handle symbol change from TradingView widget
  const handleTradingViewSymbolChange = (newSymbol: string) => {
    console.log('📈 TradingView symbol changed to:', newSymbol);
    console.log('📈 Current selected symbol:', selectedSymbol);
    console.log('📈 Available trading pairs:', tradingPairs.map(p => p.rawSymbol));

    // Convert TradingView symbol format to our format
    // e.g., "ETHUSDT" -> "ETHUSDT"
    const cleanSymbol = newSymbol.replace('BINANCE:', '').replace('COINBASE:', '');

    // Check if this symbol exists in our trading pairs
    const matchingPair = tradingPairs.find(pair => pair.rawSymbol === cleanSymbol);

    if (matchingPair) {
      console.log('✅ Found matching pair:', matchingPair);
      console.log('✅ Setting selected symbol to:', cleanSymbol);
      setSelectedSymbol(cleanSymbol);
      // Clear search when symbol changes
      setSearchTerm("");
    } else {
      console.log('⚠️ Symbol not found in trading pairs:', cleanSymbol);
      console.log('⚠️ Available symbols:', tradingPairs.map(p => p.rawSymbol).join(', '));
      // Optionally, you could add the symbol to trading pairs or show a notification
    }
  };

  // Handle search with auto-selection
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // Auto-select if search matches exactly one coin
    if (value.length > 0) {
      const exactMatches = tradingPairs.filter(pair =>
        pair.coin.toLowerCase() === value.toLowerCase()
      );

      if (exactMatches.length === 1) {
        console.log('🎯 Auto-selecting exact match:', exactMatches[0].rawSymbol);
        setSelectedSymbol(exactMatches[0].rawSymbol);
      }
    }
  };

  const [orderBookData, setOrderBookData] = useState<{sellOrders: any[], buyOrders: any[]}>({sellOrders: [], buyOrders: []}); // Cache order book data

  // REMOVED: fetchBinancePrice - Now using PriceContext instead
  // Price updates are handled by PriceContext automatically

  // Update order book and price history when price changes from context
  useEffect(() => {
    if (priceData?.price) {
      const price = priceData.price;

      // Update price history for trade calculations
      priceHistoryRef.current.push(price);
      if (priceHistoryRef.current.length > 1000) {
        priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
      }

      // Generate new order book data based on current price
      const newOrderBookData = generateOrderBookData(price);
      setOrderBookData(newOrderBookData);

      console.log('📊 Price update from context:', price.toFixed(2));
      console.log('📊 Order book data generated:', {
        sellOrders: newOrderBookData.sellOrders.length,
        buyOrders: newOrderBookData.buyOrders.length,
        firstSell: newOrderBookData.sellOrders[0],
        firstBuy: newOrderBookData.buyOrders[0]
      });
    }
  }, [priceData?.price]); // Re-run when price changes

  // REMOVED: updatePriceDisplay - Price display is now handled by React rendering with priceData from context
  // REMOVED: handlePriceUpdate - Not needed anymore, price comes from PriceContext

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

  // Fetch user balance with real-time sync - FIXED: Use same endpoint as Wallet page
  const { data: userBalances } = useQuery({
    queryKey: ['/api/balances'],
    enabled: !!user,
    refetchInterval: 2000, // Very fast refetch for real-time balance sync
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data (updated from cacheTime)
    queryFn: async () => {
      console.log('🔍 OPTIONS: Fetching balance from /api/balances for user:', user?.id, user?.username);
      console.log('🔍 OPTIONS: Auth token:', localStorage.getItem('authToken')?.substring(0, 30) + '...');

      const response = await fetch('/api/balances', {
        credentials: 'include', // Important: send session cookies
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log('🔍 OPTIONS: Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OPTIONS: Balance API failed:', response.status, errorText);
        throw new Error(`Failed to fetch balance: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 OPTIONS: Balance API response:', data);
      return data;
    },
  });

  // Get current USDT balance - Only when user is authenticated
  let balance = 0;

  console.log('🔍 OPTIONS PAGE - User:', user?.id, 'UserBalances:', userBalances);

  if (user && userBalances && Array.isArray(userBalances)) {
    console.log('🔍 OPTIONS - RAW userBalances (array):', userBalances);
    // Format: [{ symbol: "USDT", available: "1400" }, ...]
    const usdtBalance = userBalances.find((b: any) => b.symbol === 'USDT');
    balance = Number(usdtBalance?.available || 0);
    console.log('🔍 OPTIONS - Using standardized array format:', balance, usdtBalance);
  } else if (user) {
    console.log('🔍 OPTIONS - userBalances is not in expected array format:', typeof userBalances, userBalances);
    console.log('🔍 OPTIONS - User authenticated but no balance data');
  } else {
    console.log('🔍 OPTIONS - No user authenticated');
  }

  // Ensure balance is a valid number
  if (isNaN(balance)) {
    console.warn('🔍 OPTIONS - Balance is NaN, setting to 0');
    balance = 0;
  }

  console.log('🔍 OPTIONS - Final balance:', balance);



  // Handle WebSocket balance updates for real-time sync
  useEffect(() => {
    if (lastMessage?.type === 'balance_update') {
      console.log('🔄 OPTIONS: Real-time balance update received:', lastMessage.data);
      console.log('🔄 OPTIONS: Current user ID:', user?.id, 'Update for user:', lastMessage.data?.userId);

      // Aggressive cache invalidation - clear all balance-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
      queryClient.removeQueries({ queryKey: ['/api/balances'] });

      // Force immediate refetch with a small delay to ensure cache is cleared
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/balances'] });
      }, 100);
    }
  }, [lastMessage, queryClient, user?.id]);

  // Get current BTC price from real market data
  const btcMarketData = marketData?.find(item => item.symbol === 'BTCUSDT');
  const realPrice = btcMarketData ? parseFloat(btcMarketData.price) : 0;

  // Ensure currentPrice is always a valid number - ALWAYS use displayPrice as primary source
  const safeCurrentPrice = displayPrice;

  // REMOVED: Initialize real-time price fetching - Now handled by PriceContext
  // Price updates are automatically managed by PriceContext provider

  // Throttled order book updates (much slower than real-time price)
  useEffect(() => {
    const updateOrderBook = () => {
      const latestPrice = safeCurrentPrice || parseFloat(realTimePrice) || 166373.87;
      // REMOVED: setOrderBookPrice - now using orderBookPrice from priceData

      // Generate new order book data
      const newOrderBookData = generateOrderBookData(latestPrice);
      setOrderBookData(newOrderBookData);
      console.log('📊 Order book updated with price:', latestPrice.toFixed(2));
    };

    updateOrderBook(); // Initial update
    const interval = setInterval(updateOrderBook, 30000); // Update every 30 seconds (very slow)
    return () => clearInterval(interval);
  }, [safeCurrentPrice, realTimePrice]);

  // REMOVED: Update price display - Now handled automatically by React rendering with PriceContext
  // Price updates are reactive through priceData, changeText, and other context values

  // Update current price from real market data - RE-ENABLED (Binance is the primary source)
  useEffect(() => {
    if (realPrice > 0 && !realTimePrice) {
      setCurrentPrice(realPrice);
      // REMOVED: setOrderBookPrice - now using orderBookPrice from priceData

      // Keep price history for trade calculations
      priceHistoryRef.current.push(realPrice);
      if (priceHistoryRef.current.length > 1000) {
        priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
      }

      // Generate new order book data
      const newOrderBookData = generateOrderBookData(realPrice);
      setOrderBookData(newOrderBookData);

      console.log('📈 Real Price Update:', realPrice.toFixed(2));
    }
  }, [realPrice, realTimePrice]);

  // Subscribe to BTC price updates and balance updates via WebSocket
  useEffect(() => {
    if (connected && user?.id) {
      subscribe(['BTCUSDT']);
      console.log('🔌 Subscribed to BTCUSDT price updates');

      // Subscribe to balance updates for this user
      sendMessage({
        type: 'subscribe_user_balance',
        userId: user.id
      } as any);
      console.log('🔌 Subscribed to balance updates for user:', user.id);
    }
  }, [connected, subscribe, sendMessage, user?.id]);

  // REMOVED: Fallback polling - Now handled by PriceContext
  // PriceContext automatically fetches from Binance API and provides real-time updates

  // Handle WebSocket price updates - Now using PriceContext as primary source
  useEffect(() => {
    if (lastMessage?.type === 'price_update' && lastMessage.data?.symbol === 'BTCUSDT') {
      const price = parseFloat(lastMessage.data.price);
      if (price > 0) {
        setCurrentPrice(price);
        // REMOVED: setRealTimePrice and setOrderBookPrice - now using PriceContext

        priceHistoryRef.current.push(price);
        if (priceHistoryRef.current.length > 1000) {
          priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
        }

        // Generate new order book data
        const newOrderBookData = generateOrderBookData(price);
        setOrderBookData(newOrderBookData);

        console.log('📈 WebSocket Price Update:', price.toFixed(2));
      }
    }
  }, [lastMessage]);

  // Handle WebSocket balance updates for real-time sync
  useEffect(() => {
    if (lastMessage?.type === 'balance_update' && lastMessage.data?.userId === user?.id) {
      console.log('💰 Real-time balance update received:', lastMessage.data);

      // Invalidate and refetch balance data to ensure UI sync - use correct query key
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });

      // Show notification for balance changes
      if (lastMessage.data.changeType !== 'trade_start') {
        console.log(`💰 Balance updated: ${lastMessage.data.newBalance} USDT (${lastMessage.data.change > 0 ? '+' : ''}${lastMessage.data.change})`);
      }
    }
  }, [lastMessage, user?.id, queryClient]);

  // Handle WebSocket trade completion notifications for reliable notifications
  useEffect(() => {
    console.log('🔍 WEBSOCKET DEBUG: Checking message:', lastMessage?.type, 'userId match:', lastMessage?.data?.userId === user?.id);
    console.log('🔍 WEBSOCKET DEBUG: Full message:', lastMessage);
    console.log('🔍 WEBSOCKET DEBUG: Current user ID:', user?.id);
    console.log('🔍 WEBSOCKET DEBUG: Active trades count:', activeTrades.length);

    // BULLETPROOF: Handle direct notification trigger
    if (lastMessage?.type === 'trigger_mobile_notification' && lastMessage.data?.userId === user?.id) {
      console.log('🔔 BULLETPROOF: Direct notification trigger received:', lastMessage.data);

      const tradeData = lastMessage.data;
      const testTrade: ActiveTrade = {
        id: tradeData.tradeId,
        direction: tradeData.direction,
        amount: tradeData.amount,
        entryPrice: tradeData.entryPrice,
        currentPrice: tradeData.currentPrice,
        status: tradeData.status,
        payout: tradeData.payout,
        profitPercentage: tradeData.profitPercentage,
        symbol: tradeData.symbol,
        duration: tradeData.duration,
        profit: tradeData.status === 'won' ? (tradeData.payout - tradeData.amount) : -tradeData.amount
      };

      console.log('🔔 BULLETPROOF: Triggering notification with trade data:', testTrade);
      triggerNotification(testTrade);
      return;
    }

    if (lastMessage?.type === 'trade_completed' && lastMessage.data?.userId === user?.id) {
      console.log('🎯 WEBSOCKET: Trade completion notification received:', lastMessage.data);

      const { tradeId, result, exitPrice, profitAmount, newBalance } = lastMessage.data;

      // Find the active trade that just completed
      const completedActiveTrade = activeTrades.find(trade => trade.id === tradeId);

      if (completedActiveTrade) {
        const won = result === 'win';
        const profitPercentage = completedActiveTrade.profitPercentage || (completedActiveTrade.duration === 30 ? 10 : 15);

        const completedTrade: ActiveTrade = {
          ...completedActiveTrade,
          status: won ? 'won' : 'lost',
          currentPrice: exitPrice,
          payout: won ? completedActiveTrade.amount * (1 + profitPercentage / 100) : 0,
          profit: profitAmount
        };

        console.log('🎯 WEBSOCKET: Setting completed trade notification:', completedTrade);

        // ROBUST NOTIFICATION TRIGGER
        console.log('🔔 WEBSOCKET: About to trigger notification');
        triggerNotification(completedTrade);

        // Remove from active trades
        setActiveTrades(prev => prev.filter(trade => trade.id !== tradeId));

        // Refresh trade history and balance - CRITICAL: Invalidate React Query cache
        queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/trades`] });

        // CRITICAL FIX: Add delay to ensure database is updated before fetching
        console.log('🔄 WEBSOCKET: Refreshing trade history after trade completion...');
        setTimeout(() => {
          if (user?.id) {
            loadTradeHistory();
          }
        }, 1000); // 1 second delay to ensure database is updated
      }
    }
  }, [lastMessage, user?.id, activeTrades, queryClient]);

  // Backup polling system for trade completion (fallback if WebSocket fails)
  useEffect(() => {
    if (activeTrades.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        // Check if any active trades have completed by polling the server
        const response = await fetch(`/api/users/${user?.id}/trades`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const serverTrades = await response.json();

          // Find recently completed trades that were active
          activeTrades.forEach(activeTrade => {
            const serverTrade = serverTrades.find((st: any) => st.id === activeTrade.id);

            if (serverTrade && serverTrade.status === 'completed' && serverTrade.result !== 'pending') {
              console.log('🔄 POLLING: Found completed trade:', serverTrade);

              const won = serverTrade.result === 'win';
              const profitPercentage = activeTrade.profitPercentage || (activeTrade.duration === 30 ? 10 : 15);

              const completedTrade: ActiveTrade = {
                ...activeTrade,
                status: won ? 'won' : 'lost',
                currentPrice: serverTrade.exit_price || activeTrade.entryPrice,
                payout: won ? activeTrade.amount * (1 + profitPercentage / 100) : 0,
                profit: won ? (activeTrade.amount * profitPercentage / 100) : -activeTrade.amount
              };

              console.log('🔄 POLLING: Setting completed trade notification:', completedTrade);

              // ROBUST NOTIFICATION TRIGGER
              triggerNotification(completedTrade);

              // Remove from active trades
              setActiveTrades(prev => prev.filter(trade => trade.id !== activeTrade.id));

              // Refresh trade history and balance - CRITICAL: Invalidate React Query cache
              queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
              queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/trades`] });

              // CRITICAL FIX: Add delay to ensure database is updated before fetching
              console.log('🔄 POLLING: Refreshing trade history after trade completion...');
              setTimeout(() => {
                loadTradeHistory();
              }, 1000); // 1 second delay to ensure database is updated
            }
          });
        }
      } catch (error) {
        console.error('🔄 POLLING: Error checking trade completion:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [activeTrades, user?.id, queryClient]);

  // Handle WebSocket trading control updates for real-time sync
  useEffect(() => {
    if (lastMessage?.type === 'trading_control_update' || lastMessage?.type === 'trading_mode_update') {
      const { userId, controlType, tradingMode, username, message } = lastMessage.data || {};
      const finalControlType = controlType || tradingMode; // Support both new and old message formats

      // Determine correct user ID for comparison
      let currentUserId = 'user-1'; // fallback
      if (user?.email === 'angela.soenoko@gmail.com') {
        currentUserId = 'user-angela';
      } else if (user?.email === 'amdsnkstudio@metachrome.io') {
        currentUserId = 'user-1';
      } else if (user?.id) {
        currentUserId = user.id;
      }

      console.log('🎯 Real-time trading control update received:', {
        userId,
        controlType: finalControlType,
        username,
        currentUserId,
        message
      });

      // Check if this update is for the current user
      if (userId === currentUserId) {
        console.log(`🎯 IMMEDIATE EFFECT: Trading mode changed to ${finalControlType.toUpperCase()} for current user!`);
        setCurrentTradingMode(finalControlType);

        // Store the current trading mode for immediate use in trades
        localStorage.setItem('currentTradingMode', finalControlType || 'normal');
      }
    }
  }, [lastMessage, user]);

  // Helper function to complete a trade and update balance
  const completeTrade = async (trade: ActiveTrade, won: boolean, finalPrice: number) => {
    // Calculate profit correctly: positive for wins, negative for losses
    const profitPercentage = trade.profitPercentage || (trade.duration === 30 ? 10 : 15);
    const profit = won ? (trade.amount * profitPercentage / 100) : -trade.amount;

    const updatedTrade: ActiveTrade = {
      ...trade,
      status: won ? 'won' : 'lost',
      currentPrice: finalPrice,
      payout: won ? trade.amount * (1 + profitPercentage / 100) : 0,
      profit: profit
    };

    console.log('🎯 COMPLETE TRADE: Updated trade object:', updatedTrade);

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
          payout: updatedTrade.payout,
          profit: profit,
          finalPrice: finalPrice
        })
      });

      if (response.ok) {
        // Refresh balance and trade history to show updated data
        queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/trades`] });
        console.log(`💰 Balance updated: Trade ${won ? 'WON' : 'LOST'} - Amount: ${trade.amount} USDT`);

        // CRITICAL FIX: Refresh trade history immediately after trade completion
        console.log('🔄 COMPLETE TRADE: Refreshing trade history after API completion...');
        setTimeout(() => {
          if (user?.id) {
            loadTradeHistory();
          }
        }, 1500); // 1.5 second delay to ensure database is fully updated
      } else {
        console.error('Failed to update balance after trade completion');
      }
    } catch (balanceError) {
      console.error('Error updating balance:', balanceError);
    }

    // FALLBACK NOTIFICATION: Wait for server response, then check actual result
    console.log('🎯 COMPLETE TRADE: Setting up fallback notification check');

    // Wait a bit for server to process, then check the actual result from database
    setTimeout(async () => {
      try {
        console.log('🔄 FALLBACK: Checking server result for trade:', trade.id);
        const response = await fetch(`/api/users/${user?.id}/trades`);
        if (response.ok) {
          const trades = await response.json();
          const serverTrade = trades.find((t: any) => t.id === trade.id);

          if (serverTrade && serverTrade.status === 'completed') {
            console.log('🔄 FALLBACK: Found completed trade with server result:', serverTrade);

            const actualWon = serverTrade.result === 'win';
            const profitPercentage = trade.profitPercentage || (trade.duration === 30 ? 10 : 15);

            const fallbackTrade: ActiveTrade = {
              ...trade,
              status: actualWon ? 'won' : 'lost',
              currentPrice: serverTrade.exit_price || finalPrice,
              payout: actualWon ? trade.amount * (1 + profitPercentage / 100) : 0,
              profit: actualWon ? (trade.amount * profitPercentage / 100) : -trade.amount
            };

            console.log('🔄 FALLBACK: Triggering notification with server result:', fallbackTrade);
            triggerNotification(fallbackTrade);
          }
        }
      } catch (error) {
        console.error('🔄 FALLBACK: Error checking server result:', error);
      }
    }, 2000); // Wait 2 seconds for server processing

    return updatedTrade;
  };

  // Trade management and countdown
  useEffect(() => {
    try {
      const now = Date.now();
      let hasCompletedTrades = false;

      // Debug log to see if useEffect is running
      if (activeTrades.length > 0) {
        console.log(`🎯 USEEFFECT: Checking ${activeTrades.length} active trades at ${new Date(now).toLocaleTimeString()}`);
      }

      // Update active trades
      setActiveTrades(prevTrades => {
        const updatedTrades: ActiveTrade[] = [];

        prevTrades.forEach(trade => {
          const timeRemaining = Math.max(0, Math.ceil((trade.endTime - now) / 1000));

          // Debug log for each trade
          console.log(`🎯 TRADE CHECK: ID=${trade.id}, timeRemaining=${timeRemaining}, status=${trade.status}, endTime=${trade.endTime}, now=${now}`);

          if (timeRemaining === 0 && trade.status === 'active') {
            console.log(`🎯 TRADE EXPIRED: Trade ${trade.id} has expired! Starting completion...`);
            // Trade expired, determine outcome
            const finalPrice = safeCurrentPrice || trade.entryPrice; // Fallback to entry price
            const priceChange = finalPrice - trade.entryPrice;
            let won = (trade.direction === 'up' && priceChange > 0) ||
                     (trade.direction === 'down' && priceChange < 0);

            // Trading control will be applied on the server side

            // Complete the trade asynchronously - notification will come via WebSocket
            completeTrade(trade, won, finalPrice).then((completedTrade) => {
              console.log('🎯 TRADE COMPLETED: Trade completed, waiting for WebSocket notification for trade:', completedTrade.id);
              // NOTE: Notification will be triggered by WebSocket with server's actual result
            }).catch((error) => {
              console.error('❌ Trade completion failed:', error);
            });
            hasCompletedTrades = true;

            // Play sound effect safely
            try {
              if (typeof playTradeSound === 'function') {
                playTradeSound(won ? 'win' : 'lose');
              }
            } catch (soundError) {
              console.error('Sound play error:', soundError);
            }


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
  }, [safeCurrentPrice, activeTrades]); // Include activeTrades to check for expiration

  // Timer to check for expired trades every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      // Check if any active trades have expired
      activeTrades.forEach(trade => {
        const timeRemaining = Math.max(0, Math.ceil((trade.endTime - now) / 1000));
        if (timeRemaining === 0 && trade.status === 'active') {
          // Force a re-render by updating a dummy state
          setCountdown(prev => prev);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTrades]);

  // Trading configuration with minimum amounts and profit percentages
  const tradingConfig = {
    '30s': { minAmount: 100, profit: 10 },
    '60s': { minAmount: 1000, profit: 15 },
    '90s': { minAmount: 5000, profit: 20 },
    '120s': { minAmount: 10000, profit: 25 },
    '180s': { minAmount: 30000, profit: 30 },
    '240s': { minAmount: 50000, profit: 50 },
    '300s': { minAmount: 100000, profit: 75 },
    '600s': { minAmount: 200000, profit: 100 }
  };

  // Get profit percentage based on duration
  const getProfitPercentage = (duration: string) => {
    return tradingConfig[duration as keyof typeof tradingConfig]?.profit || 10;
  };

  // Get minimum amount for duration
  const getMinimumAmount = (duration: string) => {
    return tradingConfig[duration as keyof typeof tradingConfig]?.minAmount || 100;
  };

  // Validate if user can trade with selected amount and duration
  const validateTrade = (amount: number, duration: string) => {
    const minAmount = getMinimumAmount(duration);
    return amount >= minAmount;
  };

  const handleTrade = async (direction: 'up' | 'down') => {
    try {
      // Validate trade amount and duration
      if (!validateTrade(selectedAmount, selectedDuration)) {
        const minAmount = getMinimumAmount(selectedDuration);
        alert(`You cannot follow this market, please recharge your deposit. Minimum amount for ${selectedDuration} is ${minAmount.toLocaleString()} USDT`);
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

      // Convert duration string to seconds
      const durationSeconds = parseInt(selectedDuration.replace('s', ''));

      // Get current price for entry - Use displayPrice from PriceContext (same as UI)
      const safeCurrentPrice = displayPrice;

      // User is already available from useAuth hook
      console.log('🔍 Current user for trade:', user);

      // Determine correct user ID for trading
      let tradingUserId = 'user-1'; // fallback
      if (user?.email === 'angela.soenoko@gmail.com') {
        tradingUserId = 'user-angela-1758195715'; // Match the actual ID in users-data.json
      } else if (user?.email === 'amdsnkstudio@metachrome.io') {
        tradingUserId = 'user-1'; // Match the ID in users-data.json
      } else if (user?.id) {
        tradingUserId = user.id;
      }
      console.log('🔍 Trading with user ID:', tradingUserId);

      if (!safeCurrentPrice || safeCurrentPrice <= 0) {
        alert('Price data not available. Please wait a moment and try again.');
        return;
      }

      // Call backend API to create trade and deduct balance
      console.log('🚀 TRADE DEBUG: About to place trade:', {
        userId: tradingUserId,
        symbol: selectedSymbol,
        direction,
        amount: selectedAmount,
        duration: durationSeconds,
        entryPrice: safeCurrentPrice
      });

      const response = await fetch('/api/trades/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: tradingUserId,
          symbol: selectedSymbol,
          direction,
          amount: selectedAmount.toString(),
          duration: durationSeconds,
          entryPrice: safeCurrentPrice
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to place trade');
      }

      const result = await response.json();
      console.log('🚀 TRADE DEBUG: Trade placement response:', result);

      if (result.success) {
        console.log('✅ TRADE DEBUG: Trade placed successfully, trade ID:', result.trade?.id);
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
        queryClient.invalidateQueries({ queryKey: ['/api/balances'] });

        // Clear trade history cache to prevent conflicts
        if (user?.id) {
          localStorage.removeItem(`tradeHistory_${user.id}`);
          console.log('🗑️ Cleared trade history cache to prevent conflicts');
        }

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
    // Mobile layout
    if (isMobile) {
      return (
        <div className="min-h-screen bg-[#10121E] text-white pb-20">
          <Navigation />

          {/* Mobile Header - Using TradingView Price - Reduced spacing */}
          <div className="bg-[#10121E] px-4 py-1 border-b border-gray-700 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-base">{currentPairData.symbol}</div>
                <div className="text-white text-lg font-bold">{displayPrice.toFixed(2)} USDT</div>
                <div className={`text-xs font-semibold ${changeColor}`}>
                  {changeText || btcMarketData?.priceChangePercent24h || '+0.00%'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs">24h Vol</div>
                <div className="text-white text-sm font-bold">
                  {btcMarketData?.volume24h ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(2) + 'M' : '0.00M'}
                </div>
              </div>
            </div>

            {/* Mobile Market Stats - Reduced spacing */}
            <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">24h High</div>
                <div className="text-white font-medium">{btcMarketData?.high24h || '119,558'}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">24h Low</div>
                <div className="text-white font-medium">{btcMarketData?.low24h || '117,205'}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Volume</div>
                <div className="text-white font-medium">
                  {btcMarketData?.volume24h ? (parseFloat(btcMarketData.volume24h) / 1000).toFixed(0) + 'K' : '681K'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Turnover</div>
                <div className="text-white font-medium">
                  {btcMarketData?.volume24h ? (parseFloat(btcMarketData.volume24h) * parseFloat(btcMarketData.price) / 1000000).toFixed(0) + 'M' : '80.5M'}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Symbol Selector - Reduced spacing */}
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Symbol:</span>
              <select
                value={selectedSymbol}
                onChange={(e) => {
                  const newSymbol = e.target.value;
                  setSelectedSymbol(newSymbol);
                  handleTradingViewSymbolChange(newSymbol);
                }}
                className="bg-gray-700 text-white text-sm font-medium rounded-md px-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
                <option value="LTCUSDT">LTC/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="TONUSDT">TON/USDT</option>
                <option value="DOGEUSDT">DOGE/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
                <option value="TRXUSDT">TRX/USDT</option>
                <option value="HYPEUSDT">HYPE/USDT</option>
                <option value="LINKUSDT">LINK/USDT</option>
                <option value="AVAXUSDT">AVAX/USDT</option>
                <option value="SUIUSDT">SUI/USDT</option>
                <option value="SHIBUSDT">SHIB/USDT</option>
                <option value="BCHUSDT">BCH/USDT</option>
                <option value="DOTUSDT">DOT/USDT</option>
                <option value="MATICUSDT">MATIC/USDT</option>
                <option value="XLMUSDT">XLM/USDT</option>
              </select>
            </div>
          </div>

          {/* Mobile Chart - Optimized spacing and proportions */}
          <div className="bg-[#10121E] relative w-full mobile-chart-container" style={{ height: '380px' }}>
            <TradeOverlay
              trades={activeTrades}
              currentPrice={displayPrice}
            />
            <div className="w-full h-full">
              <ErrorBoundary>
                <TradingViewWidget
                  type="chart"
                  symbol={`BINANCE:${selectedSymbol}`}
                  height={380}
                  interval="1"
                  theme="dark"
                  container_id="options_mobile_tradingview_chart"
                  onSymbolChange={handleTradingViewSymbolChange}
                />
              </ErrorBoundary>
            </div>
          </div>

          {/* Mobile Content - Two Column Layout */}
          <div className="bg-[#10121E] min-h-screen flex">
            {/* Mobile Left Panel - Order Book & Price Data */}
            <div className="w-1/2 border-r border-gray-700">
              {/* Price Header - Reduced spacing */}
              <div className="p-2 border-b border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white font-bold text-sm">{currentPairData.symbol}</div>
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">
                      {currentPrice > 0 ? currentPrice.toFixed(2) : (safeCurrentPrice > 0 ? safeCurrentPrice.toFixed(2) : 'Loading...')} USDT
                    </div>
                    <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {changeText} ({changeColor})
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Book Headers - Reduced spacing */}
              <div className="grid grid-cols-3 gap-1 p-1.5 text-xs text-gray-400 border-b border-gray-700">
                <span>Price</span>
                <span>Volume</span>
                <span>Total</span>
              </div>

              {/* Order Book Data */}
              <div className="h-[300px] overflow-y-auto">
                {/* Sell Orders (Red) */}
                <div className="space-y-0">
                  {orderBookData.sellOrders.slice(0, 8).map((order, index) => (
                    <div key={index} className="grid grid-cols-3 gap-1 px-2 py-1 text-xs hover:bg-gray-800">
                      <span className="text-red-400 font-mono">{order.price}</span>
                      <span className="text-gray-300 font-mono">{order.volume}</span>
                      <span className="text-gray-400 font-mono">{order.turnover}</span>
                    </div>
                  ))}
                </div>

                {/* Current Price Separator */}
                <div className="px-2 py-2 border-y border-gray-600">
                  <div className="text-center">
                    <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {displayPrice.toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                {/* Buy Orders (Green) */}
                <div className="space-y-0">
                  {orderBookData.buyOrders.slice(0, 8).map((order, index) => (
                    <div key={index} className="grid grid-cols-3 gap-1 px-2 py-1 text-xs hover:bg-gray-800">
                      <span className="text-green-400 font-mono">{order.price}</span>
                      <span className="text-gray-300 font-mono">{order.volume}</span>
                      <span className="text-gray-400 font-mono">{order.turnover}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Right Panel - Market Stats & Trading Info */}
            <div className="w-1/2">
              {/* Market Statistics */}
              <div className="px-3 py-2 border-b border-gray-700">
                <h3 className="text-white font-bold mb-2 text-sm">Market Statistics</h3>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Change</span>
                    <span className={`font-semibold ${btcMarketData?.priceChangePercent24h?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                      {btcMarketData?.priceChangePercent24h || '0.00%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h High</span>
                    <span className="text-white font-semibold">{btcMarketData?.high24h || currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Low</span>
                    <span className="text-white font-semibold">{btcMarketData?.low24h || currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Volume</span>
                    <span className="text-white font-semibold">{btcMarketData?.volume24h ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(2) + 'M' : '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* My Orders Section */}
              <div className="px-3 py-2 border-b border-gray-700">
                <h3 className="text-white font-bold mb-2 text-sm">My Orders</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activeTrades.length > 0 ? (
                    activeTrades.map((trade) => {
                      const timeLeft = Math.max(0, Math.ceil(((trade.expiryTime || trade.endTime) - Date.now()) / 1000));
                      const progress = timeLeft > 0 ? (timeLeft / trade.duration) * 100 : 0;

                      return (
                        <div key={trade.id} className="bg-gray-800 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center space-x-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${trade.direction === 'up' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                              <span className="text-white text-xs font-medium">{currentPairData.symbol}</span>
                              <span className={`text-xs px-1 py-0.5 rounded ${
                                trade.direction === 'up' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                              }`}>
                                {trade.direction.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white font-bold text-xs">${trade.amount}</span>
                          </div>

                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Entry: ${trade.entryPrice}</span>
                            <span>Current: ${displayPrice.toFixed(2)}</span>
                          </div>

                          {timeLeft > 0 ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">{timeLeft}s</span>
                                <span className={`font-medium ${
                                  (trade.direction === 'up' && displayPrice > trade.entryPrice) ||
                                  (trade.direction === 'down' && displayPrice < trade.entryPrice)
                                    ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {(trade.direction === 'up' && displayPrice > trade.entryPrice) ||
                                   (trade.direction === 'down' && displayPrice < trade.entryPrice)
                                    ? 'Winning' : 'Losing'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-0.5">
                                <div
                                  className="bg-blue-500 h-0.5 rounded-full transition-all duration-1000"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className={`text-xs font-bold ${
                                (trade.direction === 'up' && (trade.exitPrice || trade.currentPrice || 0) > trade.entryPrice) ||
                                (trade.direction === 'down' && (trade.exitPrice || trade.currentPrice || 0) < trade.entryPrice)
                                  ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {(trade.direction === 'up' && (trade.exitPrice || trade.currentPrice || 0) > trade.entryPrice) ||
                                 (trade.direction === 'down' && (trade.exitPrice || trade.currentPrice || 0) < trade.entryPrice)
                                  ? 'WON' : 'LOST'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-2">
                      <div className="text-gray-400 text-xs">No active trades</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="px-3 py-2">
                <h3 className="text-white font-bold mb-2 text-sm">Trading Pairs</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filteredTradingPairs.slice(0, 6).map((pair, index) => {
                    const isPositive = !pair.priceChangePercent24h?.startsWith('-');
                    const iconMap: { [key: string]: { icon: string, bg: string } } = {
                      'BTC': { icon: '₿', bg: 'bg-orange-500' },
                      'ETH': { icon: 'Ξ', bg: 'bg-purple-500' },
                      'BNB': { icon: 'B', bg: 'bg-yellow-600' },
                      'SOL': { icon: 'S', bg: 'bg-purple-600' },
                      'XRP': { icon: '✕', bg: 'bg-gray-600' },
                      'ADA': { icon: 'A', bg: 'bg-blue-500' },
                    };
                    const iconInfo = iconMap[pair.coin] || { icon: pair.coin[0], bg: 'bg-gray-500' };
                    const formattedPrice = parseFloat(pair.price).toFixed(pair.price.includes('.') && parseFloat(pair.price) < 1 ? 4 : 2);

                    return (
                      <div
                        key={index}
                        onClick={() => handlePairSelect(pair.rawSymbol)}
                        className={`flex items-center justify-between p-1.5 hover:bg-[#1a1b2e] rounded cursor-pointer transition-colors ${
                          selectedSymbol === pair.rawSymbol ? 'bg-blue-600/20 border border-blue-500/30' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs ${iconInfo.bg}`}>
                            {iconInfo.icon}
                          </div>
                          <div>
                            <div className="text-white text-xs font-medium">{pair.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs">{formattedPrice}</div>
                          <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {pair.priceChangePercent24h}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Options Trading Interface - Reduced spacing */}
          <div className="px-3 py-2 space-y-2 bg-[#10121E]">
            {/* Balance Display - Using TradingView Price - Compact */}
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">Current Price:</span>
                  <div className="flex items-center space-x-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {connected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
                <span className="text-white font-bold text-sm">
                  {currentPrice > 0 ? currentPrice.toFixed(2) : (safeCurrentPrice > 0 ? safeCurrentPrice.toFixed(2) : 'Loading...')} USDT
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400 text-xs">Balance:</span>
                {user ? (
                  <span className="text-green-400 font-bold text-sm">{balance.toFixed(2)} USDT</span>
                ) : (
                  <span className="text-yellow-400 font-bold text-xs">Sign in required</span>
                )}
              </div>
            </div>

            {/* Duration Selection - Compact layout */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Duration & Profit</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { duration: '30s', profit: '10%' },
                  { duration: '60s', profit: '15%' },
                  { duration: '90s', profit: '20%' },
                  { duration: '120s', profit: '25%' },
                  { duration: '180s', profit: '30%' },
                  { duration: '240s', profit: '50%' },
                  { duration: '300s', profit: '75%' },
                  { duration: '600s', profit: '100%' }
                ].map((option) => (
                  <button
                    key={option.duration}
                    onClick={() => {
                      setSelectedDuration(option.duration);
                      const minAmount = getMinimumAmount(option.duration);
                      if (selectedAmount < minAmount) {
                        setSelectedAmount(minAmount);
                      }
                    }}
                    className={`py-1 px-1 rounded text-center transition-colors ${
                      selectedDuration === option.duration
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                    disabled={isTrading}
                  >
                    <div className="text-xs font-medium">{option.duration}</div>
                    <div className="text-[9px] text-green-400">{option.profit}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection - Compact layout */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Amount (USDT) - Min: {getMinimumAmount(selectedDuration).toLocaleString()}
              </label>
              <div className="grid grid-cols-3 gap-1 mb-1.5">
                {[100, 500, 1000, 2000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`py-1 px-2 rounded text-xs font-medium transition-colors ${
                      selectedAmount === amount
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                    disabled={isTrading}
                  >
                    {amount}
                  </button>
                ))}
              </div>

              {/* Max Button - Compact */}
              <button
                onClick={() => {
                  const maxAmount = Math.floor(balance) || 0;
                  setSelectedAmount(maxAmount);
                }}
                className={`w-full py-1 px-2 rounded text-xs font-medium transition-colors mb-1.5 ${
                  selectedAmount === Math.floor(balance || 0)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
                disabled={isTrading}
              >
                Max ({Math.floor(balance || 0)} USDT)
              </button>

              {/* Custom Amount Input - Compact */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={selectedAmount}
                onChange={(e) => {
                  const inputValue = e.target.value.replace(/[^0-9.]/g, ''); // Only allow numbers and decimal
                  const value = parseFloat(inputValue) || 0;
                  setSelectedAmount(value); // Don't clamp during typing, allow free input
                }}
                onBlur={(e) => {
                  // Only clamp when user finishes typing (on blur)
                  const value = parseFloat(e.target.value) || 0;
                  if (value < 100) {
                    setSelectedAmount(100);
                  } else if (value > (balance || 0)) {
                    setSelectedAmount(Math.floor(balance || 0));
                  }
                }}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder={`Enter amount (Min: 100, Max: ${Math.floor(balance || 0)})`}
              />
            </div>

            {/* Login to Trade Message - Compact */}
            {!user && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-3 mb-2 text-center">
                <div className="text-white font-bold text-base mb-1">🔒 Login to Trade</div>
                <div className="text-white/80 text-xs mb-2">
                  Sign in to start options trading and earn up to 15% profit
                </div>
                <a
                  href="/login"
                  className="inline-block bg-white text-purple-600 font-bold py-1.5 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  Login Now
                </a>
              </div>
            )}

            {/* UP/DOWN Buttons - Compact layout */}
            {(!user?.verificationStatus || user?.verificationStatus === 'unverified') && user?.role !== 'super_admin' ? (
              <div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-3 mb-2">
                <div className="text-center">
                  <div className="text-yellow-100 font-semibold mb-1 text-sm">🔒 Verification Required</div>
                  <div className="text-yellow-200 text-xs mb-2">
                    Upload your verification documents to start trading
                  </div>
                  <a href="/profile" className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs">
                    Upload Documents
                  </a>
                </div>
              </div>
            ) : user?.verificationStatus === 'pending' ? (
              <div className="bg-blue-900/50 border border-blue-600/50 rounded-lg p-3 mb-2">
                <div className="text-center">
                  <div className="text-blue-100 font-semibold mb-1 text-sm">⏳ Verification Pending</div>
                  <div className="text-blue-200 text-xs">
                    Your documents are being reviewed. Trading will be enabled once approved.
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTrade('up')}
                  disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium text-base transition-colors relative"
                >
                  <div>Buy Up</div>
                  <div className="text-xs mt-0.5">
                    Profit: {getProfitPercentage(selectedDuration)}% •
                    Payout: {(selectedAmount * (1 + getProfitPercentage(selectedDuration) / 100)).toFixed(0)} USDT
                  </div>
                </button>
                <button
                  onClick={() => handleTrade('down')}
                  disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium text-base transition-colors relative"
                >
                  <div>Buy Down</div>
                  <div className="text-xs mt-0.5">
                    Profit: {getProfitPercentage(selectedDuration)}% •
                    Payout: {(selectedAmount * (1 + getProfitPercentage(selectedDuration) / 100)).toFixed(0)} USDT
                  </div>
                </button>
              </div>
            )}

            {countdown > 0 && (
              <div className="text-center py-2">
                <div className="text-yellow-400 font-bold">
                  Next trade available in: {countdown}s
                </div>
              </div>
            )}
          </div>

          {/* Mobile Trading History Section */}
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
                {activeTab === "history" && (
                  <button
                    onClick={() => {
                      console.log('🔄 MANUAL REFRESH: User clicked refresh button');
                      setIsLoadingHistory(true);
                      loadTradeHistory();
                    }}
                    disabled={isLoadingHistory}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <svg className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isLoadingHistory ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Trade Content - Simplified for smaller screens */}
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
                        <div key={trade.id} className="bg-gray-800 rounded p-3 mb-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold text-sm ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.direction.toUpperCase()} • {trade.amount} USDT
                            </span>
                            <span className="text-yellow-400 font-bold text-sm">{timeRemaining}s</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-300">
                            <span>Entry: {trade.entryPrice.toFixed(2)}</span>
                            <span>Current: {currentPrice.toFixed(2)}</span>
                            <span className={`font-bold ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                              {potentialPayout > 0 ? '+' : ''}{potentialPayout.toFixed(2)} USDT
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}

              {activeTab === "history" && (
                <>
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-8 h-8 mb-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-gray-400 text-sm">Loading trade history...</div>
                    </div>
                  ) : tradeHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 mb-4 opacity-50">
                        <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                          <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <div className="text-gray-400 text-sm">No trade history</div>
                      <div className="text-gray-500 text-xs mt-2">Complete some trades to see your history here</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tradeHistory.map(trade => {
                        const profitPercentage = trade.duration === 30 ? 10 : 15;
                        const pnl = trade.profit !== undefined ? trade.profit :
                                   (trade.status === 'won' ?
                                     (trade.amount * profitPercentage / 100) :
                                     -trade.amount);
                        const endTime = new Date(trade.endTime).toLocaleTimeString();

                        return (
                          <div key={trade.id} className="bg-gray-800 rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-bold text-sm ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.direction.toUpperCase()} • {trade.amount} USDT
                              </span>
                              <span className={`font-bold text-sm ${trade.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.status === 'won' ? '✅ WON' : '❌ LOST'}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-300">
                              <span>Entry: {trade.entryPrice.toFixed(2)}</span>
                              <span>Time: {endTime}</span>
                              <span className={`font-bold ${trade.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                                {trade.status === 'won' ? '+' : ''}{pnl.toFixed(2)} USDT
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <MobileBottomNav />
        </div>
      );
    }

    // Desktop layout (existing)
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
      
      {/* Top Header with Dynamic Trading Pair Info - Using TradingView Price */}
      <div className="bg-[#10121E] px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-white font-bold text-lg">{currentPairData.symbol}</div>
            <div className="text-white text-2xl font-bold">{parseFloat(currentPairData.price).toFixed(2)}</div>
            <div className="text-gray-400 text-sm">{parseFloat(currentPairData.price).toFixed(2)} USDT</div>
          </div>
          <div className={`text-lg font-semibold ${currentPairData.priceChangePercent24h?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
            {currentPairData.priceChangePercent24h || '+0.00%'}
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
          {/* Order Book Header - Dynamic Trading Pair */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold">{currentPairData.symbol}</div>
              <div className="text-right">
                <div className="font-bold text-white text-lg">
                  {parseFloat(currentPairData.price).toFixed(2)}
                </div>
                <div className={`text-sm font-semibold ${currentPairData.priceChangePercent24h?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {currentPairData.priceChangePercent24h || '+0.00%'}
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
          <div className="h-[400px] overflow-y-auto" data-orderbook="desktop">
            {/* Sell Orders (Red) */}
            <div className="space-y-0">
              {orderBookData.sellOrders.length > 0 ? orderBookData.sellOrders.map((order, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-gray-800" data-order-type="sell">
                  <span style={{ color: 'rgb(248, 113, 113)', fontWeight: '500' }} data-field="price">{order.price}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="volume">{order.volume}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="turnover">{order.turnover}</span>
                </div>
              )) : (
                <div className="text-gray-400 text-center py-4">Loading sell orders...</div>
              )}
            </div>

            {/* Current Price */}
            <div className={`p-2 my-1 ${isPositive ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-lg">
                  {displayPrice.toFixed(2)}
                </span>
                <span className={`${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '↑' : '↓'}
                </span>
                <span className="text-gray-400 text-sm">{displayPrice.toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Buy Orders (Green) */}
            <div className="space-y-0">
              {orderBookData.buyOrders.length > 0 ? orderBookData.buyOrders.map((order, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-gray-800" data-order-type="buy">
                  <span style={{ color: 'rgb(74, 222, 128)', fontWeight: '500' }} data-field="price">{order.price}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="volume">{order.volume}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="turnover">{order.turnover}</span>
                </div>
              )) : (
                <div className="text-gray-400 text-center py-4">Loading buy orders...</div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Chart and Options Trading */}
        <div className="flex-1 flex flex-col">
          {/* Chart Controls - Chart view switching */}
          <div className="p-2 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-400">
                  Chart Sync: <span className="text-green-400">Active</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {/* Basic version hidden to avoid red line issues */}
                  {false && (
                    <button
                      onClick={() => setChartView('basic')}
                      className={`text-xs transition-colors ${
                        chartView === 'basic'
                          ? 'text-white bg-purple-600 px-2 py-1 rounded'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Basic version
                    </button>
                  )}
                  <button
                    onClick={() => setChartView('tradingview')}
                    className={`text-xs transition-colors ${
                      chartView === 'tradingview'
                        ? 'text-white bg-purple-600 px-2 py-1 rounded'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Trading view
                  </button>

                  {/* Manual Symbol Selector for Testing */}
                  {chartView === 'tradingview' && (
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-400">Quick select:</span>
                      <button
                        onClick={() => {
                          console.log('🔄 Manual symbol change to BTCUSDT');
                          const matchingPair = tradingPairs.find(pair => pair.rawSymbol === 'BTCUSDT');
                          if (matchingPair) {
                            setSelectedSymbol('BTCUSDT');
                          }
                        }}
                        className="text-xs text-orange-400 hover:text-orange-300 px-1"
                      >
                        BTC
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔄 Manual symbol change to ETHUSDT');
                          const matchingPair = tradingPairs.find(pair => pair.rawSymbol === 'ETHUSDT');
                          if (matchingPair) {
                            setSelectedSymbol('ETHUSDT');
                          }
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 px-1"
                      >
                        ETH
                      </button>
                      <button
                        onClick={() => {
                          console.log('🔄 Manual symbol change to SOLUSDT');
                          const matchingPair = tradingPairs.find(pair => pair.rawSymbol === 'SOLUSDT');
                          if (matchingPair) {
                            setSelectedSymbol('SOLUSDT');
                          }
                        }}
                        className="text-xs text-green-400 hover:text-green-300 px-1"
                      >
                        SOL
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setChartView('depth')}
                    className={`text-xs transition-colors ${
                      chartView === 'depth'
                        ? 'text-white bg-purple-600 px-2 py-1 rounded'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Depth
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area - Dynamic chart based on selected view */}
          <div className="h-[500px] relative bg-[#10121E] p-1">
            <TradeOverlay
              trades={activeTrades}
              currentPrice={priceData?.price || currentPrice}
            />

            {/* Basic chart view disabled to avoid red line issues */}
            {false && chartView === 'basic' && (
              <LightweightChart
                symbol={selectedSymbol}
                interval="1m"
                height={490}
                containerId="options_desktop_chart"
              />
            )}

            {chartView === 'tradingview' && (
              <div className="relative h-full">
                {/* Symbol Selector Overlay - Fixed background issue */}
                <div className="absolute top-2 right-2 z-10">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => {
                      const newSymbol = e.target.value;
                      setSelectedSymbol(newSymbol);
                      handleTradingViewSymbolChange(newSymbol);
                    }}
                    className="bg-gray-800/90 text-white text-xs font-medium rounded px-2 py-1 border border-gray-600/50 focus:border-blue-500 focus:outline-none min-w-[90px] max-w-[120px] backdrop-blur-sm"
                    style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}
                  >
                    <option value="BTCUSDT" className="bg-gray-800 text-white">BTC/USDT</option>
                    <option value="ETHUSDT" className="bg-gray-800 text-white">ETH/USDT</option>
                    <option value="XRPUSDT" className="bg-gray-800 text-white">XRP/USDT</option>
                    <option value="LTCUSDT" className="bg-gray-800 text-white">LTC/USDT</option>
                    <option value="BNBUSDT" className="bg-gray-800 text-white">BNB/USDT</option>
                    <option value="SOLUSDT" className="bg-gray-800 text-white">SOL/USDT</option>
                    <option value="TONUSDT" className="bg-gray-800 text-white">TON/USDT</option>
                    <option value="DOGEUSDT" className="bg-gray-800 text-white">DOGE/USDT</option>
                    <option value="ADAUSDT" className="bg-gray-800 text-white">ADA/USDT</option>
                    <option value="TRXUSDT" className="bg-gray-800 text-white">TRX/USDT</option>
                    <option value="HYPEUSDT" className="bg-gray-800 text-white">HYPE/USDT</option>
                    <option value="LINKUSDT" className="bg-gray-800 text-white">LINK/USDT</option>
                    <option value="AVAXUSDT" className="bg-gray-800 text-white">AVAX/USDT</option>
                    <option value="SUIUSDT" className="bg-gray-800 text-white">SUI/USDT</option>
                    <option value="SHIBUSDT" className="bg-gray-800 text-white">SHIB/USDT</option>
                    <option value="BCHUSDT" className="bg-gray-800 text-white">BCH/USDT</option>
                    <option value="DOTUSDT" className="bg-gray-800 text-white">DOT/USDT</option>
                    <option value="MATICUSDT" className="bg-gray-800 text-white">MATIC/USDT</option>
                    <option value="XLMUSDT" className="bg-gray-800 text-white">XLM/USDT</option>
                  </select>
                </div>

                <ErrorBoundary>
                  <TradingViewWidget
                    type="chart"
                    symbol={`BINANCE:${selectedSymbol}`}
                    height={490}
                    interval="1"
                    theme="dark"
                    container_id="options_tradingview_chart"
                    onSymbolChange={handleTradingViewSymbolChange}
                  />
                </ErrorBoundary>
              </div>
            )}

            {chartView === 'depth' && (
              <div className="w-full h-full p-4">
                <div className="text-center mb-4">
                  <div className="text-white text-lg font-bold mb-1">Market Depth Chart</div>
                  <div className="text-gray-400 text-sm">Real-time order book visualization for {selectedSymbol}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 h-[400px]">
                  {/* Buy Orders (Bids) */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-green-400 text-sm font-bold mb-3 text-center">Buy Orders (Bids)</div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 text-xs text-gray-400 border-b border-gray-600 pb-1">
                        <span>Price</span>
                        <span className="text-center">Amount</span>
                        <span className="text-right">Total</span>
                      </div>
                      {orderBookData.buyOrders.slice(0, 15).map((order, i) => (
                        <div key={i} className="grid grid-cols-3 text-xs hover:bg-gray-700/50 p-1 rounded">
                          <span className="text-green-400 font-mono">{order.price}</span>
                          <span className="text-gray-300 font-mono text-center">{order.volume}</span>
                          <span className="text-gray-300 font-mono text-right">{order.turnover}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sell Orders (Asks) */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-red-400 text-sm font-bold mb-3 text-center">Sell Orders (Asks)</div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 text-xs text-gray-400 border-b border-gray-600 pb-1">
                        <span>Price</span>
                        <span className="text-center">Amount</span>
                        <span className="text-right">Total</span>
                      </div>
                      {orderBookData.sellOrders.slice(0, 15).map((order, i) => (
                        <div key={i} className="grid grid-cols-3 text-xs hover:bg-gray-700/50 p-1 rounded">
                          <span className="text-red-400 font-mono">{order.price}</span>
                          <span className="text-gray-300 font-mono text-center">{order.volume}</span>
                          <span className="text-gray-300 font-mono text-right">{order.turnover}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Price Indicator */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-lg">
                    <span className="text-gray-400 text-sm">Current Price:</span>
                    <span className="text-white font-bold text-lg">{displayPrice.toFixed(2)} USDT</span>
                    <span className={`text-sm ${priceData?.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {priceData?.priceChangePercent24h >= 0 ? '+' : ''}{priceData?.priceChangePercent24h?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Options Trading Controls */}
          <div className="p-4 border-t border-gray-700">
            {/* Current Price Display - Using TradingView Price */}
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
                    {currentPrice > 0 ? currentPrice.toFixed(2) : (safeCurrentPrice > 0 ? safeCurrentPrice.toFixed(2) : 'Loading...')} USDT
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

              {/* Trading Mode Indicator - HIDDEN FROM USERS */}
              {false && (
                <div className="flex items-center justify-between mt-2 p-2 rounded-lg bg-gray-700/50">
                  <span className="text-gray-400 text-sm">Trading Mode:</span>
                  <span className={`font-bold text-sm px-2 py-1 rounded ${
                    currentTradingMode === 'win' ? 'bg-green-600 text-white' :
                    currentTradingMode === 'lose' ? 'bg-red-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {currentTradingMode.toUpperCase()}
                  </span>
                </div>
              )}

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
                            {trade.direction.toUpperCase()} {trade.amount} USDT
                          </span>
                          <span className="text-yellow-400 font-bold">{timeRemaining}s</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-400">
                            Entry: {trade.entryPrice.toFixed(2)} USDT
                          </span>
                          <span className={`font-bold ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} USDT
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
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { duration: '30s', profit: '10%' },
                { duration: '60s', profit: '15%' },
                { duration: '90s', profit: '20%' },
                { duration: '120s', profit: '25%' },
                { duration: '180s', profit: '30%' },
                { duration: '240s', profit: '50%' },
                { duration: '300s', profit: '75%' },
                { duration: '600s', profit: '100%' }
              ].map((option) => (
                <button
                  key={option.duration}
                  onClick={() => {
                    setSelectedDuration(option.duration);
                    // Update minimum amount based on new requirements
                    const minAmount = getMinimumAmount(option.duration);
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
                Minimum buy: {getMinimumAmount(selectedDuration).toLocaleString()} USDT | Selected: {selectedAmount} USDT
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[100, 500, 1000, 2000].map((amount) => (
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
              <div className="grid grid-cols-1 gap-2 mb-2">
                <button
                  onClick={() => {
                    const maxAmount = Math.floor(balance) || 0;
                    setSelectedAmount(maxAmount);
                  }}
                  className={`p-2 rounded text-sm transition-colors ${
                    selectedAmount === Math.floor(balance || 0)
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                  disabled={isTrading}
                >
                  Max ({Math.floor(balance || 0)} USDT)
                </button>
              </div>

              {/* Custom Amount Input - FULLY WRITABLE */}
              <div className="mt-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={selectedAmount}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9.]/g, ''); // Only allow numbers and decimal
                    const value = parseFloat(inputValue) || 0;
                    setSelectedAmount(value); // Don't clamp during typing, allow free input
                  }}
                  onBlur={(e) => {
                    // Only clamp when user finishes typing (on blur)
                    const value = parseFloat(e.target.value) || 0;
                    if (value < 100) {
                      setSelectedAmount(100);
                    } else if (value > (balance || 0)) {
                      setSelectedAmount(Math.floor(balance || 0));
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={`Enter amount (Min: 100, Max: ${Math.floor(balance || 0)})`}
                />
              </div>
            </div>

            <div className="text-gray-400 text-sm mb-4">
              {user ? (
                <>Available: {(balance || 0).toFixed(2)} USDT | Active Trades: {activeTrades.length}/3</>
              ) : (
                <>Sign in to view balance and start trading</>
              )}

            </div>

            {/* DEBUG: Test Notification Button - MOBILE */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    console.log('🧪 MOBILE DEBUG: Manual notification trigger');
                    const testTrade = {
                      id: 'mobile-manual-test-' + Date.now(),
                      direction: 'up' as const,
                      amount: 100,
                      entryPrice: 50000,
                      currentPrice: 51000,
                      status: 'won' as const,
                      payout: 110,
                      profitPercentage: 10
                    };
                    triggerNotification(testTrade);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium text-sm"
                >
                  🧪 TEST MOBILE NOTIFICATION
                </button>
                <button
                  onClick={() => {
                    console.log('🧪 MOBILE DEBUG: Direct DOM notification trigger');

                    // Remove any existing notifications
                    const existing = document.querySelectorAll('[data-mobile-notification="true"]');
                    existing.forEach(el => el.remove());

                    // Create notification directly in DOM
                    const notification = document.createElement('div');
                    notification.setAttribute('data-mobile-notification', 'true');
                    notification.style.cssText = `
                      position: fixed !important;
                      top: 0 !important;
                      left: 0 !important;
                      right: 0 !important;
                      bottom: 0 !important;
                      z-index: 999999999 !important;
                      background-color: rgba(0, 0, 0, 0.95) !important;
                      display: flex !important;
                      align-items: center !important;
                      justify-content: center !important;
                      padding: 16px !important;
                      visibility: visible !important;
                      opacity: 1 !important;
                      pointer-events: auto !important;
                    `;

                    notification.innerHTML = `
                      <div style="
                        background-color: #1a1b3a;
                        border-radius: 16px;
                        padding: 20px;
                        max-width: 320px;
                        width: 90%;
                        border: 3px solid #10b981;
                        color: white;
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
                        text-align: center;
                      ">
                        <div style="font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 16px;">
                          🎉 DIRECT DOM TEST!
                        </div>
                        <div style="margin-bottom: 16px; color: #9ca3af;">
                          This notification was created directly in the DOM, bypassing React.
                        </div>
                        <button onclick="this.closest('[data-mobile-notification]').remove()" style="
                          background-color: #10b981;
                          color: white;
                          border: none;
                          border-radius: 8px;
                          padding: 12px 24px;
                          font-size: 14px;
                          font-weight: bold;
                          cursor: pointer;
                          width: 100%;
                        ">
                          Close Direct Test
                        </button>
                      </div>
                    `;

                    document.body.appendChild(notification);
                    console.log('✅ Direct DOM notification created');
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded font-medium text-sm mt-2"
                >
                  🛠️ TEST DIRECT DOM
                </button>
              </div>
            )}

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
            ) : (!user?.verificationStatus || user?.verificationStatus === 'unverified') && user?.role !== 'super_admin' ? (
              <div className="space-y-4">
                <div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-yellow-100 font-semibold mb-2">🔒 Verification Required</div>
                    <div className="text-yellow-200 text-sm mb-3">
                      Upload your verification documents to start trading
                    </div>
                    <a href="/profile" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm">
                      Upload Documents
                    </a>
                  </div>
                </div>
              </div>
            ) : user?.verificationStatus === 'pending' ? (
              <div className="space-y-4">
                <div className="bg-blue-900/50 border border-blue-600/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-blue-100 font-semibold mb-2">⏳ Verification Pending</div>
                    <div className="text-blue-200 text-sm">
                      Your documents are being reviewed. Trading will be enabled once approved.
                    </div>
                  </div>
                </div>
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
                placeholder="Search coins (e.g. ETH, BTC, SOL)"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
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
            {filteredTradingPairs.length > 0 ? (
              filteredTradingPairs.map((pair, index) => {
                const isPositive = !pair.priceChangePercent24h?.startsWith('-');
                const iconMap: { [key: string]: { icon: string, bg: string } } = {
                  'BTC': { icon: '₿', bg: 'bg-orange-500' },
                  'ETH': { icon: 'Ξ', bg: 'bg-purple-500' },
                  'BNB': { icon: 'B', bg: 'bg-yellow-600' },
                  'SOL': { icon: 'S', bg: 'bg-purple-600' },
                  'XRP': { icon: '✕', bg: 'bg-gray-600' },
                  'ADA': { icon: 'A', bg: 'bg-blue-500' },
                  'DOGE': { icon: 'D', bg: 'bg-yellow-500' },
                  'MATIC': { icon: 'M', bg: 'bg-purple-700' },
                  'DOT': { icon: '●', bg: 'bg-pink-500' },
                  'AVAX': { icon: 'A', bg: 'bg-red-500' },
                };
                const iconInfo = iconMap[pair.coin] || { icon: pair.coin[0], bg: 'bg-gray-500' };
                const formattedPrice = parseFloat(pair.price).toFixed(pair.price.includes('.') && parseFloat(pair.price) < 1 ? 6 : 2);

                return (
                  <div
                    key={index}
                    onClick={() => handlePairSelect(pair.rawSymbol)}
                    className={`flex items-center justify-between p-2 hover:bg-[#1a1b2e] rounded cursor-pointer transition-colors ${
                      selectedSymbol === pair.rawSymbol ? 'bg-blue-600/20 border border-blue-500/30' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${iconInfo.bg}`}>
                        {iconInfo.icon}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{pair.symbol}</div>
                        <div className="text-gray-400 text-xs">{pair.coin}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">{formattedPrice}</div>
                      <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {pair.priceChangePercent24h}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 py-4">
                <div className="text-sm">No coins found</div>
                <div className="text-xs mt-1">Try searching for BTC, ETH, SOL, etc.</div>
              </div>
            )}
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

            {/* Transaction List - Using Real Trade History */}
            <div className="h-[200px] overflow-y-auto px-4">
              <div className="space-y-1 py-2">
                {tradeHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-gray-400 text-sm">No recent transactions</div>
                    <div className="text-gray-500 text-xs mt-1">Complete some trades to see transactions here</div>
                  </div>
                ) : (
                  tradeHistory.slice(0, 8).map((trade, index) => (
                    <div key={index} className="flex justify-between text-xs py-1 hover:bg-gray-800/50 rounded px-2 -mx-2">
                      <span className="text-gray-400 font-mono">
                        {new Date(trade.endTime).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8)}
                      </span>
                      <span className={`font-mono ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.entryPrice.toFixed(2)}
                      </span>
                      <span className="text-gray-300 font-mono">{trade.amount.toFixed(0)}</span>
                    </div>
                  ))
                )}
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
            {activeTab === "history" && (
              <button
                onClick={() => {
                  console.log('🔄 MANUAL REFRESH: User clicked refresh button');
                  setIsLoadingHistory(true);
                  loadTradeHistory();
                }}
                disabled={isLoadingHistory}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isLoadingHistory ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm text-gray-400">
              <input type="checkbox" className="mr-2" />
              Hide other trading pairs
            </label>
            {activeTab === "history" && (
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  if (user?.id) {
                    const loadTradeHistory = async () => {
                      setIsLoadingHistory(true);
                      try {
                        const response = await fetch(`/api/users/${user.id}/trades`, {
                          method: 'GET',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                          }
                        });
                        if (response.ok) {
                          const serverTrades = await response.json();
                          console.log('🔄 Refreshed trade history:', serverTrades.length);
                          const formattedTrades = serverTrades
                            .filter((trade: any) => trade.result && trade.result !== 'pending' && trade.status === 'completed')
                            .map((trade: any) => {
                              const entryPrice = parseFloat(trade.entry_price || '0');
                              let exitPrice = parseFloat(trade.exit_price || '0');
                              const isWon = (trade.result === 'win');

                              console.log(`📊 Trade ${trade.id}: Entry=${entryPrice}, Exit=${exitPrice}, Status=${trade.status}, Result=${trade.result}`);

                              // ONLY generate exit price if it's truly missing from database (should be rare)
                              if (!exitPrice || exitPrice === 0) {
                                console.log(`⚠️ Missing exit price for trade ${trade.id}, generating consistent fallback`);
                                // Use trade ID as seed for consistent price generation
                                const seed = parseInt(trade.id.toString().slice(-6)) || 123456;
                                const seededRandom = (seed * 9301 + 49297) % 233280 / 233280; // Simple seeded random

                                // Generate realistic price movement for Bitcoin (0.01% to 0.5% max for 30-60 second trades)
                                const maxMovement = 0.005; // 0.5% maximum movement for short-term trades
                                const minMovement = 0.0001; // 0.01% minimum movement
                                const movementRange = maxMovement - minMovement;
                                const movementPercent = (seededRandom * movementRange + minMovement);

                                // Determine direction based on trade outcome and direction
                                let priceDirection = 1; // Default up
                                if (trade.direction === 'up') {
                                  // For UP trades: WIN means price goes up, LOSE means price goes down
                                  priceDirection = isWon ? 1 : -1;
                                } else if (trade.direction === 'down') {
                                  // For DOWN trades: WIN means price goes down, LOSE means price goes up
                                  priceDirection = isWon ? -1 : 1;
                                }

                                // Calculate realistic exit price
                                exitPrice = entryPrice * (1 + (movementPercent * priceDirection));

                                // Ensure minimum price difference (at least $0.01 for Bitcoin)
                                const minDifference = 0.01;
                                if (Math.abs(exitPrice - entryPrice) < minDifference) {
                                  exitPrice = entryPrice + (priceDirection * minDifference);
                                }

                                console.log(`✅ Generated fallback exit price for trade ${trade.id}: ${exitPrice}`);
                              } else {
                                console.log(`✅ Using stored exit price for trade ${trade.id}: ${exitPrice}`);
                              }

                              return {
                                id: trade.id,
                                symbol: trade.symbol || 'BTCUSDT',
                                amount: parseFloat(trade.amount),
                                direction: trade.direction,
                                duration: trade.duration || 30,
                                entryPrice: entryPrice,
                                currentPrice: exitPrice, // Use calculated realistic exit price
                                payout: isWon ? parseFloat(trade.amount) + parseFloat(trade.profit_loss || '0') : 0,
                                status: isWon ? 'won' : 'lost',
                                endTime: trade.updated_at || trade.created_at,
                                startTime: trade.created_at,
                                profit: parseFloat(trade.profit_loss || '0')
                              };
                            });
                          setTradeHistory(formattedTrades);
                          // Don't cache trade history to prevent conflicts
                        }
                      } catch (error) {
                        console.error('❌ Error refreshing trade history:', error);
                      } finally {
                        setIsLoadingHistory(false);
                      }
                    };
                    loadTradeHistory();
                  }
                }}
                className="text-gray-400 hover:text-white flex items-center space-x-1"
                disabled={isLoadingHistory}
              >
                <svg className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-xs">Refresh</span>
              </button>
            )}
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
                      <span className="text-gray-300">{trade.entryPrice.toFixed(2)} USDT</span>
                      <span className="text-white">{currentPrice.toFixed(2)} USDT</span>
                      <span className="text-gray-300">{trade.amount} USDT</span>
                      <span className="text-gray-300">{trade.profitPercentage}%</span>
                      <span className={`font-bold ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
                        {potentialPayout > 0 ? '+' : ''}{potentialPayout.toFixed(2)} USDT
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
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 mb-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-gray-400 text-sm">Loading trade history...</div>
                </div>
              ) : tradeHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 mb-4 opacity-50">
                    <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className="text-gray-400 text-sm">No trade history</div>
                  <div className="text-gray-500 text-xs mt-2">Complete some trades to see your history here</div>
                </div>
              ) : (
                <>
                  {/* Trade History Table */}
                  <div className="mb-6">
                    {tradeHistory.map(trade => {
                      // Calculate P&L correctly: For wins show profit amount, for losses show negative amount
                      const profitPercentage = trade.duration === 30 ? 10 : 15; // Default profit percentages
                      const pnl = trade.profit !== undefined ? trade.profit :
                                 (trade.status === 'won' ?
                                   (trade.amount * profitPercentage / 100) : // Show profit amount for wins
                                   -trade.amount); // Show negative amount for losses
                      const endTime = new Date(trade.endTime).toLocaleTimeString();

                      return (
                        <div key={trade.id} className="grid grid-cols-8 gap-4 text-xs py-3 border-b border-gray-800 hover:bg-gray-800/30">
                          <span className={`font-bold ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.direction.toUpperCase()}
                          </span>
                          <span className="text-gray-300">{trade.entryPrice.toFixed(2)} USDT</span>
                          <span className="text-gray-300">{trade.currentPrice?.toFixed(2) || 'N/A'} USDT</span>
                          <span className="text-gray-300">{trade.amount} USDT</span>
                          <span className="text-gray-300">{profitPercentage}%</span>
                          <span className={`font-bold ${trade.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.status === 'won' ? '+' : ''}{pnl.toFixed(2)} USDT
                          </span>
                          <span className="text-gray-400">{endTime}</span>
                          <span className={`font-bold ${trade.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.status === 'won' ? '✅ WON' : '❌ LOST'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trading Chart Below History */}
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white">Market Chart</h3>
                      <select
                        value={selectedSymbol}
                        onChange={(e) => {
                          const newSymbol = e.target.value;
                          setSelectedSymbol(newSymbol);
                          handleTradingViewSymbolChange(newSymbol);
                        }}
                        className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="BTCUSDT">BTC/USDT</option>
                        <option value="ETHUSDT">ETH/USDT</option>
                        <option value="XRPUSDT">XRP/USDT</option>
                        <option value="LTCUSDT">LTC/USDT</option>
                        <option value="BNBUSDT">BNB/USDT</option>
                        <option value="SOLUSDT">SOL/USDT</option>
                        <option value="TONUSDT">TON/USDT</option>
                        <option value="DOGEUSDT">DOGE/USDT</option>
                        <option value="ADAUSDT">ADA/USDT</option>
                        <option value="TRXUSDT">TRX/USDT</option>
                        <option value="HYPEUSDT">HYPE/USDT</option>
                        <option value="LINKUSDT">LINK/USDT</option>
                        <option value="AVAXUSDT">AVAX/USDT</option>
                        <option value="SUIUSDT">SUI/USDT</option>
                        <option value="SHIBUSDT">SHIB/USDT</option>
                        <option value="BCHUSDT">BCH/USDT</option>
                        <option value="DOTUSDT">DOT/USDT</option>
                        <option value="MATICUSDT">MATIC/USDT</option>
                        <option value="XLMUSDT">XLM/USDT</option>
                      </select>
                    </div>
                    <div className="h-[300px] bg-[#10121E] rounded-lg overflow-hidden">
                      <TradingViewWidget
                        type="chart"
                        symbol={`BINANCE:${selectedSymbol}`}
                        height={300}
                        interval="1"
                        theme="dark"
                        container_id="trade_history_chart"
                        allow_symbol_change={true}
                        onSymbolChange={handleTradingViewSymbolChange}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />







      {/* DEBUG: Test Mobile Notification Button - REMOVE IN PRODUCTION */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            console.log('🧪 DEBUG: Manual notification trigger');
            const testTrade = {
              id: 'manual-test-' + Date.now(),
              direction: 'up' as const,
              amount: 100,
              entryPrice: 50000,
              currentPrice: 51000,
              status: 'won' as const,
              payout: 110,
              profitPercentage: 10
            };
            triggerNotification(testTrade);
          }}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Test Mobile Notification
        </button>
      )}

      {/* Trade Notification */}
      {console.log('🔔 RENDER: completedTrade state:', completedTrade, 'key:', notificationKey)}
      <TradeNotification
        key={notificationKey} // Force re-render with unique key
        trade={completedTrade ? {
          id: completedTrade.id,
          direction: completedTrade.direction,
          amount: completedTrade.amount,
          entryPrice: completedTrade.entryPrice,
          finalPrice: completedTrade.currentPrice || completedTrade.entryPrice,
          status: completedTrade.status as 'won' | 'lost',
          payout: completedTrade.payout || (completedTrade.status === 'won' ?
            completedTrade.amount + (completedTrade.amount * (completedTrade.profitPercentage || 10) / 100) :
            0),
          profitPercentage: completedTrade.profitPercentage || (selectedDuration === '30' ? 10 : 15),
          symbol: selectedSymbol.replace('USDT', '/USDT'), // Convert BTCUSDT to BTC/USDT format
          duration: parseInt(selectedDuration.replace('s', '')) // Convert "30s" to 30
        } : null}
        onClose={() => {
          console.log('🔔 NOTIFICATION: onClose called');
          setCompletedTrade(null);
          localStorage.removeItem('completedTrade');
        }}
      />

      {/* Mobile Trade Modal */}
      {isMobileModalOpen && mobileTradeData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-5 z-[999999]"
          onClick={() => {
            setIsMobileModalOpen(false);
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            className="bg-gray-900 rounded-xl p-6 max-w-sm w-full text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div className="text-lg font-bold">{mobileTradeData.symbol}</div>
              <button
                onClick={() => {
                  setIsMobileModalOpen(false);
                  document.body.style.overflow = 'auto';
                }}
                className="bg-transparent border-0 text-white text-2xl cursor-pointer p-0 w-6 h-6"
              >
                ×
              </button>
            </div>

            {/* PnL */}
            <div className="text-center mb-5">
              <div className={`text-4xl font-bold mb-2 ${mobileTradeData.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {mobileTradeData.pnl >= 0 ? '+' : ''}{mobileTradeData.pnl.toFixed(0)} USDT
              </div>
              <div className="text-gray-400 text-base">Settlement completed</div>
            </div>

            {/* Details */}
            <div className="mb-5">
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Current price :</span>
                <span>{mobileTradeData.currentPrice}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Time :</span>
                <span>{mobileTradeData.duration}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Side :</span>
                <span className={mobileTradeData.side === 'Buy Up' ? 'text-green-400' : 'text-red-400'}>
                  {mobileTradeData.side}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Amount :</span>
                <span>{mobileTradeData.amount} USDT</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Price :</span>
                <span>{mobileTradeData.price.toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Footer text */}
            <div className="text-gray-400 text-sm leading-relaxed">
              The ultimate price for each option contract is determined by the system's settlement process.
            </div>
          </div>
        </div>
      )}


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

// Main component with dynamic PriceProvider
export default function OptionsPage() {
  return <OptionsPageWithProvider />;
}

// Component that manages symbol state and provides it to PriceProvider
function OptionsPageWithProvider() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  return (
    <PriceProvider symbol={selectedSymbol} updateInterval={2000}>
      <OptionsPageContent
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
      />
    </PriceProvider>
  );
}
