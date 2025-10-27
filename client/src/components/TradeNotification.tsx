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
    profit?: number; // CRITICAL: Add profit field for accurate P&L display
  } | null;
  onClose: () => void;
}

// Note: Mobile notification logic is now handled in the main component's useEffect

// UNIVERSAL NOTIFICATION COMPONENT (Works for both Desktop and Mobile)
const UniversalTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
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

  // CRITICAL FIX: Reset visibility when trade changes
  useEffect(() => {
    if (trade) {
      setIsVisible(true);
      const timer = setTimeout(handleClose, 25000); // Increased to 25 seconds for better UX
      return () => clearTimeout(timer);
    }
  }, [trade?.id, handleClose]);

  if (!trade || !isVisible) return null;

  const isWin = trade.status === 'won';
  // CRITICAL FIX: Use profit field from WebSocket if available (accurate P&L), otherwise calculate from payout
  // For LOSE trades: Use profitPercentage to calculate loss, not full amount
  let pnl = 0;
  if (trade.profit !== undefined) {
    // Use profit from WebSocket (most accurate)
    pnl = trade.profit;
  } else if (isWin) {
    // Win: payout - amount
    pnl = trade.payout! - trade.amount;
  } else {
    // CRITICAL FIX: Loss should be percentage-based, not full amount
    // Loss percentage = profitPercentage (10% for 30s, 15% for 60s)
    const lossPercentage = (trade.profitPercentage || 15) / 100;
    pnl = -(trade.amount * lossPercentage);
  }

  // Debug log for mobile
  console.log('NOTIFICATION RENDER:', {
    tradeId: trade.id,
    isMobile,
    screenWidth: window.innerWidth,
    isVisible,
    position: isMobile ? 'centered' : 'top-right',
    // CRITICAL DEBUG: Log profit calculation
    tradeProfit: trade.profit,
    tradeAmount: trade.amount,
    tradePayout: trade.payout,
    calculatedPnl: pnl,
    isWin: isWin
  });

  return (
    <div
      className="trade-notification fixed transition-all duration-300"
      style={{
        zIndex: 2147483647, // Maximum z-index
        top: isMobile ? '50%' : '20px',
        left: isMobile ? '50%' : 'auto',
        right: isMobile ? 'auto' : '20px',
        transform: isMobile ? 'translate(-50%, -50%)' : 'none',
        width: isMobile ? '85vw' : 'auto',
        maxWidth: isMobile ? '400px' : '320px',
        minWidth: isMobile ? '300px' : '280px',
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.95,
        pointerEvents: 'auto'
      }}>
      <div className={`rounded-xl shadow-2xl border-2 ${
        isWin
          ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50'
          : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50'
      }`}
      style={{
        padding: isMobile ? '24px' : '20px'
      }}>
        <div className="flex items-center justify-between mb-4">
          <span
            className="font-bold"
            style={{
              fontSize: isMobile ? '22px' : '18px'
            }}
          >
            {isWin ? 'TRADE WON!' : 'TRADE LOST'}
          </span>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white flex items-center justify-center font-bold rounded-full bg-black/20 hover:bg-black/40 transition-colors"
            style={{
              width: isMobile ? '32px' : '28px',
              height: isMobile ? '32px' : '28px',
              fontSize: isMobile ? '16px' : '14px'
            }}
          >
            ×
          </button>
        </div>

        <div
          className="space-y-3"
          style={{
            fontSize: isMobile ? '16px' : '14px'
          }}
        >
          <div
            className="flex justify-between items-center bg-gray-800/40 rounded-lg"
            style={{
              padding: isMobile ? '12px 16px' : '10px 12px'
            }}
          >
            <span className="text-gray-200">Market:</span>
            <span className="font-bold">{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div
            className="flex justify-between items-center bg-gray-800/40 rounded-lg"
            style={{
              padding: isMobile ? '12px 16px' : '10px 12px'
            }}
          >
            <span className="text-gray-200">Trade:</span>
            <span className="font-bold">
              {trade.direction === 'up' ? 'BUY/UP' : 'SELL/DOWN'}
            </span>
          </div>
          <div
            className="flex justify-between items-center bg-gray-800/40 rounded-lg"
            style={{
              padding: isMobile ? '12px 16px' : '10px 12px'
            }}
          >
            <span className="text-gray-200">Amount:</span>
            <span className="font-bold">{trade.amount.toLocaleString()} USDT</span>
          </div>
          <div
            className="flex justify-between items-center bg-gray-800/40 rounded-lg"
            style={{
              padding: isMobile ? '12px 16px' : '10px 12px'
            }}
          >
            <span className="text-gray-200">Entry Price:</span>
            <span className="font-mono">{trade.entryPrice.toFixed(2)}</span>
          </div>
          <div
            className="flex justify-between items-center bg-gray-800/40 rounded-lg"
            style={{
              padding: isMobile ? '12px 16px' : '10px 12px'
            }}
          >
            <span className="text-gray-200">Close Price:</span>
            <span className="font-mono">{trade.finalPrice.toFixed(2)}</span>
          </div>
          <div
            className="flex justify-between items-center bg-gray-800/40 rounded-lg"
            style={{
              padding: isMobile ? '12px 16px' : '10px 12px'
            }}
          >
            <span className="text-gray-200">Duration:</span>
            <span className="font-bold">{trade.duration || 30} seconds</span>
          </div>
          <div
            className="flex justify-between items-center bg-gray-800/40 rounded-lg"
            style={{
              padding: isMobile ? '12px 16px' : '10px 12px'
            }}
          >
            <span className="text-gray-200">Profit:</span>
            <span className={`font-bold ${isWin ? 'text-emerald-300' : 'text-red-300'}`}>
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
