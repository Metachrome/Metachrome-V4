import React, { useEffect, useState } from 'react';
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

// Note: Mobile notification logic is now handled in the main component's useEffect

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
    <div className="trade-notification fixed top-4 right-4 z-50 max-w-[280px] min-w-[260px]">
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

  // BULLETPROOF MOBILE DETECTION - Multiple checks
  const screenWidth = window.innerWidth;
  const isSmallScreen = screenWidth < 768;
  const isTouchDevice = 'ontouchstart' in window;

  // ENHANCED MOBILE DETECTION - More strict criteria
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isReallySmallScreen = screenWidth < 600; // Even stricter threshold
  const isActuallyMobile = (isSmallScreen && isTouchDevice && isMobileUserAgent) || isReallySmallScreen;

  console.log('🔔 TRADE NOTIFICATION: Detection results:', {
    isMobile,
    currentWidth,
    screenWidth,
    isSmallScreen,
    isTouchDevice,
    isActuallyMobile,
    'Should use mobile': isActuallyMobile,
    'Should use desktop': !isActuallyMobile,
    trade: !!trade,
    userAgent: navigator.userAgent
  });

  // PROPER DEVICE DETECTION: Use mobile notification only for actual mobile devices
  const shouldUseMobile = isActuallyMobile;

  console.log('🔔 DEVICE DETECTION: Using proper mobile detection - shouldUseMobile:', shouldUseMobile);

  // BULLETPROOF SYSTEM: Use DOM manipulation for mobile only
  const useBulletproofSystem = shouldUseMobile; // EMERGENCY: Always false, so always use React desktop notification

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

    // Use the direct mobile notification system for testing
    showMobileTradeNotification(testTrade);

    console.log('🧪 TESTING: Mobile notification test rendered');
  };

  console.log('🧪 TESTING: testMobileNotification() function available in console');
}
