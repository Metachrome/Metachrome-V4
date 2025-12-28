# 🧪 Test Trade Balance - Panduan Penggunaan

## 📋 Deskripsi

Script ini untuk test apakah balance user di-update dengan benar setelah trade WIN/LOSE.

**Bug yang di-test:**
- User trade dengan profit 139.80 USDT
- Trade WIN 2x
- Balance seharusnya: 1398.25 + 279.60 = 1677.85
- Balance aktual: 1398.25 (tidak berubah!) ❌

## 🚀 Cara Menggunakan

### Opsi 1: Test dengan User yang Sudah Ada (RECOMMENDED)

```bash
node test-trade-simple.js <username> <password> [amount] [duration]
```

**Contoh:**
```bash
# Test dengan user testuser, trade 10 USDT, duration 30s
node test-trade-simple.js testuser Test123456! 10 30

# Test dengan user lain, trade 50 USDT, duration 60s
node test-trade-simple.js myuser MyPass123! 50 60
```

**Parameter:**
- `username`: Username untuk login
- `password`: Password user
- `amount`: (Optional) Amount trade dalam USDT (default: 10)
- `duration`: (Optional) Duration trade dalam detik (default: 30)

**Profit Rate berdasarkan Duration:**
- 30s = 10% profit
- 60s = 15% profit
- 90s = 20% profit
- 120s = 25% profit
- 180s = 30% profit
- 240s = 50% profit
- 300s = 75% profit
- 600s = 100% profit

### Opsi 2: Test dengan User Baru

```bash
node test-trade-balance.js
```

Script ini akan:
1. Create user baru dengan username `test_user_<timestamp>`
2. Minta Anda untuk add balance via admin panel
3. Create trade
4. Verify balance update

## 📊 Output yang Diharapkan

### ✅ Jika Bug Sudah Fixed (PASS):

```
═══════════════════════════════════════════════
📊 TEST RESULTS
═══════════════════════════════════════════════
Balance Before:  100 USDT
Balance After:   110 USDT
Actual Change:   +10 USDT
Expected Profit: +10 USDT
───────────────────────────────────────────────
✅ TEST PASSED: Balance updated correctly!
═══════════════════════════════════════════════
```

### ❌ Jika Bug Masih Ada (FAIL):

```
═══════════════════════════════════════════════
📊 TEST RESULTS
═══════════════════════════════════════════════
Balance Before:  100 USDT
Balance After:   100 USDT
Actual Change:   0 USDT
Expected Profit: +10 USDT
───────────────────────────────────────────────
❌ TEST FAILED: Balance did NOT change!
   This is the bug - profit not added to balance
═══════════════════════════════════════════════
```

## 🔍 Troubleshooting

### Error: "Insufficient balance"

**Solusi:** User tidak punya cukup balance untuk trade. Add balance via:
1. Admin panel → Users → Edit user → Add balance
2. Atau gunakan redeem code

### Error: "Login failed"

**Solusi:** Username atau password salah. Pastikan:
1. User sudah terdaftar
2. Password benar
3. User tidak di-ban

### Error: "Trade failed"

**Solusi:** Cek error message. Kemungkinan:
1. Insufficient balance
2. Invalid amount (terlalu kecil/besar)
3. Invalid duration
4. Server error

## 📝 Contoh Penggunaan Lengkap

### Test 1: Trade Kecil (10 USDT, 30s)

```bash
node test-trade-simple.js testuser Test123456! 10 30
```

**Expected:**
- Balance before: 1000 USDT
- Trade amount: 10 USDT
- Profit (10%): 1 USDT
- Balance after: 1001 USDT (if WIN)

### Test 2: Trade Sedang (100 USDT, 60s)

```bash
node test-trade-simple.js testuser Test123456! 100 60
```

**Expected:**
- Balance before: 1000 USDT
- Trade amount: 100 USDT
- Profit (15%): 15 USDT
- Balance after: 1015 USDT (if WIN)

### Test 3: Simulasi Bug zombiekiller_101

```bash
# Trade 1
node test-trade-simple.js testuser Test123456! 1398 30

# Tunggu selesai, catat balance

# Trade 2
node test-trade-simple.js testuser Test123456! 1398 30

# Cek apakah balance bertambah 2x profit (139.8 x 2 = 279.6)
```

## 🎯 Apa yang Harus Dicek

Setelah run test, cek:

1. **Balance Change:**
   - Apakah balance berubah setelah trade complete?
   - Apakah perubahan sesuai dengan expected profit?

2. **Railway Logs:**
   - Cari log: `🚨🚨🚨 CRITICAL BALANCE UPDATE ABOUT TO HAPPEN`
   - Cari log: `✅✅✅ BALANCE UPDATE SUCCESSFUL AND VERIFIED!`
   - Cek apakah ada error

3. **Database:**
   - Cek balance di Supabase
   - Cek trade record di table `trades`
   - Cek transaction record di table `transactions`

## 🐛 Jika Test FAIL

Jika test menunjukkan balance tidak berubah:

1. **Cek Railway logs** untuk error
2. **Screenshot logs** yang ada emoji 🚨 dan ✅
3. **Kirim ke developer** untuk analisa
4. **Jangan test dengan user asli** sampai bug fixed

## ✅ Jika Test PASS

Jika test menunjukkan balance update dengan benar:

1. Bug sudah fixed! 🎉
2. Bisa deploy ke production
3. Inform user yang terkena bug untuk kompensasi

## 📞 Support

Jika ada masalah atau pertanyaan, hubungi developer dengan info:
- Username yang digunakan untuk test
- Screenshot output test
- Screenshot Railway logs
- Balance sebelum dan sesudah test

