import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useIsMobile } from '../hooks/use-mobile';

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

export default function TradeNotification({ trade, onClose }: TradeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timersRef = useRef<{ timer?: NodeJS.Timeout; progressInterval?: NodeJS.Timeout }>({});
  const isMobile = useIsMobile();

  const handleClose = () => {
    // Clear all timers
    if (timersRef.current.timer) clearTimeout(timersRef.current.timer);
    if (timersRef.current.progressInterval) clearInterval(timersRef.current.progressInterval);

    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  useEffect(() => {
    if (trade) {
      console.log('🎯 TRADE NOTIFICATION: Showing notification for trade:', trade);
      console.log('🎯 TRADE NOTIFICATION: Mobile detected:', isMobile);
      console.log('🎯 TRADE NOTIFICATION: Window dimensions:', window.innerWidth, 'x', window.innerHeight);
      console.log('🎯 TRADE NOTIFICATION: User agent:', navigator.userAgent);
      console.log('🎯 TRADE NOTIFICATION: Document body overflow:', document.body.style.overflow);
      console.log('🎯 TRADE NOTIFICATION: Document documentElement overflow:', document.documentElement.style.overflow);



      setIsVisible(true);
      setProgress(100);

      // Progress bar countdown - Extended to 15 seconds for better readability
      timersRef.current.progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / 150); // 15 seconds = 150 intervals of 100ms
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto close timer - Extended to 15 seconds
      timersRef.current.timer = setTimeout(() => {
        handleClose();
      }, 15000); // 15 seconds for much better readability and stickiness

      return () => {
        if (timersRef.current.timer) clearTimeout(timersRef.current.timer);
        if (timersRef.current.progressInterval) clearInterval(timersRef.current.progressInterval);
      };
    } else {
      console.log('🎯 TRADE NOTIFICATION: No trade to show');
    }
  }, [trade, onClose, isMobile]);

  if (!trade) {
    console.log('🎯 TRADE NOTIFICATION: No trade data, not rendering');
    return null;
  }

  console.log('🎯 TRADE NOTIFICATION: About to render, isMobile:', isMobile, 'isVisible:', isVisible);

  const isWin = trade.status === 'won';

  // FIX: Calculate PnL properly, handling undefined payout
  let pnl = 0;
  if (isWin) {
    if (trade.payout && !isNaN(trade.payout)) {
      pnl = trade.payout - trade.amount;
    } else {
      // Calculate profit based on profit percentage if payout is not available
      const profitAmount = trade.amount * (trade.profitPercentage / 100);
      pnl = profitAmount;
    }
  } else {
    pnl = -trade.amount;
  }

  console.log('🎯 PNL CALCULATION:', {
    isWin,
    payout: trade.payout,
    amount: trade.amount,
    profitPercentage: trade.profitPercentage,
    calculatedPnl: pnl
  });

  const priceChange = trade.finalPrice - trade.entryPrice;

  // MOBILE NOTIFICATION: Force display on mobile with improved detection
  if (isMobile || window.innerWidth < 768) {
    console.log('🎯 MOBILE NOTIFICATION: Rendering mobile notification');
    console.log('🎯 MOBILE NOTIFICATION: Screen width:', window.innerWidth);
    console.log('🎯 MOBILE NOTIFICATION: isMobile hook:', isMobile);

    // Force body to not scroll during modal
    useEffect(() => {
      const originalOverflow = document.body.style.overflow;
      const originalDocumentOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalDocumentOverflow;
      };
    }, []);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-5 z-[999999]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        onClick={handleClose}
      >
        <div
          className="bg-green-600 text-white p-8 rounded-2xl text-center max-w-sm w-full border-4 border-white shadow-2xl"
          style={{
            backgroundColor: isWin ? '#059669' : '#dc2626',
            color: 'white',
            padding: '32px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '350px',
            width: '100%',
            border: '4px solid white',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            {isWin ? '🎉 TRADE WON!' : '💔 TRADE LOST'}
          </div>

          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
            {isNaN(pnl) ? '0.00' : (pnl >= 0 ? '+' : '')}{isNaN(pnl) ? '0.00' : pnl.toFixed(2)} USDT
          </div>

          <div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>
            Direction: {trade.direction.toUpperCase()}
          </div>

          <div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.9 }}>
            Amount: {trade.amount} USDT
          </div>

          <div style={{ fontSize: '16px', marginBottom: '20px', opacity: 0.9 }}>
            Entry: {trade.entryPrice.toFixed(2)} → Final: {trade.finalPrice.toFixed(2)}
          </div>

          <button
            onClick={handleClose}
            style={{
              backgroundColor: 'white',
              color: isWin ? '#059669' : '#dc2626',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Mobile-specific modal design (old complex version - keeping as fallback)
  if (false) {
    console.log('🎯 TRADE NOTIFICATION: Rendering mobile modal, isVisible:', isVisible);
    console.log('🎯 TRADE NOTIFICATION: Trade data for mobile:', trade);

    // MOBILE FIX: Use portal-like approach to ensure modal appears
    useEffect(() => {
      if (isVisible) {
        // Temporarily disable body scroll to prevent conflicts
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }, [isVisible]);

    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999, // Increased z-index
          backgroundColor: isVisible ? 'rgba(0, 0, 0, 0.8)' : 'transparent' // Fallback background
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
          style={{
            backgroundColor: 'rgba(255, 0, 0, 0.3)' // MOBILE DEBUG: Red tint to make backdrop visible
          }}
        />

        {/* Modal */}
        <div
          className={`relative bg-gray-800 rounded-2xl p-6 w-full max-w-sm mx-auto transform transition-all duration-500 ${
            isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
          }`}
          style={{
            backgroundColor: '#1f2937',
            borderRadius: '1rem',
            padding: '1.5rem',
            width: '100%',
            maxWidth: '24rem',
            margin: '0 auto',
            position: 'relative',
            zIndex: 10000,
            border: '5px solid #00ff00', // MOBILE DEBUG: Bright green border
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)' // MOBILE DEBUG: Green glow
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-lg font-bold">BTC/USDT</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Profit/Loss Amount */}
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-2 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)} <span className="text-gray-400 text-lg">USDT</span>
            </div>
            <div className="text-gray-400 text-sm">Settlement completed</div>
          </div>

          {/* Trade Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Current price:</span>
              <span className="text-white font-medium">{trade.finalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time:</span>
              <span className="text-white font-medium">30s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Side:</span>
              <span className={`font-medium ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trade.direction === 'up' ? 'Buy Up' : 'Sell Down'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="text-white font-medium">{trade.amount.toFixed(0)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price:</span>
              <span className="text-white font-medium">{trade.entryPrice.toFixed(2)} USDT</span>
            </div>
          </div>

          {/* Settlement Note */}
          <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
            <p className="text-gray-300 text-xs leading-relaxed">
              The ultimate price for each option contract is determined by the system's settlement process.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-100 ${
                  isWin ? 'bg-green-400' : 'bg-red-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop notification (existing design)
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
}
