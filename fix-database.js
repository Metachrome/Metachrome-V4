// Fix database data
const https = require('https');

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function fixTrades() {
  try {
    console.log('🔧 Fixing trades data...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/fix-trades', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer superadmin-token-123',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ Fix trades response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error fixing trades:', error.message);
  }
}

async function addTestWithdrawals() {
  try {
    console.log('🔧 Adding test withdrawals...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/add-test-withdrawals', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer superadmin-token-123',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ Add withdrawals response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error adding withdrawals:', error.message);
  }
}

async function testAfterFix() {
  try {
    console.log('🧪 Testing stats after fix...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/stats', {
      headers: {
        'Authorization': 'Bearer superadmin-token-123'
      }
    });
    
    const data = await response.json();
    console.log('📊 Updated Stats:', {
      winRate: data.winRate + '%',
      totalProfit: '$' + data.totalProfit,
      totalLoss: '$' + data.totalLoss,
      totalPnL: '$' + (data.totalProfit - data.totalLoss)
    });
  } catch (error) {
    console.error('❌ Error testing stats:', error.message);
  }
}

async function runFixes() {
  console.log('🚀 Starting database fixes...');

  // Test if fix endpoints are available
  try {
    console.log('🧪 Testing fix-trades endpoint...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/fix-trades', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer superadmin-token-123',
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Fix-trades endpoint status:', response.status);

    if (response.status === 404) {
      console.log('❌ Fix endpoints not deployed yet. Deployment still in progress...');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Fix trades response:', JSON.stringify(data, null, 2));

      console.log('\n' + '='.repeat(50) + '\n');
      await addTestWithdrawals();
      console.log('\n' + '='.repeat(50) + '\n');
      await testAfterFix();
    } else {
      const text = await response.text();
      console.log('❌ Fix endpoint error:', response.status, text.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Fix endpoint test failed:', error.message);
  }

  console.log('\n🏁 Database fixes completed!');
}

runFixes();
