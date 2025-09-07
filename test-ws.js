// Test WebSocket connection
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WebSocket = require('ws');

console.log('🔌 Testing Binance WebSocket connection...');

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

ws.on('open', () => {
  console.log('✅ Connected to Binance WebSocket!');
});

ws.on('message', (data) => {
  try {
    const ticker = JSON.parse(data.toString());
    console.log(`📈 BTC/USDT: $${parseFloat(ticker.c).toFixed(2)} (${parseFloat(ticker.P).toFixed(2)}%)`);
  } catch (error) {
    console.error('Error parsing data:', error);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

ws.on('close', () => {
  console.log('🔌 WebSocket closed');
});

// Close after 10 seconds
setTimeout(() => {
  console.log('🛑 Closing connection...');
  ws.close();
  process.exit(0);
}, 10000);
