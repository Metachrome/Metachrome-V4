import pg from 'pg';
import fs from 'fs';

const { Pool } = pg;

// Railway PostgreSQL connection
// Get this from Railway dashboard after provisioning PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@host:port/database';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  console.log('🔄 Setting up Railway PostgreSQL database...\n');

  try {
    // Create tables
    console.log('📋 Creating tables...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(20, 2) DEFAULT 0,
        role VARCHAR(50) DEFAULT 'user',
        status VARCHAR(50) DEFAULT 'active',
        trading_mode VARCHAR(50) DEFAULT 'normal',
        wallet_address TEXT,
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Trades table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        symbol VARCHAR(50) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        amount DECIMAL(20, 2) NOT NULL,
        duration INTEGER NOT NULL,
        entry_price DECIMAL(20, 8) NOT NULL,
        exit_price DECIMAL(20, 8),
        profit_loss DECIMAL(20, 2),
        status VARCHAR(50) DEFAULT 'pending',
        result VARCHAR(50),
        trading_control VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);
    console.log('✅ Trades table created');

    // Deposits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deposits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(20, 2) NOT NULL,
        currency VARCHAR(50) NOT NULL,
        network VARCHAR(50),
        wallet_address TEXT,
        tx_hash TEXT,
        receipt_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Deposits table created');

    // Withdrawals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(20, 2) NOT NULL,
        currency VARCHAR(50) NOT NULL,
        network VARCHAR(50),
        wallet_address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Withdrawals table created');

    // Admin activity logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id UUID,
        admin_username VARCHAR(255),
        action_category VARCHAR(100),
        action_type VARCHAR(100),
        description TEXT,
        target_user_id UUID,
        target_username VARCHAR(255),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Admin activity logs table created');

    // Redeem codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS redeem_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(255) UNIQUE NOT NULL,
        bonus_amount DECIMAL(20, 2) NOT NULL,
        max_uses INTEGER DEFAULT 1,
        current_uses INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Redeem codes table created');

    // User redeem history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_redeem_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        code_id UUID REFERENCES redeem_codes(id) ON DELETE CASCADE,
        code VARCHAR(255) NOT NULL,
        bonus_amount DECIMAL(20, 2) NOT NULL,
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ User redeem history table created');

    // Wallet addresses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallet_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        currency VARCHAR(50) NOT NULL,
        network VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        qr_code TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(currency, network)
      );
    `);
    console.log('✅ Wallet addresses table created');

    console.log('\n✅ Database schema created successfully!');
    console.log('📝 Next step: Run import-data-to-railway.js to import your Supabase data');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();

export { pool };

