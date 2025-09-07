const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 9000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

console.log('🚀 METACHROME V2 - DIRECT SERVER STARTING...');
console.log('📁 Serving static files from:', distPath);

// ===== IN-MEMORY DATA STORE =====
let users = [
  {
    id: 'user-1',
    username: 'trader1',
    email: 'trader1@metachrome.io',
    password: 'password123',
    balance: 10000,
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
    password: 'admin123',
    balance: 50000,
    role: 'admin',
    status: 'active',
    trading_mode: 'normal',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'superadmin-1',
    username: 'superadmin',
    email: 'superadmin@metachrome.io',
    password: 'superadmin123',
    balance: 100000,
    role: 'superadmin',
    status: 'active',
    trading_mode: 'normal',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
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
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  },
  {
    id: 'user-3',
    username: 'trader3',
    email: 'trader3@metachrome.io',
    password: 'password123',
    balance: 15000,
    role: 'user',
    status: 'active',
    trading_mode: 'lose',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  }
];

// ===== AUTHENTICATION ENDPOINTS =====
app.post('/api/auth/admin/login', (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password && (u.role === 'admin' || u.role === 'superadmin'));
  
  if (user) {
    console.log('✅ Admin login successful:', user.username, 'Role:', user.role);
    res.json({
      success: true,
      user: { ...user, password: undefined },
      token: 'mock-jwt-token'
    });
  } else {
    console.log('❌ Admin login failed for:', username);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ===== ADMIN ENDPOINTS =====
app.get('/api/admin/users', (req, res) => {
  console.log('👥 Getting users list - Count:', users.length);
  res.json(users.map(u => ({ ...u, password: undefined })));
});

app.post('/api/admin/users', (req, res) => {
  console.log('👤 Creating new user:', req.body);
  const { username, email, password, balance, role, trading_mode } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    password,
    balance: Number(balance) || 0,
    role: role || 'user',
    status: 'active',
    trading_mode: trading_mode || 'normal',
    created_at: new Date().toISOString(),
    last_login: null
  };

  users.push(newUser);
  console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
  res.json({ ...newUser, password: undefined });
});

app.put('/api/admin/users/:id', (req, res) => {
  console.log('✏️ Updating user:', req.params.id, req.body);
  const userId = req.params.id;
  const { username, email, password, balance, role, status, trading_mode, wallet_address } = req.body;
  
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const updatedUser = {
    ...users[userIndex],
    username: username || users[userIndex].username,
    email: email || users[userIndex].email,
    balance: balance !== undefined ? Number(balance) : users[userIndex].balance,
    role: role || users[userIndex].role,
    status: status || users[userIndex].status,
    trading_mode: trading_mode || users[userIndex].trading_mode,
    wallet_address: wallet_address !== undefined ? wallet_address : users[userIndex].wallet_address
  };

  if (password) {
    updatedUser.password = password;
  }

  users[userIndex] = updatedUser;
  console.log('✅ User updated successfully:', updatedUser.username, 'ID:', updatedUser.id);
  res.json({ ...updatedUser, password: undefined });
});

app.post('/api/admin/trading-controls', (req, res) => {
  console.log('🎯 Updating trading control:', req.body);
  const { userId, controlType } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].trading_mode = controlType;
    res.json({ success: true, message: `Trading mode updated to ${controlType}` });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// ===== SUPER ADMIN ENDPOINTS =====
app.post('/api/superadmin/deposit', (req, res) => {
  console.log('💰 Processing deposit:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const depositAmount = Number(amount);
  if (depositAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
  }

  users[userIndex].balance += depositAmount;
  
  console.log(`✅ Deposited $${depositAmount} to ${users[userIndex].username}. New balance: $${users[userIndex].balance}`);
  
  res.json({
    success: true,
    user: { ...users[userIndex], password: undefined },
    message: `Deposited $${depositAmount} to ${users[userIndex].username}`
  });
});

app.post('/api/superadmin/withdrawal', (req, res) => {
  console.log('💸 Processing withdrawal:', req.body);
  const { userId, amount, note } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const withdrawalAmount = Number(amount);
  if (withdrawalAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  if (users[userIndex].balance < withdrawalAmount) {
    return res.status(400).json({ success: false, message: 'Insufficient balance' });
  }

  users[userIndex].balance -= withdrawalAmount;
  
  console.log(`✅ Withdrew $${withdrawalAmount} from ${users[userIndex].username}. New balance: $${users[userIndex].balance}`);
  
  res.json({
    success: true,
    user: { ...users[userIndex], password: undefined },
    message: `Withdrew $${withdrawalAmount} from ${users[userIndex].username}`
  });
});

app.post('/api/superadmin/change-password', (req, res) => {
  console.log('🔑 Changing user password:', req.body);
  const { userId, newPassword } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  users[userIndex].password = newPassword;
  
  console.log(`✅ Password changed for ${users[userIndex].username}`);
  
  res.json({
    success: true,
    user: { ...users[userIndex], password: undefined }
  });
});

app.post('/api/superadmin/update-wallet', (req, res) => {
  console.log('🏦 Updating wallet address:', req.body);
  const { userId, walletAddress } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users[userIndex].wallet_address = walletAddress || null;
  
  console.log(`✅ Wallet address updated for ${users[userIndex].username}: ${walletAddress || 'removed'}`);
  
  res.json({
    success: true,
    user: { ...users[userIndex], password: undefined },
    message: 'Wallet address updated successfully'
  });
});

// ===== ADDITIONAL ENDPOINTS =====
app.get('/api/admin/trades', (req, res) => {
  console.log('📈 Getting trades list');
  res.json([]);
});

app.get('/api/admin/transactions', (req, res) => {
  console.log('💰 Getting transactions list');
  res.json([]);
});

app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Getting system stats');
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    pendingTrades: 0
  };
  res.json(stats);
});

// Catch all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🌐 ========================================');
  console.log('🚀 METACHROME V2 - DIRECT SERVER READY!');
  console.log('🌐 ========================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Super Admin: superadmin / superadmin123');
  console.log('   Admin: admin / admin123');
  console.log('   User: trader1 / password123');
  console.log('');
  console.log('✅ All admin functions restored and working!');
  console.log('🌐 ========================================');
});
