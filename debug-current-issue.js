import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function debugCurrentIssue() {
  try {
    console.log('🔍 DEBUGGING CURRENT DEPOSIT ISSUE');
    console.log('=====================================');
    
    const client = postgres(DATABASE_URL);
    
    console.log('🔗 Connected to Supabase');
    
    // 1. Check what deposits exist in the database
    console.log('\n1. 📊 Checking current deposits in database...');
    const allDeposits = await client`
      SELECT id, username, amount, currency, status, created_at
      FROM deposits 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('📋 All deposits in database:');
    if (allDeposits.length === 0) {
      console.log('   ❌ NO DEPOSITS FOUND IN DATABASE');
    } else {
      allDeposits.forEach((deposit, index) => {
        console.log(`   ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status} (${deposit.created_at})`);
      });
    }
    
    // 2. Check specifically for pending deposits
    console.log('\n2. 🔍 Checking pending deposits...');
    const pendingDeposits = await client`
      SELECT id, username, amount, currency, status, created_at
      FROM deposits 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `;
    
    console.log('📋 Pending deposits:');
    if (pendingDeposits.length === 0) {
      console.log('   ❌ NO PENDING DEPOSITS FOUND');
    } else {
      pendingDeposits.forEach((deposit, index) => {
        console.log(`   ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status}`);
      });
    }
    
    // 3. Test the production server endpoints
    console.log('\n3. 🧪 Testing production server endpoints...');
    
    try {
      console.log('   Testing admin pending requests endpoint...');
      const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests');
      
      if (!response.ok) {
        console.log(`   ❌ Admin endpoint failed: ${response.status} ${response.statusText}`);
      } else {
        const data = await response.json();
        console.log('   ✅ Admin endpoint response:');
        console.log(`      - Deposits: ${data.deposits?.length || 0}`);
        console.log(`      - Withdrawals: ${data.withdrawals?.length || 0}`);
        console.log(`      - Total: ${data.total || 0}`);
        
        if (data.deposits && data.deposits.length > 0) {
          console.log('   📋 Deposits from API:');
          data.deposits.forEach((deposit, index) => {
            console.log(`      ${index + 1}. ${deposit.username}: ${deposit.amount} ${deposit.currency} - ${deposit.status}`);
          });
        }
      }
    } catch (apiError) {
      console.log('   ❌ API test failed:', apiError.message);
    }
    
    // 4. Check if there's a mismatch between database and API
    console.log('\n4. 🔍 Analyzing the issue...');
    
    const dbPendingCount = pendingDeposits.length;
    
    // Try to get API response again for comparison
    try {
      const apiResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests');
      const apiData = await apiResponse.json();
      const apiPendingCount = apiData.deposits?.length || 0;
      
      console.log('📊 Comparison:');
      console.log(`   Database pending deposits: ${dbPendingCount}`);
      console.log(`   API pending deposits: ${apiPendingCount}`);
      
      if (dbPendingCount > 0 && apiPendingCount === 0) {
        console.log('   🎯 ISSUE IDENTIFIED: Database has deposits but API returns none');
        console.log('   🔧 CAUSE: Production server not reading from Supabase correctly');
        console.log('   🚀 SOLUTION: Deploy updated server code');
      } else if (dbPendingCount === 0 && apiPendingCount === 0) {
        console.log('   🎯 ISSUE IDENTIFIED: No deposits in database');
        console.log('   🔧 CAUSE: User deposits not being saved to database');
        console.log('   🚀 SOLUTION: Check deposit submission process');
      } else if (dbPendingCount === apiPendingCount && dbPendingCount > 0) {
        console.log('   ✅ NO ISSUE: Database and API are in sync');
        console.log('   🤔 The admin dashboard might have a frontend issue');
      }
      
    } catch (error) {
      console.log('   ❌ Could not compare with API:', error.message);
    }
    
    // 5. Check recent user activity
    console.log('\n5. 👤 Checking recent user activity...');
    const recentUsers = await client`
      SELECT username, balance, updated_at
      FROM users 
      WHERE updated_at > NOW() - INTERVAL '24 hours'
      ORDER BY updated_at DESC
      LIMIT 5
    `;
    
    console.log('📋 Recently active users:');
    recentUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username}: Balance ${user.balance} (Updated: ${user.updated_at})`);
    });
    
    // 6. Provide specific diagnosis
    console.log('\n6. 🎯 DIAGNOSIS & SOLUTION:');
    console.log('');
    
    if (allDeposits.length === 0) {
      console.log('❌ PROBLEM: No deposits exist in database at all');
      console.log('🔧 CAUSE: Deposit submission is not working');
      console.log('🚀 SOLUTION: Check deposit form and server endpoints');
    } else if (pendingDeposits.length === 0) {
      console.log('❌ PROBLEM: Deposits exist but none are pending');
      console.log('🔧 CAUSE: All deposits have been processed or have wrong status');
      console.log('🚀 SOLUTION: Check deposit statuses and processing logic');
    } else {
      console.log('✅ PROBLEM: Deposits exist in database but not showing in admin');
      console.log('🔧 CAUSE: Production server not reading from Supabase correctly');
      console.log('🚀 SOLUTION: Deploy updated working-server.js to Railway');
    }
    
    console.log('');
    console.log('📋 IMMEDIATE ACTIONS:');
    console.log('1. Deploy updated server code to Railway');
    console.log('2. Test deposit submission from user interface');
    console.log('3. Verify admin dashboard shows the deposits');
    console.log('4. Test approval/rejection workflow');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugCurrentIssue();
