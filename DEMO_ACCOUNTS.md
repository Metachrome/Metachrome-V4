# Demo Accounts for METACHROME

This document contains the demo account credentials for testing and development purposes. **These credentials are not displayed on the login or signup pages for security reasons.**

## 🔐 User Accounts

### Demo Trader Account (Recommended for Testing)
- **Username:** `demo_trader`
- **Password:** `demo123`
- **Role:** User
- **Starting Balance:** 
  - $10,000 USDT
  - 0.5 BTC
  - 5.0 ETH
- **Purpose:** Primary demo account with funds for testing trading features

### Regular Trader Accounts
- **Username:** `trader1` | **Password:** `password123` | **Role:** User
- **Username:** `trader2` | **Password:** `password123` | **Role:** User  
- **Username:** `trader3` | **Password:** `password123` | **Role:** User
- **Starting Balance:** $0 (empty accounts)
- **Purpose:** Additional user accounts for testing multi-user scenarios

## 🔐 Admin Accounts

### Demo Admin Account (Recommended for Testing)
- **Username:** `demo_admin`
- **Password:** `admin123`
- **Role:** Super Admin
- **Purpose:** Primary demo admin account for testing admin features

### System Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Super Admin
- **Purpose:** System administrator account

## 🚀 How to Create Demo Accounts

To recreate or refresh the demo accounts, run:

```bash
npx tsx create-demo-accounts.ts
```

## 🔒 Security Notes

1. **No Credentials on UI:** Demo credentials are intentionally not shown on login/signup pages
2. **Development Only:** These accounts are for development and testing purposes only
3. **Production:** In production, these demo accounts should be disabled or removed
4. **Password Security:** All passwords are hashed using bcrypt before storage

## 🧪 Testing Scenarios

### User Testing
- Use `demo_trader` account to test trading features with pre-funded balances
- Use `trader1`, `trader2`, `trader3` for testing user interactions and empty account flows

### Admin Testing  
- Use `demo_admin` account to test admin dashboard and management features
- Test user management, transaction monitoring, and system controls

## 📝 Notes

- Demo accounts are automatically created when the application starts
- Balances and trades are seeded for realistic testing scenarios
- All demo data is stored in the same database as regular user data
- Demo accounts follow the same authentication and authorization flows as regular accounts
