// Check current pending deposits
const http = require('http');

function testAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9999,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token-admin-001'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function checkPendingDeposits() {
  console.log('🔍 CHECKING PENDING DEPOSITS\n');

  try {
    const result = await testAPI('/api/admin/pending-requests');
    
    if (result.status === 200) {
      console.log('✅ Pending requests fetched successfully');
      console.log('📊 Summary:');
      console.log(`   Deposits: ${result.data.deposits.length}`);
      console.log(`   Withdrawals: ${result.data.withdrawals.length}`);
      console.log(`   Total: ${result.data.total}`);
      
      if (result.data.deposits.length > 0) {
        console.log('\n📋 DEPOSIT DETAILS:');
        result.data.deposits.forEach((deposit, index) => {
          console.log(`\n${index + 1}. Deposit ID: ${deposit.id}`);
          console.log(`   User: ${deposit.username} (${deposit.user_id})`);
          console.log(`   Amount: $${deposit.amount} ${deposit.currency}`);
          console.log(`   Status: ${deposit.status}`);
          console.log(`   Created: ${deposit.created_at}`);
          
          if (deposit.tx_hash) {
            console.log(`   TX Hash: ${deposit.tx_hash}`);
          }
          
          if (deposit.wallet_address) {
            console.log(`   Wallet: ${deposit.wallet_address}`);
          }
          
          if (deposit.receipt) {
            console.log('   📎 RECEIPT INFO:');
            console.log(`      Original Name: ${deposit.receipt.originalName}`);
            console.log(`      File Type: ${deposit.receipt.mimetype}`);
            console.log(`      Size: ${deposit.receipt.size} bytes`);
            console.log(`      URL: ${deposit.receipt.url}`);
            console.log(`      Filename: ${deposit.receipt.filename}`);
          } else {
            console.log('   ❌ No receipt data found');
          }
        });
      } else {
        console.log('\n📭 No pending deposits found');
      }
      
    } else {
      console.log('❌ Failed to fetch pending requests:', result.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPendingDeposits();
