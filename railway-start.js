#!/usr/bin/env node

// Railway-specific startup script with enhanced error handling
const fs = require('fs');
const path = require('path');

console.log('🚀 RAILWAY STARTUP - FAST MODE');

// Quick environment check
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || '3005';
console.log(`🌍 ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} | Port: ${port}`);

// Quick file existence check
const criticalFiles = ['working-server.js', 'dist/public/index.html'];
for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Critical file missing: ${file}`);
    process.exit(1);
  }
}

// Quick data file creation (no logging to speed up)
const dataFiles = [
  { name: 'pending-data.json', content: { deposits: [], withdrawals: [] } },
  { name: 'admin-data.json', content: [] },
  { name: 'users-data.json', content: [] },
  { name: 'trades-data.json', content: [] },
  { name: 'transactions-data.json', content: [] }
];

for (const { name, content } of dataFiles) {
  if (!fs.existsSync(name)) {
    fs.writeFileSync(name, JSON.stringify(content, null, 2));
  }
}

// Quick directory setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'verification'), { recursive: true });
}

console.log('🚀 Starting METACHROME server...');

// Start the main server
try {
  require('./working-server.js');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
