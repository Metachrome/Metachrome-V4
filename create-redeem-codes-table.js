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
    console.log('🔧 Supabase URL:', supabaseUrl);
    console.log('🔧 Service Key available:', !!supabaseServiceKey);

    // Step 1: Try to create redeem_codes table using direct table creation
    console.log('\n📋 Step 1: Creating redeem_codes table...');

    try {
      // Try to insert a test record to see if table exists
      const { data: testData, error: testError } = await supabase
        .from('redeem_codes')
        .select('*')
        .limit(1);

      if (testError) {
        if (testError.code === 'PGRST106' || testError.message.includes('does not exist')) {
          console.log('❌ Table does not exist, need to create it manually');
          console.log('\n🔧 MANUAL SETUP REQUIRED:');
          console.log('=============================');
          console.log('1. Open your Supabase dashboard');
          console.log('2. Go to SQL Editor');
          console.log('3. Copy and paste this SQL:');
          console.log('\n--- COPY THIS SQL ---');
          console.log(`
-- Create redeem_codes table
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

-- Create user_redeem_history table
CREATE TABLE public.user_redeem_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  bonus_amount DECIMAL(10,2) NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_code_redemption UNIQUE (user_id, code)
);

-- Create indexes
CREATE INDEX idx_redeem_codes_code ON public.redeem_codes(code);
CREATE INDEX idx_redeem_codes_active ON public.redeem_codes(is_active);
CREATE INDEX idx_user_redeem_history_user_id ON public.user_redeem_history(user_id);
CREATE INDEX idx_user_redeem_history_code ON public.user_redeem_history(code);

-- Insert sample data
INSERT INTO public.redeem_codes (code, bonus_amount, max_uses, current_uses, description) VALUES
  ('FIRSTBONUS', 100.00, NULL, 0, 'First time user bonus'),
  ('LETSGO1000', 1000.00, NULL, 0, 'High value bonus code'),
  ('WELCOME50', 50.00, 100, 0, 'Welcome bonus for new users'),
  ('BONUS500', 500.00, 50, 0, 'Limited time bonus');
          `);
          console.log('--- END SQL ---\n');
          console.log('4. Click "Run" to execute the SQL');
          console.log('5. Refresh your admin dashboard');
          console.log('\n✅ After running the SQL, the admin dashboard will work with real data!');
          return false;
        } else {
          console.error('❌ Unexpected error:', testError);
          return false;
        }
      } else {
        console.log('✅ Table already exists!');
        console.log(`📋 Found ${testData.length} existing codes`);

        // Try to add sample data if table is empty
        if (testData.length === 0) {
          console.log('📋 Table is empty, adding sample data...');

          const sampleCodes = [
            { code: 'FIRSTBONUS', bonus_amount: 100, description: 'First time user bonus' },
            { code: 'LETSGO1000', bonus_amount: 1000, description: 'High value bonus code' },
            { code: 'WELCOME50', bonus_amount: 50, max_uses: 100, description: 'Welcome bonus for new users' },
            { code: 'BONUS500', bonus_amount: 500, max_uses: 50, description: 'Limited time bonus' }
          ];

          for (const codeData of sampleCodes) {
            const { error: insertError } = await supabase
              .from('redeem_codes')
              .insert(codeData);

            if (insertError && !insertError.message.includes('duplicate')) {
              console.log(`⚠️ Could not insert ${codeData.code}:`, insertError.message);
            } else {
              console.log(`✅ Added sample code: ${codeData.code}`);
            }
          }
        }

        return true;
      }
    } catch (error) {
      console.error('❌ Error checking table:', error);
      return false;
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Commented out automatic execution to prevent server startup issues
// createRedeemCodesTable().then(success => {
//   if (success) {
//     console.log('🎉 Redeem codes table setup complete!');
//   } else {
//     console.log('⚠️ Table setup incomplete - will modify server to handle gracefully');
//   }
// });

// Export the function for manual execution if needed
module.exports = { createRedeemCodesTable };
