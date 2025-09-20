const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createRedeemCodesTable() {
  try {
    console.log('🔧 Creating redeem_codes and user_redeem_history tables...');

    // Create both tables and user_redeem_history table
    const createTablesSQL = `
      -- Create redeem_codes table
      CREATE TABLE IF NOT EXISTS public.redeem_codes (
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

      -- Create user_redeem_history table
      CREATE TABLE IF NOT EXISTS public.user_redeem_history (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        bonus_amount DECIMAL(10,2) NOT NULL,
        redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_user_code_redemption UNIQUE (user_id, code)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON public.redeem_codes(code);
      CREATE INDEX IF NOT EXISTS idx_redeem_codes_active ON public.redeem_codes(is_active);
      CREATE INDEX IF NOT EXISTS idx_redeem_codes_created_at ON public.redeem_codes(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_redeem_history_user_id ON public.user_redeem_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_redeem_history_code ON public.user_redeem_history(code);

      -- Insert sample data
      INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, current_uses, description) VALUES
        ('FIRSTBONUS', 100.00, NULL, 0, 'First time user bonus'),
        ('LETSGO1000', 1000.00, NULL, 0, 'High value bonus code'),
        ('WELCOME50', 50.00, 100, 0, 'Welcome bonus for new users'),
        ('BONUS500', 500.00, 50, 0, 'Limited time bonus')
      ON CONFLICT (code) DO NOTHING;
    `;

    // Execute the SQL using the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql: createTablesSQL })
    });

    if (!response.ok) {
      // Try alternative approach - use pg_sql function if available
      console.log('🔄 Trying alternative approach...');
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: createTablesSQL
      });

      if (error) {
        console.error('❌ Error with RPC approach:', error);
        
        // Manual table creation approach
        console.log('🔧 Trying manual table creation...');
        
        // First create the table structure
        const { error: createError } = await supabase
          .from('redeem_codes')
          .select('*')
          .limit(0);
        
        if (createError && createError.code === 'PGRST205') {
          console.log('📋 Table does not exist. This is expected.');
          console.log('🔧 Please create the table manually in Supabase dashboard:');
          console.log(`
CREATE TABLE public.redeem_codes (
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

CREATE INDEX idx_redeem_codes_code ON public.redeem_codes(code);
CREATE INDEX idx_redeem_codes_active ON public.redeem_codes(is_active);
          `);
          
          // For now, let's modify the server to handle missing table gracefully
          console.log('🔧 Will modify server to handle missing table gracefully...');
          return false;
        }
      } else {
        console.log('✅ Table created successfully with RPC');
      }
    } else {
      console.log('✅ Table created successfully with REST API');
    }

    // Test the table
    console.log('🧪 Testing table access...');
    const { data: codes, error: testError } = await supabase
      .from('redeem_codes')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('❌ Test failed:', testError);
      return false;
    } else {
      console.log('✅ Table test successful');
      console.log(`📋 Found ${codes.length} redeem codes`);
      return true;
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

createRedeemCodesTable().then(success => {
  if (success) {
    console.log('🎉 Redeem codes table setup complete!');
  } else {
    console.log('⚠️ Table setup incomplete - will modify server to handle gracefully');
  }
});
