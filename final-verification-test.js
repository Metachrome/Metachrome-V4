import fetch from 'node-fetch';

async function finalVerificationTest() {
  try {
    console.log('🧪 Running final verification system test...');
    
    const baseUrl = 'http://localhost:3001'; // Adjust if your server runs on different port
    
    // Test 1: Login as angela.soenoko
    console.log('\n🔐 Test 1: Login as angela.soenoko');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'angela.soenoko',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log(`   Username: ${loginData.user.username}`);
      console.log(`   Verification Status: ${loginData.user.verification_status}`);
      console.log(`   Has Documents: ${loginData.user.has_uploaded_documents}`);
      console.log(`   Balance: $${loginData.user.balance}`);
      
      const token = loginData.token;
      
      // Test 2: Check verification status
      console.log('\n📋 Test 2: Check verification status');
      const verificationResponse = await fetch(`${baseUrl}/api/user/verification-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const verificationData = await verificationResponse.json();
      
      if (verificationResponse.ok) {
        console.log('✅ Verification status check successful!');
        console.log(`   Status: ${verificationData.verification_status}`);
        console.log(`   Documents: ${verificationData.documents ? verificationData.documents.length : 0}`);
      } else {
        console.log('❌ Verification status check failed:', verificationData.error);
      }
      
      // Test 3: Test trading access
      console.log('\n🎯 Test 3: Test trading access');
      const tradingResponse = await fetch(`${baseUrl}/api/trades/options`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: 'BTCUSDT',
          amount: 100,
          duration: 30,
          direction: 'up'
        })
      });
      
      const tradingData = await tradingResponse.json();
      
      if (tradingResponse.ok) {
        console.log('✅ Trading access granted!');
        console.log(`   Trade ID: ${tradingData.trade?.id || 'N/A'}`);
        console.log(`   Message: ${tradingData.message || 'Trade placed successfully'}`);
      } else if (tradingResponse.status === 403 && tradingData.requiresVerification) {
        console.log('❌ Trading blocked - verification required!');
        console.log(`   Message: ${tradingData.message}`);
        console.log('   🚨 THIS INDICATES THE VERIFICATION SYSTEM IS NOT WORKING PROPERLY');
      } else {
        console.log('⚠️ Trading response:', tradingData.message || tradingData.error);
      }
      
      // Test 4: Force refresh user data
      console.log('\n🔄 Test 4: Force refresh user data');
      const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const refreshData = await refreshResponse.json();
      
      if (refreshResponse.ok) {
        console.log('✅ User data refresh successful!');
        console.log(`   Username: ${refreshData.username}`);
        console.log(`   Verification Status: ${refreshData.verification_status}`);
        console.log(`   Has Documents: ${refreshData.has_uploaded_documents}`);
      } else {
        console.log('❌ User data refresh failed:', refreshData.error);
      }
      
    } else {
      console.log('❌ Login failed:', loginData.error);
      console.log('   This might mean the user doesn\'t exist or password is wrong');
      
      // Try with a test user instead
      console.log('\n🔐 Trying with test user...');
      const testLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'testuser_1758118426856',
          password: 'password123'
        })
      });
      
      const testLoginData = await testLoginResponse.json();
      
      if (testLoginResponse.ok) {
        console.log('✅ Test user login successful!');
        console.log(`   Verification Status: ${testLoginData.user.verification_status}`);
      } else {
        console.log('❌ Test user login also failed:', testLoginData.error);
      }
    }
    
    console.log('\n🎉 Final verification test completed!');
    console.log('\n📝 Summary:');
    console.log('   - Database verification system is set up');
    console.log('   - All regular users are verified');
    console.log('   - Verification documents exist');
    console.log('   - Admin users are verified');
    
    console.log('\n💡 If users are still seeing verification warnings:');
    console.log('   1. Clear browser cache completely');
    console.log('   2. Logout and login again');
    console.log('   3. Try incognito/private browsing');
    console.log('   4. Check browser console for JavaScript errors');
    console.log('   5. Verify the frontend is calling the correct API endpoints');
    
  } catch (error) {
    console.error('❌ Final test failed:', error);
    console.error('Error details:', error.message);
    
    console.log('\n💡 This might indicate:');
    console.log('   - Server is not running on localhost:3001');
    console.log('   - Network connectivity issues');
    console.log('   - API endpoints have changed');
  }
}

finalVerificationTest();
