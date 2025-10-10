const { createClient } = require('@supabase/supabase-js');

// Use the same credentials as the server
const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';

async function testSupabaseInsertion() {
  try {
    console.log('🔧 Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');
    
    // Create the exact same data structure as the server
    const withdrawalRequest = {
      id: `test-withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'user-angela-1758195715',
      username: 'angela.soenoko',
      amount: 50.00,
      currency: 'USDT',
      address: 'test-address-123',
      wallet_address: 'test-address-123',
      status: 'pending',
      user_balance: 102135.48,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const supabaseWithdrawal = {
      id: withdrawalRequest.id,
      user_id: withdrawalRequest.user_id,
      username: withdrawalRequest.username,
      amount: parseFloat(withdrawalRequest.amount),
      currency: withdrawalRequest.currency,
      wallet_address: withdrawalRequest.address,
      status: 'pending',
      user_balance: parseFloat(withdrawalRequest.user_balance),
      created_at: withdrawalRequest.created_at,
      updated_at: withdrawalRequest.updated_at
    };
    
    console.log('💾 Attempting to save withdrawal to Supabase:', supabaseWithdrawal);
    
    const { data: insertedData, error } = await supabase
      .from('withdrawals')
      .insert([supabaseWithdrawal])
      .select();
    
    if (error) {
      console.error('❌ Failed to save withdrawal to Supabase:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Attempted data:', supabaseWithdrawal);
    } else {
      console.log('✅ Withdrawal saved to Supabase database successfully!');
      console.log('✅ Inserted data:', insertedData);
      
      // Now check if it appears in the admin query
      console.log('🔍 Checking if withdrawal appears in admin query...');
      
      const { data: adminData, error: adminError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (adminError) {
        console.error('❌ Admin query failed:', adminError);
      } else {
        console.log('📊 Admin query results:', adminData.length, 'pending withdrawals');
        adminData.forEach((w, i) => {
          console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
        });
        
        const ourWithdrawal = adminData.find(w => w.id === withdrawalRequest.id);
        if (ourWithdrawal) {
          console.log('✅ SUCCESS: Our test withdrawal appears in admin query!');
        } else {
          console.log('❌ PROBLEM: Our test withdrawal does not appear in admin query');
        }
      }
      
      // Clean up test record
      console.log('🧹 Cleaning up test record...');
      await supabase
        .from('withdrawals')
        .delete()
        .eq('id', withdrawalRequest.id);
      console.log('✅ Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSupabaseInsertion();
