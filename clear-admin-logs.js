import pg from 'pg';
import readline from 'readline';

const { Pool } = pg;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗑️  Clear Admin Activity Logs\n');
console.log('📋 Instructions:');
console.log('1. Open Railway Dashboard → metachrome-db → Variables tab');
console.log('2. Copy the DATABASE_URL value');
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

  const pool = new Pool({
    connectionString: databaseUrl.trim(),
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('\n🔗 Connecting to Railway PostgreSQL...');

    // Get count before deletion
    const countResult = await pool.query('SELECT COUNT(*) FROM admin_activity_logs');
    const totalLogs = parseInt(countResult.rows[0].count);

    console.log(`📊 Found ${totalLogs} admin activity logs`);

    if (totalLogs === 0) {
      console.log('✅ No logs to delete');
      rl.close();
      await pool.end();
      process.exit(0);
    }

    // Confirm deletion
    rl.question(`\n⚠️  Are you sure you want to delete all ${totalLogs} logs? (yes/no): `, async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Deletion cancelled');
        rl.close();
        await pool.end();
        process.exit(0);
      }

      try {
        console.log('\n🗑️  Deleting all admin activity logs...');
        await pool.query('DELETE FROM admin_activity_logs');

        console.log(`✅ Successfully deleted ${totalLogs} admin activity logs`);

        // Verify deletion
        const verifyResult = await pool.query('SELECT COUNT(*) FROM admin_activity_logs');
        const remainingLogs = parseInt(verifyResult.rows[0].count);

        console.log(`📊 Remaining logs: ${remainingLogs}`);

        if (remainingLogs === 0) {
          console.log('✅ All logs cleared successfully!');
        } else {
          console.log('⚠️  Warning: Some logs may still remain');
        }

      } catch (error) {
        console.error('❌ Delete failed:', error.message);
        process.exit(1);
      } finally {
        rl.close();
        await pool.end();
      }
    });

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    rl.close();
    await pool.end();
    process.exit(1);
  }
});

