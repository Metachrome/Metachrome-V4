// Quick deployment script to update Railway with the deposit approval fix
const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOYING DEPOSIT APPROVAL FIX TO RAILWAY');
console.log('============================================');

async function deployFix() {
  try {
    console.log('\n1. 🔍 Checking local working-server.js...');
    
    const serverFile = path.join(__dirname, 'working-server.js');
    if (!fs.existsSync(serverFile)) {
      throw new Error('working-server.js not found');
    }
    
    const serverContent = fs.readFileSync(serverFile, 'utf8');
    
    // Check if the deposit action endpoint exists
    const hasDepositEndpoint = serverContent.includes("app.post('/api/admin/deposits/:id/action'");
    const hasRealTimeSync = serverContent.includes('REAL-TIME SYNC: Also save to Supabase database');
    
    console.log('✅ Local server file found');
    console.log('📊 Has deposit action endpoint:', hasDepositEndpoint ? '✅ YES' : '❌ NO');
    console.log('📊 Has real-time sync code:', hasRealTimeSync ? '✅ YES' : '❌ NO');
    
    if (!hasDepositEndpoint) {
      throw new Error('Deposit action endpoint missing in local file');
    }
    
    console.log('\n2. 🔧 Checking git status...');
    
    // Check git status
    const { execSync } = require('child_process');
    
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      console.log('📊 Git status:', gitStatus.trim() || 'Clean working tree');
      
      // Check if we have a git repository
      const gitRemote = execSync('git remote -v', { encoding: 'utf8' });
      console.log('📊 Git remotes:', gitRemote.trim());
      
      if (gitRemote.includes('railway') || gitRemote.includes('github')) {
        console.log('✅ Git repository configured for deployment');
        
        console.log('\n3. 🚀 DEPLOYMENT OPTIONS:');
        console.log('');
        console.log('📋 OPTION 1: Railway Dashboard (Recommended)');
        console.log('   1. Go to: https://railway.app/dashboard');
        console.log('   2. Find your METACHROME project');
        console.log('   3. Go to "Deployments" tab');
        console.log('   4. Click "Redeploy" button');
        console.log('');
        console.log('📋 OPTION 2: Git Push (if configured)');
        console.log('   1. git add working-server.js');
        console.log('   2. git commit -m "Fix deposit approval endpoints"');
        console.log('   3. git push');
        console.log('');
        console.log('📋 OPTION 3: Manual Upload');
        console.log('   1. Copy working-server.js content');
        console.log('   2. Upload to Railway via dashboard');
        
      } else {
        console.log('⚠️ No Railway/GitHub remote found');
      }
      
    } catch (gitError) {
      console.log('⚠️ Git not available or not a git repository');
    }
    
    console.log('\n4. 🎯 WHAT THE FIX WILL DO:');
    console.log('');
    console.log('✅ Add missing deposit approval endpoint: /api/admin/deposits/:id/action');
    console.log('✅ Enable real-time balance updates when deposits are approved');
    console.log('✅ Sync deposit removals with Supabase database');
    console.log('✅ Fix the 404 error you\'re seeing in admin dashboard');
    console.log('');
    console.log('🎯 AFTER DEPLOYMENT:');
    console.log('   • Admin can approve/reject deposits ✅');
    console.log('   • User balances update immediately ✅');
    console.log('   • Real-time sync between user and admin ✅');
    
    console.log('\n5. 🧪 TESTING AFTER DEPLOYMENT:');
    console.log('');
    console.log('1. Go to admin dashboard');
    console.log('2. Try to approve a deposit');
    console.log('3. Should work without 404 error');
    console.log('4. User balance should increase immediately');
    
    console.log('\n🎉 DEPLOYMENT GUIDE COMPLETED!');
    
  } catch (error) {
    console.error('❌ Deployment check failed:', error.message);
  }
}

// Run the deployment check
deployFix();
