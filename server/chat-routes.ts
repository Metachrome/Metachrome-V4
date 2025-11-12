import type { Express } from "express";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, requireSessionAdmin } from "./auth";
import path from "path";
import fs from "fs";

// Import multer for file uploads
let multer: any = null;
try {
  multer = require("multer");
} catch (e) {
  console.log("⚠️ Multer not installed - contact form file uploads disabled");
}

// Configure multer for contact form uploads
let contactUpload: any = null;
if (multer) {
  const uploadStorage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadDir = path.join(process.cwd(), 'uploads', 'contact');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, extension);
      cb(null, `${nameWithoutExt}-${uniqueSuffix}${extension}`);
    }
  });

  contactUpload = multer({
    storage: uploadStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only images, PDFs, and documents are allowed!'));
      }
    }
  });
}

export function registerChatRoutes(app: Express) {

  // Health check endpoint for chat system
  app.get("/api/chat/health", async (req, res) => {
    try {
      // Check if tables exist by trying to count records
      const conversationsCheck = await db.execute(sql`
        SELECT COUNT(*) as count FROM chat_conversations LIMIT 1
      `);
      const messagesCheck = await db.execute(sql`
        SELECT COUNT(*) as count FROM chat_messages LIMIT 1
      `);
      const faqCheck = await db.execute(sql`
        SELECT COUNT(*) as count FROM chat_faq LIMIT 1
      `);

      res.json({
        status: 'healthy',
        tables: {
          conversations: true,
          messages: true,
          faq: true
        },
        counts: {
          conversations: parseInt(conversationsCheck.rows[0]?.count || '0'),
          messages: parseInt(messagesCheck.rows[0]?.count || '0'),
          faqs: parseInt(faqCheck.rows[0]?.count || '0')
        }
      });
    } catch (error) {
      console.error("❌ Chat health check failed:", error);
      res.status(500).json({
        status: 'unhealthy',
        error: 'Chat tables not initialized',
        message: 'Please run CHAT_SYSTEM_QUICK_FIX.sql in Supabase SQL Editor'
      });
    }
  });

  // Get FAQ list
  app.get("/api/chat/faq", async (req, res) => {
    try {
      const faqs = await db.execute(sql`
        SELECT id, question, answer, category, keywords
        FROM chat_faq
        WHERE is_active = true
        ORDER BY display_order ASC
        LIMIT 10
      `);
      
      res.json(faqs.rows || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  // Create or get existing conversation for user
  app.post("/api/chat/conversation", async (req, res) => {
    try {
      const { userId } = req.body;

      // Try to get user from session first, then from body
      const actualUserId = req.session?.user?.id || req.user?.id || userId;

      console.log('💬 Creating/getting conversation for user:', actualUserId);
      console.log('💬 Session user:', req.session?.user);
      console.log('💬 Request body userId:', userId);

      if (!actualUserId) {
        console.error('❌ No user ID provided');
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Verify user exists in database
      const userCheck = await db.execute(sql`
        SELECT id FROM users WHERE id = ${actualUserId} LIMIT 1
      `);

      if (!userCheck.rows || userCheck.rows.length === 0) {
        console.error('❌ User not found in database:', actualUserId);
        return res.status(404).json({ error: "User not found" });
      }

      console.log('✅ User verified:', actualUserId);

      // Check for existing active conversation
      const existing = await db.execute(sql`
        SELECT * FROM chat_conversations
        WHERE user_id = ${actualUserId}
        AND status IN ('active', 'waiting')
        ORDER BY created_at DESC
        LIMIT 1
      `);

      if (existing.rows && existing.rows.length > 0) {
        console.log('✅ Found existing conversation:', existing.rows[0].id);
        return res.json(existing.rows[0]);
      }

      console.log('📝 Creating new conversation...');

      // Create new conversation
      const result = await db.execute(sql`
        INSERT INTO chat_conversations (
          id, user_id, status, priority, category, last_message_at, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${actualUserId},
          'waiting',
          'normal',
          'general',
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `);

      console.log('✅ Conversation created:', result.rows[0].id);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("❌ Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation", details: error.message });
    }
  });

  // Get messages for a conversation
  app.get("/api/chat/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;

      console.log('📨 Fetching messages for conversation:', conversationId);

      const messages = await db.execute(sql`
        SELECT
          cm.*,
          u.username as sender_username,
          u.email as sender_email
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.conversation_id = ${conversationId}
        ORDER BY cm.created_at ASC
      `);

      console.log('✅ Found', messages.rows?.length || 0, 'messages');
      res.json(messages.rows || []);
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages", details: error.message });
    }
  });

  // Send message (user)
  app.post("/api/chat/send", async (req, res) => {
    try {
      const { conversationId, message, senderId, senderType } = req.body;

      console.log('📤 Sending message:', { conversationId, senderId, senderType, messageLength: message?.length });

      if (!conversationId || !message || !senderId) {
        console.error('❌ Missing required fields:', { conversationId, message: !!message, senderId });
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify user exists
      const userCheck = await db.execute(sql`
        SELECT id FROM users WHERE id = ${senderId} LIMIT 1
      `);

      if (!userCheck.rows || userCheck.rows.length === 0) {
        console.error('❌ Sender not found:', senderId);
        return res.status(404).json({ error: "Sender not found" });
      }

      console.log('✅ Sender verified:', senderId);

      // Insert message
      const result = await db.execute(sql`
        INSERT INTO chat_messages (
          id, conversation_id, sender_id, sender_type, message, is_read, created_at
        ) VALUES (
          gen_random_uuid(),
          ${conversationId},
          ${senderId},
          ${senderType || 'user'},
          ${message},
          false,
          NOW()
        )
        RETURNING *
      `);

      console.log('✅ Message inserted:', result.rows[0]?.id);

      // Update conversation last_message_at
      await db.execute(sql`
        UPDATE chat_conversations
        SET last_message_at = NOW(), updated_at = NOW()
        WHERE id = ${conversationId}
      `);

      console.log('✅ Conversation updated');

      res.json(result.rows[0]);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      res.status(500).json({ error: "Failed to send message", details: error.message });
    }
  });

  // Admin: Get all conversations
  app.get("/api/admin/chat/conversations", requireSessionAdmin, async (req, res) => {
    try {
      const conversations = await db.execute(sql`
        SELECT 
          cc.*,
          u.username,
          u.email,
          COUNT(CASE WHEN cm.is_read = false AND cm.sender_type = 'user' THEN 1 END) as unread_count
        FROM chat_conversations cc
        LEFT JOIN users u ON cc.user_id = u.id
        LEFT JOIN chat_messages cm ON cm.conversation_id = cc.id
        GROUP BY cc.id, u.username, u.email
        ORDER BY cc.last_message_at DESC
      `);

      const formattedConversations = (conversations.rows || []).map((conv: any) => ({
        ...conv,
        user: {
          username: conv.username,
          email: conv.email
        }
      }));

      res.json(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Admin: Get messages for a conversation
  app.get("/api/admin/chat/messages/:conversationId", requireSessionAdmin, async (req, res) => {
    try {
      const { conversationId } = req.params;

      const messages = await db.execute(sql`
        SELECT 
          cm.*,
          u.username as sender_username,
          u.email as sender_email
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        WHERE cm.conversation_id = ${conversationId}
        ORDER BY cm.created_at ASC
      `);

      res.json(messages.rows || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Admin: Send message
  app.post("/api/admin/chat/send", requireSessionAdmin, async (req, res) => {
    try {
      const { conversationId, message, senderId, senderType } = req.body;

      if (!conversationId || !message || !senderId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Insert message
      const result = await db.execute(sql`
        INSERT INTO chat_messages (
          id, conversation_id, sender_id, sender_type, message, is_read, created_at
        ) VALUES (
          gen_random_uuid(),
          ${conversationId},
          ${senderId},
          ${senderType || 'admin'},
          ${message},
          false,
          NOW()
        )
        RETURNING *
      `);

      // Update conversation last_message_at and status
      await db.execute(sql`
        UPDATE chat_conversations
        SET 
          last_message_at = NOW(), 
          updated_at = NOW(),
          status = 'active',
          assigned_admin_id = ${senderId}
        WHERE id = ${conversationId}
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Admin: Mark messages as read
  app.post("/api/admin/chat/mark-read/:conversationId", requireSessionAdmin, async (req, res) => {
    try {
      const { conversationId } = req.params;

      await db.execute(sql`
        UPDATE chat_messages
        SET is_read = true
        WHERE conversation_id = ${conversationId}
        AND sender_type = 'user'
        AND is_read = false
      `);

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // Admin: Update conversation status
  app.patch("/api/admin/chat/conversation/:conversationId/status", requireSessionAdmin, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { status } = req.body;

      if (!['active', 'waiting', 'closed'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await db.execute(sql`
        UPDATE chat_conversations
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${conversationId}
      `);

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating conversation status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Admin: Update conversation priority
  app.patch("/api/admin/chat/conversation/:conversationId/priority", requireSessionAdmin, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { priority } = req.body;

      if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({ error: "Invalid priority" });
      }

      await db.execute(sql`
        UPDATE chat_conversations
        SET priority = ${priority}, updated_at = NOW()
        WHERE id = ${conversationId}
      `);

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating conversation priority:", error);
      res.status(500).json({ error: "Failed to update priority" });
    }
  });

  // Admin: Assign conversation to admin
  app.patch("/api/admin/chat/conversation/:conversationId/assign", requireSessionAdmin, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { adminId } = req.body;

      await db.execute(sql`
        UPDATE chat_conversations
        SET assigned_admin_id = ${adminId}, updated_at = NOW()
        WHERE id = ${conversationId}
      `);

      res.json({ success: true });
    } catch (error) {
      console.error("Error assigning conversation:", error);
      res.status(500).json({ error: "Failed to assign conversation" });
    }
  });

  // Admin: Delete message
  app.delete("/api/admin/chat/message/:messageId", requireSessionAdmin, async (req, res) => {
    try {
      const { messageId } = req.params;

      console.log('🗑️ Deleting message:', messageId);

      // Delete the message
      const result = await db.execute(sql`
        DELETE FROM chat_messages
        WHERE id = ${messageId}
        RETURNING *
      `);

      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: "Message not found" });
      }

      console.log('✅ Message deleted successfully:', messageId);
      res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Contact Agent Form Submission with File Upload
  const contactHandler = contactUpload ? contactUpload.single('image') : (req: any, res: any, next: any) => next();

  app.post("/api/contact-agent", contactHandler, async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      const imageFile = req.file;

      console.log('📧 Contact form submission:', { name, email, subject, hasImage: !!imageFile });

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Create conversation first
      const conversationResult = await db.execute(sql`
        INSERT INTO chat_conversations (
          id, user_id, status, priority, category, created_at, updated_at, last_message_at
        ) VALUES (
          gen_random_uuid(),
          'guest',
          'waiting',
          'normal',
          'general',
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *
      `);

      const conversation = conversationResult.rows[0];
      console.log('✅ Conversation created:', conversation.id);

      // Prepare message with image info if uploaded
      let finalMessage = `📧 Email: ${email}\n📝 Subject: ${subject}\n\n${message}`;
      let imagePath = null;
      let imageFilename = null;
      let imageOriginalName = null;

      if (imageFile) {
        imageFilename = imageFile.filename;
        imageOriginalName = imageFile.originalname;
        imagePath = `/api/uploads/contact/${imageFilename}`;
        finalMessage += `\n\n🔗 File: ${imagePath}`;
        console.log('📎 Image uploaded:', { filename: imageFilename, path: imagePath });
      }

      // Insert initial message
      await db.execute(sql`
        INSERT INTO chat_messages (
          id, conversation_id, sender_id, sender_type, message, is_read, created_at
        ) VALUES (
          gen_random_uuid(),
          ${conversation.id},
          'guest',
          'user',
          ${finalMessage},
          false,
          NOW()
        )
      `);

      console.log('✅ Message created');

      // Create contact request record
      await db.execute(sql`
        INSERT INTO contact_requests (
          id, name, email, subject, message, has_image, image_filename, image_original_name, image_path, conversation_id, status, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${name},
          ${email},
          ${subject},
          ${message},
          ${!!imageFile},
          ${imageFilename},
          ${imageOriginalName},
          ${imagePath},
          ${conversation.id},
          'pending',
          NOW(),
          NOW()
        )
      `);

      console.log('✅ Contact request created');

      res.json({
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!",
        conversationId: conversation.id
      });
    } catch (error) {
      console.error("❌ Error submitting contact form:", error);
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });
}

