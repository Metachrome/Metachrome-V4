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
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { User, Send, X, Minimize2, Maximize2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
// Helper function to safely format timestamp
var formatMessageTime = function (timestamp) {
    if (!timestamp)
        return '';
    try {
        var date = new Date(timestamp);
        if (isNaN(date.getTime()))
            return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    catch (error) {
        console.error('Error formatting timestamp:', error);
        return '';
    }
};
export default function LiveChat(_a) {
    var _this = this;
    var userId = _a.userId, username = _a.username, isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = useState([]), messages = _b[0], setMessages = _b[1];
    var _c = useState(''), inputMessage = _c[0], setInputMessage = _c[1];
    var _d = useState(null), conversation = _d[0], setConversation = _d[1];
    var _e = useState(false), isLoading = _e[0], setIsLoading = _e[1];
    var _f = useState(false), isMinimized = _f[0], setIsMinimized = _f[1];
    var _g = useState(false), isConnected = _g[0], setIsConnected = _g[1];
    var messagesEndRef = useRef(null);
    var wsRef = useRef(null);
    var toast = useToast().toast;
    useEffect(function () {
        if (isOpen && userId) {
            initializeChat();
            connectWebSocket();
        }
        return function () {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isOpen, userId]);
    useEffect(function () {
        scrollToBottom();
    }, [messages]);
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    var connectWebSocket = function () {
        var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var wsUrl = "".concat(protocol, "//").concat(window.location.host, "/ws");
        try {
            var ws_1 = new WebSocket(wsUrl);
            ws_1.onopen = function () {
                console.log('✅ WebSocket connected for chat');
                console.log('📡 Subscribing to chat updates for userId:', userId);
                setIsConnected(true);
                // Subscribe to chat updates
                var subscribeMessage = {
                    type: 'subscribe_chat',
                    data: { userId: userId }
                };
                console.log('📤 Sending subscribe message:', subscribeMessage);
                ws_1.send(JSON.stringify(subscribeMessage));
            };
            ws_1.onmessage = function (event) {
                try {
                    var data_1 = JSON.parse(event.data);
                    console.log('📨 WebSocket message received:', data_1);
                    if (data_1.type === 'new_message') {
                        console.log('💬 New message received:', data_1.data);
                        // Add new message to the list
                        setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [data_1.data], false); });
                        // Play notification sound or show notification
                        if (data_1.data.sender_type === 'admin') {
                            console.log('🔔 Admin message notification');
                            toast({
                                title: "New message from support",
                                description: data_1.data.message.substring(0, 50) + '...',
                            });
                        }
                    }
                    else if (data_1.type === 'message_read') {
                        // Update message read status
                        setMessages(function (prev) { return prev.map(function (msg) {
                            return msg.id === data_1.data.messageId ? __assign(__assign({}, msg), { is_read: true }) : msg;
                        }); });
                    }
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            ws_1.onerror = function (error) {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };
            ws_1.onclose = function () {
                console.log('WebSocket disconnected');
                setIsConnected(false);
                // Attempt to reconnect after 3 seconds
                setTimeout(function () {
                    if (isOpen) {
                        connectWebSocket();
                    }
                }, 3000);
            };
            wsRef.current = ws_1;
        }
        catch (error) {
            console.error('Error connecting WebSocket:', error);
            setIsConnected(false);
        }
    };
    var initializeChat = function () { return __awaiter(_this, void 0, void 0, function () {
        var authToken, convResponse, convData, messagesResponse, messagesData, errorText, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setIsLoading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, 11, 12]);
                    console.log('🔄 Initializing chat for user:', userId);
                    authToken = localStorage.getItem('authToken');
                    if (!authToken) {
                        console.error('❌ No auth token found');
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('/api/chat/conversation', {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(authToken)
                            },
                            credentials: 'include'
                        })];
                case 2:
                    convResponse = _b.sent();
                    console.log('📡 Conversation response:', convResponse.status, convResponse.ok);
                    if (!convResponse.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, convResponse.json()];
                case 3:
                    convData = _b.sent();
                    console.log('✅ Conversation created/loaded:', convData);
                    setConversation(convData.conversation);
                    return [4 /*yield*/, fetch("/api/chat/messages/".concat(convData.conversation.id), {
                            headers: {
                                'Authorization': "Bearer ".concat(authToken)
                            },
                            credentials: 'include'
                        })];
                case 4:
                    messagesResponse = _b.sent();
                    if (!messagesResponse.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, messagesResponse.json()];
                case 5:
                    messagesData = _b.sent();
                    console.log('📨 Messages loaded:', ((_a = messagesData.messages) === null || _a === void 0 ? void 0 : _a.length) || 0);
                    setMessages(messagesData.messages || []);
                    _b.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, convResponse.text()];
                case 8:
                    errorText = _b.sent();
                    console.error('❌ Failed to create conversation:', convResponse.status, errorText);
                    // Create a mock conversation to allow chatting
                    console.log('⚠️ Creating mock conversation as fallback');
                    setConversation({
                        id: "temp-".concat(userId, "-").concat(Date.now()),
                        user_id: userId,
                        status: 'active',
                        priority: 'normal',
                        category: 'general',
                        last_message_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    });
                    _b.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    error_1 = _b.sent();
                    console.error('Error initializing chat:', error_1);
                    // Create a mock conversation to allow chatting even if API fails
                    console.log('⚠️ Creating mock conversation due to error');
                    setConversation({
                        id: "temp-".concat(userId, "-").concat(Date.now()),
                        user_id: userId,
                        status: 'active',
                        priority: 'normal',
                        category: 'general',
                        last_message_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    });
                    toast({
                        title: "Limited Mode",
                        description: "Chat is running in limited mode. Messages may not be saved.",
                        variant: "default"
                    });
                    return [3 /*break*/, 12];
                case 11:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    var handleSendMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        var messageText, tempMessage, authToken, response, data_2, errorText, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!inputMessage.trim() || !conversation)
                        return [2 /*return*/];
                    messageText = inputMessage;
                    setInputMessage('');
                    tempMessage = {
                        id: 'temp-' + Date.now(),
                        conversation_id: conversation.id,
                        sender_id: userId,
                        sender_type: 'user',
                        message: messageText,
                        is_read: false,
                        created_at: new Date().toISOString()
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [tempMessage], false); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    authToken = localStorage.getItem('authToken');
                    if (!authToken) {
                        console.error('❌ No auth token found');
                        toast({
                            title: "Authentication Error",
                            description: "Please login again",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('/api/chat/send', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(authToken)
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                message: messageText
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    data_2 = _a.sent();
                    console.log('✅ Message sent successfully:', data_2);
                    // Replace temp message with real one
                    setMessages(function (prev) { return prev.map(function (msg) {
                        return msg.id === tempMessage.id ? data_2.message : msg;
                    }); });
                    // Send via WebSocket for real-time delivery
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'send_message',
                            data: {
                                conversationId: conversation.id,
                                message: messageText,
                                senderId: userId,
                                senderType: 'user'
                            }
                        }));
                    }
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    errorText = _a.sent();
                    console.error('❌ Failed to send message:', response.status, errorText);
                    setMessages(function (prev) { return prev.filter(function (msg) { return msg.id !== tempMessage.id; }); });
                    toast({
                        title: "Send Failed",
                        description: "Failed to send message (".concat(response.status, "). Please try again."),
                        variant: "destructive"
                    });
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.error('Error sending message:', error_2);
                    setMessages(function (prev) { return prev.filter(function (msg) { return msg.id !== tempMessage.id; }); });
                    toast({
                        title: "Send Failed",
                        description: "Failed to send message. Please try again.",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen)
        return null;
    return (<div className={"fixed ".concat(isMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0 md:bottom-4 md:right-4', " z-50 ").concat(isMinimized ? 'w-auto' : 'w-full md:w-96', " ").concat(isMinimized ? 'h-auto' : 'h-full md:h-[600px]', " transition-all duration-300")}>
      <Card className="bg-[#1a1f2e] border-purple-500/30 shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
              <User className="w-6 h-6 text-white"/>
              {isConnected && (<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>)}
            </div>
            <div>
              <h3 className="text-white font-semibold">Live Support</h3>
              <p className="text-purple-200 text-xs flex items-center gap-1">
                {isConnected ? (<>
                    <CheckCircle className="w-3 h-3"/>
                    Connected
                  </>) : (<>
                    <AlertCircle className="w-3 h-3"/>
                    Connecting...
                  </>)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={function () { return setIsMinimized(!isMinimized); }} className="text-white hover:bg-white/20 p-2 rounded transition-colors">
              {isMinimized ? <Maximize2 className="w-4 h-4"/> : <Minimize2 className="w-4 h-4"/>}
            </button>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded transition-colors">
              <X className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {!isMinimized && (<>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1419]">
              {isLoading ? (<div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Loading chat...</div>
                </div>) : messages.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <User className="w-16 h-16 text-gray-600 mb-4"/>
                  <h3 className="text-white font-semibold mb-2">Start a conversation</h3>
                  <p className="text-gray-400 text-sm">
                    Our support team is here to help you 24/7. Send a message to get started.
                  </p>
                </div>) : (messages.map(function (message) { return (<div key={message.id} className={"flex ".concat(message.sender_type === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={"flex gap-2 max-w-[80%] ".concat(message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                      <div className={"w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ".concat(message.sender_type === 'user' ? 'bg-purple-600' :
                    message.sender_type === 'admin' ? 'bg-blue-600' : 'bg-gray-600')}>
                        <User className="w-4 h-4 text-white"/>
                      </div>
                      <div>
                        <div className={"rounded-lg p-3 ".concat(message.sender_type === 'user' ? 'bg-purple-600 text-white' :
                    message.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100')}>
                          <p className="text-sm whitespace-pre-line">{message.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-1">
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>); }))}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input */}
            <div className="p-4 bg-[#1a1f2e] border-t border-gray-700">
              <div className="flex gap-2">
                <input type="text" value={inputMessage} onChange={function (e) { return setInputMessage(e.target.value); }} onKeyPress={function (e) { return e.key === 'Enter' && !e.shiftKey && handleSendMessage(); }} placeholder="Type your message..." disabled={!conversation} className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"/>
                <Button onClick={handleSendMessage} disabled={!conversation || !inputMessage.trim()} className="bg-purple-600 hover:bg-purple-700 text-white px-4 disabled:opacity-50">
                  <Send className="w-4 h-4"/>
                </Button>
              </div>
            </div>
          </>)}
      </Card>
    </div>);
}
