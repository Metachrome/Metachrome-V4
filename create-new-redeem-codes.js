import postgres from 'postgres';

const databaseUrl = 'postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres';
const sql = postgres(databaseUrl);

async function createRedeemCodes() {
  try {
    console.log('🎁 Creating new redeem codes...\n');

    // Check if codes already exist
    const existingCodes = await sql`
      SELECT code FROM redeem_codes 
      WHERE code IN ('BONUS500', 'LETSGO1000')
    `;

    if (existingCodes.length > 0) {
      console.log('⚠️ Some codes already exist:');
      existingCodes.forEach(c => console.log(`   - ${c.code}`));
      console.log('\n🗑️ Deleting existing codes first...');
      
      await sql`
        DELETE FROM redeem_codes 
        WHERE code IN ('BONUS500', 'LETSGO1000')
      `;
      console.log('✅ Existing codes deleted\n');
    }

    // Create BONUS500
    console.log('📝 Creating BONUS500...');
    const bonus500 = await sql`
      INSERT INTO redeem_codes (
        code,
        bonus_amount,
        description,
        is_active,
        max_uses,
        current_uses,
        min_deposit_amount,
        accumulated_deposit_required,
        trades_for_withdrawal,
        created_at,
        updated_at
      ) VALUES (
        'BONUS500',
        500,
        'Referral bonus! 5,000 USDT deposits required (All at once not accumulated). Trade 3x to unlock bonus.',
        true,
        NULL,
        0,
        5000,
        0,
        3,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    console.log('✅ BONUS500 created:');
    console.log('   Code:', bonus500[0].code);
    console.log('   Bonus:', bonus500[0].bonus_amount, 'USDT');
    console.log('   Min Deposit (Single):', bonus500[0].min_deposit_amount, 'USDT');
    console.log('   Trades Required:', bonus500[0].trades_for_withdrawal);
    console.log('   Description:', bonus500[0].description);
    console.log('');

    // Create LETSGO1000
    console.log('📝 Creating LETSGO1000...');
    const letsgo1000 = await sql`
      INSERT INTO redeem_codes (
        code,
        bonus_amount,
        description,
        is_active,
        max_uses,
        current_uses,
        min_deposit_amount,
        accumulated_deposit_required,
        trades_for_withdrawal,
        created_at,
        updated_at
      ) VALUES (
        'LETSGO1000',
        1000,
        'High value bonus! 10,000 USDT deposits required (All at once not accumulated). Bonus added instantly!',
        true,
        NULL,
        0,
        10000,
        0,
        0,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    console.log('✅ LETSGO1000 created:');
    console.log('   Code:', letsgo1000[0].code);
    console.log('   Bonus:', letsgo1000[0].bonus_amount, 'USDT');
    console.log('   Min Deposit (Single):', letsgo1000[0].min_deposit_amount, 'USDT');
    console.log('   Trades Required:', letsgo1000[0].trades_for_withdrawal);
    console.log('   Description:', letsgo1000[0].description);
    console.log('');

    // Show all active redeem codes
    console.log('📋 All active redeem codes:');
    const allCodes = await sql`
      SELECT code, bonus_amount, min_deposit_amount, accumulated_deposit_required,
             trades_for_withdrawal, description
      FROM redeem_codes
      WHERE is_active = true
      ORDER BY bonus_amount ASC
    `;

    console.table(allCodes.map(c => ({
      Code: c.code,
      Bonus: c.bonus_amount + ' USDT',
      'Min Deposit (Single)': c.min_deposit_amount ? c.min_deposit_amount + ' USDT' : 'None',
      'Accumulated Deposit': c.accumulated_deposit_required ? c.accumulated_deposit_required + ' USDT' : 'None',
      'Trades': c.trades_for_withdrawal || 0,
      Description: c.description.substring(0, 50) + '...'
    })));

    await sql.end();

  } catch (error) {
    console.error('❌ Error:', error);
    await sql.end();
    throw error;
  }
}

createRedeemCodes()
  .then(() => {
    console.log('\n✅ Redeem codes created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to create redeem codes:', error);
    process.exit(1);
  });

