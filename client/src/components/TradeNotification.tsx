import { useEffect, useState } from 'react';

interface TradeNotificationProps {
  trade: {
    id: string;
    direction: 'up' | 'down';
    amount: number;
    entryPrice: number;
    finalPrice: number;
    status: 'won' | 'lost';
    payout?: number;
    profitPercentage: number;
  } | null;
  onClose: () => void;
}

// DESKTOP NOTIFICATION SYSTEM - Traditional React component for desktop
const DesktopTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  if (!trade || !isVisible) return null;

  const isWin = trade.status === 'won';
  const profit = isWin ? (trade.payout || 0) - trade.amount : -trade.amount;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className={`bg-gray-800 text-white p-6 rounded-lg max-w-md w-full mx-4 border-2 ${
          isWin ? 'border-green-500' : 'border-red-500'
        } shadow-2xl animate-in slide-in-from-bottom-4 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isWin ? 'text-green-500' : 'text-red-500'}`}>
            {isWin ? '🎉 Trade Won!' : '💔 Trade Lost'}
          </h2>

          <div className="bg-gray-700 p-4 rounded-lg mb-4 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Direction:</span>
              <span>{trade.direction.toUpperCase()} {trade.direction === 'up' ? '⬆️' : '⬇️'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Amount:</span>
              <span>${trade.amount}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Entry:</span>
              <span>${trade.entryPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Final:</span>
              <span>${trade.finalPrice?.toLocaleString()}</span>
            </div>

            <hr className="border-gray-600 my-3" />

            {isWin ? (
              <>
                <div className="flex justify-between items-center mb-2 text-green-500 font-bold">
                  <span>Profit:</span>
                  <span>+${profit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-green-500 font-bold">
                  <span>Payout:</span>
                  <span>${trade.payout}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-red-500 font-bold">
                <span>Loss:</span>
                <span>-${trade.amount}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors ${
              isWin
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            Close Notification
          </button>

          <p className="text-gray-400 text-sm mt-3">
            Click anywhere outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

// MOBILE NOTIFICATION SYSTEM - Optimized for all mobile devices
const createMobileNotification = (trade: any, onClose: () => void) => {
  console.log('📱 CREATING MOBILE NOTIFICATION:', trade.id);
  console.log('📱 Window dimensions:', window.innerWidth, 'x', window.innerHeight);
  console.log('📱 User agent:', navigator.userAgent);

  // Detect mobile screen sizes
  const isMobile = window.innerWidth <= 768;
  const isSmallMobile = window.innerWidth <= 400;
  console.log('📱 Is mobile (≤768px):', isMobile);
  console.log('📱 Is small mobile (≤400px):', isSmallMobile);

  // Remove any existing notifications
  const existing = document.querySelectorAll('.metachrome-mobile-notification, [data-mobile-notification], [id*="notification"]');
  existing.forEach(el => {
    console.log('📱 Removing existing notification:', el.className);
    el.remove();
  });

  // Prevent body scrolling
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  // Create notification container
  const notification = document.createElement('div');
  notification.className = 'metachrome-mobile-notification';
  notification.setAttribute('data-mobile-notification', 'true');
  notification.setAttribute('data-screen-width', window.innerWidth.toString());

  // ULTRA-SMALL SCREEN OPTIMIZED STYLES - Perfect for 250px screens
  const baseStyles = [
    'position: fixed',
    'top: 0',
    'left: 0',
    'right: 0',
    'bottom: 0',
    'width: 100vw',
    'height: 100vh',
    'z-index: 2147483647', // Maximum z-index
    'background: rgba(0, 0, 0, 0.98)', // Slightly more opaque for small screens
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'box-sizing: border-box',
    'overflow: hidden',
    'visibility: visible',
    'opacity: 1',
    'pointer-events: auto',
    // Mobile-specific optimizations
    '-webkit-overflow-scrolling: touch',
    'transform: translateZ(0)',
    '-webkit-transform: translateZ(0)',
    'backface-visibility: hidden',
    '-webkit-backface-visibility: hidden',
    'will-change: transform',
    '-webkit-user-select: none',
    'user-select: none',
    'touch-action: manipulation',
    // Font and rendering optimized for small screens
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'text-rendering: optimizeLegibility',
    '-webkit-font-smoothing: antialiased',
    '-moz-osx-font-smoothing: grayscale'
  ];

  // Mobile-specific padding
  if (isSmallMobile) {
    baseStyles.push('padding: 12px'); // Small padding for mobile
  } else {
    baseStyles.push('padding: 20px'); // Normal padding for larger screens
  }

  const mobileStyles = baseStyles.map(style => style + ' !important').join('; ');
  notification.style.cssText = mobileStyles;

  console.log('📱 Applied mobile styles for', window.innerWidth + 'px screen');

  // Create content card optimized for ultra-small screens (250px)
  const card = document.createElement('div');
  card.className = 'mobile-notification-card-250px';

  // Ultra-small screen responsive card styling
  const baseCardStyles = [
    'background: #1f2937',
    'color: white',
    'text-align: center',
    'position: relative',
    'animation: slideInMobile 0.4s ease-out',
    'margin: auto',
    'display: block',
    'visibility: visible',
    'opacity: 1',
    'z-index: 2147483647',
    `border: ${isSmallMobile ? '2px' : '3px'} solid ${trade.status === 'won' ? '#10b981' : '#ef4444'}`,
    `box-shadow: 0 0 ${isSmallMobile ? '20px' : '30px'} ${trade.status === 'won' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
    // Mobile-specific card optimizations
    'transform: translateZ(0)',
    '-webkit-transform: translateZ(0)',
    'will-change: transform',
    'isolation: isolate'
  ];

  // Screen-size specific dimensions and spacing
  if (isSmallMobile) {
    // Optimized for small mobile (≤400px)
    baseCardStyles.push(
      'width: calc(100vw - 24px)',
      'max-width: 350px',
      'min-width: 280px',
      'border-radius: 12px',
      'padding: 16px',
      'font-size: 14px'
    );
  } else {
    // Normal mobile/desktop
    baseCardStyles.push(
      'width: 100%',
      'max-width: 350px',
      'min-width: 300px',
      'border-radius: 16px',
      'padding: 24px',
      'font-size: 16px'
    );
  }

  const cardStyles = baseCardStyles.map(style => style + ' !important').join('; ');
  card.style.cssText = cardStyles;

  console.log('📱 Card created for', window.innerWidth + 'px screen with mobile-optimized styling');

  // Add animation styles
  if (!document.getElementById('mobile-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-notification-styles';
    style.textContent = `
      @keyframes slideInMobile {
        from { transform: translateY(-100px) scale(0.8); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      @keyframes slideOutMobile {
        from { transform: translateY(0) scale(1); opacity: 1; }
        to { transform: translateY(-100px) scale(0.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // Create content optimized for screen size
  const isWin = trade.status === 'won';
  const profit = isWin ? (trade.payout || 0) - trade.amount : -trade.amount;

  // Screen-size specific content styling
  const contentStyles = {
    title: {
      fontSize: isSmallMobile ? '22px' : '28px',
      margin: isSmallMobile ? '0 0 12px 0' : '0 0 20px 0'
    },
    container: {
      margin: isSmallMobile ? '12px 0' : '20px 0',
      padding: isSmallMobile ? '12px' : '16px',
      borderRadius: '8px'
    },
    row: {
      margin: isSmallMobile ? '8px 0' : '12px 0',
      fontSize: isSmallMobile ? '13px' : '16px'
    },
    profit: {
      fontSize: isSmallMobile ? '14px' : '18px'
    },
    payout: {
      fontSize: isSmallMobile ? '16px' : '20px'
    },
    button: {
      padding: isSmallMobile ? '12px 24px' : '16px 32px',
      fontSize: isSmallMobile ? '14px' : '18px',
      borderRadius: isSmallMobile ? '8px' : '12px',
      marginTop: isSmallMobile ? '12px' : '20px'
    },
    footer: {
      fontSize: isSmallMobile ? '12px' : '14px',
      margin: isSmallMobile ? '12px 0 0 0' : '16px 0 0 0'
    }
  };

  card.innerHTML = `
    <div style="margin-bottom: ${isSmallMobile ? '12px' : '20px'};">
      <h2 style="color: ${isWin ? '#10b981' : '#ef4444'}; margin: ${contentStyles.title.margin}; font-size: ${contentStyles.title.fontSize}; font-weight: bold; line-height: 1.2;">
        ${isWin ? '🎉 Trade Won!' : '💔 Trade Lost'}
      </h2>
      <div style="text-align: left; margin: ${contentStyles.container.margin}; background: rgba(255,255,255,0.05); padding: ${contentStyles.container.padding}; border-radius: ${contentStyles.container.borderRadius};">
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Direction:</strong></span>
          <span>${trade.direction.toUpperCase()} ${trade.direction === 'up' ? '⬆️' : '⬇️'}</span>
        </div>
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Amount:</strong></span>
          <span>$${trade.amount}</span>
        </div>
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Entry:</strong></span>
          <span>$${trade.entryPrice?.toLocaleString()}</span>
        </div>
        <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.row.fontSize}; display: flex; justify-content: space-between; align-items: center;">
          <span><strong>Final:</strong></span>
          <span>$${trade.finalPrice?.toLocaleString()}</span>
        </div>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: ${isSmallMobile ? '8px 0' : '16px 0'};">
        ${isWin ? `
          <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.profit.fontSize}; display: flex; justify-content: space-between; color: #10b981; font-weight: bold; align-items: center;">
            <span><strong>Profit:</strong></span>
            <span>+$${profit.toFixed(2)}</span>
          </div>
          <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.payout.fontSize}; display: flex; justify-content: space-between; color: #10b981; font-weight: bold; align-items: center;">
            <span><strong>Payout:</strong></span>
            <span>$${trade.payout}</span>
          </div>
        ` : `
          <div style="margin: ${contentStyles.row.margin}; font-size: ${contentStyles.profit.fontSize}; display: flex; justify-content: space-between; color: #ef4444; font-weight: bold; align-items: center;">
            <span><strong>Loss:</strong></span>
            <span>-$${trade.amount}</span>
          </div>
        `}
      </div>
      <button id="close-mobile-notification" style="
        background: ${isWin ? '#10b981' : '#ef4444'};
        color: white;
        border: none;
        padding: ${contentStyles.button.padding};
        border-radius: ${contentStyles.button.borderRadius};
        font-size: ${contentStyles.button.fontSize};
        font-weight: bold;
        cursor: pointer;
        width: 100%;
        margin-top: ${contentStyles.button.marginTop};
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        line-height: 1.2;
      ">Close Notification</button>
      <p style="font-size: ${contentStyles.footer.fontSize}; color: #9ca3af; margin: ${contentStyles.footer.margin}; line-height: 1.2;">
        Tap anywhere outside to close
      </p>
    </div>
  `;

  notification.appendChild(card);

  // Event handlers
  const closeNotification = () => {
    // Restore body scrolling
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    card.style.animation = 'slideOutMobile 0.3s ease-in forwards';
    setTimeout(() => {
      notification.remove();
      onClose();
    }, 300);
  };

  // Initial event handlers (will be updated later)
  notification.addEventListener('click', (e) => {
    if (e.target === notification) closeNotification();
  });

  // AGGRESSIVE DOM insertion with multiple fallbacks
  console.log('📱 Attempting to add notification to DOM...');

  // Try multiple insertion methods
  try {
    // Method 1: Direct body append
    document.body.appendChild(notification);
    console.log('📱 Method 1: Added to document.body');
  } catch (e) {
    console.error('📱 Method 1 failed:', e);

    // Method 2: Insert at body start
    try {
      document.body.insertBefore(notification, document.body.firstChild);
      console.log('📱 Method 2: Inserted at body start');
    } catch (e2) {
      console.error('📱 Method 2 failed:', e2);

      // Method 3: Create new container
      const container = document.createElement('div');
      container.appendChild(notification);
      document.documentElement.appendChild(container);
      console.log('📱 Method 3: Added to documentElement');
    }
  }

  // FORCE visibility with multiple techniques
  console.log('📱 Forcing notification visibility...');

  // Force reflow
  notification.offsetHeight;
  card.offsetHeight;

  // Force styles again
  notification.style.display = 'flex !important';
  notification.style.visibility = 'visible !important';
  notification.style.opacity = '1 !important';
  notification.style.zIndex = '2147483647 !important';

  // Force card visibility
  card.style.display = 'block !important';
  card.style.visibility = 'visible !important';
  card.style.opacity = '1 !important';

  // Check if notification is actually visible
  const rect = notification.getBoundingClientRect();
  console.log('📱 Notification position:', rect);
  console.log('📱 Notification computed style:', window.getComputedStyle(notification).display);

  // Auto-close after 12 seconds (longer for mobile testing)
  const autoCloseTimer = setTimeout(closeNotification, 12000);

  // Override close function to clear timer
  const originalClose = closeNotification;
  const enhancedClose = () => {
    clearTimeout(autoCloseTimer);
    originalClose();
  };

  // Update event handlers to use enhanced close
  const closeBtn = card.querySelector('#close-mobile-notification');
  if (closeBtn) {
    closeBtn.removeEventListener('click', closeNotification);
    closeBtn.addEventListener('click', enhancedClose);
  }

  notification.removeEventListener('click', closeNotification);
  notification.addEventListener('click', (e) => {
    if (e.target === notification) enhancedClose();
  });

  console.log('📱 AGGRESSIVE MOBILE NOTIFICATION: Created and forced to display');
};

export default function TradeNotification({ trade, onClose }: TradeNotificationProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if this is a mobile device
    const checkMobile = () => {
      const isMobileWidth = window.innerWidth <= 768;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return isMobileWidth || isMobileDevice;
    };

    setIsMobile(checkMobile());

    // Listen for resize events to update mobile detection
    const handleResize = () => {
      setIsMobile(checkMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!trade) return;

    console.log('📱 TRADE NOTIFICATION: Creating notification for trade:', trade.id);
    console.log('📱 Screen width:', window.innerWidth);
    console.log('📱 Is mobile:', isMobile);

    // Use mobile notification system only for mobile devices
    if (isMobile) {
      createMobileNotification(trade, onClose);

      // Cleanup function for mobile notifications
      return () => {
        const notifications = document.querySelectorAll('.metachrome-mobile-notification, [data-mobile-notification]');
        notifications.forEach(el => {
          console.log('📱 Cleaning up mobile notification:', el.className);
          el.remove();
        });
        // Restore body scrolling
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    }
    // For desktop, we'll use the React component (no cleanup needed)
  }, [trade, onClose, isMobile]);

  // For mobile devices, don't render React component (use native mobile notification)
  if (isMobile) {
    return null;
  }

  // For desktop devices, use the React component
  return <DesktopTradeNotification trade={trade} onClose={onClose} />;
}


