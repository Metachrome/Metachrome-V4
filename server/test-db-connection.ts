import express from 'express';

export function setupTestRoute(app: express.Application) {
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
      const { db } = await import('./db');
      
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
      
    } catch (error) {
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
