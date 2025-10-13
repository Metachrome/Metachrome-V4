import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  data?: any;
}

export function useWebSocket() {
  console.log('🚀 WEBSOCKET HOOK: useWebSocket() called - hook is being used!');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      console.log('🔌 WEBSOCKET DEBUG: Starting connection attempt...');
      console.log('🔌 WEBSOCKET DEBUG: Current location:', window.location.hostname, window.location.port);
      console.log('🔌 WEBSOCKET DEBUG: Full URL:', window.location.href);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

      // Check if we're running locally
      const isLocal = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0';

      // Check if we're on Vercel or Railway
      const isVercel = window.location.hostname.includes('vercel.app');
      const isRailway = window.location.hostname.includes('railway.app');

      console.log('🔌 WEBSOCKET DEBUG: Environment check:', { isLocal, isVercel, isRailway });

      // Use correct WebSocket URL
      let wsUrl;
      if (isLocal) {
        wsUrl = 'ws://127.0.0.1:3005/ws'; // FIXED: Use port 3005 to match server
      } else if (isVercel) {
        // Vercel doesn't support WebSockets in serverless functions
        // We'll use polling instead for Vercel deployment
        console.log('🔌 Vercel deployment detected - WebSocket not available, using polling');
        return;
      } else if (isRailway) {
        // Railway supports WebSockets - use the same host and port
        wsUrl = `${protocol}//${window.location.host}/ws`;
        console.log('🔌 Railway deployment detected - using WebSocket:', wsUrl);
      } else {
        wsUrl = `${protocol}//${window.location.host}/ws`;
      }

      console.log('🔌 WEBSOCKET DEBUG: Attempting to connect to:', wsUrl);
      console.log('🔌 WEBSOCKET DEBUG: Creating WebSocket instance...');
      const ws = new WebSocket(wsUrl);
      console.log('🔌 WEBSOCKET DEBUG: WebSocket instance created:', ws);

      ws.onopen = () => {
        console.log("🔌 WEBSOCKET DEBUG: WebSocket connected successfully!");
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Send ping to keep connection alive
        ws.send(JSON.stringify({ type: "ping" }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          if (message.type === "pong") {
            // Handle pong response
            console.log("Received pong from server");
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 WEBSOCKET DEBUG: WebSocket disconnected:", event.code, event.reason);
        setConnected(false);
        setSocket(null);

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("🔌 WEBSOCKET DEBUG: WebSocket error:", error);
      };

      setSocket(ws);
    } catch (error) {
      console.error("🔌 WEBSOCKET DEBUG: Failed to create WebSocket connection:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close(1000, "Intentional disconnect");
    }
  }, [socket]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
    }
  }, [socket]);

  const subscribe = useCallback((symbols: string[]) => {
    sendMessage({
      type: "subscribe",
      data: { symbols }
    });
  }, [sendMessage]);

  const unsubscribe = useCallback((symbols: string[]) => {
    sendMessage({
      type: "unsubscribe",
      data: { symbols }
    });
  }, [sendMessage]);

  // Connect on mount
  useEffect(() => {
    console.log('🚀 WEBSOCKET HOOK: useEffect triggered - attempting to connect...');
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Keep-alive ping
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [connected, sendMessage]);

  return {
    socket,
    connected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
}
