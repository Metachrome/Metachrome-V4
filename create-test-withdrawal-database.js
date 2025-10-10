const { createClient } = require('@supabase/supabase-js');

async function createTestWithdrawal() {
  console.log('🧪 CREATING TEST WITHDRAWAL IN DATABASE...\n');
  
  const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Check if withdrawals table exists
    console.log('1️⃣ Checking withdrawals table...');
    
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'withdrawals');
    
    if (tableError) {
      console.log('⚠️ Could not check table existence:', tableError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Withdrawals table exists');
    } else {
      console.log('❌ Withdrawals table does not exist');
      console.log('💡 Need to create withdrawals table first');
      
      // Create withdrawals table
      console.log('\n2️⃣ Creating withdrawals table...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS withdrawals (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            username TEXT NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            currency TEXT NOT NULL DEFAULT 'USDT',
            wallet_address TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            user_balance DECIMAL(15,2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          )
        `
      });
      
      if (createError) {
        console.log('❌ Failed to create withdrawals table:', createError.message);
        return;
      } else {
        console.log('✅ Withdrawals table created');
      }
    }
    
    // 2. Find angela.soenoko user
    console.log('\n3️⃣ Finding angela.soenoko user...');
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, balance')
      .eq('username', 'angela.soenoko')
      .limit(1);
    
    if (userError) {
      console.log('❌ Error finding user:', userError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ angela.soenoko user not found in database');
      return;
    }
    
    const user = users[0];
    console.log('✅ Found user:', user.username);
    console.log('💰 User balance:', user.balance);
    console.log('👤 User ID:', user.id);
    
    // 3. Clear any existing test withdrawals
    console.log('\n4️⃣ Clearing existing test withdrawals...');
    
    const { error: deleteError } = await supabase
      .from('withdrawals')
      .delete()
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.log('⚠️ Could not clear existing withdrawals:', deleteError.message);
    } else {
      console.log('✅ Cleared existing withdrawals');
    }
    
    // 4. Check withdrawals table structure
    console.log('\n4️⃣ Checking withdrawals table structure...');

    const { data: columns, error: columnError } = await supabase
      .from('withdrawals')
      .select('*')
      .limit(0);

    if (columnError) {
      console.log('⚠️ Could not check table structure, proceeding with basic structure');
    }

    // 5. Create test withdrawal
    console.log('\n5️⃣ Creating test withdrawal...');

    const testWithdrawal = {
      id: `test-withdrawal-${Date.now()}`,
      user_id: user.id,
      username: user.username,
      amount: 100.00,
      currency: 'USDT',
      address: 'test-wallet-address-for-admin-dashboard', // Try 'address' instead of 'wallet_address'
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('withdrawals')
      .insert([testWithdrawal])
      .select();
    
    if (insertError) {
      console.log('❌ Failed to create test withdrawal:', insertError.message);
      return;
    }
    
    console.log('✅ Test withdrawal created successfully!');
    console.log('📋 Withdrawal details:');
    console.log(`   ID: ${testWithdrawal.id}`);
    console.log(`   User: ${testWithdrawal.username}`);
    console.log(`   Amount: ${testWithdrawal.amount} ${testWithdrawal.currency}`);
    console.log(`   Status: ${testWithdrawal.status}`);
    console.log(`   Address: ${testWithdrawal.address}`);
    
    // 5. Verify withdrawal was created
    console.log('\n6️⃣ Verifying withdrawal in database...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending');
    
    if (verifyError) {
      console.log('❌ Error verifying withdrawal:', verifyError.message);
    } else {
      console.log(`✅ Found ${verifyData.length} pending withdrawal(s) in database`);
      
      if (verifyData.length > 0) {
        verifyData.forEach((w, i) => {
          console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
        });
      }
    }
    
    // 6. Test admin API
    console.log('\n7️⃣ Testing admin API to see if withdrawal appears...');
    
    const axios = require('axios');
    const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
    
    try {
      // Login first
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'angela.soenoko',
        password: 'newpass123'
      });
      
      if (loginResponse.data.success) {
        const authToken = loginResponse.data.token;
        
        // Check admin pending requests
        const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const withdrawals = pendingResponse.data.withdrawals || [];
        console.log(`📊 Admin API shows ${withdrawals.length} pending withdrawal(s)`);
        
        if (withdrawals.length > 0) {
          console.log('✅ SUCCESS: Withdrawal appears in admin dashboard!');
          withdrawals.forEach((w, i) => {
            console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
          });
        } else {
          console.log('❌ PROBLEM: Withdrawal does not appear in admin dashboard');
          console.log('   This indicates an issue with the admin API or database sync');
        }
      } else {
        console.log('❌ Could not login to test admin API');
      }
    } catch (apiError) {
      console.log('❌ Error testing admin API:', apiError.message);
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('✅ Test withdrawal created in database');
    console.log('🔍 Check the admin dashboard now to see if it appears');
    console.log('💡 If it appears: Database sync is working, issue was with withdrawal creation');
    console.log('💡 If it doesn\'t appear: Issue is with admin dashboard API or database connection');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
createTestWithdrawal();
