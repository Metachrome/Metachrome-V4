// Check user password for angela.soenoko
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabase = createClient(
  'https://pybsyzbxyliufkgywtpf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE'
);

async function checkUserPassword() {
  console.log('🔍 Testing login credentials...\n');

  try {
    // Test superadmin login
    console.log('👑 Testing superadmin login...');
    const { data: superadmin, error: superadminError } = await supabase
      .from('users')
      .select('username, password_hash, role')
      .eq('username', 'superadmin')
      .single();

    if (superadminError) {
      console.error('❌ Superadmin error:', superadminError);
    } else {
      console.log('✅ Superadmin found:', {
        username: superadmin.username,
        role: superadmin.role,
        hasPassword: !!superadmin.password_hash
      });

      // Test common passwords for superadmin
      const testPasswords = ['superadmin123', 'admin123', 'password123', 'superadmin', '123456'];

      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, superadmin.password_hash);
          if (isMatch) {
            console.log(`✅ SUPERADMIN PASSWORD FOUND: "${testPassword}"`);
            break;
          } else {
            console.log(`❌ "${testPassword}" - no match`);
          }
        } catch (err) {
          console.log(`❌ "${testPassword}" - error testing`);
        }
      }
    }

    console.log('\n👤 Testing angela.soenoko login...');
    // Test angela.soenoko login
    const { data: angela, error: angelaError } = await supabase
      .from('users')
      .select('username, password_hash, role, email')
      .eq('username', 'angela.soenoko')
      .single();

    if (angelaError) {
      console.error('❌ Angela error:', angelaError);
    } else {
      console.log('✅ Angela found:', {
        username: angela.username,
        email: angela.email,
        role: angela.role,
        hasPassword: !!angela.password_hash
      });

      // Test common passwords for angela
      const testPasswords = ['password123', 'angela123', 'test123', 'admin123', '123456', 'angela.soenoko'];

      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, angela.password_hash);
          if (isMatch) {
            console.log(`✅ ANGELA PASSWORD FOUND: "${testPassword}"`);
            break;
          } else {
            console.log(`❌ "${testPassword}" - no match`);
          }
        } catch (err) {
          console.log(`❌ "${testPassword}" - error testing`);
        }
      }
    }

    console.log('\n🎯 LOGIN SUMMARY:');
    console.log('Admin Login (localhost:3333/admin/login):');
    console.log('  Username: superadmin');
    console.log('  Password: [check results above]');
    console.log('\nUser Login (localhost:3333/login):');
    console.log('  Username: angela.soenoko');
    console.log('  Password: [check results above]');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

checkUserPassword().then(() => {
  console.log('\n🏁 Password check completed');
  process.exit(0);
});
