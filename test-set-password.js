// Test script for "Set Login Password" feature
const fs = require('fs');

console.log('🧪 Testing "Set Login Password" feature...\n');

// Test 1: Check if MetaMask user exists without password
const users = JSON.parse(fs.readFileSync('users-data.json', 'utf8'));
const metamaskUser = users.find(u => u.id === 'user-metamask-test');

if (metamaskUser) {
  console.log('✅ Test MetaMask user found:');
  console.log('   ID:', metamaskUser.id);
  console.log('   Username:', metamaskUser.username);
  console.log('   Email:', metamaskUser.email);
  console.log('   Wallet Address:', metamaskUser.wallet_address);
  console.log('   Has Password Hash:', !!metamaskUser.password_hash);
  console.log('   Password Hash Length:', metamaskUser.password_hash?.length || 0);
  
  // Test the condition logic
  const hasPassword = !!(metamaskUser.password_hash && metamaskUser.password_hash.length > 0);
  const shouldShowSetPassword = metamaskUser.wallet_address || !hasPassword;
  
  console.log('\n🔍 Condition Logic:');
  console.log('   hasPassword:', hasPassword);
  console.log('   shouldShowSetPassword:', shouldShowSetPassword);
  
  if (shouldShowSetPassword) {
    console.log('\n✅ SUCCESS: "Set Login Password" should be visible for this user!');
  } else {
    console.log('\n❌ FAIL: "Set Login Password" will NOT be visible for this user!');
  }
} else {
  console.log('❌ Test MetaMask user not found!');
}

// Test 2: Check regular user with password
const regularUser = users.find(u => u.id === 'user-angela-1758195715');
if (regularUser) {
  console.log('\n📋 Regular user check:');
  console.log('   Username:', regularUser.username);
  console.log('   Has Password Hash:', !!regularUser.password_hash);
  console.log('   Wallet Address:', regularUser.wallet_address);
  
  const hasPassword = !!(regularUser.password_hash && regularUser.password_hash.length > 0);
  const shouldShowSetPassword = regularUser.wallet_address || !hasPassword;
  
  console.log('   shouldShowSetPassword:', shouldShowSetPassword);
  
  if (shouldShowSetPassword) {
    console.log('   ✅ Will show "Set Login Password" (because has wallet)');
  } else {
    console.log('   ✅ Will show "Change Password" (normal flow)');
  }
}

console.log('\n🎯 Test completed!');
