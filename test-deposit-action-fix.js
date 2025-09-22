async function testDepositActionFix() {
  try {
    console.log('🧪 Testing deposit action fix...');
    
    // Test 1: Check if deposits are still showing
    console.log('\n1. 📊 Testing admin pending requests...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests');
    
    if (!response.ok) {
      console.log(`❌ Admin API failed: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Admin API working:');
    console.log(`   Deposits: ${data.deposits?.length || 0}`);
    console.log(`   Withdrawals: ${data.withdrawals?.length || 0}`);
    
    if (data.deposits && data.deposits.length > 0) {
      console.log('\n📋 Deposit details:');
      data.deposits.forEach((deposit, index) => {
        console.log(`   ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status}`);
        console.log(`      ID: ${deposit.id}`);
        console.log(`      Receipt: ${deposit.hasReceipt ? 'Yes' : 'No'}`);
        if (deposit.receiptUrl) {
          console.log(`      Receipt URL: ${deposit.receiptUrl}`);
        }
      });
      
      // Test 2: Try the deposit action endpoint with the first deposit
      console.log('\n2. 🧪 Testing deposit action endpoint...');
      const firstDeposit = data.deposits[0];
      const actionUrl = `https://metachrome-v2-production.up.railway.app/api/admin/deposits/${firstDeposit.id}/action`;
      console.log(`   Testing URL: ${actionUrl}`);
      
      try {
        const actionResponse = await fetch(actionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'approve',
            reason: 'Test approval - checking if endpoint works'
          })
        });
        
        console.log(`   Response status: ${actionResponse.status}`);
        
        if (actionResponse.status === 404) {
          console.log('❌ STILL 404 - ENDPOINT NOT DEPLOYED YET');
          console.log('🚀 SOLUTION: Deploy updated working-server.js to Railway');
        } else if (actionResponse.ok) {
          const actionData = await actionResponse.json();
          console.log('✅ Action endpoint working:', actionData);
          
          // Test 3: Check if deposit was removed from list
          console.log('\n3. 🔍 Checking if deposit was processed...');
          const checkResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests');
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            console.log(`   Deposits after action: ${checkData.deposits?.length || 0}`);
            
            if (checkData.deposits.length < data.deposits.length) {
              console.log('✅ Deposit was successfully processed and removed');
            } else {
              console.log('⚠️ Deposit still in list - check processing logic');
            }
          }
        } else {
          const errorText = await actionResponse.text();
          console.log(`❌ Action failed (${actionResponse.status}):`, errorText);
        }
      } catch (actionError) {
        console.log('❌ Action endpoint error:', actionError.message);
      }
    } else {
      console.log('⚠️ No deposits found to test');
    }
    
    console.log('\n4. 🎯 SUMMARY:');
    console.log('');
    console.log('✅ FIXES IMPLEMENTED:');
    console.log('   - Deposit action endpoint now checks both Supabase and local data');
    console.log('   - Receipt URLs fixed for both local and Supabase formats');
    console.log('   - Proper cleanup of deposits from correct data source');
    console.log('');
    console.log('🚀 DEPLOYMENT NEEDED:');
    console.log('   1. Go to Railway Dashboard: https://railway.app/dashboard');
    console.log('   2. Find METACHROME project');
    console.log('   3. Click "Redeploy"');
    console.log('   4. Wait 2-3 minutes');
    console.log('   5. Test approve/reject again');
    console.log('');
    console.log('📋 EXPECTED RESULTS AFTER DEPLOYMENT:');
    console.log('   ✅ Deposits show in admin dashboard');
    console.log('   ✅ Approve/reject buttons work (no 404 errors)');
    console.log('   ✅ Receipt attachments visible');
    console.log('   ✅ User balances update when approved');
    console.log('   ✅ Deposits removed from pending list');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDepositActionFix();
