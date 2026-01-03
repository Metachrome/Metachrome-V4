var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
export function NotificationBell(_a) {
    var _this = this;
    var onTabChange = _a.onTabChange;
    var _b = useState([]), notifications = _b[0], setNotifications = _b[1];
    var _c = useState(false), isOpen = _c[0], setIsOpen = _c[1];
    var _d = useState(0), unreadCount = _d[0], setUnreadCount = _d[1];
    var dropdownRef = useRef(null);
    var eventSourceRef = useRef(null);
    console.log('🔔 NotificationBell component rendered');
    console.log('🔔 Current state:', {
        notificationsCount: notifications.length,
        unreadCount: unreadCount,
        isOpen: isOpen
    });
    // Connect to SSE stream
    useEffect(function () {
        var retryCount = 0;
        var maxRetries = 3;
        var retryTimeout;
        var connectToStream = function () {
            console.log('🔔 Connecting to notification stream... (attempt', retryCount + 1, ')');
            // Get auth token from localStorage
            var token = localStorage.getItem('authToken');
            if (!token) {
                console.error('❌ No auth token found, cannot connect to notification stream');
                return;
            }
            // EventSource doesn't support custom headers, so we pass token as query param
            var sseUrl = "/sse/notifications/stream?token=".concat(encodeURIComponent(token));
            console.log('🔔 SSE URL:', sseUrl);
            var eventSource = new EventSource(sseUrl, {
                withCredentials: true
            });
            console.log('🔔 EventSource created, readyState:', eventSource.readyState);
            eventSource.onopen = function () {
                console.log('✅ Notification stream connected successfully!');
                console.log('✅ EventSource readyState:', eventSource.readyState);
                retryCount = 0; // Reset retry count on successful connection
            };
            eventSource.onmessage = function (event) {
                try {
                    console.log('📨 SSE message received:', event.data);
                    var data_1 = JSON.parse(event.data);
                    if (data_1.type === 'connected') {
                        console.log('🔔 Notification stream ready');
                        return;
                    }
                    // Add new notification
                    if (data_1.type === 'deposit' || data_1.type === 'withdrawal' || data_1.type === 'registration' || data_1.type === 'verification') {
                        console.log('🔔 New notification received:', data_1);
                        setNotifications(function (prev) { return __spreadArray([data_1], prev, true); });
                        // Play notification sound
                        playNotificationSound();
                        // Show browser notification if permitted
                        if (Notification.permission === 'granted') {
                            var notificationBody = '';
                            if (data_1.type === 'registration') {
                                notificationBody = "".concat(data_1.username, " (").concat(data_1.email || 'N/A', ") registered");
                            }
                            else if (data_1.type === 'verification') {
                                notificationBody = "".concat(data_1.username, " uploaded ID for verification");
                            }
                            else {
                                notificationBody = "".concat(data_1.username, " requested ").concat(data_1.amount, " ").concat(data_1.currency);
                            }
                            new Notification("New ".concat(data_1.type, " ").concat(data_1.type === 'registration' ? '' : data_1.type === 'verification' ? '' : 'request'), {
                                body: notificationBody,
                                icon: '/new-metachrome-logo.png'
                            });
                        }
                    }
                }
                catch (error) {
                    console.error('❌ Error parsing notification:', error, 'Raw data:', event.data);
                }
            };
            eventSource.onerror = function (error) {
                console.error('❌ Notification stream error:', error);
                console.error('❌ Error details:', {
                    readyState: eventSource.readyState,
                    url: eventSource.url
                });
                eventSource.close();
                // Retry connection if under max retries
                if (retryCount < maxRetries) {
                    retryCount++;
                    var retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
                    console.log("\u26A0\uFE0F Retrying connection in ".concat(retryDelay, "ms... (").concat(retryCount, "/").concat(maxRetries, ")"));
                    retryTimeout = setTimeout(connectToStream, retryDelay);
                }
                else {
                    console.error('❌ Max retries reached. Notification stream disabled.');
                    console.log('💡 Please check if you are logged in as super_admin and refresh the page.');
                }
            };
            eventSourceRef.current = eventSource;
            return eventSource;
        };
        // Initial connection
        var eventSource = connectToStream();
        // Request browser notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(function (permission) {
                console.log('🔔 Notification permission:', permission);
            });
        }
        // Fetch existing notifications
        fetchNotifications();
        return function () {
            if (retryTimeout)
                clearTimeout(retryTimeout);
            if (eventSource)
                eventSource.close();
        };
    }, []);
    // Calculate unread count
    useEffect(function () {
        var count = notifications.filter(function (n) { return !n.read; }).length;
        setUnreadCount(count);
    }, [notifications]);
    // Close dropdown when clicking outside
    useEffect(function () {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return function () { return document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    var fetchNotifications = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/admin/notifications', {
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setNotifications(data.notifications || []);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error fetching notifications:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var markAsRead = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/admin/notifications/".concat(id, "/read"), {
                            method: 'POST',
                            credentials: 'include'
                        })];
                case 1:
                    _a.sent();
                    setNotifications(function (prev) {
                        return prev.map(function (n) { return n.id === id ? __assign(__assign({}, n), { read: true }) : n; });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error marking notification as read:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var markAllAsRead = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch('/api/admin/notifications/read-all', {
                            method: 'POST',
                            credentials: 'include'
                        })];
                case 1:
                    _a.sent();
                    setNotifications(function (prev) {
                        return prev.map(function (n) { return (__assign(__assign({}, n), { read: true })); });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error marking all as read:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var playNotificationSound = function () {
        // Simple beep sound using Web Audio API
        try {
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            var oscillator = audioContext.createOscillator();
            var gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
        catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };
    // TEST FUNCTION - Add a fake notification manually
    var addTestNotification = function () {
        var testNotification = {
            id: "test-".concat(Date.now()),
            type: 'deposit',
            userId: 'test-user-id',
            username: 'Test User',
            amount: '1000',
            currency: 'USDT',
            timestamp: new Date(),
            read: false
        };
        console.log('🧪 Adding test notification:', testNotification);
        setNotifications(function (prev) { return __spreadArray([testNotification], prev, true); });
        playNotificationSound();
    };
    // Expose test function to window for debugging
    useEffect(function () {
        window.testNotification = addTestNotification;
        console.log('💡 Test function available: window.testNotification()');
        return function () {
            delete window.testNotification;
        };
    }, []);
    var getNotificationIcon = function (type) {
        if (type === 'deposit')
            return '💰';
        if (type === 'withdrawal')
            return '💸';
        if (type === 'registration')
            return '👤';
        if (type === 'verification')
            return '📄';
        return '🔔';
    };
    var getNotificationColor = function (type) {
        if (type === 'deposit')
            return 'text-green-400';
        if (type === 'withdrawal')
            return 'text-yellow-400';
        if (type === 'registration')
            return 'text-blue-400';
        if (type === 'verification')
            return 'text-purple-400';
        return 'text-gray-400';
    };
    var getNotificationTitle = function (type) {
        if (type === 'deposit')
            return 'New Deposit';
        if (type === 'withdrawal')
            return 'New Withdrawal';
        if (type === 'registration')
            return 'New User Registration';
        if (type === 'verification')
            return 'ID Verification Upload';
        return 'Notification';
    };
    var handleNotificationClick = function (notification) {
        // Mark as read
        if (!notification.read) {
            markAsRead(notification.id);
        }
        // Navigate to appropriate tab
        if (onTabChange) {
            if (notification.type === 'registration') {
                onTabChange('users');
            }
            else if (notification.type === 'deposit' || notification.type === 'withdrawal') {
                onTabChange('pending');
            }
            else if (notification.type === 'verification') {
                onTabChange('verification');
            }
        }
        // Close dropdown
        setIsOpen(false);
    };
    return (<div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button onClick={function () {
            console.log('🔔 Bell clicked, isOpen:', isOpen);
            setIsOpen(!isOpen);
        }} className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors border border-gray-600" title="Notifications">
        <Bell className="w-6 h-6"/>

        {/* Unread Badge - Only show when there are unread notifications */}
        {unreadCount > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>)}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (<Card className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-hidden bg-gray-800 border-gray-700 shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center space-x-2">
              <Bell className="w-5 h-5"/>
              <span>Notifications</span>
              {unreadCount > 0 && (<Badge className="bg-red-500 text-white">{unreadCount}</Badge>)}
            </h3>
            
            {unreadCount > 0 && (<button onClick={markAllAsRead} className="text-xs text-blue-400 hover:text-blue-300">
                Mark all read
              </button>)}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (<div className="p-8 text-center text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50"/>
                <p>No notifications yet</p>
              </div>) : (notifications.map(function (notification) { return (<div key={notification.id} onClick={function () { return handleNotificationClick(notification); }} className={"p-4 border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors ".concat(!notification.read ? 'bg-gray-700/30' : '')}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={"font-semibold ".concat(getNotificationColor(notification.type))}>
                          {getNotificationTitle(notification.type)}
                        </span>
                        {!notification.read && (<span className="w-2 h-2 bg-blue-500 rounded-full"></span>)}
                      </div>

                      <p className="text-sm text-gray-300">
                        {notification.type === 'registration' ? (<>
                            <span className="font-medium">{notification.username}</span> registered with email{' '}
                            <span className="font-bold text-white">{notification.email}</span>
                          </>) : (<>
                            <span className="font-medium">{notification.username}</span> requested{' '}
                            <span className="font-bold text-white">
                              {notification.amount} {notification.currency}
                            </span>
                          </>)}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>); }))}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (<div className="p-3 border-t border-gray-700 text-center">
              <button className="text-sm text-blue-400 hover:text-blue-300" onClick={function () {
                    if (onTabChange) {
                        onTabChange('pending');
                    }
                    setIsOpen(false);
                }}>
                View all transactions →
              </button>
            </div>)}
        </Card>)}
    </div>);
}
