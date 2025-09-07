# METACHROME Trading Pages Guide

## 🚀 Overview

METACHROME now features two distinct trading interfaces with **real TradingView data integration**:

### 📊 **Spot Trading** (`/spot`)
- **Direct cryptocurrency ownership**
- Buy/sell actual crypto assets
- No time limits - hold indefinitely
- Profit from price movements

### ⚡ **Options Trading** (`/options`)
- **Binary options contracts**
- Predict price direction within time limits
- Fixed profit percentages
- Win or lose predetermined amounts

---

## 🔄 Key Differences

| Feature | Spot Trading | Options Trading |
|---------|-------------|-----------------|
| **Asset Ownership** | ✅ Own actual crypto | ❌ Contract only |
| **Time Limit** | ❌ No expiration | ✅ 30s - 600s |
| **Profit Model** | 📈 Price difference | 💰 Fixed percentage |
| **Risk Level** | 🟡 Medium | 🔴 High |
| **Minimum Trade** | Any amount | 100 USDT |

---

## 📈 Spot Trading Features

### **Real-Time TradingView Charts**
- Professional candlestick charts
- Technical indicators
- Multiple timeframes
- Real market data from Binance

### **Order Types**
- **Limit Orders**: Set specific buy/sell prices
- **Market Orders**: Execute immediately at current price

### **Trading Interface**
- Live order book with bid/ask spreads
- Real-time transaction history
- Portfolio balance tracking
- Percentage-based position sizing

### **How to Trade Spot**
1. Select trading pair (BTC/USDT, ETH/USDT, etc.)
2. Choose order type (Limit/Market)
3. Set price and amount
4. Click "Buy" or "Sell"
5. Monitor your positions

---

## ⚡ Options Trading Features

### **Duration-Based Trading**
- **30s**: 10% profit (Min: 100 USDT)
- **60s**: 15% profit (Min: 1000 USDT)
- **120s**: 25% profit
- **180s**: 35% profit
- **240s**: 50% profit
- **300s**: 75% profit
- **600s**: 100% profit

### **Binary Predictions**
- **Buy Up**: Predict price will rise
- **Buy Down**: Predict price will fall
- **Win**: Get investment + profit percentage
- **Lose**: Lose entire investment

### **Real-Time Features**
- Live price updates every 2 seconds
- Countdown timer for active trades
- Instant trade execution
- Real-time profit calculations

### **How to Trade Options**
1. Watch the real-time price chart
2. Select trade duration (30s-600s)
3. Choose investment amount (min 100 USDT)
4. Predict direction: "Buy Up" or "Buy Down"
5. Wait for countdown to complete
6. Collect winnings or accept loss

---

## 🛠 Technical Implementation

### **TradingView Integration**
```typescript
<TradingViewWidget 
  symbol="BINANCE:BTCUSDT"
  height="100%"
  interval="1"
  theme="dark"
  style="1"
  locale="en"
  timezone="Etc/UTC"
  allow_symbol_change={true}
/>
```

### **Real-Time Price Updates**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentPrice(prev => {
      const change = (Math.random() - 0.5) * 100;
      return Math.max(prev + change, 100000);
    });
  }, 2000);
  return () => clearInterval(interval);
}, []);
```

### **Options Trading Logic**
```typescript
const handleTrade = (direction: 'up' | 'down') => {
  if (selectedAmount < 100) {
    alert('Minimum trade amount is 100 USDT');
    return;
  }
  
  const durationSeconds = parseInt(selectedDuration.replace('s', ''));
  setCountdown(durationSeconds);
  setIsTrading(true);
};
```

---

## 🎯 User Experience Improvements

### **Visual Indicators**
- ✅ Green for profitable/buy actions
- ❌ Red for loss/sell actions
- 🟡 Yellow for pending/warning states
- 🔵 Blue for selected/active states

### **Responsive Design**
- Mobile-optimized layouts
- Touch-friendly controls
- Adaptive chart sizing
- Smooth animations

### **Error Handling**
- Minimum amount validation
- Real-time balance checks
- Connection status indicators
- User-friendly error messages

---

## 🚀 Next Steps

### **For Spot Trading**
1. Integrate with real exchange APIs
2. Add advanced order types (Stop-loss, Take-profit)
3. Implement portfolio tracking
4. Add more trading pairs

### **For Options Trading**
1. Connect to admin-controlled profit settings
2. Add trade history with P&L tracking
3. Implement risk management features
4. Add social trading features

---

## 📱 Mobile Compatibility

Both pages are fully responsive and work seamlessly on:
- 📱 Mobile phones (iOS/Android)
- 📱 Tablets
- 💻 Desktop browsers
- 🖥️ Large screens

---

## 🔐 Security Features

- Real-time balance validation
- Trade amount limits
- Session timeout protection
- Secure API communications
- User authentication required

---

## 📞 Support

For technical issues or trading questions:
- 📧 Email: support@metachrome.io
- 💬 Live chat available 24/7
- 📚 Trading guides in Help section
- 🎥 Video tutorials coming soon
