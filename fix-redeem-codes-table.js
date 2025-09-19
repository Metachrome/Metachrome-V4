const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRedeemCodesTable() {
  try {
    console.log('🔍 Checking redeem_codes table...');

    // First, try to query the table to see if it exists
    const { data: existingCodes, error: queryError } = await supabase
      .from('redeem_codes')
      .select('*')
      .limit(1);

    if (queryError && queryError.code === '42P01') {
      console.log('📋 redeem_codes table does not exist. Creating it...');
      
      // Create the table using SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS redeem_codes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            bonus_amount DECIMAL(10,2) NOT NULL,
            max_uses INTEGER,
            current_uses INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Create index for faster lookups
          CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes(code);
          CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON redeem_codes(is_active);
        `
      });

      if (createError) {
        console.error('❌ Error creating table with RPC:', createError);
        
        // Try alternative approach - direct SQL execution
        const { error: altError } = await supabase
          .from('redeem_codes')
          .insert([]);  // This will fail but might give us better error info
        
        console.log('Alternative error:', altError);
        return;
      }

      console.log('✅ redeem_codes table created successfully');

      // Insert some sample data
      const { error: insertError } = await supabase
        .from('redeem_codes')
        .insert([
          {
            code: 'FIRSTBONUS',
            bonus_amount: 100,
            max_uses: null,
            current_uses: 45,
            description: 'First time user bonus'
          },
          {
            code: 'LETSGO1000',
            bonus_amount: 1000,
            max_uses: null,
            current_uses: 23,
            description: 'High value bonus code'
          },
          {
            code: 'WELCOME50',
            bonus_amount: 50,
            max_uses: 100,
            current_uses: 67,
            description: 'Welcome bonus for new users'
          },
          {
            code: 'BONUS500',
            bonus_amount: 500,
            max_uses: 50,
            current_uses: 12,
            description: 'Limited time bonus'
          }
        ]);

      if (insertError) {
        console.error('❌ Error inserting sample data:', insertError);
      } else {
        console.log('✅ Sample redeem codes inserted');
      }

    } else if (queryError) {
      console.error('❌ Error querying redeem_codes table:', queryError);
    } else {
      console.log('✅ redeem_codes table exists and is accessible');
      console.log(`📊 Found ${existingCodes?.length || 0} existing codes`);
    }

    // Test the endpoint
    console.log('\n🧪 Testing redeem codes endpoint...');
    const { data: codes, error: testError } = await supabase
      .from('redeem_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (testError) {
      console.error('❌ Test query failed:', testError);
    } else {
      console.log('✅ Test query successful');
      console.log(`📋 Retrieved ${codes.length} redeem codes`);
      
      // Calculate stats like the server does
      const stats = {
        activeCodes: codes.filter(c => c.is_active).length,
        totalRedeemed: codes.reduce((sum, c) => sum + (c.current_uses || 0), 0),
        bonusDistributed: codes.reduce((sum, c) => sum + ((c.current_uses || 0) * c.bonus_amount), 0),
        usageRate: codes.length > 0 ? Math.round((codes.filter(c => c.current_uses > 0).length / codes.length) * 100) : 0
      };

      console.log('📊 Stats:', stats);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixRedeemCodesTable();
