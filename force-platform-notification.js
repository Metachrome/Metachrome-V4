// FORCE PLATFORM NOTIFICATION TEST
// This script forces the METACHROME platform's real notification system to work

console.log('🚨 FORCING PLATFORM NOTIFICATION SYSTEM...');

// Function to force trigger the platform's real TradeNotification component
function forcePlatformNotification(isWin = true) {
    console.log('🎯 FORCING PLATFORM NOTIFICATION:', isWin ? 'WIN' : 'LOSE');
    
    // Clear any existing notifications first
    document.querySelectorAll('[id*="notification"], [id*="overlay"], [id*="modal"]').forEach(el => {
        el.remove();
    });
    
    // Create a realistic completed trade
    const completedTrade = {
        id: `platform-test-${Date.now()}`,
        direction: isWin ? 'up' : 'down',
        amount: 100,
        entryPrice: 65000,
        currentPrice: isWin ? 66500 : 63500,
        status: isWin ? 'won' : 'lost',
        payout: isWin ? 115 : 0,
        profitPercentage: 15,
        completedAt: new Date().toISOString(),
        symbol: 'BTC/USDT',
        duration: '60'
    };
    
    console.log('📱 Created trade data:', completedTrade);
    
    // Method 1: Store in localStorage (this is how the platform detects completed trades)
    localStorage.setItem('completedTrade', JSON.stringify(completedTrade));
    console.log('✅ Stored in localStorage');
    
    // Method 2: Try to find and trigger React state update
    try {
        // Look for React components in the DOM
        const reactElements = document.querySelectorAll('[data-reactroot], [id="root"], [id="app"]');
        console.log('🔍 Found React elements:', reactElements.length);
        
        // Dispatch custom events that the platform might listen for
        const events = ['tradeCompleted', 'forceTradeNotification', 'completedTradeUpdate'];
        events.forEach(eventName => {
            const event = new CustomEvent(eventName, {
                detail: completedTrade,
                bubbles: true
            });
            window.dispatchEvent(event);
            document.dispatchEvent(event);
            console.log(`📡 Dispatched ${eventName} event`);
        });
        
    } catch (error) {
        console.log('⚠️ Error dispatching events:', error);
    }
    
    // Method 3: Force page refresh to trigger localStorage detection
    setTimeout(() => {
        console.log('🔄 Forcing page refresh to trigger notification...');
        window.location.reload();
    }, 2000);
    
    console.log('✅ Platform notification trigger complete');
    console.log('📱 If notification doesn\'t appear, check:');
    console.log('1. Is the TradeNotification component mounted?');
    console.log('2. Is the OptionsPage checking localStorage for completedTrade?');
    console.log('3. Are there any console errors preventing the component from rendering?');
}

// Function to check if the platform's notification system is working
function checkPlatformNotificationSystem() {
    console.log('🔍 CHECKING PLATFORM NOTIFICATION SYSTEM...');
    
    // Check if TradeNotification component is in the DOM
    const tradeNotificationElements = document.querySelectorAll('[data-testid*="trade"], [class*="trade"], [id*="trade"]');
    console.log('📱 Trade-related elements found:', tradeNotificationElements.length);
    
    // Check localStorage for existing completed trades
    const existingTrade = localStorage.getItem('completedTrade');
    console.log('💾 Existing completed trade in localStorage:', existingTrade);
    
    // Check if debug functions are available
    const debugFunctions = [
        'debugTradeNotification',
        'debugMobileNotification',
        'currentTradeNotification'
    ];
    
    debugFunctions.forEach(funcName => {
        if (window[funcName]) {
            console.log(`✅ ${funcName} is available`);
        } else {
            console.log(`❌ ${funcName} is NOT available`);
        }
    });
    
    // Check current page
    const currentPath = window.location.pathname;
    console.log('📍 Current page:', currentPath);
    
    if (!currentPath.includes('options') && !currentPath.includes('trade')) {
        console.log('⚠️ WARNING: You might need to be on the Options/Trade page for notifications to work');
    }
    
    // Check for React
    if (window.React) {
        console.log('✅ React is available, version:', window.React.version);
    } else {
        console.log('❌ React is not available in window');
    }
    
    return {
        tradeElements: tradeNotificationElements.length,
        hasExistingTrade: !!existingTrade,
        currentPage: currentPath,
        hasReact: !!window.React
    };
}

// Function to manually create the platform-style notification
function createPlatformStyleNotification(isWin = true) {
    console.log('🎨 CREATING PLATFORM-STYLE NOTIFICATION');
    
    // Remove existing notifications
    document.querySelectorAll('[id*="notification"], [id*="overlay"]').forEach(el => el.remove());
    
    const tradeData = {
        amount: 100,
        direction: isWin ? 'up' : 'down',
        entryPrice: 65000,
        finalPrice: isWin ? 66500 : 63500,
        status: isWin ? 'won' : 'lost',
        payout: isWin ? 115 : 0,
        profitPercentage: 15
    };
    
    const pnl = isWin ? (tradeData.payout - tradeData.amount) : -tradeData.amount;
    
    // Create overlay with exact platform styling
    const overlay = document.createElement('div');
    overlay.id = 'platform-trade-notification';
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        background-color: rgba(0, 0, 0, 0.95) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        font-family: Arial, sans-serif !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        box-sizing: border-box !important;
    `;
    
    overlay.innerHTML = `
        <div style="
            background-color: #1f2937 !important;
            border-radius: 16px !important;
            padding: 24px !important;
            width: 100% !important;
            max-width: 400px !important;
            border: 3px solid ${isWin ? '#10b981' : '#ef4444'} !important;
            box-shadow: 0 0 30px ${isWin ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'} !important;
            color: white !important;
            text-align: center !important;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="font-size: 18px; font-weight: bold; margin: 0; color: white;">BTC/USDT</h2>
                <button onclick="document.getElementById('platform-trade-notification').remove()" style="
                    background: none;
                    border: none;
                    color: #9ca3af;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                    width: 32px;
                    height: 32px;
                ">✕</button>
            </div>

            <div style="margin-bottom: 24px;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 12px; color: ${isWin ? '#10b981' : '#ef4444'};">
                    ${isWin ? '🎉 TRADE WON!' : '💔 TRADE LOST'}
                </div>
                <div style="font-size: 36px; font-weight: bold; margin-bottom: 12px; color: ${isWin ? '#10b981' : '#ef4444'};">
                    ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} <span style="color: #9ca3af; font-size: 18px;">USDT</span>
                </div>
                <div style="color: #9ca3af; font-size: 14px;">Settlement completed</div>
            </div>

            <div style="margin-bottom: 24px; text-align: left;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                    <span style="color: #9ca3af;">Amount:</span>
                    <span style="color: white; font-weight: 500;">${tradeData.amount} USDT</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                    <span style="color: #9ca3af;">Side:</span>
                    <span style="color: ${tradeData.direction === 'up' ? '#10b981' : '#ef4444'}; font-weight: 500;">
                        ${tradeData.direction === 'up' ? 'Buy Up' : 'Sell Down'}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
                    <span style="color: #9ca3af;">Entry Price:</span>
                    <span style="color: white; font-weight: 500;">$${tradeData.entryPrice.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <span style="color: #9ca3af;">Final Price:</span>
                    <span style="color: white; font-weight: 500;">$${tradeData.finalPrice.toLocaleString()}</span>
                </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; margin-bottom: 20px; font-size: 14px; opacity: 0.8;">
                ✅ Platform-style notification test successful! This matches the real METACHROME design.
            </div>

            <button onclick="document.getElementById('platform-trade-notification').remove()" style="
                background-color: ${isWin ? '#10b981' : '#ef4444'};
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                width: 100%;
            ">Close</button>
        </div>
    `;
    
    // Add click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    document.body.appendChild(overlay);
    console.log('✅ Platform-style notification created');
    
    // Auto-close after 45 seconds
    setTimeout(() => {
        if (document.getElementById('platform-trade-notification')) {
            overlay.remove();
        }
    }, 45000);
}

// Make functions available globally
window.forcePlatformNotification = forcePlatformNotification;
window.checkPlatformNotificationSystem = checkPlatformNotificationSystem;
window.createPlatformStyleNotification = createPlatformStyleNotification;
window.forcePlatformWin = () => forcePlatformNotification(true);
window.forcePlatformLose = () => forcePlatformNotification(false);
window.testPlatformWin = () => createPlatformStyleNotification(true);
window.testPlatformLose = () => createPlatformStyleNotification(false);

// Run initial check
console.log('🎯 PLATFORM NOTIFICATION SYSTEM LOADED!');
console.log('📋 Available functions:');
console.log('- checkPlatformNotificationSystem() - Check if platform system is working');
console.log('- forcePlatformWin() - Force WIN notification via platform system');
console.log('- forcePlatformLose() - Force LOSE notification via platform system');
console.log('- testPlatformWin() - Test WIN notification (direct creation)');
console.log('- testPlatformLose() - Test LOSE notification (direct creation)');

// Auto-run system check
checkPlatformNotificationSystem();

console.log('');
console.log('🎯 NEXT STEPS:');
console.log('1. Run checkPlatformNotificationSystem() to see current status');
console.log('2. Try testPlatformWin() to see if notifications can appear at all');
console.log('3. Try forcePlatformWin() to test the real platform system');
console.log('4. Make sure you are on the Options/Trade page');
