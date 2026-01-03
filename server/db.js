// Load environment variables first
import dotenv from "dotenv";
dotenv.config();
var databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
// Force Postgres in production; otherwise prefer Postgres when DATABASE_URL is postgres
var shouldUsePostgres = (process.env.NODE_ENV === 'production' ||
    databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'));
import { db as sqliteDb } from './db-sqlite';
import { db as pgDb, client as pgClient } from './db-postgres';
var selectedDb = shouldUsePostgres ? pgDb : sqliteDb;
console.log(shouldUsePostgres ? '🗄️ Using PostgreSQL database' : '📁 Using SQLite database');
export var db = selectedDb;
export var pgRawClient = shouldUsePostgres ? pgClient : null;
