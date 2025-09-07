# Stripe Integration Setup Guide

This guide explains how to set up Stripe payment processing for the CryptoTradeX platform.

## 🔧 Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **Test API Keys**: Get your test keys from the Stripe Dashboard
3. **Webhook Endpoint**: Set up webhook for payment confirmations

## 📋 Step 1: Get Your Stripe Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

## 🔐 Step 2: Configure Environment Variables

### Server Environment (.env)
```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Client Environment (client/.env)
```bash
# Stripe Configuration (Client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

## 🎣 Step 3: Set Up Webhooks

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

## 🚀 Step 4: Test the Integration

### Test Credit Card Numbers
Stripe provides test card numbers for testing:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

Use any future expiry date and any 3-digit CVC.

### Testing Process
1. Go to the Wallet page
2. Click on "Credit/Debit Card" deposit method
3. Enter an amount and select currency
4. Click "Confirm Card"
5. Use test card numbers in the Stripe form
6. Verify payment processing

## 🔒 Security Features

### ✅ What's Implemented
- **PCI Compliance**: Stripe handles all card data
- **Webhook Verification**: Cryptographic signature validation
- **Payment Verification**: Server-side payment confirmation
- **Error Handling**: Comprehensive error management
- **Secure Communication**: HTTPS required for production

### 🛡️ Security Best Practices
1. **Never log sensitive data**: Card numbers, secrets, etc.
2. **Use HTTPS**: Required for production webhooks
3. **Validate webhooks**: Always verify webhook signatures
4. **Environment variables**: Keep secrets in environment files
5. **Regular updates**: Keep Stripe SDK updated

## 📊 Features Included

### 💳 Payment Processing
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Real-time Processing**: Instant payment confirmation
- **3D Secure**: Automatic authentication when required
- **Multiple Currencies**: Support for USD and other currencies

### 🔄 Webhook Handling
- **Payment Success**: Automatic balance updates
- **Payment Failures**: Error notifications
- **Idempotency**: Duplicate webhook protection
- **Retry Logic**: Automatic retry for failed webhooks

### 🎨 User Experience
- **Responsive Design**: Works on all devices
- **Real-time Feedback**: Instant payment status updates
- **Error Messages**: Clear, user-friendly error handling
- **Loading States**: Visual feedback during processing

## 🚨 Production Deployment

### Environment Setup
1. Replace test keys with live keys
2. Update webhook URL to production domain
3. Enable HTTPS for all endpoints
4. Set up proper error monitoring

### Live Keys
```bash
# Production Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### Webhook URL
- **Development**: `http://localhost:5000/api/webhooks/stripe`
- **Production**: `https://yourdomain.com/api/webhooks/stripe`

## 🐛 Troubleshooting

### Common Issues

1. **"Stripe not configured" error**
   - Check environment variables are set
   - Restart server after adding variables

2. **Webhook signature verification failed**
   - Verify webhook secret is correct
   - Check endpoint URL matches Stripe configuration

3. **Payment intent creation failed**
   - Verify secret key is valid
   - Check amount is positive number
   - Ensure currency is supported

4. **Card payment declined**
   - Use test card numbers for testing
   - Check card details are valid
   - Verify sufficient funds (for live cards)

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📞 Support

- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in dashboard
- **Test Mode**: Use test keys for development

## 🎯 Next Steps

1. **Set up your Stripe account**
2. **Get your API keys**
3. **Update environment variables**
4. **Configure webhooks**
5. **Test with test cards**
6. **Deploy to production**

The Stripe integration is now ready to process real payments securely!
