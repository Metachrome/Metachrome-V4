// Test Mobile Positioning Fix
console.log('📱 TESTING MOBILE POSITIONING FIX');
console.log('================================');

// Test the notification positioning on mobile
async function testMobilePositioning() {
  try {
    console.log('📱 Current screen width:', window.innerWidth);
    console.log('📱 Is mobile?', window.innerWidth < 768);
    
    // Get user data
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('👤 User ID:', user.id);
    
    // Test with manual trade completion
    console.log('📡 Sending test notification...');
    
    const response = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        tradeId: 'mobile-position-test-' + Date.now(),
        userId: user.id,
        won: true,
        amount: 50,
        payout: 55
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test notification sent:', result);
      
      // Check positioning after notification appears
      setTimeout(() => {
        console.log('🔍 Checking notification positioning...');
        
        const notification = document.querySelector('.trade-notification');
        if (notification) {
          const rect = notification.getBoundingClientRect();
          const styles = window.getComputedStyle(notification);
          
          console.log('📏 Notification found!');
          console.log('📍 Position:', {
            top: styles.top,
            left: styles.left,
            right: styles.right,
            transform: styles.transform,
            width: styles.width,
            maxWidth: styles.maxWidth
          });
          console.log('📐 Bounding rect:', {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            centerX: rect.x + rect.width / 2,
            centerY: rect.y + rect.height / 2
          });
          
          const screenCenterX = window.innerWidth / 2;
          const screenCenterY = window.innerHeight / 2;
          const notificationCenterX = rect.x + rect.width / 2;
          const notificationCenterY = rect.y + rect.height / 2;
          
          console.log('🎯 Centering check:', {
            screenCenter: `${screenCenterX}, ${screenCenterY}`,
            notificationCenter: `${notificationCenterX}, ${notificationCenterY}`,
            horizontalDiff: Math.abs(screenCenterX - notificationCenterX),
            verticalDiff: Math.abs(screenCenterY - notificationCenterY),
            isCentered: Math.abs(screenCenterX - notificationCenterX) < 50 && Math.abs(screenCenterY - notificationCenterY) < 50
          });
          
          if (window.innerWidth < 768) {
            console.log('📱 MOBILE VIEW - Expected: Centered on screen');
            if (Math.abs(screenCenterX - notificationCenterX) < 50 && Math.abs(screenCenterY - notificationCenterY) < 50) {
              console.log('✅ SUCCESS: Notification is properly centered on mobile!');
            } else {
              console.log('❌ ISSUE: Notification is not centered on mobile');
            }
          } else {
            console.log('🖥️ DESKTOP VIEW - Expected: Top-right corner');
            if (rect.x > window.innerWidth - 300 && rect.y < 100) {
              console.log('✅ SUCCESS: Notification is in top-right corner on desktop!');
            } else {
              console.log('❌ ISSUE: Notification is not in top-right corner on desktop');
            }
          }
          
        } else {
          console.log('❌ No notification found on screen');
          console.log('💡 The notification might not be appearing at all');
        }
      }, 2000);
      
    } else {
      const error = await response.text();
      console.log('❌ Test failed:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error);
  }
}

// Test responsive behavior by simulating different screen sizes
function testResponsiveBehavior() {
  console.log('\n📐 TESTING RESPONSIVE BEHAVIOR:');
  
  const originalWidth = window.innerWidth;
  console.log('🔍 Original screen width:', originalWidth);
  
  // Test mobile detection logic
  const isMobile = window.innerWidth < 768;
  console.log('📱 Is mobile (< 768px)?', isMobile);
  
  if (isMobile) {
    console.log('📱 MOBILE EXPECTED BEHAVIOR:');
    console.log('  • Position: Centered on screen (50% top, 50% left)');
    console.log('  • Transform: translate(-50%, -50%)');
    console.log('  • Width: 90vw (max 350px)');
    console.log('  • Larger text and padding');
  } else {
    console.log('🖥️ DESKTOP EXPECTED BEHAVIOR:');
    console.log('  • Position: Top-right corner (16px from top and right)');
    console.log('  • Transform: none');
    console.log('  • Width: auto (min 260px, max 280px)');
    console.log('  • Compact text and padding');
  }
}

// Create a visual test notification
function createVisualTest() {
  console.log('\n🎨 Creating visual test notification...');
  
  // Remove any existing test notifications
  const existing = document.querySelectorAll('[data-visual-test="true"]');
  existing.forEach(el => el.remove());
  
  const isMobile = window.innerWidth < 768;
  
  // Create test notification
  const testNotification = document.createElement('div');
  testNotification.setAttribute('data-visual-test', 'true');
  testNotification.style.cssText = `
    position: fixed;
    z-index: 9999;
    background: linear-gradient(135deg, #1a1b3a 0%, #10b981 100%);
    color: white;
    padding: ${isMobile ? '20px' : '16px'};
    border-radius: 12px;
    border: 2px solid #10b981;
    font-family: Arial, sans-serif;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    transition: all 0.3s ease;
    ${isMobile ? `
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90vw;
      max-width: 350px;
      text-align: center;
    ` : `
      top: 16px;
      right: 16px;
      width: auto;
      min-width: 260px;
      max-width: 280px;
    `}
  `;
  
  testNotification.innerHTML = `
    <div style="font-size: ${isMobile ? '18px' : '16px'}; font-weight: bold; margin-bottom: 12px;">
      🧪 Visual Test Notification
    </div>
    <div style="font-size: ${isMobile ? '14px' : '12px'}; margin-bottom: 12px;">
      Screen: ${window.innerWidth}x${window.innerHeight}<br>
      Mode: ${isMobile ? 'Mobile' : 'Desktop'}<br>
      Position: ${isMobile ? 'Centered' : 'Top-Right'}
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: #059669;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: ${isMobile ? '14px' : '12px'};
      width: 100%;
    ">
      Close Test
    </button>
  `;
  
  document.body.appendChild(testNotification);
  
  console.log('✅ Visual test notification created');
  console.log('📍 Position:', isMobile ? 'Centered' : 'Top-right');
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (testNotification.parentElement) {
      testNotification.remove();
      console.log('🗑️ Visual test notification auto-removed');
    }
  }, 10000);
}

// Run tests
console.log('🚀 Running mobile positioning tests...');

testResponsiveBehavior();
createVisualTest();

setTimeout(() => {
  testMobilePositioning();
}, 1000);

// Make functions available globally
window.testMobilePositioning = testMobilePositioning;
window.createVisualTest = createVisualTest;

console.log('\n📋 AVAILABLE FUNCTIONS:');
console.log('• testMobilePositioning() - Test real notification positioning');
console.log('• createVisualTest() - Create visual test notification');
console.log('\n💡 WHAT TO CHECK:');
console.log('1. Visual test notification should appear in correct position');
console.log('2. Real notification should appear centered on mobile');
console.log('3. Check console logs for positioning details');
