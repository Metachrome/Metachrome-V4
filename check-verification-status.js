#!/usr/bin/env node

const postgres = require('postgres');

const client = postgres(process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/metachrome', {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkUserVerificationStatus() {
  try {
    console.log('🔍 Checking current user verification status in database...');
    
    const users = await client`
      SELECT 
        id, 
        username, 
        email, 
        verification_status, 
        has_uploaded_documents,
        verified_at,
        updated_at
      FROM users 
      WHERE role = 'user'
      ORDER BY updated_at DESC
      LIMIT 5
    `;
    
    console.log('📋 Current user verification status:');
    users.forEach(user => {
      console.log(`  ${user.username}: ${user.verification_status} (docs: ${user.has_uploaded_documents}) - Updated: ${user.updated_at}`);
    });
    
    // Check verification documents
    const docs = await client`
      SELECT 
        uvd.verification_status as doc_status,
        uvd.verified_at,
        u.username,
        u.verification_status as user_status
      FROM user_verification_documents uvd
      JOIN users u ON uvd.user_id = u.id
      ORDER BY uvd.verified_at DESC NULLS LAST
      LIMIT 5
    `;
    
    console.log('\n📄 Recent verification documents:');
    docs.forEach(doc => {
      console.log(`  ${doc.username}: Doc=${doc.doc_status}, User=${doc.user_status}, Verified=${doc.verified_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkUserVerificationStatus();
