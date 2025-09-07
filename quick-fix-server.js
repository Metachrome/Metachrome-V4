const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 9000;

// Persistent storage file
const USERS_FILE = path.join(__dirname, 'users-data.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

console.log('🚀 QUICK FIX SERVER STARTING ON PORT 9000...');

// Storage functions
function loadUsersFromFile() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading users from file:', error);
  }

  // Return default users if file doesn't exist or error
  return [
    { id: 'user-1', username: 'trader1', email: 'trader1@metachrome.io', password: 'password123', balance: 10000, role: 'user', status: 'active', trading_mode: 'normal', created_at: new Date().toISOString() },
    { id: 'admin-1', username: 'admin', email: 'admin@metachrome.io', password: 'admin123', balance: 50000, role: 'admin', status: 'active', trading_mode: 'normal', created_at: new Date().toISOString() },
    { id: 'superadmin-1', username: 'superadmin', email: 'superadmin@metachrome.io', password: 'superadmin123', balance: 100000, role: 'superadmin', status: 'active', trading_mode: 'normal', created_at: new Date().toISOString() }
  ];
}

function saveUsersToFile() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    console.log('💾 Users data saved to file');
  } catch (error) {
    console.error('Error saving users to file:', error);
  }
}

// Load users data from file or use defaults
let users = loadUsersFromFile();
console.log(`📊 Loaded ${users.length} users from storage`);

// Admin login
app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password && (u.role === 'admin' || u.role === 'superadmin'));
  
  if (user) {
    res.json({ success: true, user: { ...user, password: undefined }, token: 'mock-jwt-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Get users
app.get('/api/admin/users', (req, res) => {
  res.json(users.map(u => ({ ...u, password: undefined })));
});

// Create new user
app.post('/api/admin/users', (req, res) => {
  console.log('👤 Creating new user:', req.body);
  const { username, email, password, balance, role, trading_mode } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields: username, email, and password are required' });
  }

  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  // Check if email already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    email,
    password,
    balance: Number(balance) || 10000,
    role: role || 'user',
    status: 'active',
    trading_mode: trading_mode || 'normal',
    wallet_address: null,
    created_at: new Date().toISOString(),
    last_login: null
  };

  users.push(newUser);
  saveUsersToFile(); // Save to persistent storage
  console.log('✅ User created successfully:', newUser.username, 'ID:', newUser.id);
  res.json({ success: true, user: { ...newUser, password: undefined } });
});

// Update user
app.put('/api/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users[userIndex] = { ...users[userIndex], ...updates, updated_at: new Date().toISOString() };
  saveUsersToFile(); // Save to persistent storage
  res.json({ success: true, user: { ...users[userIndex], password: undefined } });
});

// Deposit
app.post('/api/superadmin/deposit', (req, res) => {
  const { userId, amount } = req.body;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users[userIndex].balance += Number(amount);
  users[userIndex].updated_at = new Date().toISOString();
  saveUsersToFile(); // Save to persistent storage
  res.json({ success: true, user: { ...users[userIndex], password: undefined } });
});

// Withdrawal
app.post('/api/superadmin/withdrawal', (req, res) => {
  const { userId, amount } = req.body;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users[userIndex].balance -= Number(amount);
  users[userIndex].updated_at = new Date().toISOString();
  saveUsersToFile(); // Save to persistent storage
  res.json({ success: true, user: { ...users[userIndex], password: undefined } });
});

// Change password
app.post('/api/superadmin/change-password', (req, res) => {
  const { userId, newPassword } = req.body;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users[userIndex].password = newPassword;
  users[userIndex].updated_at = new Date().toISOString();
  saveUsersToFile(); // Save to persistent storage
  res.json({ success: true, user: { ...users[userIndex], password: undefined } });
});

// Update wallet
app.post('/api/superadmin/update-wallet', (req, res) => {
  const { userId, walletAddress } = req.body;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  users[userIndex].wallet_address = walletAddress;
  users[userIndex].updated_at = new Date().toISOString();
  saveUsersToFile(); // Save to persistent storage
  res.json({ success: true, user: { ...users[userIndex], password: undefined } });
});

// Trading controls
app.post('/api/admin/trading-controls', (req, res) => {
  const { userId, controlType } = req.body;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    users[userIndex].trading_mode = controlType;
    users[userIndex].updated_at = new Date().toISOString();
    saveUsersToFile(); // Save to persistent storage
    res.json({ success: true, message: `Trading mode updated to ${controlType}` });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Other endpoints
app.get('/api/admin/trades', (req, res) => res.json([]));
app.get('/api/admin/transactions', (req, res) => res.json([]));
app.get('/api/admin/stats', (req, res) => res.json({ totalUsers: users.length, activeUsers: users.length, totalBalance: users.reduce((sum, u) => sum + u.balance, 0) }));

// Catch all
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('🌐 ========================================');
  console.log('🚀 QUICK FIX SERVER READY!');
  console.log('🌐 ========================================');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
  console.log('');
  console.log('📋 Credentials:');
  console.log('   Super Admin: superadmin / superadmin123');
  console.log('   Admin: admin / admin123');
  console.log('🌐 ========================================');
});
