import { db } from "./server/db";
import { users } from "./shared/schema-sqlite";
import { eq } from "drizzle-orm";

async function checkAdmin() {
  try {
    console.log('Checking for admin user...');
    
    // Check if admin user exists
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (adminUser.length > 0) {
      console.log('Admin user found:');
      console.log('ID:', adminUser[0].id);
      console.log('Username:', adminUser[0].username);
      console.log('Email:', adminUser[0].email);
      console.log('Role:', adminUser[0].role);
      console.log('Password hash exists:', !!adminUser[0].password);
      console.log('Is Active:', adminUser[0].isActive);
    } else {
      console.log('No admin user found!');
      
      // List all users
      const allUsers = await db.select().from(users);
      console.log('All users in database:');
      allUsers.forEach(user => {
        console.log(`- ${user.username} (${user.role})`);
      });
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

checkAdmin();
