const postgres = require('postgres');

async function emergencyWithdrawalFix() {
  try {
    console.log('🚨 EMERGENCY WITHDRAWAL FIX: Starting...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // 1. Check current withdrawal status
    console.log('\n🔍 Checking current withdrawal status...');
    
    const currentWithdrawals = await client`
      SELECT id, user_id, amount, currency, status, admin_notes, created_at, updated_at
      FROM withdrawals 
      WHERE user_id = 'user-angela-1758195715'
      ORDER BY created_at DESC
    `;
    
    console.log('💸 Current Withdrawals:');
    currentWithdrawals.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status}`);
      if (w.admin_notes) console.log(`     Notes: ${w.admin_notes}`);
    });
    
    // 2. Force update the pending withdrawal to approved
    console.log('\n🔧 Force updating pending withdrawal...');
    
    const forceUpdate = await client`
      UPDATE withdrawals 
      SET 
        status = 'approved',
        admin_notes = 'Emergency fix - Force approved by system admin',
        processed_at = ${new Date().toISOString()},
        updated_at = ${new Date().toISOString()}
      WHERE id = 'with-angela-001'
      RETURNING *
    `;
    
    if (forceUpdate.length > 0) {
      console.log('✅ Withdrawal force updated:', forceUpdate[0]);
    } else {
      console.log('❌ Failed to update withdrawal');
    }
    
    // 3. Test the admin API endpoint directly
    console.log('\n🧪 Testing admin API endpoint...');
    
    try {
      const testResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/withdrawals/with-angela-001/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer superadmin-token-123'
        },
        body: JSON.stringify({
          action: 'approve',
          reason: 'Emergency test - Force approval'
        })
      });
      
      console.log('📡 API Response Status:', testResponse.status);
      
      if (testResponse.ok) {
        const responseData = await testResponse.json();
        console.log('✅ API Success:', responseData);
      } else {
        const errorText = await testResponse.text();
        console.log('❌ API Error:', errorText);
      }
    } catch (apiError) {
      console.log('❌ API Request Failed:', apiError.message);
    }
    
    // 4. Check if the admin dashboard is reading from the right place
    console.log('\n🔍 Testing admin pending requests endpoint...');
    
    try {
      const pendingResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests', {
        headers: {
          'Authorization': 'Bearer superadmin-token-123'
        }
      });
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        console.log('📋 Pending Requests Response:', pendingData);
        
        if (pendingData.withdrawals) {
          console.log('💸 Pending Withdrawals from API:', pendingData.withdrawals.length);
          pendingData.withdrawals.forEach((w, i) => {
            console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status}`);
          });
        }
      } else {
        console.log('❌ Pending requests API failed:', pendingResponse.status);
      }
    } catch (pendingError) {
      console.log('❌ Pending requests API error:', pendingError.message);
    }
    
    // 5. Final verification
    console.log('\n🔍 Final verification...');
    
    const finalCheck = await client`
      SELECT id, user_id, amount, currency, status, admin_notes, updated_at
      FROM withdrawals 
      WHERE user_id = 'user-angela-1758195715'
      ORDER BY created_at DESC
    `;
    
    console.log('💸 Final Withdrawal Status:');
    finalCheck.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status}`);
      console.log(`     Updated: ${w.updated_at}`);
    });
    
    // 6. Summary
    const pendingCount = finalCheck.filter(w => w.status === 'pending').length;
    const approvedCount = finalCheck.filter(w => w.status === 'approved').length;
    
    console.log('\n🎉 EMERGENCY FIX SUMMARY:');
    console.log(`✅ Total Withdrawals: ${finalCheck.length}`);
    console.log(`⏳ Pending: ${pendingCount}`);
    console.log(`✅ Approved: ${approvedCount}`);
    
    if (pendingCount === 0) {
      console.log('\n🎉 SUCCESS! No pending withdrawals remaining!');
      console.log('📱 The admin dashboard should now show all withdrawals as approved!');
      console.log('🔄 Try refreshing the admin dashboard page.');
    } else {
      console.log('\n⚠️ Still have pending withdrawals. The API endpoint may need deployment.');
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Emergency fix error:', error);
  }
}

emergencyWithdrawalFix();
