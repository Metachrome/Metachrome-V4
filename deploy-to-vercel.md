# Deploy API Files to Vercel

## Quick Fix - Manual Deployment

Since the git repository is not accessible, here's how to manually deploy the API files:

### Option 1: Create New Repository (Recommended)

1. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Name it `metachrome-v4` or similar
   - Make it public or private
   - Don't initialize with README (since you have existing code)

2. **Update git remote:**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/metachrome-v4.git
   ```

3. **Push the code:**
   ```bash
   git push -u origin main
   ```

4. **Connect Vercel to new repository:**
   - Go to Vercel dashboard
   - Import the new repository
   - Deploy

### Option 2: Use Vercel CLI (Quick)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy directly:**
   ```bash
   vercel --prod
   ```

### Option 3: Manual File Upload

If the above don't work, you can manually create the API files in Vercel:

1. Go to your Vercel project dashboard
2. Go to Functions tab
3. Create new functions with the content from these files:

**Required API Files:**
- `api/spot/orders.ts` - Main trading endpoint
- `api/spot/balances.ts` - Balance management
- `api/spot/market.ts` - Market data
- `api/spot/history.ts` - Order history

## Test After Deployment

Once deployed, test these endpoints:

1. **Market Data:** `https://metachrome-v4.vercel.app/api/spot/market`
2. **Orders:** `https://metachrome-v4.vercel.app/api/spot/orders` (POST)
3. **Balances:** `https://metachrome-v4.vercel.app/api/spot/balances`

## Current Status

✅ API files created locally
✅ Market data endpoint working
❌ Orders endpoint needs deployment
❌ Git repository access issue

## Next Steps

1. Choose one of the deployment options above
2. Test the spot trading functionality
3. Verify buy/sell buttons work
4. Check balance updates

The spot trading should work perfectly once these API files are properly deployed!
