"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const postgres_1 = __importDefault(require("postgres"));
// Load environment variables
dotenv_1.default.config();
async function checkUserTrades() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    const sql = (0, postgres_1.default)(databaseUrl);
    try {
        console.log('🔍 Checking trades for user demotiga@demo.com...\n');
        // Get user ID
        const users = await sql `
      SELECT id, email, username 
      FROM users 
      WHERE email = 'demotiga@demo.com'
    `;
        if (users.length === 0) {
            console.log('❌ User demotiga@demo.com not found');
            await sql.end();
            return;
        }
        const user = users[0];
        console.log('✅ Found user:', user);
        console.log('');
        // Get all trades for this user
        const trades = await sql `
      SELECT id, symbol, type, direction, amount, status, result, profit, 
             entry_price, exit_price, duration, created_at, completed_at
      FROM trades 
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;
        console.log(`📊 Total trades: ${trades.length}`);
        console.log('');
        // Filter completed trades with valid result
        const completedTrades = trades.filter(trade => trade.status === 'completed' &&
            trade.result &&
            ['win', 'lose', 'normal'].includes(trade.result.toLowerCase()));
        console.log(`✅ Completed trades with valid result: ${completedTrades.length}`);
        console.log('');
        // Show all trades
        console.log('📋 All trades:');
        console.table(trades.map(t => ({
            id: t.id.substring(0, 8),
            symbol: t.symbol,
            direction: t.direction,
            amount: t.amount,
            status: t.status,
            result: t.result,
            profit: t.profit,
            created_at: t.created_at,
            completed_at: t.completed_at
        })));
        console.log('');
        console.log(`🎯 Withdrawal eligibility: ${completedTrades.length >= 2 ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE'}`);
        console.log(`   Required: 2 completed trades with valid result`);
        console.log(`   Current: ${completedTrades.length} completed trades with valid result`);
        await sql.end();
    }
    catch (error) {
        console.error('❌ Error:', error);
        await sql.end();
        throw error;
    }
}
checkUserTrades()
    .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
});
