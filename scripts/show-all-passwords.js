const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.DATABASE_URL?.replace('postgresql://', 'https://').split('@')[1]?.split('/')[0];
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

console.log('🔍 Checking Supabase configuration...');
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Parse PostgreSQL connection string
const dbUrl = process.env.DATABASE_URL;
const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

if (!match) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

console.log('\n📊 Database Connection Info:');
console.log('Host:', host);
console.log('Port:', port);
console.log('Database:', database);
console.log('User:', user);

// Use pg client for direct PostgreSQL connection
const { Client } = require('pg');

const client = new Client({
  host,
  port: parseInt(port),
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false }
});

async function showAllPasswords() {
  try {
    console.log('\n🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Query all users with password field
    const result = await client.query(`
      SELECT
        id,
        username,
        email,
        password,
        role,
        balance,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 50
    `);

    console.log('\n📊 TOTAL USERS:', result.rows.length);
    console.log('\n' + '='.repeat(120));
    console.log('ALL USER PASSWORDS:');
    console.log('='.repeat(120));

    result.rows.forEach((user, index) => {
      console.log(`\n${index + 1}. USER: ${user.username}`);
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Balance:', user.balance);
      console.log('   Password:', user.password || 'NULL');
      console.log('   Password length:', user.password?.length || 0);
      console.log('   Created:', user.created_at);
      console.log('   ---');
    });

    console.log('\n' + '='.repeat(120));
    console.log('SUMMARY:');
    console.log('='.repeat(120));

    const withPassword = result.rows.filter(u => u.password).length;
    const withoutPassword = result.rows.filter(u => !u.password).length;

    console.log(`Users with password: ${withPassword}/${result.rows.length}`);
    console.log(`Users without password: ${withoutPassword}/${result.rows.length}`);

    await client.end();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

showAllPasswords();

