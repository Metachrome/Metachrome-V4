"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = exports.createTransaction = exports.updateTradingSettings = exports.getTradingSettings = exports.getAllTrades = exports.updateTrade = exports.createTrade = exports.deleteUser = exports.getAllUsers = exports.updateUser = exports.createUser = exports.getUserByUsername = exports.getUserById = exports.initializeDatabase = exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
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
const initializeDatabase = async () => {
    const { error } = await exports.supabaseAdmin.rpc('initialize_metachrome_schema');
    if (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
    return true;
};
exports.initializeDatabase = initializeDatabase;
// Helper functions
const getUserById = async (id) => {
    const { data, error } = await exports.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
    if (error)
        return null;
    return data;
};
exports.getUserById = getUserById;
const getUserByUsername = async (username) => {
    const { data, error } = await exports.supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    if (error)
        return null;
    return data;
};
exports.getUserByUsername = getUserByUsername;
const createUser = async (userData) => {
    const { data, error } = await exports.supabaseAdmin
        .from('users')
        .insert([{
            ...userData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }])
        .select()
        .single();
    if (error) {
        console.error('Create user error:', error);
        return null;
    }
    return data;
};
exports.createUser = createUser;
const updateUser = async (id, updates) => {
    const { data, error } = await exports.supabaseAdmin
        .from('users')
        .update({
        ...updates,
        updated_at: new Date().toISOString()
    })
        .eq('id', id)
        .select()
        .single();
    if (error) {
        console.error('Update user error:', error);
        return null;
    }
    return data;
};
exports.updateUser = updateUser;
const getAllUsers = async () => {
    const { data, error } = await exports.supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Get all users error:', error);
        return [];
    }
    return data || [];
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (id) => {
    const { error } = await exports.supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Delete user error:', error);
        return false;
    }
    return true;
};
exports.deleteUser = deleteUser;
const createTrade = async (tradeData) => {
    const { data, error } = await exports.supabase
        .from('trades')
        .insert([{
            ...tradeData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }])
        .select()
        .single();
    if (error) {
        console.error('Create trade error:', error);
        return null;
    }
    return data;
};
exports.createTrade = createTrade;
const updateTrade = async (id, updates) => {
    const { data, error } = await exports.supabase
        .from('trades')
        .update({
        ...updates,
        updated_at: new Date().toISOString()
    })
        .eq('id', id)
        .select()
        .single();
    if (error) {
        console.error('Update trade error:', error);
        return null;
    }
    return data;
};
exports.updateTrade = updateTrade;
const getAllTrades = async () => {
    const { data, error } = await exports.supabaseAdmin
        .from('trades')
        .select(`
      *,
      users!inner(username)
    `)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Get all trades error:', error);
        return [];
    }
    return data || [];
};
exports.getAllTrades = getAllTrades;
const getTradingSettings = async () => {
    const { data, error } = await exports.supabase
        .from('trading_settings')
        .select('*')
        .order('duration', { ascending: true });
    if (error) {
        console.error('Get trading settings error:', error);
        return [];
    }
    return data || [];
};
exports.getTradingSettings = getTradingSettings;
const updateTradingSettings = async (id, updates) => {
    const { data, error } = await exports.supabaseAdmin
        .from('trading_settings')
        .update({
        ...updates,
        updated_at: new Date().toISOString()
    })
        .eq('id', id)
        .select()
        .single();
    if (error) {
        console.error('Update trading settings error:', error);
        return null;
    }
    return data;
};
exports.updateTradingSettings = updateTradingSettings;
const createTransaction = async (transactionData) => {
    const { data, error } = await exports.supabase
        .from('transactions')
        .insert([{
            ...transactionData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }])
        .select()
        .single();
    if (error) {
        console.error('Create transaction error:', error);
        return null;
    }
    return data;
};
exports.createTransaction = createTransaction;
const getAllTransactions = async () => {
    const { data, error } = await exports.supabaseAdmin
        .from('transactions')
        .select(`
      *,
      users!inner(username)
    `)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Get all transactions error:', error);
        return [];
    }
    return data || [];
};
exports.getAllTransactions = getAllTransactions;
