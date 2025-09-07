import { db } from '../server/db.js';
import { users, balances, trades, transactions, adminControls } from '../shared/schema-sqlite.js';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Simple UUID v4 generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function createDemoData() {
  console.log('🚀 Creating demo data for superadmin dashboard...');

  try {
    // Check database connection first
    console.log('📊 Testing database connection...');
    const existingUsers = await db.select().from(users);
    console.log('✅ Database connection successful');
    console.log(`📋 Found ${existingUsers.length} existing users:`, existingUsers.map(u => ({ email: u.email, role: u.role })));

    // Clear existing data (except superadmin)
    console.log('🧹 Clearing existing demo data...');
    await db.delete(adminControls);
    await db.delete(transactions);
    await db.delete(trades);
    await db.delete(balances);
    await db.delete(users).where(sql`role != 'super_admin'`);

    // Create demo users
    console.log('👥 Creating demo users...');
    const demoUsers = [
      {
        id: uuidv4(),
        username: 'john_trader',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user' as const,
        walletAddress: '0x742d35Cc6479C5f95912c4E8BC2C1234567890AB',
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: uuidv4(),
        username: 'sarah_investor',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user' as const,
        walletAddress: '0x8ba1f109551bD432803012645Hac189B73499F47',
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: uuidv4(),
        username: 'mike_crypto',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user' as const,
        walletAddress: '0x1234567890123456789012345678901234567890',
        isActive: true,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: uuidv4(),
        username: 'emma_hodler',
        email: 'emma@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user' as const,
        walletAddress: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        isActive: false, // Inactive user for testing
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        id: uuidv4(),
        username: 'admin_user',
        email: 'admin.user@metachrome.io',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin' as const,
        walletAddress: '0x9876543210987654321098765432109876543210',
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      }
    ];

    await db.insert(users).values(demoUsers);
    console.log(`✅ Created ${demoUsers.length} demo users`);

    // Create demo balances
    console.log('💰 Creating demo balances...');
    const demoBalances = [];
    const symbols = ['USDT', 'BTC', 'ETH', 'BNB', 'ADA', 'SOL'];
    
    for (const user of demoUsers) {
      for (const symbol of symbols) {
        let balance = 0;
        // Give different balance patterns
        switch (symbol) {
          case 'USDT':
            balance = Math.random() * 50000 + 1000; // $1K-$51K USDT
            break;
          case 'BTC':
            balance = Math.random() * 2 + 0.1; // 0.1-2.1 BTC
            break;
          case 'ETH':
            balance = Math.random() * 10 + 1; // 1-11 ETH
            break;
          case 'BNB':
            balance = Math.random() * 100 + 10; // 10-110 BNB
            break;
          case 'ADA':
            balance = Math.random() * 5000 + 100; // 100-5100 ADA
            break;
          case 'SOL':
            balance = Math.random() * 200 + 10; // 10-210 SOL
            break;
        }

        demoBalances.push({
          id: uuidv4(),
          userId: user.id,
          symbol,
          available: balance.toFixed(6),
          locked: '0',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    await db.insert(balances).values(demoBalances);
    console.log(`✅ Created ${demoBalances.length} demo balances`);

    // Create demo trades
    console.log('📈 Creating demo trades...');
    const demoTrades = [];
    const tradeTypes = ['spot', 'options'] as const;
    const tradeDirections = ['buy', 'sell', 'up', 'down'] as const;
    const tradePairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];

    for (let i = 0; i < 50; i++) {
      const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
      const pair = tradePairs[Math.floor(Math.random() * tradePairs.length)];
      const type = tradeTypes[Math.floor(Math.random() * tradeTypes.length)];
      const direction = tradeDirections[Math.floor(Math.random() * tradeDirections.length)];
      const amount = Math.random() * 10 + 0.1;
      const price = Math.random() * 100000 + 1000;
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      demoTrades.push({
        id: uuidv4(),
        userId: user.id,
        symbol: pair,
        type,
        direction,
        amount: amount.toFixed(6),
        price: price.toFixed(2),
        entryPrice: price.toFixed(2),
        exitPrice: type === 'options' ? (price * (Math.random() > 0.5 ? 1.1 : 0.9)).toFixed(2) : null,
        status: Math.random() > 0.1 ? 'completed' as const : 'pending' as const,
        duration: type === 'options' ? Math.floor(Math.random() * 3600) + 300 : null, // 5 min to 1 hour
        profit: type === 'options' ? (Math.random() * 200 - 100).toFixed(2) : null,
        fee: (amount * 0.001).toFixed(6), // 0.1% fee
        createdAt: createdDate,
        updatedAt: createdDate
      });
    }

    await db.insert(trades).values(demoTrades);
    console.log(`✅ Created ${demoTrades.length} demo trades`);

    // Create demo transactions
    console.log('💸 Creating demo transactions...');
    const demoTransactions = [];
    const transactionTypes = ['deposit', 'withdrawal'] as const;

    // Regular transactions
    for (let i = 0; i < 30; i++) {
      const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.random() * 5000 + 100;
      const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      demoTransactions.push({
        id: uuidv4(),
        userId: user.id,
        type,
        symbol,
        amount: parseFloat(amount.toFixed(6)),
        status: Math.random() > 0.2 ? 'completed' as const : 'pending' as const,
        txHash: type === 'deposit' ? `0x${Math.random().toString(16).substring(2, 66)}` : null,
        toAddress: type === 'withdrawal' ? user.walletAddress : null,
        fromAddress: type === 'deposit' ? `0x${Math.random().toString(16).substring(2, 42)}` : null,
        metadata: null,
        createdAt: createdDate,
        updatedAt: createdDate
      });
    }

    // Chat messages as transactions
    const chatMessages = [
      'Hello! I need help with my account verification.',
      'When will my withdrawal be processed?',
      'I\'m having trouble with 2FA setup.',
      'Can you explain the trading fees?',
      'My deposit hasn\'t arrived yet, can you check?',
      'Is there a mobile app available?',
      'How do I increase my withdrawal limits?',
      'I want to report suspicious activity.',
      'Can you help me recover my account?',
      'What are the supported cryptocurrencies?'
    ];

    for (let i = 0; i < chatMessages.length; i++) {
      const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
      const createdDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      demoTransactions.push({
        id: uuidv4(),
        userId: user.id,
        type: 'deposit',
        symbol: 'MSG',
        amount: 0,
        status: 'completed' as const,
        txHash: null,
        toAddress: null,
        fromAddress: null,
        metadata: JSON.stringify({
          message: chatMessages[i],
          sender: user.username,
          timestamp: createdDate.toISOString()
        }),
        createdAt: createdDate,
        updatedAt: createdDate
      });
    }

    await db.insert(transactions).values(demoTransactions);
    console.log(`✅ Created ${demoTransactions.length} demo transactions (including chat messages)`);

    // Create demo admin controls
    console.log('⚙️ Creating demo admin controls...');
    const demoControls = [
      {
        id: uuidv4(),
        userId: demoUsers[3].id, // Emma (inactive user)
        controlType: 'lose' as const,
        isActive: false,
        createdBy: '7e6d6587-ac99-4f8a-9c37-6f2a08ec492c', // Superadmin ID
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        userId: demoUsers[0].id, // John
        controlType: 'win' as const,
        isActive: true,
        createdBy: '7e6d6587-ac99-4f8a-9c37-6f2a08ec492c',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: uuidv4(),
        userId: demoUsers[1].id, // Sarah
        controlType: 'normal' as const,
        isActive: true,
        createdBy: '7e6d6587-ac99-4f8a-9c37-6f2a08ec492c',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await db.insert(adminControls).values(demoControls);
    console.log(`✅ Created ${demoControls.length} demo admin controls`);

    console.log('🎉 Demo data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${demoUsers.length} (including 1 admin)`);
    console.log(`- Balances: ${demoBalances.length} across ${symbols.length} cryptocurrencies`);
    console.log(`- Trades: ${demoTrades.length} with various statuses`);
    console.log(`- Transactions: ${demoTransactions.length} (including ${chatMessages.length} chat messages)`);
    console.log(`- Admin Controls: ${demoControls.length} actions logged`);
    console.log('\n🔑 Test Credentials:');
    console.log('- john_trader / password123');
    console.log('- sarah_investor / password123');
    console.log('- mike_crypto / password123');
    console.log('- admin_user / admin123');
    console.log('\n🚀 You can now test all superadmin dashboard functionality!');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    throw error;
  }
}

// Always run the function when the script is executed
console.log('🎯 Starting demo data creation script...');
createDemoData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed with error:', error);
    process.exit(1);
  });

export { createDemoData };
