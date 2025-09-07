import { db } from "./server/db";
import { users } from "./shared/schema-sqlite";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function resetSuperAdminPassword() {
  try {
    console.log('🔧 Resetting superadmin password...');
    
    // Check if superadmin user exists
    const existingSuperAdmin = await db.select().from(users).where(eq(users.username, 'superadmin')).limit(1);
    
    if (existingSuperAdmin.length === 0) {
      console.log('❌ Superadmin user not found!');
      return;
    }
    
    console.log('👤 Found superadmin user:', existingSuperAdmin[0].id);
    
    // Hash the new password
    const newPassword = 'superadmin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: Date.now()
      })
      .where(eq(users.username, 'superadmin'));
    
    console.log('✅ Superadmin password reset successfully!');
    console.log('   Username: superadmin');
    console.log('   Password: superadmin123');
    console.log('   Role: super_admin');
    
  } catch (error) {
    console.error('❌ Error resetting superadmin password:', error);
  }
}

resetSuperAdminPassword();
