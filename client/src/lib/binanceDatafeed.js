/**
 * TradingView Custom Datafeed for Binance API
 *
 * This datafeed connects TradingView Advanced Charts to Binance API
 * ensuring all price data comes from a single source (Binance)
 *
 * Based on: https://github.com/tradingview/charting_library/wiki/JS-Api
 */
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
// Map TradingView intervals to Binance intervals
var resolutionMap = {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '360': '6h',
    '480': '8h',
    '720': '12h',
    'D': '1d',
    '1D': '1d',
    '3D': '3d',
    'W': '1w',
    '1W': '1w',
    'M': '1M',
    '1M': '1M'
};
var BinanceDatafeed = /** @class */ (function () {
    function BinanceDatafeed() {
        this.lastBar = null;
        this.subscribers = {};
    }
    // Configuration
    BinanceDatafeed.prototype.onReady = function (callback) {
        console.log('📊 [Binance Datafeed] onReady called');
        setTimeout(function () {
            callback({
                supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', 'D', '3D', 'W', 'M'],
                exchanges: [{ value: 'Binance', name: 'Binance', desc: 'Binance' }],
                symbols_types: [{ name: 'crypto', value: 'crypto' }]
            });
        }, 0);
    };
    // Search symbols
    BinanceDatafeed.prototype.searchSymbols = function (userInput, exchange, symbolType, onResult) {
        console.log('📊 [Binance Datafeed] searchSymbols:', userInput);
        var symbols = [
            {
                symbol: 'BTCUSDT',
                full_name: 'Binance:BTCUSDT',
                description: 'Bitcoin / Tether',
                exchange: 'Binance',
                type: 'crypto'
            },
            {
                symbol: 'ETHUSDT',
                full_name: 'Binance:ETHUSDT',
                description: 'Ethereum / Tether',
                exchange: 'Binance',
                type: 'crypto'
            }
        ];
        var filtered = symbols.filter(function (s) {
            return s.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
                s.description.toLowerCase().includes(userInput.toLowerCase());
        });
        onResult(filtered);
    };
    // Resolve symbol
    BinanceDatafeed.prototype.resolveSymbol = function (symbolName, onResolve, onError) {
        console.log('📊 [Binance Datafeed] resolveSymbol:', symbolName);
        var symbol = symbolName.replace('Binance:', '').toUpperCase();
        var symbolInfo = {
            name: symbol,
            ticker: symbol,
            description: "".concat(symbol, " / USDT"),
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: 'Binance',
            minmov: 1,
            pricescale: 100,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', 'D', '3D', 'W', 'M'],
            volume_precision: 2,
            data_status: 'streaming'
        };
        setTimeout(function () { return onResolve(symbolInfo); }, 0);
    };
    // Get historical bars
    BinanceDatafeed.prototype.getBars = function (symbolInfo, resolution, periodParams, onResult, onError) {
        return __awaiter(this, void 0, void 0, function () {
            var from, to, firstDataRequest, interval, symbol, limit, response, result, bars, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        from = periodParams.from, to = periodParams.to, firstDataRequest = periodParams.firstDataRequest;
                        console.log('📊 [Binance Datafeed] getBars:', {
                            symbol: symbolInfo.name,
                            resolution: resolution,
                            from: new Date(from * 1000).toISOString(),
                            to: new Date(to * 1000).toISOString(),
                            firstDataRequest: firstDataRequest
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        interval = resolutionMap[resolution] || '1m';
                        symbol = symbolInfo.name;
                        limit = Math.min(1000, Math.ceil((to - from) / this.getIntervalSeconds(interval)));
                        return [4 /*yield*/, fetch("/api/binance/klines?symbol=".concat(symbol, "&interval=").concat(interval, "&limit=").concat(limit))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        result = _a.sent();
                        if (!result.success || !result.data || result.data.length === 0) {
                            console.log('📊 [Binance Datafeed] No data available');
                            onResult([], { noData: true });
                            return [2 /*return*/];
                        }
                        bars = result.data
                            .filter(function (bar) { return bar.time >= from && bar.time <= to; })
                            .map(function (bar) { return ({
                            time: bar.time * 1000, // TradingView expects milliseconds
                            open: bar.open,
                            high: bar.high,
                            low: bar.low,
                            close: bar.close,
                            volume: bar.volume
                        }); });
                        if (bars.length > 0) {
                            this.lastBar = {
                                time: bars[bars.length - 1].time / 1000,
                                open: bars[bars.length - 1].open,
                                high: bars[bars.length - 1].high,
                                low: bars[bars.length - 1].low,
                                close: bars[bars.length - 1].close,
                                volume: bars[bars.length - 1].volume
                            };
                        }
                        console.log('✅ [Binance Datafeed] Loaded', bars.length, 'bars');
                        console.log('📊 [Binance Datafeed] Latest bar:', this.lastBar);
                        onResult(bars, { noData: false });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ [Binance Datafeed] Error fetching bars:', error_1);
                        onError(error_1 instanceof Error ? error_1.message : 'Unknown error');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Subscribe to real-time updates
    BinanceDatafeed.prototype.subscribeBars = function (symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
        var _this = this;
        console.log('📊 [Binance Datafeed] subscribeBars:', symbolInfo.name, resolution);
        this.subscribers[listenerGuid] = {
            symbolInfo: symbolInfo,
            resolution: resolution,
            onTick: onTick,
            interval: setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                var response, result, price, now, updatedBar, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fetch("/api/binance/price?symbol=".concat(symbolInfo.name))];
                        case 1:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 2:
                            result = _a.sent();
                            if (result.success && result.data) {
                                price = result.data.price;
                                now = Math.floor(Date.now() / 1000);
                                if (this.lastBar) {
                                    updatedBar = __assign(__assign({}, this.lastBar), { close: price, high: Math.max(this.lastBar.high, price), low: Math.min(this.lastBar.low, price), volume: this.lastBar.volume });
                                    this.lastBar = updatedBar;
                                    onTick(__assign(__assign({}, updatedBar), { time: updatedBar.time * 1000 }));
                                    console.log('📊 [Binance Datafeed] Real-time update:', price);
                                }
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _a.sent();
                            console.error('❌ [Binance Datafeed] Error in real-time update:', error_2);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }, 2000) // Update every 2 seconds
        };
    };
    // Unsubscribe from real-time updates
    BinanceDatafeed.prototype.unsubscribeBars = function (listenerGuid) {
        console.log('📊 [Binance Datafeed] unsubscribeBars:', listenerGuid);
        if (this.subscribers[listenerGuid]) {
            clearInterval(this.subscribers[listenerGuid].interval);
            delete this.subscribers[listenerGuid];
        }
    };
    // Helper: Get interval in seconds
    BinanceDatafeed.prototype.getIntervalSeconds = function (interval) {
        var map = {
            '1m': 60,
            '3m': 180,
            '5m': 300,
            '15m': 900,
            '30m': 1800,
            '1h': 3600,
            '2h': 7200,
            '4h': 14400,
            '6h': 21600,
            '8h': 28800,
            '12h': 43200,
            '1d': 86400,
            '3d': 259200,
            '1w': 604800,
            '1M': 2592000
        };
        return map[interval] || 60;
    };
    return BinanceDatafeed;
}());
// Export singleton instance
export var binanceDatafeed = new BinanceDatafeed();
