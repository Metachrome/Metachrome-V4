"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = exports.CacheManager = exports.adminControlsCache = exports.userProfilesCache = exports.tradingPairsCache = exports.optionsSettingsCache = exports.userBalancesCache = exports.marketDataCache = void 0;
exports.cacheMiddleware = cacheMiddleware;
const lru_cache_1 = require("lru-cache");
// Cache configurations for different data types
const CACHE_CONFIGS = {
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
exports.marketDataCache = new lru_cache_1.LRUCache(CACHE_CONFIGS.marketData);
exports.userBalancesCache = new lru_cache_1.LRUCache(CACHE_CONFIGS.userBalances);
exports.optionsSettingsCache = new lru_cache_1.LRUCache(CACHE_CONFIGS.optionsSettings);
exports.tradingPairsCache = new lru_cache_1.LRUCache(CACHE_CONFIGS.tradingPairs);
exports.userProfilesCache = new lru_cache_1.LRUCache(CACHE_CONFIGS.userProfiles);
exports.adminControlsCache = new lru_cache_1.LRUCache(CACHE_CONFIGS.adminControls);
// Cache utility functions
class CacheManager {
    // Generic cache get/set methods
    static async getOrSet(cache, key, fetchFunction) {
        // Try to get from cache first
        const cached = cache.get(key);
        if (cached !== undefined) {
            return cached;
        }
        // If not in cache, fetch and store
        try {
            const data = await fetchFunction();
            cache.set(key, data);
            return data;
        }
        catch (error) {
            console.error(`Cache fetch error for key ${key}:`, error);
            throw error;
        }
    }
    // Market data caching
    static async getMarketData(symbol, fetchFunction) {
        return this.getOrSet(exports.marketDataCache, `market:${symbol}`, fetchFunction);
    }
    static async getAllMarketData(fetchFunction) {
        return this.getOrSet(exports.marketDataCache, 'market:all', fetchFunction);
    }
    static invalidateMarketData(symbol) {
        if (symbol) {
            exports.marketDataCache.delete(`market:${symbol}`);
        }
        else {
            exports.marketDataCache.clear();
        }
        // Always invalidate the 'all' cache when any market data changes
        exports.marketDataCache.delete('market:all');
    }
    // User balance caching
    static async getUserBalance(userId, symbol, fetchFunction) {
        return this.getOrSet(exports.userBalancesCache, `balance:${userId}:${symbol}`, fetchFunction);
    }
    static async getUserBalances(userId, fetchFunction) {
        return this.getOrSet(exports.userBalancesCache, `balances:${userId}`, fetchFunction);
    }
    static invalidateUserBalances(userId, symbol) {
        if (symbol) {
            exports.userBalancesCache.delete(`balance:${userId}:${symbol}`);
        }
        exports.userBalancesCache.delete(`balances:${userId}`);
    }
    // Options settings caching
    static async getOptionsSettings(fetchFunction) {
        return this.getOrSet(exports.optionsSettingsCache, 'options:settings', fetchFunction);
    }
    static invalidateOptionsSettings() {
        exports.optionsSettingsCache.clear();
    }
    // Trading pairs caching
    static async getTradingPairs(fetchFunction) {
        return this.getOrSet(exports.tradingPairsCache, 'trading:pairs', fetchFunction);
    }
    static invalidateTradingPairs() {
        exports.tradingPairsCache.clear();
    }
    // User profile caching
    static async getUserProfile(userId, fetchFunction) {
        return this.getOrSet(exports.userProfilesCache, `user:${userId}`, fetchFunction);
    }
    static invalidateUserProfile(userId) {
        exports.userProfilesCache.delete(`user:${userId}`);
    }
    // Admin controls caching
    static async getAdminControl(userId, fetchFunction) {
        return this.getOrSet(exports.adminControlsCache, `admin:control:${userId}`, fetchFunction);
    }
    static async getAllAdminControls(fetchFunction) {
        return this.getOrSet(exports.adminControlsCache, 'admin:controls:all', fetchFunction);
    }
    static invalidateAdminControls(userId) {
        if (userId) {
            exports.adminControlsCache.delete(`admin:control:${userId}`);
        }
        exports.adminControlsCache.delete('admin:controls:all');
    }
    // Cache statistics
    static getCacheStats() {
        return {
            marketData: {
                size: exports.marketDataCache.size,
                max: exports.marketDataCache.max,
                calculatedSize: exports.marketDataCache.calculatedSize,
            },
            userBalances: {
                size: exports.userBalancesCache.size,
                max: exports.userBalancesCache.max,
                calculatedSize: exports.userBalancesCache.calculatedSize,
            },
            optionsSettings: {
                size: exports.optionsSettingsCache.size,
                max: exports.optionsSettingsCache.max,
                calculatedSize: exports.optionsSettingsCache.calculatedSize,
            },
            tradingPairs: {
                size: exports.tradingPairsCache.size,
                max: exports.tradingPairsCache.max,
                calculatedSize: exports.tradingPairsCache.calculatedSize,
            },
            userProfiles: {
                size: exports.userProfilesCache.size,
                max: exports.userProfilesCache.max,
                calculatedSize: exports.userProfilesCache.calculatedSize,
            },
            adminControls: {
                size: exports.adminControlsCache.size,
                max: exports.adminControlsCache.max,
                calculatedSize: exports.adminControlsCache.calculatedSize,
            },
        };
    }
    // Clear all caches
    static clearAllCaches() {
        exports.marketDataCache.clear();
        exports.userBalancesCache.clear();
        exports.optionsSettingsCache.clear();
        exports.tradingPairsCache.clear();
        exports.userProfilesCache.clear();
        exports.adminControlsCache.clear();
        console.log('🧹 All caches cleared');
    }
    // Warm up critical caches
    static async warmUpCaches(storage) {
        try {
            console.log('🔥 Warming up caches...');
            // Warm up market data
            await this.getAllMarketData(() => storage.getAllMarketData());
            // Warm up options settings
            await this.getOptionsSettings(() => storage.getOptionsSettings());
            // Warm up trading pairs
            await this.getTradingPairs(() => storage.getTradingPairs());
            console.log('✅ Cache warm-up completed');
        }
        catch (error) {
            console.error('❌ Cache warm-up failed:', error);
        }
    }
}
exports.CacheManager = CacheManager;
// Cache middleware for Express routes
function cacheMiddleware(ttl = 60000) {
    const cache = new lru_cache_1.LRUCache({ max: 100, ttl });
    return (req, res, next) => {
        const key = `${req.method}:${req.originalUrl}`;
        const cached = cache.get(key);
        if (cached) {
            return res.json(cached);
        }
        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = function (data) {
            cache.set(key, data);
            return originalJson.call(this, data);
        };
        next();
    };
}
// Performance monitoring
class PerformanceMonitor {
    static recordQueryTime(duration) {
        this.queryTimes.push(duration);
        if (this.queryTimes.length > this.MAX_SAMPLES) {
            this.queryTimes.shift();
        }
    }
    static getAverageQueryTime() {
        if (this.queryTimes.length === 0)
            return 0;
        return this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length;
    }
    static getQueryStats() {
        if (this.queryTimes.length === 0) {
            return { avg: 0, min: 0, max: 0, count: 0 };
        }
        return {
            avg: this.getAverageQueryTime(),
            min: Math.min(...this.queryTimes),
            max: Math.max(...this.queryTimes),
            count: this.queryTimes.length,
        };
    }
    static async measureQuery(operation) {
        const start = Date.now();
        try {
            const result = await operation();
            const duration = Date.now() - start;
            this.recordQueryTime(duration);
            if (duration > 1000) {
                console.warn(`🐌 Slow query detected: ${duration}ms`);
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.recordQueryTime(duration);
            throw error;
        }
    }
}
exports.PerformanceMonitor = PerformanceMonitor;
PerformanceMonitor.queryTimes = [];
PerformanceMonitor.MAX_SAMPLES = 100;
