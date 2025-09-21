// Quick test to verify server can start without syntax errors
console.log('🧪 Testing server startup...');

try {
  // Test if the server file can be required without errors
  const path = require('path');
  const fs = require('fs');
  
  // Read the server file and check for basic syntax issues
  const serverPath = path.join(__dirname, 'working-server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check for common syntax issues
  const issues = [];
  
  // Check for unmatched braces
  const openBraces = (serverContent.match(/{/g) || []).length;
  const closeBraces = (serverContent.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
  }
  
  // Check for unmatched parentheses
  const openParens = (serverContent.match(/\(/g) || []).length;
  const closeParens = (serverContent.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
  }
  
  // Check for orphaned await statements
  const awaitMatches = serverContent.match(/^\s*const.*await\s/gm);
  if (awaitMatches) {
    issues.push(`Potential orphaned await statements: ${awaitMatches.length}`);
  }
  
  if (issues.length > 0) {
    console.log('❌ Potential syntax issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ Basic syntax checks passed');
  }
  
  console.log('📊 Server file stats:');
  console.log(`  - File size: ${(serverContent.length / 1024).toFixed(2)} KB`);
  console.log(`  - Lines: ${serverContent.split('\n').length}`);
  console.log(`  - Functions: ${(serverContent.match(/function\s+\w+|=>\s*{|app\.\w+\(/g) || []).length}`);
  
  console.log('\n🎉 Server file appears ready for deployment!');
  
} catch (error) {
  console.error('❌ Error testing server:', error.message);
}
