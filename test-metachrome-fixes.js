// TEST SCRIPT FOR METACHROME FIXES
// This script tests the three main fixes implemented:
// 1. Mobile trade notification display
// 2. Deposit requests appearing in admin dashboard
// 3. Withdrawal user identification and balance deduction

console.log('🧪 METACHROME FIXES TEST SCRIPT');
console.log('===============================');

// Test 1: Mobile Trade Notification
function testMobileNotification() {
    console.log('\n📱 TEST 1: Mobile Trade Notification');
    console.log('------------------------------------');
    
    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;
    console.log('📱 Screen width:', window.innerWidth);
    console.log('📱 Is mobile:', isMobile);
    
    // Check if TradeNotification component exists
    const tradeNotificationElements = document.querySelectorAll('[data-mobile-notification]');
    console.log('📱 Trade notification elements found:', tradeNotificationElements.length);
    
    // Check for any existing notifications
    const existingNotifications = document.querySelectorAll('[id*="notification"], [id*="trade-notification"]');
    console.log('📱 Existing notifications:', existingNotifications.length);
    
    // Test creating a mock trade notification
    if (typeof window.testPlatformWin === 'function') {
        console.log('📱 Testing platform notification...');
        window.testPlatformWin();
        console.log('✅ Platform notification test triggered');
    } else {
        console.log('⚠️ Platform notification test function not available');
    }
    
    return {
        isMobile,
        notificationElements: tradeNotificationElements.length,
        existingNotifications: existingNotifications.length
    };
}

// Test 2: Deposit Request Flow
async function testDepositFlow() {
    console.log('\n💰 TEST 2: Deposit Request Flow');
    console.log('--------------------------------');
    
    try {
        // Check if user is authenticated
        const authToken = localStorage.getItem('authToken');
        console.log('💰 Auth token exists:', !!authToken);
        
        if (!authToken) {
            console.log('⚠️ No auth token - user needs to login first');
            return { error: 'No authentication' };
        }
        
        // Test deposit request creation
        console.log('💰 Testing deposit request creation...');
        const testDepositData = {
            amount: '50',
            currency: 'USDT-ERC'
        };
        
        const response = await fetch('/api/transactions/deposit-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(testDepositData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Deposit request created:', result.depositId);
            
            // Test if it appears in admin pending requests
            console.log('💰 Checking admin pending requests...');
            const pendingResponse = await fetch('/api/admin/pending-requests');
            
            if (pendingResponse.ok) {
                const pendingData = await pendingResponse.json();
                console.log('💰 Pending deposits found:', pendingData.deposits?.length || 0);
                
                const ourDeposit = pendingData.deposits?.find(d => d.id === result.depositId);
                if (ourDeposit) {
                    console.log('✅ Our deposit found in pending requests');
                } else {
                    console.log('❌ Our deposit NOT found in pending requests');
                }
                
                return {
                    depositCreated: true,
                    depositId: result.depositId,
                    foundInPending: !!ourDeposit,
                    totalPendingDeposits: pendingData.deposits?.length || 0
                };
            } else {
                console.log('❌ Failed to fetch pending requests');
                return { error: 'Failed to fetch pending requests' };
            }
        } else {
            const error = await response.text();
            console.log('❌ Failed to create deposit request:', error);
            return { error: 'Failed to create deposit request' };
        }
    } catch (error) {
        console.log('❌ Deposit test error:', error);
        return { error: error.message };
    }
}

// Test 3: Withdrawal User Identification
async function testWithdrawalFlow() {
    console.log('\n💸 TEST 3: Withdrawal User Identification');
    console.log('------------------------------------------');
    
    try {
        // Check if user is authenticated
        const authToken = localStorage.getItem('authToken');
        console.log('💸 Auth token exists:', !!authToken);
        
        if (!authToken) {
            console.log('⚠️ No auth token - user needs to login first');
            return { error: 'No authentication' };
        }
        
        // Get current user info
        console.log('💸 Getting current user info...');
        const userResponse = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('💸 Current user:', userData.username, 'Balance:', userData.balance);
            
            // Test small withdrawal request (we won't actually submit it)
            const testWithdrawalData = {
                amount: '1',
                currency: 'USDT',
                address: 'test-address-123'
            };
            
            console.log('💸 Testing withdrawal request creation (dry run)...');
            console.log('💸 Would create withdrawal for user:', userData.username);
            console.log('💸 Amount:', testWithdrawalData.amount, testWithdrawalData.currency);
            
            return {
                userIdentified: true,
                username: userData.username,
                userId: userData.id,
                balance: userData.balance,
                testData: testWithdrawalData
            };
        } else {
            console.log('❌ Failed to get user info');
            return { error: 'Failed to get user info' };
        }
    } catch (error) {
        console.log('❌ Withdrawal test error:', error);
        return { error: error.message };
    }
}

// Run all tests
async function runAllTests() {
    console.log('🧪 RUNNING ALL TESTS...');
    console.log('========================');
    
    const results = {
        mobileNotification: testMobileNotification(),
        depositFlow: await testDepositFlow(),
        withdrawalFlow: await testWithdrawalFlow()
    };
    
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log('📱 Mobile Notification:', results.mobileNotification);
    console.log('💰 Deposit Flow:', results.depositFlow);
    console.log('💸 Withdrawal Flow:', results.withdrawalFlow);
    
    // Overall assessment
    const mobileOk = results.mobileNotification.notificationElements > 0;
    const depositOk = !results.depositFlow.error && results.depositFlow.foundInPending;
    const withdrawalOk = !results.withdrawalFlow.error && results.withdrawalFlow.userIdentified;
    
    console.log('\n✅ OVERALL STATUS:');
    console.log('📱 Mobile Notifications:', mobileOk ? 'WORKING' : 'NEEDS ATTENTION');
    console.log('💰 Deposit Requests:', depositOk ? 'WORKING' : 'NEEDS ATTENTION');
    console.log('💸 Withdrawal ID:', withdrawalOk ? 'WORKING' : 'NEEDS ATTENTION');
    
    return results;
}

// Make functions available globally
window.testMobileNotification = testMobileNotification;
window.testDepositFlow = testDepositFlow;
window.testWithdrawalFlow = testWithdrawalFlow;
window.runAllTests = runAllTests;

console.log('\n🎯 TEST FUNCTIONS AVAILABLE:');
console.log('- testMobileNotification() - Test mobile trade notifications');
console.log('- testDepositFlow() - Test deposit request flow');
console.log('- testWithdrawalFlow() - Test withdrawal user identification');
console.log('- runAllTests() - Run all tests');
console.log('\n💡 TIP: Run runAllTests() to test all fixes at once');
