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
/**
 * Diagnostic script to check if chat tables exist in database
 */
export function checkChatTables() {
    return __awaiter(this, void 0, void 0, function () {
        var conversationsCheck, conversationsExists, messagesCheck, messagesExists, faqCheck, faqExists, convCount, msgCount, faqCount, error_1;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    console.log('🔍 ========================================');
                    console.log('🔍 CHECKING CHAT TABLES IN DATABASE');
                    console.log('🔍 ========================================');
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, db.execute(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT EXISTS (\n        SELECT FROM information_schema.tables \n        WHERE table_schema = 'public' \n        AND table_name = 'chat_conversations'\n      ) as exists\n    "], ["\n      SELECT EXISTS (\n        SELECT FROM information_schema.tables \n        WHERE table_schema = 'public' \n        AND table_name = 'chat_conversations'\n      ) as exists\n    "]))))];
                case 2:
                    conversationsCheck = _k.sent();
                    conversationsExists = (_a = conversationsCheck.rows[0]) === null || _a === void 0 ? void 0 : _a.exists;
                    console.log("\uD83D\uDCCB chat_conversations table: ".concat(conversationsExists ? '✅ EXISTS' : '❌ NOT FOUND'));
                    return [4 /*yield*/, db.execute(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      SELECT EXISTS (\n        SELECT FROM information_schema.tables \n        WHERE table_schema = 'public' \n        AND table_name = 'chat_messages'\n      ) as exists\n    "], ["\n      SELECT EXISTS (\n        SELECT FROM information_schema.tables \n        WHERE table_schema = 'public' \n        AND table_name = 'chat_messages'\n      ) as exists\n    "]))))];
                case 3:
                    messagesCheck = _k.sent();
                    messagesExists = (_b = messagesCheck.rows[0]) === null || _b === void 0 ? void 0 : _b.exists;
                    console.log("\uD83D\uDCAC chat_messages table: ".concat(messagesExists ? '✅ EXISTS' : '❌ NOT FOUND'));
                    return [4 /*yield*/, db.execute(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      SELECT EXISTS (\n        SELECT FROM information_schema.tables \n        WHERE table_schema = 'public' \n        AND table_name = 'chat_faq'\n      ) as exists\n    "], ["\n      SELECT EXISTS (\n        SELECT FROM information_schema.tables \n        WHERE table_schema = 'public' \n        AND table_name = 'chat_faq'\n      ) as exists\n    "]))))];
                case 4:
                    faqCheck = _k.sent();
                    faqExists = (_c = faqCheck.rows[0]) === null || _c === void 0 ? void 0 : _c.exists;
                    console.log("\u2753 chat_faq table: ".concat(faqExists ? '✅ EXISTS' : '❌ NOT FOUND'));
                    if (!(conversationsExists && messagesExists && faqExists)) return [3 /*break*/, 8];
                    return [4 /*yield*/, db.execute(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT COUNT(*) as count FROM chat_conversations"], ["SELECT COUNT(*) as count FROM chat_conversations"]))))];
                case 5:
                    convCount = _k.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SELECT COUNT(*) as count FROM chat_messages"], ["SELECT COUNT(*) as count FROM chat_messages"]))))];
                case 6:
                    msgCount = _k.sent();
                    return [4 /*yield*/, db.execute(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["SELECT COUNT(*) as count FROM chat_faq"], ["SELECT COUNT(*) as count FROM chat_faq"]))))];
                case 7:
                    faqCount = _k.sent();
                    console.log('📊 ========================================');
                    console.log('📊 RECORD COUNTS');
                    console.log('📊 ========================================');
                    console.log("\uD83D\uDCCB Conversations: ".concat(((_d = convCount.rows[0]) === null || _d === void 0 ? void 0 : _d.count) || 0));
                    console.log("\uD83D\uDCAC Messages: ".concat(((_e = msgCount.rows[0]) === null || _e === void 0 ? void 0 : _e.count) || 0));
                    console.log("\u2753 FAQs: ".concat(((_f = faqCount.rows[0]) === null || _f === void 0 ? void 0 : _f.count) || 0));
                    return [2 /*return*/, {
                            allTablesExist: true,
                            counts: {
                                conversations: parseInt(((_g = convCount.rows[0]) === null || _g === void 0 ? void 0 : _g.count) || '0'),
                                messages: parseInt(((_h = msgCount.rows[0]) === null || _h === void 0 ? void 0 : _h.count) || '0'),
                                faqs: parseInt(((_j = faqCount.rows[0]) === null || _j === void 0 ? void 0 : _j.count) || '0')
                            }
                        }];
                case 8:
                    console.log('❌ ========================================');
                    console.log('❌ MISSING TABLES DETECTED!');
                    console.log('❌ ========================================');
                    console.log('❌ Please run CHAT_SYSTEM_QUICK_FIX.sql in Supabase SQL Editor');
                    return [2 /*return*/, {
                            allTablesExist: false,
                            missingTables: [
                                !conversationsExists && 'chat_conversations',
                                !messagesExists && 'chat_messages',
                                !faqExists && 'chat_faq'
                            ].filter(Boolean)
                        }];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _k.sent();
                    console.error('❌ Error checking chat tables:', error_1);
                    throw error_1;
                case 11: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
