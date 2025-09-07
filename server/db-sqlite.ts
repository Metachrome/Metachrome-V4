import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema-sqlite";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const dbPath = databaseUrl.startsWith('file:') ? databaseUrl.slice(5) : databaseUrl;
const sqlite = new Database(dbPath);
export const db = drizzle({ client: sqlite, schema });
