// Comprehensive test for all trading fixes
console.log('🧪 Testing all trading fixes...');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAllFixes() {
  const baseUrl = 'https://metachrome-v2-production.up.railway.app';
  
  try {
    console.log('1️⃣ Login as superadmin...');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'superadmin123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('✅ Login successful:', {
      username: loginResult.user.username,
      id: loginResult.user.id,
      balance: loginResult.user.balance,
      trading_mode: loginResult.user.trading_mode
    });
    
    const token = loginResult.token;
    const userId = loginResult.user.id;
    const initialBalance = parseFloat(loginResult.user.balance);
    
    console.log('2️⃣ Set trading mode to LOSE...');
    
    const setModeResponse = await fetch(`${baseUrl}/api/admin/trading-controls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        controlType: 'lose'
      })
    });
    
    if (setModeResponse.ok) {
      const result = await setModeResponse.json();
      console.log('✅ Trading mode set to LOSE:', result.message);
    } else {
      console.log('❌ Failed to set trading mode');
    }
    
    console.log('3️⃣ Test spot trading (buy BTC)...');
    
    const spotBuyResponse = await fetch(`${baseUrl}/api/spot/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        symbol: 'BTCUSDT',
        side: 'buy',
        amount: '0.001',
        price: '65000',
        type: 'market'
      })
    });
    
    if (spotBuyResponse.ok) {
      const spotResult = await spotBuyResponse.json();
      console.log('✅ Spot buy order created:', spotResult.orderId);
      console.log('💰 New balance after buy:', spotResult.newBalance);
      
      const expectedBalance = initialBalance - (0.001 * 65000);
      const actualBalance = parseFloat(spotResult.newBalance);
      
      if (Math.abs(actualBalance - expectedBalance) < 1) {
        console.log('✅ Balance correctly updated after spot buy');
      } else {
        console.log('❌ Balance not correctly updated:', {
          expected: expectedBalance,
          actual: actualBalance
        });
      }
    } else {
      const error = await spotBuyResponse.text();
      console.log('❌ Spot buy failed:', error);
    }
    
    console.log('4️⃣ Test options trading with LOSE control...');
    
    const optionsResponse = await fetch(`${baseUrl}/api/trades/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: '100',
        duration: 30
      })
    });
    
    if (optionsResponse.ok) {
      const optionsResult = await optionsResponse.json();
      console.log('✅ Options trade created:', optionsResult.tradeId);
      console.log('⏰ Waiting 35 seconds for trade completion...');
      
      // Wait for trade to complete
      await new Promise(resolve => setTimeout(resolve, 35000));
      
      console.log('5️⃣ Check trade results and history...');
      
      const historyResponse = await fetch(`${baseUrl}/api/users/${userId}/trades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (historyResponse.ok) {
        const trades = await historyResponse.json();
        console.log('✅ Trade history loaded:', trades.length, 'trades');
        
        if (trades.length > 0) {
          console.log('📈 Recent trades:');
          trades.slice(0, 5).forEach((trade, index) => {
            console.log(`  ${index + 1}. ${trade.id} - ${trade.direction || trade.side} - ${trade.amount} - ${trade.result || trade.status} - ${trade.symbol}`);
          });
          
          // Check if the latest options trade was forced to lose
          const latestOptionsTrade = trades.find(t => t.direction && t.duration);
          if (latestOptionsTrade) {
            if (latestOptionsTrade.result === 'lose') {
              console.log('✅ TRADING CONTROL WORKING: Options trade correctly forced to LOSE');
            } else if (latestOptionsTrade.result === 'win') {
              console.log('❌ TRADING CONTROL NOT WORKING: Trade should have been LOSE but was WIN');
            } else {
              console.log('⚠️ Options trade still pending:', latestOptionsTrade.result);
            }
          }
          
          // Check if spot trades are showing in history
          const spotTrades = trades.filter(t => t.side || (t.direction && !t.duration));
          if (spotTrades.length > 0) {
            console.log('✅ SPOT TRADES SHOWING IN HISTORY:', spotTrades.length, 'spot trades found');
          } else {
            console.log('❌ SPOT TRADES NOT SHOWING IN HISTORY');
          }
        } else {
          console.log('❌ NO TRADE HISTORY FOUND');
        }
      } else {
        console.log('❌ Failed to load trade history');
      }
    } else {
      const error = await optionsResponse.text();
      console.log('❌ Options trade failed:', error);
    }
    
    console.log('6️⃣ Reset trading mode to normal...');
    
    const resetModeResponse = await fetch(`${baseUrl}/api/admin/trading-controls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: userId,
        controlType: 'normal'
      })
    });
    
    if (resetModeResponse.ok) {
      console.log('✅ Trading mode reset to normal');
    }
    
    console.log('🎯 TEST SUMMARY:');
    console.log('- Spot trading balance updates: Check console above');
    console.log('- Trading control enforcement: Check console above');
    console.log('- Trade history persistence: Check console above');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the comprehensive test
testAllFixes();
