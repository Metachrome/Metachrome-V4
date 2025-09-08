# 🚂 RAILWAY DEPLOYMENT GUIDE - METACHROME V2

## Why Railway is Perfect for Your App

✅ **Runs your Express.js server exactly like local**  
✅ **No code changes needed**  
✅ **Built-in PostgreSQL database**  
✅ **WebSocket support**  
✅ **Persistent sessions**  
✅ **Free tier available**  
✅ **2-minute deployment**  

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Prepare Your Code

1. **Create Railway configuration file**:

Create `railway.toml` in your project root:
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:production"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "always"

[variables]
NODE_ENV = "production"
PORT = "3000"
```

2. **Update package.json scripts**:
```json
{
  "scripts": {
    "start:production": "node server/index.js",
    "build:production": "npm run build && npm run build:server",
    "build:server": "tsc server/index.ts --outDir dist/server --target es2020 --module commonjs"
  }
}
```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your METACHROME repository**
6. **Railway will auto-detect Node.js and start building**

### Step 3: Add Database

1. **In Railway dashboard, click "New"**
2. **Select "Database" → "PostgreSQL"**
3. **Railway will create a database and provide connection URL**
4. **Copy the DATABASE_URL from the database service**

### Step 4: Configure Environment Variables

In Railway dashboard → Your app → Variables tab, add:

```bash
# Database (Railway will provide this)
DATABASE_URL=postgresql://postgres:password@host:port/database

# Security (use your existing values)
JWT_SECRET=de1cc0aaa1cb3baecd3341ea9fcddb7dedfceb3506110bc1acf45ea7b92e18f9
SESSION_SECRET=2aa802cbdb87915ad40707dbe92354740992db6e1b1969e59037d9d51d1f75a9

# Environment
NODE_ENV=production
PORT=3000

# CORS (Railway will provide your domain)
ALLOWED_ORIGINS=https://your-app.railway.app,http://localhost:3000
```

### Step 5: Database Setup

1. **Connect to Railway PostgreSQL**:
   - Use the DATABASE_URL from Railway
   - Run your database migrations

2. **Create admin user** (if needed):
```sql
INSERT INTO users (id, username, email, password, role, balance, status, created_at, updated_at)
VALUES (
  'superadmin-001',
  'superadmin', 
  'superadmin@metachrome.com',
  'superadmin123',
  'super_admin',
  1000000,
  'active',
  NOW(),
  NOW()
);
```

## 🎯 DEPLOYMENT PROCESS

### Automatic Deployment
1. **Push code to GitHub**
2. **Railway automatically deploys**
3. **Check deployment logs**
4. **Test your app**

### Manual Deployment
1. **Railway CLI**: `railway login`
2. **Link project**: `railway link`
3. **Deploy**: `railway up`

## 🧪 TESTING YOUR DEPLOYMENT

After deployment, test:

1. **Admin Login**: `https://your-app.railway.app/admin/dashboard`
   - Username: `superadmin`
   - Password: `superadmin123`

2. **User Dashboard**: `https://your-app.railway.app/dashboard`

3. **API Health**: `https://your-app.railway.app/api/health`

4. **All admin functions**:
   - Balance updates
   - Password changes
   - Wallet management
   - User management

## 💰 PRICING

- **Free Tier**: $5 credit/month (enough for development)
- **Pro Plan**: $20/month (unlimited usage)
- **Database**: Included in both plans

## 🔧 TROUBLESHOOTING

### Build Fails
```bash
# Check build logs in Railway dashboard
# Common fix: ensure all dependencies in package.json
```

### Database Connection Issues
```bash
# Verify DATABASE_URL is correct
# Check if database service is running
```

### App Won't Start
```bash
# Check start command in railway.toml
# Verify PORT environment variable
```

## 🆚 RAILWAY vs VERCEL COMPARISON

| Feature | Railway | Vercel |
|---------|---------|---------|
| Express.js Support | ✅ Perfect | ❌ Requires serverless |
| WebSocket Support | ✅ Yes | ❌ No |
| Persistent Sessions | ✅ Yes | ❌ No |
| Database Included | ✅ PostgreSQL | ❌ External only |
| Real-time Features | ✅ Yes | ❌ Limited |
| Code Changes Needed | ✅ None | ❌ Major refactoring |
| Deployment Time | ✅ 2 minutes | ❌ Hours of debugging |

## 🎉 EXPECTED RESULTS

After Railway deployment:
- ✅ **Exact same functionality as local**
- ✅ **All admin features working**
- ✅ **Real-time updates**
- ✅ **Persistent sessions**
- ✅ **WebSocket support**
- ✅ **No more API errors**

Your app will work **exactly** like your local environment because Railway runs the same Express.js server!
