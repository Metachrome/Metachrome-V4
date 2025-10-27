# Loss Calculation Fix - METACHROME V2

## Problem
Loss trades were showing incorrect P&L in notifications:
- **Balance deduction**: ✅ Correct (using percentage)
- **Notification display**: ❌ Wrong (showing full amount instead of percentage)

### Example
- Trade amount: 5,000 USDT
- Duration: 60s (15% loss rate)
- **Expected loss**: -750 USDT (15% of 5,000)
- **Actual notification**: -5,000 USDT (full amount) ❌

## Root Cause
The `TradeNotification.tsx` component had a fallback calculation for loss trades that used the full amount instead of the percentage:

```javascript
// OLD CODE (WRONG)
const pnl = trade.profit !== undefined ? trade.profit : (isWin ? (trade.payout! - trade.amount) : -trade.amount);
```

For loss trades without `trade.profit`, it would use `-trade.amount` (full amount).

## Solution

### Backend (working-server.js) - ✅ Already Correct
The backend was already calculating loss correctly as a percentage:
```javascript
const lossRate = duration === 30 ? 0.10 : 0.15; // 10% for 30s, 15% for others
profitAmount = -(amount * lossRate); // Loss amount (negative) based on percentage
```

The backend sends `profitAmount` in the WebSocket message with the correct percentage-based loss.

### Frontend Fix (client/src/components/TradeNotification.tsx)
Updated the PnL calculation to use `profitPercentage` for loss trades:

```javascript
// NEW CODE (CORRECT)
let pnl = 0;
if (trade.profit !== undefined) {
  // Use profit from WebSocket (most accurate)
  pnl = trade.profit;
} else if (isWin) {
  // Win: payout - amount
  pnl = trade.payout! - trade.amount;
} else {
  // CRITICAL FIX: Loss should be percentage-based, not full amount
  const lossPercentage = (trade.profitPercentage || 15) / 100;
  pnl = -(trade.amount * lossPercentage);
}
```

## Data Flow
1. **Backend** calculates loss as percentage: `-750` (15% of 5,000)
2. **WebSocket message** includes `profitAmount: -750`
3. **Client** receives `profitAmount` and uses it in notification
4. **Fallback** (if `profitAmount` missing): Calculate from `profitPercentage`

## Test Results
All 11 tests passed:
- ✅ 30s loss: 5000 USDT → -500 USDT (10%)
- ✅ 60s loss: 5000 USDT → -750 USDT (15%)
- ✅ 30s loss: 2500 USDT → -250 USDT (10%)
- ✅ 60s loss: 1000 USDT → -150 USDT (15%)
- ✅ Loss is NOT full amount
- ✅ Client loss calculation correct
- ✅ Client uses WebSocket profitAmount
- ✅ Client 30s loss calculation correct
- ✅ WebSocket message profitAmount correct
- ✅ Win calculations still work (regression test)

## Files Modified
1. `client/src/components/TradeNotification.tsx` - Fixed PnL calculation for loss trades (main component)
2. `client/src/components/TradeNotification_new.tsx` - Fixed PnL calculation for loss trades (mobile & desktop)
3. `client/src/components/TradeNotification_old.tsx` - Fixed PnL calculation for loss trades (legacy)

## Files Created
1. `tests/loss-calculation.test.js` - Comprehensive test suite
2. `tests/verify-loss-calculation.js` - Standalone verification script

## Verification
Run the verification script:
```bash
node tests/verify-loss-calculation.js
```

Expected output:
```
✅ All tests passed! Loss calculation fix is working correctly.
```

## Impact
- ✅ Loss notifications now show correct percentage-based loss
- ✅ Balance deduction remains correct (already was)
- ✅ Win calculations unaffected
- ✅ No breaking changes to API or data structures

