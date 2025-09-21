#!/usr/bin/env node

/**
 * Test Admin Dashboard API directly
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAdminDashboardAPI() {
  console.log('🔧 TESTING ADMIN DASHBOARD API');
  console.log('==============================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    // Test the exact API endpoint the admin dashboard uses
    console.log('\n📡 Testing /api/admin/pending-requests endpoint...');
    
    const response = await fetch(`${baseUrl}/api/admin/pending-requests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ API Response successful!');
      console.log('📊 Raw API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n📋 Parsed Data:');
      console.log('   Deposits count:', data.deposits?.length || 0);
      console.log('   Withdrawals count:', data.withdrawals?.length || 0);
      console.log('   Total count:', data.total || 0);
      
      if (data.deposits && data.deposits.length > 0) {
        console.log('\n💰 Deposit Details:');
        data.deposits.forEach((deposit, index) => {
          console.log(`   ${index + 1}. ID: ${deposit.id || 'N/A'}`);
          console.log(`      User: ${deposit.user || deposit.username || 'N/A'}`);
          console.log(`      Amount: ${deposit.amount || 'N/A'}`);
          console.log(`      Currency: ${deposit.currency || 'N/A'}`);
          console.log(`      Status: ${deposit.status || 'N/A'}`);
          console.log(`      Date: ${deposit.date || deposit.timestamp || 'N/A'}`);
          console.log('      ---');
        });
      }
      
      console.log('\n🎯 CONCLUSION:');
      if (data.deposits && data.deposits.length > 0) {
        console.log('✅ API is returning deposit data correctly');
        console.log('❓ Issue is likely in the frontend admin dashboard');
        console.log('💡 Try refreshing the admin dashboard page');
        console.log('💡 Check browser console for JavaScript errors');
        console.log('💡 Try hard refresh (Ctrl+F5) to clear cache');
      } else {
        console.log('❌ API is not returning deposit data');
        console.log('🔧 This indicates a backend issue');
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', response.status, response.statusText);
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testAdminDashboardAPI().catch(console.error);
