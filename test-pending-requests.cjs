// Test the complete pending requests workflow
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

async function testPendingRequestsWorkflow() {
  console.log('🧪 TESTING PENDING REQUESTS WORKFLOW\n');

  try {
    // Step 1: Create a deposit request (simulate user action)
    console.log('1️⃣ Creating deposit request...');
    const depositResult = await testAPI('/api/transactions/deposit-request', 'POST', {
      amount: 100,
      currency: 'USDT'
    });
    
    if (depositResult.status === 200) {
      console.log('   ✅ Deposit request created:', depositResult.data.depositId);
      
      // Step 2: Submit transaction proof
      console.log('2️⃣ Submitting transaction proof...');
      const proofResult = await testAPI('/api/transactions/submit-proof', 'POST', {
        depositId: depositResult.data.depositId,
        txHash: '0x1234567890abcdef1234567890abcdef12345678',
        walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
      });
      
      if (proofResult.status === 200) {
        console.log('   ✅ Transaction proof submitted');
        
        // Step 3: Check pending requests
        console.log('3️⃣ Checking pending requests...');
        const pendingResult = await testAPI('/api/admin/pending-requests');
        
        if (pendingResult.status === 200) {
          console.log('   ✅ Pending requests fetched:');
          console.log(`      Deposits: ${pendingResult.data.deposits.length}`);
          console.log(`      Withdrawals: ${pendingResult.data.withdrawals.length}`);
          
          if (pendingResult.data.deposits.length > 0) {
            const deposit = pendingResult.data.deposits[0];
            console.log(`      First deposit: $${deposit.amount} from ${deposit.username} (${deposit.status})`);
            
            // Step 4: Approve the deposit
            console.log('4️⃣ Approving deposit...');
            const approveResult = await testAPI(`/api/admin/deposits/${deposit.id}/action`, 'POST', {
              action: 'approve'
            });
            
            if (approveResult.status === 200) {
              console.log('   ✅ Deposit approved successfully');
              
              // Step 5: Check user balance
              console.log('5️⃣ Checking user balance...');
              const usersResult = await testAPI('/api/admin/users');
              
              if (usersResult.status === 200) {
                const user = usersResult.data.find(u => u.id === deposit.user_id);
                console.log(`   ✅ User balance updated: $${user.balance}`);
              }
            } else {
              console.log('   ❌ Failed to approve deposit:', approveResult.data);
            }
          }
        } else {
          console.log('   ❌ Failed to fetch pending requests:', pendingResult.data);
        }
      } else {
        console.log('   ❌ Failed to submit proof:', proofResult.data);
      }
    } else {
      console.log('   ❌ Failed to create deposit request:', depositResult.data);
    }

    // Test withdrawal request
    console.log('\n6️⃣ Testing withdrawal request...');
    const withdrawalResult = await testAPI('/api/transactions/withdrawal-request', 'POST', {
      amount: 50,
      currency: 'USDT',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
    });
    
    if (withdrawalResult.status === 200) {
      console.log('   ✅ Withdrawal request created:', withdrawalResult.data.withdrawalId);
      
      // Check pending withdrawals
      console.log('7️⃣ Checking pending withdrawals...');
      const pendingResult2 = await testAPI('/api/admin/pending-requests');
      
      if (pendingResult2.status === 200 && pendingResult2.data.withdrawals.length > 0) {
        const withdrawal = pendingResult2.data.withdrawals[0];
        console.log(`   ✅ Pending withdrawal: $${withdrawal.amount} from ${withdrawal.username}`);
        
        // Approve withdrawal
        console.log('8️⃣ Approving withdrawal...');
        const approveWithdrawalResult = await testAPI(`/api/admin/withdrawals/${withdrawal.id}/action`, 'POST', {
          action: 'approve'
        });
        
        if (approveWithdrawalResult.status === 200) {
          console.log('   ✅ Withdrawal approved successfully');
        } else {
          console.log('   ❌ Failed to approve withdrawal:', approveWithdrawalResult.data);
        }
      }
    } else {
      console.log('   ❌ Failed to create withdrawal request:', withdrawalResult.data);
    }

    console.log('\n🎉 PENDING REQUESTS WORKFLOW TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for server to be ready
setTimeout(testPendingRequestsWorkflow, 2000);
