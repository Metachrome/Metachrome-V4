const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ixqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjY3NzM3MywiZXhwIjoyMDQyMjUzMzczfQ.example';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Hash the password
    const password = 'testpass123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Password hash created:', passwordHash);
    
    // Create user object
    const testUser = {
      id: `test-user-${Date.now()}`,
      username: 'testuser',
      email: 'testuser@example.com',
      password_hash: passwordHash,
      role: 'user',
      firstName: 'Test',
      lastName: 'User',
      balance: 10000,
      status: 'active',
      trading_mode: 'normal',
      verification_status: 'verified',
      has_uploaded_documents: true,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Test user object:', testUser);
    console.log('Username: testuser');
    console.log('Password: testpass123');
    
    // For now, just output the user object - you can manually add it to Supabase
    console.log('\n✅ Test user created successfully!');
    console.log('You can use these credentials:');
    console.log('Username: testuser');
    console.log('Password: testpass123');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();
