const postgres = require('postgres');

async function testWithdrawalSync() {
  try {
    console.log('🧪 Testing withdrawal status sync...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // 1. Check current withdrawal statuses
    console.log('\n🧪 Test 1: Current Withdrawal Statuses');
    const withdrawals = await client`
      SELECT id, user_id, amount, currency, status, admin_notes, created_at, updated_at
      FROM withdrawals 
      WHERE user_id = 'user-angela-1758195715'
      ORDER BY created_at DESC
    `;
    
    console.log('💸 Current Withdrawals:');
    withdrawals.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status} (${w.created_at.toISOString().split('T')[0]})`);
      if (w.admin_notes) console.log(`     Notes: ${w.admin_notes}`);
    });
    
    // 2. Test API endpoint directly
    console.log('\n🧪 Test 2: Testing API Endpoint');
    try {
      const response = await fetch('https://metachrome-v2-production.up.railway.app/api/users/user-angela-1758195715/withdrawals', {
        headers: {
          'Authorization': 'Bearer user-session-user-angela-1758195715'
        }
      });
      
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API Response:', apiData.length, 'withdrawals');
        apiData.forEach((w, i) => {
          console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status}`);
        });
      } else {
        console.log('❌ API Error:', response.status, response.statusText);
      }
    } catch (apiError) {
      console.error('❌ API Request Failed:', apiError.message);
    }
    
    // 3. Test admin withdrawal action endpoint
    console.log('\n🧪 Test 3: Testing Admin Action Endpoint');
    
    // First, let's update one withdrawal to test the sync
    const testWithdrawal = withdrawals[0];
    if (testWithdrawal) {
      console.log('🔧 Testing admin action on withdrawal:', testWithdrawal.id);
      
      try {
        const actionResponse = await fetch(`https://metachrome-v2-production.up.railway.app/api/admin/withdrawals/${testWithdrawal.id}/action`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer superadmin-token-123'
          },
          body: JSON.stringify({
            action: 'approve',
            reason: 'Test approval for sync verification'
          })
        });
        
        if (actionResponse.ok) {
          const actionResult = await actionResponse.json();
          console.log('✅ Admin Action Success:', actionResult.message);
          
          // Check if the status was updated in database
          const updatedWithdrawal = await client`
            SELECT id, status, admin_notes, updated_at
            FROM withdrawals 
            WHERE id = ${testWithdrawal.id}
          `;
          
          if (updatedWithdrawal.length > 0) {
            console.log('✅ Database Updated:', updatedWithdrawal[0]);
          } else {
            console.log('❌ Database not updated');
          }
          
        } else {
          console.log('❌ Admin Action Failed:', actionResponse.status, actionResponse.statusText);
        }
      } catch (actionError) {
        console.error('❌ Admin Action Error:', actionError.message);
      }
    }
    
    // 4. Summary
    console.log('\n🎉 WITHDRAWAL SYNC TEST SUMMARY:');
    console.log('1. Database Withdrawals:', withdrawals.length > 0 ? `✅ ${withdrawals.length} records` : '❌ No records');
    console.log('2. API Endpoint:', 'Testing completed');
    console.log('3. Admin Actions:', 'Testing completed');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error testing withdrawal sync:', error);
  }
}

testWithdrawalSync();
