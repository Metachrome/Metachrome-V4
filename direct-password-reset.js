import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resetPasswords() {
  try {
    console.log('🔧 Direct password reset...');
    
    // Open the SQLite database
    const dbPath = path.join(__dirname, 'dev.db');
    const db = new Database(dbPath);
    
    console.log('📁 Database opened:', dbPath);
    
    // Check current users
    const users = db.prepare('SELECT id, username, email, role FROM users WHERE role IN (?, ?)').all('admin', 'super_admin');
    console.log('👥 Found admin users:', users);
    
    // Hash new passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const superadminPassword = await bcrypt.hash('superadmin123', 10);
    
    // Update admin password
    const updateAdmin = db.prepare('UPDATE users SET password = ? WHERE username = ?');
    updateAdmin.run(adminPassword, 'admin');
    console.log('✅ Updated admin password to: admin123');

    // Update superadmin password
    updateAdmin.run(superadminPassword, 'superadmin');
    console.log('✅ Updated superadmin password to: superadmin123');
    
    db.close();
    console.log('🎉 Password reset complete!');
    console.log('');
    console.log('Login credentials:');
    console.log('  admin / admin123');
    console.log('  superadmin / superadmin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetPasswords();
