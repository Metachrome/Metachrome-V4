// Test script to verify password hash
const bcrypt = require('bcryptjs');

async function testPasswordHash() {
  const password = 'superadmin123';
  const storedHash = '$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOyQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHWKtG';
  
  console.log('🔐 Testing password hash...');
  console.log('Password:', password);
  console.log('Stored hash:', storedHash);
  
  try {
    const isValid = await bcrypt.compare(password, storedHash);
    console.log('✅ Password valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Hash verification failed. Generating new hash...');
      const newHash = await bcrypt.hash(password, 10);
      console.log('🔑 New hash:', newHash);
      
      // Test the new hash
      const newIsValid = await bcrypt.compare(password, newHash);
      console.log('✅ New hash valid:', newIsValid);
    }
  } catch (error) {
    console.error('❌ Error testing hash:', error);
  }
}

testPasswordHash();
