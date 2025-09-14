// Test the approval functionality
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

async function testApprovalWorkflow() {
  console.log('🧪 TESTING APPROVAL WORKFLOW\n');

  try {
    // Step 1: Check current pending deposits
    console.log('1️⃣ Checking pending deposits...');
    const pendingResult = await testAPI('/api/admin/pending-requests');
    
    if (pendingResult.status === 200 && pendingResult.data.deposits.length > 0) {
      const deposit = pendingResult.data.deposits[0];
      console.log(`   ✅ Found deposit: ${deposit.id} - $${deposit.amount} from ${deposit.username}`);
      console.log(`   📊 Status: ${deposit.status}`);
      
      if (deposit.receipt) {
        console.log(`   📎 Receipt: ${deposit.receipt.originalName} (${deposit.receipt.mimetype})`);
      }
      
      // Step 2: Test approval
      console.log('\n2️⃣ Testing deposit approval...');
      const approvalResult = await testAPI(`/api/admin/deposits/${deposit.id}/action`, 'POST', {
        action: 'approve'
      });
      
      if (approvalResult.status === 200) {
        console.log('   ✅ Deposit approved successfully!');
        console.log('   📋 Response:', approvalResult.data.message);
        
        // Step 3: Check if deposit was removed from pending
        console.log('\n3️⃣ Checking pending deposits after approval...');
        const afterApprovalResult = await testAPI('/api/admin/pending-requests');
        
        if (afterApprovalResult.status === 200) {
          console.log(`   📊 Pending deposits now: ${afterApprovalResult.data.deposits.length}`);
          
          if (afterApprovalResult.data.deposits.length === 0) {
            console.log('   ✅ Deposit successfully removed from pending list');
          } else {
            console.log('   ⚠️ Deposit still in pending list');
          }
        }
        
        // Step 4: Check user balance
        console.log('\n4️⃣ Checking user balance...');
        const usersResult = await testAPI('/api/admin/users');
        
        if (usersResult.status === 200) {
          const user = usersResult.data.find(u => u.username === deposit.username);
          if (user) {
            console.log(`   💰 User ${user.username} balance: $${user.balance}`);
            console.log('   ✅ Balance should have increased by $100');
          }
        }
        
      } else {
        console.log('   ❌ Approval failed:', approvalResult.data);
      }
      
    } else {
      console.log('   ❌ No pending deposits found to test approval');
      console.log('   💡 Run test-receipt-upload.cjs first to create a test deposit');
    }

    console.log('\n🎉 APPROVAL WORKFLOW TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApprovalWorkflow();
