const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTransaction() {
  console.log('🧪 Testing transaction creation...');

  try {
    // First, let's check what columns exist in the transactions table
    console.log('📋 Checking table structure...');
    
    // Try to get a sample transaction to see the structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log('⚠️ Error getting sample data:', sampleError.message);
    } else {
      console.log('📋 Sample transaction structure:', sampleData[0] ? Object.keys(sampleData[0]) : 'No transactions found');
    }

    // Test transaction with symbol
    console.log('🧪 Testing transaction with symbol...');
    const testDataWithSymbol = {
      user_id: 'user-1',
      type: 'deposit',
      symbol: 'USDT',
      amount: 100,
      status: 'completed',
      description: 'Test transaction with symbol'
    };

    const { data: dataWithSymbol, error: errorWithSymbol } = await supabase
      .from('transactions')
      .insert([testDataWithSymbol])
      .select()
      .single();

    if (errorWithSymbol) {
      console.log('❌ Error with symbol:', errorWithSymbol.message);
      
      // Test without symbol
      console.log('🧪 Testing transaction without symbol...');
      const { symbol, ...testDataWithoutSymbol } = testDataWithSymbol;
      
      const { data: dataWithoutSymbol, error: errorWithoutSymbol } = await supabase
        .from('transactions')
        .insert([testDataWithoutSymbol])
        .select()
        .single();

      if (errorWithoutSymbol) {
        console.log('❌ Error without symbol:', errorWithoutSymbol.message);
      } else {
        console.log('✅ Success without symbol:', dataWithoutSymbol.id);
        
        // Clean up test transaction
        await supabase
          .from('transactions')
          .delete()
          .eq('id', dataWithoutSymbol.id);
        console.log('🧹 Cleaned up test transaction');
      }
    } else {
      console.log('✅ Success with symbol:', dataWithSymbol.id);
      
      // Clean up test transaction
      await supabase
        .from('transactions')
        .delete()
        .eq('id', dataWithSymbol.id);
      console.log('🧹 Cleaned up test transaction');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTransaction();
