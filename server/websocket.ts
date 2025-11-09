import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { storage } from './storage';

interface WebSocketMessage {
  type: string;
  data?: any;
}

interface ClientSubscription {
  ws: WebSocket;
  subscriptions: Set<string>;
  userId?: string;
  isAdmin?: boolean;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({
    noServer: true,
    perMessageDeflate: false,
  });

  const clients = new Map<string, ClientSubscription>();
  const priceFeeds = new Map<string, any>();

  // Manual upgrade handling to prevent Express from interfering
  server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;

    if (pathname === '/ws') {
      console.log('🔌 Handling WebSocket upgrade request for /ws');
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      console.log('❌ Invalid WebSocket path:', pathname);
      socket.destroy();
    }
  });

  wss.on('connection', (ws) => {
    const clientId = generateClientId();
    clients.set(clientId, {
      ws,
      subscriptions: new Set(),
    });

    console.log(`WebSocket client connected: ${clientId}`);

    ws.on('message', async (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        await handleMessage(clientId, data);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Invalid message format' }
        }));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket client disconnected: ${clientId}`);
      clients.delete(clientId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      clients.delete(clientId);
    });

    // Send initial market data
    sendMarketDataToClient(clientId);
  });

  async function handleMessage(clientId: string, message: WebSocketMessage) {
    const client = clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        if (message.data?.symbols) {
          message.data.symbols.forEach((symbol: string) => {
            client.subscriptions.add(symbol);
          });
          
          // Send current price data for subscribed symbols
          for (const symbol of message.data.symbols) {
            const marketData = await storage.getMarketData(symbol);
            if (marketData) {
              client.ws.send(JSON.stringify({
                type: 'price_update',
                data: marketData
              }));
            }
          }
        }
        break;

      case 'unsubscribe':
        if (message.data?.symbols) {
          message.data.symbols.forEach((symbol: string) => {
            client.subscriptions.delete(symbol);
          });
        }
        break;

      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong' }));
        break;

      case 'subscribe_chat':
        // User subscribes to their own chat updates
        if (message.data?.userId) {
          client.userId = message.data.userId;
          console.log(`User ${message.data.userId} subscribed to chat updates`);
        }
        break;

      case 'subscribe_admin_chat':
        // Admin subscribes to all chat updates
        client.isAdmin = true;
        console.log(`Admin subscribed to all chat updates`);
        break;

      case 'send_message':
        // User sends a message - broadcast to admin
        if (message.data) {
          broadcastToAdmins({
            type: 'new_message',
            data: message.data
          });
        }
        break;

      case 'admin_message':
        // Admin sends a message - broadcast to specific user
        if (message.data?.userId) {
          broadcastToUser(message.data.userId, {
            type: 'new_message',
            data: message.data
          });
        }
        break;
    }
  }

  async function sendMarketDataToClient(clientId: string) {
    const client = clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      const marketData = await storage.getAllMarketData();
      client.ws.send(JSON.stringify({
        type: 'market_data',
        data: marketData
      }));
    } catch (error) {
      console.error('Error sending market data:', error);
    }
  }

  function broadcastPriceUpdate(symbol: string, data: any) {
    clients.forEach((client, clientId) => {
      if (client.subscriptions.has(symbol) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'price_update',
          data: { symbol, ...data }
        }));
      }
    });
  }

  function broadcastToAll(message: WebSocketMessage) {
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  function broadcastToAdmins(message: WebSocketMessage) {
    clients.forEach((client) => {
      if (client.isAdmin && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  function broadcastTradingControlUpdate(userId: string, controlType: string, adminId: string) {
    const message: WebSocketMessage = {
      type: 'trading_control_update',
      data: {
        userId,
        controlType,
        adminId,
        timestamp: new Date().toISOString()
      }
    };

    console.log('📡 Broadcasting trading control update via WebSocket:', message);
    broadcastToAll(message);
  }

  function broadcastToUser(userId: string, message: WebSocketMessage) {
    clients.forEach((client, clientId) => {
      // Check if this client belongs to the specific user
      // You might need to implement user identification in WebSocket connection
      if (client.ws.readyState === WebSocket.OPEN) {
        const userMessage = {
          ...message,
          targetUserId: userId
        };
        client.ws.send(JSON.stringify(userMessage));
      }
    });
  }

  // Simulate real-time price updates
  async function updatePrices() {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT', 'XRPUSDT', 'TRUMPUSDT'];
      
      for (const symbol of symbols) {
        const currentData = await storage.getMarketData(symbol);
        
        if (currentData) {
          // Simulate price movement
          const currentPrice = parseFloat(currentData.price);
          const change = (Math.random() - 0.5) * 0.02; // +/- 2% max change
          const newPrice = currentPrice * (1 + change);
          const priceChange24h = newPrice - currentPrice;
          const priceChangePercent24h = (priceChange24h / currentPrice) * 100;

          const updatedData = await storage.updateMarketData(symbol, {
            price: newPrice.toFixed(8),
            priceChange24h: priceChange24h.toFixed(8),
            priceChangePercent24h: priceChangePercent24h.toFixed(4),
            high24h: Math.max(parseFloat(currentData.high24h || '0'), newPrice).toFixed(8),
            low24h: Math.min(parseFloat(currentData.low24h || '999999'), newPrice).toFixed(8),
            volume24h: (Math.random() * 1000000).toFixed(8),
          });

          broadcastPriceUpdate(symbol, updatedData);
        } else {
          // Initialize with base prices if no data exists
          const basePrices: Record<string, number> = {
            'BTCUSDT': 113770.32,
            'ETHUSDT': 3577.42,
            'DOGEUSDT': 0.197557,
            'XRPUSDT': 2.936930,
            'TRUMPUSDT': 8.626100,
          };

          if (basePrices[symbol]) {
            const price = basePrices[symbol];
            await storage.updateMarketData(symbol, {
              price: price.toFixed(8),
              priceChange24h: '0',
              priceChangePercent24h: '0',
              high24h: price.toFixed(8),
              low24h: price.toFixed(8),
              volume24h: (Math.random() * 1000000).toFixed(8),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  // Update prices every 5 seconds
  setInterval(updatePrices, 5000);

  // Initial price setup
  setTimeout(updatePrices, 1000);

  return {
    broadcastPriceUpdate,
    broadcastToAll,
    broadcastTradingControlUpdate,
    broadcastToUser
  };
}

function generateClientId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
