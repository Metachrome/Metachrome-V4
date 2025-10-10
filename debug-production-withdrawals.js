const postgres = require('postgres');

async function debugProductionWithdrawals() {
  console.log('🔍 DEBUGGING PRODUCTION WITHDRAWALS...\n');
  
  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
  
  try {
    const client = postgres(DATABASE_URL);
    
    // 1. Check if withdrawals table exists
    console.log('1️⃣ Checking if withdrawals table exists...');
    
    const tableExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'withdrawals'
      )
    `;
    
    console.log('📋 Withdrawals table exists:', tableExists[0].exists);
    
    if (!tableExists[0].exists) {
      console.log('❌ PROBLEM: Withdrawals table does not exist in database!');
      console.log('💡 SOLUTION: Need to create withdrawals table first');
      await client.end();
      return;
    }
    
    // 2. Check table structure
    console.log('\n2️⃣ Checking withdrawals table structure...');
    
    const columns = await client`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'withdrawals' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Table columns:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // 3. Check all withdrawals in database
    console.log('\n3️⃣ Checking all withdrawals in database...');
    
    const allWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at, wallet_address
      FROM withdrawals 
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    console.log(`💸 Total withdrawals in database: ${allWithdrawals.length}`);
    
    if (allWithdrawals.length > 0) {
      console.log('\n📋 Recent withdrawals:');
      allWithdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}`);
        console.log(`      User: ${w.username} (${w.user_id})`);
        console.log(`      Amount: ${w.amount} ${w.currency}`);
        console.log(`      Status: ${w.status}`);
        console.log(`      Address: ${w.wallet_address}`);
        console.log(`      Created: ${w.created_at}`);
        console.log('');
      });
    } else {
      console.log('📋 No withdrawals found in database');
    }
    
    // 4. Check pending withdrawals specifically
    console.log('\n4️⃣ Checking pending withdrawals...');
    
    const pendingWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    
    console.log(`⏳ Pending withdrawals: ${pendingWithdrawals.length}`);
    
    if (pendingWithdrawals.length > 0) {
      console.log('\n📋 Pending withdrawals:');
      pendingWithdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
      });
    }
    
    // 5. Check recent withdrawals (last 24 hours)
    console.log('\n5️⃣ Checking recent withdrawals (last 24 hours)...');
    
    const recentWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `;
    
    console.log(`🕐 Recent withdrawals (24h): ${recentWithdrawals.length}`);
    
    if (recentWithdrawals.length > 0) {
      console.log('\n📋 Recent withdrawals:');
      recentWithdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
      });
    }
    
    // 6. Check for angela.soenoko specifically
    console.log('\n6️⃣ Checking angela.soenoko withdrawals...');
    
    const angelaWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE username = 'angela.soenoko'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log(`👤 Angela withdrawals: ${angelaWithdrawals.length}`);
    
    if (angelaWithdrawals.length > 0) {
      console.log('\n📋 Angela withdrawals:');
      angelaWithdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} (${w.status}) - ${w.created_at}`);
      });
    }
    
    await client.end();
    
    // 7. Summary
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Withdrawals table exists: ${tableExists[0].exists}`);
    console.log(`📊 Total withdrawals: ${allWithdrawals.length}`);
    console.log(`⏳ Pending withdrawals: ${pendingWithdrawals.length}`);
    console.log(`🕐 Recent withdrawals (24h): ${recentWithdrawals.length}`);
    console.log(`👤 Angela withdrawals: ${angelaWithdrawals.length}`);
    
    if (pendingWithdrawals.length === 0) {
      console.log('\n💡 DIAGNOSIS: No pending withdrawals in database');
      console.log('   This explains why admin dashboard shows "No pending withdrawals"');
      console.log('   Either:');
      console.log('   1. No withdrawal requests have been made recently');
      console.log('   2. Withdrawal requests are not being saved to database');
      console.log('   3. Production server has not been updated with the database sync fix');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
debugProductionWithdrawals();
