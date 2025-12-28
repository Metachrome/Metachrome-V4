/**
 * Simple test script - Login with existing user and test trade
 * Usage: node test-trade-simple.js <username> <password>
 */

// Support both Node.js with native fetch and older versions with node-fetch
let fetch;
try {
  // Try native fetch first (Node.js 18+)
  fetch = globalThis.fetch;
  if (!fetch) {
    // Fallback to node-fetch for older Node.js versions
    fetch = require('node-fetch');
  }
} catch (e) {
  // If node-fetch not installed, try using native fetch
  fetch = globalThis.fetch;
  if (!fetch) {
    console.error('❌ Error: fetch is not available. Please upgrade to Node.js 18+ or install node-fetch:');
    console.error('   npm install node-fetch');
    process.exit(1);
  }
}

// Configuration
const BASE_URL = process.env.TEST_URL || 'https://metachrome-v4-production.up.railway.app';
const USERNAME = process.argv[2] || 'testuser';
const PASSWORD = process.argv[3] || 'Test123456!';
const TRADE_AMOUNT = parseFloat(process.argv[4]) || 10; // Default 10 USDT
const DURATION = parseInt(process.argv[5]) || 30; // Default 30s

let testToken = null;
let userId = null;

// Colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Login
async function login() {
  log('\n🔐 Logging in...', 'cyan');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Login failed: ${data.message}`);
  }

  testToken = data.token;
  userId = data.user.id;
  
  log(`✅ Logged in as: ${data.user.username}`, 'green');
  log(`   User ID: ${userId}`, 'green');
  log(`   Balance: ${data.user.balance} USDT`, 'green');
  
  return data.user;
}

// Get balance
async function getBalance() {
  const response = await fetch(`${BASE_URL}/api/user/profile`, {
    headers: { 'Authorization': `Bearer ${testToken}` }
  });
  const data = await response.json();
  return parseFloat(data.user?.balance || 0);
}

// Create trade
async function createTrade() {
  log('\n📊 Creating trade...', 'cyan');
  log(`   Amount: ${TRADE_AMOUNT} USDT`, 'yellow');
  log(`   Duration: ${DURATION}s`, 'yellow');
  
  const response = await fetch(`${BASE_URL}/api/trades/options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testToken}`
    },
    body: JSON.stringify({
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: TRADE_AMOUNT,
      duration: DURATION,
      entryPrice: 95000
    })
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Trade failed: ${data.message}`);
  }

  log(`✅ Trade created: ${data.trade.id}`, 'green');
  return data.trade;
}

// Main test
async function runTest() {
  try {
    log('═══════════════════════════════════════════════', 'blue');
    log('🧪 TRADE BALANCE TEST', 'blue');
    log('═══════════════════════════════════════════════', 'blue');
    log(`Target: ${BASE_URL}`, 'blue');
    
    // Login
    const user = await login();
    
    // Get initial balance
    const balanceBefore = await getBalance();
    log(`\n💰 Initial balance: ${balanceBefore} USDT`, 'magenta');
    
    // Check if enough balance
    if (balanceBefore < TRADE_AMOUNT) {
      throw new Error(`Insufficient balance: ${balanceBefore} < ${TRADE_AMOUNT}`);
    }
    
    // Create trade
    const trade = await createTrade();
    
    // Calculate expected profit based on duration
    let profitRate = 0.10;
    if (DURATION === 30) profitRate = 0.10;
    else if (DURATION === 60) profitRate = 0.15;
    else if (DURATION === 90) profitRate = 0.20;
    else if (DURATION === 120) profitRate = 0.25;
    else if (DURATION === 180) profitRate = 0.30;
    else if (DURATION === 240) profitRate = 0.50;
    else if (DURATION === 300) profitRate = 0.75;
    else if (DURATION === 600) profitRate = 1.00;
    
    const expectedProfit = TRADE_AMOUNT * profitRate;
    
    log(`\n⏰ Waiting for trade to complete (${DURATION + 3}s)...`, 'cyan');
    log(`   Trade system:`, 'yellow');
    log(`   - At START: Deduct profit% (${expectedProfit} USDT)`, 'yellow');
    log(`   - If WIN: Balance = Initial + Profit = ${balanceBefore} + ${expectedProfit} = ${balanceBefore + expectedProfit}`, 'yellow');
    log(`   - If LOSE: Balance = Initial - Profit = ${balanceBefore} - ${expectedProfit} = ${balanceBefore - expectedProfit}`, 'yellow');

    // Wait for trade to complete
    await sleep((DURATION + 3) * 1000);

    // Get final balance
    const balanceAfter = await getBalance();
    const actualChange = balanceAfter - balanceBefore;
    
    // Results
    log('\n═══════════════════════════════════════════════', 'blue');
    log('📊 TEST RESULTS', 'blue');
    log('═══════════════════════════════════════════════', 'blue');
    log(`Balance Before:  ${balanceBefore} USDT`, 'yellow');
    log(`Balance After:   ${balanceAfter} USDT`, 'yellow');
    log(`Actual Change:   ${actualChange > 0 ? '+' : ''}${actualChange} USDT`, actualChange > 0 ? 'green' : 'red');
    log(`Expected Profit: +${expectedProfit} USDT`, 'yellow');
    log('───────────────────────────────────────────────', 'blue');
    
    // Verdict
    const expectedWinChange = expectedProfit; // WIN: +profit
    const expectedLoseChange = -expectedProfit; // LOSE: -profit

    if (Math.abs(actualChange - expectedWinChange) < 0.01) {
      log('✅ TEST PASSED (WIN): Balance updated correctly!', 'green');
      log(`   Trade WON, profit added: +${expectedProfit} USDT`, 'green');
    } else if (Math.abs(actualChange - expectedLoseChange) < 0.01) {
      log('✅ TEST PASSED (LOSE): Balance updated correctly!', 'green');
      log(`   Trade LOST, profit deducted: -${expectedProfit} USDT`, 'green');
    } else if (actualChange === 0) {
      log('❌ TEST FAILED: Balance did NOT change!', 'red');
      log('   This is the bug - balance should change on WIN or LOSE', 'red');
    } else {
      log('⚠️  TEST INCONCLUSIVE: Unexpected change', 'yellow');
      log(`   Expected WIN: +${expectedWinChange}, Expected LOSE: ${expectedLoseChange}`, 'yellow');
      log(`   Actual: ${actualChange > 0 ? '+' : ''}${actualChange}`, 'yellow');
    }
    
    log('═══════════════════════════════════════════════\n', 'blue');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Show usage if no args
if (process.argv.length < 4) {
  log('Usage: node test-trade-simple.js <username> <password> [amount] [duration]', 'yellow');
  log('Example: node test-trade-simple.js testuser Test123456! 10 30', 'yellow');
  log('\nUsing defaults:', 'cyan');
  log(`  Username: ${USERNAME}`, 'cyan');
  log(`  Password: ${PASSWORD}`, 'cyan');
  log(`  Amount: ${TRADE_AMOUNT} USDT`, 'cyan');
  log(`  Duration: ${DURATION}s`, 'cyan');
  log('', 'reset');
}

runTest();

