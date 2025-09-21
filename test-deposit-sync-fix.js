// Test script to verify deposit real-time synchronization fix
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING DEPOSIT REAL-TIME SYNC FIX');
console.log('=====================================');

async function testDepositSync() {
  try {
    console.log('\n1. 🔍 Testing production server health...');
    
    const healthResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/health');
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Production server is healthy');
    console.log('📊 Server status:', healthData);
    
    console.log('\n2. 🔍 Testing admin pending requests endpoint...');
    
    const adminResponse = await fetch('https://metachrome-v2-production.up.railway.app/api/admin/pending-requests');
    if (!adminResponse.ok) {
      throw new Error(`Admin endpoint failed: ${adminResponse.status}`);
    }
    
    const adminData = await adminResponse.json();
    console.log('✅ Admin endpoint responding');
    console.log('📊 Pending deposits from Supabase:', adminData.deposits?.length || 0);
    console.log('📊 Pending withdrawals from Supabase:', adminData.withdrawals?.length || 0);
    
    if (adminData.deposits && adminData.deposits.length > 0) {
      console.log('\n📋 Deposits in Supabase database:');
      adminData.deposits.forEach((deposit, index) => {
        console.log(`  ${index + 1}. ID: ${deposit.id}`);
        console.log(`     User: ${deposit.username}`);
        console.log(`     Amount: ${deposit.amount} ${deposit.currency}`);
        console.log(`     Status: ${deposit.status}`);
        console.log(`     Created: ${deposit.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No deposits found in Supabase database');
    }
    
    console.log('\n3. 🔍 Checking local file storage...');
    
    const dataFile = path.join(__dirname, 'pending-data.json');
    if (fs.existsSync(dataFile)) {
      const fileData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      console.log('✅ Local file exists');
      console.log('📊 Deposits in local file:', fileData.deposits?.length || 0);
      console.log('📊 Withdrawals in local file:', fileData.withdrawals?.length || 0);
      
      if (fileData.deposits && fileData.deposits.length > 0) {
        console.log('\n📋 Deposits in local file:');
        fileData.deposits.forEach((deposit, index) => {
          console.log(`  ${index + 1}. ID: ${deposit.id}`);
          console.log(`     User: ${deposit.username}`);
          console.log(`     Amount: ${deposit.amount} ${deposit.currency}`);
          console.log(`     Status: ${deposit.status}`);
          console.log(`     Created: ${deposit.created_at}`);
          console.log('');
        });
      }
    } else {
      console.log('⚠️ Local pending-data.json file not found');
    }
    
    console.log('\n4. 🎯 SYNC STATUS ANALYSIS:');
    
    const supabaseCount = adminData.deposits?.length || 0;
    const localCount = fs.existsSync(dataFile) ? 
      JSON.parse(fs.readFileSync(dataFile, 'utf8')).deposits?.length || 0 : 0;
    
    console.log(`📊 Supabase deposits: ${supabaseCount}`);
    console.log(`📊 Local file deposits: ${localCount}`);
    
    if (supabaseCount === localCount && supabaseCount > 0) {
      console.log('✅ PERFECT SYNC: Both sources have the same number of deposits');
    } else if (supabaseCount > 0 && localCount > 0) {
      console.log('⚠️ PARTIAL SYNC: Both sources have deposits but counts differ');
    } else if (supabaseCount > 0) {
      console.log('✅ SUPABASE ONLY: Deposits exist in Supabase (admin dashboard will work)');
    } else if (localCount > 0) {
      console.log('❌ LOCAL ONLY: Deposits only in local file (admin dashboard will be empty)');
    } else {
      console.log('ℹ️ NO DEPOSITS: No deposits in either source');
    }
    
    console.log('\n🎉 TEST COMPLETED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDepositSync();
