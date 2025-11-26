# Setup Admin Activity Logs Table di Supabase

## ⚠️ PENTING: Tabel `admin_activity_logs` Belum Ada di Supabase Railway

Activity logs masih kosong karena tabel `admin_activity_logs` belum dibuat di database Supabase Railway Anda.

---

## 📋 Langkah-langkah Setup

### **Step 1: Login ke Supabase Dashboard**

1. Buka: https://supabase.com/dashboard
2. Login dengan akun Anda
3. Pilih project Railway Anda (yang digunakan untuk METACHROME)

---

### **Step 2: Buka SQL Editor**

1. Di sidebar kiri, klik **SQL Editor**
2. Klik **New Query** untuk membuat query baru

---

### **Step 3: Copy & Paste SQL Script**

Copy seluruh isi file `CREATE_ADMIN_ACTIVITY_LOGS_TABLE.sql` dan paste ke SQL Editor.

Atau copy script ini:

```sql
-- Create admin_activity_logs table to track all admin activities
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id SERIAL PRIMARY KEY,
  
  -- Admin who performed the action
  admin_id UUID NOT NULL,
  admin_username VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255),
  
  -- Action details
  action_type VARCHAR(100) NOT NULL,
  action_category VARCHAR(50) NOT NULL,
  action_description TEXT NOT NULL,
  
  -- Target user (if applicable)
  target_user_id UUID,
  target_username VARCHAR(255),
  target_email VARCHAR(255),
  
  -- Action metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- IP address and user agent for security
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Prevent deletion
  is_deleted BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT fk_admin
    FOREIGN KEY(admin_id) 
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_target_user_id ON admin_activity_logs(target_user_id);
CREATE INDEX idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX idx_admin_activity_logs_action_category ON admin_activity_logs(action_category);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_metadata ON admin_activity_logs USING GIN (metadata);

-- Verification query
SELECT 'admin_activity_logs table created successfully!' as status;
```

---

### **Step 4: Run SQL Script**

1. Klik tombol **Run** (atau tekan `Ctrl+Enter`)
2. Tunggu sampai selesai
3. Anda akan melihat pesan: `admin_activity_logs table created successfully!`

---

### **Step 5: Verify Table Created**

1. Di sidebar kiri, klik **Table Editor**
2. Cari tabel `admin_activity_logs`
3. Pastikan tabel sudah ada dengan kolom:
   - id
   - admin_id
   - admin_username
   - action_type
   - action_category
   - action_description
   - target_user_id
   - metadata
   - created_at
   - ip_address
   - user_agent
   - is_deleted

---

### **Step 6: Test Activity Logs**

Setelah tabel dibuat, test dengan melakukan action di admin dashboard:

1. **Approve/Reject Deposit** → Check Activity Logs tab
2. **Approve/Reject Withdrawal** → Check Activity Logs tab
3. **Verify ID Document** → Check Activity Logs tab
4. **Update User Balance** → Check Activity Logs tab

Logs akan otomatis muncul di **Activity Logs** tab!

---

## 🔍 Debug Password Visibility

Untuk debug password visibility issue:

1. **Deploy perubahan terbaru ke Railway**
2. **Login sebagai superadmin**
3. **Buka browser console** (F12 → Console tab)
4. **Refresh halaman admin dashboard**
5. **Lihat console log:**
   ```
   🔍 First user password check: {
     hasPassword: true/false,
     passwordValue: "...",
     passwordType: "string"
   }
   ```

Jika `hasPassword: false` atau `passwordValue: undefined`, berarti backend tidak mengirim password field.

---

## ✅ Expected Result

Setelah setup selesai:

- ✅ Activity Logs tab akan menampilkan logs
- ✅ Password visibility akan bekerja (jika backend mengirim password field)
- ✅ Semua admin actions akan ter-record di database

---

## 📞 Troubleshooting

**Jika logs masih kosong setelah create table:**
- Pastikan Supabase connection working
- Check Railway logs untuk error
- Verify `SUPABASE_URL` dan `SUPABASE_SERVICE_KEY` di Railway environment variables

**Jika password masih tidak visible:**
- Check browser console untuk debug log
- Verify backend mengirim password field
- Check Railway server logs untuk `📊 Sample user data`

