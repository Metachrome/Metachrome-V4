import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Bot, User, Send, X, Minimize2, Maximize2 } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatBotProps {
  onContactSupport: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to render text with bold markdown
const renderTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

export default function ChatBot({ onContactSupport, isOpen, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFAQs, setShowFAQs] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addBotMessage = useCallback((text: string, delay: number = 0) => {
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    }, delay);
  }, []);

  const loadFAQs = useCallback(async () => {
    // Set fallback FAQs immediately with new content
    const fallbackFAQs = [
      {
        id: '1',
        question: 'Deposit Funds',
        answer: '→ Go to Wallet → Deposit, choose your preferred network, and send funds to the displayed address. Confirmations may take up to 24 hours. Please double-check all details before sending.\nFor further help, tap **Contact Support** below.',
        category: 'deposit'
      },
      {
        id: '2',
        question: 'Withdraw Funds',
        answer: '→ Go to Wallet → Withdraw, enter your wallet address and amount, then submit. Processing time may take up to 24 hours. Please double-check all details before confirming.\nFor further help, tap **Contact Support** below.',
        category: 'withdrawal'
      },
      {
        id: '3',
        question: 'Spot Trading',
        answer: '→ Instantly buy or sell crypto at real-time market prices. You fully own the asset once the trade is completed.\nFor further help, tap **Contact Support** below.',
        category: 'spot'
      },
      {
        id: '4',
        question: 'Options Trading',
        answer: '→ Trade short-term price movements with 8 available timeframes (30s–600s) and fixed return ratios.\nCorrect predictions earn payouts based on the option\'s return rate.\nFor further help, tap **Contact Support** below.',
        category: 'options'
      },
      {
        id: '5',
        question: 'Account Verification (KYC)',
        answer: '→ Complete your verification under Profile → Verify. Upload your valid ID (ID/Driver License/Passport) to enable trading and withdrawal features.\nThe process may take up to 24 hours — once approved, your account status will show Verified.\nFor further help, tap **Contact Support** below.',
        category: 'verification'
      },
      {
        id: '6',
        question: 'Supported Cryptocurrencies',
        answer: '→ We offer 20 tradable crypto assets available on our platform. Check the Markets page for the full list and latest updates.\nFor further help, tap **Contact Support** below.',
        category: 'general'
      }
    ];

    setFaqs(fallbackFAQs);

    try {
      const response = await fetch('/api/chat/faq');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded FAQs from API:', data);
        if (data && data.length > 0) {
          setFaqs(data.slice(0, 6)); // Show top 6 FAQs
        }
      } else {
        console.log('⚠️ FAQ API returned non-OK status, using fallback FAQs');
      }
    } catch (error) {
      console.error('❌ Error loading FAQs, using fallback:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      // Load FAQs
      loadFAQs();

      // Welcome message
      addBotMessage(
        "👋 Hello! I'm your METACHROME assistant. How can I help you today?\n\nYou can ask me common questions or click **Contact Support** to chat with our team."
      );

      setIsInitialized(true);
    }

    // Reset when chat is closed (with delay to allow transition)
    if (!isOpen && isInitialized) {
      const resetTimer = setTimeout(() => {
        setMessages([]);
        setIsInitialized(false);
        setShowFAQs(true);
        setInputMessage('');
      }, 300); // Wait for close animation

      return () => clearTimeout(resetTimer);
    }
  }, [isOpen, isInitialized, loadFAQs, addBotMessage]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFAQClick = (faq: FAQ) => {
    addUserMessage(faq.question);
    setShowFAQs(false);
    
    // Show typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    // Remove typing and show answer
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      addBotMessage(faq.answer);

      // Show FAQs again after answer
      setTimeout(() => {
        setShowFAQs(true);
      }, 1000);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    addUserMessage(inputMessage);
    const userQuestion = inputMessage.toLowerCase();
    setInputMessage('');
    setShowFAQs(false);

    // Show typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    // Simple keyword matching
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      
      let answered = false;
      
      // Check for keywords in FAQs
      for (const faq of faqs) {
        const keywords = faq.question.toLowerCase().split(' ');
        if (keywords.some(keyword => userQuestion.includes(keyword))) {
          addBotMessage(faq.answer);
          answered = true;
          break;
        }
      }

      if (!answered) {
        // Check for common keywords
        if (userQuestion.includes('deposit') || userQuestion.includes('fund')) {
          addBotMessage("To deposit funds, go to Wallet page, click Deposit, select your cryptocurrency, and send funds to the displayed address. Need more specific help?");
        } else if (userQuestion.includes('withdraw') || userQuestion.includes('cash out')) {
          addBotMessage("To withdraw, go to Wallet page, click Withdraw, enter amount and wallet address. Superadmin will approve within 24 hours. Need assistance?");
        } else if (userQuestion.includes('trade') || userQuestion.includes('trading')) {
          addBotMessage("We offer 30s (min 100 USDT, 10% profit) and 60s (min 1000 USDT, 15% profit) trading. Go to Trade page to start. Want more details?");
        } else if (userQuestion.includes('verify') || userQuestion.includes('kyc')) {
          addBotMessage("Upload your ID and proof of address in Profile > Verification. Review takes 24-48 hours. Need help with documents?");
        } else {
          addBotMessage("I'm not sure about that specific question. Would you like to contact our support team for personalized assistance?");
        }
      }

      // Offer more help
      setTimeout(() => {
        addBotMessage("Anything else I can help with?");
        setShowFAQs(true);
      }, 1000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${isMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0 md:bottom-4 md:right-4'} z-50 ${isMinimized ? 'w-auto' : 'w-full md:w-96'} ${isMinimized ? 'h-auto' : 'h-[calc(100vh-80px)] md:h-[600px]'} transition-all duration-300`}>
      <Card className="bg-[#1a1f2e] border-purple-500/30 shadow-2xl h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">METACHROME Assistant</h3>
              <p className="text-purple-200 text-xs">Online 24/7</p>
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
            <div className="flex-1 overflow-y-auto p-4 pb-4 space-y-4 bg-[#0f1419]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-purple-600' : 'bg-gray-600'}`}>
                      {message.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className={`rounded-lg p-3 ${message.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                        {message.isTyping ? (
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-line" style={{ fontSize: 'calc(0.75rem + 4px)' }}>{renderTextWithBold(message.text)}</p>
                        )}
                      </div>
                      <p className="text-gray-500 mt-1 px-1" style={{ fontSize: 'calc(0.75rem + 4px)' }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* FAQ Suggestions */}
              {showFAQs && faqs.length > 0 && (
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full text-left bg-gray-700/50 hover:bg-gray-700 text-gray-200 p-3 rounded-lg transition-colors border border-gray-600/30"
                      style={{ fontSize: 'calc(0.875rem + 4px)' }}
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              )}

              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed for mobile with bottom navigation padding */}
            <div className="p-4 pb-24 md:pb-4 bg-[#1a1f2e] border-t border-gray-700">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 text-white px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ fontSize: 'calc(0.875rem + 4px)' }}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={onContactSupport}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 text-base font-medium mb-6 md:mb-0"
              >
                Contact Support
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

