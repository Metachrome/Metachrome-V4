const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBalanceUpdates() {
  try {
    console.log('🔍 Checking balance updates in Supabase...\n');

    // Get the test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'angela.soenoko')
      .single();

    if (userError || !user) {
      console.error('❌ Error finding test user:', userError);
      return;
    }

    console.log(`👤 Current user data from Supabase:`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Balance: $${user.balance}`);
    console.log(`   Trading Mode: ${user.trading_mode}`);
    console.log(`   Wallet: ${user.wallet_address || 'Not set'}`);
    console.log(`   Updated At: ${user.updated_at}`);

    // Test a deposit
    console.log('\n💰 Testing deposit...');
    const depositResponse = await fetch('http://localhost:3333/api/superadmin/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        amount: 500,
        note: 'Test deposit to check balance update'
      })
    });

    if (depositResponse.ok) {
      const depositResult = await depositResponse.json();
      console.log(`✅ Deposit API response:`, depositResult);
    } else {
      console.log(`❌ Deposit failed:`, await depositResponse.text());
    }

    // Wait a moment for the update
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check the balance again
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'angela.soenoko')
      .single();

    if (updateError || !updatedUser) {
      console.error('❌ Error getting updated user:', updateError);
      return;
    }

    console.log(`\n🔄 Updated user data from Supabase:`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Balance: $${updatedUser.balance}`);
    console.log(`   Trading Mode: ${updatedUser.trading_mode}`);
    console.log(`   Wallet: ${updatedUser.wallet_address || 'Not set'}`);
    console.log(`   Updated At: ${updatedUser.updated_at}`);

    // Compare balances
    const balanceChange = parseFloat(updatedUser.balance) - parseFloat(user.balance);
    console.log(`\n📊 Balance Analysis:`);
    console.log(`   Original Balance: $${user.balance}`);
    console.log(`   Updated Balance: $${updatedUser.balance}`);
    console.log(`   Expected Change: +$500`);
    console.log(`   Actual Change: ${balanceChange >= 0 ? '+' : ''}$${balanceChange}`);
    
    if (balanceChange === 500) {
      console.log(`✅ Balance update is working correctly!`);
    } else {
      console.log(`❌ Balance update is NOT working. Expected +$500, got ${balanceChange >= 0 ? '+' : ''}$${balanceChange}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkBalanceUpdates();
