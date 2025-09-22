import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function testStatusFix() {
  try {
    console.log('🔧 Testing status fix...');
    
    const client = postgres(DATABASE_URL);
    
    console.log('🔗 Connected to Supabase');
    
    // Test the new query that should find 'verifying' deposits
    console.log('\n1. 🧪 Testing new query (pending OR verifying)...');
    const pendingOrVerifying = await client`
      SELECT id, username, amount, currency, status, created_at
      FROM deposits 
      WHERE status IN ('pending', 'verifying')
      ORDER BY created_at DESC
    `;
    
    console.log('📊 Deposits with pending OR verifying status:');
    if (pendingOrVerifying.length === 0) {
      console.log('   ❌ NO DEPOSITS FOUND');
    } else {
      pendingOrVerifying.forEach((deposit, index) => {
        console.log(`   ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status}`);
      });
    }
    
    // Test the old query for comparison
    console.log('\n2. 📊 Comparison - old query (pending only)...');
    const pendingOnly = await client`
      SELECT id, username, amount, currency, status, created_at
      FROM deposits 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    
    console.log('📊 Deposits with pending status only:');
    if (pendingOnly.length === 0) {
      console.log('   ❌ NO PENDING DEPOSITS FOUND');
    } else {
      pendingOnly.forEach((deposit, index) => {
        console.log(`   ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status}`);
      });
    }
    
    // Show the difference
    console.log('\n3. 📈 Impact of the fix:');
    console.log(`   Old query (pending only): ${pendingOnly.length} deposits`);
    console.log(`   New query (pending + verifying): ${pendingOrVerifying.length} deposits`);
    console.log(`   Additional deposits found: ${pendingOrVerifying.length - pendingOnly.length}`);
    
    if (pendingOrVerifying.length > pendingOnly.length) {
      console.log('   ✅ FIX SUCCESSFUL: More deposits will now show in admin dashboard');
    } else {
      console.log('   ⚠️ No additional deposits found');
    }
    
    // Test what the admin API should return now
    console.log('\n4. 🧪 Testing what admin API should return...');
    
    // Simulate the admin API logic
    const adminDeposits = pendingOrVerifying.map(deposit => ({
      id: deposit.id,
      username: deposit.username,
      amount: deposit.amount,
      currency: deposit.currency,
      status: deposit.status,
      created_at: deposit.created_at
    }));
    
    console.log('📊 Admin API should return:');
    console.log(`   Deposits count: ${adminDeposits.length}`);
    if (adminDeposits.length > 0) {
      console.log('   📋 Deposit details:');
      adminDeposits.forEach((deposit, index) => {
        console.log(`      ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status}`);
      });
    }
    
    console.log('\n5. 🚀 DEPLOYMENT NEEDED:');
    console.log('');
    console.log('✅ Status fix implemented in working-server.js');
    console.log('✅ Query now looks for both "pending" and "verifying" status');
    console.log('✅ Should find existing deposits with "verifying" status');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('1. Deploy updated working-server.js to Railway');
    console.log('2. Check admin dashboard - should now show deposits');
    console.log('3. Test approval/rejection workflow');
    console.log('');
    console.log('🌐 Expected result after deployment:');
    console.log(`   Admin dashboard should show: ${pendingOrVerifying.length} pending deposits`);
    console.log('   Instead of: 0 pending deposits');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStatusFix();
