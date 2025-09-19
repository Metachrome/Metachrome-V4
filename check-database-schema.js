import postgres from 'postgres';

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to Supabase...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Check what tables exist
    console.log('\n📋 Available tables:');
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Check users table structure
    console.log('\n📋 Users table columns:');
    const userColumns = await client`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    userColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check user_verification_documents table if it exists
    const docTableExists = tables.find(t => t.table_name === 'user_verification_documents');
    if (docTableExists) {
      console.log('\n📋 user_verification_documents table columns:');
      const docColumns = await client`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'user_verification_documents' AND table_schema = 'public'
        ORDER BY ordinal_position
      `;
      
      docColumns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check actual verification documents
      console.log('\n📄 Verification documents in database:');
      const docs = await client`
        SELECT * FROM user_verification_documents 
        ORDER BY created_at DESC 
        LIMIT 10
      `;
      
      if (docs.length > 0) {
        docs.forEach(doc => {
          console.log(`   - ID: ${doc.id}, User: ${doc.user_id}, Type: ${doc.document_type}, Status: ${doc.verification_status}`);
        });
      } else {
        console.log('   No verification documents found');
      }
    }
    
    // Check actual users data
    console.log('\n👥 Users in database:');
    const users = await client`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
        // Show all available columns for first user
        if (user === users[0]) {
          console.log('     Available columns:', Object.keys(user).join(', '));
        }
      });
    } else {
      console.log('   No users found');
    }
    
    await client.end();
    
    console.log('\n✅ Database schema check completed!');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
    console.error('Error details:', error.message);
  }
}

checkDatabaseSchema();
