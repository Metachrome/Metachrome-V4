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
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import faqImage from "../assets/FAQ_image-2_1755414462649.png";
import supportBannerDesktop from "../assets/support_banner_desktop.jpg";
import supportBannerMobile from "../assets/support_banner_mobile.jpg";
import ChatBot from "../components/chat/ChatBot";
import ContactAgentForm from "../components/chat/ContactAgentForm";
export default function SupportPage() {
    var _this = this;
    var _a = useState(null), expandedFaq = _a[0], setExpandedFaq = _a[1];
    var _b = useState(null), openFaq = _b[0], setOpenFaq = _b[1];
    var _c = useState(false), isChatBotOpen = _c[0], setIsChatBotOpen = _c[1];
    var _d = useState(false), isContactFormOpen = _d[0], setIsContactFormOpen = _d[1];
    var _e = useState(null), currentUser = _e[0], setCurrentUser = _e[1];
    var _f = useState(true), isLoadingUser = _f[0], setIsLoadingUser = _f[1];
    var isMobile = useIsMobile();
    useEffect(function () {
        // Get current user from session or localStorage
        console.log('Fetching current user...');
        setIsLoadingUser(true);
        // First try localStorage
        var storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                var user = JSON.parse(storedUser);
                console.log('User from localStorage:', user);
                if (user && user.id) {
                    setCurrentUser(user);
                    setIsLoadingUser(false);
                    return;
                }
            }
            catch (e) {
                console.error('Error parsing stored user:', e);
            }
        }
        // Fallback to API
        fetch('/api/auth', {
            credentials: 'include' // Include session cookies
        })
            .then(function (res) {
            console.log('User API response status:', res.status, res.ok);
            if (!res.ok) {
                throw new Error("HTTP ".concat(res.status));
            }
            return res.json();
        })
            .then(function (data) {
            console.log('User data received:', data);
            if (data && data.id) {
                setCurrentUser(data);
                // Store in localStorage for future use
                localStorage.setItem('user', JSON.stringify(data));
            }
            else {
                console.warn('No valid user data received');
            }
        })
            .catch(function (err) {
            console.error('Error fetching user:', err);
        })
            .finally(function () {
            setIsLoadingUser(false);
        });
    }, []);
    var supportOptions = [
        {
            icon: "/icon_support_email.png",
            title: "Email Us",
            description: "Email our support team for general queries or platform assistance.",
            contact: "support@metachrome.io",
            action: "Email",
            color: "from-purple-500 to-purple-600"
        },
        {
            icon: "/icon_support_livechat.png",
            title: "Live Chat",
            description: "Get in touch with our team members over Live Chat 24/7.",
            contact: "",
            action: "Live Chat",
            color: "from-purple-500 to-purple-600"
        }
    ];
    var faqs = [
        {
            question: "What is METACHROME?",
            answer: "METACHROME is a next-generation option trading platform designed to make crypto trading secure, simple, and accessible for everyone."
        },
        {
            question: "Why use METACHROME?",
            answer: "Because it's legit, easy to use, and fully integrated with Google and MetaMask. Our platform combines transparency, simplicity, and trust."
        },
        {
            question: "How to make a deposit on METACHROME?",
            answer: "You'll need a crypto wallet or exchange account. Buy USDT/BTC/ETH/SOL on your preferred exchange/wallet. Send it to your designated METACHROME wallet address. Your balance will appear automatically after confirmation."
        },
        {
            question: "How to start trading on METACHROME?",
            answer: "Once your deposit is confirmed, open the Trading Dashboard, choose your pair and duration, then place your trade."
        },
        {
            question: "Is METACHROME safe?",
            answer: "Yes. We use blockchain-based transactions, SSL encryption, and non-custodial wallet connections to keep your funds secure."
        },
        {
            question: "What assets are supported on METACHROME?",
            answer: "Currently, we only provide USDT (TRC20, ERC20, and BEP20). More assets will be added soon."
        },
        {
            question: "Do I need KYC?",
            answer: "Yes. All users are required to complete KYC verification before trading or withdrawing. This process ensures security, prevents fraud, and complies with global financial regulations."
        }
    ];
    return (<div className="min-h-[10vh] bg-[#0B0E11]">
      {/* CLEAN BANNER SECTION - ORIGINAL BANNER WITHOUT TEXT */}
      <section className={"relative overflow-hidden bg-black w-full ".concat(isMobile ? 'pt-[25px] pb-0' : 'py-8')}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Original Banner Images - Clean without embedded text */}
          <div className={"relative overflow-hidden rounded-lg ".concat(isMobile ? 'h-auto' : 'h-80')}>
            <img src={isMobile ? supportBannerMobile : supportBannerDesktop} alt="Support Banner" className="w-full h-full object-contain"/>
            {/* Optional overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Black background section for support options */}
      <section className="bg-black">
        <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ".concat(isMobile ? 'py-4' : 'py-8 sm:py-16')}>

          {/* Support Options - 2 Cards Full Width */}
          <div className={"grid gap-6 ".concat(isMobile ? 'grid-cols-1 mb-8' : 'grid-cols-1 md:grid-cols-2 gap-8 mb-20')}>
          {supportOptions.map(function (option, index) { return (<Card key={index} className="bg-[#1A1D29] border-gray-800 overflow-hidden hover:bg-[#1E2329] transition-colors rounded-xl">
              <CardContent className={"".concat(isMobile ? 'p-6' : 'p-8', " text-center h-full flex flex-col")}>
                <div className={"".concat(isMobile ? 'mb-4' : 'mb-6')}>
                  <img src={option.icon} alt={option.title} className={"mx-auto object-contain ".concat(isMobile ? 'w-12 h-12' : 'w-16 h-16')} onLoad={function () { return console.log('Support icon loaded:', option.icon); }} onError={function (e) {
                console.error('Support icon failed to load:', e.target.src);
            }}/>
                </div>
                <h3 className={"font-semibold text-white ".concat(isMobile ? 'text-lg mb-3' : 'text-xl mb-4')}>{option.title}</h3>
                <p className={"text-gray-400 leading-relaxed flex-grow ".concat(isMobile ? 'mb-4 text-sm' : 'mb-6 text-sm')}>{option.description}</p>
                {option.contact && (<p className={"text-white font-medium ".concat(isMobile ? 'mb-4 text-sm' : 'mb-6')}>{option.contact}</p>)}
                {option.title !== "Email Us" && (<Button onClick={function () { return setIsChatBotOpen(true); }} className={"w-full text-white rounded-lg font-medium hover:opacity-90 ".concat(isMobile ? 'py-2' : 'py-3')} style={{
                    backgroundColor: '#AB00FF',
                    fontSize: isMobile ? 'calc(0.875rem + 4px)' : '1rem'
                }}>
                    Live Chat
                  </Button>)}
              </CardContent>
            </Card>); })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {isMobile ? (
        /* Mobile FAQ Layout */
        <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base px-2">
                Essential information to support your trading journey.
              </p>
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48 sm:w-64 sm:h-64">
                  <img src={faqImage} alt="Crypto FAQ" className="w-full h-full object-contain"/>
                </div>
              </div>
            </div>
            <div className="space-y-4 px-2">
              {faqs.map(function (faq, index) { return (<Collapsible key={index} open={openFaq === index} onOpenChange={function () { return setOpenFaq(openFaq === index ? null : index); }}>
                  <CollapsibleTrigger asChild>
                    <Card className={"bg-black border-2 transition-all duration-300 cursor-pointer ".concat(openFaq === index
                    ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                    : 'border-gray-700 hover:border-purple-400')}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className={"font-medium pr-3 text-sm transition-colors duration-300 ".concat(openFaq === index ? 'text-purple-400' : 'text-white')}>{faq.question}</h3>
                          <ChevronDown className={"w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ".concat(openFaq === index ? 'rotate-180 text-purple-400' : '')}/>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 bg-black border-l-2 border-r-2 border-b-2 border-gray-700 rounded-b-lg">
                      <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>); })}
            </div>
          </div>) : (
        /* Desktop FAQ Layout */
        <div className="grid lg:grid-cols-2 gap-12">
            <div className="order-2 lg:order-1 p-0 m-0">
              <h2 className="text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <p className="text-gray-400 mb-0 leading-relaxed text-xl">
                Essential information to support your trading journey.
              </p>
              <div className="p-0 m-0">
                <div className="w-[564px] h-[564px] p-0 m-0">
                  <img src={faqImage} alt="Crypto FAQ" className="w-full h-full object-contain p-0 m-0 block"/>
                </div>
              </div>
            </div>
            <div className="space-y-4 order-1 lg:order-2">
              {faqs.map(function (faq, index) { return (<Collapsible key={index} open={openFaq === index} onOpenChange={function () { return setOpenFaq(openFaq === index ? null : index); }}>
                  <CollapsibleTrigger asChild>
                    <Card className={"bg-black border-2 transition-all duration-300 cursor-pointer ".concat(openFaq === index
                    ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                    : 'border-gray-700 hover:border-purple-400')}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className={"font-medium pr-4 text-lg transition-colors duration-300 ".concat(openFaq === index ? 'text-purple-400' : 'text-white')}>{faq.question}</h3>
                          <ChevronDown className={"w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ".concat(openFaq === index ? 'rotate-180 text-purple-400' : '')}/>
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-6 pb-6 bg-black border-l-2 border-r-2 border-b-2 border-gray-700 rounded-b-lg">
                      <p className="text-gray-400 text-lg">{faq.answer}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>); })}
            </div>
          </div>)}
      </section>

      {/* Chat Components */}
      {isChatBotOpen && (<ChatBot isOpen={isChatBotOpen} onClose={function () { return setIsChatBotOpen(false); }} onContactSupport={function () { return __awaiter(_this, void 0, void 0, function () {
                var user, storedUser, res, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log('=== Contact Support Clicked ===');
                            console.log('Current user state:', currentUser);
                            console.log('Is loading user:', isLoadingUser);
                            user = currentUser;
                            if (!(!user || !user.id)) return [3 /*break*/, 7];
                            console.log('User not loaded, trying localStorage...');
                            storedUser = localStorage.getItem('user');
                            if (storedUser) {
                                try {
                                    user = JSON.parse(storedUser);
                                    console.log('User from localStorage:', user);
                                    if (user && user.id) {
                                        setCurrentUser(user);
                                    }
                                    else {
                                        user = null;
                                    }
                                }
                                catch (e) {
                                    console.error('Error parsing stored user:', e);
                                    user = null;
                                }
                            }
                            if (!(!user || !user.id)) return [3 /*break*/, 7];
                            console.log('Fetching from API...');
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, , 7]);
                            return [4 /*yield*/, fetch('/api/auth')];
                        case 2:
                            res = _a.sent();
                            console.log('Fetch response:', res.status, res.ok);
                            if (!res.ok) return [3 /*break*/, 4];
                            return [4 /*yield*/, res.json()];
                        case 3:
                            user = _a.sent();
                            console.log('User fetched:', user);
                            if (user && user.id) {
                                setCurrentUser(user);
                                localStorage.setItem('user', JSON.stringify(user));
                            }
                            else {
                                console.error('Invalid user data:', user);
                                user = null;
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            console.error('Fetch failed with status:', res.status);
                            _a.label = 5;
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            err_1 = _a.sent();
                            console.error('Error fetching user:', err_1);
                            return [3 /*break*/, 7];
                        case 7:
                            if (!user || !user.id) {
                                console.error('No valid user found, showing alert');
                                alert('Please login first to contact live support');
                                return [2 /*return*/];
                            }
                            console.log('Opening contact form for user:', user.id, user.username || user.email);
                            // First open contact form, then close chatbot with delay
                            setIsContactFormOpen(true);
                            setTimeout(function () {
                                setIsChatBotOpen(false);
                            }, 100);
                            return [2 /*return*/];
                    }
                });
            }); }}/>)}

      {isContactFormOpen && (<ContactAgentForm isOpen={isContactFormOpen} onClose={function () { return setIsContactFormOpen(false); }} userEmail={(currentUser === null || currentUser === void 0 ? void 0 : currentUser.email) || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.username)} userName={(currentUser === null || currentUser === void 0 ? void 0 : currentUser.firstName) && (currentUser === null || currentUser === void 0 ? void 0 : currentUser.lastName)
                ? "".concat(currentUser.firstName, " ").concat(currentUser.lastName)
                : (currentUser === null || currentUser === void 0 ? void 0 : currentUser.username) || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.email)}/>)}


    </div>);
}
