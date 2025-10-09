console.log('🚀 Test server starting...');

const express = require('express');
const app = express();
const PORT = 3005;

app.get('/', (req, res) => {
  res.send('Test server is working!');
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});
