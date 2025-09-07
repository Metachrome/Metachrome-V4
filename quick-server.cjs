const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/public')));

// Mock data
let spotOrders = [];

// Mock balances
const mockBalances = [
  {
    id: 'balance-1',
    userId: 'demo-user',
    currency: 'USDT',
    balance: 10000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'balance-2',
    userId: 'demo-user',
    currency: 'BTC',
    balance: 0.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Market data endpoint
app.get('/api/market-data', (req, res) => {
  console.log('📊 Market data requested');
  res.json([
    {
      symbol: 'BTCUSDT',
      price: '117500.00',
      priceChange24h: '2.5%',
      volume24h: '1.2B'
    }
  ]);
});

// User balances endpoint
app.get('/api/user/balances', (req, res) => {
  console.log('💰 User balances requested');
  res.json(mockBalances);
});

// Spot orders endpoints
app.post('/api/spot/orders', (req, res) => {
  console.log('📊 Creating spot order:', req.body);
  const { symbol, side, type, amount, price, total } = req.body;

  // Validate required fields
  if (!symbol || !side || !type || !amount || !total) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!['buy', 'sell'].includes(side)) {
    return res.status(400).json({ message: "Invalid side. Must be 'buy' or 'sell'" });
  }

  if (!['limit', 'market'].includes(type)) {
    return res.status(400).json({ message: "Invalid type. Must be 'limit' or 'market'" });
  }

  const amountNum = parseFloat(amount);
  const totalNum = parseFloat(total);

  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (isNaN(totalNum) || totalNum <= 0) {
    return res.status(400).json({ message: "Invalid total" });
  }

  const order = {
    id: `spot-order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'demo-user',
    symbol,
    side,
    type,
    amount: amountNum.toString(),
    price: price || null,
    total: totalNum.toString(),
    status: 'filled', // Auto-fill for demo
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  spotOrders.push(order);
  console.log('✅ Spot order created:', order.id, side.toUpperCase(), amountNum, symbol);

  // Update mock balances
  if (side === 'buy') {
    // Deduct USDT, add BTC
    mockBalances[0].balance -= totalNum;
    mockBalances[1].balance += amountNum;
  } else {
    // Deduct BTC, add USDT
    mockBalances[1].balance -= amountNum;
    mockBalances[0].balance += totalNum;
  }

  res.json(order);
});

app.get('/api/spot/orders', (req, res) => {
  console.log('📊 Getting spot orders');
  res.json(spotOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Spot trading endpoints ready');
  console.log('💰 Mock balances initialized');
});
