import { createClient } from '@supabase/supabase-js';

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
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database Types
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  balance: number;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'banned';
  trading_mode: 'win' | 'normal' | 'lose';
  restrictions: string[]; // JSON array of restrictions
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  direction: 'up' | 'down';
  duration: number;
  entry_price: number;
  exit_price?: number;
  result?: 'win' | 'lose' | 'pending';
  profit?: number;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'trade_win' | 'trade_loss' | 'bonus';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TradingSettings {
  id: string;
  duration: number;
  min_amount: number;
  profit_percentage: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Database initialization SQL
export const initializeDatabase = async () => {
  const { error } = await supabaseAdmin.rpc('initialize_metachrome_schema');
  if (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
  return true;
};

// Helper functions
export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error) return null;
  return data;
};

export const createUser = async (userData: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabaseAdmin
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

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabaseAdmin
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

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Get all users error:', error);
    return [];
  }
  return data || [];
};

export const createTrade = async (tradeData: Partial<Trade>): Promise<Trade | null> => {
  const { data, error } = await supabase
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

export const updateTrade = async (id: string, updates: Partial<Trade>): Promise<Trade | null> => {
  const { data, error } = await supabase
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

export const getAllTrades = async (): Promise<Trade[]> => {
  const { data, error } = await supabaseAdmin
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

export const getTradingSettings = async (): Promise<TradingSettings[]> => {
  const { data, error } = await supabase
    .from('trading_settings')
    .select('*')
    .order('duration', { ascending: true });
  
  if (error) {
    console.error('Get trading settings error:', error);
    return [];
  }
  return data || [];
};

export const updateTradingSettings = async (id: string, updates: Partial<TradingSettings>): Promise<TradingSettings | null> => {
  const { data, error } = await supabaseAdmin
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

export const createTransaction = async (transactionData: Partial<Transaction>): Promise<Transaction | null> => {
  const { data, error } = await supabase
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

export const getAllTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabaseAdmin
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
