import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'deposit' | 'withdrawal' | 'registration' | 'verification';
  userId: string;
  username: string;
  amount?: string;
  currency?: string;
  email?: string;
  documentType?: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationBellProps {
  onTabChange?: (tab: string) => void;
}

export function NotificationBell({ onTabChange }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  console.log('🔔 NotificationBell component rendered');
  console.log('🔔 Current state:', {
    notificationsCount: notifications.length,
    unreadCount,
    isOpen
  });

  // Connect to SSE stream
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout;

    const connectToStream = () => {
      console.log('🔔 Connecting to notification stream... (attempt', retryCount + 1, ')');

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ No auth token found, cannot connect to notification stream');
        return;
      }

      // EventSource doesn't support custom headers, so we pass token as query param
      const sseUrl = `/sse/notifications/stream?token=${encodeURIComponent(token)}`;
      console.log('🔔 SSE URL:', sseUrl);

      const eventSource = new EventSource(sseUrl, {
        withCredentials: true
      });

      console.log('🔔 EventSource created, readyState:', eventSource.readyState);

      eventSource.onopen = () => {
        console.log('✅ Notification stream connected successfully!');
        console.log('✅ EventSource readyState:', eventSource.readyState);
        retryCount = 0; // Reset retry count on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          console.log('📨 SSE message received:', event.data);
          const data = JSON.parse(event.data);

          if (data.type === 'connected') {
            console.log('🔔 Notification stream ready');
            return;
          }

          // Add new notification
          if (data.type === 'deposit' || data.type === 'withdrawal' || data.type === 'registration' || data.type === 'verification') {
            console.log('🔔 New notification received:', data);
            setNotifications(prev => [data, ...prev]);

            // Play notification sound
            playNotificationSound();

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
              let notificationBody = '';
              if (data.type === 'registration') {
                notificationBody = `${data.username} (${data.email || 'N/A'}) registered`;
              } else if (data.type === 'verification') {
                notificationBody = `${data.username} uploaded ID for verification`;
              } else {
                notificationBody = `${data.username} requested ${data.amount} ${data.currency}`;
              }

              new Notification(`New ${data.type} ${data.type === 'registration' ? '' : data.type === 'verification' ? '' : 'request'}`, {
                body: notificationBody,
                icon: '/new-metachrome-logo.png'
              });
            }
          }
        } catch (error) {
          console.error('❌ Error parsing notification:', error, 'Raw data:', event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ Notification stream error:', error);
        console.error('❌ Error details:', {
          readyState: eventSource.readyState,
          url: eventSource.url
        });

        eventSource.close();

        // Retry connection if under max retries
        if (retryCount < maxRetries) {
          retryCount++;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
          console.log(`⚠️ Retrying connection in ${retryDelay}ms... (${retryCount}/${maxRetries})`);
          retryTimeout = setTimeout(connectToStream, retryDelay);
        } else {
          console.error('❌ Max retries reached. Notification stream disabled.');
          console.log('💡 Please check if you are logged in as super_admin and refresh the page.');
        }
      };

      eventSourceRef.current = eventSource;

      return eventSource;
    };

    // Initial connection
    const eventSource = connectToStream();

    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }

    // Fetch existing notifications
    fetchNotifications();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (eventSource) eventSource.close();
    };
  }, []);

  // Calculate unread count
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', {
        method: 'POST',
        credentials: 'include'
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const playNotificationSound = () => {
    // Simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // TEST FUNCTION - Add a fake notification manually
  const addTestNotification = () => {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      type: 'deposit',
      userId: 'test-user-id',
      username: 'Test User',
      amount: '1000',
      currency: 'USDT',
      timestamp: new Date(),
      read: false
    };

    console.log('🧪 Adding test notification:', testNotification);
    setNotifications(prev => [testNotification, ...prev]);
    playNotificationSound();
  };

  // Expose test function to window for debugging
  useEffect(() => {
    (window as any).testNotification = addTestNotification;
    console.log('💡 Test function available: window.testNotification()');

    return () => {
      delete (window as any).testNotification;
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    if (type === 'deposit') return '💰';
    if (type === 'withdrawal') return '💸';
    if (type === 'registration') return '👤';
    if (type === 'verification') return '📄';
    return '🔔';
  };

  const getNotificationColor = (type: string) => {
    if (type === 'deposit') return 'text-green-400';
    if (type === 'withdrawal') return 'text-yellow-400';
    if (type === 'registration') return 'text-blue-400';
    if (type === 'verification') return 'text-purple-400';
    return 'text-gray-400';
  };

  const getNotificationTitle = (type: string) => {
    if (type === 'deposit') return 'New Deposit';
    if (type === 'withdrawal') return 'New Withdrawal';
    if (type === 'registration') return 'New User Registration';
    if (type === 'verification') return 'ID Verification Upload';
    return 'Notification';
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to appropriate tab
    if (onTabChange) {
      if (notification.type === 'registration') {
        onTabChange('users');
      } else if (notification.type === 'deposit' || notification.type === 'withdrawal') {
        onTabChange('pending');
      } else if (notification.type === 'verification') {
        onTabChange('verification');
      }
    }

    // Close dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => {
          console.log('🔔 Bell clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors border border-gray-600"
        title="Notifications"
      >
        <Bell className="w-6 h-6" />

        {/* Unread Badge - Only show when there are unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-hidden bg-gray-800 border-gray-700 shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </h3>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-gray-700/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${getNotificationColor(notification.type)}`}>
                          {getNotificationTitle(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>

                      <p className="text-sm text-gray-300">
                        {notification.type === 'registration' ? (
                          <>
                            <span className="font-medium">{notification.username}</span> registered with email{' '}
                            <span className="font-bold text-white">{notification.email}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{notification.username}</span> requested{' '}
                            <span className="font-bold text-white">
                              {notification.amount} {notification.currency}
                            </span>
                          </>
                        )}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <button
                className="text-sm text-blue-400 hover:text-blue-300"
                onClick={() => {
                  if (onTabChange) {
                    onTabChange('pending');
                  }
                  setIsOpen(false);
                }}
              >
                View all transactions →
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

