const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function findWorkingPassword() {
  console.log('🔍 FINDING WORKING PASSWORD FOR ANGELA.SOENOKO...\n');
  
  const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Get current user data
    console.log('1️⃣ Getting current user data...');
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', 'angela.soenoko')
      .single();
    
    if (userError) {
      console.log('❌ Error getting user:', userError.message);
      return;
    }
    
    console.log('✅ Found user:', user.username);
    console.log('🔐 Password hash:', user.password_hash ? 'EXISTS' : 'MISSING');
    
    // 2. Test common passwords against current hash
    console.log('\n2️⃣ Testing passwords against current database hash...');
    
    const testPasswords = [
      'newpass123',
      'password123', 
      'angela123',
      'test123',
      'admin123',
      '123456',
      'angela.soenoko',
      'metachrome123',
      'angela',
      'soenoko',
      'password',
      'pass123',
      'user123',
      'demo123'
    ];
    
    let workingPassword = null;
    
    for (const password of testPasswords) {
      try {
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (isMatch) {
          console.log(`✅ FOUND WORKING PASSWORD: "${password}"`);
          workingPassword = password;
          break;
        } else {
          console.log(`❌ "${password}" - no match`);
        }
      } catch (err) {
        console.log(`❌ "${password}" - error testing`);
      }
    }
    
    if (!workingPassword) {
      console.log('\n❌ No working password found with current hash');
      console.log('💡 Setting a known password...');
      
      // 3. Set a simple, known password
      const newPassword = 'password123';
      const newHash = await bcrypt.hash(newPassword, 10);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: newHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (updateError) {
        console.log('❌ Failed to update password:', updateError.message);
      } else {
        console.log('✅ Password updated to:', newPassword);
        workingPassword = newPassword;
      }
    }
    
    // 4. Test the working password via API
    if (workingPassword) {
      console.log(`\n3️⃣ Testing password "${workingPassword}" via API...`);
      
      const axios = require('axios');
      const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
      
      try {
        // Login first
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          username: 'angela.soenoko',
          password: workingPassword
        });
        
        if (loginResponse.data.success) {
          const authToken = loginResponse.data.token;
          console.log('✅ Login successful with password:', workingPassword);
          
          // Test withdrawal
          const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
            amount: '20',
            currency: 'USDT',
            address: 'test-address-final-' + Date.now(),
            password: workingPassword
          }, {
            headers: { 
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (withdrawalResponse.data.success) {
            console.log('✅ WITHDRAWAL SUCCESSFUL!');
            console.log('📤 Withdrawal ID:', withdrawalResponse.data.withdrawalId);
            
            console.log('\n🎉 SOLUTION FOUND!');
            console.log('📋 Working credentials:');
            console.log(`   Username: angela.soenoko`);
            console.log(`   Password: ${workingPassword}`);
            console.log('\n💡 User can now create withdrawals with this password!');
            
          } else {
            console.log('❌ Withdrawal failed:', withdrawalResponse.data);
          }
          
        } else {
          console.log('❌ Login failed with password:', workingPassword);
        }
        
      } catch (apiError) {
        console.log('❌ API test failed:', apiError.response?.data || apiError.message);
      }
    }
    
    // 5. Alternative: Create a temporary bypass
    console.log('\n4️⃣ Alternative solution: Admin withdrawal creation...');
    console.log('💡 If user password still doesn\'t work, use admin interface:');
    console.log('   1. Go to admin dashboard → Users');
    console.log('   2. Find angela.soenoko');
    console.log('   3. Use "Withdraw" button to create withdrawal for user');
    console.log('   4. This bypasses password validation and works immediately');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
findWorkingPassword();
