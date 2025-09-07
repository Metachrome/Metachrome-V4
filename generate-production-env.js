import crypto from 'crypto';

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 Generating secure environment variables for production...\n');

const jwtSecret = generateSecureKey(32);
const sessionSecret = generateSecureKey(32);

console.log('📋 Copy these environment variables to your Vercel dashboard:');
console.log('   (Settings → Environment Variables)\n');

console.log('DATABASE_URL=postgresql://username:password@host:5432/database');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('NODE_ENV=production');
console.log('ALLOWED_ORIGINS=https://metachrome-v2.vercel.app');
console.log('RATE_LIMIT_WINDOW_MS=900000');
console.log('RATE_LIMIT_MAX_REQUESTS=100');

console.log('\n🗄️ Database Setup Options:');
console.log('\n1. **Neon (Recommended for Vercel)**');
console.log('   • Go to: https://neon.tech');
console.log('   • Create free account');
console.log('   • Create new project');
console.log('   • Copy connection string');

console.log('\n2. **Supabase**');
console.log('   • Go to: https://supabase.com');
console.log('   • Create new project');
console.log('   • Settings → Database');
console.log('   • Copy connection string');

console.log('\n3. **Vercel Postgres**');
console.log('   • Vercel Dashboard → Your Project → Storage');
console.log('   • Create Postgres database');
console.log('   • Copy connection string');

console.log('\n📝 Next Steps:');
console.log('1. Set up PostgreSQL database (choose option above)');
console.log('2. Replace DATABASE_URL with your actual connection string');
console.log('3. Add all variables to Vercel Dashboard → Settings → Environment Variables');
console.log('4. Run: npm run setup-production (with DATABASE_URL set)');
console.log('5. Redeploy your Vercel app');
console.log('6. Check admin dashboard - it should now show real data!');

console.log('\n🎯 After setup, you can login with:');
console.log('   Username: admin');
console.log('   Password: admin123');