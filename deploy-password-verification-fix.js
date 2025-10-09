#!/usr/bin/env node

/**
 * METACHROME Password & Verification Status Fix Deployment Script
 * 
 * This script applies critical fixes for:
 * 1. Password change functionality (hasPassword logic)
 * 2. Verification status display (property name mismatch)
 * 
 * Run this on the production server to apply fixes immediately.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 METACHROME Password & Verification Fix Deployment');
console.log('====================================================');

// Fix 1: Update working-server.js password endpoint debug logging
function fixPasswordEndpoint() {
  console.log('🔧 Fixing password change endpoint...');
  
  const serverFile = 'working-server.js';
  if (!fs.existsSync(serverFile)) {
    console.log('❌ working-server.js not found');
    return false;
  }
  
  let content = fs.readFileSync(serverFile, 'utf8');
  
  // Add debug logging to password endpoint
  const passwordEndpointPattern = /app\.put\('\/api\/user\/password', async \(req, res\) => \{[\s\S]*?const \{ currentPassword, newPassword, isFirstTimePassword \} = req\.body;/;
  
  if (content.includes('🔐 Password change request:')) {
    console.log('✅ Password endpoint debug logging already exists');
    return true;
  }
  
  const replacement = `app.put('/api/user/password', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const { currentPassword, newPassword, isFirstTimePassword } = req.body;

    console.log('🔐 Password change request:', {
      userId: authToken ? 'present' : 'missing',
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      isFirstTimePassword: !!isFirstTimePassword,
      requestBody: req.body
    });`;
  
  content = content.replace(
    /app\.put\('\/api\/user\/password', async \(req, res\) => \{\s*try \{\s*const authToken = req\.headers\.authorization\?\.replace\('Bearer ', ''\);\s*const \{ currentPassword, newPassword, isFirstTimePassword \} = req\.body;/,
    replacement
  );
  
  // Add user password status debug logging
  const userDebugPattern = /const user = await getUserFromToken\(authToken\);[\s\S]*?if \(!user\) \{[\s\S]*?\}/;
  
  if (!content.includes('🔍 User password status:')) {
    content = content.replace(
      /(const user = await getUserFromToken\(authToken\);[\s\S]*?if \(!user\) \{[\s\S]*?return res\.status\(401\)\.json\(\{ error: 'Invalid authentication' \}\);\s*\})/,
      `$1

    console.log('🔍 User password status:', {
      username: user.username,
      hasPasswordHash: !!(user.password_hash && user.password_hash.length > 0),
      passwordHashLength: user.password_hash?.length || 0
    });`
    );
  }
  
  fs.writeFileSync(serverFile, content);
  console.log('✅ Password endpoint debug logging added');
  return true;
}

// Fix 2: Update ProfilePage.tsx verification status property names
function fixProfilePageVerification() {
  console.log('🔧 Fixing ProfilePage verification status...');
  
  const profileFile = 'client/src/pages/ProfilePage.tsx';
  if (!fs.existsSync(profileFile)) {
    console.log('❌ ProfilePage.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(profileFile, 'utf8');
  
  // Fix verification_status to verificationStatus
  const fixes = [
    { from: /user\?\.verification_status/g, to: 'user?.verificationStatus' },
  ];
  
  let changesMade = 0;
  fixes.forEach(fix => {
    const matches = content.match(fix.from);
    if (matches) {
      content = content.replace(fix.from, fix.to);
      changesMade += matches.length;
    }
  });
  
  if (changesMade > 0) {
    fs.writeFileSync(profileFile, content);
    console.log(`✅ Fixed ${changesMade} verification status property references`);
  } else {
    console.log('✅ ProfilePage verification status already fixed');
  }
  
  return true;
}

// Fix 3: Add debug logging to ProfilePage
function addProfilePageDebugLogging() {
  console.log('🔧 Adding ProfilePage debug logging...');
  
  const profileFile = 'client/src/pages/ProfilePage.tsx';
  if (!fs.existsSync(profileFile)) {
    console.log('❌ ProfilePage.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(profileFile, 'utf8');
  
  // Add debug logging before hasPassword check
  if (!content.includes('🔍 ProfilePage Security Tab Debug:')) {
    content = content.replace(
      /(\s*{\/\* Check if user has no password set \(MetaMask\/Google users without password\) \*\/}\s*{!user\?\.hasPassword \? \()/,
      `                {/* Debug logging for password status */}
                {console.log('🔍 ProfilePage Security Tab Debug:', {
                  hasPassword: user?.hasPassword,
                  shouldShowSetPassword: !user?.hasPassword,
                  walletAddress: user?.walletAddress,
                  verificationStatus: user?.verificationStatus
                })}
                
$1`
    );
    
    fs.writeFileSync(profileFile, content);
    console.log('✅ ProfilePage debug logging added');
  } else {
    console.log('✅ ProfilePage debug logging already exists');
  }
  
  return true;
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking current directory:', process.cwd());
    
    // Apply all fixes
    const fixes = [
      { name: 'Password Endpoint Debug Logging', fn: fixPasswordEndpoint },
      { name: 'ProfilePage Verification Status', fn: fixProfilePageVerification },
      { name: 'ProfilePage Debug Logging', fn: addProfilePageDebugLogging }
    ];
    
    let successCount = 0;
    for (const fix of fixes) {
      console.log(`\n📋 Applying: ${fix.name}`);
      if (fix.fn()) {
        successCount++;
      }
    }
    
    console.log('\n🎯 DEPLOYMENT SUMMARY');
    console.log('====================');
    console.log(`✅ Successfully applied: ${successCount}/${fixes.length} fixes`);
    
    if (successCount === fixes.length) {
      console.log('\n🚀 ALL FIXES APPLIED SUCCESSFULLY!');
      console.log('\n📝 Next Steps:');
      console.log('1. Restart the server: pm2 restart all (or your restart command)');
      console.log('2. Clear browser cache and refresh the profile page');
      console.log('3. Check browser console for debug output');
      console.log('4. Test password change functionality');
      console.log('5. Verify verification status display');
    } else {
      console.log('\n⚠️  Some fixes could not be applied. Check the logs above.');
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
main();
