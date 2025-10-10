const axios = require('axios');

async function checkServerMismatch() {
  console.log('🔍 CHECKING SERVER MISMATCH ISSUE');
  console.log('==================================');
  
  const servers = [
    { name: 'LOCAL', url: 'http://localhost:3005' },
    { name: 'PRODUCTION', url: 'https://metachrome-v2-production.up.railway.app' }
  ];
  
  for (const server of servers) {
    console.log(`\n📡 Checking ${server.name} server (${server.url})`);
    console.log('='.repeat(50));
    
    try {
      // Check server status
      const statusResponse = await axios.get(`${server.url}/api/test/server-status`, {
        timeout: 5000
      });
      console.log(`✅ ${server.name} server is running`);
      
      // Check withdrawals in admin dashboard
      try {
        const withdrawalsResponse = await axios.get(`${server.url}/api/admin/withdrawals`, {
          timeout: 10000
        });
        
        const withdrawals = withdrawalsResponse.data.withdrawals || [];
        console.log(`📋 ${server.name} withdrawals count: ${withdrawals.length}`);
        
        if (withdrawals.length > 0) {
          console.log(`Recent withdrawals on ${server.name}:`);
          withdrawals.slice(0, 5).forEach((w, index) => {
            console.log(`  ${index + 1}. ${w.amount} ${w.currency} - ${w.status} (${w.created_at?.substring(0, 19) || 'no date'})`);
          });
          
          // Look for BTC withdrawals specifically
          const btcWithdrawals = withdrawals.filter(w => w.currency === 'BTC');
          if (btcWithdrawals.length > 0) {
            console.log(`🪙 BTC withdrawals on ${server.name}: ${btcWithdrawals.length}`);
            btcWithdrawals.forEach(w => {
              console.log(`   - ${w.amount} BTC (${w.status}) - ${w.created_at?.substring(0, 19) || 'no date'}`);
            });
          }
        } else {
          console.log(`📭 No withdrawals found on ${server.name}`);
        }
        
      } catch (adminError) {
        console.log(`❌ Failed to get withdrawals from ${server.name}:`, adminError.message);
      }
      
    } catch (error) {
      console.log(`❌ ${server.name} server is not accessible:`, error.message);
    }
  }
  
  console.log('\n🎯 DIAGNOSIS:');
  console.log('=============');
  console.log('If you see withdrawals on PRODUCTION but not LOCAL:');
  console.log('→ You made withdrawal on production but viewing admin on local');
  console.log('→ Solution: Use production admin dashboard');
  console.log('');
  console.log('If you see withdrawals on LOCAL but not PRODUCTION:');
  console.log('→ You made withdrawal on local but viewing admin on production');
  console.log('→ Solution: Use local admin dashboard');
  console.log('');
  console.log('If you see no withdrawals on either:');
  console.log('→ Database sync issue or withdrawal endpoint problem');
  console.log('→ Need to debug withdrawal endpoint');
}

checkServerMismatch().catch(console.error);
