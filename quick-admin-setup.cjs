const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createAdmin() {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Open the SQLite database
    const db = new Database('./dev.db');
    
    // Check if users table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get();
    
    if (!tableExists) {
      console.log('📋 Creating users table...');
      db.exec(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          username TEXT UNIQUE,
          password TEXT,
          role TEXT DEFAULT 'user',
          isActive INTEGER DEFAULT 1,
          createdAt INTEGER,
          lastLogin INTEGER
        )
      `);
    }
    
    // Check if admin user exists
    const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role:', existingAdmin.role);
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminId = crypto.randomUUID();
    const now = Date.now();
    
    db.prepare(`
      INSERT INTO users (id, username, email, password, role, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin', 'admin@metachrome.io', hashedPassword, 'super_admin', 1, now);
    
    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: super_admin');
    console.log('   ID:', adminId);
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdmin();
