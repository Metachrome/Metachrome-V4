import { useEffect, useState, useRef } from 'react';
import { Badge } from '../ui/badge';

interface ChatNotificationBadgeProps {
  onUnreadCountChange?: (count: number) => void;
}

export default function ChatNotificationBadge({ onUnreadCountChange }: ChatNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize notification sound
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch initial unread count
    fetchUnreadCount();

    // Connect WebSocket
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/admin/chat/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ Chat notification WebSocket connected');
        
        // Subscribe to admin chat updates
        ws.send(JSON.stringify({
          type: 'subscribe_admin_chat',
          data: {}
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_message' && data.data.sender_type === 'user') {
            // Increment unread count
            setUnreadCount(prev => prev + 1);
            
            // Play notification sound
            playNotificationSound();
            
            // Show browser notification
            showBrowserNotification(data.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('Chat notification WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('Chat notification WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting chat notification WebSocket:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.log('Could not play notification sound:', err);
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const showBrowserNotification = (messageData: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('New Chat Message', {
        body: `${messageData.sender_username || 'User'}: ${messageData.message?.substring(0, 50) || 'New message'}`,
        icon: '/new-metachrome-logo.png',
        badge: '/new-metachrome-logo.png',
        tag: 'chat-notification',
        requireInteraction: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge 
      variant="destructive" 
      className="ml-2 bg-red-600 text-white animate-pulse"
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>
  );
}

