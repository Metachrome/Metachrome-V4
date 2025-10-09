// Debug script to check user data and hasPassword logic
const fs = require('fs');

console.log('🔍 Debugging user data and hasPassword logic...\n');

// Read users data
const users = JSON.parse(fs.readFileSync('users-data.json', 'utf8'));

console.log('📋 All users and their password status:');
users.forEach(user => {
  const hasPasswordHash = !!(user.password_hash && user.password_hash.length > 0);
  const hasWallet = !!user.wallet_address;
  
  console.log(`\n👤 ${user.username} (${user.id}):`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Wallet: ${user.wallet_address || 'None'}`);
  console.log(`   Password Hash: ${user.password_hash ? user.password_hash.substring(0, 20) + '...' : 'EMPTY'}`);
  console.log(`   Has Password: ${hasPasswordHash}`);
  console.log(`   Has Wallet: ${hasWallet}`);
  
  // Test the OLD logic (incorrect)
  const oldLogic = hasWallet || !hasPasswordHash;
  console.log(`   OLD Logic (wallet OR !hasPassword): ${oldLogic}`);
  
  // Test the NEW logic (correct)
  const newLogic = !hasPasswordHash;
  console.log(`   NEW Logic (!hasPassword): ${newLogic}`);
  
  if (oldLogic !== newLogic) {
    console.log(`   🔄 LOGIC CHANGE: ${oldLogic} → ${newLogic}`);
  }
});

console.log('\n🎯 Summary:');
console.log('- OLD logic showed "Set Password" for users with wallets (even if they had passwords)');
console.log('- NEW logic shows "Set Password" ONLY for users without passwords');
console.log('- Users with passwords will now see "Change Password" regardless of wallet status');
