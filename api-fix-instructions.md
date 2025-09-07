# API Fix Instructions for "Unknown" User Issue

## Problem
The admin dashboard shows "Unknown" instead of usernames/emails because the API is not returning the user data in the correct format.

## Solution
The frontend expects this structure:
```json
{
  "id": "balance-id",
  "userId": "user-id", 
  "symbol": "USD",
  "available": "10000.00",
  "user": {
    "id": "user-id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

But the API is returning this:
```json
{
  "id": "balance-id",
  "userId": "user-id",
  "symbol": "USD", 
  "available": "10000.00",
  "username": "john_doe",
  "email": "john@example.com"
}
```

## Quick Fix Options

### Option 1: Update Vercel Function (Recommended)
Since you can't push to GitHub, you can:

1. **Go to Vercel Dashboard**
2. **Navigate to Functions tab**
3. **Find the `/api/admin/balances` function**
4. **Edit it directly in Vercel**

### Option 2: Frontend Fix (Immediate)
Update the frontend to handle both formats:

In `client/src/pages/AdminDashboard.tsx`, line 851, change:
```typescript
{balance.user?.username || balance.user?.email || 'Unknown'}
```

To:
```typescript
{balance.user?.username || balance.user?.email || balance.username || balance.email || 'Unknown'}
```

### Option 3: Database View (Alternative)
Create a database view that returns the correct structure:

```sql
CREATE OR REPLACE VIEW admin_balances_view AS
SELECT 
    b.id,
    b."userId",
    b.symbol,
    b.available,
    b.locked,
    b."createdAt",
    b."updatedAt",
    json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
    ) as user
FROM balances b
JOIN users u ON b."userId" = u.id;
```

Then update the API to query this view instead.

## Immediate Action Plan

1. **Run the production-cleanup-final.sql** to remove demo data
2. **Apply Option 2 (Frontend Fix)** for immediate resolution
3. **Then work on Option 1** for permanent fix

This will give you a clean, production-ready system with proper user display.
