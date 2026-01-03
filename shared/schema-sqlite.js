import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
// Users table
export var users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    email: text("email").unique(),
    username: text("username").unique(),
    password: text("password"), // For admin login (hashed)
    firstName: text("first_name"),
    lastName: text("last_name"),
    profileImageUrl: text("profile_image_url"),
    walletAddress: text("wallet_address").unique(),
    role: text("role", { enum: ['user', 'admin', 'super_admin'] }).default('user'),
    isActive: integer("is_active", { mode: 'boolean' }).default(true),
    status: text("status", { enum: ['active', 'inactive', 'suspended', 'paused'] }).default('active'),
    adminNotes: text("admin_notes"), // Internal notes for admins
    verificationStatus: text("verification_status", { enum: ['unverified', 'pending', 'verified', 'rejected'] }).default('unverified'),
    hasUploadedDocuments: integer("has_uploaded_documents", { mode: 'boolean' }).default(false),
    verifiedAt: integer("verified_at", { mode: 'timestamp' }),
    lastLogin: integer("last_login", { mode: 'timestamp' }),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// User balances
export var balances = sqliteTable("balances", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    userId: text("user_id").references(function () { return users.id; }).notNull(),
    symbol: text("symbol").notNull(), // BTC, ETH, USDT, etc.
    available: text("available").default('0'), // Store as string to maintain precision
    locked: text("locked").default('0'),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Trading pairs
export var tradingPairs = sqliteTable("trading_pairs", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    symbol: text("symbol").notNull().unique(), // BTCUSDT, ETHUSDT, etc.
    baseAsset: text("base_asset").notNull(), // BTC, ETH
    quoteAsset: text("quote_asset").notNull(), // USDT, BTC
    isActive: integer("is_active", { mode: 'boolean' }).default(true),
    minTradeAmount: text("min_trade_amount"), // Store as string
    maxTradeAmount: text("max_trade_amount"),
    priceDecimals: integer("price_decimals").default(8),
    quantityDecimals: integer("quantity_decimals").default(8),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Market data
export var marketData = sqliteTable("market_data", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    symbol: text("symbol").notNull(),
    price: text("price").notNull(),
    change24h: text("change_24h"),
    volume24h: text("volume_24h"),
    high24h: text("high_24h"),
    low24h: text("low_24h"),
    timestamp: integer("timestamp", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Trades
export var trades = sqliteTable("trades", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    userId: text("user_id").references(function () { return users.id; }).notNull(),
    symbol: text("symbol").notNull(),
    type: text("type", { enum: ['spot', 'options', 'futures'] }).notNull(),
    direction: text("direction", { enum: ['buy', 'sell', 'up', 'down'] }).notNull(),
    amount: text("amount").notNull(),
    price: text("price"),
    entryPrice: text("entry_price"),
    exitPrice: text("exit_price"),
    status: text("status", { enum: ['pending', 'active', 'completed', 'cancelled'] }).default('pending'),
    result: text("result", { enum: ['win', 'lose', 'normal'] }), // Trade result for withdrawal eligibility
    duration: integer("duration"), // in seconds for options
    expiresAt: integer("expires_at", { mode: 'timestamp' }),
    profit: text("profit"),
    fee: text("fee"),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Admin controls
export var adminControls = sqliteTable("admin_controls", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    userId: text("user_id").references(function () { return users.id; }).notNull(),
    controlType: text("control_type", { enum: ['normal', 'win', 'lose'] }).default('normal'),
    isActive: integer("is_active", { mode: 'boolean' }).default(true),
    createdBy: text("created_by").references(function () { return users.id; }),
    notes: text("notes"), // Additional notes for the control
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Transactions
export var transactions = sqliteTable("transactions", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    userId: text("user_id").references(function () { return users.id; }).notNull(),
    type: text("type", { enum: ['deposit', 'withdraw', 'trade', 'transfer'] }).notNull(),
    symbol: text("symbol").notNull(),
    amount: text("amount").notNull(),
    fee: text("fee"),
    status: text("status", { enum: ['pending', 'completed', 'failed'] }).default('pending'),
    txHash: text("tx_hash"),
    fromAddress: text("from_address"),
    toAddress: text("to_address"),
    method: text("method"), // Payment method (crypto, card, bank)
    currency: text("currency"), // Currency for the transaction
    networkFee: text("network_fee"),
    metadata: text("metadata"), // JSON string for additional data
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Messages (simple chat between admin and user)
export var messages = sqliteTable("messages", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    fromUserId: text("from_user_id").references(function () { return users.id; }).notNull(),
    toUserId: text("to_user_id").references(function () { return users.id; }).notNull(),
    message: text("message").notNull(),
    type: text("type").default('text'),
    isRead: integer("is_read", { mode: 'boolean' }).default(false),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Relations
export var usersRelations = relations(users, function (_a) {
    var many = _a.many;
    return ({
        balances: many(balances),
        trades: many(trades),
        adminControls: many(adminControls),
        transactions: many(transactions),
    });
});
export var balancesRelations = relations(balances, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [balances.userId],
            references: [users.id],
        }),
    });
});
export var tradesRelations = relations(trades, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [trades.userId],
            references: [users.id],
        }),
    });
});
export var adminControlsRelations = relations(adminControls, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [adminControls.userId],
            references: [users.id],
        }),
        createdByUser: one(users, {
            fields: [adminControls.createdBy],
            references: [users.id],
        }),
    });
});
export var transactionsRelations = relations(transactions, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [transactions.userId],
            references: [users.id],
        }),
    });
});
export var messagesRelations = relations(messages, function (_a) {
    var one = _a.one;
    return ({
        fromUser: one(users, {
            fields: [messages.fromUserId],
            references: [users.id],
        }),
        toUser: one(users, {
            fields: [messages.toUserId],
            references: [users.id],
        }),
    });
});
// Options settings table
export var optionsSettings = sqliteTable("options_settings", {
    id: text("id").primaryKey().$defaultFn(function () { return crypto.randomUUID(); }),
    duration: integer("duration").notNull(), // in seconds
    minAmount: text("min_amount").notNull(),
    profitPercentage: text("profit_percentage").notNull(),
    isActive: integer("is_active", { mode: 'boolean' }).default(true),
    createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(function () { return new Date(); }),
});
// Zod schemas for validation
export var insertUserSchema = createInsertSchema(users);
export var insertBalanceSchema = createInsertSchema(balances);
export var insertTradeSchema = createInsertSchema(trades);
export var insertTransactionSchema = createInsertSchema(transactions);
export var insertAdminControlSchema = createInsertSchema(adminControls);
