import postgres from 'postgres';
import bcrypt from 'bcryptjs';

async function setupSupabaseProduction() {
  try {
    console.log('🗄️ Setting up Supabase production database...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to Supabase...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Check if users table exists and has data
    try {
      const users = await client`SELECT * FROM users ORDER BY "createdAt" DESC`;
      console.log(`📊 Found ${users.length} existing users`);
      
      // Check if admin exists
      const adminUsers = users.filter(u => u.role === 'super_admin');
      
      if (adminUsers.length > 0) {
        console.log('✅ Admin user already exists:');
        adminUsers.forEach(admin => {
          console.log(`   - ${admin.username} (${admin.email})`);
        });
      } else {
        console.log('🔧 Creating admin user...');
        
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Create admin user
        const [adminUser] = await client`
          INSERT INTO users (username, email, password, role, "isActive", "firstName", "lastName")
          VALUES ('admin', 'admin@metachrome.io', ${hashedPassword}, 'super_admin', true, 'Admin', 'User')
          RETURNING *
        `;
        
        console.log('✅ Admin user created successfully!');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   Email: admin@metachrome.io');
      }
      
      // Show all users
      const allUsers = await client`SELECT * FROM users ORDER BY "createdAt" DESC`;
      console.log('\n📋 All users in database:');
      allUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role} - Created: ${user.createdAt}`);
      });
      
    } catch (error) {
      console.error('❌ Error accessing users table:', error.message);
      console.log('💡 This might mean the tables need to be created first.');
    }
    
    await client.end();
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add environment variables to Vercel:');
    console.log(`   DATABASE_URL=${DATABASE_URL}`);
    console.log('   JWT_SECRET=de1cc0aaa1cb3baecd3341ea9fcddb7dedfceb3506110bc1acf45ea7b92e18f9');
    console.log('   SESSION_SECRET=2aa802cbdb87915ad40707dbe92354740992db6e1b1969e59037d9d51d1f75a9');
    console.log('   NODE_ENV=production');
    console.log('2. Redeploy your Vercel app');
    console.log('3. Test the admin dashboard');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupSupabaseProduction();
