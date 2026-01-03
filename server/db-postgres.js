import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
var databaseUrl = process.env.DATABASE_URL;
export var client = postgres(databaseUrl);
export var db = drizzle(client, { schema: schema });
