const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://pybsyzbxyliufkgywtpf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE'
);

async function checkWithdrawals() {
  console.log('🔍 Checking withdrawals table...');
  
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('📊 Recent withdrawals:', data.length);
    data.forEach((w, i) => {
      console.log(`  ${i+1}. ${w.id}: ${w.amount} ${w.currency} - ${w.username} (${w.status}) - ${w.created_at}`);
    });
    
    const pending = data.filter(w => w.status === 'pending');
    console.log('💸 Pending withdrawals:', pending.length);
  }
}

checkWithdrawals().catch(console.error);
