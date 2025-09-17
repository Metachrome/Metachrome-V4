"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.SafeStorage = void 0;
const schema_sqlite_1 = require("@shared/schema-sqlite");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const cache_1 = require("./cache");
class DatabaseStorage {
    // User operations
    async getUser(id) {
        const [user] = await db_1.db.select().from(schema_sqlite_1.users).where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.id, id));
        return user;
    }
    async getUserById(id) {
        return this.getUser(id);
    }
    async getUserByWallet(walletAddress) {
        const [user] = await db_1.db.select().from(schema_sqlite_1.users).where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.walletAddress, walletAddress));
        return user;
    }
    async getUserByWalletAddress(walletAddress) {
        const [user] = await db_1.db.select().from(schema_sqlite_1.users).where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.walletAddress, walletAddress));
        return user;
    }
    async getUserByEmail(email) {
        const [user] = await db_1.db.select().from(schema_sqlite_1.users).where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.email, email));
        return user;
    }
    async getUserByUsername(username) {
        const [user] = await db_1.db.select().from(schema_sqlite_1.users).where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.username, username));
        return user;
    }
    async createUser(userData) {
        const [user] = await db_1.db.insert(schema_sqlite_1.users).values(userData).returning();
        return user;
    }
    async updateUser(id, userData) {
        const [user] = await db_1.db
            .update(schema_sqlite_1.users)
            .set({ ...userData, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.id, id))
            .returning();
        return user;
    }
    async deleteUser(id) {
        try {
            // Delete in correct order to respect foreign key constraints
            // Delete transactions first (they might reference other tables)
            await db_1.db.delete(schema_sqlite_1.transactions).where((0, drizzle_orm_1.eq)(schema_sqlite_1.transactions.userId, id));
            // Delete trades
            await db_1.db.delete(schema_sqlite_1.trades).where((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.userId, id));
            // Delete balances
            await db_1.db.delete(schema_sqlite_1.balances).where((0, drizzle_orm_1.eq)(schema_sqlite_1.balances.userId, id));
            // Delete admin controls where user is the target
            await db_1.db.delete(schema_sqlite_1.adminControls).where((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.userId, id));
            // Update admin controls where user was the creator (set to null)
            await db_1.db.update(schema_sqlite_1.adminControls)
                .set({ createdBy: null })
                .where((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.createdBy, id));
            // Finally delete the user
            await db_1.db.delete(schema_sqlite_1.users).where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.id, id));
            console.log(`✅ Successfully deleted user ${id} and all related data`);
        }
        catch (error) {
            console.error(`❌ Error deleting user ${id}:`, error);
            throw error;
        }
    }
    // Balance operations
    async getUserBalances(userId) {
        return await db_1.db.select().from(schema_sqlite_1.balances).where((0, drizzle_orm_1.eq)(schema_sqlite_1.balances.userId, userId));
    }
    async getBalance(userId, symbol) {
        return await cache_1.CacheManager.getUserBalance(userId, symbol, async () => {
            return await cache_1.PerformanceMonitor.measureQuery(async () => {
                const [balance] = await db_1.db
                    .select()
                    .from(schema_sqlite_1.balances)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.balances.userId, userId), (0, drizzle_orm_1.eq)(schema_sqlite_1.balances.symbol, symbol)));
                return balance;
            });
        });
    }
    async updateBalance(userId, symbol, available, locked) {
        return await cache_1.PerformanceMonitor.measureQuery(async () => {
            const existingBalance = await this.getBalance(userId, symbol);
            if (existingBalance) {
                const [balance] = await db_1.db
                    .update(schema_sqlite_1.balances)
                    .set({
                    available,
                    locked,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.balances.userId, userId), (0, drizzle_orm_1.eq)(schema_sqlite_1.balances.symbol, symbol)))
                    .returning();
                // Invalidate cache after update
                cache_1.CacheManager.invalidateUserBalances(userId, symbol);
                return balance;
            }
            else {
                const result = await this.createBalance({ userId, symbol, available, locked });
                cache_1.CacheManager.invalidateUserBalances(userId, symbol);
                return result;
            }
        });
    }
    async createBalance(balanceData) {
        return await cache_1.PerformanceMonitor.measureQuery(async () => {
            const [balance] = await db_1.db.insert(schema_sqlite_1.balances).values(balanceData).returning();
            cache_1.CacheManager.invalidateUserBalances(balanceData.userId, balanceData.symbol);
            return balance;
        });
    }
    // Trading operations
    async createTrade(tradeData) {
        const [trade] = await db_1.db.insert(schema_sqlite_1.trades).values(tradeData).returning();
        return trade;
    }
    async getTrade(id) {
        const [trade] = await db_1.db.select().from(schema_sqlite_1.trades).where((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.id, id));
        return trade;
    }
    async getUserTrades(userId, limit = 100) {
        return await db_1.db
            .select()
            .from(schema_sqlite_1.trades)
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.trades.createdAt))
            .limit(limit);
    }
    async updateTrade(id, updates) {
        const [trade] = await db_1.db
            .update(schema_sqlite_1.trades)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.id, id))
            .returning();
        return trade;
    }
    async getActiveTrades(userId) {
        return await db_1.db
            .select()
            .from(schema_sqlite_1.trades)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.userId, userId), (0, drizzle_orm_1.eq)(schema_sqlite_1.trades.status, 'active')));
    }
    // Spot trading operations
    async createSpotOrder(order) {
        const spotOrder = {
            id: crypto.randomUUID(),
            userId: order.userId,
            symbol: order.symbol,
            side: order.side,
            type: order.type,
            amount: order.amount.toString(),
            price: order.price?.toString(),
            total: order.total.toString(),
            status: order.status,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // For now, store in a simple table structure
        // In production, you'd want a proper spot_orders table
        await db_1.db.insert(schema_sqlite_1.trades).values({
            id: spotOrder.id,
            userId: spotOrder.userId,
            symbol: spotOrder.symbol,
            type: 'spot',
            direction: spotOrder.side,
            amount: spotOrder.amount,
            entryPrice: spotOrder.price || '0',
            status: spotOrder.status,
            createdAt: spotOrder.createdAt,
            updatedAt: spotOrder.updatedAt,
            // Store spot-specific data in metadata
            metadata: JSON.stringify({
                orderType: spotOrder.type,
                total: spotOrder.total
            })
        });
        return spotOrder;
    }
    async getSpotOrder(id) {
        const trade = await db_1.db
            .select()
            .from(schema_sqlite_1.trades)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.id, id), (0, drizzle_orm_1.eq)(schema_sqlite_1.trades.type, 'spot')))
            .limit(1);
        if (!trade[0])
            return null;
        const metadata = trade[0].metadata ? JSON.parse(trade[0].metadata) : {};
        return {
            id: trade[0].id,
            userId: trade[0].userId,
            symbol: trade[0].symbol,
            side: trade[0].direction,
            type: metadata.orderType || 'limit',
            amount: parseFloat(trade[0].amount),
            price: parseFloat(trade[0].entryPrice),
            total: parseFloat(metadata.total || '0'),
            status: trade[0].status,
            createdAt: trade[0].createdAt,
            updatedAt: trade[0].updatedAt
        };
    }
    async getUserSpotOrders(userId) {
        const userTrades = await db_1.db
            .select()
            .from(schema_sqlite_1.trades)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.userId, userId), (0, drizzle_orm_1.eq)(schema_sqlite_1.trades.type, 'spot')))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.trades.createdAt));
        return userTrades.map(trade => {
            const metadata = trade.metadata ? JSON.parse(trade.metadata) : {};
            return {
                id: trade.id,
                userId: trade.userId,
                symbol: trade.symbol,
                side: trade.direction,
                type: metadata.orderType || 'limit',
                amount: parseFloat(trade.amount),
                price: parseFloat(trade.entryPrice),
                total: parseFloat(metadata.total || '0'),
                status: trade.status,
                createdAt: trade.createdAt,
                updatedAt: trade.updatedAt
            };
        });
    }
    async updateSpotOrder(id, updates) {
        const existingTrade = await this.getSpotOrder(id);
        if (!existingTrade)
            throw new Error('Spot order not found');
        await db_1.db
            .update(schema_sqlite_1.trades)
            .set({
            status: updates.status || existingTrade.status,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.trades.id, id));
        return { ...existingTrade, ...updates, updatedAt: new Date() };
    }
    async updateUserBalance(userId, currency, amount) {
        const existingBalance = await db_1.db
            .select()
            .from(schema_sqlite_1.balances)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.balances.userId, userId), (0, drizzle_orm_1.eq)(schema_sqlite_1.balances.currency, currency)))
            .limit(1);
        if (existingBalance[0]) {
            const newBalance = parseFloat(existingBalance[0].balance) + amount;
            await db_1.db
                .update(schema_sqlite_1.balances)
                .set({
                balance: newBalance.toString(),
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.balances.userId, userId), (0, drizzle_orm_1.eq)(schema_sqlite_1.balances.currency, currency)));
        }
        else {
            // Create new balance if it doesn't exist
            await db_1.db.insert(schema_sqlite_1.balances).values({
                id: crypto.randomUUID(),
                userId,
                currency,
                balance: Math.max(0, amount).toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }
    // Market data operations with caching
    async getMarketData(symbol) {
        return await cache_1.CacheManager.getMarketData(symbol, async () => {
            return await cache_1.PerformanceMonitor.measureQuery(async () => {
                try {
                    const [data] = await db_1.db
                        .select()
                        .from(schema_sqlite_1.marketData)
                        .where((0, drizzle_orm_1.eq)(schema_sqlite_1.marketData.symbol, symbol))
                        .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.marketData.timestamp))
                        .limit(1);
                    return data;
                }
                catch (error) {
                    console.warn(`Failed to fetch market data for ${symbol}:`, error);
                    return undefined;
                }
            });
        });
    }
    async updateMarketData(symbol, data) {
        return await cache_1.PerformanceMonitor.measureQuery(async () => {
            // Try to update existing record first
            const existing = await this.getMarketData(symbol);
            if (existing) {
                const [updated] = await db_1.db
                    .update(schema_sqlite_1.marketData)
                    .set({ ...data, timestamp: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema_sqlite_1.marketData.symbol, symbol))
                    .returning();
                // Invalidate cache after update
                cache_1.CacheManager.invalidateMarketData(symbol);
                return updated;
            }
            else {
                // Create new record if doesn't exist
                const result = await this.createMarketData({ symbol, ...data });
                cache_1.CacheManager.invalidateMarketData(symbol);
                return result;
            }
        });
    }
    async createMarketData(data) {
        return await cache_1.PerformanceMonitor.measureQuery(async () => {
            const [marketDataRow] = await db_1.db.insert(schema_sqlite_1.marketData).values(data).returning();
            cache_1.CacheManager.invalidateMarketData(data.symbol);
            return marketDataRow;
        });
    }
    async getAllMarketData() {
        return await cache_1.CacheManager.getAllMarketData(async () => {
            return await cache_1.PerformanceMonitor.measureQuery(async () => {
                return await db_1.db
                    .select()
                    .from(schema_sqlite_1.marketData)
                    .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.marketData.timestamp));
            });
        });
    }
    async getTradingPairs() {
        return await cache_1.CacheManager.getTradingPairs(async () => {
            return await cache_1.PerformanceMonitor.measureQuery(async () => {
                return await db_1.db
                    .select()
                    .from(schema_sqlite_1.tradingPairs)
                    .where((0, drizzle_orm_1.eq)(schema_sqlite_1.tradingPairs.isActive, true));
            });
        });
    }
    // Transaction operations
    async createTransaction(transactionData) {
        const [transaction] = await db_1.db.insert(schema_sqlite_1.transactions).values(transactionData).returning();
        return transaction;
    }
    async getUserTransactions(userId, limit = 100) {
        return await db_1.db
            .select()
            .from(schema_sqlite_1.transactions)
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.transactions.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.transactions.createdAt))
            .limit(limit);
    }
    async updateTransaction(id, updates) {
        const [transaction] = await db_1.db
            .update(schema_sqlite_1.transactions)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.transactions.id, id))
            .returning();
        return transaction;
    }
    async getTransaction(id) {
        const [transaction] = await db_1.db
            .select()
            .from(schema_sqlite_1.transactions)
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.transactions.id, id))
            .limit(1);
        return transaction;
    }
    async getPendingTransactions() {
        return await db_1.db
            .select()
            .from(schema_sqlite_1.transactions)
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.transactions.status, 'pending'))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.transactions.createdAt));
    }
    async getAllTransactions() {
        return await db_1.db
            .select()
            .from(schema_sqlite_1.transactions)
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.transactions.createdAt))
            .limit(1000); // Limit to prevent performance issues
    }
    // Admin operations
    async createAdminControl(controlData) {
        const [control] = await db_1.db.insert(schema_sqlite_1.adminControls).values(controlData).returning();
        return control;
    }
    async getAdminControl(userId) {
        const [control] = await db_1.db
            .select()
            .from(schema_sqlite_1.adminControls)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.userId, userId), (0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.isActive, true)))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.adminControls.createdAt))
            .limit(1);
        return control;
    }
    async updateAdminControl(id, updates) {
        const [control] = await db_1.db
            .update(schema_sqlite_1.adminControls)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.id, id))
            .returning();
        return control;
    }
    async deleteAdminControl(id) {
        await db_1.db
            .delete(schema_sqlite_1.adminControls)
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.id, id));
    }
    async getUsersByAdmin(adminId) {
        return await db_1.db
            .select()
            .from(schema_sqlite_1.adminControls)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.adminId, adminId), (0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.isActive, true)));
    }
    // Options settings
    async getOptionsSettings() {
        return await db_1.db
            .select()
            .from(schema_sqlite_1.optionsSettings)
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.optionsSettings.isActive, true))
            .orderBy(schema_sqlite_1.optionsSettings.duration);
    }
    async createOptionsSettings(settingsData) {
        const [settings] = await db_1.db.insert(schema_sqlite_1.optionsSettings).values(settingsData).returning();
        return settings;
    }
    async updateOptionsSettings(id, updates) {
        const [settings] = await db_1.db
            .update(schema_sqlite_1.optionsSettings)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.optionsSettings.id, id))
            .returning();
        return settings;
    }
    // Admin-only operations
    async getAllUsers() {
        return await db_1.db.select().from(schema_sqlite_1.users).orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.users.createdAt));
    }
    async getAllBalances() {
        // Avoid nested select shapes which can break on some drizzle-sqlite versions
        const rows = await db_1.db
            .select()
            .from(schema_sqlite_1.balances)
            .leftJoin(schema_sqlite_1.users, (0, drizzle_orm_1.eq)(schema_sqlite_1.balances.userId, schema_sqlite_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.balances.createdAt));
        return rows.map((row) => {
            const bal = row.balances ?? row;
            const usr = row.users ?? {};
            return {
                id: bal.id,
                userId: bal.userId,
                symbol: bal.symbol,
                available: bal.available,
                locked: bal.locked,
                createdAt: bal.createdAt,
                updatedAt: bal.updatedAt,
                user: usr && usr.id ? {
                    id: usr.id,
                    username: usr.username,
                    email: usr.email,
                    walletAddress: usr.walletAddress,
                } : undefined,
            };
        });
    }
    async getAllTrades() {
        const rows = await db_1.db
            .select()
            .from(schema_sqlite_1.trades)
            .leftJoin(schema_sqlite_1.users, (0, drizzle_orm_1.eq)(schema_sqlite_1.trades.userId, schema_sqlite_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.trades.createdAt));
        return rows.map((row) => {
            const t = row.trades ?? row;
            const usr = row.users ?? {};
            return {
                id: t.id,
                userId: t.userId,
                symbol: t.symbol,
                type: t.type,
                direction: t.direction,
                amount: t.amount,
                price: t.price,
                entryPrice: t.entryPrice,
                exitPrice: t.exitPrice,
                profit: t.profit,
                fee: t.fee,
                status: t.status,
                duration: t.duration,
                expiresAt: t.expiresAt,
                completedAt: t.completedAt,
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
                user: usr && usr.id ? {
                    id: usr.id,
                    username: usr.username,
                    email: usr.email,
                    walletAddress: usr.walletAddress,
                } : undefined,
            };
        });
    }
    async getAllAdminControls() {
        const rows = await db_1.db
            .select()
            .from(schema_sqlite_1.adminControls)
            .leftJoin(schema_sqlite_1.users, (0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.userId, schema_sqlite_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.isActive, true))
            .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.adminControls.createdAt));
        return rows.map((row) => {
            const ac = row.admin_controls ?? row.adminControls ?? row;
            const usr = row.users ?? {};
            return {
                id: ac.id,
                userId: ac.userId,
                adminId: ac.adminId,
                controlType: ac.controlType,
                isActive: ac.isActive,
                notes: ac.notes,
                createdAt: ac.createdAt,
                updatedAt: ac.updatedAt,
                user: usr && usr.id ? {
                    id: usr.id,
                    username: usr.username,
                    email: usr.email,
                    walletAddress: usr.walletAddress,
                } : undefined,
            };
        });
    }
    // Trading control operations
    async getTradingControls() {
        try {
            const controls = await db_1.db
                .select()
                .from(schema_sqlite_1.adminControls)
                .orderBy((0, drizzle_orm_1.desc)(schema_sqlite_1.adminControls.createdAt));
            // Join with user data to get usernames
            const controlsWithUsers = await Promise.all(controls.map(async (control) => {
                const user = await this.getUserById(control.userId);
                return {
                    ...control,
                    username: user?.username || 'Unknown User',
                    notes: control.notes || ''
                };
            }));
            return controlsWithUsers;
        }
        catch (error) {
            console.error('Error fetching trading controls:', error);
            return [];
        }
    }
    async createTradingControl(userId, controlType, notes, adminId) {
        try {
            // First, deactivate any existing controls for this user
            await db_1.db
                .update(schema_sqlite_1.adminControls)
                .set({ isActive: false, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.userId, userId));
            // Create new control
            const newControl = await db_1.db
                .insert(schema_sqlite_1.adminControls)
                .values({
                userId,
                adminId: adminId || 'superadmin-1', // Default to superadmin if not provided
                controlType: controlType,
                isActive: true,
                notes,
                createdAt: new Date(),
                updatedAt: new Date()
            })
                .returning();
            return newControl[0];
        }
        catch (error) {
            console.error('Error creating trading control:', error);
            throw error;
        }
    }
    async updateTradingControl(id, updates) {
        try {
            const updatedControl = await db_1.db
                .update(schema_sqlite_1.adminControls)
                .set({ ...updates, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_sqlite_1.adminControls.id, id))
                .returning();
            return updatedControl[0];
        }
        catch (error) {
            console.error('Error updating trading control:', error);
            throw error;
        }
    }
    // User wallet operations
    async getUserWallets() {
        // For now, return empty array - this will be implemented with proper database schema
        return [];
    }
    async updateUserPassword(userId, hashedPassword) {
        await db_1.db
            .update(schema_sqlite_1.users)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.id, userId));
    }
    async updateUserWallet(userId, walletAddress) {
        await db_1.db
            .update(schema_sqlite_1.users)
            .set({ walletAddress, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_sqlite_1.users.id, userId));
    }
}
// Demo storage class for fallback when database is unavailable
class DemoStorage {
    constructor() {
        this.users = new Map();
        this.balances = new Map();
        this.trades = new Map();
        this.transactions = new Map();
        this.adminControls = new Map();
        this.optionsSettings = [];
        this.marketData = new Map();
        this.tradingPairs = [];
        // Spot trading operations
        this.spotOrders = new Map();
        // Initialize with demo data
        this.initializeDemoData();
    }
    initializeDemoData() {
        // Create demo admin user
        const adminUser = {
            id: 'demo-admin-1',
            username: 'superadmin',
            email: 'admin@metachrome.io',
            password: '$2a$10$K43Qq3bh52Q5GNeZSc4.iebR0BuNEABg1887PNV2lu50Upil5.Xfa', // superadmin123
            role: 'super_admin',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(adminUser.id, adminUser);
        this.users.set(adminUser.username, adminUser);
        this.users.set(adminUser.email, adminUser);
        // Create demo admin user (admin/admin123)
        const adminUser2 = {
            id: 'demo-admin-2',
            username: 'admin',
            email: 'admin2@metachrome.io',
            password: '$2a$10$p0CakEdqPMkUfvAHE4MCE.dG7316dMM.3LfrgrF/9jT/ntZTQGv3O', // admin123
            firstName: null,
            lastName: null,
            profileImageUrl: null,
            walletAddress: null,
            role: 'super_admin',
            isActive: true,
            lastLogin: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(adminUser2.id, adminUser2);
        this.users.set(adminUser2.username, adminUser2);
        this.users.set(adminUser2.email, adminUser2);
        // Create demo user
        const demoUser = {
            id: 'demo-user-1',
            username: 'trader1',
            email: 'trader1@metachrome.io',
            password: '$2a$10$hashedpassword',
            role: 'user',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(demoUser.id, demoUser);
        this.users.set(demoUser.username, demoUser);
        this.users.set(demoUser.email, demoUser);
        // Create demo balance
        const demoBalance = {
            id: 'demo-balance-1',
            userId: demoUser.id,
            symbol: 'USDT',
            available: '10000.00',
            locked: '0.00',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.balances.set(`${demoUser.id}-USDT`, demoBalance);
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserById(id) {
        return this.users.get(id);
    }
    async getUserByUsername(username) {
        return this.users.get(username);
    }
    async getUserByEmail(email) {
        return this.users.get(email);
    }
    async getUserByWallet(walletAddress) {
        for (const user of this.users.values()) {
            if (user.walletAddress === walletAddress) {
                return user;
            }
        }
        return undefined;
    }
    async getUserByWalletAddress(walletAddress) {
        return this.getUserByWallet(walletAddress);
    }
    async createUser(user) {
        const newUser = {
            id: `demo-user-${Date.now()}`,
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(newUser.id, newUser);
        if (newUser.username)
            this.users.set(newUser.username, newUser);
        if (newUser.email)
            this.users.set(newUser.email, newUser);
        return newUser;
    }
    async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user)
            throw new Error('User not found');
        const updatedUser = { ...user, ...updates, updatedAt: new Date() };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    async deleteUser(id) {
        const user = this.users.get(id);
        if (!user)
            throw new Error('User not found');
        // Remove user from related collections
        this.balances = this.balances.filter(b => b.userId !== id);
        this.trades = this.trades.filter(t => t.userId !== id);
        this.transactions = this.transactions.filter(t => t.userId !== id);
        this.adminControls = this.adminControls.filter(ac => ac.userId !== id);
        // Update admin controls where user was the creator (set to null)
        this.adminControls = this.adminControls.map(ac => ac.createdBy === id ? { ...ac, createdBy: null } : ac);
        // Remove user from users map
        this.users.delete(id);
        if (user.username)
            this.users.delete(user.username);
        if (user.email)
            this.users.delete(user.email);
    }
    async getAllUsers() {
        const uniqueUsers = new Map();
        for (const user of this.users.values()) {
            uniqueUsers.set(user.id, user);
        }
        return Array.from(uniqueUsers.values());
    }
    async getUserBalances(userId) {
        const userBalances = [];
        for (const balance of this.balances.values()) {
            if (balance.userId === userId) {
                userBalances.push(balance);
            }
        }
        return userBalances;
    }
    async getBalance(userId, symbol) {
        return this.balances.get(`${userId}-${symbol}`);
    }
    async updateBalance(userId, symbol, available, locked) {
        const key = `${userId}-${symbol}`;
        const existing = this.balances.get(key);
        const balance = {
            id: existing?.id || `demo-balance-${Date.now()}`,
            userId,
            symbol,
            available,
            locked,
            createdAt: existing?.createdAt || new Date(),
            updatedAt: new Date(),
        };
        this.balances.set(key, balance);
        return balance;
    }
    async createBalance(balance) {
        const newBalance = {
            id: `demo-balance-${Date.now()}`,
            ...balance,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.balances.set(`${balance.userId}-${balance.symbol}`, newBalance);
        return newBalance;
    }
    async createTrade(trade) {
        const newTrade = {
            id: `demo-trade-${Date.now()}`,
            ...trade,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.trades.set(newTrade.id, newTrade);
        return newTrade;
    }
    async getTrade(id) {
        return this.trades.get(id);
    }
    async getUserTrades(userId, limit) {
        const userTrades = [];
        for (const trade of this.trades.values()) {
            if (trade.userId === userId) {
                userTrades.push(trade);
            }
        }
        return limit ? userTrades.slice(0, limit) : userTrades;
    }
    async updateTrade(id, updates) {
        const trade = this.trades.get(id);
        if (!trade)
            throw new Error('Trade not found');
        const updatedTrade = { ...trade, ...updates, updatedAt: new Date() };
        this.trades.set(id, updatedTrade);
        return updatedTrade;
    }
    async getActiveTrades(userId) {
        const activeTrades = [];
        for (const trade of this.trades.values()) {
            if (trade.userId === userId && trade.status === 'active') {
                activeTrades.push(trade);
            }
        }
        return activeTrades;
    }
    async createSpotOrder(order) {
        const spotOrder = {
            id: `spot-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: order.userId,
            symbol: order.symbol,
            side: order.side,
            type: order.type,
            amount: order.amount,
            price: order.price,
            total: order.total,
            status: order.status,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.spotOrders.set(spotOrder.id, spotOrder);
        return spotOrder;
    }
    async getSpotOrder(id) {
        return this.spotOrders.get(id) || null;
    }
    async getUserSpotOrders(userId) {
        const userOrders = [];
        for (const order of this.spotOrders.values()) {
            if (order.userId === userId) {
                userOrders.push(order);
            }
        }
        return userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async updateSpotOrder(id, updates) {
        const order = this.spotOrders.get(id);
        if (!order)
            throw new Error('Spot order not found');
        const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
        this.spotOrders.set(id, updatedOrder);
        return updatedOrder;
    }
    async updateUserBalance(userId, currency, amount) {
        let balance = null;
        for (const bal of this.balances.values()) {
            if (bal.userId === userId && bal.currency === currency) {
                balance = bal;
                break;
            }
        }
        if (balance) {
            const newBalance = parseFloat(balance.balance) + amount;
            balance.balance = Math.max(0, newBalance).toString();
            balance.updatedAt = new Date();
        }
        else {
            // Create new balance if it doesn't exist
            const newBalance = {
                id: `demo-balance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId,
                currency,
                balance: Math.max(0, amount).toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.balances.set(newBalance.id, newBalance);
        }
    }
    async getAllTrades() {
        return Array.from(this.trades.values());
    }
    async createTransaction(transaction) {
        const newTransaction = {
            id: `demo-transaction-${Date.now()}`,
            ...transaction,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.transactions.set(newTransaction.id, newTransaction);
        return newTransaction;
    }
    async getUserTransactions(userId, limit) {
        const userTransactions = [];
        for (const transaction of this.transactions.values()) {
            if (transaction.userId === userId) {
                userTransactions.push(transaction);
            }
        }
        return limit ? userTransactions.slice(0, limit) : userTransactions;
    }
    async getAllTransactions() {
        const allTransactions = Array.from(this.transactions.values());
        return allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getPendingTransactions() {
        const pendingTransactions = [];
        for (const transaction of this.transactions.values()) {
            if (transaction.status === 'pending') {
                pendingTransactions.push(transaction);
            }
        }
        return pendingTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getOptionsSettings() {
        return this.optionsSettings;
    }
    async updateOptionsSettings(id, updates) {
        const index = this.optionsSettings.findIndex(s => s.id === id);
        if (index === -1)
            throw new Error('Settings not found');
        this.optionsSettings[index] = { ...this.optionsSettings[index], ...updates };
        return this.optionsSettings[index];
    }
    async createAdminControl(control) {
        const newControl = {
            id: `demo-control-${Date.now()}`,
            ...control,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.adminControls.set(newControl.id, newControl);
        return newControl;
    }
    async getAdminControl(userId) {
        for (const control of this.adminControls.values()) {
            if (control.userId === userId) {
                return control;
            }
        }
        return undefined;
    }
    async updateAdminControl(id, updates) {
        const control = this.adminControls.get(id);
        if (!control)
            throw new Error('Control not found');
        const updatedControl = { ...control, ...updates, updatedAt: new Date() };
        this.adminControls.set(id, updatedControl);
        return updatedControl;
    }
    async deleteAdminControl(id) {
        this.adminControls.delete(id);
    }
    async getAllMarketData() {
        return Array.from(this.marketData.values());
    }
    async getMarketData(symbol) {
        return this.marketData.get(symbol);
    }
    async updateMarketData(symbol, data) {
        const existing = this.marketData.get(symbol);
        const marketDataEntry = {
            id: existing?.id || `demo-market-${Date.now()}`,
            symbol,
            ...data,
            timestamp: new Date(),
        };
        this.marketData.set(symbol, marketDataEntry);
        return marketDataEntry;
    }
    async createMarketData(data) {
        const marketDataEntry = {
            id: `demo-market-${Date.now()}`,
            ...data,
            timestamp: new Date(),
        };
        this.marketData.set(data.symbol, marketDataEntry);
        return marketDataEntry;
    }
    async getTradingPairs() {
        return this.tradingPairs;
    }
    async getAllBalances() {
        return Array.from(this.balances.values());
    }
    async getAllAdminControls() {
        return Array.from(this.adminControls.values());
    }
    // Trading control operations
    async getTradingControls() {
        return [];
    }
    async createTradingControl(userId, controlType, notes, adminId) {
        // Create admin control for demo storage
        const newControl = {
            id: `demo-control-${Date.now()}`,
            userId,
            adminId: adminId || 'superadmin-1',
            controlType: controlType,
            isActive: true,
            notes,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Deactivate existing controls for this user
        for (const [id, control] of this.adminControls.entries()) {
            if (control.userId === userId && control.isActive) {
                this.adminControls.set(id, { ...control, isActive: false });
            }
        }
        // Add new control
        this.adminControls.set(newControl.id, newControl);
        return {
            id: newControl.id,
            userId,
            controlType,
            notes,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    async updateTradingControl(id, updates) {
        return { id, ...updates, updatedAt: new Date().toISOString() };
    }
    // User wallet operations
    async getUserWallets() {
        return [];
    }
    async updateUserPassword(userId, hashedPassword) {
        console.log(`Demo mode: Updated password for user ${userId}`);
    }
    async updateUserWallet(userId, walletAddress) {
        console.log(`Demo mode: Updated wallet for user ${userId} to ${walletAddress}`);
    }
}
// Wrapper class that falls back to demo storage if database fails
class SafeStorage {
    constructor() {
        this.dbStorage = new DatabaseStorage();
        this.demoStorage = new DemoStorage();
        this.useFallback = false;
        this.lastRetryTime = 0;
        this.retryInterval = 10000; // 10 seconds
    }
    // Force reset to database mode (useful for troubleshooting)
    resetToDatabase() {
        console.log('🔄 Manually resetting to database mode...');
        this.useFallback = false;
        this.lastRetryTime = 0;
    }
    // Check current mode
    getCurrentMode() {
        return this.useFallback ? 'demo' : 'database';
    }
    async tryDatabase(operation) {
        // In development mode, always use database - no fallback to demo mode
        if (process.env.NODE_ENV === 'development') {
            try {
                return await operation();
            }
            catch (error) {
                console.error('❌ Database operation failed in development mode:', error);
                // Re-throw the error instead of falling back to demo mode
                throw error;
            }
        }
        // Check if we should retry database connection (production only)
        const now = Date.now();
        if (this.useFallback && (now - this.lastRetryTime) > this.retryInterval) {
            console.log('🔄 Attempting to reconnect to database...');
            this.useFallback = false;
            this.lastRetryTime = now;
        }
        if (this.useFallback) {
            throw new Error('Database unavailable, using fallback');
        }
        try {
            const result = await operation();
            if (this.useFallback) {
                console.log('✅ Database connection restored!');
                this.useFallback = false;
            }
            return result;
        }
        catch (error) {
            console.error('❌ Database operation failed, switching to demo mode:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack?.split('\n').slice(0, 5).join('\n')
            });
            this.useFallback = true;
            this.lastRetryTime = now;
            throw error;
        }
    }
    async getUser(id) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUser(id));
        }
        catch {
            return this.demoStorage.getUser(id);
        }
    }
    async getUserByUsername(username) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserByUsername(username));
        }
        catch {
            return this.demoStorage.getUser(username);
        }
    }
    async getUserByEmail(email) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserByEmail(email));
        }
        catch {
            return undefined;
        }
    }
    async getUserByWallet(walletAddress) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserByWallet(walletAddress));
        }
        catch {
            return undefined;
        }
    }
    async createUser(user) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createUser(user));
        }
        catch {
            return this.demoStorage.createUser(user);
        }
    }
    async updateUser(id, user) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateUser(id, user));
        }
        catch {
            return this.demoStorage.updateUser(id, user);
        }
    }
    async deleteUser(id) {
        try {
            await this.tryDatabase(() => this.dbStorage.deleteUser(id));
        }
        catch {
            return this.demoStorage.deleteUser(id);
        }
    }
    async getAllUsers() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getAllUsers());
        }
        catch {
            return this.demoStorage.getAllUsers();
        }
    }
    // Add fallback implementations for other methods
    async getUserBalances(userId) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserBalances(userId));
        }
        catch {
            return this.demoStorage.getUserBalances(userId);
        }
    }
    async getBalance(userId, symbol) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getBalance(userId, symbol));
        }
        catch {
            return this.demoStorage.getBalance(userId, symbol);
        }
    }
    async updateBalance(userId, symbol, available, locked) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateBalance(userId, symbol, available, locked));
        }
        catch {
            return this.demoStorage.updateBalance(userId, symbol, available, locked);
        }
    }
    async createBalance(balance) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createBalance(balance));
        }
        catch {
            return balance;
        }
    }
    // Delegate other methods with fallbacks
    async createTrade(trade) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createTrade(trade));
        }
        catch {
            return this.demoStorage.createTrade(trade);
        }
    }
    async getTrade(id) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getTrade(id));
        }
        catch {
            return undefined;
        }
    }
    async getUserTrades(userId, limit) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserTrades(userId, limit));
        }
        catch {
            return this.demoStorage.getUserTrades(userId, limit || 100);
        }
    }
    async updateTrade(id, updates) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateTrade(id, updates));
        }
        catch {
            return this.demoStorage.updateTrade(id, updates);
        }
    }
    async getActiveTrades(userId) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getActiveTrades(userId));
        }
        catch {
            return [];
        }
    }
    // Spot trading operations
    async createSpotOrder(order) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createSpotOrder(order));
        }
        catch {
            return this.demoStorage.createSpotOrder(order);
        }
    }
    async getSpotOrder(id) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getSpotOrder(id));
        }
        catch {
            return this.demoStorage.getSpotOrder(id);
        }
    }
    async getUserSpotOrders(userId) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserSpotOrders(userId));
        }
        catch {
            return this.demoStorage.getUserSpotOrders(userId);
        }
    }
    async updateSpotOrder(id, updates) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateSpotOrder(id, updates));
        }
        catch {
            return this.demoStorage.updateSpotOrder(id, updates);
        }
    }
    async updateUserBalance(userId, currency, amount) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateUserBalance(userId, currency, amount));
        }
        catch {
            return this.demoStorage.updateUserBalance(userId, currency, amount);
        }
    }
    async getAllTrades() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getAllTrades());
        }
        catch {
            return this.demoStorage.getAllTrades();
        }
    }
    async createTransaction(transaction) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createTransaction(transaction));
        }
        catch {
            return this.demoStorage.createTransaction(transaction);
        }
    }
    async updateTransaction(id, updates) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateTransaction(id, updates));
        }
        catch {
            return { id, ...updates };
        }
    }
    async getTransaction(id) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getTransaction(id));
        }
        catch {
            return undefined;
        }
    }
    async getPendingTransactions() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getPendingTransactions());
        }
        catch {
            return this.demoStorage.getPendingTransactions();
        }
    }
    async getAllTransactions() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getAllTransactions());
        }
        catch {
            return this.demoStorage.getAllTransactions();
        }
    }
    async getUserTransactions(userId, limit) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserTransactions(userId, limit));
        }
        catch {
            return this.demoStorage.getUserTransactions(userId, limit || 100);
        }
    }
    async getOptionsSettings() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getOptionsSettings());
        }
        catch {
            return this.demoStorage.getOptionsSettings();
        }
    }
    async updateOptionsSettings(id, updates) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateOptionsSettings(id, updates));
        }
        catch {
            return this.demoStorage.updateOptionsSettings(id, updates);
        }
    }
    async createAdminControl(control) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createAdminControl(control));
        }
        catch {
            return this.demoStorage.createAdminControl(control);
        }
    }
    async getAdminControl(userId) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getAdminControl(userId));
        }
        catch {
            return this.demoStorage.getAdminControl(userId);
        }
    }
    async updateAdminControl(id, updates) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateAdminControl(id, updates));
        }
        catch {
            return this.demoStorage.updateAdminControl(id, updates);
        }
    }
    async deleteAdminControl(id) {
        try {
            await this.tryDatabase(() => this.dbStorage.deleteAdminControl(id));
        }
        catch {
            return this.demoStorage.deleteAdminControl(id);
        }
    }
    async getAllMarketData() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getAllMarketData());
        }
        catch {
            return this.demoStorage.getAllMarketData();
        }
    }
    async getMarketData(symbol) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getMarketData(symbol));
        }
        catch {
            return this.demoStorage.getMarketData(symbol);
        }
    }
    async updateMarketData(symbol, data) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateMarketData(symbol, data));
        }
        catch {
            return this.demoStorage.updateMarketData(symbol, data);
        }
    }
    async createMarketData(data) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createMarketData(data));
        }
        catch {
            return this.demoStorage.createMarketData(data);
        }
    }
    async getTradingPairs() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getTradingPairs());
        }
        catch {
            return this.demoStorage.getTradingPairs();
        }
    }
    async getAllBalances() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getAllBalances());
        }
        catch {
            return this.demoStorage.getAllBalances();
        }
    }
    async getAllAdminControls() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getAllAdminControls());
        }
        catch {
            return this.demoStorage.getAllAdminControls();
        }
    }
    // Missing methods from interface
    async getUserById(id) {
        return this.getUser(id);
    }
    async getUserByWalletAddress(walletAddress) {
        return this.getUserByWallet(walletAddress);
    }
    async getUsersByAdmin(adminId) {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUsersByAdmin(adminId));
        }
        catch {
            return [];
        }
    }
    async createOptionsSettings(settings) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createOptionsSettings(settings));
        }
        catch {
            return settings;
        }
    }
    // Trading control operations
    async getTradingControls() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getTradingControls());
        }
        catch {
            return [];
        }
    }
    async createTradingControl(userId, controlType, notes) {
        try {
            return await this.tryDatabase(() => this.dbStorage.createTradingControl(userId, controlType, notes));
        }
        catch {
            return {
                id: Date.now().toString(),
                userId,
                controlType,
                notes,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    }
    async updateTradingControl(id, updates) {
        try {
            return await this.tryDatabase(() => this.dbStorage.updateTradingControl(id, updates));
        }
        catch {
            return { id, ...updates, updatedAt: new Date().toISOString() };
        }
    }
    // User wallet operations
    async getUserWallets() {
        try {
            return await this.tryDatabase(() => this.dbStorage.getUserWallets());
        }
        catch {
            return [];
        }
    }
    async updateUserPassword(userId, hashedPassword) {
        try {
            await this.tryDatabase(() => this.dbStorage.updateUserPassword(userId, hashedPassword));
        }
        catch {
            // Fallback to demo mode
            console.log(`Demo mode: Updated password for user ${userId}`);
        }
    }
    async updateUserWallet(userId, walletAddress) {
        try {
            await this.tryDatabase(() => this.dbStorage.updateUserWallet(userId, walletAddress));
        }
        catch {
            // Fallback to demo mode
            console.log(`Demo mode: Updated wallet for user ${userId} to ${walletAddress}`);
        }
    }
}
exports.SafeStorage = SafeStorage;
exports.storage = new SafeStorage();
