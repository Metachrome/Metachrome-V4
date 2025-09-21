// Minimal server test to check if the issue is with the server startup
const express = require('express');
const fs = require('fs');
const path = require('path');

console.log('🧪 MINIMAL SERVER TEST');
console.log('======================');

const app = express();
const PORT = 3006; // Use different port to avoid conflicts

app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server is working!' });
});

// Test deposit endpoint (simplified)
app.post('/api/transactions/deposit-request', (req, res) => {
  console.log('💰 Deposit request received:', req.body);
  
  try {
    // Read pending data
    const dataFile = path.join(__dirname, 'pending-data.json');
    const data = fs.readFileSync(dataFile, 'utf8');
    const pendingData = JSON.parse(data);
    
    // Create deposit
    const depositId = `dep_minimal_${Date.now()}`;
    const newDeposit = {
      id: depositId,
      user_id: 'test-user-minimal',
      username: 'test.minimal',
      amount: req.body.amount || 50,
      currency: req.body.currency || 'USDT-ERC',
      status: 'pending',
      wallet_address: '',
      user_balance: 0,
      created_at: new Date().toISOString()
    };
    
    // Add to deposits
    pendingData.deposits.push(newDeposit);
    
    // Save back
    fs.writeFileSync(dataFile, JSON.stringify(pendingData, null, 2));
    
    console.log('✅ Deposit created:', depositId);
    
    res.json({
      success: true,
      depositId: depositId,
      message: 'Deposit created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating deposit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deposit'
    });
  }
});

// Test admin endpoint (simplified)
app.get('/api/admin/pending-requests', (req, res) => {
  console.log('🔔 Admin pending requests requested');
  
  try {
    const dataFile = path.join(__dirname, 'pending-data.json');
    const data = fs.readFileSync(dataFile, 'utf8');
    const pendingData = JSON.parse(data);
    
    const pendingDeposits = pendingData.deposits.filter(d => d.status === 'pending');
    const pendingWithdrawals = pendingData.withdrawals.filter(w => w.status === 'pending');
    
    console.log('📊 Found pending deposits:', pendingDeposits.length);
    console.log('📊 Found pending withdrawals:', pendingWithdrawals.length);
    
    res.json({
      success: true,
      deposits: pendingDeposits,
      withdrawals: pendingWithdrawals
    });
  } catch (error) {
    console.error('❌ Error getting pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending requests'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('✅ Minimal server started successfully!');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log('🧪 Test endpoints:');
  console.log(`   - GET  http://localhost:${PORT}/test`);
  console.log(`   - POST http://localhost:${PORT}/api/transactions/deposit-request`);
  console.log(`   - GET  http://localhost:${PORT}/api/admin/pending-requests`);
  console.log('');
  console.log('🔧 To test deposit creation:');
  console.log(`   curl -X POST http://localhost:${PORT}/api/transactions/deposit-request -H "Content-Type: application/json" -d "{\\"amount\\": 100, \\"currency\\": \\"USDT-ERC\\"}"`);
  console.log('');
  console.log('🔧 To test admin endpoint:');
  console.log(`   curl http://localhost:${PORT}/api/admin/pending-requests`);
}).on('error', (err) => {
  console.error('❌ Minimal server startup error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
  }
});
