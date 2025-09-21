#!/usr/bin/env node

/**
 * Comprehensive Production Deployment Test
 * Tests if Railway deployment is working with Supabase environment variables
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testProductionDeployment() {
  console.log('🧪 TESTING PRODUCTION DEPLOYMENT');
  console.log('================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  // Test 1: Basic connectivity
  console.log('\n🔍 TEST 1: Basic Server Connectivity');
  console.log('-----------------------------------');
  
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      timeout: 10000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server is responding!');
      console.log('   Status:', data.status);
      console.log('   Environment:', data.environment);
      console.log('   Database:', data.database);
      console.log('   Timestamp:', data.timestamp);
      
      if (data.features) {
        console.log('   Features available:', Object.keys(data.features).join(', '));
      }
    } else {
      console.log('❌ Server responded with error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not responding:', error.message);
    console.log('   This means Railway deployment is not working');
    return false;
  }
  
  // Test 2: Admin login
  console.log('\n🔍 TEST 2: Admin Authentication');
  console.log('------------------------------');
  
  try {
    const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'superadmin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful');
      console.log('   User:', loginData.user?.username);
      console.log('   Role:', loginData.user?.role);
    } else {
      console.log('❌ Admin login failed:', loginResponse.status);
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.message);
  }
  
  // Test 3: Pending requests (deposit system)
  console.log('\n🔍 TEST 3: Deposit System');
  console.log('------------------------');
  
  try {
    const pendingResponse = await fetch(`${baseUrl}/api/admin/pending-requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log('✅ Pending requests endpoint working');
      console.log('   Total deposits:', pendingData.deposits?.length || 0);
      console.log('   Total withdrawals:', pendingData.withdrawals?.length || 0);
      console.log('   Total requests:', pendingData.total || 0);
      
      if (pendingData.deposits && pendingData.deposits.length > 0) {
        console.log('   📋 Deposit details:');
        pendingData.deposits.forEach((deposit, index) => {
          console.log(`     ${index + 1}. ${deposit.user} - ${deposit.amount} ${deposit.currency} (${deposit.status})`);
        });
      }
    } else {
      console.log('❌ Pending requests failed:', pendingResponse.status);
    }
  } catch (error) {
    console.log('❌ Pending requests error:', error.message);
  }
  
  // Test 4: Database connection
  console.log('\n🔍 TEST 4: Database Connection');
  console.log('-----------------------------');
  
  try {
    const dbTestResponse = await fetch(`${baseUrl}/api/test/server-status`, {
      method: 'GET'
    });
    
    if (dbTestResponse.ok) {
      const dbData = await dbTestResponse.json();
      console.log('✅ Database test endpoint working');
      console.log('   Server status:', dbData.status);
      console.log('   Deployment check:', dbData.deploymentCheck);
    } else {
      console.log('❌ Database test failed:', dbTestResponse.status);
    }
  } catch (error) {
    console.log('❌ Database test error:', error.message);
  }
  
  // Summary
  console.log('\n📊 DEPLOYMENT TEST SUMMARY');
  console.log('==========================');
  console.log('✅ If all tests passed: Deployment is working correctly');
  console.log('❌ If tests failed: Railway needs to redeploy with updated code');
  console.log('');
  console.log('🔧 Next steps if deployment is working:');
  console.log('   1. Test deposit creation from user dashboard');
  console.log('   2. Check admin dashboard for pending deposits');
  console.log('   3. Test deposit approval workflow');
  console.log('');
  console.log('🚀 If deployment is not working:');
  console.log('   1. Go to Railway dashboard');
  console.log('   2. Find your project');
  console.log('   3. Click "Redeploy" on latest deployment');
  console.log('   4. Wait for deployment to complete');
  console.log('   5. Run this test again');
  
  return true;
}

// Run the test
testProductionDeployment().catch(console.error);
