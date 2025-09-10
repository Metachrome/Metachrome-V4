// Database Integration for simple-start.js
// This module provides database operations for PostgreSQL/SQLite

import postgres from 'postgres';
import bcrypt from 'bcryptjs';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
const isPostgreSQL = DATABASE_URL.startsWith('postgresql://') || DATABASE_URL.startsWith('postgres://');

console.log(`🗄️ Database Integration: ${isPostgreSQL ? 'PostgreSQL' : 'SQLite'}`);

let db;

if (isPostgreSQL) {
  // PostgreSQL connection
  db = postgres(DATABASE_URL);
  console.log('🔗 Connected to PostgreSQL database');
} else {
  // For SQLite, we'll use the existing Drizzle setup
  console.log('📁 Using SQLite database (development)');
}

// Database operations
export const DatabaseService = {
  
  // ===== USER OPERATIONS =====
  
  async getUsers() {
    if (isPostgreSQL) {
      return await db`SELECT * FROM users ORDER BY created_at DESC`;
    } else {
      // Return mock data for SQLite (development)
      return [
        {
          id: 'superadmin-001',
          username: 'superadmin',
          email: 'superadmin@metachrome.io',
          balance: 50000,
          role: 'super_admin',
          status: 'active',
          trading_mode: 'normal',
          created_at: new Date().toISOString()
        }
      ];
    }
  },

  async getUserById(userId) {
    if (isPostgreSQL) {
      const users = await db`SELECT * FROM users WHERE id = ${userId}`;
      return users[0] || null;
    } else {
      // Mock data for development
      if (userId === 'superadmin-001') {
        return {
          id: 'superadmin-001',
          username: 'superadmin',
          email: 'superadmin@metachrome.io',
          balance: 50000,
          role: 'super_admin',
          status: 'active',
          trading_mode: 'normal'
        };
      }
      return null;
    }
  },

  async createUser(userData) {
    if (isPostgreSQL) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const users = await db`
        INSERT INTO users (username, email, password_hash, balance, role, status, trading_mode)
        VALUES (${userData.username}, ${userData.email}, ${hashedPassword}, ${userData.balance || 10000}, ${userData.role || 'user'}, 'active', 'normal')
        RETURNING *
      `;
      return users[0];
    } else {
      // Mock creation for development
      return {
        id: `user-${Date.now()}`,
        username: userData.username,
        email: userData.email,
        balance: userData.balance || 10000,
        role: userData.role || 'user',
        status: 'active',
        trading_mode: 'normal',
        created_at: new Date().toISOString()
      };
    }
  },

  async updateUserBalance(userId, newBalance) {
    if (isPostgreSQL) {
      const users = await db`
        UPDATE users 
        SET balance = ${newBalance}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `;
      return users[0];
    } else {
      // Mock update for development
      return { id: userId, balance: newBalance };
    }
  },

  async updateUserTradingMode(userId, tradingMode) {
    if (isPostgreSQL) {
      const users = await db`
        UPDATE users 
        SET trading_mode = ${tradingMode}, updated_at = NOW()
        WHERE id = ${userId}
        RETURNING *
      `;
      return users[0];
    } else {
      // Mock update for development
      return { id: userId, trading_mode: tradingMode };
    }
  },

  // ===== TRADE OPERATIONS =====

  async getTrades() {
    if (isPostgreSQL) {
      return await db`
        SELECT t.*, u.username 
        FROM trades t 
        LEFT JOIN users u ON t.user_id = u.id 
        ORDER BY t.created_at DESC
      `;
    } else {
      // Return empty array for development
      return [];
    }
  },

  async createTrade(tradeData) {
    if (isPostgreSQL) {
      const trades = await db`
        INSERT INTO trades (
          user_id, symbol, direction, amount, duration, 
          entry_price, status, expires_at, created_at, updated_at
        )
        VALUES (
          ${tradeData.user_id}, ${tradeData.symbol}, ${tradeData.direction}, 
          ${tradeData.amount}, ${tradeData.duration}, ${tradeData.entry_price}, 
          ${tradeData.status}, ${tradeData.expires_at}, NOW(), NOW()
        )
        RETURNING *
      `;
      return trades[0];
    } else {
      // Mock creation for development
      return {
        id: `trade-${Date.now()}`,
        ...tradeData,
        created_at: new Date().toISOString()
      };
    }
  },

  async updateTrade(tradeId, updateData) {
    if (isPostgreSQL) {
      const trades = await db`
        UPDATE trades 
        SET ${db(updateData)}, updated_at = NOW()
        WHERE id = ${tradeId}
        RETURNING *
      `;
      return trades[0];
    } else {
      // Mock update for development
      return { id: tradeId, ...updateData };
    }
  },

  // ===== TRANSACTION OPERATIONS =====

  async createTransaction(transactionData) {
    if (isPostgreSQL) {
      const transactions = await db`
        INSERT INTO transactions (
          user_id, type, amount, symbol, status, description, created_at
        )
        VALUES (
          ${transactionData.user_id}, ${transactionData.type}, ${transactionData.amount},
          ${transactionData.symbol}, ${transactionData.status}, ${transactionData.description}, NOW()
        )
        RETURNING *
      `;
      return transactions[0];
    } else {
      // Mock creation for development
      return {
        id: `tx-${Date.now()}`,
        ...transactionData,
        created_at: new Date().toISOString()
      };
    }
  },

  // ===== DATABASE INITIALIZATION =====

  async initializeDatabase() {
    if (isPostgreSQL) {
      console.log('🔧 Initializing PostgreSQL database...');
      
      // Create tables if they don't exist
      await this.createTables();
      
      // Create default admin users if they don't exist
      await this.createDefaultUsers();
      
      console.log('✅ Database initialization complete');
    } else {
      console.log('📁 SQLite database - no initialization needed');
    }
  },

  async createTables() {
    if (!isPostgreSQL) return;

    try {
      // Create users table
      await db`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          balance DECIMAL(15,2) DEFAULT 10000.00,
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
          trading_mode VARCHAR(20) DEFAULT 'normal' CHECK (trading_mode IN ('win', 'normal', 'lose')),
          wallet_address VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_login TIMESTAMP WITH TIME ZONE
        )
      `;

      // Create trades table
      await db`
        CREATE TABLE IF NOT EXISTS trades (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          symbol VARCHAR(20) NOT NULL,
          direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down', 'buy', 'sell')),
          amount DECIMAL(15,2) NOT NULL,
          duration INTEGER,
          entry_price DECIMAL(15,8),
          exit_price DECIMAL(15,8),
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
          result VARCHAR(10) CHECK (result IN ('win', 'lose', 'pending')),
          profit DECIMAL(15,2),
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create transactions table
      await db`
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          type VARCHAR(20) NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          symbol VARCHAR(10) DEFAULT 'USDT',
          status VARCHAR(20) DEFAULT 'completed',
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
    }
  },

  async createDefaultUsers() {
    if (!isPostgreSQL) return;

    try {
      // Check if superadmin exists
      const existingSuperadmin = await db`SELECT id FROM users WHERE username = 'superadmin'`;
      
      if (existingSuperadmin.length === 0) {
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        await db`
          INSERT INTO users (username, email, password_hash, balance, role, status, trading_mode)
          VALUES ('superadmin', 'superadmin@metachrome.io', ${hashedPassword}, 100000.00, 'super_admin', 'active', 'normal')
        `;
        console.log('✅ Created default superadmin user');
      }

      // Check if admin exists
      const existingAdmin = await db`SELECT id FROM users WHERE username = 'admin'`;
      
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db`
          INSERT INTO users (username, email, password_hash, balance, role, status, trading_mode)
          VALUES ('admin', 'admin@metachrome.io', ${hashedPassword}, 50000.00, 'admin', 'active', 'normal')
        `;
        console.log('✅ Created default admin user');
      }

    } catch (error) {
      console.error('❌ Error creating default users:', error);
    }
  }
};

export default DatabaseService;
