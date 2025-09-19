const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔄 Starting database migration...');

  try {
    // Check current table structure
    console.log('📋 Checking current transactions table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'transactions')
      .eq('table_schema', 'public');

    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
      return;
    }

    console.log('📋 Current columns:', columns.map(c => c.column_name));

    // Check if symbol column exists
    const hasSymbol = columns.some(col => col.column_name === 'symbol');
    
    if (!hasSymbol) {
      console.log('➕ Adding symbol column...');
      const { error: symbolError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE transactions ADD COLUMN symbol VARCHAR(20) NOT NULL DEFAULT 'USDT';`
      });
      
      if (symbolError) {
        console.error('❌ Error adding symbol column:', symbolError);
      } else {
        console.log('✅ Symbol column added successfully');
      }
    } else {
      console.log('✅ Symbol column already exists');
    }

    // Check if fee column exists
    const hasFee = columns.some(col => col.column_name === 'fee');
    
    if (!hasFee) {
      console.log('➕ Adding fee column...');
      const { error: feeError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE transactions ADD COLUMN fee DECIMAL(18,8) DEFAULT 0;`
      });
      
      if (feeError) {
        console.error('❌ Error adding fee column:', feeError);
      } else {
        console.log('✅ Fee column added successfully');
      }
    } else {
      console.log('✅ Fee column already exists');
    }

    console.log('🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
