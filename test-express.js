console.log('Testing Express...');

try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  const app = express();
  console.log('✅ Express app created');
  
  app.get('/test', (req, res) => {
    res.json({ message: 'Test successful' });
  });
  
  const server = app.listen(3002, '127.0.0.1', () => {
    console.log('✅ Server started on http://127.0.0.1:3002');
    console.log('✅ Test endpoint: http://127.0.0.1:3002/test');
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
  
} catch (error) {
  console.error('❌ Error:', error);
}
