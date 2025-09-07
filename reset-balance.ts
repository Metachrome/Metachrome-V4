import { db } from "./server/db";
import { balances, users } from "./shared/schema-sqlite";
import { eq, and } from "drizzle-orm";

async function resetUserBalance() {
  try {
    console.log('🔄 Resetting user balance to 0...');
    
    // Find the trader1 user
    const [user] = await db.select().from(users).where(eq(users.username, 'trader1')).limit(1);
    
    if (!user) {
      console.log('❌ User trader1 not found');
      return;
    }
    
    console.log('👤 Found user:', user.username);
    
    // Update USDT balance to 0
    const result = await db
      .update(balances)
      .set({ 
        available: '0.00',
        locked: '0.00',
        updatedAt: new Date()
      })
      .where(and(
        eq(balances.userId, user.id),
        eq(balances.symbol, 'USDT')
      ))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Successfully reset USDT balance to 0.00');
      console.log('💰 New balance:', result[0]);
    } else {
      console.log('❌ No USDT balance found to update');
    }
    
    // Also reset BTC balance to 0
    const btcResult = await db
      .update(balances)
      .set({ 
        available: '0.00',
        locked: '0.00',
        updatedAt: new Date()
      })
      .where(and(
        eq(balances.userId, user.id),
        eq(balances.symbol, 'BTC')
      ))
      .returning();
    
    if (btcResult.length > 0) {
      console.log('✅ Successfully reset BTC balance to 0.00');
    }
    
    console.log('🎉 Balance reset complete! User now starts with 0 balance.');
    
  } catch (error) {
    console.error('❌ Error resetting balance:', error);
  }
}

resetUserBalance();
