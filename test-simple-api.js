#!/usr/bin/env node

// Simple test to check if basic API is working
const BASE_URL = 'https://metachrome-v4.vercel.app';

async function testBasicEndpoint() {
  try {
    console.log('🧪 Testing basic homepage...');
    const response = await fetch(`${BASE_URL}/`);
    console.log(`📊 Homepage Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Homepage is working');
    } else {
      console.log('❌ Homepage failed');
    }
    
    console.log('\n🧪 Testing simple API endpoint...');
    const apiResponse = await fetch(`${BASE_URL}/api/user/balances`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 API Status: ${apiResponse.status}`);
    
    if (apiResponse.status === 200) {
      const data = await apiResponse.json();
      console.log('✅ API is working:', data);
    } else {
      const error = await apiResponse.text();
      console.log('❌ API Error:', error);
      
      // Check if it's a deployment issue
      if (error.includes('FUNCTION_INVOCATION_FAILED')) {
        console.log('\n🔍 This is a Vercel function deployment issue.');
        console.log('💡 Possible causes:');
        console.log('   1. Environment variables not set correctly');
        console.log('   2. Import path errors in API files');
        console.log('   3. Need to redeploy after changes');
        console.log('   4. Supabase connection issues');
      }
    }
    
  } catch (error) {
    console.log('💥 Network Error:', error.message);
  }
}

testBasicEndpoint();
