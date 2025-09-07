import React from 'react';

interface Trade {
  id: string;
  direction: 'up' | 'down';
  entryPrice: number;
  amount: number;
  endTime: number;
  profitPercentage: number;
}

interface TradeOverlayProps {
  trades: Trade[];
  currentPrice: number;
}

export default function TradeOverlay({ trades, currentPrice }: TradeOverlayProps) {
  if (trades.length === 0) return null;

  return (
    <div className="absolute top-2 left-2 z-10 space-y-2">
      {trades.map(trade => {
        const timeRemaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
        const priceChange = currentPrice - trade.entryPrice;
        const isWinning = (trade.direction === 'up' && priceChange > 0) || 
                         (trade.direction === 'down' && priceChange < 0);
        
        return (
          <div 
            key={trade.id}
            className={`px-3 py-2 rounded-lg backdrop-blur-sm border ${
              isWinning 
                ? 'bg-green-900/80 border-green-400 text-green-100' 
                : 'bg-red-900/80 border-red-400 text-red-100'
            } text-xs min-w-[200px]`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`font-bold ${trade.direction === 'up' ? 'text-green-300' : 'text-red-300'}`}>
                {trade.direction.toUpperCase()} ${trade.amount}
              </span>
              <span className="text-yellow-300 font-bold">{timeRemaining}s</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Entry: ${trade.entryPrice.toFixed(2)}</span>
              <span className={`font-bold ${priceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
              </span>
            </div>
            
            <div className="text-center mt-1">
              <span className={`text-xs ${isWinning ? 'text-green-300' : 'text-red-300'}`}>
                {isWinning ? '🟢 WINNING' : '🔴 LOSING'} • {trade.profitPercentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
