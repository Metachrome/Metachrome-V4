import { LRUCache } from 'lru-cache';

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
export const marketDataCache = new LRUCache<string, any>(CACHE_CONFIGS.marketData);
export const userBalancesCache = new LRUCache<string, any>(CACHE_CONFIGS.userBalances);
export const optionsSettingsCache = new LRUCache<string, any>(CACHE_CONFIGS.optionsSettings);
export const tradingPairsCache = new LRUCache<string, any>(CACHE_CONFIGS.tradingPairs);
export const userProfilesCache = new LRUCache<string, any>(CACHE_CONFIGS.userProfiles);
export const adminControlsCache = new LRUCache<string, any>(CACHE_CONFIGS.adminControls);

// Cache utility functions
export class CacheManager {
  // Generic cache get/set methods
  static async getOrSet<T>(
    cache: LRUCache<string, T>,
    key: string,
    fetchFunction: () => Promise<T>
  ): Promise<T> {
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
    } catch (error) {
      console.error(`Cache fetch error for key ${key}:`, error);
      throw error;
    }
  }

  // Market data caching
  static async getMarketData(symbol: string, fetchFunction: () => Promise<any>): Promise<any> {
    return this.getOrSet(marketDataCache, `market:${symbol}`, fetchFunction);
  }

  static async getAllMarketData(fetchFunction: () => Promise<any[]>): Promise<any[]> {
    return this.getOrSet(marketDataCache, 'market:all', fetchFunction);
  }

  static invalidateMarketData(symbol?: string): void {
    if (symbol) {
      marketDataCache.delete(`market:${symbol}`);
    } else {
      marketDataCache.clear();
    }
    // Always invalidate the 'all' cache when any market data changes
    marketDataCache.delete('market:all');
  }

  // User balance caching
  static async getUserBalance(userId: string, symbol: string, fetchFunction: () => Promise<any>): Promise<any> {
    return this.getOrSet(userBalancesCache, `balance:${userId}:${symbol}`, fetchFunction);
  }

  static async getUserBalances(userId: string, fetchFunction: () => Promise<any[]>): Promise<any[]> {
    return this.getOrSet(userBalancesCache, `balances:${userId}`, fetchFunction);
  }

  static invalidateUserBalances(userId: string, symbol?: string): void {
    if (symbol) {
      userBalancesCache.delete(`balance:${userId}:${symbol}`);
    }
    userBalancesCache.delete(`balances:${userId}`);
  }

  // Options settings caching
  static async getOptionsSettings(fetchFunction: () => Promise<any[]>): Promise<any[]> {
    return this.getOrSet(optionsSettingsCache, 'options:settings', fetchFunction);
  }

  static invalidateOptionsSettings(): void {
    optionsSettingsCache.clear();
  }

  // Trading pairs caching
  static async getTradingPairs(fetchFunction: () => Promise<any[]>): Promise<any[]> {
    return this.getOrSet(tradingPairsCache, 'trading:pairs', fetchFunction);
  }

  static invalidateTradingPairs(): void {
    tradingPairsCache.clear();
  }

  // User profile caching
  static async getUserProfile(userId: string, fetchFunction: () => Promise<any>): Promise<any> {
    return this.getOrSet(userProfilesCache, `user:${userId}`, fetchFunction);
  }

  static invalidateUserProfile(userId: string): void {
    userProfilesCache.delete(`user:${userId}`);
  }

  // Admin controls caching
  static async getAdminControl(userId: string, fetchFunction: () => Promise<any>): Promise<any> {
    return this.getOrSet(adminControlsCache, `admin:control:${userId}`, fetchFunction);
  }

  static async getAllAdminControls(fetchFunction: () => Promise<any[]>): Promise<any[]> {
    return this.getOrSet(adminControlsCache, 'admin:controls:all', fetchFunction);
  }

  static invalidateAdminControls(userId?: string): void {
    if (userId) {
      adminControlsCache.delete(`admin:control:${userId}`);
    }
    adminControlsCache.delete('admin:controls:all');
  }

  // Cache statistics
  static getCacheStats(): Record<string, any> {
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
  }

  // Clear all caches
  static clearAllCaches(): void {
    marketDataCache.clear();
    userBalancesCache.clear();
    optionsSettingsCache.clear();
    tradingPairsCache.clear();
    userProfilesCache.clear();
    adminControlsCache.clear();
    console.log('🧹 All caches cleared');
  }

  // Warm up critical caches
  static async warmUpCaches(storage: any): Promise<void> {
    try {
      console.log('🔥 Warming up caches...');
      
      // Warm up market data
      await this.getAllMarketData(() => storage.getAllMarketData());
      
      // Warm up options settings
      await this.getOptionsSettings(() => storage.getOptionsSettings());
      
      // Warm up trading pairs
      await this.getTradingPairs(() => storage.getTradingPairs());
      
      console.log('✅ Cache warm-up completed');
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
    }
  }
}

// Cache middleware for Express routes
export function cacheMiddleware(ttl: number = 60000) {
  const cache = new LRUCache<string, any>({ max: 100, ttl });
  
  return (req: any, res: any, next: any) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      cache.set(key, data);
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private static queryTimes: number[] = [];
  private static readonly MAX_SAMPLES = 100;

  static recordQueryTime(duration: number): void {
    this.queryTimes.push(duration);
    if (this.queryTimes.length > this.MAX_SAMPLES) {
      this.queryTimes.shift();
    }
  }

  static getAverageQueryTime(): number {
    if (this.queryTimes.length === 0) return 0;
    return this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length;
  }

  static getQueryStats(): { avg: number; min: number; max: number; count: number } {
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

  static async measureQuery<T>(operation: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      this.recordQueryTime(duration);
      
      if (duration > 1000) {
        console.warn(`🐌 Slow query detected: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordQueryTime(duration);
      throw error;
    }
  }
}
