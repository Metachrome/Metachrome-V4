const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTradesSchema() {
  console.log('🔍 Checking trades table schema...');

  try {
    // Check trades table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'trades')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.log('❌ Error checking trades schema:', columnsError.message);
      return;
    }

    console.log('📋 Trades table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Try to create a minimal trade with only the columns that exist
    console.log('\n🧪 Testing minimal trade creation...');
    
    const minimalTrade = {
      user_id: 'user-angela-1758195715',
      symbol: 'BTCUSDT',
      direction: 'up',
      amount: 100,
      duration: 30,
      entry_price: 65000,
      exit_price: 65500,
      result: 'win'
    };

    // Remove fields that don't exist in the schema
    const availableColumns = columns.map(c => c.column_name);
    const cleanTrade = {};
    
    Object.keys(minimalTrade).forEach(key => {
      if (availableColumns.includes(key)) {
        cleanTrade[key] = minimalTrade[key];
      } else {
        console.log(`⚠️ Skipping field '${key}' - not in schema`);
      }
    });

    console.log('📋 Clean trade data:', cleanTrade);

    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert([cleanTrade])
      .select()
      .single();

    if (tradeError) {
      console.log('❌ Error creating minimal trade:', tradeError.message);
    } else {
      console.log('✅ Minimal trade created successfully:', trade.id);
      console.log('📈 Created trade:', trade);
      
      // Clean up test trade
      await supabase
        .from('trades')
        .delete()
        .eq('id', trade.id);
      console.log('🧹 Cleaned up test trade');
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkTradesSchema();
