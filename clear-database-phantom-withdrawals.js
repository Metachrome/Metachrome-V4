const postgres = require('postgres');

async function clearDatabasePhantomWithdrawals() {
  try {
    console.log('🧹 CLEARING DATABASE PHANTOM WITHDRAWALS: Starting...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // 1. Check current pending withdrawals
    console.log('\n📊 Checking current pending withdrawals...');
    
    const currentPending = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Found ${currentPending.length} pending withdrawals:`);
    currentPending.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username || w.user_id} (${w.created_at})`);
    });
    
    // 2. Identify phantom withdrawals (older than 24 hours and still pending)
    console.log('\n🔍 Identifying phantom withdrawals (older than 24 hours)...');
    
    const phantomWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE status = 'pending' 
      AND created_at < NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `;
    
    console.log(`👻 Found ${phantomWithdrawals.length} phantom withdrawals:`);
    phantomWithdrawals.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username || w.user_id} (${w.created_at})`);
    });
    
    // 3. Option to delete phantom withdrawals
    if (phantomWithdrawals.length > 0) {
      console.log('\n🗑️ Deleting phantom withdrawals...');
      
      const deletedPhantoms = await client`
        DELETE FROM withdrawals 
        WHERE status = 'pending' 
        AND created_at < NOW() - INTERVAL '24 hours'
        RETURNING id, amount, currency, username
      `;
      
      console.log(`✅ Deleted ${deletedPhantoms.length} phantom withdrawals:`);
      deletedPhantoms.forEach((w, i) => {
        console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
      });
    } else {
      console.log('✅ No phantom withdrawals found to delete');
    }
    
    // 4. Check for any test/demo withdrawals
    console.log('\n🧪 Checking for test/demo withdrawals...');
    
    const testWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE (
        username LIKE '%test%' OR 
        username LIKE '%demo%' OR 
        user_id LIKE '%test%' OR
        user_id LIKE '%demo%'
      )
      AND status = 'pending'
    `;
    
    if (testWithdrawals.length > 0) {
      console.log(`🧪 Found ${testWithdrawals.length} test withdrawals:`);
      testWithdrawals.forEach((w, i) => {
        console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username || w.user_id}`);
      });
      
      console.log('\n🗑️ Deleting test withdrawals...');
      
      const deletedTest = await client`
        DELETE FROM withdrawals 
        WHERE (
          username LIKE '%test%' OR 
          username LIKE '%demo%' OR 
          user_id LIKE '%test%' OR
          user_id LIKE '%demo%'
        )
        AND status = 'pending'
        RETURNING id, amount, currency, username
      `;
      
      console.log(`✅ Deleted ${deletedTest.length} test withdrawals`);
    } else {
      console.log('✅ No test withdrawals found');
    }
    
    // 5. Final check - remaining pending withdrawals
    console.log('\n📊 Final check - remaining pending withdrawals...');
    
    const finalPending = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Remaining pending withdrawals: ${finalPending.length}`);
    finalPending.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username || w.user_id} (${w.created_at})`);
    });
    
    await client.end();
    
    console.log('\n🎉 DATABASE PHANTOM WITHDRAWAL CLEANUP COMPLETE!');
    console.log('📋 Summary:');
    console.log(`- Deleted phantom withdrawals: ${phantomWithdrawals.length}`);
    console.log(`- Deleted test withdrawals: ${testWithdrawals.length}`);
    console.log(`- Remaining pending withdrawals: ${finalPending.length}`);
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  }
}

// Run the cleanup
clearDatabasePhantomWithdrawals();
