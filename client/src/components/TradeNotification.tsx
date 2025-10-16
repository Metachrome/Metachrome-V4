import React, { useEffect, useState, useCallback } from 'react';

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

// UNIVERSAL NOTIFICATION COMPONENT (Works for both Desktop and Mobile)
const UniversalTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (trade) {
      const timer = setTimeout(handleClose, 25000); // Increased to 25 seconds for better UX
      return () => clearTimeout(timer);
    }
  }, [trade?.id, handleClose]);

  if (!trade || !isVisible) return null;

  const isWin = trade.status === 'won';
  const pnl = isWin ? (trade.payout! - trade.amount) : -trade.amount;

  return (
    <div className={`trade-notification fixed z-[9999] transition-all duration-300 ${
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}
    style={{
      // Mobile-first approach with CSS-in-JS for better control
      top: isMobile ? '50%' : '16px',
      left: isMobile ? '50%' : 'auto',
      right: isMobile ? 'auto' : '16px',
      transform: isMobile ? 'translate(-50%, -50%)' : 'none',
      width: isMobile ? '90vw' : 'auto',
      maxWidth: isMobile ? '350px' : '280px',
      minWidth: isMobile ? 'auto' : '260px'
    }}>
      <div className={`p-4 md:p-3 rounded-lg shadow-lg border ${
        isWin
          ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50'
          : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50'
      }`}>
        <div className="flex items-center justify-between mb-3 md:mb-2">
          <span className="font-bold text-lg md:text-base">
            {isWin ? '🎉 TRADE WON!' : '💔 TRADE LOST'}
          </span>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white w-8 h-8 md:w-6 md:h-6 flex items-center justify-center text-sm md:text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 md:space-y-1 text-sm md:text-xs">
          <div className="flex justify-between items-center py-2 md:py-1.5 px-3 md:px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Market:</span>
            <span className="font-bold text-sm md:text-xs">{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div className="flex justify-between items-center py-2 md:py-1.5 px-3 md:px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Trade:</span>
            <span className="font-bold text-sm md:text-xs">
              {trade.direction === 'up' ? 'BUY UP ⬆️' : 'BUY DOWN ⬇️'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 md:py-1.5 px-3 md:px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Amount:</span>
            <span className="font-bold text-sm md:text-xs">{trade.amount.toLocaleString()} USDT</span>
          </div>
          <div className="flex justify-between items-center py-2 md:py-1.5 px-3 md:px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Entry Price:</span>
            <span className="font-mono text-sm md:text-xs">{trade.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 md:py-1.5 px-3 md:px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Close Price:</span>
            <span className="font-mono text-sm md:text-xs">{trade.finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 md:py-1.5 px-3 md:px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Duration:</span>
            <span className="font-bold text-sm md:text-xs">{trade.duration || 30} seconds</span>
          </div>
          <div className="flex justify-between items-center py-2 md:py-1.5 px-3 md:px-2 bg-gray-800/40 rounded">
            <span className="text-gray-200">Profit:</span>
            <span className={`font-bold text-sm md:text-xs ${isWin ? 'text-emerald-300' : 'text-red-300'}`}>
              {isWin ? '+' + pnl.toFixed(0) : pnl.toFixed(0)} USDT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT - Now uses Universal Notification for all devices
export default function TradeNotification({ trade, onClose }: TradeNotificationProps) {
  console.log('🔔 UNIVERSAL NOTIFICATION: Rendering for trade:', trade?.id, 'Status:', trade?.status);

  // Simply return the universal component - no complex mobile detection needed
  return <UniversalTradeNotification trade={trade} onClose={onClose} />;
}
