import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config();

// Railway PostgreSQL connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('💡 Please set DATABASE_URL first:');
  console.log('   $env:DATABASE_URL="postgresql://user:password@host:port/database"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Predefined wallet addresses for deposits (from WalletPage.tsx)
// These are the REAL addresses users will deposit to
const walletAddresses = [
  // BTC - Main Bitcoin address
  {
    currency: 'BTC',
    network: 'Bitcoin',
    address: 'bc1q6w3rdy5kwaf4es2lpjk6clpd25pterzvgwu5hu',
    qr_code: null, // Will be generated dynamically
    is_active: true
  },

  // ETH - Main Ethereum address
  {
    currency: 'ETH',
    network: 'ERC20',
    address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
    qr_code: null,
    is_active: true
  },

  // SOL - Main Solana address
  {
    currency: 'SOL',
    network: 'Solana',
    address: '6s2UxAyknMvzN2nUpRdHp6EqDetsdK9mjsLTguzNYeKU',
    qr_code: null,
    is_active: true
  },

  // USDT - Multiple networks
  {
    currency: 'USDT',
    network: 'ERC20',
    address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A', // Same as ETH for ERC20
    qr_code: null,
    is_active: true
  },
  {
    currency: 'USDT',
    network: 'BEP20',
    address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A', // BSC compatible address
    qr_code: null,
    is_active: true
  },
  {
    currency: 'USDT',
    network: 'TRC20',
    address: 'TRX123abc456def789abc123def456789abc123def', // Tron address (placeholder - replace with real)
    qr_code: null,
    is_active: true
  }
];

async function setupWalletAddresses() {
  console.log('🏦 Setting up wallet addresses in Railway PostgreSQL...\n');

  try {
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'wallet_addresses'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  Table wallet_addresses does not exist');
      console.log('💡 Please run setup-railway-postgres.js first');
      process.exit(1);
    }

    // Insert wallet addresses
    console.log('📥 Inserting wallet addresses...\n');

    for (const wallet of walletAddresses) {
      await pool.query(`
        INSERT INTO wallet_addresses (currency, network, address, qr_code, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (currency, network) DO UPDATE SET
          address = EXCLUDED.address,
          qr_code = EXCLUDED.qr_code,
          is_active = EXCLUDED.is_active
      `, [wallet.currency, wallet.network, wallet.address, wallet.qr_code, true]);

      console.log(`✅ ${wallet.currency} (${wallet.network}): ${wallet.address}`);
    }

    console.log('\n✅ Wallet addresses setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   BTC: 1 wallet (Bitcoin network)');
    console.log('   ETH: 1 wallet (ERC20 network)');
    console.log('   SOL: 1 wallet (Solana network)');
    console.log('   USDT: 3 wallets (ERC20, BEP20, TRC20)');
    console.log('   Total: 6 wallet addresses');
    console.log('\n⚠️  Note: TRC20 address is placeholder - replace with real Tron address!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupWalletAddresses();