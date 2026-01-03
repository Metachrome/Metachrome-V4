import React from 'react';
export default function TradeOverlay(_a) {
    var trades = _a.trades, currentPrice = _a.currentPrice;
    if (trades.length === 0)
        return null;
    return (<div className="absolute top-2 left-2 z-50 space-y-2">
      {trades.map(function (trade) {
            var timeRemaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
            var priceChange = currentPrice - trade.entryPrice;
            var isWinning = (trade.direction === 'up' && priceChange > 0) ||
                (trade.direction === 'down' && priceChange < 0);
            return (<div key={trade.id} className={"px-3 py-2 rounded-lg backdrop-blur-sm border ".concat(isWinning
                    ? 'bg-green-900/80 border-green-400 text-green-100'
                    : 'bg-red-900/80 border-red-400 text-red-100', " text-xs min-w-[200px]")}>
            <div className="flex justify-between items-center mb-1">
              <span className={"font-bold ".concat(trade.direction === 'up' ? 'text-green-300' : 'text-red-300')}>
                {trade.direction.toUpperCase()} ${trade.amount}
              </span>
              <span className="text-yellow-300 font-bold">{timeRemaining}s</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Entry: ${trade.entryPrice.toFixed(2)}</span>
              <span className={"font-bold ".concat(priceChange >= 0 ? 'text-green-300' : 'text-red-300')}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
              </span>
            </div>
            
            <div className="text-center mt-1">
              <span className={"text-xs ".concat(isWinning ? 'text-green-300' : 'text-red-300')}>
                {isWinning ? '🟢 WINNING' : '🔴 LOSING'} • {trade.profitPercentage}%
              </span>
            </div>
          </div>);
        })}
    </div>);
}
