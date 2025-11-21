import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'super_admin']);
export const tradeTypeEnum = pgEnum('trade_type', ['spot', 'options', 'futures']);
export const tradeDirectionEnum = pgEnum('trade_direction', ['buy', 'sell', 'up', 'down']);
export const tradeStatusEnum = pgEnum('trade_status', ['pending', 'active', 'completed', 'cancelled']);
export const adminControlEnum = pgEnum('admin_control', ['normal', 'win', 'lose']);
export const transactionTypeEnum = pgEnum('transaction_type', ['deposit', 'withdraw', 'trade', 'transfer', 'trade_win', 'trade_loss', 'bonus']);
export const transactionStatusEnum = pgEnum('transaction_status', ['pending', 'completed', 'failed']);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  // NOTE: Password is managed by Supabase Auth, not stored in this table
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
export const balances = pgTable("balances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // TEXT to match Supabase schema
  currency: varchar("currency", { length: 10 }).default('USD'), // currency instead of symbol
  balance: decimal("balance", { precision: 15, scale: 8 }).default('0'), // balance instead of available/locked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading pairs
export const tradingPairs = pgTable("trading_pairs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
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
export const marketData = pgTable("market_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
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
export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
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
  duration: integer("duration"), // seconds for options trading
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin controls for binary options
export const adminControls = pgTable("admin_controls", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  adminId: uuid("admin_id").references(() => users.id).notNull(),
  controlType: adminControlEnum("control_type").notNull(),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Options trading settings
export const optionsSettings = pgTable("options_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  duration: integer("duration").notNull(), // in seconds
  minAmount: decimal("min_amount", { precision: 18, scale: 8 }).notNull(),
  profitPercentage: decimal("profit_percentage", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
// NOTE: Extended schema to match SQLite version for compatibility
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
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
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: uuid("from_user_id").references(() => users.id).notNull(),
  toUserId: uuid("to_user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  type: varchar("type").default('text'),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  balances: many(balances),
  trades: many(trades),
  transactions: many(transactions),
  adminControls: many(adminControls, { relationName: "userControls" }),
  adminActions: many(adminControls, { relationName: "adminActions" }),
}));

export const balancesRelations = relations(balances, ({ one }) => ({
  user: one(users, {
    fields: [balances.userId],
    references: [users.id],
  }),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
}));

export const adminControlsRelations = relations(adminControls, ({ one }) => ({
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
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBalanceSchema = createInsertSchema(balances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminControlSchema = createInsertSchema(adminControls).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOptionsSettingsSchema = createInsertSchema(optionsSettings).omit({
  id: true,
  createdAt: true,
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Balance = typeof balances.$inferSelect;
export type InsertBalance = z.infer<typeof insertBalanceSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type AdminControl = typeof adminControls.$inferSelect;
export type InsertAdminControl = z.infer<typeof insertAdminControlSchema>;

export type OptionsSettings = typeof optionsSettings.$inferSelect;
export type InsertOptionsSettings = z.infer<typeof insertOptionsSettingsSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type TradingPair = typeof tradingPairs.$inferSelect;
export type Message = typeof messages.$inferSelect;
export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Admin Activity Logs - Audit trail for all admin actions
export const adminActivityLogs = pgTable("admin_activity_logs", {
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

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLogs).omit({
  id: true,
  createdAt: true,
});

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;
