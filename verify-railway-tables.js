import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = 'postgresql://postgres:CnFPuAvDOsXdezuAFuimMmzZqMWVilnq@maglev.proxy.rlwy.net:15581/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyTables() {
  try {
    console.log('🔗 Connecting to Railway PostgreSQL...\n');
    
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
        const countResult = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        const count = parseInt(countResult.rows[0].count);
        
        console.log(`   📋 ${tableName}: ${count} rows`);
      }
      
      console.log('\n');
      
      // Special check for activity logs
      if (tablesResult.rows.some(r => r.table_name === 'admin_activity_logs')) {
        console.log('🔍 Checking admin_activity_logs details...\n');
        const logsResult = await client.query(`
          SELECT COUNT(*) as total,
                 COUNT(*) FILTER (WHERE is_deleted = false) as active,
                 COUNT(*) FILTER (WHERE is_deleted = true) as deleted
          FROM admin_activity_logs
        `);
        
        const stats = logsResult.rows[0];
        console.log(`   Total logs: ${stats.total}`);
        console.log(`   Active logs (is_deleted=false): ${stats.active}`);
        console.log(`   Deleted logs (is_deleted=true): ${stats.deleted}\n`);
      }
    }

    console.log('✅ Verification completed!');
    
    client.release();
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

verifyTables();

