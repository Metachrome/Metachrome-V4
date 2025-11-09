import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { User, Send, X, Minimize2, Maximize2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'bot';
  message: string;
  is_read: boolean;
  created_at: string;
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
}

interface LiveChatProps {
  userId: string;
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChat({ userId, username, isOpen, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      initializeChat();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected for chat');
        setIsConnected(true);
        
        // Subscribe to chat updates
        ws.send(JSON.stringify({
          type: 'subscribe_chat',
          data: { userId }
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_message') {
            // Add new message to the list
            setMessages(prev => [...prev, data.data]);
            
            // Play notification sound or show notification
            if (data.data.sender_type === 'admin') {
              toast({
                title: "New message from support",
                description: data.data.message.substring(0, 50) + '...',
              });
            }
          } else if (data.type === 'message_read') {
            // Update message read status
            setMessages(prev => prev.map(msg => 
              msg.id === data.data.messageId ? { ...msg, is_read: true } : msg
            ));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (isOpen) {
            connectWebSocket();
          }
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setIsConnected(false);
    }
  };

  const initializeChat = async () => {
    setIsLoading(true);
    try {
      // Get or create conversation
      const convResponse = await fetch('/api/chat/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (convResponse.ok) {
        const convData = await convResponse.json();
        setConversation(convData);

        // Load messages
        const messagesResponse = await fetch(`/api/chat/messages/${convData.id}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData);
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to support chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversation) return;

    const messageText = inputMessage;
    setInputMessage('');

    // Optimistically add message to UI
    const tempMessage: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversation_id: conversation.id,
      sender_id: userId,
      sender_type: 'user',
      message: messageText,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: messageText,
          senderId: userId,
          senderType: 'user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temp message with real one
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? data : msg
        ));

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
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        toast({
          title: "Send Failed",
          description: "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0 md:bottom-4 md:right-4'} z-50 ${isMinimized ? 'w-auto' : 'w-full md:w-96'} ${isMinimized ? 'h-auto' : 'h-full md:h-[600px]'} transition-all duration-300`}>
      <Card className="bg-[#1a1f2e] border-purple-500/30 shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center relative">
              <User className="w-6 h-6 text-white" />
              {isConnected && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">Live Support</h3>
              <p className="text-purple-200 text-xs flex items-center gap-1">
                {isConnected ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    Connecting...
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-2 rounded transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1419]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400">Loading chat...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <User className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-white font-semibold mb-2">Start a conversation</h3>
                  <p className="text-gray-400 text-sm">
                    Our support team is here to help you 24/7. Send a message to get started.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender_type === 'user' ? 'bg-purple-600' : 
                        message.sender_type === 'admin' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className={`rounded-lg p-3 ${
                          message.sender_type === 'user' ? 'bg-purple-600 text-white' : 
                          message.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
                        }`}>
                          <p className="text-sm whitespace-pre-line">{message.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-1">
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-[#1a1f2e] border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  disabled={!conversation || !isConnected}
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!conversation || !isConnected || !inputMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

