import postgres from 'postgres';

// Test both URL formats
const originalURL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
const encodedURL = "postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function testConnection(url, name) {
  console.log(`\n🔍 Testing ${name}...`);
  console.log(`URL: ${url}`);
  
  try {
    const client = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    // Try a simple query
    const result = await client`SELECT 1 as test`;
    console.log(`✅ ${name} - Connection successful!`);
    console.log(`Result:`, result);
    
    // Try to check if users table exists
    try {
      const tables = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `;
      
      if (tables.length > 0) {
        console.log(`✅ ${name} - Users table exists!`);
        
        // Try to get table structure
        const columns = await client`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'users'
          ORDER BY ordinal_position
        `;
        console.log(`📋 ${name} - Users table columns:`, columns);
      } else {
        console.log(`⚠️ ${name} - Users table does not exist`);
      }
    } catch (tableError) {
      console.log(`⚠️ ${name} - Could not check table structure:`, tableError.message);
    }
    
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ ${name} - Connection failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🗄️ Testing Supabase database connections...\n');
  
  const originalResult = await testConnection(originalURL, "Original URL");
  const encodedResult = await testConnection(encodedURL, "URL Encoded");
  
  console.log('\n📊 Summary:');
  console.log(`Original URL: ${originalResult ? '✅ Success' : '❌ Failed'}`);
  console.log(`Encoded URL: ${encodedResult ? '✅ Success' : '❌ Failed'}`);
  
  if (!originalResult && !encodedResult) {
    console.log('\n💡 Recommendations:');
    console.log('1. Check if the Supabase project is still active');
    console.log('2. Verify the database credentials');
    console.log('3. Check if the database instance is paused');
    console.log('4. Consider creating a new Supabase project');
  }
}

main().catch(console.error);
