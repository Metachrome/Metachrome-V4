// Test Real Trade with Fixed Server
console.log('🧪 TESTING REAL TRADE WITH FIXED SERVER');
console.log('=====================================');

async function testRealTradeWithFixedServer() {
  try {
    // Get user data
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('👤 User ID:', user.id);
    console.log('🔑 Auth token exists:', !!authToken);
    
    // Step 1: Test the WebSocket notification endpoint first
    console.log('\n📡 STEP 1: Testing WebSocket notification endpoint...');
    
    const testResponse = await fetch('/api/test/websocket-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ userId: user.id })
    });
    
    if (testResponse.ok) {
      const testResult = await testResponse.json();
      console.log('✅ WebSocket test successful:', testResult);
    } else {
      console.log('❌ WebSocket test failed:', testResponse.status);
      return;
    }
    
    // Step 2: Create a real test trade
    console.log('\n💰 STEP 2: Creating real test trade...');
    
    const tradeData = {
      userId: user.id,
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 1, // $1 test trade
      duration: 30 // 30 seconds
    };
    
    console.log('📊 Trade data:', tradeData);
    
    const tradeResponse = await fetch('/api/trades/options', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(tradeData)
    });
    
    if (tradeResponse.ok) {
      const tradeResult = await tradeResponse.json();
      console.log('✅ Trade created successfully:', tradeResult);
      console.log('🆔 Trade ID:', tradeResult.id);
      console.log('⏰ Trade will complete in 30 seconds...');
      
      // Step 3: Monitor for WebSocket messages
      console.log('\n📡 STEP 3: Monitoring WebSocket messages...');
      console.log('👀 Watch console for:');
      console.log('   - 📨 WebSocket Message logs');
      console.log('   - 🚨 TRADE COMPLETION MESSAGE RECEIVED!');
      console.log('   - 🔔 Notification trigger messages');
      console.log('   - Visual notification on screen');
      
      // Set up a timer to remind user what to watch for
      let countdown = 30;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          console.log(`⏰ ${countdown} seconds remaining...`);
        } else {
          console.log('🎯 Trade should be completing now! Watch for notifications...');
          clearInterval(countdownInterval);
        }
      }, 5000);
      
      return tradeResult;
    } else {
      const error = await tradeResponse.text();
      console.log('❌ Trade creation failed:', tradeResponse.status, error);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Test error:', error);
    return null;
  }
}

// Step 4: Manual completion test (if needed)
async function manuallyCompleteTrade(tradeId) {
  try {
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData);
    const authToken = localStorage.getItem('authToken');
    
    console.log('\n🔧 MANUALLY COMPLETING TRADE:', tradeId);
    
    const completionData = {
      tradeId: tradeId,
      userId: user.id,
      won: true,
      amount: 1,
      payout: 1.1
    };
    
    const response = await fetch('/api/trades/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(completionData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Manual completion successful:', result);
      console.log('👀 Check for WebSocket messages and notification!');
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Manual completion failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.log('❌ Manual completion error:', error);
    return false;
  }
}

// Make functions available globally
window.testRealTradeFixed = {
  testRealTradeWithFixedServer,
  manuallyCompleteTrade
};

// Run the test
testRealTradeWithFixedServer().then(result => {
  if (result && result.id) {
    console.log('\n💡 If automatic completion doesn\'t work, try:');
    console.log(`   window.testRealTradeFixed.manuallyCompleteTrade('${result.id}')`);
  }
});
