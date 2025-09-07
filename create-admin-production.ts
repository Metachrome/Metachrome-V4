import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createAdminProduction() {
  try {
    console.log('🗄️  Creating admin user in production PostgreSQL database...');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Create PostgreSQL connection
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client, { schema });

    console.log('🔗 Connected to PostgreSQL database');

    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role:', existingAdmin[0].role);
      await client.end();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: 'admin',
      email: 'admin@metachrome.io',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      firstName: 'Admin',
      lastName: 'User',
    }).returning();

    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role:', adminUser.role);
    console.log('   ID:', adminUser.id);

    // Create super admin user as well
    const existingSuperAdmin = await db.select().from(users).where(eq(users.username, 'superadmin')).limit(1);

    if (existingSuperAdmin.length === 0) {
      const hashedSuperPassword = await bcrypt.hash('superadmin123', 10);

      const [superAdminUser] = await db.insert(users).values({
        username: 'superadmin',
        email: 'superadmin@metachrome.io',
        password: hashedSuperPassword,
        role: 'super_admin',
        isActive: true,
        firstName: 'Super',
        lastName: 'Admin',
      }).returning();

      console.log('✅ Super admin user created successfully!');
      console.log('   Username: superadmin');
      console.log('   Password: superadmin123');
      console.log('   Role:', superAdminUser.role);
    } else {
      console.log('✅ Super admin user already exists!');
    }

    await client.end();

    console.log('\n🎉 Production admin setup complete!');
    console.log('📋 Login Credentials:');
    console.log('   🔐 Admin Login:');
    console.log('      Username: admin');
    console.log('      Password: admin123');
    console.log('   🔐 Super Admin Login:');
    console.log('      Username: superadmin');
    console.log('      Password: superadmin123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminProduction();