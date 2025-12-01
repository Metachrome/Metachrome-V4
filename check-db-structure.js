const postgres = require('postgres');

const sql = postgres('postgresql://postgres:CnFPuAvDOsXdezuAFuimMmzZqMWVilnq@maglev.proxy.rlwy.net:15581/railway');

async function checkAdminIds() {
  try {
    console.log('🔄 Checking admin user IDs in Railway PostgreSQL...\n');

    const admins = await sql`
      SELECT id, username, email, plain_password
      FROM users
      WHERE username IN ('superadmin', 'admin')
    `;

    console.log('📊 Current admin users:');
    for (const admin of admins) {
      console.log(`  ${admin.username}:`);
      console.log(`    ID: ${admin.id}`);
      console.log(`    Email: ${admin.email}`);
      console.log(`    Plain Password: ${admin.plain_password || '(not set)'}`);
    }

    console.log('\n⚠️ Note: These IDs are UUIDs from Railway PostgreSQL');
    console.log('The frontend uses hardcoded IDs like "superadmin-001"');
    console.log('We need to fix the login system to use real database IDs');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

checkAdminIds();

