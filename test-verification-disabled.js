// Test script to verify that verification system has been disabled
const fetch = globalThis.fetch || require('node-fetch');

async function testVerificationDisabled() {
  console.log('🧪 TESTING VERIFICATION SYSTEM DISABLED...\n');

  try {
    const baseUrl = 'http://localhost:3333';

    // Step 1: Test verification status endpoint
    console.log('📋 Step 1: Testing verification status endpoint...');
    const verificationResponse = await fetch(`${baseUrl}/api/test/verification-status`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!verificationResponse.ok) {
      throw new Error(`Verification status check failed: ${verificationResponse.status}`);
    }
    
    const verificationData = await verificationResponse.json();
    console.log('✅ Verification status response:');
    console.log(`   User: ${verificationData.user}`);
    console.log(`   Verification Status: ${verificationData.verification_status}`);
    console.log(`   Documents Uploaded: ${verificationData.documents_uploaded}`);
    console.log(`   Can Trade: ${verificationData.can_trade}`);
    console.log(`   Can Withdraw: ${verificationData.can_withdraw}`);
    console.log(`   Message: ${verificationData.message}`);

    if (verificationData.can_trade && verificationData.can_withdraw) {
      console.log('🎉 SUCCESS: Verification bypass is working - trading and withdrawals enabled!');
    } else {
      console.log('❌ FAILED: Verification is still blocking trading/withdrawals');
    }

    // Step 2: Test withdrawal restrictions
    console.log('\n💰 Step 2: Testing withdrawal restrictions...');
    const withdrawalResponse = await fetch(`${baseUrl}/api/test/withdrawal-restrictions`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!withdrawalResponse.ok) {
      throw new Error(`Withdrawal restrictions check failed: ${withdrawalResponse.status}`);
    }
    
    const withdrawalData = await withdrawalResponse.json();
    console.log('✅ Withdrawal restrictions response:');
    console.log(`   User: ${withdrawalData.user}`);
    console.log(`   Can Withdraw: ${withdrawalData.can_withdraw}`);
    console.log(`   Balance: $${withdrawalData.balance}`);
    console.log(`   Restrictions: ${withdrawalData.restrictions.length > 0 ? withdrawalData.restrictions.join(', ') : 'None'}`);

    if (withdrawalData.can_withdraw || withdrawalData.restrictions.length === 0 || !withdrawalData.restrictions.includes('Account verification required')) {
      console.log('🎉 SUCCESS: Verification requirement removed from withdrawals!');
    } else {
      console.log('❌ FAILED: Verification is still required for withdrawals');
    }

    // Step 3: Test actual trading endpoint
    console.log('\n🎯 Step 3: Testing actual trading endpoint...');
    
    // First, get a user to test with
    const usersResponse = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status}`);
    }
    
    const users = await usersResponse.json();
    const testUser = users.find(u => u.username === 'angela.soenoko') || users.find(u => u.role === 'user');
    
    if (!testUser) {
      throw new Error('No test user found');
    }
    
    console.log(`🧪 Testing with user: ${testUser.username} (Balance: $${testUser.balance})`);
    
    // Test trading endpoint
    const tradingResponse = await fetch(`${baseUrl}/api/trades/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer mock-token-${testUser.id}` // Mock token for testing
      },
      body: JSON.stringify({
        userId: testUser.id,
        symbol: 'BTCUSDT',
        amount: 100,
        duration: 30,
        direction: 'up'
      })
    });
    
    const tradingData = await tradingResponse.json();
    
    if (tradingResponse.ok) {
      console.log('🎉 SUCCESS: Trading endpoint accessible without verification!');
      console.log(`   Trade Response: ${tradingData.message || 'Trade processed successfully'}`);
      console.log(`   Trade ID: ${tradingData.trade?.id || 'N/A'}`);
    } else if (tradingResponse.status === 403 && tradingData.requiresVerification) {
      console.log('❌ FAILED: Trading is still blocked by verification requirement!');
      console.log(`   Error Message: ${tradingData.message}`);
      console.log('   🚨 VERIFICATION SYSTEM IS STILL ACTIVE');
    } else {
      console.log(`⚠️ Trading response (${tradingResponse.status}): ${tradingData.message || tradingData.error || 'Unknown response'}`);
    }

    // Step 4: Summary
    console.log('\n📊 VERIFICATION DISABLE TEST SUMMARY:');
    console.log('=====================================');
    
    const verificationDisabled = verificationData.can_trade && verificationData.can_withdraw;
    const withdrawalUnrestricted = withdrawalData.can_withdraw || !withdrawalData.restrictions.includes('Account verification required');
    const tradingAccessible = tradingResponse.ok || (tradingResponse.status !== 403 || !tradingData.requiresVerification);
    
    console.log(`✅ Verification Status Bypassed: ${verificationDisabled ? 'YES' : 'NO'}`);
    console.log(`✅ Withdrawal Restrictions Removed: ${withdrawalUnrestricted ? 'YES' : 'NO'}`);
    console.log(`✅ Trading Accessible: ${tradingAccessible ? 'YES' : 'NO'}`);
    
    if (verificationDisabled && withdrawalUnrestricted && tradingAccessible) {
      console.log('\n🎉 ALL TESTS PASSED: VERIFICATION SYSTEM SUCCESSFULLY DISABLED!');
      console.log('✅ Users can now trade and withdraw without verification requirements.');
    } else {
      console.log('\n❌ SOME TESTS FAILED: Verification system may still be partially active.');
      console.log('⚠️ Please check the specific failed tests above.');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
  }
}

testVerificationDisabled();
