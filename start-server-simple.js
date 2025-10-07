// Simple server starter without auto-build
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting METACHROME server (simple mode)...');

// Start the server directly
const serverProcess = spawn('node', ['working-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    SKIP_AUTO_BUILD: 'true' // Flag to skip auto-build
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

serverProcess.on('close', (code) => {
  console.log(`🔄 Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
