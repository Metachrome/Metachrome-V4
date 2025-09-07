import postgres from 'postgres';
import bcrypt from 'bcryptjs';

async function setupProductionData() {
  console.log('🚀 Setting up production data in Supabase...');
  
  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
  
  try {
    const client = postgres(DATABASE_URL, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    
    console.log('✅ Connected to Supabase');
    
    // Create tables if they don't exist
    console.log('📋 Creating tables...');
    
    // Users table
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
    
    // Admin controls table
    await client`
      CREATE TABLE IF NOT EXISTS admin_controls (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        value BOOLEAN DEFAULT true,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Balances table
    await client`
      CREATE TABLE IF NOT EXISTS balances (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        currency TEXT NOT NULL,
        amount DECIMAL(20,8) DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id)
      )
    `;
    
    // Trades table
    await client`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        symbol TEXT NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL(20,8) NOT NULL,
        price DECIMAL(20,8) NOT NULL,
        status TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES users(id)
      )
    `;
    
    // Options settings table
    await client`
      CREATE TABLE IF NOT EXISTS options_settings (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('✅ Tables created successfully');
    
    // Check if admin user exists
    const existingAdmin = await client`
      SELECT * FROM users WHERE username = 'admin' LIMIT 1
    `;
    
    if (existingAdmin.length === 0) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client`
        INSERT INTO users (username, email, password, role, "isActive")
        VALUES ('admin', 'admin@metachrome.io', ${hashedPassword}, 'super_admin', true)
      `;
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create sample users if none exist
    const userCount = await client`SELECT COUNT(*) as count FROM users WHERE role = 'user'`;
    
    if (userCount[0].count < 3) {
      console.log('👥 Creating sample users...');
      
      const sampleUsers = [
        {
          username: 'trader1',
          email: 'trader1@metachrome.io',
          password: await bcrypt.hash('password123', 10),
          firstName: 'John',
          lastName: 'Trader',
          walletAddress: '0x1234567890123456789012345678901234567890'
        },
        {
          username: 'investor1',
          email: 'investor1@metachrome.io',
          password: await bcrypt.hash('password123', 10),
          firstName: 'Jane',
          lastName: 'Investor',
          walletAddress: '0x0987654321098765432109876543210987654321'
        },
        {
          username: 'crypto_pro',
          email: 'pro@metachrome.io',
          password: await bcrypt.hash('password123', 10),
          firstName: 'Alex',
          lastName: 'Professional',
          walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
        }
      ];
      
      for (const user of sampleUsers) {
        await client`
          INSERT INTO users (username, email, password, "firstName", "lastName", "walletAddress", role, "isActive")
          VALUES (${user.username}, ${user.email}, ${user.password}, ${user.firstName}, ${user.lastName}, ${user.walletAddress}, 'user', true)
        `;
      }
      console.log('✅ Sample users created');
    }
    
    // Create admin controls
    const controlsCount = await client`SELECT COUNT(*) as count FROM admin_controls`;
    if (controlsCount[0].count === 0) {
      console.log('⚙️ Creating admin controls...');
      
      await client`
        INSERT INTO admin_controls (name, value, description)
        VALUES 
          ('trading_enabled', true, 'Global trading control'),
          ('new_registrations', true, 'Allow new user registrations'),
          ('maintenance_mode', false, 'System maintenance mode')
      `;
      console.log('✅ Admin controls created');
    }
    
    // Create options settings
    const settingsCount = await client`SELECT COUNT(*) as count FROM options_settings`;
    if (settingsCount[0].count === 0) {
      console.log('⚙️ Creating options settings...');
      
      await client`
        INSERT INTO options_settings (name, value, description)
        VALUES 
          ('max_leverage', '100', 'Maximum leverage allowed'),
          ('min_trade_amount', '10', 'Minimum trade amount in USD'),
          ('trading_fee', '0.1', 'Trading fee percentage')
      `;
      console.log('✅ Options settings created');
    }
    
    // Get final counts
    const finalUsers = await client`SELECT COUNT(*) as count FROM users`;
    const finalTrades = await client`SELECT COUNT(*) as count FROM trades`;
    const finalBalances = await client`SELECT COUNT(*) as count FROM balances`;
    
    console.log('');
    console.log('🎉 Production database setup complete!');
    console.log(`📊 Total users: ${finalUsers[0].count}`);
    console.log(`📈 Total trades: ${finalTrades[0].count}`);
    console.log(`💰 Total balances: ${finalBalances[0].count}`);
    console.log('');
    console.log('🔐 Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('👥 Sample User Credentials:');
    console.log('   Username: trader1, investor1, crypto_pro');
    console.log('   Password: password123');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error setting up production data:', error);
  }
}

setupProductionData();
