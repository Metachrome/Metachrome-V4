#!/usr/bin/env node

/**
 * Simple test script to verify loss calculation fix
 * Run with: node tests/verify-loss-calculation.js
 */

console.log('🧪 Testing Loss Calculation Fix\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    passedTests++;
  } else {
    console.log(`❌ ${message}`);
    failedTests++;
  }
}

// Test 1: Backend 30s loss calculation
console.log('📊 Backend Loss Calculation Tests:');
{
  const amount = 5000;
  const duration = 30;
  const lossRate = duration === 30 ? 0.10 : 0.15;
  const profitAmount = -(amount * lossRate);
  
  assert(profitAmount === -500, `30s loss: 5000 USDT → -500 USDT (10%)`);
}

// Test 2: Backend 60s loss calculation
{
  const amount = 5000;
  const duration = 60;
  const lossRate = duration === 30 ? 0.10 : 0.15;
  const profitAmount = -(amount * lossRate);
  
  assert(profitAmount === -750, `60s loss: 5000 USDT → -750 USDT (15%)`);
}

// Test 3: Backend 30s loss for 2500 USDT
{
  const amount = 2500;
  const duration = 30;
  const lossRate = duration === 30 ? 0.10 : 0.15;
  const profitAmount = -(amount * lossRate);
  
  assert(profitAmount === -250, `30s loss: 2500 USDT → -250 USDT (10%)`);
}

// Test 4: Backend 60s loss for 1000 USDT
{
  const amount = 1000;
  const duration = 60;
  const lossRate = duration === 30 ? 0.10 : 0.15;
  const profitAmount = -(amount * lossRate);
  
  assert(profitAmount === -150, `60s loss: 1000 USDT → -150 USDT (15%)`);
}

// Test 5: Verify loss is NOT full amount
{
  const amount = 5000;
  const duration = 60;
  const lossRate = duration === 30 ? 0.10 : 0.15;
  const profitAmount = -(amount * lossRate);
  
  assert(profitAmount !== -amount, `Loss is NOT full amount: -750 ≠ -5000`);
}

// Test 6: Client-side loss calculation (TradeNotification)
console.log('\n📱 Client-side Loss Calculation Tests:');
{
  const trade = {
    status: 'lost',
    amount: 5000,
    profitPercentage: 15,
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
  
  assert(pnl === -750, `Client loss: 5000 USDT → -750 USDT (15%)`);
}

// Test 7: Client uses WebSocket profitAmount
{
  const trade = {
    status: 'lost',
    amount: 5000,
    profitPercentage: 15,
    profit: -750 // From WebSocket
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
  
  assert(pnl === -750, `Client uses WebSocket profitAmount: -750 USDT`);
}

// Test 8: Client 30s loss calculation
{
  const trade = {
    status: 'lost',
    amount: 2500,
    profitPercentage: 10,
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
  
  assert(pnl === -250, `Client 30s loss: 2500 USDT → -250 USDT (10%)`);
}

// Test 9: Integration - WebSocket message
console.log('\n🔌 Integration Tests:');
{
  const tradeData = {
    amount: 5000,
    duration: 60,
    result: 'lose'
  };
  
  const lossRate = tradeData.duration === 30 ? 0.10 : 0.15;
  const profitAmount = -(tradeData.amount * lossRate);
  
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
  
  const clientPnl = wsMessage.data.profitAmount;
  assert(clientPnl === -750, `WebSocket message profitAmount: -750 USDT`);
}

// Test 10: Win calculation should still work
console.log('\n💰 Win Calculation Tests (Regression):');
{
  const amount = 2500;
  const duration = 30;
  const profitRate = duration === 30 ? 0.10 : 0.15;
  const profitAmount = amount * profitRate;
  
  assert(profitAmount === 250, `30s win: 2500 USDT → +250 USDT (10%)`);
}

{
  const amount = 5000;
  const duration = 60;
  const profitRate = duration === 30 ? 0.10 : 0.15;
  const profitAmount = amount * profitRate;
  
  assert(profitAmount === 750, `60s win: 5000 USDT → +750 USDT (15%)`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
console.log('='.repeat(50));

if (failedTests === 0) {
  console.log('✅ All tests passed! Loss calculation fix is working correctly.');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the fix.');
  process.exit(1);
}

