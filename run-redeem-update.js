import postgres from 'postgres';
import fs from 'fs';

const databaseUrl = 'postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres';
const sql = postgres(databaseUrl);

async function updateRedeemCodes() {
  try {
    console.log('🔄 Updating redeem codes to instant bonus (no conditions)...\n');

    // Read and execute SQL file
    const sqlContent = fs.readFileSync('SAFE_UPDATE_REDEEM_CONDITIONS.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim().startsWith('--')) continue; // Skip comments
      await sql.unsafe(statement);
    }

    console.log('✅ SQL script executed successfully!\n');

    // Verify the updates
    const codes = await sql`
      SELECT code, bonus_amount, description, code_type, 
             min_deposit_amount, accumulated_deposit_required, 
             referrals_required, min_loss_amount, trades_for_withdrawal,
             max_uses, current_uses
      FROM redeem_codes
      ORDER BY bonus_amount
    `;

    console.log('📋 Updated Redeem Codes:\n');
    console.table(codes.map(c => ({
      Code: c.code,
      Bonus: c.bonus_amount + ' USDT',
      Type: c.code_type,
      'Min Deposit': c.min_deposit_amount,
      'Acc. Deposit': c.accumulated_deposit_required,
      'Referrals': c.referrals_required,
      'Min Loss': c.min_loss_amount,
      'Trades Req': c.trades_for_withdrawal,
      'Uses': `${c.current_uses}/${c.max_uses}`,
      Description: c.description
    })));

    console.log('\n✅ All redeem codes updated to INSTANT bonus with NO conditions!');
    console.log('   - No deposit requirements');
    console.log('   - No referral requirements');
    console.log('   - No loss requirements');
    console.log('   - No trades required to unlock bonus');
    console.log('   - Bonus added instantly to balance upon redemption\n');

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

updateRedeemCodes()
  .then(() => {
    console.log('✅ Update completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });

