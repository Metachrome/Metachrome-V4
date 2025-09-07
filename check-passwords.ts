import { db } from "./server/db";
import { users } from "./shared/schema-sqlite";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function checkPasswords() {
  try {
    console.log('🔍 Checking user passwords...');
    
    // Get all admin users
    const adminUsers = await db.select().from(users).where(eq(users.role, 'super_admin'));
    
    console.log(`Found ${adminUsers.length} super admin users:`);
    
    for (const user of adminUsers) {
      console.log(`\n👤 User: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has Password: ${!!user.password}`);
      
      if (user.password) {
        // Test common passwords
        const testPasswords = ['admin123', 'superadmin123', 'password', 'admin', 'superadmin'];
        
        for (const testPassword of testPasswords) {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log(`   ✅ Password: ${testPassword}`);
            break;
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking passwords:', error);
  }
}

checkPasswords();
