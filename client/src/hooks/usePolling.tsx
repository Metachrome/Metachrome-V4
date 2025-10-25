import { useState, useEffect, useRef, useCallback } from "react";

interface PollingMessage {
  type: string;
  data?: any;
}

export function usePolling() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<PollingMessage | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const [userId, setUserId] = useState<string | null>(null);

  const startPolling = useCallback(() => {
    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserId(user.id);
          console.log('📡 POLLING: Starting polling for user:', user.id);
        } catch (e) {
          console.error('📡 POLLING: Failed to parse user data:', e);
        }
      }

      setConnected(true);
      console.log('📡 POLLING: Connected - polling started');

      // Poll for updates every 5 seconds
      pollingIntervalRef.current = setInterval(async () => {
        try {
          // Poll for balance updates
          const balanceResponse = await fetch('/api/user/balance', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });

          if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();
            setLastMessage({
              type: 'balance_update',
              data: balanceData
            });
          }

          // Poll for trade updates
          const tradesResponse = await fetch('/api/trades/recent', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });

          if (tradesResponse.ok) {
            const tradesData = await tradesResponse.json();
            if (tradesData.trades && tradesData.trades.length > 0) {
              setLastMessage({
                type: 'trade_update',
                data: tradesData.trades[0]
              });
            }
          }
        } catch (error) {
          console.error('📡 POLLING: Error fetching updates:', error);
        }
      }, 5000); // Poll every 5 seconds

    } catch (error) {
      console.error('📡 POLLING: Failed to start polling:', error);
      setConnected(false);
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setConnected(false);
    console.log('📡 POLLING: Stopped');
  }, []);

  const sendMessage = useCallback((message: PollingMessage) => {
    // Polling doesn't support sending messages, but we can log them
    console.log('📡 POLLING: Message would be sent:', message);
  }, []);

  const subscribe = useCallback((symbols: string[]) => {
    console.log('📡 POLLING: Subscribe to symbols:', symbols);
  }, []);

  const unsubscribe = useCallback((symbols: string[]) => {
    console.log('📡 POLLING: Unsubscribe from symbols:', symbols);
  }, []);

  // Start polling on mount
  useEffect(() => {
    console.log('📡 POLLING: useEffect triggered - starting polling...');
    startPolling();

    // Cleanup on unmount
    return () => {
      console.log('📡 POLLING: Cleanup - stopping polling...');
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return {
    socket: null,
    connected,
    lastMessage,
    sendMessage,
    subscribe,
    unsubscribe,
    connect: startPolling,
    disconnect: stopPolling,
  };
}

