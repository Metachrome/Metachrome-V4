import postgres from 'postgres';
import bcrypt from 'bcryptjs';

async function fixSuperadminRailway() {
  try {
    console.log('🔧 Fixing superadmin account for Railway deployment...');
    
    // Use the same DATABASE_URL from your .env file
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to Supabase...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Check if superadmin user exists
    console.log('🔍 Checking for existing superadmin user...');
    const existingSuperadmin = await client`
      SELECT * FROM users WHERE username = 'superadmin' LIMIT 1
    `;
    
    if (existingSuperadmin.length > 0) {
      console.log('👤 Superadmin user found, updating password...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      
      // Update the existing superadmin user
      await client`
        UPDATE users 
        SET password_hash = ${hashedPassword}, 
            role = 'super_admin',
            status = 'active',
            "isActive" = true,
            updated_at = NOW()
        WHERE username = 'superadmin'
      `;
      
      console.log('✅ Superadmin password updated successfully!');
    } else {
      console.log('👤 Creating new superadmin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      
      // Create superadmin user
      const [superadminUser] = await client`
        INSERT INTO users (
          username, 
          email, 
          password_hash, 
          balance, 
          role, 
          status, 
          trading_mode,
          "isActive",
          "firstName",
          "lastName",
          created_at,
          updated_at
        ) VALUES (
          'superadmin',
          'superadmin@metachrome.io',
          ${hashedPassword},
          1000000.00,
          'super_admin',
          'active',
          'normal',
          true,
          'Super',
          'Admin',
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ Superadmin user created successfully!');
      console.log('   ID:', superadminUser.id);
    }
    
    // Verify the superadmin user
    const verifyUser = await client`
      SELECT username, email, role, status, "isActive", password_hash 
      FROM users 
      WHERE username = 'superadmin'
    `;
    
    if (verifyUser.length > 0) {
      const user = verifyUser[0];
      console.log('\n✅ Superadmin verification:');
      console.log('   Username:', user.username);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Status:', user.status);
      console.log('   Active:', user.isActive);
      console.log('   Password hash exists:', !!user.password_hash);
      
      // Test password hash
      const isPasswordValid = await bcrypt.compare('superadmin123', user.password_hash);
      console.log('   Password hash valid:', isPasswordValid);
    }
    
    // Also check for admin user and create if needed
    const existingAdmin = await client`
      SELECT * FROM users WHERE username = 'admin' LIMIT 1
    `;
    
    if (existingAdmin.length === 0) {
      console.log('👤 Creating admin user as backup...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client`
        INSERT INTO users (
          username, 
          email, 
          password_hash, 
          balance, 
          role, 
          status, 
          trading_mode,
          "isActive",
          "firstName",
          "lastName",
          created_at,
          updated_at
        ) VALUES (
          'admin',
          'admin@metachrome.io',
          ${hashedPassword},
          1000000.00,
          'super_admin',
          'active',
          'normal',
          true,
          'Admin',
          'User',
          NOW(),
          NOW()
        )
      `;
      
      console.log('✅ Admin user created as backup!');
    }
    
    await client.end();
    
    console.log('\n🎉 Superadmin fix completed successfully!');
    console.log('\n📝 You can now login with:');
    console.log('   Username: superadmin');
    console.log('   Password: superadmin123');
    console.log('\n   OR');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🚀 Try logging in to your Railway deployment now!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    console.error('Error details:', error.message);
  }
}

fixSuperadminRailway();
