var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { db } from "../db";
import { sql } from "drizzle-orm";
import { requireSessionAdmin } from "./auth";
import path from "path";
import fs from "fs";
// Import multer for file uploads
var multer = null;
try {
    multer = require("multer");
}
catch (e) {
    console.log("⚠️ Multer not installed - contact form file uploads disabled");
}
// Configure multer for contact form uploads
var contactUpload = null;
if (multer) {
    var uploadStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            var uploadDir = path.join(process.cwd(), 'uploads', 'contact');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            var extension = path.extname(file.originalname);
            var nameWithoutExt = path.basename(file.originalname, extension);
            cb(null, "".concat(nameWithoutExt, "-").concat(uniqueSuffix).concat(extension));
        }
    });
    contactUpload = multer({
        storage: uploadStorage,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
        fileFilter: function (req, file, cb) {
            var allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
            var extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            var mimetype = allowedTypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            }
            else {
                cb(new Error('Only images, PDFs, and documents are allowed!'));
            }
        }
    });
}
export function registerChatRoutes(app) {
    var _this = this;
    // Health check endpoint for chat system
    app.get("/api/chat/health", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversationsCheck, messagesCheck, faqCheck, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, db.execute(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        SELECT COUNT(*) as count FROM chat_conversations LIMIT 1\n      "], ["\n        SELECT COUNT(*) as count FROM chat_conversations LIMIT 1\n      "]))))];
                case 1:
                    conversationsCheck = _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        SELECT COUNT(*) as count FROM chat_messages LIMIT 1\n      "], ["\n        SELECT COUNT(*) as count FROM chat_messages LIMIT 1\n      "]))))];
                case 2:
                    messagesCheck = _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        SELECT COUNT(*) as count FROM chat_faq LIMIT 1\n      "], ["\n        SELECT COUNT(*) as count FROM chat_faq LIMIT 1\n      "]))))];
                case 3:
                    faqCheck = _d.sent();
                    res.json({
                        status: 'healthy',
                        tables: {
                            conversations: true,
                            messages: true,
                            faq: true
                        },
                        counts: {
                            conversations: parseInt(((_a = conversationsCheck.rows[0]) === null || _a === void 0 ? void 0 : _a.count) || '0'),
                            messages: parseInt(((_b = messagesCheck.rows[0]) === null || _b === void 0 ? void 0 : _b.count) || '0'),
                            faqs: parseInt(((_c = faqCheck.rows[0]) === null || _c === void 0 ? void 0 : _c.count) || '0')
                        }
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error("❌ Chat health check failed:", error_1);
                    res.status(500).json({
                        status: 'unhealthy',
                        error: 'Chat tables not initialized',
                        message: 'Please run CHAT_SYSTEM_QUICK_FIX.sql in Supabase SQL Editor'
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Get FAQ list
    app.get("/api/chat/faq", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var faqs, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.execute(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n        SELECT id, question, answer, category, keywords\n        FROM chat_faq\n        WHERE is_active = true\n        ORDER BY display_order ASC\n        LIMIT 10\n      "], ["\n        SELECT id, question, answer, category, keywords\n        FROM chat_faq\n        WHERE is_active = true\n        ORDER BY display_order ASC\n        LIMIT 10\n      "]))))];
                case 1:
                    faqs = _a.sent();
                    res.json(faqs.rows || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error fetching FAQs:", error_2);
                    res.status(500).json({ error: "Failed to fetch FAQs" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Create or get existing conversation for user
    app.post("/api/chat/conversation", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var userId, actualUserId, userCheck, existing, result, error_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 4, , 5]);
                    userId = req.body.userId;
                    actualUserId = ((_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || userId;
                    console.log('💬 Creating/getting conversation for user:', actualUserId);
                    console.log('💬 Session user:', (_d = req.session) === null || _d === void 0 ? void 0 : _d.user);
                    console.log('💬 Request body userId:', userId);
                    if (!actualUserId) {
                        console.error('❌ No user ID provided');
                        return [2 /*return*/, res.status(401).json({ error: "User not authenticated" })];
                    }
                    return [4 /*yield*/, db.execute(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n        SELECT id FROM users WHERE id = ", " LIMIT 1\n      "], ["\n        SELECT id FROM users WHERE id = ", " LIMIT 1\n      "])), actualUserId))];
                case 1:
                    userCheck = _e.sent();
                    if (!userCheck.rows || userCheck.rows.length === 0) {
                        console.error('❌ User not found in database:', actualUserId);
                        return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                    }
                    console.log('✅ User verified:', actualUserId);
                    return [4 /*yield*/, db.execute(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n        SELECT * FROM chat_conversations\n        WHERE user_id = ", "\n        AND status IN ('active', 'waiting')\n        ORDER BY created_at DESC\n        LIMIT 1\n      "], ["\n        SELECT * FROM chat_conversations\n        WHERE user_id = ", "\n        AND status IN ('active', 'waiting')\n        ORDER BY created_at DESC\n        LIMIT 1\n      "])), actualUserId))];
                case 2:
                    existing = _e.sent();
                    if (existing.rows && existing.rows.length > 0) {
                        console.log('✅ Found existing conversation:', existing.rows[0].id);
                        return [2 /*return*/, res.json(existing.rows[0])];
                    }
                    console.log('📝 Creating new conversation...');
                    return [4 /*yield*/, db.execute(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n        INSERT INTO chat_conversations (\n          id, user_id, status, priority, category, last_message_at, created_at, updated_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          'waiting',\n          'normal',\n          'general',\n          NOW(),\n          NOW(),\n          NOW()\n        )\n        RETURNING *\n      "], ["\n        INSERT INTO chat_conversations (\n          id, user_id, status, priority, category, last_message_at, created_at, updated_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          'waiting',\n          'normal',\n          'general',\n          NOW(),\n          NOW(),\n          NOW()\n        )\n        RETURNING *\n      "])), actualUserId))];
                case 3:
                    result = _e.sent();
                    console.log('✅ Conversation created:', result.rows[0].id);
                    res.json(result.rows[0]);
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _e.sent();
                    console.error("❌ Error creating conversation:", error_3);
                    res.status(500).json({ error: "Failed to create conversation", details: error_3.message });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Get messages for a conversation
    app.get("/api/chat/messages/:conversationId", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversationId, messages, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    conversationId = req.params.conversationId;
                    console.log('📨 Fetching messages for conversation:', conversationId);
                    return [4 /*yield*/, db.execute(sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n        SELECT\n          cm.*,\n          u.username as sender_username,\n          u.email as sender_email\n        FROM chat_messages cm\n        LEFT JOIN users u ON cm.sender_id = u.id\n        WHERE cm.conversation_id = ", "\n        ORDER BY cm.created_at ASC\n      "], ["\n        SELECT\n          cm.*,\n          u.username as sender_username,\n          u.email as sender_email\n        FROM chat_messages cm\n        LEFT JOIN users u ON cm.sender_id = u.id\n        WHERE cm.conversation_id = ", "\n        ORDER BY cm.created_at ASC\n      "])), conversationId))];
                case 1:
                    messages = _b.sent();
                    console.log('✅ Found', ((_a = messages.rows) === null || _a === void 0 ? void 0 : _a.length) || 0, 'messages');
                    res.json(messages.rows || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _b.sent();
                    console.error("❌ Error fetching messages:", error_4);
                    res.status(500).json({ error: "Failed to fetch messages", details: error_4.message });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Send message (user)
    app.post("/api/chat/send", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, conversationId, message, senderId, senderType, userCheck, result, error_5;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    _a = req.body, conversationId = _a.conversationId, message = _a.message, senderId = _a.senderId, senderType = _a.senderType;
                    console.log('📤 Sending message:', { conversationId: conversationId, senderId: senderId, senderType: senderType, messageLength: message === null || message === void 0 ? void 0 : message.length });
                    if (!conversationId || !message || !senderId) {
                        console.error('❌ Missing required fields:', { conversationId: conversationId, message: !!message, senderId: senderId });
                        return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                    }
                    return [4 /*yield*/, db.execute(sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n        SELECT id FROM users WHERE id = ", " LIMIT 1\n      "], ["\n        SELECT id FROM users WHERE id = ", " LIMIT 1\n      "])), senderId))];
                case 1:
                    userCheck = _c.sent();
                    if (!userCheck.rows || userCheck.rows.length === 0) {
                        console.error('❌ Sender not found:', senderId);
                        return [2 /*return*/, res.status(404).json({ error: "Sender not found" })];
                    }
                    console.log('✅ Sender verified:', senderId);
                    return [4 /*yield*/, db.execute(sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n        INSERT INTO chat_messages (\n          id, conversation_id, sender_id, sender_type, message, is_read, created_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          false,\n          NOW()\n        )\n        RETURNING *\n      "], ["\n        INSERT INTO chat_messages (\n          id, conversation_id, sender_id, sender_type, message, is_read, created_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          false,\n          NOW()\n        )\n        RETURNING *\n      "])), conversationId, senderId, senderType || 'user', message))];
                case 2:
                    result = _c.sent();
                    console.log('✅ Message inserted:', (_b = result.rows[0]) === null || _b === void 0 ? void 0 : _b.id);
                    // Update conversation last_message_at
                    return [4 /*yield*/, db.execute(sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n        UPDATE chat_conversations\n        SET last_message_at = NOW(), updated_at = NOW()\n        WHERE id = ", "\n      "], ["\n        UPDATE chat_conversations\n        SET last_message_at = NOW(), updated_at = NOW()\n        WHERE id = ", "\n      "])), conversationId))];
                case 3:
                    // Update conversation last_message_at
                    _c.sent();
                    console.log('✅ Conversation updated');
                    res.json(result.rows[0]);
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _c.sent();
                    console.error("❌ Error sending message:", error_5);
                    res.status(500).json({ error: "Failed to send message", details: error_5.message });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Get all conversations
    app.get("/api/admin/chat/conversations", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversations, formattedConversations, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, db.execute(sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n        SELECT \n          cc.*,\n          u.username,\n          u.email,\n          COUNT(CASE WHEN cm.is_read = false AND cm.sender_type = 'user' THEN 1 END) as unread_count\n        FROM chat_conversations cc\n        LEFT JOIN users u ON cc.user_id = u.id\n        LEFT JOIN chat_messages cm ON cm.conversation_id = cc.id\n        GROUP BY cc.id, u.username, u.email\n        ORDER BY cc.last_message_at DESC\n      "], ["\n        SELECT \n          cc.*,\n          u.username,\n          u.email,\n          COUNT(CASE WHEN cm.is_read = false AND cm.sender_type = 'user' THEN 1 END) as unread_count\n        FROM chat_conversations cc\n        LEFT JOIN users u ON cc.user_id = u.id\n        LEFT JOIN chat_messages cm ON cm.conversation_id = cc.id\n        GROUP BY cc.id, u.username, u.email\n        ORDER BY cc.last_message_at DESC\n      "]))))];
                case 1:
                    conversations = _a.sent();
                    formattedConversations = (conversations.rows || []).map(function (conv) { return (__assign(__assign({}, conv), { user: {
                            username: conv.username,
                            email: conv.email
                        } })); });
                    res.json(formattedConversations);
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error("Error fetching conversations:", error_6);
                    res.status(500).json({ error: "Failed to fetch conversations" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Get messages for a conversation
    app.get("/api/admin/chat/messages/:conversationId", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversationId, messages, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    conversationId = req.params.conversationId;
                    return [4 /*yield*/, db.execute(sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\n        SELECT \n          cm.*,\n          u.username as sender_username,\n          u.email as sender_email\n        FROM chat_messages cm\n        LEFT JOIN users u ON cm.sender_id = u.id\n        WHERE cm.conversation_id = ", "\n        ORDER BY cm.created_at ASC\n      "], ["\n        SELECT \n          cm.*,\n          u.username as sender_username,\n          u.email as sender_email\n        FROM chat_messages cm\n        LEFT JOIN users u ON cm.sender_id = u.id\n        WHERE cm.conversation_id = ", "\n        ORDER BY cm.created_at ASC\n      "])), conversationId))];
                case 1:
                    messages = _a.sent();
                    res.json(messages.rows || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    console.error("Error fetching messages:", error_7);
                    res.status(500).json({ error: "Failed to fetch messages" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Send message
    app.post("/api/admin/chat/send", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, conversationId, message, senderId, senderType, result, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.body, conversationId = _a.conversationId, message = _a.message, senderId = _a.senderId, senderType = _a.senderType;
                    if (!conversationId || !message || !senderId) {
                        return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                    }
                    return [4 /*yield*/, db.execute(sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["\n        INSERT INTO chat_messages (\n          id, conversation_id, sender_id, sender_type, message, is_read, created_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          false,\n          NOW()\n        )\n        RETURNING *\n      "], ["\n        INSERT INTO chat_messages (\n          id, conversation_id, sender_id, sender_type, message, is_read, created_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          false,\n          NOW()\n        )\n        RETURNING *\n      "])), conversationId, senderId, senderType || 'admin', message))];
                case 1:
                    result = _b.sent();
                    // Update conversation last_message_at and status
                    return [4 /*yield*/, db.execute(sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["\n        UPDATE chat_conversations\n        SET \n          last_message_at = NOW(), \n          updated_at = NOW(),\n          status = 'active',\n          assigned_admin_id = ", "\n        WHERE id = ", "\n      "], ["\n        UPDATE chat_conversations\n        SET \n          last_message_at = NOW(), \n          updated_at = NOW(),\n          status = 'active',\n          assigned_admin_id = ", "\n        WHERE id = ", "\n      "])), senderId, conversationId))];
                case 2:
                    // Update conversation last_message_at and status
                    _b.sent();
                    res.json(result.rows[0]);
                    return [3 /*break*/, 4];
                case 3:
                    error_8 = _b.sent();
                    console.error("Error sending message:", error_8);
                    res.status(500).json({ error: "Failed to send message" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Mark messages as read
    app.post("/api/admin/chat/mark-read/:conversationId", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversationId, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    conversationId = req.params.conversationId;
                    return [4 /*yield*/, db.execute(sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\n        UPDATE chat_messages\n        SET is_read = true\n        WHERE conversation_id = ", "\n        AND sender_type = 'user'\n        AND is_read = false\n      "], ["\n        UPDATE chat_messages\n        SET is_read = true\n        WHERE conversation_id = ", "\n        AND sender_type = 'user'\n        AND is_read = false\n      "])), conversationId))];
                case 1:
                    _a.sent();
                    res.json({ success: true });
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    console.error("Error marking messages as read:", error_9);
                    res.status(500).json({ error: "Failed to mark messages as read" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Update conversation status
    app.patch("/api/admin/chat/conversation/:conversationId/status", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversationId, status_1, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    conversationId = req.params.conversationId;
                    status_1 = req.body.status;
                    if (!['active', 'waiting', 'closed'].includes(status_1)) {
                        return [2 /*return*/, res.status(400).json({ error: "Invalid status" })];
                    }
                    return [4 /*yield*/, db.execute(sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["\n        UPDATE chat_conversations\n        SET status = ", ", updated_at = NOW()\n        WHERE id = ", "\n      "], ["\n        UPDATE chat_conversations\n        SET status = ", ", updated_at = NOW()\n        WHERE id = ", "\n      "])), status_1, conversationId))];
                case 1:
                    _a.sent();
                    res.json({ success: true });
                    return [3 /*break*/, 3];
                case 2:
                    error_10 = _a.sent();
                    console.error("Error updating conversation status:", error_10);
                    res.status(500).json({ error: "Failed to update status" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Update conversation priority
    app.patch("/api/admin/chat/conversation/:conversationId/priority", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversationId, priority, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    conversationId = req.params.conversationId;
                    priority = req.body.priority;
                    if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
                        return [2 /*return*/, res.status(400).json({ error: "Invalid priority" })];
                    }
                    return [4 /*yield*/, db.execute(sql(templateObject_18 || (templateObject_18 = __makeTemplateObject(["\n        UPDATE chat_conversations\n        SET priority = ", ", updated_at = NOW()\n        WHERE id = ", "\n      "], ["\n        UPDATE chat_conversations\n        SET priority = ", ", updated_at = NOW()\n        WHERE id = ", "\n      "])), priority, conversationId))];
                case 1:
                    _a.sent();
                    res.json({ success: true });
                    return [3 /*break*/, 3];
                case 2:
                    error_11 = _a.sent();
                    console.error("Error updating conversation priority:", error_11);
                    res.status(500).json({ error: "Failed to update priority" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Assign conversation to admin
    app.patch("/api/admin/chat/conversation/:conversationId/assign", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var conversationId, adminId, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    conversationId = req.params.conversationId;
                    adminId = req.body.adminId;
                    return [4 /*yield*/, db.execute(sql(templateObject_19 || (templateObject_19 = __makeTemplateObject(["\n        UPDATE chat_conversations\n        SET assigned_admin_id = ", ", updated_at = NOW()\n        WHERE id = ", "\n      "], ["\n        UPDATE chat_conversations\n        SET assigned_admin_id = ", ", updated_at = NOW()\n        WHERE id = ", "\n      "])), adminId, conversationId))];
                case 1:
                    _a.sent();
                    res.json({ success: true });
                    return [3 /*break*/, 3];
                case 2:
                    error_12 = _a.sent();
                    console.error("Error assigning conversation:", error_12);
                    res.status(500).json({ error: "Failed to assign conversation" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Admin: Delete message
    app.delete("/api/admin/chat/message/:messageId", requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var messageId, result, error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    messageId = req.params.messageId;
                    console.log('🗑️ Deleting message:', messageId);
                    return [4 /*yield*/, db.execute(sql(templateObject_20 || (templateObject_20 = __makeTemplateObject(["\n        DELETE FROM chat_messages\n        WHERE id = ", "\n        RETURNING *\n      "], ["\n        DELETE FROM chat_messages\n        WHERE id = ", "\n        RETURNING *\n      "])), messageId))];
                case 1:
                    result = _a.sent();
                    if (!result.rows || result.rows.length === 0) {
                        return [2 /*return*/, res.status(404).json({ error: "Message not found" })];
                    }
                    console.log('✅ Message deleted successfully:', messageId);
                    res.json({ success: true, message: "Message deleted successfully" });
                    return [3 /*break*/, 3];
                case 2:
                    error_13 = _a.sent();
                    console.error("❌ Error deleting message:", error_13);
                    res.status(500).json({ error: "Failed to delete message" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Contact Agent Form Submission with File Upload
    var contactHandler = contactUpload ? contactUpload.single('image') : function (req, res, next) { return next(); };
    app.post("/api/contact-agent", contactHandler, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, name_1, email, subject, message, imageFile, conversationResult, conversation, finalMessage, imagePath, imageFilename, imageOriginalName, error_14;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, name_1 = _a.name, email = _a.email, subject = _a.subject, message = _a.message;
                    imageFile = req.file;
                    console.log('📧 Contact form submission:', { name: name_1, email: email, subject: subject, hasImage: !!imageFile });
                    if (!name_1 || !email || !subject || !message) {
                        return [2 /*return*/, res.status(400).json({ error: "All fields are required" })];
                    }
                    return [4 /*yield*/, db.execute(sql(templateObject_21 || (templateObject_21 = __makeTemplateObject(["\n        INSERT INTO chat_conversations (\n          id, user_id, status, priority, category, created_at, updated_at, last_message_at\n        ) VALUES (\n          gen_random_uuid(),\n          'guest',\n          'waiting',\n          'normal',\n          'general',\n          NOW(),\n          NOW(),\n          NOW()\n        )\n        RETURNING *\n      "], ["\n        INSERT INTO chat_conversations (\n          id, user_id, status, priority, category, created_at, updated_at, last_message_at\n        ) VALUES (\n          gen_random_uuid(),\n          'guest',\n          'waiting',\n          'normal',\n          'general',\n          NOW(),\n          NOW(),\n          NOW()\n        )\n        RETURNING *\n      "]))))];
                case 1:
                    conversationResult = _b.sent();
                    conversation = conversationResult.rows[0];
                    console.log('✅ Conversation created:', conversation.id);
                    finalMessage = "\uD83D\uDCE7 Email: ".concat(email, "\n\uD83D\uDCDD Subject: ").concat(subject, "\n\n").concat(message);
                    imagePath = null;
                    imageFilename = null;
                    imageOriginalName = null;
                    if (imageFile) {
                        imageFilename = imageFile.filename;
                        imageOriginalName = imageFile.originalname;
                        imagePath = "/api/uploads/contact/".concat(imageFilename);
                        finalMessage += "\n\n\uD83D\uDD17 File: ".concat(imagePath);
                        console.log('📎 Image uploaded:', { filename: imageFilename, path: imagePath });
                    }
                    // Insert initial message
                    return [4 /*yield*/, db.execute(sql(templateObject_22 || (templateObject_22 = __makeTemplateObject(["\n        INSERT INTO chat_messages (\n          id, conversation_id, sender_id, sender_type, message, is_read, created_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          'guest',\n          'user',\n          ", ",\n          false,\n          NOW()\n        )\n      "], ["\n        INSERT INTO chat_messages (\n          id, conversation_id, sender_id, sender_type, message, is_read, created_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          'guest',\n          'user',\n          ", ",\n          false,\n          NOW()\n        )\n      "])), conversation.id, finalMessage))];
                case 2:
                    // Insert initial message
                    _b.sent();
                    console.log('✅ Message created');
                    // Create contact request record
                    return [4 /*yield*/, db.execute(sql(templateObject_23 || (templateObject_23 = __makeTemplateObject(["\n        INSERT INTO contact_requests (\n          id, name, email, subject, message, has_image, image_filename, image_original_name, image_path, conversation_id, status, created_at, updated_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          'pending',\n          NOW(),\n          NOW()\n        )\n      "], ["\n        INSERT INTO contact_requests (\n          id, name, email, subject, message, has_image, image_filename, image_original_name, image_path, conversation_id, status, created_at, updated_at\n        ) VALUES (\n          gen_random_uuid(),\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          ", ",\n          'pending',\n          NOW(),\n          NOW()\n        )\n      "])), name_1, email, subject, message, !!imageFile, imageFilename, imageOriginalName, imagePath, conversation.id))];
                case 3:
                    // Create contact request record
                    _b.sent();
                    console.log('✅ Contact request created');
                    res.json({
                        success: true,
                        message: "Your message has been sent successfully. We'll get back to you soon!",
                        conversationId: conversation.id
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_14 = _b.sent();
                    console.error("❌ Error submitting contact form:", error_14);
                    res.status(500).json({ error: "Failed to submit contact form" });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21, templateObject_22, templateObject_23;
