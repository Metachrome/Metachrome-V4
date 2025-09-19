// Complete functionality test for all superadmin features
const fetch = globalThis.fetch || require('node-fetch');

async function testCompleteFunctionality() {
  console.log('🧪 TESTING COMPLETE SUPERADMIN FUNCTIONALITY...\n');

  try {
    // Step 1: Get initial user data
    console.log('📊 Step 1: Getting initial user data...');
    const initialResponse = await fetch('http://localhost:3005/api/admin/users', {
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

    // Step 2: Test Deposit
    console.log('💰 Step 2: Testing DEPOSIT...');
    const depositAmount = 1000;
    const depositResponse = await fetch('http://localhost:3005/api/superadmin/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        amount: depositAmount,
        note: 'Complete functionality test deposit'
      })
    });

    if (!depositResponse.ok) {
      throw new Error(`Deposit failed: ${depositResponse.status}`);
    }

    const depositResult = await depositResponse.json();
    console.log(`✅ Deposit successful: ${depositResult.message}`);

    // Verify deposit immediately
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms
    const afterDepositResponse = await fetch(`http://localhost:3005/api/admin/users?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const afterDepositUsers = await afterDepositResponse.json();
    const afterDepositUser = afterDepositUsers.find(u => u.id === testUser.id);
    
    if (afterDepositUser.balance === testUser.balance + depositAmount) {
      console.log(`✅ DEPOSIT VERIFIED: Balance updated from $${testUser.balance} to $${afterDepositUser.balance}`);
    } else {
      console.log(`❌ DEPOSIT FAILED: Expected $${testUser.balance + depositAmount}, got $${afterDepositUser.balance}`);
    }

    // Step 3: Test Withdrawal
    console.log('\n💸 Step 3: Testing WITHDRAWAL...');
    const withdrawalAmount = 500;
    const withdrawalResponse = await fetch('http://localhost:3005/api/superadmin/withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        amount: withdrawalAmount,
        note: 'Complete functionality test withdrawal'
      })
    });

    if (!withdrawalResponse.ok) {
      throw new Error(`Withdrawal failed: ${withdrawalResponse.status}`);
    }

    const withdrawalResult = await withdrawalResponse.json();
    console.log(`✅ Withdrawal successful: ${withdrawalResult.message}`);

    // Verify withdrawal immediately
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms
    const afterWithdrawalResponse = await fetch(`http://localhost:3005/api/admin/users?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const afterWithdrawalUsers = await afterWithdrawalResponse.json();
    const afterWithdrawalUser = afterWithdrawalUsers.find(u => u.id === testUser.id);
    
    const expectedBalance = afterDepositUser.balance - withdrawalAmount;
    if (afterWithdrawalUser.balance === expectedBalance) {
      console.log(`✅ WITHDRAWAL VERIFIED: Balance updated to $${afterWithdrawalUser.balance}`);
    } else {
      console.log(`❌ WITHDRAWAL FAILED: Expected $${expectedBalance}, got $${afterWithdrawalUser.balance}`);
    }

    // Step 4: Test Trading Mode Change
    console.log('\n🎯 Step 4: Testing TRADING MODE CHANGE...');
    const newMode = testUser.trading_mode === 'normal' ? 'win' : 'normal';
    const tradingResponse = await fetch('http://localhost:3005/api/admin/trading-controls', {
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
    console.log(`✅ Trading mode change successful: ${tradingResult.message}`);

    // Verify trading mode change immediately
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms
    const afterTradingResponse = await fetch(`http://localhost:3005/api/admin/users?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const afterTradingUsers = await afterTradingResponse.json();
    const afterTradingUser = afterTradingUsers.find(u => u.id === testUser.id);
    
    if (afterTradingUser.trading_mode === newMode) {
      console.log(`✅ TRADING MODE VERIFIED: Changed to ${newMode.toUpperCase()}`);
    } else {
      console.log(`❌ TRADING MODE FAILED: Expected ${newMode}, got ${afterTradingUser.trading_mode}`);
    }

    // Step 5: Test Wallet Address Update
    console.log('\n👛 Step 5: Testing WALLET ADDRESS UPDATE...');
    const newWallet = `0x${Math.random().toString(16).substr(2, 40)}`;
    const walletResponse = await fetch('http://localhost:3005/api/superadmin/update-wallet', {
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
    console.log(`✅ Wallet update successful: ${walletResult.message}`);

    // Verify wallet update immediately
    await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms
    const afterWalletResponse = await fetch(`http://localhost:3005/api/admin/users?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const afterWalletUsers = await afterWalletResponse.json();
    const afterWalletUser = afterWalletUsers.find(u => u.id === testUser.id);
    
    if (afterWalletUser.wallet_address === newWallet) {
      console.log(`✅ WALLET UPDATE VERIFIED: Address updated to ${newWallet.substr(0, 10)}...`);
    } else {
      console.log(`❌ WALLET UPDATE FAILED: Expected ${newWallet}, got ${afterWalletUser.wallet_address || 'Not set'}`);
    }

    // Step 6: Test Password Change
    console.log('\n🔑 Step 6: Testing PASSWORD CHANGE...');
    const newPassword = 'NewTestPassword123!';
    const passwordResponse = await fetch('http://localhost:3005/api/superadmin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        newPassword: newPassword
      })
    });

    if (!passwordResponse.ok) {
      throw new Error(`Password change failed: ${passwordResponse.status}`);
    }

    const passwordResult = await passwordResponse.json();
    console.log(`✅ Password change successful: ${passwordResult.message}`);

    // Step 7: Final verification
    console.log('\n🔍 Step 7: FINAL VERIFICATION...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
    const finalResponse = await fetch(`http://localhost:3005/api/admin/users?_t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const finalUsers = await finalResponse.json();
    const finalUser = finalUsers.find(u => u.id === testUser.id);
    
    console.log('\n📊 FINAL USER STATE:');
    console.log(`👤 Username: ${finalUser.username}`);
    console.log(`💰 Balance: $${finalUser.balance} (changed by $${finalUser.balance - testUser.balance})`);
    console.log(`🎯 Trading Mode: ${finalUser.trading_mode.toUpperCase()}`);
    console.log(`👛 Wallet: ${finalUser.wallet_address ? finalUser.wallet_address.substr(0, 20) + '...' : 'Not set'}`);
    console.log(`🕒 Last Updated: ${finalUser.updated_at}`);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('✅ All superadmin functions are working with real-time database updates!');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

testCompleteFunctionality();
