/**
 * Script to check password data in Railway PostgreSQL
 * Run this script: railway run node scripts/check-password-data.js
 */

const { Client } = require('pg');

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL or SUPABASE_URL not found in environment variables');
  process.exit(1);
}

async function checkPasswordData() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check 1: Does password column exist?
    console.log('📋 CHECK 1: Password Column Existence');
    console.log('━'.repeat(60));
    const columnCheck = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `);

    if (columnCheck.rows.length > 0) {
      console.log('✅ Password column EXISTS');
      console.log('   Data type:', columnCheck.rows[0].data_type);
      console.log('   Max length:', columnCheck.rows[0].character_maximum_length);
    } else {
      console.log('❌ Password column DOES NOT EXIST');
      console.log('⚠️  You need to run: railway run node scripts/add-password-column.js');
      await client.end();
      return;
    }

    // Check 2: Password statistics
    console.log('\n📊 CHECK 2: Password Statistics');
    console.log('━'.repeat(60));
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(password) as users_with_password,
        COUNT(*) - COUNT(password) as users_without_password,
        ROUND(COUNT(password)::numeric / NULLIF(COUNT(*), 0)::numeric * 100, 2) as percentage_with_password
      FROM users
    `);

    const stat = stats.rows[0];
    console.log(`Total Users:              ${stat.total_users}`);
    console.log(`Users WITH password:      ${stat.users_with_password} (${stat.percentage_with_password}%)`);
    console.log(`Users WITHOUT password:   ${stat.users_without_password}`);

    if (stat.users_without_password > 0) {
      console.log('\n⚠️  WARNING: Some users do not have passwords!');
    }

    // Check 3: Sample users with password details
    console.log('\n👥 CHECK 3: Sample Users (First 10)');
    console.log('━'.repeat(60));
    const users = await client.query(`
      SELECT 
        id, 
        username, 
        email,
        role,
        password IS NOT NULL as has_password,
        CASE 
          WHEN password IS NULL THEN 'NULL'
          WHEN password = '' THEN 'EMPTY'
          ELSE CONCAT(LENGTH(password), ' chars')
        END as password_status,
        created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    if (users.rows.length === 0) {
      console.log('⚠️  No users found in database');
    } else {
      console.table(users.rows.map(u => ({
        username: u.username,
        email: u.email || 'N/A',
        role: u.role,
        has_password: u.has_password ? '✅' : '❌',
        password_status: u.password_status,
        created: new Date(u.created_at).toLocaleDateString()
      })));
    }

    // Check 4: Users by role
    console.log('\n🔐 CHECK 4: Password Status by Role');
    console.log('━'.repeat(60));
    const byRole = await client.query(`
      SELECT 
        role,
        COUNT(*) as total,
        COUNT(password) as with_password,
        COUNT(*) - COUNT(password) as without_password
      FROM users 
      GROUP BY role
      ORDER BY role
    `);

    console.table(byRole.rows.map(r => ({
      role: r.role,
      total: r.total,
      with_password: r.with_password,
      without_password: r.without_password,
      status: r.without_password === 0 ? '✅ All OK' : '⚠️  Missing passwords'
    })));

    // Summary
    console.log('\n📝 SUMMARY');
    console.log('━'.repeat(60));
    if (stat.users_without_password === 0) {
      console.log('✅ All users have passwords!');
      console.log('✅ Password visibility feature should work correctly.');
    } else {
      console.log(`⚠️  ${stat.users_without_password} users are missing passwords.`);
      console.log('💡 These users will show empty password in admin dashboard.');
      console.log('💡 Consider updating passwords for these users.');
    }

  } catch (error) {
    console.error('❌ Error checking password data:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
checkPasswordData();

