import postgres from 'postgres';

const databaseUrl = 'postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres';
const sql = postgres(databaseUrl);

async function fixRedeemCodes() {
  try {
    console.log('🔄 Updating ALL redeem codes to INSTANT bonus (no conditions)...\n');

    // Update WELCOME50
    await sql`
      UPDATE redeem_codes SET
        description = 'Welcome bonus! Get 50 USDT instantly.',
        code_type = 'standard',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 0,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 0
      WHERE code = 'WELCOME50'
    `;
    console.log('✅ Updated WELCOME50');

    // Update FIRSTBONUS
    await sql`
      UPDATE redeem_codes SET
        description = 'First bonus! Get 100 USDT instantly.',
        code_type = 'standard',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 0,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 0
      WHERE code = 'FIRSTBONUS'
    `;
    console.log('✅ Updated FIRSTBONUS');

    // Update BONUS500
    await sql`
      UPDATE redeem_codes SET
        description = 'Bonus! Get 500 USDT instantly.',
        code_type = 'standard',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 0,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 0
      WHERE code = 'BONUS500'
    `;
    console.log('✅ Updated BONUS500');

    // Update LETSGO1000
    await sql`
      UPDATE redeem_codes SET
        description = 'High value bonus! Get 1000 USDT instantly.',
        code_type = 'standard',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 0,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 0
      WHERE code = 'LETSGO1000'
    `;
    console.log('✅ Updated LETSGO1000');

    // Update CASHBACK200
    await sql`
      UPDATE redeem_codes SET
        description = 'Cashback bonus! Get 200 USDT instantly.',
        code_type = 'standard',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 0,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 0
      WHERE code = 'CASHBACK200'
    `;
    console.log('✅ Updated CASHBACK200');

    console.log('\n📋 Verifying updates...\n');

    // Verify the updates
    const codes = await sql`
      SELECT code, bonus_amount, description, code_type, 
             min_deposit_amount, accumulated_deposit_required, 
             referrals_required, min_loss_amount, trades_for_withdrawal,
             max_uses, current_uses
      FROM redeem_codes
      ORDER BY bonus_amount
    `;

    console.table(codes.map(c => ({
      Code: c.code,
      Bonus: c.bonus_amount + ' USDT',
      Type: c.code_type,
      'Min Deposit': c.min_deposit_amount,
      'Acc. Deposit': c.accumulated_deposit_required,
      'Referrals': c.referrals_required,
      'Min Loss': c.min_loss_amount,
      'Trades Req': c.trades_for_withdrawal,
      'Uses': `${c.current_uses}/${c.max_uses || '∞'}`,
      Description: c.description
    })));

    console.log('\n✅ All redeem codes updated to INSTANT bonus!');
    console.log('   ✅ No deposit requirements');
    console.log('   ✅ No referral requirements');
    console.log('   ✅ No loss requirements');
    console.log('   ✅ No trades required');
    console.log('   ✅ Bonus added instantly to balance\n');

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

fixRedeemCodes()
  .then(() => {
    console.log('✅ Fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });

