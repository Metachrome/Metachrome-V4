const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const postgres = require('postgres');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const client = postgres(process.env.DATABASE_URL);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Fixed signup endpoint that works with the existing database schema
app.post('/api/auth/user/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    console.log('🔄 Registration attempt:', { username, email, firstName, lastName });
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists (check both username columns)
    const existingUser = await client`
      SELECT id FROM users 
      WHERE username = ${username} 
      OR email = ${email}
      LIMIT 1
    `;
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with the correct schema
    const newUser = await client`
      INSERT INTO users (
        username, 
        email, 
        password_hash,
        "firstName",
        "lastName", 
        role,
        balance,
        status,
        trading_mode,
        "isActive",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${username},
        ${email},
        ${hashedPassword},
        ${firstName || ''},
        ${lastName || ''},
        'user',
        10000,
        'active',
        'normal',
        true,
        NOW(),
        NOW()
      )
      RETURNING id, username, email, "firstName", "lastName", role, balance, "isActive"
    `;

    console.log('✅ User created successfully:', newUser[0]);

    // Generate a simple token (in production, use proper JWT)
    const token = `user-session-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    res.json({
      success: true,
      user: newUser[0],
      token,
      message: "Registration successful"
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: "Registration failed: " + error.message 
    });
  }
});

// Login endpoint
app.post('/api/auth/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user
    const users = await client`
      SELECT id, username, email, password_hash, "firstName", "lastName", role, balance, "isActive"
      FROM users 
      WHERE username = ${username} OR email = ${username}
      LIMIT 1
    `;

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = `user-session-${Date.now()}-${Math.random().toString(36).substring(2)}`;

    // Remove password from response
    delete user.password_hash;

    res.json({
      success: true,
      user,
      token,
      message: "Login successful"
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get current user
app.get('/api/auth', (req, res) => {
  // Simple auth check - in production, verify JWT token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || !token.startsWith('user-session-')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // For demo purposes, return a mock user
  // In production, decode token and fetch user from database
  res.json({
    id: 'demo-user',
    username: 'demo',
    email: 'demo@example.com',
    role: 'user'
  });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const result = await client`SELECT version()`;
    res.json({
      server: 'METACHROME V2 Fixed Signup Server',
      status: 'running',
      database: 'Connected: ' + result[0].version.split(' ')[0],
      port: PORT
    });
  } catch (error) {
    res.json({
      server: 'METACHROME V2 Fixed Signup Server',
      status: 'running',
      database: 'Error: ' + error.message,
      port: PORT
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('🚀 METACHROME V2 Fixed Signup Server running on port:', PORT);
  console.log('🌐 Visit: http://localhost:' + PORT);
  console.log('📊 Status: http://localhost:' + PORT + '/api/status');
  console.log('🔐 Signup: POST http://localhost:' + PORT + '/api/auth/user/register');
});
