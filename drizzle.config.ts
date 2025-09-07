import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema-sqlite.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './dev.db',
  },
});
