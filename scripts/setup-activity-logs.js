/**
 * Setup Activity Logs Table for Supabase
 * Creates the admin_activity_logs table and inserts sample data
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://pybsyzbxyliufkgywtpf.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkAndCreateTable() {
  console.log('🔧 Checking admin_activity_logs table...');
  
  // Check if table exists by querying it
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select('id')
    .limit(1);
  
  if (error) {
    console.log('⚠️ Table may not exist or has an error:', error.message);
    console.log('');
    console.log('Please create the table in Supabase SQL Editor with this SQL:');
    console.log('─'.repeat(60));
    console.log(`
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id UUID NOT NULL,
  admin_username VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255),
  action_type VARCHAR(100) NOT NULL,
  action_category VARCHAR(50) NOT NULL,
  action_description TEXT NOT NULL,
  target_user_id UUID,
  target_username VARCHAR(255),
  target_email VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_category ON admin_activity_logs(action_category);
    `);
    console.log('─'.repeat(60));
    return false;
  }
  
  console.log('✅ Table admin_activity_logs exists');
  return true;
}

async function getExistingLogs() {
  const { data, error, count } = await supabase
    .from('admin_activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Error fetching logs:', error);
    return [];
  }
  
  console.log(`📊 Found ${count || 0} existing activity logs`);
  
  if (data && data.length > 0) {
    console.log('\n📋 Latest 10 Activity Logs:');
    console.log('─'.repeat(80));
    data.forEach((log, i) => {
      console.log(`${i + 1}. [${log.action_category}] ${log.action_type}`);
      console.log(`   Admin: ${log.admin_username} | Target: ${log.target_username || 'N/A'}`);
      console.log(`   ${log.action_description}`);
      console.log(`   Time: ${new Date(log.created_at).toLocaleString()}`);
      console.log('');
    });
  }
  
  return data || [];
}

async function insertSampleLogs() {
  console.log('\n📝 Inserting sample activity logs...');
  
  // Get a superadmin user ID from the users table
  const { data: admins } = await supabase
    .from('users')
    .select('id, username, email')
    .eq('role', 'superadmin')
    .limit(1);
  
  const admin = admins?.[0] || {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'superadmin',
    email: 'admin@metachrome.io'
  };
  
  console.log(`📌 Using admin: ${admin.username} (${admin.id})`);
  
  // Get some regular users for target
  const { data: users } = await supabase
    .from('users')
    .select('id, username, email')
    .neq('role', 'superadmin')
    .limit(5);
  
  const sampleLogs = [
    {
      admin_id: admin.id,
      admin_username: admin.username,
      admin_email: admin.email,
      action_type: 'SYSTEM_STARTUP',
      action_category: 'SYSTEM',
      action_description: 'Activity logging system initialized',
      metadata: { version: '1.0.0' },
      is_deleted: false
    },
    ...(users || []).slice(0, 3).map((user, i) => ({
      admin_id: admin.id,
      admin_username: admin.username,
      admin_email: admin.email,
      action_type: ['TRADING_CONTROL_SET', 'BALANCE_UPDATED', 'VERIFICATION_APPROVED'][i],
      action_category: ['TRADING', 'BALANCE', 'VERIFICATION'][i],
      action_description: [
        `Set trading mode to NORMAL for user ${user.username}`,
        `Updated balance for user ${user.username} (+$500.00)`,
        `Approved KYC verification for user ${user.username}`
      ][i],
      target_user_id: user.id,
      target_username: user.username,
      target_email: user.email,
      metadata: [
        { previous_mode: 'normal', new_mode: 'normal' },
        { previous_balance: 1000, new_balance: 1500, change: 500 },
        { document_type: 'ID_CARD', status: 'approved' }
      ][i],
      is_deleted: false
    }))
  ];

  for (const log of sampleLogs) {
    const { error } = await supabase.from('admin_activity_logs').insert(log);
    if (error) {
      console.error(`❌ Error inserting log:`, error.message);
    } else {
      console.log(`✅ Inserted: [${log.action_category}] ${log.action_type}`);
    }
  }
}

async function main() {
  console.log('🚀 Activity Logs Setup Script\n');
  
  const tableExists = await checkAndCreateTable();
  
  if (tableExists) {
    const existingLogs = await getExistingLogs();
    
    if (existingLogs.length === 0) {
      await insertSampleLogs();
      console.log('\n✅ Sample logs inserted. Refreshing...\n');
      await getExistingLogs();
    }
  }
  
  console.log('\n✅ Setup complete!');
}

main().catch(console.error);

