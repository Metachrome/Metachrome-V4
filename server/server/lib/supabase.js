"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = exports.createTransaction = exports.updateTradingSettings = exports.getTradingSettings = exports.getAllTrades = exports.updateTrade = exports.createTrade = exports.getAllUsers = exports.updateUser = exports.createUser = exports.getUserByUsername = exports.getUserById = exports.initializeDatabase = exports.supabaseAdmin = exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
// Debug logging for environment variables
console.log('🔧 Supabase Configuration:', {
    url: supabaseUrl ? 'configured' : 'missing',
    anonKey: supabaseAnonKey ? 'configured' : 'missing',
    serviceKey: supabaseServiceKey ? 'configured' : 'missing',
    environment: process.env.NODE_ENV
});
// Client for frontend operations
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
// Admin client for backend operations
exports.supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;
// Database initialization SQL
var initializeDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.supabaseAdmin.rpc('initialize_metachrome_schema')];
            case 1:
                error = (_a.sent()).error;
                if (error) {
                    console.error('Database initialization error:', error);
                    throw error;
                }
                return [2 /*return*/, true];
        }
    });
}); };
exports.initializeDatabase = initializeDatabase;
// Helper functions
var getUserById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabase
                    .from('users')
                    .select('*')
                    .eq('id', id)
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    return [2 /*return*/, null];
                return [2 /*return*/, data];
        }
    });
}); };
exports.getUserById = getUserById;
var getUserByUsername = function (username) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabase
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error)
                    return [2 /*return*/, null];
                return [2 /*return*/, data];
        }
    });
}); };
exports.getUserByUsername = getUserByUsername;
var createUser = function (userData) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabaseAdmin
                    .from('users')
                    .insert([__assign(__assign({}, userData), { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })])
                    .select()
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Create user error:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.createUser = createUser;
var updateUser = function (id, updates) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabaseAdmin
                    .from('users')
                    .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                    .eq('id', id)
                    .select()
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Update user error:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.updateUser = updateUser;
var getAllUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabaseAdmin
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Get all users error:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, data || []];
        }
    });
}); };
exports.getAllUsers = getAllUsers;
var createTrade = function (tradeData) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabase
                    .from('trades')
                    .insert([__assign(__assign({}, tradeData), { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })])
                    .select()
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Create trade error:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.createTrade = createTrade;
var updateTrade = function (id, updates) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabase
                    .from('trades')
                    .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                    .eq('id', id)
                    .select()
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Update trade error:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.updateTrade = updateTrade;
var getAllTrades = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabaseAdmin
                    .from('trades')
                    .select("\n      *,\n      users!inner(username)\n    ")
                    .order('created_at', { ascending: false })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Get all trades error:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, data || []];
        }
    });
}); };
exports.getAllTrades = getAllTrades;
var getTradingSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabase
                    .from('trading_settings')
                    .select('*')
                    .order('duration', { ascending: true })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Get trading settings error:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, data || []];
        }
    });
}); };
exports.getTradingSettings = getTradingSettings;
var updateTradingSettings = function (id, updates) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabaseAdmin
                    .from('trading_settings')
                    .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                    .eq('id', id)
                    .select()
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Update trading settings error:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.updateTradingSettings = updateTradingSettings;
var createTransaction = function (transactionData) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabase
                    .from('transactions')
                    .insert([__assign(__assign({}, transactionData), { id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })])
                    .select()
                    .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Create transaction error:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, data];
        }
    });
}); };
exports.createTransaction = createTransaction;
var getAllTransactions = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.supabaseAdmin
                    .from('transactions')
                    .select("\n      *,\n      users!inner(username)\n    ")
                    .order('created_at', { ascending: false })];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Get all transactions error:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/, data || []];
        }
    });
}); };
exports.getAllTransactions = getAllTransactions;
