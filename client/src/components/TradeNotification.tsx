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

// ORIGINAL DESKTOP NOTIFICATION SYSTEM - Top-right corner notification
const DesktopTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  useEffect(() => {
    if (trade) {
      setProgress(100);

      // Progress bar countdown - 15 seconds
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / 150); // 15 seconds = 150 intervals of 100ms
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto close timer - 15 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 15000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [trade]);

  if (!trade || !isVisible) return null;

  const isWin = trade.status === 'won';
  const pnl = isWin ? (trade.payout! - trade.amount) : -trade.amount;
  const priceChange = trade.finalPrice - trade.entryPrice;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`p-6 rounded-xl shadow-2xl border-l-8 ${
        isWin
          ? 'bg-gradient-to-r from-green-900/95 to-green-800/95 border-green-400 text-green-100 shadow-green-500/20'
          : 'bg-gradient-to-r from-red-900/95 to-red-800/95 border-red-400 text-red-100 shadow-red-500/20'
      } backdrop-blur-md min-w-[380px] max-w-[420px] ring-2 ${
        isWin ? 'ring-green-400/30' : 'ring-red-400/30'
      } animate-pulse-subtle`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full ${
              isWin ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'
            } shadow-lg ${isWin ? 'shadow-green-400/50' : 'shadow-red-400/50'}`} />
            <span className="font-bold text-xl tracking-wide">
              {isWin ? '🎉 TRADE WON!' : '💔 TRADE LOST'}
            </span>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              isWin ? 'bg-green-400/20 text-green-300' : 'bg-red-400/20 text-red-300'
            }`}>
              {isWin ? 'PROFIT' : 'LOSS'}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
            title="Close notification"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 px-3 bg-black/20 rounded-lg">
            <span className="text-gray-300">Direction:</span>
            <span className={`font-bold text-lg ${trade.direction === 'up' ? 'text-green-300' : 'text-red-300'}`}>
              {trade.direction === 'up' ? '📈 UP' : '📉 DOWN'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-black/20 rounded-lg">
            <span className="text-gray-300">Amount:</span>
            <span className="font-bold text-lg text-yellow-300">{trade.amount} USDT</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-black/20 rounded-lg">
            <span className="text-gray-300">Entry Price:</span>
            <span className="font-mono text-lg">${trade.entryPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-black/20 rounded-lg">
            <span className="text-gray-300">Final Price:</span>
            <span className="font-mono text-lg">${trade.finalPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center py-2 px-3 bg-black/20 rounded-lg">
            <span className="text-gray-300">Price Change:</span>
            <span className={`font-bold text-lg ${priceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
            </span>
          </div>

          <div className={`border-2 ${isWin ? 'border-green-400/50' : 'border-red-400/50'} rounded-xl p-4 mt-4 ${
            isWin ? 'bg-green-900/30' : 'bg-red-900/30'
          }`}>
            <div className="flex justify-between items-center font-bold text-xl">
              <span className="text-gray-200">Final P&L:</span>
              <span className={`${isWin ? 'text-green-300' : 'text-red-300'} text-2xl font-black`}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
              </span>
            </div>

            {isWin && (
              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-green-400/30">
                <span className="text-green-200">Profit Rate:</span>
                <span className="text-green-300 font-bold">{trade.profitPercentage}%</span>
              </div>
            )}

            <div className="text-center mt-3">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                isWin
                  ? 'bg-green-400/20 text-green-300 border border-green-400/30'
                  : 'bg-red-400/20 text-red-300 border border-red-400/30'
              }`}>
                {isWin ? '🎊 Congratulations! 🎊' : '😔 Better luck next time'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              isWin ? 'bg-green-400' : 'bg-red-400'
            }`}
            style={{ width: `${progress}%` }}
          />
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
    // FORCE DESKTOP NOTIFICATIONS - Always use the original top-right corner design
    setIsMobile(false);

    // Listen for resize events but keep desktop mode
    const handleResize = () => {
      // Only use mobile for very small screens (actual mobile devices)
      setIsMobile(window.innerWidth <= 480);
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


