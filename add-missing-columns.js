const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';

async function addMissingColumns() {
  try {
    console.log('🔧 Adding missing columns to withdrawals table...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Method 1: Try using the SQL editor endpoint directly
    console.log('1️⃣ Attempting to add user_balance column...');
    
    try {
      // Use the REST API to execute SQL directly
      const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS user_balance DECIMAL(15,2);'
        })
      });
      
      if (response1.ok) {
        console.log('✅ user_balance column added successfully');
      } else {
        console.log('⚠️ Method 1 failed, trying alternative approach...');
        
        // Method 2: Try using Supabase client with a custom function
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS user_balance DECIMAL(15,2);'
        });
        
        if (error) {
          console.log('⚠️ Method 2 also failed:', error.message);
          console.log('💡 Will proceed with testing current schema...');
        } else {
          console.log('✅ user_balance column added via method 2');
        }
      }
    } catch (err) {
      console.log('⚠️ Column addition failed:', err.message);
      console.log('💡 Will proceed with testing current schema...');
    }
    
    console.log('\n2️⃣ Attempting to add wallet_address column...');
    
    try {
      const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS wallet_address TEXT;'
        })
      });
      
      if (response2.ok) {
        console.log('✅ wallet_address column added successfully');
        
        // Copy data from address to wallet_address
        const response3 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            sql: 'UPDATE withdrawals SET wallet_address = address WHERE wallet_address IS NULL;'
          })
        });
        
        if (response3.ok) {
          console.log('✅ Data copied from address to wallet_address');
        }
      } else {
        console.log('⚠️ wallet_address column addition failed');
      }
    } catch (err) {
      console.log('⚠️ wallet_address column addition failed:', err.message);
    }
    
    // 3. Test the current schema by trying to insert a record
    console.log('\n3️⃣ Testing current schema with insertion...');
    
    // First try with the expected schema (including user_balance and wallet_address)
    const testWithdrawal1 = {
      id: `test-withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'user-angela-1758195715',
      username: 'angela.soenoko',
      amount: 30.00,
      currency: 'USDT',
      wallet_address: 'test-address-1',
      status: 'pending',
      user_balance: 102135.48,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertData1, error: insertError1 } = await supabase
      .from('withdrawals')
      .insert([testWithdrawal1])
      .select();
    
    if (insertError1) {
      console.log('❌ Insertion with full schema failed:', insertError1.message);
      
      // Try with minimal schema (only existing columns)
      console.log('4️⃣ Trying with minimal schema...');
      
      const testWithdrawal2 = {
        id: `test-withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'user-angela-1758195715',
        username: 'angela.soenoko',
        amount: 30.00,
        currency: 'USDT',
        address: 'test-address-2',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertData2, error: insertError2 } = await supabase
        .from('withdrawals')
        .insert([testWithdrawal2])
        .select();
      
      if (insertError2) {
        console.log('❌ Minimal insertion also failed:', insertError2.message);
      } else {
        console.log('✅ Minimal insertion successful!');
        console.log('📊 Inserted data:', insertData2);
        
        // Clean up
        await supabase.from('withdrawals').delete().eq('id', testWithdrawal2.id);
        console.log('🧹 Test record cleaned up');
      }
    } else {
      console.log('✅ Full schema insertion successful!');
      console.log('📊 Inserted data:', insertData1);
      
      // Clean up
      await supabase.from('withdrawals').delete().eq('id', testWithdrawal1.id);
      console.log('🧹 Test record cleaned up');
    }
    
    console.log('\n🎉 Schema analysis completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addMissingColumns();
