// Simple server specifically for admin dashboard testing
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 9000;

// Initialize database connection
const db = new Database('./dev.db');
console.log('📊 Database connected successfully');

console.log('🚀 Starting admin server...');
console.log('📁 Current directory:', __dirname);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
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

// Admin API endpoints
app.get('/api/admin/users', (req, res) => {
  console.log('🔄 Admin users request received');

  try {
    // Get real users from database
    const users = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
    console.log('📊 Found users in database:', users.length);
    
    // Format users for admin dashboard
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      isActive: true,
      createdAt: user.createdAt,
      lastLogin: user.updatedAt || user.createdAt,
      walletAddress: user.walletAddress
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('❌ Error fetching users from database:', error);
    
    // Fallback to demo users if database fails
    const demoUsers = [
      {
        id: 'demo-user-1',
        username: 'trader1',
        email: 'trader1@demo.com',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date(),
        walletAddress: null
      },
      {
        id: 'demo-admin-1',
        username: 'admin',
        email: 'admin@demo.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        lastLogin: new Date(),
        walletAddress: null
      }
    ];

    res.json(demoUsers);
  }
});

app.get('/api/admin/controls', (req, res) => {
  console.log('🔄 Admin controls request received');
  res.json([]);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, '127.0.0.1', () => {
  console.log(`🌐 Admin server running on http://127.0.0.1:${port}`);
  console.log('📋 Available endpoints:');
  console.log('  - GET /api/admin/users');
  console.log('  - GET /api/admin/controls');
  console.log('  - GET /health');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down admin server...');
  db.close();
  process.exit(0);
});
