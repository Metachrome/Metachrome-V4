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

// ENHANCED GRADIENT NOTIFICATION SYSTEM - Works for all devices with beautiful gradients
const GradientTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  useEffect(() => {
    if (trade) {
      setProgress(100);

      // Progress bar countdown - 20 seconds (longer, stickier as requested)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / 200); // 20 seconds = 200 intervals of 100ms
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto close timer - 20 seconds (longer, stickier as requested)
      const timer = setTimeout(() => {
        handleClose();
      }, 20000);

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
    <div className={`trade-notification transition-all duration-700 transform ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    } sm:max-w-[420px] max-w-[95vw] sm:min-w-[380px]`}>
      <div className={`p-6 rounded-2xl shadow-2xl border-2 ${
        isWin
          ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50 shadow-emerald-500/40'
          : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50 shadow-red-500/40'
      } backdrop-blur-lg ring-4 ${
        isWin ? 'ring-emerald-400/30' : 'ring-red-400/30'
      } animate-pulse-subtle relative overflow-hidden ${
        isWin ? 'shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
      }`}>

        {/* Animated background overlay with shimmer */}
        <div className={`absolute inset-0 ${
          isWin
            ? 'bg-gradient-to-r from-emerald-500/10 via-green-400/5 to-teal-500/10'
            : 'bg-gradient-to-r from-red-500/10 via-rose-400/5 to-pink-500/10'
        } animate-gradient-shimmer`} />

        {/* Additional subtle pulse overlay */}
        <div className={`absolute inset-0 ${
          isWin
            ? 'bg-gradient-to-br from-emerald-400/5 to-transparent'
            : 'bg-gradient-to-br from-red-400/5 to-transparent'
        } animate-pulse`} />

        {/* Enhanced sparkle effects */}
        <div className="absolute top-2 right-2 text-2xl animate-enhanced-bounce">
          {isWin ? '✨' : '💥'}
        </div>
        <div className="absolute bottom-2 left-2 text-lg animate-float-sparkle">
          {isWin ? '🎯' : '⚡'}
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs opacity-30 animate-pulse">
          {isWin ? '🌟' : '💫'}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full ${
                isWin ? 'bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse' : 'bg-gradient-to-r from-red-400 to-rose-400 animate-pulse'
              } shadow-lg ${isWin ? 'shadow-emerald-400/60' : 'shadow-red-400/60'} ring-2 ${
                isWin ? 'ring-emerald-300/50' : 'ring-red-300/50'
              }`} />
              <span className="font-bold text-xl tracking-wide drop-shadow-lg">
                {isWin ? '🎉 TRADE WON!' : '💔 TRADE LOST'}
              </span>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                isWin ? 'bg-gradient-to-r from-emerald-400/30 to-green-400/30 text-emerald-200 border border-emerald-300/50' : 'bg-gradient-to-r from-red-400/30 to-rose-400/30 text-red-200 border border-red-300/50'
              } shadow-lg`}>
                {isWin ? 'PROFIT' : 'LOSS'}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-300 hover:text-white transition-all duration-300 bg-black/30 hover:bg-black/50 rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold shadow-lg hover:shadow-xl transform hover:scale-110"
              title="Close notification"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="relative z-10 space-y-3 text-sm">
          <div className={`flex justify-between items-center py-3 px-4 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-xl border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium">Direction:</span>
            <span className={`font-bold text-lg ${trade.direction === 'up' ? 'text-emerald-300' : 'text-red-300'} drop-shadow-lg`}>
              {trade.direction === 'up' ? '📈 UP' : '📉 DOWN'}
            </span>
          </div>

          <div className={`flex justify-between items-center py-3 px-4 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-xl border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium">Amount:</span>
            <span className="font-bold text-lg text-yellow-300 drop-shadow-lg">{trade.amount} USDT</span>
          </div>

          <div className={`flex justify-between items-center py-3 px-4 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-xl border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium">Entry Price:</span>
            <span className="font-mono text-lg text-blue-300 drop-shadow-lg">${trade.entryPrice.toFixed(2)}</span>
          </div>

          <div className={`flex justify-between items-center py-3 px-4 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-xl border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium">Final Price:</span>
            <span className="font-mono text-lg text-blue-300 drop-shadow-lg">${trade.finalPrice.toFixed(2)}</span>
          </div>

          <div className={`flex justify-between items-center py-3 px-4 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-xl border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium">Price Change:</span>
            <span className={`font-bold text-lg ${priceChange >= 0 ? 'text-emerald-300' : 'text-red-300'} drop-shadow-lg`}>
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
            </span>
          </div>

          <div className={`border-2 ${
            isWin ? 'border-emerald-400/60' : 'border-red-400/60'
          } rounded-2xl p-5 mt-4 ${
            isWin
              ? 'bg-gradient-to-br from-emerald-700/50 via-green-700/40 to-teal-700/50'
              : 'bg-gradient-to-br from-red-700/50 via-rose-700/40 to-pink-700/50'
          } shadow-xl backdrop-blur-md relative overflow-hidden`}>

            {/* Animated background sparkles */}
            <div className="absolute inset-0 opacity-20">
              <div className={`absolute top-1 left-1 w-2 h-2 ${isWin ? 'bg-emerald-300' : 'bg-red-300'} rounded-full animate-ping`} />
              <div className={`absolute top-3 right-2 w-1 h-1 ${isWin ? 'bg-green-400' : 'bg-rose-400'} rounded-full animate-pulse`} />
              <div className={`absolute bottom-2 left-3 w-1.5 h-1.5 ${isWin ? 'bg-teal-300' : 'bg-pink-400'} rounded-full animate-bounce`} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-center font-bold text-xl">
                <span className="text-gray-100 drop-shadow-lg">Final P&L:</span>
                <span className={`${isWin ? 'text-emerald-300' : 'text-red-300'} text-3xl font-black drop-shadow-lg bg-gradient-to-r ${
                  isWin ? 'from-emerald-300 to-green-300' : 'from-red-300 to-rose-300'
                } bg-clip-text text-transparent`}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USDT
                </span>
              </div>

              {isWin && (
                <div className="flex justify-between text-sm mt-3 pt-3 border-t border-emerald-400/40">
                  <span className="text-emerald-200 drop-shadow">Profit Rate:</span>
                  <span className="text-emerald-300 font-bold text-lg drop-shadow bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent">
                    {trade.profitPercentage}%
                  </span>
                </div>
              )}

              <div className="text-center mt-4">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-bold ${
                  isWin
                    ? 'bg-gradient-to-r from-emerald-400/30 to-green-400/30 text-emerald-200 border-2 border-emerald-300/50 shadow-lg shadow-emerald-400/30'
                    : 'bg-gradient-to-r from-red-400/30 to-rose-400/30 text-red-200 border-2 border-red-300/50 shadow-lg shadow-red-400/30'
                } backdrop-blur-sm`}>
                  {isWin ? '🎊 Congratulations! 🎊' : '😔 Better luck next time'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress bar for auto-close */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30 rounded-b-2xl overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              isWin
                ? 'bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 shadow-lg shadow-emerald-400/50'
                : 'bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 shadow-lg shadow-red-400/50'
            } animate-pulse`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress timer display */}
        <div className="absolute top-2 left-2 text-xs text-gray-300 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
          {Math.ceil(progress * 20 / 100)}s
        </div>
      </div>
    </div>
  );
};

// MAIN TRADE NOTIFICATION COMPONENT - Beautiful gradient notification for all devices
export default function TradeNotification({ trade, onClose }: TradeNotificationProps) {
  // Always use the beautiful gradient notification for all devices
  return <GradientTradeNotification trade={trade} onClose={onClose} />;
}





