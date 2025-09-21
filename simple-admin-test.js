// Simple Admin API Test using curl commands
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testAdminAPI() {
  try {
    console.log('🧪 SIMPLE ADMIN API TEST: Starting...');
    
    const baseUrl = 'https://metachrome-v2-production.up.railway.app';
    
    // 1. Test pending requests endpoint
    console.log('\n📋 Testing pending requests endpoint...');
    
    const pendingCmd = `curl -s -H "Authorization: Bearer superadmin-token-123" "${baseUrl}/api/admin/pending-requests"`;
    
    try {
      const { stdout: pendingResult } = await execPromise(pendingCmd);
      console.log('✅ Pending requests response:', pendingResult);
      
      try {
        const pendingData = JSON.parse(pendingResult);
        console.log('\n📊 PARSED SUMMARY:');
        console.log(`💸 Pending Withdrawals: ${pendingData.withdrawals ? pendingData.withdrawals.length : 0}`);
        console.log(`🏦 Pending Deposits: ${pendingData.deposits ? pendingData.deposits.length : 0}`);
        console.log(`📋 Total Pending: ${pendingData.total || 0}`);
        
        if (pendingData.withdrawals && pendingData.withdrawals.length > 0) {
          console.log('\n💸 Withdrawal Details:');
          pendingData.withdrawals.forEach((w, i) => {
            console.log(`  ${i+1}. ID: ${w.id}, Amount: ${w.amount} ${w.currency}, Status: ${w.status}`);
          });
        } else {
          console.log('✅ No pending withdrawals found - this is good!');
        }
        
      } catch (parseError) {
        console.log('⚠️ Could not parse JSON response');
      }
      
    } catch (curlError) {
      console.log('❌ Curl command failed:', curlError.message);
    }
    
    // 2. Test withdrawal action endpoint
    console.log('\n💸 Testing withdrawal action endpoint...');
    
    const actionCmd = `curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer superadmin-token-123" -d "{\\"action\\":\\"approve\\",\\"reason\\":\\"API test\\"}" "${baseUrl}/api/admin/withdrawals/with-angela-001/action"`;
    
    try {
      const { stdout: actionResult } = await execPromise(actionCmd);
      console.log('✅ Withdrawal action response:', actionResult);
    } catch (actionError) {
      console.log('❌ Withdrawal action failed:', actionError.message);
    }
    
    console.log('\n🎉 SIMPLE API TEST COMPLETE!');
    console.log('\n📱 NEXT STEPS:');
    console.log('1. Refresh your admin dashboard page');
    console.log('2. Check if the withdrawal status has changed');
    console.log('3. If still showing pending, the server may need redeployment');
    
  } catch (error) {
    console.error('❌ Simple API test error:', error);
  }
}

testAdminAPI();
