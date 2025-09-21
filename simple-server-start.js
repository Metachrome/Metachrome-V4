// Simple server starter that bypasses the redeem codes table creation
console.log('🚀 Starting METACHROME server without table creation...');

// Set environment to skip table creation
process.env.SKIP_TABLE_CREATION = 'true';

// Start the working server
require('./working-server.js');
