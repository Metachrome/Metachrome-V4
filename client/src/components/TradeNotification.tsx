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
  const pnl = isWin ? 
    (trade.amount * trade.profitPercentage / 100) : 
    -trade.amount;

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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#1a1b3a',
          borderRadius: '16px',
          padding: '20px',
          maxWidth: '320px',
          width: '100%',
          border: isWin ? '2px solid #10b981' : '2px solid #ef4444',
          color: 'white',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header with Trade Result */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: isWin ? '#10b981' : '#ef4444',
            marginBottom: '8px'
          }}>
            {isWin ? 'Trade Won!' : 'Trade Lost!'}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Market: {trade.symbol || 'BTC/USDT'}
          </div>
        </div>

        {/* Trade Details - Exact format from image */}
        <div style={{
          backgroundColor: '#2a2d47',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          border: '1px solid #3a3d5a',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Market :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.symbol || 'BTC/USDT'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Trade :</span>
            <span style={{
              color: trade.direction === 'up' ? '#10b981' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {trade.direction === 'up' ? 'BUY' : 'SELL'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Amount :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.amount.toLocaleString()} USDT (bukan pakai $)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Entry Price :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Closed Price :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>Duration :</span>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{trade.duration || 30} seconds</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af' }}>Profit :</span>
            <span style={{
              color: isWin ? '#10b981' : '#ef4444',
              fontWeight: 'bold'
            }}>
              {isWin ? '+' : ''}{pnl.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Note about payout */}
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginBottom: '16px',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Pay out nya di hilangkan aja.
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
            }}
          >
            Close Notification
          </button>
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '8px',
            textAlign: 'center'
          }}>
            Click anywhere outside to close
          </div>
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
  const pnl = isWin ? (trade.payout! - trade.amount) : -trade.amount;

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
