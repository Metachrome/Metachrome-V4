# Transaction History Fix - Panduan Lengkap

## 🔍 Masalah yang Ditemukan

1. ❌ **Transaksi withdrawal tidak muncul** - Endpoint approval tidak ada
2. ❌ **Transaksi trade win/loss tidak muncul** - Field `symbol` tidak disimpan
3. ❌ **Transaksi lama hilang** - Trades yang sudah selesai tidak punya transaction record

## ✅ Perbaikan yang Sudah Dilakukan

### 1. Menambahkan Endpoint Deposit/Withdrawal Approval
- ✅ `POST /api/admin/deposits/:id/action` - Approve/reject deposits
- ✅ `POST /api/admin/withdrawals/:id/action` - Approve/reject withdrawals
- ✅ Auto-refund balance jika withdrawal ditolak

### 2. Update Schema & Storage
- ✅ Menambahkan field `symbol`, `fee`, `txHash`, `method`, `currency`, `metadata` ke schema
- ✅ Update `createTransaction` untuk menyimpan semua field
- ✅ Update `tradingService` untuk menambahkan `symbol: 'USDT'` ke trade transactions

### 3. Backfill Endpoint
- ✅ `POST /api/admin/backfill-transactions` - Membuat transaction records untuk trades yang hilang

## 📋 Langkah-Langkah yang Perlu Dilakukan

### LANGKAH 1: Jalankan Migration SQL di Supabase

1. Buka **Supabase Dashboard**: https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy-paste SQL berikut dan klik **Run**:

```sql
-- Add missing fields to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fee DECIMAL(15,8);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(255);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS method VARCHAR(50);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(20);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata TEXT;

-- Set default symbol for existing records
UPDATE transactions SET symbol = 'USDT' WHERE symbol IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Verify the migration
SELECT 'Migration completed successfully!' as status;
```

6. Tunggu sampai muncul "Migration completed successfully!"

### LANGKAH 2: Tunggu Railway Deploy Selesai

Railway akan otomatis deploy kode baru (2-3 menit). Cek di Railway dashboard:
- Status: "Deployed"
- Build logs: Tidak ada error

### LANGKAH 3: Backfill Transaksi yang Hilang

Setelah Railway deploy selesai, jalankan backfill untuk membuat transaction records dari trades yang sudah ada:

**Via Postman/Thunder Client:**

```
POST https://metachrome.io/api/admin/backfill-transactions
Headers:
  Content-Type: application/json
  Cookie: <your-admin-session-cookie>
```

**Via Browser Console (di halaman Admin Dashboard):**

```javascript
fetch('/api/admin/backfill-transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log('Backfill result:', data))
.catch(err => console.error('Error:', err));
```

Response yang diharapkan:
```json
{
  "message": "Transaction backfill completed",
  "summary": {
    "totalTrades": 150,
    "transactionsCreated": 145,
    "transactionsSkipped": 5,
    "errors": 0
  }
}
```

### LANGKAH 4: Verifikasi

1. **Buka User Transaction History**: https://metachrome.io/transactions
2. **Cek apakah muncul:**
   - ✅ Deposits (completed/pending/failed)
   - ✅ Withdrawals (completed/pending/failed)
   - ✅ Trade Win (dengan profit amount)
   - ✅ Trade Loss (dengan loss amount)

3. **Test Deposit/Withdrawal Approval:**
   - User buat deposit request
   - Superadmin approve/reject di dashboard
   - Cek balance user berubah
   - Cek transaction muncul di user transaction history

## 🎯 Hasil Akhir

Setelah semua langkah selesai:

✅ **Transaction History Lengkap:**
- Deposits (pending → approved/rejected)
- Withdrawals (pending → approved/rejected)
- Trade Win (profit transactions)
- Trade Loss (loss transactions)

✅ **Superadmin Controls:**
- Approve deposits → balance user bertambah
- Reject deposits → tidak ada perubahan
- Approve withdrawals → balance sudah dikurangi saat request
- Reject withdrawals → balance di-refund ke user

✅ **Real-time Sync:**
- Semua perubahan langsung terlihat di user dashboard
- Tidak perlu refresh page

## 🔧 Troubleshooting

### Jika transaksi masih tidak muncul:

1. **Cek Supabase Migration:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'transactions' 
   ORDER BY ordinal_position;
   ```
   Pastikan ada kolom: `symbol`, `fee`, `tx_hash`, `method`, `currency`, `metadata`

2. **Cek Railway Logs:**
   - Buka Railway Dashboard → Deployments → View Logs
   - Cari error messages

3. **Cek Browser Console:**
   - Buka Developer Tools (F12)
   - Cek Network tab untuk API calls
   - Cek Console tab untuk errors

4. **Jalankan Backfill Lagi:**
   - Endpoint backfill aman dijalankan berkali-kali
   - Akan skip transaksi yang sudah ada

## 📝 Commits

- `f70298d` - Fix transaction history: add deposit/withdrawal approval endpoints and update schema
- `dcba9d0` - Add symbol field to transactions and backfill endpoint for missing trade transactions

## 🚀 Next Steps

Setelah semua berfungsi:
1. Test deposit flow end-to-end
2. Test withdrawal flow end-to-end
3. Test trading dan pastikan transactions tercatat
4. Monitor untuk beberapa hari untuk memastikan tidak ada issue

---

**Catatan:** Jika ada masalah atau pertanyaan, hubungi developer atau cek logs di Railway/Supabase.

