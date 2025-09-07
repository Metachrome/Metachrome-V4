# 🚀 Vercel Deployment Guide for CryptoTradeX

## 🚨 Current Issues & Solutions

### 1. **Database Configuration**
**Problem**: Using SQLite in production (not supported in Vercel serverless)
**Solution**: Set up PostgreSQL database

#### Required Environment Variables in Vercel:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
SESSION_SECRET=your-session-secret-key-here-min-32-chars
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://www.your-domain.com
```

### 2. **Database Setup Options**

#### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Your Project → Storage
2. Create a new Postgres database
3. Copy the connection string to `DATABASE_URL`

#### Option B: External PostgreSQL (Neon, Supabase, etc.)
1. Create a PostgreSQL database on Neon.tech or Supabase
2. Get the connection string
3. Add to Vercel environment variables

### 3. **Session Storage Issue**
**Problem**: Express sessions don't persist in serverless
**Solution**: Use JWT tokens for authentication (already implemented)

### 4. **CORS Configuration**
**Problem**: Vercel domain not in allowed origins
**Solution**: Add your Vercel domain to ALLOWED_ORIGINS

## 🔧 **Quick Fix Steps**

### Step 1: Update Database Configuration
The app needs to use PostgreSQL in production. Update your Vercel environment variables:

1. **DATABASE_URL**: Your PostgreSQL connection string
2. **JWT_SECRET**: A secure random string (min 32 characters)
3. **SESSION_SECRET**: Another secure random string
4. **ALLOWED_ORIGINS**: Your Vercel domain

### Step 2: Database Schema Migration
After setting up PostgreSQL, you need to push the schema:

```bash
# Run this locally with your production DATABASE_URL
npm run db:push
```

### Step 3: Seed Admin User
Create the admin user in your production database:

```bash
# Run this with production DATABASE_URL
npx tsx create-admin.ts
```

## 🎯 **Environment Variables Template**

Copy this to your Vercel environment variables:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-here-must-be-at-least-32-characters-long
SESSION_SECRET=your-session-secret-key-here-must-be-at-least-32-characters-long
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔍 **Testing Authentication**

After deployment:

1. **User Login**: 
   - Username: `trader1`
   - Password: `password123`

2. **Admin Login**:
   - Username: `admin` 
   - Password: `admin123`

## 🐛 **Debugging Steps**

If login still fails:

1. Check Vercel Function Logs for errors
2. Verify DATABASE_URL is set correctly
3. Ensure database schema is pushed
4. Confirm admin user exists in production database
5. Check CORS origins include your domain

## 📝 **Common Errors & Solutions**

### Error: "DATABASE_URL must be set in production"
- **Solution**: Add DATABASE_URL to Vercel environment variables

### Error: "Invalid credentials" 
- **Solution**: Run the admin user creation script with production DATABASE_URL

### Error: "CORS error"
- **Solution**: Add your Vercel domain to ALLOWED_ORIGINS

### Error: "Internal server error"
- **Solution**: Check Vercel function logs for specific error details
