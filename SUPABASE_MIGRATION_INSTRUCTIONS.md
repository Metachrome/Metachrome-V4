# 🚨 URGENT: Supabase Migration Required

## Masalah Saat Ini

Transaction history tidak menampilkan withdrawal dan trade win/loss karena **database schema belum di-update**.

Field `symbol` dan field lainnya **BELUM ADA** di tabel `transactions` di Supabase, sehingga:
- ❌ Transaksi baru tidak tersimpan dengan benar
- ❌ Withdrawal tidak tercatat
- ❌ Trade win/loss tidak tercatat
- ❌ Hanya deposit yang muncul

## ✅ Solusi: Jalankan Migration SQL

### LANGKAH 1: Buka Supabase SQL Editor

1. Buka browser dan pergi ke: **https://app.supabase.com**
2. Login dengan akun Anda
3. Pilih project **METACHROME**
4. Di sidebar kiri, klik **SQL Editor**
5. Klik tombol **New Query**

### LANGKAH 2: Copy-Paste SQL Berikut

Copy **SEMUA** SQL di bawah ini dan paste ke SQL Editor:

```sql
-- Add missing fields to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee DECIMAL(15,8);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS method VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(20);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Update existing transactions to have default symbol
UPDATE transactions SET symbol = 'USDT' WHERE symbol IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
```

### LANGKAH 3: Jalankan SQL

1. Setelah paste SQL di atas, klik tombol **Run** (atau tekan Ctrl+Enter)
2. Tunggu beberapa detik
3. Anda akan melihat hasil:
   - ✅ "Migration completed successfully!"
   - ✅ Daftar semua kolom di tabel `transactions`

### LANGKAH 4: Verifikasi

Pastikan di hasil query ada kolom-kolom berikut:
- ✅ `symbol` - VARCHAR(20)
- ✅ `fee` - DECIMAL(15,8)
- ✅ `tx_hash` - VARCHAR(255)
- ✅ `method` - VARCHAR(50)
- ✅ `currency` - VARCHAR(20)
- ✅ `metadata` - TEXT

## 🔄 Setelah Migration Selesai

### LANGKAH 5: Tunggu Railway Deploy (2-3 menit)

Railway sudah auto-deploy kode baru. Tunggu sampai status "Deployed".

### LANGKAH 6: Jalankan Backfill

Setelah migration selesai, buka **Admin Dashboard** di browser, tekan **F12** untuk buka Console, lalu jalankan:

```javascript
fetch('/api/admin/check-schema', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('📊 Schema Check:', data);
  console.log('Has symbol field?', data.hasSymbolField);
  console.log('Transaction types:', data.transactionTypes);
});
```

**Hasil yang diharapkan:**
```
Has symbol field? true
Transaction types: ['deposit', 'withdraw', ...]
```

### LANGKAH 7: Backfill Transaksi Lama

Jika schema sudah OK, jalankan backfill untuk membuat transaction records dari trades lama:

```javascript
fetch('/api/admin/backfill-transactions', {
  method: 'POST',
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('✅ Backfill Result:', data);
  console.log('Created:', data.summary.transactionsCreated);
  console.log('Skipped:', data.summary.transactionsSkipped);
  console.log('Errors:', data.summary.errors);
});
```

**Hasil yang diharapkan:**
```
Created: 50 (atau lebih, tergantung berapa banyak trades)
Skipped: 0
Errors: 0
```

### LANGKAH 8: Refresh Transaction History

1. Buka halaman **Transaction History**: https://www.metachrome.io/transactions
2. Refresh page (F5)
3. Sekarang harus muncul:
   - ✅ Deposits
   - ✅ Withdrawals
   - ✅ Trade Win
   - ✅ Trade Loss

## 🔧 Troubleshooting

### Jika masih error "Failed to fetch" di Supabase:

1. **Cek koneksi internet** - Pastikan stabil
2. **Coba lagi** - Refresh page Supabase dan coba lagi
3. **Gunakan VPN** - Kadang Supabase di-block oleh ISP tertentu
4. **Coba browser lain** - Chrome, Firefox, atau Edge

### Jika migration berhasil tapi transaksi masih tidak muncul:

1. **Cek Railway logs**:
   - Buka Railway Dashboard
   - Klik Deployments → View Logs
   - Cari error messages

2. **Cek browser console**:
   - Tekan F12
   - Klik tab Console
   - Cari error messages berwarna merah

3. **Jalankan check-schema lagi**:
   ```javascript
   fetch('/api/admin/check-schema', { credentials: 'include' })
   .then(r => r.json())
   .then(data => console.log(data));
   ```

## 📞 Jika Masih Bermasalah

Kirim screenshot dari:
1. ✅ Hasil SQL query di Supabase (yang menampilkan kolom-kolom)
2. ✅ Hasil `check-schema` di browser console
3. ✅ Railway logs (jika ada error)
4. ✅ Browser console (jika ada error)

---

**PENTING:** Migration SQL **HARUS** dijalankan dulu sebelum fitur transaction history bisa berfungsi dengan benar!

