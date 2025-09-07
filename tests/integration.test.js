const request = require('supertest');
const { expect } = require('chai');

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const TEST_USER = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'TestPassword123!',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b'
};

describe('Binary Options Trading Platform - Integration Tests', () => {
  let app;
  let authToken;
  let userId;
  let sessionCookie;

  before(async () => {
    // Initialize test environment
    console.log('🧪 Starting integration tests...');
    app = request(BASE_URL);
  });

  describe('Authentication & User Management', () => {
    it('should register a new user', async () => {
      const response = await app
        .post('/api/auth/register')
        .send(TEST_USER)
        .expect(201);

      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('id');
      userId = response.body.user.id;
    });

    it('should login with valid credentials', async () => {
      const response = await app
        .post('/api/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password
        })
        .expect(200);

      expect(response.body).to.have.property('user');
      sessionCookie = response.headers['set-cookie'];
    });

    it('should get user profile', async () => {
      const response = await app
        .get('/api/auth/user')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body).to.have.property('id', userId);
      expect(response.body).to.have.property('email', TEST_USER.email);
    });

    it('should connect MetaMask wallet', async () => {
      const response = await app
        .post('/api/auth')
        .set('Cookie', sessionCookie)
        .send({
          walletAddress: TEST_USER.walletAddress
        })
        .expect(200);

      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('walletAddress', TEST_USER.walletAddress);
    });
  });

  describe('Market Data & Trading Pairs', () => {
    it('should fetch market data', async () => {
      const response = await app
        .get('/api/market-data')
        .expect(200);

      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      const btcData = response.body.find(data => data.symbol === 'BTCUSDT');
      expect(btcData).to.exist;
      expect(btcData).to.have.property('price');
      expect(btcData).to.have.property('priceChangePercent24h');
    });

    it('should fetch options settings', async () => {
      const response = await app
        .get('/api/options-settings')
        .expect(200);

      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
      
      const setting = response.body[0];
      expect(setting).to.have.property('duration');
      expect(setting).to.have.property('minAmount');
      expect(setting).to.have.property('profitPercentage');
      expect(setting).to.have.property('isActive');
    });
  });

  describe('Balance Management', () => {
    it('should get user balances', async () => {
      const response = await app
        .get('/api/balances')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body).to.be.an('array');
      
      // Should have USDT balance
      const usdtBalance = response.body.find(balance => balance.symbol === 'USDT');
      expect(usdtBalance).to.exist;
      expect(usdtBalance).to.have.property('available');
      expect(usdtBalance).to.have.property('locked');
    });

    it('should create initial balance for new user', async () => {
      // This might be done automatically during registration
      const response = await app
        .get('/api/balances')
        .set('Cookie', sessionCookie)
        .expect(200);

      const usdtBalance = response.body.find(balance => balance.symbol === 'USDT');
      expect(parseFloat(usdtBalance.available)).to.be.greaterThan(0);
    });
  });

  describe('Binary Options Trading', () => {
    let tradeId;

    it('should place a binary options trade', async () => {
      const tradeData = {
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: '100',
        duration: 30
      };

      const response = await app
        .post('/api/trades/options')
        .set('Cookie', sessionCookie)
        .send(tradeData)
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('trade');
      expect(response.body.trade).to.have.property('id');
      
      tradeId = response.body.trade.id;
    });

    it('should get active trades', async () => {
      const response = await app
        .get('/api/trades/active')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(response.body).to.be.an('array');
      
      if (tradeId) {
        const activeTrade = response.body.find(trade => trade.id === tradeId);
        expect(activeTrade).to.exist;
        expect(activeTrade).to.have.property('status', 'active');
      }
    });

    it('should reject trade with insufficient balance', async () => {
      const tradeData = {
        symbol: 'BTCUSDT',
        direction: 'down',
        amount: '1000000', // Very large amount
        duration: 60
      };

      const response = await app
        .post('/api/trades/options')
        .set('Cookie', sessionCookie)
        .send(tradeData)
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body.message).to.include('balance');
    });

    it('should reject trade with invalid duration', async () => {
      const tradeData = {
        symbol: 'BTCUSDT',
        direction: 'up',
        amount: '100',
        duration: 999 // Invalid duration
      };

      const response = await app
        .post('/api/trades/options')
        .set('Cookie', sessionCookie)
        .send(tradeData)
        .expect(400);

      expect(response.body).to.have.property('success', false);
    });
  });

  describe('Admin Controls (Super Admin)', () => {
    let adminSessionCookie;

    before(async () => {
      // Login as admin (assuming admin user exists)
      const adminResponse = await app
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'AdminPassword123!'
        });

      if (adminResponse.status === 200) {
        adminSessionCookie = adminResponse.headers['set-cookie'];
      }
    });

    it('should get all users (admin only)', async function() {
      if (!adminSessionCookie) {
        this.skip();
        return;
      }

      const response = await app
        .get('/api/admin/users')
        .set('Cookie', adminSessionCookie)
        .expect(200);

      expect(response.body).to.be.an('array');
    });

    it('should create admin control', async function() {
      if (!adminSessionCookie) {
        this.skip();
        return;
      }

      const controlData = {
        userId: userId,
        controlType: 'win',
        notes: 'Test control'
      };

      const response = await app
        .post('/api/admin/controls')
        .set('Cookie', adminSessionCookie)
        .send(controlData)
        .expect(200);

      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('controlType', 'win');
    });
  });

  describe('Security & Rate Limiting', () => {
    it('should return 429 for too many requests', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const promises = Array(25).fill().map(() => 
        app.get('/api/market-data')
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(response => response.status === 429);
      
      expect(rateLimited).to.be.true;
    });

    it('should require authentication for protected routes', async () => {
      await app
        .get('/api/balances')
        .expect(401);

      await app
        .post('/api/trades/options')
        .send({
          symbol: 'BTCUSDT',
          direction: 'up',
          amount: '100',
          duration: 30
        })
        .expect(401);
    });

    it('should validate input data', async () => {
      const response = await app
        .post('/api/trades/options')
        .set('Cookie', sessionCookie)
        .send({
          symbol: 'INVALID',
          direction: 'invalid',
          amount: 'not_a_number',
          duration: -1
        })
        .expect(400);

      expect(response.body).to.have.property('error');
    });
  });

  describe('Health & Monitoring', () => {
    it('should return health status', async () => {
      const response = await app
        .get('/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'healthy');
      expect(response.body).to.have.property('timestamp');
      expect(response.body).to.have.property('uptime');
    });

    it('should return API health status', async () => {
      const response = await app
        .get('/api/health')
        .expect(200);

      expect(response.body).to.have.property('status', 'healthy');
    });
  });

  after(async () => {
    console.log('🧪 Integration tests completed');
    
    // Cleanup test data if needed
    if (sessionCookie && userId) {
      // Could add cleanup logic here
    }
  });
});
