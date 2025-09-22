// Lightning-fast server for Railway
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3005;

// Ultra-minimal middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/public')));

// Instant health check
app.get('/api/health', (req, res) => res.send('OK'));

// Minimal auth
app.post('/api/auth/user/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'angela.soenoko' && password === 'password123') {
    res.json({ success: true, user: { id: 'user-angela-1758195715', username: 'angela.soenoko', balance: 10000, trading_mode: 'lose' }, token: 'test-token' });
  } else if (username === 'superadmin' && password === 'superadmin123') {
    res.json({ success: true, user: { id: 'superadmin', username: 'superadmin', role: 'superadmin' }, token: 'admin-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Force lose trades
app.post('/api/trades/complete', (req, res) => {
  res.json({ success: true, tradeId: req.body.tradeId, originalOutcome: req.body.outcome, finalOutcome: false, overrideApplied: true });
});

// Serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/public/index.html')));

// Start immediately
app.listen(PORT, () => console.log(`⚡ Ready on ${PORT}`));
