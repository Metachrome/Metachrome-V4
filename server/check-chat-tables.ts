import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Diagnostic script to check if chat tables exist in database
 */
export async function checkChatTables() {
  console.log('🔍 ========================================');
  console.log('🔍 CHECKING CHAT TABLES IN DATABASE');
  console.log('🔍 ========================================');

  try {
    // Check if chat_conversations table exists
    const conversationsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_conversations'
      ) as exists
    `);
    
    const conversationsExists = conversationsCheck.rows[0]?.exists;
    console.log(`📋 chat_conversations table: ${conversationsExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    // Check if chat_messages table exists
    const messagesCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_messages'
      ) as exists
    `);
    
    const messagesExists = messagesCheck.rows[0]?.exists;
    console.log(`💬 chat_messages table: ${messagesExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    // Check if chat_faq table exists
    const faqCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_faq'
      ) as exists
    `);
    
    const faqExists = faqCheck.rows[0]?.exists;
    console.log(`❓ chat_faq table: ${faqExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);

    // If all tables exist, count records
    if (conversationsExists && messagesExists && faqExists) {
      const convCount = await db.execute(sql`SELECT COUNT(*) as count FROM chat_conversations`);
      const msgCount = await db.execute(sql`SELECT COUNT(*) as count FROM chat_messages`);
      const faqCount = await db.execute(sql`SELECT COUNT(*) as count FROM chat_faq`);

      console.log('📊 ========================================');
      console.log('📊 RECORD COUNTS');
      console.log('📊 ========================================');
      console.log(`📋 Conversations: ${convCount.rows[0]?.count || 0}`);
      console.log(`💬 Messages: ${msgCount.rows[0]?.count || 0}`);
      console.log(`❓ FAQs: ${faqCount.rows[0]?.count || 0}`);
      
      return {
        allTablesExist: true,
        counts: {
          conversations: parseInt(convCount.rows[0]?.count || '0'),
          messages: parseInt(msgCount.rows[0]?.count || '0'),
          faqs: parseInt(faqCount.rows[0]?.count || '0')
        }
      };
    } else {
      console.log('❌ ========================================');
      console.log('❌ MISSING TABLES DETECTED!');
      console.log('❌ ========================================');
      console.log('❌ Please run CHAT_SYSTEM_QUICK_FIX.sql in Supabase SQL Editor');
      
      return {
        allTablesExist: false,
        missingTables: [
          !conversationsExists && 'chat_conversations',
          !messagesExists && 'chat_messages',
          !faqExists && 'chat_faq'
        ].filter(Boolean)
      };
    }
  } catch (error) {
    console.error('❌ Error checking chat tables:', error);
    throw error;
  }
}

