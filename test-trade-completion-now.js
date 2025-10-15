// Test Trade Completion Flow - Run in Browser Console
console.log('🧪 TESTING TRADE COMPLETION FLOW');
console.log('================================');

async function testTradeCompletionFlow() {
  try {
    // Get user data
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.log('❌ No user data found - please log in first');
      return;
    }
    
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('👤 User ID:', user.id);
    console.log('🔑 Auth token exists:', !!authToken);
    
    // Step 1: Test WebSocket notification endpoint
    console.log('\n📡 STEP 1: Testing WebSocket notification...');
    
    const wsTestResponse = await fetch('/api/test/websocket-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId: user.id })
    });
    
    if (wsTestResponse.ok) {
      const wsResult = await wsTestResponse.json();
      console.log('✅ WebSocket test result:', wsResult);
      console.log('📊 Clients reached:', wsResult.clientCount);
      
      if (wsResult.clientCount === 0) {
        console.log('⚠️ No WebSocket clients connected - this might be the issue');
      }
    } else {
      console.log('❌ WebSocket test failed:', wsTestResponse.status);
      return;
    }
    
    // Step 2: Create a trade
    console.log('\n💰 STEP 2: Creating test trade...');
    
    const tradeData = {
      userId: user.id,
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 1,
      duration: 30
    };
    
    const tradeResponse = await fetch('/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(tradeData)
    });
    
    if (!tradeResponse.ok) {
      const error = await tradeResponse.text();
      console.log('❌ Trade creation failed:', tradeResponse.status, error);
      return;
    }
    
    const tradeResult = await tradeResponse.json();
    console.log('✅ Trade created successfully:', tradeResult);
    console.log('🆔 Trade ID:', tradeResult.id);
    
    // Step 3: Immediately complete the trade manually
    console.log('\n🔧 STEP 3: Manually completing trade...');
    
    const completionData = {
      tradeId: tradeResult.id,
      userId: user.id,
      won: true,
      amount: 1,
      payout: 1.1
    };
    
    console.log('📋 Completion data:', completionData);
    
    const completionResponse = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(completionData)
    });
    
    if (completionResponse.ok) {
      const completionResult = await completionResponse.json();
      console.log('✅ Trade completion response:', completionResult);
      
      console.log('\n🎯 WHAT TO LOOK FOR NOW:');
      console.log('1. 📨 WebSocket Message logs in console');
      console.log('2. 🚨 TRADE COMPLETION MESSAGE RECEIVED!');
      console.log('3. 🔔 TRIGGER: Starting notification trigger');
      console.log('4. Visual notification on screen');
      
      // Wait a moment and check if notification appeared
      setTimeout(() => {
        console.log('\n📊 RESULTS CHECK:');
        const notifications = document.querySelectorAll('[data-mobile-notification="true"]');
        console.log('Notifications found on page:', notifications.length);
        
        if (notifications.length > 0) {
          console.log('✅ Notification elements found!');
        } else {
          console.log('❌ No notification elements found');
          console.log('💡 Try running: window.testMobileNotificationNow()');
        }
      }, 2000);
      
      return true;
    } else {
      const error = await completionResponse.text();
      console.log('❌ Trade completion failed:', completionResponse.status, error);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Test error:', error);
    return false;
  }
}

// Also test the direct notification function
function testDirectNotification() {
  console.log('\n🧪 TESTING DIRECT NOTIFICATION...');
  
  if (typeof window.testMobileNotificationNow === 'function') {
    console.log('✅ testMobileNotificationNow function found');
    window.testMobileNotificationNow();
    return true;
  } else if (typeof window.simulateRealTradeCompletion === 'function') {
    console.log('✅ simulateRealTradeCompletion function found');
    window.simulateRealTradeCompletion();
    return true;
  } else {
    console.log('❌ No test notification functions found');
    return false;
  }
}

// Make functions available globally
window.testTradeCompletionFlow = testTradeCompletionFlow;
window.testDirectNotification = testDirectNotification;

// Run both tests
console.log('🚀 Running trade completion test...');
testTradeCompletionFlow();

console.log('\n🚀 Running direct notification test...');
testDirectNotification();
