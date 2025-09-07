const { execSync } = require('child_process');

console.log('🏗️ Starting Vercel build...');

try {
  // Simple vite build
  console.log('📦 Building with Vite...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
