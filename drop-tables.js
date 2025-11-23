import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function dropTables() {
  console.log('🗑️  Dropping all tables...\n');

  try {
    await pool.query(`
      DROP TABLE IF EXISTS user_redeem_history CASCADE;
      DROP TABLE IF EXISTS admin_activity_logs CASCADE;
      DROP TABLE IF EXISTS redeem_codes CASCADE;
      DROP TABLE IF EXISTS wallet_addresses CASCADE;
      DROP TABLE IF EXISTS withdrawals CASCADE;
      DROP TABLE IF EXISTS deposits CASCADE;
      DROP TABLE IF EXISTS trades CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('✅ All tables dropped successfully!');

  } catch (error) {
    console.error('❌ Drop failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

dropTables();

