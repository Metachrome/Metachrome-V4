import {
  users,
  balances,
  trades,
  transactions,
  adminControls,
  optionsSettings,
  marketData,
  tradingPairs,
  type User,
  type InsertUser,
  type Balance,
  type InsertBalance,
  type Trade,
  type InsertTrade,
  type Transaction,
  type InsertTransaction,
  type AdminControl,
  type InsertAdminControl,
  type OptionsSettings,
  type InsertOptionsSettings,
  type MarketData,
  type InsertMarketData,
  type TradingPair,
} from "@shared/schema-sqlite";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { CacheManager, PerformanceMonitor } from "./cache";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByWallet(walletAddress: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Balance operations
  getUserBalances(userId: string): Promise<Balance[]>;
  getBalance(userId: string, symbol: string): Promise<Balance | undefined>;
  updateBalance(userId: string, symbol: string, available: string, locked: string): Promise<Balance>;
  createBalance(balance: InsertBalance): Promise<Balance>;

  // Trading operations
  createTrade(trade: InsertTrade): Promise<Trade>;
  getTrade(id: string): Promise<Trade | undefined>;
  getUserTrades(userId: string, limit?: number): Promise<Trade[]>;
  updateTrade(id: string, updates: Partial<InsertTrade>): Promise<Trade>;
  getActiveTrades(userId: string): Promise<Trade[]>;

  // Spot trading operations
  createSpotOrder(order: any): Promise<any>;
  getSpotOrder(id: string): Promise<any>;
  getUserSpotOrders(userId: string): Promise<any[]>;
  updateSpotOrder(id: string, updates: any): Promise<any>;
  updateUserBalance(userId: string, currency: string, amount: number): Promise<void>;

  // Market data operations
  getMarketData(symbol: string): Promise<MarketData | undefined>;
  updateMarketData(symbol: string, data: Partial<InsertMarketData>): Promise<MarketData>;
  createMarketData(data: InsertMarketData): Promise<MarketData>;
  getAllMarketData(): Promise<MarketData[]>;
  getTradingPairs(): Promise<TradingPair[]>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  getPendingTransactions(): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction>;

  // Admin operations
  createAdminControl(control: InsertAdminControl): Promise<AdminControl>;
  getAdminControl(userId: string): Promise<AdminControl | undefined>;
  updateAdminControl(id: string, updates: Partial<InsertAdminControl>): Promise<AdminControl>;
  deleteAdminControl(id: string): Promise<void>;
  getUsersByAdmin(adminId: string): Promise<AdminControl[]>;

  // Trading control operations
  getTradingControls(): Promise<any[]>;
  createTradingControl(userId: string, controlType: string, notes?: string): Promise<any>;
  updateTradingControl(id: string, updates: any): Promise<any>;

  // User wallet operations
  getUserWallets(): Promise<any[]>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  updateUserWallet(userId: string, walletAddress: string): Promise<void>;

  // Options settings
  getOptionsSettings(): Promise<OptionsSettings[]>;
  createOptionsSettings(settings: InsertOptionsSettings): Promise<OptionsSettings>;
  updateOptionsSettings(id: string, updates: Partial<InsertOptionsSettings>): Promise<OptionsSettings>;

  // Admin-only operations
  getAllUsers(): Promise<User[]>;
  getAllBalances(): Promise<Balance[]>;
  getAllTrades(): Promise<Trade[]>;
  getAllAdminControls(): Promise<AdminControl[]>;
}

class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }



  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    try {
      // Delete in correct order to respect foreign key constraints
      // Delete transactions first (they might reference other tables)
      await db.delete(transactions).where(eq(transactions.userId, id));
      
      // Delete trades
      await db.delete(trades).where(eq(trades.userId, id));
      
      // Delete balances
      await db.delete(balances).where(eq(balances.userId, id));
      
      // Delete admin controls where user is the target
      await db.delete(adminControls).where(eq(adminControls.userId, id));
      
      // Update admin controls where user was the creator (set to null)
      await db.update(adminControls)
        .set({ createdBy: null })
        .where(eq(adminControls.createdBy, id));
      
      // Finally delete the user
    await db.delete(users).where(eq(users.id, id));
      
      console.log(`✅ Successfully deleted user ${id} and all related data`);
    } catch (error) {
      console.error(`❌ Error deleting user ${id}:`, error);
      throw error;
    }
  }

  // Balance operations
  async getUserBalances(userId: string): Promise<Balance[]> {
    return await db.select().from(balances).where(eq(balances.userId, userId));
  }

  async getBalance(userId: string, symbol: string): Promise<Balance | undefined> {
    return await CacheManager.getUserBalance(userId, symbol, async () => {
      return await PerformanceMonitor.measureQuery(async () => {
        const [balance] = await db
          .select()
          .from(balances)
          .where(and(eq(balances.userId, userId), eq(balances.symbol, symbol)));
        return balance;
      });
    });
  }

  async updateBalance(userId: string, symbol: string, available: string, locked: string): Promise<Balance> {
    return await PerformanceMonitor.measureQuery(async () => {
      const existingBalance = await this.getBalance(userId, symbol);

      if (existingBalance) {
        const [balance] = await db
          .update(balances)
          .set({
            available,
            locked,
            updatedAt: new Date()
          })
          .where(and(eq(balances.userId, userId), eq(balances.symbol, symbol)))
          .returning();

        // Invalidate cache after update
        CacheManager.invalidateUserBalances(userId, symbol);
        return balance;
      } else {
        const result = await this.createBalance({ userId, symbol, available, locked });
        CacheManager.invalidateUserBalances(userId, symbol);
        return result;
      }
    });
  }

  async createBalance(balanceData: InsertBalance): Promise<Balance> {
    return await PerformanceMonitor.measureQuery(async () => {
      const [balance] = await db.insert(balances).values(balanceData).returning();
      CacheManager.invalidateUserBalances(balanceData.userId, balanceData.symbol);
      return balance;
    });
  }

  // Trading operations
  async createTrade(tradeData: InsertTrade): Promise<Trade> {
    console.log(`📝 Creating trade with data:`, {
      amount: tradeData.amount,
      amountType: typeof tradeData.amount,
      allFields: Object.keys(tradeData)
    });
    const [trade] = await db.insert(trades).values(tradeData).returning();
    console.log(`✅ Trade created:`, {
      id: trade.id,
      amount: trade.amount,
      amountType: typeof trade.amount,
      allFields: Object.keys(trade)
    });
    return trade;
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    if (trade) {
      console.log(`🔍 Retrieved trade ${id}:`, {
        id: trade.id,
        amount: trade.amount,
        amountType: typeof trade.amount,
        amountIsUndefined: trade.amount === undefined,
        amountIsNull: trade.amount === null,
        amountIsEmpty: trade.amount === '',
        allFields: Object.keys(trade)
      });

      // Convert Decimal amounts to strings for proper parsing
      return {
        ...trade,
        amount: trade.amount ? trade.amount.toString() : '0',
        price: trade.price ? trade.price.toString() : undefined,
        entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined,
        exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined,
        profit: trade.profit ? trade.profit.toString() : undefined,
        fee: trade.fee ? trade.fee.toString() : undefined
      };
    }
    return undefined;
  }

  async getUserTrades(userId: string, limit: number = 100): Promise<Trade[]> {
    const userTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.createdAt))
      .limit(limit);

    // Convert Decimal amounts to strings for proper parsing
    return userTrades.map(trade => ({
      ...trade,
      amount: trade.amount ? trade.amount.toString() : '0',
      price: trade.price ? trade.price.toString() : undefined,
      entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined,
      exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined,
      profit: trade.profit ? trade.profit.toString() : undefined,
      fee: trade.fee ? trade.fee.toString() : undefined
    }));
  }

  async updateTrade(id: string, updates: Partial<InsertTrade>): Promise<Trade> {
    const [trade] = await db
      .update(trades)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trades.id, id))
      .returning();

    // Convert Decimal amounts to strings for proper parsing
    return {
      ...trade,
      amount: trade.amount ? trade.amount.toString() : '0',
      price: trade.price ? trade.price.toString() : undefined,
      entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined,
      exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined,
      profit: trade.profit ? trade.profit.toString() : undefined,
      fee: trade.fee ? trade.fee.toString() : undefined
    };
  }

  async getActiveTrades(userId: string): Promise<Trade[]> {
    const activeTrades = await db
      .select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.status, 'active')));

    // Convert Decimal amounts to strings for proper parsing
    return activeTrades.map(trade => ({
      ...trade,
      amount: trade.amount ? trade.amount.toString() : '0',
      price: trade.price ? trade.price.toString() : undefined,
      entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined,
      exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined,
      profit: trade.profit ? trade.profit.toString() : undefined,
      fee: trade.fee ? trade.fee.toString() : undefined
    }));
  }

  // Spot trading operations
  async createSpotOrder(order: any): Promise<any> {
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
    await db.insert(trades).values({
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

  async getSpotOrder(id: string): Promise<any> {
    const trade = await db
      .select()
      .from(trades)
      .where(and(eq(trades.id, id), eq(trades.type, 'spot')))
      .limit(1);

    if (!trade[0]) return null;

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

  async getUserSpotOrders(userId: string): Promise<any[]> {
    const userTrades = await db
      .select()
      .from(trades)
      .where(and(eq(trades.userId, userId), eq(trades.type, 'spot')))
      .orderBy(desc(trades.createdAt));

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

  async updateSpotOrder(id: string, updates: any): Promise<any> {
    const existingTrade = await this.getSpotOrder(id);
    if (!existingTrade) throw new Error('Spot order not found');

    await db
      .update(trades)
      .set({
        status: updates.status || existingTrade.status,
        updatedAt: new Date()
      })
      .where(eq(trades.id, id));

    return { ...existingTrade, ...updates, updatedAt: new Date() };
  }

  async updateUserBalance(userId: string, currency: string, amount: number): Promise<void> {
    const existingBalance = await db
      .select()
      .from(balances)
      .where(and(eq(balances.userId, userId), eq(balances.currency, currency)))
      .limit(1);

    if (existingBalance[0]) {
      const newBalance = parseFloat(existingBalance[0].balance) + amount;
      await db
        .update(balances)
        .set({
          balance: newBalance.toString(),
          updatedAt: new Date()
        })
        .where(and(eq(balances.userId, userId), eq(balances.currency, currency)));
    } else {
      // Create new balance if it doesn't exist
      await db.insert(balances).values({
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
  async getMarketData(symbol: string): Promise<MarketData | undefined> {
    return await CacheManager.getMarketData(symbol, async () => {
      return await PerformanceMonitor.measureQuery(async () => {
        try {
          const [data] = await db
            .select()
            .from(marketData)
            .where(eq(marketData.symbol, symbol))
            .orderBy(desc(marketData.timestamp))
            .limit(1);
          return data;
        } catch (error) {
          console.warn(`Failed to fetch market data for ${symbol}:`, error);
          return undefined;
        }
      });
    });
  }

  async updateMarketData(symbol: string, data: Partial<InsertMarketData>): Promise<MarketData> {
    return await PerformanceMonitor.measureQuery(async () => {
      // Try to update existing record first
      const existing = await this.getMarketData(symbol);

      if (existing) {
        const [updated] = await db
          .update(marketData)
          .set({ ...data, timestamp: new Date() })
          .where(eq(marketData.symbol, symbol))
          .returning();

        // Invalidate cache after update
        CacheManager.invalidateMarketData(symbol);
        return updated;
      } else {
        // Create new record if doesn't exist
        const result = await this.createMarketData({ symbol, ...data } as InsertMarketData);
        CacheManager.invalidateMarketData(symbol);
        return result;
      }
    });
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    return await PerformanceMonitor.measureQuery(async () => {
      const [marketDataRow] = await db.insert(marketData).values(data).returning();
      CacheManager.invalidateMarketData(data.symbol);
      return marketDataRow;
    });
  }

  async getAllMarketData(): Promise<MarketData[]> {
    return await CacheManager.getAllMarketData(async () => {
      return await PerformanceMonitor.measureQuery(async () => {
        return await db
          .select()
          .from(marketData)
          .orderBy(desc(marketData.timestamp));
      });
    });
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    return await CacheManager.getTradingPairs(async () => {
      return await PerformanceMonitor.measureQuery(async () => {
        return await db
          .select()
          .from(tradingPairs)
          .where(eq(tradingPairs.isActive, true));
      });
    });
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    // Ensure amount is properly converted to string for decimal storage
    // Include all fields that exist in the database schema
    const normalizedData = {
      userId: transactionData.userId,
      type: transactionData.type,
      amount: transactionData.amount ? transactionData.amount.toString() : '0',
      status: transactionData.status || 'pending',
      description: transactionData.description,
      referenceId: transactionData.referenceId,
      symbol: transactionData.symbol || 'USDT', // Default to USDT if not provided
      fee: transactionData.fee ? transactionData.fee.toString() : undefined,
      txHash: transactionData.txHash,
      method: transactionData.method,
      currency: transactionData.currency,
      metadata: transactionData.metadata
    };

    console.log(`💾 INSERTING TRANSACTION:`, {
      normalizedAmount: normalizedData.amount,
      normalizedAmountType: typeof normalizedData.amount,
      originalAmount: transactionData.amount,
      originalAmountType: typeof transactionData.amount,
      userId: normalizedData.userId,
      type: normalizedData.type,
      symbol: normalizedData.symbol
    });

    const [transaction] = await db.insert(transactions).values(normalizedData).returning();

    console.log(`✅ TRANSACTION INSERTED:`, {
      id: transaction.id,
      storedAmount: transaction.amount,
      storedAmountType: typeof transaction.amount,
      storedAmountString: transaction.amount?.toString(),
      symbol: transaction.symbol
    });

    // Convert Decimal amounts back to strings for consistency
    return {
      ...transaction,
      amount: transaction.amount ? transaction.amount.toString() : '0',
      fee: transaction.fee ? transaction.fee.toString() : undefined
    };
  }

  async getUserTransactions(userId: string, limit: number = 100): Promise<Transaction[]> {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    // Convert Decimal amounts to strings for proper parsing on frontend
    return txs.map(tx => ({
      ...tx,
      amount: tx.amount ? tx.amount.toString() : '0'
    }));
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction> {
    // Only include fields that exist in the actual database
    const normalizedUpdates: any = {};
    if (updates.type !== undefined) normalizedUpdates.type = updates.type;
    if (updates.amount !== undefined) normalizedUpdates.amount = updates.amount?.toString();
    if (updates.status !== undefined) normalizedUpdates.status = updates.status;
    if (updates.description !== undefined) normalizedUpdates.description = updates.description;
    if (updates.referenceId !== undefined) normalizedUpdates.referenceId = updates.referenceId;

    const [transaction] = await db
      .update(transactions)
      .set({ ...normalizedUpdates, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();

    // Convert Decimal amounts back to strings for consistency
    return {
      ...transaction,
      amount: transaction.amount ? transaction.amount.toString() : '0'
    };
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    if (!transaction) return undefined;

    // Convert Decimal amounts back to strings for consistency
    return {
      ...transaction,
      amount: transaction.amount ? transaction.amount.toString() : '0'
    };
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    const txs = await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, 'pending'))
      .orderBy(desc(transactions.createdAt));

    // Convert Decimal amounts to strings for proper parsing on frontend
    return txs.map(tx => ({
      ...tx,
      amount: tx.amount ? tx.amount.toString() : '0'
    }));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const txs = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(1000); // Limit to prevent performance issues

    // Convert Decimal amounts to strings for proper parsing on frontend
    return txs.map(tx => ({
      ...tx,
      amount: tx.amount ? tx.amount.toString() : '0'
    }));
  }

  // Admin operations
  async createAdminControl(controlData: InsertAdminControl): Promise<AdminControl> {
    const [control] = await db.insert(adminControls).values(controlData).returning();
    return control;
  }

  async getAdminControl(userId: string): Promise<AdminControl | undefined> {
    const [control] = await db
      .select()
      .from(adminControls)
      .where(and(eq(adminControls.userId, userId), eq(adminControls.isActive, true)))
      .orderBy(desc(adminControls.createdAt))
      .limit(1);
    return control;
  }

  async updateAdminControl(id: string, updates: Partial<InsertAdminControl>): Promise<AdminControl> {
    const [control] = await db
      .update(adminControls)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminControls.id, id))
      .returning();
    return control;
  }

  async deleteAdminControl(id: string): Promise<void> {
    await db
      .delete(adminControls)
      .where(eq(adminControls.id, id));
  }

  async getUsersByAdmin(adminId: string): Promise<AdminControl[]> {
    return await db
      .select()
      .from(adminControls)
      .where(and(eq(adminControls.adminId, adminId), eq(adminControls.isActive, true)));
  }

  // Options settings
  async getOptionsSettings(): Promise<OptionsSettings[]> {
    return await db
      .select()
      .from(optionsSettings)
      .where(eq(optionsSettings.isActive, true))
      .orderBy(optionsSettings.duration);
  }

  async createOptionsSettings(settingsData: InsertOptionsSettings): Promise<OptionsSettings> {
    const [settings] = await db.insert(optionsSettings).values(settingsData).returning();
    return settings;
  }

  async updateOptionsSettings(id: string, updates: Partial<InsertOptionsSettings>): Promise<OptionsSettings> {
    const [settings] = await db
      .update(optionsSettings)
      .set(updates)
      .where(eq(optionsSettings.id, id))
      .returning();
    return settings;
  }

  // Admin-only operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllBalances(): Promise<any[]> {
    // Avoid nested select shapes which can break on some drizzle-sqlite versions
    const rows = await db
      .select()
      .from(balances)
      .leftJoin(users, eq(balances.userId, users.id))
      .orderBy(desc(balances.createdAt));

    return rows.map((row: any) => {
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

  async getAllTrades(): Promise<any[]> {
    const rows = await db
      .select()
      .from(trades)
      .leftJoin(users, eq(trades.userId, users.id))
      .orderBy(desc(trades.createdAt));

    return rows.map((row: any) => {
      const t = row.trades ?? row;
      const usr = row.users ?? {};
      return {
        id: t.id,
        userId: t.userId,
        symbol: t.symbol,
        type: t.type,
        direction: t.direction,
        amount: t.amount ? t.amount.toString() : '0',
        price: t.price ? t.price.toString() : undefined,
        entryPrice: t.entryPrice ? t.entryPrice.toString() : undefined,
        exitPrice: t.exitPrice ? t.exitPrice.toString() : undefined,
        profit: t.profit ? t.profit.toString() : undefined,
        fee: t.fee ? t.fee.toString() : undefined,
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

  async getAllAdminControls(): Promise<any[]> {
    const rows = await db
      .select()
      .from(adminControls)
      .leftJoin(users, eq(adminControls.userId, users.id))
      .where(eq(adminControls.isActive, true))
      .orderBy(desc(adminControls.createdAt));

    return rows.map((row: any) => {
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
  async getTradingControls(): Promise<any[]> {
    try {
      const controls = await db
        .select()
        .from(adminControls)
        .orderBy(desc(adminControls.createdAt));
      
      // Join with user data to get usernames
      const controlsWithUsers = await Promise.all(
        controls.map(async (control) => {
          const user = await this.getUserById(control.userId);
          return {
            ...control,
            username: user?.username || 'Unknown User',
            notes: control.notes || ''
          };
        })
      );
      
      return controlsWithUsers;
    } catch (error) {
      console.error('Error fetching trading controls:', error);
      return [];
    }
  }

  async createTradingControl(userId: string, controlType: string, notes?: string, adminId?: string): Promise<any> {
    try {
      // First, deactivate any existing controls for this user
      await db
        .update(adminControls)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(adminControls.userId, userId));

      // Create new control
      const newControl = await db
        .insert(adminControls)
        .values({
          userId,
          adminId: adminId || 'superadmin-1', // Default to superadmin if not provided
          controlType: controlType as 'normal' | 'win' | 'lose',
          isActive: true,
          notes,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return newControl[0];
    } catch (error) {
      console.error('Error creating trading control:', error);
      throw error;
    }
  }

  async updateTradingControl(id: string, updates: any): Promise<any> {
    try {
      const updatedControl = await db
        .update(adminControls)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(adminControls.id, id))
        .returning();

      return updatedControl[0];
    } catch (error) {
      console.error('Error updating trading control:', error);
      throw error;
    }
  }

  // User wallet operations
  async getUserWallets(): Promise<any[]> {
    // For now, return empty array - this will be implemented with proper database schema
    return [];
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<void> {
    await db
      .update(users)
      .set({ walletAddress, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}

// Demo storage class for fallback when database is unavailable
class DemoStorage implements IStorage {
  private users = new Map<string, User>();
  private balances = new Map<string, Balance>();
  private trades = new Map<string, Trade>();
  private transactions = new Map<string, Transaction>();
  private adminControls = new Map<string, AdminControl>();
  private optionsSettings: OptionsSettings[] = [];
  private marketData = new Map<string, MarketData>();
  private tradingPairs: TradingPair[] = [];

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo admin user
    const adminUser: User = {
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
    this.users.set(adminUser.username!, adminUser);
    this.users.set(adminUser.email, adminUser);

    // Create demo admin user (admin/admin123)
    const adminUser2: User = {
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
    this.users.set(adminUser2.username!, adminUser2);
    this.users.set(adminUser2.email, adminUser2);

    // Create demo user
    const demoUser: User = {
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
    this.users.set(demoUser.username!, demoUser);
    this.users.set(demoUser.email, demoUser);

    // Create demo balance
    const demoBalance: Balance = {
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

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.get(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.get(email);
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.walletAddress === walletAddress) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return this.getUserByWallet(walletAddress);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: `demo-user-${Date.now()}`,
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    if (newUser.username) this.users.set(newUser.username, newUser);
    if (newUser.email) this.users.set(newUser.email, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');

    // Remove user from related collections
    this.balances = this.balances.filter(b => b.userId !== id);
    this.trades = this.trades.filter(t => t.userId !== id);
    this.transactions = this.transactions.filter(t => t.userId !== id);
    this.adminControls = this.adminControls.filter(ac => ac.userId !== id);
    
    // Update admin controls where user was the creator (set to null)
    this.adminControls = this.adminControls.map(ac => 
      ac.createdBy === id ? { ...ac, createdBy: null } : ac
    );

    // Remove user from users map
    this.users.delete(id);
    if (user.username) this.users.delete(user.username);
    if (user.email) this.users.delete(user.email);
  }

  async getAllUsers(): Promise<User[]> {
    const uniqueUsers = new Map<string, User>();
    for (const user of this.users.values()) {
      uniqueUsers.set(user.id, user);
    }
    return Array.from(uniqueUsers.values());
  }

  async getUserBalances(userId: string): Promise<Balance[]> {
    const userBalances: Balance[] = [];
    for (const balance of this.balances.values()) {
      if (balance.userId === userId) {
        userBalances.push(balance);
      }
    }
    return userBalances;
  }

  async getBalance(userId: string, symbol: string): Promise<Balance | undefined> {
    return this.balances.get(`${userId}-${symbol}`);
  }

  async updateBalance(userId: string, symbol: string, available: string, locked: string): Promise<Balance> {
    const key = `${userId}-${symbol}`;
    const existing = this.balances.get(key);

    const balance: Balance = {
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

  async createBalance(balance: InsertBalance): Promise<Balance> {
    const newBalance: Balance = {
      id: `demo-balance-${Date.now()}`,
      ...balance,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.balances.set(`${balance.userId}-${balance.symbol}`, newBalance);
    return newBalance;
  }

  async createTrade(trade: InsertTrade): Promise<Trade> {
    const newTrade: Trade = {
      id: `demo-trade-${Date.now()}`,
      ...trade,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.trades.set(newTrade.id, newTrade);
    return newTrade;
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async getUserTrades(userId: string, limit?: number): Promise<Trade[]> {
    const userTrades: Trade[] = [];
    for (const trade of this.trades.values()) {
      if (trade.userId === userId) {
        userTrades.push(trade);
      }
    }
    return limit ? userTrades.slice(0, limit) : userTrades;
  }

  async updateTrade(id: string, updates: Partial<InsertTrade>): Promise<Trade> {
    const trade = this.trades.get(id);
    if (!trade) throw new Error('Trade not found');

    const updatedTrade = { ...trade, ...updates, updatedAt: new Date() };
    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }

  async getActiveTrades(userId: string): Promise<Trade[]> {
    const activeTrades: Trade[] = [];
    for (const trade of this.trades.values()) {
      if (trade.userId === userId && trade.status === 'active') {
        activeTrades.push(trade);
      }
    }
    return activeTrades;
  }

  // Spot trading operations
  private spotOrders = new Map<string, any>();

  async createSpotOrder(order: any): Promise<any> {
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

  async getSpotOrder(id: string): Promise<any> {
    return this.spotOrders.get(id) || null;
  }

  async getUserSpotOrders(userId: string): Promise<any[]> {
    const userOrders: any[] = [];
    for (const order of this.spotOrders.values()) {
      if (order.userId === userId) {
        userOrders.push(order);
      }
    }
    return userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateSpotOrder(id: string, updates: any): Promise<any> {
    const order = this.spotOrders.get(id);
    if (!order) throw new Error('Spot order not found');

    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.spotOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async updateUserBalance(userId: string, currency: string, amount: number): Promise<void> {
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
    } else {
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

  async getAllTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: `demo-transaction-${Date.now()}`,
      ...transaction,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    const userTransactions: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.userId === userId) {
        userTransactions.push(transaction);
      }
    }
    return limit ? userTransactions.slice(0, limit) : userTransactions;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const allTransactions: Transaction[] = Array.from(this.transactions.values());
    return allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    const pendingTransactions: Transaction[] = [];
    for (const transaction of this.transactions.values()) {
      if (transaction.status === 'pending') {
        pendingTransactions.push(transaction);
      }
    }
    return pendingTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOptionsSettings(): Promise<OptionsSettings[]> {
    return this.optionsSettings;
  }

  async updateOptionsSettings(id: string, updates: Partial<InsertOptionsSettings>): Promise<OptionsSettings> {
    const index = this.optionsSettings.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Settings not found');

    this.optionsSettings[index] = { ...this.optionsSettings[index], ...updates };
    return this.optionsSettings[index];
  }

  async createAdminControl(control: InsertAdminControl): Promise<AdminControl> {
    const newControl: AdminControl = {
      id: `demo-control-${Date.now()}`,
      ...control,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.adminControls.set(newControl.id, newControl);
    return newControl;
  }

  async getAdminControl(userId: string): Promise<AdminControl | undefined> {
    for (const control of this.adminControls.values()) {
      if (control.userId === userId) {
        return control;
      }
    }
    return undefined;
  }

  async updateAdminControl(id: string, updates: Partial<InsertAdminControl>): Promise<AdminControl> {
    const control = this.adminControls.get(id);
    if (!control) throw new Error('Control not found');

    const updatedControl = { ...control, ...updates, updatedAt: new Date() };
    this.adminControls.set(id, updatedControl);
    return updatedControl;
  }

  async deleteAdminControl(id: string): Promise<void> {
    this.adminControls.delete(id);
  }

  async getAllMarketData(): Promise<MarketData[]> {
    return Array.from(this.marketData.values());
  }

  async getMarketData(symbol: string): Promise<MarketData | undefined> {
    return this.marketData.get(symbol);
  }

  async updateMarketData(symbol: string, data: Partial<InsertMarketData>): Promise<MarketData> {
    const existing = this.marketData.get(symbol);
    const marketDataEntry: MarketData = {
      id: existing?.id || `demo-market-${Date.now()}`,
      symbol,
      ...data,
      timestamp: new Date(),
    };
    this.marketData.set(symbol, marketDataEntry);
    return marketDataEntry;
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    const marketDataEntry: MarketData = {
      id: `demo-market-${Date.now()}`,
      ...data,
      timestamp: new Date(),
    };
    this.marketData.set(data.symbol, marketDataEntry);
    return marketDataEntry;
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    return this.tradingPairs;
  }

  async getAllBalances(): Promise<Balance[]> {
    return Array.from(this.balances.values());
  }

  async getAllAdminControls(): Promise<AdminControl[]> {
    return Array.from(this.adminControls.values());
  }

  // Trading control operations
  async getTradingControls(): Promise<any[]> {
    return [];
  }

  async createTradingControl(userId: string, controlType: string, notes?: string, adminId?: string): Promise<any> {
    // Create admin control for demo storage
    const newControl: AdminControl = {
      id: `demo-control-${Date.now()}`,
      userId,
      adminId: adminId || 'superadmin-1',
      controlType: controlType as 'normal' | 'win' | 'lose',
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

  async updateTradingControl(id: string, updates: any): Promise<any> {
    return { id, ...updates, updatedAt: new Date().toISOString() };
  }

  // User wallet operations
  async getUserWallets(): Promise<any[]> {
    return [];
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    console.log(`Demo mode: Updated password for user ${userId}`);
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<void> {
    console.log(`Demo mode: Updated wallet for user ${userId} to ${walletAddress}`);
  }
}

// Wrapper class that falls back to demo storage if database fails
export class SafeStorage implements IStorage {
  private dbStorage = new DatabaseStorage();
  private demoStorage = new DemoStorage();
  private useFallback = false;
  private lastRetryTime = 0;
  private retryInterval = 10000; // 10 seconds

  // Force reset to database mode (useful for troubleshooting)
  public resetToDatabase(): void {
    console.log('🔄 Manually resetting to database mode...');
    this.useFallback = false;
    this.lastRetryTime = 0;
  }

  // Check current mode
  public getCurrentMode(): string {
    return this.useFallback ? 'demo' : 'database';
  }

  private async tryDatabase<T>(operation: () => Promise<T>): Promise<T> {
    // In development mode, always use database - no fallback to demo mode
    if (process.env.NODE_ENV === 'development') {
      try {
        return await operation();
      } catch (error) {
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
    } catch (error) {
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

  async getUser(id: string): Promise<User | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUser(id));
    } catch {
      return this.demoStorage.getUser(id) as any;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserByUsername(username));
    } catch {
      return this.demoStorage.getUser(username) as any;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserByEmail(email));
    } catch {
      return undefined;
    }
  }

  async getUserByWallet(walletAddress: string): Promise<User | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserByWallet(walletAddress));
    } catch {
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createUser(user));
    } catch {
      return this.demoStorage.createUser(user) as any;
    }
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateUser(id, user));
    } catch {
      return this.demoStorage.updateUser(id, user) as any;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.tryDatabase(() => this.dbStorage.deleteUser(id));
    } catch {
      return this.demoStorage.deleteUser(id);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getAllUsers());
    } catch {
      return this.demoStorage.getAllUsers() as any;
    }
  }

  // Add fallback implementations for other methods
  async getUserBalances(userId: string): Promise<Balance[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserBalances(userId));
    } catch {
      return this.demoStorage.getUserBalances(userId) as any;
    }
  }

  async getBalance(userId: string, symbol: string): Promise<Balance | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getBalance(userId, symbol));
    } catch {
      return this.demoStorage.getBalance(userId, symbol) as any;
    }
  }

  async updateBalance(userId: string, symbol: string, available: string, locked: string): Promise<Balance> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateBalance(userId, symbol, available, locked));
    } catch {
      return this.demoStorage.updateBalance(userId, symbol, available, locked) as any;
    }
  }

  async createBalance(balance: InsertBalance): Promise<Balance> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createBalance(balance));
    } catch {
      return balance as any;
    }
  }

  // Delegate other methods with fallbacks
  async createTrade(trade: InsertTrade): Promise<Trade> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createTrade(trade));
    } catch {
      return this.demoStorage.createTrade(trade) as any;
    }
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getTrade(id));
    } catch {
      return undefined;
    }
  }

  async getUserTrades(userId: string, limit?: number): Promise<Trade[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserTrades(userId, limit));
    } catch {
      return this.demoStorage.getUserTrades(userId, limit || 100) as any;
    }
  }

  async updateTrade(id: string, updates: Partial<InsertTrade>): Promise<Trade> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateTrade(id, updates));
    } catch {
      return this.demoStorage.updateTrade(id, updates) as any;
    }
  }

  async getActiveTrades(userId: string): Promise<Trade[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getActiveTrades(userId));
    } catch {
      return [];
    }
  }

  // Spot trading operations
  async createSpotOrder(order: any): Promise<any> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createSpotOrder(order));
    } catch {
      return this.demoStorage.createSpotOrder(order);
    }
  }

  async getSpotOrder(id: string): Promise<any> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getSpotOrder(id));
    } catch {
      return this.demoStorage.getSpotOrder(id);
    }
  }

  async getUserSpotOrders(userId: string): Promise<any[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserSpotOrders(userId));
    } catch {
      return this.demoStorage.getUserSpotOrders(userId);
    }
  }

  async updateSpotOrder(id: string, updates: any): Promise<any> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateSpotOrder(id, updates));
    } catch {
      return this.demoStorage.updateSpotOrder(id, updates);
    }
  }

  async updateUserBalance(userId: string, currency: string, amount: number): Promise<void> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateUserBalance(userId, currency, amount));
    } catch {
      return this.demoStorage.updateUserBalance(userId, currency, amount);
    }
  }

  async getAllTrades(): Promise<Trade[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getAllTrades());
    } catch {
      return this.demoStorage.getAllTrades() as any;
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createTransaction(transaction));
    } catch {
      return this.demoStorage.createTransaction(transaction) as any;
    }
  }

  async updateTransaction(id: string, updates: Partial<InsertTransaction>): Promise<Transaction> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateTransaction(id, updates));
    } catch {
      return { id, ...updates } as any;
    }
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getTransaction(id));
    } catch {
      return undefined;
    }
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getPendingTransactions());
    } catch {
      return this.demoStorage.getPendingTransactions() as any;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getAllTransactions());
    } catch {
      return this.demoStorage.getAllTransactions() as any;
    }
  }

  async getUserTransactions(userId: string, limit?: number): Promise<Transaction[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserTransactions(userId, limit));
    } catch {
      return this.demoStorage.getUserTransactions(userId, limit || 100) as any;
    }
  }

  async getOptionsSettings(): Promise<OptionsSettings[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getOptionsSettings());
    } catch {
      return this.demoStorage.getOptionsSettings() as any;
    }
  }

  async updateOptionsSettings(id: string, updates: Partial<InsertOptionsSettings>): Promise<OptionsSettings> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateOptionsSettings(id, updates));
    } catch {
      return this.demoStorage.updateOptionsSettings(id, updates) as any;
    }
  }

  async createAdminControl(control: InsertAdminControl): Promise<AdminControl> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createAdminControl(control));
    } catch {
      return this.demoStorage.createAdminControl(control) as any;
    }
  }

  async getAdminControl(userId: string): Promise<AdminControl | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getAdminControl(userId));
    } catch {
      return this.demoStorage.getAdminControl(userId) as any;
    }
  }

  async updateAdminControl(id: string, updates: Partial<InsertAdminControl>): Promise<AdminControl> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateAdminControl(id, updates));
    } catch {
      return this.demoStorage.updateAdminControl(id, updates) as any;
    }
  }

  async deleteAdminControl(id: string): Promise<void> {
    try {
      await this.tryDatabase(() => this.dbStorage.deleteAdminControl(id));
    } catch {
      return this.demoStorage.deleteAdminControl(id);
    }
  }

  async getAllMarketData(): Promise<MarketData[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getAllMarketData());
    } catch {
      return this.demoStorage.getAllMarketData() as any;
    }
  }

  async getMarketData(symbol: string): Promise<MarketData | undefined> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getMarketData(symbol));
    } catch {
      return this.demoStorage.getMarketData(symbol) as any;
    }
  }

  async updateMarketData(symbol: string, data: Partial<InsertMarketData>): Promise<MarketData> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateMarketData(symbol, data));
    } catch {
      return this.demoStorage.updateMarketData(symbol, data) as any;
    }
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createMarketData(data));
    } catch {
      return this.demoStorage.createMarketData(data) as any;
    }
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getTradingPairs());
    } catch {
      return this.demoStorage.getTradingPairs() as any;
    }
  }

  async getAllBalances(): Promise<Balance[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getAllBalances());
    } catch {
      return this.demoStorage.getAllBalances() as any;
    }
  }

  async getAllAdminControls(): Promise<AdminControl[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getAllAdminControls());
    } catch {
      return this.demoStorage.getAllAdminControls() as any;
    }
  }

  // Missing methods from interface
  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return this.getUserByWallet(walletAddress);
  }

  async getUsersByAdmin(adminId: string): Promise<AdminControl[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUsersByAdmin(adminId));
    } catch {
      return [];
    }
  }

  async createOptionsSettings(settings: InsertOptionsSettings): Promise<OptionsSettings> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createOptionsSettings(settings));
    } catch {
      return settings as any;
    }
  }

  // Trading control operations
  async getTradingControls(): Promise<any[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getTradingControls());
    } catch {
      return [];
    }
  }

  async createTradingControl(userId: string, controlType: string, notes?: string): Promise<any> {
    try {
      return await this.tryDatabase(() => this.dbStorage.createTradingControl(userId, controlType, notes));
    } catch {
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

  async updateTradingControl(id: string, updates: any): Promise<any> {
    try {
      return await this.tryDatabase(() => this.dbStorage.updateTradingControl(id, updates));
    } catch {
      return { id, ...updates, updatedAt: new Date().toISOString() };
    }
  }

  // User wallet operations
  async getUserWallets(): Promise<any[]> {
    try {
      return await this.tryDatabase(() => this.dbStorage.getUserWallets());
    } catch {
      return [];
    }
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await this.tryDatabase(() => this.dbStorage.updateUserPassword(userId, hashedPassword));
    } catch {
      // Fallback to demo mode
      console.log(`Demo mode: Updated password for user ${userId}`);
    }
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<void> {
    try {
      await this.tryDatabase(() => this.dbStorage.updateUserWallet(userId, walletAddress));
    } catch {
      // Fallback to demo mode
      console.log(`Demo mode: Updated wallet for user ${userId} to ${walletAddress}`);
    }
  }
}

export const storage = new SafeStorage();
