const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';

async function testAdminDashboardNow() {
  try {
    console.log('🧪 Testing admin dashboard after schema fix...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Create a withdrawal directly in the database with correct schema
    console.log('1️⃣ Creating withdrawal directly in database...');
    
    const testWithdrawal = {
      id: `direct-withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: 'user-angela-1758195715',
      username: 'angela.soenoko',
      amount: 75.00,
      currency: 'USDT',
      address: 'test-address-direct',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('withdrawals')
      .insert([testWithdrawal])
      .select();
    
    if (insertError) {
      console.error('❌ Direct insertion failed:', insertError);
      return;
    }
    
    console.log('✅ Direct withdrawal created:', testWithdrawal.id);
    
    // 2. Login to admin
    console.log('2️⃣ Logging in as admin...');
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'angela.soenoko',
      password: 'newpass123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // 3. Check admin dashboard
    console.log('3️⃣ Checking admin dashboard...');
    
    const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    console.log('📊 Admin dashboard response:', pendingResponse.data);
    
    const withdrawals = pendingResponse.data.withdrawals || [];
    console.log(`💸 Pending withdrawals in admin dashboard: ${withdrawals.length}`);
    
    if (withdrawals.length > 0) {
      console.log('✅ SUCCESS: Withdrawals appear in admin dashboard!');
      withdrawals.forEach((w, i) => {
        console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
      });
      
      const ourWithdrawal = withdrawals.find(w => w.id === testWithdrawal.id);
      if (ourWithdrawal) {
        console.log('🎯 Our test withdrawal appears in the list!');
      } else {
        console.log('⚠️ Our test withdrawal not found in the list');
      }
    } else {
      console.log('❌ PROBLEM: No withdrawals appear in admin dashboard');
      
      // Double-check database directly
      console.log('🔍 Double-checking database directly...');
      
      const { data: dbData, error: dbError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (dbError) {
        console.error('❌ Database check failed:', dbError);
      } else {
        console.log(`📊 Database shows ${dbData.length} pending withdrawals:`);
        dbData.forEach((w, i) => {
          console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status})`);
        });
      }
    }
    
    // 4. Clean up test record
    console.log('🧹 Cleaning up test record...');
    await supabase.from('withdrawals').delete().eq('id', testWithdrawal.id);
    console.log('✅ Test record cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminDashboardNow();
