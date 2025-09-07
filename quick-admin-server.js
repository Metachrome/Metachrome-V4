const express = require('express');
const path = require('path');
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

console.log('🚀 METACHROME V2 - QUICK ADMIN SERVER STARTING...');
console.log('📁 Serving static files from:', distPath);

// ===== IN-MEMORY DATA STORE =====
let users = [
  {
    id: 'user-1',
    username: 'trader1',
    email: 'trader1@metachrome.io',
    balance: 10000,
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@metachrome.io',
    balance: 50000,
    role: 'admin',
    status: 'active',
    trading_mode: 'normal',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    username: 'trader2',
    email: 'trader2@metachrome.io',
    balance: 5000,
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-3',
    username: 'trader3',
    email: 'trader3@metachrome.io',
    balance: 15000,
    role: 'user',
    status: 'active',
    trading_mode: 'normal',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'superadmin-1',
    username: 'superadmin',
    email: 'superadmin@metachrome.io',
    balance: 100000,
    role: 'superadmin',
    status: 'active',
    trading_mode: 'normal',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// ===== AUTHENTICATION ENDPOINTS =====
app.post('/api/admin/login', (req, res) => {
  console.log('🔐 Admin login attempt:', req.body);
  const { username, password } = req.body;
  
  // Mock authentication - accept any admin/superadmin user
  const user = users.find(u => u.username === username && (u.role === 'admin' || u.role === 'superadmin'));
  
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

// ===== USER MANAGEMENT ENDPOINTS =====
app.get('/api/admin/users', (req, res) => {
  console.log('👥 Getting users list - Count:', users.length);
  res.json(users);
});

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
    balance: Number(balance) || 0,
    role: role || 'user',
    status: 'active',
    trading_mode: trading_mode || 'normal',
    created_at: new Date().toISOString()
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

// ===== SPA ROUTING =====
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('📄 Serving SPA route:', req.path);
  res.sendFile(indexPath);
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🌐 Server running on: http://127.0.0.1:' + PORT);
  console.log('🔧 Admin Panel: http://127.0.0.1:' + PORT + '/admin');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Super Admin: superadmin / superadmin123');
  console.log('   Admin: admin / admin123');
  console.log('   User: trader1 / password123');
  console.log('');
  console.log('✅ Server ready for user editing!');
});
