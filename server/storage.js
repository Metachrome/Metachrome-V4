var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
import { users, balances, trades, transactions, adminControls, optionsSettings, marketData, tradingPairs, } from "@shared/schema-sqlite";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { CacheManager, PerformanceMonitor } from "./cache";
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
    }
    // User operations
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.id, id))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getUser(id)];
            });
        });
    };
    DatabaseStorage.prototype.getUserByWallet = function (walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.walletAddress, walletAddress))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByWalletAddress = function (walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.walletAddress, walletAddress))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.email, email))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.username, username))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(users).values(userData).returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUser = function (id, userData) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(users)
                            .set(__assign(__assign({}, userData), { updatedAt: new Date() }))
                            .where(eq(users.id, id))
                            .returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var safeDelete, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 16, , 17]);
                        console.log('🗑️ DatabaseStorage: Deleting user and all related data:', id);
                        safeDelete = function (stepName, query) { return __awaiter(_this, void 0, void 0, function () {
                            var error_2;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        console.log("".concat(stepName, "..."));
                                        return [4 /*yield*/, query];
                                    case 1:
                                        _b.sent();
                                        console.log("\u2705 ".concat(stepName, " complete"));
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_2 = _b.sent();
                                        // Ignore "table does not exist" errors, but log other errors
                                        if (error_2.code === '42P01' || ((_a = error_2.message) === null || _a === void 0 ? void 0 : _a.includes('does not exist'))) {
                                            console.log("\u26A0\uFE0F ".concat(stepName, " skipped (table doesn't exist)"));
                                        }
                                        else {
                                            console.error("\u274C ".concat(stepName, " failed:"), error_2.message);
                                            throw error_2;
                                        }
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        // Delete all related records in the correct order
                        // Using safeDelete to handle tables that might not exist
                        return [4 /*yield*/, safeDelete('Step 1: Deleting chat messages', db.execute(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["DELETE FROM chat_messages WHERE sender_id = ", ""], ["DELETE FROM chat_messages WHERE sender_id = ", ""])), id)))];
                    case 1:
                        // Delete all related records in the correct order
                        // Using safeDelete to handle tables that might not exist
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 2: Deleting chat conversations', db.execute(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["DELETE FROM chat_conversations WHERE user_id = ", " OR assigned_admin_id = ", ""], ["DELETE FROM chat_conversations WHERE user_id = ", " OR assigned_admin_id = ", ""])), id, id)))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 3: Nullifying contact request references', db.execute(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["UPDATE contact_requests SET conversation_id = NULL WHERE conversation_id IN (SELECT id FROM chat_conversations WHERE user_id = ", ")"], ["UPDATE contact_requests SET conversation_id = NULL WHERE conversation_id IN (SELECT id FROM chat_conversations WHERE user_id = ", ")"])), id)))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 4: Deleting verification documents', db.execute(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["DELETE FROM user_verification_documents WHERE user_id = ", ""], ["DELETE FROM user_verification_documents WHERE user_id = ", ""])), id)))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 5: Nullifying redeem history references', db.execute(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["UPDATE user_redeem_history SET user_id = NULL WHERE user_id = ", ""], ["UPDATE user_redeem_history SET user_id = NULL WHERE user_id = ", ""])), id)))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 6: Deleting deposit requests', db.execute(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["DELETE FROM deposit_requests WHERE user_id = ", ""], ["DELETE FROM deposit_requests WHERE user_id = ", ""])), id)))];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 7: Deleting withdrawal requests', db.execute(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["DELETE FROM withdrawal_requests WHERE user_id = ", ""], ["DELETE FROM withdrawal_requests WHERE user_id = ", ""])), id)))];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 8: Deleting trading controls', db.execute(sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["DELETE FROM trading_controls WHERE user_id = ", ""], ["DELETE FROM trading_controls WHERE user_id = ", ""])), id)))];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 9: Deleting transactions', db.delete(transactions).where(eq(transactions.userId, id)))];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 10: Deleting trades', db.delete(trades).where(eq(trades.userId, id)))];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 11: Deleting balances', db.delete(balances).where(eq(balances.userId, id)))];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 12: Deleting admin controls', db.delete(adminControls).where(eq(adminControls.userId, id)))];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 13: Nullifying admin control creator references', db.update(adminControls).set({ createdBy: null }).where(eq(adminControls.createdBy, id)))];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, safeDelete('Step 14: Deleting messages', db.execute(sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["DELETE FROM messages WHERE from_user_id = ", " OR to_user_id = ", ""], ["DELETE FROM messages WHERE from_user_id = ", " OR to_user_id = ", ""])), id, id)))];
                    case 14:
                        _a.sent();
                        // Finally delete the user - this must succeed
                        console.log('Step 15: Deleting user record...');
                        return [4 /*yield*/, db.delete(users).where(eq(users.id, id))];
                    case 15:
                        _a.sent();
                        console.log("\u2705 Successfully deleted user ".concat(id, " and all related data"));
                        return [3 /*break*/, 17];
                    case 16:
                        error_1 = _a.sent();
                        console.error("\u274C Error deleting user ".concat(id, ":"), {
                            message: error_1.message,
                            code: error_1.code,
                            detail: error_1.detail,
                            constraint: error_1.constraint,
                            table: error_1.table
                        });
                        throw error_1;
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    // Balance operations
    DatabaseStorage.prototype.getUserBalances = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(balances).where(eq(balances.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getBalance = function (userId, currency) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CacheManager.getUserBalance(userId, currency, function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var balance;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, db
                                                            .select()
                                                            .from(balances)
                                                            .where(and(eq(balances.userId, userId), eq(balances.currency, currency)))];
                                                    case 1:
                                                        balance = (_a.sent())[0];
                                                        return [2 /*return*/, balance];
                                                }
                                            });
                                        }); })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateBalance = function (userId, currency, balanceAmount) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                            var existingBalance, balance, result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.getBalance(userId, currency)];
                                    case 1:
                                        existingBalance = _a.sent();
                                        if (!existingBalance) return [3 /*break*/, 3];
                                        return [4 /*yield*/, db
                                                .update(balances)
                                                .set({
                                                balance: balanceAmount,
                                                updatedAt: new Date()
                                            })
                                                .where(and(eq(balances.userId, userId), eq(balances.currency, currency)))
                                                .returning()];
                                    case 2:
                                        balance = (_a.sent())[0];
                                        // Invalidate cache after update
                                        CacheManager.invalidateUserBalances(userId, currency);
                                        return [2 /*return*/, balance];
                                    case 3: return [4 /*yield*/, this.createBalance({ userId: userId, currency: currency, balance: balanceAmount })];
                                    case 4:
                                        result = _a.sent();
                                        CacheManager.invalidateUserBalances(userId, currency);
                                        return [2 /*return*/, result];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createBalance = function (balanceData) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                            var balance;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.insert(balances).values(balanceData).returning()];
                                    case 1:
                                        balance = (_a.sent())[0];
                                        CacheManager.invalidateUserBalances(balanceData.userId, balanceData.currency);
                                        return [2 /*return*/, balance];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Trading operations
    DatabaseStorage.prototype.createTrade = function (tradeData) {
        return __awaiter(this, void 0, void 0, function () {
            var trade;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDCDD Creating trade with data:", {
                            amount: tradeData.amount,
                            amountType: typeof tradeData.amount,
                            allFields: Object.keys(tradeData)
                        });
                        return [4 /*yield*/, db.insert(trades).values(tradeData).returning()];
                    case 1:
                        trade = (_a.sent())[0];
                        console.log("\u2705 Trade created:", {
                            id: trade.id,
                            amount: trade.amount,
                            amountType: typeof trade.amount,
                            allFields: Object.keys(trade)
                        });
                        return [2 /*return*/, trade];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTrade = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var trade;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(trades).where(eq(trades.id, id))];
                    case 1:
                        trade = (_a.sent())[0];
                        if (trade) {
                            console.log("\uD83D\uDD0D Retrieved trade ".concat(id, ":"), {
                                id: trade.id,
                                amount: trade.amount,
                                amountType: typeof trade.amount,
                                amountIsUndefined: trade.amount === undefined,
                                amountIsNull: trade.amount === null,
                                amountIsEmpty: trade.amount === '',
                                allFields: Object.keys(trade)
                            });
                            // Convert Decimal amounts to strings for proper parsing
                            return [2 /*return*/, __assign(__assign({}, trade), { amount: trade.amount ? trade.amount.toString() : '0', price: trade.price ? trade.price.toString() : undefined, entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined, exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined, profit: trade.profit ? trade.profit.toString() : undefined, fee: trade.fee ? trade.fee.toString() : undefined })];
                        }
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserTrades = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var userTrades;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(trades)
                            .where(eq(trades.userId, userId))
                            .orderBy(desc(trades.createdAt))
                            .limit(limit)];
                    case 1:
                        userTrades = _a.sent();
                        // Convert Decimal amounts to strings for proper parsing
                        return [2 /*return*/, userTrades.map(function (trade) { return (__assign(__assign({}, trade), { amount: trade.amount ? trade.amount.toString() : '0', price: trade.price ? trade.price.toString() : undefined, entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined, exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined, profit: trade.profit ? trade.profit.toString() : undefined, fee: trade.fee ? trade.fee.toString() : undefined, result: trade.result || undefined })); })];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateTrade = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var trade;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(trades)
                            .set(__assign(__assign({}, updates), { updatedAt: new Date() }))
                            .where(eq(trades.id, id))
                            .returning()];
                    case 1:
                        trade = (_a.sent())[0];
                        // Convert Decimal amounts to strings for proper parsing
                        return [2 /*return*/, __assign(__assign({}, trade), { amount: trade.amount ? trade.amount.toString() : '0', price: trade.price ? trade.price.toString() : undefined, entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined, exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined, profit: trade.profit ? trade.profit.toString() : undefined, fee: trade.fee ? trade.fee.toString() : undefined })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveTrades = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activeTrades;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(trades)
                            .where(and(eq(trades.userId, userId), eq(trades.status, 'active')))];
                    case 1:
                        activeTrades = _a.sent();
                        // Convert Decimal amounts to strings for proper parsing
                        return [2 /*return*/, activeTrades.map(function (trade) { return (__assign(__assign({}, trade), { amount: trade.amount ? trade.amount.toString() : '0', price: trade.price ? trade.price.toString() : undefined, entryPrice: trade.entryPrice ? trade.entryPrice.toString() : undefined, exitPrice: trade.exitPrice ? trade.exitPrice.toString() : undefined, profit: trade.profit ? trade.profit.toString() : undefined, fee: trade.fee ? trade.fee.toString() : undefined })); })];
                }
            });
        });
    };
    // Spot trading operations
    DatabaseStorage.prototype.createSpotOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var spotOrder;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        spotOrder = {
                            id: crypto.randomUUID(),
                            userId: order.userId,
                            symbol: order.symbol,
                            side: order.side,
                            type: order.type,
                            amount: order.amount.toString(),
                            price: (_a = order.price) === null || _a === void 0 ? void 0 : _a.toString(),
                            total: order.total.toString(),
                            status: order.status,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        // For now, store in a simple table structure
                        // In production, you'd want a proper spot_orders table
                        return [4 /*yield*/, db.insert(trades).values({
                                id: spotOrder.id,
                                userId: spotOrder.userId,
                                symbol: spotOrder.symbol,
                                type: 'spot',
                                direction: spotOrder.side,
                                amount: spotOrder.amount,
                                entryPrice: spotOrder.price || '0',
                                status: spotOrder.status,
                                duration: 0, // FIXED: Add duration=0 for spot trades (required by database)
                                createdAt: spotOrder.createdAt,
                                updatedAt: spotOrder.updatedAt,
                                // Store spot-specific data in metadata
                                metadata: JSON.stringify({
                                    orderType: spotOrder.type,
                                    total: spotOrder.total
                                })
                            })];
                    case 1:
                        // For now, store in a simple table structure
                        // In production, you'd want a proper spot_orders table
                        _b.sent();
                        return [2 /*return*/, spotOrder];
                }
            });
        });
    };
    DatabaseStorage.prototype.getSpotOrder = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var trade, metadata;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(trades)
                            .where(and(eq(trades.id, id), eq(trades.type, 'spot')))
                            .limit(1)];
                    case 1:
                        trade = _a.sent();
                        if (!trade[0])
                            return [2 /*return*/, null];
                        metadata = trade[0].metadata ? JSON.parse(trade[0].metadata) : {};
                        return [2 /*return*/, {
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
                            }];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserSpotOrders = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userTrades;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(trades)
                            .where(and(eq(trades.userId, userId), eq(trades.type, 'spot')))
                            .orderBy(desc(trades.createdAt))];
                    case 1:
                        userTrades = _a.sent();
                        return [2 /*return*/, userTrades.map(function (trade) {
                                var metadata = trade.metadata ? JSON.parse(trade.metadata) : {};
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
                            })];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateSpotOrder = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existingTrade;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSpotOrder(id)];
                    case 1:
                        existingTrade = _a.sent();
                        if (!existingTrade)
                            throw new Error('Spot order not found');
                        return [4 /*yield*/, db
                                .update(trades)
                                .set({
                                status: updates.status || existingTrade.status,
                                updatedAt: new Date()
                            })
                                .where(eq(trades.id, id))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, __assign(__assign(__assign({}, existingTrade), updates), { updatedAt: new Date() })];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUserBalance = function (userId, currency, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var existingBalance, newBalance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(balances)
                            .where(and(eq(balances.userId, userId), eq(balances.currency, currency)))
                            .limit(1)];
                    case 1:
                        existingBalance = _a.sent();
                        if (!existingBalance[0]) return [3 /*break*/, 3];
                        newBalance = parseFloat(existingBalance[0].balance) + amount;
                        return [4 /*yield*/, db
                                .update(balances)
                                .set({
                                balance: newBalance.toString(),
                                updatedAt: new Date()
                            })
                                .where(and(eq(balances.userId, userId), eq(balances.currency, currency)))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: 
                    // Create new balance if it doesn't exist
                    return [4 /*yield*/, db.insert(balances).values({
                            id: crypto.randomUUID(),
                            userId: userId,
                            currency: currency,
                            balance: Math.max(0, amount).toString(),
                            createdAt: new Date(),
                            updatedAt: new Date()
                        })];
                    case 4:
                        // Create new balance if it doesn't exist
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Market data operations with caching
    DatabaseStorage.prototype.getMarketData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CacheManager.getMarketData(symbol, function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var data, error_3;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, db
                                                                .select()
                                                                .from(marketData)
                                                                .where(eq(marketData.symbol, symbol))
                                                                .orderBy(desc(marketData.timestamp))
                                                                .limit(1)];
                                                    case 1:
                                                        data = (_a.sent())[0];
                                                        return [2 /*return*/, data];
                                                    case 2:
                                                        error_3 = _a.sent();
                                                        console.warn("Failed to fetch market data for ".concat(symbol, ":"), error_3);
                                                        return [2 /*return*/, undefined];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateMarketData = function (symbol, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                            var existing, updated, result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.getMarketData(symbol)];
                                    case 1:
                                        existing = _a.sent();
                                        if (!existing) return [3 /*break*/, 3];
                                        return [4 /*yield*/, db
                                                .update(marketData)
                                                .set(__assign(__assign({}, data), { timestamp: new Date() }))
                                                .where(eq(marketData.symbol, symbol))
                                                .returning()];
                                    case 2:
                                        updated = (_a.sent())[0];
                                        // Invalidate cache after update
                                        CacheManager.invalidateMarketData(symbol);
                                        return [2 /*return*/, updated];
                                    case 3: return [4 /*yield*/, this.createMarketData(__assign({ symbol: symbol }, data))];
                                    case 4:
                                        result = _a.sent();
                                        CacheManager.invalidateMarketData(symbol);
                                        return [2 /*return*/, result];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createMarketData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                            var marketDataRow;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, db.insert(marketData).values(data).returning()];
                                    case 1:
                                        marketDataRow = (_a.sent())[0];
                                        CacheManager.invalidateMarketData(data.symbol);
                                        return [2 /*return*/, marketDataRow];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllMarketData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CacheManager.getAllMarketData(function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, db
                                                            .select()
                                                            .from(marketData)
                                                            .orderBy(desc(marketData.timestamp))];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTradingPairs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, CacheManager.getTradingPairs(function () { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, PerformanceMonitor.measureQuery(function () { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0: return [4 /*yield*/, db
                                                            .select()
                                                            .from(tradingPairs)
                                                            .where(eq(tradingPairs.isActive, true))];
                                                    case 1: return [2 /*return*/, _a.sent()];
                                                }
                                            });
                                        }); })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Transaction operations
    DatabaseStorage.prototype.createTransaction = function (transactionData) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedData, transaction;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalizedData = {
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
                        console.log("\uD83D\uDCBE INSERTING TRANSACTION:", {
                            normalizedAmount: normalizedData.amount,
                            normalizedAmountType: typeof normalizedData.amount,
                            originalAmount: transactionData.amount,
                            originalAmountType: typeof transactionData.amount,
                            userId: normalizedData.userId,
                            type: normalizedData.type,
                            symbol: normalizedData.symbol
                        });
                        return [4 /*yield*/, db.insert(transactions).values(normalizedData).returning()];
                    case 1:
                        transaction = (_b.sent())[0];
                        console.log("\u2705 TRANSACTION INSERTED:", {
                            id: transaction.id,
                            storedAmount: transaction.amount,
                            storedAmountType: typeof transaction.amount,
                            storedAmountString: (_a = transaction.amount) === null || _a === void 0 ? void 0 : _a.toString(),
                            symbol: transaction.symbol
                        });
                        // Convert Decimal amounts back to strings for consistency
                        return [2 /*return*/, __assign(__assign({}, transaction), { amount: transaction.amount ? transaction.amount.toString() : '0', fee: transaction.fee ? transaction.fee.toString() : undefined })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserTransactions = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, limit) {
            var txs;
            if (limit === void 0) { limit = 100; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(transactions)
                            .where(eq(transactions.userId, userId))
                            .orderBy(desc(transactions.createdAt))
                            .limit(limit)];
                    case 1:
                        txs = _a.sent();
                        // Convert Decimal amounts to strings for proper parsing on frontend
                        return [2 /*return*/, txs.map(function (tx) { return (__assign(__assign({}, tx), { amount: tx.amount ? tx.amount.toString() : '0' })); })];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateTransaction = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedUpdates, transaction;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalizedUpdates = {};
                        if (updates.type !== undefined)
                            normalizedUpdates.type = updates.type;
                        if (updates.amount !== undefined)
                            normalizedUpdates.amount = (_a = updates.amount) === null || _a === void 0 ? void 0 : _a.toString();
                        if (updates.status !== undefined)
                            normalizedUpdates.status = updates.status;
                        if (updates.description !== undefined)
                            normalizedUpdates.description = updates.description;
                        if (updates.referenceId !== undefined)
                            normalizedUpdates.referenceId = updates.referenceId;
                        return [4 /*yield*/, db
                                .update(transactions)
                                .set(__assign(__assign({}, normalizedUpdates), { updatedAt: new Date() }))
                                .where(eq(transactions.id, id))
                                .returning()];
                    case 1:
                        transaction = (_b.sent())[0];
                        // Convert Decimal amounts back to strings for consistency
                        return [2 /*return*/, __assign(__assign({}, transaction), { amount: transaction.amount ? transaction.amount.toString() : '0' })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTransaction = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(transactions)
                            .where(eq(transactions.id, id))
                            .limit(1)];
                    case 1:
                        transaction = (_a.sent())[0];
                        if (!transaction)
                            return [2 /*return*/, undefined];
                        // Convert Decimal amounts back to strings for consistency
                        return [2 /*return*/, __assign(__assign({}, transaction), { amount: transaction.amount ? transaction.amount.toString() : '0' })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getPendingTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var txs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(transactions)
                            .where(eq(transactions.status, 'pending'))
                            .orderBy(desc(transactions.createdAt))];
                    case 1:
                        txs = _a.sent();
                        // Convert Decimal amounts to strings for proper parsing on frontend
                        return [2 /*return*/, txs.map(function (tx) { return (__assign(__assign({}, tx), { amount: tx.amount ? tx.amount.toString() : '0' })); })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var txs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(transactions)
                            .orderBy(desc(transactions.createdAt))
                            .limit(1000)];
                    case 1:
                        txs = _a.sent();
                        // Convert Decimal amounts to strings for proper parsing on frontend
                        return [2 /*return*/, txs.map(function (tx) { return (__assign(__assign({}, tx), { amount: tx.amount ? tx.amount.toString() : '0' })); })];
                }
            });
        });
    };
    // Admin operations
    DatabaseStorage.prototype.createAdminControl = function (controlData) {
        return __awaiter(this, void 0, void 0, function () {
            var control;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(adminControls).values(controlData).returning()];
                    case 1:
                        control = (_a.sent())[0];
                        return [2 /*return*/, control];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAdminControl = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var control;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(adminControls)
                            .where(and(eq(adminControls.userId, userId), eq(adminControls.isActive, true)))
                            .orderBy(desc(adminControls.createdAt))
                            .limit(1)];
                    case 1:
                        control = (_a.sent())[0];
                        return [2 /*return*/, control];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateAdminControl = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var control;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(adminControls)
                            .set(__assign(__assign({}, updates), { updatedAt: new Date() }))
                            .where(eq(adminControls.id, id))
                            .returning()];
                    case 1:
                        control = (_a.sent())[0];
                        return [2 /*return*/, control];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteAdminControl = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .delete(adminControls)
                            .where(eq(adminControls.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUsersByAdmin = function (adminId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(adminControls)
                            .where(and(eq(adminControls.adminId, adminId), eq(adminControls.isActive, true)))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Options settings
    DatabaseStorage.prototype.getOptionsSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(optionsSettings)
                            .where(eq(optionsSettings.isActive, true))
                            .orderBy(optionsSettings.duration)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createOptionsSettings = function (settingsData) {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(optionsSettings).values(settingsData).returning()];
                    case 1:
                        settings = (_a.sent())[0];
                        return [2 /*return*/, settings];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateOptionsSettings = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var settings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(optionsSettings)
                            .set(updates)
                            .where(eq(optionsSettings.id, id))
                            .returning()];
                    case 1:
                        settings = (_a.sent())[0];
                        return [2 /*return*/, settings];
                }
            });
        });
    };
    // Admin-only operations
    DatabaseStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, db.select({
                            id: users.id,
                            email: users.email,
                            username: users.username,
                            password: users.password, // Explicitly include password for superadmin access
                            plainPassword: users.plainPassword, // Include plain password for superadmin view
                            firstName: users.firstName,
                            lastName: users.lastName,
                            profileImageUrl: users.profileImageUrl,
                            walletAddress: users.walletAddress,
                            role: users.role,
                            isActive: users.isActive,
                            status: users.status,
                            adminNotes: users.adminNotes,
                            verificationStatus: users.verificationStatus,
                            hasUploadedDocuments: users.hasUploadedDocuments,
                            tradingMode: users.tradingMode,
                            balance: users.balance,
                            lastLogin: users.lastLogin,
                            createdAt: users.createdAt,
                            updatedAt: users.updatedAt,
                        }).from(users).orderBy(desc(users.createdAt))];
                    case 1:
                        result = _b.sent();
                        // Debug: Log what we got from database
                        if (result.length > 0) {
                            console.log('💾 Storage.getAllUsers() - First user from DB:', {
                                id: result[0].id,
                                username: result[0].username,
                                hasPassword: !!result[0].password,
                                passwordLength: ((_a = result[0].password) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                passwordPreview: result[0].password ? result[0].password.substring(0, 10) + '...' : 'NULL',
                                plainPassword: result[0].plainPassword,
                                allKeys: Object.keys(result[0])
                            });
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllBalances = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(balances)
                            .leftJoin(users, eq(balances.userId, users.id))
                            .orderBy(desc(balances.createdAt))];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (row) {
                                var _a, _b;
                                var bal = (_a = row.balances) !== null && _a !== void 0 ? _a : row;
                                var usr = (_b = row.users) !== null && _b !== void 0 ? _b : {};
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
                            })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllTrades = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(trades)
                            .leftJoin(users, eq(trades.userId, users.id))
                            .orderBy(desc(trades.createdAt))];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (row) {
                                var _a, _b;
                                var t = (_a = row.trades) !== null && _a !== void 0 ? _a : row;
                                var usr = (_b = row.users) !== null && _b !== void 0 ? _b : {};
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
                            })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getAllAdminControls = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(adminControls)
                            .leftJoin(users, eq(adminControls.userId, users.id))
                            .where(eq(adminControls.isActive, true))
                            .orderBy(desc(adminControls.createdAt))];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (row) {
                                var _a, _b, _c;
                                var ac = (_b = (_a = row.admin_controls) !== null && _a !== void 0 ? _a : row.adminControls) !== null && _b !== void 0 ? _b : row;
                                var usr = (_c = row.users) !== null && _c !== void 0 ? _c : {};
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
                            })];
                }
            });
        });
    };
    // Trading control operations
    DatabaseStorage.prototype.getTradingControls = function () {
        return __awaiter(this, void 0, void 0, function () {
            var controls, controlsWithUsers, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, db
                                .select()
                                .from(adminControls)
                                .orderBy(desc(adminControls.createdAt))];
                    case 1:
                        controls = _a.sent();
                        return [4 /*yield*/, Promise.all(controls.map(function (control) { return __awaiter(_this, void 0, void 0, function () {
                                var user;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getUserById(control.userId)];
                                        case 1:
                                            user = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, control), { username: (user === null || user === void 0 ? void 0 : user.username) || 'Unknown User', notes: control.notes || '' })];
                                    }
                                });
                            }); }))];
                    case 2:
                        controlsWithUsers = _a.sent();
                        return [2 /*return*/, controlsWithUsers];
                    case 3:
                        error_4 = _a.sent();
                        console.error('Error fetching trading controls:', error_4);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.createTradingControl = function (userId, controlType, notes, adminId) {
        return __awaiter(this, void 0, void 0, function () {
            var newControl, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // First, deactivate any existing controls for this user
                        return [4 /*yield*/, db
                                .update(adminControls)
                                .set({ isActive: false, updatedAt: new Date() })
                                .where(eq(adminControls.userId, userId))];
                    case 1:
                        // First, deactivate any existing controls for this user
                        _a.sent();
                        return [4 /*yield*/, db
                                .insert(adminControls)
                                .values({
                                userId: userId,
                                adminId: adminId || 'superadmin-1', // Default to superadmin if not provided
                                controlType: controlType,
                                isActive: true,
                                notes: notes,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            })
                                .returning()];
                    case 2:
                        newControl = _a.sent();
                        return [2 /*return*/, newControl[0]];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error creating trading control:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateTradingControl = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedControl, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, db
                                .update(adminControls)
                                .set(__assign(__assign({}, updates), { updatedAt: new Date() }))
                                .where(eq(adminControls.id, id))
                                .returning()];
                    case 1:
                        updatedControl = _a.sent();
                        return [2 /*return*/, updatedControl[0]];
                    case 2:
                        error_6 = _a.sent();
                        console.error('Error updating trading control:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // User wallet operations
    DatabaseStorage.prototype.getUserWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For now, return empty array - this will be implemented with proper database schema
                return [2 /*return*/, []];
            });
        });
    };
    DatabaseStorage.prototype.updateUserPassword = function (userId, hashedPassword, plainPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateData = { password: hashedPassword, updatedAt: new Date() };
                        if (plainPassword) {
                            updateData.plainPassword = plainPassword;
                        }
                        return [4 /*yield*/, db
                                .update(users)
                                .set(updateData)
                                .where(eq(users.id, userId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUserWallet = function (userId, walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(users)
                            .set({ walletAddress: walletAddress, updatedAt: new Date() })
                            .where(eq(users.id, userId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Redeem code operations
    DatabaseStorage.prototype.updateRedeemCode = function (codeId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var setParts, result, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        setParts = [];
                        if (updates.bonusAmount !== undefined) {
                            setParts.push("bonus_amount = ".concat(updates.bonusAmount));
                        }
                        if (updates.description !== undefined) {
                            setParts.push("description = '".concat(updates.description.replace(/'/g, "''"), "'"));
                        }
                        if (updates.maxUses !== undefined) {
                            setParts.push("max_uses = ".concat(updates.maxUses === null ? 'NULL' : updates.maxUses));
                        }
                        setParts.push("updated_at = NOW()");
                        return [4 /*yield*/, db.execute(sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n        UPDATE redeem_codes\n        SET ", "\n        WHERE id = ", "\n        RETURNING *\n      "], ["\n        UPDATE redeem_codes\n        SET ", "\n        WHERE id = ", "\n        RETURNING *\n      "])), sql.raw(setParts.join(', ')), codeId))];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result.rows) === null || _a === void 0 ? void 0 : _a[0]];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Error updating redeem code:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.disableRedeemCode = function (codeId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_8;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        console.log('💾 DatabaseStorage: Disabling redeem code:', codeId);
                        return [4 /*yield*/, db.execute(sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n        UPDATE redeem_codes\n        SET is_active = false, updated_at = NOW()\n        WHERE id = ", "\n        RETURNING *\n      "], ["\n        UPDATE redeem_codes\n        SET is_active = false, updated_at = NOW()\n        WHERE id = ", "\n        RETURNING *\n      "])), codeId))];
                    case 1:
                        result = _c.sent();
                        console.log('✅ DatabaseStorage: Redeem code disabled, result:', (_a = result.rows) === null || _a === void 0 ? void 0 : _a[0]);
                        return [2 /*return*/, (_b = result.rows) === null || _b === void 0 ? void 0 : _b[0]];
                    case 2:
                        error_8 = _c.sent();
                        console.error('❌ DatabaseStorage: Error disabling redeem code:', {
                            codeId: codeId,
                            error: error_8.message,
                            code: error_8.code,
                            detail: error_8.detail
                        });
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteRedeemCode = function (codeId) {
        return __awaiter(this, void 0, void 0, function () {
            var updateResult, deleteResult, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('💾 DatabaseStorage: Deleting redeem code:', codeId);
                        // First, set redeem_code_id to NULL in user_redeem_history for this code
                        console.log('Step 1: Nullifying redeem_code_id in user_redeem_history...');
                        return [4 /*yield*/, db.execute(sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n        UPDATE user_redeem_history\n        SET redeem_code_id = NULL\n        WHERE redeem_code_id = ", "\n      "], ["\n        UPDATE user_redeem_history\n        SET redeem_code_id = NULL\n        WHERE redeem_code_id = ", "\n      "])), codeId))];
                    case 1:
                        updateResult = _a.sent();
                        console.log('✅ Step 1 complete. Rows affected:', updateResult.rowCount);
                        // Then delete the redeem code
                        console.log('Step 2: Deleting redeem code from redeem_codes table...');
                        return [4 /*yield*/, db.execute(sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\n        DELETE FROM redeem_codes WHERE id = ", "\n      "], ["\n        DELETE FROM redeem_codes WHERE id = ", "\n      "])), codeId))];
                    case 2:
                        deleteResult = _a.sent();
                        console.log('✅ Step 2 complete. Rows deleted:', deleteResult.rowCount);
                        console.log('✅ DatabaseStorage: Redeem code deleted successfully');
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        console.error('❌ DatabaseStorage: Error deleting redeem code:', {
                            codeId: codeId,
                            error: error_9.message,
                            code: error_9.code,
                            detail: error_9.detail,
                            constraint: error_9.constraint
                        });
                        throw error_9;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseStorage;
}());
// Demo storage class for fallback when database is unavailable
var DemoStorage = /** @class */ (function () {
    function DemoStorage() {
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
    DemoStorage.prototype.initializeDemoData = function () {
        // Create demo admin user
        var adminUser = {
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
        var adminUser2 = {
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
        var demoUser = {
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
        var demoBalance = {
            id: 'demo-balance-1',
            userId: demoUser.id,
            symbol: 'USDT',
            available: '10000.00',
            locked: '0.00',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.balances.set("".concat(demoUser.id, "-USDT"), demoBalance);
    };
    DemoStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    DemoStorage.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    DemoStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(username)];
            });
        });
    };
    DemoStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(email)];
            });
        });
    };
    DemoStorage.prototype.getUserByWallet = function (walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, user;
            return __generator(this, function (_b) {
                for (_i = 0, _a = this.users.values(); _i < _a.length; _i++) {
                    user = _a[_i];
                    if (user.walletAddress === walletAddress) {
                        return [2 /*return*/, user];
                    }
                }
                return [2 /*return*/, undefined];
            });
        });
    };
    DemoStorage.prototype.getUserByWalletAddress = function (walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getUserByWallet(walletAddress)];
            });
        });
    };
    DemoStorage.prototype.createUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var newUser;
            return __generator(this, function (_a) {
                newUser = __assign(__assign({ id: "demo-user-".concat(Date.now()) }, user), { createdAt: new Date(), updatedAt: new Date() });
                this.users.set(newUser.id, newUser);
                if (newUser.username)
                    this.users.set(newUser.username, newUser);
                if (newUser.email)
                    this.users.set(newUser.email, newUser);
                return [2 /*return*/, newUser];
            });
        });
    };
    DemoStorage.prototype.updateUser = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var user, updatedUser;
            return __generator(this, function (_a) {
                user = this.users.get(id);
                if (!user)
                    throw new Error('User not found');
                updatedUser = __assign(__assign(__assign({}, user), updates), { updatedAt: new Date() });
                this.users.set(id, updatedUser);
                return [2 /*return*/, updatedUser];
            });
        });
    };
    DemoStorage.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = this.users.get(id);
                if (!user)
                    throw new Error('User not found');
                // Remove user from related collections
                this.balances = this.balances.filter(function (b) { return b.userId !== id; });
                this.trades = this.trades.filter(function (t) { return t.userId !== id; });
                this.transactions = this.transactions.filter(function (t) { return t.userId !== id; });
                this.adminControls = this.adminControls.filter(function (ac) { return ac.userId !== id; });
                // Update admin controls where user was the creator (set to null)
                this.adminControls = this.adminControls.map(function (ac) {
                    return ac.createdBy === id ? __assign(__assign({}, ac), { createdBy: null }) : ac;
                });
                // Remove user from users map
                this.users.delete(id);
                if (user.username)
                    this.users.delete(user.username);
                if (user.email)
                    this.users.delete(user.email);
                return [2 /*return*/];
            });
        });
    };
    DemoStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var uniqueUsers, _i, _a, user;
            return __generator(this, function (_b) {
                uniqueUsers = new Map();
                for (_i = 0, _a = this.users.values(); _i < _a.length; _i++) {
                    user = _a[_i];
                    uniqueUsers.set(user.id, user);
                }
                return [2 /*return*/, Array.from(uniqueUsers.values())];
            });
        });
    };
    DemoStorage.prototype.getUserBalances = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userBalances, _i, _a, balance;
            return __generator(this, function (_b) {
                userBalances = [];
                for (_i = 0, _a = this.balances.values(); _i < _a.length; _i++) {
                    balance = _a[_i];
                    if (balance.userId === userId) {
                        userBalances.push(balance);
                    }
                }
                return [2 /*return*/, userBalances];
            });
        });
    };
    DemoStorage.prototype.getBalance = function (userId, symbol) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.balances.get("".concat(userId, "-").concat(symbol))];
            });
        });
    };
    DemoStorage.prototype.updateBalance = function (userId, symbol, available, locked) {
        return __awaiter(this, void 0, void 0, function () {
            var key, existing, balance;
            return __generator(this, function (_a) {
                key = "".concat(userId, "-").concat(symbol);
                existing = this.balances.get(key);
                balance = {
                    id: (existing === null || existing === void 0 ? void 0 : existing.id) || "demo-balance-".concat(Date.now()),
                    userId: userId,
                    symbol: symbol,
                    available: available,
                    locked: locked,
                    createdAt: (existing === null || existing === void 0 ? void 0 : existing.createdAt) || new Date(),
                    updatedAt: new Date(),
                };
                this.balances.set(key, balance);
                return [2 /*return*/, balance];
            });
        });
    };
    DemoStorage.prototype.createBalance = function (balance) {
        return __awaiter(this, void 0, void 0, function () {
            var newBalance;
            return __generator(this, function (_a) {
                newBalance = __assign(__assign({ id: "demo-balance-".concat(Date.now()) }, balance), { createdAt: new Date(), updatedAt: new Date() });
                this.balances.set("".concat(balance.userId, "-").concat(balance.symbol), newBalance);
                return [2 /*return*/, newBalance];
            });
        });
    };
    DemoStorage.prototype.createTrade = function (trade) {
        return __awaiter(this, void 0, void 0, function () {
            var newTrade;
            return __generator(this, function (_a) {
                newTrade = __assign(__assign({ id: "demo-trade-".concat(Date.now()) }, trade), { createdAt: new Date(), updatedAt: new Date() });
                this.trades.set(newTrade.id, newTrade);
                return [2 /*return*/, newTrade];
            });
        });
    };
    DemoStorage.prototype.getTrade = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trades.get(id)];
            });
        });
    };
    DemoStorage.prototype.getUserTrades = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var userTrades, _i, _a, trade;
            return __generator(this, function (_b) {
                userTrades = [];
                for (_i = 0, _a = this.trades.values(); _i < _a.length; _i++) {
                    trade = _a[_i];
                    if (trade.userId === userId) {
                        userTrades.push(trade);
                    }
                }
                return [2 /*return*/, limit ? userTrades.slice(0, limit) : userTrades];
            });
        });
    };
    DemoStorage.prototype.updateTrade = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var trade, updatedTrade;
            return __generator(this, function (_a) {
                trade = this.trades.get(id);
                if (!trade)
                    throw new Error('Trade not found');
                updatedTrade = __assign(__assign(__assign({}, trade), updates), { updatedAt: new Date() });
                this.trades.set(id, updatedTrade);
                return [2 /*return*/, updatedTrade];
            });
        });
    };
    DemoStorage.prototype.getActiveTrades = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activeTrades, _i, _a, trade;
            return __generator(this, function (_b) {
                activeTrades = [];
                for (_i = 0, _a = this.trades.values(); _i < _a.length; _i++) {
                    trade = _a[_i];
                    if (trade.userId === userId && trade.status === 'active') {
                        activeTrades.push(trade);
                    }
                }
                return [2 /*return*/, activeTrades];
            });
        });
    };
    DemoStorage.prototype.createSpotOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var spotOrder;
            return __generator(this, function (_a) {
                spotOrder = {
                    id: "spot-order-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
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
                return [2 /*return*/, spotOrder];
            });
        });
    };
    DemoStorage.prototype.getSpotOrder = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.spotOrders.get(id) || null];
            });
        });
    };
    DemoStorage.prototype.getUserSpotOrders = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userOrders, _i, _a, order;
            return __generator(this, function (_b) {
                userOrders = [];
                for (_i = 0, _a = this.spotOrders.values(); _i < _a.length; _i++) {
                    order = _a[_i];
                    if (order.userId === userId) {
                        userOrders.push(order);
                    }
                }
                return [2 /*return*/, userOrders.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })];
            });
        });
    };
    DemoStorage.prototype.updateSpotOrder = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var order, updatedOrder;
            return __generator(this, function (_a) {
                order = this.spotOrders.get(id);
                if (!order)
                    throw new Error('Spot order not found');
                updatedOrder = __assign(__assign(__assign({}, order), updates), { updatedAt: new Date() });
                this.spotOrders.set(id, updatedOrder);
                return [2 /*return*/, updatedOrder];
            });
        });
    };
    DemoStorage.prototype.updateUserBalance = function (userId, currency, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, _i, _a, bal, newBalance, newBalance;
            return __generator(this, function (_b) {
                balance = null;
                for (_i = 0, _a = this.balances.values(); _i < _a.length; _i++) {
                    bal = _a[_i];
                    if (bal.userId === userId && bal.currency === currency) {
                        balance = bal;
                        break;
                    }
                }
                if (balance) {
                    newBalance = parseFloat(balance.balance) + amount;
                    balance.balance = Math.max(0, newBalance).toString();
                    balance.updatedAt = new Date();
                }
                else {
                    newBalance = {
                        id: "demo-balance-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
                        userId: userId,
                        currency: currency,
                        balance: Math.max(0, amount).toString(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    this.balances.set(newBalance.id, newBalance);
                }
                return [2 /*return*/];
            });
        });
    };
    DemoStorage.prototype.getAllTrades = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.trades.values())];
            });
        });
    };
    DemoStorage.prototype.createTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var newTransaction;
            return __generator(this, function (_a) {
                newTransaction = __assign(__assign({ id: "demo-transaction-".concat(Date.now()) }, transaction), { createdAt: new Date(), updatedAt: new Date() });
                this.transactions.set(newTransaction.id, newTransaction);
                return [2 /*return*/, newTransaction];
            });
        });
    };
    DemoStorage.prototype.getUserTransactions = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var userTransactions, _i, _a, transaction;
            return __generator(this, function (_b) {
                userTransactions = [];
                for (_i = 0, _a = this.transactions.values(); _i < _a.length; _i++) {
                    transaction = _a[_i];
                    if (transaction.userId === userId) {
                        userTransactions.push(transaction);
                    }
                }
                return [2 /*return*/, limit ? userTransactions.slice(0, limit) : userTransactions];
            });
        });
    };
    DemoStorage.prototype.getAllTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allTransactions;
            return __generator(this, function (_a) {
                allTransactions = Array.from(this.transactions.values());
                return [2 /*return*/, allTransactions.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })];
            });
        });
    };
    DemoStorage.prototype.getPendingTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pendingTransactions, _i, _a, transaction;
            return __generator(this, function (_b) {
                pendingTransactions = [];
                for (_i = 0, _a = this.transactions.values(); _i < _a.length; _i++) {
                    transaction = _a[_i];
                    if (transaction.status === 'pending') {
                        pendingTransactions.push(transaction);
                    }
                }
                return [2 /*return*/, pendingTransactions.sort(function (a, b) { return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); })];
            });
        });
    };
    DemoStorage.prototype.getOptionsSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.optionsSettings];
            });
        });
    };
    DemoStorage.prototype.updateOptionsSettings = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                index = this.optionsSettings.findIndex(function (s) { return s.id === id; });
                if (index === -1)
                    throw new Error('Settings not found');
                this.optionsSettings[index] = __assign(__assign({}, this.optionsSettings[index]), updates);
                return [2 /*return*/, this.optionsSettings[index]];
            });
        });
    };
    DemoStorage.prototype.createAdminControl = function (control) {
        return __awaiter(this, void 0, void 0, function () {
            var newControl;
            return __generator(this, function (_a) {
                newControl = __assign(__assign({ id: "demo-control-".concat(Date.now()) }, control), { createdAt: new Date(), updatedAt: new Date() });
                this.adminControls.set(newControl.id, newControl);
                return [2 /*return*/, newControl];
            });
        });
    };
    DemoStorage.prototype.getAdminControl = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, control;
            return __generator(this, function (_b) {
                for (_i = 0, _a = this.adminControls.values(); _i < _a.length; _i++) {
                    control = _a[_i];
                    if (control.userId === userId) {
                        return [2 /*return*/, control];
                    }
                }
                return [2 /*return*/, undefined];
            });
        });
    };
    DemoStorage.prototype.updateAdminControl = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var control, updatedControl;
            return __generator(this, function (_a) {
                control = this.adminControls.get(id);
                if (!control)
                    throw new Error('Control not found');
                updatedControl = __assign(__assign(__assign({}, control), updates), { updatedAt: new Date() });
                this.adminControls.set(id, updatedControl);
                return [2 /*return*/, updatedControl];
            });
        });
    };
    DemoStorage.prototype.deleteAdminControl = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.adminControls.delete(id);
                return [2 /*return*/];
            });
        });
    };
    DemoStorage.prototype.getAllMarketData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.marketData.values())];
            });
        });
    };
    DemoStorage.prototype.getMarketData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.marketData.get(symbol)];
            });
        });
    };
    DemoStorage.prototype.updateMarketData = function (symbol, data) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, marketDataEntry;
            return __generator(this, function (_a) {
                existing = this.marketData.get(symbol);
                marketDataEntry = __assign(__assign({ id: (existing === null || existing === void 0 ? void 0 : existing.id) || "demo-market-".concat(Date.now()), symbol: symbol }, data), { timestamp: new Date() });
                this.marketData.set(symbol, marketDataEntry);
                return [2 /*return*/, marketDataEntry];
            });
        });
    };
    DemoStorage.prototype.createMarketData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var marketDataEntry;
            return __generator(this, function (_a) {
                marketDataEntry = __assign(__assign({ id: "demo-market-".concat(Date.now()) }, data), { timestamp: new Date() });
                this.marketData.set(data.symbol, marketDataEntry);
                return [2 /*return*/, marketDataEntry];
            });
        });
    };
    DemoStorage.prototype.getTradingPairs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.tradingPairs];
            });
        });
    };
    DemoStorage.prototype.getAllBalances = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.balances.values())];
            });
        });
    };
    DemoStorage.prototype.getAllAdminControls = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.adminControls.values())];
            });
        });
    };
    // Trading control operations
    DemoStorage.prototype.getTradingControls = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    DemoStorage.prototype.createTradingControl = function (userId, controlType, notes, adminId) {
        return __awaiter(this, void 0, void 0, function () {
            var newControl, _i, _a, _b, id, control;
            return __generator(this, function (_c) {
                newControl = {
                    id: "demo-control-".concat(Date.now()),
                    userId: userId,
                    adminId: adminId || 'superadmin-1',
                    controlType: controlType,
                    isActive: true,
                    notes: notes,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                // Deactivate existing controls for this user
                for (_i = 0, _a = this.adminControls.entries(); _i < _a.length; _i++) {
                    _b = _a[_i], id = _b[0], control = _b[1];
                    if (control.userId === userId && control.isActive) {
                        this.adminControls.set(id, __assign(__assign({}, control), { isActive: false }));
                    }
                }
                // Add new control
                this.adminControls.set(newControl.id, newControl);
                return [2 /*return*/, {
                        id: newControl.id,
                        userId: userId,
                        controlType: controlType,
                        notes: notes,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }];
            });
        });
    };
    DemoStorage.prototype.updateTradingControl = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, __assign(__assign({ id: id }, updates), { updatedAt: new Date().toISOString() })];
            });
        });
    };
    // User wallet operations
    DemoStorage.prototype.getUserWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    DemoStorage.prototype.updateUserPassword = function (userId, hashedPassword, plainPassword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Demo mode: Updated password for user ".concat(userId));
                return [2 /*return*/];
            });
        });
    };
    DemoStorage.prototype.updateUserWallet = function (userId, walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Demo mode: Updated wallet for user ".concat(userId, " to ").concat(walletAddress));
                return [2 /*return*/];
            });
        });
    };
    return DemoStorage;
}());
// Wrapper class that falls back to demo storage if database fails
var SafeStorage = /** @class */ (function () {
    function SafeStorage() {
        this.dbStorage = new DatabaseStorage();
        this.demoStorage = new DemoStorage();
        this.useFallback = false;
        this.lastRetryTime = 0;
        this.retryInterval = 10000; // 10 seconds
    }
    // Force reset to database mode (useful for troubleshooting)
    SafeStorage.prototype.resetToDatabase = function () {
        console.log('🔄 Manually resetting to database mode...');
        this.useFallback = false;
        this.lastRetryTime = 0;
    };
    // Check current mode
    SafeStorage.prototype.getCurrentMode = function () {
        return this.useFallback ? 'demo' : 'database';
    };
    SafeStorage.prototype.tryDatabase = function (operation) {
        return __awaiter(this, void 0, void 0, function () {
            var error_10, now, result, error_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(process.env.NODE_ENV === 'development')) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, operation()];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        error_10 = _b.sent();
                        console.error('❌ Database operation failed in development mode:', error_10);
                        // Re-throw the error instead of falling back to demo mode
                        throw error_10;
                    case 4:
                        now = Date.now();
                        if (this.useFallback && (now - this.lastRetryTime) > this.retryInterval) {
                            console.log('🔄 Attempting to reconnect to database...');
                            this.useFallback = false;
                            this.lastRetryTime = now;
                        }
                        if (this.useFallback) {
                            throw new Error('Database unavailable, using fallback');
                        }
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, operation()];
                    case 6:
                        result = _b.sent();
                        if (this.useFallback) {
                            console.log('✅ Database connection restored!');
                            this.useFallback = false;
                        }
                        return [2 /*return*/, result];
                    case 7:
                        error_11 = _b.sent();
                        console.error('❌ Database operation failed, switching to demo mode:', error_11);
                        console.error('Error details:', {
                            message: error_11.message,
                            code: error_11.code,
                            stack: (_a = error_11.stack) === null || _a === void 0 ? void 0 : _a.split('\n').slice(0, 5).join('\n')
                        });
                        this.useFallback = true;
                        this.lastRetryTime = now;
                        throw error_11;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUser(id); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getUser(id)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserByUsername(username); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getUser(username)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserByEmail(email); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getUserByWallet = function (walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserByWallet(walletAddress); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.createUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createUser(user); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.createUser(user)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateUser = function (id, user) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateUser(id, user); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateUser(id, user)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.deleteUser(id); })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.deleteUser(id)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getAllUsers(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getAllUsers()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Add fallback implementations for other methods
    SafeStorage.prototype.getUserBalances = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserBalances(userId); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getUserBalances(userId)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getBalance = function (userId, symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getBalance(userId, symbol); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getBalance(userId, symbol)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateBalance = function (userId, symbol, available, locked) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateBalance(userId, symbol, available, locked); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateBalance(userId, symbol, available, locked)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.createBalance = function (balance) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createBalance(balance); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, balance];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Delegate other methods with fallbacks
    SafeStorage.prototype.createTrade = function (trade) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createTrade(trade); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.createTrade(trade)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getTrade = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getTrade(id); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getUserTrades = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserTrades(userId, limit); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getUserTrades(userId, limit || 100)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateTrade = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateTrade(id, updates); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateTrade(id, updates)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getActiveTrades = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getActiveTrades(userId); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Spot trading operations
    SafeStorage.prototype.createSpotOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createSpotOrder(order); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.createSpotOrder(order)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getSpotOrder = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getSpotOrder(id); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getSpotOrder(id)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getUserSpotOrders = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserSpotOrders(userId); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getUserSpotOrders(userId)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateSpotOrder = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateSpotOrder(id, updates); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateSpotOrder(id, updates)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateUserBalance = function (userId, currency, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateUserBalance(userId, currency, amount); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateUserBalance(userId, currency, amount)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getAllTrades = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getAllTrades(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getAllTrades()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.createTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createTransaction(transaction); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.createTransaction(transaction)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateTransaction = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateTransaction(id, updates); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, __assign({ id: id }, updates)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getTransaction = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getTransaction(id); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getPendingTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getPendingTransactions(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getPendingTransactions()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getAllTransactions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getAllTransactions(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getAllTransactions()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getUserTransactions = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserTransactions(userId, limit); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getUserTransactions(userId, limit || 100)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getOptionsSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getOptionsSettings(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getOptionsSettings()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateOptionsSettings = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateOptionsSettings(id, updates); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateOptionsSettings(id, updates)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.createAdminControl = function (control) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createAdminControl(control); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.createAdminControl(control)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getAdminControl = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getAdminControl(userId); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getAdminControl(userId)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateAdminControl = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateAdminControl(id, updates); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateAdminControl(id, updates)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.deleteAdminControl = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.deleteAdminControl(id); })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.deleteAdminControl(id)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getAllMarketData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getAllMarketData(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getAllMarketData()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getMarketData = function (symbol) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getMarketData(symbol); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getMarketData(symbol)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateMarketData = function (symbol, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateMarketData(symbol, data); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.updateMarketData(symbol, data)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.createMarketData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createMarketData(data); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.createMarketData(data)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getTradingPairs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getTradingPairs(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getTradingPairs()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getAllBalances = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getAllBalances(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getAllBalances()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.getAllAdminControls = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getAllAdminControls(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, this.demoStorage.getAllAdminControls()];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Missing methods from interface
    SafeStorage.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getUser(id)];
            });
        });
    };
    SafeStorage.prototype.getUserByWalletAddress = function (walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getUserByWallet(walletAddress)];
            });
        });
    };
    SafeStorage.prototype.getUsersByAdmin = function (adminId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUsersByAdmin(adminId); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.createOptionsSettings = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createOptionsSettings(settings); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, settings];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Trading control operations
    SafeStorage.prototype.getTradingControls = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getTradingControls(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.createTradingControl = function (userId, controlType, notes) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.createTradingControl(userId, controlType, notes); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, {
                                id: Date.now().toString(),
                                userId: userId,
                                controlType: controlType,
                                notes: notes,
                                isActive: true,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateTradingControl = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateTradingControl(id, updates); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, __assign(__assign({ id: id }, updates), { updatedAt: new Date().toISOString() })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // User wallet operations
    SafeStorage.prototype.getUserWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.getUserWallets(); })];
                    case 1: return [2 /*return*/, _b.sent()];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateUserPassword = function (userId, hashedPassword, plainPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateUserPassword(userId, hashedPassword, plainPassword); })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        // Fallback to demo mode
                        console.log("Demo mode: Updated password for user ".concat(userId));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.updateUserWallet = function (userId, walletAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateUserWallet(userId, walletAddress); })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        // Fallback to demo mode
                        console.log("Demo mode: Updated wallet for user ".concat(userId, " to ").concat(walletAddress));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Redeem code operations
    SafeStorage.prototype.updateRedeemCode = function (codeId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var error_12;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.updateRedeemCode(codeId, updates); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_12 = _a.sent();
                        console.error('Error updating redeem code:', error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.disableRedeemCode = function (codeId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_13;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.disableRedeemCode(codeId); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_13 = _a.sent();
                        console.error('Error disabling redeem code:', error_13);
                        throw error_13;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SafeStorage.prototype.deleteRedeemCode = function (codeId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_14;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tryDatabase(function () { return _this.dbStorage.deleteRedeemCode(codeId); })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _a.sent();
                        console.error('Error deleting redeem code:', error_14);
                        throw error_14;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SafeStorage;
}());
export { SafeStorage };
export var storage = new SafeStorage();
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13;
