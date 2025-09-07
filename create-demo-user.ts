import { db } from './server/db';
import { users, balances } from './shared/schema-sqlite';
import bcrypt from 'bcryptjs';

async function createDemoUser() {
  try {
    console.log('Creating demo user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create demo user
    const [user] = await db.insert(users).values({
      username: 'trader1',
      email: 'trader1@metachrome.io',
      password: hashedPassword,
      role: 'user',
      isActive: true,
    }).returning();
    
    console.log('Created user:', user);
    
    // Create demo balance
    const [balance] = await db.insert(balances).values({
      userId: user.id,
      symbol: 'USDT',
      available: '10000.00',
      locked: '0.00',
    }).returning();
    
    console.log('Created balance:', balance);
    
    console.log('Demo user created successfully!');
    console.log('Username: trader1');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
}

createDemoUser().then(() => process.exit(0));
