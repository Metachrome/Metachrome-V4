console.log('🔍 Starting fixed debug server...');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

try {
  console.log('📦 Loading express...');
  const express = require('express');
  console.log('✅ Express loaded successfully');

  console.log('📦 Loading path...');
  const path = require('path');
  console.log('✅ Path loaded successfully');

  console.log('📦 Loading fs...');
  const fs = require('fs');
  console.log('✅ FS loaded successfully');

  console.log('📦 Loading cors...');
  const cors = require('cors');
  console.log('✅ CORS loaded successfully');

  console.log('🚀 Creating Express app...');
  const app = express();
  console.log('✅ Express app created');

  const PORT = 3001;
  const HOST = '127.0.0.1';

  // Basic middleware
  console.log('🔧 Setting up middleware...');
  app.use(cors());
  app.use(express.json());
  console.log('✅ Middleware configured');

  // Test route
  app.get('/test', (req, res) => {
    console.log('📨 Test route hit');
    res.json({ 
      message: 'Fixed debug server is working!', 
      timestamp: new Date().toISOString(),
      nodeVersion: process.version
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    console.log('🏥 Health check hit');
    res.json({ 
      status: 'OK', 
      message: 'Fixed debug server is running',
      timestamp: new Date().toISOString()
    });
  });

  // Static files
  const distPath = path.join(__dirname, 'dist', 'public');
  console.log('📁 Static path:', distPath);
  
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist folder exists');
    const files = fs.readdirSync(distPath);
    console.log('📁 Files in dist/public:', files);
    app.use(express.static(distPath));
  } else {
    console.log('❌ Dist folder not found');
  }

  // Catch all route
  app.get('*', (req, res) => {
    console.log('🌐 Catch-all route hit:', req.path);
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      console.log('✅ Serving index.html');
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html not found');
      res.send(`
        <h1>METACHROME Fixed Debug Server</h1>
        <p>Server is running but index.html not found</p>
        <p>Path: ${indexPath}</p>
        <p><a href="/test">Test endpoint</a></p>
        <p><a href="/api/health">Health check</a></p>
        <p>Node.js: ${process.version}</p>
        <p>Time: ${new Date().toISOString()}</p>
      `);
    }
  });

  console.log('🚀 Starting server...');
  const server = app.listen(PORT, HOST, () => {
    console.log('🎉 ================================');
    console.log('✅ FIXED DEBUG SERVER STARTED!');
    console.log(`🌐 URL: http://${HOST}:${PORT}`);
    console.log(`🧪 Test: http://${HOST}:${PORT}/test`);
    console.log(`🏥 Health: http://${HOST}:${PORT}/api/health`);
    console.log('🎉 ================================');
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      console.log('💡 Try killing the process');
    }
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('❌ Fatal error:', error);
  console.error('Stack trace:', error.stack);
}
