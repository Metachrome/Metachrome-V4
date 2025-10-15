// Final Notification Test - Run in Browser Console
console.log('🎯 FINAL NOTIFICATION TEST');
console.log('=========================');

async function finalNotificationTest() {
  try {
    console.log('🧪 STEP 1: Testing direct bulletproof function...');
    
    // Test the bulletproof function directly
    if (typeof window.testBulletproofMobileNotification === 'function') {
      console.log('✅ testBulletproofMobileNotification found');
      window.testBulletproofMobileNotification();
      
      // Wait and check if notification appeared
      setTimeout(() => {
        const notifications = document.querySelectorAll('[data-mobile-notification="true"]');
        console.log('📱 Direct test notifications found:', notifications.length);
        
        if (notifications.length > 0) {
          console.log('✅ SUCCESS! Direct bulletproof function works!');
        } else {
          console.log('❌ Direct bulletproof function failed');
        }
      }, 1000);
    } else {
      console.log('❌ testBulletproofMobileNotification not found');
    }
    
    console.log('\n🧪 STEP 2: Testing WebSocket notification...');
    
    // Get user data
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    // Send WebSocket test
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
      
      // Wait and check for WebSocket notification
      setTimeout(() => {
        const notifications = document.querySelectorAll('[data-mobile-notification="true"]');
        console.log('📱 WebSocket test notifications found:', notifications.length);
        
        if (notifications.length > 0) {
          console.log('✅ SUCCESS! WebSocket notification works!');
        } else {
          console.log('❌ WebSocket notification failed');
          console.log('💡 Check console for "🚀 BULLETPROOF: ===== FUNCTION CALLED ====="');
        }
      }, 2000);
    } else {
      console.log('❌ WebSocket test failed:', wsResponse.status);
    }
    
    console.log('\n🧪 STEP 3: Testing trade completion...');
    
    // Test trade completion
    const completionResponse = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        tradeId: 'test-final-' + Date.now(),
        userId: user.id,
        won: true,
        amount: 1,
        payout: 1.1
      })
    });
    
    if (completionResponse.ok) {
      const result = await completionResponse.json();
      console.log('✅ Trade completion sent:', result);
      
      // Wait and check for trade completion notification
      setTimeout(() => {
        const notifications = document.querySelectorAll('[data-mobile-notification="true"]');
        console.log('📱 Trade completion notifications found:', notifications.length);
        
        if (notifications.length > 0) {
          console.log('✅ SUCCESS! Trade completion notification works!');
        } else {
          console.log('❌ Trade completion notification failed');
        }
      }, 3000);
    } else {
      console.log('❌ Trade completion failed:', completionResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error);
  }
}

// Also test manual trigger
function testManualTrigger() {
  console.log('\n🧪 STEP 4: Testing manual trigger...');
  
  if (typeof window.simulateRealTradeCompletion === 'function') {
    console.log('✅ simulateRealTradeCompletion found');
    window.simulateRealTradeCompletion();
  } else {
    console.log('❌ simulateRealTradeCompletion not found');
  }
}

// Run all tests
finalNotificationTest();
testManualTrigger();

console.log('\n📋 WHAT TO WATCH FOR:');
console.log('1. 🚀 BULLETPROOF: ===== FUNCTION CALLED ===== (shows function is being called)');
console.log('2. 📱 Notifications found: X (shows if DOM elements are created)');
console.log('3. Visual notification on screen (shows if styling works)');
console.log('4. 🚨 TRADE COMPLETION MESSAGE RECEIVED! (shows WebSocket works)');
console.log('\n💡 If you see "FUNCTION CALLED" but no visual notification, it\'s a styling issue');
console.log('💡 If you don\'t see "FUNCTION CALLED", the function isn\'t being triggered');
