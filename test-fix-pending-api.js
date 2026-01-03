/**
 * Test script to call the fix pending trade transactions API
 * This simulates what the dashboard button does
 */

const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testFixPendingTransactions() {
  console.log('🧪 Testing Fix Pending Trade Transactions API\n');
  console.log(`API URL: ${API_URL}\n`);

  try {
    // First, check if we need authentication
    console.log('📡 Calling API endpoint...');
    
    const response = await fetch(`${API_URL}/api/admin/fix-pending-trade-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Response Status: ${response.status} ${response.statusText}\n`);

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!\n');
      console.log('Summary:');
      console.log('─'.repeat(60));
      console.log(`Total Pending: ${data.summary.totalPending}`);
      console.log(`Updated: ${data.summary.updated}`);
      console.log(`Errors: ${data.summary.errors}`);
      
      if (data.summary.errorDetails && data.summary.errorDetails.length > 0) {
        console.log('\nError Details:');
        data.summary.errorDetails.forEach((err, idx) => {
          console.log(`${idx + 1}. Transaction ${err.transactionId}: ${err.error}`);
        });
      }
      console.log('─'.repeat(60));
    } else {
      console.log('❌ Error!\n');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (response.status === 401 || response.status === 403) {
        console.log('\n⚠️  Note: This endpoint requires admin authentication.');
        console.log('Please use the dashboard button instead, or provide session cookie.');
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('\n⚠️  Make sure the server is running on', API_URL);
  }
}

// Run the test
testFixPendingTransactions();

