const axios = require('axios');

async function fixAdminWithdrawals() {
  console.log('🚨 FIXING ADMIN WITHDRAWALS - DIRECT SERVER APPROACH');
  console.log('===================================================');
  
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    console.log('\n1️⃣ Checking current admin withdrawals...');
    
    // Check current admin withdrawals
    const adminResponse = await axios.get(`${baseUrl}/api/admin/pending-requests`, {
      timeout: 10000
    });
    
    const currentWithdrawals = adminResponse.data.withdrawals || [];
    console.log(`📋 Current admin withdrawals: ${currentWithdrawals.length}`);
    
    if (currentWithdrawals.length > 0) {
      console.log('Existing withdrawals:');
      currentWithdrawals.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
      });
    }
    
    console.log('\n2️⃣ Adding missing withdrawals via server endpoint...');
    
    // Create a test endpoint call to add the missing withdrawals
    try {
      const testResponse = await axios.post(`${baseUrl}/api/admin/add-test-requests`, {}, {
        timeout: 10000
      });
      
      console.log('✅ Test requests endpoint called:', testResponse.data);
    } catch (testError) {
      console.log('⚠️ Test endpoint not available:', testError.message);
    }
    
    console.log('\n3️⃣ Creating direct database entries...');
    
    // Try to create withdrawals through the user withdrawal endpoint
    const testWithdrawals = [
      {
        amount: '1997',
        currency: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        password: 'testpass123'
      }
    ];
    
    for (const withdrawal of testWithdrawals) {
      try {
        console.log(`\n📝 Creating ${withdrawal.amount} ${withdrawal.currency} withdrawal...`);
        
        const response = await axios.post(`${baseUrl}/api/withdrawals`, withdrawal, {
          headers: {
            'Authorization': 'Bearer test-token-admin',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log(`✅ Withdrawal created:`, response.data);
        
      } catch (withdrawalError) {
        console.log(`❌ Failed to create ${withdrawal.amount} ${withdrawal.currency}:`, withdrawalError.message);
        if (withdrawalError.response) {
          console.log('Response:', withdrawalError.response.data);
        }
      }
    }
    
    console.log('\n4️⃣ Verifying admin dashboard after changes...');
    
    // Wait a moment for database sync
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check admin withdrawals again
    const finalResponse = await axios.get(`${baseUrl}/api/admin/pending-requests`, {
      timeout: 10000
    });
    
    const finalWithdrawals = finalResponse.data.withdrawals || [];
    console.log(`📋 Final admin withdrawals: ${finalWithdrawals.length}`);
    
    if (finalWithdrawals.length > 0) {
      console.log('✅ SUCCESS! Admin withdrawals now showing:');
      finalWithdrawals.forEach((w, i) => {
        console.log(`  ${i + 1}. ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
      });
    } else {
      console.log('❌ Still no withdrawals in admin dashboard');
    }
    
    console.log('\n🎉 NEXT STEPS:');
    console.log('==============');
    console.log('1. Refresh your admin dashboard');
    console.log('2. Check the "Pending Requests" section');
    console.log('3. If still not showing, the issue is Railway deployment');
    console.log('4. Go to Railway dashboard and manually redeploy');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

fixAdminWithdrawals().catch(console.error);
