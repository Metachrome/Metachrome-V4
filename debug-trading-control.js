// Debug script to check trading control issues
console.log('🔍 Debugging trading control issues...');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugTradingControl() {
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
      role: loginResult.user.role,
      trading_mode: loginResult.user.trading_mode
    });
    
    const token = loginResult.token;
    const userId = loginResult.user.id;
    
    console.log('2️⃣ Check current trading mode...');
    
    // Get user details to check trading mode
    const userResponse = await fetch(`${baseUrl}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (userResponse.ok) {
      const users = await userResponse.json();
      const superadmin = users.find(u => u.username === 'superadmin');
      console.log('🎯 Superadmin current trading mode:', superadmin?.trading_mode);
    }
    
    console.log('3️⃣ Set trading mode to LOSE...');
    
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
      const error = await setModeResponse.text();
      console.log('❌ Failed to set trading mode:', error);
    }
    
    console.log('4️⃣ Verify trading mode was set...');
    
    const verifyResponse = await fetch(`${baseUrl}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (verifyResponse.ok) {
      const users = await verifyResponse.json();
      const superadmin = users.find(u => u.username === 'superadmin');
      console.log('🔍 Superadmin trading mode after setting:', superadmin?.trading_mode);
    }
    
    console.log('5️⃣ Test a trade with LOSE mode...');
    
    const tradeResponse = await fetch(`${baseUrl}/api/trades/options`, {
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
    
    if (tradeResponse.ok) {
      const tradeResult = await tradeResponse.json();
      console.log('✅ Trade created:', tradeResult.tradeId);
      console.log('⏰ Waiting 35 seconds for trade completion...');
      
      // Wait for trade to complete
      await new Promise(resolve => setTimeout(resolve, 35000));
      
      console.log('6️⃣ Check trade result...');
      
      const historyResponse = await fetch(`${baseUrl}/api/users/${userId}/trades`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (historyResponse.ok) {
        const trades = await historyResponse.json();
        const latestTrade = trades[0];
        if (latestTrade) {
          console.log('📈 Latest trade result:', {
            id: latestTrade.id,
            direction: latestTrade.direction,
            amount: latestTrade.amount,
            result: latestTrade.result,
            status: latestTrade.status,
            profit: latestTrade.profit || latestTrade.profit_loss
          });
          
          if (latestTrade.result === 'lose') {
            console.log('✅ TRADING CONTROL WORKING: Trade correctly forced to LOSE');
          } else if (latestTrade.result === 'win') {
            console.log('❌ TRADING CONTROL NOT WORKING: Trade should have been LOSE but was WIN');
          } else {
            console.log('⚠️ Trade still pending or unknown result:', latestTrade.result);
          }
        }
      }
    } else {
      const error = await tradeResponse.text();
      console.log('❌ Trade failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugTradingControl();
