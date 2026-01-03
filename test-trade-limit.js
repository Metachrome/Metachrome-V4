/**
 * Test script to verify maximum 3 active trades limit
 * 
 * Usage: node test-trade-limit.js <username> <password>
 * Example: node test-trade-limit.js testuser Test123456!
 */

const API_URL = 'https://metachrome-v4-production.up.railway.app';

async function login(username, password) {
  console.log(`\n🔐 Logging in as ${username}...`);
  
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Login failed: ${error}`);
  }

  const data = await response.json();
  console.log(`✅ Login successful! User ID: ${data.user.id}`);
  console.log(`💰 Balance: ${data.user.balance} USDT`);
  
  return {
    userId: data.user.id,
    token: data.token,
    balance: parseFloat(data.user.balance)
  };
}

async function getActiveTrades(token) {
  const response = await fetch(`${API_URL}/api/trades/active`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get active trades: ${response.statusText}`);
  }

  const trades = await response.json();
  return trades.filter(t => t.status === 'active' || t.status === 'pending');
}

async function createTrade(userId, token, tradeNumber) {
  console.log(`\n📊 Creating trade #${tradeNumber}...`);
  
  const response = await fetch(`${API_URL}/api/trades/options`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: '100',
      duration: 30
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.log(`❌ Trade #${tradeNumber} REJECTED: ${data.message}`);
    return { success: false, message: data.message };
  }

  console.log(`✅ Trade #${tradeNumber} CREATED: ${data.trade.id}`);
  return { success: true, trade: data.trade };
}

async function runTest() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.log('Usage: node test-trade-limit.js <username> <password>');
      console.log('Example: node test-trade-limit.js testuser Test123456!');
      process.exit(1);
    }

    const [username, password] = args;

    // Login
    const { userId, token, balance } = await login(username, password);

    // Check current active trades
    console.log('\n🔍 Checking current active trades...');
    const currentTrades = await getActiveTrades(token);
    console.log(`📊 Current active trades: ${currentTrades.length}`);

    if (currentTrades.length > 0) {
      console.log('\n⚠️  WARNING: User already has active trades!');
      console.log('Please wait for them to complete or test with a different user.');
      currentTrades.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.id} - ${t.status} - ${t.symbol} ${t.direction}`);
      });
      process.exit(1);
    }

    // Try to create 4 trades (should only allow 3)
    console.log('\n🧪 Testing trade limit (attempting to create 4 trades)...');
    console.log('Expected: First 3 should succeed, 4th should be rejected\n');

    const results = [];
    for (let i = 1; i <= 4; i++) {
      const result = await createTrade(userId, token, i);
      results.push(result);
      
      // Small delay between trades
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Verify results
    console.log('\n📋 TEST RESULTS:');
    console.log('═══════════════════════════════════════════════════════');
    
    const successCount = results.filter(r => r.success).length;
    const rejectedCount = results.filter(r => !r.success).length;

    console.log(`✅ Successful trades: ${successCount}`);
    console.log(`❌ Rejected trades: ${rejectedCount}`);

    if (successCount === 3 && rejectedCount === 1) {
      console.log('\n🎉 TEST PASSED! Trade limit is working correctly!');
      console.log('   - First 3 trades were created successfully');
      console.log('   - 4th trade was rejected (max limit reached)');
      
      if (results[3].message) {
        console.log(`   - Rejection message: "${results[3].message}"`);
      }
    } else {
      console.log('\n❌ TEST FAILED! Trade limit is NOT working correctly!');
      console.log(`   Expected: 3 successful, 1 rejected`);
      console.log(`   Got: ${successCount} successful, ${rejectedCount} rejected`);
    }

    // Check final active trades count
    console.log('\n🔍 Verifying final active trades count...');
    const finalTrades = await getActiveTrades(token);
    console.log(`📊 Final active trades: ${finalTrades.length}`);

    if (finalTrades.length === 3) {
      console.log('✅ Confirmed: Exactly 3 active trades in database');
    } else {
      console.log(`❌ ERROR: Expected 3 active trades, found ${finalTrades.length}`);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

runTest();

