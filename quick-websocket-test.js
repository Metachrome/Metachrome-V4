// Quick WebSocket Test - Copy and paste this into browser console
console.log('🚀 QUICK WEBSOCKET TEST');
console.log('======================');

async function quickWebSocketTest() {
  try {
    // Get user data
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.log('❌ No user data found - please log in first');
      return;
    }
    
    const user = JSON.parse(userData);
    console.log('👤 Testing for user:', user.id);
    
    // Get auth token
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.log('❌ No auth token found - please log in first');
      return;
    }
    
    console.log('📡 Sending test WebSocket notification...');
    
    // Call the test endpoint
    const response = await fetch('/api/test/websocket-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        userId: user.id
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test notification sent successfully:', result);
      console.log('👀 Check console for "🚨 TRADE COMPLETION MESSAGE RECEIVED!" message');
      console.log('👀 You should see a notification appear on screen');
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Test failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('❌ Test error:', error);
    return false;
  }
}

// Run the test
quickWebSocketTest();
