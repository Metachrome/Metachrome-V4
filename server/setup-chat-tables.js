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
import { createClient } from '@supabase/supabase-js';
var supabaseUrl = process.env.SUPABASE_URL || '';
var supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
var supabase = createClient(supabaseUrl, supabaseKey);
export function setupChatTables() {
    return __awaiter(this, void 0, void 0, function () {
        var faqCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('💬 Setting up chat system tables...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 16, , 17]);
                    // 1. Create chat_conversations table
                    return [4 /*yield*/, supabase.rpc('exec_sql', { sql_query: "\n      CREATE TABLE IF NOT EXISTS chat_conversations (\n        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),\n        assigned_admin_id TEXT REFERENCES users(id),\n        priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),\n        category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'deposit', 'withdrawal', 'trading', 'verification', 'technical')),\n        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n      )\n    " })];
                case 2:
                    // 1. Create chat_conversations table
                    _a.sent();
                    console.log('✅ Created chat_conversations table');
                    // 2. Create chat_messages table
                    return [4 /*yield*/, db.execute(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS chat_messages (\n        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n        conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,\n        sender_id TEXT NOT NULL REFERENCES users(id),\n        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),\n        message TEXT NOT NULL,\n        is_read BOOLEAN DEFAULT false,\n        metadata JSONB,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS chat_messages (\n        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n        conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,\n        sender_id TEXT NOT NULL REFERENCES users(id),\n        sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),\n        message TEXT NOT NULL,\n        is_read BOOLEAN DEFAULT false,\n        metadata JSONB,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n      )\n    "]))))];
                case 3:
                    // 2. Create chat_messages table
                    _a.sent();
                    console.log('✅ Created chat_messages table');
                    // 3. Create chat_faq table
                    return [4 /*yield*/, db.execute(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS chat_faq (\n        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n        question TEXT NOT NULL,\n        answer TEXT NOT NULL,\n        category VARCHAR(50) DEFAULT 'general',\n        keywords TEXT[],\n        display_order INTEGER DEFAULT 0,\n        is_active BOOLEAN DEFAULT true,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS chat_faq (\n        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n        question TEXT NOT NULL,\n        answer TEXT NOT NULL,\n        category VARCHAR(50) DEFAULT 'general',\n        keywords TEXT[],\n        display_order INTEGER DEFAULT 0,\n        is_active BOOLEAN DEFAULT true,\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n      )\n    "]))))];
                case 4:
                    // 3. Create chat_faq table
                    _a.sent();
                    console.log('✅ Created chat_faq table');
                    // 4. Create indexes
                    return [4 /*yield*/, db.execute(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id)\n    "], ["\n      CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id)\n    "]))))];
                case 5:
                    // 4. Create indexes
                    _a.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status)\n    "], ["\n      CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status)\n    "]))))];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)\n    "], ["\n      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id)\n    "]))))];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)\n    "], ["\n      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id)\n    "]))))];
                case 8:
                    _a.sent();
                    console.log('✅ Created indexes');
                    return [4 /*yield*/, db.execute(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["SELECT COUNT(*) FROM chat_faq"], ["SELECT COUNT(*) FROM chat_faq"]))))];
                case 9:
                    faqCount = _a.sent();
                    if (!(faqCount.rows[0].count === '0')) return [3 /*break*/, 11];
                    return [4 /*yield*/, db.execute(sql(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n        INSERT INTO chat_faq (question, answer, category, keywords, display_order) VALUES\n        ('How do I deposit funds?', 'To deposit funds, go to Wallet page, click Deposit, select your preferred cryptocurrency (USDT, BTC, ETH, SOL), choose the network, and send funds to the displayed address. Your balance will be updated after confirmation.', 'deposit', ARRAY['deposit', 'fund', 'add money', 'top up'], 1),\n        ('How do I withdraw funds?', 'To withdraw, go to Wallet page, click Withdraw, enter the amount and your wallet address, then submit. A superadmin will review and approve your request within 24 hours.', 'withdrawal', ARRAY['withdraw', 'cash out', 'send money'], 2),\n        ('What are the trading durations available?', 'We offer two trading durations: 30 seconds (minimum 100 USDT with 10% profit) and 60 seconds (minimum 1000 USDT with 15% profit).', 'trading', ARRAY['duration', 'time', 'trading time', '30s', '60s'], 3),\n        ('How do I verify my account?', 'Go to Profile page, click on Verification section, upload your ID document and proof of address. Our team will review within 24-48 hours.', 'verification', ARRAY['verify', 'kyc', 'identity', 'document'], 4),\n        ('What cryptocurrencies are supported?', 'We support USDT (BEP20, TRC20, ERC20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) for deposits and withdrawals.', 'general', ARRAY['crypto', 'currency', 'coin', 'supported'], 5),\n        ('How do I start trading?', 'Connect your MetaMask wallet or login, deposit funds, go to Trade page, select a trading pair, choose duration (30s or 60s), enter amount, and click BUY UP or BUY DOWN.', 'trading', ARRAY['start', 'begin', 'how to trade', 'trading'], 6),\n        ('What is the minimum deposit?', 'The minimum deposit varies by cryptocurrency. For trading, minimum is 100 USDT for 30-second trades and 1000 USDT for 60-second trades.', 'deposit', ARRAY['minimum', 'min deposit', 'least amount'], 7),\n        ('How long does withdrawal take?', 'Withdrawals are processed within 24 hours after superadmin approval. Blockchain confirmation time varies by network (BTC: 30-60 min, ETH: 5-15 min, SOL: 1-2 min).', 'withdrawal', ARRAY['withdrawal time', 'how long', 'processing time'], 8),\n        ('Is my account secure?', 'Yes! We use industry-standard encryption, secure authentication, and store funds in cold wallets. Enable 2FA for additional security.', 'general', ARRAY['security', 'safe', 'secure', 'protection'], 9),\n        ('How do I contact support?', 'You can contact us via Live Chat (24/7), email at support@metachrome.io, or through the Support page. Our team responds within 1-2 hours.', 'general', ARRAY['contact', 'support', 'help', 'customer service'], 10)\n      "], ["\n        INSERT INTO chat_faq (question, answer, category, keywords, display_order) VALUES\n        ('How do I deposit funds?', 'To deposit funds, go to Wallet page, click Deposit, select your preferred cryptocurrency (USDT, BTC, ETH, SOL), choose the network, and send funds to the displayed address. Your balance will be updated after confirmation.', 'deposit', ARRAY['deposit', 'fund', 'add money', 'top up'], 1),\n        ('How do I withdraw funds?', 'To withdraw, go to Wallet page, click Withdraw, enter the amount and your wallet address, then submit. A superadmin will review and approve your request within 24 hours.', 'withdrawal', ARRAY['withdraw', 'cash out', 'send money'], 2),\n        ('What are the trading durations available?', 'We offer two trading durations: 30 seconds (minimum 100 USDT with 10% profit) and 60 seconds (minimum 1000 USDT with 15% profit).', 'trading', ARRAY['duration', 'time', 'trading time', '30s', '60s'], 3),\n        ('How do I verify my account?', 'Go to Profile page, click on Verification section, upload your ID document and proof of address. Our team will review within 24-48 hours.', 'verification', ARRAY['verify', 'kyc', 'identity', 'document'], 4),\n        ('What cryptocurrencies are supported?', 'We support USDT (BEP20, TRC20, ERC20), Bitcoin (BTC), Ethereum (ETH), and Solana (SOL) for deposits and withdrawals.', 'general', ARRAY['crypto', 'currency', 'coin', 'supported'], 5),\n        ('How do I start trading?', 'Connect your MetaMask wallet or login, deposit funds, go to Trade page, select a trading pair, choose duration (30s or 60s), enter amount, and click BUY UP or BUY DOWN.', 'trading', ARRAY['start', 'begin', 'how to trade', 'trading'], 6),\n        ('What is the minimum deposit?', 'The minimum deposit varies by cryptocurrency. For trading, minimum is 100 USDT for 30-second trades and 1000 USDT for 60-second trades.', 'deposit', ARRAY['minimum', 'min deposit', 'least amount'], 7),\n        ('How long does withdrawal take?', 'Withdrawals are processed within 24 hours after superadmin approval. Blockchain confirmation time varies by network (BTC: 30-60 min, ETH: 5-15 min, SOL: 1-2 min).', 'withdrawal', ARRAY['withdrawal time', 'how long', 'processing time'], 8),\n        ('Is my account secure?', 'Yes! We use industry-standard encryption, secure authentication, and store funds in cold wallets. Enable 2FA for additional security.', 'general', ARRAY['security', 'safe', 'secure', 'protection'], 9),\n        ('How do I contact support?', 'You can contact us via Live Chat (24/7), email at support@metachrome.io, or through the Support page. Our team responds within 1-2 hours.', 'general', ARRAY['contact', 'support', 'help', 'customer service'], 10)\n      "]))))];
                case 10:
                    _a.sent();
                    console.log('✅ Inserted default FAQ data');
                    return [3 /*break*/, 12];
                case 11:
                    console.log('ℹ️ FAQ data already exists, skipping insert');
                    _a.label = 12;
                case 12: 
                // 6. Create trigger to update conversation timestamp
                return [4 /*yield*/, db.execute(sql(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n      CREATE OR REPLACE FUNCTION update_conversation_timestamp()\n      RETURNS TRIGGER AS $$\n      BEGIN\n        UPDATE chat_conversations\n        SET last_message_at = NEW.created_at, updated_at = NOW()\n        WHERE id = NEW.conversation_id;\n        RETURN NEW;\n      END;\n      $$ LANGUAGE plpgsql\n    "], ["\n      CREATE OR REPLACE FUNCTION update_conversation_timestamp()\n      RETURNS TRIGGER AS $$\n      BEGIN\n        UPDATE chat_conversations\n        SET last_message_at = NEW.created_at, updated_at = NOW()\n        WHERE id = NEW.conversation_id;\n        RETURN NEW;\n      END;\n      $$ LANGUAGE plpgsql\n    "]))))];
                case 13:
                    // 6. Create trigger to update conversation timestamp
                    _a.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n      DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON chat_messages\n    "], ["\n      DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON chat_messages\n    "]))))];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n      CREATE TRIGGER trigger_update_conversation_timestamp\n      AFTER INSERT ON chat_messages\n      FOR EACH ROW\n      EXECUTE FUNCTION update_conversation_timestamp()\n    "], ["\n      CREATE TRIGGER trigger_update_conversation_timestamp\n      AFTER INSERT ON chat_messages\n      FOR EACH ROW\n      EXECUTE FUNCTION update_conversation_timestamp()\n    "]))))];
                case 15:
                    _a.sent();
                    console.log('✅ Created trigger for conversation timestamp updates');
                    console.log('✅ Chat system setup complete!');
                    return [2 /*return*/, true];
                case 16:
                    error_1 = _a.sent();
                    console.error('❌ Error setting up chat tables:', error_1);
                    throw error_1;
                case 17: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11;
