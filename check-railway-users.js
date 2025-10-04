const postgres = require('postgres');

async function checkRailwayUsers() {
  try {
    console.log('🔍 Checking users in Railway database...');
    
    // Railway database URL - REPLACE WITH YOUR RAILWAY DATABASE URL
    const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to database...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Get all users
    console.log('\n👥 All Users:');
    const users = await client`
      SELECT 
        id, 
        username, 
        email, 
        role, 
        verification_status, 
        has_uploaded_documents,
        verified_at,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `;
    
    console.log(`\nFound ${users.length} users:\n`);
    console.log('═'.repeat(100));
    console.log('No. | Icon | Username              | Email                          | Role       | Status      | Verified At');
    console.log('═'.repeat(100));
    
    users.forEach((user, index) => {
      const roleIcon = user.role === 'superadmin' ? '👑' : user.role === 'admin' ? '🛡️' : '👤';
      const statusIcon = user.verification_status === 'verified' ? '✅' : '❌';
      const verifiedDate = user.verified_at ? new Date(user.verified_at).toLocaleDateString() : 'Never';
      
      console.log(
        `${(index + 1).toString().padStart(3)} | ${roleIcon}${statusIcon} | ` +
        `${user.username.padEnd(20)} | ` +
        `${(user.email || '').padEnd(30)} | ` +
        `${(user.role || 'user').padEnd(10)} | ` +
        `${(user.verification_status || 'unverified').padEnd(11)} | ` +
        `${verifiedDate}`
      );
    });
    
    console.log('═'.repeat(100));
    
    // Get verification documents
    console.log('\n📄 Verification Documents:');
    const docs = await client`
      SELECT 
        uvd.id,
        uvd.user_id,
        uvd.document_type,
        uvd.verification_status,
        uvd.verified_at,
        u.username,
        u.email
      FROM user_verification_documents uvd
      JOIN users u ON uvd.user_id = u.id
      ORDER BY uvd.created_at DESC
    `;
    
    if (docs.length > 0) {
      console.log(`\nFound ${docs.length} documents:\n`);
      console.log('─'.repeat(100));
      
      docs.forEach((doc, index) => {
        const statusIcon = doc.verification_status === 'approved' ? '✅' : 
                          doc.verification_status === 'pending' ? '⏳' : '❌';
        const verifiedDate = doc.verified_at ? new Date(doc.verified_at).toLocaleDateString() : 'Pending';
        
        console.log(
          `${(index + 1).toString().padStart(3)}. ${statusIcon} ` +
          `${doc.username.padEnd(20)} | ` +
          `${doc.document_type.padEnd(15)} | ` +
          `${doc.verification_status.padEnd(10)} | ` +
          `${verifiedDate}`
        );
      });
    } else {
      console.log('⚠️ No verification documents found');
    }
    
    // Summary
    const verifiedCount = users.filter(u => u.verification_status === 'verified').length;
    const unverifiedCount = users.filter(u => u.verification_status !== 'verified').length;
    const pendingCount = users.filter(u => u.verification_status === 'pending').length;
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Verified users: ${verifiedCount}`);
    console.log(`   ⏳ Pending users: ${pendingCount}`);
    console.log(`   ❌ Unverified users: ${unverifiedCount}`);
    console.log(`   📊 Total users: ${users.length}`);
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRailwayUsers();

