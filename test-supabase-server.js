import express from 'express';
import postgres from 'postgres';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 4000;

// Database connection
const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
const client = postgres(DATABASE_URL);

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Serve static files from dist/public
const distPath = path.resolve(__dirname, 'dist', 'public');
console.log('📁 Serving static files from:', distPath);
app.use(express.static(distPath));

// Auth endpoint (handles both registration and login)
app.post('/api/auth', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // If email is provided, this is a registration
    if (email && username && password) {
      console.log('🔐 Registration attempt:', { username, email, firstName, lastName });

      // Check if user already exists
      const existingUsers = await client`
        SELECT id FROM users
        WHERE email = ${email} OR username = ${username}
      `;

      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in database
      const newUsers = await client`
        INSERT INTO users (username, email, password, role, "firstName", "lastName", "isActive", "createdAt", "updatedAt")
        VALUES (${username}, ${email}, ${hashedPassword}, 'user', ${firstName || null}, ${lastName || null}, true, NOW(), NOW())
        RETURNING id, username, email, role, "firstName", "lastName", "isActive", "createdAt"
      `;

      const newUser = newUsers[0];
      console.log('✅ User created successfully:', { id: newUser.id, username, email });

      // Return success response
      return res.json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        },
        message: "Registration successful",
        success: true
      });
    }

    // If no email, this is a login
    if (username && password) {
      console.log('🔐 Login attempt:', { username });

      // Find user by username or email
      const users = await client`
        SELECT * FROM users
        WHERE username = ${username} OR email = ${username}
      `;

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      console.log('✅ Login successful:', { id: user.id, username: user.username });

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName
        },
        message: "Login successful",
        success: true
      });
    }

    return res.status(400).json({ message: 'Username and password are required' });


  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const users = await client`SELECT * FROM users ORDER BY "createdAt" DESC`;
    res.json({
      success: true,
      userCount: users.length,
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin users endpoint
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await client`SELECT * FROM users ORDER BY "createdAt" DESC`;
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin balances endpoint
app.get('/api/admin/balances', async (req, res) => {
  try {
    const balances = await client`
      SELECT b.*, u.username, u.email 
      FROM balances b 
      LEFT JOIN users u ON b."userId" = u.id 
      ORDER BY b."createdAt" DESC
    `;
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin trades endpoint
app.get('/api/admin/trades', async (req, res) => {
  try {
    const trades = await client`
      SELECT t.*, u.username, u.email 
      FROM trades t 
      LEFT JOIN users u ON t."userId" = u.id 
      ORDER BY t."createdAt" DESC
    `;
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Supabase test server running on http://localhost:${port}`);
  console.log(`📊 Test endpoint: http://localhost:${port}/api/test`);
  console.log(`👥 Admin users: http://localhost:${port}/api/admin/users`);
  console.log(`💰 Admin balances: http://localhost:${port}/api/admin/balances`);
  console.log(`📈 Admin trades: http://localhost:${port}/api/admin/trades`);
});
