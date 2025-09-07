const request = require('supertest');
const { expect } = require('chai');

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4000';
const ADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'superadmin123'
};

const TEST_USER_DATA = {
  username: 'testuser_admin',
  email: 'testuser_admin@example.com',
  password: 'TestPassword123!',
  role: 'user'
};

describe('Admin Dashboard Features - Comprehensive Tests', () => {
  let app;
  let adminToken;
  let adminSessionCookie;
  let testUserId;
  let testUserSessionCookie;

  before(async () => {
    console.log('🧪 Starting comprehensive admin features tests...');
    app = request(BASE_URL);
  });

  describe('Admin Authentication', () => {
    it('should login as super admin', async () => {
      const response = await app
        .post('/api/auth/admin/login')
        .send(ADMIN_CREDENTIALS)
        .expect(200);

      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('role', 'super_admin');
      expect(response.body).to.have.property('token');

      adminToken = response.body.token;
      adminSessionCookie = response.headers['set-cookie'];
      console.log('✅ Admin login successful');
    });

    it('should access admin-only endpoints with token', async () => {
      const response = await app
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');
      console.log('✅ Admin token authentication working');
    });
  });

  describe('User Management System', () => {
    it('should get all users with balances', async () => {
      const response = await app
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);

      // Check that users have balance information
      const userWithBalance = response.body.find(user => user.balance !== undefined);
      expect(userWithBalance).to.exist;
      expect(userWithBalance).to.have.property('balance');

      console.log('✅ User management - get all users with balances');
    });

    it('should create a new user', async () => {
      const response = await app
        .post('/api/auth')
        .send(TEST_USER_DATA)
        .expect(200);

      expect(response.body).to.have.property('user');
      testUserId = response.body.user.id;

      console.log('✅ User management - create new user');
    });

    it('should update user role', async () => {
      const response = await app
        .put(`/api/admin/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body).to.have.property('role', 'admin');

      console.log('✅ User management - update user role');
    });

    it('should update user status', async () => {
      const response = await app
        .put(`/api/admin/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);

      expect(response.body).to.have.property('isActive', false);

      console.log('✅ User management - update user status');
    });

    it('should update user information', async () => {
      const updateData = {
        username: 'updated_testuser',
        email: 'updated_testuser@example.com',
        adminNotes: 'Updated via admin API'
      };

      const response = await app
        .put(`/api/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).to.have.property('username', 'updated_testuser');
      expect(response.body).to.have.property('email', 'updated_testuser@example.com');

      console.log('✅ User management - update user information');
    });
  });

  describe('Balance Management System', () => {
    it('should get all user balances', async () => {
      const response = await app
        .get('/api/admin/balances')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');

      console.log('✅ Balance management - get all balances');
    });

    it('should deposit to user balance', async () => {
      const response = await app
        .put(`/api/admin/balances/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          balance: '500',
          action: 'add',
          note: 'Test deposit via admin API'
        })
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('deposit successful');

      console.log('✅ Balance management - deposit to user');
    });

    it('should withdraw from user balance', async () => {
      const response = await app
        .put(`/api/admin/balances/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          balance: '100',
          action: 'subtract',
          note: 'Test withdrawal via admin API'
        })
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('withdrawal successful');

      console.log('✅ Balance management - withdraw from user');
    });

    it('should reject withdrawal with insufficient balance', async () => {
      const response = await app
        .put(`/api/admin/balances/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          balance: '10000', // Large amount
          action: 'subtract',
          note: 'Test insufficient balance'
        })
        .expect(400);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('Insufficient balance');

      console.log('✅ Balance management - insufficient balance handling');
    });
  });

  describe('Admin Controls System', () => {
    let controlId;

    it('should get all admin controls', async () => {
      const response = await app
        .get('/api/admin/controls')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');

      console.log('✅ Admin controls - get all controls');
    });

    it('should create admin control', async () => {
      const response = await app
        .post('/api/admin/controls')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          controlType: 'win',
          notes: 'Test control for automated testing'
        })
        .expect(200);

      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('controlType', 'win');
      controlId = response.body.id;

      console.log('✅ Admin controls - create control');
    });

    it('should update admin control', async () => {
      const response = await app
        .put(`/api/admin/controls/${controlId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          controlType: 'lose',
          notes: 'Updated control type'
        })
        .expect(200);

      expect(response.body).to.have.property('controlType', 'lose');

      console.log('✅ Admin controls - update control');
    });

    it('should delete admin control', async () => {
      const response = await app
        .delete(`/api/admin/controls/${controlId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('deleted successfully');

      console.log('✅ Admin controls - delete control');
    });
  });

  describe('Transaction Management System', () => {
    it('should get pending transactions', async () => {
      const response = await app
        .get('/api/admin/transactions/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');

      console.log('✅ Transaction management - get pending transactions');
    });

    it('should get all transactions', async () => {
      const response = await app
        .get('/api/admin/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');

      console.log('✅ Transaction management - get all transactions');
    });

    it('should create a test transaction for approval', async () => {
      // First, let's create a transaction by making a deposit
      const depositResponse = await app
        .post('/api/transactions/deposit')
        .set('Cookie', adminSessionCookie)
        .send({
          amount: '100',
          currency: 'USDT',
          method: 'bank',
          paymentData: { transferReference: 'TEST123' }
        })
        .expect(200);

      expect(depositResponse.body).to.have.property('transaction');

      console.log('✅ Transaction management - create test transaction');
    });
  });

  describe('Chat/Messaging System', () => {
    it('should send message to user', async () => {
      const response = await app
        .post('/api/admin/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          message: 'Test message from admin',
          type: 'admin_message'
        })
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('sent successfully');

      console.log('✅ Chat system - send message to user');
    });

    it('should get chat messages for user', async () => {
      const response = await app
        .get(`/api/admin/messages/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.be.an('array');

      console.log('✅ Chat system - get user messages');
    });
  });

  describe('System Management', () => {
    it('should get system data', async () => {
      const response = await app
        .get('/api/admin/system')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).to.have.property('systemSettings');

      console.log('✅ System management - get system data');
    });

    it('should update system settings', async () => {
      const response = await app
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          tradingEnabled: true,
          maintenanceMode: false,
          minTradeAmount: '50',
          maxTradeAmount: '5000'
        })
        .expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.include('updated successfully');

      console.log('✅ System management - update settings');
    });
  });

  describe('Security & Access Control', () => {
    it('should reject non-admin access to admin endpoints', async () => {
      // Try to access admin endpoint without authentication
      await app
        .get('/api/admin/users')
        .expect(401);

      console.log('✅ Security - non-admin access rejected');
    });

    it('should reject regular admin access to super admin endpoints', async () => {
      // First, create a regular admin user
      const regularAdminResponse = await app
        .post('/api/auth')
        .send({
          username: 'regular_admin',
          email: 'regular_admin@example.com',
          password: 'AdminPass123!',
          role: 'admin'
        })
        .expect(200);

      const regularAdminId = regularAdminResponse.body.user.id;

      // Login as regular admin
      const loginResponse = await app
        .post('/api/auth/admin/login')
        .send({
          username: 'regular_admin',
          password: 'AdminPass123!'
        })
        .expect(200);

      const regularAdminToken = loginResponse.body.token;

      // Try to access super admin endpoint
      await app
        .get('/api/admin/balances')
        .set('Authorization', `Bearer ${regularAdminToken}`)
        .expect(403);

      console.log('✅ Security - regular admin access to super admin endpoints rejected');
    });
  });

  describe('Data Synchronization', () => {
    it('should verify user data consistency', async () => {
      // Get user data from admin endpoint
      const adminUserResponse = await app
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const adminUserData = adminUserResponse.body.find(user => user.id === testUserId);

      // Get user data from regular user endpoint
      const userResponse = await app
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verify consistency
      expect(adminUserData.username).to.equal(userResponse.body.username);
      expect(adminUserData.email).to.equal(userResponse.body.email);

      console.log('✅ Data synchronization - user data consistency verified');
    });
  });

  after(async () => {
    console.log('🧪 Admin features tests completed successfully!');

    // Cleanup test data
    if (testUserId) {
      try {
        await app
          .delete(`/api/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        console.log('🧹 Test user cleaned up');
      } catch (error) {
        console.warn('⚠️ Failed to cleanup test user:', error.message);
      }
    }
  });
});