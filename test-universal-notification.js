// Test Universal Notification System
console.log('🎯 TESTING UNIVERSAL NOTIFICATION SYSTEM');
console.log('=======================================');

// Test the universal notification by triggering a manual trade completion
async function testUniversalNotification() {
  try {
    console.log('🧪 Testing universal notification system...');
    
    // Get user data
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('👤 User ID:', user.id);
    
    // Test with manual trade completion
    console.log('📡 Sending manual trade completion...');
    
    const response = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        tradeId: 'universal-test-' + Date.now(),
        userId: user.id,
        won: true,
        amount: 100,
        payout: 110
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Manual trade completion sent:', result);
      console.log('👀 Watch for universal notification to appear!');
      console.log('📱 Should work on both mobile and desktop');
      
      // Check after 3 seconds
      setTimeout(() => {
        console.log('🔍 Checking if notification appeared...');
        console.log('💡 The notification should be visible on screen now');
        console.log('💡 It should be responsive - centered on mobile, top-right on desktop');
      }, 3000);
      
    } else {
      const error = await response.text();
      console.log('❌ Manual completion failed:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error);
  }
}

// Test WebSocket notification
async function testWebSocketNotification() {
  try {
    console.log('\n📡 Testing WebSocket notification...');
    
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    const response = await fetch('/api/test/websocket-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId: user.id })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ WebSocket test sent:', result);
      console.log('📊 Clients connected:', result.clientCount);
      
      if (result.clientCount > 0) {
        console.log('✅ WebSocket is working!');
        console.log('👀 Watch for notification to appear via WebSocket');
      } else {
        console.log('⚠️ No WebSocket clients connected');
      }
    } else {
      console.log('❌ WebSocket test failed:', response.status);
    }
    
  } catch (error) {
    console.log('❌ WebSocket test error:', error);
  }
}

// Check screen size and responsive behavior
function checkResponsiveBehavior() {
  console.log('\n📱 CHECKING RESPONSIVE BEHAVIOR:');
  console.log('Screen width:', window.innerWidth);
  console.log('Screen height:', window.innerHeight);
  
  if (window.innerWidth < 768) {
    console.log('📱 Mobile view detected');
    console.log('💡 Notification should appear centered on screen');
  } else {
    console.log('🖥️ Desktop view detected');
    console.log('💡 Notification should appear in top-right corner');
  }
  
  console.log('\n🎨 EXPECTED BEHAVIOR:');
  console.log('• Mobile (< 768px): Centered, larger text, more padding');
  console.log('• Desktop (≥ 768px): Top-right corner, compact size');
  console.log('• Both: Same styling, same functionality, automatic close after 25s');
}

// Run all tests
console.log('🚀 Running universal notification tests...');

checkResponsiveBehavior();
testUniversalNotification();

setTimeout(() => {
  testWebSocketNotification();
}, 2000);

console.log('\n📋 WHAT TO EXPECT:');
console.log('1. ✅ Universal notification should appear for manual completion');
console.log('2. ✅ Notification should be responsive (mobile vs desktop positioning)');
console.log('3. ✅ WebSocket notification should also work');
console.log('4. ✅ Same notification system for all devices');
console.log('\n💡 BENEFITS OF UNIVERSAL SYSTEM:');
console.log('• No complex mobile detection logic');
console.log('• Single codebase for all devices');
console.log('• Consistent behavior and styling');
console.log('• Easier to maintain and debug');
console.log('• Uses proven desktop notification that already works');

// Make test function available globally
window.testUniversalNotification = testUniversalNotification;
