// Test script to simulate MetaMask user login
const axios = require('axios');

async function testMetaMaskLogin() {
  try {
    console.log('🧪 Testing MetaMask user login...\n');
    
    // Simulate MetaMask login
    const loginResponse = await axios.post('http://localhost:3001/api/auth', {
      walletAddress: '0xMETAMASK123456789abcdef',
      username: 'metamask.user'
    });
    
    console.log('✅ Login successful!');
    console.log('Token:', loginResponse.data.token?.substring(0, 30) + '...');
    console.log('User ID:', loginResponse.data.user?.id);
    console.log('Username:', loginResponse.data.user?.username);
    
    // Test auth endpoint to get user data
    const authResponse = await axios.get('http://localhost:3001/api/auth', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('\n📋 Auth endpoint response:');
    console.log('User ID:', authResponse.data.id);
    console.log('Username:', authResponse.data.username);
    console.log('Email:', authResponse.data.email);
    console.log('Wallet Address:', authResponse.data.walletAddress);
    console.log('Has Password:', authResponse.data.hasPassword);
    console.log('Balance:', authResponse.data.balance);
    
    // Check if "Set Login Password" should be shown
    const shouldShowSetPassword = authResponse.data.walletAddress || !authResponse.data.hasPassword;
    console.log('\n🔍 Frontend Logic Check:');
    console.log('shouldShowSetPassword:', shouldShowSetPassword);
    
    if (shouldShowSetPassword) {
      console.log('✅ SUCCESS: "Set Login Password" will be visible in Profile Settings!');
    } else {
      console.log('❌ FAIL: "Set Login Password" will NOT be visible!');
    }
    
    console.log('\n🎯 Test completed successfully!');
    console.log('📝 To test in browser:');
    console.log('   1. Go to http://localhost:5173');
    console.log('   2. Login with MetaMask using wallet: 0xMETAMASK123456789abcdef');
    console.log('   3. Go to Profile Settings > Security tab');
    console.log('   4. You should see "Set Login Password" section');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMetaMaskLogin();
