/**
 * Migration: Create admin_activity_logs table
 * This migration creates the activity logs table in Railway PostgreSQL database
 * Run automatically on server startup if table doesn't exist
 */
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
import { supabaseAdmin } from '../../lib/supabase';
export function createActivityLogsTable() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, tables, checkError, createTableSQL, createError, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!supabaseAdmin) {
                        console.warn('⚠️ Supabase admin client not available, skipping activity logs table creation');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    console.log('🔄 Checking if admin_activity_logs table exists...');
                    return [4 /*yield*/, supabaseAdmin
                            .from('admin_activity_logs')
                            .select('id')
                            .limit(1)];
                case 2:
                    _a = _b.sent(), tables = _a.data, checkError = _a.error;
                    if (!checkError) {
                        console.log('✅ admin_activity_logs table already exists');
                        return [2 /*return*/];
                    }
                    // Table doesn't exist, create it
                    console.log('📝 Creating admin_activity_logs table...');
                    createTableSQL = "\n      -- Create admin_activity_logs table to track all admin activities\n      CREATE TABLE IF NOT EXISTS admin_activity_logs (\n        id SERIAL PRIMARY KEY,\n        \n        -- Admin who performed the action\n        admin_id UUID NOT NULL,\n        admin_username VARCHAR(255) NOT NULL,\n        admin_email VARCHAR(255),\n        \n        -- Action details\n        action_type VARCHAR(100) NOT NULL,\n        action_category VARCHAR(50) NOT NULL,\n        action_description TEXT NOT NULL,\n        \n        -- Target user (if applicable)\n        target_user_id UUID,\n        target_username VARCHAR(255),\n        target_email VARCHAR(255),\n        \n        -- Action metadata (JSON for flexibility)\n        metadata JSONB DEFAULT '{}',\n        \n        -- Timestamps\n        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n        \n        -- IP address and user agent for security\n        ip_address VARCHAR(45),\n        user_agent TEXT,\n        \n        -- Prevent deletion\n        is_deleted BOOLEAN DEFAULT FALSE,\n        \n        CONSTRAINT fk_admin\n          FOREIGN KEY(admin_id) \n          REFERENCES users(id)\n          ON DELETE SET NULL\n      );\n\n      -- Create indexes for better query performance\n      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);\n      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_user_id ON admin_activity_logs(target_user_id);\n      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);\n      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_category ON admin_activity_logs(action_category);\n      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);\n      CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_metadata ON admin_activity_logs USING GIN (metadata);\n    ";
                    return [4 /*yield*/, supabaseAdmin.rpc('exec_sql', { sql: createTableSQL })];
                case 3:
                    createError = (_b.sent()).error;
                    if (createError) {
                        console.error('❌ Failed to create admin_activity_logs table:', createError);
                        throw createError;
                    }
                    console.log('✅ admin_activity_logs table created successfully!');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.error('❌ Error in createActivityLogsTable migration:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Alternative method: Create table using raw SQL query
 * Use this if RPC method doesn't work
 */
export function createActivityLogsTableRaw() {
    return __awaiter(this, void 0, void 0, function () {
        var testError, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!supabaseAdmin) {
                        console.warn('⚠️ Supabase admin client not available');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log('🔄 Creating admin_activity_logs table (raw SQL method)...');
                    return [4 /*yield*/, supabaseAdmin
                            .from('admin_activity_logs')
                            .select('id')
                            .limit(1)];
                case 2:
                    testError = (_a.sent()).error;
                    if (!testError) {
                        console.log('✅ admin_activity_logs table already exists');
                        return [2 /*return*/];
                    }
                    console.log('⚠️ Table does not exist. Please create it manually using Railway dashboard or CLI.');
                    console.log('📄 SQL script location: CREATE_ADMIN_ACTIVITY_LOGS_TABLE.sql');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('❌ Error checking admin_activity_logs table:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
