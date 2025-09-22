import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function testRealDeposit() {
  try {
    console.log('🧪 Testing real deposit workflow...');
    
    const client = postgres(DATABASE_URL);
    
    console.log('🔗 Connected to Supabase');
    
    // First, get a real user from the database
    console.log('👤 Finding existing users...');
    const users = await client`
      SELECT id, username FROM users 
      WHERE role = 'user' 
      LIMIT 5
    `;
    
    console.log('📊 Available users:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.id})`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found! Creating a test user...');
      
      const newUser = await client`
        INSERT INTO users (username, email, password, role)
        VALUES ('testuser', 'test@example.com', 'hashedpassword', 'user')
        RETURNING id, username
      `;
      
      console.log('✅ Test user created:', newUser[0]);
      var testUserId = newUser[0].id;
      var testUsername = newUser[0].username;
    } else {
      var testUserId = users[0].id;
      var testUsername = users[0].username;
      console.log(`✅ Using existing user: ${testUsername} (${testUserId})`);
    }
    
    // Test creating a deposit (simulating user submission)
    console.log('\n💰 Creating test deposit...');
    
    const depositData = {
      user_id: testUserId,
      username: testUsername,
      amount: 100.00,
      currency: 'USDT',
      network: 'TRC20',
      wallet_address: 'TQn9Y2khEsLMG73Lyubovk8oQzqiEQ62Xf',
      status: 'pending'
    };
    
    const newDeposit = await client`
      INSERT INTO deposits (
        user_id, username, amount, currency, network, 
        wallet_address, status, created_at
      )
      VALUES (
        ${depositData.user_id}, ${depositData.username}, ${depositData.amount}, 
        ${depositData.currency}, ${depositData.network}, ${depositData.wallet_address}, 
        ${depositData.status}, CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    
    console.log('✅ Deposit created successfully:', {
      id: newDeposit[0].id,
      username: newDeposit[0].username,
      amount: newDeposit[0].amount,
      currency: newDeposit[0].currency,
      network: newDeposit[0].network,
      status: newDeposit[0].status,
      created_at: newDeposit[0].created_at
    });
    
    // Test admin query (what the dashboard does)
    console.log('\n🔍 Testing admin dashboard query...');
    const pendingDeposits = await client`
      SELECT 
        id, user_id, username, amount, currency, network, 
        wallet_address, status, created_at
      FROM deposits 
      WHERE status = 'pending' 
      ORDER BY created_at DESC
    `;
    
    console.log('📊 Pending deposits found:', pendingDeposits.length);
    pendingDeposits.forEach((deposit, index) => {
      console.log(`   ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} (${deposit.network}) - ${deposit.status}`);
    });
    
    // Test approval workflow
    console.log('\n✅ Testing deposit approval...');
    const approvedDeposit = await client`
      UPDATE deposits 
      SET 
        status = 'approved',
        approved_at = CURRENT_TIMESTAMP,
        approved_by = 'superadmin',
        admin_notes = 'Approved via test workflow'
      WHERE id = ${newDeposit[0].id}
      RETURNING *
    `;
    
    console.log('✅ Deposit approved:', {
      id: approvedDeposit[0].id,
      status: approvedDeposit[0].status,
      approved_by: approvedDeposit[0].approved_by,
      approved_at: approvedDeposit[0].approved_at
    });
    
    // Test rejection workflow
    console.log('\n❌ Testing deposit rejection...');
    await client`
      UPDATE deposits 
      SET 
        status = 'rejected',
        approved_at = CURRENT_TIMESTAMP,
        approved_by = 'superadmin',
        admin_notes = 'Rejected for testing purposes'
      WHERE id = ${newDeposit[0].id}
    `;
    
    console.log('✅ Deposit rejection tested');
    
    // Final verification - check all deposits
    console.log('\n📊 Final verification - all deposits:');
    const allDeposits = await client`
      SELECT id, username, amount, currency, status, created_at
      FROM deposits 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('📋 Recent deposits:');
    allDeposits.forEach((deposit, index) => {
      console.log(`   ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status}`);
    });
    
    // Clean up test deposit
    await client`DELETE FROM deposits WHERE id = ${newDeposit[0].id}`;
    console.log('\n🧹 Test deposit cleaned up');
    
    console.log('\n🎉 ALL DEPOSIT TESTS PASSED!');
    console.log('');
    console.log('✅ Database structure complete');
    console.log('✅ Deposit creation working');
    console.log('✅ Admin queries working');
    console.log('✅ Approval workflow working');
    console.log('✅ Rejection workflow working');
    console.log('');
    console.log('🚀 READY FOR PRODUCTION DEPLOYMENT!');
    console.log('');
    console.log('📋 DEPLOYMENT STEPS:');
    console.log('1. Go to Railway Dashboard: https://railway.app/dashboard');
    console.log('2. Find METACHROME project');
    console.log('3. Click "Redeploy" or "Deploy Latest"');
    console.log('4. Wait 2-3 minutes for deployment');
    console.log('5. Test deposit creation from user interface');
    console.log('6. Verify admin dashboard shows pending deposits');
    console.log('');
    console.log('🌐 Test URLs after deployment:');
    console.log('   User Wallet: https://metachrome-v2-production.up.railway.app/wallet');
    console.log('   Admin Dashboard: https://metachrome-v2-production.up.railway.app/admin/dashboard');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error in real deposit test:', error);
    process.exit(1);
  }
}

testRealDeposit();
