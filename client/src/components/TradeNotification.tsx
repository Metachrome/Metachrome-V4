import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useIsMobile } from '../hooks/use-mobile';
import { showMobileTradeNotification, removeMobileNotification } from '../utils/mobileNotification';

// Debug: Verify import is working
console.log('🔧 DEBUG: TradeNotification component loaded, bulletproof functions available:', {
  showMobileTradeNotification: typeof showMobileTradeNotification,
  removeMobileNotification: typeof removeMobileNotification
});

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
    symbol?: string;
    duration?: number;
  } | null;
  onClose: () => void;
}

// BULLETPROOF MOBILE NOTIFICATION COMPONENT
const MobileTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  console.log('🔔 BULLETPROOF MOBILE: Component called with trade:', trade);

  useEffect(() => {
    if (!trade) {
      console.log('🔔 BULLETPROOF MOBILE: No trade data, skipping');
      return;
    }

    console.log('🔔 BULLETPROOF MOBILE: Creating bulletproof notification');

    // Use the bulletproof notification system
    showMobileTradeNotification(trade);

    // Set up cleanup
    const cleanup = () => {
      removeMobileNotification();
      onClose();
    };

    // Auto-close after 25 seconds
    const timer = setTimeout(cleanup, 25000);

    return () => {
      clearTimeout(timer);
      removeMobileNotification();
    };
  }, [trade, onClose]);

  // Return null since we're using direct DOM manipulation
  return null;

  // Create portal to ensure it renders at the top level
  const notificationElement = (
    <div
      data-mobile-notification="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999999, // Maximum z-index value - higher than any other element
        backgroundColor: 'rgba(0, 0, 0, 0.95)', // Slightly more opaque for visibility
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        visibility: 'visible !important',
        opacity: '1 !important',
        pointerEvents: 'auto',
        display: 'flex !important',
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'transform, opacity'
      }}
      onClick={(e) => {
        // Close when clicking outside the modal
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1b3a',
          borderRadius: '16px',
          padding: '20px',
          maxWidth: '320px',
          width: '100%',
          border: isWin ? '3px solid #10b981' : '3px solid #ef4444',
          boxShadow: isWin ? '0 0 20px rgba(16, 185, 129, 0.5)' : '0 0 20px rgba(239, 68, 68, 0.5)',
          color: 'white',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          animation: 'slideInUp 0.3s ease-out',
          transform: 'translateY(0)',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header with Trade Result */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: isWin ? '#10b981' : '#ef4444',
            marginBottom: '8px'
          }}>
            {isWin ? 'Trade Won!' : 'Trade Lost!'}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Market: {trade.symbol || 'BTC/USDT'}
          </div>
        </div>

        {/* Trade Details - Exact format from image */}
        <div style={{
          backgroundColor: '#2a2d47',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          border: '1px solid #3a3d5a',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Market :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Trade :</span>
            <span style={{
              color: trade.direction === 'up' ? '#10b981' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {trade.direction === 'up' ? 'BUY' : 'SELL'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Amount :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.amount.toLocaleString()} USDT (bukan pakai $)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Entry Price :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Closed Price :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Duration :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.duration || 30} seconds</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af' }}>Profit :</span>
            <span style={{
              color: isWin ? '#10b981' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {isWin ? '+' : ''}{pnl.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Note about payout */}
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginBottom: '16px',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Pay out nya di hilangkan aja.
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
          >
            Close Notification
          </button>
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '8px',
            textAlign: 'center'
          }}>
            Click anywhere outside to close
          </div>
        </div>
      </div>
    </div>
  );

  // Component now uses bulletproof DOM manipulation - no JSX needed
  return null;
};

// DESKTOP NOTIFICATION COMPONENT
const DesktopTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    if (trade) {
      const timer = setTimeout(() => {
        handleClose();
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [trade]);

  if (!trade || !isVisible) return null;

  const isWin = trade.status === 'won';
  const pnl = isWin ? (trade.payout! - trade.amount) : -trade.amount;

  return (
    <div className="trade-notification fixed top-4 right-4 z-50 max-w-[320px] min-w-[300px]">
      <div className={`p-4 rounded-xl shadow-xl border ${
        isWin
          ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50'
          : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg">
            {isWin ? 'TRADE WON!' : 'TRADE LOST'}
          </span>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white w-7 h-7 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Market:</span>
            <span className="font-bold text-sm">{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Trade:</span>
            <span className="font-bold text-sm">
              {trade.direction === 'up' ? 'BUY' : 'SELL'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Amount:</span>
            <span className="font-bold text-sm">{trade.amount.toLocaleString()} USDT</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Entry Price:</span>
            <span className="font-mono text-sm">{trade.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Closed Price:</span>
            <span className="font-mono text-sm">{trade.finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Duration:</span>
            <span className="font-bold text-sm">{trade.duration || 30} seconds</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Profit:</span>
            <span className={`font-bold text-sm ${isWin ? 'text-emerald-300' : 'text-red-300'}`}>
              {isWin ? '+' + pnl.toFixed(0) : pnl.toFixed(0)} USDT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT
export default function TradeNotification({ trade, onClose }: TradeNotificationProps) {
  const isMobile = useIsMobile();
  const [currentWidth, setCurrentWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setCurrentWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // CRITICAL: Log when notification is triggered
  useEffect(() => {
    if (trade) {
      console.log('🔔 TRADE NOTIFICATION: Notification triggered with trade:', trade);
      console.log('🔔 TRADE NOTIFICATION: Current width:', currentWidth);
      console.log('🔔 TRADE NOTIFICATION: isMobile hook:', isMobile);
    }
  }, [trade, currentWidth, isMobile]);

  const hookMobile = isMobile;
  const widthMobile = currentWidth < 768;
  const forceMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const userAgentMobile = typeof navigator !== 'undefined' &&
    (navigator.userAgent.toLowerCase().includes('android') ||
     navigator.userAgent.toLowerCase().includes('iphone') ||
     navigator.userAgent.toLowerCase().includes('ipad') ||
     navigator.userAgent.toLowerCase().includes('mobile'));

  const shouldUseMobile = hookMobile || widthMobile || forceMobile || userAgentMobile;
  const forceMobileForTesting = currentWidth < 1024;

  // AGGRESSIVE MOBILE DETECTION - Force mobile on any screen < 1024px
  const isMobileScreen = currentWidth < 1024;
  const forceAllMobile = true; // TEMPORARY: Force all notifications to be mobile for testing

  console.log('🔔 TRADE NOTIFICATION: Detection results:', {
    hookMobile,
    widthMobile,
    forceMobile,
    userAgentMobile,
    shouldUseMobile,
    forceMobileForTesting,
    isMobileScreen,
    forceAllMobile,
    currentWidth,
    trade: !!trade
  });

  // BULLETPROOF SYSTEM: Use DOM manipulation for mobile
  const useBulletproofSystem = shouldUseMobile || forceMobileForTesting || isMobileScreen || forceAllMobile;

  // BULLETPROOF MOBILE NOTIFICATION - Direct DOM manipulation
  useEffect(() => {
    if (!trade || !useBulletproofSystem) return;

    console.log('🔔 BULLETPROOF: Creating bulletproof mobile notification');

    // Fix body overflow issues first
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'visible';

    // Use the bulletproof notification system
    showMobileTradeNotification(trade);

    // Set up cleanup
    const cleanup = () => {
      removeMobileNotification();
      document.body.style.overflow = originalBodyOverflow;
      onClose();
    };

    // Auto-close after 25 seconds
    const timer = setTimeout(cleanup, 25000);

    return () => {
      clearTimeout(timer);
      removeMobileNotification();
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [trade, onClose, useBulletproofSystem]);

  // For mobile, return null since bulletproof system handles DOM directly
  if (useBulletproofSystem) {
    console.log('🔔 BULLETPROOF: Using bulletproof system, returning null');
    return null;
  }

  console.log('🔔 TRADE NOTIFICATION: Using DESKTOP notification');
  return <DesktopTradeNotification trade={trade} onClose={onClose} />;
}

// GLOBAL TEST FUNCTION - Add to window for debugging
if (typeof window !== 'undefined') {
  (window as any).testMobileNotification = () => {
    console.log('🧪 TESTING: Triggering mobile notification test');

    // Create a test trade object
    const testTrade = {
      id: 'test-' + Date.now(),
      direction: 'up' as const,
      amount: 100,
      entryPrice: 50000,
      finalPrice: 51000,
      status: 'won' as const,
      payout: 110,
      profitPercentage: 10,
      symbol: 'BTC/USDT',
      duration: 30
    };

    // Find the notification container or create one
    let container = document.getElementById('test-notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'test-notification-container';
      document.body.appendChild(container);
    }

    // Force mobile notification
    const MobileNotificationTest = () => {
      return React.createElement(MobileTradeNotification, {
        trade: testTrade,
        onClose: () => {
          console.log('🧪 TESTING: Test notification closed');
          if (container) {
            container.remove();
          }
        }
      });
    };

    // Render the test notification
    ReactDOM.render(React.createElement(MobileNotificationTest), container);

    console.log('🧪 TESTING: Mobile notification test rendered');
  };

  console.log('🧪 TESTING: testMobileNotification() function available in console');
}
