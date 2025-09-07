// Simple test to check the logs endpoint
const express = require('express');
const app = express();
const port = 5001;

app.use(express.json());

// Simple middleware
const requireAdmin = (req, res, next) => {
  console.log(`🔐 requireAdmin middleware called for: ${req.method} ${req.url}`);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  console.log(`🔑 Token received:`, token ? `${token.substring(0, 10)}...` : 'none');

  if (!token) {
    console.log(`❌ No token provided`);
    return res.status(401).json({ message: "No token provided" });
  }

  // Mock user for testing
  req.user = { username: 'testuser', role: 'super_admin' };
  next();
};

// Test logs endpoint
app.get('/api/admin/system/logs/full', requireAdmin, (req, res) => {
  console.log(`🔍 Full logs endpoint hit by user:`, req.user);
  
  if (req.user.role !== 'super_admin') {
    console.log(`❌ Access denied - user role: ${req.user.role}`);
    return res.status(403).json({ message: 'Super admin access required' });
  }

  console.log(`📋 Full system logs requested by ${req.user.username}`);

  // Generate simple test logs
  const logEntries = [
    `[${new Date().toISOString()}] INFO: Test log entry 1`,
    `[${new Date(Date.now() - 60000).toISOString()}] WARN: Test log entry 2`,
    `[${new Date(Date.now() - 120000).toISOString()}] ERROR: Test log entry 3`,
  ];

  const logs = logEntries.join('\n');
  console.log(`📤 Sending logs response:`, logs.substring(0, 100) + '...');
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(logs);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
});
