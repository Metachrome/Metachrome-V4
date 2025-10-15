// Test Deduplication Fix - Run in Browser Console
console.log('🧪 TESTING DEDUPLICATION FIX');
console.log('============================');

async function testDeduplicationFix() {
  try {
    // Get user data
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('👤 User ID:', user.id);
    
    // Test 1: Send a test WebSocket notification
    console.log('\n📡 STEP 1: Sending test WebSocket notification...');
    
    const wsResponse = await fetch('/api/test/websocket-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId: user.id })
    });
    
    if (wsResponse.ok) {
      const wsResult = await wsResponse.json();
      console.log('✅ WebSocket test sent:', wsResult);
      console.log('📊 Clients reached:', wsResult.clientCount);
      
      // Wait a moment for the message to be processed
      setTimeout(() => {
        console.log('\n🔍 STEP 2: Checking if notification appeared...');
        
        const notifications = document.querySelectorAll('[data-mobile-notification="true"]');
        console.log('📱 Notifications found:', notifications.length);
        
        if (notifications.length > 0) {
          console.log('✅ SUCCESS! Notification appeared on screen');
          console.log('🎉 The deduplication fix is working!');
        } else {
          console.log('❌ No notifications found on screen');
          console.log('💡 Let\'s try the direct test function...');
          
          // Try direct notification
          if (typeof window.testMobileNotificationNow === 'function') {
            console.log('🧪 Testing direct notification function...');
            window.testMobileNotificationNow();
          } else {
            console.log('❌ Direct notification function not available');
          }
        }
      }, 2000);
      
    } else {
      console.log('❌ WebSocket test failed:', wsResponse.status);
    }
    
    // Test 2: Test trade completion endpoint
    console.log('\n🔧 STEP 3: Testing trade completion endpoint...');
    
    const completionResponse = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        tradeId: 'test-dedup-' + Date.now(),
        userId: user.id,
        won: true,
        amount: 1,
        payout: 1.1
      })
    });
    
    if (completionResponse.ok) {
      const result = await completionResponse.json();
      console.log('✅ Trade completion successful:', result);
      console.log('👀 Watch for notification to appear...');
    } else {
      console.log('❌ Trade completion failed:', completionResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error);
  }
}

// Run the test
testDeduplicationFix();

console.log('\n💡 WHAT TO LOOK FOR:');
console.log('1. ✅ WebSocket message received (should NOT be skipped)');
console.log('2. 🚨 TRADE COMPLETION MESSAGE RECEIVED! (should appear)');
console.log('3. 🔔 TRIGGER: Starting notification trigger (should appear)');
console.log('4. 📱 Visual notification on screen (should appear)');
console.log('\nIf you see "Message already processed, skipping" - the fix needs more work');
console.log('If you see the notification appear - the fix is working! 🎉');
