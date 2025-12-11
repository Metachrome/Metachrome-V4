import postgres from 'postgres';

const databaseUrl = 'postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres';
const sql = postgres(databaseUrl);

async function updateCodeTypes() {
  try {
    console.log('🔧 Updating redeem code types...\n');

    // Update BONUS500 to use 'single_deposit' type
    console.log('📝 Updating BONUS500 to single_deposit type...');
    await sql`
      UPDATE redeem_codes
      SET code_type = 'single_deposit'
      WHERE code = 'BONUS500'
    `;
    console.log('✅ BONUS500 updated to single_deposit type\n');

    // Update LETSGO1000 to use 'single_deposit' type
    console.log('📝 Updating LETSGO1000 to single_deposit type...');
    await sql`
      UPDATE redeem_codes
      SET code_type = 'single_deposit'
      WHERE code = 'LETSGO1000'
    `;
    console.log('✅ LETSGO1000 updated to single_deposit type\n');

    // Show updated codes
    console.log('📋 Updated redeem codes:');
    const codes = await sql`
      SELECT code, bonus_amount, code_type, min_deposit_amount, 
             accumulated_deposit_required, trades_for_withdrawal
      FROM redeem_codes
      WHERE code IN ('BONUS500', 'LETSGO1000')
    `;

    console.table(codes.map(c => ({
      Code: c.code,
      Bonus: c.bonus_amount + ' USDT',
      Type: c.code_type,
      'Min Single Deposit': c.min_deposit_amount ? c.min_deposit_amount + ' USDT' : 'None',
      'Accumulated': c.accumulated_deposit_required ? c.accumulated_deposit_required + ' USDT' : 'None',
      'Trades': c.trades_for_withdrawal || 0
    })));

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

updateCodeTypes()
  .then(() => {
    console.log('\n✅ Code types updated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to update code types:', error);
    process.exit(1);
  });

