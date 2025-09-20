// Test script to verify deposit user identification fix
console.log('🧪 Testing deposit user identification fix...');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDepositFix() {
  const baseUrl = 'https://metachrome-v2-production.up.railway.app'; // Use Railway URL
  
  try {
    console.log('1️⃣ Testing deposit creation with proper user identification...');
    
    // Simulate Angela's token (this should match the actual token format)
    const angelaToken = 'user-session-user-angela-1758195715890';
    
    const depositResponse = await fetch(`${baseUrl}/api/transactions/deposit-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${angelaToken}`
      },
      body: JSON.stringify({
        amount: 100,
        currency: 'USDT-ERC'
      })
    });
    
    if (depositResponse.ok) {
      const result = await depositResponse.json();
      console.log('✅ Deposit created successfully:', result.depositId);
      
      // Now check pending requests to see if the username is correct
      console.log('2️⃣ Checking pending requests...');
      const pendingResponse = await fetch(`${baseUrl}/api/admin/pending-requests`);
      
      if (pendingResponse.ok) {
        const pending = await pendingResponse.json();
        const latestDeposit = pending.deposits[pending.deposits.length - 1];
        
        console.log('📋 Latest deposit details:', {
          id: latestDeposit.id,
          username: latestDeposit.username,
          amount: latestDeposit.amount,
          userId: latestDeposit.userId || latestDeposit.user_id
        });
        
        if (latestDeposit.username === 'angela.soenoko') {
          console.log('✅ SUCCESS: Deposit correctly recorded for angela.soenoko');
        } else {
          console.log('❌ FAILED: Deposit recorded for wrong user:', latestDeposit.username);
        }
      } else {
        console.log('❌ Failed to fetch pending requests');
      }
    } else {
      const error = await depositResponse.text();
      console.log('❌ Deposit creation failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDepositFix();
