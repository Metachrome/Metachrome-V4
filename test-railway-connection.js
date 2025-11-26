import pg from 'pg';
import readline from 'readline';

const { Pool } = pg;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Railway PostgreSQL Connection Test\n');
console.log('📋 Instructions:');
console.log('1. Open Railway Dashboard → metachrome-db → Connect tab');
console.log('2. Copy the "Postgres Connection URL"');
console.log('3. Paste it below\n');

rl.question('Enter DATABASE_URL: ', async (databaseUrl) => {
  if (!databaseUrl || databaseUrl.trim() === '') {
    console.error('❌ DATABASE_URL cannot be empty');
    rl.close();
    process.exit(1);
  }

  if (!databaseUrl.startsWith('postgresql://')) {
    console.error('❌ Invalid DATABASE_URL format. Must start with postgresql://');
    rl.close();
    process.exit(1);
  }

  console.log('\n✅ DATABASE_URL set successfully!\n');

  const pool = new Pool({
    connectionString: databaseUrl.trim(),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to Railway PostgreSQL...');
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');

    // Get list of tables
    console.log('📊 Checking tables...\n');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in database!');
      console.log('⚠️  This means migration did not run on this database.\n');
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} tables:\n`);
      
      for (const row of tablesResult.rows) {
        const tableName = row.table_name;
        
        // Get row count for each table
        const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        const count = parseInt(countResult.rows[0].count);
        
        console.log(`   📋 ${tableName}: ${count} rows`);
      }
    }

    console.log('\n✅ Connection test completed!');
    
    client.release();
    await pool.end();
    rl.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\n💡 Possible issues:');
    console.log('   1. Wrong DATABASE_URL');
    console.log('   2. Database not accessible from your network');
    console.log('   3. SSL configuration issue\n');
    
    await pool.end();
    rl.close();
    process.exit(1);
  }
});

