# 🚀 Metradex Setup Guide - Duplicate dari Metachrome

## Overview
Panduan lengkap untuk menduplikasi Metachrome menjadi Metradex dengan branding baru.

---

## Step 1: Copy Project Files

### Manual Copy (Recommended)
1. Buka File Explorer
2. Copy folder `Metachrome-V2-main` 
3. Paste di lokasi yang sama
4. Rename folder menjadi `Metradex`
5. Delete folder berikut di dalam `Metradex`:
   - `node_modules`
   - `dist`
   - `.next`
   - `build`
   - `.git` (PENTING! Agar tidak conflict dengan repo Metachrome)

### Atau via PowerShell
```powershell
# Dari parent directory
cd "C:\Users\Amanda A. Soenoko\Downloads\Metachrome-V2-main"

# Copy folder (exclude node_modules, .git, dll)
robocopy "Metachrome-V2-main" "Metradex" /E /XD node_modules .git dist .next build

# Masuk ke folder Metradex
cd Metradex
```

---

## Step 2: Initialize Git Repository Baru

```bash
cd Metradex

# Initialize git baru
git init

# Create .gitignore
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore

# First commit
git add .
git commit -m "Initial commit - Metradex (forked from Metachrome)"
```

---

## Step 3: Rebrand - Find & Replace

### Files yang perlu di-update:

#### 1. **package.json**
```json
{
  "name": "metradex",
  "description": "Metradex - Advanced Crypto Trading Platform",
  "version": "1.0.0"
}
```

#### 2. **client/index.html**
```html
<title>Metradex - Advanced Crypto Trading</title>
<meta name="description" content="Metradex - Professional cryptocurrency trading platform">
```

#### 3. **client/src/App.tsx** atau **client/src/main.tsx**
- Search: "Metachrome"
- Replace: "Metradex"

#### 4. **Logo & Branding Files**
- `client/public/logo.png` → Replace dengan logo Metradex
- `client/public/favicon.ico` → Replace dengan favicon Metradex
- `client/src/assets/` → Replace semua logo images

#### 5. **Environment Variables (.env)**
```env
# Metradex Environment Variables
VITE_APP_NAME=Metradex
VITE_APP_TITLE=Metradex - Advanced Crypto Trading

# Supabase (NEW DATABASE!)
SUPABASE_URL=https://your-new-project.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-key

# Railway (NEW DEPLOYMENT!)
RAILWAY_PROJECT_ID=your-new-project-id
```

---

## Step 4: Setup Supabase Database Baru

### 4.1 Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: `metradex-production`
4. Database Password: (generate strong password)
5. Region: Southeast Asia (Singapore)
6. Click "Create new project"

### 4.2 Run Database Schema
Copy schema dari Metachrome:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(18, 8) DEFAULT 0,
  wallet_address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  symbol VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  entry_price DECIMAL(18, 8),
  exit_price DECIMAL(18, 8),
  profit DECIMAL(18, 8),
  result VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  duration INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  tx_hash VARCHAR(255),
  wallet_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
```

### 4.3 Get API Keys
1. Go to Project Settings → API
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key
3. Update `.env` file

---

## Step 5: Update Configuration Files

### working-server.js
```javascript
// Update Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-metradex-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-new-key';
```

---

## Step 6: Deploy to Railway

### 6.1 Create New Railway Project
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect to your NEW Metradex GitHub repo
5. Name: `metradex-production`

### 6.2 Add Environment Variables
Add all variables from `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`
- `PORT=3000`

### 6.3 Deploy
Railway will auto-deploy. Get your URL:
```
https://metradex-production.up.railway.app
```

---

## Step 7: Testing

### Test Checklist:
- [ ] Homepage loads with "Metradex" branding
- [ ] Logo shows Metradex logo
- [ ] User registration works
- [ ] User login works
- [ ] Trading functionality works
- [ ] Balance updates correctly
- [ ] Transactions work
- [ ] Admin panel accessible

---

## Step 8: Custom Domain (Optional)

### Setup Custom Domain
1. Buy domain: `metradex.com` (or similar)
2. In Railway:
   - Settings → Domains
   - Add custom domain
   - Update DNS records:
     ```
     Type: CNAME
     Name: @
     Value: your-railway-url.up.railway.app
     ```

---

## Files to Rebrand (Complete List)

```
✅ package.json - name, description
✅ client/index.html - title, meta tags
✅ client/src/App.tsx - app name
✅ client/src/components/Header.tsx - logo, title
✅ client/src/components/Footer.tsx - copyright
✅ client/public/logo.png - replace image
✅ client/public/favicon.ico - replace icon
✅ README.md - project description
✅ .env - environment variables
✅ working-server.js - server config
```

---

## Quick Rebrand Script

Saya akan buat script untuk auto-replace semua "Metachrome" → "Metradex"!

---

## Support

Jika ada masalah:
1. Check Railway logs
2. Check Supabase logs
3. Check browser console
4. Verify environment variables

---

**Ready to start? Let me know and I'll help you through each step!** 🚀

