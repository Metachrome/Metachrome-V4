"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestRoute = setupTestRoute;
function setupTestRoute(app) {
    app.get('/api/test-db', async (req, res) => {
        try {
            console.log('🔍 Testing database connection...');
            console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
            console.log('NODE_ENV:', process.env.NODE_ENV);
            const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
            const isPostgreSQL = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');
            console.log('Database type:', isPostgreSQL ? 'PostgreSQL' : 'SQLite');
            console.log('Database URL (first 50 chars):', databaseUrl.substring(0, 50) + '...');
            // Try to import and use the database
            const { db } = await Promise.resolve().then(() => __importStar(require('./db')));
            // Try to query users table
            const users = await db.select().from(db.schema?.users || db.users).limit(5);
            res.json({
                success: true,
                databaseType: isPostgreSQL ? 'PostgreSQL' : 'SQLite',
                databaseUrl: databaseUrl.substring(0, 50) + '...',
                userCount: users.length,
                users: users.map(u => ({ id: u.id, username: u.username, role: u.role })),
                environment: process.env.NODE_ENV
            });
        }
        catch (error) {
            console.error('❌ Database test failed:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
                environment: process.env.NODE_ENV
            });
        }
    });
}
