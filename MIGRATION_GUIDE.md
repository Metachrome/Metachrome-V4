# 🚀 Migration Guide: Supabase → Railway PostgreSQL

## 📋 Overview

Migrasi dari Supabase (free tier) ke Railway PostgreSQL untuk menghemat biaya.

**Keuntungan:**
- ✅ Tidak perlu bayar Supabase lagi
- ✅ Semua dalam satu platform (Railway)
- ✅ Lebih mudah manage
- ✅ Tidak ada batasan free tier

---

## 🔧 Step-by-Step Migration

### **Step 1: Provision PostgreSQL di Railway**

1. **Buka Railway Dashboard:**
   ```
   https://railway.app
   ```

2. **Pilih project Anda**

3. **Add PostgreSQL:**
   - Click **"New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway akan otomatis provision database

4. **Copy DATABASE_URL:**
   - Klik PostgreSQL service
   - Tab **"Variables"**
   - Copy value dari `DATABASE_URL`
   - Format: `postgresql://user:password@host:port/database`

---

### **Step 2: Export Data dari Supabase**

1. **Install dependencies:**
   ```bash
   npm install pg
   ```

2. **Run export script:**
   ```bash
   node export-supabase-data.js
   ```

3. **File akan tersimpan:**
   ```
   supabase-export-[timestamp].json
   ```

---

### **Step 3: Setup Database Schema di Railway**

1. **Set environment variable:**
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://user:password@host:port/database"

   # Windows CMD
   set DATABASE_URL=postgresql://user:password@host:port/database

   # Mac/Linux
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```

2. **Run setup script:**
   ```bash
   node setup-railway-postgres.js
   ```

   Ini akan create semua tables:
   - ✅ users
   - ✅ trades
   - ✅ deposits
   - ✅ withdrawals
   - ✅ admin_activity_logs
   - ✅ redeem_codes
   - ✅ user_redeem_history
   - ✅ wallet_addresses

---

### **Step 4: Import Data ke Railway**

```bash
node import-data-to-railway.js supabase-export-[timestamp].json
```

Script akan import semua data dari Supabase ke Railway PostgreSQL.

---

### **Step 5: Update Environment Variables di Railway**

1. **Buka Railway Dashboard → Your Project → Variables**

2. **Hapus Supabase variables:**
   - ❌ `VITE_SUPABASE_URL`
   - ❌ `VITE_SUPABASE_ANON_KEY`

3. **Pastikan ada:**
   - ✅ `DATABASE_URL` (sudah otomatis ada dari PostgreSQL service)

4. **Add new variable (optional):**
   ```
   USE_RAILWAY_POSTGRES=true
   ```

---

### **Step 6: Update Code (Sudah Siap!)**

Code Anda sudah support Railway PostgreSQL! File `working-server.js` sudah menggunakan `pg` library dan akan otomatis detect `DATABASE_URL`.

**Tidak perlu ubah code apapun!** 🎉

---

### **Step 7: Deploy & Test**

1. **Commit changes (jika ada):**
   ```bash
   git add -A
   git commit -m "Migrate to Railway PostgreSQL"
   git push origin main
   ```

2. **Railway akan auto-deploy**

3. **Test aplikasi:**
   - Login sebagai superadmin
   - Cek apakah data users masih ada
   - Cek trades history
   - Cek deposits/withdrawals
   - Test create user baru
   - Test trading

---

## 🧪 Verification Checklist

Setelah migration, verify:

- [ ] ✅ Login superadmin berhasil
- [ ] ✅ Login admin berhasil
- [ ] ✅ Login user berhasil
- [ ] ✅ User list muncul dengan data lengkap
- [ ] ✅ Trading history ada
- [ ] ✅ Deposits/withdrawals history ada
- [ ] ✅ Activity logs ada
- [ ] ✅ Redeem codes masih berfungsi
- [ ] ✅ Create user baru berhasil
- [ ] ✅ Trading berfungsi normal
- [ ] ✅ Deposit/withdrawal approval berfungsi

---

## 💰 Cost Comparison

### **Before (Supabase + Railway):**
- Supabase Free Tier: $0 (tapi exceeded)
- Supabase Pro: $25/month
- Railway: $5-20/month
- **Total: $30-45/month**

### **After (Railway Only):**
- Railway (app + PostgreSQL): $5-20/month
- **Total: $5-20/month**

**Savings: $10-25/month** 💰

---

## 🔄 Rollback Plan (Jika Ada Masalah)

Jika ada masalah, Anda bisa rollback:

1. **Data masih ada di Supabase** (tidak dihapus)
2. **Export file masih ada** (supabase-export-xxx.json)
3. **Tinggal restore environment variables:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📞 Support

Jika ada masalah:
1. Check Railway logs
2. Check PostgreSQL connection
3. Verify DATABASE_URL format
4. Test connection dengan psql atau pgAdmin

---

## ✅ Summary

1. ✅ Provision PostgreSQL di Railway
2. ✅ Export data dari Supabase
3. ✅ Setup schema di Railway
4. ✅ Import data ke Railway
5. ✅ Update environment variables
6. ✅ Deploy & test

**Estimated time: 15-30 minutes**

