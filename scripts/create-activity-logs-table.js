/**
 * Script to create admin_activity_logs table in Railway PostgreSQL
 * Run this script manually: node scripts/create-activity-logs-table.js
 */

const { Client } = require('pg');

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL or SUPABASE_URL not found in environment variables');
  process.exit(1);
}

const createTableSQL = `
-- Create admin_activity_logs table to track all admin activities
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id SERIAL PRIMARY KEY,
  
  -- Admin who performed the action
  admin_id UUID NOT NULL,
  admin_username VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255),
  
  -- Action details
  action_type VARCHAR(100) NOT NULL,
  action_category VARCHAR(50) NOT NULL,
  action_description TEXT NOT NULL,
  
  -- Target user (if applicable)
  target_user_id UUID,
  target_username VARCHAR(255),
  target_email VARCHAR(255),
  
  -- Action metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- IP address and user agent for security
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Prevent deletion
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_user_id ON admin_activity_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_category ON admin_activity_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_metadata ON admin_activity_logs USING GIN (metadata);
`;

async function createTable() {
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

    console.log('📝 Creating admin_activity_logs table...');
    await client.query(createTableSQL);
    console.log('✅ admin_activity_logs table created successfully!');

    // Verify table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'admin_activity_logs'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: admin_activity_logs table exists');
    } else {
      console.log('⚠️ Warning: Could not verify table creation');
    }

  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Database connection closed');
  }
}

// Run the script
createTable();

