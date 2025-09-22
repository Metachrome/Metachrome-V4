// Simple test to verify trade control logic without server
const fs = require('fs');

console.log('🎯 SIMPLE TRADE CONTROL VERIFICATION');
console.log('='.repeat(50));

// Read the working-server.js file and extract the enforceTradeOutcome function
const serverCode = fs.readFileSync('working-server.js', 'utf8');

// Check if the enforceTradeOutcome function exists
if (serverCode.includes('async function enforceTradeOutcome')) {
  console.log('✅ enforceTradeOutcome function found in working-server.js');
} else {
  console.log('❌ enforceTradeOutcome function NOT found in working-server.js');
}

// Check if the function is being called in the completion endpoint
if (serverCode.includes('await enforceTradeOutcome(userId, originalWon, \'MAIN_ENDPOINT\')')) {
  console.log('✅ enforceTradeOutcome is being called in the main completion endpoint');
} else {
  console.log('❌ enforceTradeOutcome is NOT being called in the main completion endpoint');
}

// Check if the completion endpoint exists
if (serverCode.includes('app.post(\'/api/trades/complete\'')) {
  console.log('✅ /api/trades/complete endpoint exists');
} else {
  console.log('❌ /api/trades/complete endpoint does NOT exist');
}

// Read users data to verify trading modes
console.log('\n📊 Current User Trading Modes:');
try {
  const users = JSON.parse(fs.readFileSync('users-data.json', 'utf8'));
  users.forEach(user => {
    console.log(`   ${user.username}: ${user.trading_mode || 'normal'}`);
  });
  
  const loseUsers = users.filter(u => u.trading_mode === 'lose');
  console.log(`\n🎯 Users in LOSE mode: ${loseUsers.length}`);
  if (loseUsers.length > 0) {
    loseUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.id})`);
    });
  }
} catch (error) {
  console.log('❌ Error reading users data:', error.message);
}

// Check if the frontend is calling the correct endpoint
console.log('\n🔍 Checking frontend trade completion calls...');
try {
  const optionsPageCode = fs.readFileSync('client/src/pages/OptionsPage.tsx', 'utf8');
  
  if (optionsPageCode.includes('/api/trades/complete')) {
    console.log('✅ Frontend calls /api/trades/complete endpoint');
  } else {
    console.log('❌ Frontend does NOT call /api/trades/complete endpoint');
  }
  
  if (optionsPageCode.includes('completeTrade')) {
    console.log('✅ Frontend has completeTrade function');
  } else {
    console.log('❌ Frontend does NOT have completeTrade function');
  }
} catch (error) {
  console.log('❌ Error reading frontend code:', error.message);
}

console.log('\n🔧 POTENTIAL ISSUES TO CHECK:');
console.log('1. Is the server actually running on port 3005?');
console.log('2. Are there any startup errors in the server?');
console.log('3. Is the frontend calling the correct endpoint?');
console.log('4. Are there multiple completion endpoints that might conflict?');
console.log('5. Is the trading mode being properly read from the database?');

console.log('\n💡 RECOMMENDED DEBUGGING STEPS:');
console.log('1. Start the server and check for any error messages');
console.log('2. Test the /api/trades/complete endpoint directly with curl or Postman');
console.log('3. Add more console.log statements to the enforceTradeOutcome function');
console.log('4. Check if the user ID is being passed correctly from frontend to backend');
console.log('5. Verify that the trading_mode field is being read correctly from users-data.json');

console.log('\n='.repeat(50));
console.log('🎯 VERIFICATION COMPLETE');
