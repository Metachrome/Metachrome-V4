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
import { apiRequest } from "../lib/queryClient";
var PriceService = /** @class */ (function () {
    function PriceService() {
        this.updateInterval = null;
        this.subscribers = new Map();
    }
    PriceService.getInstance = function () {
        if (!PriceService.instance) {
            PriceService.instance = new PriceService();
        }
        return PriceService.instance;
    };
    PriceService.prototype.getMarketData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var url, response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        url = symbol ? "/api/market-data/".concat(symbol) : "/api/market-data";
                        return [4 /*yield*/, fetch(url)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error! status: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, Array.isArray(data) ? data : [data]];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error fetching market data:", error_1);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PriceService.prototype.updateMarketData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, apiRequest("POST", "/api/market-data", data)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Error updating market data:", error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PriceService.prototype.subscribe = function (symbol, callback) {
        var _this = this;
        if (!this.subscribers.has(symbol)) {
            this.subscribers.set(symbol, new Set());
        }
        this.subscribers.get(symbol).add(callback);
        // Return unsubscribe function
        return function () {
            var symbolSubscribers = _this.subscribers.get(symbol);
            if (symbolSubscribers) {
                symbolSubscribers.delete(callback);
                if (symbolSubscribers.size === 0) {
                    _this.subscribers.delete(symbol);
                }
            }
        };
    };
    PriceService.prototype.notifySubscribers = function (symbol, data) {
        var symbolSubscribers = this.subscribers.get(symbol);
        if (symbolSubscribers) {
            symbolSubscribers.forEach(function (callback) { return callback(data); });
        }
    };
    PriceService.prototype.startPriceUpdates = function (intervalMs) {
        var _this = this;
        if (intervalMs === void 0) { intervalMs = 5000; }
        if (this.updateInterval) {
            this.stopPriceUpdates();
        }
        this.updateInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var marketData, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getMarketData()];
                    case 1:
                        marketData = _a.sent();
                        marketData.forEach(function (data) {
                            _this.notifySubscribers(data.symbol, data);
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error in price update interval:", error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, intervalMs);
    };
    PriceService.prototype.stopPriceUpdates = function () {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    };
    // Calculate technical indicators
    PriceService.prototype.calculateMovingAverage = function (prices, period) {
        var result = [];
        for (var i = period - 1; i < prices.length; i++) {
            var sum = prices.slice(i - period + 1, i + 1).reduce(function (a, b) { return a + b; }, 0);
            result.push(sum / period);
        }
        return result;
    };
    PriceService.prototype.calculateRSI = function (prices, period) {
        if (period === void 0) { period = 14; }
        if (prices.length < period + 1)
            return [];
        var gains = [];
        var losses = [];
        for (var i = 1; i < prices.length; i++) {
            var change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        var avgGain = gains.slice(0, period).reduce(function (a, b) { return a + b; }, 0) / period;
        var avgLoss = losses.slice(0, period).reduce(function (a, b) { return a + b; }, 0) / period;
        var rs = avgGain / avgLoss;
        var rsi = 100 - (100 / (1 + rs));
        return [rsi];
    };
    PriceService.prototype.calculateBollingerBands = function (prices, period, stdDev) {
        if (period === void 0) { period = 20; }
        if (stdDev === void 0) { stdDev = 2; }
        var sma = this.calculateMovingAverage(prices, period);
        var bands = [];
        var _loop_1 = function (i) {
            var slice = prices.slice(i, i + period);
            var mean = sma[i];
            var variance = slice.reduce(function (acc, price) { return acc + Math.pow(price - mean, 2); }, 0) / period;
            var standardDeviation = Math.sqrt(variance);
            bands.push({
                upper: mean + (standardDeviation * stdDev),
                middle: mean,
                lower: mean - (standardDeviation * stdDev)
            });
        };
        for (var i = 0; i < sma.length; i++) {
            _loop_1(i);
        }
        return bands;
    };
    // Format price for display
    PriceService.prototype.formatPrice = function (price, decimals) {
        if (decimals === void 0) { decimals = 2; }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(price);
    };
    // Format percentage change
    PriceService.prototype.formatPercentage = function (value, decimals) {
        if (decimals === void 0) { decimals = 2; }
        var sign = value >= 0 ? '+' : '';
        return "".concat(sign).concat(value.toFixed(decimals), "%");
    };
    // Get price color based on change
    PriceService.prototype.getPriceColor = function (change) {
        if (change > 0)
            return 'green';
        if (change < 0)
            return 'red';
        return 'gray';
    };
    return PriceService;
}());
export { PriceService };
// Export singleton instance
export var priceService = PriceService.getInstance();
