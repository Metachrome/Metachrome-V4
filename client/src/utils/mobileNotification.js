// BULLETPROOF MOBILE NOTIFICATION SYSTEM
// This bypasses all React/CSS conflicts and works directly with the DOM
var currentNotification = null;
// Helper function to format symbol with slash (e.g., XLMUSDT -> XLM/USDT)
function formatSymbolForNotification(symbol) {
    if (!symbol)
        return 'BTC/USDT';
    // If symbol already has a slash, return as-is
    if (symbol.includes('/'))
        return symbol;
    // If symbol ends with USDT, insert slash before USDT
    if (symbol.endsWith('USDT')) {
        return symbol.slice(0, -4) + '/USDT';
    }
    return symbol;
}
export function showMobileTradeNotification(trade) {
    console.log('🚀 BULLETPROOF: ===== FUNCTION CALLED =====');
    console.log('🚀 BULLETPROOF: Creating mobile notification for trade:', trade);
    console.log('🚀 BULLETPROOF: Current DOM body children count:', document.body.children.length);
    console.log('🚀 BULLETPROOF: Window dimensions:', window.innerWidth, 'x', window.innerHeight);
    console.log('🚀 BULLETPROOF: Function execution starting...');
    // Remove any existing notifications
    removeMobileNotification();
    // Create the notification container
    var container = document.createElement('div');
    container.id = 'bulletproof-mobile-notification';
    container.setAttribute('data-mobile-notification', 'true');
    console.log('🚀 BULLETPROOF: Container element created:', container);
    // Calculate trade results
    var isWin = trade.status === 'won';
    var pnl = isWin ? (trade.amount * trade.profitPercentage / 100) : -trade.amount;
    // Apply bulletproof styles that override everything
    var containerStyles = {
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
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        visibility: 'visible',
        opacity: '1',
        pointerEvents: 'auto',
        transform: 'translateZ(0)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box',
        margin: '0',
        border: 'none',
        outline: 'none'
    };
    // Apply styles with maximum specificity
    Object.keys(containerStyles).forEach(function (key) {
        container.style.setProperty(key, containerStyles[key], 'important');
    });
    // Create the notification card
    var card = document.createElement('div');
    var cardStyles = {
        backgroundColor: '#1a1b3a',
        borderRadius: '16px',
        padding: '20px',
        maxWidth: '320px',
        width: '90%',
        border: "3px solid ".concat(isWin ? '#10b981' : '#ef4444'),
        color: 'white',
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px ".concat(isWin ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
        position: 'relative',
        pointerEvents: 'auto',
        animation: 'slideInUp 0.3s ease-out',
        textAlign: 'left',
        fontSize: '14px',
        lineHeight: '1.4'
    };
    Object.keys(cardStyles).forEach(function (key) {
        card.style.setProperty(key, cardStyles[key], 'important');
    });
    // Create the content
    var formattedSymbol = formatSymbolForNotification(trade.symbol);
    card.innerHTML = "\n    <div style=\"text-align: center !important; margin-bottom: 16px !important;\">\n      <div style=\"font-size: 20px !important; font-weight: bold !important; color: ".concat(isWin ? '#10b981' : '#ef4444', " !important; margin-bottom: 8px !important;\">\n        ").concat(isWin ? '🎉 Trade Won!' : '💔 Trade Lost', "\n      </div>\n      <div style=\"font-size: 12px !important; color: #9ca3af !important;\">\n        Market: ").concat(formattedSymbol, "\n      </div>\n    </div>\n\n    <div style=\"\n      background-color: #2a2d47 !important;\n      border-radius: 8px !important;\n      padding: 12px !important;\n      margin-bottom: 16px !important;\n      border: 1px solid #3a3d5a !important;\n      font-size: 12px !important;\n    \">\n      <div style=\"display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;\">\n        <span style=\"color: #9ca3af !important;\">Market :</span>\n        <span style=\"color: white !important; font-weight: bold !important;\">").concat(formattedSymbol, "</span>\n      </div>\n      <div style=\"display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;\">\n        <span style=\"color: #9ca3af !important;\">Trade :</span>\n        <span style=\"color: ").concat(trade.direction === 'up' ? '#10b981' : '#ef4444', " !important; font-weight: bold !important;\">").concat(trade.direction === 'up' ? 'BUY UP' : 'BUY DOWN', "</span>\n      </div>\n      <div style=\"display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;\">\n        <span style=\"color: #9ca3af !important;\">Amount :</span>\n        <span style=\"color: white !important; font-weight: bold !important;\">").concat(trade.amount, " USDT</span>\n      </div>\n      <div style=\"display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;\">\n        <span style=\"color: #9ca3af !important;\">Entry Price :</span>\n        <span style=\"color: white !important; font-weight: bold !important;\">").concat(trade.entryPrice ? trade.entryPrice.toLocaleString() : 'N/A', "</span>\n      </div>\n      <div style=\"display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;\">\n        <span style=\"color: #9ca3af !important;\">Closed Price :</span>\n        <span style=\"color: white !important; font-weight: bold !important;\">").concat(trade.currentPrice ? trade.currentPrice.toLocaleString() : 'N/A', "</span>\n      </div>\n      <div style=\"display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;\">\n        <span style=\"color: #9ca3af !important;\">Duration :</span>\n        <span style=\"color: white !important; font-weight: bold !important;\">").concat(trade.duration || 30, " seconds</span>\n      </div>\n      <div style=\"display: flex !important; justify-content: space-between !important;\">\n        <span style=\"color: #9ca3af !important;\">Profit :</span>\n        <span style=\"color: ").concat(isWin ? '#10b981' : '#ef4444', " !important; font-weight: bold !important;\">").concat(isWin ? '+' : '').concat(pnl.toFixed(0), "</span>\n      </div>\n    </div>\n    \n    <div style=\"text-align: center !important;\">\n      <button id=\"close-notification-btn\" style=\"\n        background-color: ").concat(isWin ? '#10b981' : '#ef4444', " !important;\n        color: white !important;\n        border: none !important;\n        border-radius: 8px !important;\n        padding: 12px 24px !important;\n        font-size: 14px !important;\n        font-weight: bold !important;\n        cursor: pointer !important;\n        width: 100% !important;\n        transition: all 0.3s ease !important;\n      \">\n        Close Notification\n      </button>\n      <div style=\"\n        font-size: 10px !important;\n        color: #6b7280 !important;\n        margin-top: 8px !important;\n        text-align: center !important;\n      \">\n        Click anywhere outside to close\n      </div>\n    </div>\n  ");
    // Add the card to the container
    container.appendChild(card);
    // Add event listeners
    var closeBtn = card.querySelector('#close-notification-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            removeMobileNotification();
            console.log('✅ BULLETPROOF: Notification closed via button');
        });
    }
    // Click outside to close
    container.addEventListener('click', function (e) {
        if (e.target === container) {
            removeMobileNotification();
            console.log('✅ BULLETPROOF: Notification closed by clicking outside');
        }
    });
    // Add to document body
    document.body.appendChild(container);
    currentNotification = container;
    console.log('✅ BULLETPROOF: Mobile notification added to DOM');
    console.log('📏 BULLETPROOF: Container dimensions:', container.getBoundingClientRect());
    console.log('📱 BULLETPROOF: Window dimensions:', window.innerWidth, 'x', window.innerHeight);
    console.log('🔍 BULLETPROOF: Container in DOM?', document.body.contains(container));
    console.log('🔍 BULLETPROOF: Container visible?', container.offsetWidth > 0 && container.offsetHeight > 0);
    console.log('🔍 BULLETPROOF: Container computed styles:', {
        display: window.getComputedStyle(container).display,
        visibility: window.getComputedStyle(container).visibility,
        opacity: window.getComputedStyle(container).opacity,
        zIndex: window.getComputedStyle(container).zIndex
    });
    // Auto-remove after 25 seconds
    setTimeout(function () {
        removeMobileNotification();
        console.log('🗑️ BULLETPROOF: Auto-removed notification after 25 seconds');
    }, 25000);
    return container;
}
export function removeMobileNotification() {
    if (currentNotification && currentNotification.parentNode) {
        currentNotification.parentNode.removeChild(currentNotification);
        console.log('🗑️ BULLETPROOF: Removed existing notification');
    }
    // Also remove any other notifications that might exist
    var existing = document.querySelectorAll('[data-mobile-notification="true"]');
    existing.forEach(function (el) {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
    currentNotification = null;
}
// Make test function available globally
if (typeof window !== 'undefined') {
    window.testMobileNotificationNow = function () {
        console.log('🧪 IMMEDIATE TEST: Creating mobile notification now...');
        var testTrade = {
            id: 'immediate-test-' + Date.now(),
            direction: 'up',
            amount: 100,
            entryPrice: 50000,
            currentPrice: 51000,
            status: 'won',
            profitPercentage: 10,
            symbol: 'BTC/USDT',
            duration: 30
        };
        showMobileTradeNotification(testTrade);
        console.log('🧪 IMMEDIATE TEST: Notification should be visible now');
    };
}
if (typeof window !== 'undefined') {
    window.testBulletproofMobileNotification = function () {
        console.log('🧪 BULLETPROOF TEST: Creating test notification...');
        var testTrade = {
            id: 'test-bulletproof',
            symbol: 'BTC/USDT',
            direction: 'up',
            amount: 100,
            entryPrice: 114420.87,
            currentPrice: 114904.29,
            status: 'won',
            profitPercentage: 10,
            duration: 30
        };
        showMobileTradeNotification(testTrade);
        console.log('🧪 BULLETPROOF TEST: Test notification should be visible now!');
    };
    console.log('🧪 BULLETPROOF: testBulletproofMobileNotification() function available');
}
