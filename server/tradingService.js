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
import { storage } from './storage';
import { priceService } from './priceService';
var TradingService = /** @class */ (function () {
    function TradingService() {
        this.activeTrades = new Map();
    }
    // Create a new options trade
    TradingService.prototype.createOptionsTrade = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var finalUserId, optionsSettings, setting, tradeAmount, minAmount, userBalance, currentPrice, newAvailable, newLocked, expiresAt, trade, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        finalUserId = request.userId;
                        if (request.userId === 'superadmin-001' || request.userId === 'admin-001') {
                            finalUserId = "".concat(request.userId, "-trading");
                            console.log("\uD83D\uDD27 Admin user ".concat(request.userId, " trading as ").concat(finalUserId));
                        }
                        return [4 /*yield*/, storage.getOptionsSettings()];
                    case 1:
                        optionsSettings = _a.sent();
                        setting = optionsSettings.find(function (s) { return s.duration === request.duration && s.isActive; });
                        if (!setting) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Trading duration ".concat(request.duration, "s is not available"),
                                }];
                        }
                        tradeAmount = parseFloat(request.amount);
                        minAmount = parseFloat(setting.minAmount);
                        if (tradeAmount < minAmount) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Minimum amount for ".concat(request.duration, "s is $").concat(minAmount),
                                }];
                        }
                        return [4 /*yield*/, storage.getBalance(finalUserId, 'USDT')];
                    case 2:
                        userBalance = _a.sent();
                        if (!(!userBalance && finalUserId.includes('-trading'))) return [3 /*break*/, 5];
                        // Create default balance for admin trading profiles
                        return [4 /*yield*/, storage.updateBalance(finalUserId, 'USDT', '50000.00', '0.00')];
                    case 3:
                        // Create default balance for admin trading profiles
                        _a.sent();
                        return [4 /*yield*/, storage.getBalance(finalUserId, 'USDT')];
                    case 4:
                        userBalance = _a.sent();
                        console.log("\uD83D\uDCB0 Created admin trading balance: ".concat(finalUserId, " with 50,000 USDT"));
                        _a.label = 5;
                    case 5:
                        if (!userBalance || parseFloat(userBalance.available) < tradeAmount) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Insufficient balance',
                                }];
                        }
                        return [4 /*yield*/, priceService.getCurrentPrice(request.symbol)];
                    case 6:
                        currentPrice = _a.sent();
                        if (!currentPrice) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Unable to get current market price',
                                }];
                        }
                        newAvailable = (parseFloat(userBalance.available) - tradeAmount).toString();
                        newLocked = (parseFloat(userBalance.locked || '0') + tradeAmount).toString();
                        return [4 /*yield*/, storage.updateBalance(finalUserId, 'USDT', newAvailable, newLocked)];
                    case 7:
                        _a.sent();
                        expiresAt = new Date(Date.now() + request.duration * 1000);
                        console.log("\uD83D\uDCCA Creating trade with amount: ".concat(request.amount, " (type: ").concat(typeof request.amount, ")"));
                        return [4 /*yield*/, storage.createTrade({
                                userId: finalUserId,
                                symbol: request.symbol,
                                type: 'options',
                                direction: request.direction,
                                amount: request.amount,
                                price: currentPrice,
                                entryPrice: currentPrice,
                                status: 'active',
                                duration: request.duration,
                                expiresAt: expiresAt,
                            })];
                    case 8:
                        trade = _a.sent();
                        console.log("\u2705 Trade created with ID: ".concat(trade.id, ", amount: ").concat(trade.amount, " (type: ").concat(typeof trade.amount, ")"));
                        // Schedule trade execution
                        this.scheduleTradeExecution(trade.id, request.duration * 1000);
                        return [2 /*return*/, {
                                success: true,
                                trade: trade,
                                message: 'Trade created successfully',
                            }];
                    case 9:
                        error_1 = _a.sent();
                        console.error('Error creating options trade:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                message: 'Failed to create trade',
                            }];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // Schedule automatic trade execution
    TradingService.prototype.scheduleTradeExecution = function (tradeId, delayMs) {
        var _this = this;
        var timeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.executeOptionsTrade(tradeId)];
                    case 1:
                        _a.sent();
                        this.activeTrades.delete(tradeId);
                        return [2 /*return*/];
                }
            });
        }); }, delayMs);
        this.activeTrades.set(tradeId, timeout);
    };
    // Execute an options trade (public method for auto-completion)
    TradingService.prototype.executeOptionsTrade = function (tradeId) {
        return __awaiter(this, void 0, void 0, function () {
            var trade_1, originalUserId, user, tradingMode, currentPrice, isWin, exitPrice, amountStr, tradeAmount, optionsSettings, setting, profitPercentage, profitAmount, profit, userBalance, currentAvailable, currentLocked, newAvailable, newLocked, transactionType, transactionAmount, txError_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        return [4 /*yield*/, storage.getTrade(tradeId)];
                    case 1:
                        trade_1 = _a.sent();
                        if (!trade_1 || trade_1.status !== 'active') {
                            return [2 /*return*/];
                        }
                        originalUserId = trade_1.userId;
                        if (trade_1.userId.endsWith('-trading')) {
                            originalUserId = trade_1.userId.replace('-trading', '');
                        }
                        return [4 /*yield*/, storage.getUser(originalUserId)];
                    case 2:
                        user = _a.sent();
                        tradingMode = (user === null || user === void 0 ? void 0 : user.trading_mode) || 'normal';
                        console.log("\uD83C\uDFAF Executing trade for user ".concat(trade_1.userId));
                        console.log("\uD83C\uDFAF Original user ID for trading mode: ".concat(originalUserId));
                        console.log("\uD83C\uDFAF User object:", user);
                        console.log("\uD83C\uDFAF Trading mode: ".concat(tradingMode));
                        return [4 /*yield*/, priceService.getCurrentPrice(trade_1.symbol)];
                    case 3:
                        currentPrice = _a.sent();
                        if (!currentPrice) {
                            console.error("Cannot execute trade ".concat(tradeId, ": No current price available"));
                            return [2 /*return*/];
                        }
                        isWin = false;
                        exitPrice = currentPrice;
                        // Apply trading mode logic
                        switch (tradingMode) {
                            case 'win':
                                isWin = true;
                                console.log("\uD83C\uDFAF FORCED WIN for user ".concat(trade_1.userId));
                                // Adjust exit price to ensure win
                                if (trade_1.direction === 'up') {
                                    exitPrice = (parseFloat(trade_1.entryPrice) * 1.01).toString(); // 1% higher
                                }
                                else {
                                    exitPrice = (parseFloat(trade_1.entryPrice) * 0.99).toString(); // 1% lower
                                }
                                break;
                            case 'lose':
                                isWin = false;
                                console.log("\uD83C\uDFAF FORCED LOSE for user ".concat(trade_1.userId));
                                // Adjust exit price to ensure loss
                                if (trade_1.direction === 'up') {
                                    exitPrice = (parseFloat(trade_1.entryPrice) * 0.99).toString(); // 1% lower
                                }
                                else {
                                    exitPrice = (parseFloat(trade_1.entryPrice) * 1.01).toString(); // 1% higher
                                }
                                break;
                            case 'normal':
                            default:
                                console.log("\uD83C\uDFAF NORMAL MODE for user ".concat(trade_1.userId));
                                // Use real market logic
                                if (trade_1.direction === 'up') {
                                    isWin = parseFloat(currentPrice) > parseFloat(trade_1.entryPrice);
                                }
                                else {
                                    isWin = parseFloat(currentPrice) < parseFloat(trade_1.entryPrice);
                                }
                                exitPrice = currentPrice;
                                break;
                        }
                        amountStr = trade_1.amount ? trade_1.amount.toString() : '0';
                        tradeAmount = parseFloat(amountStr);
                        return [4 /*yield*/, storage.getOptionsSettings()];
                    case 4:
                        optionsSettings = _a.sent();
                        setting = optionsSettings.find(function (s) { return s.duration === trade_1.duration; });
                        profitPercentage = setting ? parseFloat(setting.profitPercentage) : 10;
                        console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [TRADING SERVICE] PROFIT CALCULATION:", {
                            tradeAmount: tradeAmount,
                            duration: trade_1.duration,
                            profitPercentage: profitPercentage,
                            setting: setting ? { duration: setting.duration, profitPercentage: setting.profitPercentage } : 'NOT FOUND',
                            isWin: isWin
                        });
                        profitAmount = tradeAmount * (profitPercentage / 100);
                        profit = isWin ? profitAmount : -profitAmount;
                        console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [TRADING SERVICE] CALCULATED PROFIT:", {
                            profitAmount: profitAmount,
                            profit: profit,
                            calculation: "".concat(tradeAmount, " * (").concat(profitPercentage, " / 100) = ").concat(profitAmount)
                        });
                        // Update trade with result field
                        return [4 /*yield*/, storage.updateTrade(tradeId, {
                                status: 'completed',
                                result: isWin ? 'win' : 'lose', // CRITICAL: Add result field for frontend
                                exitPrice: exitPrice,
                                profit: profit.toString(),
                                completedAt: new Date(),
                            })];
                    case 5:
                        // Update trade with result field
                        _a.sent();
                        return [4 /*yield*/, storage.getBalance(trade_1.userId, 'USDT')];
                    case 6:
                        userBalance = _a.sent();
                        if (!userBalance) return [3 /*break*/, 8];
                        currentAvailable = parseFloat(userBalance.available || '0');
                        currentLocked = parseFloat(userBalance.locked || '0');
                        console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [TRADING SERVICE] BEFORE Balance update:", {
                            currentAvailable: currentAvailable,
                            currentLocked: currentLocked,
                            total: currentAvailable + currentLocked,
                            tradeAmount: tradeAmount,
                            profitAmount: profitAmount,
                            profit: profit,
                            isWin: isWin
                        });
                        newAvailable = void 0;
                        newLocked = void 0;
                        if (isWin) {
                            // WIN: Unlock tradeAmount from locked back to available, then add ONLY profit
                            // Step 1: Unlock the trade amount (return from locked to available)
                            // Step 2: Add profit to available
                            // Formula: available + tradeAmount (unlock) + profitAmount (profit ONLY)
                            newAvailable = currentAvailable + tradeAmount + profitAmount;
                            newLocked = currentLocked - tradeAmount;
                            console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [TRADING SERVICE] WIN Calculation:", {
                                step1_unlock: "".concat(currentAvailable, " (current) + ").concat(tradeAmount, " (unlock) = ").concat(currentAvailable + tradeAmount),
                                step2_profit: "".concat(currentAvailable + tradeAmount, " + ").concat(profitAmount, " (profit) = ").concat(newAvailable),
                                finalFormula: "".concat(currentAvailable, " + ").concat(tradeAmount, " + ").concat(profitAmount, " = ").concat(newAvailable),
                                lockedFormula: "".concat(currentLocked, " - ").concat(tradeAmount, " = ").concat(newLocked),
                                netChange: "+".concat(profitAmount, " (profit only)")
                            });
                        }
                        else {
                            // LOSE: Unlock tradeAmount from locked, but deduct loss from available
                            // Step 1: Unlock the trade amount (return from locked to available)
                            // Step 2: Deduct loss from available
                            // Formula: available + tradeAmount (unlock) - profitAmount (loss)
                            newAvailable = currentAvailable + tradeAmount - profitAmount;
                            newLocked = currentLocked - tradeAmount;
                            console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [TRADING SERVICE] LOSE Calculation:", {
                                step1_unlock: "".concat(currentAvailable, " (current) + ").concat(tradeAmount, " (unlock) = ").concat(currentAvailable + tradeAmount),
                                step2_loss: "".concat(currentAvailable + tradeAmount, " - ").concat(profitAmount, " (loss) = ").concat(newAvailable),
                                finalFormula: "".concat(currentAvailable, " + ").concat(tradeAmount, " - ").concat(profitAmount, " = ").concat(newAvailable),
                                lockedFormula: "".concat(currentLocked, " - ").concat(tradeAmount, " = ").concat(newLocked),
                                netChange: "-".concat(profitAmount, " (loss only)")
                            });
                        }
                        console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [TRADING SERVICE] AFTER Balance update:", {
                            newAvailable: newAvailable,
                            newLocked: newLocked,
                            total: newAvailable + newLocked,
                            totalChange: (newAvailable + newLocked) - (currentAvailable + currentLocked),
                            expectedChange: isWin ? "+".concat(profitAmount) : "-".concat(profitAmount)
                        });
                        return [4 /*yield*/, storage.updateBalance(trade_1.userId, 'USDT', Math.max(0, newAvailable).toString(), Math.max(0, newLocked).toString())];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        transactionType = isWin ? 'trade_win' : 'trade_loss';
                        transactionAmount = profit.toFixed(8);
                        console.log("\uD83D\uDCDD Creating transaction for trade ".concat(tradeId, ":"), {
                            userId: trade_1.userId,
                            type: transactionType,
                            amount: transactionAmount,
                            profit: profit,
                            isWin: isWin,
                            symbol: trade_1.symbol
                        });
                        return [4 /*yield*/, storage.createTransaction({
                                userId: trade_1.userId,
                                type: transactionType,
                                amount: transactionAmount,
                                symbol: 'USDT', // Trading profits/losses are in USDT
                                status: 'completed',
                                description: "".concat(isWin ? 'Win' : 'Loss', " on ").concat(trade_1.symbol, " trade"),
                                referenceId: tradeId
                            })];
                    case 9:
                        _a.sent();
                        console.log("\u2705 Transaction created successfully for trade ".concat(tradeId));
                        return [3 /*break*/, 11];
                    case 10:
                        txError_1 = _a.sent();
                        console.error("\u274C Failed to create transaction for trade ".concat(tradeId, ":"), txError_1);
                        return [3 /*break*/, 11];
                    case 11:
                        console.log("Trade ".concat(tradeId, " executed: ").concat(isWin ? 'WIN' : 'LOSS', ", Profit: $").concat(profit.toFixed(2)));
                        return [3 /*break*/, 13];
                    case 12:
                        error_2 = _a.sent();
                        console.error("Error executing trade ".concat(tradeId, ":"), error_2);
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    // Cancel a trade (if still active)
    TradingService.prototype.cancelTrade = function (tradeId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var trade, timeout, userBalance, tradeAmount, newAvailable, newLocked, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, storage.getTrade(tradeId)];
                    case 1:
                        trade = _a.sent();
                        if (!trade || trade.userId !== userId || trade.status !== 'active') {
                            return [2 /*return*/, false];
                        }
                        timeout = this.activeTrades.get(tradeId);
                        if (timeout) {
                            clearTimeout(timeout);
                            this.activeTrades.delete(tradeId);
                        }
                        // Update trade status
                        return [4 /*yield*/, storage.updateTrade(tradeId, {
                                status: 'cancelled',
                                completedAt: new Date(),
                            })];
                    case 2:
                        // Update trade status
                        _a.sent();
                        return [4 /*yield*/, storage.getBalance(userId, 'USDT')];
                    case 3:
                        userBalance = _a.sent();
                        if (!userBalance) return [3 /*break*/, 5];
                        tradeAmount = parseFloat(trade.amount);
                        newAvailable = parseFloat(userBalance.available) + tradeAmount;
                        newLocked = parseFloat(userBalance.locked || '0') - tradeAmount;
                        return [4 /*yield*/, storage.updateBalance(userId, 'USDT', newAvailable.toString(), Math.max(0, newLocked).toString())];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                    case 6:
                        error_3 = _a.sent();
                        console.error("Error cancelling trade ".concat(tradeId, ":"), error_3);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Get active trades for a user
    TradingService.prototype.getActiveTrades = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, storage.getActiveTrades(userId)];
            });
        });
    };
    return TradingService;
}());
export var tradingService = new TradingService();
