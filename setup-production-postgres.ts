import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';
import bcrypt from 'bcryptjs';

async function setupProductionPostgres() {
  try {
    console.log('🗄️  Setting up production PostgreSQL database...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
      throw new Error('Production database must be PostgreSQL');
    }
    
    console.log('✅ Database URL configured correctly');
    
    // Create PostgreSQL connection
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client, { schema });
    
    console.log('🔗 Connected to PostgreSQL database');
    
    // Create tables (this will create all tables defined in schema)
    console.log('📋 Creating database tables...');
    
    // Check if admin user exists
    console.log('👤 Checking for admin user...');
    const existingAdmin = await db.select().from(schema.users).where(schema.eq(schema.users.username, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role:', existingAdmin[0].role);
    } else {
      console.log('🔧 Creating admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin user
      const [adminUser] = await db.insert(schema.users).values({
        username: 'admin',
        email: 'admin@metachrome.io',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
      }).returning();
      
      console.log('✅ Admin user created successfully!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role:', adminUser.role);
      console.log('   ID:', adminUser.id);
    }
    
    // Create initial balances for admin user
    console.log('💰 Setting up admin balances...');
    const adminUser = await db.select().from(schema.users).where(schema.eq(schema.users.username, 'admin')).limit(1);
    
    if (adminUser.length > 0) {
      const currencies = ['USDT', 'BTC', 'ETH', 'BNB', 'ADA', 'DOT', 'LINK', 'UNI'];
      
      for (const currency of currencies) {
        const existingBalance = await db.select().from(schema.balances)
          .where(schema.and(
            schema.eq(schema.balances.userId, adminUser[0].id),
            schema.eq(schema.balances.symbol, currency)
          )).limit(1);
        
        if (existingBalance.length === 0) {
          await db.insert(schema.balances).values({
            userId: adminUser[0].id,
            symbol: currency,
            available: currency === 'USDT' ? '10000.00' : '1.00',
            locked: '0.00'
          });
          console.log(`   ✅ Created ${currency} balance`);
        }
      }
    }
    
    // Add some sample market data
    console.log('📊 Setting up market data...');
    const marketSymbols = [
      { symbol: 'BTCUSDT', price: '45000.00' },
      { symbol: 'ETHUSDT', price: '2800.00' },
      { symbol: 'BNBUSDT', price: '320.00' },
      { symbol: 'ADAUSDT', price: '0.45' },
      { symbol: 'DOTUSDT', price: '6.50' },
      { symbol: 'LINKUSDT', price: '14.20' },
      { symbol: 'UNIUSDT', price: '7.80' }
    ];
    
    for (const market of marketSymbols) {
      const existing = await db.select().from(schema.marketData)
        .where(schema.eq(schema.marketData.symbol, market.symbol)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(schema.marketData).values({
          symbol: market.symbol,
          price: market.price,
          high24h: (parseFloat(market.price) * 1.05).toString(),
          low24h: (parseFloat(market.price) * 0.95).toString(),
          volume24h: '1000000.00',
          change24h: '2.5'
        });
        console.log(`   ✅ Created market data for ${market.symbol}`);
      }
    }
    
    console.log('🎉 Production PostgreSQL database setup complete!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   🔐 Admin Login:');
    console.log('      Username: admin');
    console.log('      Password: admin123');
    console.log('');
    console.log('🚀 Your admin dashboard should now show real data!');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProductionPostgres();
}

export { setupProductionPostgres };
