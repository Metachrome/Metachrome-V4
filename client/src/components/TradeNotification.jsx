import React, { useEffect, useState, useCallback } from 'react';
// Helper function to format symbol with slash (e.g., XLMUSDT -> XLM/USDT)
function formatSymbol(symbol) {
    console.log('📊 formatSymbol called with:', {
        symbol: symbol,
        symbolType: typeof symbol,
        symbolLength: symbol === null || symbol === void 0 ? void 0 : symbol.length,
        symbolIsUndefined: symbol === undefined,
        symbolIsNull: symbol === null,
        symbolIsEmpty: symbol === ''
    });
    if (!symbol) {
        console.log('📊 formatSymbol: No symbol provided, returning BTC/USDT');
        return 'BTC/USDT';
    }
    // If symbol already has a slash, return as-is
    if (symbol.includes('/')) {
        console.log('📊 formatSymbol: Symbol already has slash, returning as-is:', symbol);
        return symbol;
    }
    // If symbol ends with USDT, insert slash before USDT
    if (symbol.endsWith('USDT')) {
        var formatted = symbol.slice(0, -4) + '/USDT';
        console.log('📊 formatSymbol: Formatted symbol:', symbol, '->', formatted);
        return formatted;
    }
    console.log('📊 formatSymbol: Symbol does not end with USDT, returning as-is:', symbol);
    return symbol;
}
// Note: Mobile notification logic is now handled in the main component's useEffect
// UNIVERSAL NOTIFICATION COMPONENT (Works for both Desktop and Mobile)
var UniversalTradeNotification = function (_a) {
    var trade = _a.trade, onClose = _a.onClose;
    var _b = useState(false), isVisible = _b[0], setIsVisible = _b[1];
    var _c = useState(function () { return window.innerWidth < 768; }), isMobile = _c[0], setIsMobile = _c[1];
    var handleClose = useCallback(function () {
        setIsVisible(false);
        setTimeout(onClose, 300);
    }, [onClose]);
    // Handle window resize for responsive behavior
    useEffect(function () {
        var handleResize = function () {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    // CRITICAL FIX: Reset visibility when trade changes
    useEffect(function () {
        if (trade) {
            setIsVisible(true);
            var timer_1 = setTimeout(handleClose, 25000); // Increased to 25 seconds for better UX
            return function () { return clearTimeout(timer_1); };
        }
    }, [trade === null || trade === void 0 ? void 0 : trade.id, handleClose]);
    if (!trade || !isVisible)
        return null;
    var isWin = trade.status === 'won';
    // CRITICAL FIX: Use profit field from WebSocket if available (accurate P&L), otherwise calculate from payout
    // For LOSE trades: Use profitPercentage to calculate loss, not full amount
    var pnl = 0;
    if (trade.profit !== undefined && trade.profit !== null) {
        // Use profit from WebSocket (most accurate)
        pnl = trade.profit;
        console.log('✅ NOTIFICATION: Using profit from WebSocket:', pnl);
    }
    else if (isWin) {
        // Win: payout - amount
        pnl = trade.payout - trade.amount;
        console.log('✅ NOTIFICATION: Calculating win profit:', pnl, '=', trade.payout, '-', trade.amount);
    }
    else {
        // CRITICAL FIX: Loss should be percentage-based, not full amount
        // Loss percentage = profitPercentage (10% for 30s, 15% for 60s)
        var lossPercentage = (trade.profitPercentage || 15) / 100;
        pnl = -(trade.amount * lossPercentage);
        console.log('✅ NOTIFICATION: Calculating loss profit:', pnl, '= -(', trade.amount, '*', lossPercentage, ')');
    }
    // Debug log for mobile
    console.log('NOTIFICATION RENDER:', {
        tradeId: trade.id,
        isMobile: isMobile,
        screenWidth: window.innerWidth,
        isVisible: isVisible,
        position: isMobile ? 'centered' : 'top-right',
        // CRITICAL DEBUG: Log profit calculation
        tradeProfit: trade.profit,
        tradeAmount: trade.amount,
        tradePayout: trade.payout,
        tradeProfilePercentage: trade.profitPercentage,
        calculatedPnl: pnl,
        isWin: isWin
    });
    return (<>
      {/* Backdrop blur overlay for mobile */}
      {isMobile && (<div className="fixed inset-0 transition-opacity duration-300" style={{
                zIndex: 2147483646,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none'
            }} onClick={handleClose}/>)}

      {/* Notification card */}
      <div className="trade-notification fixed transition-all duration-300" style={{
            zIndex: 2147483647, // Maximum z-index
            top: isMobile ? '50%' : '20px',
            left: isMobile ? '50%' : 'auto',
            right: isMobile ? 'auto' : '20px',
            transform: isMobile ? 'translate(-50%, -50%)' : 'none',
            width: isMobile ? '80vw' : 'auto',
            maxWidth: isMobile ? '340px' : '320px',
            minWidth: isMobile ? '280px' : '280px',
            opacity: isVisible ? 1 : 0,
            scale: isVisible ? 1 : 0.95,
            pointerEvents: 'auto'
        }}>
        <div className={"rounded-xl shadow-2xl border-2 ".concat(isWin
            ? 'bg-gradient-to-br from-emerald-900/95 via-green-800/95 to-teal-900/95 border-emerald-400 text-emerald-50'
            : 'bg-gradient-to-br from-red-900/95 via-rose-800/95 to-pink-900/95 border-red-400 text-red-50')} style={{
            padding: isMobile ? '18px' : '20px'
        }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold" style={{
            fontSize: isMobile ? '18px' : '18px'
        }}>
              {isWin ? 'TRADE WON!' : 'TRADE LOST'}
            </span>
            <button onClick={handleClose} className="text-gray-300 hover:text-white flex items-center justify-center font-bold rounded-full bg-black/20 hover:bg-black/40 transition-colors" style={{
            width: isMobile ? '28px' : '28px',
            height: isMobile ? '28px' : '28px',
            fontSize: isMobile ? '14px' : '14px'
        }}>
              ×
            </button>
          </div>

          <div className="space-y-2 notranslate" style={{
            fontSize: isMobile ? '14px' : '14px'
        }}>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg" style={{
            padding: isMobile ? '10px 12px' : '10px 12px'
        }}>
              <span className="text-gray-200">Market:</span>
              <span className="font-bold notranslate">{formatSymbol(trade.symbol)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg" style={{
            padding: isMobile ? '10px 12px' : '10px 12px'
        }}>
              <span className="text-gray-200">Trade:</span>
              <span className="font-bold notranslate">
                {trade.direction === 'up' ? 'BUY/UP' : 'SELL/DOWN'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg" style={{
            padding: isMobile ? '10px 12px' : '10px 12px'
        }}>
              <span className="text-gray-200">Amount:</span>
              <span className="font-bold notranslate">{trade.amount.toLocaleString()} USDT</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg" style={{
            padding: isMobile ? '10px 12px' : '10px 12px'
        }}>
              <span className="text-gray-200">Entry Price:</span>
              <span className="font-mono notranslate">{trade.entryPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg" style={{
            padding: isMobile ? '10px 12px' : '10px 12px'
        }}>
              <span className="text-gray-200">Close Price:</span>
              <span className="font-mono notranslate">{trade.finalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg" style={{
            padding: isMobile ? '10px 12px' : '10px 12px'
        }}>
              <span className="text-gray-200">Duration:</span>
              <span className="font-bold notranslate">{trade.duration || 30} seconds</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800/40 rounded-lg" style={{
            padding: isMobile ? '10px 12px' : '10px 12px'
        }}>
              <span className="text-gray-200">Profit:</span>
              <span className={"font-bold notranslate ".concat(isWin ? 'text-emerald-300' : 'text-red-300')}>
                {isWin ? '+' + pnl.toFixed(0) : pnl.toFixed(0)} USDT
              </span>
            </div>
          </div>
        </div>
      </div>
    </>);
};
// MAIN COMPONENT - Now uses Universal Notification for all devices
export default function TradeNotification(_a) {
    var _b;
    var trade = _a.trade, onClose = _a.onClose;
    console.log('🔔 UNIVERSAL NOTIFICATION: Rendering for trade:', trade === null || trade === void 0 ? void 0 : trade.id, 'Status:', trade === null || trade === void 0 ? void 0 : trade.status);
    console.log('🔔 UNIVERSAL NOTIFICATION: Trade symbol:', {
        symbol: trade === null || trade === void 0 ? void 0 : trade.symbol,
        symbolType: typeof (trade === null || trade === void 0 ? void 0 : trade.symbol),
        symbolLength: (_b = trade === null || trade === void 0 ? void 0 : trade.symbol) === null || _b === void 0 ? void 0 : _b.length,
        symbolIsUndefined: (trade === null || trade === void 0 ? void 0 : trade.symbol) === undefined,
        symbolIsNull: (trade === null || trade === void 0 ? void 0 : trade.symbol) === null,
        symbolIsEmpty: (trade === null || trade === void 0 ? void 0 : trade.symbol) === ''
    });
    // Simply return the universal component - no complex mobile detection needed
    return <UniversalTradeNotification trade={trade} onClose={onClose}/>;
}
