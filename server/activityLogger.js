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
import { supabaseAdmin } from '../lib/supabase';
import { db } from './db';
import { adminActivityLogs } from '@shared/schema';
/**
 * Log admin activity to the local database (Drizzle/PostgreSQL)
 */
function logToLocalDatabase(data) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!db) {
                        console.warn('⚠️ Local database not available');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, db.insert(adminActivityLogs).values({
                            adminId: data.adminId,
                            adminUsername: data.adminUsername,
                            adminEmail: data.adminEmail || null,
                            actionType: data.actionType,
                            actionCategory: data.actionCategory,
                            actionDescription: data.actionDescription,
                            targetUserId: data.targetUserId || null,
                            targetUsername: data.targetUsername || null,
                            targetEmail: data.targetEmail || null,
                            metadata: data.metadata || {},
                            ipAddress: data.ipAddress || null,
                            userAgent: data.userAgent || null,
                            isDeleted: false,
                        })];
                case 1:
                    _a.sent();
                    console.log('✅ Activity logged to local DB:', {
                        admin: data.adminUsername,
                        action: data.actionType,
                        target: data.targetUsername || 'N/A',
                    });
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Failed to log to local database:', error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Log admin activity to Supabase
 */
function logToSupabase(data) {
    return __awaiter(this, void 0, void 0, function () {
        var error, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!supabaseAdmin) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, supabaseAdmin
                            .from('admin_activity_logs')
                            .insert({
                            admin_id: data.adminId,
                            admin_username: data.adminUsername,
                            admin_email: data.adminEmail,
                            action_type: data.actionType,
                            action_category: data.actionCategory,
                            action_description: data.actionDescription,
                            target_user_id: data.targetUserId,
                            target_username: data.targetUsername,
                            target_email: data.targetEmail,
                            metadata: data.metadata || {},
                            ip_address: data.ipAddress,
                            user_agent: data.userAgent,
                            is_deleted: false,
                        })];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('❌ Supabase activity log error:', error);
                        return [2 /*return*/, false];
                    }
                    console.log('✅ Activity logged to Supabase:', {
                        admin: data.adminUsername,
                        action: data.actionType,
                        target: data.targetUsername || 'N/A',
                    });
                    return [2 /*return*/, true];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ Failed to log to Supabase:', error_2);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Log admin activity to the database
 * This creates an immutable audit trail of all admin actions
 * Tries local DB first, then Supabase as fallback
 */
export function logAdminActivity(data) {
    return __awaiter(this, void 0, void 0, function () {
        var localSuccess, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, logToLocalDatabase(data)];
                case 1:
                    localSuccess = _a.sent();
                    if (!(!localSuccess && supabaseAdmin)) return [3 /*break*/, 3];
                    return [4 /*yield*/, logToSupabase(data)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    // Log error but don't throw - we don't want logging failures to break the main operation
                    console.error('❌ Failed to log activity:', error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extract IP address and user agent from request
 */
export function extractRequestMetadata(req) {
    var _a, _b;
    var ipAddress = ((_b = (_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) === null || _b === void 0 ? void 0 : _b.trim())
        || req.headers['x-real-ip']
        || req.socket.remoteAddress
        || undefined;
    var userAgent = req.headers['user-agent'] || undefined;
    return { ipAddress: ipAddress, userAgent: userAgent };
}
/**
 * Helper to create activity log from request with admin user
 */
export function logAdminActivityFromRequest(req, actionType, actionCategory, actionDescription, targetUser, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var admin, _a, ipAddress, userAgent;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    admin = req.user;
                    if (!admin) {
                        console.warn('⚠️ Cannot log activity: No admin user in request');
                        return [2 /*return*/];
                    }
                    _a = extractRequestMetadata(req), ipAddress = _a.ipAddress, userAgent = _a.userAgent;
                    return [4 /*yield*/, logAdminActivity({
                            adminId: admin.id,
                            adminUsername: admin.username || admin.email || 'Unknown Admin',
                            adminEmail: admin.email,
                            actionType: actionType,
                            actionCategory: actionCategory,
                            actionDescription: actionDescription,
                            targetUserId: targetUser === null || targetUser === void 0 ? void 0 : targetUser.id,
                            targetUsername: targetUser === null || targetUser === void 0 ? void 0 : targetUser.username,
                            targetEmail: targetUser === null || targetUser === void 0 ? void 0 : targetUser.email,
                            metadata: metadata,
                            ipAddress: ipAddress,
                            userAgent: userAgent,
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Action type constants for consistency
export var ActionTypes = {
    // Trading controls
    TRADING_CONTROL_SET: 'TRADING_CONTROL_SET',
    TRADING_CONTROL_REMOVED: 'TRADING_CONTROL_REMOVED',
    // Balance management
    BALANCE_UPDATED: 'BALANCE_UPDATED',
    BALANCE_ADDED: 'BALANCE_ADDED',
    BALANCE_SUBTRACTED: 'BALANCE_SUBTRACTED',
    // Verification
    VERIFICATION_APPROVED: 'VERIFICATION_APPROVED',
    VERIFICATION_REJECTED: 'VERIFICATION_REJECTED',
    // Transactions
    DEPOSIT_APPROVED: 'DEPOSIT_APPROVED',
    DEPOSIT_REJECTED: 'DEPOSIT_REJECTED',
    WITHDRAWAL_APPROVED: 'WITHDRAWAL_APPROVED',
    WITHDRAWAL_REJECTED: 'WITHDRAWAL_REJECTED',
    // User management
    USER_CREATED: 'USER_CREATED',
    USER_UPDATED: 'USER_UPDATED',
    USER_DELETED: 'USER_DELETED',
    USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
    USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
    USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
    // Chat
    CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT',
    CHAT_CONVERSATION_ASSIGNED: 'CHAT_CONVERSATION_ASSIGNED',
    // Redeem codes
    REDEEM_CODE_CREATED: 'REDEEM_CODE_CREATED',
    REDEEM_CODE_UPDATED: 'REDEEM_CODE_UPDATED',
    REDEEM_CODE_DELETED: 'REDEEM_CODE_DELETED',
};
export var ActionCategories = {
    TRADING: 'TRADING',
    BALANCE: 'BALANCE',
    VERIFICATION: 'VERIFICATION',
    TRANSACTIONS: 'TRANSACTIONS',
    USER_MANAGEMENT: 'USER_MANAGEMENT',
    CHAT: 'CHAT',
    REDEEM_CODES: 'REDEEM_CODES',
    SYSTEM: 'SYSTEM',
};
