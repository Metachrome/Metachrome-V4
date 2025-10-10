const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

async function debugAdminDashboard() {
  console.log('🔍 DEBUGGING ADMIN DASHBOARD CURRENT STATE...\n');
  
  const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
  const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Check database directly
    console.log('1️⃣ Checking withdrawals in database directly...');
    
    const { data: dbWithdrawals, error: dbError } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.log('❌ Database error:', dbError.message);
    } else {
      console.log(`📊 Database shows ${dbWithdrawals.length} total withdrawal(s):`);
      dbWithdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
      });
      
      const pendingInDb = dbWithdrawals.filter(w => w.status === 'pending');
      console.log(`💸 Pending in database: ${pendingInDb.length}`);
    }
    
    // 2. Check user balance in database
    console.log('\n2️⃣ Checking user balance in database...');
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, balance')
      .eq('username', 'angela.soenoko')
      .single();
    
    if (userError) {
      console.log('❌ User error:', userError.message);
    } else {
      console.log('👤 User in database:', users.username);
      console.log('💰 Balance in database:', users.balance);
    }
    
    // 3. Test admin login
    console.log('\n3️⃣ Testing admin login...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const authToken = loginResponse.data.token;
    const user = loginResponse.data.user;
    console.log('✅ Login successful:', user.username);
    console.log('💰 Balance from login API:', user.balance);
    
    // 4. Test admin pending requests API
    console.log('\n4️⃣ Testing admin pending requests API...');
    
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('📊 Admin API response:', pendingResponse.data);
    console.log(`💸 Pending withdrawals from API: ${pendingResponse.data.withdrawals?.length || 0}`);
    console.log(`💰 Pending deposits from API: ${pendingResponse.data.deposits?.length || 0}`);
    
    if (pendingResponse.data.withdrawals && pendingResponse.data.withdrawals.length > 0) {
      console.log('✅ Withdrawals found in API:');
      pendingResponse.data.withdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
      });
    } else {
      console.log('❌ No withdrawals returned by admin API');
    }
    
    // 5. Test user data API (for balance issue)
    console.log('\n5️⃣ Testing user data API...');
    
    const userDataResponse = await axios.get(`${BASE_URL}/api/user/data`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('👤 User data API response:');
    console.log('   Username:', userDataResponse.data.username);
    console.log('   Balance:', userDataResponse.data.balance);
    console.log('   ID:', userDataResponse.data.id);
    
    // 6. Create a test withdrawal to see if it appears
    console.log('\n6️⃣ Creating test withdrawal to check sync...');
    
    try {
      const testWithdrawal = await axios.post(`${BASE_URL}/api/withdrawals`, {
        amount: '75',
        currency: 'USDT',
        address: 'test-address-debug-' + Date.now(),
        password: 'newpass123'
      }, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (testWithdrawal.data.success) {
        console.log('✅ Test withdrawal created successfully!');
        console.log('📤 Withdrawal ID:', testWithdrawal.data.withdrawalId);
        
        // Check if it appears in admin dashboard immediately
        setTimeout(async () => {
          console.log('\n7️⃣ Checking admin dashboard after withdrawal creation...');
          
          const afterResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          
          console.log(`📊 Admin API after withdrawal: ${afterResponse.data.withdrawals?.length || 0} pending`);
          
          if (afterResponse.data.withdrawals && afterResponse.data.withdrawals.length > 0) {
            console.log('✅ SUCCESS: Withdrawals now appear in admin dashboard!');
            afterResponse.data.withdrawals.forEach((w, i) => {
              console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
            });
          } else {
            console.log('❌ PROBLEM: Withdrawal still not appearing in admin dashboard');
            
            // Check database again
            const { data: afterDbCheck } = await supabase
              .from('withdrawals')
              .select('*')
              .eq('status', 'pending')
              .order('created_at', { ascending: false });
            
            console.log(`🔍 Database after withdrawal: ${afterDbCheck?.length || 0} pending`);
            
            if (afterDbCheck && afterDbCheck.length > 0) {
              console.log('💡 DIAGNOSIS: Withdrawals exist in database but admin API not returning them');
              console.log('   This indicates an issue with the admin API endpoint logic');
            }
          }
        }, 3000);
        
      } else {
        console.log('❌ Test withdrawal failed:', testWithdrawal.data);
      }
      
    } catch (withdrawalError) {
      console.log('❌ Test withdrawal error:', withdrawalError.response?.data || withdrawalError.message);
    }
    
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('🔍 Check the results above to identify:');
    console.log('   1. Are withdrawals in the database?');
    console.log('   2. Is the admin API returning them?');
    console.log('   3. Is the user balance correct in different APIs?');
    console.log('   4. Does creating a new withdrawal make it appear?');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the debug
debugAdminDashboard();
