import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { TrendingUp, TrendingDown, Search, BarChart3 } from "lucide-react";
import type { MarketData } from "../../../shared/schema";

interface TradePageProps {
  type?: "spot" | "options";
}

export default function TradePage({ type }: TradePageProps) {
  const [activeTab, setActiveTab] = useState(type || "spot");
  const [selectedPair, setSelectedPair] = useState("BTCUSDT");
  const [orderType, setOrderType] = useState("market");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("30s");
  const [isTrading, setIsTrading] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: marketData, isLoading } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data"],
  });

  const { data: userBalances } = useQuery({
    queryKey: ["/api/balances"],
    enabled: !!user,
  });

  const { data: activeTrades } = useQuery({
    queryKey: ["/api/trades/active"],
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const currentPairData = marketData?.find(item => item.symbol === selectedPair);
  const usdtBalance = userBalances?.find((b: any) => b.symbol === 'USDT')?.available || '0';

  // Options trading mutation
  const optionsTradeMutation = useMutation({
    mutationFn: async (tradeData: {
      direction: 'up' | 'down';
      amount: string;
      duration: number;
    }) => {
      const response = await fetch('/api/trades/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          symbol: selectedPair,
          ...tradeData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create trade');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Trade Created',
        description: `Options trade created successfully for $${amount}`,
      });
      setAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades/active'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Trade Failed',
        description: error.message || 'Failed to create trade',
        variant: 'destructive',
      });
    },
  });
  
  const durations = [
    { value: "30s", label: "30s", percentage: "10%", seconds: 30, minAmount: 100 },
    { value: "60s", label: "60s", percentage: "15%", seconds: 60, minAmount: 1000 },
    { value: "120s", label: "120s", percentage: "20%", seconds: 120, minAmount: 5000 },
    { value: "180s", label: "180s", percentage: "25%", seconds: 180, minAmount: 10000 },
    { value: "240s", label: "240s", percentage: "30%", seconds: 240, minAmount: 15000 },
    { value: "300s", label: "300s", percentage: "35%", seconds: 300, minAmount: 20000 },
    { value: "600s", label: "600s", percentage: "40%", seconds: 600, minAmount: 50000 }
  ];

  const selectedDurationData = durations.find(d => d.value === selectedDuration);

  // Handle options trading
  const handleOptionsTrade = async (direction: 'up' | 'down') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to start trading',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid trade amount',
        variant: 'destructive',
      });
      return;
    }

    const tradeAmount = parseFloat(amount);
    const minAmount = selectedDurationData?.minAmount || 100;

    if (tradeAmount < minAmount) {
      toast({
        title: 'Minimum Amount Required',
        description: `Minimum amount for ${selectedDuration} is $${minAmount}`,
        variant: 'destructive',
      });
      return;
    }

    if (tradeAmount > parseFloat(usdtBalance)) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough USDT balance',
        variant: 'destructive',
      });
      return;
    }

    setIsTrading(true);
    try {
      await optionsTradeMutation.mutateAsync({
        direction,
        amount,
        duration: selectedDurationData?.seconds || 30,
      });
    } finally {
      setIsTrading(false);
    }
  };

  // Set percentage of balance
  const setPercentageAmount = (percentage: number) => {
    const balance = parseFloat(usdtBalance);
    const newAmount = (balance * percentage / 100).toFixed(2);
    setAmount(newAmount);
  };

  const orderBookData = [
    { price: "118113.00", amount: "0.12345", total: "14567.89" },
    { price: "118112.50", amount: "0.23456", total: "27701.23" },
    { price: "118112.00", amount: "0.34567", total: "40834.56" },
    { price: "118111.50", amount: "0.45678", total: "53967.89" },
    { price: "118111.00", amount: "0.56789", total: "67101.23" },
  ];

  const tradeHistory = [
    { time: "14:30:15", price: "118113.00", amount: "0.12345", side: "buy" },
    { time: "14:30:14", price: "118112.50", amount: "0.23456", side: "sell" },
    { time: "14:30:13", price: "118112.00", amount: "0.34567", side: "buy" },
    { time: "14:30:12", price: "118111.50", amount: "0.45678", side: "sell" },
    { time: "14:30:11", price: "118111.00", amount: "0.56789", side: "buy" },
  ];

  return (
    <div className="min-h-screen bg-[#1a1b2e] pt-16">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">

        {/* Header with pair info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-white">{selectedPair}</h1>
              <div className="flex items-center space-x-4 text-white">
                <span className="text-2xl font-bold">
                  ${currentPairData?.price ? parseFloat(currentPairData.price).toLocaleString() : '118113.00'}
                </span>
                <span className={`flex items-center ${
                  parseFloat(currentPairData?.priceChangePercent24h || '0') >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {parseFloat(currentPairData?.priceChangePercent24h || '0') >= 0 ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {parseFloat(currentPairData?.priceChangePercent24h || '0').toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search"
                  className="pl-10 bg-[#2a2d47] border-gray-600 text-white w-64"
                />
              </div>
            </div>
          </div>


        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[calc(100vh-200px)]">

          {/* Left Panel - Order Book & Trade History */}
          <div className="lg:col-span-3 space-y-4 order-3 lg:order-1">
            
            {/* Order Book */}
            <Card className="bg-[#2a2d47] border-gray-600 h-1/2">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Order Book</h3>
                <div className="space-y-1 text-sm">
                  <div className="grid grid-cols-3 text-gray-400 mb-2">
                    <span>Price</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Total</span>
                  </div>
                  {/* Sell orders */}
                  {orderBookData.map((order, index) => (
                    <div key={`sell-${index}`} className="grid grid-cols-3 text-red-400 hover:bg-[#1a1b2e]/50 p-1 rounded">
                      <span className="font-mono">{order.price}</span>
                      <span className="font-mono text-right">{order.amount}</span>
                      <span className="font-mono text-right">{order.total}</span>
                    </div>
                  ))}

                  {/* Current price */}
                  <div className="py-2 text-center">
                    <span className="text-white font-bold text-lg">
                      $118113.00
                    </span>
                  </div>

                  {/* Buy orders */}
                  {orderBookData.reverse().map((order, index) => (
                    <div key={`buy-${index}`} className="grid grid-cols-3 text-green-400 hover:bg-[#1a1b2e]/50 p-1 rounded">
                      <span className="font-mono">{order.price}</span>
                      <span className="font-mono text-right">{order.amount}</span>
                      <span className="font-mono text-right">{order.total}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trade History */}
            <Card className="bg-[#2a2d47] border-gray-600 h-1/2">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Market Trades</h3>
                <div className="space-y-1 text-sm">
                  <div className="grid grid-cols-3 text-gray-400 mb-2">
                    <span>Time</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {tradeHistory.map((trade, index) => (
                    <div key={index} className={`grid grid-cols-3 hover:bg-[#1a1b2e]/50 p-1 rounded ${
                      trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <span className="text-gray-400">{trade.time}</span>
                      <span className="font-mono text-right">{trade.price}</span>
                      <span className="font-mono text-right">{trade.amount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Chart */}
          <div className="lg:col-span-6 order-2 lg:order-2">
            <Card className="bg-[#2a2d47] border-gray-600 h-64 lg:h-full">
              <CardContent className="p-4 h-full">
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                    <p>Chart will be displayed here</p>
                    <p className="text-sm mt-2">Real-time candlestick chart for {selectedPair}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Trading Interface */}
          <div className="lg:col-span-3 space-y-4 order-1 lg:order-3">
            
            {/* Trading Tabs */}
            <div className="flex space-x-2 mb-4">
              <Button
                variant={activeTab === "spot" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("spot")}
                className={activeTab === "spot" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0" 
                  : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                }
              >
                Spot
              </Button>
              <Button
                variant={activeTab === "options" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("options")}
                className={activeTab === "options" 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0" 
                  : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
                }
              >
                Options
              </Button>
            </div>

            {activeTab === "options" ? (
              /* Options Trading Interface */
              <Card className="bg-[#2a2d47] border-gray-600">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-4">Options Trading</h3>
                  
                  {/* Duration Selection */}
                  <div className="mb-6">
                    <label className="text-gray-300 text-sm mb-2 block">Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                      {durations.slice(0, 4).map((duration) => (
                        <Button
                          key={duration.value}
                          variant={selectedDuration === duration.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDuration(duration.value)}
                          className={`text-xs ${selectedDuration === duration.value 
                            ? "bg-blue-600 text-white border-0" 
                            : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          <div className="text-center">
                            <div>{duration.label}</div>
                            <div className="text-xs opacity-75">{duration.percentage}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {durations.slice(4).map((duration) => (
                        <Button
                          key={duration.value}
                          variant={selectedDuration === duration.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedDuration(duration.value)}
                          className={`text-xs ${selectedDuration === duration.value 
                            ? "bg-blue-600 text-white border-0" 
                            : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                          }`}
                        >
                          <div className="text-center">
                            <div>{duration.label}</div>
                            <div className="text-xs opacity-75">{duration.percentage}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Balance Display */}
                  <div className="mb-4 p-3 bg-[#1a1b2e]/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Available Balance:</span>
                      <span className="text-white font-semibold">${parseFloat(usdtBalance).toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-300">Min Amount ({selectedDuration}):</span>
                      <span className="text-yellow-400">${selectedDurationData?.minAmount || 100}</span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="text-gray-300 text-sm mb-2 block">Amount (USDT)</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[25, 50, 75, 100].map((percentage) => (
                        <Button
                          key={percentage}
                          variant="outline"
                          size="sm"
                          onClick={() => setPercentageAmount(percentage)}
                          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                        >
                          {percentage}%
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-[#1a1b2e] border-gray-600 text-white"
                      min={selectedDurationData?.minAmount || 100}
                    />
                  </div>

                  {/* Buy/Sell Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleOptionsTrade('up')}
                      disabled={isTrading || !user}
                    >
                      {isTrading ? 'Processing...' : 'Buy Up'}
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleOptionsTrade('down')}
                      disabled={isTrading || !user}
                    >
                      {isTrading ? 'Processing...' : 'Buy Down'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Spot Trading Interface */
              <Card className="bg-[#2a2d47] border-gray-600">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-4">Spot Trading</h3>
                  
                  {/* Order Type */}
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      {['market', 'limit'].map((type) => (
                        <Button
                          key={type}
                          variant={orderType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setOrderType(type)}
                          className={orderType === type 
                            ? "bg-blue-600 text-white border-0" 
                            : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                          }
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Input (for limit orders) */}
                  {orderType === 'limit' && (
                    <div className="mb-4">
                      <label className="text-gray-300 text-sm mb-2 block">Price (USDT)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-[#1a1b2e] border-gray-600 text-white"
                      />
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="text-gray-300 text-sm mb-2 block">Amount (BTC)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-[#1a1b2e] border-gray-600 text-white"
                    />
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {['25%', '50%', '75%', '100%'].map((percentage) => (
                        <Button
                          key={percentage}
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                        >
                          {percentage}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Buy/Sell Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Buy (BTC)
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Sell (BTC)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Trades */}
            <Card className="bg-[#2a2d47] border-gray-600">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Active Trades</h3>
                {activeTrades && activeTrades.length > 0 ? (
                  <div className="space-y-2">
                    {activeTrades.map((trade: any) => (
                      <div key={trade.id} className="bg-[#1a1b2e]/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{trade.symbol}</span>
                          <Badge
                            variant={trade.direction === 'up' ? 'default' : 'destructive'}
                            className={trade.direction === 'up' ? 'bg-green-600' : 'bg-red-600'}
                          >
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div>Amount: ${parseFloat(trade.amount).toFixed(2)}</div>
                          <div>Entry: ${parseFloat(trade.entryPrice || '0').toFixed(2)}</div>
                          <div>Duration: {trade.duration}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#1a1b2e] rounded-full mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm">No active trades</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Trading History Tables */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          <Card className="bg-[#2a2d47] border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-4">
                  {['Open Orders', 'Order History', 'Trade History'].map((tab) => (
                    <Button
                      key={tab}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      {tab}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  Hide other trading pairs
                </Button>
              </div>

              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#1a1b2e] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">No data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}