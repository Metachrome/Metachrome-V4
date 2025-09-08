#!/usr/bin/env node

// Test script for Vercel deployment
const https = require('https');

const VERCEL_URL = process.argv[2] || 'https://metachrome-v2.vercel.app';

console.log('🧪 Testing Vercel Deployment...');
console.log(`🌐 Base URL: ${VERCEL_URL}`);
console.log('');

// Test endpoints
const endpoints = [
  {
    name: 'Admin Login',
    method: 'POST',
    path: '/api/admin/login',
    body: { username: 'superadmin', password: 'superadmin123' },
    expected: 'success'
  },
  {
    name: 'Admin Users',
    method: 'GET',
    path: '/api/admin/users',
    expected: 'array'
  },
  {
    name: 'Spot Balances',
    method: 'GET',
    path: '/api/spot/balances',
    expected: 'balances'
  },
  {
    name: 'Market Data',
    method: 'GET',
    path: '/api/market-data',
    expected: 'data'
  }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, VERCEL_URL);
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Test-Script'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            name: endpoint.name,
            status: res.statusCode,
            success: res.statusCode < 400,
            data: parsed,
            error: null
          });
        } catch (e) {
          resolve({
            name: endpoint.name,
            status: res.statusCode,
            success: false,
            data: null,
            error: `Parse error: ${e.message}`
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        name: endpoint.name,
        status: 0,
        success: false,
        data: null,
        error: error.message
      });
    });

    if (endpoint.body) {
      req.write(JSON.stringify(endpoint.body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing API endpoints...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log('✅ PASS');
    } else {
      console.log(`❌ FAIL (${result.status})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Deployment is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the following:');
    console.log('1. Environment variables are set in Vercel dashboard');
    console.log('2. Latest code is deployed');
    console.log('3. Database connection is working');
    
    console.log('\n❌ Failed endpoints:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.name}: ${result.error || `HTTP ${result.status}`}`);
    });
  }
  
  console.log('\n🔗 Useful links:');
  console.log(`   - Admin Dashboard: ${VERCEL_URL}/admin/dashboard`);
  console.log(`   - User Dashboard: ${VERCEL_URL}/dashboard`);
  console.log(`   - API Health: ${VERCEL_URL}/api/admin/stats`);
}

// Run the tests
runTests().catch(console.error);
