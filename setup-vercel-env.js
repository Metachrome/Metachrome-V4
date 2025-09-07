#!/usr/bin/env node

import crypto from 'crypto';

console.log('🚀 Setting up Vercel Environment Variables for Production');
console.log('');

// Generate secure secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 Copy these environment variables to your Vercel dashboard:');
console.log('   Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables');
console.log('');

console.log('🔐 SECURITY VARIABLES:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('');

console.log('🗄️ DATABASE CONFIGURATION:');
console.log('DATABASE_URL=postgresql://postgres:HopeAmdHope87%5E%28@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres');
console.log('');

console.log('🌍 ENVIRONMENT SETTINGS:');
console.log('NODE_ENV=production');
console.log('ALLOWED_ORIGINS=https://metachrome-v2.vercel.app');
console.log('RATE_LIMIT_WINDOW_MS=900000');
console.log('RATE_LIMIT_MAX_REQUESTS=100');
console.log('');

console.log('📝 INSTRUCTIONS:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your metachrome-v2 project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each variable above (one by one)');
console.log('5. Set Environment to "Production"');
console.log('6. Click "Save"');
console.log('7. Redeploy your project');
console.log('');

console.log('🎯 IMPORTANT NOTES:');
console.log('- The DATABASE_URL uses URL encoding for special characters');
console.log('- Make sure to set Environment to "Production" for each variable');
console.log('- After adding all variables, redeploy the project');
console.log('');

console.log('✅ Once configured, your admin dashboard will connect to real Supabase data!');
