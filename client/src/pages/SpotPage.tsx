import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "../components/ui/navigation";
import { Footer } from "../components/ui/footer";
import { MobileBottomNav } from "../components/ui/mobile-bottom-nav";
import { MobileHeader } from "../components/ui/mobile-header";
import { Button } from "../components/ui/button";
import LightweightChart from "../components/LightweightChart";
import TradingViewWidget from "../components/TradingViewWidget";
import ErrorBoundary from "../components/ErrorBoundary";
import { PriceProvider, usePrice, usePriceChange, use24hStats } from "../contexts/PriceContext";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
import { useMultiSymbolPrice } from "../hooks/useMultiSymbolPrice";
import { useToast } from "../hooks/use-toast";
import { useIsMobile } from "../hooks/use-mobile";
import { apiRequest } from "../lib/queryClient";
import type { MarketData } from "../../../shared/schema";

interface SpotOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market';
  amount: string;
  price?: string;
  total: string;
  status: 'pending' | 'filled' | 'cancelled';
  createdAt: string;
}

// Inner component that uses price context
function SpotPageContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lastMessage, subscribe, connected, sendMessage } = useWebSocket();
  const isMobile = useIsMobile();

  // UI State - Define first to avoid initialization order issues
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("open"); // "open" or "history"
  const [mobileTradeTab, setMobileTradeTab] = useState("buy"); // "buy" or "sell" for mobile
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [selectedSymbol, setSelectedSymbol] = useState('LTCUSDT'); // Default to LTC to match chart
  // Chart view state - Default to TradingView to match options page
  const [chartView, setChartView] = useState<'basic' | 'tradingview' | 'depth'>('tradingview');

  // Order management states
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const hasLoadedInitialData = useRef(false);

  // Use price context for synchronized price data - SINGLE SOURCE OF TRUTH
  const { priceData } = usePrice();
  const { changeText, changeColor, isPositive } = usePriceChange();
  const { high, low, volume } = use24hStats();

  // Multi-symbol price data for all trading pairs
  const { priceData: multiSymbolPriceData, getPriceForSymbol } = useMultiSymbolPrice();

  // Get current price for selected symbol (now selectedSymbol is defined)
  const selectedSymbolPriceData = getPriceForSymbol(selectedSymbol);
  const currentPrice = selectedSymbolPriceData?.price || priceData?.price || 0;
  const formattedPrice = currentPrice.toFixed(2);

  // Helper function to get real price data for any symbol
  const getRealPriceData = (rawSymbol: string) => {
    const symbolData = getPriceForSymbol(rawSymbol);
    if (symbolData) {
      return {
        price: symbolData.price.toFixed(rawSymbol.includes('SHIB') ? 8 : 2),
        change: `${symbolData.priceChangePercent24h >= 0 ? '+' : ''}${symbolData.priceChangePercent24h.toFixed(2)}%`,
        isPositive: symbolData.priceChangePercent24h >= 0
      };
    }
    // Fallback to mock data if real data not available
    return {
      price: '0.00',
      change: '+0.00%',
      isPositive: true
    };
  };

  // Debug logging
  useEffect(() => {
    console.log('🔍 SpotPage mounted');
    console.log('🔍 User:', user);
    console.log('💰 SpotPage - Price from context:', priceData?.price);
    console.log('💰 SpotPage - Selected symbol:', selectedSymbol);
    console.log('💰 SpotPage - Selected symbol price data:', selectedSymbolPriceData);
    console.log('💰 SpotPage - Current price:', currentPrice);
    return () => {
      console.log('🔍 SpotPage unmounted');
    };
  }, [user, priceData, selectedSymbol, selectedSymbolPriceData, currentPrice]);

  // Load initial mock order history only once
  useEffect(() => {
    if (user && !hasLoadedInitialData.current) {
      loadOrderHistory();
      hasLoadedInitialData.current = true;
    }
  }, [user]); // Only run when user changes, and only once

  // Load order history with persistence
  const loadOrderHistory = async () => {
    if (!user) return;

    try {
      // First, try to load from localStorage
      const savedOrders = localStorage.getItem(`orderHistory_${user.id || 'user-1'}`);

      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrderHistory(parsedOrders);
        console.log('📋 Loaded order history from localStorage:', parsedOrders.length, 'orders');
        return;
      }

      // If no saved orders, create initial mock data
      const mockOrderHistory = [
        {
          id: '1',
          symbol: 'BTC/USDT',
          type: 'buy',
          orderType: 'limit',
          amount: '0.001',
          price: '110,750.00',
          total: '110.75',
          status: 'filled',
          time: new Date(Date.now() - 3600000).toLocaleString(), // 1 hour ago
          fee: '0.11'
        },
        {
          id: '2',
          symbol: 'ETH/USDT',
          type: 'sell',
          orderType: 'market',
          amount: '0.05',
          price: '3,577.42',
          total: '178.87',
          status: 'filled',
          time: new Date(Date.now() - 7200000).toLocaleString(), // 2 hours ago
          fee: '0.18'
        },
        {
          id: '3',
          symbol: 'BTC/USDT',
          type: 'buy',
          orderType: 'limit',
          amount: '0.0005',
          price: '110,500.00',
          total: '55.25',
          status: 'filled',
          time: new Date(Date.now() - 10800000).toLocaleString(), // 3 hours ago
          fee: '0.06'
        },
        {
          id: '4',
          symbol: 'SOL/USDT',
          type: 'buy',
          orderType: 'market',
          amount: '2.5',
          price: '245.67',
          total: '614.18',
          status: 'filled',
          time: new Date(Date.now() - 14400000).toLocaleString(), // 4 hours ago
          fee: '0.61'
        },
        {
          id: '5',
          symbol: 'XRP/USDT',
          type: 'sell',
          orderType: 'limit',
          amount: '100',
          price: '3.18',
          total: '318.00',
          status: 'filled',
          time: new Date(Date.now() - 18000000).toLocaleString(), // 5 hours ago
          fee: '0.32'
        }
      ];

      setOrderHistory(mockOrderHistory);
      // Save initial mock data to localStorage
      localStorage.setItem(`orderHistory_${user.id || 'user-1'}`, JSON.stringify(mockOrderHistory));
      console.log('📋 Created initial order history:', mockOrderHistory.length, 'orders');
    } catch (error) {
      console.error('❌ Error loading order history:', error);
    }
  };

  // Save order history to localStorage whenever it changes
  const saveOrderHistory = (orders: any[]) => {
    if (!user) return;
    try {
      localStorage.setItem(`orderHistory_${user.id || 'user-1'}`, JSON.stringify(orders));
      console.log('💾 Saved order history to localStorage:', orders.length, 'orders');
    } catch (error) {
      console.error('❌ Error saving order history:', error);
    }
  };

  // Trading pairs data - All 19 supported currencies with real price data
  const tradingPairs = [
    { symbol: 'BTC/USDT', coin: 'BTC', rawSymbol: 'BTCUSDT', ...getRealPriceData('BTCUSDT'), icon: '₿', iconBg: 'bg-orange-500' },
    { symbol: 'ETH/USDT', coin: 'ETH', rawSymbol: 'ETHUSDT', ...getRealPriceData('ETHUSDT'), icon: 'Ξ', iconBg: 'bg-purple-500' },
    { symbol: 'XRP/USDT', coin: 'XRP', rawSymbol: 'XRPUSDT', ...getRealPriceData('XRPUSDT'), icon: '✕', iconBg: 'bg-gray-600' },
    { symbol: 'LTC/USDT', coin: 'LTC', rawSymbol: 'LTCUSDT', ...getRealPriceData('LTCUSDT'), icon: 'Ł', iconBg: 'bg-gray-500' },
    { symbol: 'BNB/USDT', coin: 'BNB', rawSymbol: 'BNBUSDT', ...getRealPriceData('BNBUSDT'), icon: 'B', iconBg: 'bg-yellow-600' },
    { symbol: 'SOL/USDT', coin: 'SOL', rawSymbol: 'SOLUSDT', ...getRealPriceData('SOLUSDT'), icon: 'S', iconBg: 'bg-purple-600' },
    { symbol: 'TON/USDT', coin: 'TON', rawSymbol: 'TONUSDT', ...getRealPriceData('TONUSDT'), icon: 'T', iconBg: 'bg-blue-600' },
    { symbol: 'DOGE/USDT', coin: 'DOGE', rawSymbol: 'DOGEUSDT', ...getRealPriceData('DOGEUSDT'), icon: 'D', iconBg: 'bg-yellow-500' },
    { symbol: 'ADA/USDT', coin: 'ADA', rawSymbol: 'ADAUSDT', ...getRealPriceData('ADAUSDT'), icon: 'A', iconBg: 'bg-blue-500' },
    { symbol: 'TRX/USDT', coin: 'TRX', rawSymbol: 'TRXUSDT', ...getRealPriceData('TRXUSDT'), icon: '⚡', iconBg: 'bg-red-600' },
    { symbol: 'LINK/USDT', coin: 'LINK', rawSymbol: 'LINKUSDT', ...getRealPriceData('LINKUSDT'), icon: '🔗', iconBg: 'bg-blue-700' },
    { symbol: 'AVAX/USDT', coin: 'AVAX', rawSymbol: 'AVAXUSDT', ...getRealPriceData('AVAXUSDT'), icon: 'A', iconBg: 'bg-red-500' },
    { symbol: 'DOT/USDT', coin: 'DOT', rawSymbol: 'DOTUSDT', ...getRealPriceData('DOTUSDT'), icon: '●', iconBg: 'bg-pink-500' },
    { symbol: 'MATIC/USDT', coin: 'MATIC', rawSymbol: 'MATICUSDT', ...getRealPriceData('MATICUSDT'), icon: 'M', iconBg: 'bg-purple-700' },
    { symbol: 'UNI/USDT', coin: 'UNI', rawSymbol: 'UNIUSDT', ...getRealPriceData('UNIUSDT'), icon: '🦄', iconBg: 'bg-pink-600' },
    { symbol: 'ATOM/USDT', coin: 'ATOM', rawSymbol: 'ATOMUSDT', ...getRealPriceData('ATOMUSDT'), icon: '⚛', iconBg: 'bg-blue-600' },
    { symbol: 'FIL/USDT', coin: 'FIL', rawSymbol: 'FILUSDT', ...getRealPriceData('FILUSDT'), icon: 'F', iconBg: 'bg-gray-600' },
    { symbol: 'ETC/USDT', coin: 'ETC', rawSymbol: 'ETCUSDT', ...getRealPriceData('ETCUSDT'), icon: 'E', iconBg: 'bg-green-600' },
    { symbol: 'XLM/USDT', coin: 'XLM', rawSymbol: 'XLMUSDT', ...getRealPriceData('XLMUSDT'), icon: '⭐', iconBg: 'bg-indigo-500' }
  ];

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

  // Handle symbol change from TradingView widget (like options page)
  const handleTradingViewSymbolChange = (newSymbol: string) => {
    console.log('📈 SPOT: TradingView symbol changed to:', newSymbol);
    console.log('📈 SPOT: Current selected symbol:', selectedSymbol);
    console.log('📈 SPOT: Available trading pairs:', tradingPairs.map(p => p.rawSymbol));

    // Convert TradingView symbol format to our format
    // e.g., "ETHUSDT" -> "ETHUSDT"
    const cleanSymbol = newSymbol.replace('BINANCE:', '').replace('COINBASE:', '');

    // Check if this symbol exists in our trading pairs
    const matchingPair = tradingPairs.find(pair => pair.rawSymbol === cleanSymbol);

    console.log('📈 SPOT: Clean symbol:', cleanSymbol);
    console.log('📈 SPOT: Matching pair:', matchingPair);

    if (matchingPair) {
      console.log('✅ SPOT: Found matching pair:', matchingPair);
      setSelectedSymbol(cleanSymbol);
    } else {
      console.log('⚠️ SPOT: Symbol not found in trading pairs, keeping current:', selectedSymbol);
    }
  };

  // Legacy price states - REMOVED (now using PriceContext as single source of truth)
  // const [currentPrice, setCurrentPrice] = useState<number>(166373.87);
  // const [realTimePrice, setRealTimePrice] = useState<string>('');
  // const [priceChange, setPriceChange] = useState<string>('+0.50%');

  // Buy Form State
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [buyPercentage, setBuyPercentage] = useState<number>(0);

  // Sell Form State
  const [sellPrice, setSellPrice] = useState<string>('');
  const [sellAmount, setSellAmount] = useState<string>('');
  const [sellPercentage, setSellPercentage] = useState<number>(0);

  // Turnover State
  const [buyTurnover, setBuyTurnover] = useState<string>('');
  const [sellTurnover, setSellTurnover] = useState<string>('');

  // Fetch user balances with real-time refetch - FIXED: Use same endpoint as Wallet page
  const { data: balances } = useQuery({
    queryKey: ['/api/balances'],
    enabled: !!user,
    refetchInterval: 2000, // Very fast refetch for real-time sync
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache data (updated from cacheTime)
    queryFn: async () => {
      console.log('🔍 SPOT: Fetching balance from /api/balances for user:', user?.id, user?.username);
      console.log('🔍 SPOT: Auth token:', localStorage.getItem('authToken')?.substring(0, 30) + '...');

      const response = await fetch('/api/balances', {
        credentials: 'include', // Important: send session cookies
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      console.log('🔍 SPOT: Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SPOT: Balance API failed:', response.status, errorText);
        throw new Error(`Failed to fetch balance: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 SPOT: Balance API response:', data);
      return data;
    },
  });

  // Fetch user orders
  const { data: orders } = useQuery<SpotOrder[]>({
    queryKey: ['/api/spot/orders'],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/spot/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
  });

  // Balance state variables for real-time updates
  const [usdtBalance, setUsdtBalance] = useState(0);
  const [btcBalance, setBtcBalance] = useState(0.5);

  // Initialize balances from localStorage or API data
  useEffect(() => {
    if (!user) return;

    // Try to load balances from localStorage first
    const savedBalances = localStorage.getItem(`balances_${user.id || 'user-1'}`);

    if (savedBalances) {
      const { usdt, btc } = JSON.parse(savedBalances);
      setUsdtBalance(usdt);
      setBtcBalance(btc);
      console.log('💾 Loaded balances from localStorage:', { usdt, btc });
      return;
    }

    // If no saved balances, use API data or defaults
    if (balances && Array.isArray(balances)) {
      // Format: [{ symbol: "USDT", available: "700610", locked: "0" }, ...]
      const usdtData = balances.find((b: any) => b.symbol === 'USDT');
      const btcData = balances.find((b: any) => b.symbol === 'BTC');

      const newUsdtBalance = parseFloat(usdtData?.available || '0');
      const newBtcBalance = parseFloat(btcData?.available || '0.5');

      setUsdtBalance(newUsdtBalance);
      setBtcBalance(newBtcBalance);

      // Save initial balances to localStorage
      localStorage.setItem(`balances_${user.id || 'user-1'}`, JSON.stringify({
        usdt: newUsdtBalance,
        btc: newBtcBalance
      }));

      console.log('🔍 SPOT: Updated balances from API and saved to localStorage:', {
        usdtData,
        btcData,
        newUsdtBalance,
        newBtcBalance
      });
    }
  }, [balances, user]);

  // Save balances to localStorage
  const saveBalances = (usdtBal: number, btcBal: number) => {
    if (!user) return;
    try {
      localStorage.setItem(`balances_${user.id || 'user-1'}`, JSON.stringify({
        usdt: usdtBal,
        btc: btcBal
      }));
      console.log('💾 Saved balances to localStorage:', { usdt: usdtBal, btc: btcBal });
    } catch (error) {
      console.error('❌ Error saving balances:', error);
    }
  };

  // ENHANCED Debug logging for balance sync
  console.log('🔍 SPOT PAGE BALANCE DEBUG:', {
    user: user?.id,
    balances,
    usdtBalance,
    btcBalance,
    'balances?.USDT': balances?.USDT,
    'balances?.USDT?.available': balances?.USDT?.available,
    'Array.isArray(balances?.balances)': Array.isArray(balances?.balances),
    'Array.isArray(balances)': Array.isArray(balances),
    'typeof balances': typeof balances,
    'balances keys': balances ? Object.keys(balances) : 'null'
  });

  // ALERT: Show balance on screen for debugging
  if (typeof window !== 'undefined') {
    console.log(`🚨 SPOT PAGE: Displaying balance ${usdtBalance} USDT`);
  }

  // Subscribe to balance updates via WebSocket
  useEffect(() => {
    if (connected && user?.id) {
      // Subscribe to balance updates for this user
      sendMessage({
        type: 'subscribe_user_balance',
        userId: user.id
      });
      console.log('🔌 SPOT: Subscribed to balance updates for user:', user.id);
    }
  }, [connected, sendMessage, user?.id]);

  // Handle WebSocket balance updates for real-time sync
  useEffect(() => {
    if (lastMessage?.type === 'balance_update') {
      console.log('🔄 SPOT: Real-time balance update received:', lastMessage.data);
      console.log('🔄 SPOT: Current user ID:', user?.id, 'Update for user:', lastMessage.data?.userId);

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

  // REMOVED: fetchBinancePrice - now using PriceContext as single source of truth

  // Fetch real market data
  const { data: marketData } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
    refetchInterval: 5000,
    queryFn: async () => {
      const response = await fetch('/api/market-data');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      return response.json();
    },
  });

  // Get current BTC price from real market data
  const btcMarketData = marketData?.find(item => item.symbol === selectedSymbol);
  const realPrice = btcMarketData ? parseFloat(btcMarketData.price) : 0;

  // Order placement mutations
  const placeBuyOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const executionPrice = orderData.type === 'limit' ? parseFloat(orderData.price) : currentPrice;
      const amount = parseFloat(orderData.amount);
      const total = executionPrice * amount;

      // Call real spot trading API
      const response = await fetch('/api/spot/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: user.id,
          symbol: selectedSymbol,
          side: 'buy',
          amount: amount,
          price: executionPrice,
          type: orderData.type || 'market'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place buy order');
      }

      const result = await response.json();

      // Create order object for UI
      const newOrder = {
        id: result.order?.id || Date.now().toString(),
        symbol: selectedSymbol,
        type: 'buy',
        orderType: orderData.type,
        amount: amount.toFixed(6),
        price: executionPrice.toFixed(2),
        total: total.toFixed(2),
        status: 'filled',
        time: new Date().toLocaleString(),
        fee: (total * 0.001).toFixed(2) // 0.1% fee
      };

      return { order: newOrder, executionPrice, amount, total, apiResult: result };
    },
    onSuccess: (data) => {
      const { order, executionPrice, amount, total, apiResult } = data;

      // Add to order history and save to localStorage
      setOrderHistory(prev => {
        const newHistory = [order, ...prev];
        saveOrderHistory(newHistory);
        return newHistory;
      });

      // Refresh balance data from server instead of manual calculation
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });

      toast({
        title: "Buy order completed!",
        description: `Bought ${amount.toFixed(6)} BTC at $${executionPrice.toFixed(2)}. New balance: ${(usdtBalance - total).toFixed(2)} USDT`,
        duration: 5000
      });

      // Reset form
      setBuyAmount('');
      setBuyPercentage(0);

      console.log('✅ Buy order completed:', order);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to place buy order",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const placeSellOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const executionPrice = orderData.type === 'limit' ? parseFloat(orderData.price) : currentPrice;
      const amount = parseFloat(orderData.amount);
      const total = executionPrice * amount;

      // Call real spot trading API
      const response = await fetch('/api/spot/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: user.id,
          symbol: selectedSymbol,
          side: 'sell',
          amount: amount,
          price: executionPrice,
          type: orderData.type || 'market'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place sell order');
      }

      const result = await response.json();

      // Create order object for UI
      const newOrder = {
        id: result.order?.id || Date.now().toString(),
        symbol: selectedSymbol,
        type: 'sell',
        orderType: orderData.type,
        amount: amount.toFixed(6),
        price: executionPrice.toFixed(2),
        total: total.toFixed(2),
        status: 'filled',
        time: new Date().toLocaleString(),
        fee: (total * 0.001).toFixed(2) // 0.1% fee
      };

      return { order: newOrder, executionPrice, amount, total, apiResult: result };
    },
    onSuccess: (data) => {
      const { order, executionPrice, amount, total, apiResult } = data;

      // Add to order history and save to localStorage
      setOrderHistory(prev => {
        const newHistory = [order, ...prev];
        saveOrderHistory(newHistory);
        return newHistory;
      });

      // Refresh balance data from server instead of manual calculation
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });

      toast({
        title: "Sell order completed!",
        description: `Sold ${amount.toFixed(6)} BTC at $${executionPrice.toFixed(2)}. New balance: ${(usdtBalance + total).toFixed(2)} USDT`,
        duration: 5000
      });

      // Reset form
      setSellAmount('');
      setSellPercentage(0);

      console.log('✅ Sell order completed:', order);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to place sell order",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Handle WebSocket balance updates for real-time sync
  useEffect(() => {
    if (lastMessage?.type === 'balance_update' && lastMessage.data?.userId === user?.id) {
      console.log('💰 Real-time balance update received in Spot page:', lastMessage.data);

      // Invalidate and refetch balance data to ensure UI sync - use correct query key
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });

      // Show notification for balance changes
      if (lastMessage.data.changeType === 'spot_buy' || lastMessage.data.changeType === 'spot_sell') {
        toast({
          title: "Balance Updated",
          description: `${lastMessage.data.changeType === 'spot_buy' ? 'Buy' : 'Sell'} order completed. New balance: ${lastMessage.data.newBalance} USDT`,
        });
      }
    }
  }, [lastMessage, user?.id, queryClient, toast]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (connected && user?.id) {
      console.log('🔌 Subscribing to balance updates for user:', user.id);
      // Subscribe to user-specific balance updates
      // This will be handled by the WebSocket connection automatically
    }
  }, [connected, user?.id]);

  // Helper functions
  const calculateBuyTotal = () => {
    const price = parseFloat(buyPrice) || 0;
    const amount = parseFloat(buyAmount) || 0;
    return (price * amount).toFixed(2);
  };

  const calculateSellTotal = () => {
    const price = parseFloat(sellPrice) || 0;
    const amount = parseFloat(sellAmount) || 0;
    return (price * amount).toFixed(2);
  };

  // Handle price updates from TradingView widget - DISABLED (uses mock data, not real prices)
  const handlePriceUpdate = (price: number) => {
    // TradingView widget can't provide real prices due to CORS restrictions
    // It only provides mock/simulated prices
    // Real prices come from Binance API instead
    console.log('📊 TradingView price update ignored (mock data):', price);
  };

  // Sync turnover with price/amount changes
  useEffect(() => {
    if (buyPrice && buyAmount) {
      setBuyTurnover(calculateBuyTotal());
    } else if (!buyAmount) {
      setBuyTurnover('');
    }
  }, [buyPrice, buyAmount]);

  useEffect(() => {
    if (sellPrice && sellAmount) {
      setSellTurnover(calculateSellTotal());
    } else if (!sellAmount) {
      setSellTurnover('');
    }
  }, [sellPrice, sellAmount]);

  const handleBuyPercentageChange = (percentage: number) => {
    setBuyPercentage(percentage);
    const price = parseFloat(buyPrice) || currentPrice;
    const maxAmount = usdtBalance / price;
    const amount = (maxAmount * percentage / 100).toFixed(6);
    setBuyAmount(amount);
  };

  const handleSellPercentageChange = (percentage: number) => {
    setSellPercentage(percentage);
    const amount = (btcBalance * percentage / 100).toFixed(6);
    setSellAmount(amount);
  };

  const handleBuySubmit = () => {
    console.log('🔥 Buy button clicked!');
    console.log('User:', user);
    console.log('USDT Balance:', usdtBalance);
    console.log('Buy Amount:', buyAmount);
    console.log('Buy Price:', buyPrice);

    const price = parseFloat(buyPrice);
    const amount = parseFloat(buyAmount);

    if (!amount || amount <= 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (orderType === 'limit' && (!price || price <= 0)) {
      toast({ title: "Please enter a valid price", variant: "destructive" });
      return;
    }

    const total = orderType === 'limit' ? price * amount : currentPrice * amount;
    console.log('Calculated total:', total);

    if (total > usdtBalance) {
      toast({ title: `Insufficient USDT balance. Need ${total.toFixed(2)} but have ${usdtBalance.toFixed(2)}`, variant: "destructive" });
      return;
    }

    console.log('✅ All validations passed, placing order...');
    placeBuyOrderMutation.mutate({
      type: orderType,
      amount: amount.toString(),
      price: orderType === 'limit' ? price.toString() : undefined,
      total: total.toString(),
    });
  };

  const handleSellSubmit = () => {
    console.log('🔥 Sell button clicked!');
    console.log('User:', user);
    console.log('BTC Balance:', btcBalance);
    console.log('Sell Amount:', sellAmount);
    console.log('Sell Price:', sellPrice);

    const price = parseFloat(sellPrice);
    const amount = parseFloat(sellAmount);

    if (!amount || amount <= 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (orderType === 'limit' && (!price || price <= 0)) {
      toast({ title: "Please enter a valid price", variant: "destructive" });
      return;
    }

    if (amount > btcBalance) {
      toast({ title: `Insufficient BTC balance. Need ${amount.toFixed(6)} but have ${btcBalance.toFixed(6)}`, variant: "destructive" });
      return;
    }

    const total = orderType === 'limit' ? price * amount : currentPrice * amount;
    console.log('Calculated total:', total);

    console.log('✅ All validations passed, placing sell order...');
    placeSellOrderMutation.mutate({
      type: orderType,
      amount: amount.toString(),
      price: orderType === 'limit' ? price.toString() : undefined,
      total: total.toString(),
    });
  };

  // REMOVED: Initialize real-time price fetching - now using PriceContext

  // REMOVED: Update current price from real market data - now using PriceContext

  // Initialize price fields when current price is available from PriceContext
  useEffect(() => {
    if (currentPrice > 0) {
      if (!buyPrice) setBuyPrice(formattedPrice);
      if (!sellPrice) setSellPrice(formattedPrice);
    }
  }, [currentPrice, buyPrice, sellPrice, formattedPrice]);

  // Generate dynamic order book data based on current price
  const generateOrderBookData = (basePrice: number) => {
    // Safety check for valid price - use current price for selected symbol
    let safeBasePrice = basePrice;
    if (!safeBasePrice || isNaN(safeBasePrice) || safeBasePrice <= 0) {
      // Get price for selected symbol or use default
      const symbolPrice = getPriceForSymbol(selectedSymbol)?.price;
      safeBasePrice = symbolPrice || priceData?.price || 166373.87;
    }

    console.log('📊 Order Book - Base price:', basePrice, 'Safe price:', safeBasePrice, 'Symbol:', selectedSymbol);

    const sellOrders = [];
    const buyOrders = [];

    // Generate sell orders (above current price)
    for (let i = 0; i < 14; i++) {
      const priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
      const price = safeBasePrice + priceOffset;
      const volume = (Math.random() * 2 + 0.1).toFixed(4);
      const turnover = (price * parseFloat(volume)).toFixed(2);

      sellOrders.push({
        price: price.toFixed(2),
        volume,
        turnover
      });
    }

    // Generate buy orders (below current price)
    for (let i = 0; i < 14; i++) {
      const priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
      const price = safeBasePrice - priceOffset;
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

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#10121E] text-white pb-20">
        {/* Use standard mobile header */}
        <MobileHeader />

        {/* Trading Pair Info Header - Below standard header */}
        <div className="bg-[#10121E] px-4 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-lg">{currentPairData.symbol}</div>
              <div className="text-white text-xl font-bold">${currentPairData.price}</div>
              <div className={`text-sm font-semibold`} style={{ color: currentPairData.isPositive ? '#10b981' : '#ef4444' }}>
                {currentPairData.change}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs">24h Vol</div>
              <div className="text-white text-sm font-bold">
                {btcMarketData?.volume24h ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(1) + 'M BTC' : '1.2M BTC'}
              </div>
            </div>
          </div>

          {/* Mobile Market Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
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

        {/* Mobile Chart - Full Vertical Layout - Using TradingView like options page */}
        <div className="bg-[#10121E] relative w-full mobile-chart-container" style={{ height: '450px' }}>
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
              {tradingPairs.map((pair) => (
                <option key={pair.rawSymbol} value={pair.rawSymbol} className="bg-gray-800 text-white">
                  {pair.coin}/USDT
                </option>
              ))}
            </select>
          </div>

          <div className="w-full h-full">
            <ErrorBoundary>
              <LightweightChart
                symbol={selectedSymbol}
                interval="1m"
                height={450}
                containerId="spot_mobile_chart"
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Mobile Content - Scrollable Below Chart */}
        <div className="bg-[#10121E] min-h-screen">
        {/* Mobile Market Stats - Same as Desktop */}
        <div className="px-4 py-2 border-b border-gray-700">
          <h3 className="text-white font-bold mb-2">Market Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Current Price</div>
              <div className="text-white font-bold text-lg">${formattedPrice}</div>
            </div>
            <div>
              <div className="text-gray-400">24h Change</div>
              <div className="font-semibold" style={{ color: changeColor }}>
                {changeText}
              </div>
            </div>
            <div>
              <div className="text-gray-400">24h Volume</div>
              <div className="text-white font-semibold">2,847.32 BTC</div>
            </div>
            <div>
              <div className="text-gray-400">Market Cap</div>
              <div className="text-white font-semibold">$1.2T</div>
            </div>
          </div>
        </div>

        {/* Mobile Order Book */}
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-bold mb-3">Order Book</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Sell Orders */}
            <div>
              <div className="text-red-400 text-sm font-medium mb-2">Sell Orders</div>
              <div className="space-y-1">
                {generateOrderBookData(currentPrice).sellOrders.slice(0, 5).map((order, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-red-400">{order.price}</span>
                    <span className="text-gray-400">{order.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy Orders */}
            <div>
              <div className="text-green-400 text-sm font-medium mb-2">Buy Orders</div>
              <div className="space-y-1">
                {generateOrderBookData(currentPrice).buyOrders.slice(0, 5).map((order, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-green-400">{order.price}</span>
                    <span className="text-gray-400">{order.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Market Overview */}
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-white font-bold mb-3">Market Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { symbol: 'BTC/USDT', price: formattedPrice, change: changeText },
              { symbol: 'ETH/USDT', price: '3,456.78', change: '+1.23%' },
              { symbol: 'BNB/USDT', price: '712.45', change: '-0.45%' },
              { symbol: 'ADA/USDT', price: '0.8272', change: '+0.60%' }
            ].map((market, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-3">
                <div className="text-white text-sm font-medium">{market.symbol}</div>
                <div className="text-white text-lg font-bold">${market.price}</div>
                <div className={`text-xs font-medium ${market.change.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {market.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Trading Interface */}
        <div className="px-4 py-4 space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMobileTradeTab('buy')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mobileTradeTab === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setMobileTradeTab('sell')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mobileTradeTab === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Order Type Tabs - Mobile */}
          <div className="flex space-x-6 mb-4">
            <button
              onClick={() => setOrderType('limit')}
              className={`pb-2 text-sm font-medium ${
                orderType === 'limit'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Limit order
            </button>
            <button
              onClick={() => setOrderType('market')}
              className={`pb-2 text-sm font-medium ${
                orderType === 'market'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Market order
            </button>
          </div>

          {/* Trading Form */}
          {mobileTradeTab === 'buy' ? (
            <div className="space-y-4">
              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Price (USDT)</label>
                  <input
                    type="number"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    placeholder={formattedPrice}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount (BTC)</label>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Total (USDT)</label>
                <div className="text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  {calculateBuyTotal()}
                </div>
              </div>

              {/* Mobile Available Balance and Buy Suggestion - Same as Desktop */}
              <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded">
                {user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Available {usdtBalance.toFixed(2)} USDT</span>
                      <span className="text-blue-400">≈</span>
                    </div>
                    <div className="text-green-400 font-medium">Can buy ≈ {(usdtBalance / currentPrice).toFixed(6)} BTC</div>
                  </>
                ) : (
                  <div className="text-center text-yellow-400">
                    Sign in to view balance
                  </div>
                )}
              </div>

              <Button
                onClick={handleBuySubmit}
                disabled={!buyAmount || buyAmount === '0' || !user}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {!user ? 'Login to Trade' : `Buy BTC`}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Price (USDT)</label>
                  <input
                    type="number"
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                    placeholder={formattedPrice}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount (BTC)</label>
                <input
                  type="number"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Total (USDT)</label>
                <div className="text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  {calculateSellTotal()}
                </div>
              </div>

              {/* Mobile Available Balance and Sell Suggestion - Same as Desktop */}
              <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded">
                {user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Available {btcBalance.toFixed(6)} BTC</span>
                      <span className="text-blue-400">≈</span>
                    </div>
                    <div className="text-red-400 font-medium">Available ≈ {(btcBalance * currentPrice).toFixed(2)} USDT</div>
                  </>
                ) : (
                  <div className="text-center text-yellow-400">
                    Sign in to view balance
                  </div>
                )}
              </div>

              <Button
                onClick={handleSellSubmit}
                disabled={!sellAmount || sellAmount === '0' || !user}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {!user ? 'Login to Trade' : `Sell BTC`}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Recent Orders */}
        <div className="px-4 py-4">
          <h3 className="text-white font-bold mb-3">Recent Orders</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {orderHistory.slice(0, 5).map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`text-sm font-medium ${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.type.toUpperCase()} {order.symbol}
                    </span>
                    <div className="text-xs text-gray-400">{order.amount} @ ${order.price}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      order.status === 'filled' ? 'text-green-400' :
                      order.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {order.status}
                    </div>
                    <div className="text-xs text-gray-400">${order.total}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{order.time}</div>
              </div>
            ))}
            {orderHistory.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No recent orders
              </div>
            )}
          </div>
        </div>
        </div>

        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop layout (existing)
  return (
    <div className="min-h-screen bg-gray-900">
        <Navigation />
      <div className="bg-[#10121E] flex min-h-screen">
        {/* Left and Center Content */}
        <div className="flex-1">
          {/* Top Header with BTC/USDT and Controls */}
          <div className="bg-[#10121E] px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {/* Left - Dynamic Trading Pair Info - Using TradingView Price */}
              <div className="flex items-center space-x-6">
                <div>
                  <div className="text-white font-bold text-lg">{currentPairData.symbol}</div>
                  <div className="text-white text-2xl font-bold">${currentPairData.price}</div>
                  <div className="text-gray-400 text-sm">$ {currentPairData.price}</div>
                </div>
                <div className="text-lg font-semibold" style={{ color: currentPairData.isPositive ? '#10b981' : '#ef4444' }}>
                  {currentPairData.change}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <div className="text-gray-400">Change 24h</div>
                    <div className="text-white" style={{ color: currentPairData.isPositive ? '#10b981' : '#ef4444' }}>{currentPairData.change}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">24h High</div>
                    <div className="text-white">{selectedSymbol === 'BTCUSDT' ? (high ? high.toFixed(2) : '119558.19') : (parseFloat(currentPairData.price) * 1.02).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">24h Low</div>
                    <div className="text-white">{selectedSymbol === 'BTCUSDT' ? (low ? low.toFixed(2) : '117204.65') : (parseFloat(currentPairData.price) * 0.98).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Volume 24h ({currentPairData.coin})</div>
                    <div className="text-white">{selectedSymbol === 'BTCUSDT' ? (volume ? volume.toFixed(2) : '681.35') : (Math.random() * 1000 + 500).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Turnover 24h (USDT)</div>
                    <div className="text-white">{selectedSymbol === 'BTCUSDT' ? '80520202.92' : (parseFloat(currentPairData.price) * (Math.random() * 1000000 + 500000)).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Trading Interface */}
          <div className="flex min-h-[900px]">
        {/* Left Panel - Order Book */}
        <div className="w-56 bg-[#10121E] border-r border-gray-700 min-h-[900px]">
          {/* Header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold text-lg">
                {selectedSymbol.replace('USDT', '/USDT')}
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: changeColor }}>${formattedPrice}</div>
                <div className="text-gray-400 text-sm">Change 24h</div>
                <div className="text-sm" style={{ color: changeColor }}>{changeText}</div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
                <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
                <div className="w-4 h-4 bg-yellow-600 rounded-sm"></div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-white text-sm">0.01</span>
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>

          {/* Column Headers - Dynamic based on selected symbol */}
          <div className="grid grid-cols-3 gap-2 p-2 text-xs text-gray-400 border-b border-gray-700">
            <span>Price (USDT)</span>
            <span>Volume ({selectedSymbol.replace('USDT', '')})</span>
            <span>Turnover</span>
          </div>

          {/* Order Book Data */}
          <div className="flex-1 min-h-[650px] overflow-y-auto">
            {/* Sell Orders (Red) - Using TradingView Price */}
            <div className="space-y-0">
              {generateOrderBookData(currentPrice).sellOrders.map((order, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-[#3a3d57]">
                  <span className="text-red-400">{order.price}</span>
                  <span className="text-gray-300">{order.volume}</span>
                  <span className="text-gray-300">{order.turnover}</span>
                </div>
              ))}
            </div>

            {/* Current Price - Using TradingView Price */}
            <div className="bg-[#10121E] p-2 my-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg" style={{ color: changeColor }}>
                  {formattedPrice}
                </span>
                <span style={{ color: changeColor }}>
                  {isPositive ? '↑' : '↓'}
                </span>
                <span className="text-gray-400 text-sm">${formattedPrice}</span>
              </div>
            </div>

            {/* Buy Orders (Green) - Using TradingView Price */}
            <div className="space-y-0">
              {generateOrderBookData(currentPrice).buyOrders.map((order, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-[#3a3d57]">
                  <span className="text-green-400">{order.price}</span>
                  <span className="text-gray-300">{order.volume}</span>
                  <span className="text-gray-300">{order.turnover}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Chart and Trading Area */}
        <div className="flex-1 bg-[#10121E] flex flex-col">
          {/* Chart Controls - Chart view switching like options page */}
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
                          ? 'text-white bg-blue-600 px-2 py-1 rounded'
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
                        ? 'text-white bg-blue-600 px-2 py-1 rounded'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Trading view
                  </button>
                  <button
                    onClick={() => setChartView('depth')}
                    className={`text-xs transition-colors ${
                      chartView === 'depth'
                        ? 'text-white bg-blue-600 px-2 py-1 rounded'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Depth
                  </button>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chart Area - Dynamic chart based on selected view like options page */}
          <div className="h-[500px] relative bg-[#10121E] p-1">
            {/* Basic chart view disabled to avoid red line issues */}
            {false && chartView === 'basic' && (
              <LightweightChart
                symbol={selectedSymbol}
                interval="1m"
                height={490}
                containerId="spot_desktop_chart"
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
                    {tradingPairs.map((pair) => (
                      <option key={pair.rawSymbol} value={pair.rawSymbol} className="bg-gray-800 text-white">
                        {pair.coin}/USDT
                      </option>
                    ))}
                  </select>
                </div>

                <ErrorBoundary>
                  <TradingViewWidget
                    type="chart"
                    symbol={`BINANCE:${selectedSymbol}`}
                    height={490}
                    interval="1"
                    theme="dark"
                    container_id="spot_tradingview_chart"
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

                {/* Depth Chart Placeholder */}
                <div className="w-full h-[400px] bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">📊</div>
                    <div className="text-gray-400 text-sm">Market Depth Chart</div>
                    <div className="text-gray-500 text-xs mt-1">Coming Soon</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Trading Section */}
          <div className="bg-[#10121E] p-4 min-h-[450px] flex-shrink-0">
            {/* Order Type Tabs */}
            <div className="flex space-x-6 mb-6">
              <button
                onClick={() => setOrderType('limit')}
                className={`pb-2 text-sm font-medium ${
                  orderType === 'limit'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Limit order
              </button>
              <button
                onClick={() => setOrderType('market')}
                className={`pb-2 text-sm font-medium ${
                  orderType === 'market'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Market order
              </button>
            </div>

            {/* Side-by-side Buy/Sell Forms */}
            <div className="grid grid-cols-2 gap-6">
              {/* Buy Section */}
              <div className="space-y-4">
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        placeholder={formattedPrice}
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">USDT</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12"
                      value={buyAmount}
                      onChange={(e) => {
                        console.log('Buy amount changed:', e.target.value);
                        setBuyAmount(e.target.value);
                        setBuyPercentage(0);
                      }}
                      placeholder="0.00000000"
                      step="0.000001"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">BTC</span>
                  </div>
                </div>

                {/* Percentage Slider */}
                <div className="relative py-4">
                  <div className="flex items-center justify-between relative">
                    <div
                      className={`w-2 h-2 rounded-full z-10 ${buyPercentage > 0 ? 'bg-green-400' : 'bg-gray-400'}`}
                      style={{ left: `${buyPercentage}%` }}
                    ></div>
                    <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-600"></div>
                    <div
                      className="absolute h-0.5 bg-green-400 top-1/2 transform -translate-y-1/2"
                      style={{ width: `${buyPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-2">
                    <button
                      onClick={() => handleBuyPercentageChange(0)}
                      className={`hover:text-white transition-colors ${buyPercentage === 0 ? 'text-green-400' : ''}`}
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleBuyPercentageChange(25)}
                      className={`hover:text-white transition-colors ${buyPercentage === 25 ? 'text-green-400' : ''}`}
                    >
                      25%
                    </button>
                    <button
                      onClick={() => handleBuyPercentageChange(50)}
                      className={`hover:text-white transition-colors ${buyPercentage === 50 ? 'text-green-400' : ''}`}
                    >
                      50%
                    </button>
                    <button
                      onClick={() => handleBuyPercentageChange(75)}
                      className={`hover:text-white transition-colors ${buyPercentage === 75 ? 'text-green-400' : ''}`}
                    >
                      75%
                    </button>
                    <button
                      onClick={() => handleBuyPercentageChange(100)}
                      className={`hover:text-white transition-colors ${buyPercentage === 100 ? 'text-green-400' : ''}`}
                    >
                      100%
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Turnover</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12"
                      value={buyTurnover}
                      onChange={(e) => {
                        console.log('Buy turnover changed:', e.target.value);
                        setBuyTurnover(e.target.value);
                        const total = parseFloat(e.target.value) || 0;
                        const price = parseFloat(buyPrice) || currentPrice;
                        if (price > 0) {
                          const amount = (total / price).toFixed(6);
                          console.log('Calculated buy amount:', amount);
                          setBuyAmount(amount);
                        }
                      }}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">USDT</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded">
                  {user ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Available {usdtBalance.toFixed(2)} USDT</span>
                        <span className="text-blue-400">≈</span>
                      </div>
                      <div className="text-green-400 font-medium">Can buy ≈ {(usdtBalance / currentPrice).toFixed(6)} BTC</div>
                    </>
                  ) : (
                    <div className="text-center text-yellow-400">
                      Sign in to view balance
                    </div>
                  )}
                </div>

                {!user ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full bg-gray-600 cursor-not-allowed text-white py-3 rounded font-medium"
                    >
                      Buy(BTC)
                    </button>
                    <p className="text-center text-yellow-400 text-sm">
                      <a href="/login" className="underline hover:text-yellow-300">
                        Sign in to start trading
                      </a>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleBuySubmit}
                    disabled={placeBuyOrderMutation.isPending}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium"
                  >
                    {placeBuyOrderMutation.isPending ? 'Placing...' : 'Buy(BTC)'}
                  </button>
                )}
              </div>

              {/* Sell Section */}
              <div className="space-y-4">
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        placeholder={formattedPrice}
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">USDT</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12"
                      value={sellAmount}
                      onChange={(e) => {
                        console.log('Sell amount changed:', e.target.value);
                        setSellAmount(e.target.value);
                        setSellPercentage(0);
                      }}
                      placeholder="0.00000000"
                      step="0.000001"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">BTC</span>
                  </div>
                </div>

                {/* Percentage Slider */}
                <div className="relative py-4">
                  <div className="flex items-center justify-between relative">
                    <div
                      className={`w-2 h-2 rounded-full z-10 ${sellPercentage > 0 ? 'bg-red-400' : 'bg-gray-400'}`}
                      style={{ left: `${sellPercentage}%` }}
                    ></div>
                    <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-600"></div>
                    <div
                      className="absolute h-0.5 bg-red-400 top-1/2 transform -translate-y-1/2"
                      style={{ width: `${sellPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-2">
                    <button
                      onClick={() => handleSellPercentageChange(0)}
                      className={`hover:text-white transition-colors ${sellPercentage === 0 ? 'text-red-400' : ''}`}
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleSellPercentageChange(25)}
                      className={`hover:text-white transition-colors ${sellPercentage === 25 ? 'text-red-400' : ''}`}
                    >
                      25%
                    </button>
                    <button
                      onClick={() => handleSellPercentageChange(50)}
                      className={`hover:text-white transition-colors ${sellPercentage === 50 ? 'text-red-400' : ''}`}
                    >
                      50%
                    </button>
                    <button
                      onClick={() => handleSellPercentageChange(75)}
                      className={`hover:text-white transition-colors ${sellPercentage === 75 ? 'text-red-400' : ''}`}
                    >
                      75%
                    </button>
                    <button
                      onClick={() => handleSellPercentageChange(100)}
                      className={`hover:text-white transition-colors ${sellPercentage === 100 ? 'text-red-400' : ''}`}
                    >
                      100%
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Turnover</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12"
                      value={sellTurnover}
                      onChange={(e) => {
                        console.log('Sell turnover changed:', e.target.value);
                        setSellTurnover(e.target.value);
                        const total = parseFloat(e.target.value) || 0;
                        const price = parseFloat(sellPrice) || currentPrice;
                        if (price > 0) {
                          const amount = (total / price).toFixed(6);
                          console.log('Calculated sell amount:', amount);
                          setSellAmount(amount);
                        }
                      }}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">USDT</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded">
                  {user ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Available {btcBalance.toFixed(6)} BTC</span>
                        <span className="text-blue-400">≈</span>
                      </div>
                      <div className="text-red-400 font-medium">Available ≈ {(btcBalance * currentPrice).toFixed(2)} USDT</div>
                    </>
                  ) : (
                    <div className="text-center text-yellow-400">
                      Sign in to view balance
                    </div>
                  )}
                </div>

                {!user ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full bg-gray-600 cursor-not-allowed text-white py-3 rounded font-medium"
                    >
                      Sell (BTC)
                    </button>
                    <p className="text-center text-yellow-400 text-sm">
                      <a href="/login" className="underline hover:text-yellow-300">
                        Sign in to start trading
                      </a>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSellSubmit}
                    disabled={placeSellOrderMutation.isPending}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium"
                  >
                    {placeSellOrderMutation.isPending ? 'Placing...' : 'Sell (BTC)'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading Pairs & Latest Transactions */}
        <div className="w-72 bg-[#10121E] border-l border-gray-700 min-h-[900px] flex flex-col">
          {/* Search Box */}
          <div className="p-4 flex-shrink-0">
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
          <div className="px-4 mb-4 flex-shrink-0">
            <div className="flex space-x-6">
              <button className="text-gray-400 text-sm hover:text-white">Favorites</button>
              <button className="text-blue-400 text-sm border-b-2 border-blue-400 pb-1">Spot</button>
              <button className="text-gray-400 text-sm hover:text-white">Options</button>
            </div>
          </div>

          {/* Trading Pairs */}
          <div className="px-4 space-y-2 mb-6 max-h-[300px] overflow-y-auto flex-shrink-0">
            {filteredTradingPairs.length > 0 ? (
              filteredTradingPairs.map((pair, index) => (
                <div
                  key={index}
                  onClick={() => handlePairSelect(pair.rawSymbol)}
                  className={`flex items-center justify-between p-2 hover:bg-[#1a1b2e] rounded cursor-pointer transition-colors ${
                    selectedSymbol === pair.rawSymbol ? 'bg-blue-600/20 border border-blue-500/30' : ''
                  }`}
                >
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
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                <div className="text-sm">No coins found</div>
                <div className="text-xs mt-1">Try searching for BTC, ETH, SOL, etc.</div>
              </div>
            )}
          </div>

          {/* Latest Transactions - Full remaining height */}
          <div className="flex-1 flex flex-col min-h-0 border-t border-gray-700">
            <div className="px-4 py-3 flex-shrink-0">
              <div className="text-white font-medium text-sm">Latest transaction</div>
            </div>

            {/* Column Headers */}
            <div className="px-4 py-2 border-b border-gray-700 flex-shrink-0">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Time</span>
                <span>Price (USDT)</span>
                <span>Amount</span>
              </div>
            </div>

            {/* Scrollable Transaction List */}
            <div className="flex-1 overflow-y-auto px-4">
              <div className="space-y-1 py-2">
                {[
                  { time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: formattedPrice, amount: '0.0080', type: 'buy' },
                  { time: new Date(Date.now() - 1000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: formattedPrice, amount: '0.0001700', type: 'buy' },
                  { time: new Date(Date.now() - 2000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: formattedPrice, amount: '0.1000', type: 'sell' },
                  { time: new Date(Date.now() - 3000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: formattedPrice, amount: '0.0004200', type: 'buy' },
                  { time: new Date(Date.now() - 5000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: formattedPrice, amount: '0.0047', type: 'sell' },
                  { time: new Date(Date.now() - 6000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: formattedPrice, amount: '0.0016', type: 'buy' },
                  { time: new Date(Date.now() - 7000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.00070000', type: 'sell' },
                  { time: new Date(Date.now() - 8000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0243', type: 'buy' },
                  { time: new Date(Date.now() - 9000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.01).toFixed(2), amount: '0.0089', type: 'buy' },
                  { time: new Date(Date.now() - 10000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.01).toFixed(2), amount: '0.0156', type: 'sell' },
                  { time: new Date(Date.now() - 11000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.02).toFixed(2), amount: '0.0034', type: 'buy' },
                  { time: new Date(Date.now() - 12000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.02).toFixed(2), amount: '0.0078', type: 'sell' },
                  { time: new Date(Date.now() - 13000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.03).toFixed(2), amount: '0.0092', type: 'buy' },
                  { time: new Date(Date.now() - 14000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.03).toFixed(2), amount: '0.0067', type: 'sell' },
                  { time: new Date(Date.now() - 15000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.04).toFixed(2), amount: '0.0123', type: 'buy' },
                  { time: new Date(Date.now() - 16000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.04).toFixed(2), amount: '0.0045', type: 'sell' },
                  { time: new Date(Date.now() - 17000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.05).toFixed(2), amount: '0.0234', type: 'buy' },
                  { time: new Date(Date.now() - 18000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.05).toFixed(2), amount: '0.0087', type: 'sell' },
                  { time: new Date(Date.now() - 19000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.06).toFixed(2), amount: '0.0156', type: 'buy' },
                  { time: new Date(Date.now() - 20000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: (currentPrice - 0.06).toFixed(2), amount: '0.0098', type: 'sell' }
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
        </div>
      </div>

      {/* Full Width Order History Section */}
      <div className="bg-[#10121E] border-t border-gray-700 min-h-[300px]">
        {/* Tabs Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("open")}
                className={`pb-1 text-sm font-medium ${
                  activeTab === "open"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Open orders({openOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-1 text-sm font-medium ${
                  activeTab === "history"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Order history({orderHistory.length})
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-gray-400 text-sm">
              <input type="checkbox" className="rounded" />
              <span>Hide other trading pairs</span>
            </label>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 px-4 py-3 text-gray-400 text-xs font-medium border-b border-gray-700">
          <div>Trading pair</div>
          <div>Type</div>
          <div>Price</div>
          <div>Amount</div>
          <div>Total</div>
          <div>Status</div>
          <div>Time</div>
        </div>

        {/* Orders Content */}
        <div className="min-h-[200px]">
          {activeTab === 'open' ? (
            // Open Orders Tab
            openOrders.length > 0 ? (
              <div className="space-y-2">
                {openOrders.map((order) => (
                  <div key={order.id} className="grid grid-cols-7 gap-4 px-4 py-3 text-sm hover:bg-gray-800/50">
                    <div className="text-white">{order.symbol}</div>
                    <div className={`${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.type.toUpperCase()} / {order.orderType.toUpperCase()}
                    </div>
                    <div className="text-white">{order.price}</div>
                    <div className="text-white">{order.amount}</div>
                    <div className="text-white">{order.total}</div>
                    <div className="text-yellow-400">Pending</div>
                    <div className="text-gray-400">{order.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 mb-4 opacity-50">
                  <svg viewBox="0 0 64 64" className="w-full h-full text-gray-500">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">No open orders</div>
              </div>
            )
          ) : (
            // Order History Tab
            orderHistory.length > 0 ? (
              <div className="space-y-2">
                {orderHistory.map((order) => (
                  <div key={order.id} className="grid grid-cols-7 gap-4 px-4 py-3 text-sm hover:bg-gray-800/50">
                    <div className="text-white">{order.symbol}</div>
                    <div className={`${order.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.type.toUpperCase()} / {order.orderType.toUpperCase()}
                    </div>
                    <div className="text-white">${order.price}</div>
                    <div className="text-white">{order.amount}</div>
                    <div className="text-white">${order.total}</div>
                    <div className="text-green-400">Filled</div>
                    <div className="text-gray-400">{order.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 mb-4 opacity-50">
                  <svg viewBox="0 0 64 64" className="w-full h-full text-gray-500">
                    <path fill="currentColor" d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 44c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
                    <path fill="currentColor" d="M32 16c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16zm0 28c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z"/>
                    <circle fill="currentColor" cx="32" cy="32" r="4"/>
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">No order history</div>
              </div>
            )
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Wrapper component with PriceProvider for synchronized price data
export default function SpotPage() {
  return (
    <PriceProvider symbol="BTCUSDT" updateInterval={2000}>
      <SpotPageContent />
    </PriceProvider>
  );
}