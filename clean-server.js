const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 9002;

// Data file path
const DATA_FILE = path.join(__dirname, 'admin-data.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from dist/public
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

console.log('🚀 METACHROME V2 - CLEAN SERVER STARTING...');
console.log('📁 Serving static files from:', distPath);

// ===== SIMPLE DATA PERSISTENCE =====
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      console.log('📂 Loaded data from file:', DATA_FILE);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Error loading data file:', error);
  }
  
  // Return default data if file doesn't exist or error occurred
  console.log('📝 Using default data (no saved file found)');
  return {
    users: [
      {
        id: 'superadmin-1',
        username: 'superadmin',
        email: 'superadmin@metachrome.io',
        password: 'superadmin123',
        balance: 100000,
        role: 'super_admin',
        status: 'active',
        trading_mode: 'normal',
        wallet_address: '0x1234567890123456789012345678901234567890',
        created_at: new Date().toISOString()
      },
      {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@metachrome.io',
        password: 'admin123',
        balance: 50000,
        role: 'admin',
        status: 'active',
        trading_mode: 'normal',
        wallet_address: '0x2345678901234567890123456789012345678901',
        created_at: new Date().toISOString()
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
        wallet_address: '0x3456789012345678901234567890123456789012',
        created_at: new Date().toISOString()
      },
      {
        id: 'user-2',
        username: 'trader2',
        email: 'trader2@metachrome.io',
        password: 'password123',
        balance: 5000,
        role: 'user',
        status: 'active',
        trading_mode: 'normal',
        wallet_address: '0x4567890123456789012345678901234567890123',
        created_at: new Date().toISOString()
      },
      {
        id: 'user-3',
        username: 'trader3',
        email: 'trader3@metachrome.io',
        password: 'password123',
        balance: 15000,
        role: 'user',
        status: 'active',
        trading_mode: 'normal',
        wallet_address: '0x5678901234567890123456789012345678901234',
        created_at: new Date().toISOString()
      }
    ]
  };
}

function saveData() {
  try {
    const data = {
      users: users,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Data saved to file:', DATA_FILE);
  } catch (error) {
    console.error('❌ Error saving data file:', error);
  }
}

// Load data on startup
const loadedData = loadData();
let users = loadedData.users;

// ===== AUTHENTICATION ENDPOINTS =====
app.post('/api/auth/admin/login', (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);
  const { username, password } = req.body;

  // Mock authentication - accept any admin/superadmin user
  const user = users.find(u => u.username === username && (u.role === 'admin' || u.role === 'super_admin'));

  if (user) {
    console.log('✅ Login successful for:', username);
    res.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: user
    });
  } else {
    console.log('❌ Login failed for:', username);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ===== ADMIN ENDPOINTS =====
// Get all users
app.get('/api/admin/users', (req, res) => {
  console.log('👥 Getting users list - Count:', users.length);
  res.json(users);
});

// Create new user
app.post('/api/admin/users', (req, res) => {
  console.log('👤 Creating new user:', req.body);
  const { username, email, password, balance, role, trading_mode } = req.body;
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    id: 'user-' + Date.now(),
    username,
    email,
    password: password || 'password123',
    balance: Number(balance) || 0,
    role: role || 'user',
    status: 'active',
    trading_mode: trading_mode || 'normal',
    wallet_address: '',
    created_at: new Date().toISOString()
  };
  
  users.push(newUser);
  saveData(); // Save to file
  console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
  res.json(newUser);
});

// Update user
app.put('/api/admin/users/:id', (req, res) => {
  console.log('✏️ Updating user:', req.params.id, req.body);
  const userId = req.params.id;
  const { username, email, password, balance, role, status, trading_mode, wallet_address } = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    console.log('❌ User not found:', userId);
    return res.status(404).json({ error: 'User not found' });
  }

  // Check if username already exists (excluding current user)
  if (username && users.find(u => u.username === username && u.id !== userId)) {
    console.log('❌ Username already exists:', username);
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Update user data
  const updatedUser = {
    ...users[userIndex],
    ...(username && { username }),
    ...(email && { email }),
    ...(password && { password }),
    ...(balance !== undefined && { balance: Number(balance) }),
    ...(role && { role }),
    ...(status && { status }),
    ...(trading_mode && { trading_mode }),
    ...(wallet_address !== undefined && { wallet_address }),
    updated_at: new Date().toISOString()
  };

  users[userIndex] = updatedUser;
  saveData(); // Save to file
  console.log('✅ User updated successfully:', updatedUser.username, 'ID:', updatedUser.id);
  res.json(updatedUser);
});

// Trading controls
app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 Updating trading control:', req.body);
  const { userId, controlType } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].trading_mode = controlType;
    saveData(); // Save to file
    console.log('✅ Trading control updated for user:', users[userIndex].username);
    res.json({ success: true, user: users[userIndex] });
  } else {
    console.log('❌ User not found for trading control:', userId);
    res.status(404).json({ error: 'User not found' });
  }
});

// ===== ADDITIONAL API ENDPOINTS =====
// Trades endpoint
app.get('/api/admin/trades', (req, res) => {
  console.log('📈 Getting trades list');
  res.json([]);
});

// Trade control endpoint
app.post('/api/admin/trades/:tradeId/control', (req, res) => {
  console.log('🎮 Controlling trade:', req.params.tradeId, req.body);
  const { tradeId } = req.params;
  const { action } = req.body;

  // Mock trade control - just return success
  console.log('✅ Trade control executed:', tradeId, action);
  res.json({
    success: true,
    tradeId,
    action,
    message: `Trade ${tradeId} set to ${action}`
  });
});

// Transactions endpoint
app.get('/api/admin/transactions', (req, res) => {
  console.log('💰 Getting transactions list');
  res.json([]);
});

// Trading settings endpoint
app.get('/api/admin/trading-settings', (req, res) => {
  console.log('⚙️ Getting trading settings');
  res.json({
    enabled: true,
    minAmount: 10,
    maxAmount: 10000,
    tradingHours: '24/7'
  });
});

// System stats endpoint
app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Getting system stats');
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    activeTrades: 0
  };
  res.json(stats);
});

// ===== SUPER ADMIN SPECIFIC ENDPOINTS =====

// Balance Management - Deposit
app.post('/api/superadmin/deposit', (req, res) => {
  console.log('💰 Processing deposit:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const depositAmount = Number(amount);
  if (depositAmount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  // Update user balance
  users[userIndex].balance += depositAmount;
  saveData();

  console.log('✅ Deposit processed:', depositAmount, 'for user:', users[userIndex].username);
  res.json({
    success: true,
    user: users[userIndex],
    message: `Deposited $${depositAmount} to ${users[userIndex].username}`
  });
});

// Balance Management - Withdrawal
app.post('/api/superadmin/withdrawal', (req, res) => {
  console.log('💸 Processing withdrawal:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const withdrawalAmount = Number(amount);
  if (withdrawalAmount <= 0) {
    return res.status(400).json({ error: 'Invalid withdrawal amount' });
  }

  if (users[userIndex].balance < withdrawalAmount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  // Update user balance
  users[userIndex].balance -= withdrawalAmount;
  saveData();

  console.log('✅ Withdrawal processed:', withdrawalAmount, 'for user:', users[userIndex].username);
  res.json({
    success: true,
    user: users[userIndex],
    message: `Withdrew $${withdrawalAmount} from ${users[userIndex].username}`
  });
});

// Password Management - Change user password
app.post('/api/superadmin/change-password', (req, res) => {
  console.log('🔑 Changing user password:', req.body);
  const { userId, newPassword } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  users[userIndex].password = newPassword;
  users[userIndex].password_changed_at = new Date().toISOString();
  saveData();

  console.log('✅ Password changed for user:', users[userIndex].username);
  res.json({
    success: true,
    message: 'Password updated successfully',
    user: { ...users[userIndex], password: undefined }
  });
});

// Wallet Address Management
app.post('/api/superadmin/update-wallet', (req, res) => {
  console.log('🏦 Updating wallet address:', req.body);
  const { userId, walletAddress } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Store previous wallet address in history
  if (!users[userIndex].wallet_history) {
    users[userIndex].wallet_history = [];
  }

  // Add current wallet to history if it exists
  if (users[userIndex].wallet_address) {
    users[userIndex].wallet_history.push({
      address: users[userIndex].wallet_address,
      changed_at: users[userIndex].wallet_updated_at || users[userIndex].created_at,
      changed_by: 'superadmin'
    });
  }

  // Update to new wallet address
  users[userIndex].wallet_address = walletAddress;
  users[userIndex].wallet_updated_at = new Date().toISOString();
  saveData();

  console.log('✅ Wallet address updated for user:', users[userIndex].username);
  res.json({
    success: true,
    user: users[userIndex],
    message: 'Wallet address updated successfully'
  });
});

// Get wallet history for a user
app.get('/api/superadmin/wallet-history/:userId', (req, res) => {
  console.log('📜 Getting wallet history for user:', req.params.userId);
  const { userId } = req.params;

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const history = user.wallet_history || [];
  res.json({
    current_wallet: user.wallet_address,
    history: history
  });
});

// Enhanced authentication with real password checking
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 User login attempt:', req.body);
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    console.log('✅ User login successful for:', username);
    res.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: { ...user, password: undefined }
    });
  } else {
    console.log('❌ User login failed for:', username);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ===== CATCH-ALL ROUTE =====
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ===== START SERVER =====
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🌐 Server running on: http://127.0.0.1:${PORT}`);
  console.log(`🔧 Admin Panel: http://127.0.0.1:${PORT}/admin`);
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Super Admin: superadmin / superadmin123');
  console.log('   Admin: admin / admin123');
  console.log('   User: trader1 / password123');
  console.log('');
  console.log('✅ Server ready! User editing should work now!');
});
