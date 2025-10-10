// Simple test to create a withdrawal request
const fetch = require('node-fetch');

async function createTestWithdrawal() {
  console.log('🧪 Creating test withdrawal via API...');
  
  try {
    // First, let's try the test endpoint
    const response = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/add-test-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const result = await response.text();
    console.log('📝 Response:', result);

    if (response.ok) {
      console.log('✅ Test withdrawal created successfully!');
      console.log('🎯 Now refresh your admin dashboard to see the withdrawal');
      console.log('🎯 Then test approve/reject functionality');
    } else {
      console.log('❌ Failed to create test withdrawal');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestWithdrawal();
