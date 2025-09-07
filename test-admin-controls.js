import fetch from 'node-fetch';

async function testAdminControls() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('Testing admin controls endpoint...');
    
    const response = await fetch(`${baseUrl}/api/admin/controls`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testAdminControls();
