import { db } from "./server/db";
import { users } from "./shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function setupProductionDatabase() {
  try {
    console.log('🗄️  Setting up production database...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
      throw new Error('Production database must be PostgreSQL');
    }
    
    console.log('✅ Database URL configured correctly');
    
    // Check if admin user exists
    console.log('👤 Checking for admin user...');
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
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
      const [adminUser] = await db.insert(users).values({
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
    
    // Check if demo user exists
    console.log('👤 Checking for demo user...');
    const existingUser = await db.select().from(users).where(eq(users.username, 'trader1')).limit(1);
    
    if (existingUser.length > 0) {
      console.log('✅ Demo user already exists');
    } else {
      console.log('🔧 Creating demo user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create demo user
      const [demoUser] = await db.insert(users).values({
        username: 'trader1',
        email: 'trader1@metachrome.io',
        password: hashedPassword,
        role: 'user',
        isActive: true,
      }).returning();
      
      console.log('✅ Demo user created successfully!');
      console.log('   Username: trader1');
      console.log('   Password: password123');
      console.log('   Role:', demoUser.role);
    }
    
    console.log('🎉 Production database setup complete!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   👤 User Login:');
    console.log('      Username: trader1');
    console.log('      Password: password123');
    console.log('');
    console.log('   🔐 Admin Login:');
    console.log('      Username: admin');
    console.log('      Password: admin123');
    
  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupProductionDatabase();
}

export { setupProductionDatabase };
