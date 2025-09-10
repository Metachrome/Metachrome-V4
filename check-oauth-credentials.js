import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔐 OAuth Credentials Check\n');

console.log('📋 Environment Variables Status:');
console.log('================================');

// Google OAuth
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
console.log('Google OAuth:');
console.log(`  Client ID: ${googleClientId ? '✅ Set (' + googleClientId.substring(0, 20) + '...)' : '❌ Missing'}`);
console.log(`  Client Secret: ${googleClientSecret ? '✅ Set (' + googleClientSecret.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`  Status: ${googleClientId && googleClientSecret ? '✅ Ready' : '❌ Not configured'}\n`);

// LinkedIn OAuth
const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
const linkedinClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
console.log('LinkedIn OAuth:');
console.log(`  Client ID: ${linkedinClientId ? '✅ Set (' + linkedinClientId + ')' : '❌ Missing'}`);
console.log(`  Client Secret: ${linkedinClientSecret ? '✅ Set (' + linkedinClientSecret.substring(0, 15) + '...)' : '❌ Missing'}`);
console.log(`  Status: ${linkedinClientId && linkedinClientSecret ? '✅ Ready' : '❌ Not configured'}\n`);

// Twitter OAuth
const twitterClientId = process.env.TWITTER_CLIENT_ID;
const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;
console.log('Twitter OAuth:');
console.log(`  Client ID: ${twitterClientId ? '✅ Set (' + twitterClientId.substring(0, 20) + '...)' : '❌ Missing'}`);
console.log(`  Client Secret: ${twitterClientSecret ? '✅ Set (' + twitterClientSecret.substring(0, 10) + '...)' : '❌ Missing'}`);
console.log(`  Status: ${twitterClientId && twitterClientSecret ? '✅ Ready' : '⚠️ Optional - Not configured'}\n`);

// Other important variables
console.log('Other Configuration:');
console.log(`  JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`  Session Secret: ${process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`  Database URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`  Node Environment: ${process.env.NODE_ENV || 'development'}\n`);

// Summary
console.log('📊 Summary:');
console.log('===========');
const googleReady = !!(googleClientId && googleClientSecret);
const linkedinReady = !!(linkedinClientId && linkedinClientSecret);
const twitterReady = !!(twitterClientId && twitterClientSecret);

console.log(`✅ Google OAuth: ${googleReady ? 'READY' : 'NOT CONFIGURED'}`);
console.log(`✅ LinkedIn OAuth: ${linkedinReady ? 'READY' : 'NOT CONFIGURED'}`);
console.log(`⚠️ Twitter OAuth: ${twitterReady ? 'READY' : 'OPTIONAL - NOT CONFIGURED'}`);
console.log(`✅ MetaMask: ALWAYS READY\n`);

if (googleReady || linkedinReady) {
  console.log('🎉 You have at least one social login configured!');
  console.log('📝 Next steps:');
  console.log('   1. Add callback URLs to your OAuth provider settings');
  console.log('   2. Deploy to production with these environment variables');
  console.log('   3. Test your social logins');
} else {
  console.log('⚠️ No social logins configured yet.');
  console.log('📝 You need to add OAuth credentials to your .env file');
}

console.log('\n🔗 Required Callback URLs:');
console.log('===========================');
console.log('For local development:');
console.log('  Google: http://localhost:5000/api/auth/google/callback');
console.log('  LinkedIn: http://localhost:5000/api/auth/linkedin/callback');
console.log('  Twitter: http://localhost:5000/api/auth/twitter/callback');
console.log('\nFor production (replace with your domain):');
console.log('  Google: https://your-domain.com/api/auth/google/callback');
console.log('  LinkedIn: https://your-domain.com/api/auth/linkedin/callback');
console.log('  Twitter: https://your-domain.com/api/auth/twitter/callback');
