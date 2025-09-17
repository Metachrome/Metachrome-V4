console.log('Testing Node.js...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

const express = require('express');
const app = express();
const PORT = 3001;

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working!' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
