const axios = require('axios');
const postgres = require('postgres');

async function testWithdrawalDatabaseSync() {
  console.log('🧪 TESTING WITHDRAWAL DATABASE SYNC: Starting...\n');
  
  const BASE_URL = 'http://localhost:3005';
  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
  
  try {
    // 1. Check server status
    console.log('1️⃣ Checking server status...');
    const statusResponse = await axios.get(`${BASE_URL}/api/test/server-status`);
    console.log('✅ Server is running:', statusResponse.data.status);
    
    // 2. Login as test user
    console.log('\n2️⃣ Logging in as test user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginResponse.data));
    }
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.username);
    console.log('💰 Initial balance:', user.balance);
    
    // 3. Check database before withdrawal
    console.log('\n3️⃣ Checking database before withdrawal...');
    const client = postgres(DATABASE_URL);
    
    const beforeWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at
      FROM withdrawals 
      WHERE user_id = ${user.id}
      AND created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Recent withdrawals in database: ${beforeWithdrawals.length}`);
    
    // 4. Create withdrawal request
    console.log('\n4️⃣ Creating withdrawal request...');
    const withdrawalAmount = 50;
    const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
      amount: withdrawalAmount.toString(),
      currency: 'USDT',
      address: 'test-wallet-address-sync-test',
      password: 'newpass123'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!withdrawalResponse.data.success) {
      throw new Error('Withdrawal request failed: ' + JSON.stringify(withdrawalResponse.data));
    }
    
    console.log('✅ Withdrawal request created:', withdrawalResponse.data.message);
    console.log('💸 Withdrawal ID:', withdrawalResponse.data.withdrawalId);
    
    // 5. Wait a moment for database sync
    console.log('\n5️⃣ Waiting for database sync...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 6. Check database after withdrawal
    console.log('\n6️⃣ Checking database after withdrawal...');
    
    const afterWithdrawals = await client`
      SELECT id, user_id, username, amount, currency, status, created_at, wallet_address
      FROM withdrawals 
      WHERE user_id = ${user.id}
      AND created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Recent withdrawals in database: ${afterWithdrawals.length}`);
    
    if (afterWithdrawals.length > beforeWithdrawals.length) {
      const newWithdrawal = afterWithdrawals[0];
      console.log('✅ NEW WITHDRAWAL FOUND IN DATABASE:');
      console.log(`   ID: ${newWithdrawal.id}`);
      console.log(`   User: ${newWithdrawal.username}`);
      console.log(`   Amount: ${newWithdrawal.amount} ${newWithdrawal.currency}`);
      console.log(`   Status: ${newWithdrawal.status}`);
      console.log(`   Address: ${newWithdrawal.wallet_address}`);
      console.log(`   Created: ${newWithdrawal.created_at}`);
    } else {
      console.log('❌ NO NEW WITHDRAWAL FOUND IN DATABASE');
    }
    
    // 7. Check admin dashboard API
    console.log('\n7️⃣ Checking admin dashboard API...');
    
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const pendingWithdrawals = pendingResponse.data.withdrawals || [];
    console.log(`📋 Pending withdrawals from API: ${pendingWithdrawals.length}`);
    
    if (pendingWithdrawals.length > 0) {
      console.log('✅ WITHDRAWALS FOUND IN ADMIN API:');
      pendingWithdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
      });
    } else {
      console.log('❌ NO WITHDRAWALS FOUND IN ADMIN API');
    }
    
    await client.end();
    
    // 8. Analysis
    console.log('\n📊 ANALYSIS:');
    console.log(`💾 Database withdrawals: ${afterWithdrawals.length}`);
    console.log(`📡 API withdrawals: ${pendingWithdrawals.length}`);
    
    if (afterWithdrawals.length > 0 && pendingWithdrawals.length > 0) {
      console.log('✅ SUCCESS: Withdrawal sync is working!');
      console.log('   - Withdrawal saved to database ✅');
      console.log('   - Withdrawal appears in admin API ✅');
    } else if (afterWithdrawals.length > 0 && pendingWithdrawals.length === 0) {
      console.log('⚠️ PARTIAL: Withdrawal in database but not in API');
    } else if (afterWithdrawals.length === 0 && pendingWithdrawals.length > 0) {
      console.log('⚠️ PARTIAL: Withdrawal in API but not in database');
    } else {
      console.log('❌ FAILURE: Withdrawal not found anywhere');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testWithdrawalDatabaseSync();
