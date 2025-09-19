// Simple test server to verify port 3333 is working
const express = require('express');
const app = express();
const PORT = 3333;

app.get('/', (req, res) => {
  console.log('📥 GET / request received');
  res.send(`
    <html>
      <head><title>Test Server</title></head>
      <body>
        <h1>🎉 Test Server is Working!</h1>
        <p>Server is running on port ${PORT}</p>
        <p>Time: ${new Date().toISOString()}</p>
        <a href="/test">Test JSON endpoint</a>
      </body>
    </html>
  `);
});

app.get('/test', (req, res) => {
  console.log('📥 GET /test request received');
  res.json({
    success: true,
    message: 'Test endpoint working',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🌐 Open browser to: http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  }
});
