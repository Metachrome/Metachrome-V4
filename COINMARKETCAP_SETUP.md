# CoinMarketCap API Setup Guide

## Getting Your Free CoinMarketCap API Key

To get real-time cryptocurrency data from CoinMarketCap, you need to obtain a free API key:

### Step 1: Create CoinMarketCap Account
1. Go to [https://coinmarketcap.com/api/](https://coinmarketcap.com/api/)
2. Click "Get Your API Key Now" or "Sign Up"
3. Create a free account with your email

### Step 2: Get Your API Key
1. After signing up, log in to your CoinMarketCap account
2. Go to the [API Dashboard](https://pro.coinmarketcap.com/account)
3. Copy your API key from the dashboard

### Step 3: Update Environment Variables
1. Open your `.env` file in the project root
2. Replace the demo key with your real API key:
   ```
   COINMARKETCAP_API_KEY=your_actual_api_key_here
   ```

### Step 4: Deploy Changes
1. Commit your changes (but don't commit the real API key to public repos)
2. Deploy to your hosting platform (Railway/Vercel)
3. Set the `COINMARKETCAP_API_KEY` environment variable in your hosting platform

## Free Tier Limits
- **10,000 API calls per month**
- **333 calls per day**
- **14 calls per hour**
- Perfect for a trading platform with reasonable caching

## Current Implementation Features
✅ **Server-side proxy** - Avoids CORS issues and keeps API key secure
✅ **Smart caching** - 1-minute cache to avoid hitting rate limits
✅ **Automatic fallback** - Falls back to CoinGecko if CoinMarketCap fails
✅ **Error handling** - Graceful degradation with fallback data
✅ **Real-time updates** - Fresh data every 5 minutes on homepage
✅ **Top gainers** - Dynamic top gainers section using real market data

## Testing
The system will work with the demo key for testing, but you'll get more reliable data with a real API key.

## Security Note
Never commit your real API key to version control. Use environment variables in production.
