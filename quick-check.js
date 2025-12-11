require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function check() {
  try {
    // Get user
    const users = await sql`SELECT id, email FROM users WHERE email = 'demotiga@demo.com'`;
    if (users.length === 0) {
      console.log('User not found');
      await sql.end();
      return;
    }
    
    const user = users[0];
    console.log('User:', user);
    
    // Get trades
    const trades = await sql`
      SELECT id, symbol, direction, amount, status, result, profit, created_at
      FROM trades 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;
    
    console.log('\nTotal trades:', trades.length);
    console.log('\nTrades:');
    trades.forEach(t => {
      console.log(`- ${t.id.substring(0, 8)}: ${t.symbol} ${t.direction} ${t.amount} - Status: ${t.status}, Result: ${t.result}, Profit: ${t.profit}`);
    });
    
    // Filter completed with result
    const completed = trades.filter(t => 
      t.status === 'completed' && 
      t.result && 
      ['win', 'lose', 'normal'].includes(t.result.toLowerCase())
    );
    
    console.log('\nCompleted trades with valid result:', completed.length);
    console.log('Can withdraw:', completed.length >= 2 ? 'YES' : 'NO');
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

check();

