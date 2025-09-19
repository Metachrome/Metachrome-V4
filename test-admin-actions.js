const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminActions() {
  try {
    console.log('🧪 Testing all admin action buttons systematically...\n');

    // Get a test user (angela.soenoko)
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'angela.soenoko')
      .single();

    if (userError || !testUser) {
      console.error('❌ Error finding test user:', userError);
      return;
    }

    console.log(`👤 Testing with user: ${testUser.username} (${testUser.id})`);
    console.log(`💰 Initial balance: $${testUser.balance}\n`);

    // Test 1: Trading Mode Control
    console.log('🎯 Test 1: Trading Mode Control');
    console.log('Testing: /api/admin/trading-controls');
    
    const tradingModes = ['win', 'lose', 'normal'];
    for (const mode of tradingModes) {
      const response = await fetch('http://localhost:3333/api/admin/trading-controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: testUser.id, controlType: mode })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Trading mode ${mode}: ${result.message}`);
      } else {
        console.log(`❌ Trading mode ${mode}: ${response.status} ${await response.text()}`);
      }
    }

    // Test 2: Deposit (Add Balance)
    console.log('\n💰 Test 2: Deposit (Add Balance)');
    console.log('Testing: /api/superadmin/deposit');
    
    const depositResponse = await fetch('http://localhost:3333/api/superadmin/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        amount: 100,
        note: 'Test deposit from admin'
      })
    });

    if (depositResponse.ok) {
      const depositResult = await depositResponse.json();
      console.log(`✅ Deposit: ${depositResult.message}`);
    } else {
      console.log(`❌ Deposit: ${depositResponse.status} ${await depositResponse.text()}`);
    }

    // Test 3: Withdrawal (Subtract Balance)
    console.log('\n💸 Test 3: Withdrawal (Subtract Balance)');
    console.log('Testing: /api/superadmin/withdrawal');
    
    const withdrawalResponse = await fetch('http://localhost:3333/api/superadmin/withdrawal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        amount: 50,
        note: 'Test withdrawal from admin'
      })
    });

    if (withdrawalResponse.ok) {
      const withdrawalResult = await withdrawalResponse.json();
      console.log(`✅ Withdrawal: ${withdrawalResult.message}`);
    } else {
      console.log(`❌ Withdrawal: ${withdrawalResponse.status} ${await withdrawalResponse.text()}`);
    }

    // Test 4: Password Change
    console.log('\n🔑 Test 4: Password Change');
    console.log('Testing: /api/superadmin/change-password');
    
    const passwordResponse = await fetch('http://localhost:3333/api/superadmin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        newPassword: 'newpassword123'
      })
    });

    if (passwordResponse.ok) {
      const passwordResult = await passwordResponse.json();
      console.log(`✅ Password change: ${passwordResult.message}`);
    } else {
      console.log(`❌ Password change: ${passwordResponse.status} ${await passwordResponse.text()}`);
    }

    // Test 5: Wallet Address Update
    console.log('\n👛 Test 5: Wallet Address Update');
    console.log('Testing: /api/superadmin/update-wallet');
    
    const walletResponse = await fetch('http://localhost:3333/api/superadmin/update-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
      })
    });

    if (walletResponse.ok) {
      const walletResult = await walletResponse.json();
      console.log(`✅ Wallet update: ${walletResult.message}`);
    } else {
      console.log(`❌ Wallet update: ${walletResponse.status} ${await walletResponse.text()}`);
    }

    // Test 6: User Edit/Update
    console.log('\n✏️ Test 6: User Edit/Update');
    console.log('Testing: /api/admin/users/:id');
    
    const editResponse = await fetch(`http://localhost:3333/api/admin/users/${testUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser.username,
        email: testUser.email,
        balance: testUser.balance,
        role: testUser.role,
        status: 'active',
        trading_mode: 'normal'
      })
    });

    if (editResponse.ok) {
      const editResult = await editResponse.json();
      console.log(`✅ User edit: User updated successfully`);
    } else {
      console.log(`❌ User edit: ${editResponse.status} ${await editResponse.text()}`);
    }

    // Test 7: Get User Details (View)
    console.log('\n👁️ Test 7: Get User Details (View)');
    console.log('Testing: /api/admin/users');
    
    const usersResponse = await fetch('http://localhost:3333/api/admin/users');
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      const foundUser = users.find(u => u.id === testUser.id);
      if (foundUser) {
        console.log(`✅ User view: Found user ${foundUser.username} with balance $${foundUser.balance}`);
      } else {
        console.log(`❌ User view: User not found in response`);
      }
    } else {
      console.log(`❌ User view: ${usersResponse.status} ${await usersResponse.text()}`);
    }

    // Test 8: Check final user state
    console.log('\n🔍 Test 8: Final User State Check');
    const { data: finalUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (finalUser) {
      console.log(`👤 Final user state:`);
      console.log(`   Username: ${finalUser.username}`);
      console.log(`   Balance: $${finalUser.balance}`);
      console.log(`   Trading Mode: ${finalUser.trading_mode}`);
      console.log(`   Status: ${finalUser.status}`);
      console.log(`   Wallet: ${finalUser.wallet_address || 'Not set'}`);
    }

    console.log('\n🎉 Admin actions test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAdminActions();
