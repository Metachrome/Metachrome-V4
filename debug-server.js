// Debug script to identify server startup issues
console.log('🔍 Starting debug process...');

try {
  console.log('📦 Testing require statements...');
  
  // Test each require statement individually
  console.log('  ✓ Testing express...');
  const express = require('express');
  
  console.log('  ✓ Testing path...');
  const path = require('path');
  
  console.log('  ✓ Testing fs...');
  const fs = require('fs');
  
  console.log('  ✓ Testing cors...');
  const cors = require('cors');
  
  console.log('  ✓ Testing multer...');
  const multer = require('multer');
  
  console.log('  ✓ Testing bcryptjs...');
  const bcrypt = require('bcryptjs');
  
  console.log('  ✓ Testing ws...');
  const { WebSocketServer } = require('ws');
  
  console.log('  ✓ Testing http...');
  const http = require('http');
  
  console.log('  ✓ Testing dotenv...');
  require('dotenv').config();
  
  console.log('  ✓ Testing @supabase/supabase-js...');
  const { createClient } = require('@supabase/supabase-js');
  
  console.log('✅ All basic requires successful');
  
  // Test dynamic import
  console.log('🔄 Testing dynamic import...');
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  console.log('✅ Dynamic import setup successful');
  
  // Test basic express app
  console.log('🚀 Testing basic express app...');
  const app = express();
  const PORT = 3006; // Use different port for testing
  
  app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Debug server working!' });
  });
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Debug server running on http://localhost:${PORT}`);
    console.log(`🧪 Test URL: http://localhost:${PORT}/test`);
    
    // Auto-shutdown after 30 seconds
    setTimeout(() => {
      console.log('🛑 Auto-shutting down debug server...');
      server.close();
      process.exit(0);
    }, 30000);
  });
  
  server.on('error', (err) => {
    console.error('❌ Debug server error:', err);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Debug failed:', error.message);
  console.error('❌ Stack:', error.stack);
  process.exit(1);
}
