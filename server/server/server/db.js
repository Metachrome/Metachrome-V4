"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// Load environment variables first
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
// Force Postgres in production; otherwise prefer Postgres when DATABASE_URL is postgres
var shouldUsePostgres = (process.env.NODE_ENV === 'production' ||
    databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'));
var db_sqlite_1 = require("./db-sqlite");
var db_postgres_1 = require("./db-postgres");
var selectedDb = shouldUsePostgres ? db_postgres_1.db : db_sqlite_1.db;
console.log(shouldUsePostgres ? '🗄️ Using PostgreSQL database' : '📁 Using SQLite database');
exports.db = selectedDb;
