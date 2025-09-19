const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDepositApproval() {
  console.log('🧪 Testing deposit approval...');

  try {
    // First, let's check if we have any users
    console.log('👥 Checking users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, balance')
      .limit(5);
    
    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }
    
    console.log('👥 Found users:', users.map(u => ({ id: u.id, username: u.username, balance: u.balance })));
    
    if (users.length === 0) {
      console.log('⚠️ No users found in database');
      return;
    }

    // Test transaction creation with a real user ID
    const testUser = users[0];
    console.log('🧪 Testing transaction creation for user:', testUser.username);
    
    const testTransaction = {
      user_id: testUser.id,
      type: 'deposit',
      amount: 100,
      status: 'completed',
      description: 'Test deposit approval transaction'
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([testTransaction])
      .select()
      .single();

    if (transactionError) {
      console.log('❌ Error creating transaction:', transactionError.message);
    } else {
      console.log('✅ Transaction created successfully:', transaction.id);
      
      // Clean up test transaction
      await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id);
      console.log('🧹 Cleaned up test transaction');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDepositApproval();
