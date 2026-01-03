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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
function SpotPageContent(_a) {
    var _this = this;
    var selectedSymbol = _a.selectedSymbol, setSelectedSymbol = _a.setSelectedSymbol;
    var user = useAuth().user;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _b = useWebSocket(), lastMessage = _b.lastMessage, subscribe = _b.subscribe, connected = _b.connected, sendMessage = _b.sendMessage;
    var isMobile = useIsMobile();
    // UI State - Define first to avoid initialization order issues
    var _c = useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = useState("open"), activeTab = _d[0], setActiveTab = _d[1]; // "open" or "history"
    var _e = useState("buy"), mobileTradeTab = _e[0], setMobileTradeTab = _e[1]; // "buy" or "sell" for mobile
    // REMOVED: Limit order feature - only Market order now
    // const [orderType, setOrderType] = useState<'limit' | 'market'>('market');
    // Chart view state - Default to TradingView to match options page
    var _f = useState('tradingview'), chartView = _f[0], setChartView = _f[1];
    // Order management states
    var _g = useState([]), openOrders = _g[0], setOpenOrders = _g[1];
    var _h = useState([]), orderHistory = _h[0], setOrderHistory = _h[1];
    var hasLoadedInitialData = useRef(false);
    // Use price context for synchronized price data - SINGLE SOURCE OF TRUTH
    var priceData = usePrice().priceData;
    var _j = usePriceChange(), changeText = _j.changeText, changeColor = _j.changeColor, isPositive = _j.isPositive;
    var _k = use24hStats(), high = _k.high, low = _k.low, volume = _k.volume;
    // Multi-symbol price data for all trading pairs
    var _l = useMultiSymbolPrice(), multiSymbolPriceData = _l.priceData, getPriceForSymbol = _l.getPriceForSymbol, isPriceLoading = _l.isLoading;
    // Get current price for selected symbol (now selectedSymbol is defined)
    var selectedSymbolPriceData = getPriceForSymbol(selectedSymbol);
    var currentPrice = (selectedSymbolPriceData === null || selectedSymbolPriceData === void 0 ? void 0 : selectedSymbolPriceData.price) || (priceData === null || priceData === void 0 ? void 0 : priceData.price) || 0;
    var formattedPrice = currentPrice.toFixed(2);
    // Debug price data
    console.log('💰 Price Debug:', {
        selectedSymbol: selectedSymbol,
        selectedSymbolPriceData: selectedSymbolPriceData,
        currentPrice: currentPrice,
        formattedPrice: formattedPrice,
        priceData: priceData,
        isPriceLoading: isPriceLoading
    });
    // Helper function to get real price data for any symbol
    var getRealPriceData = function (rawSymbol) {
        var symbolData = getPriceForSymbol(rawSymbol);
        if (symbolData) {
            return {
                price: symbolData.price.toFixed(rawSymbol.includes('SHIB') ? 8 : 2),
                change: "".concat(symbolData.priceChangePercent24h >= 0 ? '+' : '').concat(symbolData.priceChangePercent24h.toFixed(2), "%"),
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
    useEffect(function () {
        console.log('🔍 SpotPage mounted');
        console.log('🔍 User:', user);
        console.log('💰 SpotPage - Price from context:', priceData === null || priceData === void 0 ? void 0 : priceData.price);
        console.log('💰 SpotPage - Selected symbol:', selectedSymbol);
        console.log('💰 SpotPage - Selected symbol price data:', selectedSymbolPriceData);
        console.log('💰 SpotPage - Current price:', currentPrice);
        return function () {
            console.log('🔍 SpotPage unmounted');
        };
    }, [user, priceData, selectedSymbol, selectedSymbolPriceData, currentPrice]);
    // Load initial mock order history only once
    useEffect(function () {
        if (user && !hasLoadedInitialData.current) {
            loadOrderHistory();
            hasLoadedInitialData.current = true;
        }
    }, [user]); // Only run when user changes, and only once
    // Load order history with persistence
    var loadOrderHistory = function () { return __awaiter(_this, void 0, void 0, function () {
        var savedOrders, parsedOrders, mockOrderHistory;
        return __generator(this, function (_a) {
            if (!user)
                return [2 /*return*/];
            try {
                savedOrders = localStorage.getItem("orderHistory_".concat(user.id || 'user-1'));
                if (savedOrders) {
                    parsedOrders = JSON.parse(savedOrders);
                    setOrderHistory(parsedOrders);
                    console.log('📋 Loaded order history from localStorage:', parsedOrders.length, 'orders');
                    return [2 /*return*/];
                }
                mockOrderHistory = [
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
                localStorage.setItem("orderHistory_".concat(user.id || 'user-1'), JSON.stringify(mockOrderHistory));
                console.log('📋 Created initial order history:', mockOrderHistory.length, 'orders');
            }
            catch (error) {
                console.error('❌ Error loading order history:', error);
            }
            return [2 /*return*/];
        });
    }); };
    // Save order history to localStorage whenever it changes
    var saveOrderHistory = function (orders) {
        if (!user)
            return;
        try {
            localStorage.setItem("orderHistory_".concat(user.id || 'user-1'), JSON.stringify(orders));
            console.log('💾 Saved order history to localStorage:', orders.length, 'orders');
        }
        catch (error) {
            console.error('❌ Error saving order history:', error);
        }
    };
    // Trading pairs data - All 19 supported currencies with real price data
    var tradingPairs = [
        __assign(__assign({ symbol: 'BTC/USDT', coin: 'BTC', rawSymbol: 'BTCUSDT' }, getRealPriceData('BTCUSDT')), { icon: '₿', iconBg: 'bg-orange-500' }),
        __assign(__assign({ symbol: 'ETH/USDT', coin: 'ETH', rawSymbol: 'ETHUSDT' }, getRealPriceData('ETHUSDT')), { icon: 'Ξ', iconBg: 'bg-purple-500' }),
        __assign(__assign({ symbol: 'XRP/USDT', coin: 'XRP', rawSymbol: 'XRPUSDT' }, getRealPriceData('XRPUSDT')), { icon: '✕', iconBg: 'bg-gray-600' }),
        __assign(__assign({ symbol: 'LTC/USDT', coin: 'LTC', rawSymbol: 'LTCUSDT' }, getRealPriceData('LTCUSDT')), { icon: 'Ł', iconBg: 'bg-gray-500' }),
        __assign(__assign({ symbol: 'BNB/USDT', coin: 'BNB', rawSymbol: 'BNBUSDT' }, getRealPriceData('BNBUSDT')), { icon: 'B', iconBg: 'bg-yellow-600' }),
        __assign(__assign({ symbol: 'SOL/USDT', coin: 'SOL', rawSymbol: 'SOLUSDT' }, getRealPriceData('SOLUSDT')), { icon: 'S', iconBg: 'bg-purple-600' }),
        __assign(__assign({ symbol: 'TON/USDT', coin: 'TON', rawSymbol: 'TONUSDT' }, getRealPriceData('TONUSDT')), { icon: 'T', iconBg: 'bg-blue-600' }),
        __assign(__assign({ symbol: 'DOGE/USDT', coin: 'DOGE', rawSymbol: 'DOGEUSDT' }, getRealPriceData('DOGEUSDT')), { icon: 'D', iconBg: 'bg-yellow-500' }),
        __assign(__assign({ symbol: 'ADA/USDT', coin: 'ADA', rawSymbol: 'ADAUSDT' }, getRealPriceData('ADAUSDT')), { icon: 'A', iconBg: 'bg-blue-500' }),
        __assign(__assign({ symbol: 'TRX/USDT', coin: 'TRX', rawSymbol: 'TRXUSDT' }, getRealPriceData('TRXUSDT')), { icon: '⚡', iconBg: 'bg-red-600' }),
        __assign(__assign({ symbol: 'LINK/USDT', coin: 'LINK', rawSymbol: 'LINKUSDT' }, getRealPriceData('LINKUSDT')), { icon: '🔗', iconBg: 'bg-blue-700' }),
        __assign(__assign({ symbol: 'AVAX/USDT', coin: 'AVAX', rawSymbol: 'AVAXUSDT' }, getRealPriceData('AVAXUSDT')), { icon: 'A', iconBg: 'bg-red-500' }),
        __assign(__assign({ symbol: 'DOT/USDT', coin: 'DOT', rawSymbol: 'DOTUSDT' }, getRealPriceData('DOTUSDT')), { icon: '●', iconBg: 'bg-pink-500' }),
        __assign(__assign({ symbol: 'POL/USDT', coin: 'POL', rawSymbol: 'POLUSDT' }, getRealPriceData('POLUSDT')), { icon: 'P', iconBg: 'bg-purple-700' }),
        __assign(__assign({ symbol: 'UNI/USDT', coin: 'UNI', rawSymbol: 'UNIUSDT' }, getRealPriceData('UNIUSDT')), { icon: '🦄', iconBg: 'bg-pink-600' }),
        __assign(__assign({ symbol: 'ATOM/USDT', coin: 'ATOM', rawSymbol: 'ATOMUSDT' }, getRealPriceData('ATOMUSDT')), { icon: '⚛', iconBg: 'bg-blue-600' }),
        __assign(__assign({ symbol: 'FIL/USDT', coin: 'FIL', rawSymbol: 'FILUSDT' }, getRealPriceData('FILUSDT')), { icon: 'F', iconBg: 'bg-gray-600' }),
        __assign(__assign({ symbol: 'ETC/USDT', coin: 'ETC', rawSymbol: 'ETCUSDT' }, getRealPriceData('ETCUSDT')), { icon: 'E', iconBg: 'bg-green-600' }),
        __assign(__assign({ symbol: 'XLM/USDT', coin: 'XLM', rawSymbol: 'XLMUSDT' }, getRealPriceData('XLMUSDT')), { icon: '⭐', iconBg: 'bg-indigo-500' })
    ];
    // Filter trading pairs based on search term
    var filteredTradingPairs = tradingPairs.filter(function (pair) {
        return pair.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pair.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    });
    // Get current selected pair data
    var currentPairData = tradingPairs.find(function (pair) { return pair.rawSymbol === selectedSymbol; }) || tradingPairs[0];
    // Handle trading pair selection
    var handlePairSelect = function (rawSymbol) {
        console.log('🔄 Selected trading pair:', rawSymbol);
        setSelectedSymbol(rawSymbol);
        // Clear search when a pair is selected
        setSearchTerm("");
    };
    // Handle search with auto-selection
    var handleSearchChange = function (value) {
        setSearchTerm(value);
        // Auto-select if search matches exactly one coin
        if (value.length > 0) {
            var exactMatches = tradingPairs.filter(function (pair) {
                return pair.coin.toLowerCase() === value.toLowerCase();
            });
            if (exactMatches.length === 1) {
                console.log('🎯 Auto-selecting exact match:', exactMatches[0].rawSymbol);
                setSelectedSymbol(exactMatches[0].rawSymbol);
            }
        }
    };
    // Handle symbol change from TradingView widget (like options page)
    var handleTradingViewSymbolChange = function (newSymbol) {
        console.log('📈 SPOT: TradingView symbol changed to:', newSymbol);
        console.log('📈 SPOT: Current selected symbol:', selectedSymbol);
        console.log('📈 SPOT: Available trading pairs:', tradingPairs.map(function (p) { return p.rawSymbol; }));
        // Convert TradingView symbol format to our format
        // e.g., "ETHUSDT" -> "ETHUSDT"
        var cleanSymbol = newSymbol.replace('BINANCE:', '').replace('COINBASE:', '');
        // Check if this symbol exists in our trading pairs
        var matchingPair = tradingPairs.find(function (pair) { return pair.rawSymbol === cleanSymbol; });
        console.log('📈 SPOT: Clean symbol:', cleanSymbol);
        console.log('📈 SPOT: Matching pair:', matchingPair);
        if (matchingPair) {
            console.log('✅ SPOT: Found matching pair:', matchingPair);
            setSelectedSymbol(cleanSymbol);
        }
        else {
            console.log('⚠️ SPOT: Symbol not found in trading pairs, keeping current:', selectedSymbol);
        }
    };
    // Legacy price states - REMOVED (now using PriceContext as single source of truth)
    // const [currentPrice, setCurrentPrice] = useState<number>(166373.87);
    // const [realTimePrice, setRealTimePrice] = useState<string>('');
    // const [priceChange, setPriceChange] = useState<string>('+0.50%');
    // Buy Form State
    var _m = useState(''), buyPrice = _m[0], setBuyPrice = _m[1];
    var _o = useState(''), buyAmount = _o[0], setBuyAmount = _o[1];
    var _p = useState(0), buyPercentage = _p[0], setBuyPercentage = _p[1];
    // Sell Form State
    var _q = useState(''), sellPrice = _q[0], setSellPrice = _q[1];
    var _r = useState(''), sellAmount = _r[0], setSellAmount = _r[1];
    var _s = useState(0), sellPercentage = _s[0], setSellPercentage = _s[1];
    // Turnover State
    var _t = useState(''), buyTurnover = _t[0], setBuyTurnover = _t[1];
    var _u = useState(''), sellTurnover = _u[0], setSellTurnover = _u[1];
    // Fetch user balances with real-time refetch - FIXED: Use same endpoint as Wallet page
    var balances = useQuery({
        queryKey: ['/api/balances'],
        enabled: !!user,
        refetchInterval: 2000, // Very fast refetch for real-time sync
        staleTime: 0, // Always consider data stale
        gcTime: 0, // Don't cache data (updated from cacheTime)
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, errorText, data;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🔍 SPOT: Fetching balance from /api/balances for user:', user === null || user === void 0 ? void 0 : user.id, user === null || user === void 0 ? void 0 : user.username);
                        console.log('🔍 SPOT: Auth token:', ((_a = localStorage.getItem('authToken')) === null || _a === void 0 ? void 0 : _a.substring(0, 30)) + '...');
                        return [4 /*yield*/, fetch('/api/balances', {
                                credentials: 'include', // Important: send session cookies
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _b.sent();
                        console.log('🔍 SPOT: Response status:', response.status, response.statusText);
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _b.sent();
                        console.error('❌ SPOT: Balance API failed:', response.status, errorText);
                        throw new Error("Failed to fetch balance: ".concat(response.status, " ").concat(errorText));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _b.sent();
                        console.log('🔍 SPOT: Balance API response:', data);
                        return [2 /*return*/, data];
                }
            });
        }); },
    }).data;
    // Fetch user orders
    var orders = useQuery({
        queryKey: ['/api/spot/orders'],
        enabled: !!user,
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/spot/orders')];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Failed to fetch orders');
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }).data;
    // Get user's main USDT balance directly from user object (single source of truth)
    var usdtBalance = (user === null || user === void 0 ? void 0 : user.balance) || 0;
    // Get cryptocurrency balance for selected symbol
    var getCryptoBalance = function (symbol) {
        if (!balances || !Array.isArray(balances)) {
            console.log('⚠️ SPOT: No balances data available');
            return 0;
        }
        var cryptoSymbol = symbol.replace('USDT', ''); // BTCUSDT -> BTC
        var cryptoData = balances.find(function (b) { return b.symbol === cryptoSymbol; });
        console.log('🔍 SPOT: Getting crypto balance for', cryptoSymbol, ':', {
            allBalances: balances,
            cryptoData: cryptoData,
            available: cryptoData === null || cryptoData === void 0 ? void 0 : cryptoData.available,
            parsed: parseFloat((cryptoData === null || cryptoData === void 0 ? void 0 : cryptoData.available) || '0')
        });
        return parseFloat((cryptoData === null || cryptoData === void 0 ? void 0 : cryptoData.available) || '0');
    };
    // Get balance for currently selected cryptocurrency
    var selectedCryptoSymbol = selectedSymbol.replace('USDT', ''); // BTCUSDT -> BTC
    var selectedCryptoBalance = getCryptoBalance(selectedSymbol);
    console.log('💰 SPOT: Selected crypto balance:', selectedCryptoSymbol, '=', selectedCryptoBalance);
    // Calculate USDT equivalent of selected crypto balance (real-time conversion)
    var selectedCryptoValueInUSDT = selectedCryptoBalance * currentPrice;
    // ENHANCED Debug logging for balance sync
    console.log('🔍 SPOT PAGE BALANCE DEBUG:', {
        'user.id': user === null || user === void 0 ? void 0 : user.id,
        'user.balance (USDT)': user === null || user === void 0 ? void 0 : user.balance,
        'usdtBalance': usdtBalance,
        'selectedSymbol': selectedSymbol,
        'selectedCryptoSymbol': selectedCryptoSymbol,
        'selectedCryptoBalance': selectedCryptoBalance,
        'currentPrice': currentPrice,
        'selectedCryptoValueInUSDT': selectedCryptoValueInUSDT,
        'balances': balances
    });
    // Subscribe to balance updates via WebSocket
    useEffect(function () {
        if (connected && (user === null || user === void 0 ? void 0 : user.id)) {
            // Subscribe to balance updates for this user
            sendMessage({
                type: 'subscribe_user_balance',
                userId: user.id
            });
            console.log('🔌 SPOT: Subscribed to balance updates for user:', user.id);
        }
    }, [connected, sendMessage, user === null || user === void 0 ? void 0 : user.id]);
    // Handle WebSocket balance updates for real-time sync
    useEffect(function () {
        var _a;
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'balance_update') {
            console.log('🔄 SPOT: Real-time balance update received:', lastMessage.data);
            console.log('🔄 SPOT: Current user ID:', user === null || user === void 0 ? void 0 : user.id, 'Update for user:', (_a = lastMessage.data) === null || _a === void 0 ? void 0 : _a.userId);
            // Aggressive cache invalidation - clear all balance-related queries
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
            queryClient.removeQueries({ queryKey: ['/api/balances'] });
            // Force immediate refetch with a small delay to ensure cache is cleared
            setTimeout(function () {
                queryClient.refetchQueries({ queryKey: ['/api/balances'] });
            }, 100);
        }
    }, [lastMessage, queryClient, user === null || user === void 0 ? void 0 : user.id]);
    // REMOVED: fetchBinancePrice - now using PriceContext as single source of truth
    // Fetch real market data
    var marketData = useQuery({
        queryKey: ['/api/market-data'],
        refetchInterval: 5000,
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch('/api/market-data')];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Failed to fetch market data');
                        }
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
    }).data;
    // Get current BTC price from real market data
    var btcMarketData = marketData === null || marketData === void 0 ? void 0 : marketData.find(function (item) { return item.symbol === selectedSymbol; });
    var realPrice = btcMarketData ? parseFloat(btcMarketData.price) : 0;
    // Order placement mutations
    var placeBuyOrderMutation = useMutation({
        mutationFn: function (orderData) { return __awaiter(_this, void 0, void 0, function () {
            var executionPrice, amount, total, response, errorData, result, newOrder;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(user === null || user === void 0 ? void 0 : user.id)) {
                            throw new Error('User not authenticated');
                        }
                        executionPrice = currentPrice;
                        amount = parseFloat(orderData.amount);
                        total = executionPrice * amount;
                        return [4 /*yield*/, fetch('/api/spot/orders', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                },
                                body: JSON.stringify({
                                    userId: user.id,
                                    symbol: selectedSymbol,
                                    side: 'buy',
                                    amount: amount,
                                    price: executionPrice,
                                    type: orderData.type || 'market'
                                })
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        errorData = _b.sent();
                        throw new Error(errorData.message || 'Failed to place buy order');
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _b.sent();
                        newOrder = {
                            id: ((_a = result.order) === null || _a === void 0 ? void 0 : _a.id) || Date.now().toString(),
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
                        return [2 /*return*/, { order: newOrder, executionPrice: executionPrice, amount: amount, total: total, apiResult: result }];
                }
            });
        }); },
        onSuccess: function (data) {
            var order = data.order, executionPrice = data.executionPrice, amount = data.amount, total = data.total, apiResult = data.apiResult;
            // Add to order history and save to localStorage
            setOrderHistory(function (prev) {
                var newHistory = __spreadArray([order], prev, true);
                saveOrderHistory(newHistory);
                return newHistory;
            });
            // Refresh balance data from server instead of manual calculation
            queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
            toast({
                title: "Buy order completed!",
                description: "Bought ".concat(amount.toFixed(6), " ").concat(selectedCryptoSymbol, " at ").concat(executionPrice.toFixed(2), " USDT. New balance: ").concat((usdtBalance - total).toFixed(2), " USDT"),
                duration: 5000
            });
            // Reset form
            setBuyAmount('');
            setBuyPercentage(0);
            console.log('✅ Buy order completed:', order);
        },
        onError: function (error) {
            toast({
                title: "Failed to place buy order",
                description: error.message,
                variant: "destructive"
            });
        },
    });
    var placeSellOrderMutation = useMutation({
        mutationFn: function (orderData) { return __awaiter(_this, void 0, void 0, function () {
            var executionPrice, amount, total, response, errorData, result, newOrder;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(user === null || user === void 0 ? void 0 : user.id)) {
                            throw new Error('User not authenticated');
                        }
                        executionPrice = currentPrice;
                        amount = parseFloat(orderData.amount);
                        total = executionPrice * amount;
                        return [4 /*yield*/, fetch('/api/spot/orders', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                },
                                body: JSON.stringify({
                                    userId: user.id,
                                    symbol: selectedSymbol,
                                    side: 'sell',
                                    amount: amount,
                                    price: executionPrice,
                                    type: orderData.type || 'market'
                                })
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        errorData = _b.sent();
                        throw new Error(errorData.message || 'Failed to place sell order');
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        result = _b.sent();
                        newOrder = {
                            id: ((_a = result.order) === null || _a === void 0 ? void 0 : _a.id) || Date.now().toString(),
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
                        return [2 /*return*/, { order: newOrder, executionPrice: executionPrice, amount: amount, total: total, apiResult: result }];
                }
            });
        }); },
        onSuccess: function (data) {
            var order = data.order, executionPrice = data.executionPrice, amount = data.amount, total = data.total, apiResult = data.apiResult;
            // Add to order history and save to localStorage
            setOrderHistory(function (prev) {
                var newHistory = __spreadArray([order], prev, true);
                saveOrderHistory(newHistory);
                return newHistory;
            });
            // Refresh balance data from server instead of manual calculation
            queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
            toast({
                title: "Sell order completed!",
                description: "Sold ".concat(amount.toFixed(6), " ").concat(selectedCryptoSymbol, " at ").concat(executionPrice.toFixed(2), " USDT. New balance: ").concat((usdtBalance + total).toFixed(2), " USDT"),
                duration: 5000
            });
            // Reset form
            setSellAmount('');
            setSellPercentage(0);
            console.log('✅ Sell order completed:', order);
        },
        onError: function (error) {
            toast({
                title: "Failed to place sell order",
                description: error.message,
                variant: "destructive"
            });
        },
    });
    // Handle WebSocket balance updates for real-time sync
    useEffect(function () {
        var _a;
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'balance_update' && ((_a = lastMessage.data) === null || _a === void 0 ? void 0 : _a.userId) === (user === null || user === void 0 ? void 0 : user.id)) {
            console.log('💰 Real-time balance update received in Spot page:', lastMessage.data);
            // Invalidate and refetch balance data to ensure UI sync - use correct query key
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            // Show notification for balance changes
            if (lastMessage.data.changeType === 'spot_buy' || lastMessage.data.changeType === 'spot_sell') {
                toast({
                    title: "Balance Updated",
                    description: "".concat(lastMessage.data.changeType === 'spot_buy' ? 'Buy' : 'Sell', " order completed. New balance: ").concat(lastMessage.data.newBalance, " USDT"),
                });
            }
        }
    }, [lastMessage, user === null || user === void 0 ? void 0 : user.id, queryClient, toast]);
    // Subscribe to WebSocket updates
    useEffect(function () {
        if (connected && (user === null || user === void 0 ? void 0 : user.id)) {
            console.log('🔌 Subscribing to balance updates for user:', user.id);
            // Subscribe to user-specific balance updates
            // This will be handled by the WebSocket connection automatically
        }
    }, [connected, user === null || user === void 0 ? void 0 : user.id]);
    // Helper functions
    var calculateBuyTotal = function () {
        var price = parseFloat(buyPrice) || 0;
        var amount = parseFloat(buyAmount) || 0;
        return (price * amount).toFixed(2);
    };
    var calculateSellTotal = function () {
        var price = parseFloat(sellPrice) || 0;
        var amount = parseFloat(sellAmount) || 0;
        return (price * amount).toFixed(2);
    };
    // Handle price updates from TradingView widget - DISABLED (uses mock data, not real prices)
    var handlePriceUpdate = function (price) {
        // TradingView widget can't provide real prices due to CORS restrictions
        // It only provides mock/simulated prices
        // Real prices come from Binance API instead
        console.log('📊 TradingView price update ignored (mock data):', price);
    };
    // Sync turnover with price/amount changes
    useEffect(function () {
        if (buyPrice && buyAmount) {
            setBuyTurnover(calculateBuyTotal());
        }
        else if (!buyAmount) {
            setBuyTurnover('');
        }
    }, [buyPrice, buyAmount]);
    useEffect(function () {
        if (sellPrice && sellAmount) {
            setSellTurnover(calculateSellTotal());
        }
        else if (!sellAmount) {
            setSellTurnover('');
        }
    }, [sellPrice, sellAmount]);
    var handleBuyPercentageChange = function (percentage) {
        setBuyPercentage(percentage);
        var price = parseFloat(buyPrice) || currentPrice;
        var maxAmount = usdtBalance / price;
        var amount = (maxAmount * percentage / 100).toFixed(8);
        setBuyAmount(amount);
    };
    var handleSellPercentageChange = function (percentage) {
        setSellPercentage(percentage);
        var amount = (selectedCryptoBalance * percentage / 100).toFixed(8);
        setSellAmount(amount);
    };
    var handleBuySubmit = function () {
        console.log('🔥 Buy button clicked!');
        console.log('User:', user);
        console.log('USDT Balance:', usdtBalance);
        console.log('Buy Amount:', buyAmount);
        console.log('Buy Price:', buyPrice);
        var price = parseFloat(buyPrice);
        var amount = parseFloat(buyAmount);
        if (!amount || amount <= 0) {
            toast({ title: "Please enter a valid amount", variant: "destructive" });
            return;
        }
        // REMOVED: Limit order validation (only market orders now)
        // Always use current market price
        var total = currentPrice * amount;
        console.log('Calculated total:', total);
        if (total > usdtBalance) {
            toast({ title: "Insufficient USDT balance. Need ".concat(total.toFixed(2), " but have ").concat(usdtBalance.toFixed(2)), variant: "destructive" });
            return;
        }
        console.log('✅ All validations passed, placing order...');
        placeBuyOrderMutation.mutate({
            type: 'market', // Always market order
            amount: amount.toString(),
            price: undefined, // No price for market orders
            total: total.toString(),
        });
    };
    var handleSellSubmit = function () {
        console.log('🔥 Sell button clicked!');
        console.log('User:', user);
        console.log("".concat(selectedCryptoSymbol, " Balance:"), selectedCryptoBalance);
        console.log('Sell Amount:', sellAmount);
        console.log('Sell Price:', sellPrice);
        var price = parseFloat(sellPrice);
        var amount = parseFloat(sellAmount);
        if (!amount || amount <= 0) {
            toast({ title: "Please enter a valid amount", variant: "destructive" });
            return;
        }
        // REMOVED: Limit order validation (only market orders now)
        if (amount > selectedCryptoBalance) {
            toast({ title: "Insufficient ".concat(selectedCryptoSymbol, " balance. Need ").concat(amount.toFixed(8), " but have ").concat(selectedCryptoBalance.toFixed(8)), variant: "destructive" });
            return;
        }
        // Always use current market price
        var total = currentPrice * amount;
        console.log('Calculated total:', total);
        console.log('✅ All validations passed, placing sell order...');
        placeSellOrderMutation.mutate({
            type: 'market', // Always market order
            amount: amount.toString(),
            price: undefined, // No price for market orders
            total: total.toString(),
        });
    };
    // REMOVED: Initialize real-time price fetching - now using PriceContext
    // REMOVED: Update current price from real market data - now using PriceContext
    // Simplified price initialization - just update when we have valid price data
    useEffect(function () {
        console.log('🔄 Price Update Effect:', {
            selectedSymbol: selectedSymbol,
            currentPrice: currentPrice,
            formattedPrice: formattedPrice,
            isPriceLoading: isPriceLoading,
            buyPrice: buyPrice,
            sellPrice: sellPrice,
            selectedSymbolPriceData: selectedSymbolPriceData
        });
        // Wait for price data to load and be valid
        if (!isPriceLoading && currentPrice > 0 && formattedPrice !== '0.00') {
            console.log('✅ Updating prices to:', formattedPrice);
            setBuyPrice(formattedPrice);
            setSellPrice(formattedPrice);
        }
    }, [selectedSymbol, currentPrice, formattedPrice, isPriceLoading, selectedSymbolPriceData]);
    // Generate dynamic order book data based on current price
    var generateOrderBookData = function (basePrice) {
        var _a;
        // Safety check for valid price - use current price for selected symbol
        var safeBasePrice = basePrice;
        if (!safeBasePrice || isNaN(safeBasePrice) || safeBasePrice <= 0) {
            // Get price for selected symbol or use default
            var symbolPrice = (_a = getPriceForSymbol(selectedSymbol)) === null || _a === void 0 ? void 0 : _a.price;
            safeBasePrice = symbolPrice || (priceData === null || priceData === void 0 ? void 0 : priceData.price) || 166373.87;
        }
        console.log('📊 Order Book - Base price:', basePrice, 'Safe price:', safeBasePrice, 'Symbol:', selectedSymbol);
        var sellOrders = [];
        var buyOrders = [];
        // Generate sell orders (above current price)
        for (var i = 0; i < 14; i++) {
            var priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
            var price = safeBasePrice + priceOffset;
            var volume_1 = (Math.random() * 2 + 0.1).toFixed(4);
            var turnover = (price * parseFloat(volume_1)).toFixed(2);
            sellOrders.push({
                price: price.toFixed(2),
                volume: volume_1,
                turnover: turnover
            });
        }
        // Generate buy orders (below current price)
        for (var i = 0; i < 14; i++) {
            var priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
            var price = safeBasePrice - priceOffset;
            var volume_2 = (Math.random() * 2 + 0.1).toFixed(4);
            var turnover = (price * parseFloat(volume_2)).toFixed(2);
            buyOrders.push({
                price: price.toFixed(2),
                volume: volume_2,
                turnover: turnover
            });
        }
        return { sellOrders: sellOrders, buyOrders: buyOrders };
    };
    // Mobile layout
    if (isMobile) {
        return (<div className="min-h-screen bg-[#10121E] text-white pb-20">
        {/* Use standard mobile header */}
        <MobileHeader />

        {/* Trading Pair Info Header - Below standard header */}
        <div className="bg-[#10121E] px-4 py-2 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-lg notranslate">{currentPairData.symbol}</div>
              <div className="text-white text-xl font-bold notranslate">{currentPairData.price} USDT</div>
              <div className={"text-sm font-semibold notranslate"} style={{ color: currentPairData.isPositive ? '#10b981' : '#ef4444' }}>
                {currentPairData.change}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-xs">24h Vol</div>
              <div className="text-white text-sm font-bold notranslate">
                {(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(1) + 'M BTC' : '1.2M BTC'}
              </div>
            </div>
          </div>

          {/* Mobile Market Stats */}
          <div className="grid grid-cols-4 gap-2 mt-3 text-xs notranslate">
            <div className="text-center">
              <div className="text-gray-400">24h High</div>
              <div className="text-white font-medium">{(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.high24h) || '119,558'}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">24h Low</div>
              <div className="text-white font-medium">{(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.low24h) || '117,205'}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Volume</div>
              <div className="text-white font-medium">
                {(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) / 1000).toFixed(0) + 'K' : '681K'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Turnover</div>
              <div className="text-white font-medium">
                {(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) * parseFloat(btcMarketData.price) / 1000000).toFixed(0) + 'M' : '80.5M'}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Chart - Full Vertical Layout - Using TradingView like desktop */}
        <div className="bg-[#10121E] relative w-full mobile-chart-container" style={{ height: '450px' }}>
          {/* Symbol Selector Overlay - Fixed background issue */}
          <div className="absolute top-2 right-2 z-10">
            <select value={selectedSymbol} onChange={function (e) {
                var newSymbol = e.target.value;
                setSelectedSymbol(newSymbol);
                handleTradingViewSymbolChange(newSymbol);
            }} className="bg-gray-800/90 text-white text-xs font-medium rounded px-2 py-1 border border-gray-600/50 focus:border-blue-500 focus:outline-none min-w-[90px] max-w-[120px] backdrop-blur-sm" style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}>
              {tradingPairs.map(function (pair) { return (<option key={pair.rawSymbol} value={pair.rawSymbol} className="bg-gray-800 text-white">
                  {pair.coin}/USDT
                </option>); })}
            </select>
          </div>

          <div className="w-full h-full">
            <ErrorBoundary>
              <TradingViewWidget type="chart" symbol={"BINANCE:".concat(selectedSymbol)} height={450} interval="1" theme="dark" container_id="spot_mobile_tradingview_chart" onSymbolChange={handleTradingViewSymbolChange}/>
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
              <div className="text-white font-bold text-lg">{formattedPrice} USDT</div>
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
              <div className="text-white font-semibold">1.2T USDT</div>
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
                {generateOrderBookData(currentPrice).sellOrders.slice(0, 5).map(function (order, index) { return (<div key={index} className="flex justify-between text-xs">
                    <span className="text-red-400">{order.price}</span>
                    <span className="text-gray-400">{order.amount}</span>
                  </div>); })}
              </div>
            </div>

            {/* Buy Orders */}
            <div>
              <div className="text-green-400 text-sm font-medium mb-2">Buy Orders</div>
              <div className="space-y-1">
                {generateOrderBookData(currentPrice).buyOrders.slice(0, 5).map(function (order, index) { return (<div key={index} className="flex justify-between text-xs">
                    <span className="text-green-400">{order.price}</span>
                    <span className="text-gray-400">{order.amount}</span>
                  </div>); })}
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
            ].map(function (market, index) { return (<div key={index} className="bg-gray-800 rounded-lg p-3">
                <div className="text-white text-sm font-medium">{market.symbol}</div>
                <div className="text-white text-lg font-bold">{market.price} USDT</div>
                <div className={"text-xs font-medium ".concat(market.change.startsWith('-') ? 'text-red-400' : 'text-green-400')}>
                  {market.change}
                </div>
              </div>); })}
          </div>
        </div>

        {/* Mobile Trading Interface */}
        <div className="px-4 py-4 space-y-4">
          {/* Buy/Sell Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button onClick={function () { return setMobileTradeTab('buy'); }} className={"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ".concat(mobileTradeTab === 'buy'
                ? 'bg-green-600 text-white'
                : 'text-gray-400 hover:text-white')}>
              Buy
            </button>
            <button onClick={function () { return setMobileTradeTab('sell'); }} className={"flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ".concat(mobileTradeTab === 'sell'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white')}>
              Sell
            </button>
          </div>

          {/* REMOVED: Order Type Tabs - Only Market Order now */}
          <div className="mb-4">
            <div className="text-sm font-medium text-blue-400 pb-2 border-b-2 border-blue-400 inline-block">
              Market Order
            </div>
          </div>

          {/* Trading Form */}
          {mobileTradeTab === 'buy' ? (<div className="space-y-4">
              {/* REMOVED: Price input (only market orders now) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount ({selectedCryptoSymbol})</label>
                <input type="number" value={buyAmount} onChange={function (e) { return setBuyAmount(e.target.value); }} placeholder="0.00" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Total (USDT)</label>
                <div className="text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  {calculateBuyTotal()}
                </div>
              </div>

              {/* Mobile Available Balance and Buy Suggestion - Real-time Conversion */}
              <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded border border-blue-500/30">
                {user ? (<>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-400">💰 Available Balance</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{usdtBalance.toFixed(2)} USDT</span>
                      <span className="text-gray-400">≈</span>
                    </div>
                    <div className="text-green-400 font-medium">
                      Can buy ≈ {currentPrice > 0 ? (usdtBalance / currentPrice).toFixed(8) : '0.00000000'} {selectedCryptoSymbol}
                    </div>
                    <div className="text-xs text-gray-400 pt-1 border-t border-gray-700">
                      💱 1 {selectedCryptoSymbol} = {currentPrice > 0 ? currentPrice.toFixed(2) : '0.00'} USDT
                    </div>
                  </>) : (<div className="text-center text-yellow-400">
                    Sign in to view balance
                  </div>)}
              </div>

              <Button onClick={handleBuySubmit} disabled={!buyAmount || buyAmount === '0' || !user} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors">
                {!user ? 'Login to Trade' : "Buy ".concat(selectedCryptoSymbol)}
              </Button>
            </div>) : (<div className="space-y-4">
              {/* REMOVED: Price input (only market orders now) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount ({selectedCryptoSymbol})</label>
                <input type="number" value={sellAmount} onChange={function (e) { return setSellAmount(e.target.value); }} placeholder="0.00" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-red-500 focus:outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Total (USDT)</label>
                <div className="text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  {calculateSellTotal()}
                </div>
              </div>

              {/* Mobile Available Balance and Sell Suggestion - Real-time Conversion */}
              <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded border border-red-500/30">
                {user ? (<>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-400">💰 Available Balance</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{selectedCryptoBalance.toFixed(8)} {selectedCryptoSymbol}</span>
                      <span className="text-gray-400">≈</span>
                    </div>
                    <div className="text-red-400 font-medium">
                      Worth ≈ {selectedCryptoValueInUSDT.toFixed(2)} USDT
                    </div>
                    <div className="text-xs text-gray-400 pt-1 border-t border-gray-700">
                      💱 1 {selectedCryptoSymbol} = {currentPrice.toFixed(2)} USDT
                    </div>
                    {selectedCryptoBalance === 0 && (<div className="text-yellow-400 text-xs pt-1 border-t border-yellow-500/30 bg-yellow-500/10 p-2 rounded">
                        ⚠️ You need to BUY {selectedCryptoSymbol} first before you can SELL
                      </div>)}
                  </>) : (<div className="text-center text-yellow-400">
                    Sign in to view balance
                  </div>)}
              </div>

              <Button onClick={handleSellSubmit} disabled={!sellAmount || sellAmount === '0' || !user || selectedCryptoBalance === 0} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors">
                {!user ? 'Login to Trade' : selectedCryptoBalance === 0 ? "No ".concat(selectedCryptoSymbol, " to Sell") : "Sell ".concat(selectedCryptoSymbol)}
              </Button>
            </div>)}
        </div>

        {/* Mobile Recent Orders */}
        <div className="px-4 py-4">
          <h3 className="text-white font-bold mb-3">Recent Orders</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {orderHistory.slice(0, 5).map(function (order) { return (<div key={order.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={"text-sm font-medium ".concat(order.type === 'buy' ? 'text-green-400' : 'text-red-400')}>
                      {order.type.toUpperCase()} {order.symbol}
                    </span>
                    <div className="text-xs text-gray-400">{order.amount} @ {order.price} USDT</div>
                  </div>
                  <div className="text-right">
                    <div className={"text-sm font-medium ".concat(order.status === 'filled' ? 'text-green-400' :
                    order.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400')}>
                      {order.status}
                    </div>
                    <div className="text-xs text-gray-400">${order.total}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{order.time}</div>
              </div>); })}
            {orderHistory.length === 0 && (<div className="text-center text-gray-400 py-4">
                No recent orders
              </div>)}
          </div>
        </div>
        </div>

        <Footer />
        <MobileBottomNav />
      </div>);
    }
    // Desktop layout (existing) - Footer is added at the end for desktop only
    return (<div className="min-h-screen bg-gray-900">
        <Navigation />
      <div className="bg-[#10121E] flex min-h-screen">
        {/* Left and Center Content */}
        <div className="flex-1">
          {/* Top Header with BTC/USDT and Controls */}
          <div className="bg-[#10121E] px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {/* Left - Dynamic Trading Pair Info - Using TradingView Price */}
              <div className="flex items-center space-x-6 notranslate">
                <div>
                  <div className="text-white font-bold text-lg">{currentPairData.symbol}</div>
                  <div className="text-white text-2xl font-bold">{currentPairData.price} USDT</div>
                  <div className="text-gray-400 text-sm">{currentPairData.price} USDT</div>
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
        <div className="w-56 bg-[#10121E] border-r border-gray-700 min-h-[900px] notranslate">
          {/* Header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold text-lg">
                {selectedSymbol.replace('USDT', '/USDT')}
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: changeColor }}>{formattedPrice} USDT</div>
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
          <div className="grid grid-cols-3 gap-1 p-2 text-[10px] text-gray-400 border-b border-gray-700">
            <span className="truncate">Price</span>
            <span className="truncate text-center">Volume</span>
            <span className="truncate text-right">Total</span>
          </div>

          {/* Order Book Data */}
          <div className="flex-1 min-h-[650px] overflow-y-auto">
            {/* Sell Orders (Red) - Using TradingView Price */}
            <div className="space-y-0">
              {generateOrderBookData(currentPrice).sellOrders.map(function (order, index) { return (<div key={index} className="grid grid-cols-3 gap-1 px-1.5 py-0.5 text-xs hover:bg-[#3a3d57]">
                  <span className="text-red-400 truncate font-mono">{order.price}</span>
                  <span className="text-gray-300 truncate text-center font-mono">{order.volume}</span>
                  <span className="text-gray-300 truncate text-right font-mono">{order.turnover}</span>
                </div>); })}
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
                <span className="text-gray-400 text-sm">{formattedPrice} USDT</span>
              </div>
            </div>

            {/* Buy Orders (Green) - Using TradingView Price */}
            <div className="space-y-0">
              {generateOrderBookData(currentPrice).buyOrders.map(function (order, index) { return (<div key={index} className="grid grid-cols-3 gap-1 px-1.5 py-0.5 text-xs hover:bg-[#3a3d57]">
                  <span className="text-green-400 truncate font-mono">{order.price}</span>
                  <span className="text-gray-300 truncate text-center font-mono">{order.volume}</span>
                  <span className="text-gray-300 truncate text-right font-mono">{order.turnover}</span>
                </div>); })}
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
                  {false && (<button onClick={function () { return setChartView('basic'); }} className={"text-xs transition-colors ".concat(chartView === 'basic'
                ? 'text-white bg-blue-600 px-2 py-1 rounded'
                : 'text-gray-400 hover:text-white')}>
                      Basic version
                    </button>)}
                  <button onClick={function () { return setChartView('tradingview'); }} className={"text-xs transition-colors ".concat(chartView === 'tradingview'
            ? 'text-white bg-blue-600 px-2 py-1 rounded'
            : 'text-gray-400 hover:text-white')}>
                    Trading view
                  </button>
                  <button onClick={function () { return setChartView('depth'); }} className={"text-xs transition-colors ".concat(chartView === 'depth'
            ? 'text-white bg-blue-600 px-2 py-1 rounded'
            : 'text-gray-400 hover:text-white')}>
                    Depth
                  </button>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chart Area - Dynamic chart based on selected view like options page */}
          <div className="h-[500px] relative bg-[#10121E] p-1">
            {/* Basic chart view disabled to avoid red line issues */}
            {false && chartView === 'basic' && (<LightweightChart symbol={selectedSymbol} interval="1m" height={490} containerId="spot_desktop_chart"/>)}

            {chartView === 'tradingview' && (<div className="relative h-full">
                {/* Symbol Selector Overlay - Fixed background issue */}
                <div className="absolute top-2 right-2 z-10">
                  <select value={selectedSymbol} onChange={function (e) {
                var newSymbol = e.target.value;
                setSelectedSymbol(newSymbol);
                handleTradingViewSymbolChange(newSymbol);
            }} className="bg-gray-800/90 text-white text-xs font-medium rounded px-2 py-1 border border-gray-600/50 focus:border-blue-500 focus:outline-none min-w-[90px] max-w-[120px] backdrop-blur-sm" style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}>
                    {tradingPairs.map(function (pair) { return (<option key={pair.rawSymbol} value={pair.rawSymbol} className="bg-gray-800 text-white">
                        {pair.coin}/USDT
                      </option>); })}
                  </select>
                </div>

                <ErrorBoundary>
                  <TradingViewWidget type="chart" symbol={"BINANCE:".concat(selectedSymbol)} height={490} interval="1" theme="dark" container_id="spot_tradingview_chart" onSymbolChange={handleTradingViewSymbolChange}/>
                </ErrorBoundary>
              </div>)}

            {chartView === 'depth' && (<div className="w-full h-full p-4">
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
              </div>)}
          </div>

          {/* Bottom Trading Section */}
          <div className="bg-[#10121E] p-4 min-h-[450px] flex-shrink-0">
            {/* REMOVED: Order Type Tabs - Only Market Order now */}
            <div className="mb-6">
              <div className="text-sm font-medium text-blue-400 pb-2 border-b-2 border-blue-400 inline-block">
                Market Order
              </div>
            </div>

            {/* Side-by-side Buy/Sell Forms */}
            <div className="grid grid-cols-2 gap-6">
              {/* Buy Section */}
              <div className="space-y-4">
                {/* REMOVED: Price input (only market orders now) */}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Amount</label>
                  <div className="relative">
                    <input type="number" className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12" value={buyAmount} onChange={function (e) {
            console.log('Buy amount changed:', e.target.value);
            setBuyAmount(e.target.value);
            setBuyPercentage(0);
        }} placeholder="0.00000000" step="0.000001"/>
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">{selectedCryptoSymbol}</span>
                  </div>
                </div>

                {/* Percentage Slider */}
                <div className="relative py-4">
                  <div className="flex items-center justify-between relative">
                    <div className={"w-2 h-2 rounded-full z-10 ".concat(buyPercentage > 0 ? 'bg-green-400' : 'bg-gray-400')} style={{ left: "".concat(buyPercentage, "%") }}></div>
                    <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-600"></div>
                    <div className="absolute h-0.5 bg-green-400 top-1/2 transform -translate-y-1/2" style={{ width: "".concat(buyPercentage, "%") }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-2">
                    <button onClick={function () { return handleBuyPercentageChange(0); }} className={"hover:text-white transition-colors ".concat(buyPercentage === 0 ? 'text-green-400' : '')}>
                      0
                    </button>
                    <button onClick={function () { return handleBuyPercentageChange(25); }} className={"hover:text-white transition-colors ".concat(buyPercentage === 25 ? 'text-green-400' : '')}>
                      25%
                    </button>
                    <button onClick={function () { return handleBuyPercentageChange(50); }} className={"hover:text-white transition-colors ".concat(buyPercentage === 50 ? 'text-green-400' : '')}>
                      50%
                    </button>
                    <button onClick={function () { return handleBuyPercentageChange(75); }} className={"hover:text-white transition-colors ".concat(buyPercentage === 75 ? 'text-green-400' : '')}>
                      75%
                    </button>
                    <button onClick={function () { return handleBuyPercentageChange(100); }} className={"hover:text-white transition-colors ".concat(buyPercentage === 100 ? 'text-green-400' : '')}>
                      100%
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Turnover</label>
                  <div className="relative">
                    <input type="number" className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12" value={buyTurnover} onChange={function (e) {
            console.log('Buy turnover changed:', e.target.value);
            setBuyTurnover(e.target.value);
            var total = parseFloat(e.target.value) || 0;
            var price = parseFloat(buyPrice) || currentPrice;
            if (price > 0) {
                var amount = (total / price).toFixed(6);
                console.log('Calculated buy amount:', amount);
                setBuyAmount(amount);
            }
        }} placeholder="0.00"/>
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">USDT</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded border border-blue-500/30 notranslate">
                  {user ? (<>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-400">💰 Available Balance</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{usdtBalance.toFixed(2)} USDT</span>
                        <span className="text-gray-400">≈</span>
                      </div>
                      <div className="text-green-400 font-medium">
                        Can buy ≈ {currentPrice > 0 ? (usdtBalance / currentPrice).toFixed(8) : '0.00000000'} {selectedCryptoSymbol}
                      </div>
                      <div className="text-xs text-gray-400 pt-1 border-t border-gray-700">
                        💱 1 {selectedCryptoSymbol} = {currentPrice > 0 ? currentPrice.toFixed(2) : '0.00'} USDT
                      </div>
                    </>) : (<div className="text-center text-yellow-400">
                      Sign in to view balance
                    </div>)}
                </div>

                {!user ? (<div className="space-y-2">
                    <button disabled className="w-full bg-gray-600 cursor-not-allowed text-white py-3 rounded font-medium">
                      Buy({selectedCryptoSymbol})
                    </button>
                    <p className="text-center text-yellow-400 text-sm">
                      <a href="/login" className="underline hover:text-yellow-300">
                        Sign in to start trading
                      </a>
                    </p>
                  </div>) : (<button onClick={handleBuySubmit} disabled={placeBuyOrderMutation.isPending} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium">
                    {placeBuyOrderMutation.isPending ? 'Placing...' : "Buy(".concat(selectedCryptoSymbol, ")")}
                  </button>)}
              </div>

              {/* Sell Section */}
              <div className="space-y-4">
                {/* REMOVED: Price input (only market orders now) */}

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Amount</label>
                  <div className="relative">
                    <input type="number" className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12" value={sellAmount} onChange={function (e) {
            console.log('Sell amount changed:', e.target.value);
            setSellAmount(e.target.value);
            setSellPercentage(0);
        }} placeholder="0.00000000" step="0.000001"/>
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">{selectedCryptoSymbol}</span>
                  </div>
                </div>

                {/* Percentage Slider */}
                <div className="relative py-4">
                  <div className="flex items-center justify-between relative">
                    <div className={"w-2 h-2 rounded-full z-10 ".concat(sellPercentage > 0 ? 'bg-red-400' : 'bg-gray-400')} style={{ left: "".concat(sellPercentage, "%") }}></div>
                    <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-600"></div>
                    <div className="absolute h-0.5 bg-red-400 top-1/2 transform -translate-y-1/2" style={{ width: "".concat(sellPercentage, "%") }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-2">
                    <button onClick={function () { return handleSellPercentageChange(0); }} className={"hover:text-white transition-colors ".concat(sellPercentage === 0 ? 'text-red-400' : '')}>
                      0
                    </button>
                    <button onClick={function () { return handleSellPercentageChange(25); }} className={"hover:text-white transition-colors ".concat(sellPercentage === 25 ? 'text-red-400' : '')}>
                      25%
                    </button>
                    <button onClick={function () { return handleSellPercentageChange(50); }} className={"hover:text-white transition-colors ".concat(sellPercentage === 50 ? 'text-red-400' : '')}>
                      50%
                    </button>
                    <button onClick={function () { return handleSellPercentageChange(75); }} className={"hover:text-white transition-colors ".concat(sellPercentage === 75 ? 'text-red-400' : '')}>
                      75%
                    </button>
                    <button onClick={function () { return handleSellPercentageChange(100); }} className={"hover:text-white transition-colors ".concat(sellPercentage === 100 ? 'text-red-400' : '')}>
                      100%
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Turnover</label>
                  <div className="relative">
                    <input type="number" className="w-full bg-[#1a1b2e] text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none pr-12" value={sellTurnover} onChange={function (e) {
            console.log('Sell turnover changed:', e.target.value);
            setSellTurnover(e.target.value);
            var total = parseFloat(e.target.value) || 0;
            var price = parseFloat(sellPrice) || currentPrice;
            if (price > 0) {
                var amount = (total / price).toFixed(6);
                console.log('Calculated sell amount:', amount);
                setSellAmount(amount);
            }
        }} placeholder="0.00"/>
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">USDT</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-300 bg-[#1a1b2e] p-2 rounded border border-red-500/30 notranslate">
                  {user ? (<>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-400">💰 Available Balance</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold">{selectedCryptoBalance.toFixed(8)} {selectedCryptoSymbol}</span>
                        <span className="text-gray-400">≈</span>
                      </div>
                      <div className="text-red-400 font-medium">
                        Worth ≈ {selectedCryptoValueInUSDT.toFixed(2)} USDT
                      </div>
                      <div className="text-xs text-gray-400 pt-1 border-t border-gray-700">
                        💱 1 {selectedCryptoSymbol} = {currentPrice.toFixed(2)} USDT
                      </div>
                      {selectedCryptoBalance === 0 && (<div className="text-yellow-400 text-xs pt-1 border-t border-yellow-500/30 bg-yellow-500/10 p-2 rounded">
                          ⚠️ You need to BUY {selectedCryptoSymbol} first before you can SELL
                        </div>)}
                    </>) : (<div className="text-center text-yellow-400">
                      Sign in to view balance
                    </div>)}
                </div>

                {!user ? (<div className="space-y-2">
                    <button disabled className="w-full bg-gray-600 cursor-not-allowed text-white py-3 rounded font-medium">
                      Sell ({selectedCryptoSymbol})
                    </button>
                    <p className="text-center text-yellow-400 text-sm">
                      <a href="/login" className="underline hover:text-yellow-300">
                        Sign in to start trading
                      </a>
                    </p>
                  </div>) : (<button onClick={handleSellSubmit} disabled={placeSellOrderMutation.isPending || selectedCryptoBalance === 0} className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium">
                    {placeSellOrderMutation.isPending ? 'Placing...' : selectedCryptoBalance === 0 ? "No ".concat(selectedCryptoSymbol, " to Sell") : "Sell (".concat(selectedCryptoSymbol, ")")}
                  </button>)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" placeholder="Search coins (e.g. ETH, BTC, SOL)" value={searchTerm} onChange={function (e) { return handleSearchChange(e.target.value); }} className="w-full bg-[#1a1b2e] text-white pl-10 pr-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"/>
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
            {filteredTradingPairs.length > 0 ? (filteredTradingPairs.map(function (pair, index) { return (<div key={index} onClick={function () { return handlePairSelect(pair.rawSymbol); }} className={"flex items-center justify-between p-2 hover:bg-[#1a1b2e] rounded cursor-pointer transition-colors ".concat(selectedSymbol === pair.rawSymbol ? 'bg-blue-600/20 border border-blue-500/30' : '')}>
                  <div className="flex items-center space-x-3">
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ".concat(pair.iconBg)}>
                      {pair.icon}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{pair.symbol}</div>
                      <div className="text-gray-400 text-xs">{pair.coin}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{pair.price}</div>
                    <div className={"text-xs ".concat(pair.isPositive ? 'text-green-400' : 'text-red-400')}>
                      {pair.change}
                    </div>
                  </div>
                </div>); })) : (<div className="text-center text-gray-400 py-4">
                <div className="text-sm">No coins found</div>
                <div className="text-xs mt-1">Try searching for BTC, ETH, SOL, etc.</div>
              </div>)}
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
        ].map(function (transaction, index) { return (<div key={index} className="flex justify-between text-xs py-1 hover:bg-gray-800/50 rounded px-2 -mx-2">
                    <span className="text-gray-400 font-mono">{transaction.time}</span>
                    <span className={"font-mono ".concat(transaction.type === 'buy' ? 'text-green-400' : 'text-red-400')}>
                      {transaction.price}
                    </span>
                    <span className="text-gray-300 font-mono">{transaction.amount}</span>
                  </div>); })}
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
              <button onClick={function () { return setActiveTab("open"); }} className={"pb-1 text-sm font-medium ".concat(activeTab === "open"
            ? "text-blue-400 border-b-2 border-blue-400"
            : "text-gray-400 hover:text-white")}>
                Open orders({openOrders.length})
              </button>
              <button onClick={function () { return setActiveTab("history"); }} className={"pb-1 text-sm font-medium ".concat(activeTab === "history"
            ? "text-blue-400 border-b-2 border-blue-400"
            : "text-gray-400 hover:text-white")}>
                Order history({orderHistory.length})
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-gray-400 text-sm">
              <input type="checkbox" className="rounded"/>
              <span>Hide other trading pairs</span>
            </label>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 gap-2 px-4 py-3 text-gray-400 text-xs font-medium border-b border-gray-700">
          <div className="truncate">Trading pair</div>
          <div className="truncate text-center">Type</div>
          <div className="truncate text-center">Price</div>
          <div className="truncate text-center">Amount</div>
          <div className="truncate text-center">Total</div>
          <div className="truncate text-center">Status</div>
          <div className="truncate text-center">Time</div>
        </div>

        {/* Orders Content */}
        <div className="min-h-[200px]">
          {activeTab === 'open' ? (
        // Open Orders Tab
        openOrders.length > 0 ? (<div className="space-y-0.5">
                {openOrders.map(function (order) { return (<div key={order.id} className="grid grid-cols-7 gap-2 px-4 py-2 text-xs hover:bg-gray-800/50 max-w-full overflow-hidden">
                    <div className="text-white truncate">{order.symbol}</div>
                    <div className={"".concat(order.type === 'buy' ? 'text-green-400' : 'text-red-400', " truncate text-center")}>
                      {order.type.toUpperCase()} / {order.orderType.toUpperCase()}
                    </div>
                    <div className="text-white truncate text-center">{order.price}</div>
                    <div className="text-white truncate text-center">{order.amount}</div>
                    <div className="text-white truncate text-center">{order.total}</div>
                    <div className="text-yellow-400 truncate text-center">Pending</div>
                    <div className="text-gray-400 truncate text-center">{order.time}</div>
                  </div>); })}
              </div>) : (<div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 mb-4 opacity-50">
                  <svg viewBox="0 0 64 64" className="w-full h-full text-gray-500">
                    <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">No open orders</div>
              </div>)) : (
        // Order History Tab
        orderHistory.length > 0 ? (<div className="space-y-0.5">
                {orderHistory.map(function (order) { return (<div key={order.id} className="grid grid-cols-7 gap-2 px-4 py-2 text-xs hover:bg-gray-800/50 max-w-full overflow-hidden">
                    <div className="text-white truncate">{order.symbol}</div>
                    <div className={"".concat(order.type === 'buy' ? 'text-green-400' : 'text-red-400', " truncate text-center")}>
                      {order.type.toUpperCase()} / {order.orderType.toUpperCase()}
                    </div>
                    <div className="text-white truncate text-center">{order.price} USDT</div>
                    <div className="text-white truncate text-center">{order.amount}</div>
                    <div className="text-white truncate text-center">{order.total} USDT</div>
                    <div className="text-green-400 truncate text-center">Filled</div>
                    <div className="text-gray-400 truncate text-center">{order.time}</div>
                  </div>); })}
              </div>) : (<div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 mb-4 opacity-50">
                  <svg viewBox="0 0 64 64" className="w-full h-full text-gray-500">
                    <path fill="currentColor" d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 44c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>
                    <path fill="currentColor" d="M32 16c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16zm0 28c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z"/>
                    <circle fill="currentColor" cx="32" cy="32" r="4"/>
                  </svg>
                </div>
                <div className="text-gray-400 text-sm">No order history</div>
              </div>))}
        </div>
      </div>
    </div>);
}
// Wrapper component with PriceProvider for synchronized price data
export default function SpotPage() {
    var _a = useState('BTCUSDT'), selectedSymbol = _a[0], setSelectedSymbol = _a[1]; // Default to BTC
    return (<PriceProvider symbol={selectedSymbol} updateInterval={2000}>
      <SpotPageContent selectedSymbol={selectedSymbol} setSelectedSymbol={setSelectedSymbol}/>
    </PriceProvider>);
}
