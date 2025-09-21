const postgres = require('postgres');

async function fixUserVerification() {
  try {
    console.log('🔧 Fixing user verification status...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Update angela.soenoko user verification status
    const updateResult = await client`
      UPDATE users 
      SET verification_status = 'verified',
          has_uploaded_documents = true,
          verified_at = NOW(),
          updated_at = NOW()
      WHERE username = 'angela.soenoko'
      RETURNING id, username, verification_status, has_uploaded_documents
    `;
    
    if (updateResult.length > 0) {
      const user = updateResult[0];
      console.log('✅ User verification updated:', {
        id: user.id,
        username: user.username,
        verification_status: user.verification_status,
        has_uploaded_documents: user.has_uploaded_documents
      });
      
      // Create verification document if it doesn't exist
      const userId = user.id;
      
      const existingDoc = await client`
        SELECT id FROM user_verification_documents 
        WHERE user_id = ${userId}
        LIMIT 1
      `;
      
      if (existingDoc.length === 0) {
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
            'id_card',
            '/uploads/angela-id-card.jpg',
            'approved',
            'Document approved by system',
            NOW(),
            NOW()
          )
        `;
        console.log('✅ Created verification document record!');
      } else {
        console.log('✅ Verification document already exists');
      }
      
    } else {
      console.log('❌ User angela.soenoko not found');
    }
    
    await client.end();
    console.log('\n🎉 User verification fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing user verification:', error);
  }
}

fixUserVerification();
