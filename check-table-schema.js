const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pybsyzbxyliufkgywtpf.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE'
);

async function checkTableSchema() {
  try {
    console.log('🔍 Checking withdrawals table schema...');
    
    // Try to get table info using a simple query
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing withdrawals table:', error);
      
      // Check if table exists by trying to create it
      console.log('🔧 Attempting to check if table exists...');
      
      const { data: tables, error: tablesError } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'withdrawals'
          `
        });
        
      if (tablesError) {
        console.error('❌ Error checking table existence:', tablesError);
      } else {
        console.log('📊 Table check result:', tables);
      }
    } else {
      console.log('✅ Withdrawals table accessible');
      console.log('📊 Sample data structure:', data);
      
      // Try to insert a test record to see what happens
      console.log('🧪 Testing insertion...');
      
      const testWithdrawal = {
        id: `test-withdrawal-${Date.now()}`,
        user_id: 'test-user-id',
        username: 'test-user',
        amount: 10.00,
        currency: 'USDT',
        wallet_address: 'test-address',
        status: 'pending',
        user_balance: 100.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('withdrawals')
        .insert([testWithdrawal])
        .select();
        
      if (insertError) {
        console.error('❌ Test insertion failed:', insertError);
        console.error('❌ Error details:', insertError.message);
        console.error('❌ Error code:', insertError.code);
        console.error('❌ Attempted data:', testWithdrawal);
      } else {
        console.log('✅ Test insertion successful:', insertData);
        
        // Clean up test record
        await supabase
          .from('withdrawals')
          .delete()
          .eq('id', testWithdrawal.id);
        console.log('🧹 Test record cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTableSchema();
