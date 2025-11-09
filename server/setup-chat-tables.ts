import { db } from "../db";
import { sql } from "drizzle-orm";

export async function setupChatTables() {
  console.log('💬 Setting up chat system tables...');

  try {
    // 1. Create chat_conversations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),
        assigned_admin_id TEXT REFERENCES users(id),
        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'deposit', 'withdrawal', 'trading', 'verification', 'technical')),
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Created chat_conversations table');

    // 2. Create chat_messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id),
        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Created chat_messages table');

    // 3. Create chat_faq table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_faq (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        keywords TEXT[],
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Created chat_faq table');

    // 4. Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)
    `);
    console.log('✅ Created indexes');

    // 5. Insert default FAQ data
    const faqCount = await db.execute(sql`SELECT COUNT(*) FROM chat_faq`);
    if (faqCount.rows[0].count === '0') {
      await db.execute(sql`
        INSERT INTO chat_faq (question, answer, category, keywords, display_order) VALUES
        ('How do I deposit funds?', 'To deposit funds, go to Wallet page, click Deposit, select your preferred cryptocurrency (USDT, BTC, ETH, SOL), choose the network, and send funds to the displayed address. Your balance will be updated after confirmation.', 'deposit', ARRAY['deposit', 'fund', 'add money', 'top up'], 1),
        ('How do I withdraw funds?', 'To withdraw, go to Wallet page, click Withdraw, enter the amount and your wallet address, then submit. A superadmin will review and approve your request within 24 hours.', 'withdrawal', ARRAY['withdraw', 'cash out', 'send money'], 2),
        ('What are the trading durations available?', 'We offer two trading durations: 30 seconds (minimum 100 USDT with 10% profit) and 60 seconds (minimum 1000 USDT with 15% profit).', 'trading', ARRAY['duration', 'time', 'trading time', '30s', '60s'], 3),
        ('How do I verify my account?', 'Go to Profile page, click on Verification section, upload your ID document and proof of address. Our team will review within 24-48 hours.', 'verification', ARRAY['verify', 'kyc', 'identity', 'document'], 4),
        ('What cryptocurrencies are supported?', 'We support USDT (BEP20, TRC20, ERC20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) for deposits and withdrawals.', 'general', ARRAY['crypto', 'currency', 'coin', 'supported'], 5),
        ('How do I start trading?', 'Connect your MetaMask wallet or login, deposit funds, go to Trade page, select a trading pair, choose duration (30s or 60s), enter amount, and click BUY UP or BUY DOWN.', 'trading', ARRAY['start', 'begin', 'how to trade', 'trading'], 6),
        ('What is the minimum deposit?', 'The minimum deposit varies by cryptocurrency. For trading, minimum is 100 USDT for 30-second trades and 1000 USDT for 60-second trades.', 'deposit', ARRAY['minimum', 'min deposit', 'least amount'], 7),
        ('How long does withdrawal take?', 'Withdrawals are processed within 24 hours after superadmin approval. Blockchain confirmation time varies by network (BTC: 30-60 min, ETH: 5-15 min, SOL: 1-2 min).', 'withdrawal', ARRAY['withdrawal time', 'how long', 'processing time'], 8),
        ('Is my account secure?', 'Yes! We use industry-standard encryption, secure authentication, and store funds in cold wallets. Enable 2FA for additional security.', 'general', ARRAY['security', 'safe', 'secure', 'protection'], 9),
        ('How do I contact support?', 'You can contact us via Live Chat (24/7), email at support@metachrome.io, or through the Support page. Our team responds within 1-2 hours.', 'general', ARRAY['contact', 'support', 'help', 'customer service'], 10)
      `);
      console.log('✅ Inserted default FAQ data');
    } else {
      console.log('ℹ️ FAQ data already exists, skipping insert');
    }

    // 6. Create trigger to update conversation timestamp
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_conversation_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE chat_conversations
        SET last_message_at = NEW.created_at, updated_at = NOW()
        WHERE id = NEW.conversation_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await db.execute(sql`
      DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON chat_messages
    `);

    await db.execute(sql`
      CREATE TRIGGER trigger_update_conversation_timestamp
      AFTER INSERT ON chat_messages
      FOR EACH ROW
      EXECUTE FUNCTION update_conversation_timestamp()
    `);
    console.log('✅ Created trigger for conversation timestamp updates');

    console.log('✅ Chat system setup complete!');
    return true;
  } catch (error) {
    console.error('❌ Error setting up chat tables:', error);
    throw error;
  }
}

