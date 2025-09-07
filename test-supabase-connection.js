import postgres from 'postgres';

async function testSupabaseConnection() {
  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
  
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const client = postgres(DATABASE_URL);
    
    // Test basic connection
    const result = await client`SELECT version()`;
    console.log('✅ Database connected successfully!');
    console.log('📊 PostgreSQL version:', result[0].version);
    
    // Check if tables exist
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Tables in database:', tables.length);
    tables.forEach(table => console.log(`   - ${table.table_name}`));
    
    // Check users table
    try {
      const users = await client`SELECT * FROM users LIMIT 5`;
      console.log('👥 Users in database:', users.length);
      users.forEach(user => console.log(`   - ${user.username} (${user.role})`));
    } catch (error) {
      console.log('⚠️ Users table not found or empty');
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testSupabaseConnection();
