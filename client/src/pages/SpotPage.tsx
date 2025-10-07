import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "../components/ui/navigation";
import { Footer } from "../components/ui/footer";
import { MobileBottomNav } from "../components/ui/mobile-bottom-nav";
import { Button } from "../components/ui/button";
import LightweightChart from "../components/LightweightChart";
import { PriceProvider, usePrice, usePriceChange, use24hStats } from "../contexts/PriceContext";
import { useAuth } from "../hooks/useAuth";
import { useWebSocket } from "../hooks/useWebSocket";
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

  // Use price context for synchronized price data
  const { priceData } = usePrice();
  const { changeText, changeColor, isPositive } = usePriceChange();
  const { high, low, volume } = use24hStats();

  // Debug logging
  useEffect(() => {
    console.log('🔍 SpotPage mounted');
    console.log('🔍 User:', user);
    console.log('💰 SpotPage - Price from context:', priceData?.price);
    return () => {
      console.log('🔍 SpotPage unmounted');
    };
  }, [user, priceData]);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("open"); // "open" or "history"
  const [mobileTradeTab, setMobileTradeTab] = useState("buy"); // "buy" or "sell" for mobile
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  // Price State
  const [currentPrice, setCurrentPrice] = useState<number>(166373.87);
  const [realTimePrice, setRealTimePrice] = useState<string>('');
  const [priceChange, setPriceChange] = useState<string>('+0.50%');

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

  // Fetch user balances with real-time refetch
  const { data: balances } = useQuery({
    queryKey: ['/api/user/balances', user?.id],
    enabled: !!user,
    refetchInterval: 2000, // Very fast refetch for real-time sync
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
    queryFn: async () => {
      const url = user?.id ? `/api/user/balances?userId=${user.id}` : '/api/user/balances';
      console.log('🔍 SPOT: Fetching balance from:', url, 'for user:', user?.id);
      const response = await apiRequest('GET', url);
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

  // Get available balances - FIXED parsing logic
  let usdtBalance = 0;
  let btcBalance = 0.5; // Default BTC balance

  if (balances) {
    // Try multiple parsing strategies to handle different API response formats
    if (balances.USDT?.available) {
      // Format: { USDT: { available: "10420", ... } }
      usdtBalance = Number(balances.USDT.available);
    } else if (Array.isArray(balances.balances)) {
      // Format: { balances: [{ currency: "USDT", balance: 10420 }, ...] }
      const usdtData = balances.balances.find((b: any) => b.currency === 'USDT' || b.symbol === 'USDT');
      usdtBalance = Number(usdtData?.balance || usdtData?.available || 0);
    } else if (Array.isArray(balances)) {
      // Format: [{ currency: "USDT", balance: 10420 }, ...]
      const usdtData = balances.find((b: any) => b.currency === 'USDT' || b.symbol === 'USDT');
      usdtBalance = Number(usdtData?.balance || usdtData?.available || 0);
    } else if (balances['0']?.currency === 'USDT') {
      // Format: { "0": { currency: "USDT", balance: 10420 }, ... }
      usdtBalance = Number(balances['0'].balance || balances['0'].available || 0);
    }

    // Parse BTC balance similarly
    if (balances.BTC?.available) {
      btcBalance = Number(balances.BTC.available);
    } else if (Array.isArray(balances.balances)) {
      const btcData = balances.balances.find((b: any) => b.currency === 'BTC' || b.symbol === 'BTC');
      btcBalance = Number(btcData?.balance || btcData?.available || 0.5);
    } else if (Array.isArray(balances)) {
      const btcData = balances.find((b: any) => b.currency === 'BTC' || b.symbol === 'BTC');
      btcBalance = Number(btcData?.balance || btcData?.available || 0.5);
    } else if (balances['1']?.currency === 'BTC') {
      btcBalance = Number(balances['1'].balance || balances['1'].available || 0.5);
    }
  }

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
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
      queryClient.removeQueries({ queryKey: ['/api/user/balances'] });

      // Force immediate refetch with a small delay to ensure cache is cleared
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/user/balances', user?.id] });
        queryClient.refetchQueries({ queryKey: ['/api/user/balances'] });
      }, 100);
    }
  }, [lastMessage, queryClient, user?.id]);

  // Fetch Binance price data - PRIMARY SOURCE (TradingView widget can't provide real prices due to CORS)
  const fetchBinancePrice = async () => {
    try {
      const response = await fetch('/api/market-data');
      const data = await response.json();

      // Ensure data is an array before calling find
      if (Array.isArray(data)) {
        const btcData = data.find((item: any) => item.symbol === selectedSymbol);
        if (btcData) {
          const price = parseFloat(btcData.price);

          // Update ALL price states from Binance API (single source of truth)
          setRealTimePrice(btcData.price);
          setPriceChange(btcData.priceChange24h);
          setCurrentPrice(price);

          // Update form prices if not manually set
          if (!buyPrice) setBuyPrice(btcData.price);
          if (!sellPrice) setSellPrice(btcData.price);

          console.log('📊 Binance price update (PRIMARY SOURCE):', price.toFixed(2));
        }
      } else {
        console.warn('Market data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching Binance price:', error);
    }
  };

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
      const response = await fetch('/api/spot/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          side: 'buy',
          symbol: selectedSymbol,
          userId: user?.id || 'user-1',
        }),
      });
      if (!response.ok) throw new Error('Failed to place buy order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spot/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      toast({ title: "Buy order placed successfully!" });
      // Reset form
      setBuyAmount('');
      setBuyPercentage(0);
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
      const response = await fetch('/api/spot/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          side: 'sell',
          symbol: selectedSymbol,
          userId: user?.id || 'user-1',
        }),
      });
      if (!response.ok) throw new Error('Failed to place sell order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/spot/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });
      toast({ title: "Sell order placed successfully!" });
      // Reset form
      setSellAmount('');
      setSellPercentage(0);
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

      // Invalidate and refetch balance data to ensure UI sync - use exact query key pattern
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/balances'] });

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

  // Initialize real-time price fetching
  useEffect(() => {
    fetchBinancePrice(); // Initial fetch

    // Check if we're on Vercel (no WebSocket support)
    const isVercel = window.location.hostname.includes('vercel.app');
    const updateInterval = isVercel ? 3000 : 6000; // Faster updates on Vercel since no WebSocket

    const interval = setInterval(fetchBinancePrice, updateInterval);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Update current price from real market data - RE-ENABLED (Binance is the primary source)
  useEffect(() => {
    if (realPrice > 0 && !realTimePrice) {
      setCurrentPrice(realPrice);
      console.log('📈 Real Price Update:', realPrice.toFixed(2));
    }
  }, [realPrice, realTimePrice]);

  // Initialize price fields when current price is available
  useEffect(() => {
    if (currentPrice > 0) {
      if (!buyPrice) setBuyPrice(currentPrice.toFixed(2));
      if (!sellPrice) setSellPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, buyPrice, sellPrice]);

  // Generate dynamic order book data based on current price
  const generateOrderBookData = (basePrice: number) => {
    // Safety check for valid price
    const safeBasePrice = (basePrice && !isNaN(basePrice) && basePrice > 0) ? basePrice : 166373.87;

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
        <Navigation />

        {/* Mobile Header - Using TradingView Price */}
        <div className="bg-[#10121E] px-4 py-2 border-b border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-lg">BTC/USDT</div>
              <div className="text-white text-xl font-bold">${currentPrice > 0 ? currentPrice.toFixed(2) : (realTimePrice || '0.00')}</div>
              <div className={`text-sm font-semibold ${priceChange?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                {priceChange || btcMarketData?.priceChangePercent24h || '+0.50%'}
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

        {/* Mobile Chart - Vertical/Tall Layout */}
        <div className="bg-[#10121E] relative w-full" style={{ height: 'calc(100vh - 140px)', minHeight: '700px' }}>
          <div className="w-full h-full">
            <LightweightChart
              symbol="BTCUSDT"
              interval="1m"
              height="100%"
              containerId="spot_mobile_chart"
            />
          </div>
        </div>

        {/* Compact Bottom Trading Panel */}
        <div className="fixed bottom-20 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-4">
          <div className="text-center">
            <div className="text-white font-bold text-lg mb-2">
              BTC/USDT: ${currentPrice > 0 ? currentPrice.toFixed(2) : (realTimePrice || '0.00')}
            </div>
            <div className="text-gray-400 text-sm">
              Spot Trading • Real-time Price
            </div>
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
      <div className="bg-[#10121E] flex min-h-screen">
        {/* Left and Center Content */}
        <div className="flex-1">
          {/* Top Header with BTC/USDT and Controls */}
          <div className="bg-[#10121E] px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {/* Left - BTC/USDT Info - Using TradingView Price */}
              <div className="flex items-center space-x-6">
                <div>
                  <div className="text-white font-bold text-lg">BTC/USDT</div>
                  <div className="text-white text-2xl font-bold">${currentPrice > 0 ? currentPrice.toFixed(2) : (realTimePrice || '0.00')}</div>
                  <div className="text-gray-400 text-sm">$ {currentPrice > 0 ? currentPrice.toFixed(2) : (realTimePrice || '0.00')}</div>
                </div>
                <div className={`text-lg font-semibold ${priceChange?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {priceChange || btcMarketData?.priceChangePercent24h || '+0.50%'}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <div className="text-gray-400">Change 24h</div>
                    <div className="text-white">597.01 0.50%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">24h High</div>
                    <div className="text-white">119558.19</div>
                  </div>
                  <div>
                    <div className="text-gray-400">24h Low</div>
                    <div className="text-white">117204.65</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Volume 24h (BTC)</div>
                    <div className="text-white">681.35</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Turnover 24h (USDT)</div>
                    <div className="text-white">80520202.92</div>
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
              <div className="text-white font-bold text-lg">BTC/USDT</div>
              <div className="text-right">
                <div className="text-green-400 font-bold">118113.00</div>
                <div className="text-green-400 text-sm">Change 24h</div>
                <div className="text-green-400 text-sm">597.01 0.50%</div>
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

          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-2 p-2 text-xs text-gray-400 border-b border-gray-700">
            <span>Price (USDT)</span>
            <span>Volume (BTC)</span>
            <span>Turnover</span>
          </div>

          {/* Order Book Data */}
          <div className="flex-1 min-h-[650px] overflow-y-auto">
            {/* Sell Orders (Red) - Using TradingView Price */}
            <div className="space-y-0">
              {generateOrderBookData(currentPrice > 0 ? currentPrice : (parseFloat(realTimePrice) || 166373.87)).sellOrders.map((order, index) => (
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
                <span className={`font-bold text-lg ${priceChange?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {currentPrice > 0 ? currentPrice.toFixed(2) : (realTimePrice || '0.00')}
                </span>
                <span className={`${priceChange?.startsWith('-') ? 'text-red-400' : 'text-green-400'}`}>
                  {priceChange?.startsWith('-') ? '↓' : '↑'}
                </span>
                <span className="text-gray-400 text-sm">${currentPrice > 0 ? currentPrice.toFixed(2) : (realTimePrice || '0.00')}</span>
              </div>
            </div>

            {/* Buy Orders (Green) - Using TradingView Price */}
            <div className="space-y-0">
              {generateOrderBookData(currentPrice > 0 ? currentPrice : (parseFloat(realTimePrice) || 166373.87)).buyOrders.map((order, index) => (
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
          {/* Chart Controls */}
          <div className="bg-[#10121E] p-2">
            <div className="flex items-center justify-end">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button className="text-xs text-gray-400 hover:text-white">Basic version</button>
                  <button className="text-xs text-gray-400 hover:text-white">Trading view</button>
                  <button className="text-xs text-gray-400 hover:text-white">Depth</button>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chart Area - Lightweight Charts with Binance Data */}
          <div className="min-h-[500px] flex-1 bg-[#10121E] p-2">
            <LightweightChart
              symbol="BTCUSDT"
              interval="1m"
              height={500}
              containerId="spot_desktop_chart"
            />
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
                        placeholder={currentPrice.toFixed(2)}
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
                        placeholder={currentPrice.toFixed(2)}
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
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            {[
              { symbol: 'BTC/USDT', coin: 'BTC', price: currentPrice.toFixed(2), change: priceChange || '+1.47%', isPositive: !priceChange?.startsWith('-'), icon: '₿', iconBg: 'bg-orange-500' },
              { symbol: 'ETH/USDT', coin: 'ETH', price: '3550.21', change: '+1.06%', isPositive: true, icon: 'Ξ', iconBg: 'bg-purple-500' },
              { symbol: 'BNB/USDT', coin: 'BNB', price: '698.45', change: '+2.15%', isPositive: true, icon: 'B', iconBg: 'bg-yellow-600' },
              { symbol: 'SOL/USDT', coin: 'SOL', price: '245.67', change: '+3.42%', isPositive: true, icon: 'S', iconBg: 'bg-purple-600' },
              { symbol: 'XRP/USDT', coin: 'XRP', price: '3.18', change: '+1.47%', isPositive: true, icon: '✕', iconBg: 'bg-gray-600' },
              { symbol: 'ADA/USDT', coin: 'ADA', price: '0.8272', change: '+0.60%', isPositive: true, icon: 'A', iconBg: 'bg-blue-500' },
              { symbol: 'DOGE/USDT', coin: 'DOGE', price: '0.2388', change: '+0.80%', isPositive: true, icon: 'D', iconBg: 'bg-yellow-500' },
              { symbol: 'MATIC/USDT', coin: 'MATIC', price: '0.5234', change: '+1.23%', isPositive: true, icon: 'M', iconBg: 'bg-purple-700' },
              { symbol: 'DOT/USDT', coin: 'DOT', price: '7.89', change: '-0.45%', isPositive: false, icon: '●', iconBg: 'bg-pink-500' },
              { symbol: 'AVAX/USDT', coin: 'AVAX', price: '42.56', change: '+2.78%', isPositive: true, icon: 'A', iconBg: 'bg-red-500' }
            ].map((pair, index) => (
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
            ))}
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
                  { time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0080', type: 'buy' },
                  { time: new Date(Date.now() - 1000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0001700', type: 'buy' },
                  { time: new Date(Date.now() - 2000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.1000', type: 'sell' },
                  { time: new Date(Date.now() - 3000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0004200', type: 'buy' },
                  { time: new Date(Date.now() - 5000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0047', type: 'sell' },
                  { time: new Date(Date.now() - 6000).toLocaleTimeString('en-US', { hour12: false }).slice(0, 8), price: currentPrice.toFixed(2), amount: '0.0016', type: 'buy' },
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
                Open orders(0)
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-1 text-sm font-medium ${
                  activeTab === "history"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Order history(0)
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
          {orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders
                .filter(order => activeTab === 'open' ? order.status === 'pending' : order.status !== 'pending')
                .map((order) => (
                  <div key={order.id} className="grid grid-cols-7 gap-4 px-4 py-3 text-sm hover:bg-gray-800/50">
                    <div className="text-white">{order.symbol}</div>
                    <div className={`${order.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {order.side.toUpperCase()} / {order.type.toUpperCase()}
                    </div>
                    <div className="text-white">{order.price || 'Market'}</div>
                    <div className="text-white">{order.amount}</div>
                    <div className="text-white">{order.total}</div>
                    <div className={`${
                      order.status === 'filled' ? 'text-green-400' :
                      order.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                    <div className="text-gray-400">{new Date(order.createdAt).toLocaleString()}</div>
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
              <div className="text-gray-400 text-sm">No {activeTab === 'open' ? 'open orders' : 'order history'}</div>
            </div>
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