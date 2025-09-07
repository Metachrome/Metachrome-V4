// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

// Force Postgres in production; otherwise prefer Postgres when DATABASE_URL is postgres
const shouldUsePostgres = (
  process.env.NODE_ENV === 'production' ||
  databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')
);

import { db as sqliteDb } from './db-sqlite';
import { db as pgDb } from './db-postgres';

const selectedDb = shouldUsePostgres ? pgDb : sqliteDb;
console.log(shouldUsePostgres ? '🗄️ Using PostgreSQL database' : '📁 Using SQLite database');

export const db = selectedDb;