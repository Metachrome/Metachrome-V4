/**
 * Script to add password column to users table in Railway PostgreSQL
 * Run this script: railway run node scripts/add-password-column.js
 */

const { Client } = require('pg');

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL or SUPABASE_URL not found in environment variables');
  process.exit(1);
}

const addPasswordColumnSQL = `
-- Add password column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password VARCHAR(255);
    RAISE NOTICE 'Password column added successfully';
  ELSE
    RAISE NOTICE 'Password column already exists';
  END IF;
END $$;
`;

async function addPasswordColumn() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('📝 Adding password column to users table...');
    await client.query(addPasswordColumnSQL);
    console.log('✅ Password column migration completed!');

    // Verify column was added
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: password column exists');
      console.log('   Column details:', result.rows[0]);
    } else {
      console.log('⚠️ Warning: Could not verify password column');
    }

  } catch (error) {
    console.error('❌ Error adding password column:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Database connection closed');
  }
}

// Run the script
addPasswordColumn();

