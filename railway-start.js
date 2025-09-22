#!/usr/bin/env node

// Ultra-fast Railway startup - minimal logging
const fs = require('fs');

// Silent startup - only log errors
const port = process.env.PORT || '3005';

// Critical file check
if (!fs.existsSync('working-server.js')) {
  console.error('❌ working-server.js missing');
  process.exit(1);
}

// Create minimal data files
const files = [
  ['pending-data.json', '{"deposits":[],"withdrawals":[]}'],
  ['admin-data.json', '[]'],
  ['users-data.json', '[]'],
  ['trades-data.json', '[]'],
  ['transactions-data.json', '[]']
];

files.forEach(([name, content]) => {
  if (!fs.existsSync(name)) fs.writeFileSync(name, content);
});

// Create uploads directory
try { fs.mkdirSync('uploads/verification', { recursive: true }); } catch {}

// Start server immediately
require('./working-server.js');
