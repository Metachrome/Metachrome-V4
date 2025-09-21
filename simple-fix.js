console.log('🚀 Starting simple fix...');

try {
  const postgres = require('postgres');
  console.log('✅ Postgres module loaded');
  
  const DATABASE_URL = "postgresql://postgres:HopeAmdHope87^(@db.pybsyzbxyliufkgywtpf.supabase.co:5432/postgres";
  console.log('🔗 Connecting to database...');
  
  const client = postgres(DATABASE_URL);
  console.log('✅ Client created');
  
  async function runFix() {
    try {
      // Test connection
      const result = await client`SELECT version()`;
      console.log('✅ Connected to database:', result[0].version.split(' ')[0]);
      
      // Fix user verification
      console.log('\n🔧 Fixing user verification...');
      
      const angelaUser = await client`
        SELECT id, username, verification_status
        FROM users 
        WHERE username = 'angela.soenoko'
        LIMIT 1
      `;
      
      if (angelaUser.length > 0) {
        console.log(`👤 Found user: ${angelaUser[0].username} (${angelaUser[0].id})`);
        console.log(`📋 Current status: ${angelaUser[0].verification_status}`);
        
        await client`
          UPDATE users 
          SET verification_status = 'verified',
              has_uploaded_documents = true,
              verified_at = NOW(),
              updated_at = NOW()
          WHERE id = ${angelaUser[0].id}
        `;
        
        console.log('✅ User verification updated!');
        
        // Fix trade profits
        console.log('\n🔧 Fixing trade profits...');
        
        const tradesWithoutProfit = await client`
          SELECT id, result, amount
          FROM trades 
          WHERE status = 'completed' AND profit IS NULL
          LIMIT 5
        `;
        
        console.log(`📊 Found ${tradesWithoutProfit.length} trades without profit`);
        
        for (const trade of tradesWithoutProfit) {
          let profit = 0;
          
          if (trade.result === 'win') {
            profit = trade.amount * 0.85; // 85% profit for wins
          } else if (trade.result === 'lose') {
            profit = -trade.amount; // Lose the full amount
          }
          
          await client`
            UPDATE trades 
            SET profit = ${profit}
            WHERE id = ${trade.id}
          `;
          
          console.log(`  Updated trade ${trade.id.substring(0, 8)}: ${trade.result} -> $${profit}`);
        }
        
        console.log('✅ Trade profits updated!');
        
        // Create withdrawal history
        console.log('\n🔧 Creating withdrawal history...');
        
        const existingWithdrawals = await client`
          SELECT COUNT(*) as count
          FROM withdrawals 
          WHERE user_id = ${angelaUser[0].id}
        `;
        
        if (existingWithdrawals[0].count === 0) {
          await client`
            INSERT INTO withdrawals (
              id, user_id, username, amount, currency, address, status, created_at, updated_at
            ) VALUES (
              'with-angela-001',
              ${angelaUser[0].id},
              'angela.soenoko',
              500,
              'BTC',
              'bc1q6w3rdy5kwaf4es2lpjk6clpd25pterzvgwu5hu',
              'pending',
              NOW() - INTERVAL '2 days',
              NOW()
            )
          `;
          
          console.log('✅ Created withdrawal history!');
        } else {
          console.log('✅ Withdrawal history already exists');
        }
        
      } else {
        console.log('❌ angela.soenoko user not found!');
      }
      
      await client.end();
      console.log('\n🎉 Simple fix completed!');
      
    } catch (error) {
      console.error('❌ Error in runFix:', error);
    }
  }
  
  runFix();
  
} catch (error) {
  console.error('❌ Error loading modules:', error);
}
