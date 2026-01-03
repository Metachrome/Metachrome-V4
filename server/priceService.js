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
import axios from 'axios';
import WebSocket from 'ws';
import { storage } from './storage';
var PriceService = /** @class */ (function () {
    function PriceService() {
        var _this = this;
        this.updateInterval = null;
        this.UPDATE_INTERVAL = 5000; // 5 seconds
        this.binanceWs = null;
        this.priceCallbacks = new Map();
        this.lastPrices = new Map();
        this.updateCount = 0;
        // Major trading pairs to track - Updated to match TradingViewWidget currencies
        this.MAJOR_PAIRS = [
            'BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'LTCUSDT', 'BNBUSDT',
            'SOLUSDT', 'TONUSDT', 'DOGEUSDT', 'ADAUSDT', 'TRXUSDT',
            'HYPEUSDT', 'LINKUSDT', 'AVAXUSDT', 'SUIUSDT', 'SHIBUSDT',
            'BCHUSDT', 'DOTUSDT', 'POLUSDT', 'XLMUSDT'
        ];
        // Skip external connections in development mode for faster startup
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Development mode: Skipping external price feeds for faster startup');
            console.log('📊 Using mock price data for development');
            this.startPriceUpdates(); // Use local mock data instead
        }
        else {
            // Production mode - delay WebSocket initialization
            setTimeout(function () {
                _this.initializeWebSocket();
            }, 2000); // 2 second delay
        }
    }
    // Initialize Binance WebSocket for real-time prices
    PriceService.prototype.initializeWebSocket = function () {
        var _this = this;
        try {
            var streams = this.MAJOR_PAIRS.map(function (pair) { return "".concat(pair.toLowerCase(), "@ticker"); }).join('/');
            var wsUrl = "wss://stream.binance.com:9443/ws/".concat(streams);
            console.log('🔌 Attempting to connect to Binance WebSocket...');
            // Add connection timeout
            var connectionTimeout_1 = setTimeout(function () {
                console.log('⏰ WebSocket connection timeout, falling back to polling mode');
                _this.fallbackToPolling();
            }, 10000); // 10 second timeout
            this.binanceWs = new WebSocket(wsUrl);
            this.binanceWs.on('open', function () {
                clearTimeout(connectionTimeout_1);
                console.log('✅ Connected to Binance WebSocket for real-time prices');
            });
            this.binanceWs.on('message', function (data) {
                try {
                    var ticker = JSON.parse(data.toString());
                    _this.handlePriceUpdate(ticker);
                }
                catch (error) {
                    console.error('Error parsing WebSocket data:', error);
                }
            });
            this.binanceWs.on('error', function (error) {
                clearTimeout(connectionTimeout_1);
                console.error('Binance WebSocket error:', error);
                _this.fallbackToPolling();
            });
            this.binanceWs.on('close', function () {
                clearTimeout(connectionTimeout_1);
                console.log('Binance WebSocket closed, falling back to polling mode');
                _this.fallbackToPolling();
            });
        }
        catch (error) {
            console.error('Error initializing WebSocket:', error);
            this.fallbackToPolling();
        }
    };
    PriceService.prototype.reconnectWebSocket = function () {
        var _this = this;
        setTimeout(function () {
            _this.initializeWebSocket();
        }, 5000);
    };
    PriceService.prototype.fallbackToPolling = function () {
        console.log('Falling back to polling mode');
        this.startPriceUpdates();
    };
    PriceService.prototype.handlePriceUpdate = function (ticker) {
        var priceData = {
            symbol: ticker.s,
            price: ticker.c,
            priceChange24h: ticker.p,
            priceChangePercent24h: ticker.P,
            high24h: ticker.h,
            low24h: ticker.l,
            volume24h: ticker.v,
        };
        this.lastPrices.set(ticker.s, priceData);
        // Update database
        this.updateMarketDataInDB(priceData);
        // Notify callbacks
        var callbacks = this.priceCallbacks.get(ticker.s);
        if (callbacks) {
            callbacks.forEach(function (callback) { return callback(ticker.c); });
        }
    };
    PriceService.prototype.updateMarketDataInDB = function (priceData) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, storage.updateMarketData(priceData.symbol, {
                                price: priceData.price,
                                priceChange24h: priceData.priceChange24h,
                                priceChangePercent24h: priceData.priceChangePercent24h,
                                high24h: priceData.high24h,
                                low24h: priceData.low24h,
                                volume24h: priceData.volume24h,
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Error updating market data for ".concat(priceData.symbol, ":"), error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Subscribe to price updates for a specific symbol
    PriceService.prototype.subscribeToPriceUpdates = function (symbol, callback) {
        if (!this.priceCallbacks.has(symbol)) {
            this.priceCallbacks.set(symbol, []);
        }
        this.priceCallbacks.get(symbol).push(callback);
    };
    // Unsubscribe from price updates
    PriceService.prototype.unsubscribeFromPriceUpdates = function (symbol, callback) {
        var callbacks = this.priceCallbacks.get(symbol);
        if (callbacks) {
            var index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    };
    // Binance API for initial data load
    PriceService.prototype.fetchBinancePrices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios.get('https://api.binance.com/api/v3/ticker/24hr')];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        return [2 /*return*/, data
                                .filter(function (ticker) { return _this.MAJOR_PAIRS.includes(ticker.symbol); })
                                .map(function (ticker) { return ({
                                symbol: ticker.symbol,
                                price: ticker.lastPrice,
                                priceChange24h: ticker.priceChange,
                                priceChangePercent24h: ticker.priceChangePercent,
                                high24h: ticker.highPrice,
                                low24h: ticker.lowPrice,
                                volume24h: ticker.volume,
                            }); })];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error fetching Binance prices:', error_2);
                        return [2 /*return*/, this.getFallbackPrices()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Fallback mock prices if API fails
    PriceService.prototype.getFallbackPrices = function () {
        return [
            {
                symbol: 'BTCUSDT',
                price: '118113.00',
                priceChange24h: '1200.50',
                priceChangePercent24h: '1.03',
                high24h: '119500.00',
                low24h: '117200.00',
                volume24h: '28547.85',
            },
            {
                symbol: 'ETHUSDT',
                price: '3776.75',
                priceChange24h: '85.30',
                priceChangePercent24h: '2.31',
                high24h: '3850.00',
                low24h: '3650.00',
                volume24h: '185647.25',
            },
            {
                symbol: 'BNBUSDT',
                price: '720.50',
                priceChange24h: '12.80',
                priceChangePercent24h: '1.81',
                high24h: '735.00',
                low24h: '705.20',
                volume24h: '2547896.30',
            },
            {
                symbol: 'DOGEUSDT',
                price: '0.238780',
                priceChange24h: '0.008',
                priceChangePercent24h: '3.47',
                high24h: '0.245000',
                low24h: '0.230000',
                volume24h: '15847963.25',
            },
            {
                symbol: 'XRPUSDT',
                price: '3.188300',
                priceChange24h: '0.125',
                priceChangePercent24h: '4.08',
                high24h: '3.250000',
                low24h: '3.050000',
                volume24h: '8547896.30',
            },
            {
                symbol: 'SOLUSDT',
                price: '98.45',
                priceChange24h: '5.12',
                priceChangePercent24h: '5.49',
                high24h: '102.00',
                low24h: '94.00',
                volume24h: '3547896.30',
            },
            {
                symbol: 'ADAUSDT',
                price: '0.485',
                priceChange24h: '-0.012',
                priceChangePercent24h: '-2.34',
                high24h: '0.520',
                low24h: '0.470',
                volume24h: '847896.30',
            },
            {
                symbol: 'POLUSDT',
                price: '0.8945',
                priceChange24h: '0.028',
                priceChangePercent24h: '3.21',
                high24h: '0.920',
                low24h: '0.860',
                volume24h: '647896.30',
            },
            {
                symbol: 'AVAXUSDT',
                price: '36.78',
                priceChange24h: '-0.54',
                priceChangePercent24h: '-1.45',
                high24h: '38.20',
                low24h: '35.90',
                volume24h: '747896.30',
            },
            {
                symbol: 'LINKUSDT',
                price: '14.56',
                priceChange24h: '0.41',
                priceChangePercent24h: '2.89',
                high24h: '15.10',
                low24h: '14.20',
                volume24h: '447896.30',
            },
            {
                symbol: 'LTCUSDT',
                price: '73.45',
                priceChange24h: '1.21',
                priceChangePercent24h: '1.67',
                high24h: '75.20',
                low24h: '71.80',
                volume24h: '387896.30',
            },
            {
                symbol: 'DOTUSDT',
                price: '5.89',
                priceChange24h: '-0.19',
                priceChangePercent24h: '-3.12',
                high24h: '6.15',
                low24h: '5.75',
                volume24h: '297896.30',
            },
            {
                symbol: 'UNIUSDT',
                price: '6.78',
                priceChange24h: '0.30',
                priceChangePercent24h: '4.56',
                high24h: '7.05',
                low24h: '6.45',
                volume24h: '347896.30',
            },
            {
                symbol: 'SHIBUSDT',
                price: '0.000009234',
                priceChange24h: '0.000000759',
                priceChangePercent24h: '8.92',
                high24h: '0.000009850',
                low24h: '0.000008650',
                volume24h: '287896300000',
            },
        ];
    };
    // Update market data in database
    PriceService.prototype.updateMarketData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prices, _i, prices_1, priceData, prices, _a, prices_2, priceData, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 13]);
                        if (!(process.env.NODE_ENV === 'development')) return [3 /*break*/, 5];
                        console.log('📊 Development mode: Using mock price data instead of Binance API');
                        prices = this.getFallbackPrices();
                        _i = 0, prices_1 = prices;
                        _b.label = 1;
                    case 1:
                        if (!(_i < prices_1.length)) return [3 /*break*/, 4];
                        priceData = prices_1[_i];
                        return [4 /*yield*/, storage.updateMarketData(priceData.symbol, {
                                price: priceData.price,
                                priceChange24h: priceData.priceChange24h,
                                priceChangePercent24h: priceData.priceChangePercent24h,
                                high24h: priceData.high24h,
                                low24h: priceData.low24h,
                                volume24h: priceData.volume24h,
                            })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // Only log every 10th update in development to reduce noise
                        if (!this.updateCount || this.updateCount % 10 === 0) {
                            console.log("Updated market data for ".concat(prices.length, " symbols (mock data) - update #").concat(this.updateCount || 1));
                        }
                        this.updateCount = (this.updateCount || 0) + 1;
                        return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.fetchBinancePrices()];
                    case 6:
                        prices = _b.sent();
                        _a = 0, prices_2 = prices;
                        _b.label = 7;
                    case 7:
                        if (!(_a < prices_2.length)) return [3 /*break*/, 10];
                        priceData = prices_2[_a];
                        return [4 /*yield*/, storage.updateMarketData(priceData.symbol, {
                                price: priceData.price,
                                priceChange24h: priceData.priceChange24h,
                                priceChangePercent24h: priceData.priceChangePercent24h,
                                high24h: priceData.high24h,
                                low24h: priceData.low24h,
                                volume24h: priceData.volume24h,
                            })];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        _a++;
                        return [3 /*break*/, 7];
                    case 10:
                        console.log("Updated market data for ".concat(prices.length, " symbols (Binance API)"));
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_3 = _b.sent();
                        console.error('Error updating market data:', error_3);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    // Start automatic price updates
    PriceService.prototype.startPriceUpdates = function () {
        var _this = this;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        // Initial update
        this.updateMarketData();
        // Set up recurring updates - less frequent in development
        var interval = process.env.NODE_ENV === 'development' ? 30000 : this.UPDATE_INTERVAL; // 30s in dev, 5s in prod
        this.updateInterval = setInterval(function () {
            _this.updateMarketData();
        }, interval);
        console.log("Started price updates every ".concat(interval / 1000, " seconds (").concat(process.env.NODE_ENV === 'development' ? 'development mode' : 'production mode', ")"));
    };
    // Stop automatic price updates
    PriceService.prototype.stopPriceUpdates = function () {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('Stopped price updates');
        }
    };
    // Get current price for a specific symbol
    PriceService.prototype.getCurrentPrice = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var marketData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, storage.getMarketData(symbol)];
                    case 1:
                        marketData = _a.sent();
                        return [2 /*return*/, (marketData === null || marketData === void 0 ? void 0 : marketData.price) || null];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error getting current price for ".concat(symbol, ":"), error_4);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Simulate price movement for admin-controlled trades
    PriceService.prototype.simulatePriceMovement = function (currentPrice, direction, percentage) {
        if (percentage === void 0) { percentage = 0.1; }
        var price = parseFloat(currentPrice);
        var change = price * (percentage / 100);
        if (direction === 'up') {
            return (price + change).toFixed(8);
        }
        else {
            return (price - change).toFixed(8);
        }
    };
    return PriceService;
}());
export var priceService = new PriceService();
