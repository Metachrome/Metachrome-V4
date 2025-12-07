const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ehhitwpjfwbcxpnxihqw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoaGl0d3BqZndiY3hwbnhpaHF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzEyMTY2OSwiZXhwIjoyMDYyNjk3NjY5fQ.JBEaaw4gJNy3elanGd9s6dPKhV5QzBNMCHZo0hzKux0'
);

async function checkTransactions() {
  console.log('=== CHECKING TRANSACTIONS ===\n');
  
  // Get recent transactions
  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, type, status, amount, created_at')
    .order('created_at', { ascending: false })
    .limit(15);
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Recent transactions:');
    data.forEach((t, i) => {
      console.log(`${i+1}. Type: "${t.type}" | Status: "${t.status}" | Amount: ${t.amount} | User: ${t.user_id?.substring(0,8)}...`);
    });
    
    // Get distinct types and statuses
    const types = [...new Set(data.map(t => t.type))];
    const statuses = [...new Set(data.map(t => t.status))];
    console.log('\nDistinct types found:', types);
    console.log('Distinct statuses found:', statuses);
  } else {
    console.log('No transactions found');
  }
  
  // Check for approved deposits specifically
  console.log('\n=== APPROVED DEPOSITS ===\n');
  const { data: deposits, error: depErr } = await supabase
    .from('transactions')
    .select('*')
    .ilike('type', '%deposit%')
    .ilike('status', '%approved%');
  
  if (depErr) {
    console.log('Error checking deposits:', depErr.message);
  } else if (deposits && deposits.length > 0) {
    console.log(`Found ${deposits.length} approved deposits:`);
    deposits.forEach(d => {
      console.log(`- Amount: ${d.amount} | User: ${d.user_id?.substring(0,8)} | Type: "${d.type}" | Status: "${d.status}"`);
    });
  } else {
    console.log('No approved deposits found');
  }
}

checkTransactions().catch(console.error);

