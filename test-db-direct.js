import postgres from 'postgres';

async function testDatabaseConnection() {
  console.log('🔍 Testing direct database connection...');
  
  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
  
  try {
    const client = postgres(DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    console.log('✅ Connected to database');
    
    // Get all users
    const users = await client`SELECT * FROM users ORDER BY "createdAt" DESC`;
    
    console.log(`📊 Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - ${user.role} - Created: ${user.createdAt}`);
    });
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testDatabaseConnection();
