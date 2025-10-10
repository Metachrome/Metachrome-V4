const { createClient } = require('@supabase/supabase-js');

async function checkWithdrawalsSchema() {
  console.log('🔍 CHECKING WITHDRAWALS TABLE SCHEMA...\n');
  
  const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get table schema by trying to insert with different column names
    console.log('📋 Checking withdrawals table structure...');
    
    // Try to get existing data to see column names
    const { data: existingData, error: selectError } = await supabase
      .from('withdrawals')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Error selecting from withdrawals:', selectError.message);
    } else {
      console.log('✅ Withdrawals table exists');
      if (existingData && existingData.length > 0) {
        console.log('📊 Sample record columns:', Object.keys(existingData[0]));
      } else {
        console.log('📊 Table is empty, will test column names');
      }
    }
    
    // Test different column name variations
    const testRecord = {
      id: `test-schema-${Date.now()}`,
      user_id: 'test-user-id',
      username: 'test-user',
      amount: 10.00,
      currency: 'USDT',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Test with 'address' column
    console.log('\n🧪 Testing with "address" column...');
    const testWithAddress = { ...testRecord, address: 'test-address-1' };
    
    const { error: addressError } = await supabase
      .from('withdrawals')
      .insert([testWithAddress]);
    
    if (addressError) {
      console.log('❌ "address" column failed:', addressError.message);
    } else {
      console.log('✅ "address" column works!');
      
      // Clean up test record
      await supabase.from('withdrawals').delete().eq('id', testRecord.id);
    }
    
    // Test with 'wallet_address' column
    console.log('\n🧪 Testing with "wallet_address" column...');
    const testWithWalletAddress = { ...testRecord, wallet_address: 'test-address-2' };
    
    const { error: walletAddressError } = await supabase
      .from('withdrawals')
      .insert([testWithWalletAddress]);
    
    if (walletAddressError) {
      console.log('❌ "wallet_address" column failed:', walletAddressError.message);
    } else {
      console.log('✅ "wallet_address" column works!');
      
      // Clean up test record
      await supabase.from('withdrawals').delete().eq('id', testRecord.id);
    }
    
    console.log('\n📋 SCHEMA DIAGNOSIS COMPLETE');
    console.log('Use the working column name to create proper test withdrawals.');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

// Run the check
checkWithdrawalsSchema();
