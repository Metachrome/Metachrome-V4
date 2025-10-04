const postgres = require('postgres');

async function fixRailwayVerification() {
  try {
    console.log('🚀 Fixing verification status in Railway database...');
    
    // Railway database URL - REPLACE WITH YOUR RAILWAY DATABASE URL
    const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to database...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Step 1: Check all users and their verification status
    console.log('\n📋 Step 1: Checking all users verification status...');
    const allUsers = await client`
      SELECT id, username, email, role, verification_status, has_uploaded_documents, verified_at
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log(`\n👥 Found ${allUsers.length} users:`);
    allUsers.forEach((user, index) => {
      const roleIcon = user.role === 'superadmin' ? '👑' : user.role === 'admin' ? '🛡️' : '👤';
      const statusIcon = user.verification_status === 'verified' ? '✅' : '❌';
      console.log(`   ${index + 1}. ${roleIcon} ${statusIcon} ${user.username} (${user.email})`);
      console.log(`      Role: ${user.role}, Status: ${user.verification_status || 'unverified'}, Docs: ${user.has_uploaded_documents || false}`);
    });
    
    // Step 2: Find users who should be verified (have approved documents)
    console.log('\n📄 Step 2: Checking verification documents...');
    const approvedDocs = await client`
      SELECT DISTINCT user_id, verification_status, verified_at
      FROM user_verification_documents
      WHERE verification_status = 'approved'
      ORDER BY verified_at DESC
    `;
    
    if (approvedDocs.length > 0) {
      console.log(`\n✅ Found ${approvedDocs.length} users with approved documents:`);
      
      for (const doc of approvedDocs) {
        const user = allUsers.find(u => u.id === doc.user_id);
        if (user) {
          console.log(`   - ${user.username}: Document approved at ${doc.verified_at}`);
          
          // Update user verification status if not already verified
          if (user.verification_status !== 'verified') {
            console.log(`     🔧 Updating ${user.username} to VERIFIED...`);
            
            await client`
              UPDATE users 
              SET verification_status = 'verified',
                  has_uploaded_documents = true,
                  verified_at = ${doc.verified_at},
                  updated_at = NOW()
              WHERE id = ${user.id}
            `;
            
            console.log(`     ✅ ${user.username} is now VERIFIED!`);
          } else {
            console.log(`     ✅ ${user.username} is already verified`);
          }
        }
      }
    } else {
      console.log('⚠️ No approved documents found');
    }
    
    // Step 3: Auto-verify superadmin (they don't need verification)
    console.log('\n👑 Step 3: Auto-verifying superadmin accounts...');
    const superadmins = allUsers.filter(u => u.role === 'superadmin');
    
    for (const admin of superadmins) {
      if (admin.verification_status !== 'verified') {
        console.log(`   🔧 Auto-verifying superadmin: ${admin.username}`);
        
        await client`
          UPDATE users 
          SET verification_status = 'verified',
              has_uploaded_documents = true,
              verified_at = NOW(),
              updated_at = NOW()
          WHERE id = ${admin.id}
        `;
        
        console.log(`   ✅ ${admin.username} (superadmin) is now VERIFIED!`);
      } else {
        console.log(`   ✅ ${admin.username} (superadmin) is already verified`);
      }
    }
    
    // Step 4: Show final verification status
    console.log('\n📊 Step 4: Final verification status:');
    const updatedUsers = await client`
      SELECT username, email, role, verification_status, has_uploaded_documents, verified_at
      FROM users 
      ORDER BY 
        CASE 
          WHEN role = 'superadmin' THEN 1 
          WHEN role = 'admin' THEN 2 
          ELSE 3 
        END,
        verified_at DESC NULLS LAST
    `;
    
    console.log('\n👥 All Users:');
    updatedUsers.forEach((user, index) => {
      const roleIcon = user.role === 'superadmin' ? '👑' : user.role === 'admin' ? '🛡️' : '👤';
      const statusIcon = user.verification_status === 'verified' ? '✅' : '❌';
      const verifiedDate = user.verified_at ? new Date(user.verified_at).toLocaleDateString() : 'Never';
      
      console.log(`   ${index + 1}. ${roleIcon} ${statusIcon} ${user.username.padEnd(20)} | ${user.verification_status?.padEnd(12) || 'unverified'.padEnd(12)} | Verified: ${verifiedDate}`);
    });
    
    // Step 5: Summary
    const verifiedCount = updatedUsers.filter(u => u.verification_status === 'verified').length;
    const unverifiedCount = updatedUsers.filter(u => u.verification_status !== 'verified').length;
    
    console.log('\n📈 Summary:');
    console.log(`   ✅ Verified users: ${verifiedCount}`);
    console.log(`   ❌ Unverified users: ${unverifiedCount}`);
    console.log(`   📊 Total users: ${updatedUsers.length}`);
    
    console.log('\n✅ Verification fix completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your Railway server');
    console.log('   2. Clear browser cache and cookies');
    console.log('   3. Login again to see updated verification status');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixRailwayVerification();

