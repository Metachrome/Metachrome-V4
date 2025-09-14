import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { TrendingUp, TrendingDown, ChevronDown, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { useIsMobile } from "../hooks/use-mobile";
import { MobileHero } from "../components/ui/mobile-hero";
import { MobileCurrencyList } from "../components/ui/mobile-currency-list";
import heroDesktopImage from "@assets/hero-desktop_1754552987909.jpg";
import speakerIcon from "../assets/speaker_icon.png";
import newMetachromeCard from "../assets/new-metachrome-card.png";
import faqImage from "@assets/FAQ_image-2_1755414462649.png";
import TradingViewWidget from "../components/TradingViewWidget";
import { useCryptoData, getTradingRoute } from "../services/cryptoDataService";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();
  const isMobile = useIsMobile();

  // Use real-time cryptocurrency data
  const { cryptoData, loading, error } = useCryptoData();

  // Handle trade button click
  const handleTradeClick = (crypto: any, tradingType: 'spot' | 'options' = 'spot') => {
    const route = getTradingRoute(crypto.symbol, tradingType);
    setLocation(route);
  };

  const topGainers = [
    { symbol: "OP", price: "$2.22", change: "+14.75%", color: "bg-red-500" },
    { symbol: "DOGE", price: "$0.371", change: "+8.51%", color: "bg-yellow-500" },
    { symbol: "PEPE", price: "$0.000018", change: "+6.23%", color: "bg-green-500" },
    { symbol: "UNI", price: "$6.45", change: "+10.15%", color: "bg-blue-500" },
  ];

  const features = [
    {
      icon: "/assets/featureimage01_1754552987907.png",
      title: "Fast Execution",
      description: "Experience blazing-fast trade performance and experience."
    },
    {
      icon: "/assets/featureimage02_1754552987908.png",
      title: "Secure Wallets",
      description: "Your assets are protected with top-level security protocols."
    },
    {
      icon: "/assets/featureimage03_1754552987909.png",
      title: "Real-Time Updates",
      description: "Stay updated with real-time charts and market data."
    }
  ];

  const roadmapItems = [
    { title: "Create Your Account", description: "Join in seconds, secure, and built for all traders." },
    { title: "Verify & Activate", description: "Unlock full access with multi-layered protection." },
    { title: "Deposit / Buy Crypto", description: "Top up with flexible options, ready to deploy instantly." },
    { title: "Trade", description: "Experience deep liquidity, real-time insights, and refined execution." }
  ];

  const faqs = [
    { question: "What products does METACHROME Ecosystem include?", answer: "Our ecosystem includes spot trading, futures, options, and advanced trading tools with MetaMask integration." },
    { question: "Why is it better to trade cryptocurrencies on METACHROME?", answer: "Advanced trading features with competitive fees, superior execution, and admin-controlled outcomes." },
    { question: "Can I buy cryptocurrency with a credit card?", answer: "Yes, we support multiple payment methods including credit cards and crypto wallets." },
    { question: "How to buy cryptocurrency on METACHROME?", answer: "Connect your MetaMask wallet and start trading with our intuitive interface." },
    { question: "How to Complete Identity Verification?", answer: "Upload required documents through our secure verification system for enhanced features." }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  // Mobile layout - Same content as desktop, mobile-responsive
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0D0B1F] text-white">
        {/* Mobile Hero Section */}
        <MobileHero />

        {/* TradingView Ticker Section - Mobile */}
        <section className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border-y border-blue-500/30 relative py-2">
          <div className="w-full">
            <TradingViewWidget type="ticker" />
          </div>
        </section>

        {/* Currency List Section - Mobile */}
        <section className="px-4 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Currency List</h2>
            <p className="text-gray-400 text-sm">Real-time market data • 24h Changes</p>
            {loading && <p className="text-blue-400 text-sm mt-2">Loading real-time data...</p>}
            {error && <p className="text-red-400 text-sm mt-2">Using cached data • {error}</p>}
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
                      <th className="text-left p-3 font-medium text-gray-400 text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b border-purple-800/20">
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
                          <td className="p-3">
                            <div className="flex space-x-1">
                              <div className="h-6 bg-gray-700 rounded animate-pulse w-10"></div>
                              <div className="h-6 bg-gray-700 rounded animate-pulse w-12"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      cryptoData.slice(0, 8).map((crypto) => (
                      <tr key={crypto.symbol} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                              {crypto.image ? (
                                <img
                                  src={crypto.image}
                                  alt={crypto.name}
                                  className="w-5 h-5 object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span
                                className="text-white font-bold text-xs"
                                style={{ display: crypto.image ? 'none' : 'flex' }}
                              >
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
                          <div className={`flex items-center space-x-1 ${crypto.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {crypto.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span className="font-medium text-xs">{crypto.change}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white text-xs px-2 py-1 h-6"
                              onClick={() => handleTradeClick(crypto, 'spot')}
                            >
                              Spot
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white text-xs px-2 py-1 h-6"
                              onClick={() => handleTradeClick(crypto, 'options')}
                            >
                              Options
                            </Button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
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
            {topGainers.map((coin) => (
              <Card key={coin.symbol} className="bg-[#1E1E2E] border-[#2A2A3E] backdrop-blur-sm hover:bg-[#252537] transition-all duration-300 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <div className={`w-8 h-8 ${coin.color} rounded-full flex items-center justify-center`}>
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
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-400 font-bold text-sm">{coin.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Metachrome Features - Mobile */}
        <section className="px-4 py-8">
          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-white mb-4">Metachrome Features</h2>
          </div>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-[#1B1B2F] border-[#3B82F6]/30 backdrop-blur-sm hover:border-[#3B82F6]/60 transition-all duration-300 rounded-3xl">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-6">
                    <img
                      src={feature.icon}
                      alt={feature.title}
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
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
                  {roadmapItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 relative">
                      <div className="relative flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-black z-10">
                          {index + 1}
                        </div>
                        {index < roadmapItems.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-600 mt-3"></div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src={newMetachromeCard}
                  alt="METACHROME"
                  className="w-auto h-auto max-w-full"
                />
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
                Begin your trading journey and stand a chance to earn exciting rewards
                worth up to $300 through our Mystery Box promotion.
              </p>
              <div className="flex justify-center mb-8">
                <div className="w-64 h-64">
                  <img
                    src={faqImage}
                    alt="Crypto FAQ"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Collapsible key={index} open={openFaq === index} onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}>
                  <CollapsibleTrigger asChild>
                    <Card className={`bg-black border-2 transition-all duration-300 cursor-pointer ${
                      openFaq === index
                        ? 'border-purple-500 shadow-lg shadow-purple-500/50'
                        : 'border-gray-700 hover:border-purple-400'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium pr-3 text-sm transition-colors duration-300 ${
                            openFaq === index ? 'text-purple-400' : 'text-white'
                          }`}>{faq.question}</h3>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180 text-purple-400' : ''}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 bg-black border-l-2 border-r-2 border-b-2 border-gray-700 rounded-b-lg">
                      <p className="text-gray-400 text-sm">{faq.answer}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
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
                      <img
                        src="/assets/emailsb_1754552987905.png"
                        alt="Newsletter Chart"
                        className="w-full max-w-xs h-auto object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Get Started For Free</p>
                    <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                      Subscribe our newsletter &<br />
                      Stay Update Every Day
                    </h2>
                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter you email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 h-10 rounded-lg"
                      />
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
      </div>
    );
  }

  // Desktop layout (existing)
  return (
    <div className="min-h-screen bg-[#0D0B1F] text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black py-8">
        {/* Hero Image Banner with Container */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative">
            <img
              src={heroDesktopImage}
              alt="METACHROME Hero Banner - We believe in the future"
              className="w-full h-auto object-contain rounded-lg"
              style={{ maxHeight: '440px' }}
            />

            {/* Start Trading Button Overlay - Positioned right below the text */}
            <div className="absolute top-80 left-40 z-20">
              <Button
                onClick={() => setLocation("/trade/options")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-lg text-lg font-semibold border-0 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Start Trading
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TradingView Ticker Section */}
      <section className="bg-gradient-to-r from-blue-600/20 to-blue-500/20 border-y border-blue-500/30 relative py-2">
        <div className="w-full">
          <TradingViewWidget type="ticker" />
        </div>
      </section>

      {/* Currency List Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Currency List</h2>
          <p className="text-gray-400 text-sm">Real-time market data • 24h Changes</p>
          {loading && <p className="text-blue-400 text-sm mt-2">Loading real-time data...</p>}
          {error && <p className="text-red-400 text-sm mt-2">Using cached data • {error}</p>}
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
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-purple-800/20">
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
                        <td className="p-6">
                          <div className="flex space-x-2">
                            <div className="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
                            <div className="h-8 bg-gray-700 rounded animate-pulse w-20"></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    cryptoData.map((crypto) => (
                    <tr key={crypto.symbol} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                            {crypto.image ? (
                              <img
                                src={crypto.image}
                                alt={crypto.name}
                                className="w-8 h-8 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span
                              className="text-white font-bold text-sm"
                              style={{ display: crypto.image ? 'none' : 'flex' }}
                            >
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
                        <div className={`flex items-center space-x-1 ${crypto.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {crypto.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="font-medium">{crypto.change}</span>
                        </div>
                      </td>
                      <td className="p-6 text-gray-300">{crypto.high}</td>
                      <td className="p-6 text-gray-300">{crypto.low}</td>
                      <td className="p-6">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                            onClick={() => handleTradeClick(crypto, 'spot')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Spot
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                            onClick={() => handleTradeClick(crypto, 'options')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Options
                          </Button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
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
          {topGainers.map((coin) => (
            <Card key={coin.symbol} className="bg-[#1E1E2E] border-[#2A2A3E] backdrop-blur-sm hover:bg-[#252537] transition-all duration-300 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 ${coin.color} rounded-full flex items-center justify-center`}>
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
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-400 font-bold text-lg">{coin.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Metachrome Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12 text-left">
          <h2 className="text-4xl font-bold text-white mb-6">Metachrome Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-[#1B1B2F] border-[#3B82F6]/30 backdrop-blur-sm hover:border-[#3B82F6]/60 transition-all duration-300 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-8">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-60 h-60 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed text-base">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
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
                {roadmapItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 relative">
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 bg-black z-10">
                        {index + 1}
                      </div>
                      {index < roadmapItems.length - 1 && (
                        <div className="w-0.5 h-16 bg-gray-600 mt-4"></div>
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img
                src={newMetachromeCard}
                alt="METACHROME"
                className="w-auto h-auto max-w-full"
              />
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
              Begin your trading journey and stand a chance to earn exciting rewards
              worth up to $300 through our Mystery Box promotion.
            </p>
            <div className="p-0 m-0">
              <div className="w-[564px] h-[564px] p-0 m-0">
                <img
                  src={faqImage}
                  alt="Crypto FAQ"
                  className="w-full h-full object-contain p-0 m-0 block"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            {faqs.map((faq, index) => (
              <Collapsible key={index} open={openFaq === index} onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}>
                <CollapsibleTrigger asChild>
                  <Card className={`bg-black border-2 transition-all duration-300 cursor-pointer ${
                    openFaq === index 
                      ? 'border-purple-500 shadow-lg shadow-purple-500/50' 
                      : 'border-gray-700 hover:border-purple-400'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium pr-4 text-lg transition-colors duration-300 ${
                          openFaq === index ? 'text-purple-400' : 'text-white'
                        }`}>{faq.question}</h3>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${openFaq === index ? 'rotate-180 text-purple-400' : ''}`} />
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 bg-black border-l-2 border-r-2 border-b-2 border-gray-700 rounded-b-lg">
                    <p className="text-gray-400 text-lg">{faq.answer}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
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
                    <img
                      src="/assets/emailsb_1754552987905.png"
                      alt="Newsletter Chart"
                      className="w-full max-w-lg h-auto object-contain"
                      style={{ width: '512px', height: '384px' }}
                    />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Get Started For Free</p>
                  <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                    Subscribe our newsletter &<br />
                    Stay Update Every Day
                  </h2>
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Input
                      type="email"
                      placeholder="Enter you email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-black border-gray-600 text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 h-12 rounded-lg"
                    />
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
    </div>
  );
}