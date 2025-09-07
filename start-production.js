// METACHROME V2 - Production Startup Script
// This script compiles TypeScript and starts the production server

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 METACHROME V2 - Production Startup');
console.log('=====================================');

// Check if TypeScript files exist
const serverTsPath = path.join(__dirname, 'server', 'production.ts');
const libTsPath = path.join(__dirname, 'lib', 'supabase.ts');

if (!fs.existsSync(serverTsPath)) {
  console.error('❌ server/production.ts not found');
  process.exit(1);
}

if (!fs.existsSync(libTsPath)) {
  console.error('❌ lib/supabase.ts not found');
  process.exit(1);
}

console.log('✅ TypeScript files found');
console.log('🔧 Compiling TypeScript to JavaScript...');

// Compile TypeScript files
const tscProcess = spawn('npx', ['tsc', '--target', 'es2020', '--module', 'commonjs', '--outDir', 'dist', '--skipLibCheck', 'server/production.ts', 'lib/supabase.ts'], {
  stdio: 'inherit'
});

tscProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ TypeScript compilation failed');
    process.exit(1);
  }

  console.log('✅ TypeScript compilation successful');
  console.log('🚀 Starting production server...');

  // Start the production server
  const serverProcess = spawn('node', ['dist/server/production.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.PORT || '3000'
    }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  serverProcess.on('close', (code) => {
    console.log(`🛑 Server stopped with code: ${code}`);
    process.exit(code);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });
});
