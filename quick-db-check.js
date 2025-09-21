const postgres = require('postgres');

async function quickDbCheck() {
  try {
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    console.log('🔍 Quick database check...');
    
    // Check pending withdrawals
    const pending = await client`
      SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'
    `;
    
    console.log(`📋 Pending withdrawals: ${pending[0].count}`);
    
    // Check all angela withdrawals
    const angela = await client`
      SELECT id, amount, currency, status FROM withdrawals 
      WHERE user_id = 'user-angela-1758195715'
      ORDER BY created_at DESC
    `;
    
    console.log('💸 Angela withdrawals:');
    angela.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.status}`);
    });
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickDbCheck();
