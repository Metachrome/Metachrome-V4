// Force Trade Notification Test
// This script will inject a completed trade into localStorage to trigger the notification

console.log('🎯 FORCE TRADE NOTIFICATION: Starting...');

// Create a test completed trade
const testCompletedTrade = {
  id: `force-test-${Date.now()}`,
  direction: 'up',
  amount: 100,
  entryPrice: 65000,
  currentPrice: 66500,
  status: 'won',
  payout: 115,
  profitPercentage: 15,
  completedAt: new Date().toISOString(),
  symbol: 'BTC/USDT',
  duration: '60'
};

// Store in localStorage
localStorage.setItem('completedTrade', JSON.stringify(testCompletedTrade));

console.log('✅ Test completed trade stored in localStorage:', testCompletedTrade);

// Also trigger a custom event to force notification
const notificationEvent = new CustomEvent('forceTradeNotification', {
  detail: testCompletedTrade
});

window.dispatchEvent(notificationEvent);

console.log('✅ Custom notification event dispatched');

// Log current state
console.log('📊 Current localStorage completedTrade:', localStorage.getItem('completedTrade'));
console.log('📱 Current window dimensions:', window.innerWidth, 'x', window.innerHeight);
console.log('📱 Is mobile device:', window.innerWidth <= 768);

// Force page refresh to trigger notification
setTimeout(() => {
  console.log('🔄 Forcing page refresh to trigger notification...');
  window.location.reload();
}, 2000);
