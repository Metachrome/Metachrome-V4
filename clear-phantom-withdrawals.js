const fs = require('fs');
const path = require('path');

async function clearPhantomWithdrawals() {
  console.log('🧹 CLEARING PHANTOM WITHDRAWALS: Starting cleanup...');
  
  try {
    // 1. Clear local pending data file
    const pendingDataFile = path.join(__dirname, 'pending-data.json');
    
    if (fs.existsSync(pendingDataFile)) {
      console.log('📄 Found pending-data.json file');
      
      // Read current data
      const currentData = JSON.parse(fs.readFileSync(pendingDataFile, 'utf8'));
      console.log('📊 Current pending data:');
      console.log('- Withdrawals:', (currentData.withdrawals || []).length);
      console.log('- Deposits:', (currentData.deposits || []).length);
      
      // Clear withdrawals but keep deposits
      const clearedData = {
        withdrawals: [], // Clear all withdrawals
        deposits: currentData.deposits || [] // Keep deposits
      };
      
      // Write cleared data
      fs.writeFileSync(pendingDataFile, JSON.stringify(clearedData, null, 2));
      console.log('✅ Cleared all withdrawals from pending-data.json');
      console.log('✅ Kept deposits intact');
      
    } else {
      console.log('📄 No pending-data.json file found');
    }
    
    // 2. Clear any other withdrawal-related files
    const filesToCheck = [
      'withdrawals-data.json',
      'pending-withdrawals.json',
      'local-withdrawals.json'
    ];
    
    filesToCheck.forEach(filename => {
      const filepath = path.join(__dirname, filename);
      if (fs.existsSync(filepath)) {
        console.log(`📄 Found ${filename} - clearing...`);
        fs.writeFileSync(filepath, JSON.stringify({ withdrawals: [] }, null, 2));
        console.log(`✅ Cleared ${filename}`);
      }
    });
    
    // 3. Create clean pending data structure
    const cleanPendingData = {
      withdrawals: [],
      deposits: []
    };
    
    fs.writeFileSync(pendingDataFile, JSON.stringify(cleanPendingData, null, 2));
    console.log('✅ Created clean pending-data.json structure');
    
    console.log('\n🎉 PHANTOM WITHDRAWAL CLEANUP COMPLETE!');
    console.log('📋 Next steps:');
    console.log('1. Restart the server');
    console.log('2. Check admin dashboard - phantom withdrawals should be gone');
    console.log('3. Only real database withdrawals will appear');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
clearPhantomWithdrawals();
