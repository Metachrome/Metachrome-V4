/**
 * Script to create an admin user in Supabase
 * 
 * Admin user has restricted access:
 * - Cannot change user wallet addresses
 * - Cannot see superadmin users in the user list
 * - Can manage regular users, trades, deposits, withdrawals
 * 
 * Usage: node create-admin-user.js
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('username', 'admin')
      .single();

    if (existingUser) {
      console.log('⚠️  Admin user already exists:');
      console.log('   ID:', existingUser.id);
      console.log('   Username:', existingUser.username);
      console.log('   Role:', existingUser.role);
      
      // Update role if it's not 'admin'
      if (existingUser.role !== 'admin') {
        console.log('🔧 Updating role to "admin"...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('❌ Error updating role:', updateError);
        } else {
          console.log('✅ Role updated to "admin"');
        }
      }
      
      return;
    }

    // Hash password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Password hashed');

    // Create admin user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          email: 'admin@metachrome.com',
          password: hashedPassword,
          role: 'admin',  // Regular admin, not super_admin
          balance: 50000,
          status: 'active',
          trading_mode: 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating admin user:', insertError);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Admin User Details:');
    console.log('   ID:', newUser.id);
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email:', newUser.email);
    console.log('   Role:', newUser.role);
    console.log('   Balance:', newUser.balance);
    console.log('');
    console.log('🔗 Login URL: https://metachrome.io/admin-staff/login');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');
    console.log('🔒 Admin Restrictions:');
    console.log('   ✗ Cannot change user wallet addresses');
    console.log('   ✗ Cannot see superadmin users');
    console.log('   ✓ Can manage regular users');
    console.log('   ✓ Can control trading modes');
    console.log('   ✓ Can manage deposits/withdrawals');
    console.log('   ✓ Can view activity logs');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('');
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

