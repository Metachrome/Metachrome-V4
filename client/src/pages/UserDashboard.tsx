import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { Link } from 'wouter';
import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  CreditCard,
  History,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  MessageSquare,
  Send,
  Paperclip
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for UI controls
  const [showBalance, setShowBalance] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [paymentMethod, setPaymentMethod] = useState('crypto');

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Fetch user balances (real data)
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['/api/balances'],
    enabled: !!user?.id,
  });

  // Fetch user trades (real data)
  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ['/api/trades'],
    enabled: !!user?.id,
  });

  // Fetch user transactions (real data)
  const { data: transactions } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user?.id,
  });

  // Fetch real market data
  const { data: marketData } = useQuery({
    queryKey: ['/api/market-data'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch user chat messages
  const { data: userMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['userMessages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/messages/${user.id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      return data.messages || []; // Extract messages array from response
    },
    enabled: !!user?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      console.log('🟢 User sending message:', { message, userId: user?.id });
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message,
          userId: user?.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      const data = await response.json();
      console.log('🟢 User message response:', data);
      return data;
    },
    onSuccess: async () => {
      console.log('🟢 User message sent successfully, refreshing chat...');
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to support.',
      });
      setChatMessage('');
      
      // Add a small delay to ensure database write is completed
      setTimeout(async () => {
        // Force refetch the messages
        await refetchMessages();
        queryClient.invalidateQueries({ queryKey: ['userMessages', user?.id] });
        console.log('🟢 User chat refreshed');
      }, 100);
    },
    onError: (error: any) => {
      console.error('🔴 User message failed:', error);
      toast({
        title: 'Message Failed',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  // Top-up mutation (real data)
  const topUpMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: string; method: string }) => {
      const response = await fetch('/api/transactions/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          method: data.method,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Top-up failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Top-up Successful',
        description: `Successfully added ${topUpAmount} ${selectedCurrency} to your account. New balance: ${data.newBalance}`,
      });
      setTopUpAmount('');
      // Refresh all related data
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Top-up Failed',
        description: error.message || 'Failed to process top-up',
        variant: 'destructive',
      });
    },
  });

  // Process real market data for display
  const processedMarketData = marketData?.map(data => ({
    symbol: data.symbol,
    price: parseFloat(data.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    change: `${parseFloat(data.change24h) >= 0 ? '+' : ''}${parseFloat(data.change24h).toFixed(2)}%`,
    isPositive: parseFloat(data.change24h) >= 0,
    rawPrice: parseFloat(data.price),
  })) || [];

  // Calculate balances using real market prices
  const getMarketPrice = (symbol: string): number => {
    if (symbol === 'USDT') return 1;
    const marketItem = processedMarketData.find(item => item.symbol === `${symbol}USDT`);
    return marketItem ? marketItem.rawPrice : 0;
  };

  const totalBalance = balances?.reduce((sum: number, balance: any) => {
    const price = getMarketPrice(balance.symbol);
    return sum + parseFloat(balance.available || '0') * price;
  }, 0) || 0;

  const lockedBalance = balances?.reduce((sum: number, balance: any) => {
    const price = getMarketPrice(balance.symbol);
    return sum + parseFloat(balance.locked || '0') * price;
  }, 0) || 0;

  const recentTrades = trades?.slice(0, 5) || [];
  const recentTransactions = transactions?.slice(0, 3) || [];

  // Calculate win rate
  const completedTrades = trades?.filter((t: any) => t.status === 'completed') || [];
  const winningTrades = completedTrades.filter((t: any) => parseFloat(t.profit || '0') > 0);
  const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length * 100).toFixed(1) : '0';

  const handleTopUp = () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    topUpMutation.mutate({
      amount: topUpAmount,
      currency: selectedCurrency,
      method: paymentMethod,
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) {
      toast({
        title: 'Invalid Message',
        description: 'Please enter a message.',
        variant: 'destructive',
      });
      return;
    }
    sendMessageMutation.mutate(chatMessage.trim());
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400">
            Here's your trading overview and account summary.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Portfolio Value
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  Available: ${showBalance ? (totalBalance - lockedBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••'}
                </p>
                {lockedBalance > 0 && (
                  <p className="text-xs text-yellow-400">
                    Locked: ${showBalance ? lockedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Trades Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active Trades
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {tradesLoading ? <RefreshCw className="h-6 w-6 animate-spin" /> : (trades?.filter((t: any) => t.status === 'active').length || 0)}
              </div>
              <p className="text-xs text-gray-400">
                Currently running
              </p>
              {trades?.filter((t: any) => t.status === 'active').length > 0 && (
                <Badge variant="secondary" className="mt-2 bg-blue-600/20 text-blue-400">
                  {trades?.filter((t: any) => t.status === 'active').length} positions
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Total Trades Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Trades
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {tradesLoading ? <RefreshCw className="h-6 w-6 animate-spin" /> : (trades?.length || 0)}
              </div>
              <p className="text-xs text-gray-400">
                All time
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-600/20 text-green-400 text-xs">
                  {winningTrades.length} wins
                </Badge>
                <Badge variant="secondary" className="bg-red-600/20 text-red-400 text-xs">
                  {completedTrades.length - winningTrades.length} losses
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Win Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {winRate}%
              </div>
              <p className="text-xs text-gray-400">
                Success rate
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(parseFloat(winRate), 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Start trading or manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/trading">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Start Binary Options Trading
                </Button>
              </Link>
              <Link href="/trade/spot">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Spot Trading
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Market Overview */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Market Overview</CardTitle>
              <CardDescription className="text-gray-400">
                Top trading pairs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedMarketData.map((market) => (
                  <div key={market.symbol} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{market.symbol}</div>
                      <div className="text-sm text-gray-400">${market.price}</div>
                    </div>
                    <div className={`flex items-center ${market.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {market.isPositive ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">{market.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/market">
                <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700">
                  View All Markets
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Deposit-Style Balance Section */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Deposit
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account deposits and balances
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Top Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Funds to Your Account</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="amount" className="text-gray-300">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="BTC">BTC</SelectItem>
                            <SelectItem value="ETH">ETH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="method" className="text-gray-300">Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="crypto">Cryptocurrency</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleTopUp}
                        disabled={topUpMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {topUpMutation.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Add Funds
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Deposit Network Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deposit network
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USDT">USDT-ERC</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                </select>
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deposit amount
                </label>
                <input
                  type="text"
                  placeholder="Please enter the recharge amount"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Recharge Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recharge address
                </label>
                <div className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                  <span className="text-white text-sm font-mono flex-1">
                    0x3BC095D473398033496F94a1a1a3A7084c
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-purple-400 hover:text-purple-300 p-1"
                    onClick={() => {
                      navigator.clipboard.writeText('0x3BC095D473398033496F94a1a1a3A7084c');
                      toast({
                        title: "Copied!",
                        description: "Address copied to clipboard",
                      });
                    }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                  </Button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  QR wallet address
                </label>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <div className="w-32 h-32 bg-black">
                    {/* QR Code placeholder - in real app, generate actual QR code */}
                    <svg viewBox="0 0 128 128" className="w-full h-full">
                      <rect width="128" height="128" fill="white"/>
                      <g fill="black">
                        <rect x="0" y="0" width="8" height="8"/>
                        <rect x="16" y="0" width="8" height="8"/>
                        <rect x="32" y="0" width="8" height="8"/>
                        <rect x="48" y="0" width="8" height="8"/>
                        <rect x="64" y="0" width="8" height="8"/>
                        <rect x="80" y="0" width="8" height="8"/>
                        <rect x="96" y="0" width="8" height="8"/>
                        <rect x="112" y="0" width="8" height="8"/>
                        <rect x="0" y="16" width="8" height="8"/>
                        <rect x="32" y="16" width="8" height="8"/>
                        <rect x="64" y="16" width="8" height="8"/>
                        <rect x="96" y="16" width="8" height="8"/>
                        <rect x="112" y="16" width="8" height="8"/>
                        <rect x="16" y="32" width="8" height="8"/>
                        <rect x="48" y="32" width="8" height="8"/>
                        <rect x="80" y="32" width="8" height="8"/>
                        <rect x="0" y="48" width="8" height="8"/>
                        <rect x="32" y="48" width="8" height="8"/>
                        <rect x="64" y="48" width="8" height="8"/>
                        <rect x="96" y="48" width="8" height="8"/>
                        <rect x="16" y="64" width="8" height="8"/>
                        <rect x="48" y="64" width="8" height="8"/>
                        <rect x="80" y="64" width="8" height="8"/>
                        <rect x="112" y="64" width="8" height="8"/>
                        <rect x="0" y="80" width="8" height="8"/>
                        <rect x="32" y="80" width="8" height="8"/>
                        <rect x="64" y="80" width="8" height="8"/>
                        <rect x="96" y="80" width="8" height="8"/>
                        <rect x="16" y="96" width="8" height="8"/>
                        <rect x="48" y="96" width="8" height="8"/>
                        <rect x="80" y="96" width="8" height="8"/>
                        <rect x="0" y="112" width="8" height="8"/>
                        <rect x="32" y="112" width="8" height="8"/>
                        <rect x="64" y="112" width="8" height="8"/>
                        <rect x="96" y="112" width="8" height="8"/>
                        <rect x="112" y="112" width="8" height="8"/>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload receipt
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Click to upload receipt</p>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                onClick={() => {
                  toast({
                    title: "Deposit Confirmed",
                    description: "Your deposit request has been submitted for processing.",
                  });
                }}
              >
                Confirm recharge
              </Button>
            </CardContent>
          </Card>

          {/* Enhanced Recent Trades */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Trades
              </CardTitle>
              <CardDescription className="text-gray-400">
                Your latest trading activity and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tradesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : recentTrades.length > 0 ? (
                  recentTrades.map((trade: any) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          trade.direction === 'up' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {trade.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-white">{trade.symbol}</div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(trade.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={trade.status === 'completed' ?
                              (parseFloat(trade.profit || '0') > 0 ? 'default' : 'destructive') :
                              'secondary'
                            }
                            className={
                              trade.status === 'completed' ?
                                (parseFloat(trade.profit || '0') > 0 ? 'bg-green-600' : 'bg-red-600') :
                                'bg-yellow-600'
                            }
                          >
                            {trade.status === 'completed' ?
                              (parseFloat(trade.profit || '0') > 0 ? 'WIN' : 'LOSS') :
                              trade.status.toUpperCase()
                            }
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400">${parseFloat(trade.amount).toFixed(2)}</div>
                        {trade.profit && (
                          <div className={`text-xs font-medium ${parseFloat(trade.profit) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {parseFloat(trade.profit) > 0 ? '+' : ''}${parseFloat(trade.profit).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <div className="text-gray-400 mb-4">No trades yet</div>
                    <p className="text-sm text-gray-500 mb-4">Start trading to see your activity here</p>
                    <Link href="/trading">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Start Trading
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              {recentTrades.length > 0 && (
                <Link href="/wallet/history">
                  <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700">
                    <History className="h-4 w-4 mr-2" />
                    View All Trades
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription className="text-gray-400">
                Deposits, withdrawals, and transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'deposit' ? 'bg-green-600/20 text-green-400' :
                          transaction.type === 'withdrawal' ? 'bg-red-600/20 text-red-400' :
                          'bg-blue-600/20 text-blue-400'
                        }`}>
                          {transaction.type === 'deposit' ? <Download className="h-4 w-4" /> :
                           transaction.type === 'withdrawal' ? <Upload className="h-4 w-4" /> :
                           <RefreshCw className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-white capitalize">{transaction.type}</div>
                          <div className="text-sm text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-400' :
                          transaction.type === 'withdrawal' ? 'text-red-400' : 'text-blue-400'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : transaction.type === 'withdrawal' ? '-' : ''}
                          ${parseFloat(transaction.amount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">{transaction.currency || 'USDT'}</div>
                        <Badge
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className={`text-xs ${
                            transaction.status === 'completed' ? 'bg-green-600' :
                            transaction.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <div className="text-gray-400 mb-4">No transactions yet</div>
                    <p className="text-sm text-gray-500">Your deposits and withdrawals will appear here</p>
                  </div>
                )}
              </div>
              {recentTransactions.length > 0 && (
                <Link href="/wallet/history">
                  <Button variant="outline" className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700">
                    <History className="h-4 w-4 mr-2" />
                    View All Transactions
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Chat Support */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Support Chat
              </CardTitle>
              <CardDescription className="text-gray-400">
                Get help from our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showChat} onOpenChange={setShowChat}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Open Chat
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Support Chat</DialogTitle>
                    <CardDescription className="text-gray-400">
                      Chat with our support team for assistance
                    </CardDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Chat Messages */}
                    <div className="bg-slate-700/50 rounded-lg p-4 h-64 overflow-y-auto space-y-3">
                      {userMessages && userMessages.length > 0 ? (
                        userMessages.map((msg: any) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-2 rounded-lg max-w-xs ${
                              msg.sender === 'admin'
                                ? 'bg-purple-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}>
                              <div className="text-sm">{msg.message}</div>
                              <div className={`text-xs mt-1 ${
                                msg.sender === 'admin' ? 'text-purple-200' : 'text-blue-200'
                              }`}>
                                {msg.sender === 'admin' ? 'Support' : 'You'} • {new Date(msg.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <div className="text-sm">No messages yet. Start a conversation!</div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <Label className="text-gray-300">Send a message</Label>
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full h-20 bg-slate-700 border-slate-600 text-white rounded-md p-3 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                            <Paperclip className="w-4 h-4 mr-2" />
                            Attach
                          </Button>
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={handleSendMessage}
                          disabled={sendMessageMutation.isPending || !chatMessage.trim()}
                        >
                          {sendMessageMutation.isPending ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Quick Support Actions */}
              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-400 mb-2">Quick actions:</div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
                    onClick={() => {
                      setChatMessage("Hello, I need help with my account balance.");
                      setShowChat(true);
                    }}
                  >
                    💰 Account Balance Issue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
                    onClick={() => {
                      setChatMessage("I'm having trouble with a deposit.");
                      setShowChat(true);
                    }}
                  >
                    🏦 Deposit Problem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
                    onClick={() => {
                      setChatMessage("I need help with trading.");
                      setShowChat(true);
                    }}
                  >
                    📈 Trading Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
