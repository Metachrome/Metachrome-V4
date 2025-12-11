import postgres from 'postgres';

const databaseUrl = 'postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres';
const sql = postgres(databaseUrl);

async function fixBraffBalance() {
  try {
    console.log('🔧 Fixing balance for user braff (brafford92@gmail.com)...\n');

    const userId = '04208572-b9f2-448b-84a0-9846e6fb6cb0';

    // Get current balance
    const users = await sql`
      SELECT id, username, email, balance
      FROM users 
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      console.log('❌ User not found!');
      await sql.end();
      return;
    }

    const user = users[0];
    console.log('📊 Current user data:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current balance: ${user.balance} USDT`);
    console.log('');

    // Calculate correct balance
    const deposits = await sql`
      SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total
      FROM transactions
      WHERE user_id = ${userId} AND type = 'deposit' AND status = 'completed'
    `;
    
    const withdrawals = await sql`
      SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total
      FROM transactions
      WHERE user_id = ${userId} AND type = 'withdraw' AND status = 'completed'
    `;

    const totalDeposits = parseFloat(deposits[0].total);
    const totalWithdrawals = parseFloat(withdrawals[0].total);
    const correctBalance = totalDeposits - totalWithdrawals;

    console.log('🧮 Balance calculation:');
    console.log(`   Total deposits: ${totalDeposits} USDT`);
    console.log(`   Total withdrawals: ${totalWithdrawals} USDT`);
    console.log(`   Correct balance: ${correctBalance} USDT`);
    console.log(`   Current balance: ${user.balance} USDT`);
    console.log(`   Difference: ${(parseFloat(user.balance) - correctBalance).toFixed(2)} USDT`);
    console.log('');

    // Update balance in users table
    console.log(`🔄 Updating balance from ${user.balance} to ${correctBalance.toFixed(2)} USDT...`);
    
    await sql`
      UPDATE users
      SET balance = ${correctBalance.toFixed(2)}
      WHERE id = ${userId}
    `;

    console.log('✅ Balance updated in users table');

    // Update or create balance in balances table
    const existingBalance = await sql`
      SELECT * FROM balances
      WHERE user_id = ${userId} AND symbol = 'USDT'
    `;

    if (existingBalance.length > 0) {
      await sql`
        UPDATE balances
        SET available = ${correctBalance.toFixed(2)},
            locked = '0.00',
            updated_at = NOW()
        WHERE user_id = ${userId} AND symbol = 'USDT'
      `;
      console.log('✅ Balance updated in balances table');
    } else {
      await sql`
        INSERT INTO balances (user_id, symbol, available, locked, updated_at)
        VALUES (${userId}, 'USDT', ${correctBalance.toFixed(2)}, '0.00', NOW())
      `;
      console.log('✅ Balance created in balances table');
    }

    // Verify the update
    const updatedUser = await sql`
      SELECT balance FROM users WHERE id = ${userId}
    `;

    const updatedBalance = await sql`
      SELECT available FROM balances WHERE user_id = ${userId} AND symbol = 'USDT'
    `;

    console.log('');
    console.log('✅ Verification:');
    console.log(`   users.balance: ${updatedUser[0].balance} USDT`);
    console.log(`   balances.available: ${updatedBalance.length > 0 ? updatedBalance[0].available : 'N/A'} USDT`);
    console.log('');
    console.log('✅ Balance correction completed successfully!');

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

fixBraffBalance()
  .then(() => {
    console.log('\n✅ Fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });

