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
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { useIsMobile } from "../hooks/use-mobile";
import QRCodeGenerator from "../components/QRCodeGenerator";
import { useCryptoData } from "../services/cryptoDataService";
import StripePayment from "../components/StripePayment";
import { Send, Plus, Copy, CheckCircle } from "lucide-react";
export default function WalletPage() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var _l = useState("Balance"), activeTab = _l[0], setActiveTab = _l[1];
    var _m = useState(true), showDetailedBalance = _m[0], setShowDetailedBalance = _m[1];
    var isMobile = useIsMobile();
    var _o = useState(''), depositAmount = _o[0], setDepositAmount = _o[1];
    var _p = useState(''), withdrawAddress = _p[0], setWithdrawAddress = _p[1];
    var _q = useState(''), withdrawAmount = _q[0], setWithdrawAmount = _q[1];
    var _r = useState('USDT-ERC20'), selectedCrypto = _r[0], setSelectedCrypto = _r[1];
    var _s = useState('ERC20'), selectedNetwork = _s[0], setSelectedNetwork = _s[1];
    var _t = useState(''), fundPassword = _t[0], setFundPassword = _t[1];
    var _u = useState(null), uploadedFile = _u[0], setUploadedFile = _u[1];
    var fileInputRef = useRef(null);
    // Modal states for deposit confirmations
    var _v = useState(false), showTxHashModal = _v[0], setShowTxHashModal = _v[1];
    var _w = useState(false), showBankRefModal = _w[0], setShowBankRefModal = _w[1];
    var _x = useState(false), showStripeModal = _x[0], setShowStripeModal = _x[1];
    var _y = useState(''), txHash = _y[0], setTxHash = _y[1];
    var _z = useState(''), bankRef = _z[0], setBankRef = _z[1];
    // Convert to USDT state
    var _0 = useState(false), showConvertModal = _0[0], setShowConvertModal = _0[1];
    var _1 = useState(null), convertingSymbol = _1[0], setConvertingSymbol = _1[1];
    var _2 = useState(''), convertAmount = _2[0], setConvertAmount = _2[1];
    var _3 = useState(false), isConverting = _3[0], setIsConverting = _3[1];
    var _4 = useState(null), pendingDepositData = _4[0], setPendingDepositData = _4[1];
    var toast = useToast().toast;
    var user = useAuth().user;
    // Auto-fill withdrawal address from user profile
    useEffect(function () {
        if (user === null || user === void 0 ? void 0 : user.address) {
            setWithdrawAddress(user.address);
            console.log('🔒 Withdrawal address auto-filled from profile:', user.address);
        }
    }, [user === null || user === void 0 ? void 0 : user.address]);
    // Fetch user trade history to check minimum trades requirement
    var _5 = useQuery({
        queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/trades")],
        enabled: !!(user === null || user === void 0 ? void 0 : user.id),
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("/api/users/".concat(user.id, "/trades"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            console.log('Trade history API failed, using empty array');
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        console.log('📊 Trade history fetched for withdrawal validation:', data);
                        return [2 /*return*/, Array.isArray(data) ? data : []];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Failed to fetch trade history:', error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        }); },
    }).data, tradeHistory = _5 === void 0 ? [] : _5;
    // Calculate completed trades count (only trades with status 'completed')
    var completedTradesCount = tradeHistory.filter(function (trade) {
        return trade.status === 'completed';
    }).length;
    // Fetch withdrawal history - REAL DATA
    var _6 = useQuery({
        queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/withdrawals")],
        enabled: !!(user === null || user === void 0 ? void 0 : user.id),
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("/api/users/".concat(user.id, "/withdrawals"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            console.log('Withdrawal history API failed, using empty array');
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        console.log('📊 Withdrawal history fetched:', data);
                        return [2 /*return*/, Array.isArray(data) ? data : []];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Failed to fetch withdrawal history:', error_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        }); },
        refetchInterval: 30000, // Refresh every 30 seconds
    }).data, withdrawalHistory = _6 === void 0 ? [] : _6;
    // Fetch deposit history - REAL DATA
    var _7 = useQuery({
        queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/deposits")],
        enabled: !!(user === null || user === void 0 ? void 0 : user.id),
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("/api/users/".concat(user.id, "/deposits"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            console.log('Deposit history API failed, using empty array');
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        console.log('📊 Deposit history fetched:', data);
                        return [2 /*return*/, Array.isArray(data) ? data : []];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Failed to fetch deposit history:', error_3);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        }); },
        refetchInterval: 30000, // Refresh every 30 seconds
    }).data, depositHistory = _7 === void 0 ? [] : _7;
    var queryClient = useQueryClient();
    // Real platform deposit addresses (where users send crypto to deposit)
    var cryptoNetworks = {
        'BTC': {
            name: 'BTC',
            address: 'bc1q6w3rdy5kwaf4es2lpjk6clpd25pterzvgwu5hu',
            network: 'BTC',
            minAmount: 0.001,
            description: 'Send Bitcoin to this address',
            chainId: null
        },
        'ETH': {
            name: 'ETH',
            address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
            network: 'ETH',
            minAmount: 0.01,
            description: 'Send Ethereum to this address',
            chainId: 1
        },
        'SOL': {
            name: 'SOL',
            address: '6s2UxAyknMvzN2nUpRdHp6EqDetsdK9mjsLTguzNYeKU',
            network: 'SOL',
            minAmount: 0.1,
            description: 'Send Solana to this address',
            chainId: null
        },
        'USDT-ERC20': {
            name: 'USDT ERC20',
            address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
            network: 'USDT ERC20',
            minAmount: 100,
            description: 'Send USDT on Ethereum network to this address',
            chainId: 1
        },
        'USDT-TRC20': {
            name: 'USDT TRC20',
            address: 'TTZzHBjpmksYqaM6seVjCSLSe6m77Bfjp9',
            network: 'USDT TRC20',
            minAmount: 100,
            description: 'Send USDT on TRON network to this address',
            chainId: null
        },
        'USDT-BEP20': {
            name: 'USDT BEP20',
            address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
            network: 'USDT BEP20',
            minAmount: 100,
            description: 'Send USDT on Binance Smart Chain to this address',
            chainId: 56
        }
    };
    // Deposit mutation
    var depositMutation = useMutation({
        mutationFn: function (depositData) { return __awaiter(_this, void 0, void 0, function () {
            var authToken, response, errorData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authToken = localStorage.getItem('authToken');
                        if (!authToken) {
                            throw new Error('No authentication token found');
                        }
                        return [4 /*yield*/, fetch('/api/deposits', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(authToken),
                                },
                                body: depositData,
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        errorData = _a.sent();
                        throw new Error(errorData.message || 'Failed to submit deposit');
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: 'Deposit Submitted',
                description: 'Your deposit request has been submitted for review.',
            });
            setDepositAmount('');
            setUploadedFile(null);
            // Invalidate both balances and deposit history queries for real-time sync
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/deposits")] });
        },
        onError: function (error) {
            toast({
                title: 'Deposit Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Helper functions
    var handleFileUpload = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            // Validate file type
            var allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: 'Invalid File Type',
                    description: 'Please upload a JPEG, PNG, or PDF file.',
                    variant: 'destructive',
                });
                return;
            }
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File Too Large',
                    description: 'Please upload a file smaller than 5MB.',
                    variant: 'destructive',
                });
                return;
            }
            setUploadedFile(file);
        }
    };
    var copyToClipboard = function (text) {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Address copied to clipboard",
        });
    };
    var handleDepositSubmit = function () {
        // Check if deposit amount is provided and valid
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            toast({
                title: 'Invalid Amount',
                description: 'Please enter a valid deposit amount.',
                variant: 'destructive',
            });
            return;
        }
        // Check if receipt is uploaded
        if (!uploadedFile) {
            toast({
                title: 'Receipt Required',
                description: 'Please upload a transaction receipt.',
                variant: 'destructive',
            });
            return;
        }
        var network = cryptoNetworks[selectedCrypto];
        if (parseFloat(depositAmount) < network.minAmount) {
            toast({
                title: 'Amount Too Small',
                description: "Minimum deposit amount is ".concat(network.minAmount, " ").concat(selectedCrypto, "."),
                variant: 'destructive',
            });
            return;
        }
        // Create FormData for file upload
        var formData = new FormData();
        formData.append('amount', depositAmount);
        formData.append('currency', selectedCrypto);
        formData.append('receipt', uploadedFile);
        depositMutation.mutate(formData);
    };
    // Generate single QR code - formatted text to prevent wallet auto-detection
    var generateQRCode = function () {
        var network = cryptoNetworks[selectedCrypto];
        var address = network.address;
        console.log('QR Code value:', address); // Debug log
        // Format as descriptive text to prevent MetaMask from trying to interpret it as a transaction
        return "METACHROME DEPOSIT ADDRESS\n".concat(network.network, "\n").concat(address, "\n\nCOPY THIS ADDRESS TO YOUR WALLET");
    };
    // Fetch real user balances - Railway uses Express.js session-based endpoint
    var _8 = useQuery({
        queryKey: ["/api/balances"],
        enabled: !!user,
        refetchInterval: 5000, // Refresh every 5 seconds
        staleTime: 0, // Always consider data stale
        cacheTime: 0, // Don't cache data
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, errorText, data;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🔍 WALLET: Fetching balance from /api/balances for user:', user === null || user === void 0 ? void 0 : user.id, user === null || user === void 0 ? void 0 : user.username);
                        console.log('🔍 WALLET: Auth token:', ((_a = localStorage.getItem('authToken')) === null || _a === void 0 ? void 0 : _a.substring(0, 30)) + '...');
                        return [4 /*yield*/, fetch('/api/balances', {
                                credentials: 'include', // Important: send session cookies
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _b.sent();
                        console.log('🔍 WALLET: Response status:', response.status, response.statusText);
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _b.sent();
                        console.error('❌ WALLET: Balance API failed:', response.status, errorText);
                        throw new Error("Failed to fetch balance: ".concat(response.status, " ").concat(errorText));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _b.sent();
                        console.log('🔍 WALLET: Balance API response:', data);
                        return [2 /*return*/, data];
                }
            });
        }); },
    }), userBalances = _8.data, balancesLoading = _8.isLoading;
    // Fetch real market data for price calculations using the same hook as HomePage
    var _9 = useCryptoData(), marketData = _9.cryptoData, marketDataLoading = _9.loading, marketDataError = _9.error;
    // Debug market data
    console.log('📊 WalletPage - Market Data:', {
        marketData: marketData,
        marketDataLoading: marketDataLoading,
        marketDataError: marketDataError,
        dataLength: marketData === null || marketData === void 0 ? void 0 : marketData.length
    });
    var tabs = [
        { id: "Balance", label: "Balance" },
        { id: "Deposit", label: "Deposit" },
        { id: "Withdraw", label: "Withdraw" },
        { id: "Transfer", label: "Transfer" }
    ];
    // Helper function to get market price from real-time data
    var getMarketPrice = function (symbol) {
        if (symbol === 'USDT' || symbol === 'USDC' || symbol === 'BUSD')
            return 1;
        // Try to get price from market data first
        // useCryptoData returns data with symbol format "BTC/USDT" and rawPrice field
        var marketItem = marketData === null || marketData === void 0 ? void 0 : marketData.find(function (item) { return item.symbol === "".concat(symbol, "/USDT"); });
        if (marketItem && marketItem.rawPrice) {
            var price = marketItem.rawPrice;
            console.log('💰 getMarketPrice (from API):', { symbol: symbol, price: price, marketItem: marketItem });
            return price;
        }
        // Fallback prices only if market data not available (should rarely happen)
        var fallbackPrices = {
            BTC: 107000,
            ETH: 3700,
            SOL: 200,
            BNB: 600,
            XRP: 2.4,
            ADA: 0.82,
            DOGE: 0.24,
            TRX: 0.25,
            LINK: 20,
            AVAX: 35,
            DOT: 7,
            LTC: 100
        };
        var fallbackPrice = fallbackPrices[symbol] || 0;
        console.log('⚠️ getMarketPrice (fallback):', { symbol: symbol, fallbackPrice: fallbackPrice, reason: 'Market data not available' });
        return fallbackPrice;
    };
    // Get USDT balance
    var usdtBalance = parseFloat(((_a = userBalances === null || userBalances === void 0 ? void 0 : userBalances.find(function (balance) { return balance.symbol === 'USDT'; })) === null || _a === void 0 ? void 0 : _a.available) || '0');
    // Calculate total balance including all cryptocurrency assets using real-time prices
    var totalBalanceUSDT = (userBalances === null || userBalances === void 0 ? void 0 : userBalances.reduce(function (total, balance) {
        var available = parseFloat(balance.available || '0');
        // Use real-time market price from getMarketPrice()
        var price = getMarketPrice(balance.symbol);
        var usdtValue = available * price;
        console.log('💵 Balance calculation:', {
            symbol: balance.symbol,
            available: available,
            price: price,
            usdtValue: usdtValue
        });
        return total + usdtValue;
    }, 0)) || usdtBalance;
    // Handle Convert to USDT
    var handleConvertToUSDT = function (symbol, amount) { return __awaiter(_this, void 0, void 0, function () {
        var cryptoBalance, currentPrice, response, errorData, data, usdtReceived, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user) {
                        toast.error('Please login first');
                        return [2 /*return*/];
                    }
                    if (!amount || parseFloat(amount) <= 0) {
                        toast.error('Please enter a valid amount');
                        return [2 /*return*/];
                    }
                    cryptoBalance = userBalances === null || userBalances === void 0 ? void 0 : userBalances.find(function (b) { return b.symbol === symbol; });
                    if (!cryptoBalance || parseFloat(cryptoBalance.available) < parseFloat(amount)) {
                        toast.error("Insufficient ".concat(symbol, " balance"));
                        return [2 /*return*/];
                    }
                    setIsConverting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    console.log("\uD83D\uDD04 Converting ".concat(amount, " ").concat(symbol, " to USDT..."));
                    currentPrice = getMarketPrice(symbol);
                    console.log("\uD83D\uDCB0 Current ".concat(symbol, " price:"), currentPrice);
                    return [4 /*yield*/, fetch('/api/spot/orders', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                userId: user.id,
                                symbol: "".concat(symbol, "USDT"),
                                side: 'sell',
                                amount: parseFloat(amount),
                                price: currentPrice,
                                type: 'market'
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || 'Convert failed');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    console.log('✅ Convert successful:', data);
                    usdtReceived = (parseFloat(amount) * currentPrice).toFixed(2);
                    toast.success("Successfully converted ".concat(amount, " ").concat(symbol, " to ").concat(usdtReceived, " USDT"));
                    // Close modal and reset state
                    setShowConvertModal(false);
                    setConvertingSymbol(null);
                    setConvertAmount('');
                    // Refetch balances
                    queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
                    return [3 /*break*/, 8];
                case 6:
                    error_4 = _a.sent();
                    console.error('❌ Convert error:', error_4);
                    toast.error(error_4.message || 'Failed to convert');
                    return [3 /*break*/, 8];
                case 7:
                    setIsConverting(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Open convert modal
    var openConvertModal = function (symbol, maxAmount) {
        setConvertingSymbol(symbol);
        setConvertAmount(maxAmount); // Default to max amount
        setShowConvertModal(true);
    };
    // Debug balance data
    console.log('🔍 WALLET PAGE - Balance data:', {
        userId: user === null || user === void 0 ? void 0 : user.id,
        userBalances: userBalances,
        usdtBalance: usdtBalance,
        totalBalanceUSDT: totalBalanceUSDT,
        balancesLoading: balancesLoading
    });
    // Withdraw mutation
    var withdrawMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var authToken, response, errorData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authToken = localStorage.getItem('authToken');
                        if (!authToken) {
                            throw new Error('Please login first to make a withdrawal');
                        }
                        return [4 /*yield*/, fetch('/api/withdrawals', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(authToken)
                                },
                                body: JSON.stringify({
                                    amount: data.amount,
                                    currency: data.currency,
                                    address: data.address,
                                    password: data.password
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        errorData = _a.sent();
                        throw new Error(errorData.error || errorData.message || 'Withdrawal failed');
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: 'Withdrawal Initiated',
                description: "Withdrawal of ".concat(data.amount, " ").concat(data.currency, " has been initiated and is pending approval"),
            });
            setWithdrawAddress('');
            setWithdrawAmount('');
            setFundPassword('');
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
        },
        onError: function (error) {
            toast({
                title: 'Withdrawal Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    // Handle transaction hash submission
    var handleTxHashSubmit = function () {
        if (!txHash.trim()) {
            toast({
                title: 'Transaction Hash Required',
                description: 'Please provide a valid transaction hash for verification',
                variant: 'destructive',
            });
            return;
        }
        depositMutation.mutate(__assign(__assign({}, pendingDepositData), { txHash: txHash }));
        setShowTxHashModal(false);
        setTxHash('');
        setPendingDepositData(null);
    };
    // Handle bank reference submission
    var handleBankRefSubmit = function () {
        if (!bankRef.trim()) {
            toast({
                title: 'Transfer Reference Required',
                description: 'Please provide your bank transfer reference number',
                variant: 'destructive',
            });
            return;
        }
        depositMutation.mutate(__assign(__assign({}, pendingDepositData), { paymentData: { transferReference: bankRef } }));
        setShowBankRefModal(false);
        setBankRef('');
        setPendingDepositData(null);
    };
    // Handle Stripe payment success
    var handleStripeSuccess = function (paymentIntentId) {
        depositMutation.mutate(__assign(__assign({}, pendingDepositData), { paymentData: { paymentIntentId: paymentIntentId } }));
        setShowStripeModal(false);
        setPendingDepositData(null);
    };
    // Handle Stripe payment error
    var handleStripeError = function (error) {
        toast({
            title: 'Payment Failed',
            description: error,
            variant: 'destructive',
        });
    };
    // Use real balances from API
    var balances = userBalances || [];
    var cryptoNames = {
        BTC: "Bitcoin",
        ETH: "Ethereum",
        USDT: "Tether",
    };
    return (<div className="min-h-screen bg-[#1a1b2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Tabs */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 mb-8 border-b border-gray-600 overflow-x-auto scrollbar-hide">
            {tabs.map(function (tab) { return (<Button key={tab.id} variant="ghost" size="sm" onClick={function () { return setActiveTab(tab.id); }} className={"whitespace-nowrap flex-shrink-0 ".concat(activeTab === tab.id
                ? "bg-transparent text-white border-b-2 border-purple-500 rounded-none pb-3"
                : "bg-transparent text-gray-400 hover:text-white rounded-none pb-3")}>
                {tab.label}
              </Button>); })}
          </div>
        </div>

        {activeTab === "Balance" && (<div className="space-y-8">
            {/* Balance Header */}
            <div>
              <h1 className="text-[26px] md:text-[31px] font-bold text-white mb-2">Balance</h1>
              


              {/* Total Balance */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Total Balances</span>
                    <span className="text-gray-400">💰</span>
                  </div>
                  <button onClick={function () { return setShowDetailedBalance(!showDetailedBalance); }} className="text-purple-400 text-sm hover:text-purple-300">
                    {showDetailedBalance ? 'Simple View' : 'Detailed View'}
                  </button>
                </div>
                <div className={"font-bold text-white leading-[2.5rem] ".concat(isMobile ? 'text-[24px]' : 'text-[30px]')}>
                  {balancesLoading ? (<span className="animate-pulse">Loading...</span>) : ("".concat(totalBalanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), " USDT"))}
                </div>

                {/* Auto-Conversion Info */}
                <div className="mt-4 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="text-blue-400 text-sm font-medium flex items-center mb-2">
                    <span className="mr-2">💱</span>
                    Auto-Conversion System Active
                  </div>
                  <div className="text-blue-300 text-xs space-y-1">
                    <div>• All cryptocurrency deposits are automatically converted to USDT</div>
                    <div>• Real-time conversion with competitive rates</div>
                    <div>• Unified balance for easy management and instant withdrawals</div>
                  </div>
                </div>


              </div>

              {/* My Assets Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">My assets</h2>
                  <div className="text-sm text-gray-400">
                    {userBalances ? "".concat(userBalances.filter(function (b) { return parseFloat(b.available) > 0; }).length, " assets") : '0 assets'}
                  </div>
                </div>

                {balancesLoading ? (<div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
                    <div className="text-center text-gray-400">
                      <div className="animate-pulse">Loading assets...</div>
                    </div>
                  </div>) : userBalances && userBalances.some(function (balance) { return parseFloat(balance.available) > 0; }) ? (<div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                    {/* Assets Table Header - Desktop */}
                    <div className="hidden md:grid grid-cols-5 gap-4 p-4 bg-gray-700/30 border-b border-gray-600">
                      <div className="text-sm font-medium text-gray-300">Name</div>
                      <div className="text-sm font-medium text-gray-300">Available assets</div>
                      <div className="text-sm font-medium text-gray-300">Occupy</div>
                      <div className="text-sm font-medium text-gray-300">Amount in USDT</div>
                      <div className="text-sm font-medium text-gray-300 text-right">Action</div>
                    </div>

                    {/* Assets Table Body */}
                    <div className="divide-y divide-gray-600">
                      {userBalances
                    .filter(function (balance) { return parseFloat(balance.available) > 0; })
                    .map(function (balance) {
                    var available = parseFloat(balance.available);
                    var locked = parseFloat(balance.locked || '0');
                    // Use real-time market price
                    var price = getMarketPrice(balance.symbol);
                    var usdtValue = available * price;
                    // Crypto icons mapping
                    var cryptoIcons = {
                        BTC: '₿',
                        ETH: 'Ξ',
                        SOL: '◎',
                        USDT: '₮',
                        BNB: 'BNB',
                        USDC: 'USDC',
                        BUSD: 'BUSD'
                    };
                    // Crypto icon colors
                    var cryptoColors = {
                        BTC: 'bg-orange-500',
                        ETH: 'bg-blue-500',
                        SOL: 'bg-purple-500',
                        USDT: 'bg-green-500',
                        BNB: 'bg-yellow-500',
                        USDC: 'bg-blue-600',
                        BUSD: 'bg-yellow-600'
                    };
                    return (<div key={balance.symbol}>
                              {/* Desktop Layout */}
                              <div className="hidden md:grid grid-cols-5 gap-4 p-4 hover:bg-gray-700/20 transition-colors">
                                {/* Name */}
                                <div className="flex items-center space-x-3">
                                  <div className={"w-8 h-8 ".concat(cryptoColors[balance.symbol] || 'bg-gray-500', " rounded-full flex items-center justify-center text-white font-bold text-sm")}>
                                    {cryptoIcons[balance.symbol] || balance.symbol.charAt(0)}
                                  </div>
                                  <span className="text-white font-medium">{balance.symbol}</span>
                                </div>

                                {/* Available assets */}
                                <div className="text-white">
                                  {available.toFixed(8)}
                                </div>

                                {/* Occupy (locked) */}
                                <div className="text-white">
                                  {locked.toFixed(8)}
                                </div>

                                {/* Amount in USDT */}
                                <div className="text-white">
                                  {usdtValue.toFixed(2)}
                                </div>

                                {/* Action - Convert to USDT button (only for non-USDT assets) */}
                                <div className="text-right">
                                  {balance.symbol !== 'USDT' ? (<button onClick={function () { return openConvertModal(balance.symbol, available.toString()); }} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                                      Convert to USDT
                                    </button>) : (<span className="text-gray-500 text-sm">-</span>)}
                                </div>
                              </div>

                              {/* Mobile Layout */}
                              <div className="md:hidden p-4 hover:bg-gray-700/20 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className={"w-10 h-10 ".concat(cryptoColors[balance.symbol] || 'bg-gray-500', " rounded-full flex items-center justify-center text-white font-bold")}>
                                      {cryptoIcons[balance.symbol] || balance.symbol.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="text-white font-medium">{balance.symbol}</div>
                                      <div className="text-gray-400 text-sm">{usdtValue.toFixed(2)} USDT</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                  <div>
                                    <div className="text-gray-400 mb-1">Available</div>
                                    <div className="text-white">{available.toFixed(8)}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-400 mb-1">Occupy</div>
                                    <div className="text-white">{locked.toFixed(8)}</div>
                                  </div>
                                </div>

                                {/* Convert button for mobile (only for non-USDT assets) */}
                                {balance.symbol !== 'USDT' && (<button onClick={function () { return openConvertModal(balance.symbol, available.toString()); }} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                                    Convert to USDT
                                  </button>)}
                              </div>
                            </div>);
                })}
                    </div>
                  </div>) : (<div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl text-gray-400">💰</span>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">No Data</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        You don't have any cryptocurrency assets yet.
                      </p>
                      <p className="text-gray-500 text-xs">
                        Start trading or deposit funds to see your assets here.
                      </p>
                    </div>
                  </div>)}
              </div>

            </div>
          </div>)}

        {activeTab === "Deposit" && (<div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">Deposit</h1>

              {/* Grid Layout: Form + History */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Funds Section - Left Side (2 columns) */}
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Add Funds</CardTitle>
                      <CardDescription className="text-gray-400">
                        Top up your account balance with cryptocurrency
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Deposit Network Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Deposit network
                          </label>
                          <select value={selectedCrypto} onChange={function (e) { return setSelectedCrypto(e.target.value); }} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                            <option value="SOL">SOL</option>
                            <option value="USDT-ERC20">USDT-ERC20</option>
                            <option value="USDT-TRC20">USDT-TRC20</option>
                            <option value="USDT-BEP20">USDT-BEP20</option>
                          </select>
                        </div>

                        {/* Deposit Amount */}
                        <div>
                          <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-300 mb-2">
                            Deposit amount <span className="text-red-400">*</span>
                          </label>
                          <input id="depositAmount" name="depositAmount" type="text" inputMode="decimal" placeholder="Please enter the recharge amount" value={depositAmount} onChange={function (e) {
                // Only allow numbers and decimal point
                var value = e.target.value.replace(/[^0-9.]/g, '');
                // Prevent multiple decimal points
                var parts = value.split('.');
                if (parts.length > 2)
                    return;
                setDepositAmount(value);
            }} className={"w-full bg-gray-800 border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ".concat(!depositAmount ? 'border-red-500' : 'border-gray-600')}/>
                          <p className="text-xs text-gray-500 mt-1">
                            Minimum: {(_b = cryptoNetworks[selectedCrypto]) === null || _b === void 0 ? void 0 : _b.minAmount} {selectedCrypto}
                          </p>

                          {/* Auto-Convert Info with Real-Time Price - Only for non-USDT currencies */}
                          {depositAmount && parseFloat(depositAmount) > 0 && !selectedCrypto.startsWith('USDT') && (<div className="mt-3 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg">
                              <div className="flex items-center mb-2">
                                <span className="text-purple-400 text-sm font-medium">💱 Auto-convert:</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-300 text-xs">You deposit:</span>
                                  <span className="text-white text-sm font-bold">{depositAmount} {selectedCrypto}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-300 text-xs">Current price:</span>
                                  <span className="text-blue-300 text-sm font-medium">
                                    {getMarketPrice(selectedCrypto).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                                  </span>
                                </div>
                                <div className="border-t border-purple-500/20 my-2"></div>
                                <div className="flex justify-between items-center">
                                  <span className="text-purple-300 text-xs font-medium">You will receive:</span>
                                  <span className="text-green-400 text-base font-bold">
                                    ≈ {(parseFloat(depositAmount) * getMarketPrice(selectedCrypto)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 mt-2 italic">
                                * Your {selectedCrypto} will be automatically converted to USDT at the current market rate
                              </p>
                            </div>)}
                        </div>

                        {/* Platform Deposit Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Platform Deposit Address
                          </label>
                          <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg mb-2">
                            <p className="text-blue-300 text-xs mb-1">
                              ⚠️ Send {selectedCrypto} to this address to deposit funds to your METACHROME account
                            </p>
                            <p className="text-yellow-300 text-xs">
                              <strong>Important:</strong> Only send on {(_c = cryptoNetworks[selectedCrypto]) === null || _c === void 0 ? void 0 : _c.network}.
                              Sending on wrong network will result in loss of funds!
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                            <span className="text-white text-sm font-mono flex-1 break-all">
                              {(_d = cryptoNetworks[selectedCrypto]) === null || _d === void 0 ? void 0 : _d.address}
                            </span>
                            <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 p-2 hover:bg-gray-700" onClick={function () { var _a; return copyToClipboard((_a = cryptoNetworks[selectedCrypto]) === null || _a === void 0 ? void 0 : _a.address); }}>
                              <Copy className="w-4 h-4"/>
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Network: {(_e = cryptoNetworks[selectedCrypto]) === null || _e === void 0 ? void 0 : _e.network}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {(_f = cryptoNetworks[selectedCrypto]) === null || _f === void 0 ? void 0 : _f.description}
                          </p>
                        </div>

                        {/* QR Code */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            QR Code - Deposit Address
                          </label>

                          <div className="text-center">
                            <div className="bg-white p-6 rounded-lg inline-block">
                              <QRCodeGenerator value={generateQRCode()} size={200} className="mx-auto"/>
                            </div>
                            <p className="text-xs text-gray-300 mt-3">
                              Scan to see deposit information (copy the address manually)
                            </p>
                            <p className="text-xs text-yellow-300 mt-1">
                              Make sure to send on <strong>{(_g = cryptoNetworks[selectedCrypto]) === null || _g === void 0 ? void 0 : _g.network}</strong>
                            </p>
                            <p className="text-xs text-blue-300 mt-1">
                              Address: {(_h = cryptoNetworks[selectedCrypto]) === null || _h === void 0 ? void 0 : _h.address}
                            </p>
                          </div>

                          {/* Copy Address Button */}
                          <div className="mt-4">
                            <Button onClick={function () { var _a; return copyToClipboard((_a = cryptoNetworks[selectedCrypto]) === null || _a === void 0 ? void 0 : _a.address); }} className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
                              <Copy className="w-4 h-4 mr-2"/>
                              Copy Deposit Address
                            </Button>
                          </div>

                          {/* Additional Info */}
                          <div className="mt-4 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-300 mb-2">💡 How to use:</h5>
                            <ul className="text-xs text-gray-400 space-y-1">
                              <li>• <strong>Scan QR Code:</strong> View deposit info (manually copy the address)</li>
                              <li>• <strong>Copy Address:</strong> Click the button to copy address to clipboard</li>
                              <li>• <strong>Manual Entry:</strong> Type or paste address in your wallet</li>
                              <li>• <strong>Send Crypto:</strong> Send to the address on the correct network</li>
                              <li>• <strong>Upload Receipt:</strong> Upload transaction proof and confirm</li>
                            </ul>
                          </div>
                        </div>

                        {/* Upload Receipt */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Upload receipt <span className="text-red-400">*</span>
                          </label>
                          <div className={"border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors ".concat(!uploadedFile ? 'border-red-500' : 'border-gray-600')} onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
                            {uploadedFile ? (<div className="flex items-center justify-center space-x-2">
                                <CheckCircle className="w-6 h-6 text-green-500"/>
                                <span className="text-green-400 text-sm">{uploadedFile.name}</span>
                              </div>) : (<>
                                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                                <p className="text-gray-400 text-sm">Click to upload receipt</p>
                                <p className="text-gray-500 text-xs mt-1">JPEG, PNG, PDF (max 5MB)</p>
                              </>)}
                          </div>
                          <input id="receiptUpload" name="receiptUpload" ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" onChange={handleFileUpload} className="hidden"/>
                        </div>

                        {/* Required Fields Notice */}
                        {(!depositAmount || !uploadedFile) && (<div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg mb-4">
                            <p className="text-yellow-300 text-sm">
                              ⚠️ Please complete all required fields:
                            </p>
                            <ul className="text-yellow-200 text-xs mt-1 ml-4">
                              {!depositAmount && <li>• Enter deposit amount</li>}
                              {!uploadedFile && <li>• Upload transaction receipt</li>}
                            </ul>
                          </div>)}

                        {/* Confirm Button */}
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleDepositSubmit} disabled={depositMutation.isPending || !depositAmount || !uploadedFile}>
                          {depositMutation.isPending ? 'Processing...' : 'Confirm recharge'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Deposit History - Right Side (1 column) */}
                <div className="lg:col-span-1">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-white text-lg font-semibold mb-4">Recent Deposits</h3>
                      <div className="space-y-4">
                        {/* Real deposit history */}
                        {depositHistory.length > 0 ? (depositHistory.slice(0, 3).map(function (deposit, index) { return (<div key={deposit.id || index} className="border-b border-gray-700 pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-white text-sm font-medium">
                                    {deposit.amount} {deposit.currency}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {deposit.currency} Network
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(deposit.created_at || deposit.timestamp).toLocaleDateString()} {new Date(deposit.created_at || deposit.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                                <span className={"px-2 py-1 rounded text-xs ".concat(deposit.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : deposit.status === 'approved' || deposit.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400')}>
                                  {deposit.status === 'approved' ? 'Completed' : deposit.status === 'pending' ? 'Pending' : deposit.status === 'rejected' ? 'Rejected' : deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                                </span>
                              </div>
                            </div>); })) : (<div className="text-center py-8">
                            <div className="text-gray-400 text-sm">No deposit history</div>
                          </div>)}

                        <div className="text-center">
                          <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                            View All History
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>)}

        {activeTab === "Withdraw" && (<div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">Withdraw</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Withdrawal Form */}
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {/* Cryptocurrency - Fixed to USDT */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Cryptocurrency</Label>
                          <div className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                            USDT
                          </div>
                        </div>

                        {/* Network Selection */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Network</Label>
                          <select value={selectedNetwork} onChange={function (e) { return setSelectedNetwork(e.target.value); }} className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500">
                            <option value="ERC20">USDT ERC20 (Ethereum Network)</option>
                            <option value="TRC20">USDT TRC20 (Tron Network)</option>
                            <option value="BEP20">USDT BEP20 (BNB Chain)</option>
                          </select>
                          <div className="text-xs text-gray-400 mt-1">
                            Please ensure you select the correct network to avoid loss of funds
                          </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Withdrawal Amount</Label>
                          <div className="relative mt-2">
                            <Input id="withdrawAmount" name="withdrawAmount" type="text" inputMode="decimal" placeholder="0.00" value={withdrawAmount} onChange={function (e) {
                // Only allow numbers and decimal point
                var value = e.target.value.replace(/[^0-9.]/g, '');
                // Prevent multiple decimal points
                var parts = value.split('.');
                if (parts.length > 2)
                    return;
                setWithdrawAmount(value);
            }} className="bg-gray-700 border-gray-600 text-white pr-16 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"/>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                              USDT
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>Available: {((_j = balances.find(function (b) { return b.symbol === 'USDT'; })) === null || _j === void 0 ? void 0 : _j.available) || '0'} USDT</span>
                            <button onClick={function () { var _a; return setWithdrawAmount(((_a = balances.find(function (b) { return b.symbol === 'USDT'; })) === null || _a === void 0 ? void 0 : _a.available) || '0'); }} className="text-purple-400 hover:text-purple-300">
                              Max
                            </button>
                          </div>
                        </div>

                        {/* Withdrawal Address */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Withdrawal Address</Label>
                          <Input id="withdrawAddress" name="withdrawAddress" type="text" placeholder={withdrawAddress ? withdrawAddress : "Set withdrawal address in Profile first"} value={withdrawAddress} disabled={true} className="mt-2 bg-gray-700 border-gray-600 text-white opacity-75 cursor-not-allowed"/>
                          <div className="text-xs text-gray-400 mt-1">
                            🔒 Withdrawal address is locked and auto-filled from your Profile. To change it, update your profile settings.
                          </div>
                        </div>

                        {/* Login Password for Security */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Login Password</Label>
                          <Input id="fundPassword" name="fundPassword" type="password" placeholder="Enter your login password" value={fundPassword} onChange={function (e) { return setFundPassword(e.target.value); }} className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"/>
                          <div className="text-xs text-gray-400 mt-1">
                            Your login password is required for security verification
                          </div>
                        </div>

                        {/* Minimum Trade Requirement Warning */}
                        {completedTradesCount < 2 && (<div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-yellow-500 font-semibold text-sm mb-1">Minimum Trade Requirement</h4>
                                <p className="text-yellow-200/80 text-sm">
                                  You need to complete at least <strong>2 trades</strong> before you can withdraw.
                                  Current completed trades: <strong>{completedTradesCount}/2</strong>
                                </p>
                                <p className="text-yellow-200/60 text-xs mt-2">
                                  Please complete {2 - completedTradesCount} more trade{2 - completedTradesCount > 1 ? 's' : ''} to unlock withdrawal.
                                </p>
                              </div>
                            </div>
                          </div>)}

                        {/* Withdrawal Button */}
                        <Button onClick={function () {
                // Check minimum trade requirement first
                if (completedTradesCount < 2) {
                    toast({
                        title: 'Withdrawal Not Available',
                        description: "You need to complete at least 2 trades before withdrawing. Current: ".concat(completedTradesCount, "/2 trades completed."),
                        variant: 'destructive',
                    });
                    return;
                }
                if (!withdrawAddress || !withdrawAmount || !fundPassword || parseFloat(withdrawAmount) <= 0) {
                    toast({
                        title: 'Invalid Input',
                        description: 'Please fill in all required fields',
                        variant: 'destructive',
                    });
                    return;
                }
                withdrawMutation.mutate({
                    address: withdrawAddress,
                    amount: withdrawAmount,
                    currency: 'USDT',
                    password: fundPassword
                });
            }} disabled={completedTradesCount < 2 || !withdrawAddress || !withdrawAmount || !fundPassword || withdrawMutation.isPending} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                          {withdrawMutation.isPending ? 'Processing Withdrawal...' :
                completedTradesCount < 2 ? "Complete ".concat(2 - completedTradesCount, " More Trade").concat(2 - completedTradesCount > 1 ? 's' : '', " to Withdraw") :
                    "Confirm Withdrawal"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Withdrawal History */}
                <div className="lg:col-span-1">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-white text-lg font-semibold mb-4">Recent Withdrawals</h3>
                      <div className="space-y-4">
                        {/* Real withdrawal history */}
                        {withdrawalHistory.length > 0 ? (withdrawalHistory.slice(0, 3).map(function (withdrawal, index) { return (<div key={withdrawal.id || index} className="border-b border-gray-700 pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-white text-sm font-medium">
                                    {withdrawal.amount} {withdrawal.currency}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {withdrawal.currency} Network
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(withdrawal.created_at || withdrawal.timestamp).toLocaleDateString()} {new Date(withdrawal.created_at || withdrawal.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                                <span className={"px-2 py-1 rounded text-xs ".concat(withdrawal.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : withdrawal.status === 'approved' || withdrawal.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400')}>
                                  {withdrawal.status === 'approved' ? 'Completed' : withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                </span>
                              </div>
                            </div>); })) : (<div className="text-center py-8">
                            <div className="text-gray-400 text-sm">No withdrawal history</div>
                          </div>)}

                        <div className="text-center">
                          <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                            View All History
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>)}

        {activeTab === "Transfer" && (<div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">Transfer</h1>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Send className="w-8 h-8 text-gray-400"/>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Transfer Feature</h3>
                    <p className="text-gray-400 mb-6">
                      Transfer functionality will be available soon. Stay tuned for updates.
                    </p>

                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>)}
      </div>

      {/* Transaction Hash Modal */}
      <Dialog open={showTxHashModal} onOpenChange={setShowTxHashModal}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Enter Transaction Hash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Please enter your transaction hash for verification. This helps us confirm your deposit.
            </p>
            <div>
              <Label htmlFor="txHash" className="text-gray-300">Transaction Hash</Label>
              <Input id="txHash" type="text" placeholder="0x..." value={txHash} onChange={function (e) { return setTxHash(e.target.value); }} className="bg-gray-700 border-gray-600 text-white mt-2"/>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={function () {
            setShowTxHashModal(false);
            setTxHash('');
            setPendingDepositData(null);
        }} className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={handleTxHashSubmit} disabled={!txHash.trim() || depositMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                {depositMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Reference Modal */}
      <Dialog open={showBankRefModal} onOpenChange={setShowBankRefModal}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Enter Bank Transfer Reference</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Please enter your bank transfer reference number. This helps us verify your payment.
            </p>
            <div>
              <Label htmlFor="bankRef" className="text-gray-300">Transfer Reference Number</Label>
              <Input id="bankRef" type="text" placeholder="Enter reference number" value={bankRef} onChange={function (e) { return setBankRef(e.target.value); }} className="bg-gray-700 border-gray-600 text-white mt-2"/>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={function () {
            setShowBankRefModal(false);
            setBankRef('');
            setPendingDepositData(null);
        }} className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </Button>
              <Button onClick={handleBankRefSubmit} disabled={!bankRef.trim() || depositMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                {depositMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      <Dialog open={showStripeModal} onOpenChange={setShowStripeModal}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Credit/Debit Card Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Complete your payment securely with Stripe. Your card information is encrypted and secure.
            </p>
            {pendingDepositData && (<StripePayment amount={pendingDepositData.amount} currency="usd" // Convert crypto to USD for Stripe
         onSuccess={handleStripeSuccess} onError={handleStripeError}/>)}
            <Button variant="outline" onClick={function () {
            setShowStripeModal(false);
            setPendingDepositData(null);
        }} className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert to USDT Modal */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Convert {convertingSymbol} to USDT</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {convertingSymbol && (<>
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Available {convertingSymbol}:</span>
                    <span className="text-white font-medium">
                      {((_k = userBalances === null || userBalances === void 0 ? void 0 : userBalances.find(function (b) { return b.symbol === convertingSymbol; })) === null || _k === void 0 ? void 0 : _k.available) || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-white font-medium">
                      ${getMarketPrice(convertingSymbol).toLocaleString()} USDT
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">You will receive:</span>
                    <span className="text-green-400 font-bold">
                      ~${(parseFloat(convertAmount || '0') * getMarketPrice(convertingSymbol)).toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Amount to convert:</label>
                  <div className="relative">
                    <input type="number" value={convertAmount} onChange={function (e) { return setConvertAmount(e.target.value); }} placeholder="0.00" step="0.00000001" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"/>
                    <button onClick={function () {
                var _a;
                var maxAmount = ((_a = userBalances === null || userBalances === void 0 ? void 0 : userBalances.find(function (b) { return b.symbol === convertingSymbol; })) === null || _a === void 0 ? void 0 : _a.available) || '0';
                setConvertAmount(maxAmount);
            }} className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors">
                      MAX
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-xs">
                    ⚠️ This will instantly sell your {convertingSymbol} at market price and convert to USDT. This action cannot be undone.
                  </p>
                </div>
              </>)}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={function () {
            setShowConvertModal(false);
            setConvertingSymbol(null);
            setConvertAmount('');
        }} className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700" disabled={isConverting}>
              Cancel
            </Button>
            <Button onClick={function () { return convertingSymbol && handleConvertToUSDT(convertingSymbol, convertAmount); }} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" disabled={isConverting || !convertAmount || parseFloat(convertAmount) <= 0}>
              {isConverting ? 'Converting...' : 'Convert Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>);
}
