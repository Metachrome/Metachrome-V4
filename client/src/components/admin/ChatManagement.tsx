import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  MessageSquare,
  Send,
  User,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
  Image as ImageIcon,
  Download,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'bot';
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    username: string;
    email: string;
  };
}

interface Conversation {
  id: string;
  user_id: string;
  status: 'active' | 'closed' | 'waiting';
  assigned_admin_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  last_message_at: string;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
  unread_count?: number;
}

// Helper function to safely format timestamp
const formatMessageTime = (timestamp: string | undefined): string => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
};

export default function ChatManagement() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentAdmin();
    loadConversations();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCurrentAdmin = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch('/api/auth', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentAdminId(data.id);
        console.log('✅ Admin loaded:', data.id);
      } else {
        console.error('Failed to load admin:', response.status);
      }
    } catch (error) {
      console.error('Error loading admin:', error);
    }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ Admin WebSocket connected');
        
        // Subscribe to all chat updates
        ws.send(JSON.stringify({
          type: 'subscribe_admin_chat',
          data: {}
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_message') {
            // Update messages if viewing this conversation
            if (selectedConversation && data.data.conversation_id === selectedConversation.id) {
              setMessages(prev => [...prev, data.data]);
            }
            
            // Update conversation list
            loadConversations();
            
            // Show notification
            toast({
              title: "New message",
              description: `From ${data.data.sender?.username || 'User'}`,
            });
          } else if (data.type === 'new_conversation') {
            loadConversations();
            toast({
              title: "New conversation",
              description: "A user has started a new chat",
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/admin/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/chat/messages/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        await fetch(`/api/admin/chat/mark-read/${conversationId}`, {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedConversation) return;

    if (!currentAdminId) {
      console.error('❌ No admin ID available');
      toast({
        title: "Send Failed",
        description: "Admin ID not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    const messageText = inputMessage;
    setInputMessage('');

    console.log('📤 Sending message:', {
      conversationId: selectedConversation.id,
      senderId: currentAdminId,
      message: messageText
    });

    // Optimistically add message
    const tempMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: selectedConversation.id,
      sender_id: currentAdminId,
      sender_type: 'admin',
      message: messageText,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/admin/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          message: messageText,
          senderId: currentAdminId,
          senderType: 'admin'
        })
      });

      console.log('📡 Send response:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Message sent successfully:', data);
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? data : msg
        ));

        // Send via WebSocket with complete message object
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'admin_message',
            data: {
              userId: selectedConversation.user_id,
              message: data // Send the complete message object from server response
            }
          }));
          console.log('📡 WebSocket message sent to user:', selectedConversation.user_id);
        }

        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Send failed:', response.status, errorData);
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        toast({
          title: "Send Failed",
          description: errorData.error || "Failed to send message",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast({
        title: "Send Failed",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/chat/message/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        toast({
          title: "Message Deleted",
          description: "Message has been removed successfully",
        });
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection when clicking delete

    if (!confirm('Are you sure you want to delete this entire conversation? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/chat/conversation/${conversationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from conversations list
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));

        // Clear selected conversation if it was deleted
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }

        toast({
          title: "Conversation Deleted",
          description: "Conversation and all messages have been removed successfully",
        });
      } else {
        throw new Error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStatus = async (conversationId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/chat/conversation/${conversationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadConversations();
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => prev ? { ...prev, status: status as any } : null);
        }
        toast({
          title: "Status Updated",
          description: `Conversation marked as ${status}`,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Helper function to extract image path from message
  const extractImagePath = (message: string): string | null => {
    // Match all formats:
    // - New format: /api/uploads/contact/...
    // - Old format with subfolder: /uploads/contact/...
    // - Very old format (root): /uploads/...
    const match = message.match(/🔗 File: (\/api\/uploads\/contact\/[^\s\n]+|\/uploads\/contact\/[^\s\n]+|\/uploads\/[^\s\n]+)/);
    if (match) {
      // Convert relative path to absolute URL
      const relativePath = match[1];
      // Use window.location.origin to get the base URL (works for both localhost and production)
      return `${window.location.origin}${relativePath}`;
    }
    return null;
  };

  // Helper function to render message with image preview
  const renderMessageContent = (message: ChatMessage) => {
    const imagePath = extractImagePath(message.message);
    const messageText = message.message;

    return (
      <div className="space-y-2">
        <p className="text-sm whitespace-pre-line">{messageText}</p>
        {imagePath && (
          <div className="mt-2 space-y-2">
            <div className="relative group">
              <img
                src={imagePath}
                alt="Attachment"
                className="max-w-full h-auto rounded-lg border border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(imagePath, '_blank')}
                onError={(e) => {
                  console.error('Failed to load image:', imagePath);
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" fill="gray">Image not found</text></svg>';
                }}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-black/50 hover:bg-black/70 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(imagePath, '_blank');
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => window.open(imagePath, '_blank')}
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                View Full Size
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imagePath;
                  link.download = imagePath.split('/').pop() || 'image.jpg';
                  link.click();
                }}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waiting': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Chats</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.filter(c => c.status === 'active').length}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Waiting</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.filter(c => c.status === 'waiting').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Today</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.filter(c => {
                    const today = new Date().toDateString();
                    return new Date(c.created_at).toDateString() === today;
                  }).length}
                </p>
              </div>
              <User className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Unread</p>
                <p className="text-3xl font-bold text-white">
                  {conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-200" />
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
              <MessageSquare className="w-5 h-5" />
              Conversations
            </CardTitle>
            <div className="space-y-2 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="waiting">Waiting</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  No conversations found
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 border-b border-gray-700 transition-colors relative group ${
                      selectedConversation?.id === conv.id ? 'bg-purple-600/20' : 'hover:bg-gray-700/50'
                    }`}
                  >
                    {/* Delete Button - Top Right */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 z-10"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    {/* Conversation Content - Clickable */}
                    <div
                      onClick={() => setSelectedConversation(conv)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2 pr-8">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {conv.user?.username || conv.user?.email || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(conv.last_message_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {getStatusIcon(conv.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPriorityColor(conv.priority)} text-white text-xs`}>
                          {conv.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {conv.category}
                        </Badge>
                        {(conv.unread_count || 0) > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-[#1a1f2e] border-gray-700 lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">
                      {selectedConversation.user?.username || selectedConversation.user?.email}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedConversation.category} • {selectedConversation.priority} priority
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedConversation.id, 'active')}
                      disabled={selectedConversation.status === 'active'}
                    >
                      Active
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedConversation.id, 'closed')}
                      disabled={selectedConversation.status === 'closed'}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[#0f1419]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-gray-400">Loading messages...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No messages yet
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex message-item ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'} mb-4`}
                      >
                        <div className={`flex gap-2 max-w-[80%] ${message.sender_type === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.sender_type === 'admin' ? 'bg-blue-600' :
                            message.sender_type === 'user' ? 'bg-purple-600' : 'bg-gray-600'
                          }`}>
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className={`rounded-lg p-3 ${
                              message.sender_type === 'admin' ? 'bg-blue-600 text-white' :
                              message.sender_type === 'user' ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white'
                            }`}>
                              {renderMessageContent(message)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 px-1">
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

