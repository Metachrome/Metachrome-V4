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
      setIsVisible(true);
      setProgress(100);

      // Progress bar countdown
      timersRef.current.progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / 80); // 8 seconds = 80 intervals of 100ms
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto close timer
      timersRef.current.timer = setTimeout(() => {
        handleClose();
      }, 8000); // 8 seconds for better readability

      return () => {
        if (timersRef.current.timer) clearTimeout(timersRef.current.timer);
        if (timersRef.current.progressInterval) clearInterval(timersRef.current.progressInterval);
      };
    }
  }, [trade, onClose]);

  if (!trade) return null;

  const isWin = trade.status === 'won';
  const pnl = isWin ? (trade.payout! - trade.amount) : -trade.amount;
  const priceChange = trade.finalPrice - trade.entryPrice;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`p-4 rounded-lg shadow-lg border-l-4 ${
        isWin 
          ? 'bg-green-900/90 border-green-400 text-green-100' 
          : 'bg-red-900/90 border-red-400 text-red-100'
      } backdrop-blur-sm min-w-[300px]`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isWin ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-bold text-lg">
              {isWin ? '🎉 Trade Won!' : '💔 Trade Lost'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white transition-colors bg-black/20 hover:bg-black/40 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
            title="Close notification"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Direction:</span>
            <span className={`font-bold ${trade.direction === 'up' ? 'text-green-300' : 'text-red-300'}`}>
              {trade.direction.toUpperCase()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-bold">{trade.amount} USDT</span>
          </div>
          
          <div className="flex justify-between">
            <span>Entry Price:</span>
            <span>${trade.entryPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Final Price:</span>
            <span>${trade.finalPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Price Change:</span>
            <span className={priceChange >= 0 ? 'text-green-300' : 'text-red-300'}>
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
            </span>
          </div>
          
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="flex justify-between font-bold text-base">
              <span>P&L:</span>
              <span className={isWin ? 'text-green-300' : 'text-red-300'}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
              </span>
            </div>
            
            {isWin && (
              <div className="flex justify-between text-xs mt-1">
                <span>Profit Rate:</span>
                <span className="text-green-300">{trade.profitPercentage}%</span>
              </div>
            )}
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
