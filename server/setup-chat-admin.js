var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
import { db } from "./db";
import { sql } from "drizzle-orm";
import { requireSessionSuperAdmin } from "./auth";
/**
 * Admin endpoint to manually trigger chat table setup
 * Only accessible by superadmin
 */
export function registerChatSetupRoute(app) {
    var _this = this;
    app.post("/api/admin/setup-chat-tables", requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var faqCount, conversationsCheck, messagesCheck, faqCheckFinal, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 22, , 23]);
                    console.log('🔧 ========================================');
                    console.log('🔧 MANUAL CHAT TABLE SETUP TRIGGERED');
                    console.log('🔧 ========================================');
                    // 1. Create chat_conversations table
                    return [4 /*yield*/, db.execute(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        CREATE TABLE IF NOT EXISTS chat_conversations (\n          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),\n          assigned_admin_id TEXT REFERENCES users(id),\n          priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),\n          category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'deposit', 'withdrawal', 'trading', 'verification', 'technical')),\n          last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n        )\n      "], ["\n        CREATE TABLE IF NOT EXISTS chat_conversations (\n          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),\n          assigned_admin_id TEXT REFERENCES users(id),\n          priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),\n          category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'deposit', 'withdrawal', 'trading', 'verification', 'technical')),\n          last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n        )\n      "]))))];
                case 1:
                    // 1. Create chat_conversations table
                    _d.sent();
                    console.log('✅ Created chat_conversations table');
                    // 2. Create chat_messages table
                    return [4 /*yield*/, db.execute(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        CREATE TABLE IF NOT EXISTS chat_messages (\n          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n          conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,\n          sender_id TEXT NOT NULL REFERENCES users(id),\n          sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),\n          message TEXT NOT NULL,\n          is_read BOOLEAN DEFAULT false,\n          metadata JSONB,\n          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n        )\n      "], ["\n        CREATE TABLE IF NOT EXISTS chat_messages (\n          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n          conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,\n          sender_id TEXT NOT NULL REFERENCES users(id),\n          sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),\n          message TEXT NOT NULL,\n          is_read BOOLEAN DEFAULT false,\n          metadata JSONB,\n          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n        )\n      "]))))];
                case 2:
                    // 2. Create chat_messages table
                    _d.sent();
                    console.log('✅ Created chat_messages table');
                    // 3. Create chat_faq table
                    return [4 /*yield*/, db.execute(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        CREATE TABLE IF NOT EXISTS chat_faq (\n          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n          question TEXT NOT NULL,\n          answer TEXT NOT NULL,\n          category VARCHAR(50) DEFAULT 'general',\n          keywords TEXT[],\n          display_order INTEGER DEFAULT 0,\n          is_active BOOLEAN DEFAULT true,\n          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n        )\n      "], ["\n        CREATE TABLE IF NOT EXISTS chat_faq (\n          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n          question TEXT NOT NULL,\n          answer TEXT NOT NULL,\n          category VARCHAR(50) DEFAULT 'general',\n          keywords TEXT[],\n          display_order INTEGER DEFAULT 0,\n          is_active BOOLEAN DEFAULT true,\n          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n        )\n      "]))))];
                case 3:
                    // 3. Create chat_faq table
                    _d.sent();
                    console.log('✅ Created chat_faq table');
                    // 4. Create indexes
                    return [4 /*yield*/, db.execute(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id)"], ["CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id)"]))))];
                case 4:
                    // 4. Create indexes
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status)"], ["CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status)"]))))];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned_admin ON chat_conversations(assigned_admin_id)"], ["CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned_admin ON chat_conversations(assigned_admin_id)"]))))];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)"], ["CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)"]))))];
                case 7:
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)"], ["CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)"]))))];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)"], ["CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at)"]))))];
                case 9:
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_faq_category ON chat_faq(category)"], ["CREATE INDEX IF NOT EXISTS idx_chat_faq_category ON chat_faq(category)"]))))];
                case 10:
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["CREATE INDEX IF NOT EXISTS idx_chat_faq_active ON chat_faq(is_active)"], ["CREATE INDEX IF NOT EXISTS idx_chat_faq_active ON chat_faq(is_active)"]))))];
                case 11:
                    _d.sent();
                    console.log('✅ Created indexes');
                    return [4 /*yield*/, db.execute(sql(templateObject_12 || (templateObject_12 = __makeTemplateObject(["SELECT COUNT(*) as count FROM chat_faq"], ["SELECT COUNT(*) as count FROM chat_faq"]))))];
                case 12:
                    faqCount = _d.sent();
                    if (!(faqCount.rows[0].count === '0')) return [3 /*break*/, 14];
                    return [4 /*yield*/, db.execute(sql(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\n          INSERT INTO chat_faq (question, answer, category, keywords, display_order) VALUES\n          ('How do I deposit funds?', 'To deposit funds, go to Wallet page, click Deposit, select your preferred cryptocurrency (USDT, BTC, ETH, SOL), choose the network, and send funds to the displayed address. Your balance will be updated after confirmation.', 'deposit', ARRAY['deposit', 'fund', 'add money', 'top up'], 1),\n          ('How do I withdraw funds?', 'To withdraw, go to Wallet page, click Withdraw, enter the amount and your wallet address, then submit. A superadmin will review and approve your request within 24 hours.', 'withdrawal', ARRAY['withdraw', 'cash out', 'send money'], 2),\n          ('What are the trading durations available?', 'We offer two trading durations: 30 seconds (minimum 100 USDT with 10% profit) and 60 seconds (minimum 1000 USDT with 15% profit).', 'trading', ARRAY['duration', 'time', 'trading time', '30s', '60s'], 3),\n          ('How do I verify my account?', 'Go to Profile page, click on Verification section, upload your ID document and proof of address. Our team will review within 24-48 hours.', 'verification', ARRAY['verify', 'kyc', 'identity', 'document'], 4),\n          ('What cryptocurrencies are supported?', 'We support USDT (BEP20, TRC20, ERC20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) for deposits and withdrawals.', 'general', ARRAY['crypto', 'currency', 'coin', 'supported'], 5),\n          ('How do I start trading?', 'Connect your MetaMask wallet or login, deposit funds, go to Trade page, select a trading pair, choose duration (30s or 60s), enter amount, and click BUY UP or BUY DOWN.', 'trading', ARRAY['start', 'begin', 'how to trade', 'trading'], 6),\n          ('What is the minimum deposit?', 'The minimum deposit varies by cryptocurrency. For trading, minimum is 100 USDT for 30-second trades and 1000 USDT for 60-second trades.', 'deposit', ARRAY['minimum', 'min deposit', 'least amount'], 7),\n          ('How long does withdrawal take?', 'Withdrawals are processed within 24 hours after superadmin approval. Blockchain confirmation time varies by network (5-30 minutes typically).', 'withdrawal', ARRAY['withdrawal time', 'how long', 'processing time'], 8),\n          ('Is my account secure?', 'Yes! We use industry-standard security including encrypted connections, secure wallet integration, and admin verification for all withdrawals.', 'general', ARRAY['security', 'safe', 'secure', 'protection'], 9),\n          ('How do I contact support?', 'You can contact support through this live chat! Our team is available 24/7. For urgent issues, mark your message as high priority.', 'general', ARRAY['support', 'help', 'contact', 'customer service'], 10)\n        "], ["\n          INSERT INTO chat_faq (question, answer, category, keywords, display_order) VALUES\n          ('How do I deposit funds?', 'To deposit funds, go to Wallet page, click Deposit, select your preferred cryptocurrency (USDT, BTC, ETH, SOL), choose the network, and send funds to the displayed address. Your balance will be updated after confirmation.', 'deposit', ARRAY['deposit', 'fund', 'add money', 'top up'], 1),\n          ('How do I withdraw funds?', 'To withdraw, go to Wallet page, click Withdraw, enter the amount and your wallet address, then submit. A superadmin will review and approve your request within 24 hours.', 'withdrawal', ARRAY['withdraw', 'cash out', 'send money'], 2),\n          ('What are the trading durations available?', 'We offer two trading durations: 30 seconds (minimum 100 USDT with 10% profit) and 60 seconds (minimum 1000 USDT with 15% profit).', 'trading', ARRAY['duration', 'time', 'trading time', '30s', '60s'], 3),\n          ('How do I verify my account?', 'Go to Profile page, click on Verification section, upload your ID document and proof of address. Our team will review within 24-48 hours.', 'verification', ARRAY['verify', 'kyc', 'identity', 'document'], 4),\n          ('What cryptocurrencies are supported?', 'We support USDT (BEP20, TRC20, ERC20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) for deposits and withdrawals.', 'general', ARRAY['crypto', 'currency', 'coin', 'supported'], 5),\n          ('How do I start trading?', 'Connect your MetaMask wallet or login, deposit funds, go to Trade page, select a trading pair, choose duration (30s or 60s), enter amount, and click BUY UP or BUY DOWN.', 'trading', ARRAY['start', 'begin', 'how to trade', 'trading'], 6),\n          ('What is the minimum deposit?', 'The minimum deposit varies by cryptocurrency. For trading, minimum is 100 USDT for 30-second trades and 1000 USDT for 60-second trades.', 'deposit', ARRAY['minimum', 'min deposit', 'least amount'], 7),\n          ('How long does withdrawal take?', 'Withdrawals are processed within 24 hours after superadmin approval. Blockchain confirmation time varies by network (5-30 minutes typically).', 'withdrawal', ARRAY['withdrawal time', 'how long', 'processing time'], 8),\n          ('Is my account secure?', 'Yes! We use industry-standard security including encrypted connections, secure wallet integration, and admin verification for all withdrawals.', 'general', ARRAY['security', 'safe', 'secure', 'protection'], 9),\n          ('How do I contact support?', 'You can contact support through this live chat! Our team is available 24/7. For urgent issues, mark your message as high priority.', 'general', ARRAY['support', 'help', 'contact', 'customer service'], 10)\n        "]))))];
                case 13:
                    _d.sent();
                    console.log('✅ Inserted default FAQ data');
                    return [3 /*break*/, 15];
                case 14:
                    console.log('ℹ️ FAQ data already exists, skipping insert');
                    _d.label = 15;
                case 15: 
                // 6. Create trigger function
                return [4 /*yield*/, db.execute(sql(templateObject_14 || (templateObject_14 = __makeTemplateObject(["\n        CREATE OR REPLACE FUNCTION update_conversation_timestamp()\n        RETURNS TRIGGER AS $$\n        BEGIN\n          UPDATE chat_conversations\n          SET last_message_at = NEW.created_at, updated_at = NOW()\n          WHERE id = NEW.conversation_id;\n          RETURN NEW;\n        END;\n        $$ LANGUAGE plpgsql\n      "], ["\n        CREATE OR REPLACE FUNCTION update_conversation_timestamp()\n        RETURNS TRIGGER AS $$\n        BEGIN\n          UPDATE chat_conversations\n          SET last_message_at = NEW.created_at, updated_at = NOW()\n          WHERE id = NEW.conversation_id;\n          RETURN NEW;\n        END;\n        $$ LANGUAGE plpgsql\n      "]))))];
                case 16:
                    // 6. Create trigger function
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_15 || (templateObject_15 = __makeTemplateObject(["\n        DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON chat_messages\n      "], ["\n        DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON chat_messages\n      "]))))];
                case 17:
                    _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\n        CREATE TRIGGER trigger_update_conversation_timestamp\n        AFTER INSERT ON chat_messages\n        FOR EACH ROW\n        EXECUTE FUNCTION update_conversation_timestamp()\n      "], ["\n        CREATE TRIGGER trigger_update_conversation_timestamp\n        AFTER INSERT ON chat_messages\n        FOR EACH ROW\n        EXECUTE FUNCTION update_conversation_timestamp()\n      "]))))];
                case 18:
                    _d.sent();
                    console.log('✅ Created trigger for conversation timestamp updates');
                    return [4 /*yield*/, db.execute(sql(templateObject_17 || (templateObject_17 = __makeTemplateObject(["SELECT COUNT(*) as count FROM chat_conversations"], ["SELECT COUNT(*) as count FROM chat_conversations"]))))];
                case 19:
                    conversationsCheck = _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_18 || (templateObject_18 = __makeTemplateObject(["SELECT COUNT(*) as count FROM chat_messages"], ["SELECT COUNT(*) as count FROM chat_messages"]))))];
                case 20:
                    messagesCheck = _d.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_19 || (templateObject_19 = __makeTemplateObject(["SELECT COUNT(*) as count FROM chat_faq"], ["SELECT COUNT(*) as count FROM chat_faq"]))))];
                case 21:
                    faqCheckFinal = _d.sent();
                    console.log('✅ ========================================');
                    console.log('✅ CHAT SYSTEM SETUP COMPLETE!');
                    console.log('✅ ========================================');
                    res.json({
                        success: true,
                        message: 'Chat system tables created successfully',
                        counts: {
                            conversations: parseInt(((_a = conversationsCheck.rows[0]) === null || _a === void 0 ? void 0 : _a.count) || '0'),
                            messages: parseInt(((_b = messagesCheck.rows[0]) === null || _b === void 0 ? void 0 : _b.count) || '0'),
                            faqs: parseInt(((_c = faqCheckFinal.rows[0]) === null || _c === void 0 ? void 0 : _c.count) || '0')
                        }
                    });
                    return [3 /*break*/, 23];
                case 22:
                    error_1 = _d.sent();
                    console.error('❌ Error setting up chat tables:', error_1);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to setup chat tables',
                        details: error_1.message
                    });
                    return [3 /*break*/, 23];
                case 23: return [2 /*return*/];
            }
        });
    }); });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19;
