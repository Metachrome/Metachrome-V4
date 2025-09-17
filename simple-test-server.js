const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Test database connection
let dbStatus = 'Not tested';
let userTableExists = false;

async function testDatabase() {
  try {
    const postgres = require('postgres');
    const client = postgres(process.env.DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    dbStatus = 'Connected: ' + result[0].version.split(' ')[0];
    
    // Check users table
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    userTableExists = tables.length > 0;
    
    await client.end();
    console.log('✅ Database test completed');
  } catch (error) {
    dbStatus = 'Error: ' + error.message;
    console.error('❌ Database test failed:', error.message);
  }
}

// Test database on startup
testDatabase();

// Routes
app.get('/api/status', (req, res) => {
  res.json({
    server: 'METACHROME V2 Test Server',
    status: 'running',
    database: dbStatus,
    userTableExists,
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

app.get('/api/test-signup', async (req, res) => {
  try {
    const postgres = require('postgres');
    const client = postgres(process.env.DATABASE_URL);
    
    // Test user creation
    const testUser = {
      username: 'test_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'test123'
    };
    
    const result = await client`
      INSERT INTO users (username, email, password, role)
      VALUES (${testUser.username}, ${testUser.email}, ${testUser.password}, 'user')
      RETURNING id, username, email, role, created_at
    `;
    
    await client.end();
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: result[0]
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('🚀 METACHROME V2 Test Server running on port:', PORT);
  console.log('🌐 Visit: http://localhost:' + PORT);
  console.log('📊 Status: http://localhost:' + PORT + '/api/status');
  console.log('🧪 Test signup: http://localhost:' + PORT + '/api/test-signup');
});
