import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketData {
  id: string;
  symbol: string;
  price: string;
  priceChange24h: string;
  priceChangePercent24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
  timestamp: string;
}

interface OptionsSettings {
  id: string;
  duration: number;
  minAmount: string;
  profitPercentage: string;
  isActive: boolean;
}

interface ActiveTrade {
  id: string;
  symbol: string;
  type: string;
  direction: string;
  amount: string;
  price: string;
  duration: number;
  expiresAt: string;
  status: string;
  profit?: string;
}

export default function TradingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();
  
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [tradeAmount, setTradeAmount] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<string>('0');
  
  // Fetch market data
  const { data: marketData } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
    refetchInterval: 5000,
  });

  // Fetch options settings
  const { data: optionsSettings } = useQuery<OptionsSettings[]>({
    queryKey: ['/api/options-settings'],
  });

  // Fetch user's active trades
  const { data: activeTrades } = useQuery<ActiveTrade[]>({
    queryKey: ['/api/trades/active'],
    enabled: !!user,
  });

  // Fetch user balances
  const { data: balances } = useQuery({
    queryKey: ['/api/balances'],
    enabled: !!user,
  });

  // Create trade mutation
  const createTradeMutation = useMutation({
    mutationFn: async (tradeData: {
      symbol: string;
      type: 'options';
      direction: 'up' | 'down';
      amount: string;
      duration: number;
    }) => {
      console.log('🎯 TRADING PAGE: Placing trade with data:', tradeData);
      console.log('🎯 TRADING PAGE: User ID:', user?.id);
      console.log('🎯 TRADING PAGE: Auth token:', localStorage.getItem('authToken')?.substring(0, 30) + '...');

      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: user?.id,
          symbol: tradeData.symbol,
          type: tradeData.type,
          direction: tradeData.direction,
          amount: tradeData.amount,
          duration: tradeData.duration
        })
      });

      console.log('🎯 TRADING PAGE: Response status:', response.status);

      if (!response.ok) {
        const error = await response.text();
        console.error('🎯 TRADING PAGE: Error response:', error);
        throw new Error(error || 'Failed to place trade');
      }

      const result = await response.json();
      console.log('🎯 TRADING PAGE: Success response:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Trade Placed Successfully',
        description: 'Your binary options trade has been placed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/trades/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      setTradeAmount('');
    },
    onError: (error) => {
      toast({
        title: 'Trade Failed',
        description: error.message || 'Failed to place trade.',
        variant: 'destructive',
      });
    },
  });

  // Update price from WebSocket
  useEffect(() => {
    if (lastMessage?.type === 'price_update' && lastMessage.data) {
      const data = lastMessage.data;
      if (data.symbol === selectedSymbol) {
        setCurrentPrice(data.price);
      }
    }
  }, [lastMessage, selectedSymbol]);

  // Set initial price from market data
  useEffect(() => {
    if (marketData) {
      const symbolData = marketData.find(d => d.symbol === selectedSymbol);
      if (symbolData) {
        setCurrentPrice(symbolData.price);
      }
    }
  }, [marketData, selectedSymbol]);

  // Countdown timer for active trades
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTrades) {
        const now = new Date().getTime();
        activeTrades.forEach(trade => {
          const expiresAt = new Date(trade.expiresAt).getTime();
          const timeLeft = Math.max(0, expiresAt - now);
          if (timeLeft === 0) {
            queryClient.invalidateQueries({ queryKey: ['/api/trades/active'] });
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrades, queryClient]);

  const selectedMarketData = marketData?.find(d => d.symbol === selectedSymbol);
  const availableSettings = optionsSettings?.filter(s => s.isActive) || [];
  const selectedSettings = availableSettings.find(s => s.duration === selectedDuration);
  const usdtBalance = Array.isArray(balances) ? balances.find((b: any) => b.symbol === 'USDT') : null;

  const handlePlaceTrade = (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to place trades.',
        variant: 'destructive',
      });
      return;
    }

    if (!tradeAmount || parseFloat(tradeAmount) < parseFloat(selectedSettings?.minAmount || '0')) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum amount is ${selectedSettings?.minAmount} USDT`,
        variant: 'destructive',
      });
      return;
    }

    createTradeMutation.mutate({
      symbol: selectedSymbol,
      type: 'options',
      direction,
      amount: tradeAmount,
      duration: selectedDuration,
    });
  };

  const getTimeLeft = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const timeLeft = Math.max(0, expires - now);
    const seconds = Math.floor(timeLeft / 1000);
    return seconds;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            METACHROME Binary Options Trading
          </h1>
          <p className="text-gray-300">
            Trade binary options with customizable durations and admin-controlled outcomes
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Trading Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Selection */}
            <Card className="bg-slate-800/90 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Market Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketData?.map((market) => (
                    <Button
                      key={market.symbol}
                      variant={selectedSymbol === market.symbol ? "default" : "outline"}
                      className={`p-4 h-auto flex flex-col items-start ${
                        selectedSymbol === market.symbol 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-slate-700/50 hover:bg-slate-700'
                      }`}
                      onClick={() => setSelectedSymbol(market.symbol)}
                    >
                      <div className="font-semibold text-white">
                        {market.symbol.replace('USDT', '/USDT')}
                      </div>
                      <div className="text-sm text-gray-300">
                        ${parseFloat(market.price).toLocaleString()}
                      </div>
                      <div className={`text-xs flex items-center gap-1 ${
                        parseFloat(market.priceChangePercent24h) >= 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {parseFloat(market.priceChangePercent24h) >= 0 ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {parseFloat(market.priceChangePercent24h).toFixed(2)}%
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Price Display */}
            <Card className="bg-slate-800/90 border-purple-500/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {selectedSymbol.replace('USDT', '/USDT')}
                  </div>
                  <div className="text-4xl font-bold text-purple-400 mb-4">
                    ${parseFloat(currentPrice).toLocaleString()}
                  </div>
                  {selectedMarketData && (
                    <div className={`flex items-center justify-center gap-2 ${
                      parseFloat(selectedMarketData.priceChangePercent24h) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {parseFloat(selectedMarketData.priceChangePercent24h) >= 0 ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                      <span className="font-semibold">
                        {parseFloat(selectedMarketData.priceChangePercent24h).toFixed(2)}% 
                        (${parseFloat(selectedMarketData.priceChange24h).toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trading Form */}
            <Card className="bg-slate-800/90 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Place Binary Options Trade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration
                    </label>
                    <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(parseInt(value))}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {availableSettings.map((setting) => (
                          <SelectItem key={setting.id} value={setting.duration.toString()}>
                            {setting.duration} seconds - Min: ${setting.minAmount} - Profit: {setting.profitPercentage}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount (USDT)
                    </label>
                    <Input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-slate-700 border-slate-600 text-white"
                      min={selectedSettings?.minAmount || "0"}
                      step="0.01"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Min: ${selectedSettings?.minAmount || '0'} | 
                      Available: ${usdtBalance?.available || '0'}
                    </div>
                  </div>
                </div>

                {selectedSettings && (
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                      <div>
                        <span className="font-medium">Profit Percentage:</span> {selectedSettings.profitPercentage}%
                      </div>
                      <div>
                        <span className="font-medium">Potential Profit:</span> ${
                          tradeAmount 
                            ? (parseFloat(tradeAmount) * parseFloat(selectedSettings.profitPercentage) / 100).toFixed(2)
                            : '0.00'
                        }
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handlePlaceTrade('up')}
                    disabled={createTradeMutation.isPending || !user}
                    className="bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold"
                  >
                    <ArrowUp className="w-5 h-5 mr-2" />
                    UP / CALL
                  </Button>
                  <Button
                    onClick={() => handlePlaceTrade('down')}
                    disabled={createTradeMutation.isPending || !user}
                    className="bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-semibold"
                  >
                    <ArrowDown className="w-5 h-5 mr-2" />
                    DOWN / PUT
                  </Button>
                </div>

                {!user && (
                  <div className="text-center text-yellow-400">
                    Please login to place trades
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Trades Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-800/90 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Active Trades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTrades && activeTrades.length > 0 ? (
                  activeTrades.map((trade) => {
                    const timeLeft = getTimeLeft(trade.expiresAt);
                    const progress = ((trade.duration - timeLeft) / trade.duration) * 100;
                    
                    return (
                      <div key={trade.id} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-white">
                              {trade.symbol.replace('USDT', '/USDT')}
                            </div>
                            <div className="text-sm text-gray-300">
                              ${trade.amount} USDT
                            </div>
                          </div>
                          <Badge 
                            variant={trade.direction === 'up' ? 'default' : 'destructive'}
                            className={trade.direction === 'up' ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Time Left:</span>
                            <span className="text-white font-mono">
                              {formatTime(timeLeft)}
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Entry Price:</span>
                            <span className="text-white">${parseFloat(trade.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    No active trades
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Balance Card */}
            {user && (
              <Card className="bg-slate-800/90 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Account Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    ${usdtBalance?.available || '0.00'} USDT
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Locked: ${usdtBalance?.locked || '0.00'} USDT
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}