import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const DATABASE_URL = "postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";

async function setupSupabaseDatabase() {
  try {
    console.log('🗄️  Setting up Supabase database...');
    
    const client = postgres(DATABASE_URL);
    
    console.log('🔗 Connected to Supabase PostgreSQL');
    
    // Create users table
    console.log('📋 Creating users table...');
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        "firstName" TEXT,
        "lastName" TEXT,
        "profileImageUrl" TEXT,
        "walletAddress" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create balances table
    console.log('📋 Creating balances table...');
    await client`
      CREATE TABLE IF NOT EXISTS balances (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id),
        symbol TEXT NOT NULL,
        available TEXT DEFAULT '0',
        locked TEXT DEFAULT '0',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", symbol)
      )
    `;
    
    // Create market_data table
    console.log('📋 Creating market_data table...');
    await client`
      CREATE TABLE IF NOT EXISTS market_data (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        symbol TEXT UNIQUE NOT NULL,
        price TEXT NOT NULL,
        "high24h" TEXT,
        "low24h" TEXT,
        "volume24h" TEXT,
        "change24h" TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create trades table
    console.log('📋 Creating trades table...');
    await client`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id),
        symbol TEXT NOT NULL,
        type TEXT NOT NULL,
        direction TEXT NOT NULL,
        amount TEXT NOT NULL,
        "entryPrice" TEXT,
        "exitPrice" TEXT,
        status TEXT DEFAULT 'active',
        "pnl" TEXT DEFAULT '0',
        fee TEXT DEFAULT '0',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create transactions table
    console.log('📋 Creating transactions table...');
    await client`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        symbol TEXT NOT NULL,
        amount TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        method TEXT,
        currency TEXT,
        "networkFee" TEXT,
        metadata TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ All tables created successfully!');
    
    // Check if admin user exists
    console.log('👤 Checking for admin user...');
    const existingAdmin = await client`SELECT * FROM users WHERE username = 'admin' LIMIT 1`;
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
    } else {
      console.log('🔧 Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const [adminUser] = await client`
        INSERT INTO users (username, email, password, role, "isActive")
        VALUES ('admin', 'admin@metachrome.io', ${hashedPassword}, 'super_admin', true)
        RETURNING *
      `;
      
      console.log('✅ Admin user created successfully!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ID:', adminUser.id);
      
      // Create balances for admin
      const currencies = ['USDT', 'BTC', 'ETH', 'BNB', 'ADA'];
      for (const currency of currencies) {
        await client`
          INSERT INTO balances ("userId", symbol, available, locked)
          VALUES (${adminUser.id}, ${currency}, ${currency === 'USDT' ? '10000.00' : '1.00'}, '0.00')
        `;
      }
      console.log('💰 Admin balances created');
    }
    
    // Add sample market data
    console.log('📊 Setting up market data...');
    const markets = [
      { symbol: 'BTCUSDT', price: '45000.00' },
      { symbol: 'ETHUSDT', price: '2800.00' },
      { symbol: 'BNBUSDT', price: '320.00' }
    ];
    
    for (const market of markets) {
      await client`
        INSERT INTO market_data (symbol, price, "high24h", "low24h", "volume24h", "change24h")
        VALUES (${market.symbol}, ${market.price}, ${(parseFloat(market.price) * 1.05).toString()}, ${(parseFloat(market.price) * 0.95).toString()}, '1000000.00', '2.5')
        ON CONFLICT (symbol) DO UPDATE SET
          price = EXCLUDED.price,
          "high24h" = EXCLUDED."high24h",
          "low24h" = EXCLUDED."low24h"
      `;
    }
    
    console.log('🎉 Supabase database setup complete!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupSupabaseDatabase();
