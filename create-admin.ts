import { db } from "./server/db";
import { users } from "./shared/schema-sqlite";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('Admin user already exists!');
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
    }).returning();
    
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Role:', adminUser.role);
    console.log('ID:', adminUser.id);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin();
