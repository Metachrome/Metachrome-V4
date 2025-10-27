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

// MOBILE NOTIFICATION COMPONENT
const MobileTradeNotification = ({ trade, onClose }: TradeNotificationProps) => {
  if (!trade) return null;

  const isWin = trade.status === 'won';
  // CRITICAL FIX: Loss should be percentage-based, not full amount
  const pnl = isWin ?
    (trade.amount * trade.profitPercentage / 100) :
    -(trade.amount * trade.profitPercentage / 100);

  console.log('Mobile notification rendering:', { trade, isWin, pnl });

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
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

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
              {isWin ? '+' + pnl.toFixed(0) : pnl.toFixed(0)}
            </span>
          </div>
        </div>

        <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '8px' }}>
          Pay out nya di hilangkan aja.
        </div>
      </div>
    </div>
  );
};

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
  // CRITICAL FIX: Loss should be percentage-based, not full amount
  const pnl = isWin ? (trade.payout! - trade.amount) : -(trade.amount * trade.profitPercentage / 100);

  return (
    <div className="trade-notification fixed top-4 right-4 z-50 max-w-[320px] min-w-[300px]">
      <div className={`p-4 rounded-xl shadow-xl border ${
        isWin
          ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50'
          : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg">
            {isWin ? 'TRADE WON!' : 'TRADE LOST'}
          </span>
          <button
            onClick={handleClose}
            className="text-gray-300 hover:text-white w-7 h-7 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Market:</span>
            <span className="font-bold text-sm">{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Trade:</span>
            <span className="font-bold text-sm">
              {trade.direction === 'up' ? 'BUY' : 'SELL'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Amount:</span>
            <span className="font-bold text-sm">{trade.amount.toLocaleString()} USDT</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Entry Price:</span>
            <span className="font-mono text-sm">{trade.entryPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Closed Price:</span>
            <span className="font-mono text-sm">{trade.finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Duration:</span>
            <span className="font-bold text-sm">{trade.duration || 30} seconds</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 bg-gray-800/40 rounded-lg">
            <span className="text-gray-200">Profit:</span>
            <span className={`font-bold text-sm ${isWin ? 'text-emerald-300' : 'text-red-300'}`}>
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

  const hookMobile = isMobile;
  const widthMobile = currentWidth < 768;
  const forceMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const userAgentMobile = typeof navigator !== 'undefined' &&
    (navigator.userAgent.toLowerCase().includes('android') ||
     navigator.userAgent.toLowerCase().includes('iphone') ||
     navigator.userAgent.toLowerCase().includes('ipad') ||
     navigator.userAgent.toLowerCase().includes('mobile'));

  const shouldUseMobile = hookMobile || widthMobile || forceMobile || userAgentMobile;
  const forceMobileForTesting = currentWidth < 1024;

  console.log('Trade notification detection:', {
    hookMobile,
    widthMobile,
    forceMobile,
    userAgentMobile,
    shouldUseMobile,
    forceMobileForTesting,
    currentWidth,
    trade: !!trade
  });

  if (shouldUseMobile || forceMobileForTesting) {
    console.log('Using MOBILE notification');
    return <MobileTradeNotification trade={trade} onClose={onClose} />;
  }

  console.log('Using DESKTOP notification');
  return <DesktopTradeNotification trade={trade} onClose={onClose} />;
}
