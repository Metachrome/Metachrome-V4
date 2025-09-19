// Test real-time updates and cache-busting
const fetch = globalThis.fetch || require('node-fetch');

async function testRealTimeUpdates() {
  console.log('🧪 Testing Real-Time Updates and Cache-Busting...\n');

  try {
    // Step 1: Get initial user data
    console.log('📊 Step 1: Getting initial user data...');
    const initialResponse = await fetch('http://localhost:3333/api/admin/users', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!initialResponse.ok) {
      throw new Error(`Failed to fetch users: ${initialResponse.status}`);
    }
    
    const users = await initialResponse.json();
    const testUser = users.find(u => u.username === 'angela.soenoko');
    
    if (!testUser) {
      throw new Error('Test user angela.soenoko not found');
    }
    
    console.log(`✅ Found test user: ${testUser.username}`);
    console.log(`💰 Initial balance: $${testUser.balance}`);
    console.log(`🎯 Initial trading mode: ${testUser.trading_mode}`);
    console.log(`👛 Initial wallet: ${testUser.wallet_address || 'Not set'}\n`);

    // Step 2: Perform deposit
    console.log('💰 Step 2: Testing deposit...');
    const depositAmount = 500;
    const depositResponse = await fetch('http://localhost:3333/api/superadmin/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        amount: depositAmount,
        note: 'Real-time test deposit'
      })
    });

    if (!depositResponse.ok) {
      throw new Error(`Deposit failed: ${depositResponse.status}`);
    }

    const depositResult = await depositResponse.json();
    console.log(`✅ Deposit API response: ${depositResult.message}`);
    console.log(`📈 Expected new balance: $${depositResult.newBalance}`);

    // Step 3: Immediately check if data is updated (with cache-busting)
    console.log('\n🔄 Step 3: Checking immediate data update...');
    const timestamp = Date.now();
    const checkResponse = await fetch(`http://localhost:3333/api/admin/users?_t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!checkResponse.ok) {
      throw new Error(`Failed to fetch updated users: ${checkResponse.status}`);
    }

    const updatedUsers = await checkResponse.json();
    const updatedUser = updatedUsers.find(u => u.id === testUser.id);

    console.log(`💰 Updated balance: $${updatedUser.balance}`);
    console.log(`📊 Balance change: $${updatedUser.balance - testUser.balance}`);

    if (updatedUser.balance === testUser.balance + depositAmount) {
      console.log('✅ SUCCESS: Balance updated immediately!');
    } else {
      console.log('❌ FAILED: Balance not updated immediately');
      console.log(`   Expected: $${testUser.balance + depositAmount}`);
      console.log(`   Actual: $${updatedUser.balance}`);
    }

    // Step 4: Test trading mode change
    console.log('\n🎯 Step 4: Testing trading mode change...');
    const newMode = testUser.trading_mode === 'normal' ? 'win' : 'normal';
    const tradingResponse = await fetch('http://localhost:3333/api/admin/trading-controls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        controlType: newMode
      })
    });

    if (!tradingResponse.ok) {
      throw new Error(`Trading mode change failed: ${tradingResponse.status}`);
    }

    const tradingResult = await tradingResponse.json();
    console.log(`✅ Trading mode API response: ${tradingResult.message}`);

    // Check trading mode update
    const timestamp2 = Date.now();
    const checkResponse2 = await fetch(`http://localhost:3333/api/admin/users?_t=${timestamp2}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const updatedUsers2 = await checkResponse2.json();
    const updatedUser2 = updatedUsers2.find(u => u.id === testUser.id);

    console.log(`🎯 Updated trading mode: ${updatedUser2.trading_mode}`);

    if (updatedUser2.trading_mode === newMode) {
      console.log('✅ SUCCESS: Trading mode updated immediately!');
    } else {
      console.log('❌ FAILED: Trading mode not updated immediately');
      console.log(`   Expected: ${newMode}`);
      console.log(`   Actual: ${updatedUser2.trading_mode}`);
    }

    // Step 5: Test wallet address update
    console.log('\n👛 Step 5: Testing wallet address update...');
    const newWallet = `0x${Math.random().toString(16).substr(2, 40)}`;
    const walletResponse = await fetch('http://localhost:3333/api/superadmin/update-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        walletAddress: newWallet
      })
    });

    if (!walletResponse.ok) {
      throw new Error(`Wallet update failed: ${walletResponse.status}`);
    }

    const walletResult = await walletResponse.json();
    console.log(`✅ Wallet API response: ${walletResult.message}`);

    // Check wallet update
    const timestamp3 = Date.now();
    const checkResponse3 = await fetch(`http://localhost:3333/api/admin/users?_t=${timestamp3}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const updatedUsers3 = await checkResponse3.json();
    const updatedUser3 = updatedUsers3.find(u => u.id === testUser.id);

    console.log(`👛 Updated wallet: ${updatedUser3.wallet_address || 'Not set'}`);

    if (updatedUser3.wallet_address === newWallet) {
      console.log('✅ SUCCESS: Wallet address updated immediately!');
    } else {
      console.log('❌ FAILED: Wallet address not updated immediately');
      console.log(`   Expected: ${newWallet}`);
      console.log(`   Actual: ${updatedUser3.wallet_address || 'Not set'}`);
    }

    console.log('\n🎉 Real-time update test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealTimeUpdates();
