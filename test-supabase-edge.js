// Test script for Supabase Edge Function
async function testSupabaseEdgeFunction() {
  const edgeFunctionUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co/functions/v1/admin-auth';
  
  console.log('🧪 Testing Supabase Edge Function:', edgeFunctionUrl);
  
  try {
    // Test with admin credentials
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
  }
}

// Test with superadmin credentials
async function testSuperadmin() {
  const edgeFunctionUrl = 'https://pybsyzbxyliufkgywtpf.supabase.co/functions/v1/admin-auth';
  
  console.log('\n🧪 Testing Superadmin Login:', edgeFunctionUrl);
  
  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'superadmin123'
      })
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Supabase Edge Function Tests...\n');
testSupabaseEdgeFunction().then(() => {
  return testSuperadmin();
}).then(() => {
  console.log('\n🏁 Tests completed!');
});
