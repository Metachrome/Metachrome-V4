import postgres from 'postgres';

async function testSupabaseUsers() {
  console.log('🔍 Testing Supabase database connection...');
  
  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
  
  try {
    const client = postgres(DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    console.log('✅ Connected to Supabase');
    
    // Test basic connection
    const version = await client`SELECT version()`;
    console.log('📊 Database version:', version[0].version.split(' ')[0]);
    
    // Check if users table exists
    const tableExists = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `;
    
    console.log('👥 Users table exists:', tableExists[0].exists);
    
    if (tableExists[0].exists) {
      // Get all users
      const users = await client`SELECT * FROM users ORDER BY "createdAt" DESC`;
      
      console.log(`📊 Found ${users.length} users in database:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}`);
        console.log(`    Username: ${user.username}`);
        console.log(`    Email: ${user.email}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Active: ${user.isActive}`);
        console.log(`    Created: ${user.createdAt}`);
        console.log('    ---');
      });
      
      // Check for admin user
      const adminUsers = await client`
        SELECT * FROM users 
        WHERE role IN ('admin', 'super_admin')
      `;
      
      console.log(`🔐 Found ${adminUsers.length} admin users:`);
      adminUsers.forEach(admin => {
        console.log(`  - ${admin.username} (${admin.role})`);
      });
      
    } else {
      console.log('❌ Users table does not exist');
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testSupabaseUsers();
