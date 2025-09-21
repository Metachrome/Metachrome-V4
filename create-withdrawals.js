const postgres = require('postgres');

async function createWithdrawals() {
  try {
    console.log('🔧 Creating withdrawal history for angela.soenoko...');
    
    const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
    const client = postgres(DATABASE_URL);
    
    // Test connection
    const result = await client`SELECT version()`;
    console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
    
    // Get angela.soenoko user
    const angelaUser = await client`
      SELECT id, username
      FROM users 
      WHERE username = 'angela.soenoko'
      LIMIT 1
    `;
    
    if (angelaUser.length > 0) {
      const userId = angelaUser[0].id;
      console.log(`👤 Found user: ${angelaUser[0].username} (${userId})`);
      
      // Delete any existing withdrawals first
      await client`
        DELETE FROM withdrawals 
        WHERE user_id = ${userId}
      `;
      
      console.log('🗑️ Cleared existing withdrawals');
      
      // Create new withdrawal records
      const withdrawals = [
        {
          id: 'with-angela-001',
          amount: 500,
          currency: 'BTC',
          address: 'bc1q6w3rdy5kwaf4es2lpjk6clpd25pterzvgwu5hu',
          status: 'pending'
        },
        {
          id: 'with-angela-002',
          amount: 1000,
          currency: 'USDT',
          address: 'TTZzHBjpmksYqaM6seVjCSLSe6m77Bfjp9',
          status: 'approved'
        },
        {
          id: 'with-angela-003',
          amount: 250,
          currency: 'ETH',
          address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
          status: 'completed'
        }
      ];
      
      for (let i = 0; i < withdrawals.length; i++) {
        const withdrawal = withdrawals[i];
        const daysAgo = (i + 1) * 2; // 2, 4, 6 days ago
        
        await client`
          INSERT INTO withdrawals (
            id, user_id, username, amount, currency, address, status, created_at, updated_at
          ) VALUES (
            ${withdrawal.id},
            ${userId},
            'angela.soenoko',
            ${withdrawal.amount},
            ${withdrawal.currency},
            ${withdrawal.address},
            ${withdrawal.status},
            NOW() - INTERVAL '${daysAgo} days',
            NOW()
          )
        `;
        
        console.log(`✅ Created withdrawal: ${withdrawal.id} - ${withdrawal.amount} ${withdrawal.currency} (${withdrawal.status})`);
      }
      
      // Verify withdrawals were created
      const withdrawalCount = await client`
        SELECT COUNT(*) as count
        FROM withdrawals 
        WHERE user_id = ${userId}
      `;
      
      console.log(`\n📊 Total withdrawals created: ${withdrawalCount[0].count}`);
      
      // Show all withdrawals
      const allWithdrawals = await client`
        SELECT id, amount, currency, status, created_at
        FROM withdrawals 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      
      console.log('\n💸 Withdrawal History:');
      allWithdrawals.forEach(w => {
        console.log(`  ${w.id}: ${w.amount} ${w.currency} - ${w.status} (${w.created_at.toISOString().split('T')[0]})`);
      });
      
    } else {
      console.log('❌ angela.soenoko user not found!');
    }
    
    await client.end();
    console.log('\n🎉 Withdrawal history creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating withdrawals:', error);
  }
}

createWithdrawals();
