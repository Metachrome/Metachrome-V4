import { storage } from './storage';
import { hashPassword } from './auth';

async function seedOptionsSettings() {
  console.log('Seeding options settings...');
  
  const optionsSettings = [
    {
      duration: 30,
      minAmount: '100',
      profitPercentage: '10',
      isActive: true,
    },
    {
      duration: 60,
      minAmount: '1000',
      profitPercentage: '15',
      isActive: true,
    },
    {
      duration: 120,
      minAmount: '5000',
      profitPercentage: '20',
      isActive: true,
    },
    {
      duration: 300,
      minAmount: '10000',
      profitPercentage: '25',
      isActive: true,
    },
  ];

  try {
    const existingSettings = await storage.getOptionsSettings();
    
    if (existingSettings.length === 0) {
      for (const setting of optionsSettings) {
        await storage.createOptionsSettings(setting);
        console.log(`Created options setting: ${setting.duration}s - Min: $${setting.minAmount} - Profit: ${setting.profitPercentage}%`);
      }
    } else {
      console.log('Options settings already exist, skipping seed');
    }

    console.log('Options settings seeded successfully');
  } catch (error) {
    console.error('Error seeding options settings:', error);
  }
}

async function seedDemoData() {
  console.log('Seeding demo data...');
  
  try {
    // Create demo users
    const demoUsers = [
      {
        username: 'demo_trader',
        email: 'demo.trader@metachrome.io',
        password: 'demo123',
        role: 'user' as const,
        firstName: 'Demo',
        lastName: 'Trader',
      },
      {
        username: 'trader1',
        email: 'trader1@metachrome.io',
        password: 'password123',
        role: 'user' as const,
        firstName: 'John',
        lastName: 'Smith',
      },
      {
        username: 'trader2',
        email: 'trader2@metachrome.io',
        password: 'password123',
        role: 'user' as const,
        firstName: 'Sarah',
        lastName: 'Johnson',
      },
      {
        username: 'trader3',
        email: 'trader3@metachrome.io',
        password: 'password123',
        role: 'user' as const,
        firstName: 'Mike',
        lastName: 'Davis',
      },
      {
        username: 'admin',
        email: 'admin@metachrome.io',
        password: 'admin123',
        role: 'admin' as const,
        firstName: 'Regular',
        lastName: 'Admin',
      },
      {
        username: 'superadmin',
        email: 'superadmin@metachrome.io',
        password: 'superadmin123',
        role: 'super_admin' as const,
        firstName: 'Super',
        lastName: 'Administrator',
      },
      {
        username: 'demo_admin',
        email: 'demo.admin@metachrome.io',
        password: 'admin123',
        role: 'super_admin' as const,
        firstName: 'Demo',
        lastName: 'Admin',
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await storage.getUserByUsername(userData.username);
      if (!existingUser) {
        // Hash password before creating user
        const hashedPassword = await hashPassword(userData.password);
        const user = await storage.createUser({
          ...userData,
          password: hashedPassword,
        });
        console.log(`Created demo user: ${userData.username} (${userData.role})`);

        // Create balances for users
        if (userData.role === 'user') {
          // Give demo accounts some starting funds, others start with zero
          const isDemoAccount = userData.username === 'demo_trader';
          const usdtAmount = isDemoAccount ? '10000.00' : '0.00';
          const btcAmount = isDemoAccount ? '0.5' : '0.00';
          const ethAmount = isDemoAccount ? '5.0' : '0.00';

          await storage.createBalance({
            userId: user.id,
            symbol: 'USDT',
            available: usdtAmount,
            locked: '0.00',
          });

          await storage.createBalance({
            userId: user.id,
            symbol: 'BTC',
            available: btcAmount,
            locked: '0.00',
          });

          await storage.createBalance({
            userId: user.id,
            symbol: 'ETH',
            available: ethAmount,
            locked: '0.00',
          });

          console.log(`Created balances for ${userData.username} - USDT: $${usdtAmount}, BTC: ${btcAmount}, ETH: ${ethAmount}`);
        }
      }
    }

    // Create demo admin controls
    const users = await storage.getAllUsers();
    const regularUsers = users.filter(u => u.role === 'user');
    const adminUser = users.find(u => u.role === 'super_admin');

    if (adminUser && regularUsers.length > 0) {
      const controlTypes = ['normal', 'win', 'lose'] as const;
      
      for (let i = 0; i < Math.min(regularUsers.length, 3); i++) {
        const user = regularUsers[i];
        const controlType = controlTypes[i % controlTypes.length];
        
        const existingControl = await storage.getAdminControl(user.id);
        if (!existingControl) {
          await storage.createAdminControl({
            userId: user.id,
            adminId: adminUser.id,
            controlType,
            isActive: true,
            notes: `Demo ${controlType} control for ${user.username}`,
          });
          console.log(`Created ${controlType} control for ${user.username}`);
        }
      }
    }

    // Create demo trades
    if (regularUsers.length > 0) {
      const tradeData = [
        {
          userId: regularUsers[0].id,
          symbol: 'BTCUSDT',
          type: 'options' as const,
          direction: 'up' as const,
          amount: '100.00',
          price: '45000.00',
          entryPrice: '45000.00',
          exitPrice: '45100.00',
          profit: '10.00',
          fee: '1.00',
          status: 'completed' as const,
          duration: 60,
          expiresAt: new Date(Date.now() - 60000),
          completedAt: new Date(),
        },
        {
          userId: regularUsers[0].id,
          symbol: 'ETHUSDT',
          type: 'options' as const,
          direction: 'down' as const,
          amount: '200.00',
          price: '3000.00',
          entryPrice: '3000.00',
          exitPrice: '2980.00',
          profit: '20.00',
          fee: '2.00',
          status: 'completed' as const,
          duration: 30,
          expiresAt: new Date(Date.now() - 30000),
          completedAt: new Date(),
        }
      ];

      for (const trade of tradeData) {
        await storage.createTrade(trade);
        console.log(`Created demo trade: ${trade.symbol} ${trade.direction} for ${trade.amount}`);
      }
    }

    console.log('Demo data seeded successfully');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}

// Run seed if called directly
if (import.meta.url === new URL(import.meta.resolve(process.argv[1])).href) {
  Promise.all([seedOptionsSettings(), seedDemoData()])
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seedOptionsSettings, seedDemoData };