const postgres = require('postgres');

// Use direct PostgreSQL connection instead of Supabase client for DDL operations
const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function fixWithdrawalsTable() {
  try {
    console.log('🔧 Fixing withdrawals table schema with direct PostgreSQL connection...');
    
    const client = postgres(DATABASE_URL);
    
    // 1. Check current table structure
    console.log('1️⃣ Checking current table structure...');
    
    const columns = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'withdrawals' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Current table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // 2. Add missing columns
    console.log('\n2️⃣ Adding missing columns...');
    
    // Check if user_balance column exists
    const hasUserBalance = columns.some(col => col.column_name === 'user_balance');
    if (!hasUserBalance) {
      console.log('Adding user_balance column...');
      await client`
        ALTER TABLE withdrawals 
        ADD COLUMN user_balance DECIMAL(15,2)
      `;
      console.log('✅ user_balance column added');
    } else {
      console.log('✅ user_balance column already exists');
    }
    
    // Check if wallet_address column exists
    const hasWalletAddress = columns.some(col => col.column_name === 'wallet_address');
    if (!hasWalletAddress) {
      console.log('Adding wallet_address column...');
      await client`
        ALTER TABLE withdrawals 
        ADD COLUMN wallet_address TEXT
      `;
      console.log('✅ wallet_address column added');
      
      // Copy data from address to wallet_address if address column exists
      const hasAddress = columns.some(col => col.column_name === 'address');
      if (hasAddress) {
        console.log('Copying data from address to wallet_address...');
        await client`
          UPDATE withdrawals 
          SET wallet_address = address 
          WHERE wallet_address IS NULL
        `;
        console.log('✅ Data copied from address to wallet_address');
      }
    } else {
      console.log('✅ wallet_address column already exists');
    }
    
    // 3. Test insertion with the fixed schema
    console.log('\n3️⃣ Testing insertion with fixed schema...');
    
    const testId = `test-withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await client`
      INSERT INTO withdrawals (
        id, user_id, username, amount, currency, wallet_address, 
        status, user_balance, created_at, updated_at
      ) VALUES (
        ${testId}, 
        'user-angela-1758195715', 
        'angela.soenoko', 
        25.00, 
        'USDT', 
        'test-address-fixed',
        'pending', 
        102135.48, 
        NOW(), 
        NOW()
      )
    `;
    
    console.log('✅ Test insertion successful!');
    
    // 4. Verify it appears in admin query
    console.log('4️⃣ Verifying admin query...');
    
    const pendingWithdrawals = await client`
      SELECT * FROM withdrawals 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 Found ${pendingWithdrawals.length} pending withdrawals:`);
    pendingWithdrawals.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
    });
    
    const ourWithdrawal = pendingWithdrawals.find(w => w.id === testId);
    if (ourWithdrawal) {
      console.log('✅ SUCCESS: Test withdrawal appears in query!');
    } else {
      console.log('❌ Test withdrawal not found in query');
    }
    
    // Clean up test record
    console.log('🧹 Cleaning up test record...');
    await client`DELETE FROM withdrawals WHERE id = ${testId}`;
    console.log('✅ Test record cleaned up');
    
    await client.end();
    
    console.log('\n🎉 Withdrawals table fix completed!');
    console.log('💡 The withdrawal submission should now work properly.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixWithdrawalsTable();
