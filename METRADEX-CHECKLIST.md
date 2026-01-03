# ✅ Metradex Setup Checklist

## Phase 1: Copy & Setup Project

### 1.1 Copy Project Files
- [ ] Copy folder `Metachrome-V2-main` ke `Metradex`
- [ ] Delete `node_modules` folder
- [ ] Delete `.git` folder (penting!)
- [ ] Delete `dist`, `build`, `.next` folders

**Command:**
```powershell
# Dari parent directory
cd "C:\Users\Amanda A. Soenoko\Downloads\Metachrome-V2-main"
robocopy "Metachrome-V2-main" "Metradex" /E /XD node_modules .git dist .next build
cd Metradex
```

---

## Phase 2: Rebrand to Metradex

### 2.1 Run Rebranding Script
- [ ] Copy `rebrand-to-metradex.ps1` ke folder Metradex
- [ ] Run script:
```powershell
cd Metradex
.\rebrand-to-metradex.ps1
```

### 2.2 Manual Branding Updates
- [ ] Replace `client/public/logo.png` dengan logo Metradex
- [ ] Replace `client/public/favicon.ico` dengan favicon Metradex
- [ ] Replace logo di `client/src/assets/` (jika ada)
- [ ] Update `README.md` dengan deskripsi Metradex

---

## Phase 3: Setup Supabase Database

### 3.1 Create New Supabase Project
- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Project name: `metradex-production`
- [ ] Database password: (save securely!)
- [ ] Region: Southeast Asia (Singapore)
- [ ] Click "Create new project"
- [ ] Wait for project to be ready (~2 minutes)

### 3.2 Run Database Schema
- [ ] Go to SQL Editor in Supabase
- [ ] Copy schema dari `METRADEX-SETUP-GUIDE.md`
- [ ] Run SQL to create tables:
  - [ ] `users` table
  - [ ] `trades` table
  - [ ] `transactions` table
  - [ ] `bonus_codes` table (optional)
  - [ ] `referrals` table (optional)
- [ ] Verify tables created successfully

### 3.3 Get API Keys
- [ ] Go to Project Settings → API
- [ ] Copy `Project URL`
- [ ] Copy `anon` public key
- [ ] Copy `service_role` secret key
- [ ] Save keys securely

---

## Phase 4: Update Environment Variables

### 4.1 Create .env File
- [ ] Create `.env` file di root Metradex folder
- [ ] Add Supabase credentials:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
PORT=3000
```

### 4.2 Update Client .env
- [ ] Create `client/.env` file
- [ ] Add:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=Metradex
```

---

## Phase 5: Setup GitHub Repository

### 5.1 Create New GitHub Repo
- [ ] Go to https://github.com/new
- [ ] Repository name: `Metradex`
- [ ] Description: "Metradex - Advanced Crypto Trading Platform"
- [ ] Visibility: Private (recommended)
- [ ] Click "Create repository"

### 5.2 Push Code to GitHub
```bash
cd Metradex

# Initialize git (if not done by script)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/Metradex.git

# Push code
git branch -M main
git push -u origin main
```

- [ ] Verify code pushed successfully
- [ ] Check all files are there

---

## Phase 6: Deploy to Railway

### 6.1 Create Railway Project
- [ ] Go to https://railway.app/dashboard
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Select your `Metradex` repository
- [ ] Click "Deploy Now"

### 6.2 Configure Environment Variables
- [ ] Go to Variables tab
- [ ] Add all environment variables:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3000`
  - [ ] `SESSION_SECRET` (generate random string)

### 6.3 Configure Build Settings
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `node working-server.js`
- [ ] Root Directory: `/`

### 6.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment (~3-5 minutes)
- [ ] Get deployment URL: `https://metradex-production.up.railway.app`

---

## Phase 7: Testing

### 7.1 Basic Functionality
- [ ] Open deployment URL
- [ ] Verify homepage loads
- [ ] Check "Metradex" branding appears
- [ ] Check logo displays correctly

### 7.2 User Registration
- [ ] Click "Sign Up"
- [ ] Create test account
- [ ] Verify email/username validation
- [ ] Verify account created in Supabase

### 7.3 User Login
- [ ] Login with test account
- [ ] Verify redirect to dashboard
- [ ] Check balance displays

### 7.4 Trading Functionality
- [ ] Create a test trade
- [ ] Verify trade appears in active trades
- [ ] Wait for trade to complete
- [ ] Verify balance updates correctly
- [ ] Check trade limit (max 3 trades)
- [ ] Test spam-click protection

### 7.5 Transactions
- [ ] Test deposit request
- [ ] Test withdrawal request
- [ ] Verify transactions appear in history

### 7.6 Admin Panel
- [ ] Login as admin
- [ ] Verify admin dashboard accessible
- [ ] Check user management
- [ ] Check trade management

---

## Phase 8: Custom Domain (Optional)

### 8.1 Buy Domain
- [ ] Buy domain: `metradex.com` (or similar)
- [ ] From: Namecheap, GoDaddy, Cloudflare, etc.

### 8.2 Configure DNS
- [ ] In Railway: Settings → Domains
- [ ] Click "Add Custom Domain"
- [ ] Enter your domain: `metradex.com`
- [ ] Copy CNAME record details

### 8.3 Update DNS Records
- [ ] Go to your domain registrar
- [ ] Add CNAME record:
  ```
  Type: CNAME
  Name: @ (or www)
  Value: metradex-production.up.railway.app
  TTL: Auto
  ```
- [ ] Wait for DNS propagation (~5-30 minutes)
- [ ] Verify domain works

---

## Phase 9: Final Checks

### 9.1 Security
- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify no API keys in public code
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Test CORS settings

### 9.2 Performance
- [ ] Test page load speed
- [ ] Test API response times
- [ ] Check Railway logs for errors

### 9.3 Documentation
- [ ] Update README.md
- [ ] Document API endpoints
- [ ] Document admin features
- [ ] Create user guide (optional)

---

## Troubleshooting

### Common Issues:

**Issue: "Cannot connect to database"**
- [ ] Check Supabase URL is correct
- [ ] Check API keys are correct
- [ ] Verify Supabase project is active

**Issue: "Build failed on Railway"**
- [ ] Check build logs
- [ ] Verify `package.json` scripts
- [ ] Check Node.js version compatibility

**Issue: "Page shows 404"**
- [ ] Check Railway deployment status
- [ ] Verify start command is correct
- [ ] Check server logs

**Issue: "Trades not working"**
- [ ] Check database tables exist
- [ ] Verify API endpoints
- [ ] Check browser console for errors

---

## Success Criteria

✅ **Project is ready when:**
- [ ] Homepage loads with Metradex branding
- [ ] Users can register and login
- [ ] Trading functionality works
- [ ] Balance updates correctly
- [ ] No errors in Railway logs
- [ ] No errors in browser console
- [ ] All tests pass

---

## Next Steps After Launch

- [ ] Monitor Railway logs daily
- [ ] Monitor Supabase usage
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Create marketing materials
- [ ] Launch announcement

---

**Estimated Time: 2-3 hours**

Good luck! 🚀

