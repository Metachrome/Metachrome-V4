// Simple Server Test - Run in Browser Console
console.log('🔍 SIMPLE SERVER TEST');
console.log('====================');

async function simpleServerTest() {
  try {
    console.log('🌐 Testing basic server connectivity...');
    
    // Test 1: Basic server response
    const response = await fetch('/api/balances');
    console.log('Server response status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Server is responding');
    } else {
      console.log('❌ Server response issue');
      return;
    }
    
    // Test 2: Get user data
    const userData = localStorage.getItem('user');
    const authToken = localStorage.getItem('authToken');
    
    if (!userData || !authToken) {
      console.log('❌ Missing user data or auth token');
      return;
    }
    
    const user = JSON.parse(userData);
    console.log('👤 User ID:', user.id);
    
    // Test 3: Test WebSocket notification endpoint
    console.log('\n📡 Testing WebSocket notification endpoint...');
    
    const wsResponse = await fetch('/api/test/websocket-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId: user.id })
    });
    
    console.log('WebSocket test response status:', wsResponse.status);
    
    if (wsResponse.ok) {
      const wsResult = await wsResponse.json();
      console.log('✅ WebSocket test result:', wsResult);
      
      if (wsResult.clientCount > 0) {
        console.log('✅ WebSocket clients connected:', wsResult.clientCount);
        console.log('👀 Check console for "🚨 TRADE COMPLETION MESSAGE RECEIVED!"');
      } else {
        console.log('⚠️ No WebSocket clients connected');
        console.log('💡 This might be why notifications aren\'t working');
      }
    } else {
      const error = await wsResponse.text();
      console.log('❌ WebSocket test failed:', error);
    }
    
    // Test 4: Test trade completion endpoint directly
    console.log('\n🔧 Testing trade completion endpoint...');
    
    const completionResponse = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        tradeId: 'test-' + Date.now(),
        userId: user.id,
        won: true,
        amount: 1,
        payout: 1.1
      })
    });
    
    console.log('Trade completion response status:', completionResponse.status);
    
    if (completionResponse.ok) {
      const completionResult = await completionResponse.json();
      console.log('✅ Trade completion result:', completionResult);
      console.log('👀 Check console for WebSocket messages now!');
    } else {
      const error = await completionResponse.text();
      console.log('❌ Trade completion failed:', error);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error);
  }
}

// Run the test
simpleServerTest();
