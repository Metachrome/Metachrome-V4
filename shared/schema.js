var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
// Enums
export var userRoleEnum = pgEnum('user_role', ['user', 'admin', 'super_admin']);
export var tradeTypeEnum = pgEnum('trade_type', ['spot', 'options', 'futures']);
export var tradeDirectionEnum = pgEnum('trade_direction', ['buy', 'sell', 'up', 'down']);
export var tradeStatusEnum = pgEnum('trade_status', ['pending', 'active', 'completed', 'cancelled']);
export var adminControlEnum = pgEnum('admin_control', ['normal', 'win', 'lose']);
export var transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdraw', 'trade', 'transfer', 'trade_win', 'trade_loss', 'bonus']);
export var transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed']);
// Users table
export var users = pgTable("users", {
    id: uuid("id").primaryKey().default(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    email: varchar("email").unique(),
    username: varchar("username").unique(),
    password: varchar("password"), // For admin login (hashed) - added for Railway PostgreSQL
    plainPassword: varchar("plain_password"), // Plain text password for superadmin view
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    walletAddress: varchar("wallet_address").unique(),
    role: userRoleEnum("role").default('user'),
    isActive: boolean("is_active").default(true),
    status: varchar("status").default('active'), // active, inactive, suspended, paused
    adminNotes: varchar("admin_notes"), // Internal notes for admins
    verificationStatus: varchar("verification_status").default('unverified'), // unverified, pending, verified, rejected
    hasUploadedDocuments: boolean("has_uploaded_documents").default(false),
    tradingMode: varchar("trading_mode").default('normal'), // normal, win, lose
    balance: decimal("balance", { precision: 18, scale: 8 }).default('0'), // User's main balance
    lastLogin: timestamp("last_login"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// User balances
// NOTE: Using TEXT for user_id to match actual Supabase database schema
export var balances = pgTable("balances", {
    id: uuid("id").primaryKey().default(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: text("user_id").notNull(), // TEXT to match Supabase schema
    currency: varchar("currency", { length: 10 }).default('USD'), // currency instead of symbol
    balance: decimal("balance", { precision: 15, scale: 8 }).default('0'), // balance instead of available/locked
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Trading pairs
export var tradingPairs = pgTable("trading_pairs", {
    id: uuid("id").primaryKey().default(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    symbol: varchar("symbol").notNull().unique(), // BTCUSDT, ETHUSDT, etc.
    baseAsset: varchar("base_asset").notNull(), // BTC, ETH
    quoteAsset: varchar("quote_asset").notNull(), // USDT, BTC
    isActive: boolean("is_active").default(true),
    minTradeAmount: decimal("min_trade_amount", { precision: 18, scale: 8 }),
    maxTradeAmount: decimal("max_trade_amount", { precision: 18, scale: 8 }),
    priceDecimals: integer("price_decimals").default(2),
    quantityDecimals: integer("quantity_decimals").default(8),
    createdAt: timestamp("created_at").defaultNow(),
});
// Market data
export var marketData = pgTable("market_data", {
    id: uuid("id").primaryKey().default(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    symbol: varchar("symbol").notNull(),
    price: decimal("price", { precision: 18, scale: 8 }).notNull(),
    priceChange24h: decimal("price_change_24h", { precision: 18, scale: 8 }),
    priceChangePercent24h: decimal("price_change_percent_24h", { precision: 10, scale: 4 }),
    high24h: decimal("high_24h", { precision: 18, scale: 8 }),
    low24h: decimal("low_24h", { precision: 18, scale: 8 }),
    volume24h: decimal("volume_24h", { precision: 18, scale: 8 }),
    timestamp: timestamp("timestamp").defaultNow(),
});
// Trades
export var trades = pgTable("trades", {
    id: uuid("id").primaryKey().default(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: uuid("user_id").references(function () { return users.id; }).notNull(),
    symbol: varchar("symbol").notNull(),
    type: tradeTypeEnum("type").notNull(),
    direction: tradeDirectionEnum("direction").notNull(),
    amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
    price: decimal("price", { precision: 18, scale: 8 }).notNull(),
    entryPrice: decimal("entry_price", { precision: 18, scale: 8 }),
    exitPrice: decimal("exit_price", { precision: 18, scale: 8 }),
    profit: decimal("profit", { precision: 18, scale: 8 }),
    fee: decimal("fee", { precision: 18, scale: 8 }).default('0'),
    status: tradeStatusEnum("status").default('pending'),
    result: varchar("result", { length: 10 }), // Trade result: 'win', 'lose', 'normal' - for withdrawal eligibility
    duration: integer("duration"), // seconds for options trading
    expiresAt: timestamp("expires_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Admin controls for binary options
export var adminControls = pgTable("admin_controls", {
    id: uuid("id").primaryKey().default(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: uuid("user_id").references(function () { return users.id; }).notNull(),
    adminId: uuid("admin_id").references(function () { return users.id; }).notNull(),
    controlType: adminControlEnum("control_type").notNull(),
    isActive: boolean("is_active").default(true),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Options trading settings
export var optionsSettings = pgTable("options_settings", {
    id: uuid("id").primaryKey().default(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    duration: integer("duration").notNull(), // in seconds
    minAmount: decimal("min_amount", { precision: 18, scale: 8 }).notNull(),
    profitPercentage: decimal("profit_percentage", { precision: 5, scale: 2 }).notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});
// Transactions
// NOTE: Extended schema to match SQLite version for compatibility
export var transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().default(sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    userId: text("user_id").notNull(), // Database has TEXT, not UUID
    type: varchar("type").notNull(), // Using varchar instead of enum since database doesn't have enum constraint
    amount: decimal("amount", { precision: 15, scale: 8 }).notNull(), // Database has numeric(15,8), not (18,8)
    status: varchar("status").default('pending'), // Using varchar instead of enum
    description: text("description"), // This column exists in the database
    referenceId: varchar("reference_id"), // This column exists in the database
    symbol: varchar("symbol"), // Currency symbol (USDT, BTC, ETH, etc.)
    fee: decimal("fee", { precision: 15, scale: 8 }), // Transaction fee
    txHash: varchar("tx_hash"), // Transaction hash for blockchain transactions
    method: varchar("method"), // Payment method (crypto, card, bank)
    currency: varchar("currency"), // Currency for the transaction
    metadata: text("metadata"), // JSON metadata for additional information
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Messages (simple chat between admin and user)
export var messages = pgTable("messages", {
    id: uuid("id").primaryKey().default(sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    fromUserId: uuid("from_user_id").references(function () { return users.id; }).notNull(),
    toUserId: uuid("to_user_id").references(function () { return users.id; }).notNull(),
    message: text("message").notNull(),
    type: varchar("type").default('text'),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});
// Relations
export var usersRelations = relations(users, function (_a) {
    var many = _a.many;
    return ({
        balances: many(balances),
        trades: many(trades),
        transactions: many(transactions),
        adminControls: many(adminControls, { relationName: "userControls" }),
        adminActions: many(adminControls, { relationName: "adminActions" }),
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
            relationName: "userControls",
        }),
        admin: one(users, {
            fields: [adminControls.adminId],
            references: [users.id],
            relationName: "adminActions",
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
// Insert schemas
export var insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertBalanceSchema = createInsertSchema(balances).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertTradeSchema = createInsertSchema(trades).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertTransactionSchema = createInsertSchema(transactions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertAdminControlSchema = createInsertSchema(adminControls).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export var insertOptionsSettingsSchema = createInsertSchema(optionsSettings).omit({
    id: true,
    createdAt: true,
});
export var insertMarketDataSchema = createInsertSchema(marketData).omit({
    id: true,
    timestamp: true,
});
export var insertMessageSchema = createInsertSchema(messages).omit({
    id: true,
    createdAt: true,
});
// Admin Activity Logs - Audit trail for all admin actions
export var adminActivityLogs = pgTable("admin_activity_logs", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // Admin who performed the action
    adminId: uuid("admin_id").notNull(),
    adminUsername: varchar("admin_username", { length: 255 }).notNull(),
    adminEmail: varchar("admin_email", { length: 255 }),
    // Action details
    actionType: varchar("action_type", { length: 100 }).notNull(), // TRADING_CONTROL_CHANGE, BALANCE_UPDATE, etc.
    actionCategory: varchar("action_category", { length: 50 }).notNull(), // TRADING, BALANCE, VERIFICATION, etc.
    actionDescription: text("action_description").notNull(), // Human-readable description
    // Target user (if applicable)
    targetUserId: uuid("target_user_id"),
    targetUsername: varchar("target_username", { length: 255 }),
    targetEmail: varchar("target_email", { length: 255 }),
    // Action metadata (flexible JSON storage)
    metadata: jsonb("metadata").default({}),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    // Security tracking
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    // Soft delete flag (but should never be used - logs are permanent)
    isDeleted: boolean("is_deleted").default(false),
});
export var insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs).omit({
    id: true,
    createdAt: true,
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
