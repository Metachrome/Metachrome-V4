import { useEffect, useState } from 'react';
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
    symbol?: string;
    duration?: number;
  } | null;
  onClose: () => void;
}

// MOBILE NOTIFICATION COMPONENT - Simplified for testing
const MobileTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  if (!trade) return null;

  const isWin = trade.status === 'won';
  // CRITICAL FIX: Loss should be percentage-based, not full amount
  const pnl = isWin ?
    (trade.amount * trade.profitPercentage / 100) :
    -(trade.amount * trade.profitPercentage / 100);

  console.log('🔔 MOBILE NOTIFICATION: Rendering mobile notification', { trade, isWin, pnl });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div
        style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '280px',
          width: '100%',
          border: '1px solid #4b5563',
          color: 'white'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{trade.symbol || 'BTC/USDT'}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* P&L Display */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: isWin ? '#10b981' : '#ef4444',
            marginBottom: '4px'
          }}>
            {isWin ? '+' : ''}{pnl.toFixed(0)} <span style={{ fontSize: '14px', color: '#9ca3af' }}>USDT</span>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Settlement completed
          </div>
        </div>

        {/* Trade Details */}
        <div style={{ fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Market:</span>
            <span>{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Trade:</span>
            <span style={{ color: trade.direction === 'up' ? '#10b981' : '#ef4444' }}>
              {trade.direction === 'up' ? 'BUY' : 'SELL'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Amount:</span>
            <span>{trade.amount.toLocaleString()} USDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Entry Price:</span>
            <span>{trade.entryPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Closed Price:</span>
            <span>{trade.finalPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Duration:</span>
            <span>{trade.duration || 30} seconds</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Profit:</span>
            <span style={{ color: isWin ? '#10b981' : '#ef4444' }}>
              {isWin ? `+${pnl.toFixed(0)}` : pnl.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>
          Pay out nya di hilangkan aja.
        </div>
      </div>
    </div>
  );
};

          {/* Header */}
          <div className="flex items-center justify-between p-3 pb-2">
            <h3 className="text-white font-bold text-base">{trade.symbol || 'BTC/USDT'}</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center text-lg font-light"
            >
              ×
            </button>
          </div>

          {/* Main Content */}
          <div className="px-3 pb-3 space-y-3">
            {/* P&L Display */}
            <div className="text-center py-1">
              <div className={`text-2xl font-bold mb-1 ${
                isWin ? 'text-green-400' : 'text-red-400'
              }`}>
                {isWin ? '+' : ''}{pnl.toFixed(0)} <span className="text-gray-400 text-sm font-normal">USDT</span>
              </div>
              <div className="text-gray-400 text-xs">
                Settlement completed
              </div>
            </div>

            {/* Trade Details */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Market :</span>
                <span className="text-white font-medium text-xs">{trade.symbol || 'BTC/USDT'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Trade :</span>
                <span className={`font-medium text-xs ${
                  trade.direction === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {trade.direction === 'up' ? 'BUY' : 'SELL'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Amount :</span>
                <span className="text-white font-medium text-xs">{trade.amount.toLocaleString()} USDT</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Entry Price:</span>
                <span className="text-white font-medium text-xs">{trade.entryPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Closed Price:</span>
                <span className="text-white font-medium text-xs">{trade.finalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Duration :</span>
                <span className="text-white font-medium text-xs">{trade.duration || 30} seconds</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Profit :</span>
                <span className={isWin ? 'font-medium text-xs text-green-400' : 'font-medium text-xs text-red-400'}>
                  {isWin ? '+' + pnl.toFixed(0) : pnl.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Footer Text */}
            <div className="text-gray-400 text-[10px] leading-tight pt-1">
              Pay out nya di hilangkan aja.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// DESKTOP GRADIENT NOTIFICATION SYSTEM - Beautiful gradient notification for desktop
const DesktopTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow animation to complete
  };

  useEffect(() => {
    if (trade) {
      console.log('🔔 DESKTOP NOTIFICATION: Trade received:', trade);
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
        console.log('🔔 DESKTOP NOTIFICATION: Auto-closing after 20s');
        handleClose();
      }, 20000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [trade]);

  console.log('🔔 DESKTOP NOTIFICATION: Render check - trade:', !!trade, 'isVisible:', isVisible);

  if (!trade || !isVisible) {
    console.log('🔔 DESKTOP NOTIFICATION: Not rendering - trade:', !!trade, 'isVisible:', isVisible);
    return null;
  }

  const isWin = trade.status === 'won';
  // CRITICAL FIX: Loss should be percentage-based, not full amount
  const pnl = isWin ? (trade.payout! - trade.amount) : -(trade.amount * trade.profitPercentage / 100);
  const priceChange = trade.finalPrice - trade.entryPrice;

  return (
    <div className={`trade-notification transition-all duration-700 transform ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    } sm:max-w-[320px] max-w-[90vw] sm:min-w-[300px]`}>
      <div className={`p-4 rounded-xl shadow-xl border ${
        isWin
          ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50 shadow-emerald-500/40'
          : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50 shadow-red-500/40'
      } backdrop-blur-lg ring-2 ${
        isWin ? 'ring-emerald-400/30' : 'ring-red-400/30'
      } animate-pulse-subtle relative overflow-hidden ${
        isWin ? 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
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

        {/* Enhanced sparkle effects - Emojis removed */}
        <div className="absolute top-2 right-2 text-2xl animate-enhanced-bounce">
          {/* Sparkle effects removed */}
        </div>
        <div className="absolute bottom-2 left-2 text-lg animate-float-sparkle">
          {/* Sparkle effects removed */}
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs opacity-30 animate-pulse">
          {/* Sparkle effects removed */}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${
                isWin ? 'bg-gradient-to-r from-emerald-400 to-green-400 animate-pulse' : 'bg-gradient-to-r from-red-400 to-rose-400 animate-pulse'
              } shadow-lg ${isWin ? 'shadow-emerald-400/60' : 'shadow-red-400/60'} ring-1 ${
                isWin ? 'ring-emerald-300/50' : 'ring-red-300/50'
              }`} />
              <span className="font-bold text-lg tracking-wide drop-shadow-lg">
                {isWin ? 'TRADE WON!' : 'TRADE LOST'}
              </span>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isWin ? 'bg-gradient-to-r from-emerald-400/30 to-green-400/30 text-emerald-200 border border-emerald-300/50' : 'bg-gradient-to-r from-red-400/30 to-rose-400/30 text-red-200 border border-red-300/50'
              } shadow-lg`}>
                {isWin ? 'PROFIT' : 'LOSS'}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-300 hover:text-white transition-all duration-300 bg-black/30 hover:bg-black/50 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg hover:shadow-xl transform hover:scale-110"
              title="Close notification"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="relative z-10 space-y-1.5 text-xs">
          <div className={`flex justify-between items-center py-2 px-3 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-lg border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium text-xs">Market:</span>
            <span className="font-bold text-sm text-blue-300 drop-shadow-lg">{trade.symbol || 'BTC/USDT'}</span>
          </div>

          <div className={`flex justify-between items-center py-2 px-3 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-lg border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium text-xs">Trade:</span>
            <span className={`font-bold text-sm ${trade.direction === 'up' ? 'text-emerald-300' : 'text-red-300'} drop-shadow-lg`}>
              {trade.direction === 'up' ? 'BUY' : 'SELL'}
            </span>
          </div>

          <div className={`flex justify-between items-center py-2 px-3 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-lg border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium text-xs">Amount:</span>
            <span className="font-bold text-sm text-yellow-300 drop-shadow-lg">{trade.amount.toLocaleString()} USDT</span>
          </div>

          <div className={`flex justify-between items-center py-2 px-3 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-lg border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium text-xs">Entry Price:</span>
            <span className="font-mono text-sm text-blue-300 drop-shadow-lg">{trade.entryPrice.toFixed(2)}</span>
          </div>

          <div className={`flex justify-between items-center py-2 px-3 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-lg border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium text-xs">Closed Price:</span>
            <span className="font-mono text-sm text-blue-300 drop-shadow-lg">{trade.finalPrice.toFixed(2)}</span>
          </div>

          <div className={`flex justify-between items-center py-2 px-3 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-lg border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium text-xs">Duration:</span>
            <span className="font-bold text-sm text-purple-300 drop-shadow-lg">{trade.duration || 30} seconds</span>
          </div>

          <div className={`flex justify-between items-center py-2 px-3 ${
            isWin ? 'bg-gradient-to-r from-emerald-800/40 to-green-800/40' : 'bg-gradient-to-r from-red-800/40 to-rose-800/40'
          } rounded-lg border ${
            isWin ? 'border-emerald-600/30' : 'border-red-600/30'
          } shadow-lg backdrop-blur-sm`}>
            <span className="text-gray-200 font-medium text-xs">Profit:</span>
            <span className={`font-bold text-sm ${isWin ? 'text-emerald-300' : 'text-red-300'} drop-shadow-lg`}>
              {isWin ? `+${pnl.toFixed(0)}` : pnl.toFixed(0)} USDT
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
                  {isWin ? 'Congratulations!' : 'Better luck next time'}
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

// MAIN TRADE NOTIFICATION COMPONENT - Switches between mobile and desktop notifications
export default function TradeNotification({ trade, onClose }: TradeNotificationProps) {
  const isMobile = useIsMobile();

  // FORCE REAL-TIME MOBILE DETECTION - Don't rely on hook alone
  const [currentWidth, setCurrentWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setCurrentWidth(newWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize(); // Set initial value
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // MULTIPLE MOBILE DETECTION METHODS
  const hookMobile = isMobile;
  const widthMobile = currentWidth < 768;
  const forceMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const userAgentMobile = typeof navigator !== 'undefined' &&
    (navigator.userAgent.toLowerCase().includes('android') ||
     navigator.userAgent.toLowerCase().includes('iphone') ||
     navigator.userAgent.toLowerCase().includes('ipad') ||
     navigator.userAgent.toLowerCase().includes('mobile'));

  // Use ANY mobile detection method
  const shouldUseMobile = hookMobile || widthMobile || forceMobile || userAgentMobile;

  console.log('🔔 TRADE NOTIFICATION: Detection results:', {
    hookMobile,
    widthMobile,
    forceMobile,
    userAgentMobile,
    shouldUseMobile,
    currentWidth,
    trade: !!trade
  });

  // TEMPORARY: Force mobile notification for testing
  // Remove this line after testing
  const forceMobileForTesting = currentWidth < 1024; // Test with larger breakpoint

  // Use mobile notification for mobile devices, desktop notification for desktop
  if (shouldUseMobile || forceMobileForTesting) {
    console.log('🔔 TRADE NOTIFICATION: Using MOBILE notification (shouldUseMobile:', shouldUseMobile, 'forceMobileForTesting:', forceMobileForTesting, ')');
    return <MobileTradeNotification trade={trade} onClose={onClose} />;
  }

  console.log('🔔 TRADE NOTIFICATION: Using DESKTOP notification');
  return <DesktopTradeNotification trade={trade} onClose={onClose} />;
}

