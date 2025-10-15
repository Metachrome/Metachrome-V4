import React, { useEffect, useState, useCallback } from 'react';
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

// Note: Mobile notification logic is now handled in the main component's useEffect

// DESKTOP NOTIFICATION COMPONENT
const DesktopTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (trade) {
      const timer = setTimeout(handleClose, 20000);
      return () => clearTimeout(timer);
    }
  }, [trade?.id, handleClose]); // Only depend on trade ID, not entire trade object

  if (!trade || !isVisible) return null;

  const isWin = trade.status === 'won';
  const pnl = isWin ? (trade.payout! - trade.amount) : -trade.amount;

  return (
    <div className={`trade-notification fixed top-4 right-4 z-50 max-w-[280px] min-w-[260px] transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <div className={`p-3 rounded-lg shadow-lg border ${
        isWin
          ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50'
          : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-base">
            {isWin ? 'TRADE WON!' : 'TRADE LOST'}
          </span>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white w-6 h-6 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between items-center py-1.5 px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Market:</span>
            <span className="font-bold text-xs">{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Trade:</span>
            <span className="font-bold text-xs">
              {trade.direction === 'up' ? 'BUY UP' : 'BUY DOWN'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Amount:</span>
            <span className="font-bold text-xs">{trade.amount.toLocaleString()} USDT</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Entry Price:</span>
            <span className="font-mono text-xs">{trade.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Close Price:</span>
            <span className="font-mono text-xs">{trade.finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Duration:</span>
            <span className="font-bold text-xs">{trade.duration || 30} seconds</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Profit:</span>
            <span className={`font-bold text-xs ${isWin ? 'text-emerald-300' : 'text-red-300'}`}>
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

  // State for responsive mobile detection
  const [shouldUseMobile, setShouldUseMobile] = useState(() => {
    if (typeof window === 'undefined') return false;

    const screenWidth = window.innerWidth;
    const isSmallScreen = screenWidth < 768;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // More flexible mobile detection - prioritize screen width for responsive testing
    return isSmallScreen || isMobileUserAgent;
  });

  // Update mobile detection on window resize
  useEffect(() => {
    const updateMobileDetection = () => {
      const screenWidth = window.innerWidth;
      const isSmallScreen = screenWidth < 768;
      const isTouchDevice = 'ontouchstart' in window;
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      const isMobile = isSmallScreen || isMobileUserAgent;

      console.log('🔔 MOBILE DETECTION UPDATE:', {
        screenWidth,
        isSmallScreen,
        isTouchDevice,
        isMobileUserAgent,
        finalDecision: isMobile,
        previousDecision: shouldUseMobile
      });

      setShouldUseMobile(isMobile);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateMobileDetection);
      updateMobileDetection(); // Initial check
      return () => window.removeEventListener('resize', updateMobileDetection);
    }
  }, [shouldUseMobile]);

  // Log only when trade changes (not on every render)
  useEffect(() => {
    if (trade) {
      console.log('🔔 TRADE NOTIFICATION: New notification -', trade.status, 'shouldUseMobile:', shouldUseMobile);
      console.log('🔔 TRADE NOTIFICATION: Screen width:', window.innerWidth);
      console.log('🔔 TRADE NOTIFICATION: Will use mobile system:', shouldUseMobile);
    }
  }, [trade?.id, shouldUseMobile]); // Only log when trade ID changes

  // BULLETPROOF SYSTEM: Use DOM manipulation for mobile only
  const useBulletproofSystem = shouldUseMobile;

  console.log('🔔 SYSTEM CHECK:', {
    trade: !!trade,
    shouldUseMobile,
    useBulletproofSystem,
    screenWidth: window.innerWidth
  });

  // BULLETPROOF MOBILE NOTIFICATION - Direct DOM manipulation
  useEffect(() => {
    console.log('🔔 BULLETPROOF EFFECT: Checking conditions...', {
      hasTrade: !!trade,
      useBulletproofSystem,
      shouldProceed: !!(trade && useBulletproofSystem)
    });

    if (!trade || !useBulletproofSystem) {
      console.log('🔔 BULLETPROOF EFFECT: Skipping mobile notification', {
        reason: !trade ? 'No trade' : 'Not using bulletproof system'
      });
      return;
    }

    console.log('🔔 BULLETPROOF: Creating bulletproof mobile notification for trade:', trade.id);

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

    // Use the direct mobile notification system for testing
    showMobileTradeNotification(testTrade);

    console.log('🧪 TESTING: Mobile notification test rendered');
  };

  // Force mobile notification test (bypasses device detection)
  (window as any).forceMobileNotification = () => {
    console.log('🧪 FORCE TEST: Forcing mobile notification regardless of device');

    const testTrade = {
      id: 'force-test-' + Date.now(),
      direction: 'down' as const,
      amount: 250,
      entryPrice: 45000,
      finalPrice: 44000,
      status: 'lost' as const,
      payout: 0,
      profitPercentage: 15,
      symbol: 'BTC/USDT',
      duration: 60
    };

    // Force mobile notification directly
    showMobileTradeNotification(testTrade);
    console.log('🧪 FORCE TEST: Mobile notification forced');
  };

  // Test mobile detection specifically
  (window as any).testMobileDetection = () => {
    const screenWidth = window.innerWidth;
    const isSmallScreen = screenWidth < 768;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const shouldUseMobile = isSmallScreen || isMobileUserAgent;

    console.log('🧪 MOBILE DETECTION TEST:', {
      screenWidth,
      isSmallScreen: `${isSmallScreen} (< 768px)`,
      isMobileUserAgent: `${isMobileUserAgent} (regex test)`,
      shouldUseMobile: `${shouldUseMobile} (final decision)`,
      recommendation: shouldUseMobile ? 'MOBILE notification' : 'DESKTOP notification'
    });

    return shouldUseMobile;
  };

  console.log('🧪 TESTING: Available functions:');
  console.log('  - testMobileNotification() - Test with device detection');
  console.log('  - forceMobileNotification() - Force mobile notification');
  console.log('  - testMobileDetection() - Test mobile detection logic');
}
