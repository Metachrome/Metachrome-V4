// Create a test withdrawal for testing the approve/reject functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixcqzqfqjqjqjqjqjqjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Y3F6cWZxanFqcWpxanFqcWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzQsImV4cCI6MjA1MDU0ODk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestWithdrawal() {
  console.log('🧪 Creating test withdrawal...');
  
  const testWithdrawal = {
    id: `test-withdrawal-${Date.now()}`,
    user_id: 'test-user-001',
    username: 'testuser',
    amount: 500,
    currency: 'USDT',
    wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96590b4165',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('withdrawals')
      .insert([testWithdrawal])
      .select();

    if (error) {
      console.error('❌ Error creating test withdrawal:', error);
    } else {
      console.log('✅ Test withdrawal created:', data[0]);
      console.log('🎯 Now refresh your admin dashboard to see the withdrawal');
      console.log('🎯 Then test approve/reject functionality');
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

createTestWithdrawal();
