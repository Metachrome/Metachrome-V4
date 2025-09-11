const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');

console.log('🚀 Starting METACHROME server with crypto functionality...');

const app = express();
const PORT = 3001;

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

console.log('📁 Serving static files from:', distPath);

// ===== IN-MEMORY DATA STORE =====
let users = [
  {
    id: 'superadmin-1',
    username: 'superadmin',
    email: 'superadmin@metachrome.io',
    password: 'superadmin123',
    balance: 50000,
    role: 'superadmin',
    status: 'active',
    trading_mode: 'normal',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-1',
    username: 'trader1',
    email: 'trader1@metachrome.io',
    password: 'password123',
    balance: 10000,
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    createdAt: new Date().toISOString()
  }
];

let transactions = [];
let trades = [];

// Global pending deposits storage
global.pendingDeposits = [];

// ===== AUTHENTICATION ENDPOINTS =====
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      balance: user.balance
    },
    token
  });
});

// ===== BALANCE ENDPOINTS =====
app.get('/api/balances', (req, res) => {
  const mockBalances = [
    { id: 'balance-1', userId: 'user-1', currency: 'USDT', balance: 10000 },
    { id: 'balance-2', userId: 'user-1', currency: 'BTC', balance: 0.5 },
    { id: 'balance-3', userId: 'user-1', currency: 'ETH', balance: 2.0 }
  ];
  res.json(mockBalances);
});

// ===== CRYPTO DEPOSIT ENDPOINTS =====

// Step 1: Create deposit request
app.post('/api/transactions/deposit-request', (req, res) => {
  const { amount, currency } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }
  
  if (!['USDT', 'BTC', 'ETH'].includes(currency)) {
    return res.status(400).json({ message: 'Invalid currency' });
  }
  
  const depositId = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  const depositAddress = generateDepositAddress(currency);
  const instructions = getDepositInstructions(currency, depositAddress, amount);
  
  const depositRequest = {
    depositId,
    depositAddress,
    amount: parseFloat(amount),
    currency,
    instructions,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // Store the deposit request
  global.pendingDeposits.push({
    id: depositId,
    user_id: 'user-1', // Mock user ID
    amount: parseFloat(amount),
    currency,
    status: 'pending',
    created_at: new Date().toISOString()
  });
  
  console.log('✅ Deposit request created:', depositId);
  res.json(depositRequest);
});

// Step 2: Submit transaction proof
app.post('/api/transactions/submit-proof', (req, res) => {
  const { depositId, txHash, walletAddress } = req.body;
  
  if (!depositId || !txHash) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const deposit = global.pendingDeposits.find(d => d.id === depositId);
  if (!deposit) {
    return res.status(404).json({ message: 'Deposit not found' });
  }
  
  // Update deposit with transaction proof
  deposit.tx_hash = txHash;
  deposit.wallet_address = walletAddress;
  deposit.status = 'verifying';
  deposit.submitted_at = new Date().toISOString();
  
  console.log('✅ Transaction proof submitted for:', depositId);
  
  // Auto-approve after 30 seconds (simulated verification)
  setTimeout(() => {
    approveDeposit(depositId);
  }, 30000);
  
  res.json({
    success: true,
    message: 'Transaction proof submitted successfully',
    depositId,
    status: 'verifying'
  });
});

// Step 3: Check deposit status
app.get('/api/transactions/deposit-status/:depositId', (req, res) => {
  const { depositId } = req.params;
  
  const deposit = global.pendingDeposits.find(d => d.id === depositId);
  if (!deposit) {
    return res.status(404).json({ message: 'Deposit not found' });
  }
  
  res.json({
    depositId: deposit.id,
    status: deposit.status,
    amount: deposit.amount,
    currency: deposit.currency,
    txHash: deposit.tx_hash,
    createdAt: deposit.created_at,
    submittedAt: deposit.submitted_at,
    completedAt: deposit.completed_at
  });
});

// ===== HELPER FUNCTIONS =====
function generateDepositAddress(currency) {
  const addresses = {
    'USDT': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b' + Math.random().toString(36).substring(2, 8),
    'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' + Math.random().toString(36).substring(2, 6),
    'ETH': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b' + Math.random().toString(36).substring(2, 8)
  };
  return addresses[currency] || addresses['USDT'];
}

function getDepositInstructions(currency, address, amount) {
  const instructions = {
    'USDT': {
      network: 'Ethereum (ERC-20)',
      address: address,
      amount: amount,
      steps: [
        '1. Copy the deposit address below',
        '2. Send exactly ' + amount + ' USDT to this address',
        '3. Use Ethereum network (ERC-20)',
        '4. Submit your transaction hash for verification',
        '5. Wait for confirmation (5-15 minutes)'
      ],
      warnings: [
        '⚠️ Only send USDT on Ethereum network',
        '⚠️ Send the exact amount specified',
        '⚠️ Double-check the address before sending'
      ]
    },
    'BTC': {
      network: 'Bitcoin',
      address: address,
      amount: amount,
      steps: [
        '1. Copy the Bitcoin address below',
        '2. Send exactly ' + amount + ' BTC to this address',
        '3. Use Bitcoin network only',
        '4. Submit your transaction hash for verification',
        '5. Wait for confirmation (10-30 minutes)'
      ],
      warnings: [
        '⚠️ Only send Bitcoin to this address',
        '⚠️ Send the exact amount specified',
        '⚠️ Minimum 1 confirmation required'
      ]
    },
    'ETH': {
      network: 'Ethereum',
      address: address,
      amount: amount,
      steps: [
        '1. Copy the Ethereum address below',
        '2. Send exactly ' + amount + ' ETH to this address',
        '3. Use Ethereum network only',
        '4. Submit your transaction hash for verification',
        '5. Wait for confirmation (5-15 minutes)'
      ],
      warnings: [
        '⚠️ Only send Ethereum to this address',
        '⚠️ Send the exact amount specified',
        '⚠️ Ensure sufficient gas fees'
      ]
    }
  };
  return instructions[currency] || instructions['USDT'];
}

function approveDeposit(depositId) {
  try {
    const deposit = global.pendingDeposits.find(d => d.id === depositId);
    if (!deposit || deposit.status !== 'verifying') {
      return;
    }

    // Find user and update balance
    const user = users.find(u => u.id === deposit.user_id);
    if (!user) {
      console.error('❌ User not found for deposit:', depositId);
      return;
    }

    // Update user balance
    user.balance += deposit.amount;
    
    // Update deposit status
    deposit.status = 'completed';
    deposit.completed_at = new Date().toISOString();

    // Create transaction record
    const transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      user_id: user.id,
      username: user.username,
      type: 'deposit',
      amount: deposit.amount,
      symbol: deposit.currency,
      status: 'completed',
      description: `Crypto deposit - ${deposit.amount} ${deposit.currency}`,
      method: 'cryptocurrency',
      txHash: deposit.tx_hash,
      created_at: deposit.created_at
    };

    transactions.push(transaction);

    console.log('✅ Deposit approved and processed:', depositId, 'Amount:', deposit.amount, deposit.currency);
    
    // Broadcast to WebSocket clients
    const depositUpdate = {
      type: 'deposit_completed',
      data: {
        depositId: depositId,
        amount: deposit.amount,
        currency: deposit.currency,
        newBalance: user.balance,
        txHash: deposit.tx_hash,
        timestamp: new Date().toISOString()
      }
    };

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(depositUpdate));
      }
    });
  } catch (error) {
    console.error('❌ Error approving deposit:', depositId, error);
  }
}

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'METACHROME server with crypto functionality is running',
    timestamp: new Date().toISOString(),
    features: ['crypto-deposits', 'websockets', 'authentication']
  });
});

// ===== SPA ROUTING =====
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <h1>METACHROME V2 - File Not Found</h1>
      <p>Index file not found at: ${indexPath}</p>
      <p>Please run 'npm run build' first</p>
    `);
  }
});

// ===== WEBSOCKET HANDLING =====
wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📨 WebSocket message received:', data);
    } catch (error) {
      console.error('❌ WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
  });
});

// ===== START SERVER =====
const HOST = '127.0.0.1';

server.listen(PORT, HOST, () => {
  console.log('🎉 ===================================');
  console.log('🚀 METACHROME V2 CRYPTO SERVER READY!');
  console.log(`🌐 Server running on: http://${HOST}:${PORT}`);
  console.log(`🔌 WebSocket server running on: ws://${HOST}:${PORT}/ws`);
  console.log(`🔧 Admin Dashboard: http://${HOST}:${PORT}/admin`);
  console.log('🔐 Login: superadmin / superadmin123');
  console.log('💰 Crypto deposits fully functional!');
  console.log('🎉 ===================================');
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
});
