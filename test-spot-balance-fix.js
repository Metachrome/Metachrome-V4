// Test spot trading balance fix
console.log('🧪 Testing spot trading balance fix...');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSpotBalanceFix() {
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
      balance: loginResult.user.balance
    });
    
    const token = loginResult.token;
    const userId = loginResult.user.id;
    
    console.log('2️⃣ Get initial balance...');
    
    const balanceResponse = await fetch(`${baseUrl}/api/user/balances?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      console.log('💰 Initial balance response:', balanceData);
      
      const initialBalance = Array.isArray(balanceData) 
        ? parseFloat(balanceData[0]?.available || 0)
        : parseFloat(balanceData.USDT?.available || 0);
      
      console.log('💰 Initial balance parsed:', initialBalance);
      
      console.log('3️⃣ Place spot buy order...');
      
      const buyAmount = 0.001;
      const buyPrice = 65000;
      const expectedCost = buyAmount * buyPrice; // 65 USDT
      
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
          amount: buyAmount.toString(),
          price: buyPrice.toString(),
          type: 'market'
        })
      });
      
      if (spotBuyResponse.ok) {
        const buyResult = await spotBuyResponse.json();
        console.log('✅ Spot buy order result:', buyResult);
        
        const newBalanceFromResponse = parseFloat(buyResult.newBalance || 0);
        const expectedNewBalance = initialBalance - expectedCost;
        
        console.log('💰 Balance comparison:');
        console.log('  Initial:', initialBalance);
        console.log('  Expected cost:', expectedCost);
        console.log('  Expected new balance:', expectedNewBalance);
        console.log('  Actual new balance:', newBalanceFromResponse);
        
        if (Math.abs(newBalanceFromResponse - expectedNewBalance) < 1) {
          console.log('✅ BALANCE UPDATE WORKING: Balance correctly updated');
        } else {
          console.log('❌ BALANCE UPDATE NOT WORKING: Balance mismatch');
        }
        
        // Wait a moment for WebSocket sync
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('4️⃣ Verify balance via API...');
        
        const verifyResponse = await fetch(`${baseUrl}/api/user/balances?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('💰 Verified balance response:', verifyData);
          
          const verifiedBalance = Array.isArray(verifyData) 
            ? parseFloat(verifyData[0]?.available || 0)
            : parseFloat(verifyData.USDT?.available || 0);
          
          console.log('💰 Verified balance parsed:', verifiedBalance);
          
          if (Math.abs(verifiedBalance - expectedNewBalance) < 1) {
            console.log('✅ BALANCE PERSISTENCE WORKING: Balance correctly persisted');
          } else {
            console.log('❌ BALANCE PERSISTENCE NOT WORKING: Balance not persisted');
          }
        }
        
        console.log('5️⃣ Place spot sell order...');
        
        const sellAmount = 0.0005;
        const sellPrice = 65100;
        const expectedReceived = sellAmount * sellPrice; // ~32.55 USDT
        
        const spotSellResponse = await fetch(`${baseUrl}/api/spot/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId: userId,
            symbol: 'BTCUSDT',
            side: 'sell',
            amount: sellAmount.toString(),
            price: sellPrice.toString(),
            type: 'market'
          })
        });
        
        if (spotSellResponse.ok) {
          const sellResult = await spotSellResponse.json();
          console.log('✅ Spot sell order result:', sellResult);
          
          const finalBalance = parseFloat(sellResult.newBalance || 0);
          const expectedFinalBalance = expectedNewBalance + expectedReceived;
          
          console.log('💰 Final balance comparison:');
          console.log('  Balance after buy:', expectedNewBalance);
          console.log('  Expected received:', expectedReceived);
          console.log('  Expected final balance:', expectedFinalBalance);
          console.log('  Actual final balance:', finalBalance);
          
          if (Math.abs(finalBalance - expectedFinalBalance) < 1) {
            console.log('✅ SELL ORDER WORKING: Balance correctly updated');
          } else {
            console.log('❌ SELL ORDER NOT WORKING: Balance mismatch');
          }
        } else {
          const error = await spotSellResponse.text();
          console.log('❌ Spot sell failed:', error);
        }
        
      } else {
        const error = await spotBuyResponse.text();
        console.log('❌ Spot buy failed:', error);
      }
    } else {
      console.log('❌ Failed to get initial balance');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSpotBalanceFix();
