// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

async function testDeposit() {
  try {
    console.log('🧪 Testing deposit with debug...');
    
    const response = await fetch('http://localhost:3333/api/superadmin/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-angela-1758195715',
        amount: 100,
        note: 'Debug test deposit'
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success response:', result);
    } else {
      const error = await response.text();
      console.log('❌ Error response:', error);
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testDeposit();
