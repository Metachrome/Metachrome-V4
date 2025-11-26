# Create Activity Logs Table di Railway PostgreSQL

## ⚠️ PENTING: Tabel `admin_activity_logs` Belum Ada di Railway Database

Activity logs masih kosong karena tabel `admin_activity_logs` belum dibuat di Railway PostgreSQL database Anda.

---

## 🚂 **Cara Create Table di Railway PostgreSQL**

Ada 3 cara untuk create table:

---

### **Opsi 1: Menggunakan Script Node.js (PALING MUDAH)** ✅

Saya sudah membuat script otomatis untuk create table.

**Langkah-langkah:**

1. **Pastikan Railway environment variables sudah di-load:**
   ```bash
   # Di terminal, jalankan:
   railway link
   ```

2. **Run script untuk create table:**
   ```bash
   railway run node scripts/create-activity-logs-table.js
   ```

3. **Verify table created:**
   - Script akan otomatis verify dan print: `✅ admin_activity_logs table created successfully!`

**Selesai!** Table sudah dibuat dan siap digunakan.

---

### **Opsi 2: Menggunakan Railway Dashboard**

1. **Login ke Railway Dashboard:**
   - Buka: https://railway.app/dashboard
   - Login dengan akun Anda

2. **Pilih Project Metachrome:**
   - Klik project METACHROME Anda

3. **Buka PostgreSQL Database:**
   - Klik service **PostgreSQL** (database icon)

4. **Buka Query Tab:**
   - Klik tab **Query** di bagian atas

5. **Copy & Paste SQL Script:**
   ```sql
   -- Create admin_activity_logs table
   CREATE TABLE IF NOT EXISTS admin_activity_logs (
     id SERIAL PRIMARY KEY,
     admin_id UUID NOT NULL,
     admin_username VARCHAR(255) NOT NULL,
     admin_email VARCHAR(255),
     action_type VARCHAR(100) NOT NULL,
     action_category VARCHAR(50) NOT NULL,
     action_description TEXT NOT NULL,
     target_user_id UUID,
     target_username VARCHAR(255),
     target_email VARCHAR(255),
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     ip_address VARCHAR(45),
     user_agent TEXT,
     is_deleted BOOLEAN DEFAULT FALSE
   );

   -- Create indexes
   CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
   CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_user_id ON admin_activity_logs(target_user_id);
   CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
   CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_category ON admin_activity_logs(action_category);
   CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_metadata ON admin_activity_logs USING GIN (metadata);
   ```

6. **Execute Query:**
   - Klik tombol **Run** atau tekan `Ctrl+Enter`

7. **Verify:**
   - Klik tab **Data**
   - Cari tabel `admin_activity_logs`
   - Pastikan tabel sudah ada

---

### **Opsi 3: Menggunakan Railway CLI**

1. **Login ke Railway:**
   ```bash
   railway login
   ```

2. **Link project:**
   ```bash
   railway link
   ```

3. **Connect ke database:**
   ```bash
   railway connect postgres
   ```

4. **Paste SQL script** (sama seperti Opsi 2)

5. **Execute dengan `\g` atau `;`**

6. **Exit dengan `\q`**

---

## ✅ **Verify Table Created**

Setelah create table, verify dengan query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'admin_activity_logs';
```

Atau check columns:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_activity_logs';
```

---

## 🧪 **Test Activity Logs**

Setelah tabel dibuat:

1. **Login sebagai superadmin**
2. **Perform test actions:**
   - Approve/reject deposit
   - Approve/reject withdrawal
   - Verify ID document
   - Update user balance

3. **Buka Activity Logs tab**
4. **Logs akan muncul otomatis!**

---

## 📞 **Troubleshooting**

**Error: "relation admin_activity_logs does not exist"**
- Table belum dibuat
- Jalankan salah satu opsi di atas

**Error: "permission denied"**
- Check Railway database credentials
- Pastikan menggunakan service role key

**Logs masih kosong setelah create table:**
- Perform action dulu (approve deposit, etc.)
- Refresh Activity Logs tab
- Check Railway server logs untuk error

---

## 📝 **Files Created**

1. **scripts/create-activity-logs-table.js** - Auto script untuk create table
2. **server/migrations/create-activity-logs-table.ts** - Migration file (future use)
3. **CREATE_ADMIN_ACTIVITY_LOGS_TABLE.sql** - SQL script manual

---

## 🎯 **Recommended Method**

**Gunakan Opsi 1 (Node.js Script)** - Paling mudah dan otomatis!

```bash
railway run node scripts/create-activity-logs-table.js
```

Selesai! 🎉

