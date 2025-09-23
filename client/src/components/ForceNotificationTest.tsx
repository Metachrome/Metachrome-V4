import { useState } from 'react';
import TradeNotification from './TradeNotification';

export function ForceNotificationTest() {
  const [showNotification, setShowNotification] = useState(false);
  const [testTrade, setTestTrade] = useState(null);

  const createTestTrade = (type: 'win' | 'lose') => {
    const trade = {
      id: `test-${type}-${Date.now()}`,
      direction: 'up' as const,
      amount: 1600,
      entryPrice: 116944.00,
      finalPrice: type === 'win' ? 116946.98 : 116941.50,
      status: type === 'win' ? 'won' as const : 'lost' as const,
      payout: type === 'win' ? 1760 : 0,
      profitPercentage: 10
    };

    console.log('🧪 ForceNotificationTest: Creating test trade:', trade);
    setTestTrade(trade);
    setShowNotification(true);
  };

  const closeNotification = () => {
    console.log('🧪 ForceNotificationTest: Closing notification');
    setShowNotification(false);
    setTestTrade(null);
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Test Controls */}
      <div className="fixed top-4 right-4 z-[9998] bg-purple-600 text-white p-4 rounded-lg shadow-lg">
        <div className="font-bold mb-3">🧪 Notification Test</div>
        <div className="space-y-2">
          <button
            onClick={() => createTestTrade('win')}
            className="block w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm"
          >
            📱 Test Win Notification
          </button>
          <button
            onClick={() => createTestTrade('lose')}
            className="block w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
          >
            📱 Test Lose Notification
          </button>
          <div className="text-xs mt-2 text-purple-200">
            Window: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px
          </div>
          <div className="text-xs text-purple-200">
            Mobile: {typeof window !== 'undefined' && window.innerWidth < 768 ? 'YES' : 'NO'}
          </div>
        </div>
      </div>

      {/* Force Notification */}
      {showNotification && testTrade && (
        <TradeNotification
          trade={testTrade}
          onClose={closeNotification}
        />
      )}
    </>
  );
}
