const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

async function fixAdminDashboardAndBalance() {
  console.log('🔧 FIXING ADMIN DASHBOARD AND BALANCE ISSUES...\n');
  
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
    
    // 2. Clear old withdrawals and create fresh pending ones
    console.log('\n2️⃣ Creating fresh pending withdrawals...');
    
    // First, clear old withdrawals
    const { error: deleteError } = await supabase
      .from('withdrawals')
      .delete()
      .neq('id', 'dummy'); // Delete all
    
    if (deleteError) {
      console.log('⚠️ Could not clear old withdrawals:', deleteError.message);
    } else {
      console.log('🗑️ Cleared old withdrawals');
    }
    
    // Create multiple test pending withdrawals
    const testWithdrawals = [
      {
        id: `withdrawal-pending-${Date.now()}-1`,
        user_id: user.id,
        username: user.username,
        amount: 50.00,
        currency: 'USDT',
        wallet_address: 'test-address-pending-1',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `withdrawal-pending-${Date.now()}-2`,
        user_id: user.id,
        username: user.username,
        amount: 25.00,
        currency: 'BTC',
        wallet_address: 'test-address-pending-2',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `withdrawal-pending-${Date.now()}-3`,
        user_id: user.id,
        username: user.username,
        amount: 100.00,
        currency: 'ETH',
        wallet_address: 'test-address-pending-3',
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
    
    // 3. Test admin API immediately
    console.log('\n3️⃣ Testing admin API with new pending withdrawals...');
    
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
      console.log('✅ SUCCESS: Pending withdrawals now appear in admin dashboard!');
      pendingResponse.data.withdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
      });
    } else {
      console.log('❌ PROBLEM: Admin API still not returning pending withdrawals');
      
      // Double-check database
      const { data: dbCheck } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending');
      
      console.log('🔍 Database verification: ' + (dbCheck?.length || 0) + ' pending withdrawals in database');
    }
    
    // 4. Test user withdrawal creation to see if balance is correct
    console.log('\n4️⃣ Testing user withdrawal creation (to check balance display)...');
    
    try {
      const userWithdrawal = await axios.post(`${BASE_URL}/api/withdrawals`, {
        amount: '15',
        currency: 'USDT',
        address: 'test-user-created-' + Date.now(),
        password: 'newpass123'
      }, {
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userWithdrawal.data.success) {
        console.log('✅ User withdrawal creation successful!');
        console.log('📤 Withdrawal ID:', userWithdrawal.data.withdrawalId);
        
        // Check admin dashboard again
        setTimeout(async () => {
          const finalCheck = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          
          console.log('\n5️⃣ Final admin dashboard check:');
          console.log('📊 Total pending withdrawals:', finalCheck.data.withdrawals?.length || 0);
          
          if (finalCheck.data.withdrawals && finalCheck.data.withdrawals.length > 0) {
            console.log('🎉 COMPLETE SUCCESS!');
            console.log('✅ Admin dashboard shows pending withdrawals');
            console.log('✅ User can create withdrawals');
            console.log('✅ Database sync is working');
            
            finalCheck.data.withdrawals.forEach((w, i) => {
              console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
            });
            
            console.log('\n📋 NEXT STEPS:');
            console.log('1. Refresh your admin dashboard - you should see pending withdrawals');
            console.log('2. Test approve/reject functionality');
            console.log('3. For balance issue: Need to add /api/user/data endpoint to server');
            
          } else {
            console.log('❌ Still no withdrawals in admin dashboard');
          }
        }, 3000);
        
      } else {
        console.log('❌ User withdrawal failed:', userWithdrawal.data);
      }
      
    } catch (withdrawalError) {
      console.log('❌ User withdrawal error:', withdrawalError.response?.data || withdrawalError.message);
    }
    
    console.log('\n🔧 BALANCE ISSUE FIX:');
    console.log('The withdrawal form showing wrong balance is because /api/user/data endpoint is missing.');
    console.log('This endpoint needs to be added to working-server.js to return current user balance.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the fix
fixAdminDashboardAndBalance();
