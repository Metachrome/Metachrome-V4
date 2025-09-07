import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAdminProduction() {
  try {
    console.log('🔍 Checking admin users in production PostgreSQL database...');

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Create PostgreSQL connection
    const client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client, { schema });

    console.log('🔗 Connected to PostgreSQL database');

    // Check existing users
    const allUsers = await db.select().from(users);
    console.log('📋 Existing users:', allUsers.length);
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - Role: ${user.role}`);
    });

    // Check for admin users specifically
    const adminUsers = await db.select().from(users).where(eq(users.role, 'super_admin'));
    console.log('👑 Super admin users:', adminUsers.length);
    adminUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });

    await client.end();

    console.log('\n✅ Admin check complete!');

  } catch (error) {
    console.error('❌ Error checking admin users:', error);
    process.exit(1);
  }
}

checkAdminProduction();