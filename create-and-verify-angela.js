import postgres from 'postgres';
import bcrypt from 'bcryptjs';

async function createAndVerifyAngela() {
  try {
    console.log('🔧 Creating and verifying angela.soenoko user...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    
    console.log('🔗 Connecting to Supabase...');
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Check if angela.soenoko user already exists
    console.log('\n🔍 Checking if angela.soenoko user exists...');
    const existingUser = await client`
      SELECT id, username, email, verification_status
      FROM users 
      WHERE username = 'angela.soenoko' OR email = 'angela.soenoko@example.com'
      LIMIT 1
    `;
    
    let userId;
    
    if (existingUser.length > 0) {
      console.log('👤 Found existing angela.soenoko user:', existingUser[0].username);
      userId = existingUser[0].id;
    } else {
      console.log('👤 Creating new angela.soenoko user...');
      
      // Hash password for the new user
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create the user
      const [newUser] = await client`
        INSERT INTO users (
          id,
          username, 
          email, 
          password_hash, 
          balance, 
          role, 
          status, 
          trading_mode,
          verification_status,
          has_uploaded_documents,
          "firstName",
          "lastName",
          "isActive",
          created_at,
          updated_at
        ) VALUES (
          'user-angela-' || extract(epoch from now())::bigint,
          'angela.soenoko',
          'angela.soenoko@example.com',
          ${hashedPassword},
          34300.00,
          'user',
          'active',
          'normal',
          'unverified',
          false,
          'Angela',
          'Soenoko',
          true,
          NOW(),
          NOW()
        )
        RETURNING id, username, email
      `;
      
      console.log('✅ Created new user:', newUser.username, newUser.email);
      userId = newUser.id;
    }
    
    // Now verify the user
    console.log('\n🔧 Verifying angela.soenoko user...');
    
    await client`
      UPDATE users 
      SET verification_status = 'verified',
          has_uploaded_documents = true,
          verified_at = NOW(),
          updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    console.log('✅ User verification status updated!');
    
    // Create a verification document record
    console.log('\n📄 Creating verification document record...');
    
    await client`
      INSERT INTO user_verification_documents (
        user_id, 
        document_type, 
        document_url, 
        verification_status, 
        admin_notes,
        created_at,
        verified_at
      ) VALUES (
        ${userId},
        'ID Card',
        '/uploads/angela-id-card.jpg',
        'approved',
        'Document approved by superadmin',
        NOW(),
        NOW()
      )
    `;
    
    console.log('✅ Created verification document record');
    
    // Verify the final state
    console.log('\n📋 Final user state:');
    const finalUser = await client`
      SELECT username, email, verification_status, has_uploaded_documents, verified_at, balance
      FROM users 
      WHERE id = ${userId}
    `;
    
    if (finalUser.length > 0) {
      const user = finalUser[0];
      console.log(`   👤 Username: ${user.username}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   ✅ Verification Status: ${user.verification_status}`);
      console.log(`   📄 Has Documents: ${user.has_uploaded_documents}`);
      console.log(`   🕒 Verified At: ${user.verified_at}`);
      console.log(`   💰 Balance: $${user.balance}`);
    }
    
    // Check verification documents
    console.log('\n📄 Verification documents:');
    const docs = await client`
      SELECT document_type, verification_status, admin_notes, verified_at
      FROM user_verification_documents 
      WHERE user_id = ${userId}
    `;
    
    docs.forEach(doc => {
      console.log(`   📄 ${doc.document_type}: ${doc.verification_status} - ${doc.admin_notes}`);
    });
    
    await client.end();
    
    console.log('\n🎉 Angela.soenoko user setup completed!');
    console.log('\n📝 Login credentials:');
    console.log('   Username: angela.soenoko');
    console.log('   Password: password123');
    console.log('   Email: angela.soenoko@example.com');
    console.log('\n📝 Next steps:');
    console.log('1. Login with the above credentials');
    console.log('2. The verification warning should not appear');
    console.log('3. Trading should be enabled immediately');
    console.log('4. User should see verified status in profile');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('Error details:', error.message);
  }
}

createAndVerifyAngela();
