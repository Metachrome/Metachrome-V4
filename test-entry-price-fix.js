// Test script to verify entry price fix
const https = require('https');
const http = require('http');

async function testEntryPriceFix() {
  console.log('🧪 Testing Entry Price Fix...');
  
  const testPrice = 70140.50; // Current price from the image
  
  try {
    // Test placing a trade with specific entry price
    const postData = JSON.stringify({
      userId: 'user-angela-1758195715',
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: '100',
      duration: 30,
      entryPrice: testPrice
    });

    const options = {
      hostname: 'localhost',
      port: 3005,
      path: '/api/trades/options',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Trade placed successfully:', result);

          // Now check if the entry price was stored correctly
          if (result.trade && result.trade.entry_price) {
            const storedPrice = parseFloat(result.trade.entry_price);
            if (Math.abs(storedPrice - testPrice) < 0.01) {
              console.log('✅ Entry price stored correctly:', storedPrice);
              console.log('✅ TEST PASSED: Entry price fix is working!');
            } else {
              console.log('❌ Entry price mismatch:', {
                expected: testPrice,
                stored: storedPrice
              });
              console.log('❌ TEST FAILED: Entry price fix not working');
            }
          } else {
            console.log('⚠️ No entry price in response');
          }
        } catch (parseError) {
          console.log('❌ Trade failed:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testEntryPriceFix();
