import pg from 'pg';
import fs from 'fs';
import crypto from 'crypto';

const { Pool } = pg;

// Helper function to validate and convert UUID
function ensureValidUUID(id) {
  // Check if it's already a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(id)) {
    return id;
  }

  // Generate deterministic UUID from string (so same ID always gets same UUID)
  const hash = crypto.createHash('md5').update(id).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

// Railway PostgreSQL connection
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@host:port/database';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function importData(filename) {
  console.log('🔄 Starting data import to Railway PostgreSQL...\n');

  try {
    // Read export file
    if (!fs.existsSync(filename)) {
      console.error(`❌ File not found: ${filename}`);
      console.log('💡 Please run export-supabase-data.js first');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    console.log('📁 Loaded export file:', filename);

    // Import users
    console.log('\n📥 Importing users...');

    // Create ID mapping for foreign key references
    const userIdMapping = {};

    for (const user of data.users) {
      // Set default password for users without password (from Supabase Auth)
      const password = user.password || 'ChangeMe123!';

      // Convert ID to valid UUID
      const validId = ensureValidUUID(user.id);
      userIdMapping[user.id] = validId;

      await pool.query(`
        INSERT INTO users (id, username, email, password, balance, role, status, trading_mode, wallet_address, phone, address, created_at, updated_at, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          balance = EXCLUDED.balance,
          role = EXCLUDED.role,
          status = EXCLUDED.status,
          trading_mode = EXCLUDED.trading_mode,
          wallet_address = EXCLUDED.wallet_address,
          updated_at = EXCLUDED.updated_at
      `, [
        validId, user.username, user.email, password, user.balance || 0,
        user.role || 'user', user.status || 'active', user.trading_mode || 'normal',
        user.wallet_address, user.phone, user.address,
        user.created_at, user.updated_at, user.last_login
      ]);
    }
    console.log(`✅ Imported ${data.users.length} users`);

    // Import trades
    console.log('📥 Importing trades...');
    for (const trade of data.trades) {
      const validTradeId = ensureValidUUID(trade.id);
      const validUserId = userIdMapping[trade.user_id] || ensureValidUUID(trade.user_id);

      await pool.query(`
        INSERT INTO trades (id, user_id, symbol, direction, amount, duration, entry_price, exit_price, profit_loss, status, result, trading_control, created_at, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING
      `, [
        validTradeId, validUserId, trade.symbol, trade.direction, trade.amount,
        trade.duration, trade.entry_price, trade.exit_price, trade.profit_loss,
        trade.status, trade.result, trade.trading_control,
        trade.created_at, trade.completed_at
      ]);
    }
    console.log(`✅ Imported ${data.trades.length} trades`);

    // Import deposits
    console.log('📥 Importing deposits...');
    for (const deposit of data.deposits) {
      const validDepositId = ensureValidUUID(deposit.id);
      const validUserId = userIdMapping[deposit.user_id] || ensureValidUUID(deposit.user_id);

      await pool.query(`
        INSERT INTO deposits (id, user_id, amount, currency, network, wallet_address, tx_hash, receipt_url, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [
        validDepositId, validUserId, deposit.amount, deposit.currency,
        deposit.network, deposit.wallet_address, deposit.tx_hash,
        deposit.receipt_url, deposit.status, deposit.created_at, deposit.updated_at
      ]);
    }
    console.log(`✅ Imported ${data.deposits.length} deposits`);

    // Import withdrawals
    console.log('📥 Importing withdrawals...');
    for (const withdrawal of data.withdrawals) {
      const validWithdrawalId = ensureValidUUID(withdrawal.id);
      const validUserId = userIdMapping[withdrawal.user_id] || ensureValidUUID(withdrawal.user_id);

      await pool.query(`
        INSERT INTO withdrawals (id, user_id, amount, currency, network, wallet_address, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [
        validWithdrawalId, validUserId, withdrawal.amount, withdrawal.currency,
        withdrawal.network, withdrawal.wallet_address, withdrawal.status,
        withdrawal.created_at, withdrawal.updated_at
      ]);
    }
    console.log(`✅ Imported ${data.withdrawals.length} withdrawals`);

    // Import admin activity logs
    console.log('📥 Importing admin activity logs...');
    for (const log of data.admin_activity_logs) {
      const validLogId = ensureValidUUID(log.id);
      const validAdminId = userIdMapping[log.admin_id] || ensureValidUUID(log.admin_id);
      const validTargetUserId = log.target_user_id ? (userIdMapping[log.target_user_id] || ensureValidUUID(log.target_user_id)) : null;

      await pool.query(`
        INSERT INTO admin_activity_logs (id, admin_id, admin_username, action_category, action_type, description, target_user_id, target_username, metadata, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [
        validLogId, validAdminId, log.admin_username, log.action_category,
        log.action_type, log.description, validTargetUserId,
        log.target_username, JSON.stringify(log.metadata), log.created_at
      ]);
    }
    console.log(`✅ Imported ${data.admin_activity_logs.length} activity logs`);

    // Import redeem codes
    console.log('📥 Importing redeem codes...');
    for (const code of data.redeem_codes) {
      const validCodeId = ensureValidUUID(code.id);

      await pool.query(`
        INSERT INTO redeem_codes (id, code, bonus_amount, max_uses, current_uses, expires_at, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [
        validCodeId, code.code, code.bonus_amount, code.max_uses,
        code.current_uses, code.expires_at, code.is_active, code.created_at
      ]);
    }
    console.log(`✅ Imported ${data.redeem_codes.length} redeem codes`);

    // Import user redeem history
    console.log('📥 Importing user redeem history...');
    for (const history of data.user_redeem_history) {
      const validHistoryId = ensureValidUUID(history.id);
      const validUserId = userIdMapping[history.user_id] || ensureValidUUID(history.user_id);
      const validCodeId = ensureValidUUID(history.code_id);

      await pool.query(`
        INSERT INTO user_redeem_history (id, user_id, code_id, code, bonus_amount, redeemed_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [
        validHistoryId, validUserId, validCodeId, history.code,
        history.bonus_amount, history.redeemed_at
      ]);
    }
    console.log(`✅ Imported ${data.user_redeem_history.length} redeem history records`);

    // Import wallet addresses
    console.log('📥 Importing wallet addresses...');
    for (const wallet of data.wallet_addresses) {
      await pool.query(`
        INSERT INTO wallet_addresses (id, currency, network, address, qr_code, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (currency, network) DO UPDATE SET
          address = EXCLUDED.address,
          qr_code = EXCLUDED.qr_code,
          is_active = EXCLUDED.is_active
      `, [
        wallet.id, wallet.currency, wallet.network, wallet.address,
        wallet.qr_code, wallet.is_active, wallet.created_at
      ]);
    }
    console.log(`✅ Imported ${data.wallet_addresses.length} wallet addresses`);

    console.log('\n✅ Import completed successfully!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Get filename from command line argument
const filename = process.argv[2] || 'supabase-export.json';
importData(filename);

