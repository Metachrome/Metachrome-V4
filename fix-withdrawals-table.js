const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';

async function fixWithdrawalsTable() {
  try {
    console.log('🔧 Fixing withdrawals table schema...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Check current table structure
    console.log('1️⃣ Checking current table structure...');
    
    const { data: currentData, error: currentError } = await supabase
      .from('withdrawals')
      .select('*')
      .limit(1);
    
    if (currentError) {
      console.error('❌ Error accessing current table:', currentError);
      return;
    }
    
    console.log('✅ Current table accessible');
    if (currentData.length > 0) {
      console.log('📊 Current columns:', Object.keys(currentData[0]));
    }
    
    // 2. Add missing user_balance column
    console.log('2️⃣ Adding missing user_balance column...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE withdrawals 
        ADD COLUMN IF NOT EXISTS user_balance DECIMAL(15,2);
      `
    });
    
    if (alterError) {
      console.error('❌ Failed to add user_balance column:', alterError);
      return;
    }
    
    console.log('✅ user_balance column added successfully');
    
    // 3. Test insertion with the fixed schema
    console.log('3️⃣ Testing insertion with fixed schema...');
    
    const testWithdrawal = {
      id: `test-withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'user-angela-1758195715',
      username: 'angela.soenoko',
      amount: 25.00,
      currency: 'USDT',
      wallet_address: 'test-address-fixed',
      status: 'pending',
      user_balance: 102135.48,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertedData, error: insertError } = await supabase
      .from('withdrawals')
      .insert([testWithdrawal])
      .select();
    
    if (insertError) {
      console.error('❌ Test insertion still failed:', insertError);
    } else {
      console.log('✅ Test insertion successful!');
      console.log('📊 Inserted data:', insertedData);
      
      // 4. Verify it appears in admin query
      console.log('4️⃣ Verifying admin query...');
      
      const { data: adminData, error: adminError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (adminError) {
        console.error('❌ Admin query failed:', adminError);
      } else {
        console.log('📊 Admin query found', adminData.length, 'pending withdrawals');
        const ourWithdrawal = adminData.find(w => w.id === testWithdrawal.id);
        if (ourWithdrawal) {
          console.log('✅ SUCCESS: Test withdrawal appears in admin query!');
        } else {
          console.log('❌ Test withdrawal not found in admin query');
        }
      }
      
      // Clean up test record
      console.log('🧹 Cleaning up test record...');
      await supabase
        .from('withdrawals')
        .delete()
        .eq('id', testWithdrawal.id);
      console.log('✅ Test record cleaned up');
    }
    
    console.log('\n🎉 Withdrawals table fix completed!');
    console.log('💡 The withdrawal submission should now work properly.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixWithdrawalsTable();
