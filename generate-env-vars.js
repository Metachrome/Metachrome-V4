#!/usr/bin/env node

import crypto from 'crypto';

console.log('🔐 Generating Environment Variables for CryptoTradeX\n');

// Generate secure random strings
const jwtSecret = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 Copy these environment variables to your Vercel project:\n');

console.log('# Security Secrets (Generated)');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('');

console.log('# Environment');
console.log('NODE_ENV=production');
console.log('');

console.log('# Database (Replace with your actual PostgreSQL URL)');
console.log('DATABASE_URL=postgresql://username:password@host:5432/database');
console.log('');

console.log('# CORS (Replace with your actual Vercel domain)');
console.log('ALLOWED_ORIGINS=https://your-app.vercel.app');
console.log('');

console.log('🔗 Database Setup Options:');
console.log('  1. Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres');
console.log('  2. Neon.tech: https://neon.tech (Free tier)');
console.log('  3. Supabase: https://supabase.com (Free tier)');
console.log('');

console.log('📝 Next Steps:');
console.log('  1. Set up a PostgreSQL database (see options above)');
console.log('  2. Replace DATABASE_URL with your actual connection string');
console.log('  3. Replace ALLOWED_ORIGINS with your Vercel domain');
console.log('  4. Add all variables to Vercel Dashboard → Settings → Environment Variables');
console.log('  5. Run: npx tsx setup-production-db.ts (with DATABASE_URL set)');
console.log('  6. Deploy: vercel --prod');
