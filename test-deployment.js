#!/usr/bin/env node

// Test script to verify Vercel deployment endpoints
const BASE_URL = 'https://metachrome-v4.vercel.app';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const status = response.status;
    
    console.log(`📊 Status: ${status}`);
    
    if (status === 200) {
      const data = await response.json();
      console.log(`✅ Success:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
    } else {
      const error = await response.text();
      console.log(`❌ Error:`, error.substring(0, 200) + '...');
    }
    
    return { status, success: status === 200 };
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { status: 0, success: false };
  }
}

async function runTests() {
  console.log('🚀 Testing METACHROME V4 Deployment');
  console.log('🌐 Base URL:', BASE_URL);
  
  const tests = [
    // Balance endpoints
    { endpoint: '/api/user/balances', method: 'GET' },
    { endpoint: '/api/user/balances?userId=demo-user-1', method: 'GET' },
    
    // Admin endpoints
    { endpoint: '/api/admin/users', method: 'GET' },
    { endpoint: '/api/admin/stats', method: 'GET' },
    { endpoint: '/api/admin/trades', method: 'GET' },
    { endpoint: '/api/admin/transactions', method: 'GET' },
    
    // Trading endpoints
    { 
      endpoint: '/api/trades/options', 
      method: 'POST',
      body: {
        userId: 'demo-user-1',
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: '100',
        duration: 30
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.method, test.body);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📈 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Run the tests
runTests().catch(console.error);
