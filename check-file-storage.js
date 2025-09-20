#!/usr/bin/env node

/**
 * Check file storage for user balance
 */

const fs = require('fs').promises;
const path = require('path');

async function checkFileStorage() {
  console.log('🔧 CHECKING FILE STORAGE');
  console.log('========================');
  
  try {
    // Check if users.json exists
    const usersPath = path.join(__dirname, 'users.json');
    
    try {
      const usersData = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(usersData);
      
      console.log('✅ Found users.json file');
      console.log(`   Total users: ${users.length}`);
      
      // Find testuser123
      const testUser = users.find(u => u.username === 'testuser123');
      
      if (testUser) {
        console.log('\n✅ Found testuser123:');
        console.log(`   ID: ${testUser.id}`);
        console.log(`   Username: ${testUser.username}`);
        console.log(`   Balance: $${testUser.balance}`);
        console.log(`   Email: ${testUser.email}`);
        
        if (testUser.redeem_history) {
          console.log(`   Redeem History: ${testUser.redeem_history.length} entries`);
          testUser.redeem_history.forEach((entry, index) => {
            console.log(`     ${index + 1}. Code: ${entry.code}, Amount: $${entry.bonus_amount}, Date: ${entry.redeemed_at}`);
          });
        } else {
          console.log('   Redeem History: None');
        }
      } else {
        console.log('\n❌ testuser123 not found in file storage');
        
        // Show all users
        console.log('\n📋 All users in file storage:');
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.username} (ID: ${user.id}) - Balance: $${user.balance}`);
        });
      }
      
    } catch (fileError) {
      console.log('❌ Error reading users.json:', fileError.message);
      
      // Check if file exists
      try {
        await fs.access(usersPath);
        console.log('   File exists but cannot be read');
      } catch (accessError) {
        console.log('   File does not exist');
      }
    }
    
    // Also check for any other user storage files
    console.log('\n🔍 Checking for other storage files...');
    
    const files = await fs.readdir(__dirname);
    const storageFiles = files.filter(file => 
      file.includes('user') || 
      file.includes('storage') || 
      file.includes('data') ||
      file.endsWith('.json')
    );
    
    console.log('📁 Found storage-related files:');
    storageFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking file storage:', error);
  }
}

// Main execution
if (require.main === module) {
  checkFileStorage().catch(console.error);
}

module.exports = { checkFileStorage };
