// Test API endpoints
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
    req.end();
  });
}

async function testAdminStats() {
  try {
    console.log('🧪 Testing admin stats endpoint...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/stats', {
      headers: {
        'Authorization': 'Bearer superadmin-token-123'
      }
    });
    
    const data = await response.json();
    console.log('📊 Admin Stats Response:', JSON.stringify(data, null, 2));
    
    if (data.winRate !== undefined && data.totalProfit !== undefined && data.totalLoss !== undefined) {
      console.log('✅ Win Rate and P&L data found!');
      console.log(`📈 Win Rate: ${data.winRate}%`);
      console.log(`💰 Total Profit: $${data.totalProfit}`);
      console.log(`💸 Total Loss: $${data.totalLoss}`);
      console.log(`📊 Total P&L: $${data.totalProfit - data.totalLoss}`);
    } else {
      console.log('❌ Missing win rate or P&L data');
    }
  } catch (error) {
    console.error('❌ Error testing admin stats:', error.message);
  }
}

async function testWithdrawals() {
  try {
    console.log('🧪 Testing withdrawals endpoint...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/users/demo-user-1757756401422/withdrawals', {
      headers: {
        'Authorization': 'Bearer user-session-demo-user-1757756401422'
      }
    });
    
    const data = await response.json();
    console.log('💸 Withdrawals Response:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('✅ Withdrawal history found!');
      console.log(`📊 Total withdrawals: ${data.length}`);
    } else {
      console.log('❌ No withdrawal history found');
    }
  } catch (error) {
    console.error('❌ Error testing withdrawals:', error.message);
  }
}

async function testTrades() {
  try {
    console.log('🧪 Testing trades endpoint...');
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/trades', {
      headers: {
        'Authorization': 'Bearer superadmin-token-123'
      }
    });

    const data = await response.json();
    console.log('📈 Trades Response (first 3):');
    if (Array.isArray(data)) {
      data.slice(0, 3).forEach((trade, index) => {
        console.log(`Trade ${index + 1}:`, {
          id: trade.id,
          result: trade.result,
          profit: trade.profit,
          amount: trade.amount,
          user_id: trade.user_id
        });
      });
      console.log(`📊 Total trades: ${data.length}`);
      console.log(`📊 Completed trades: ${data.filter(t => t.result && t.result !== 'pending').length}`);
      console.log(`📊 Win trades: ${data.filter(t => t.result === 'win').length}`);
      console.log(`📊 Lose trades: ${data.filter(t => t.result === 'lose').length}`);
    } else {
      console.log('❌ Trades data is not an array:', data);
    }
  } catch (error) {
    console.error('❌ Error testing trades:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  await testAdminStats();
  console.log('\n' + '='.repeat(50) + '\n');
  await testTrades();
  console.log('\n' + '='.repeat(50) + '\n');
  await testWithdrawals();
  console.log('\n🏁 Tests completed!');
}

runTests();
