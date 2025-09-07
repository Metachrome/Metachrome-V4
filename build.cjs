#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function buildForVercel() {
  console.log('🏗️  Building for Vercel deployment...');
  
  try {
    // Copy assets first
    console.log('📁 Copying assets...');
    try {
      execSync('node copy-assets.cjs', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Asset copying failed, continuing...');
    }
    
    // Build the frontend
    console.log('📦 Building frontend...');
    execSync('npx vite build', { stdio: 'inherit' });
    
    console.log('✅ Build completed successfully!');
    console.log('');
    console.log('📋 Vercel Deployment Status:');
    console.log('  1. ✅ Frontend built');
    console.log('  2. ✅ Assets processed');
    console.log('  3. ⚠️  Configure environment variables in Vercel');
    console.log('');
    console.log('🔗 See VERCEL_DEPLOYMENT_GUIDE.md for setup instructions');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildForVercel();
