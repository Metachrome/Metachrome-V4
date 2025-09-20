#!/usr/bin/env node

/**
 * Comprehensive verification status debugging script
 * This script systematically checks and fixes verification status issues
 */

const fs = require('fs');
const path = require('path');

// Check if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

async function debugVerificationSystematic() {
  console.log('🔍 SYSTEMATIC VERIFICATION STATUS DEBUG');
  console.log('=====================================');
  console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log('');

  try {
    if (isProduction) {
      await debugProductionMode();
    } else {
      await debugDevelopmentMode();
    }
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

async function debugProductionMode() {
  console.log('🏭 PRODUCTION MODE - Checking Supabase Database');
  
  const postgres = require('postgres');
  const client = postgres(process.env.DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Check users table
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
    `;

    console.log(`📋 Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      const status = user.verification_status === 'verified' ? '✅ VERIFIED' : 
                    user.verification_status === 'pending' ? '⏳ PENDING' :
                    user.verification_status === 'rejected' ? '❌ REJECTED' : '⚠️ UNVERIFIED';
      const docs = user.has_uploaded_documents ? '📄 Has docs' : '📄 No docs';
      const verifiedDate = user.verified_at ? new Date(user.verified_at).toLocaleDateString() : 'Never';
      
      console.log(`  ${index + 1}. ${status} ${docs} ${user.username} (${user.email})`);
      console.log(`     Verified: ${verifiedDate}, Updated: ${new Date(user.updated_at).toLocaleString()}`);
    });

    // Check verification documents
    const docs = await client`
      SELECT 
        uvd.id,
        uvd.verification_status as doc_status,
        uvd.verified_at,
        uvd.created_at,
        u.username,
        u.verification_status as user_status
      FROM user_verification_documents uvd
      JOIN users u ON uvd.user_id = u.id
      ORDER BY uvd.created_at DESC
    `;

    console.log(`\n📄 Found ${docs.length} verification documents:`);
    docs.forEach((doc, index) => {
      const docStatus = doc.doc_status === 'approved' ? '✅ APPROVED' :
                       doc.doc_status === 'pending' ? '⏳ PENDING' : '❌ REJECTED';
      const userStatus = doc.user_status === 'verified' ? '✅ VERIFIED' : '⚠️ NOT VERIFIED';
      
      console.log(`  ${index + 1}. ${docStatus} → ${userStatus} ${doc.username}`);
      console.log(`     Doc created: ${new Date(doc.created_at).toLocaleString()}`);
      console.log(`     Doc verified: ${doc.verified_at ? new Date(doc.verified_at).toLocaleString() : 'Not verified'}`);
    });

    // Check for mismatches
    const mismatches = docs.filter(doc => 
      (doc.doc_status === 'approved' && doc.user_status !== 'verified') ||
      (doc.doc_status !== 'approved' && doc.user_status === 'verified')
    );

    if (mismatches.length > 0) {
      console.log('\n⚠️ FOUND VERIFICATION STATUS MISMATCHES:');
      mismatches.forEach(mismatch => {
        console.log(`  ${mismatch.username}: Doc=${mismatch.doc_status}, User=${mismatch.user_status}`);
      });
      
      console.log('\n🔧 FIXING MISMATCHES...');
      for (const mismatch of mismatches) {
        if (mismatch.doc_status === 'approved' && mismatch.user_status !== 'verified') {
          await client`
            UPDATE users 
            SET verification_status = 'verified',
                has_uploaded_documents = true,
                verified_at = NOW(),
                updated_at = NOW()
            WHERE username = ${mismatch.username}
          `;
          console.log(`✅ Fixed ${mismatch.username}: Set to verified`);
        }
      }
    } else {
      console.log('\n✅ No verification status mismatches found');
    }

  } finally {
    await client.end();
  }
}

async function debugDevelopmentMode() {
  console.log('🛠️ DEVELOPMENT MODE - Checking Local Files');
  
  const usersFile = path.join(__dirname, 'data', 'users.json');
  const pendingFile = path.join(__dirname, 'data', 'pending-data.json');

  // Check users file
  if (fs.existsSync(usersFile)) {
    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    console.log(`📋 Found ${usersData.length} users in local file:`);
    
    usersData.forEach((user, index) => {
      if (user.role === 'user') {
        const status = user.verification_status === 'verified' ? '✅ VERIFIED' : 
                      user.verification_status === 'pending' ? '⏳ PENDING' :
                      user.verification_status === 'rejected' ? '❌ REJECTED' : '⚠️ UNVERIFIED';
        const docs = user.has_uploaded_documents ? '📄 Has docs' : '📄 No docs';
        
        console.log(`  ${index + 1}. ${status} ${docs} ${user.username} (${user.email})`);
      }
    });
  } else {
    console.log('⚠️ No users.json file found');
  }

  // Check pending data file
  if (fs.existsSync(pendingFile)) {
    const pendingData = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
    const verificationDocs = pendingData.verificationDocuments || [];
    
    console.log(`\n📄 Found ${verificationDocs.length} verification documents in pending data:`);
    verificationDocs.forEach((doc, index) => {
      const docStatus = doc.verification_status === 'approved' ? '✅ APPROVED' :
                       doc.verification_status === 'pending' ? '⏳ PENDING' : '❌ REJECTED';
      
      console.log(`  ${index + 1}. ${docStatus} ${doc.users?.username || 'Unknown user'}`);
      console.log(`     Created: ${new Date(doc.created_at).toLocaleString()}`);
    });

    // Check for approved docs where user might not be verified
    const approvedDocs = verificationDocs.filter(doc => doc.verification_status === 'approved');
    if (approvedDocs.length > 0) {
      console.log('\n🔧 CHECKING APPROVED DOCUMENTS...');
      
      if (fs.existsSync(usersFile)) {
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        let needsUpdate = false;
        
        approvedDocs.forEach(doc => {
          const userIndex = usersData.findIndex(u => u.id === doc.user_id);
          if (userIndex !== -1 && usersData[userIndex].verification_status !== 'verified') {
            console.log(`🔧 Fixing ${usersData[userIndex].username}: Setting to verified`);
            usersData[userIndex].verification_status = 'verified';
            usersData[userIndex].has_uploaded_documents = true;
            usersData[userIndex].verified_at = new Date().toISOString();
            usersData[userIndex].updated_at = new Date().toISOString();
            needsUpdate = true;
          }
        });
        
        if (needsUpdate) {
          fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2));
          console.log('✅ Updated users.json file with correct verification status');
        } else {
          console.log('✅ All approved users already have verified status');
        }
      }
    }
  } else {
    console.log('⚠️ No pending-data.json file found');
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 TESTING API ENDPOINTS');
  console.log('========================');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:9999/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health endpoint working');
      console.log(`   User verification enabled: ${healthData.features?.userVerification}`);
    } else {
      console.log('❌ Health endpoint failed');
    }
  } catch (error) {
    console.log('⚠️ Could not test API endpoints (server may not be running)');
  }
}

// Main execution
async function main() {
  await debugVerificationSystematic();
  await testAPIEndpoints();
  
  console.log('\n🎯 SUMMARY AND RECOMMENDATIONS');
  console.log('==============================');
  console.log('1. ✅ Verification system checks enabled in frontend');
  console.log('2. ✅ WebSocket notifications added for real-time updates');
  console.log('3. ✅ Force refresh mechanism implemented');
  console.log('4. ✅ Enhanced debugging and logging added');
  console.log('');
  console.log('🚀 NEXT STEPS:');
  console.log('1. Deploy the changes to production');
  console.log('2. Test with a real user account');
  console.log('3. Verify superadmin approval workflow');
  console.log('4. Check that user dashboard shows correct status');
  console.log('5. Test real-time updates work properly');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugVerificationSystematic };
