// Check if Railway has the latest code
const https = require('https');

console.log('🔍 Checking Railway deployment...');
console.log('📅 Latest commit: 9f2c07d - "Add detailed logging to track trade amount through active trades and polling"');
console.log('');

// Check the live site's JavaScript file
https.get('https://www.metachrome.io/trade/options', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Look for the JavaScript file reference
    const jsFileMatch = data.match(/index-(\d+)\.js/);
    if (jsFileMatch) {
      const timestamp = jsFileMatch[1];
      const buildDate = new Date(parseInt(timestamp));
      
      console.log('📦 Current build timestamp:', timestamp);
      console.log('📅 Build date:', buildDate.toISOString());
      console.log('🕐 Build time:', buildDate.toLocaleString());
      console.log('');
      
      const now = Date.now();
      const ageMinutes = Math.floor((now - parseInt(timestamp)) / 1000 / 60);
      
      console.log('⏰ Build age:', ageMinutes, 'minutes old');
      
      if (ageMinutes > 10) {
        console.log('');
        console.log('⚠️  WARNING: Build is more than 10 minutes old!');
        console.log('⚠️  Railway may not have rebuilt with the latest code yet.');
        console.log('');
        console.log('💡 Solutions:');
        console.log('   1. Wait 2-3 more minutes for Railway to finish building');
        console.log('   2. Go to Railway dashboard and click "Redeploy"');
        console.log('   3. Check Railway build logs for errors');
      } else {
        console.log('');
        console.log('✅ Build is recent! Railway has likely deployed the latest code.');
        console.log('');
        console.log('💡 If you still see the old code:');
        console.log('   1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
        console.log('   2. Clear browser cache');
        console.log('   3. Try incognito/private browsing mode');
      }
    } else {
      console.log('❌ Could not find JavaScript file reference in HTML');
    }
  });
}).on('error', (err) => {
  console.error('❌ Error checking Railway:', err.message);
});

