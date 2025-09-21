// Test Admin API to verify the fix
const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    console.log('🧪 TESTING ADMIN API: Starting...');
    
    const baseUrl = 'https://metachrome-v2-production.up.railway.app';
    
    // 1. Test pending requests endpoint
    console.log('\n📋 Testing pending requests endpoint...');
    
    const pendingResponse = await fetch(`${baseUrl}/api/admin/pending-requests`, {
      headers: {
        'Authorization': 'Bearer superadmin-token-123'
      }
    });
    
    console.log('📡 Pending requests status:', pendingResponse.status);
    
    if (pendingResponse.ok) {
      const pendingData = await pendingResponse.json();
      console.log('✅ Pending requests response:', JSON.stringify(pendingData, null, 2));
      
      console.log('\n📊 SUMMARY:');
      console.log(`💸 Pending Withdrawals: ${pendingData.withdrawals ? pendingData.withdrawals.length : 0}`);
      console.log(`🏦 Pending Deposits: ${pendingData.deposits ? pendingData.deposits.length : 0}`);
      console.log(`📋 Total Pending: ${pendingData.total || 0}`);
      
      if (pendingData.withdrawals && pendingData.withdrawals.length > 0) {
        console.log('\n💸 Withdrawal Details:');
        pendingData.withdrawals.forEach((w, i) => {
          console.log(`  ${i+1}. ID: ${w.id}, Amount: ${w.amount} ${w.currency}, Status: ${w.status}`);
        });
      }
      
      if (pendingData.deposits && pendingData.deposits.length > 0) {
        console.log('\n🏦 Deposit Details:');
        pendingData.deposits.forEach((d, i) => {
          console.log(`  ${i+1}. ID: ${d.id}, Amount: ${d.amount} ${d.currency}, Status: ${d.status}`);
        });
      }
      
    } else {
      const errorText = await pendingResponse.text();
      console.log('❌ Pending requests error:', errorText);
    }
    
    // 2. Test withdrawal action endpoint
    console.log('\n💸 Testing withdrawal action endpoint...');
    
    const actionResponse = await fetch(`${baseUrl}/api/admin/withdrawals/with-angela-001/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer superadmin-token-123'
      },
      body: JSON.stringify({
        action: 'approve',
        reason: 'API test - Force approval'
      })
    });
    
    console.log('📡 Withdrawal action status:', actionResponse.status);
    
    if (actionResponse.ok) {
      const actionData = await actionResponse.json();
      console.log('✅ Withdrawal action response:', JSON.stringify(actionData, null, 2));
    } else {
      const errorText = await actionResponse.text();
      console.log('❌ Withdrawal action error:', errorText);
    }
    
    // 3. Test again to see if pending requests changed
    console.log('\n🔄 Re-testing pending requests after action...');
    
    const pendingResponse2 = await fetch(`${baseUrl}/api/admin/pending-requests`, {
      headers: {
        'Authorization': 'Bearer superadmin-token-123'
      }
    });
    
    if (pendingResponse2.ok) {
      const pendingData2 = await pendingResponse2.json();
      console.log('✅ Updated pending requests:', JSON.stringify(pendingData2, null, 2));
      
      console.log('\n📊 UPDATED SUMMARY:');
      console.log(`💸 Pending Withdrawals: ${pendingData2.withdrawals ? pendingData2.withdrawals.length : 0}`);
      console.log(`🏦 Pending Deposits: ${pendingData2.deposits ? pendingData2.deposits.length : 0}`);
      console.log(`📋 Total Pending: ${pendingData2.total || 0}`);
      
    } else {
      console.log('❌ Updated pending requests failed:', pendingResponse2.status);
    }
    
    console.log('\n🎉 API TEST COMPLETE!');
    
  } catch (error) {
    console.error('❌ API test error:', error);
  }
}

testAdminAPI();
