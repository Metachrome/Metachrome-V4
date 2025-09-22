// Test script to verify Railway deployment readiness
const fs = require('fs');
const path = require('path');

console.log('🚀 RAILWAY DEPLOYMENT READINESS TEST');
console.log('='.repeat(50));

let allChecksPass = true;

function checkFile(filePath, description, required = true) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    if (required) {
      console.log(`❌ ${description}: ${filePath} (REQUIRED)`);
      allChecksPass = false;
    } else {
      console.log(`⚠️ ${description}: ${filePath} (OPTIONAL)`);
    }
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    console.log(`✅ ${description}: ${dirPath}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${dirPath}`);
    allChecksPass = false;
    return false;
  }
}

// Check required files
console.log('\n📁 Required Files:');
checkFile('Dockerfile', 'Dockerfile');
checkFile('railway.toml', 'Railway config');
checkFile('package.json', 'Package.json');
checkFile('working-server.js', 'Main server file');
checkFile('railway-start.js', 'Railway startup script');

// Check build output
console.log('\n🏗️ Build Output:');
checkDirectory('dist', 'Build directory');
checkFile('dist/public/index.html', 'Frontend build');

// Check data files
console.log('\n📊 Data Files:');
checkFile('pending-data.json', 'Pending data', false);
checkFile('admin-data.json', 'Admin data', false);
checkFile('users-data.json', 'Users data', false);
checkFile('trades-data.json', 'Trades data', false);
checkFile('transactions-data.json', 'Transactions data', false);

// Check package.json scripts
console.log('\n📜 Package.json Scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'start', 'railway-start'];
  
  for (const script of requiredScripts) {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ Script "${script}": ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ Missing script: ${script}`);
      allChecksPass = false;
    }
  }
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
  allChecksPass = false;
}

// Check Dockerfile
console.log('\n🐳 Dockerfile Check:');
try {
  const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
  
  const dockerChecks = [
    { pattern: /FROM node:18-slim/, description: 'Node.js base image' },
    { pattern: /COPY --from=builder/, description: 'Multi-stage build' },
    { pattern: /CMD \["node", "railway-start.js"\]/, description: 'Railway startup command' },
    { pattern: /EXPOSE \$PORT/, description: 'Dynamic port exposure' }
  ];
  
  for (const check of dockerChecks) {
    if (check.pattern.test(dockerfile)) {
      console.log(`✅ ${check.description}`);
    } else {
      console.log(`❌ ${check.description}`);
      allChecksPass = false;
    }
  }
} catch (error) {
  console.log(`❌ Error reading Dockerfile: ${error.message}`);
  allChecksPass = false;
}

// Check railway.toml
console.log('\n🚂 Railway Config Check:');
try {
  const railwayConfig = fs.readFileSync('railway.toml', 'utf8');
  
  const railwayChecks = [
    { pattern: /builder = "DOCKERFILE"/, description: 'Dockerfile builder' },
    { pattern: /startCommand = "node railway-start.js"/, description: 'Start command' },
    { pattern: /healthcheckPath = "\/api\/health"/, description: 'Health check path' }
  ];
  
  for (const check of railwayChecks) {
    if (check.pattern.test(railwayConfig)) {
      console.log(`✅ ${check.description}`);
    } else {
      console.log(`❌ ${check.description}`);
      allChecksPass = false;
    }
  }
} catch (error) {
  console.log(`❌ Error reading railway.toml: ${error.message}`);
  allChecksPass = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
  console.log('🎉 ✅ ALL CHECKS PASSED!');
  console.log('🚀 Ready for Railway deployment!');
  console.log('\n📋 Deployment Steps:');
  console.log('1. Commit all changes to git');
  console.log('2. Push to your Railway-connected repository');
  console.log('3. Railway will automatically build and deploy');
  console.log('4. Check the health endpoint: /api/health');
} else {
  console.log('❌ SOME CHECKS FAILED!');
  console.log('🔧 Please fix the issues above before deploying');
}
console.log('='.repeat(50));
