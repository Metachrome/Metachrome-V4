// Test the complete receipt upload workflow
const http = require('http');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

function testAPI(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9999,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin-token-admin-001'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function testFileUpload(endpoint, formData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9999,
      path: endpoint,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-token-admin-001',
        ...formData.getHeaders()
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    formData.pipe(req);
  });
}

// Create a test receipt file (simple PNG)
function createTestReceipt() {
  // Create a minimal PNG file (1x1 pixel transparent PNG)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
    0x0D, 0x0A, 0x2D, 0xB4, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);

  const receiptPath = path.join(__dirname, 'test-receipt.png');
  fs.writeFileSync(receiptPath, pngData);
  return receiptPath;
}

async function testReceiptUploadWorkflow() {
  console.log('🧪 TESTING RECEIPT UPLOAD WORKFLOW\n');

  try {
    // Step 1: Create a deposit request
    console.log('1️⃣ Creating deposit request...');
    const depositResult = await testAPI('/api/transactions/deposit-request', 'POST', {
      amount: 100,
      currency: 'USDT'
    });
    
    if (depositResult.status === 200) {
      console.log('   ✅ Deposit request created:', depositResult.data.depositId);
      
      // Step 2: Create test receipt file
      console.log('2️⃣ Creating test receipt file...');
      const receiptPath = createTestReceipt();
      console.log('   ✅ Test receipt created:', receiptPath);
      
      // Step 3: Submit proof with receipt file
      console.log('3️⃣ Submitting proof with receipt...');
      const formData = new FormData();
      formData.append('depositId', depositResult.data.depositId);
      formData.append('txHash', '0x1234567890abcdef1234567890abcdef12345678');
      formData.append('walletAddress', '0xabcdef1234567890abcdef1234567890abcdef12');
      formData.append('receipt', fs.createReadStream(receiptPath));
      
      const proofResult = await testFileUpload('/api/transactions/submit-proof', formData);
      
      if (proofResult.status === 200) {
        console.log('   ✅ Proof with receipt submitted successfully');
        console.log('   📎 Receipt URL:', proofResult.data.receiptUrl);
        
        // Step 4: Check pending requests to see if receipt is included
        console.log('4️⃣ Checking pending requests...');
        const pendingResult = await testAPI('/api/admin/pending-requests');
        
        if (pendingResult.status === 200) {
          console.log('   ✅ Pending requests fetched');
          
          if (pendingResult.data.deposits.length > 0) {
            const deposit = pendingResult.data.deposits[0];
            console.log(`   📋 Deposit found: $${deposit.amount} from ${deposit.username}`);
            
            if (deposit.receipt) {
              console.log('   📎 Receipt information:');
              console.log(`      - Original name: ${deposit.receipt.originalName}`);
              console.log(`      - File type: ${deposit.receipt.mimetype}`);
              console.log(`      - Size: ${deposit.receipt.size} bytes`);
              console.log(`      - URL: ${deposit.receipt.url}`);
              console.log('   ✅ Receipt data is properly stored!');
            } else {
              console.log('   ❌ No receipt data found in deposit');
            }
          } else {
            console.log('   ⚠️ No pending deposits found');
          }
        } else {
          console.log('   ❌ Failed to fetch pending requests:', pendingResult.data);
        }
        
        // Clean up test file
        fs.unlinkSync(receiptPath);
        console.log('5️⃣ Test receipt file cleaned up');
        
      } else {
        console.log('   ❌ Failed to submit proof:', proofResult.data);
      }
    } else {
      console.log('   ❌ Failed to create deposit request:', depositResult.data);
    }

    console.log('\n🎉 RECEIPT UPLOAD WORKFLOW TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for server to be ready
setTimeout(testReceiptUploadWorkflow, 3000);
