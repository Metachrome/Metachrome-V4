import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function createDepositsTable() {
  try {
    console.log('🗄️ Creating deposits table in Supabase...');
    
    const client = postgres(DATABASE_URL);
    
    console.log('🔗 Connected to Supabase');
    
    // First, check what tables exist
    console.log('📋 Checking existing tables...');
    const existingTables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('📊 Existing tables:');
    existingTables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check if deposits table exists
    const depositsExists = existingTables.some(table => table.table_name === 'deposits');
    
    if (depositsExists) {
      console.log('✅ Deposits table already exists');
      
      // Check structure
      const columns = await client`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'deposits' 
        ORDER BY ordinal_position
      `;
      
      console.log('📊 Deposits table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
    } else {
      console.log('❌ Deposits table missing - creating now...');
      
      // Create deposits table
      await client`
        CREATE TABLE deposits (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT NOT NULL,
          username TEXT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USDT',
          network TEXT NOT NULL,
          wallet_address TEXT NOT NULL,
          transaction_hash TEXT,
          receipt_url TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          approved_at TIMESTAMP,
          approved_by TEXT
        )
      `;
      
      console.log('✅ Deposits table created successfully!');
    }
    
    // Also check/create withdrawals table
    const withdrawalsExists = existingTables.some(table => table.table_name === 'withdrawals');
    
    if (!withdrawalsExists) {
      console.log('❌ Withdrawals table missing - creating now...');
      
      await client`
        CREATE TABLE withdrawals (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          user_id TEXT NOT NULL,
          username TEXT NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USDT',
          network TEXT NOT NULL,
          wallet_address TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          admin_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          approved_at TIMESTAMP,
          approved_by TEXT
        )
      `;
      
      console.log('✅ Withdrawals table created successfully!');
    } else {
      console.log('✅ Withdrawals table already exists');
    }
    
    // Test inserting a sample deposit to verify everything works
    console.log('🧪 Testing deposit insertion...');
    
    const testDeposit = await client`
      INSERT INTO deposits (user_id, username, amount, currency, network, wallet_address, status)
      VALUES ('test-user-id', 'testuser', 100.00, 'USDT', 'TRC20', '0x1234567890abcdef', 'pending')
      RETURNING *
    `;
    
    console.log('✅ Test deposit created:', testDeposit[0]);
    
    // Clean up test deposit
    await client`DELETE FROM deposits WHERE id = ${testDeposit[0].id}`;
    console.log('🧹 Test deposit cleaned up');
    
    // Check final table count
    const finalTables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Final database tables:');
    finalTables.forEach(table => {
      console.log(`   ✅ ${table.table_name}`);
    });
    
    console.log('\n🎉 DATABASE SETUP COMPLETE!');
    console.log('');
    console.log('✅ Deposits table ready');
    console.log('✅ Withdrawals table ready');
    console.log('✅ Real-time sync will now work');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Deploy updated working-server.js to Railway');
    console.log('2. Test deposit creation');
    console.log('3. Verify admin dashboard shows pending deposits');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error setting up deposits table:', error);
    process.exit(1);
  }
}

createDepositsTable();
