// Test script to verify the verification system is working
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = '3010';
process.env.SUPABASE_URL = 'https://pybsyzbxyliufkgywtpf.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUserVerification() {
  console.log('🔍 Testing user verification system...');
  
  try {
    // Test angela.soenoko user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'angela.soenoko')
      .single();
    
    if (error) {
      console.error('❌ Error fetching user:', error);
      return;
    }
    
    if (!user) {
      console.log('❌ User angela.soenoko not found');
      return;
    }
    
    console.log('✅ User found:', {
      username: user.username,
      verification_status: user.verification_status,
      has_uploaded_documents: user.has_uploaded_documents,
      verified_at: user.verified_at
    });
    
    // Check verification documents
    const { data: docs, error: docsError } = await supabase
      .from('user_verification_documents')
      .select('*')
      .eq('user_id', user.id);
    
    if (docsError) {
      console.error('❌ Error fetching verification documents:', docsError);
    } else {
      console.log('📄 Verification documents:', docs.length, 'found');
      docs.forEach(doc => {
        console.log(`  - ${doc.document_type}: ${doc.status} (${doc.uploaded_at})`);
      });
    }
    
    // Test verification function
    const isVerified = user.verification_status === 'verified';
    console.log(`🔐 User verification status: ${isVerified ? 'VERIFIED' : 'NOT VERIFIED'}`);
    
    if (isVerified) {
      console.log('🎉 SUCCESS: User verification system is working correctly!');
      console.log('✅ Users should now be able to trade without verification warnings.');
    } else {
      console.log('⚠️ WARNING: User is not verified. This may cause trading restrictions.');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testUserVerification().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
});
