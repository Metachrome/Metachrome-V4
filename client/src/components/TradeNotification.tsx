import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

  const handleClose = () => {
    console.log('🎯 MOBILE NOTIFICATION: Closing notification');
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  useEffect(() => {
    if (trade) {
      console.log('🎯 MOBILE NOTIFICATION: Showing notification for trade:', trade);
      console.log('🎯 MOBILE NOTIFICATION: Window dimensions:', window.innerWidth, 'x', window.innerHeight);
      console.log('🎯 MOBILE NOTIFICATION: Is mobile:', window.innerWidth <= 768);

      // Show notification immediately
      setIsVisible(true);
      setProgress(100);

      // Add debug info to window
      if (typeof window !== 'undefined') {
        (window as any).currentTradeNotification = trade;
        (window as any).debugMobileNotification = () => {
          console.log('🔍 MOBILE NOTIFICATION DEBUG:');
          console.log('- Trade:', trade);
          console.log('- isVisible:', isVisible);
          console.log('- Window size:', window.innerWidth, 'x', window.innerHeight);
          console.log('- Notification visible:', document.querySelector('[data-mobile-notification]') !== null);
        };
      }

      // Auto-close after 45 seconds
      const timer = setTimeout(() => {
        console.log('🎯 MOBILE NOTIFICATION: Auto-closing after 45 seconds');
        handleClose();
      }, 45000);

      // Progress countdown
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / 450); // 45 seconds
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [trade]);

  if (!trade) {
    console.log('🎯 TRADE NOTIFICATION: No trade data, not rendering');
    return null;
  }

  const isWin = trade.status === 'won';

  // Calculate PnL properly
  let pnl = 0;
  if (isWin) {
    if (trade.payout && !isNaN(trade.payout)) {
      pnl = trade.payout - trade.amount;
    } else {
      const profitAmount = trade.amount * (trade.profitPercentage / 100);
      pnl = profitAmount;
    }
  } else {
    pnl = -trade.amount;
  }

  // MOBILE-FIRST NOTIFICATION: Simple, guaranteed to work
  console.log('🎯 MOBILE NOTIFICATION: Rendering mobile-first notification');
  console.log('🎯 MOBILE NOTIFICATION: Screen width:', window.innerWidth);
  console.log('🎯 MOBILE NOTIFICATION: isVisible:', isVisible);

  if (!isVisible) {
    return null;
  }

  return createPortal(
    <div
      data-mobile-notification="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={handleClose}
    >
      {/* Simple Mobile Modal */}
      <div
        style={{
          backgroundColor: '#1f2937',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          border: `3px solid ${isWin ? '#10b981' : '#ef4444'}`,
          boxShadow: `0 0 30px ${isWin ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
          color: 'white',
          textAlign: 'center' as const
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>BTC/USDT</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Status */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: isWin ? '#10b981' : '#ef4444'
          }}>
            {isWin ? '🎉 TRADE WON!' : '💔 TRADE LOST'}
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '12px',
            color: isWin ? '#10b981' : '#ef4444'
          }}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} <span style={{ color: '#9ca3af', fontSize: '18px' }}>USDT</span>
          </div>
          <div style={{ color: '#9ca3af', fontSize: '14px' }}>Settlement completed</div>
        </div>

        {/* Trade Details */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: '#9ca3af' }}>Current price:</span>
            <span style={{ color: 'white', fontWeight: '500' }}>{trade.finalPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: '#9ca3af' }}>Time:</span>
            <span style={{ color: 'white', fontWeight: '500' }}>30s</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: '#9ca3af' }}>Side:</span>
            <span style={{
              color: trade.direction === 'up' ? '#10b981' : '#ef4444',
              fontWeight: '500'
            }}>
              {trade.direction === 'up' ? 'Buy Up' : 'Sell Down'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: '#9ca3af' }}>Amount:</span>
            <span style={{ color: 'white', fontWeight: '500' }}>{trade.amount} USDT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
            <span style={{ color: '#9ca3af' }}>Price:</span>
            <span style={{ color: 'white', fontWeight: '500' }}>{trade.entryPrice.toFixed(2)} USDT</span>
          </div>
        </div>

        {/* Settlement Note */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: 'rgba(55, 65, 81, 0.5)',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <p style={{
            color: '#d1d5db',
            fontSize: '12px',
            lineHeight: '1.5',
            margin: 0
          }}>
            The ultimate price for each option contract is determined by the system's settlement process.
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '4px'
          }}>
            <span>Auto-close</span>
            <span>{Math.ceil(progress / 100 * 45)}s</span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#374151',
            borderRadius: '9999px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div
              style={{
                height: '100%',
                backgroundColor: isWin ? '#10b981' : '#ef4444',
                width: `${progress}%`,
                transition: 'width 0.1s ease-linear'
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Add global debugging function for testing
if (typeof window !== 'undefined') {
  (window as any).debugTradeNotification = () => {
    console.log('🔍 TRADE NOTIFICATION DEBUG:');
    console.log('- Window width:', window.innerWidth);
    console.log('- User agent:', navigator.userAgent);
    console.log('- Current trade:', (window as any).currentTradeNotification);
    console.log('- Document body children:', document.body.children.length);
    console.log('- Portals in body:', Array.from(document.body.children).filter(el => el.className?.includes('fixed')).length);
  };
}
