// Direct server start without auto-build
process.env.SKIP_AUTO_BUILD = 'true';

console.log('🚀 Starting server directly without auto-build...');
console.log('📁 Current directory:', process.cwd());
console.log('🔧 SKIP_AUTO_BUILD:', process.env.SKIP_AUTO_BUILD);

// Import and start the server
require('./working-server.js');
