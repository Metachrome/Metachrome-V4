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
import { useEffect, useState, useRef } from 'react';
import { Badge } from '../ui/badge';
export default function ChatNotificationBadge(_a) {
    var _this = this;
    var onUnreadCountChange = _a.onUnreadCountChange;
    var _b = useState(0), unreadCount = _b[0], setUnreadCount = _b[1];
    var wsRef = useRef(null);
    var audioRef = useRef(null);
    useEffect(function () {
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
        return function () {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);
    useEffect(function () {
        if (onUnreadCountChange) {
            onUnreadCountChange(unreadCount);
        }
    }, [unreadCount, onUnreadCountChange]);
    var fetchUnreadCount = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/admin/chat/unread-count')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setUnreadCount(data.count || 0);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error fetching unread count:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var connectWebSocket = function () {
        var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var wsUrl = "".concat(protocol, "//").concat(window.location.host, "/ws");
        try {
            var ws_1 = new WebSocket(wsUrl);
            ws_1.onopen = function () {
                console.log('✅ Chat notification WebSocket connected');
                // Subscribe to admin chat updates
                ws_1.send(JSON.stringify({
                    type: 'subscribe_admin_chat',
                    data: {}
                }));
            };
            ws_1.onmessage = function (event) {
                try {
                    var data = JSON.parse(event.data);
                    if (data.type === 'new_message' && data.data.sender_type === 'user') {
                        // Increment unread count
                        setUnreadCount(function (prev) { return prev + 1; });
                        // Play notification sound
                        playNotificationSound();
                        // Show browser notification
                        showBrowserNotification(data.data);
                    }
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            ws_1.onerror = function (error) {
                console.error('Chat notification WebSocket error:', error);
            };
            ws_1.onclose = function () {
                console.log('Chat notification WebSocket disconnected, reconnecting...');
                setTimeout(connectWebSocket, 3000);
            };
            wsRef.current = ws_1;
        }
        catch (error) {
            console.error('Error connecting chat notification WebSocket:', error);
        }
    };
    var playNotificationSound = function () {
        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(function (err) {
                    console.log('Could not play notification sound:', err);
                });
            }
        }
        catch (error) {
            console.error('Error playing notification sound:', error);
        }
    };
    var showBrowserNotification = function (messageData) {
        var _a;
        if ('Notification' in window && Notification.permission === 'granted') {
            var notification_1 = new Notification('New Chat Message', {
                body: "".concat(messageData.sender_username || 'User', ": ").concat(((_a = messageData.message) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) || 'New message'),
                icon: '/new-metachrome-logo.png',
                badge: '/new-metachrome-logo.png',
                tag: 'chat-notification',
                requireInteraction: false
            });
            notification_1.onclick = function () {
                window.focus();
                notification_1.close();
            };
            // Auto close after 5 seconds
            setTimeout(function () { return notification_1.close(); }, 5000);
        }
    };
    if (unreadCount === 0) {
        return null;
    }
    return (<Badge variant="destructive" className="ml-2 bg-red-600 text-white animate-pulse">
      {unreadCount > 99 ? '99+' : unreadCount}
    </Badge>);
}
