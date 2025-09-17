import React, { useEffect, useState, useRef } from 'react';

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
  }, [trade, onClose]);

  if (!trade) return null;

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
}
