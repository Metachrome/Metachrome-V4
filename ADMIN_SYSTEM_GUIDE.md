# METACHROME Admin System Guide

## Overview

METACHROME now has a **two-tier admin system**:

1. **Superadmin** - Full access to all features
2. **Admin Staff** - Restricted access for regular admin tasks

---

## 🔐 Login Credentials

### Superadmin
- **URL**: `https://metachrome.io/admin/login`
- **Username**: `superadmin`
- **Password**: `superadmin123`
- **Role**: `super_admin`

### Admin Staff
- **URL**: `https://metachrome.io/admin-staff/login`
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

---

## 🎯 Feature Comparison

| Feature | Superadmin | Admin Staff |
|---------|-----------|-------------|
| View all users | ✅ Yes | ⚠️ Cannot see superadmin users |
| Manage user balances | ✅ Yes | ✅ Yes |
| Control trading modes (Win/Normal/Lose) | ✅ Yes | ✅ Yes |
| View trades & activity logs | ✅ Yes | ✅ Yes |
| Manage deposits/withdrawals | ✅ Yes | ✅ Yes |
| **Change user passwords** | ✅ Yes | ❌ No |
| **Update wallet addresses** | ✅ Yes | ❌ No |
| View superadmin users | ✅ Yes | ❌ No |
| Delete users | ✅ Yes | ✅ Yes (regular users only) |

---

## 🔒 Admin Staff Restrictions

### 1. Cannot Change Wallet Addresses
- The **Wallet button** (purple icon) is hidden for admin staff
- API endpoint `/api/superadmin/update-wallet` checks user role
- Returns `403 Forbidden` if accessed by admin staff

### 2. Cannot Change User Passwords
- The **Password button** (blue key icon) is hidden for admin staff
- API endpoint `/api/superadmin/change-password` checks user role
- Returns `403 Forbidden` if accessed by admin staff

### 3. Cannot See Superadmin Users
- Superadmin users are filtered out from the user list
- Backend filters users with `role = 'super_admin'` or `role = 'superadmin'`
- Frontend also hides these users for extra security

---

## 🛠️ Technical Implementation

### Frontend Changes

1. **New Login Page**: `client/src/pages/AdminStaffLogin.tsx`
   - Separate login page for admin staff
   - Validates that user has `role = 'admin'`
   - Redirects superadmin to superadmin dashboard

2. **Dashboard Restrictions**: `client/src/pages/AdminDashboard.tsx`
   - Hides Password and Wallet buttons if `currentUser.role === 'admin'`
   - Filters out superadmin users from user list

3. **New Routes**: `client/src/App.tsx`
   ```tsx
   /admin-staff/login → AdminStaffLogin
   /admin-staff/dashboard → AdminDashboard (with restrictions)
   ```

### Backend Changes

1. **User List Filtering**: `working-server.js` line 2761
   ```javascript
   // Filter out superadmin users for admin staff
   if (currentUser && currentUser.role === 'admin') {
     filteredUsers = users.filter(u => 
       u.role !== 'super_admin' && u.role !== 'superadmin'
     );
   }
   ```

2. **Wallet Update Protection**: `working-server.js` line 9933
   ```javascript
   // Check if user is superadmin (not regular admin)
   if (!currentUser || currentUser.role !== 'super_admin') {
     return res.status(403).json({ 
       error: 'Access denied: Superadmin privileges required' 
     });
   }
   ```

3. **Password Change Protection**: `working-server.js` line 9866
   ```javascript
   // Check if user is superadmin (not regular admin)
   if (!currentUser || currentUser.role !== 'super_admin') {
     return res.status(403).json({ 
       error: 'Access denied: Superadmin privileges required' 
     });
   }
   ```

---

## 📝 Creating Additional Admin Users

### Using the Script

Run the provided script to create admin users:

```bash
node create-admin-user.js
```

### Manual Creation (Supabase SQL Editor)

```sql
INSERT INTO users (
  username,
  email,
  password,
  role,
  balance,
  status,
  trading_mode
) VALUES (
  'admin2',
  'admin2@metachrome.com',
  '$2b$10$[BCRYPT_HASH_HERE]',  -- Use bcrypt to hash password
  'admin',  -- NOT 'super_admin'
  50000,
  'active',
  'normal'
);
```

---

## 🔄 Upgrading Admin to Superadmin

```sql
UPDATE users 
SET role = 'super_admin' 
WHERE username = 'admin';
```

---

## 🔄 Downgrading Superadmin to Admin

```sql
UPDATE users 
SET role = 'admin' 
WHERE username = 'superadmin';
```

---

## ✅ Testing Checklist

- [ ] Admin staff can login at `/admin-staff/login`
- [ ] Admin staff cannot see Password button
- [ ] Admin staff cannot see Wallet button
- [ ] Admin staff cannot see superadmin users in user list
- [ ] Admin staff can still manage regular users
- [ ] Admin staff can control trading modes
- [ ] Admin staff can manage deposits/withdrawals
- [ ] Superadmin still has full access to all features

---

## 🚀 Deployment Status

✅ **Deployed to Railway**
- Commit: `b8424a5`
- Changes are live on production

---

## 📞 Support

If you need to create more admin users or modify permissions, contact the development team.

