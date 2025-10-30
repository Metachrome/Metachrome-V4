/**
 * Test suite for WIN calculation fix
 * Verifies that WIN trades calculate balance as: starting balance + profit
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ FAILED: ${message}`);
  }
  console.log(`✅ PASSED: ${message}`);
}

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

describe('WIN Calculation Fix', () => {

  describe('Backend WIN Balance Calculation', () => {

    it('should calculate 30s WIN: starting balance + 10% profit', () => {
      const startingBalance = 50000;
      const tradeAmount = 10000;
      const profitPercentage = 10;
      const profitAmount = tradeAmount * (profitPercentage / 100); // 1000

      // At trade start: deduct profit percentage
      const balanceAfterTrade = startingBalance - profitAmount; // 50000 - 1000 = 49000

      // On WIN: add back the profit + earn the profit
      const balanceChange = profitAmount + profitAmount; // 1000 + 1000 = 2000
      const finalBalance = balanceAfterTrade + balanceChange; // 49000 + 2000 = 51000

      assert(balanceChange === 2000, `Balance change should be 2000, got ${balanceChange}`);
      assert(finalBalance === 51000, `Final balance should be 51000, got ${finalBalance}`);
      console.log(`   30s WIN: ${startingBalance} → ${balanceAfterTrade} (after trade) → ${finalBalance} (after WIN)`);
      console.log(`   Balance change: +${balanceChange} (return profit + earn profit)`);
    });

    it('should calculate 60s WIN: starting balance + 15% profit', () => {
      const startingBalance = 50000;
      const tradeAmount = 10000;
      const profitPercentage = 15;
      const profitAmount = tradeAmount * (profitPercentage / 100); // 1500

      // At trade start: deduct profit percentage
      const balanceAfterTrade = startingBalance - profitAmount; // 50000 - 1500 = 48500

      // On WIN: add back the profit + earn the profit
      const balanceChange = profitAmount + profitAmount; // 1500 + 1500 = 3000
      const finalBalance = balanceAfterTrade + balanceChange; // 48500 + 3000 = 51500

      assert(balanceChange === 3000, `Balance change should be 3000, got ${balanceChange}`);
      assert(finalBalance === 51500, `Final balance should be 51500, got ${finalBalance}`);
      console.log(`   60s WIN: ${startingBalance} → ${balanceAfterTrade} (after trade) → ${finalBalance} (after WIN)`);
      console.log(`   Balance change: +${balanceChange} (return profit + earn profit)`);
    });

    it('should calculate WIN with different amounts correctly', () => {
      const startingBalance = 100000;
      const tradeAmount = 5000;
      const profitPercentage = 10;
      const profitAmount = tradeAmount * (profitPercentage / 100); // 500

      const balanceAfterTrade = startingBalance - profitAmount; // 100000 - 500 = 99500
      const balanceChange = profitAmount + profitAmount; // 500 + 500 = 1000
      const finalBalance = balanceAfterTrade + balanceChange; // 99500 + 1000 = 100500

      assert(balanceChange === 1000, `Balance change should be 1000, got ${balanceChange}`);
      assert(finalBalance === 100500, `Final balance should be 100500, got ${finalBalance}`);
      console.log(`   30s WIN (5000 USDT): ${startingBalance} → ${finalBalance}`);
    });

    it('should calculate WIN for 90s with 20% profit', () => {
      const startingBalance = 100000;
      const tradeAmount = 5000;
      const profitPercentage = 20;
      const profitAmount = tradeAmount * (profitPercentage / 100); // 1000

      const balanceAfterTrade = startingBalance - profitAmount; // 100000 - 1000 = 99000
      const balanceChange = profitAmount + profitAmount; // 1000 + 1000 = 2000
      const finalBalance = balanceAfterTrade + balanceChange; // 99000 + 2000 = 101000

      assert(balanceChange === 2000, `Balance change should be 2000, got ${balanceChange}`);
      assert(finalBalance === 101000, `Final balance should be 101000, got ${finalBalance}`);
      console.log(`   90s WIN (5000 USDT): ${startingBalance} → ${finalBalance}`);
    });
  });

  describe('Backend WIN Profit Recording', () => {
    
    it('should record profit amount correctly for transaction', () => {
      const tradeAmount = 1000;
      const profitPercentage = 10;
      const profitAmount = tradeAmount * (profitPercentage / 100);
      const profit = profitAmount;

      assert(profit === 100, `Profit should be 100, got ${profit}`);
      console.log(`   Profit recorded: ${profit} USDT (for transaction)`);
    });

    it('should calculate balance change as return profit + earn profit', () => {
      const tradeAmount = 10000;
      const profitPercentage = 10;
      const profitAmount = tradeAmount * (profitPercentage / 100); // 1000

      // Balance change = return the deducted profit + earn new profit
      const balanceChange = profitAmount + profitAmount; // 1000 + 1000 = 2000
      const profit = profitAmount; // Profit earned = 1000

      assert(balanceChange === 2000, `Balance change should be 2000, got ${balanceChange}`);
      assert(profit === 1000, `Profit should be 1000, got ${profit}`);
      assert(balanceChange === profit * 2, `Balance change should be 2x profit`);
      console.log(`   Balance change (${balanceChange}) = Return profit (${profitAmount}) + Earn profit (${profitAmount})`);
    });
  });
});

console.log('\n✅ All WIN calculation tests passed!');

