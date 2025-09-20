// Simple server starter to test if our main server works
console.log('🚀 Starting METACHROME server...');

// Set environment to development for local testing
process.env.NODE_ENV = 'development';

try {
  // Try to start the main server
  require('./working-server.js');
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
