"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// Load environment variables first
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
// Force Postgres in production; otherwise prefer Postgres when DATABASE_URL is postgres
const shouldUsePostgres = (process.env.NODE_ENV === 'production' ||
    databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'));
const db_sqlite_1 = require("./db-sqlite");
const db_postgres_1 = require("./db-postgres");
const selectedDb = shouldUsePostgres ? db_postgres_1.db : db_sqlite_1.db;
console.log(shouldUsePostgres ? '🗄️ Using PostgreSQL database' : '📁 Using SQLite database');
exports.db = selectedDb;
