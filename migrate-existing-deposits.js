// Migration script to move existing deposits from local file to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pybsyzbxyliufkgywtpf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';

console.log('🔄 MIGRATING EXISTING DEPOSITS TO SUPABASE');
console.log('==========================================');

async function migrateDeposits() {
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('✅ Supabase client initialized');
    
    // Read local file
    const dataFile = path.join(__dirname, 'pending-data.json');
    if (!fs.existsSync(dataFile)) {
      console.log('⚠️ No pending-data.json file found');
      return;
    }
    
    const fileData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const localDeposits = fileData.deposits || [];
    
    console.log(`📊 Found ${localDeposits.length} deposits in local file`);
    
    if (localDeposits.length === 0) {
      console.log('ℹ️ No deposits to migrate');
      return;
    }
    
    // Check if deposits table exists
    console.log('\n🔍 Checking if deposits table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('deposits')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Deposits table does not exist or is not accessible:', tableError.message);
      console.log('\n📋 Please run the create-deposits-table.sql script in Supabase first:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Run the create-deposits-table.sql script');
      console.log('   3. Then run this migration script again');
      return;
    }
    
    console.log('✅ Deposits table exists');
    
    // Check for existing deposits in Supabase
    const { data: existingDeposits, error: existingError } = await supabase
      .from('deposits')
      .select('id');
    
    if (existingError) {
      console.error('❌ Failed to check existing deposits:', existingError.message);
      return;
    }
    
    const existingIds = new Set(existingDeposits.map(d => d.id));
    console.log(`📊 Found ${existingDeposits.length} existing deposits in Supabase`);
    
    // Prepare deposits for migration
    const depositsToMigrate = localDeposits.filter(deposit => !existingIds.has(deposit.id));
    console.log(`📊 ${depositsToMigrate.length} new deposits to migrate`);
    
    if (depositsToMigrate.length === 0) {
      console.log('✅ All deposits already exist in Supabase - no migration needed');
      return;
    }
    
    // Migrate deposits
    console.log('\n🔄 Migrating deposits...');
    
    for (const deposit of depositsToMigrate) {
      console.log(`   Migrating: ${deposit.id} - ${deposit.amount} ${deposit.currency} (${deposit.username})`);
      
      const supabaseDeposit = {
        id: deposit.id,
        user_id: deposit.user_id || deposit.userId,
        username: deposit.username,
        amount: parseFloat(deposit.amount),
        currency: deposit.currency,
        status: deposit.status || 'pending',
        receipt_uploaded: deposit.receiptUploaded || false,
        receipt_filename: deposit.receiptFile?.filename || null,
        created_at: deposit.created_at || deposit.createdAt || new Date().toISOString(),
        updated_at: deposit.updated_at || deposit.updatedAt || new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('deposits')
        .insert([supabaseDeposit]);
      
      if (error) {
        console.error(`   ❌ Failed to migrate ${deposit.id}:`, error.message);
      } else {
        console.log(`   ✅ Migrated ${deposit.id}`);
      }
    }
    
    console.log('\n🎉 MIGRATION COMPLETED!');
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const { data: finalDeposits, error: finalError } = await supabase
      .from('deposits')
      .select('id, username, amount, currency, status')
      .order('created_at', { ascending: false });
    
    if (finalError) {
      console.error('❌ Failed to verify migration:', finalError.message);
    } else {
      console.log(`✅ Total deposits in Supabase: ${finalDeposits.length}`);
      
      if (finalDeposits.length > 0) {
        console.log('\n📋 Deposits now in Supabase:');
        finalDeposits.forEach((deposit, index) => {
          console.log(`  ${index + 1}. ${deposit.id}: ${deposit.amount} ${deposit.currency} - ${deposit.username} (${deposit.status})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run migration
migrateDeposits();
