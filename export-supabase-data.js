import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase credentials (from your current .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportData() {
  console.log('🔄 Starting Supabase data export...\n');

  const exportData = {
    users: [],
    trades: [],
    deposits: [],
    withdrawals: [],
    admin_activity_logs: [],
    redeem_codes: [],
    user_redeem_history: [],
    wallet_addresses: []
  };

  try {
    // Export users
    console.log('📥 Exporting users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (usersError) throw usersError;
    exportData.users = users || [];
    console.log(`✅ Exported ${exportData.users.length} users`);

    // Export trades
    console.log('📥 Exporting trades...');
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (tradesError) throw tradesError;
    exportData.trades = trades || [];
    console.log(`✅ Exported ${exportData.trades.length} trades`);

    // Export deposits
    console.log('📥 Exporting deposits...');
    const { data: deposits, error: depositsError } = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (depositsError) throw depositsError;
    exportData.deposits = deposits || [];
    console.log(`✅ Exported ${exportData.deposits.length} deposits`);

    // Export withdrawals
    console.log('📥 Exporting withdrawals...');
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (withdrawalsError) throw withdrawalsError;
    exportData.withdrawals = withdrawals || [];
    console.log(`✅ Exported ${exportData.withdrawals.length} withdrawals`);

    // Export admin activity logs
    console.log('📥 Exporting admin activity logs...');
    const { data: logs, error: logsError } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (logsError) throw logsError;
    exportData.admin_activity_logs = logs || [];
    console.log(`✅ Exported ${exportData.admin_activity_logs.length} activity logs`);

    // Export redeem codes
    console.log('📥 Exporting redeem codes...');
    const { data: codes, error: codesError } = await supabase
      .from('redeem_codes')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (codesError) throw codesError;
    exportData.redeem_codes = codes || [];
    console.log(`✅ Exported ${exportData.redeem_codes.length} redeem codes`);

    // Export user redeem history
    console.log('📥 Exporting user redeem history...');
    const { data: history, error: historyError } = await supabase
      .from('user_redeem_history')
      .select('*')
      .order('redeemed_at', { ascending: true });
    
    if (historyError) throw historyError;
    exportData.user_redeem_history = history || [];
    console.log(`✅ Exported ${exportData.user_redeem_history.length} redeem history records`);

    // Export wallet addresses
    console.log('📥 Exporting wallet addresses...');
    const { data: wallets, error: walletsError } = await supabase
      .from('wallet_addresses')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (walletsError) throw walletsError;
    exportData.wallet_addresses = wallets || [];
    console.log(`✅ Exported ${exportData.wallet_addresses.length} wallet addresses`);

    // Save to file
    const filename = `supabase-export-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log('\n✅ Export completed successfully!');
    console.log(`📁 Data saved to: ${filename}`);
    console.log('\n📊 Summary:');
    console.log(`   Users: ${exportData.users.length}`);
    console.log(`   Trades: ${exportData.trades.length}`);
    console.log(`   Deposits: ${exportData.deposits.length}`);
    console.log(`   Withdrawals: ${exportData.withdrawals.length}`);
    console.log(`   Activity Logs: ${exportData.admin_activity_logs.length}`);
    console.log(`   Redeem Codes: ${exportData.redeem_codes.length}`);
    console.log(`   Redeem History: ${exportData.user_redeem_history.length}`);
    console.log(`   Wallet Addresses: ${exportData.wallet_addresses.length}`);

  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportData();

