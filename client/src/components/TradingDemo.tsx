import React, { useState, useEffect } from 'react';

interface TradingDemoProps {
  type: 'spot' | 'options';
}

export default function TradingDemo({ type }: TradingDemoProps) {
  const [currentPrice, setCurrentPrice] = useState(118099.98);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Simulate real-time price updates
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 200;
        return Math.max(prev + change, 100000);
      });
    }, 1500);

    // Simulate connection status
    const connectionCheck = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionCheck);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const getPriceChangeColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-400';
    if (current < previous) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-[#10121E] border border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <h3 className="text-white font-semibold">
            {type === 'spot' ? '📊 Spot Trading' : '⚡ Options Trading'} - Live Demo
          </h3>
        </div>
        <div className="text-xs text-gray-400">
          {isConnected ? 'Connected to TradingView' : 'Reconnecting...'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Price */}
        <div className="bg-gray-800 rounded p-3">
          <div className="text-gray-400 text-sm">BTC/USDT</div>
          <div className={`text-xl font-bold ${getPriceChangeColor(currentPrice, 118099.98)}`}>
            {formatPrice(currentPrice)}
          </div>
          <div className="text-xs text-gray-500">Real-time price</div>
        </div>

        {/* Trading Type Info */}
        <div className="bg-gray-800 rounded p-3">
          <div className="text-gray-400 text-sm">Trading Type</div>
          <div className="text-white font-medium">
            {type === 'spot' ? 'Direct Ownership' : 'Binary Options'}
          </div>
          <div className="text-xs text-gray-500">
            {type === 'spot' ? 'Buy/Sell crypto assets' : 'Predict price direction'}
          </div>
        </div>

        {/* Key Feature */}
        <div className="bg-gray-800 rounded p-3">
          <div className="text-gray-400 text-sm">
            {type === 'spot' ? 'Min Order' : 'Min Trade'}
          </div>
          <div className="text-white font-medium">
            {type === 'spot' ? 'Any Amount' : '100 USDT'}
          </div>
          <div className="text-xs text-gray-500">
            {type === 'spot' ? 'No minimum limit' : 'Fixed minimum amount'}
          </div>
        </div>
      </div>

      {/* Trading Features */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">✅ Features</h4>
          {type === 'spot' ? (
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Real TradingView charts</li>
              <li>• Live order book</li>
              <li>• Limit & Market orders</li>
              <li>• Portfolio tracking</li>
            </ul>
          ) : (
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• 30s to 600s durations</li>
              <li>• 10% to 100% profits</li>
              <li>• Real-time countdown</li>
              <li>• Instant execution</li>
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">⚠️ Risks</h4>
          {type === 'spot' ? (
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Market volatility</li>
              <li>• Price fluctuations</li>
              <li>• Liquidity risks</li>
              <li>• No guaranteed profits</li>
            </ul>
          ) : (
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• High risk/reward</li>
              <li>• All-or-nothing outcome</li>
              <li>• Time pressure</li>
              <li>• Rapid losses possible</li>
            </ul>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-3">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors">
          {type === 'spot' ? 'Start Spot Trading' : 'Start Options Trading'}
        </button>
        <button className="px-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 rounded text-sm transition-colors">
          Learn More
        </button>
      </div>

      {/* Status Bar */}
      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-gray-500">Last Update:</span>
          <span className="text-gray-400">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400">Live Data</span>
        </div>
      </div>
    </div>
  );
}
