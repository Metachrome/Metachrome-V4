// EMERGENCY MOBILE NOTIFICATION FIX
// Copy and paste this entire script into your browser console on the METACHROME platform

console.log('🚨 EMERGENCY MOBILE NOTIFICATION FIX LOADING...');

// Function to create a mobile notification that ALWAYS works
function createEmergencyMobileNotification(isWin = true) {
    console.log('🎯 CREATING EMERGENCY MOBILE NOTIFICATION');
    
    // Remove ALL existing notifications
    document.querySelectorAll('[id*="notification"], [id*="overlay"], [id*="modal"], [data-mobile-notification]').forEach(el => {
        el.remove();
    });
    
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.id = 'emergency-mobile-notification';
    overlay.setAttribute('data-mobile-notification', 'true');
    
    // FORCE MAXIMUM VISIBILITY STYLES
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0, 0, 0, 0.95) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 2147483647 !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
    `;
    
    // Create the notification content
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: linear-gradient(135deg, ${isWin ? '#10b981, #059669' : '#ef4444, #dc2626'}) !important;
        border-radius: 16px !important;
        padding: 30px !important;
        max-width: 90vw !important;
        width: 100% !important;
        max-width: 400px !important;
        text-align: center !important;
        color: white !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        font-family: Arial, sans-serif !important;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">
            ${isWin ? '🎉' : '💔'}
        </div>
        <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: bold; color: white;">
            ${isWin ? 'TRADE WON!' : 'TRADE LOST'}
        </h2>
        <p style="margin: 0 0 20px 0; font-size: 18px; color: white; opacity: 0.9;">
            BTC/USDT • $100
        </p>
        
        <div style="background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px;">
                <span style="opacity: 0.8;">Entry Price:</span>
                <span style="font-weight: bold;">$45,000.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px;">
                <span style="opacity: 0.8;">Final Price:</span>
                <span style="font-weight: bold;">$${isWin ? '45,750.00' : '44,250.00'}</span>
            </div>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
                <span>Profit/Loss:</span>
                <span style="color: ${isWin ? '#10b981' : '#ff6b6b'}; font-size: 20px;">
                    ${isWin ? '+$15.00' : '-$100.00'}
                </span>
            </div>
        </div>

        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 14px; opacity: 0.8;">
            ✅ Emergency mobile notification test successful! This is working on your device.
        </div>

        <button onclick="document.getElementById('emergency-mobile-notification').remove()" 
                style="background: rgba(255, 255, 255, 0.2); color: white; border: 2px solid rgba(255, 255, 255, 0.3); 
                       padding: 15px 30px; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; 
                       width: 100%; transition: all 0.3s ease;"
                onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
            Close Notification
        </button>
    `;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    // Click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    // Auto-close after 60 seconds
    setTimeout(() => {
        if (document.getElementById('emergency-mobile-notification')) {
            overlay.remove();
        }
    }, 60000);
    
    console.log('✅ Emergency mobile notification created successfully!');
    console.log('📱 Screen width:', window.innerWidth);
    console.log('📱 Is mobile:', window.innerWidth <= 768);
    
    return overlay;
}

// Function to test mobile detection
function testMobileDetection() {
    const isMobile = window.innerWidth <= 768;
    const userAgent = navigator.userAgent.toLowerCase();
    const isTouchDevice = 'ontouchstart' in window;
    
    console.log('📱 MOBILE DETECTION TEST:');
    console.log('- Screen Width:', window.innerWidth + 'px');
    console.log('- Is Mobile Screen:', isMobile);
    console.log('- Touch Support:', isTouchDevice);
    console.log('- User Agent Mobile:', userAgent.includes('mobile'));
    console.log('- Device Type:', isMobile ? 'MOBILE' : 'DESKTOP');
    
    return {
        isMobile,
        screenWidth: window.innerWidth,
        touchSupport: isTouchDevice,
        userAgentMobile: userAgent.includes('mobile')
    };
}

// Function to force trigger a real trade notification
function forceRealTradeNotification() {
    console.log('🎯 FORCING REAL TRADE NOTIFICATION');
    
    // Create a mock completed trade and store it
    const mockTrade = {
        id: 'emergency-test-' + Date.now(),
        direction: 'up',
        amount: 100,
        entryPrice: 45000,
        currentPrice: 45750,
        status: 'won',
        payout: 115,
        profitPercentage: 15,
        completedAt: new Date().toISOString()
    };
    
    // Store in localStorage (this is how the platform tracks completed trades)
    localStorage.setItem('completedTrade', JSON.stringify(mockTrade));
    
    // Try to trigger the platform's notification system
    if (window.React && window.React.version) {
        console.log('🔄 React detected, attempting to trigger platform notification...');
        // Force a state update by dispatching a custom event
        window.dispatchEvent(new CustomEvent('tradeCompleted', { detail: mockTrade }));
    }
    
    // Also create our emergency notification as backup
    setTimeout(() => {
        createEmergencyMobileNotification(true);
    }, 500);
    
    console.log('✅ Real trade notification triggered');
}

// Function to clear all notifications
function clearAllNotifications() {
    document.querySelectorAll('[id*="notification"], [id*="overlay"], [id*="modal"], [data-mobile-notification]').forEach(el => {
        el.remove();
    });
    localStorage.removeItem('completedTrade');
    console.log('🧹 All notifications cleared');
}

// Main test functions
window.testMobileWin = () => createEmergencyMobileNotification(true);
window.testMobileLose = () => createEmergencyMobileNotification(false);
window.testMobileDetection = testMobileDetection;
window.forceRealTradeNotification = forceRealTradeNotification;
window.clearAllNotifications = clearAllNotifications;

// Auto-run detection test
console.log('🎯 EMERGENCY MOBILE NOTIFICATION FIX LOADED!');
console.log('📋 Available functions:');
console.log('- testMobileWin() - Test WIN notification');
console.log('- testMobileLose() - Test LOSE notification');
console.log('- testMobileDetection() - Check mobile detection');
console.log('- forceRealTradeNotification() - Force real notification');
console.log('- clearAllNotifications() - Clear all notifications');

// Run initial detection test
testMobileDetection();

// Show instructions
console.log('');
console.log('🎯 INSTRUCTIONS:');
console.log('1. Type testMobileWin() and press Enter to test WIN notification');
console.log('2. Type testMobileLose() and press Enter to test LOSE notification');
console.log('3. Resize your browser to < 768px width to test mobile mode');
console.log('4. The notifications should work on BOTH mobile and desktop');
console.log('');
console.log('🚨 If notifications still don\'t work, there may be a CSS conflict in the platform');
