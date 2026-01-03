var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { TrendingUp, TrendingDown, Search, BarChart3 } from "lucide-react";
export default function TradePage(_a) {
    var _this = this;
    var _b;
    var type = _a.type;
    var _c = useState(type || "spot"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = useState("BTCUSDT"), selectedPair = _d[0], setSelectedPair = _d[1];
    var _e = useState("market"), orderType = _e[0], setOrderType = _e[1];
    var _f = useState(""), amount = _f[0], setAmount = _f[1];
    var _g = useState(""), price = _g[0], setPrice = _g[1];
    var _h = useState("30s"), selectedDuration = _h[0], setSelectedDuration = _h[1];
    var _j = useState(false), isTrading = _j[0], setIsTrading = _j[1];
    var toast = useToast().toast;
    var user = useAuth().user;
    var queryClient = useQueryClient();
    var _k = useQuery({
        queryKey: ["/api/market-data"],
    }), marketData = _k.data, isLoading = _k.isLoading;
    var userBalances = useQuery({
        queryKey: ["/api/balances"],
        enabled: !!user,
    }).data;
    var activeTrades = useQuery({
        queryKey: ["/api/trades/active"],
        enabled: !!user,
        refetchInterval: 5000, // Refresh every 5 seconds
    }).data;
    var currentPairData = marketData === null || marketData === void 0 ? void 0 : marketData.find(function (item) { return item.symbol === selectedPair; });
    var usdtBalance = ((_b = userBalances === null || userBalances === void 0 ? void 0 : userBalances.find(function (b) { return b.symbol === 'USDT'; })) === null || _b === void 0 ? void 0 : _b.available) || '0';
    // Options trading mutation
    var optionsTradeMutation = useMutation({
        mutationFn: function (tradeData) { return __awaiter(_this, void 0, void 0, function () {
            var response, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/trades/options', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(__assign({ userId: user === null || user === void 0 ? void 0 : user.id, symbol: selectedPair }, tradeData)),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        error = _a.sent();
                        throw new Error(error.message || 'Failed to create trade');
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: 'Trade Created',
                description: "Options trade created successfully for $".concat(amount),
            });
            setAmount('');
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            queryClient.invalidateQueries({ queryKey: ['/api/trades/active'] });
        },
        onError: function (error) {
            toast({
                title: 'Trade Failed',
                description: error.message || 'Failed to create trade',
                variant: 'destructive',
            });
        },
    });
    var durations = [
        { value: "30s", label: "30s", percentage: "10%", seconds: 30, minAmount: 100 },
        { value: "60s", label: "60s", percentage: "15%", seconds: 60, minAmount: 1000 },
        { value: "120s", label: "120s", percentage: "20%", seconds: 120, minAmount: 5000 },
        { value: "180s", label: "180s", percentage: "25%", seconds: 180, minAmount: 10000 },
        { value: "240s", label: "240s", percentage: "30%", seconds: 240, minAmount: 15000 },
        { value: "300s", label: "300s", percentage: "35%", seconds: 300, minAmount: 20000 },
        { value: "600s", label: "600s", percentage: "40%", seconds: 600, minAmount: 50000 }
    ];
    var selectedDurationData = durations.find(function (d) { return d.value === selectedDuration; });
    // Handle options trading
    var handleOptionsTrade = function (direction) { return __awaiter(_this, void 0, void 0, function () {
        var tradeAmount, minAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user) {
                        toast({
                            title: 'Authentication Required',
                            description: 'Please log in to start trading',
                            variant: 'destructive',
                        });
                        return [2 /*return*/];
                    }
                    if (!amount || parseFloat(amount) <= 0) {
                        toast({
                            title: 'Invalid Amount',
                            description: 'Please enter a valid trade amount',
                            variant: 'destructive',
                        });
                        return [2 /*return*/];
                    }
                    tradeAmount = parseFloat(amount);
                    minAmount = (selectedDurationData === null || selectedDurationData === void 0 ? void 0 : selectedDurationData.minAmount) || 100;
                    if (tradeAmount < minAmount) {
                        toast({
                            title: 'Minimum Amount Required',
                            description: "Minimum amount for ".concat(selectedDuration, " is $").concat(minAmount),
                            variant: 'destructive',
                        });
                        return [2 /*return*/];
                    }
                    if (tradeAmount > parseFloat(usdtBalance)) {
                        toast({
                            title: 'Insufficient Balance',
                            description: 'You do not have enough USDT balance',
                            variant: 'destructive',
                        });
                        return [2 /*return*/];
                    }
                    setIsTrading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, optionsTradeMutation.mutateAsync({
                            direction: direction,
                            amount: amount,
                            duration: (selectedDurationData === null || selectedDurationData === void 0 ? void 0 : selectedDurationData.seconds) || 30,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsTrading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Set percentage of balance
    var setPercentageAmount = function (percentage) {
        var balance = parseFloat(usdtBalance);
        var newAmount = (balance * percentage / 100).toFixed(2);
        setAmount(newAmount);
    };
    var orderBookData = [
        { price: "118113.00", amount: "0.12345", total: "14567.89" },
        { price: "118112.50", amount: "0.23456", total: "27701.23" },
        { price: "118112.00", amount: "0.34567", total: "40834.56" },
        { price: "118111.50", amount: "0.45678", total: "53967.89" },
        { price: "118111.00", amount: "0.56789", total: "67101.23" },
    ];
    var tradeHistory = [
        { time: "14:30:15", price: "118113.00", amount: "0.12345", side: "buy" },
        { time: "14:30:14", price: "118112.50", amount: "0.23456", side: "sell" },
        { time: "14:30:13", price: "118112.00", amount: "0.34567", side: "buy" },
        { time: "14:30:12", price: "118111.50", amount: "0.45678", side: "sell" },
        { time: "14:30:11", price: "118111.00", amount: "0.56789", side: "buy" },
    ];
    return (<div className="min-h-screen bg-[#1a1b2e] pt-16">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">

        {/* Header with pair info */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-white">{selectedPair}</h1>
              <div className="flex items-center space-x-4 text-white">
                <span className="text-2xl font-bold">
                  ${(currentPairData === null || currentPairData === void 0 ? void 0 : currentPairData.price) ? parseFloat(currentPairData.price).toLocaleString() : '118113.00'}
                </span>
                <span className={"flex items-center ".concat(parseFloat((currentPairData === null || currentPairData === void 0 ? void 0 : currentPairData.priceChangePercent24h) || '0') >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {parseFloat((currentPairData === null || currentPairData === void 0 ? void 0 : currentPairData.priceChangePercent24h) || '0') >= 0 ? (<TrendingUp className="w-4 h-4 mr-1"/>) : (<TrendingDown className="w-4 h-4 mr-1"/>)}
                  {parseFloat((currentPairData === null || currentPairData === void 0 ? void 0 : currentPairData.priceChangePercent24h) || '0').toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                <Input placeholder="Search" className="pl-10 bg-[#2a2d47] border-gray-600 text-white w-64"/>
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
                  {orderBookData.map(function (order, index) { return (<div key={"sell-".concat(index)} className="grid grid-cols-3 text-red-400 hover:bg-[#1a1b2e]/50 p-1 rounded">
                      <span className="font-mono">{order.price}</span>
                      <span className="font-mono text-right">{order.amount}</span>
                      <span className="font-mono text-right">{order.total}</span>
                    </div>); })}

                  {/* Current price */}
                  <div className="py-2 text-center">
                    <span className="text-white font-bold text-lg">
                      $118113.00
                    </span>
                  </div>

                  {/* Buy orders */}
                  {orderBookData.reverse().map(function (order, index) { return (<div key={"buy-".concat(index)} className="grid grid-cols-3 text-green-400 hover:bg-[#1a1b2e]/50 p-1 rounded">
                      <span className="font-mono">{order.price}</span>
                      <span className="font-mono text-right">{order.amount}</span>
                      <span className="font-mono text-right">{order.total}</span>
                    </div>); })}
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
                  {tradeHistory.map(function (trade, index) { return (<div key={index} className={"grid grid-cols-3 hover:bg-[#1a1b2e]/50 p-1 rounded ".concat(trade.side === 'buy' ? 'text-green-400' : 'text-red-400')}>
                      <span className="text-gray-400">{trade.time}</span>
                      <span className="font-mono text-right">{trade.price}</span>
                      <span className="font-mono text-right">{trade.amount}</span>
                    </div>); })}
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
                    <BarChart3 className="w-16 h-16 mx-auto mb-4"/>
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
              <Button variant={activeTab === "spot" ? "default" : "outline"} size="sm" onClick={function () { return setActiveTab("spot"); }} className={activeTab === "spot"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0"
            : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"}>
                Spot
              </Button>
              <Button variant={activeTab === "options" ? "default" : "outline"} size="sm" onClick={function () { return setActiveTab("options"); }} className={activeTab === "options"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0"
            : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"}>
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
                      {durations.slice(0, 4).map(function (duration) { return (<Button key={duration.value} variant={selectedDuration === duration.value ? "default" : "outline"} size="sm" onClick={function () { return setSelectedDuration(duration.value); }} className={"text-xs ".concat(selectedDuration === duration.value
                    ? "bg-blue-600 text-white border-0"
                    : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700")}>
                          <div className="text-center">
                            <div>{duration.label}</div>
                            <div className="text-xs opacity-75">{duration.percentage}</div>
                          </div>
                        </Button>); })}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {durations.slice(4).map(function (duration) { return (<Button key={duration.value} variant={selectedDuration === duration.value ? "default" : "outline"} size="sm" onClick={function () { return setSelectedDuration(duration.value); }} className={"text-xs ".concat(selectedDuration === duration.value
                    ? "bg-blue-600 text-white border-0"
                    : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700")}>
                          <div className="text-center">
                            <div>{duration.label}</div>
                            <div className="text-xs opacity-75">{duration.percentage}</div>
                          </div>
                        </Button>); })}
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
                      <span className="text-yellow-400">${(selectedDurationData === null || selectedDurationData === void 0 ? void 0 : selectedDurationData.minAmount) || 100}</span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="text-gray-300 text-sm mb-2 block">Amount (USDT)</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[25, 50, 75, 100].map(function (percentage) { return (<Button key={percentage} variant="outline" size="sm" onClick={function () { return setPercentageAmount(percentage); }} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 text-xs">
                          {percentage}%
                        </Button>); })}
                    </div>
                    <Input type="number" placeholder="0" value={amount} onChange={function (e) { return setAmount(e.target.value); }} className="bg-[#1a1b2e] border-gray-600 text-white" min={(selectedDurationData === null || selectedDurationData === void 0 ? void 0 : selectedDurationData.minAmount) || 100}/>
                  </div>

                  {/* Buy/Sell Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={function () { return handleOptionsTrade('up'); }} disabled={isTrading || !user}>
                      {isTrading ? 'Processing...' : 'Buy Up'}
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={function () { return handleOptionsTrade('down'); }} disabled={isTrading || !user}>
                      {isTrading ? 'Processing...' : 'Buy Down'}
                    </Button>
                  </div>
                </CardContent>
              </Card>) : (
        /* Spot Trading Interface */
        <Card className="bg-[#2a2d47] border-gray-600">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-4">Spot Trading</h3>
                  
                  {/* Order Type */}
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      {['market', 'limit'].map(function (type) { return (<Button key={type} variant={orderType === type ? "default" : "outline"} size="sm" onClick={function () { return setOrderType(type); }} className={orderType === type
                    ? "bg-blue-600 text-white border-0"
                    : "bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>); })}
                    </div>
                  </div>

                  {/* Price Input (for limit orders) */}
                  {orderType === 'limit' && (<div className="mb-4">
                      <label className="text-gray-300 text-sm mb-2 block">Price (USDT)</label>
                      <Input type="number" placeholder="0.00" value={price} onChange={function (e) { return setPrice(e.target.value); }} className="bg-[#1a1b2e] border-gray-600 text-white"/>
                    </div>)}

                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="text-gray-300 text-sm mb-2 block">Amount (BTC)</label>
                    <Input type="number" placeholder="0.00" value={amount} onChange={function (e) { return setAmount(e.target.value); }} className="bg-[#1a1b2e] border-gray-600 text-white"/>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {['25%', '50%', '75%', '100%'].map(function (percentage) { return (<Button key={percentage} variant="outline" size="sm" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 text-xs">
                          {percentage}
                        </Button>); })}
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
              </Card>)}

            {/* Active Trades */}
            <Card className="bg-[#2a2d47] border-gray-600">
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-4">Active Trades</h3>
                {activeTrades && activeTrades.length > 0 ? (<div className="space-y-2">
                    {activeTrades.map(function (trade) { return (<div key={trade.id} className="bg-[#1a1b2e]/50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-medium">{trade.symbol}</span>
                          <Badge variant={trade.direction === 'up' ? 'default' : 'destructive'} className={trade.direction === 'up' ? 'bg-green-600' : 'bg-red-600'}>
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-300">
                          <div>Amount: ${parseFloat(trade.amount).toFixed(2)}</div>
                          <div>Entry: ${parseFloat(trade.entryPrice || '0').toFixed(2)}</div>
                          <div>Duration: {trade.duration}s</div>
                        </div>
                      </div>); })}
                  </div>) : (<div className="text-center py-8">
                    <div className="w-16 h-16 bg-[#1a1b2e] rounded-full mx-auto mb-4 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-500"/>
                    </div>
                    <p className="text-gray-400 text-sm">No active trades</p>
                  </div>)}
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
                  {['Open Orders', 'Order History', 'Trade History'].map(function (tab) { return (<Button key={tab} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      {tab}
                    </Button>); })}
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Hide other trading pairs
                </Button>
              </div>

              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#1a1b2e] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-500"/>
                </div>
                <p className="text-gray-400">No data</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
