// Test script to check for build errors
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for potential build issues...');

// Check if TradingViewWidget has syntax errors
const tradingViewPath = path.join(__dirname, 'client/src/components/TradingViewWidget.tsx');
if (fs.existsSync(tradingViewPath)) {
  const content = fs.readFileSync(tradingViewPath, 'utf8');
  
  // Check for common syntax issues
  const issues = [];
  
  // Check for unmatched brackets
  const openBrackets = (content.match(/\{/g) || []).length;
  const closeBrackets = (content.match(/\}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    issues.push(`Unmatched brackets: ${openBrackets} open, ${closeBrackets} close`);
  }
  
  // Check for unmatched parentheses
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
  }
  
  // Check for missing semicolons after imports
  const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
  importLines.forEach((line, index) => {
    if (!line.trim().endsWith(';')) {
      issues.push(`Missing semicolon on import line ${index + 1}: ${line.trim()}`);
    }
  });
  
  if (issues.length === 0) {
    console.log('✅ TradingViewWidget.tsx syntax looks good');
  } else {
    console.log('❌ TradingViewWidget.tsx issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
} else {
  console.log('❌ TradingViewWidget.tsx not found');
}

// Check if the built files exist
const distPath = path.join(__dirname, 'dist/public');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  console.log(`📦 Build files found: ${jsFiles.length} JS, ${cssFiles.length} CSS`);
  
  if (jsFiles.length > 0) {
    const jsFile = path.join(distPath, 'assets', jsFiles.find(f => f.includes('index')) || jsFiles[0]);
    if (fs.existsSync(jsFile)) {
      const jsContent = fs.readFileSync(jsFile, 'utf8');
      if (jsContent.includes('TradingViewWidget')) {
        console.log('✅ TradingViewWidget found in built JS');
      } else {
        console.log('⚠️ TradingViewWidget not found in built JS');
      }
    }
  }
} else {
  console.log('❌ Build directory not found');
}

console.log('🎉 Build check completed');
