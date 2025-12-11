require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function verify() {
  try {
    console.log('🔍 Verifying result field in production database...\n');
    
    // 1. Check if result column exists
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'trades' AND column_name = 'result'
    `;
    
    if (columns.length === 0) {
      console.log('❌ ERROR: result column does NOT exist in trades table!');
      console.log('   You need to run the migration: npx tsx migrate-add-result-column.ts');
      await sql.end();
      return;
    }
    
    console.log('✅ result column exists:', columns[0]);
    
    // 2. Check distribution of result values
    const distribution = await sql`
      SELECT 
        result,
        COUNT(*) as count
      FROM trades
      WHERE status = 'completed'
      GROUP BY result
      ORDER BY count DESC
    `;
    
    console.log('\n📊 Result distribution for completed trades:');
    distribution.forEach(row => {
      console.log(`   ${row.result || 'NULL'}: ${row.count} trades`);
    });
    
    // 3. Check specific user demotiga@demo.com
    const users = await sql`SELECT id, email FROM users WHERE email = 'demotiga@demo.com'`;
    
    if (users.length > 0) {
      const user = users[0];
      console.log(`\n👤 Checking user: ${user.email}`);
      
      const trades = await sql`
        SELECT id, symbol, direction, amount, status, result, profit, created_at
        FROM trades 
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;
      
      console.log(`   Total trades: ${trades.length}`);
      
      const completed = trades.filter(t => 
        t.status === 'completed' && 
        t.result && 
        ['win', 'lose', 'normal'].includes(t.result.toLowerCase())
      );
      
      console.log(`   Completed with valid result: ${completed.length}`);
      console.log(`   Can withdraw: ${completed.length >= 2 ? '✅ YES' : '❌ NO'}`);
      
      if (trades.length > 0) {
        console.log('\n   Trade details:');
        trades.forEach((t, i) => {
          console.log(`   ${i+1}. ${t.symbol} ${t.direction} ${t.amount} - Status: ${t.status}, Result: ${t.result || 'NULL'}`);
        });
      }
    } else {
      console.log('\n⚠️  User demotiga@demo.com not found');
    }
    
    // 4. Check if there are any completed trades without result
    const missingResult = await sql`
      SELECT COUNT(*) as count
      FROM trades
      WHERE status = 'completed' AND result IS NULL
    `;
    
    console.log(`\n⚠️  Completed trades without result: ${missingResult[0].count}`);
    
    if (parseInt(missingResult[0].count) > 0) {
      console.log('   These trades need to be updated. Run migration to fix.');
    }
    
    await sql.end();
    console.log('\n✅ Verification complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
  }
}

verify();

