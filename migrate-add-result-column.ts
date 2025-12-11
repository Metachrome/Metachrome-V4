import dotenv from "dotenv";
import postgres from "postgres";

// Load environment variables
dotenv.config();

async function migrateAddResultColumn() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🔄 Starting database migration: Adding result column to trades table...');

    // Check if result column exists
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'trades' AND column_name = 'result'
    `;

    if (columnCheck.length === 0) {
      console.log('➕ Adding result column to trades table...');
      await sql`
        ALTER TABLE trades
        ADD COLUMN result VARCHAR(10) CHECK (result IN ('win', 'lose', 'normal'))
      `;
      console.log('✅ Result column added successfully');

      // Update existing completed trades to have a result based on their profit
      console.log('🔄 Updating existing completed trades with result values...');
      await sql`
        UPDATE trades
        SET result = CASE
          WHEN status = 'completed' AND profit IS NOT NULL AND profit::numeric > 0 THEN 'win'
          WHEN status = 'completed' AND profit IS NOT NULL AND profit::numeric < 0 THEN 'lose'
          WHEN status = 'completed' THEN 'normal'
          ELSE NULL
        END
        WHERE result IS NULL
      `;
      console.log('✅ Existing trades updated with result values');
    } else {
      console.log('✅ Result column already exists');
    }

    console.log('🎉 Database migration completed successfully!');

    // Show sample of updated trades
    console.log('\n📊 Sample of trades with result:');
    const sampleTrades = await sql`
      SELECT id, status, result, profit, amount
      FROM trades
      WHERE status = 'completed'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    console.table(sampleTrades);

    // Count trades by result
    console.log('\n📊 Trade counts by result:');
    const resultCounts = await sql`
      SELECT result, COUNT(*) as count
      FROM trades
      WHERE status = 'completed'
      GROUP BY result
    `;
    console.table(resultCounts);

    await sql.end();

  } catch (error) {
    console.error('❌ Error during migration:', error);
    await sql.end();
    throw error;
  }
}

migrateAddResultColumn()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });

