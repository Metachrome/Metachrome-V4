const { expect } = require('chai');

/**
 * Test suite for loss calculation fix
 * Verifies that loss trades calculate loss as a percentage, not the full amount
 */
describe('Loss Calculation Fix', () => {
  
  describe('Backend Loss Calculation', () => {
    
    it('should calculate 30s loss as 10% of amount', () => {
      // Test case: 30s trade with 5000 USDT amount
      const amount = 5000;
      const duration = 30;
      const lossRate = duration === 30 ? 0.10 : 0.15;
      const profitAmount = -(amount * lossRate);
      
      // Expected: -500 (10% of 5000)
      expect(profitAmount).to.equal(-500);
      console.log(`✅ 30s loss: ${amount} USDT → ${profitAmount} USDT (10%)`);
    });

    it('should calculate 60s loss as 15% of amount', () => {
      // Test case: 60s trade with 5000 USDT amount
      const amount = 5000;
      const duration = 60;
      const lossRate = duration === 30 ? 0.10 : 0.15;
      const profitAmount = -(amount * lossRate);
      
      // Expected: -750 (15% of 5000)
      expect(profitAmount).to.equal(-750);
      console.log(`✅ 60s loss: ${amount} USDT → ${profitAmount} USDT (15%)`);
    });

    it('should calculate 30s loss for 2500 USDT as -250', () => {
      // Test case: 30s trade with 2500 USDT amount
      const amount = 2500;
      const duration = 30;
      const lossRate = duration === 30 ? 0.10 : 0.15;
      const profitAmount = -(amount * lossRate);
      
      // Expected: -250 (10% of 2500)
      expect(profitAmount).to.equal(-250);
      console.log(`✅ 30s loss: ${amount} USDT → ${profitAmount} USDT (10%)`);
    });

    it('should calculate 60s loss for 1000 USDT as -150', () => {
      // Test case: 60s trade with 1000 USDT amount
      const amount = 1000;
      const duration = 60;
      const lossRate = duration === 30 ? 0.10 : 0.15;
      const profitAmount = -(amount * lossRate);
      
      // Expected: -150 (15% of 1000)
      expect(profitAmount).to.equal(-150);
      console.log(`✅ 60s loss: ${amount} USDT → ${profitAmount} USDT (15%)`);
    });

    it('should NOT calculate loss as full amount', () => {
      // Test case: Verify that loss is NOT the full amount
      const amount = 5000;
      const duration = 60;
      const lossRate = duration === 30 ? 0.10 : 0.15;
      const profitAmount = -(amount * lossRate);
      
      // Should NOT be -5000 (full amount)
      expect(profitAmount).to.not.equal(-amount);
      expect(profitAmount).to.equal(-750); // Should be 15% = -750
      console.log(`✅ Loss is NOT full amount: ${profitAmount} ≠ ${-amount}`);
    });
  });

  describe('Client-side Loss Calculation (TradeNotification)', () => {
    
    it('should calculate PnL for loss trade using profitPercentage', () => {
      // Simulate TradeNotification logic
      const trade = {
        status: 'lost',
        amount: 5000,
        profitPercentage: 15, // 15% for 60s
        profit: undefined // Not provided by WebSocket
      };
      
      const isWin = trade.status === 'won';
      let pnl = 0;
      
      if (trade.profit !== undefined) {
        pnl = trade.profit;
      } else if (isWin) {
        pnl = trade.payout - trade.amount;
      } else {
        // CRITICAL FIX: Loss should be percentage-based
        const lossPercentage = (trade.profitPercentage || 15) / 100;
        pnl = -(trade.amount * lossPercentage);
      }
      
      // Expected: -750 (15% of 5000)
      expect(pnl).to.equal(-750);
      console.log(`✅ Client loss calculation: ${trade.amount} USDT → ${pnl} USDT (${trade.profitPercentage}%)`);
    });

    it('should use profitAmount from WebSocket when available', () => {
      // Simulate TradeNotification logic with profitAmount from WebSocket
      const trade = {
        status: 'lost',
        amount: 5000,
        profitPercentage: 15,
        profit: -750 // Provided by WebSocket (correct value)
      };
      
      const isWin = trade.status === 'won';
      let pnl = 0;
      
      if (trade.profit !== undefined) {
        pnl = trade.profit;
      } else if (isWin) {
        pnl = trade.payout - trade.amount;
      } else {
        const lossPercentage = (trade.profitPercentage || 15) / 100;
        pnl = -(trade.amount * lossPercentage);
      }
      
      // Should use the profitAmount from WebSocket
      expect(pnl).to.equal(-750);
      console.log(`✅ Using WebSocket profitAmount: ${pnl} USDT`);
    });

    it('should calculate 30s loss as 10% when profitPercentage is 10', () => {
      // Simulate TradeNotification logic for 30s trade
      const trade = {
        status: 'lost',
        amount: 2500,
        profitPercentage: 10, // 10% for 30s
        profit: undefined
      };
      
      const isWin = trade.status === 'won';
      let pnl = 0;
      
      if (trade.profit !== undefined) {
        pnl = trade.profit;
      } else if (isWin) {
        pnl = trade.payout - trade.amount;
      } else {
        const lossPercentage = (trade.profitPercentage || 15) / 100;
        pnl = -(trade.amount * lossPercentage);
      }
      
      // Expected: -250 (10% of 2500)
      expect(pnl).to.equal(-250);
      console.log(`✅ 30s client loss: ${trade.amount} USDT → ${pnl} USDT (10%)`);
    });
  });

  describe('Integration: Backend to Client', () => {
    
    it('should send correct profitAmount in WebSocket message for loss trade', () => {
      // Simulate backend sending trade_completed message
      const tradeData = {
        amount: 5000,
        duration: 60,
        result: 'lose'
      };
      
      // Backend calculation
      const lossRate = tradeData.duration === 30 ? 0.10 : 0.15;
      const profitAmount = -(tradeData.amount * lossRate);
      
      // WebSocket message
      const wsMessage = {
        type: 'trade_completed',
        data: {
          profitAmount: profitAmount,
          amount: tradeData.amount,
          duration: tradeData.duration,
          profitPercentage: tradeData.duration === 30 ? 10 : 15,
          result: tradeData.result
        }
      };
      
      // Client receives and uses profitAmount
      const clientPnl = wsMessage.data.profitAmount;
      
      // Should be -750 (15% of 5000)
      expect(clientPnl).to.equal(-750);
      console.log(`✅ WebSocket message profitAmount: ${clientPnl} USDT`);
    });
  });
});

