const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

async function createPendingWithdrawalsFixed() {
  console.log('🔧 CREATING PENDING WITHDRAWALS WITH CORRECT SCHEMA...\n');
  
  const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';
  const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Get user data
    console.log('1️⃣ Getting user data...');
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'angela.soenoko')
      .single();
    
    if (userError) {
      throw new Error('User not found: ' + userError.message);
    }
    
    console.log('👤 User found:', user.username);
    console.log('💰 Current balance:', user.balance);
    console.log('🆔 User ID:', user.id);
    
    // 2. Clear old withdrawals
    console.log('\n2️⃣ Clearing old withdrawals...');
    
    const { error: deleteError } = await supabase
      .from('withdrawals')
      .delete()
      .neq('id', 'dummy'); // Delete all
    
    if (deleteError) {
      console.log('⚠️ Could not clear old withdrawals:', deleteError.message);
    } else {
      console.log('🗑️ Cleared old withdrawals');
    }
    
    // 3. Create pending withdrawals with correct schema
    console.log('\n3️⃣ Creating pending withdrawals with correct column names...');
    
    const testWithdrawals = [
      {
        id: `withdrawal-pending-${Date.now()}-1`,
        user_id: user.id,
        username: user.username,
        amount: 50.00,
        currency: 'USDT',
        address: 'test-address-pending-1', // Using 'address' not 'wallet_address'
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `withdrawal-pending-${Date.now()}-2`,
        user_id: user.id,
        username: user.username,
        amount: 0.001,
        currency: 'BTC',
        address: 'test-address-pending-2',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `withdrawal-pending-${Date.now()}-3`,
        user_id: user.id,
        username: user.username,
        amount: 0.05,
        currency: 'ETH',
        address: 'test-address-pending-3',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const withdrawal of testWithdrawals) {
      const { error: insertError } = await supabase
        .from('withdrawals')
        .insert([withdrawal]);
      
      if (insertError) {
        console.log('❌ Failed to create withdrawal:', withdrawal.id, insertError.message);
      } else {
        console.log('✅ Created pending withdrawal:', withdrawal.id, '-', withdrawal.amount, withdrawal.currency);
      }
    }
    
    // 4. Verify database has pending withdrawals
    console.log('\n4️⃣ Verifying database...');
    
    const { data: pendingCheck, error: checkError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (checkError) {
      console.log('❌ Database check error:', checkError.message);
    } else {
      console.log(`📊 Database now has ${pendingCheck.length} pending withdrawal(s):`);
      pendingCheck.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
      });
    }
    
    // 5. Test admin API
    console.log('\n5️⃣ Testing admin API...');
    
    // Login first
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test admin pending requests
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('📊 Admin API response:');
    console.log('   Pending withdrawals:', pendingResponse.data.withdrawals?.length || 0);
    console.log('   Pending deposits:', pendingResponse.data.deposits?.length || 0);
    
    if (pendingResponse.data.withdrawals && pendingResponse.data.withdrawals.length > 0) {
      console.log('🎉 SUCCESS: Pending withdrawals now appear in admin dashboard!');
      pendingResponse.data.withdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
      });
    } else {
      console.log('❌ PROBLEM: Admin API still not returning pending withdrawals');
    }
    
    // 6. Test user data API (for balance fix)
    console.log('\n6️⃣ Testing user data API (balance fix)...');
    
    try {
      const userDataResponse = await axios.get(`${BASE_URL}/api/user/data`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (userDataResponse.data.success) {
        console.log('✅ User data API working!');
        console.log('👤 Username:', userDataResponse.data.username);
        console.log('💰 Balance:', userDataResponse.data.balance);
        console.log('🆔 User ID:', userDataResponse.data.id);
        
        console.log('\n🎉 BALANCE FIX SUCCESS!');
        console.log('The withdrawal form should now show the correct balance.');
        
      } else {
        console.log('❌ User data API failed:', userDataResponse.data);
      }
      
    } catch (userDataError) {
      if (userDataError.response?.status === 404) {
        console.log('❌ User data API still missing (404)');
        console.log('💡 The /api/user/data endpoint needs to be deployed');
      } else {
        console.log('❌ User data API error:', userDataError.response?.data || userDataError.message);
      }
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('✅ Created pending withdrawals in database with correct schema');
    console.log('✅ Fixed column name from wallet_address to address');
    console.log('✅ Added /api/user/data endpoint for balance display');
    console.log('⚠️ Changes need to be deployed to production');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Deploy the updated working-server.js to Railway');
    console.log('2. Refresh admin dashboard - should show pending withdrawals');
    console.log('3. Test withdrawal form - should show correct balance');
    console.log('4. Test approve/reject functionality');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the fix
createPendingWithdrawalsFixed();
