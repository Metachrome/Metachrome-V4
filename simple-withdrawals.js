const postgres = require('postgres');

async function createSimpleWithdrawals() {
  try {
    console.log('🔧 Creating withdrawal history (simple version)...');
    
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
      
      // Create withdrawal 1
      await client`
        INSERT INTO withdrawals (
          id, user_id, username, amount, currency, address, status, created_at, updated_at
        ) VALUES (
          'with-angela-001',
          ${userId},
          'angela.soenoko',
          500,
          'BTC',
          'bc1q6w3rdy5kwaf4es2lpjk6clpd25pterzvgwu5hu',
          'pending',
          NOW() - INTERVAL '2 days',
          NOW()
        )
      `;
      
      console.log('✅ Created withdrawal 1: 500 BTC (pending)');
      
      // Create withdrawal 2
      await client`
        INSERT INTO withdrawals (
          id, user_id, username, amount, currency, address, status, created_at, updated_at
        ) VALUES (
          'with-angela-002',
          ${userId},
          'angela.soenoko',
          1000,
          'USDT',
          'TTZzHBjpmksYqaM6seVjCSLSe6m77Bfjp9',
          'approved',
          NOW() - INTERVAL '4 days',
          NOW()
        )
      `;
      
      console.log('✅ Created withdrawal 2: 1000 USDT (approved)');
      
      // Create withdrawal 3
      await client`
        INSERT INTO withdrawals (
          id, user_id, username, amount, currency, address, status, created_at, updated_at
        ) VALUES (
          'with-angela-003',
          ${userId},
          'angela.soenoko',
          250,
          'ETH',
          '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
          'completed',
          NOW() - INTERVAL '6 days',
          NOW()
        )
      `;
      
      console.log('✅ Created withdrawal 3: 250 ETH (completed)');
      
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

createSimpleWithdrawals();
