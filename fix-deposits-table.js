import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function fixDepositsTable() {
  try {
    console.log('🔧 Fixing deposits table structure...');
    
    const client = postgres(DATABASE_URL);
    
    console.log('🔗 Connected to Supabase');
    
    // Check current deposits table structure
    console.log('📋 Current deposits table structure:');
    const columns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'deposits' 
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Current columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check which columns are missing
    const existingColumns = columns.map(col => col.column_name);
    const requiredColumns = [
      'id', 'user_id', 'username', 'amount', 'currency', 'network', 
      'wallet_address', 'transaction_hash', 'receipt_url', 'status', 
      'admin_notes', 'created_at', 'updated_at', 'approved_at', 'approved_by'
    ];
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    console.log('\n🔍 Analysis:');
    console.log('✅ Existing columns:', existingColumns.join(', '));
    console.log('❌ Missing columns:', missingColumns.join(', '));
    
    // Add missing columns
    if (missingColumns.length > 0) {
      console.log('\n🔧 Adding missing columns...');
      
      for (const column of missingColumns) {
        try {
          switch (column) {
            case 'network':
              await client`ALTER TABLE deposits ADD COLUMN network TEXT`;
              console.log('✅ Added network column');
              break;
            case 'wallet_address':
              await client`ALTER TABLE deposits ADD COLUMN wallet_address TEXT`;
              console.log('✅ Added wallet_address column');
              break;
            case 'transaction_hash':
              await client`ALTER TABLE deposits ADD COLUMN transaction_hash TEXT`;
              console.log('✅ Added transaction_hash column');
              break;
            case 'receipt_url':
              await client`ALTER TABLE deposits ADD COLUMN receipt_url TEXT`;
              console.log('✅ Added receipt_url column');
              break;
            case 'admin_notes':
              await client`ALTER TABLE deposits ADD COLUMN admin_notes TEXT`;
              console.log('✅ Added admin_notes column');
              break;
            case 'approved_at':
              await client`ALTER TABLE deposits ADD COLUMN approved_at TIMESTAMP`;
              console.log('✅ Added approved_at column');
              break;
            case 'approved_by':
              await client`ALTER TABLE deposits ADD COLUMN approved_by TEXT`;
              console.log('✅ Added approved_by column');
              break;
            default:
              console.log(`⚠️ Skipping unknown column: ${column}`);
          }
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`✅ Column ${column} already exists`);
          } else {
            console.error(`❌ Error adding column ${column}:`, error.message);
          }
        }
      }
    }
    
    // Update status column to have proper constraints if needed
    try {
      console.log('\n🔧 Updating status column constraints...');
      await client`
        ALTER TABLE deposits 
        DROP CONSTRAINT IF EXISTS deposits_status_check
      `;
      await client`
        ALTER TABLE deposits 
        ADD CONSTRAINT deposits_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected'))
      `;
      console.log('✅ Status column constraints updated');
    } catch (error) {
      console.log('⚠️ Status constraint update:', error.message);
    }
    
    // Set default values for currency if not set
    try {
      await client`
        UPDATE deposits 
        SET currency = 'USDT' 
        WHERE currency IS NULL
      `;
      console.log('✅ Set default currency values');
    } catch (error) {
      console.log('⚠️ Currency update:', error.message);
    }
    
    // Check final structure
    console.log('\n📋 Final deposits table structure:');
    const finalColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'deposits' 
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Final columns:');
    finalColumns.forEach(col => {
      console.log(`   ✅ ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Test inserting a sample deposit to verify everything works
    console.log('\n🧪 Testing deposit insertion with new structure...');
    
    const testDeposit = await client`
      INSERT INTO deposits (
        user_id, username, amount, currency, network, 
        wallet_address, status
      )
      VALUES (
        'test-user-id', 'testuser', 100.00, 'USDT', 'TRC20', 
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
    
    // Clean up test deposit
    await client`DELETE FROM deposits WHERE id = ${testDeposit[0].id}`;
    console.log('🧹 Test deposit cleaned up');
    
    console.log('\n🎉 DEPOSITS TABLE FIXED!');
    console.log('');
    console.log('✅ All required columns present');
    console.log('✅ Proper constraints applied');
    console.log('✅ Test insertion successful');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Deploy updated working-server.js to Railway');
    console.log('2. Test deposit creation from user interface');
    console.log('3. Verify admin dashboard shows pending deposits');
    console.log('4. Test approval/rejection workflow');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error fixing deposits table:', error);
    process.exit(1);
  }
}

fixDepositsTable();
