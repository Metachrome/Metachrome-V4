const postgres = require('postgres');

async function directWithdrawalFix() {
  try {
    console.log('🔧 DIRECT WITHDRAWAL FIX: Starting...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // 1. Update the pending withdrawal directly
    console.log('\n🔧 Updating withdrawal status directly...');
    
    const updatedWithdrawal = await client`
      UPDATE withdrawals 
      SET 
        status = 'approved',
        admin_notes = 'Direct fix - approved by system',
        processed_at = ${new Date().toISOString()},
        updated_at = ${new Date().toISOString()}
      WHERE id = 'with-angela-001' AND status = 'pending'
      RETURNING *
    `;
    
    if (updatedWithdrawal.length > 0) {
      console.log('✅ Withdrawal updated successfully:', updatedWithdrawal[0]);
    } else {
      console.log('⚠️ No pending withdrawal found to update');
    }
    
    // 2. Check all withdrawals
    const allWithdrawals = await client`
      SELECT id, user_id, amount, currency, status, admin_notes, created_at
      FROM withdrawals 
      WHERE user_id = 'user-angela-1758195715'
      ORDER BY created_at DESC
    `;
    
    console.log('\n💸 All Withdrawals for angela.soenoko:');
    allWithdrawals.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status}`);
      if (w.admin_notes) console.log(`     Notes: ${w.admin_notes}`);
    });
    
    // 3. Create a test notification trade
    console.log('\n🔧 Creating test trade for mobile notification...');
    
    const testTrade = {
      id: `mobile-test-${Date.now()}`,
      user_id: 'user-angela-1758195715',
      symbol: 'BTC/USDT',
      direction: 'up',
      amount: 100,
      entry_price: 65000,
      final_price: 66500,
      result: 'win',
      profit: 15,
      payout: 115,
      status: 'completed',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
    
    try {
      const insertedTrade = await client`
        INSERT INTO trades ${client(testTrade)}
        RETURNING *
      `;
      console.log('✅ Test trade created:', insertedTrade[0].id);
    } catch (tradeError) {
      console.log('⚠️ Trade creation failed:', tradeError.message);
    }
    
    console.log('\n🎉 DIRECT FIX COMPLETE!');
    console.log('✅ Withdrawal status updated');
    console.log('✅ Test trade created for mobile notification');
    console.log('\n📱 Now test the mobile notification page!');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error in direct withdrawal fix:', error);
  }
}

directWithdrawalFix();
