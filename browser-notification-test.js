// Browser-Based Notification Test - Independent of Build System
console.log('🧪 BROWSER-BASED NOTIFICATION TEST');
console.log('=================================');

// Create a completely independent notification system
function createIndependentNotification() {
  console.log('🛠️ Creating independent notification...');
  
  // Remove any existing notifications
  const existing = document.querySelectorAll('[data-test-notification="true"]');
  existing.forEach(el => el.remove());
  
  // Create notification container
  const notification = document.createElement('div');
  notification.setAttribute('data-test-notification', 'true');
  notification.id = 'independent-notification-' + Date.now();
  
  // Apply maximum priority styles
  const styles = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '2147483647',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: 'Arial, sans-serif',
    pointerEvents: 'auto'
  };
  
  Object.keys(styles).forEach(key => {
    notification.style.setProperty(key, styles[key], 'important');
  });
  
  // Create notification content
  notification.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #1a1b3a 0%, #2d1b69 100%) !important;
      border-radius: 20px !important;
      padding: 30px !important;
      max-width: 380px !important;
      width: 90% !important;
      border: 3px solid #10b981 !important;
      color: white !important;
      text-align: center !important;
      box-shadow: 0 25px 50px rgba(0,0,0,0.9) !important;
      animation: slideIn 0.5s ease-out !important;
    ">
      <div style="font-size: 28px !important; font-weight: bold !important; color: #10b981 !important; margin-bottom: 20px !important;">
        🎉 Trade Won!
      </div>
      <div style="margin-bottom: 20px !important; font-size: 18px !important;">
        <strong>BTC/USDT</strong><br>
        Direction: UP ⬆️<br>
        Amount: $100<br>
        Profit: $10 (10%)
      </div>
      <div style="margin-bottom: 20px !important; font-size: 14px !important; color: #9ca3af !important;">
        This is an independent notification test<br>
        Screen: ${window.innerWidth}x${window.innerHeight}<br>
        Time: ${new Date().toLocaleTimeString()}
      </div>
      <button id="close-independent-btn" style="
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 15px 30px !important;
        font-size: 16px !important;
        cursor: pointer !important;
        width: 100% !important;
        font-weight: bold !important;
        transition: all 0.3s ease !important;
      ">
        Close Notification
      </button>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add close functionality
  const closeBtn = notification.querySelector('#close-independent-btn');
  closeBtn.addEventListener('click', () => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      notification.remove();
      style.remove();
      console.log('✅ Independent notification closed');
    }, 300);
  });
  
  // Close on background click
  notification.addEventListener('click', (e) => {
    if (e.target === notification) {
      notification.remove();
      style.remove();
      console.log('✅ Independent notification closed by background click');
    }
  });
  
  // Add to DOM
  document.body.appendChild(notification);
  
  console.log('✅ Independent notification created and added to DOM');
  console.log('📏 Notification dimensions:', notification.getBoundingClientRect());
  console.log('🔍 In DOM?', document.body.contains(notification));
  console.log('🔍 Visible?', notification.offsetWidth > 0 && notification.offsetHeight > 0);
  
  return notification;
}

// Test WebSocket with independent notification
async function testWebSocketWithIndependentNotification() {
  try {
    console.log('📡 Testing WebSocket with independent notification...');
    
    // Get user data
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('👤 User ID:', user.id);
    
    // Send WebSocket test
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
      console.log('📊 Clients reached:', result.clientCount);
      
      if (result.clientCount > 0) {
        console.log('✅ WebSocket is working - clients are connected');
        
        // Show independent notification to simulate what should happen
        setTimeout(() => {
          console.log('🎭 Simulating notification that should have appeared...');
          createIndependentNotification();
        }, 1000);
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

// Check what notification functions are available
function checkAvailableFunctions() {
  console.log('🔍 Checking available notification functions...');
  
  const functions = {
    testMobileNotificationNow: typeof window.testMobileNotificationNow,
    simulateRealTradeCompletion: typeof window.simulateRealTradeCompletion,
    testBulletproofMobileNotification: typeof window.testBulletproofMobileNotification,
    showMobileTradeNotification: typeof window.showMobileTradeNotification
  };
  
  console.log('Available functions:', functions);
  
  // Try to call any available function
  if (typeof window.testBulletproofMobileNotification === 'function') {
    console.log('🧪 Calling testBulletproofMobileNotification...');
    try {
      window.testBulletproofMobileNotification();
    } catch (error) {
      console.log('❌ Error calling testBulletproofMobileNotification:', error);
    }
  } else if (typeof window.testMobileNotificationNow === 'function') {
    console.log('🧪 Calling testMobileNotificationNow...');
    try {
      window.testMobileNotificationNow();
    } catch (error) {
      console.log('❌ Error calling testMobileNotificationNow:', error);
    }
  } else {
    console.log('❌ No notification functions available');
    console.log('💡 This explains why notifications aren\'t working');
  }
}

// Run all tests
console.log('🚀 Running independent notification test...');
createIndependentNotification();

console.log('\n🚀 Checking available functions...');
checkAvailableFunctions();

console.log('\n🚀 Testing WebSocket...');
testWebSocketWithIndependentNotification();

// Make function available for manual testing
window.createIndependentNotification = createIndependentNotification;

console.log('\n📋 RESULTS:');
console.log('1. Independent notification should appear immediately');
console.log('2. Check what functions are available');
console.log('3. WebSocket test will show if server communication works');
console.log('\n💡 If independent notification works but others don\'t:');
console.log('   - The notification display system works');
console.log('   - The issue is in the React component integration');
console.log('\n💡 If no functions are available:');
console.log('   - The updated code hasn\'t been compiled/loaded');
console.log('   - Need to refresh page or restart dev server');
