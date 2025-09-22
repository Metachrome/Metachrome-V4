#!/usr/bin/env node

// Railway-specific startup script with enhanced error handling
const fs = require('fs');
const path = require('path');

console.log('🚀 RAILWAY STARTUP SCRIPT');
console.log('='.repeat(50));

// Check environment
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || '3005');

// Check required files
const requiredFiles = [
  'working-server.js',
  'dist/public/index.html'
];

const dataFiles = [
  'pending-data.json',
  'admin-data.json', 
  'users-data.json',
  'trades-data.json',
  'transactions-data.json'
];

console.log('\n📁 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
}

console.log('\n📊 Checking data files...');
for (const file of dataFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️ Missing ${file}, creating default...`);
    
    let defaultContent;
    switch (file) {
      case 'pending-data.json':
        defaultContent = { deposits: [], withdrawals: [] };
        break;
      case 'admin-data.json':
      case 'users-data.json':
      case 'trades-data.json':
      case 'transactions-data.json':
        defaultContent = [];
        break;
      default:
        defaultContent = {};
    }
    
    try {
      fs.writeFileSync(file, JSON.stringify(defaultContent, null, 2));
      console.log(`✅ Created ${file}`);
    } catch (error) {
      console.error(`❌ Failed to create ${file}:`, error.message);
      process.exit(1);
    }
  }
}

// Check environment variables
console.log('\n🔧 Environment variables:');
const envVars = [
  'NODE_ENV',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'SESSION_SECRET'
];

for (const envVar of envVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('SECRET') || envVar.includes('KEY') ? '[HIDDEN]' : value}`);
  } else {
    console.log(`⚠️ ${envVar}: not set`);
  }
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('\n📁 Created uploads directory');
}

const verificationDir = path.join(uploadsDir, 'verification');
if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
  console.log('📁 Created verification directory');
}

console.log('\n🚀 Starting METACHROME server...');
console.log('='.repeat(50));

// Start the main server
try {
  require('./working-server.js');
} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
