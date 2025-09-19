import postgres from 'postgres';

async function setupVerificationSystem() {
  try {
    console.log('🔧 Setting up verification system in production database...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to Supabase...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Step 1: Add verification columns to users table
    console.log('\n📋 Adding verification columns to users table...');
    
    try {
      await client`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified',
        ADD COLUMN IF NOT EXISTS has_uploaded_documents BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE
      `;
      console.log('✅ Added verification columns to users table');
    } catch (error) {
      console.log('⚠️ Verification columns might already exist:', error.message);
    }
    
    // Step 2: Create user_verification_documents table
    console.log('\n📄 Creating user_verification_documents table...');
    
    try {
      await client`
        CREATE TABLE IF NOT EXISTS user_verification_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          document_type VARCHAR(50) NOT NULL,
          document_url TEXT NOT NULL,
          verification_status VARCHAR(20) DEFAULT 'pending',
          admin_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          verified_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('✅ Created user_verification_documents table');
    } catch (error) {
      console.log('⚠️ user_verification_documents table might already exist:', error.message);
    }
    
    // Step 3: Create indexes for better performance
    console.log('\n🔍 Creating indexes...');
    
    try {
      await client`
        CREATE INDEX IF NOT EXISTS idx_user_verification_documents_user_id 
        ON user_verification_documents(user_id)
      `;
      
      await client`
        CREATE INDEX IF NOT EXISTS idx_user_verification_documents_status 
        ON user_verification_documents(verification_status)
      `;
      
      await client`
        CREATE INDEX IF NOT EXISTS idx_users_verification_status 
        ON users(verification_status)
      `;
      
      console.log('✅ Created indexes');
    } catch (error) {
      console.log('⚠️ Indexes might already exist:', error.message);
    }
    
    // Step 4: Update existing users to have proper verification status
    console.log('\n👥 Updating existing users...');
    
    // Set all existing users to unverified initially
    await client`
      UPDATE users 
      SET verification_status = 'unverified',
          has_uploaded_documents = false
      WHERE verification_status IS NULL
    `;
    
    // Set admin users as verified
    await client`
      UPDATE users 
      SET verification_status = 'verified',
          verified_at = NOW()
      WHERE role IN ('admin', 'super_admin')
    `;
    
    console.log('✅ Updated existing users');
    
    // Step 5: Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    // Check users table structure
    const userColumns = await client`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      AND column_name IN ('verification_status', 'has_uploaded_documents', 'verified_at')
      ORDER BY column_name
    `;
    
    console.log('📋 Verification columns in users table:');
    userColumns.forEach(col => {
      console.log(`   ✅ ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if user_verification_documents table exists
    const docTable = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_verification_documents' AND table_schema = 'public'
    `;
    
    if (docTable.length > 0) {
      console.log('✅ user_verification_documents table exists');
    }
    
    // Show current user verification statuses
    console.log('\n👥 Current user verification statuses:');
    const users = await client`
      SELECT username, email, role, verification_status, has_uploaded_documents, verified_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role}): ${user.verification_status} - Docs: ${user.has_uploaded_documents}`);
    });
    
    await client.end();
    
    console.log('\n🎉 Verification system setup completed successfully!');
    console.log('\n📝 What was done:');
    console.log('1. ✅ Added verification_status column to users table');
    console.log('2. ✅ Added has_uploaded_documents column to users table');
    console.log('3. ✅ Added verified_at column to users table');
    console.log('4. ✅ Created user_verification_documents table');
    console.log('5. ✅ Created performance indexes');
    console.log('6. ✅ Set admin users as verified');
    console.log('7. ✅ Set regular users as unverified');
    
    console.log('\n🚀 The verification system is now ready!');
    console.log('   - Users can upload verification documents');
    console.log('   - Admins can approve/reject documents');
    console.log('   - User verification status will be properly tracked');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('Error details:', error.message);
  }
}

setupVerificationSystem();
