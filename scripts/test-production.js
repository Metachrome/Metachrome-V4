#!/usr/bin/env node

/**
 * Production Readiness Test Suite
 * Comprehensive testing script to verify all features before deployment
 */

const axios = require('axios');
const WebSocket = require('ws');
const chalk = require('chalk');

class ProductionTester {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl;
    this.testResults = [];
    this.sessionCookie = null;
    this.testUser = {
      email: `test_${Date.now()}@example.com`,
      username: `testuser_${Date.now()}`,
      password: 'TestPassword123!',
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b'
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow
    };
    
    console.log(`${colors[type](`[${type.toUpperCase()}]`)} ${timestamp} - ${message}`);
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    try {
      const config = {
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      if (this.sessionCookie) {
        config.headers.Cookie = this.sessionCookie;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status, headers: response.headers };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message, 
        status: error.response?.status 
      };
    }
  }

  async testHealthCheck() {
    this.log('Testing health check endpoints...');
    
    const healthResponse = await this.makeRequest('GET', '/health');
    const apiHealthResponse = await this.makeRequest('GET', '/api/health');
    
    if (healthResponse.success && apiHealthResponse.success) {
      this.log('✅ Health check endpoints working', 'success');
      return true;
    } else {
      this.log('❌ Health check endpoints failed', 'error');
      return false;
    }
  }

  async testAuthentication() {
    this.log('Testing authentication flow...');
    
    // Test registration
    const registerResponse = await this.makeRequest('POST', '/api/auth/register', this.testUser);
    if (!registerResponse.success) {
      this.log('❌ User registration failed', 'error');
      return false;
    }
    
    // Test login
    const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
      email: this.testUser.email,
      password: this.testUser.password
    });
    
    if (!loginResponse.success) {
      this.log('❌ User login failed', 'error');
      return false;
    }
    
    // Store session cookie
    this.sessionCookie = loginResponse.headers['set-cookie']?.[0];
    
    // Test user profile
    const profileResponse = await this.makeRequest('GET', '/api/auth/user');
    if (!profileResponse.success) {
      this.log('❌ User profile fetch failed', 'error');
      return false;
    }
    
    this.log('✅ Authentication flow working', 'success');
    return true;
  }

  async testMarketData() {
    this.log('Testing market data endpoints...');
    
    const marketDataResponse = await this.makeRequest('GET', '/api/market-data');
    if (!marketDataResponse.success) {
      this.log('❌ Market data fetch failed', 'error');
      return false;
    }
    
    const marketData = marketDataResponse.data;
    if (!Array.isArray(marketData) || marketData.length === 0) {
      this.log('❌ Market data is empty or invalid', 'error');
      return false;
    }
    
    // Check for required fields
    const btcData = marketData.find(data => data.symbol === 'BTCUSDT');
    if (!btcData || !btcData.price || !btcData.priceChangePercent24h) {
      this.log('❌ Market data missing required fields', 'error');
      return false;
    }
    
    this.log('✅ Market data endpoints working', 'success');
    return true;
  }

  async testOptionsSettings() {
    this.log('Testing options settings...');
    
    const optionsResponse = await this.makeRequest('GET', '/api/options-settings');
    if (!optionsResponse.success) {
      this.log('❌ Options settings fetch failed', 'error');
      return false;
    }
    
    const settings = optionsResponse.data;
    if (!Array.isArray(settings) || settings.length === 0) {
      this.log('❌ Options settings are empty', 'error');
      return false;
    }
    
    // Check for required fields
    const setting = settings[0];
    if (!setting.duration || !setting.minAmount || !setting.profitPercentage) {
      this.log('❌ Options settings missing required fields', 'error');
      return false;
    }
    
    this.log('✅ Options settings working', 'success');
    return true;
  }

  async testBalanceManagement() {
    this.log('Testing balance management...');
    
    const balancesResponse = await this.makeRequest('GET', '/api/balances');
    if (!balancesResponse.success) {
      this.log('❌ Balance fetch failed', 'error');
      return false;
    }
    
    const balances = balancesResponse.data;
    if (!Array.isArray(balances)) {
      this.log('❌ Balances response is not an array', 'error');
      return false;
    }
    
    // Should have USDT balance
    const usdtBalance = balances.find(balance => balance.symbol === 'USDT');
    if (!usdtBalance) {
      this.log('❌ USDT balance not found', 'error');
      return false;
    }
    
    this.log('✅ Balance management working', 'success');
    return true;
  }

  async testTradingFunctionality() {
    this.log('Testing trading functionality...');
    
    // Test placing a trade
    const tradeData = {
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: '100',
      duration: 30
    };
    
    const tradeResponse = await this.makeRequest('POST', '/api/trades/options', tradeData);
    if (!tradeResponse.success) {
      this.log('❌ Trade placement failed', 'error');
      return false;
    }
    
    // Test getting active trades
    const activeTradesResponse = await this.makeRequest('GET', '/api/trades/active');
    if (!activeTradesResponse.success) {
      this.log('❌ Active trades fetch failed', 'error');
      return false;
    }
    
    this.log('✅ Trading functionality working', 'success');
    return true;
  }

  async testRateLimiting() {
    this.log('Testing rate limiting...');
    
    // Make multiple rapid requests
    const promises = Array(30).fill().map(() => 
      this.makeRequest('GET', '/api/market-data')
    );
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(response => response.status === 429);
    
    if (rateLimited) {
      this.log('✅ Rate limiting working', 'success');
      return true;
    } else {
      this.log('⚠️ Rate limiting may not be working properly', 'warning');
      return false;
    }
  }

  async testSecurity() {
    this.log('Testing security measures...');
    
    // Test unauthorized access
    const unauthorizedResponse = await this.makeRequest('GET', '/api/balances', null, {});
    if (unauthorizedResponse.status !== 401) {
      this.log('❌ Unauthorized access not properly blocked', 'error');
      return false;
    }
    
    // Test input validation
    const invalidTradeResponse = await this.makeRequest('POST', '/api/trades/options', {
      symbol: 'INVALID',
      direction: 'invalid',
      amount: 'not_a_number',
      duration: -1
    });
    
    if (invalidTradeResponse.status !== 400) {
      this.log('❌ Input validation not working properly', 'error');
      return false;
    }
    
    this.log('✅ Security measures working', 'success');
    return true;
  }

  async testWebSocketConnection() {
    this.log('Testing WebSocket connection...');
    
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(`ws://localhost:5000`);
        
        ws.on('open', () => {
          this.log('✅ WebSocket connection working', 'success');
          ws.close();
          resolve(true);
        });
        
        ws.on('error', (error) => {
          this.log('❌ WebSocket connection failed', 'error');
          resolve(false);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          ws.close();
          this.log('⚠️ WebSocket connection timeout', 'warning');
          resolve(false);
        }, 5000);
      } catch (error) {
        this.log('❌ WebSocket test failed', 'error');
        resolve(false);
      }
    });
  }

  async runAllTests() {
    this.log('🚀 Starting production readiness tests...', 'info');
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Authentication', fn: () => this.testAuthentication() },
      { name: 'Market Data', fn: () => this.testMarketData() },
      { name: 'Options Settings', fn: () => this.testOptionsSettings() },
      { name: 'Balance Management', fn: () => this.testBalanceManagement() },
      { name: 'Trading Functionality', fn: () => this.testTradingFunctionality() },
      { name: 'Rate Limiting', fn: () => this.testRateLimiting() },
      { name: 'Security', fn: () => this.testSecurity() },
      { name: 'WebSocket', fn: () => this.testWebSocketConnection() }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
      try {
        const result = await test.fn();
        this.testResults.push({ name: test.name, passed: result });
        if (result) passedTests++;
      } catch (error) {
        this.log(`❌ Test ${test.name} threw an error: ${error.message}`, 'error');
        this.testResults.push({ name: test.name, passed: false, error: error.message });
      }
    }
    
    // Print summary
    this.log('\n📊 Test Results Summary:', 'info');
    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      this.log(`  ${status} - ${result.name}`, result.passed ? 'success' : 'error');
      if (result.error) {
        this.log(`    Error: ${result.error}`, 'error');
      }
    });
    
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    this.log(`\n🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`, 
      successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'error');
    
    if (successRate >= 90) {
      this.log('🎉 System is ready for production deployment!', 'success');
      return true;
    } else {
      this.log('⚠️ System needs attention before production deployment', 'warning');
      return false;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  const tester = new ProductionTester(baseUrl);
  
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = ProductionTester;
