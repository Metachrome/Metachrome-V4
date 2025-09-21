// Force Mobile Notification Test
// Run this in the browser console on the options page

console.log('🎯 FORCE MOBILE NOTIFICATION: Starting test...');

// Function to force trigger notification
function forceMobileNotification() {
    console.log('📱 FORCING MOBILE NOTIFICATION');
    
    // Create test trade data
    const testTrade = {
        id: 'force-mobile-' + Date.now(),
        direction: 'up',
        amount: 100,
        entryPrice: 65000,
        currentPrice: 66500,
        status: 'won',
        payout: 115,
        profitPercentage: 15,
        completedAt: new Date().toISOString()
    };
    
    console.log('📱 Test trade data:', testTrade);
    
    // Store in localStorage
    localStorage.setItem('completedTrade', JSON.stringify(testTrade));
    console.log('📱 Stored in localStorage');
    
    // Try to trigger React state update if possible
    if (window.React && window.React.version) {
        console.log('📱 React detected, trying to trigger state update');
        
        // Dispatch a custom event
        const event = new CustomEvent('forceTradeNotification', {
            detail: testTrade
        });
        window.dispatchEvent(event);
        console.log('📱 Custom event dispatched');
    }
    
    // Force page refresh as last resort
    setTimeout(() => {
        console.log('📱 Forcing page refresh to trigger notification...');
        window.location.reload();
    }, 2000);
}

// Function to check notification status
function checkNotificationStatus() {
    console.log('🔍 NOTIFICATION STATUS CHECK:');
    console.log('- Window size:', window.innerWidth + 'x' + window.innerHeight);
    console.log('- Is mobile size:', window.innerWidth <= 768);
    console.log('- User agent:', navigator.userAgent.substring(0, 50) + '...');
    console.log('- localStorage completedTrade:', localStorage.getItem('completedTrade'));
    console.log('- Notification elements:', document.querySelectorAll('[data-mobile-notification]').length);
    console.log('- Fixed elements:', document.querySelectorAll('[style*="position: fixed"]').length);
    console.log('- Body children count:', document.body.children.length);
    
    // Check if debug function exists
    if (window.debugMobileNotification) {
        console.log('- Debug function available, calling...');
        window.debugMobileNotification();
    } else {
        console.log('- Debug function not available');
    }
    
    // Check if current trade notification exists
    if (window.currentTradeNotification) {
        console.log('- Current trade notification:', window.currentTradeNotification);
    } else {
        console.log('- No current trade notification');
    }
}

// Function to clear all notifications
function clearNotifications() {
    console.log('🧹 CLEARING ALL NOTIFICATIONS');
    localStorage.removeItem('completedTrade');
    
    // Remove any existing notification elements
    const notifications = document.querySelectorAll('[data-mobile-notification]');
    notifications.forEach(el => el.remove());
    
    console.log('🧹 Cleared', notifications.length, 'notification elements');
}

// Add functions to window for easy access
window.forceMobileNotification = forceMobileNotification;
window.checkNotificationStatus = checkNotificationStatus;
window.clearNotifications = clearNotifications;

console.log('✅ Mobile notification test functions loaded!');
console.log('📱 Available functions:');
console.log('  - forceMobileNotification() - Force trigger a test notification');
console.log('  - checkNotificationStatus() - Check current notification status');
console.log('  - clearNotifications() - Clear all notifications');
console.log('');
console.log('🎯 To test: Run forceMobileNotification() in console');

// Auto-run status check
checkNotificationStatus();
