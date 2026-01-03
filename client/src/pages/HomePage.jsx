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
import { Input } from "../components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "../hooks/use-mobile";
import { MobileHero } from "../components/ui/mobile-hero";
import heroDesktopImage from "../assets/hero-desktop_1754552987909.jpg";
import speakerIcon from "../assets/speaker_icon.png";
import newMetachromeCard from "../assets/new-metachrome-card.png";
import faqImage from "../assets/FAQ_image-2_1755414462649.png";
import featureImage01 from "../assets/featureimage01_1754552987907.png";
import featureImage02 from "../assets/featureimage02_1754552987908.png";
import featureImage03 from "../assets/featureimage03_1754552987909.png";
import emailsbImage from "../assets/emailsb_1754552987905.png";
import { useCryptoData } from "../services/cryptoDataService";
export default function HomePage() {
    var _this = this;
    var _a = useState(null), openFaq = _a[0], setOpenFaq = _a[1];
    var _b = useState(""), email = _b[0], setEmail = _b[1];
    var _c = useLocation(), setLocation = _c[1];
    var isMobile = useIsMobile();
    // Use real-time cryptocurrency data
    var _d = useCryptoData(), cryptoData = _d.cryptoData, loading = _d.loading, error = _d.error, retry = _d.retry, forceRefresh = _d.forceRefresh;
    // Fetch top gainers from our CoinMarketCap endpoint
    var _e = useState([
        { symbol: "BTC", price: "$43,250", change: "+2.34%", color: "bg-orange-500" },
        { symbol: "ETH", price: "$2,650", change: "+1.89%", color: "bg-blue-500" },
        { symbol: "BNB", price: "$315", change: "+0.89%", color: "bg-yellow-500" },
        { symbol: "SOL", price: "$245", change: "+3.45%", color: "bg-purple-500" },
    ]), topGainers = _e[0], setTopGainers = _e[1];
    // Fetch top gainers data
    var fetchTopGainers = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/market-data/top-gainers')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setTopGainers(data);
                    console.log('✅ Top gainers data updated from CoinMarketCap');
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log('⚠️ Using fallback top gainers data:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Update top gainers every 2 minutes
    useEffect(function () {
        fetchTopGainers();
        var interval = setInterval(fetchTopGainers, 120000); // 2 minutes
        return function () { return clearInterval(interval); };
    }, []);
    var features = [
        {
            icon: featureImage01,
            title: "Fast Execution",
            description: "Experience blazing-fast trade performance and experience."
        },
        {
            icon: featureImage02,
            title: "Secure Wallets",
            description: "Your assets are protected with top-level security protocols."
        },
        {
            icon: featureImage03,
            title: "Real-Time Updates",
            description: "Stay updated with real-time charts and market data."
        }
    ];
    var roadmapItems = [
        { title: "Create Your Account", description: "Join in seconds, secure, and built for all traders." },
        { title: "Verify & Activate", description: "Unlock full access with multi-layered protection." },
        { title: "Deposit / Buy Crypto", description: "Top up with flexible options, ready to deploy instantly." },
        { title: "Trade", description: "Experience deep liquidity, real-time insights, and refined execution." }
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
    var handleNewsletterSubmit = function (e) {
        e.preventDefault();
        console.log("Newsletter signup:", email);
        setEmail("");
    };
    // Mobile layout - Same content as desktop, mobile-responsive
    if (isMobile) {
        return (<div className="min-h-screen bg-[#0D0B1F] text-white">
        {/* Mobile Hero Section */}
        <MobileHero />

        {/* Running Text Ticker Section - Mobile */}
        <section className="bg-gradient-to-r from-blue-600/20 to-blue-500/30 border-y border-blue-500/30 relative overflow-hidden" style={{ height: '56px' }}>
          <div className="px-4 h-full">
            <div className="flex items-center h-full gap-2">
              {/* Announcement Icon */}
              <div className="flex-shrink-0">
                <img src={speakerIcon} alt="Announcement" className="w-5 h-5"/>
              </div>

              {/* Scrolling Text */}
              <div className="flex-1 overflow-hidden relative">
                <style>{"\n                  @keyframes mobile-scroll-fast {\n                    0% {\n                      transform: translate3d(0, 0, 0);\n                      -webkit-transform: translate3d(0, 0, 0);\n                    }\n                    100% {\n                      transform: translate3d(-50%, 0, 0);\n                      -webkit-transform: translate3d(-50%, 0, 0);\n                    }\n                  }\n                  @-webkit-keyframes mobile-scroll-fast {\n                    0% { -webkit-transform: translate3d(0, 0, 0); }\n                    100% { -webkit-transform: translate3d(-50%, 0, 0); }\n                  }\n                  .mobile-ticker-wrapper {\n                    display: inline-flex;\n                    animation: mobile-scroll-fast 23s linear infinite;\n                    -webkit-animation: mobile-scroll-fast 23s linear infinite;\n                    will-change: transform;\n                    backface-visibility: hidden;\n                    -webkit-backface-visibility: hidden;\n                  }\n                  .mobile-ticker-item {\n                    flex-shrink: 0;\n                    padding-right: 3rem;\n                    white-space: nowrap;\n                    display: inline-block;\n                  }\n                "}</style>
                <div className="mobile-ticker-wrapper">
                  <div className="mobile-ticker-item text-white text-sm font-medium">
                    Metachrome introduces seamless trading built for speed and precision  •  Crypto market cap expands almost 5% in 24 hours  •  Bitcoin surges past key resistance traders eye the next breakout  •  Ethereum momentum builds smart money is already in  •  Market opportunities don't wait execute faster with Metachrome
                  </div>
                  <div className="mobile-ticker-item text-white text-sm font-medium">
                    Metachrome introduces seamless trading built for speed and precision  •  Crypto market cap expands almost 5% in 24 hours  •  Bitcoin surges past key resistance traders eye the next breakout  •  Ethereum momentum builds smart money is already in  •  Market opportunities don't wait execute faster with Metachrome
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Currency List Section - Mobile */}
        <section className="px-4 py-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-2">Currency List</h2>
            <p className="text-gray-400 text-sm">Real-time market data • Updates every minute</p>
            {loading && <p className="text-blue-400 text-sm mt-2">Loading real-time data...</p>}
            {error && (<div className="flex items-center gap-2 mt-2">
                <p className="text-yellow-400 text-sm">Using cached data • Real-time updates temporarily unavailable</p>
                <button onClick={retry} className="text-blue-400 text-sm underline hover:text-blue-300">
                  Retry
                </button>
              </div>)}
          </div>

          <Card className="bg-[#1a1340]/80 border-purple-800/30 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-800/30">
                      <th className="text-left p-3 font-medium text-gray-400 text-xs">Name</th>
                      <th className="text-left p-3 font-medium text-gray-400 text-xs">Price</th>
                      <th className="text-left p-3 font-medium text-gray-400 text-xs">24h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map(function (_, index) { return (<tr key={index} className="border-b border-purple-800/20">
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-700 rounded-full animate-pulse"></div>
                              <div>
                                <div className="h-3 bg-gray-700 rounded animate-pulse mb-1 w-12"></div>
                                <div className="h-2 bg-gray-700 rounded animate-pulse w-8"></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3"><div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div></td>
                          <td className="p-3"><div className="h-3 bg-gray-700 rounded animate-pulse w-10"></div></td>
                        </tr>); })) : (cryptoData.slice(0, 12).map(function (crypto) { return (<tr key={crypto.symbol} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-purple-500/30">
                              <img src={crypto.image || "https://cryptoicons.org/api/icon/".concat(crypto.symbol.split('/')[0].toLowerCase(), "/200")} alt={crypto.name} className="w-6 h-6 object-contain" onError={function (e) {
                    var target = e.currentTarget;
                    target.style.display = 'none';
                    var fallback = target.nextElementSibling;
                    if (fallback)
                        fallback.style.display = 'flex';
                }}/>
                              <span className="text-white font-bold text-xs hidden">
                                {crypto.symbol.split('/')[0].charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">{crypto.symbol}</div>
                              <div className="text-xs text-gray-400">{crypto.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-white font-medium text-sm">{crypto.price}</td>
                        <td className="p-3">
                          <div className={"flex items-center space-x-1 ".concat(crypto.isPositive ? 'text-green-400' : 'text-red-400')}>
                            {crypto.isPositive ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                            <span className="font-medium text-xs">{crypto.change}</span>
                          </div>
                        </td>
                      </tr>); }))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Top Gainers Section - Mobile */}
        <section className="px-4 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-left">Top Gainers</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {topGainers.map(function (coin) { return (<Card key={coin.symbol} className="bg-[#1E1E2E] border-[#2A2A3E] backdrop-blur-sm hover:bg-[#252537] transition-all duration-300 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <div className={"w-8 h-8 ".concat(coin.color, " rounded-full flex items-center justify-center")}>
                      <span className="text-white font-bold text-xs">{coin.symbol}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">{coin.symbol}</span>
                      <span className="text-gray-400 text-xs">{coin.price.replace('$', '')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-green-400 font-bold text-sm">{coin.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>); })}
          </div>
        </section>

        {/* Metachrome Features - Mobile */}
        <section className="px-4 py-8">
          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-white mb-4">Metachrome Features</h2>
          </div>
          <div className="space-y-6">
            {features.map(function (feature, index) { return (<Card key={index} className="bg-[#1B1B2F] border-[#3B82F6]/30 backdrop-blur-sm hover:border-[#3B82F6]/60 transition-all duration-300 rounded-3xl">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-6">
                    <img src={feature.icon} alt={feature.title} className="w-32 h-32 object-contain"/>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{feature.description}</p>
                </CardContent>
              </Card>); })}
          </div>
        </section>

        {/* A New Era Begins - Mobile */}
        <section className="bg-black py-12">
          <div className="px-4">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">A New Era Begins</h2>
                <p className="text-gray-400 mb-8 text-base leading-relaxed">Explore the future of trading—smart, secure, and accessible for everyone.</p>
                <div className="space-y-6">
                  {roadmapItems.map(function (item, index) { return (<div key={index} className="flex items-start space-x-3 relative">
                      <div className="relative flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-black z-10">
                          {index + 1}
                        </div>
                        {index < roadmapItems.length - 1 && (<div className="w-0.5 h-12 bg-gray-600 mt-3"></div>)}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
                      </div>
                    </div>); })}
                </div>
              </div>
              <div className="flex justify-center">
                <img src={newMetachromeCard} alt="METACHROME" className="w-auto h-auto max-w-full"/>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - Mobile */}
        <section className="px-4 py-8">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-400 mb-6 leading-relaxed text-base">
                Essential information to support your trading journey.
              </p>
              <div className="flex justify-center mb-8">
                <div className="w-64 h-64">
                  <img src={faqImage} alt="Crypto FAQ" className="w-full h-full object-contain"/>
                </div>
              </div>
            </div>
            <div className="space-y-4">
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
                      <p className="text-gray-400 text-sm">{faq.answer}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>); })}
            </div>
          </div>
        </section>

        {/* Newsletter Section - Mobile */}
        <section className="bg-black py-8">
          <div className="px-4">
            <Card className="bg-gray-800 border-0 rounded-2xl shadow-2xl">
              <CardContent className="p-6">
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="relative">
                      <img src={emailsbImage} alt="Newsletter Chart" className="w-full max-w-xs h-auto object-contain"/>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Get Started For Free</p>
                    <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                      Subscribe our newsletter &<br />
                      Stay Update Every Day
                    </h2>
                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-3">
                      <Input type="email" placeholder="Enter you email" value={email} onChange={function (e) { return setEmail(e.target.value); }} className="bg-black border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 h-10 rounded-lg"/>
                      <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 h-10 font-semibold rounded-lg">
                        Submit
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>);
    }
    // Desktop layout (existing)
    return (<div className="min-h-screen bg-[#0D0B1F] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black py-6">
        {/* Hero Image Banner - Full width with minimal padding for better proportions */}
        <div className="w-full px-4">
          <div className="relative max-w-6xl mx-auto">
            <img src={heroDesktopImage} alt="METACHROME Hero Banner - We believe in the future" className="w-full h-auto object-cover rounded-lg" style={{ maxHeight: '400px', objectFit: 'cover' }}/>

            {/* Start Trading Button Overlay - Positioned right below the text */}
            <div className="absolute top-80 left-40 z-20">
              <Button onClick={function () { return setLocation("/trade/options"); }} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-lg text-lg font-semibold border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
                Start Trading
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Running Text Ticker Section */}
      <section className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border-y border-blue-500/30 relative overflow-hidden" style={{ height: '60px' }}>
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center h-full gap-3">
            {/* Announcement Icon */}
            <div className="flex-shrink-0">
              <img src={speakerIcon} alt="Announcement" className="w-6 h-6"/>
            </div>

            {/* Scrolling Text */}
            <div className="flex-1 overflow-hidden">
              <div className="whitespace-nowrap animate-scroll">
                <span className="text-white text-base font-medium">
                  Metachrome introduces seamless trading built for speed and precision  •  Crypto market cap expands almost 5% in 24 hours  •  Bitcoin surges past key resistance traders eye the next breakout  •  Ethereum momentum builds smart money is already in  •  Market opportunities don't wait execute faster with Metachrome  •  Metachrome introduces seamless trading built for speed and precision  •  Crypto market cap expands almost 5% in 24 hours  •  Bitcoin surges past key resistance traders eye the next breakout  •  Ethereum momentum builds smart money is already in
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Currency List Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Currency List</h2>
          <p className="text-gray-400 text-sm">Real-time market data • Updates every minute</p>
          {loading && <p className="text-blue-400 text-sm mt-2">Loading real-time data...</p>}
          {error && (<div className="flex items-center gap-2 mt-2">
              <p className="text-yellow-400 text-sm">Using cached data • Real-time updates temporarily unavailable</p>
              <button onClick={retry} className="text-blue-400 text-sm underline hover:text-blue-300">
                Retry
              </button>
            </div>)}
        </div>

        <Card className="bg-[#1a1340]/80 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-800/30">
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">Name</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">Last Price</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">24h Change</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">24h High</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">24h Low</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
        // Loading skeleton rows
        Array.from({ length: 5 }).map(function (_, index) { return (<tr key={index} className="border-b border-purple-800/20">
                        <td className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                            <div>
                              <div className="h-4 bg-gray-700 rounded animate-pulse mb-1 w-20"></div>
                              <div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div></td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-16"></div></td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div></td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div></td>
                      </tr>); })) : (cryptoData.map(function (crypto) { return (<tr key={crypto.symbol} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-purple-500/30">
                            <img src={crypto.image || "https://cryptoicons.org/api/icon/".concat(crypto.symbol.split('/')[0].toLowerCase(), "/200")} alt={crypto.name} className="w-9 h-9 object-contain" onError={function (e) {
                var target = e.currentTarget;
                target.style.display = 'none';
                var fallback = target.nextElementSibling;
                if (fallback)
                    fallback.style.display = 'flex';
            }}/>
                            <span className="text-white font-bold text-sm hidden">
                              {crypto.symbol.split('/')[0].charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{crypto.symbol}</div>
                            <div className="text-sm text-gray-400">{crypto.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-white font-medium">{crypto.price}</td>
                      <td className="p-6">
                        <div className={"flex items-center space-x-1 ".concat(crypto.isPositive ? 'text-green-400' : 'text-red-400')}>
                          {crypto.isPositive ? <TrendingUp className="w-4 h-4"/> : <TrendingDown className="w-4 h-4"/>}
                          <span className="font-medium">{crypto.change}</span>
                        </div>
                      </td>
                      <td className="p-6 text-gray-300">{crypto.high}</td>
                      <td className="p-6 text-gray-300">{crypto.low}</td>
                    </tr>); }))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Top Gainers Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-left">Top Gainers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topGainers.map(function (coin) { return (<Card key={coin.symbol} className="bg-[#1E1E2E] border-[#2A2A3E] backdrop-blur-sm hover:bg-[#252537] transition-all duration-300 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className={"w-12 h-12 ".concat(coin.color, " rounded-full flex items-center justify-center")}>
                    <span className="text-white font-bold text-sm">{coin.symbol}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg">{coin.symbol}</span>
                    <span className="text-gray-400 text-sm">{coin.price.replace('$', '')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-green-400 font-bold text-lg">{coin.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>); })}
        </div>
      </section>

      {/* Metachrome Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12 text-left">
          <h2 className="text-4xl font-bold text-white mb-6">Metachrome Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(function (feature, index) { return (<Card key={index} className="bg-[#1B1B2F] border-[#3B82F6]/30 backdrop-blur-sm hover:border-[#3B82F6]/60 transition-all duration-300 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-8">
                  <img src={feature.icon} alt={feature.title} className="w-60 h-60 object-contain"/>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed text-base">{feature.description}</p>
              </CardContent>
            </Card>); })}
        </div>
      </section>

      {/* A New Era Begins */}
      <section className="bg-black py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-white mb-6">A New Era Begins</h2>
              <p className="text-gray-400 mb-12 text-lg leading-relaxed">Explore the future of trading—smart, secure, and accessible for everyone.</p>
              <div className="space-y-8">
                {roadmapItems.map(function (item, index) { return (<div key={index} className="flex items-start space-x-4 relative">
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-black z-10">
                        {index + 1}
                      </div>
                      {index < roadmapItems.length - 1 && (<div className="w-0.5 h-16 bg-gray-600 mt-4"></div>)}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>); })}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img src={newMetachromeCard} alt="METACHROME" className="w-auto h-auto max-w-full"/>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
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
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="bg-gray-800 border-0 rounded-2xl shadow-2xl">
            <CardContent className="p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="flex justify-center lg:justify-start">
                  <div className="relative">
                    <img src={emailsbImage} alt="Newsletter Chart" className="w-full max-w-lg h-auto object-contain" style={{ width: '512px', height: '384px' }}/>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Get Started For Free</p>
                  <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Subscribe our newsletter &<br />
                    Stay Update Every Day
                  </h2>
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Input type="email" placeholder="Enter you email" value={email} onChange={function (e) { return setEmail(e.target.value); }} className="flex-1 bg-black border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 h-12 rounded-lg"/>
                    <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 h-12 font-semibold rounded-lg">
                      Submit
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>);
}
