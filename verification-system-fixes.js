

// ===== VERIFICATION DEBUG ENDPOINT =====
app.get('/api/debug/verification-status/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('🔍 DEBUG: Checking verification status for:', username);
    
    if (isProduction && supabase) {
      // Check user in Supabase
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, email, verification_status, has_uploaded_documents, verified_at, updated_at')
        .eq('username', username)
        .single();
      
      if (userError) {
        console.error('❌ User fetch error:', userError);
        return res.status(404).json({ error: 'User not found', details: userError });
      }
      
      // Check verification documents
      const { data: docs, error: docsError } = await supabase
        .from('user_verification_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (docsError) {
        console.error('❌ Documents fetch error:', docsError);
      }
      
      res.json({
        user: user,
        documents: docs || [],
        documentsCount: docs ? docs.length : 0,
        hasDocuments: docs && docs.length > 0,
        debug: true
      });
    } else {
      // Development mode
      const users = await getUsers();
      const user = users.find(u => u.username === username);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check local verification documents
      const verificationDocuments = pendingData.verificationDocuments || [];
      const userDocs = verificationDocuments.filter(doc => doc.user_id === user.id);
      
      res.json({
        user: user,
        documents: userDocs,
        documentsCount: userDocs.length,
        hasDocuments: userDocs.length > 0,
        debug: true,
        mode: 'development'
      });
    }
  } catch (error) {
    console.error('❌ Debug verification error:', error);
    res.status(500).json({ error: 'Debug failed', details: error.message });
  }
});



// ===== ENHANCED VERIFICATION UPLOAD ENDPOINT =====
app.post('/api/user/upload-verification-enhanced', upload.single('document'), async (req, res) => {
  try {
    console.log('📄 ENHANCED Verification document upload request');
    console.log('📄 Request headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');
    console.log('📄 Request body:', req.body);
    console.log('📄 File info:', req.file ? { name: req.file.originalname, size: req.file.size, type: req.file.mimetype } : 'No file');

    // Check authentication
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    console.log('📄 Auth token:', authToken ? authToken.substring(0, 30) + '...' : 'NONE');

    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user from token with enhanced error handling
    console.log('📄 Getting user from token...');
    const user = await getUserFromToken(authToken);
    console.log('📄 User from token:', user ? { id: user.id, username: user.username } : 'NOT FOUND');

    if (!user) {
      console.log('❌ Invalid authentication - user not found for token:', authToken.substring(0, 50) + '...');
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentType } = req.body;
    console.log('📄 Document type:', documentType);

    const documentUrl = `/api/admin/verification-document/${req.file.filename}`;

    // Save to database with enhanced error handling
    if (isProduction && supabase) {
      console.log('📄 Saving to Supabase database...');
      
      // First, insert the document
      const { data: docData, error: docError } = await supabase
        .from('user_verification_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          document_url: documentUrl,
          verification_status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (docError) {
        console.error('❌ Document insert error:', docError);
        throw docError;
      }

      console.log('✅ Document inserted:', docData);

      // Then, update user verification status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update({
          verification_status: 'pending',
          has_uploaded_documents: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (userError) {
        console.error('❌ User update error:', userError);
        // Don't throw here, document is already saved
      } else {
        console.log('✅ User status updated:', userData);
      }

      console.log('✅ Verification document uploaded to database:', docData);
      res.json({ 
        success: true, 
        document: docData,
        user: userData,
        message: 'Document uploaded successfully and user status updated'
      });
    } else {
      // Development mode - store in local file system with enhanced handling
      console.log('📄 Saving to local file system (development mode)...');
      
      const users = await getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].verification_status = 'pending';
        users[userIndex].has_uploaded_documents = true;
        users[userIndex].updated_at = new Date().toISOString();
        await saveUsers(users);
        console.log('✅ User status updated in local file');
      }

      const document = {
        id: `doc-${Date.now()}`,
        user_id: user.id,
        document_type: documentType,
        document_url: documentUrl,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        users: {
          id: user.id,
          username: user.username,
          email: user.email || user.username,
          verification_status: 'pending'
        }
      };

      // Save to local verification documents
      if (!pendingData.verificationDocuments) {
        pendingData.verificationDocuments = [];
      }
      pendingData.verificationDocuments.push(document);
      savePendingData();

      console.log('✅ Verification document saved locally:', document);
      res.json({ 
        success: true, 
        document: document,
        message: 'Document uploaded successfully (development mode)'
      });
    }

  } catch (error) {
    console.error('❌ Enhanced verification upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload verification document',
      details: error.message,
      stack: error.stack
    });
  }
});



// ===== ENHANCED PENDING VERIFICATIONS ENDPOINT =====
app.get('/api/admin/pending-verifications-enhanced', async (req, res) => {
  try {
    console.log('📄 ENHANCED Getting pending verification documents');

    if (isProduction && supabase) {
      console.log('📄 Fetching from Supabase...');
      
      const { data: documents, error } = await supabase
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

      if (error) {
        console.error('❌ Supabase fetch error:', error);
        throw error;
      }

      console.log(`📄 Found ${documents ? documents.length : 0} pending documents in Supabase`);
      
      // Also get all documents for debugging
      const { data: allDocuments, error: allError } = await supabase
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
        .order('created_at', { ascending: false });

      if (!allError) {
        console.log(`📄 Total documents in database: ${allDocuments ? allDocuments.length : 0}`);
      }

      res.json({
        pending: documents || [],
        total: allDocuments || [],
        pendingCount: documents ? documents.length : 0,
        totalCount: allDocuments ? allDocuments.length : 0,
        enhanced: true
      });
    } else {
      // Development mode - return stored verification documents
      console.log('📄 Fetching from local storage (development mode)...');
      
      const verificationDocuments = pendingData.verificationDocuments || [];

      // Filter only pending documents
      const pendingDocuments = verificationDocuments.filter(doc =>
        doc.verification_status === 'pending'
      );

      console.log(`📄 Found ${pendingDocuments.length} pending verification documents locally`);
      console.log(`📄 Total verification documents locally: ${verificationDocuments.length}`);
      
      res.json({
        pending: pendingDocuments,
        total: verificationDocuments,
        pendingCount: pendingDocuments.length,
        totalCount: verificationDocuments.length,
        enhanced: true,
        mode: 'development'
      });
    }

  } catch (error) {
    console.error('❌ Enhanced pending verifications error:', error);
    res.status(500).json({ 
      error: 'Failed to get pending verifications',
      details: error.message,
      enhanced: true
    });
  }
});


// ===== VERIFICATION STATUS FORCE REFRESH ENDPOINT =====
app.post('/api/user/force-refresh-verification', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await getUserFromToken(authToken);
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    console.log('🔄 Force refreshing verification status for:', user.username);

    if (isProduction && supabase) {
      // Get fresh user data from Supabase
      const { data: freshUser, error } = await supabase
        .from('users')
        .select('id, username, email, verification_status, has_uploaded_documents, verified_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      res.json({
        success: true,
        user: freshUser,
        message: 'Verification status refreshed'
      });
    } else {
      // Development mode
      const users = await getUsers();
      const freshUser = users.find(u => u.id === user.id);
      
      res.json({
        success: true,
        user: freshUser,
        message: 'Verification status refreshed (development mode)'
      });
    }
  } catch (error) {
    console.error('❌ Force refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh verification status' });
  }
});
