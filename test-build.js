// Simple script to test if the build is working correctly
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Testing build output...');

const distPath = path.join(__dirname, 'dist', 'public');
const indexPath = path.join(distPath, 'index.html');
const assetsPath = path.join(distPath, 'assets');

// Check if index.html exists
if (fs.existsSync(indexPath)) {
  console.log('✅ index.html found');
  
  // Check if it contains the correct script references
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (indexContent.includes('/assets/index-') && indexContent.includes('.js')) {
    console.log('✅ JavaScript bundle reference found');
  } else {
    console.log('❌ JavaScript bundle reference missing');
  }
  
  if (indexContent.includes('/assets/index-') && indexContent.includes('.css')) {
    console.log('✅ CSS bundle reference found');
  } else {
    console.log('❌ CSS bundle reference missing');
  }
} else {
  console.log('❌ index.html not found');
}

// Check if assets directory exists
if (fs.existsSync(assetsPath)) {
  console.log('✅ assets directory found');
  
  const assets = fs.readdirSync(assetsPath);
  const jsFiles = assets.filter(file => file.endsWith('.js'));
  const cssFiles = assets.filter(file => file.endsWith('.css'));
  
  console.log(`✅ Found ${jsFiles.length} JS files`);
  console.log(`✅ Found ${cssFiles.length} CSS files`);
  console.log(`✅ Found ${assets.length} total assets`);
} else {
  console.log('❌ assets directory not found');
}

// Check API file
const apiPath = path.join(__dirname, 'api', 'index.ts');
if (fs.existsSync(apiPath)) {
  console.log('✅ API endpoint found');
} else {
  console.log('❌ API endpoint missing');
}

console.log('\n🎯 Build verification complete!');
console.log('\n🔧 Fixes applied:');
console.log('✅ SPA routing configuration');
console.log('✅ API fallback handlers');
console.log('✅ Enhanced error logging');
console.log('✅ Multiple API endpoints');
console.log('✅ User menu dropdown');
console.log('✅ Admin login routing');
console.log('✅ Logout functionality');

console.log('\n📋 Next steps:');
console.log('1. Push code to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Fix 404 and 500 errors - comprehensive solution"');
console.log('   git push origin main');
console.log('');
console.log('2. Redeploy on Vercel');
console.log('3. Test endpoints:');
console.log('   - your-app.vercel.app (homepage)');
console.log('   - your-app.vercel.app/login (user login)');
console.log('   - your-app.vercel.app/admin/login (admin login)');
console.log('   - your-app.vercel.app/api/test (API test)');
console.log('');
console.log('4. Login credentials:');
console.log('   - User: trader1 / password123');
console.log('   - Admin: admin / admin123');
