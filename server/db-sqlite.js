import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema-sqlite";
var databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
var dbPath = databaseUrl.startsWith('file:') ? databaseUrl.slice(5) : databaseUrl;
var sqlite = new Database(dbPath);
export var db = drizzle({ client: sqlite, schema: schema });
