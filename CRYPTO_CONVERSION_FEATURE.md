# 🔄 Crypto to USDT Conversion Feature

## Overview
This critical feature ensures that all deposits in cryptocurrencies (BTC, ETH, SOL, etc.) are automatically converted to USDT using **real-time market prices** before being added to user balances.

## Problem Solved
**Before:** When a user deposited 2,000 BTC, the system incorrectly recorded it as 2,000 USDT in their balance.

**After:** When a user deposits 2,000 BTC, the system:
1. Fetches the current BTC price from CoinMarketCap API
2. Converts 2,000 BTC to USDT (e.g., 2,000 × $43,000 = $86,000,000 USDT)
3. Adds the converted USDT amount to the user's balance

## How It Works

### 1. Real-Time Price Fetching
```javascript
async function getCryptoPriceInUSDT(cryptoSymbol)
```
- Fetches live cryptocurrency prices from CoinMarketCap API
- Uses cached data (5-minute cache) to avoid rate limits
- Supports: BTC, ETH, SOL, BNB, XRP, and all USDT variants (ERC20, TRC20, BEP20)
- Falls back to hardcoded prices if API fails

### 2. Conversion Logic
```javascript
async function convertCryptoToUSDT(amount, cryptoCurrency)
```
- Takes the deposit amount and cryptocurrency type
- Multiplies amount by current price
- Returns the equivalent USDT value

### 3. Deposit Approval Flow
When admin approves a deposit:

1. **Fetch deposit details** (amount, currency)
2. **Check if conversion needed** (skip if already USDT)
3. **Get live price** from CoinMarketCap
4. **Convert to USDT** (amount × price)
5. **Add to user balance** (in USDT)
6. **Record transaction** with conversion details
7. **Update deposit record** with conversion metadata

## Database Schema

### New Columns in `deposits` Table
```sql
converted_amount_usdt DECIMAL(18, 8)  -- Final USDT amount added to balance
conversion_rate       DECIMAL(18, 8)  -- Exchange rate used (e.g., $43,000 for BTC)
original_amount       DECIMAL(18, 8)  -- Original deposit amount (e.g., 2,000 BTC)
original_currency     VARCHAR(20)     -- Original crypto (e.g., 'BTC')
```

### Example Record
```json
{
  "id": "dep_1234567890_user-123",
  "user_id": "user-123",
  "amount": 2.5,
  "currency": "BTC",
  "original_amount": 2.5,
  "original_currency": "BTC",
  "converted_amount_usdt": 107500.00,
  "conversion_rate": 43000.00,
  "status": "approved"
}
```

## Transaction Records

Transactions now include conversion details in the description:

**For crypto deposits:**
```
"Deposit approved - 2.5 BTC converted to 107500.00 USDT (rate: $43000.00)"
```

**For USDT deposits:**
```
"Deposit approved - 1000.00 USDT"
```

## Supported Cryptocurrencies

| Currency | Symbol | Conversion |
|----------|--------|------------|
| Bitcoin | BTC | ✅ Live price |
| Ethereum | ETH | ✅ Live price |
| Solana | SOL | ✅ Live price |
| BNB | BNB | ✅ Live price |
| XRP | XRP | ✅ Live price |
| USDT (ERC20) | USDT-ERC20 | ✅ 1:1 (no conversion) |
| USDT (TRC20) | USDT-TRC20 | ✅ 1:1 (no conversion) |
| USDT (BEP20) | USDT-BEP20 | ✅ 1:1 (no conversion) |

## API Integration

### CoinMarketCap API
- **Endpoint:** `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest`
- **Cache Duration:** 5 minutes (to avoid rate limits)
- **Rate Limit:** 333 requests/day (free tier)
- **API Key:** Set via `COINMARKETCAP_API_KEY` environment variable

### Fallback Prices
If CoinMarketCap API fails, the system uses these fallback prices:
```javascript
{
  'BTC': 43000,
  'ETH': 2300,
  'SOL': 100,
  'BNB': 310,
  'XRP': 0.52
}
```

## Error Handling

### Conversion Failure
If conversion fails (API down, invalid currency, etc.):
```json
{
  "success": false,
  "message": "Failed to convert BTC to USDT: CoinMarketCap API failed"
}
```
The deposit is **NOT approved** and admin must retry.

### Invalid Currency
If currency is not supported:
```json
{
  "success": false,
  "message": "Failed to convert DOGE to USDT: Price not found for DOGE"
}
```

## Logging

The system logs detailed conversion information:

```
💱 Converting 2.5 BTC to USDT...
💱 Fetched live price for BTC: $43000
💱 Conversion complete: 2.5 BTC = 107500.00 USDT (rate: $43000.00)
✅ Deposit approved, user balance updated: 50000 → 157500
💰 Added 107500.00 USDT (from 2.5 BTC)
📝 Approved deposit transaction recorded
```

## Testing

### Test Scenarios

1. **BTC Deposit (0.001 BTC)**
   - Expected: ~$43 USDT added to balance
   - Check: Transaction shows conversion details

2. **ETH Deposit (1 ETH)**
   - Expected: ~$2,300 USDT added to balance
   - Check: Conversion rate is logged

3. **USDT Deposit (1000 USDT-ERC20)**
   - Expected: Exactly 1000 USDT added
   - Check: No conversion, rate = 1.0

4. **API Failure**
   - Expected: Uses fallback prices
   - Check: Warning logged about fallback

## Migration Steps

### 1. Run SQL Migration
Execute `ADD_DEPOSIT_CONVERSION_COLUMNS.sql` in Supabase SQL Editor

### 2. Deploy Backend
The conversion logic is already deployed in `working-server.js`

### 3. Verify
- Check that new columns exist in deposits table
- Test a BTC deposit approval
- Verify balance is correct USDT amount

## Security Considerations

1. **Price Manipulation:** Uses CoinMarketCap (trusted source)
2. **Cache Poisoning:** Cache expires every 5 minutes
3. **Fallback Safety:** Fallback prices are conservative estimates
4. **Audit Trail:** All conversions are logged and stored in database

## Future Enhancements

- [ ] Support more cryptocurrencies (DOGE, SHIB, etc.)
- [ ] Add price history tracking
- [ ] Allow admin to override conversion rate
- [ ] Add conversion fee (e.g., 1% platform fee)
- [ ] Support multiple price sources (Binance, CoinGecko)
- [ ] Add price alerts for large deposits

## Related Files

- `working-server.js` - Main conversion logic (lines 9873-9945, 4155-4311)
- `ADD_DEPOSIT_CONVERSION_COLUMNS.sql` - Database migration
- `CRYPTO_CONVERSION_FEATURE.md` - This documentation

## Commit History

- `f64b332` - CRITICAL: Add real-time crypto to USDT conversion for deposits

