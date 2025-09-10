// Balance Synchronization Verification Script
import WebSocket from 'ws';
// Using built-in fetch (Node.js 18+)

console.log('🔄 Starting Balance Synchronization Verification...');

// Test configuration
const SERVER_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/ws';
const TEST_USER_ID = 'user-1';

let ws = null;
let testResults = [];

// WebSocket connection
function connectWebSocket() {
    return new Promise((resolve, reject) => {
        ws = new WebSocket(WS_URL);
        
        ws.on('open', () => {
            console.log('✅ WebSocket connected');
            
            // Subscribe to balance updates
            ws.send(JSON.stringify({
                type: 'subscribe_user_balance',
                userId: TEST_USER_ID
            }));
            
            resolve();
        });
        
        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            handleWebSocketMessage(message);
        });
        
        ws.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
            reject(error);
        });
    });
}

function handleWebSocketMessage(message) {
    console.log(`📨 WebSocket: ${message.type}`);
    
    if (message.type === 'balance_update' && message.data.userId === TEST_USER_ID) {
        console.log(`💰 Balance Update: ${message.data.newBalance} USDT (${message.data.changeType})`);
        testResults.push({
            type: 'balance_update',
            balance: message.data.newBalance,
            changeType: message.data.changeType,
            timestamp: new Date().toISOString()
        });
    }
    
    if (message.type === 'user_balance_init' && message.data.userId === TEST_USER_ID) {
        console.log(`🔄 Initial Balance: ${message.data.balance} USDT`);
        testResults.push({
            type: 'initial_balance',
            balance: message.data.balance,
            timestamp: new Date().toISOString()
        });
    }
}

// API request helper
async function apiRequest(method, endpoint, data = null) {
    const url = `${SERVER_URL}${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ API Error (${method} ${endpoint}):`, error.message);
        throw error;
    }
}

// Test functions
async function testDeposit(amount = 1000) {
    console.log(`\n💰 Testing Deposit: ${amount} USDT`);
    try {
        const result = await apiRequest('POST', '/api/superadmin/deposit', {
            userId: TEST_USER_ID,
            amount: amount,
            note: 'Verification test deposit'
        });
        console.log(`✅ Deposit successful: ${result.message}`);
        return true;
    } catch (error) {
        console.log(`❌ Deposit failed: ${error.message}`);
        return false;
    }
}

async function testWithdrawal(amount = 500) {
    console.log(`\n💸 Testing Withdrawal: ${amount} USDT`);
    try {
        const result = await apiRequest('POST', '/api/superadmin/withdrawal', {
            userId: TEST_USER_ID,
            amount: amount,
            note: 'Verification test withdrawal'
        });
        console.log(`✅ Withdrawal successful: ${result.message}`);
        return true;
    } catch (error) {
        console.log(`❌ Withdrawal failed: ${error.message}`);
        return false;
    }
}

async function testOptionsTrade(amount = 100) {
    console.log(`\n🎯 Testing Options Trade: ${amount} USDT`);
    try {
        const result = await apiRequest('POST', '/api/trades', {
            userId: TEST_USER_ID,
            symbol: 'BTCUSDT',
            direction: 'up',
            amount: amount,
            duration: 30
        });
        console.log(`✅ Options trade created: ${result.trade?.id || 'Success'}`);
        return true;
    } catch (error) {
        console.log(`❌ Options trade failed: ${error.message}`);
        return false;
    }
}

async function testSpotTrade(amount = 50) {
    console.log(`\n📈 Testing Spot Trade: ${amount} USDT`);
    try {
        const result = await apiRequest('POST', '/api/spot/orders', {
            userId: TEST_USER_ID,
            symbol: 'BTCUSDT',
            side: 'buy',
            amount: amount,
            total: amount, // Required parameter
            type: 'market'
        });
        console.log(`✅ Spot trade successful: ${result.order?.id || 'Success'}`);
        return true;
    } catch (error) {
        console.log(`❌ Spot trade failed: ${error.message}`);
        return false;
    }
}

async function getCurrentBalance() {
    try {
        const result = await apiRequest('GET', `/api/user/balances?userId=${TEST_USER_ID}`);
        if (result && result.length > 0) {
            const usdtBalance = result.find(b => b.currency === 'USDT');
            return usdtBalance ? usdtBalance.balance : null;
        }
        return null;
    } catch (error) {
        console.log(`❌ Failed to get balance: ${error.message}`);
        return null;
    }
}

// Main verification function
async function runVerification() {
    try {
        console.log('🔌 Connecting to WebSocket...');
        await connectWebSocket();
        
        // Wait for initial balance
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n📊 Getting initial balance...');
        const initialBalance = await getCurrentBalance();
        console.log(`💰 Initial Balance: ${initialBalance} USDT`);
        
        // Test 1: Deposit
        await new Promise(resolve => setTimeout(resolve, 1000));
        const depositSuccess = await testDeposit(1000);
        
        // Test 2: Options Trade
        await new Promise(resolve => setTimeout(resolve, 2000));
        const optionsSuccess = await testOptionsTrade(100);
        
        // Test 3: Spot Trade
        await new Promise(resolve => setTimeout(resolve, 2000));
        const spotSuccess = await testSpotTrade(50);
        
        // Test 4: Withdrawal
        await new Promise(resolve => setTimeout(resolve, 2000));
        const withdrawalSuccess = await testWithdrawal(500);
        
        // Final balance check
        await new Promise(resolve => setTimeout(resolve, 2000));
        const finalBalance = await getCurrentBalance();
        console.log(`\n💰 Final Balance: ${finalBalance} USDT`);
        
        // Results summary
        console.log('\n📋 VERIFICATION RESULTS:');
        console.log('========================');
        console.log(`✅ WebSocket Connection: Working`);
        console.log(`${depositSuccess ? '✅' : '❌'} Deposit Operation: ${depositSuccess ? 'Working' : 'Failed'}`);
        console.log(`${optionsSuccess ? '✅' : '❌'} Options Trading: ${optionsSuccess ? 'Working' : 'Failed'}`);
        console.log(`${spotSuccess ? '✅' : '❌'} Spot Trading: ${spotSuccess ? 'Working' : 'Failed'}`);
        console.log(`${withdrawalSuccess ? '✅' : '❌'} Withdrawal Operation: ${withdrawalSuccess ? 'Working' : 'Failed'}`);
        console.log(`📊 Balance Updates Received: ${testResults.filter(r => r.type === 'balance_update').length}`);
        
        const allTestsPassed = depositSuccess && optionsSuccess && spotSuccess && withdrawalSuccess;
        console.log(`\n🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        
        if (testResults.length > 0) {
            console.log('\n📡 Real-time Updates Log:');
            testResults.forEach((result, index) => {
                console.log(`${index + 1}. ${result.type}: ${result.balance} USDT (${result.changeType || 'init'}) at ${result.timestamp}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        if (ws) {
            ws.close();
        }
        process.exit(0);
    }
}

// Start verification
runVerification();
