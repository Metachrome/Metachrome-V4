import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function finalDepositsTest() {
  try {
    console.log('🧪 Final deposits table test...');
    
    const client = postgres(DATABASE_URL);
    
    console.log('🔗 Connected to Supabase');
    
    // Fix the ID column to have proper default
    console.log('🔧 Fixing ID column default...');
    try {
      await client`
        ALTER TABLE deposits 
        ALTER COLUMN id SET DEFAULT gen_random_uuid()::text
      `;
      console.log('✅ ID column default fixed');
    } catch (error) {
      console.log('⚠️ ID default already set:', error.message);
    }
    
    // Test inserting a deposit with explicit ID
    console.log('\n🧪 Testing deposit insertion with explicit ID...');
    
    const testId = 'test-' + Date.now();
    const testDeposit = await client`
      INSERT INTO deposits (
        id, user_id, username, amount, currency, network, 
        wallet_address, status
      )
      VALUES (
        ${testId}, 'test-user-id', 'testuser', 100.00, 'USDT', 'TRC20', 
        '0x1234567890abcdef', 'pending'
      )
      RETURNING *
    `;
    
    console.log('✅ Test deposit created successfully:', {
      id: testDeposit[0].id,
      username: testDeposit[0].username,
      amount: testDeposit[0].amount,
      currency: testDeposit[0].currency,
      network: testDeposit[0].network,
      status: testDeposit[0].status
    });
    
    // Test querying deposits (what admin dashboard does)
    console.log('\n🔍 Testing admin query (what dashboard uses)...');
    const pendingDeposits = await client`
      SELECT * FROM deposits 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `;
    
    console.log('📊 Pending deposits found:', pendingDeposits.length);
    if (pendingDeposits.length > 0) {
      console.log('✅ First deposit:', {
        id: pendingDeposits[0].id,
        username: pendingDeposits[0].username,
        amount: pendingDeposits[0].amount,
        status: pendingDeposits[0].status
      });
    }
    
    // Test updating deposit status (approval/rejection)
    console.log('\n🔧 Testing deposit approval...');
    const approvedDeposit = await client`
      UPDATE deposits 
      SET status = 'approved', 
          approved_at = CURRENT_TIMESTAMP,
          approved_by = 'superadmin',
          admin_notes = 'Test approval'
      WHERE id = ${testId}
      RETURNING *
    `;
    
    console.log('✅ Deposit approved:', {
      id: approvedDeposit[0].id,
      status: approvedDeposit[0].status,
      approved_by: approvedDeposit[0].approved_by,
      admin_notes: approvedDeposit[0].admin_notes
    });
    
    // Clean up test deposit
    await client`DELETE FROM deposits WHERE id = ${testId}`;
    console.log('🧹 Test deposit cleaned up');
    
    // Test auto-generated ID
    console.log('\n🧪 Testing auto-generated ID...');
    const autoIdDeposit = await client`
      INSERT INTO deposits (
        user_id, username, amount, currency, network, 
        wallet_address, status
      )
      VALUES (
        'auto-user-id', 'autouser', 50.00, 'USDT', 'ERC20', 
        '0xabcdef1234567890', 'pending'
      )
      RETURNING id, username, amount
    `;
    
    console.log('✅ Auto-ID deposit created:', {
      id: autoIdDeposit[0].id,
      username: autoIdDeposit[0].username,
      amount: autoIdDeposit[0].amount
    });
    
    // Clean up auto-ID test
    await client`DELETE FROM deposits WHERE id = ${autoIdDeposit[0].id}`;
    console.log('🧹 Auto-ID test deposit cleaned up');
    
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('');
    console.log('✅ Deposits table structure complete');
    console.log('✅ ID generation working');
    console.log('✅ Insert operations working');
    console.log('✅ Query operations working');
    console.log('✅ Update operations working');
    console.log('');
    console.log('🚀 READY FOR PRODUCTION!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Deploy updated working-server.js to Railway');
    console.log('2. Test real deposit from user interface');
    console.log('3. Verify admin dashboard shows the deposit');
    console.log('4. Test approval/rejection workflow');
    console.log('');
    console.log('🌐 Production URLs:');
    console.log('   User: https://metachrome-v2-production.up.railway.app');
    console.log('   Admin: https://metachrome-v2-production.up.railway.app/admin/dashboard');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error in final test:', error);
    process.exit(1);
  }
}

finalDepositsTest();
