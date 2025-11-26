/**
 * Migration: Create admin_activity_logs table
 * This migration creates the activity logs table in Railway PostgreSQL database
 * Run automatically on server startup if table doesn't exist
 */

import { supabaseAdmin } from '../../lib/supabase';

export async function createActivityLogsTable(): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('⚠️ Supabase admin client not available, skipping activity logs table creation');
    return;
  }

  try {
    console.log('🔄 Checking if admin_activity_logs table exists...');

    // Check if table exists
    const { data: tables, error: checkError } = await supabaseAdmin
      .from('admin_activity_logs')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ admin_activity_logs table already exists');
      return;
    }

    // Table doesn't exist, create it
    console.log('📝 Creating admin_activity_logs table...');

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
        is_deleted BOOLEAN DEFAULT FALSE,
        
        CONSTRAINT fk_admin
          FOREIGN KEY(admin_id) 
          REFERENCES users(id)
          ON DELETE SET NULL
      );

      -- Create indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_user_id ON admin_activity_logs(target_user_id);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_category ON admin_activity_logs(action_category);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_metadata ON admin_activity_logs USING GIN (metadata);
    `;

    // Execute SQL using Supabase RPC or direct SQL
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });

    if (createError) {
      console.error('❌ Failed to create admin_activity_logs table:', createError);
      throw createError;
    }

    console.log('✅ admin_activity_logs table created successfully!');
  } catch (error) {
    console.error('❌ Error in createActivityLogsTable migration:', error);
    // Don't throw - allow server to continue even if migration fails
  }
}

/**
 * Alternative method: Create table using raw SQL query
 * Use this if RPC method doesn't work
 */
export async function createActivityLogsTableRaw(): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('⚠️ Supabase admin client not available');
    return;
  }

  try {
    console.log('🔄 Creating admin_activity_logs table (raw SQL method)...');

    // Try to insert a test record to check if table exists
    const { error: testError } = await supabaseAdmin
      .from('admin_activity_logs')
      .select('id')
      .limit(1);

    if (!testError) {
      console.log('✅ admin_activity_logs table already exists');
      return;
    }

    console.log('⚠️ Table does not exist. Please create it manually using Railway dashboard or CLI.');
    console.log('📄 SQL script location: CREATE_ADMIN_ACTIVITY_LOGS_TABLE.sql');
  } catch (error) {
    console.error('❌ Error checking admin_activity_logs table:', error);
  }
}

