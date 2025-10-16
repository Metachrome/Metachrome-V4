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

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

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
    <div className={`trade-notification fixed z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }
    /* Desktop positioning */
    md:top-4 md:right-4 md:max-w-[280px] md:min-w-[260px]
    /* Mobile positioning - centered and larger */
    top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    md:transform-none md:translate-x-0 md:translate-y-0
    w-[90vw] max-w-[350px] md:w-auto
    `}>
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
