var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';
export default function TradingPage() {
    var _this = this;
    var user = useAuth().user;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var lastMessage = useWebSocket().lastMessage;
    var _a = useState('BTCUSDT'), selectedSymbol = _a[0], setSelectedSymbol = _a[1];
    var _b = useState(30), selectedDuration = _b[0], setSelectedDuration = _b[1];
    var _c = useState(''), tradeAmount = _c[0], setTradeAmount = _c[1];
    var _d = useState(null), countdown = _d[0], setCountdown = _d[1];
    var _e = useState('0'), currentPrice = _e[0], setCurrentPrice = _e[1];
    // Fetch market data
    var marketData = useQuery({
        queryKey: ['/api/market-data'],
        refetchInterval: 5000,
    }).data;
    // Fetch options settings
    var optionsSettings = useQuery({
        queryKey: ['/api/options-settings'],
    }).data;
    // Fetch user's active trades
    var activeTrades = useQuery({
        queryKey: ['/api/trades/active'],
        enabled: !!user,
    }).data;
    // Fetch user balances
    var balances = useQuery({
        queryKey: ['/api/balances'],
        enabled: !!user,
    }).data;
    // Create trade mutation
    var createTradeMutation = useMutation({
        mutationFn: function (tradeData) { return __awaiter(_this, void 0, void 0, function () {
            var response, error, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🎯 TRADING PAGE: Placing trade with data:', tradeData);
                        console.log('🎯 TRADING PAGE: User ID:', user === null || user === void 0 ? void 0 : user.id);
                        console.log('🎯 TRADING PAGE: Auth token:', ((_a = localStorage.getItem('authToken')) === null || _a === void 0 ? void 0 : _a.substring(0, 30)) + '...');
                        return [4 /*yield*/, fetch('/api/trades', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                },
                                body: JSON.stringify({
                                    userId: user === null || user === void 0 ? void 0 : user.id,
                                    symbol: tradeData.symbol,
                                    type: tradeData.type,
                                    direction: tradeData.direction,
                                    amount: tradeData.amount,
                                    duration: tradeData.duration
                                })
                            })];
                    case 1:
                        response = _b.sent();
                        console.log('🎯 TRADING PAGE: Response status:', response.status);
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        error = _b.sent();
                        console.error('🎯 TRADING PAGE: Error response:', error);
                        throw new Error(error || 'Failed to place trade');
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _b.sent();
                        console.log('🎯 TRADING PAGE: Success response:', result);
                        return [2 /*return*/, result];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: 'Trade Placed Successfully',
                description: 'Your binary options trade has been placed.',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/trades/active'] });
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            setTradeAmount('');
        },
        onError: function (error) {
            toast({
                title: 'Trade Failed',
                description: error.message || 'Failed to place trade.',
                variant: 'destructive',
            });
        },
    });
    // Update price from WebSocket
    useEffect(function () {
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'price_update' && lastMessage.data) {
            var data = lastMessage.data;
            if (data.symbol === selectedSymbol) {
                setCurrentPrice(data.price);
            }
        }
    }, [lastMessage, selectedSymbol]);
    // Set initial price from market data
    useEffect(function () {
        if (marketData) {
            var symbolData = marketData.find(function (d) { return d.symbol === selectedSymbol; });
            if (symbolData) {
                setCurrentPrice(symbolData.price);
            }
        }
    }, [marketData, selectedSymbol]);
    // Countdown timer for active trades
    useEffect(function () {
        var interval = setInterval(function () {
            if (activeTrades) {
                var now_1 = new Date().getTime();
                activeTrades.forEach(function (trade) {
                    var expiresAt = new Date(trade.expiresAt).getTime();
                    var timeLeft = Math.max(0, expiresAt - now_1);
                    if (timeLeft === 0) {
                        queryClient.invalidateQueries({ queryKey: ['/api/trades/active'] });
                    }
                });
            }
        }, 1000);
        return function () { return clearInterval(interval); };
    }, [activeTrades, queryClient]);
    var selectedMarketData = marketData === null || marketData === void 0 ? void 0 : marketData.find(function (d) { return d.symbol === selectedSymbol; });
    var availableSettings = (optionsSettings === null || optionsSettings === void 0 ? void 0 : optionsSettings.filter(function (s) { return s.isActive; })) || [];
    var selectedSettings = availableSettings.find(function (s) { return s.duration === selectedDuration; });
    var usdtBalance = Array.isArray(balances) ? balances.find(function (b) { return b.symbol === 'USDT'; }) : null;
    var handlePlaceTrade = function (direction) {
        if (!user) {
            toast({
                title: 'Login Required',
                description: 'Please login to place trades.',
                variant: 'destructive',
            });
            return;
        }
        if (!tradeAmount || parseFloat(tradeAmount) < parseFloat((selectedSettings === null || selectedSettings === void 0 ? void 0 : selectedSettings.minAmount) || '0')) {
            toast({
                title: 'Invalid Amount',
                description: "Minimum amount is ".concat(selectedSettings === null || selectedSettings === void 0 ? void 0 : selectedSettings.minAmount, " USDT"),
                variant: 'destructive',
            });
            return;
        }
        createTradeMutation.mutate({
            symbol: selectedSymbol,
            type: 'options',
            direction: direction,
            amount: tradeAmount,
            duration: selectedDuration,
        });
    };
    var getTimeLeft = function (expiresAt) {
        var now = new Date().getTime();
        var expires = new Date(expiresAt).getTime();
        var timeLeft = Math.max(0, expires - now);
        var seconds = Math.floor(timeLeft / 1000);
        return seconds;
    };
    var formatTime = function (seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return "".concat(mins, ":").concat(secs.toString().padStart(2, '0'));
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
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
                  <TrendingUp className="w-5 h-5 text-purple-400"/>
                  Market Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketData === null || marketData === void 0 ? void 0 : marketData.map(function (market) { return (<Button key={market.symbol} variant={selectedSymbol === market.symbol ? "default" : "outline"} className={"p-4 h-auto flex flex-col items-start ".concat(selectedSymbol === market.symbol
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-slate-700/50 hover:bg-slate-700')} onClick={function () { return setSelectedSymbol(market.symbol); }}>
                      <div className="font-semibold text-white">
                        {market.symbol.replace('USDT', '/USDT')}
                      </div>
                      <div className="text-sm text-gray-300">
                        ${parseFloat(market.price).toLocaleString()}
                      </div>
                      <div className={"text-xs flex items-center gap-1 ".concat(parseFloat(market.priceChangePercent24h) >= 0
                ? 'text-green-400'
                : 'text-red-400')}>
                        {parseFloat(market.priceChangePercent24h) >= 0 ? (<ArrowUp className="w-3 h-3"/>) : (<ArrowDown className="w-3 h-3"/>)}
                        {parseFloat(market.priceChangePercent24h).toFixed(2)}%
                      </div>
                    </Button>); })}
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
                  {selectedMarketData && (<div className={"flex items-center justify-center gap-2 ".concat(parseFloat(selectedMarketData.priceChangePercent24h) >= 0
                ? 'text-green-400'
                : 'text-red-400')}>
                      {parseFloat(selectedMarketData.priceChangePercent24h) >= 0 ? (<TrendingUp className="w-5 h-5"/>) : (<TrendingDown className="w-5 h-5"/>)}
                      <span className="font-semibold">
                        {parseFloat(selectedMarketData.priceChangePercent24h).toFixed(2)}% 
                        (${parseFloat(selectedMarketData.priceChange24h).toFixed(2)})
                      </span>
                    </div>)}
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
                    <Select value={selectedDuration.toString()} onValueChange={function (value) { return setSelectedDuration(parseInt(value)); }}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {availableSettings.map(function (setting) { return (<SelectItem key={setting.id} value={setting.duration.toString()}>
                            {setting.duration} seconds - Min: ${setting.minAmount} - Profit: {setting.profitPercentage}%
                          </SelectItem>); })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount (USDT)
                    </label>
                    <Input type="number" value={tradeAmount} onChange={function (e) { return setTradeAmount(e.target.value); }} placeholder="Enter amount" className="bg-slate-700 border-slate-600 text-white" min={(selectedSettings === null || selectedSettings === void 0 ? void 0 : selectedSettings.minAmount) || "0"} step="0.01"/>
                    <div className="text-xs text-gray-400 mt-1">
                      Min: ${(selectedSettings === null || selectedSettings === void 0 ? void 0 : selectedSettings.minAmount) || '0'} | 
                      Available: ${(usdtBalance === null || usdtBalance === void 0 ? void 0 : usdtBalance.available) || '0'}
                    </div>
                  </div>
                </div>

                {selectedSettings && (<div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                      <div>
                        <span className="font-medium">Profit Percentage:</span> {selectedSettings.profitPercentage}%
                      </div>
                      <div>
                        <span className="font-medium">Potential Profit:</span> ${tradeAmount
                ? (parseFloat(tradeAmount) * parseFloat(selectedSettings.profitPercentage) / 100).toFixed(2)
                : '0.00'}
                      </div>
                    </div>
                  </div>)}

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={function () { return handlePlaceTrade('up'); }} disabled={createTradeMutation.isPending || !user} className="bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold">
                    <ArrowUp className="w-5 h-5 mr-2"/>
                    UP / CALL
                  </Button>
                  <Button onClick={function () { return handlePlaceTrade('down'); }} disabled={createTradeMutation.isPending || !user} className="bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-semibold">
                    <ArrowDown className="w-5 h-5 mr-2"/>
                    DOWN / PUT
                  </Button>
                </div>

                {!user && (<div className="text-center text-yellow-400">
                    Please login to place trades
                  </div>)}
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
                {activeTrades && activeTrades.length > 0 ? (activeTrades.map(function (trade) {
            var timeLeft = getTimeLeft(trade.expiresAt);
            var progress = ((trade.duration - timeLeft) / trade.duration) * 100;
            return (<div key={trade.id} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-white">
                              {trade.symbol.replace('USDT', '/USDT')}
                            </div>
                            <div className="text-sm text-gray-300">
                              ${trade.amount} USDT
                            </div>
                          </div>
                          <Badge variant={trade.direction === 'up' ? 'default' : 'destructive'} className={trade.direction === 'up' ? 'bg-green-600' : 'bg-red-600'}>
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
                          <Progress value={progress} className="h-2"/>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Entry Price:</span>
                            <span className="text-white">${parseFloat(trade.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>);
        })) : (<div className="text-gray-400 text-center py-8">
                    No active trades
                  </div>)}
              </CardContent>
            </Card>

            {/* Balance Card */}
            {user && (<Card className="bg-slate-800/90 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Account Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    ${(usdtBalance === null || usdtBalance === void 0 ? void 0 : usdtBalance.available) || '0.00'} USDT
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Locked: ${(usdtBalance === null || usdtBalance === void 0 ? void 0 : usdtBalance.locked) || '0.00'} USDT
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>);
}
