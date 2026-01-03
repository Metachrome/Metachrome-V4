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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { MessageSquare, Send, User, Search, Clock, CheckCircle, AlertCircle, XCircle, Trash2, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
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
export default function ChatManagement() {
    var _this = this;
    var _a, _b;
    var _c = useState([]), conversations = _c[0], setConversations = _c[1];
    var _d = useState(null), selectedConversation = _d[0], setSelectedConversation = _d[1];
    var _e = useState([]), messages = _e[0], setMessages = _e[1];
    var _f = useState(''), inputMessage = _f[0], setInputMessage = _f[1];
    var _g = useState(''), searchTerm = _g[0], setSearchTerm = _g[1];
    var _h = useState('all'), statusFilter = _h[0], setStatusFilter = _h[1];
    var _j = useState(false), isLoading = _j[0], setIsLoading = _j[1];
    var _k = useState(''), currentAdminId = _k[0], setCurrentAdminId = _k[1];
    var messagesEndRef = useRef(null);
    var wsRef = useRef(null);
    var toast = useToast().toast;
    useEffect(function () {
        loadCurrentAdmin();
        loadConversations();
        connectWebSocket();
        return function () {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);
    useEffect(function () {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation]);
    useEffect(function () {
        scrollToBottom();
    }, [messages]);
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    var loadCurrentAdmin = function () { return __awaiter(_this, void 0, void 0, function () {
        var authToken, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    authToken = localStorage.getItem('authToken');
                    if (!authToken) {
                        console.error('No auth token found');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('/api/auth', {
                            headers: {
                                'Authorization': "Bearer ".concat(authToken)
                            },
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setCurrentAdminId(data.id);
                    console.log('✅ Admin loaded:', data.id);
                    return [3 /*break*/, 4];
                case 3:
                    console.error('Failed to load admin:', response.status);
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error loading admin:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var connectWebSocket = function () {
        var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        var wsUrl = "".concat(protocol, "//").concat(window.location.host, "/ws");
        try {
            var ws_1 = new WebSocket(wsUrl);
            ws_1.onopen = function () {
                console.log('✅ Admin WebSocket connected');
                // Subscribe to all chat updates
                ws_1.send(JSON.stringify({
                    type: 'subscribe_admin_chat',
                    data: {}
                }));
            };
            ws_1.onmessage = function (event) {
                var _a;
                try {
                    var data_1 = JSON.parse(event.data);
                    if (data_1.type === 'new_message') {
                        // Update messages if viewing this conversation
                        if (selectedConversation && data_1.data.conversation_id === selectedConversation.id) {
                            setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [data_1.data], false); });
                        }
                        // Update conversation list
                        loadConversations();
                        // Show notification
                        toast({
                            title: "New message",
                            description: "From ".concat(((_a = data_1.data.sender) === null || _a === void 0 ? void 0 : _a.username) || 'User'),
                        });
                    }
                    else if (data_1.type === 'new_conversation') {
                        loadConversations();
                        toast({
                            title: "New conversation",
                            description: "A user has started a new chat",
                        });
                    }
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            ws_1.onerror = function (error) {
                console.error('WebSocket error:', error);
            };
            ws_1.onclose = function () {
                console.log('WebSocket disconnected, reconnecting...');
                setTimeout(connectWebSocket, 3000);
            };
            wsRef.current = ws_1;
        }
        catch (error) {
            console.error('Error connecting WebSocket:', error);
        }
    };
    var loadConversations = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/admin/chat/conversations')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setConversations(data);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error loading conversations:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var loadMessages = function (conversationId) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("/api/admin/chat/messages/".concat(conversationId))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    setMessages(data);
                    // Mark messages as read
                    return [4 /*yield*/, fetch("/api/admin/chat/mark-read/".concat(conversationId), {
                            method: 'POST'
                        })];
                case 4:
                    // Mark messages as read
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_3 = _a.sent();
                    console.error('Error loading messages:', error_3);
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleSendMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        var messageText, tempMessage, response, data_2, errorData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!inputMessage.trim() || !selectedConversation)
                        return [2 /*return*/];
                    if (!currentAdminId) {
                        console.error('❌ No admin ID available');
                        toast({
                            title: "Send Failed",
                            description: "Admin ID not loaded. Please refresh the page.",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    messageText = inputMessage;
                    setInputMessage('');
                    console.log('📤 Sending message:', {
                        conversationId: selectedConversation.id,
                        senderId: currentAdminId,
                        message: messageText
                    });
                    tempMessage = {
                        id: 'temp-' + Date.now(),
                        conversation_id: selectedConversation.id,
                        sender_id: currentAdminId,
                        sender_type: 'admin',
                        message: messageText,
                        is_read: false,
                        created_at: new Date().toISOString()
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [tempMessage], false); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, fetch('/api/admin/chat/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                conversationId: selectedConversation.id,
                                message: messageText,
                                senderId: currentAdminId,
                                senderType: 'admin'
                            })
                        })];
                case 2:
                    response = _a.sent();
                    console.log('📡 Send response:', response.status, response.ok);
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    data_2 = _a.sent();
                    console.log('✅ Message sent successfully:', data_2);
                    setMessages(function (prev) { return prev.map(function (msg) {
                        return msg.id === tempMessage.id ? data_2 : msg;
                    }); });
                    // Send via WebSocket with complete message object
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({
                            type: 'admin_message',
                            data: {
                                userId: selectedConversation.user_id,
                                message: data_2 // Send the complete message object from server response
                            }
                        }));
                        console.log('📡 WebSocket message sent to user:', selectedConversation.user_id);
                    }
                    toast({
                        title: "Message Sent",
                        description: "Your message has been sent successfully",
                    });
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.json().catch(function () { return ({ error: 'Unknown error' }); })];
                case 5:
                    errorData = _a.sent();
                    console.error('❌ Send failed:', response.status, errorData);
                    setMessages(function (prev) { return prev.filter(function (msg) { return msg.id !== tempMessage.id; }); });
                    toast({
                        title: "Send Failed",
                        description: errorData.error || "Failed to send message",
                        variant: "destructive"
                    });
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_4 = _a.sent();
                    console.error('❌ Error sending message:', error_4);
                    setMessages(function (prev) { return prev.filter(function (msg) { return msg.id !== tempMessage.id; }); });
                    toast({
                        title: "Send Failed",
                        description: "Network error. Please try again.",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteMessage = function (messageId) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Are you sure you want to delete this message?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/admin/chat/message/".concat(messageId), {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        setMessages(function (prev) { return prev.filter(function (msg) { return msg.id !== messageId; }); });
                        toast({
                            title: "Message Deleted",
                            description: "Message has been removed successfully",
                        });
                    }
                    else {
                        throw new Error('Failed to delete message');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error deleting message:', error_5);
                    toast({
                        title: "Delete Failed",
                        description: "Failed to delete message. Please try again.",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteConversation = function (conversationId, e) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.stopPropagation(); // Prevent conversation selection when clicking delete
                    if (!confirm('Are you sure you want to delete this entire conversation? This action cannot be undone.')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/admin/chat/conversation/".concat(conversationId), {
                            method: 'DELETE'
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        // Remove from conversations list
                        setConversations(function (prev) { return prev.filter(function (conv) { return conv.id !== conversationId; }); });
                        // Clear selected conversation if it was deleted
                        if ((selectedConversation === null || selectedConversation === void 0 ? void 0 : selectedConversation.id) === conversationId) {
                            setSelectedConversation(null);
                            setMessages([]);
                        }
                        toast({
                            title: "Conversation Deleted",
                            description: "Conversation and all messages have been removed successfully",
                        });
                    }
                    else {
                        throw new Error('Failed to delete conversation');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_6 = _a.sent();
                    console.error('Error deleting conversation:', error_6);
                    toast({
                        title: "Delete Failed",
                        description: "Failed to delete conversation. Please try again.",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdateStatus = function (conversationId, status) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/admin/chat/conversation/".concat(conversationId, "/status"), {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: status })
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        loadConversations();
                        if ((selectedConversation === null || selectedConversation === void 0 ? void 0 : selectedConversation.id) === conversationId) {
                            setSelectedConversation(function (prev) { return prev ? __assign(__assign({}, prev), { status: status }) : null; });
                        }
                        toast({
                            title: "Status Updated",
                            description: "Conversation marked as ".concat(status),
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    console.error('Error updating status:', error_7);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Helper function to extract image path from message
    var extractImagePath = function (message) {
        // Match all formats:
        // - Supabase Storage URL: https://...supabase.co/storage/v1/object/public/...
        // - New format: /api/uploads/contact/...
        // - Old format with subfolder: /uploads/contact/...
        // - Very old format (root): /uploads/...
        var supabaseMatch = message.match(/🔗 File: (https:\/\/[^\s\n]+supabase\.co\/storage\/[^\s\n]+)/);
        if (supabaseMatch) {
            // Direct Supabase Storage URL - use as is
            return supabaseMatch[1];
        }
        var match = message.match(/🔗 File: (\/api\/uploads\/contact\/[^\s\n]+|\/uploads\/contact\/[^\s\n]+|\/uploads\/[^\s\n]+)/);
        if (match) {
            // Convert relative path to absolute URL
            var relativePath = match[1];
            // For production (custom domain), use Railway backend URL for file uploads
            // For localhost, use local origin
            var isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            var baseUrl = isLocalhost
                ? window.location.origin
                : 'https://metachrome-v4-production.up.railway.app';
            return "".concat(baseUrl).concat(relativePath);
        }
        return null;
    };
    // Helper function to render message with image preview
    var renderMessageContent = function (message) {
        var imagePath = extractImagePath(message.message);
        var messageText = message.message;
        return (<div className="space-y-2">
        <p className="text-sm whitespace-pre-line">{messageText}</p>
        {imagePath && (<div className="mt-2 space-y-2">
            <div className="relative group">
              <img src={imagePath} alt="Attachment" className="max-w-full h-auto rounded-lg border border-gray-600 cursor-pointer hover:opacity-90 transition-opacity" onClick={function () { return window.open(imagePath, '_blank'); }} onError={function (e) {
                    console.error('Failed to load image:', imagePath);
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not found</text></svg>';
                }}/>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="bg-black/50 hover:bg-black/70 text-white" onClick={function (e) {
                    e.stopPropagation();
                    window.open(imagePath, '_blank');
                }}>
                  <ExternalLink className="w-4 h-4"/>
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={function () { return window.open(imagePath, '_blank'); }}>
                <ImageIcon className="w-3 h-3 mr-1"/>
                View Full Size
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={function () {
                    var link = document.createElement('a');
                    link.href = imagePath;
                    link.download = imagePath.split('/').pop() || 'image.jpg';
                    link.click();
                }}>
                <Download className="w-3 h-3 mr-1"/>
                Download
              </Button>
            </div>
          </div>)}
      </div>);
    };
    var filteredConversations = conversations.filter(function (conv) {
        var _a, _b, _c, _d;
        var matchesSearch = searchTerm === '' ||
            ((_b = (_a = conv.user) === null || _a === void 0 ? void 0 : _a.username) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ((_d = (_c = conv.user) === null || _c === void 0 ? void 0 : _c.email) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    var getPriorityColor = function (priority) {
        switch (priority) {
            case 'urgent': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'normal': return 'bg-blue-500';
            case 'low': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500"/>;
            case 'waiting': return <Clock className="w-4 h-4 text-yellow-500"/>;
            case 'closed': return <XCircle className="w-4 h-4 text-gray-500"/>;
            default: return <AlertCircle className="w-4 h-4 text-gray-500"/>;
        }
    };
    return (<div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Chats</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.filter(function (c) { return c.status === 'active'; }).length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-200"/>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Waiting</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.filter(function (c) { return c.status === 'waiting'; }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200"/>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Today</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.filter(function (c) {
            var today = new Date().toDateString();
            return new Date(c.created_at).toDateString() === today;
        }).length}
                </p>
              </div>
              <User className="w-8 h-8 text-green-200"/>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Unread</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.reduce(function (sum, c) { return sum + (c.unread_count || 0); }, 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-200"/>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="bg-[#1a1f2e] border-gray-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5"/>
              Conversations
            </CardTitle>
            <div className="space-y-2 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"/>
                <Input placeholder="Search users..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10 bg-gray-700 border-gray-600 text-white"/>
              </div>
              <select value={statusFilter} onChange={function (e) { return setStatusFilter(e.target.value); }} className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="waiting">Waiting</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredConversations.length === 0 ? (<div className="p-6 text-center text-gray-400">
                  No conversations found
                </div>) : (filteredConversations.map(function (conv) {
            var _a, _b;
            return (<div key={conv.id} className={"p-4 border-b border-gray-700 transition-colors relative group ".concat((selectedConversation === null || selectedConversation === void 0 ? void 0 : selectedConversation.id) === conv.id ? 'bg-purple-600/20' : 'hover:bg-gray-700/50')}>
                    {/* Delete Button - Top Right */}
                    <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 z-10" onClick={function (e) { return handleDeleteConversation(conv.id, e); }} title="Delete conversation">
                      <Trash2 className="w-4 h-4"/>
                    </Button>

                    {/* Conversation Content - Clickable */}
                    <div onClick={function () { return setSelectedConversation(conv); }} className="cursor-pointer">
                      <div className="flex items-start justify-between mb-2 pr-8">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white"/>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {((_a = conv.user) === null || _a === void 0 ? void 0 : _a.username) || ((_b = conv.user) === null || _b === void 0 ? void 0 : _b.email) || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(conv.last_message_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {getStatusIcon(conv.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={"".concat(getPriorityColor(conv.priority), " text-white text-xs")}>
                          {conv.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {conv.category}
                        </Badge>
                        {(conv.unread_count || 0) > 0 && (<Badge className="bg-red-500 text-white text-xs">
                            {conv.unread_count}
                          </Badge>)}
                      </div>
                    </div>
                  </div>);
        }))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-[#1a1f2e] border-gray-700 lg:col-span-2">
          {selectedConversation ? (<>
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {((_a = selectedConversation.user) === null || _a === void 0 ? void 0 : _a.username) || ((_b = selectedConversation.user) === null || _b === void 0 ? void 0 : _b.email)}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedConversation.category} • {selectedConversation.priority} priority
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={function () { return handleUpdateStatus(selectedConversation.id, 'active'); }} disabled={selectedConversation.status === 'active'}>
                      Active
                    </Button>
                    <Button size="sm" variant="outline" onClick={function () { return handleUpdateStatus(selectedConversation.id, 'closed'); }} disabled={selectedConversation.status === 'closed'}>
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[#0f1419]">
                  {isLoading ? (<div className="flex items-center justify-center h-full">
                      <div className="text-gray-400">Loading messages...</div>
                    </div>) : messages.length === 0 ? (<div className="flex items-center justify-center h-full text-gray-400">
                      No messages yet
                    </div>) : (messages.map(function (message) { return (<div key={message.id} className={"flex message-item ".concat(message.sender_type === 'admin' ? 'justify-end' : 'justify-start', " mb-4")}>
                        <div className={"flex gap-2 max-w-[80%] ".concat(message.sender_type === 'admin' ? 'flex-row-reverse' : 'flex-row')}>
                          <div className={"w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ".concat(message.sender_type === 'admin' ? 'bg-blue-600' :
                    message.sender_type === 'user' ? 'bg-purple-600' : 'bg-gray-600')}>
                            <User className="w-4 h-4 text-white"/>
                          </div>
                          <div className="flex-1">
                            <div className={"rounded-lg p-3 ".concat(message.sender_type === 'admin' ? 'bg-blue-600 text-white' :
                    message.sender_type === 'user' ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white')}>
                              {renderMessageContent(message)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-1">
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>); }))}
                  <div ref={messagesEndRef}/>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Input placeholder="Type your message..." value={inputMessage} onChange={function (e) { return setInputMessage(e.target.value); }} onKeyPress={function (e) { return e.key === 'Enter' && handleSendMessage(); }} className="bg-gray-700 border-gray-600 text-white"/>
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim()} className="bg-purple-600 hover:bg-purple-700">
                      <Send className="w-4 h-4"/>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>) : (<CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50"/>
                <p>Select a conversation to start chatting</p>
              </div>
            </CardContent>)}
        </Card>
      </div>
    </div>);
}
