import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist/public
const distPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(distPath));

console.log('🚀 METACHROME V2 - QUICK SERVER STARTING (NO BUILD)...');
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
    id: 'superadmin-1',
    username: 'superadmin',
    email: 'superadmin@metachrome.io',
    balance: 100000,
    role: 'super_admin',
    status: 'active',
    trading_mode: 'normal',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
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
  console.log('🚀 METACHROME V2 QUICK SERVER READY!');
  console.log('🌐 Server running on: http://127.0.0.1:' + PORT);
  console.log('🔧 Admin Dashboard: http://127.0.0.1:' + PORT + '/admin');
  console.log('🔐 Login: superadmin / superadmin123');
  console.log('📊 All endpoints are FUNCTIONAL!');
  console.log('🎉 ===================================');
});
