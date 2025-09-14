const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 9000;

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

console.log('🚀 METACHROME V2 - WORKING ADMIN SERVER STARTING...');
console.log('📁 Serving static files from:', distPath);

// ===== IN-MEMORY DATA STORE =====
let users = [
  {
    id: 'user-1',
    username: 'amdsnkstudio', // MAIN USER - YOU!
    email: 'amdsnkstudio@metachrome.io',
    balance: 0, // NEW USER - STARTS WITH $0
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@metachrome.io',
    balance: 50000,
    role: 'admin',
    status: 'active',
    trading_mode: 'normal',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'user-2',
    username: 'trader2',
    email: 'trader2@metachrome.io',
    balance: 5000,
    role: 'user',
    status: 'active',
    trading_mode: 'win',
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'user-3',
    username: 'trader3',
    email: 'trader3@metachrome.io',
    balance: 15000,
    role: 'user',
    status: 'active',
    trading_mode: 'lose',
    created_at: new Date().toISOString(),
    last_login: new Date(Date.now() - 7200000).toISOString()
  }
];

let trades = [
  {
    id: 'trade-1',
    user_id: 'user-1',
    symbol: 'BTC/USD',
    amount: 1000,
    direction: 'up',
    duration: 30,
    entry_price: 45000,
    exit_price: null,
    result: 'pending',
    profit: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 25000).toISOString(),
    users: { username: 'trader1' }
  },
  {
    id: 'trade-2',
    user_id: 'user-2',
    symbol: 'ETH/USD',
    amount: 500,
    direction: 'down',
    duration: 60,
    entry_price: 3200,
    exit_price: 3180,
    result: 'win',
    profit: 75,
    created_at: new Date(Date.now() - 120000).toISOString(),
    expires_at: new Date(Date.now() - 60000).toISOString(),
    users: { username: 'trader2' }
  },
  {
    id: 'trade-3',
    user_id: 'user-3',
    symbol: 'BTC/USD',
    amount: 2000,
    direction: 'up',
    duration: 30,
    entry_price: 44800,
    exit_price: 44750,
    result: 'lose',
    profit: -2000,
    created_at: new Date(Date.now() - 300000).toISOString(),
    expires_at: new Date(Date.now() - 270000).toISOString(),
    users: { username: 'trader3' }
  },
  {
    id: 'trade-4',
    user_id: 'user-1',
    symbol: 'ETH/USD',
    amount: 750,
    direction: 'down',
    duration: 60,
    entry_price: 3210,
    exit_price: null,
    result: 'pending',
    profit: null,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 45000).toISOString(),
    users: { username: 'trader1' }
  }
];

let transactions = [
  {
    id: 'tx-1',
    user_id: 'user-1',
    type: 'deposit',
    amount: 10000,
    status: 'completed',
    description: 'Initial deposit - USDT via TRC20',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    users: { username: 'trader1' }
  },
  {
    id: 'tx-2',
    user_id: 'user-2',
    type: 'withdrawal',
    amount: 2000,
    status: 'completed',
    description: 'Withdrawal approved - USDT via ERC20',
    created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    users: { username: 'trader2' }
  },
  {
    id: 'tx-3',
    user_id: 'user-3',
    type: 'deposit',
    amount: 15000,
    status: 'completed',
    description: 'Large deposit - BTC via Bitcoin Network',
    created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    users: { username: 'trader3' }
  },
  {
    id: 'tx-4',
    user_id: 'user-4',
    type: 'withdrawal',
    amount: 500,
    status: 'rejected',
    description: 'Withdrawal rejected by admin - Reason: Insufficient verification documents',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    users: { username: 'trader4' }
  }
];

// ===== AUTHENTICATION ENDPOINTS =====
app.post('/api/admin/login', (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);
  const { username, password } = req.body;
  
  if ((username === 'superadmin' && password === 'superadmin123') ||
      (username === 'admin' && password === 'admin123')) {
    const role = username === 'superadmin' ? 'super_admin' : 'admin';
    console.log('✅ Admin login successful:', username, role);
    res.json({
      success: true,
      token: 'mock-admin-token',
      user: { username, role }
    });
  } else {
    console.log('❌ Admin login failed:', username);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ===== USER MANAGEMENT ENDPOINTS =====
app.get('/api/admin/users', (req, res) => {
  console.log('👥 Getting users list - Count:', users.length);
  res.json(users);
});

app.post('/api/admin/users', (req, res) => {
  console.log('👤 Creating new user:', req.body);
  const { username, email, password, balance, role, trading_mode } = req.body;
  
  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    balance: Number(balance) || 10000,
    role: role || 'user',
    status: 'active',
    trading_mode: trading_mode || 'normal',
    created_at: new Date().toISOString(),
    last_login: null
  };
  
  users.push(newUser);
  console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
  res.json(newUser);
});

// ===== USER UPDATE ENDPOINT =====
app.put('/api/admin/users/:id', (req, res) => {
  console.log('✏️ Updating user:', req.params.id, req.body);
  const userId = req.params.id;
  const { username, email, balance, role, status, trading_mode } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if username already exists (excluding current user)
  if (username && users.find(u => u.username === username && u.id !== userId)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Update user data
  const updatedUser = {
    ...users[userIndex],
    ...(username && { username }),
    ...(email && { email }),
    ...(balance !== undefined && { balance: Number(balance) }),
    ...(role && { role }),
    ...(status && { status }),
    ...(trading_mode && { trading_mode }),
    updated_at: new Date().toISOString()
  };

  users[userIndex] = updatedUser;
  console.log('✅ User updated successfully:', updatedUser.username, 'ID:', updatedUser.id);
  res.json(updatedUser);
});

app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 Updating trading control:', req.body);
  const { userId, controlType } = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].trading_mode = controlType;
    console.log(`✅ Updated ${users[userIndex].username} trading mode to ${controlType}`);
    res.json({ 
      success: true, 
      message: `Trading mode updated to ${controlType.toUpperCase()}`,
      user: users[userIndex]
    });
  } else {
    console.log('❌ User not found:', userId);
    res.status(404).json({ error: 'User not found' });
  }
});

// ===== TRADING ENDPOINTS =====
app.get('/api/admin/trades', (req, res) => {
  console.log('📈 Getting trades list - Count:', trades.length);
  res.json(trades);
});

app.post('/api/admin/trades/:tradeId/control', (req, res) => {
  console.log('🎮 Manual trade control:', req.params.tradeId, req.body);
  const { tradeId } = req.params;
  const { action } = req.body;
  
  const tradeIndex = trades.findIndex(t => t.id === tradeId);
  if (tradeIndex !== -1 && trades[tradeIndex].result === 'pending') {
    trades[tradeIndex].result = action;
    trades[tradeIndex].exit_price = trades[tradeIndex].entry_price + (action === 'win' ? 50 : -50);
    trades[tradeIndex].profit = action === 'win' ? 
      trades[tradeIndex].amount * 0.1 : 
      -trades[tradeIndex].amount;
    
    console.log(`✅ Trade ${tradeId} manually set to ${action}`);
    res.json({ 
      success: true, 
      message: `Trade set to ${action.toUpperCase()}`,
      trade: trades[tradeIndex]
    });
  } else {
    console.log('❌ Trade not found or already completed:', tradeId);
    res.status(404).json({ error: 'Trade not found or already completed' });
  }
});

// ===== LIVE TRADES ENDPOINT =====
app.get('/api/admin/live-trades', (req, res) => {
  console.log('🔴 Getting live trades - Count:', trades.length);
  res.json({
    trades: trades,
    total: trades.length,
    active: trades.filter(t => t.result === 'pending').length
  });
});

// ===== PERSISTENT DATA STORAGE =====
const dataFile = path.join(__dirname, 'pending-data.json');

// Load existing data or create default
let pendingData = {
  deposits: [],
  withdrawals: [
    {
      id: 'with-001',
      user_id: 'user-2',
      username: 'trader2',
      amount: 200,
      currency: 'USDT',
      network: 'ERC20',
      status: 'pending',
      wallet_address: '0x8ba1f109551bD432803012645Hac136c22C501e5',
      created_at: new Date().toISOString()
    }
  ]
};

// Load data from file if it exists
try {
  if (fs.existsSync(dataFile)) {
    const fileData = fs.readFileSync(dataFile, 'utf8');
    pendingData = JSON.parse(fileData);
    console.log('📂 Loaded pending data from file:', {
      deposits: pendingData.deposits.length,
      withdrawals: pendingData.withdrawals.length
    });
  }
} catch (error) {
  console.log('⚠️ Could not load pending data file, using defaults');
}

// Save data to file
function savePendingData() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(pendingData, null, 2));
  } catch (error) {
    console.error('❌ Failed to save pending data:', error);
  }
}

let pendingDeposits = pendingData.deposits;
let pendingWithdrawals = pendingData.withdrawals;

// ===== USER DEPOSIT REQUEST ENDPOINT =====
app.post('/api/transactions/deposit-request', (req, res) => {
  console.log('💰 Creating deposit request');
  console.log('💰 Request body received:', JSON.stringify(req.body, null, 2));
  console.log('💰 Request headers:', req.headers.authorization);

  const { amount, currency } = req.body;

  if (!amount || !currency || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: "Invalid amount or currency" });
  }

  // Validate minimum amounts
  const minAmounts = {
    'USDT-ERC': 10,
    'USDT-BEP': 10,
    'USDT-TRC': 10,
    'BTC': 0.001,
    'ETH': 0.01,
    'SOL': 0.1
  };

  const minAmount = minAmounts[currency] || 1;
  if (parseFloat(amount) < minAmount) {
    return res.status(400).json({
      message: `Minimum deposit amount is ${minAmount} ${currency}`
    });
  }

  // Get user from auth token - IMPROVED USER AUTHENTICATION
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  console.log('💰 Looking up user with token:', authToken);

  // Default to a real user (not always trader1)
  let currentUser = users.find(u => u.role === 'user') || users[0];

  // Try different token patterns
  if (authToken) {
    // Pattern 1: user-session-{userId}
    if (authToken.startsWith('user-session-')) {
      const userId = authToken.replace('user-session-', '');
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        currentUser = foundUser;
        console.log('💰 Found user by session:', currentUser.username);
      }
    }
    // Pattern 2: demo-token-{timestamp} - use different users based on timestamp
    else if (authToken.startsWith('demo-token-')) {
      const timestamp = authToken.replace('demo-token-', '');
      const userIndex = parseInt(timestamp.slice(-1)) % users.filter(u => u.role === 'user').length;
      const userList = users.filter(u => u.role === 'user');
      currentUser = userList[userIndex] || userList[0];
      console.log('💰 Selected user by demo token:', currentUser.username);
    }
    // Pattern 3: Direct user lookup by username in token
    else {
      const foundUser = users.find(u => authToken.includes(u.username) || authToken.includes(u.id));
      if (foundUser) {
        currentUser = foundUser;
        console.log('💰 Found user by token match:', currentUser.username);
      }
    }
  }

  console.log('💰 Final selected user:', currentUser.username, 'Balance:', currentUser.balance);

  // Generate unique deposit ID
  const depositId = `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Map currency to network - FIXED to handle all variations
  const currencyNetworkMap = {
    'USDT-ERC': 'ERC20',
    'USDT-ERC20': 'ERC20',
    'USDT-BEP': 'BEP20',
    'USDT-BEP20': 'BEP20',
    'USDT-TRC': 'TRC20',
    'USDT-TRC20': 'TRC20',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana'
  };

  // Clean currency name properly - FIXED
  let cleanCurrency = currency;
  if (currency.includes('USDT')) {
    cleanCurrency = 'USDT'; // Always show as USDT regardless of network
  }

  // Add to pending deposits with all required fields
  const newDeposit = {
    id: depositId,
    user_id: currentUser.id,
    username: currentUser.username,
    amount: parseFloat(amount),
    currency: cleanCurrency, // FIXED: Use properly cleaned currency
    network: currencyNetworkMap[currency] || 'Unknown', // FIXED: Use original currency for mapping
    status: 'pending',
    wallet_address: '', // Will be filled when proof is submitted
    created_at: new Date().toISOString()
  };

  pendingDeposits.push(newDeposit);
  pendingData.deposits = pendingDeposits;
  savePendingData();

  console.log('💰 Deposit request created:', depositId, 'for user:', currentUser.username);

  res.json({
    success: true,
    depositId,
    transactionId: depositId,
    amount: amount,
    currency: currency,
    status: 'pending',
    message: "Deposit request created successfully. Please complete the payment and upload receipt."
  });
});

// ===== SUBMIT PROOF ENDPOINT =====
app.post('/api/transactions/submit-proof', upload.single('receipt'), (req, res) => {
  console.log('📄 Submitting proof');
  console.log('📄 Request body:', req.body);
  console.log('📄 Request file:', req.file);

  // Handle FormData with multer
  const { depositId, txHash, walletAddress } = req.body;

  if (!depositId) {
    return res.status(400).json({ message: "Deposit ID is required" });
  }

  console.log('📄 Extracted depositId:', depositId);

  // Find the deposit request
  const deposit = pendingDeposits.find(d => d.id === depositId);
  if (!deposit) {
    console.log('📄 Deposit not found. Available deposits:', pendingDeposits.map(d => d.id));
    return res.status(404).json({ message: "Deposit request not found" });
  }

  if (deposit.status !== 'pending' && deposit.status !== 'verifying') {
    return res.status(400).json({ message: "Deposit request is not pending" });
  }

  // Update deposit with proof information
  deposit.txHash = txHash || `user_upload_${Date.now()}`;
  deposit.walletAddress = walletAddress || 'user_wallet_address';
  deposit.proofSubmittedAt = new Date().toISOString();
  deposit.status = 'verifying';
  deposit.receiptUploaded = true;

  // Store file information if uploaded
  if (req.file) {
    deposit.receiptFile = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    };
  }

  // Save updated data
  pendingData.deposits = pendingDeposits;
  savePendingData();

  console.log('📄 Proof submitted for deposit:', depositId);

  res.json({
    success: true,
    message: "Transaction proof submitted successfully. Your deposit is now being verified.",
    depositId,
    status: 'verifying'
  });
});

// ===== PENDING REQUESTS ENDPOINT =====
app.get('/api/admin/pending-requests', (req, res) => {
  console.log('🔔 Getting pending requests');
  console.log('🔔 Raw pendingDeposits:', pendingDeposits);
  console.log('🔔 Raw pendingWithdrawals:', pendingWithdrawals);

  // Add user balance info and receipt URLs to pending requests
  const depositsWithBalance = pendingDeposits.map(deposit => {
    const user = users.find(u => u.username === deposit.username) || { balance: 20000 };
    const depositWithBalance = { ...deposit, user_balance: user.balance };

    // Add receipt file URL if receipt exists
    if (deposit.receiptFile && deposit.receiptFile.filename) {
      depositWithBalance.receiptUrl = `/api/admin/receipt/${deposit.receiptFile.filename}`;
      depositWithBalance.receiptViewUrl = `http://127.0.0.1:9000/api/admin/receipt/${deposit.receiptFile.filename}`;
    }

    return depositWithBalance;
  });

  const withdrawalsWithBalance = pendingWithdrawals.map(withdrawal => {
    const user = users.find(u => u.username === withdrawal.username) || { balance: 15000 };
    return { ...withdrawal, user_balance: user.balance };
  });

  const pendingRequests = {
    deposits: depositsWithBalance,
    withdrawals: withdrawalsWithBalance,
    total: depositsWithBalance.length + withdrawalsWithBalance.length
  };

  console.log('🔔 Pending requests response:', JSON.stringify(pendingRequests, null, 2));
  res.json(pendingRequests);
});

// ===== DEPOSIT ACTION ENDPOINT =====
app.post('/api/admin/deposits/:id/action', (req, res) => {
  const depositId = req.params.id;
  const { action, reason } = req.body;

  console.log('🏦 Deposit action:', depositId, action, reason);

  // Find the deposit request
  const depositIndex = pendingDeposits.findIndex(d => d.id === depositId);
  if (depositIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Deposit request not found'
    });
  }

  const deposit = pendingDeposits[depositIndex];

  if (action === 'approve') {
    // Find the user and update their balance
    const user = users.find(u => u.username === deposit.username);
    if (user) {
      user.balance += deposit.amount; // Add deposit amount
      console.log('✅ Deposit approved, user balance updated:', user.balance);

      // Add approved transaction record
      const transaction = {
        id: `txn-${Date.now()}`,
        user_id: user.id,
        type: 'deposit',
        amount: deposit.amount,
        status: 'completed',
        description: `Deposit approved by admin - ${deposit.currency} via ${deposit.network}`,
        created_at: new Date().toISOString(),
        users: { username: user.username }
      };
      transactions.push(transaction);
      console.log('📝 Approved deposit transaction recorded - New count:', transactions.length);
      console.log('📝 Transaction details:', transaction);
    }

    // Remove from pending deposits
    pendingDeposits.splice(depositIndex, 1);
    console.log('🗑️ Deposit removed from pending list');

    res.json({
      success: true,
      message: 'Deposit approved successfully',
      action: 'approve'
    });
  } else if (action === 'reject') {
    console.log('❌ Deposit rejected:', reason);

    // Find the user for transaction record
    const user = users.find(u => u.username === deposit.username);

    // Add rejected transaction record
    const transaction = {
      id: `txn-${Date.now()}`,
      user_id: user ? user.id : deposit.user_id,
      type: 'deposit',
      amount: deposit.amount,
      status: 'rejected',
      description: `Deposit rejected by admin - Reason: ${reason || 'No reason provided'} - ${deposit.currency} via ${deposit.network}`,
      created_at: new Date().toISOString(),
      users: { username: deposit.username }
    };
    transactions.push(transaction);
    console.log('📝 Rejected deposit transaction recorded - New count:', transactions.length);
    console.log('📝 Transaction details:', transaction);

    // Remove from pending deposits
    pendingDeposits.splice(depositIndex, 1);
    console.log('🗑️ Deposit removed from pending list');

    res.json({
      success: true,
      message: 'Deposit rejected',
      action: 'reject',
      reason
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }
});

// ===== WITHDRAWAL ACTION ENDPOINT =====
app.post('/api/admin/withdrawals/:id/action', (req, res) => {
  const withdrawalId = req.params.id;
  const { action, reason } = req.body;

  console.log('💸 Withdrawal action:', withdrawalId, action, reason);

  // Find the withdrawal request
  const withdrawalIndex = pendingWithdrawals.findIndex(w => w.id === withdrawalId);
  if (withdrawalIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Withdrawal request not found'
    });
  }

  const withdrawal = pendingWithdrawals[withdrawalIndex];

  if (action === 'approve') {
    // Find the user and update their balance
    const user = users.find(u => u.username === withdrawal.username);
    if (user && user.balance >= withdrawal.amount) {
      user.balance -= withdrawal.amount; // Subtract withdrawal amount
      console.log('✅ Withdrawal approved, user balance updated:', user.balance);

      // Add approved transaction record
      const transaction = {
        id: `txn-${Date.now()}`,
        user_id: user.id,
        type: 'withdrawal',
        amount: withdrawal.amount, // Positive amount for display, negative impact on balance
        status: 'completed',
        description: `Withdrawal approved by admin - ${withdrawal.currency} via ${withdrawal.network} to ${withdrawal.wallet_address}`,
        created_at: new Date().toISOString(),
        users: { username: user.username }
      };
      transactions.push(transaction);
      console.log('📝 Approved withdrawal transaction recorded');
    } else if (user && user.balance < withdrawal.amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient user balance for withdrawal'
      });
    }

    // Remove from pending withdrawals
    pendingWithdrawals.splice(withdrawalIndex, 1);
    console.log('🗑️ Withdrawal removed from pending list');

    res.json({
      success: true,
      message: 'Withdrawal approved successfully',
      action: 'approve'
    });
  } else if (action === 'reject') {
    console.log('❌ Withdrawal rejected:', reason);

    // Find the user for transaction record
    const user = users.find(u => u.username === withdrawal.username);

    // Add rejected transaction record
    const transaction = {
      id: `txn-${Date.now()}`,
      user_id: user ? user.id : withdrawal.user_id,
      type: 'withdrawal',
      amount: withdrawal.amount,
      status: 'rejected',
      description: `Withdrawal rejected by admin - Reason: ${reason || 'No reason provided'} - ${withdrawal.currency} via ${withdrawal.network}`,
      created_at: new Date().toISOString(),
      users: { username: withdrawal.username }
    };
    transactions.push(transaction);
    console.log('📝 Rejected withdrawal transaction recorded');

    // Remove from pending withdrawals
    pendingWithdrawals.splice(withdrawalIndex, 1);
    console.log('🗑️ Withdrawal removed from pending list');

    res.json({
      success: true,
      message: 'Withdrawal rejected',
      action: 'reject',
      reason
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }
});

// ===== ADD NEW PENDING REQUEST (FOR TESTING) =====
app.post('/api/admin/add-test-requests', (req, res) => {
  console.log('🧪 Adding test pending requests');

  // Add a new test deposit if none exist
  if (pendingDeposits.length === 0) {
    pendingDeposits.push({
      id: `dep-${Date.now()}`,
      user_id: 'user-3',
      username: 'trader3',
      amount: 750,
      currency: 'USDT',
      network: 'TRC20',
      status: 'pending',
      wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96590b4165',
      created_at: new Date().toISOString()
    });
  }

  // Add a new test withdrawal if none exist
  if (pendingWithdrawals.length === 0) {
    pendingWithdrawals.push({
      id: `with-${Date.now()}`,
      user_id: 'user-4',
      username: 'trader4',
      amount: 300,
      currency: 'USDT',
      network: 'ERC20',
      status: 'pending',
      wallet_address: '0x8ba1f109551bD432803012645Hac136c22C501e5',
      created_at: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Test requests added',
    deposits: pendingDeposits.length,
    withdrawals: pendingWithdrawals.length
  });
});

// ===== TRANSACTION ENDPOINTS =====
app.get('/api/admin/transactions', (req, res) => {
  console.log('💰 Getting transactions list - Count:', transactions.length);
  res.json(transactions);
});

// ===== SYSTEM STATS ENDPOINTS =====
app.get('/api/superadmin/system-stats', (req, res) => {
  console.log('📊 Getting system stats');

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    suspendedUsers: users.filter(u => u.status === 'suspended').length,
    bannedUsers: users.filter(u => u.status === 'banned').length,
    totalTrades: trades.length,
    pendingTrades: trades.filter(t => t.result === 'pending').length,
    winningTrades: trades.filter(t => t.result === 'win').length,
    losingTrades: trades.filter(t => t.result === 'lose').length,
    totalTransactions: transactions.length,
    pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0)
  };

  console.log('📊 Stats calculated:', stats);
  res.json(stats);
});

// ===== RECEIPT FILE SERVING ENDPOINT =====
app.get('/api/admin/receipt/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  console.log('📄 Serving receipt file:', filename);
  console.log('📄 File path:', filePath);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log('❌ Receipt file not found:', filePath);
    return res.status(404).json({ message: 'Receipt file not found' });
  }

  // Get file stats to determine MIME type
  const stats = fs.statSync(filePath);
  console.log('📄 File stats:', { size: stats.size, isFile: stats.isFile() });

  // Set appropriate headers based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';

  if (ext === '.jpg' || ext === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (ext === '.png') {
    contentType = 'image/png';
  } else if (ext === '.pdf') {
    contentType = 'application/pdf';
  }

  // Find the original filename from deposit data
  let originalName = filename;
  for (const deposit of pendingDeposits) {
    if (deposit.receiptFile && deposit.receiptFile.filename === filename) {
      originalName = deposit.receiptFile.originalname || filename;
      contentType = deposit.receiptFile.mimetype || contentType;
      break;
    }
  }

  console.log('📄 Serving file with content type:', contentType);
  console.log('📄 Original filename:', originalName);

  // Set headers
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);

  // Serve the file
  res.sendFile(filePath);
});

// ===== ADMIN STATS ENDPOINT (for WorkingAdminDashboard) =====
app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Getting admin stats');

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalTrades: trades.length,
    activeTrades: trades.filter(t => t.result === 'pending').length,
    totalTransactions: transactions.length,
    totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    winRate: trades.length > 0 ? Math.round((trades.filter(t => t.result === 'win').length / trades.filter(t => t.result !== 'pending').length) * 100) : 0,
    totalProfit: transactions.filter(t => t.type === 'trade_win' || t.type === 'bonus').reduce((sum, t) => sum + t.amount, 0),
    totalLoss: Math.abs(transactions.filter(t => t.type === 'trade_loss').reduce((sum, t) => sum + t.amount, 0))
  };

  console.log('📊 Admin stats calculated:', stats);
  res.json(stats);
});

// ===== TRADING SETTINGS ENDPOINT =====
app.get('/api/admin/trading-settings', (req, res) => {
  console.log('⚙️ Getting trading settings');
  res.json([
    {
      id: 'setting-30s',
      duration: 30,
      min_amount: 100,
      profit_percentage: 10,
      enabled: true
    },
    {
      id: 'setting-60s',
      duration: 60,
      min_amount: 1000,
      profit_percentage: 15,
      enabled: true
    }
  ]);
});

// ===== SPA ROUTING =====
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('📄 Serving SPA route:', req.path);
  
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

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log('🎉 ===================================');
  console.log('🚀 METACHROME V2 WORKING SERVER READY!');
  console.log('🌐 Server running on: http://127.0.0.1:' + PORT);
  console.log('🔧 Admin Dashboard: http://127.0.0.1:' + PORT + '/admin');
  console.log('🔐 Login: superadmin / superadmin123');
  console.log('📊 All endpoints are FULLY FUNCTIONAL!');
  console.log('🎉 ===================================');
});
