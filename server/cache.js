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
import { LRUCache } from 'lru-cache';
// Cache configurations for different data types
var CACHE_CONFIGS = {
    marketData: {
        max: 100, // Maximum number of items
        ttl: 5000, // 5 seconds TTL for market data
    },
    userBalances: {
        max: 1000,
        ttl: 30000, // 30 seconds TTL for user balances
    },
    optionsSettings: {
        max: 50,
        ttl: 300000, // 5 minutes TTL for options settings
    },
    tradingPairs: {
        max: 100,
        ttl: 600000, // 10 minutes TTL for trading pairs
    },
    userProfiles: {
        max: 1000,
        ttl: 300000, // 5 minutes TTL for user profiles
    },
    adminControls: {
        max: 500,
        ttl: 60000, // 1 minute TTL for admin controls
    },
};
// Create cache instances
export var marketDataCache = new LRUCache(CACHE_CONFIGS.marketData);
export var userBalancesCache = new LRUCache(CACHE_CONFIGS.userBalances);
export var optionsSettingsCache = new LRUCache(CACHE_CONFIGS.optionsSettings);
export var tradingPairsCache = new LRUCache(CACHE_CONFIGS.tradingPairs);
export var userProfilesCache = new LRUCache(CACHE_CONFIGS.userProfiles);
export var adminControlsCache = new LRUCache(CACHE_CONFIGS.adminControls);
// Cache utility functions
var CacheManager = /** @class */ (function () {
    function CacheManager() {
    }
    // Generic cache get/set methods
    CacheManager.getOrSet = function (cache, key, fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = cache.get(key);
                        if (cached !== undefined) {
                            return [2 /*return*/, cached];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetchFunction()];
                    case 2:
                        data = _a.sent();
                        cache.set(key, data);
                        return [2 /*return*/, data];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Cache fetch error for key ".concat(key, ":"), error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Market data caching
    CacheManager.getMarketData = function (symbol, fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(marketDataCache, "market:".concat(symbol), fetchFunction)];
            });
        });
    };
    CacheManager.getAllMarketData = function (fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(marketDataCache, 'market:all', fetchFunction)];
            });
        });
    };
    CacheManager.invalidateMarketData = function (symbol) {
        if (symbol) {
            marketDataCache.delete("market:".concat(symbol));
        }
        else {
            marketDataCache.clear();
        }
        // Always invalidate the 'all' cache when any market data changes
        marketDataCache.delete('market:all');
    };
    // User balance caching
    CacheManager.getUserBalance = function (userId, symbol, fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(userBalancesCache, "balance:".concat(userId, ":").concat(symbol), fetchFunction)];
            });
        });
    };
    CacheManager.getUserBalances = function (userId, fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(userBalancesCache, "balances:".concat(userId), fetchFunction)];
            });
        });
    };
    CacheManager.invalidateUserBalances = function (userId, symbol) {
        if (symbol) {
            userBalancesCache.delete("balance:".concat(userId, ":").concat(symbol));
        }
        userBalancesCache.delete("balances:".concat(userId));
    };
    // Options settings caching
    CacheManager.getOptionsSettings = function (fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(optionsSettingsCache, 'options:settings', fetchFunction)];
            });
        });
    };
    CacheManager.invalidateOptionsSettings = function () {
        optionsSettingsCache.clear();
    };
    // Trading pairs caching
    CacheManager.getTradingPairs = function (fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(tradingPairsCache, 'trading:pairs', fetchFunction)];
            });
        });
    };
    CacheManager.invalidateTradingPairs = function () {
        tradingPairsCache.clear();
    };
    // User profile caching
    CacheManager.getUserProfile = function (userId, fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(userProfilesCache, "user:".concat(userId), fetchFunction)];
            });
        });
    };
    CacheManager.invalidateUserProfile = function (userId) {
        userProfilesCache.delete("user:".concat(userId));
    };
    // Admin controls caching
    CacheManager.getAdminControl = function (userId, fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(adminControlsCache, "admin:control:".concat(userId), fetchFunction)];
            });
        });
    };
    CacheManager.getAllAdminControls = function (fetchFunction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOrSet(adminControlsCache, 'admin:controls:all', fetchFunction)];
            });
        });
    };
    CacheManager.invalidateAdminControls = function (userId) {
        if (userId) {
            adminControlsCache.delete("admin:control:".concat(userId));
        }
        adminControlsCache.delete('admin:controls:all');
    };
    // Cache statistics
    CacheManager.getCacheStats = function () {
        return {
            marketData: {
                size: marketDataCache.size,
                max: marketDataCache.max,
                calculatedSize: marketDataCache.calculatedSize,
            },
            userBalances: {
                size: userBalancesCache.size,
                max: userBalancesCache.max,
                calculatedSize: userBalancesCache.calculatedSize,
            },
            optionsSettings: {
                size: optionsSettingsCache.size,
                max: optionsSettingsCache.max,
                calculatedSize: optionsSettingsCache.calculatedSize,
            },
            tradingPairs: {
                size: tradingPairsCache.size,
                max: tradingPairsCache.max,
                calculatedSize: tradingPairsCache.calculatedSize,
            },
            userProfiles: {
                size: userProfilesCache.size,
                max: userProfilesCache.max,
                calculatedSize: userProfilesCache.calculatedSize,
            },
            adminControls: {
                size: adminControlsCache.size,
                max: adminControlsCache.max,
                calculatedSize: adminControlsCache.calculatedSize,
            },
        };
    };
    // Clear all caches
    CacheManager.clearAllCaches = function () {
        marketDataCache.clear();
        userBalancesCache.clear();
        optionsSettingsCache.clear();
        tradingPairsCache.clear();
        userProfilesCache.clear();
        adminControlsCache.clear();
        console.log('🧹 All caches cleared');
    };
    // Warm up critical caches
    CacheManager.warmUpCaches = function (storage) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        console.log('🔥 Warming up caches...');
                        // Warm up market data
                        return [4 /*yield*/, this.getAllMarketData(function () { return storage.getAllMarketData(); })];
                    case 1:
                        // Warm up market data
                        _a.sent();
                        // Warm up options settings
                        return [4 /*yield*/, this.getOptionsSettings(function () { return storage.getOptionsSettings(); })];
                    case 2:
                        // Warm up options settings
                        _a.sent();
                        // Warm up trading pairs
                        return [4 /*yield*/, this.getTradingPairs(function () { return storage.getTradingPairs(); })];
                    case 3:
                        // Warm up trading pairs
                        _a.sent();
                        console.log('✅ Cache warm-up completed');
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error('❌ Cache warm-up failed:', error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return CacheManager;
}());
export { CacheManager };
// Cache middleware for Express routes
export function cacheMiddleware(ttl) {
    if (ttl === void 0) { ttl = 60000; }
    var cache = new LRUCache({ max: 100, ttl: ttl });
    return function (req, res, next) {
        var key = "".concat(req.method, ":").concat(req.originalUrl);
        var cached = cache.get(key);
        if (cached) {
            return res.json(cached);
        }
        // Override res.json to cache the response
        var originalJson = res.json;
        res.json = function (data) {
            cache.set(key, data);
            return originalJson.call(this, data);
        };
        next();
    };
}
// Performance monitoring
var PerformanceMonitor = /** @class */ (function () {
    function PerformanceMonitor() {
    }
    PerformanceMonitor.recordQueryTime = function (duration) {
        this.queryTimes.push(duration);
        if (this.queryTimes.length > this.MAX_SAMPLES) {
            this.queryTimes.shift();
        }
    };
    PerformanceMonitor.getAverageQueryTime = function () {
        if (this.queryTimes.length === 0)
            return 0;
        return this.queryTimes.reduce(function (sum, time) { return sum + time; }, 0) / this.queryTimes.length;
    };
    PerformanceMonitor.getQueryStats = function () {
        if (this.queryTimes.length === 0) {
            return { avg: 0, min: 0, max: 0, count: 0 };
        }
        return {
            avg: this.getAverageQueryTime(),
            min: Math.min.apply(Math, this.queryTimes),
            max: Math.max.apply(Math, this.queryTimes),
            count: this.queryTimes.length,
        };
    };
    PerformanceMonitor.measureQuery = function (operation) {
        return __awaiter(this, void 0, void 0, function () {
            var start, result, duration, error_3, duration;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, operation()];
                    case 2:
                        result = _a.sent();
                        duration = Date.now() - start;
                        this.recordQueryTime(duration);
                        if (duration > 1000) {
                            console.warn("\uD83D\uDC0C Slow query detected: ".concat(duration, "ms"));
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_3 = _a.sent();
                        duration = Date.now() - start;
                        this.recordQueryTime(duration);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PerformanceMonitor.queryTimes = [];
    PerformanceMonitor.MAX_SAMPLES = 100;
    return PerformanceMonitor;
}());
export { PerformanceMonitor };
