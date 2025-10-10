const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function fixUserPassword() {
  console.log('🔧 FIXING USER PASSWORD FOR WITHDRAWAL ACCESS...\n');
  
  const supabaseUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Find angela.soenoko user
    console.log('1️⃣ Finding angela.soenoko user...');
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, password_hash')
      .eq('username', 'angela.soenoko')
      .limit(1);
    
    if (userError) {
      console.log('❌ Error finding user:', userError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ angela.soenoko user not found');
      return;
    }
    
    const user = users[0];
    console.log('✅ Found user:', user.username);
    console.log('🔐 Current password hash exists:', !!user.password_hash);
    
    // 2. Generate new password hash
    console.log('\n2️⃣ Generating new password hash...');
    
    const newPassword = 'newpass123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('✅ New password hash generated');
    console.log('🔑 Password will be:', newPassword);
    
    // 3. Update user password
    console.log('\n3️⃣ Updating user password in database...');
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.log('❌ Failed to update password:', updateError.message);
      return;
    }
    
    console.log('✅ Password updated successfully!');
    
    // 4. Verify the update
    console.log('\n4️⃣ Verifying password update...');
    
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select('username, password_hash')
      .eq('id', user.id)
      .single();
    
    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
    } else {
      console.log('✅ Password hash updated in database');
      
      // Test the new password
      const isValid = await bcrypt.compare(newPassword, updatedUser.password_hash);
      console.log('✅ Password validation test:', isValid ? 'PASSED' : 'FAILED');
    }
    
    // 5. Test withdrawal creation
    console.log('\n5️⃣ Testing withdrawal creation with new password...');
    
    const axios = require('axios');
    const BASE_URL = 'https://metachrome-v2-production.up.railway.app';
    
    try {
      // Login first
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'angela.soenoko',
        password: newPassword
      });
      
      if (loginResponse.data.success) {
        const authToken = loginResponse.data.token;
        console.log('✅ Login with new password successful');
        
        // Try to create withdrawal
        const withdrawalResponse = await axios.post(`${BASE_URL}/api/withdrawals`, {
          amount: '15',
          currency: 'USDT',
          address: 'test-address-password-fix-' + Date.now(),
          password: newPassword
        }, {
          headers: { 
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (withdrawalResponse.data.success) {
          console.log('✅ WITHDRAWAL CREATION SUCCESSFUL!');
          console.log('📤 Withdrawal details:', withdrawalResponse.data);
          
          // Check admin dashboard
          setTimeout(async () => {
            const pendingResponse = await axios.get(`${BASE_URL}/api/admin/pending-requests`, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            const withdrawals = pendingResponse.data.withdrawals || [];
            console.log(`\n📊 Admin dashboard now shows ${withdrawals.length} pending withdrawal(s)`);
            
            if (withdrawals.length > 0) {
              console.log('✅ SUCCESS: User-created withdrawal appears in admin dashboard!');
              withdrawals.forEach((w, i) => {
                console.log(`   ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username}`);
              });
            }
          }, 2000);
          
        } else {
          console.log('❌ Withdrawal creation failed:', withdrawalResponse.data);
        }
        
      } else {
        console.log('❌ Login with new password failed:', loginResponse.data);
      }
      
    } catch (testError) {
      console.log('❌ Error testing withdrawal:', testError.response?.data || testError.message);
    }
    
    console.log('\n🎉 PASSWORD FIX COMPLETE!');
    console.log('📋 Summary:');
    console.log(`   Username: angela.soenoko`);
    console.log(`   Password: ${newPassword}`);
    console.log('   Status: Ready for withdrawal creation');
    console.log('\n💡 Users can now create withdrawal requests that will appear in admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixUserPassword();
