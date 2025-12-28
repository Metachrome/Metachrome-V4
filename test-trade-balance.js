/**
 * Test script to verify trade balance updates
 * This simulates a complete trade flow and verifies balance changes
 */

// Support both Node.js with native fetch and older versions with node-fetch
let fetch;
try {
  fetch = globalThis.fetch;
  if (!fetch) {
    fetch = require('node-fetch');
  }
} catch (e) {
  fetch = globalThis.fetch;
  if (!fetch) {
    console.error('❌ Error: fetch is not available. Please upgrade to Node.js 18+ or install node-fetch:');
    console.error('   npm install node-fetch');
    process.exit(1);
  }
}

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_USERNAME = `test_user_${Date.now()}`;
const TEST_EMAIL = `test_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Test123456!';
const INITIAL_BALANCE = 1000;
const TRADE_AMOUNT = 100;

let testUserId = null;
let testToken = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Step 1: Create test user
async function createTestUser() {
  log('\n📝 Step 1: Creating test user...', 'cyan');
  
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Failed to create user: ${data.message}`);
  }

  testUserId = data.user.id;
  testToken = data.token;
  
  log(`✅ User created: ${TEST_USERNAME} (ID: ${testUserId})`, 'green');
  log(`   Initial balance: ${data.user.balance} USDT`, 'green');
  
  return data.user;
}

// Step 2: Set initial balance
async function setInitialBalance() {
  log('\n💰 Step 2: Setting initial balance...', 'cyan');
  
  // This requires direct database access or admin endpoint
  // For now, we'll use the redeem code feature to add balance
  const response = await fetch(`${BASE_URL}/api/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    },
    body: JSON.stringify({
      code: 'TEST1000' // You need to create this code in admin panel first
    })
  });

  const data = await response.json();
  log(`   Balance after redeem: ${data.balance || 'N/A'} USDT`, 'yellow');
  
  return data;
}

// Step 3: Create a trade
async function createTrade(direction = 'up', duration = 30) {
  log('\n📊 Step 3: Creating trade...', 'cyan');
  log(`   Direction: ${direction.toUpperCase()}`, 'yellow');
  log(`   Amount: ${TRADE_AMOUNT} USDT`, 'yellow');
  log(`   Duration: ${duration}s`, 'yellow');
  
  const response = await fetch(`${BASE_URL}/api/trades/options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    },
    body: JSON.stringify({
      symbol: 'BTCUSDT',
      direction: direction,
      amount: TRADE_AMOUNT,
      duration: duration,
      entryPrice: 95000 // Mock price
    })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Failed to create trade: ${data.message}`);
  }

  log(`✅ Trade created: ${data.trade.id}`, 'green');
  log(`   Entry price: ${data.trade.entry_price}`, 'green');
  
  return data.trade;
}

// Step 4: Get user balance
async function getUserBalance() {
  const response = await fetch(`${BASE_URL}/api/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${testToken}`
    }
  });

  const data = await response.json();
  return parseFloat(data.user?.balance || 0);
}

// Step 5: Wait for trade to complete and verify balance
async function waitAndVerifyTrade(trade, expectedProfit) {
  log('\n⏰ Step 4: Waiting for trade to complete...', 'cyan');
  
  const balanceBefore = await getUserBalance();
  log(`   Balance before: ${balanceBefore} USDT`, 'yellow');
  
  // Wait for trade duration + 2 seconds buffer
  const waitTime = (trade.duration + 2) * 1000;
  log(`   Waiting ${trade.duration + 2} seconds...`, 'yellow');
  await sleep(waitTime);
  
  const balanceAfter = await getUserBalance();
  log(`   Balance after: ${balanceAfter} USDT`, 'yellow');
  
  const actualChange = balanceAfter - balanceBefore;
  log(`   Actual change: ${actualChange > 0 ? '+' : ''}${actualChange} USDT`, actualChange > 0 ? 'green' : 'red');
  log(`   Expected change: +${expectedProfit} USDT (if WIN)`, 'yellow');
  
  return {
    balanceBefore,
    balanceAfter,
    actualChange,
    expectedProfit
  };
}

// Main test function
async function runTest() {
  try {
    log('🚀 Starting Trade Balance Test...', 'blue');
    log(`   Target: ${BASE_URL}`, 'blue');
    
    // Step 1: Create user
    const user = await createTestUser();
    
    // Step 2: Note - You need to manually add balance via admin panel or redeem code
    log('\n⚠️  MANUAL STEP REQUIRED:', 'yellow');
    log(`   Please add ${INITIAL_BALANCE} USDT to user: ${TEST_USERNAME}`, 'yellow');
    log(`   User ID: ${testUserId}`, 'yellow');
    log('   Press Enter when done...', 'yellow');
    
    // Wait for user input
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    
    // Verify balance was added
    const currentBalance = await getUserBalance();
    log(`✅ Current balance: ${currentBalance} USDT`, 'green');
    
    if (currentBalance < TRADE_AMOUNT) {
      throw new Error(`Insufficient balance: ${currentBalance} < ${TRADE_AMOUNT}`);
    }
    
    // Step 3: Create trade
    const trade = await createTrade('up', 30);
    
    // Calculate expected profit (10% for 30s duration)
    const expectedProfit = TRADE_AMOUNT * 0.10;
    
    // Step 4: Wait and verify
    const result = await waitAndVerifyTrade(trade, expectedProfit);
    
    // Final verification
    log('\n📊 Test Results:', 'blue');
    log('─'.repeat(50), 'blue');
    
    if (Math.abs(result.actualChange - expectedProfit) < 0.01) {
      log('✅ TEST PASSED: Balance updated correctly!', 'green');
      log(`   Expected: +${expectedProfit} USDT`, 'green');
      log(`   Actual: +${result.actualChange} USDT`, 'green');
    } else if (result.actualChange === 0) {
      log('❌ TEST FAILED: Balance did not change!', 'red');
      log(`   Expected: +${expectedProfit} USDT`, 'red');
      log(`   Actual: ${result.actualChange} USDT`, 'red');
      log('\n🔍 This is the bug we are looking for!', 'red');
    } else {
      log('⚠️  TEST INCONCLUSIVE: Unexpected balance change', 'yellow');
      log(`   Expected: +${expectedProfit} USDT`, 'yellow');
      log(`   Actual: +${result.actualChange} USDT`, 'yellow');
    }
    
    log('\n✅ Test completed!', 'green');
    log(`   Test user: ${TEST_USERNAME} (ID: ${testUserId})`, 'green');
    log('   You can delete this user from admin panel', 'green');
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the test
runTest();

