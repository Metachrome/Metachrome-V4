const postgres = require('postgres');

const sql = postgres('postgresql://postgres:CnFPuAvDOsXdezuAFuimMmzZqMWVilnq@maglev.proxy.rlwy.net:15581/railway');

async function updateAndCheckPassword() {
  try {
    // Find superadmin user ID
    const [superadmin] = await sql`SELECT id, username, plain_password FROM users WHERE username = 'superadmin'`;

    if (!superadmin) {
      console.log('❌ Superadmin not found');
      return;
    }

    console.log('🔄 Current superadmin plain_password:', superadmin.plain_password || '(not set)');

    // Update plain_password directly to verify it works
    console.log('🔄 Updating superadmin plain_password to "superadmin123"...');
    await sql`UPDATE users SET plain_password = 'superadmin123' WHERE username = 'superadmin'`;

    // Verify update
    const [updated] = await sql`SELECT id, username, plain_password FROM users WHERE username = 'superadmin'`;
    console.log('✅ Updated superadmin plain_password:', updated.plain_password);

    // Now check all users
    console.log('\n📊 All users with plain_password:\n');
    const users = await sql`
      SELECT username, email, plain_password
      FROM users
      ORDER BY username
    `;

    for (const user of users) {
      const uname = (user.username || user.email || 'unknown').substring(0, 30);
      const pwd = user.plain_password || '(not set)';
      console.log(`${uname.padEnd(35)} ${pwd}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

updateAndCheckPassword();

