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
    // Remove native overlay if it exists
    const nativeOverlay = document.getElementById('native-trade-notification');
    if (nativeOverlay) {
      nativeOverlay.remove();
    }
    setTimeout(() => onClose(), 300);
  };

  // Native HTML overlay function for mobile
  const createNativeOverlay = (tradeData: any) => {
    console.log('🎯 NATIVE OVERLAY: Creating native HTML overlay for mobile');

    // Remove any existing overlay
    const existing = document.getElementById('native-trade-notification');
    if (existing) {
      existing.remove();
    }

    const isWin = tradeData.status === 'won';
    let pnl = 0;
    if (isWin) {
      pnl = tradeData.payout ? tradeData.payout - tradeData.amount : tradeData.amount * (tradeData.profitPercentage / 100);
    } else {
      pnl = -tradeData.amount;
    }

    const overlay = document.createElement('div');
    overlay.id = 'native-trade-notification';
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      background-color: rgba(0, 0, 0, 0.95) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 20px !important;
      font-family: Arial, sans-serif !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      box-sizing: border-box !important;
    `;

    overlay.innerHTML = `
      <div style="
        background-color: #1f2937 !important;
        border-radius: 16px !important;
        padding: 24px !important;
        width: 100% !important;
        max-width: 400px !important;
        border: 3px solid ${isWin ? '#10b981' : '#ef4444'} !important;
        box-shadow: 0 0 30px ${isWin ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'} !important;
        color: white !important;
        text-align: center !important;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; margin: 0; color: white;">BTC/USDT</h2>
          <button onclick="document.getElementById('native-trade-notification').remove()" style="
            background: none;
            border: none;
            color: #9ca3af;
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
            width: 32px;
            height: 32px;
          ">✕</button>
        </div>

        <div style="margin-bottom: 24px;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 12px; color: ${isWin ? '#10b981' : '#ef4444'};">
            ${isWin ? '🎉 TRADE WON!' : '💔 TRADE LOST'}
          </div>
          <div style="font-size: 36px; font-weight: bold; margin-bottom: 12px; color: ${isWin ? '#10b981' : '#ef4444'};">
            ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} <span style="color: #9ca3af; font-size: 18px;">USDT</span>
          </div>
          <div style="color: #9ca3af; font-size: 14px;">Settlement completed</div>
        </div>

        <div style="margin-bottom: 24px; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
            <span style="color: #9ca3af;">Amount:</span>
            <span style="color: white; font-weight: 500;">${tradeData.amount} USDT</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
            <span style="color: #9ca3af;">Side:</span>
            <span style="color: ${tradeData.direction === 'up' ? '#10b981' : '#ef4444'}; font-weight: 500;">
              ${tradeData.direction === 'up' ? 'Buy Up' : 'Sell Down'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
            <span style="color: #9ca3af;">Entry Price:</span>
            <span style="color: white; font-weight: 500;">${tradeData.entryPrice.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px;">
            <span style="color: #9ca3af;">Final Price:</span>
            <span style="color: white; font-weight: 500;">${tradeData.finalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div style="padding: 12px; background-color: rgba(55, 65, 81, 0.5); border-radius: 8px; margin-bottom: 16px;">
          <p style="color: #d1d5db; font-size: 12px; line-height: 1.5; margin: 0;">
            The ultimate price for each option contract is determined by the system's settlement process.
          </p>
        </div>

        <button onclick="document.getElementById('native-trade-notification').remove()" style="
          background-color: ${isWin ? '#10b981' : '#ef4444'};
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
        ">Close</button>
      </div>
    `;

    // Add click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });

    document.body.appendChild(overlay);
    console.log('🎯 NATIVE OVERLAY: Added to DOM');

    // Auto-remove after 45 seconds
    setTimeout(() => {
      if (document.getElementById('native-trade-notification')) {
        overlay.remove();
        console.log('🎯 NATIVE OVERLAY: Auto-removed after 45 seconds');
      }
    }, 45000);
  };

  // Debug function accessible from console
  useEffect(() => {
    (window as any).debugTradeNotification = (mockTrade = null) => {
      const testTrade = mockTrade || {
        id: 'debug-' + Date.now(),
        direction: 'up',
        amount: 100,
        entryPrice: 45000,
        currentPrice: 45750,
        status: 'won',
        payout: 115,
        profitPercentage: 15
      };
      console.log('🔧 DEBUG: Forcing trade notification with:', testTrade);
      setIsVisible(true);
      setProgress(100);
      createNativeOverlay(testTrade);
    };
    console.log('🔧 DEBUG: debugTradeNotification() function available in console');
  }, []);

  useEffect(() => {
    console.log('🎯 NOTIFICATION EFFECT: Running with trade:', trade);

    if (trade) {
      console.log('🎯 REAL TRADE NOTIFICATION: Showing notification for trade:', trade);
      console.log('🎯 REAL TRADE NOTIFICATION: Window dimensions:', window.innerWidth, 'x', window.innerHeight);
      console.log('🎯 REAL TRADE NOTIFICATION: Is mobile:', window.innerWidth <= 768);

      // FORCE SHOW NOTIFICATION - ALWAYS VISIBLE
      console.log('🎯 FORCE SHOW: Making notification visible immediately');
      setIsVisible(true);
      setProgress(100);

      // MOBILE FIX: Only create native overlay for mobile devices to avoid conflicts
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        console.log('📱 CREATING NATIVE OVERLAY: For mobile devices only');
        createNativeOverlay(trade);
      } else {
        console.log('🖥️ DESKTOP: Using React component only');
      }

      // Add debug info to window
      if (typeof window !== 'undefined') {
        (window as any).currentTradeNotification = trade;
        (window as any).debugMobileNotification = () => {
          console.log('🔍 MOBILE NOTIFICATION DEBUG:');
          console.log('- Trade:', trade);
          console.log('- isVisible:', isVisible);
          console.log('- Window size:', window.innerWidth, 'x', window.innerHeight);
          console.log('- Native overlay:', document.getElementById('native-trade-notification') !== null);
          console.log('- React notification elements:', document.querySelectorAll('[data-mobile-notification]').length);
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
    } else {
      console.log('🎯 NOTIFICATION EFFECT: No trade, setting isVisible to false');
      setIsVisible(false);
    }
  }, [trade]);

  if (!trade) {
    console.log('🎯 TRADE NOTIFICATION: No trade data, not rendering');
    return null;
  }

  console.log('🎯 TRADE NOTIFICATION: About to render with isVisible:', isVisible);

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

  // FORCE RENDER: Always render when trade exists
  console.log('🎯 FORCE NOTIFICATION: Rendering notification');
  console.log('🎯 FORCE NOTIFICATION: Screen width:', window.innerWidth);
  console.log('🎯 FORCE NOTIFICATION: isVisible:', isVisible);
  console.log('🎯 FORCE NOTIFICATION: trade data:', trade);

  // ALWAYS RENDER IF TRADE EXISTS - IGNORE isVisible
  if (!trade) {
    console.log('🎯 NO TRADE: Not rendering notification');
    return null;
  }

  console.log('🎯 RENDERING: Trade notification with data:', trade);

  // Render directly without portal for maximum compatibility
  return (
    <div
      data-mobile-notification="true"
      style={{
        position: 'fixed',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647, // Maximum possible z-index
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto',
        // Mobile-specific fixes
        transform: 'translateZ(0)', // Force hardware acceleration
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        // Ensure it's above everything
        isolation: 'isolate'
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
    </div>
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
