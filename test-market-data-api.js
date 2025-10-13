// MARKET DATA API TEST SCRIPT
// Copy and paste this into the browser console to test the market data API

console.log('🧪 MARKET DATA API TEST SCRIPT LOADED');

// Test function to check internal market data API
async function testMarketDataAPI() {
  console.log('🧪 TESTING: Starting market data API test...');
  
  try {
    // Test the internal market data API
    console.log('🔄 Testing /api/market-data endpoint...');
    const response = await fetch('/api/market-data');
    
    console.log('📊 Response status:', response.status, response.statusText);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Market data API working!');
      console.log('📊 Data received:', data);
      console.log('📊 Number of symbols:', data.length);
      
      if (data.length > 0) {
        console.log('📊 Sample data structure:', data[0]);
        
        // Check if data has required fields
        const requiredFields = ['symbol', 'price', 'timestamp'];
        const hasAllFields = requiredFields.every(field => data[0].hasOwnProperty(field));
        
        if (hasAllFields) {
          console.log('✅ Data structure is valid');
        } else {
          console.log('⚠️ Data structure missing some fields');
          console.log('📊 Available fields:', Object.keys(data[0]));
        }
      }
      
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('❌ Market data API failed:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
    
  } catch (error) {
    console.error('❌ Market data API test failed:', error);
    return { success: false, error: error.message };
  }
}

// Test function to check external CoinGecko API
async function testCoinGeckoAPI() {
  console.log('🧪 TESTING: Starting CoinGecko API test...');
  
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&per_page=2&page=1&sparkline=false&price_change_percentage=24h';
    
    console.log('🔄 Testing CoinGecko API...');
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    console.log('🪙 CoinGecko response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CoinGecko API working!');
      console.log('🪙 Data received:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('❌ CoinGecko API failed:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
    
  } catch (error) {
    console.error('❌ CoinGecko API test failed:', error);
    return { success: false, error: error.message };
  }
}

// Test function to check crypto data service
async function testCryptoDataService() {
  console.log('🧪 TESTING: Testing crypto data service...');
  
  try {
    // Try to access the crypto data service if it's available
    if (window.useCryptoData) {
      console.log('✅ useCryptoData hook found');
    } else {
      console.log('⚠️ useCryptoData hook not available in window');
    }
    
    // Check if there's any crypto data in the DOM
    const cryptoElements = document.querySelectorAll('[class*="crypto"], [class*="currency"], [class*="market"]');
    console.log('📊 Crypto-related elements found:', cryptoElements.length);
    
    // Check for error messages in the DOM
    const errorElements = document.querySelectorAll('*');
    const errorTexts = Array.from(errorElements)
      .map(el => el.textContent)
      .filter(text => text && (
        text.includes('Failed to fetch') || 
        text.includes('Using cached data') ||
        text.includes('temporarily unavailable')
      ));
    
    if (errorTexts.length > 0) {
      console.log('⚠️ Error messages found in DOM:', errorTexts);
    } else {
      console.log('✅ No error messages found in DOM');
    }
    
    return { success: true, errorTexts };
    
  } catch (error) {
    console.error('❌ Crypto data service test failed:', error);
    return { success: false, error: error.message };
  }
}

// Comprehensive test function
async function runAllTests() {
  console.log('🧪 TESTING: Running comprehensive market data tests...');
  console.log('='.repeat(60));
  
  const results = {};
  
  // Test 1: Internal API
  console.log('📊 Test 1: Internal Market Data API');
  results.internalAPI = await testMarketDataAPI();
  console.log('');
  
  // Test 2: External API
  console.log('🪙 Test 2: CoinGecko External API');
  results.externalAPI = await testCoinGeckoAPI();
  console.log('');
  
  // Test 3: Service
  console.log('⚙️ Test 3: Crypto Data Service');
  results.service = await testCryptoDataService();
  console.log('');
  
  // Summary
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('Internal API:', results.internalAPI.success ? '✅ PASS' : '❌ FAIL');
  console.log('External API:', results.externalAPI.success ? '✅ PASS' : '❌ FAIL');
  console.log('Service Check:', results.service.success ? '✅ PASS' : '❌ FAIL');
  
  if (results.internalAPI.success) {
    console.log('💡 RECOMMENDATION: Use internal API (working)');
  } else if (results.externalAPI.success) {
    console.log('💡 RECOMMENDATION: Use external API (internal API failed)');
  } else {
    console.log('💡 RECOMMENDATION: Use fallback data (both APIs failed)');
  }
  
  return results;
}

// Force refresh crypto data
function forceRefreshCryptoData() {
  console.log('🔄 FORCING: Crypto data refresh...');
  
  // Try to trigger a manual refresh
  const retryButtons = document.querySelectorAll('button');
  const retryButton = Array.from(retryButtons).find(btn => 
    btn.textContent && btn.textContent.toLowerCase().includes('retry')
  );
  
  if (retryButton) {
    console.log('🔄 Found retry button, clicking...');
    retryButton.click();
  } else {
    console.log('⚠️ No retry button found');
  }
  
  // Also try to reload the page
  setTimeout(() => {
    console.log('🔄 Reloading page to force refresh...');
    window.location.reload();
  }, 2000);
}

// Make functions available globally
window.testMarketDataAPI = testMarketDataAPI;
window.testCoinGeckoAPI = testCoinGeckoAPI;
window.testCryptoDataService = testCryptoDataService;
window.runAllTests = runAllTests;
window.forceRefreshCryptoData = forceRefreshCryptoData;

console.log('🧪 TESTING: Available functions:');
console.log('  - testMarketDataAPI() - Test internal market data API');
console.log('  - testCoinGeckoAPI() - Test external CoinGecko API');
console.log('  - testCryptoDataService() - Test crypto data service');
console.log('  - runAllTests() - Run all tests');
console.log('  - forceRefreshCryptoData() - Force refresh data');
console.log('');
console.log('🧪 TESTING: Quick start: Run runAllTests() to diagnose the issue');
