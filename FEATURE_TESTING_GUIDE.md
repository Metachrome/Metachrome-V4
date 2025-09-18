# 🧪 METACHROME New Features Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions for the three new features implemented in METACHROME:

1. **User Verification System** - Document upload and admin approval
2. **Referral System** - Referral codes and downline tracking  
3. **Redeem Code System** - Bonus codes with withdrawal restrictions

## 🔗 Test Pages Available

### 1. **Simple Feature Tests**
**URL:** `http://localhost:3001/test-features-simple.html`
- Basic functionality testing
- Server connectivity checks
- Authentication testing
- Database schema validation

### 2. **Registration Form Test**
**URL:** `http://localhost:3001/test-registration-form.html`
- Test new registration fields
- Referral code integration
- Document upload during registration
- Form validation testing

### 3. **Comprehensive Feature Tests**
**URL:** `http://localhost:3001/test-new-features.html`
- Advanced API endpoint testing
- Admin functionality testing
- Integration testing
- Complete user flow testing

## 🚀 Quick Start Testing

### Step 1: Verify Server is Running
1. Open: `http://localhost:3001/test-features-simple.html`
2. Click "Check Server" button
3. Should show "Online" status with green indicator

### Step 2: Test Authentication
1. Use default credentials: `superadmin` / `superadmin123`
2. Click "Test Login"
3. Should receive authentication token

### Step 3: Test Registration with New Features
1. Open: `http://localhost:3001/test-registration-form.html`
2. Fill in the form (email auto-generates)
3. Add a referral code (optional)
4. Upload a document (optional)
5. Click "Test Registration"
6. Check results for success/failure

## 📄 Feature Testing Details

### 🔐 User Verification System

**What to Test:**
- Document upload during registration
- File type validation (JPG, PNG, PDF only)
- File size validation (5MB max)
- Admin approval workflow
- Trading restrictions until verified

**Test Steps:**
1. Register new user with document upload
2. Login as admin (`http://localhost:3001/admin`)
3. Go to "Verification" tab
4. Review and approve/reject documents
5. Verify user can trade after approval

**Expected Results:**
- ✅ Documents upload successfully
- ✅ Admin can see pending verifications
- ✅ Approval/rejection works
- ✅ User trading status updates

### 🔗 Referral System

**What to Test:**
- Referral code generation
- Registration with referral codes
- Downline tracking
- Referral statistics

**Test Steps:**
1. Login as existing user
2. Generate referral code in profile
3. Register new user with that referral code
4. Check referral stats in original user's profile
5. Verify admin can see referral relationships

**Expected Results:**
- ✅ Referral codes generate uniquely
- ✅ Registration accepts referral codes
- ✅ Referral relationships are tracked
- ✅ Statistics update correctly

### 🎁 Redeem Code System

**What to Test:**
- Predefined redeem codes work
- Bonus amounts are correct
- Withdrawal restrictions apply
- Trade count tracking

**Test Codes:**
- `FIRSTBONUS` - $100 bonus
- `LETSGO1000` - $1000 bonus
- `WELCOME50` - $50 bonus
- `BONUS500` - $500 bonus

**Test Steps:**
1. Login as user
2. Go to Profile → Redeem Codes
3. Enter test codes
4. Verify bonus added to balance
5. Complete trades to unlock withdrawals
6. Check withdrawal eligibility

**Expected Results:**
- ✅ Codes redeem successfully
- ✅ Correct bonus amounts added
- ✅ Withdrawal blocked until 10 trades
- ✅ Trade count increments properly

## 🗄️ Database Schema Testing

**New Tables to Verify:**
- `user_verification_documents`
- `user_referrals`
- `redeem_codes`
- `user_redeem_history`

**New User Fields:**
- `verification_status`
- `referral_code`
- `referred_by`
- `total_trades`
- `pending_bonus_restrictions`

**Test Method:**
1. Use Simple Feature Tests page
2. Click "Test Database Schema"
3. Check if new fields appear in user data

## 🔧 API Endpoints Testing

### Verification Endpoints:
```
POST /api/user/upload-verification
GET /api/user/verification-status
POST /api/admin/verify-document/:id
GET /api/admin/pending-verifications
```

### Referral Endpoints:
```
POST /api/user/generate-referral-code
GET /api/user/referral-stats
```

### Redeem Code Endpoints:
```
POST /api/user/redeem-code
GET /api/user/redeem-history
GET /api/user/withdrawal-eligibility
```

## 🐛 Common Issues & Solutions

### Issue: Server Not Responding
**Solution:** 
- Check if server is running: `node working-server.js`
- Verify port 3001 is not blocked
- Check browser console for errors

### Issue: File Upload Fails
**Solution:**
- Ensure file is under 5MB
- Use only JPG, PNG, or PDF files
- Check if user is authenticated

### Issue: Redeem Code Already Used
**Solution:**
- Each code can only be used once per user
- Try different codes or different user accounts
- Check redeem history to see previous usage

### Issue: Database Errors
**Solution:**
- Verify database schema is updated
- Check if running in development mode (uses memory storage)
- For production, ensure Supabase connection is working

## ✅ Success Criteria

### All Tests Pass When:
- ✅ Server health check returns "healthy"
- ✅ Authentication works with test credentials
- ✅ Registration accepts referral codes and documents
- ✅ Admin dashboard shows verification queue
- ✅ Redeem codes add bonuses to user balance
- ✅ Trade count increments and unlocks withdrawals
- ✅ All API endpoints respond correctly

## 📊 Test Results Tracking

Use the test pages to track results:
- **Green Results** = Feature working correctly
- **Red Results** = Feature needs fixing
- **Yellow Results** = Partial functionality

## 🚀 Next Steps After Testing

1. **If All Tests Pass:**
   - Features are ready for production
   - Deploy to Vercel with Supabase
   - Update production database schema

2. **If Tests Fail:**
   - Check browser console for errors
   - Review server logs for issues
   - Verify database schema is correct
   - Test individual API endpoints

## 📞 Support

If you encounter issues during testing:
1. Check browser developer console for errors
2. Review server terminal output for error messages
3. Verify all dependencies are installed
4. Ensure database schema is properly updated

---

**Happy Testing! 🎉**

The new features should provide a complete user verification, referral tracking, and bonus redemption system for METACHROME.
