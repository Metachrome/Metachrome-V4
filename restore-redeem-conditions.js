import postgres from 'postgres';

const databaseUrl = 'postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres';
const sql = postgres(databaseUrl);

async function restoreRedeemConditions() {
  try {
    console.log('🔄 RESTORING redeem codes to ORIGINAL conditions...\n');

    // Restore WELCOME50: Min 500 USDT deposit in 30 days, 5 trades to UNLOCK bonus
    await sql`
      UPDATE redeem_codes SET
        description = 'Welcome bonus! Min 500 USDT deposit in 30 days. Trade 5x to unlock bonus.',
        code_type = 'deposit_timeframe',
        min_deposit_amount = 500.00,
        min_deposit_timeframe_days = 30,
        accumulated_deposit_required = 0,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 5
      WHERE code = 'WELCOME50'
    `;
    console.log('✅ Restored WELCOME50');

    // Restore FIRSTBONUS: 2000 USDT accumulated deposits, 5 trades to UNLOCK bonus
    await sql`
      UPDATE redeem_codes SET
        description = 'First bonus! 2000 USDT accumulated deposits required. Trade 5x to unlock bonus.',
        code_type = 'accumulated_deposit',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 2000.00,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 5
      WHERE code = 'FIRSTBONUS'
    `;
    console.log('✅ Restored FIRSTBONUS');

    // Restore BONUS500: 3 referrals required, 3 trades to UNLOCK bonus
    await sql`
      UPDATE redeem_codes SET
        description = 'Referral bonus! Invite 3 friends. Trade 3x to unlock bonus.',
        code_type = 'referral',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 0,
        referrals_required = 3,
        min_loss_amount = 0,
        trades_for_withdrawal = 3
      WHERE code = 'BONUS500'
    `;
    console.log('✅ Restored BONUS500');

    // Restore LETSGO1000: 10000 USDT accumulated deposits, INSTANT bonus
    await sql`
      UPDATE redeem_codes SET
        description = 'High value bonus! 10,000 USDT deposits required. Bonus added instantly!',
        code_type = 'accumulated_deposit',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 10000.00,
        referrals_required = 0,
        min_loss_amount = 0,
        trades_for_withdrawal = 0
      WHERE code = 'LETSGO1000'
    `;
    console.log('✅ Restored LETSGO1000');

    // Restore CASHBACK200: 3000 USDT trading loss, INSTANT bonus
    await sql`
      UPDATE redeem_codes SET
        description = 'Cashback! Available after 3000 USDT trading losses. Bonus added instantly!',
        code_type = 'cashback_loss',
        min_deposit_amount = 0,
        min_deposit_timeframe_days = NULL,
        accumulated_deposit_required = 0,
        referrals_required = 0,
        min_loss_amount = 3000.00,
        trades_for_withdrawal = 0
      WHERE code = 'CASHBACK200'
    `;
    console.log('✅ Restored CASHBACK200');

    console.log('\n📋 Verifying restoration...\n');

    // Verify the restoration
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
      Description: c.description.substring(0, 50) + '...'
    })));

    console.log('\n✅ All redeem codes RESTORED to original conditions!');

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

restoreRedeemConditions()
  .then(() => {
    console.log('✅ Restoration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
  });

