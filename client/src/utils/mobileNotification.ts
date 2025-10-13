// BULLETPROOF MOBILE NOTIFICATION SYSTEM
// This bypasses all React/CSS conflicts and works directly with the DOM

let currentNotification: HTMLElement | null = null;

interface Trade {
  id: string;
  direction: 'up' | 'down';
  amount: number;
  entryPrice?: number;
  currentPrice?: number;
  status: 'won' | 'lost';
  profitPercentage: number;
  symbol?: string;
  duration?: number;
}

export function showMobileTradeNotification(trade: Trade): HTMLElement {
  console.log('🚀 BULLETPROOF: Creating mobile notification for trade:', trade);
  
  // Remove any existing notifications
  removeMobileNotification();
  
  // Create the notification container
  const container = document.createElement('div');
  container.id = 'bulletproof-mobile-notification';
  container.setAttribute('data-mobile-notification', 'true');
  
  // Calculate trade results
  const isWin = trade.status === 'won';
  const pnl = isWin ? (trade.amount * trade.profitPercentage / 100) : -trade.amount;
  
  // Apply bulletproof styles that override everything
  const containerStyles: Record<string, string> = {
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
  Object.keys(containerStyles).forEach(key => {
    container.style.setProperty(key, containerStyles[key], 'important');
  });
  
  // Create the notification card
  const card = document.createElement('div');
  const cardStyles: Record<string, string> = {
    backgroundColor: '#1a1b3a',
    borderRadius: '16px',
    padding: '20px',
    maxWidth: '320px',
    width: '90%',
    border: `3px solid ${isWin ? '#10b981' : '#ef4444'}`,
    color: 'white',
    boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px ${isWin ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
    position: 'relative',
    pointerEvents: 'auto',
    animation: 'slideInUp 0.3s ease-out',
    textAlign: 'left',
    fontSize: '14px',
    lineHeight: '1.4'
  };
  
  Object.keys(cardStyles).forEach(key => {
    card.style.setProperty(key, cardStyles[key], 'important');
  });
  
  // Create the content
  card.innerHTML = `
    <div style="text-align: center !important; margin-bottom: 16px !important;">
      <div style="font-size: 20px !important; font-weight: bold !important; color: ${isWin ? '#10b981' : '#ef4444'} !important; margin-bottom: 8px !important;">
        ${isWin ? '🎉 Trade Won!' : '💔 Trade Lost'}
      </div>
      <div style="font-size: 12px !important; color: #9ca3af !important;">
        Market: ${trade.symbol || 'BTC/USDT'}
      </div>
    </div>
    
    <div style="
      background-color: #2a2d47 !important;
      border-radius: 8px !important;
      padding: 12px !important;
      margin-bottom: 16px !important;
      border: 1px solid #3a3d5a !important;
      font-size: 12px !important;
    ">
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Market :</span>
        <span style="color: white !important; font-weight: bold !important;">${trade.symbol || 'BTC/USDT'}</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Trade :</span>
        <span style="color: ${trade.direction === 'up' ? '#10b981' : '#ef4444'} !important; font-weight: bold !important;">${trade.direction === 'up' ? 'BUY UP' : 'BUY DOWN'}</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Amount :</span>
        <span style="color: white !important; font-weight: bold !important;">${trade.amount} USDT</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Entry Price :</span>
        <span style="color: white !important; font-weight: bold !important;">${trade.entryPrice ? trade.entryPrice.toLocaleString() : 'N/A'}</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Closed Price :</span>
        <span style="color: white !important; font-weight: bold !important;">${trade.currentPrice ? trade.currentPrice.toLocaleString() : 'N/A'}</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important; margin-bottom: 8px !important;">
        <span style="color: #9ca3af !important;">Duration :</span>
        <span style="color: white !important; font-weight: bold !important;">${trade.duration || 30} seconds</span>
      </div>
      <div style="display: flex !important; justify-content: space-between !important;">
        <span style="color: #9ca3af !important;">Profit :</span>
        <span style="color: ${isWin ? '#10b981' : '#ef4444'} !important; font-weight: bold !important;">${isWin ? '+' : ''}${pnl.toFixed(0)}</span>
      </div>
    </div>
    
    <div style="text-align: center !important;">
      <button id="close-notification-btn" style="
        background-color: ${isWin ? '#10b981' : '#ef4444'} !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-size: 14px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        width: 100% !important;
        transition: all 0.3s ease !important;
      ">
        Close Notification
      </button>
      <div style="
        font-size: 10px !important;
        color: #6b7280 !important;
        margin-top: 8px !important;
        text-align: center !important;
      ">
        Click anywhere outside to close
      </div>
    </div>
  `;
  
  // Add the card to the container
  container.appendChild(card);
  
  // Add event listeners
  const closeBtn = card.querySelector('#close-notification-btn') as HTMLButtonElement;
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      removeMobileNotification();
      console.log('✅ BULLETPROOF: Notification closed via button');
    });
  }
  
  // Click outside to close
  container.addEventListener('click', function(e) {
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
  
  // Auto-remove after 25 seconds
  setTimeout(() => {
    removeMobileNotification();
    console.log('🗑️ BULLETPROOF: Auto-removed notification after 25 seconds');
  }, 25000);
  
  return container;
}

export function removeMobileNotification(): void {
  if (currentNotification && currentNotification.parentNode) {
    currentNotification.parentNode.removeChild(currentNotification);
    console.log('🗑️ BULLETPROOF: Removed existing notification');
  }
  
  // Also remove any other notifications that might exist
  const existing = document.querySelectorAll('[data-mobile-notification="true"]');
  existing.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  
  currentNotification = null;
}

// Global test function
declare global {
  interface Window {
    testBulletproofMobileNotification: () => void;
  }
}

if (typeof window !== 'undefined') {
  window.testBulletproofMobileNotification = function() {
    console.log('🧪 BULLETPROOF TEST: Creating test notification...');
    
    const testTrade: Trade = {
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
