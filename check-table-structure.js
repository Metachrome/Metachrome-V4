const postgres = require('postgres');

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structure...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Check trades table structure
    console.log('\n📊 TRADES TABLE STRUCTURE:');
    const tradesColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'trades'
      ORDER BY ordinal_position
    `;
    
    tradesColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check users table structure
    console.log('\n👤 USERS TABLE STRUCTURE:');
    const usersColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    usersColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check withdrawals table structure
    console.log('\n💸 WITHDRAWALS TABLE STRUCTURE:');
    const withdrawalsColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'withdrawals'
      ORDER BY ordinal_position
    `;
    
    withdrawalsColumns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check sample trade data
    console.log('\n📈 SAMPLE TRADE DATA:');
    const sampleTrades = await client`
      SELECT *
      FROM trades 
      ORDER BY created_at DESC
      LIMIT 3
    `;
    
    sampleTrades.forEach(trade => {
      console.log(`  Trade ${trade.id.substring(0, 8)}: ${trade.result} - Amount: $${trade.amount}`);
      console.log(`    Direction: ${trade.direction}, Status: ${trade.status}`);
      console.log(`    Entry: $${trade.entry_price}, Exit: $${trade.exit_price}`);
    });
    
    // Check current user verification status
    console.log('\n👤 CURRENT USER STATUS:');
    const angelaUser = await client`
      SELECT id, username, verification_status, has_uploaded_documents
      FROM users 
      WHERE username = 'angela.soenoko'
      LIMIT 1
    `;
    
    if (angelaUser.length > 0) {
      console.log(`  User: ${angelaUser[0].username}`);
      console.log(`  Status: ${angelaUser[0].verification_status}`);
      console.log(`  Has Documents: ${angelaUser[0].has_uploaded_documents}`);
    }
    
    await client.end();
    console.log('\n✅ Table structure check completed!');
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error);
  }
}

checkTableStructure();
