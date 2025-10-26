import { useState, useEffect, useRef, useCallback } from "react";
import { usePolling } from "./usePolling";

interface WebSocketMessage {
  type: string;
  data?: any;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [usePollingFallback, setUsePollingFallback] = useState(false);
  const pollingHook = usePolling();
  const connectionAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    try {
      console.log('🔌 WEBSOCKET DEBUG: ===== CONNECT FUNCTION CALLED =====');

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

      // Check if we're running locally
      const isLocal = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0';

      // Check if we're on Vercel or Railway
      const isVercel = window.location.hostname.includes('vercel.app');
      const isRailway = window.location.hostname.includes('railway.app');

      // Use correct WebSocket URL
      let wsUrl;

      // Check for custom backend URL from environment or query parameter
      const backendUrl = import.meta.env.VITE_BACKEND_URL || new URLSearchParams(window.location.search).get('backend');

      if (backendUrl) {
        // Use custom backend URL if provided
        const backendProtocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
        const backendHost = backendUrl.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
        wsUrl = `${backendProtocol}//${backendHost}/ws`;
        console.log('🔌 CUSTOM BACKEND: Using provided backend URL:', wsUrl);
      } else if (isLocal) {
        wsUrl = 'ws://127.0.0.1:3005/ws';
      } else if (isVercel || isRailway) {
        // Both Vercel and Railway have issues with WebSocket through reverse proxies
        // Use polling instead
        console.log('🔌 Cloud deployment detected - WebSocket not available, using polling');
        setUsePollingFallback(true);
        return;
      } else {
        // For any other deployment (including custom domains like www.metachrome.io)
        wsUrl = `${protocol}//${window.location.host}/ws`;
        console.log('🔌 CUSTOM DOMAIN DEPLOYMENT: Attempting WebSocket at:', wsUrl);
      }

      // Only attempt WebSocket connection once per session
      if (connectionAttemptRef.current > 0) {
        console.log('🔌 WEBSOCKET: Already attempted connection, using polling fallback');
        setUsePollingFallback(true);
        return;
      }

      connectionAttemptRef.current++;
      console.log('🔌 WEBSOCKET DEBUG: Attempting to connect to:', wsUrl);
      const ws = new WebSocket(wsUrl);
      console.log('🔌 WEBSOCKET DEBUG: WebSocket instance created');

      ws.onopen = () => {
        console.log("🔌 WEBSOCKET DEBUG: WebSocket connected successfully!");
        setConnected(true);
        reconnectAttemptsRef.current = 0;

        // Send user identification message
        const authToken = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log('🔌 Sending user identification to WebSocket:', user.id);
            ws.send(JSON.stringify({
              type: "identify_user",
              userId: user.id,
              username: user.username,
              authToken: authToken
            }));
          } catch (e) {
            console.error('🔌 Failed to parse user data:', e);
          }
        }

        // Send ping to keep connection alive
        ws.send(JSON.stringify({ type: "ping" }));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log("🔔 WEBSOCKET: Received message:", message);
          setLastMessage(message);

          if (message.type === "pong") {
            // Handle pong response
            console.log("🏓 WEBSOCKET: Received pong from server");
          } else if (message.type === "trade_completed") {
            console.log("🎯 WEBSOCKET: Trade completion message received:", message.data);
            // The OptionsPage component will handle this via the lastMessage state
          } else if (message.type === "trigger_mobile_notification") {
            console.log("🔔 WEBSOCKET: Mobile notification trigger received:", message.data);
            // Try to trigger notification directly if global function exists
            if (typeof window !== 'undefined' && (window as any).testDirectNotification) {
              console.log("🔔 WEBSOCKET: Triggering direct notification via global function");
              (window as any).testDirectNotification();
            }
          } else {
            console.log("🔔 WEBSOCKET: Unknown message type:", message.type);
          }
        } catch (error) {
          console.error("❌ WEBSOCKET: Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 WEBSOCKET DEBUG: WebSocket disconnected:", event.code, event.reason);
        setConnected(false);
        setSocket(null);

        // Don't attempt to reconnect - use polling instead
        // WebSocket is not reliable on cloud deployments with reverse proxies
      };

      ws.onerror = (error) => {
        console.error("🔌 WEBSOCKET DEBUG: WebSocket error - falling back to polling");
        setConnected(false);
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
    console.log('🚀 WEBSOCKET HOOK: useEffect triggered');
    connect();

    // Cleanup on unmount
    return () => {
      console.log('🚀 WEBSOCKET HOOK: Cleanup - disconnecting...');
      disconnect();
    };
  }, [connect, disconnect]);

  // If WebSocket fails, use polling fallback
  useEffect(() => {
    if (usePollingFallback) {
      console.log('📡 WEBSOCKET HOOK: Switching to polling fallback');
      return;
    }
  }, [usePollingFallback]);

  // Keep-alive ping
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: "ping" });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [connected, sendMessage]);

  // Use polling data if WebSocket is not available
  if (usePollingFallback) {
    return {
      socket: null,
      connected: pollingHook.connected,
      lastMessage: pollingHook.lastMessage || lastMessage,
      sendMessage: pollingHook.sendMessage,
      subscribe: pollingHook.subscribe,
      unsubscribe: pollingHook.unsubscribe,
      connect: pollingHook.connect,
      disconnect: pollingHook.disconnect,
    };
  }

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
