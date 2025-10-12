// Test script for spot trading functionality
// Run this with: node test-spot-trading.js

const fetch = require('node-fetch');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
// const BASE_URL = 'http://localhost:3000'; // For local testing

async function testSpotTrading() {
  console.log('🧪 Testing Spot Trading Functionality...\n');

  // Test user ID (replace with actual user ID)
  const testUserId = 'your-user-id-here';

  try {
    // 1. Test debug balances endpoint
    console.log('1️⃣ Testing debug balances endpoint...');
    const debugResponse = await fetch(`${BASE_URL}/api/debug/balances?userId=${testUserId}`);
    const debugData = await debugResponse.json();
    console.log('Debug response:', JSON.stringify(debugData, null, 2));
    console.log('');

    // 2. Test current balances
    console.log('2️⃣ Testing current balances...');
    const balancesResponse = await fetch(`${BASE_URL}/api/balances?userId=${testUserId}`);
    const balancesData = await balancesResponse.json();
    console.log('Current balances:', JSON.stringify(balancesData, null, 2));
    console.log('');

    // 3. Test spot buy order
    console.log('3️⃣ Testing spot buy order...');
    const buyOrderData = {
      userId: testUserId,
      symbol: 'BTCUSDT',
      side: 'buy',
      amount: 0.001, // Buy 0.001 BTC
      price: 65000,
      type: 'market'
    };

    const buyResponse = await fetch(`${BASE_URL}/api/spot/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buyOrderData)
    });

    const buyResult = await buyResponse.json();
    console.log('Buy order response:', JSON.stringify(buyResult, null, 2));
    console.log('');

    // 4. Check balances after buy
    console.log('4️⃣ Checking balances after buy...');
    const balancesAfterBuy = await fetch(`${BASE_URL}/api/balances?userId=${testUserId}`);
    const balancesAfterBuyData = await balancesAfterBuy.json();
    console.log('Balances after buy:', JSON.stringify(balancesAfterBuyData, null, 2));
    console.log('');

    // 5. Test create balance endpoint (if needed)
    console.log('5️⃣ Testing create balance endpoint...');
    const createBalanceData = {
      userId: testUserId,
      symbol: 'BTC',
      available: '0.001',
      locked: '0'
    };

    const createBalanceResponse = await fetch(`${BASE_URL}/api/debug/create-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createBalanceData)
    });

    const createBalanceResult = await createBalanceResponse.json();
    console.log('Create balance response:', JSON.stringify(createBalanceResult, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for running the test
console.log(`
📋 INSTRUCTIONS:
1. Replace 'your-user-id-here' with your actual user ID
2. Make sure the production server is running
3. Run: node test-spot-trading.js

🔧 To get your user ID:
1. Open browser console on the wallet page
2. Type: localStorage.getItem('user')
3. Copy the 'id' field from the JSON response
`);

// Uncomment the line below to run the test
// testSpotTrading();
