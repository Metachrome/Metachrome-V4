import postgres from 'postgres';

async function fixUserVerificationStatus() {
  try {
    console.log('🔧 Fixing user verification status...');
    
    // Use the same DATABASE_URL from your .env file
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to Supabase...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // First, let's see all users and their verification status
    console.log('\n📋 Current users and their verification status:');
    const allUsers = await client`
      SELECT id, username, email, verification_status, has_uploaded_documents, role
      FROM users 
      ORDER BY created_at DESC
    `;
    
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email}) - Status: ${user.verification_status || 'unverified'} - Docs: ${user.has_uploaded_documents || false} - Role: ${user.role}`);
    });
    
    // Check for verification documents
    console.log('\n📄 Checking verification documents:');
    const documents = await client`
      SELECT vd.*, u.username, u.email 
      FROM user_verification_documents vd
      JOIN users u ON vd.user_id = u.id
      ORDER BY vd.created_at DESC
    `;
    
    if (documents.length > 0) {
      console.log('📄 Found verification documents:');
      documents.forEach(doc => {
        console.log(`   - User: ${doc.username} (${doc.email})`);
        console.log(`     Document: ${doc.document_type} - Status: ${doc.verification_status}`);
        console.log(`     Created: ${doc.created_at}`);
        console.log(`     Verified: ${doc.verified_at || 'Not verified'}`);
        console.log('');
      });
      
      // Find approved documents where user status is not verified
      const approvedDocs = documents.filter(doc => doc.verification_status === 'approved');
      
      if (approvedDocs.length > 0) {
        console.log('🔍 Found approved documents. Checking user verification status...');
        
        for (const doc of approvedDocs) {
          // Get current user status
          const [user] = await client`
            SELECT id, username, verification_status 
            FROM users 
            WHERE id = ${doc.user_id}
          `;
          
          if (user && user.verification_status !== 'verified') {
            console.log(`🔧 Fixing verification status for user: ${user.username}`);
            console.log(`   Current status: ${user.verification_status || 'unverified'}`);
            console.log(`   Setting to: verified`);
            
            // Update user verification status
            await client`
              UPDATE users 
              SET verification_status = 'verified',
                  verified_at = NOW(),
                  updated_at = NOW()
              WHERE id = ${user.id}
            `;
            
            console.log(`✅ Updated verification status for ${user.username}`);
          } else if (user && user.verification_status === 'verified') {
            console.log(`✅ User ${user.username} is already verified`);
          }
        }
      } else {
        console.log('⚠️ No approved documents found');
      }
    } else {
      console.log('⚠️ No verification documents found in database');
    }
    
    // Final verification - show updated user statuses
    console.log('\n📋 Updated user verification statuses:');
    const updatedUsers = await client`
      SELECT id, username, email, verification_status, has_uploaded_documents, verified_at
      FROM users 
      WHERE verification_status IS NOT NULL
      ORDER BY created_at DESC
    `;
    
    updatedUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
      console.log(`     Status: ${user.verification_status}`);
      console.log(`     Verified at: ${user.verified_at || 'Not set'}`);
      console.log(`     Has docs: ${user.has_uploaded_documents || false}`);
      console.log('');
    });
    
    await client.end();
    
    console.log('\n🎉 User verification status fix completed!');
    console.log('\n📝 Next steps:');
    console.log('1. The user should refresh their browser or logout/login again');
    console.log('2. The verification warning should disappear');
    console.log('3. Trading should now be enabled');
    console.log('\n💡 If the issue persists, the frontend might be caching old data.');
    console.log('   Try clearing browser cache or using incognito mode.');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    console.error('Error details:', error.message);
  }
}

fixUserVerificationStatus();
