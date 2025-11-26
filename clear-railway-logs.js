import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = 'postgresql://postgres:CnFPuAvDOsXdezuAFuimMmzZqMWVilnq@maglev.proxy.rlwy.net:15581/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function clearLogs() {
  try {
    console.log('🔗 Connecting to Railway PostgreSQL...\n');
    
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');

    // Delete all activity logs
    console.log('🗑️  Deleting all activity logs...\n');
    const result = await client.query('DELETE FROM admin_activity_logs');
    
    console.log(`✅ Deleted ${result.rowCount} activity logs\n`);
    
    // Verify
    const countResult = await client.query('SELECT COUNT(*) FROM admin_activity_logs');
    const count = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Remaining logs: ${count}\n`);
    
    if (count === 0) {
      console.log('🎉 SUCCESS! All activity logs cleared!\n');
    } else {
      console.log('⚠️  Warning: Some logs still remain\n');
    }
    
    client.release();
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

clearLogs();

