import { useState, useEffect, useRef, useCallback } from "react";
import { usePolling } from "./usePolling";
export function useWebSocket() {
    var _a = useState(null), socket = _a[0], setSocket = _a[1];
    var _b = useState(false), connected = _b[0], setConnected = _b[1];
    var _c = useState(null), lastMessage = _c[0], setLastMessage = _c[1];
    var _d = useState(false), usePollingFallback = _d[0], setUsePollingFallback = _d[1];
    var pollingHook = usePolling();
    var connectionAttemptRef = useRef(0);
    var reconnectTimeoutRef = useRef();
    var reconnectAttemptsRef = useRef(0);
    var connect = useCallback(function () {
        try {
            console.log('🔌 WEBSOCKET DEBUG: ===== CONNECT FUNCTION CALLED =====');
            var protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            // Check if we're running locally
            var isLocal = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname === '0.0.0.0';
            // Check if we're on Vercel or Railway
            var isVercel = window.location.hostname.includes('vercel.app');
            var isRailway = window.location.hostname.includes('railway.app');
            // Check if we're on metachrome.io (should use same behavior as Railway)
            var isMetachromeIO = window.location.hostname.includes('metachrome.io');
            // Use correct WebSocket URL
            var wsUrl = void 0;
            // Check for custom backend URL from environment or query parameter
            var backendUrl = import.meta.env.VITE_BACKEND_URL || new URLSearchParams(window.location.search).get('backend');
            if (backendUrl) {
                // Use custom backend URL if provided
                var backendProtocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
                var backendHost = backendUrl.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
                wsUrl = "".concat(backendProtocol, "//").concat(backendHost, "/ws");
                console.log('🔌 CUSTOM BACKEND: Using provided backend URL:', wsUrl);
            }
            else if (isLocal) {
                wsUrl = 'ws://127.0.0.1:3005/ws';
            }
            else if (isVercel || isRailway || isMetachromeIO) {
                // Vercel, Railway, and metachrome.io have issues with WebSocket through reverse proxies
                // Use polling instead
                console.log('🔌 Cloud deployment detected - WebSocket not available, using polling');
                setUsePollingFallback(true);
                return;
            }
            else {
                // For any other deployment
                wsUrl = "".concat(protocol, "//").concat(window.location.host, "/ws");
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
            var ws_1 = new WebSocket(wsUrl);
            console.log('🔌 WEBSOCKET DEBUG: WebSocket instance created');
            ws_1.onopen = function () {
                console.log("🔌 WEBSOCKET DEBUG: WebSocket connected successfully!");
                setConnected(true);
                reconnectAttemptsRef.current = 0;
                // Send user identification message
                var authToken = localStorage.getItem('authToken');
                var userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        var user = JSON.parse(userStr);
                        console.log('🔌 Sending user identification to WebSocket:', user.id);
                        ws_1.send(JSON.stringify({
                            type: "identify_user",
                            userId: user.id,
                            username: user.username,
                            authToken: authToken
                        }));
                    }
                    catch (e) {
                        console.error('🔌 Failed to parse user data:', e);
                    }
                }
                // Send ping to keep connection alive
                ws_1.send(JSON.stringify({ type: "ping" }));
            };
            ws_1.onmessage = function (event) {
                try {
                    var message = JSON.parse(event.data);
                    console.log("🔔 WEBSOCKET: Received message:", message);
                    setLastMessage(message);
                    if (message.type === "pong") {
                        // Handle pong response
                        console.log("🏓 WEBSOCKET: Received pong from server");
                    }
                    else if (message.type === "trade_completed") {
                        console.log("🎯 WEBSOCKET: Trade completion message received:", message.data);
                        // The OptionsPage component will handle this via the lastMessage state
                    }
                    else if (message.type === "trigger_mobile_notification") {
                        console.log("🔔 WEBSOCKET: Mobile notification trigger received:", message.data);
                        // Try to trigger notification directly if global function exists
                        if (typeof window !== 'undefined' && window.testDirectNotification) {
                            console.log("🔔 WEBSOCKET: Triggering direct notification via global function");
                            window.testDirectNotification();
                        }
                    }
                    else {
                        console.log("🔔 WEBSOCKET: Unknown message type:", message.type);
                    }
                }
                catch (error) {
                    console.error("❌ WEBSOCKET: Error parsing WebSocket message:", error);
                }
            };
            ws_1.onclose = function (event) {
                console.log("🔌 WEBSOCKET DEBUG: WebSocket disconnected:", event.code, event.reason);
                setConnected(false);
                setSocket(null);
                // Don't attempt to reconnect - use polling instead
                // WebSocket is not reliable on cloud deployments with reverse proxies
            };
            ws_1.onerror = function (error) {
                console.error("🔌 WEBSOCKET DEBUG: WebSocket error - falling back to polling");
                setConnected(false);
            };
            setSocket(ws_1);
        }
        catch (error) {
            console.error("🔌 WEBSOCKET DEBUG: Failed to create WebSocket connection:", error);
        }
    }, []);
    var disconnect = useCallback(function () {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (socket) {
            socket.close(1000, "Intentional disconnect");
        }
    }, [socket]);
    var sendMessage = useCallback(function (message) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
        else {
            console.warn("WebSocket is not connected. Message not sent:", message);
        }
    }, [socket]);
    var subscribe = useCallback(function (symbols) {
        sendMessage({
            type: "subscribe",
            data: { symbols: symbols }
        });
    }, [sendMessage]);
    var unsubscribe = useCallback(function (symbols) {
        sendMessage({
            type: "unsubscribe",
            data: { symbols: symbols }
        });
    }, [sendMessage]);
    // Connect on mount
    useEffect(function () {
        console.log('🚀 WEBSOCKET HOOK: useEffect triggered');
        connect();
        // Cleanup on unmount
        return function () {
            console.log('🚀 WEBSOCKET HOOK: Cleanup - disconnecting...');
            disconnect();
        };
    }, [connect, disconnect]);
    // If WebSocket fails, use polling fallback
    useEffect(function () {
        if (usePollingFallback) {
            console.log('📡 WEBSOCKET HOOK: Switching to polling fallback');
            return;
        }
    }, [usePollingFallback]);
    // Keep-alive ping
    useEffect(function () {
        if (!connected)
            return;
        var pingInterval = setInterval(function () {
            sendMessage({ type: "ping" });
        }, 30000); // Ping every 30 seconds
        return function () { return clearInterval(pingInterval); };
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
        socket: socket,
        connected: connected,
        lastMessage: lastMessage,
        sendMessage: sendMessage,
        subscribe: subscribe,
        unsubscribe: unsubscribe,
        connect: connect,
        disconnect: disconnect,
    };
}
