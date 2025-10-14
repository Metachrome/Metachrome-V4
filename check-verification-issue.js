// Check verification issue script
const { createClient } = require('@supabase/supabase-js');

// Use Railway environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://ixqhqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

async function checkVerificationIssue() {
  try {
    console.log('🔍 Checking verification issue...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check user verification status
    console.log('👤 Checking user verification status...');
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, verification_status, has_uploaded_documents, verified_at, updated_at')
      .eq('username', 'angela.soenoko')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching user:', error);
      return;
    }
    
    if (users && users.length > 0) {
      const user = users[0];
      console.log('\n👤 Current user status:');
      console.log('  Username:', user.username);
      console.log('  Email:', user.email);
      console.log('  Verification Status:', user.verification_status);
      console.log('  Has Uploaded Documents:', user.has_uploaded_documents);
      console.log('  Verified At:', user.verified_at);
      console.log('  Updated At:', user.updated_at);
      
      // Check verification documents
      console.log('\n📄 Checking verification documents...');
      const { data: docs, error: docError } = await supabase
        .from('user_verification_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (docError) {
        console.error('❌ Error fetching documents:', docError);
      } else if (docs && docs.length > 0) {
        console.log(`📄 Found ${docs.length} verification documents:`);
        docs.forEach((doc, index) => {
          console.log(`  ${index + 1}. Document Type: ${doc.document_type}`);
          console.log(`     Status: ${doc.verification_status}`);
          console.log(`     Created: ${doc.created_at}`);
          console.log(`     Document URL: ${doc.document_url}`);
          console.log(`     Admin Notes: ${doc.admin_notes || 'None'}`);
          console.log('');
        });
      } else {
        console.log('📄 No verification documents found');
      }
      
      // Check all pending verification documents (for admin dashboard)
      console.log('\n🔔 Checking all pending verification documents...');
      const { data: allPendingDocs, error: allPendingError } = await supabase
        .from('user_verification_documents')
        .select(`
          *,
          users (
            id,
            username,
            email,
            verification_status
          )
        `)
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (allPendingError) {
        console.error('❌ Error fetching all pending documents:', allPendingError);
      } else if (allPendingDocs && allPendingDocs.length > 0) {
        console.log(`🔔 Found ${allPendingDocs.length} pending verification documents (admin view):`);
        allPendingDocs.forEach((doc, index) => {
          console.log(`  ${index + 1}. User: ${doc.users?.username || 'Unknown'} (${doc.users?.email || 'No email'})`);
          console.log(`     Document Type: ${doc.document_type}`);
          console.log(`     Status: ${doc.verification_status}`);
          console.log(`     Created: ${doc.created_at}`);
          console.log('');
        });
      } else {
        console.log('🔔 No pending verification documents found (admin view)');
      }
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVerificationIssue();
