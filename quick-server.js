// Quick server without auto-build
process.env.SKIP_AUTO_BUILD = 'true';

// Import the main server
require('./working-server.js');
