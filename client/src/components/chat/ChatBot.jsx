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
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Bot, User, Send, X, Minimize2, Maximize2 } from 'lucide-react';
// Helper function to render text with bold markdown
var renderTextWithBold = function (text) {
    var parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map(function (part, index) {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
    });
};
export default function ChatBot(_a) {
    var _this = this;
    var onContactSupport = _a.onContactSupport, isOpen = _a.isOpen, onClose = _a.onClose;
    var _b = useState([]), messages = _b[0], setMessages = _b[1];
    var _c = useState(''), inputMessage = _c[0], setInputMessage = _c[1];
    var _d = useState([]), faqs = _d[0], setFaqs = _d[1];
    var _e = useState(false), isMinimized = _e[0], setIsMinimized = _e[1];
    var _f = useState(true), showFAQs = _f[0], setShowFAQs = _f[1];
    var _g = useState(false), isInitialized = _g[0], setIsInitialized = _g[1];
    var messagesEndRef = useRef(null);
    var addBotMessage = useCallback(function (text, delay) {
        if (delay === void 0) { delay = 0; }
        setTimeout(function () {
            var newMessage = {
                id: Date.now().toString(),
                text: text,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newMessage], false); });
        }, delay);
    }, []);
    var loadFAQs = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var fallbackFAQs, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fallbackFAQs = [
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
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/chat/faq')];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    console.log('✅ Loaded FAQs from API:', data);
                    if (data && data.length > 0) {
                        setFaqs(data.slice(0, 6)); // Show top 6 FAQs
                    }
                    return [3 /*break*/, 5];
                case 4:
                    console.log('⚠️ FAQ API returned non-OK status, using fallback FAQs');
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ Error loading FAQs, using fallback:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    useEffect(function () {
        if (isOpen && !isInitialized) {
            // Load FAQs
            loadFAQs();
            // Welcome message
            addBotMessage("👋 Hello! I'm your METACHROME assistant. How can I help you today?\n\nYou can ask me common questions or click **Contact Support** to chat with our team.");
            setIsInitialized(true);
        }
        // Reset when chat is closed (with delay to allow transition)
        if (!isOpen && isInitialized) {
            var resetTimer_1 = setTimeout(function () {
                setMessages([]);
                setIsInitialized(false);
                setShowFAQs(true);
                setInputMessage('');
            }, 300); // Wait for close animation
            return function () { return clearTimeout(resetTimer_1); };
        }
    }, [isOpen, isInitialized, loadFAQs, addBotMessage]);
    // Auto-scroll to bottom when messages change
    useEffect(function () {
        var _a;
        if (messages.length > 0) {
            (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    var addUserMessage = function (text) {
        var newMessage = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newMessage], false); });
    };
    var handleFAQClick = function (faq) {
        addUserMessage(faq.question);
        setShowFAQs(false);
        // Show typing indicator
        var typingMessage = {
            id: 'typing',
            text: '',
            sender: 'bot',
            timestamp: new Date(),
            isTyping: true
        };
        setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [typingMessage], false); });
        // Remove typing and show answer
        setTimeout(function () {
            setMessages(function (prev) { return prev.filter(function (m) { return m.id !== 'typing'; }); });
            addBotMessage(faq.answer);
            // Show FAQs again after answer
            setTimeout(function () {
                setShowFAQs(true);
            }, 1000);
        }, 1500);
    };
    var handleSendMessage = function () {
        if (!inputMessage.trim())
            return;
        addUserMessage(inputMessage);
        var userQuestion = inputMessage.toLowerCase();
        setInputMessage('');
        setShowFAQs(false);
        // Show typing indicator
        var typingMessage = {
            id: 'typing',
            text: '',
            sender: 'bot',
            timestamp: new Date(),
            isTyping: true
        };
        setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [typingMessage], false); });
        // Simple keyword matching
        setTimeout(function () {
            setMessages(function (prev) { return prev.filter(function (m) { return m.id !== 'typing'; }); });
            var answered = false;
            // Check for keywords in FAQs
            for (var _i = 0, faqs_1 = faqs; _i < faqs_1.length; _i++) {
                var faq = faqs_1[_i];
                var keywords = faq.question.toLowerCase().split(' ');
                if (keywords.some(function (keyword) { return userQuestion.includes(keyword); })) {
                    addBotMessage(faq.answer);
                    answered = true;
                    break;
                }
            }
            if (!answered) {
                // Check for common keywords
                if (userQuestion.includes('deposit') || userQuestion.includes('fund')) {
                    addBotMessage("To deposit funds, go to Wallet page, click Deposit, select your cryptocurrency, and send funds to the displayed address. Need more specific help?");
                }
                else if (userQuestion.includes('withdraw') || userQuestion.includes('cash out')) {
                    addBotMessage("To withdraw, go to Wallet page, click Withdraw, enter amount and wallet address. Superadmin will approve within 24 hours. Need assistance?");
                }
                else if (userQuestion.includes('trade') || userQuestion.includes('trading')) {
                    addBotMessage("We offer 30s (min 100 USDT, 10% profit) and 60s (min 1000 USDT, 15% profit) trading. Go to Trade page to start. Want more details?");
                }
                else if (userQuestion.includes('verify') || userQuestion.includes('kyc')) {
                    addBotMessage("Upload your ID and proof of address in Profile > Verification. Review takes 24-48 hours. Need help with documents?");
                }
                else {
                    addBotMessage("I'm not sure about that specific question. Would you like to contact our support team for personalized assistance?");
                }
            }
            // Offer more help
            setTimeout(function () {
                addBotMessage("Anything else I can help with?");
                setShowFAQs(true);
            }, 1000);
        }, 1500);
    };
    if (!isOpen)
        return null;
    return (<div className={"fixed ".concat(isMinimized ? 'bottom-4 right-4' : 'bottom-0 right-0 md:bottom-4 md:right-4', " z-50 ").concat(isMinimized ? 'w-auto' : 'w-full md:w-96', " ").concat(isMinimized ? 'h-auto' : 'h-[calc(100vh-80px)] md:h-[600px]', " transition-all duration-300")}>
      <Card className="bg-[#1a1f2e] border-purple-500/30 shadow-2xl h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white"/>
            </div>
            <div>
              <h3 className="text-white font-semibold">METACHROME Assistant</h3>
              <p className="text-purple-200 text-xs">Online 24/7</p>
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
            <div className="flex-1 overflow-y-auto p-4 pb-4 space-y-4 bg-[#0f1419]">
              {messages.map(function (message) { return (<div key={message.id} className={"flex ".concat(message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={"flex gap-2 max-w-[80%] ".concat(message.sender === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                    <div className={"w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ".concat(message.sender === 'user' ? 'bg-purple-600' : 'bg-gray-600')}>
                      {message.sender === 'user' ? <User className="w-4 h-4 text-white"/> : <Bot className="w-4 h-4 text-white"/>}
                    </div>
                    <div>
                      <div className={"rounded-lg p-3 ".concat(message.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-100')}>
                        {message.isTyping ? (<div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>) : (<p className="whitespace-pre-line" style={{ fontSize: 'calc(0.75rem + 4px)' }}>{renderTextWithBold(message.text)}</p>)}
                      </div>
                      <p className="text-gray-500 mt-1 px-1" style={{ fontSize: 'calc(0.75rem + 4px)' }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>); })}

              {/* FAQ Suggestions */}
              {showFAQs && faqs.length > 0 && (<div className="space-y-2">
                  {faqs.map(function (faq) { return (<button key={faq.id} onClick={function () { return handleFAQClick(faq); }} className="w-full text-left bg-gray-700/50 hover:bg-gray-700 text-gray-200 p-3 rounded-lg transition-colors border border-gray-600/30" style={{ fontSize: 'calc(0.875rem + 4px)' }}>
                      {faq.question}
                    </button>); })}
                </div>)}

              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef}/>
            </div>

            {/* Input - Fixed for mobile with bottom navigation padding */}
            <div className="p-4 pb-24 md:pb-4 bg-[#1a1f2e] border-t border-gray-700">
              <div className="flex gap-2 mb-3">
                <input type="text" value={inputMessage} onChange={function (e) { return setInputMessage(e.target.value); }} onKeyPress={function (e) { return e.key === 'Enter' && handleSendMessage(); }} placeholder="Type your message..." className="flex-1 bg-gray-700 text-white px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" style={{ fontSize: 'calc(0.875rem + 4px)' }}/>
                <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-4">
                  <Send className="w-4 h-4"/>
                </Button>
              </div>
              <Button onClick={onContactSupport} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 text-base font-medium mb-2 md:mb-0">
                Contact Support
              </Button>
            </div>
          </>)}
      </Card>
    </div>);
}
