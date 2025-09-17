#!/usr/bin/env node

/**
 * Production Environment Setup Script for METACHROME V2
 * This script helps set up the production environment variables for Railway deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 METACHROME V2 - Production Environment Setup');
console.log('===============================================');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);

// Required environment variables for production
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'SESSION_SECRET'
];

// Optional environment variables
const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'ALLOWED_ORIGINS'
];

function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables...');
  
  const missing = [];
  const present = [];
  
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
      console.log(`✅ ${varName}: Set`);
    } else {
      missing.push(varName);
      console.log(`❌ ${varName}: Missing`);
    }
  });
  
  console.log('\n📋 Optional Variables:');
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`⚪ ${varName}: Not set (optional)`);
    }
  });
  
  if (missing.length > 0) {
    console.log('\n❌ Missing Required Environment Variables:');
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n📖 Please set these variables in your Railway dashboard.');
    return false;
  }
  
  console.log('\n✅ All required environment variables are set!');
  return true;
}

function testSupabaseConnection() {
  console.log('\n🗄️ Testing Supabase Connection...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not found');
    return false;
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    return true;
  } catch (error) {
    console.log('❌ Failed to create Supabase client:', error.message);
    return false;
  }
}

function generateSecrets() {
  console.log('\n🔐 Generating Secure Secrets...');
  
  const crypto = require('crypto');
  
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const sessionSecret = crypto.randomBytes(64).toString('hex');
  
  console.log('Generated secrets (use these in Railway):');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`SESSION_SECRET=${sessionSecret}`);
  
  return { jwtSecret, sessionSecret };
}

function createProductionEnvTemplate() {
  console.log('\n📝 Creating Production Environment Template...');
  
  const { jwtSecret, sessionSecret } = generateSecrets();
  
  const template = `# METACHROME V2 - Production Environment Variables
# Copy these to your Railway project dashboard

# Core Configuration
NODE_ENV=production
PORT=3000

# Supabase Database (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Security (REQUIRED)
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# CORS Configuration
ALLOWED_ORIGINS=https://your-app.railway.app,http://localhost:3000
`;

  fs.writeFileSync('.env.production.template', template);
  console.log('✅ Created .env.production.template');
  console.log('📋 Copy the values from this file to your Railway dashboard');
}

function main() {
  console.log('\n🔧 Starting Production Setup...');
  
  if (isProduction) {
    // In production, check if all variables are set
    const allSet = checkEnvironmentVariables();
    const supabaseOk = testSupabaseConnection();
    
    if (allSet && supabaseOk) {
      console.log('\n🎉 Production environment is properly configured!');
      process.exit(0);
    } else {
      console.log('\n❌ Production environment setup incomplete');
      process.exit(1);
    }
  } else {
    // In development, create template
    createProductionEnvTemplate();
    console.log('\n📖 Next Steps:');
    console.log('1. Set up your Supabase database using setup-supabase-database.sql');
    console.log('2. Copy the environment variables to your Railway dashboard');
    console.log('3. Deploy to Railway');
    console.log('4. Test the deployment using the health check endpoint');
  }
}

// Run the setup
main();
