import postgres from 'postgres';

async function cleanupDemoData() {
  console.log('🧹 Cleaning up demo data from Supabase...');

  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

  try {
    const client = postgres(DATABASE_URL);

    console.log('✅ Connected to Supabase');

    // Remove all existing balances (will be recreated with real data)
    console.log('💰 Removing all existing balances...');
    await client`DELETE FROM balances`;
    console.log('🗑️ All balances deleted');

    // Remove all existing trades (will be recreated with real trading activity)
    console.log('📈 Removing all existing trades...');
    await client`DELETE FROM trades`;
    console.log('🗑️ All trades deleted');

    // Get current data counts
    const userCount = await client`SELECT COUNT(*) as count FROM users`;
    const balanceCount = await client`SELECT COUNT(*) as count FROM balances`;
    const tradeCount = await client`SELECT COUNT(*) as count FROM trades`;

    console.log('');
    console.log('🎯 Cleanup Complete - Production Data Only:');
    console.log(`👥 Users: ${userCount[0].count}`);
    console.log(`💰 Balances: ${balanceCount[0].count}`);
    console.log(`📈 Trades: ${tradeCount[0].count}`);
    console.log('');
    console.log('✅ Database now contains only production-ready data!');
    console.log('🔐 Admin Login: admin / admin123');

    await client.end();

  } catch (error) {
    console.error('❌ Error cleaning up demo data:', error);
  }
}

cleanupDemoData();
