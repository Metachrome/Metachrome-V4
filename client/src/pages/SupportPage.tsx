import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { Mail, MessageCircle, Clock, ChevronDown, ChevronRight, Phone } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import faqImage from "../assets/FAQ_image-2_1755414462649.png";
import supportBannerDesktop from "../assets/support_banner_desktop.jpg";
import supportBannerMobile from "../assets/support_banner_mobile.jpg";
import ChatBot from "../components/chat/ChatBot";
import LiveChat from "../components/chat/LiveChat";


export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Get current user from session
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setCurrentUser(data);
        }
      })
      .catch(err => console.error('Error fetching user:', err));
  }, []);

  const supportOptions = [
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

  const faqs = [
    { question: "What products does METACHROME Ecosystem include?", answer: "Our ecosystem includes spot trading, futures, options, and advanced trading tools with MetaMask integration." },
    { question: "Why is it better to trade cryptocurrencies on METACHROME?", answer: "Advanced trading features with competitive fees, superior execution, and admin-controlled outcomes." },
    { question: "Can I buy cryptocurrency with a credit card?", answer: "Yes, we support multiple payment methods including credit cards and crypto wallets." },
    { question: "How to buy cryptocurrency on METACHROME?", answer: "Connect your MetaMask wallet and start trading with our intuitive interface." },
    { question: "How to Complete Identity Verification?", answer: "Upload required documents through our secure verification system for enhanced features." }
  ];

  return (
    <div className="min-h-[10vh] bg-[#0B0E11]">
      {/* CLEAN BANNER SECTION - ORIGINAL BANNER WITHOUT TEXT */}
      <section className={`relative overflow-hidden bg-black w-full ${isMobile ? 'pt-[25px] pb-0' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Original Banner Images - Clean without embedded text */}
          <div className={`relative overflow-hidden rounded-lg ${isMobile ? 'h-auto' : 'h-80'}`}>
            <img
              src={isMobile ? supportBannerMobile : supportBannerDesktop}
              alt="Support Banner"
              className="w-full h-full object-contain"
            />
            {/* Optional overlay for better text readability if needed */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Black background section for support options */}
      <section className="bg-black">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-4' : 'py-8 sm:py-16'}`}>

          {/* Support Options - 2 Cards Full Width */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1 mb-8' : 'grid-cols-1 md:grid-cols-2 gap-8 mb-20'}`}>
          {supportOptions.map((option, index) => (
            <Card key={index} className="bg-[#1A1D29] border-gray-800 overflow-hidden hover:bg-[#1E2329] transition-colors rounded-xl">
              <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center h-full flex flex-col`}>
                <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
                  <img
                    src={option.icon}
                    alt={option.title}
                    className={`mx-auto object-contain ${isMobile ? 'w-12 h-12' : 'w-16 h-16'}`}
                    onLoad={() => console.log('Support icon loaded:', option.icon)}
                    onError={(e) => {
                      console.error('Support icon failed to load:', e.target.src);
                    }}
                  />
                </div>
                <h3 className={`font-semibold text-white ${isMobile ? 'text-lg mb-3' : 'text-xl mb-4'}`}>{option.title}</h3>
                <p className={`text-gray-400 leading-relaxed flex-grow ${isMobile ? 'mb-4 text-sm' : 'mb-6 text-sm'}`}>{option.description}</p>
                {option.contact && (
                  <p className={`text-white font-medium ${isMobile ? 'mb-4 text-sm' : 'mb-6'}`}>{option.contact}</p>
                )}
                {option.title !== "Email Us" && (
                  <Button
                    onClick={() => setIsChatBotOpen(true)}
                    className={`text-white w-full rounded-lg font-medium mt-auto hover:opacity-90 ${isMobile ? 'py-2 text-sm' : 'py-3'}`}
                    style={{ backgroundColor: '#AB00FF' }}
                  >
                    {option.action}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
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
                Begin your trading journey and stand a chance to earn exciting rewards
                worth up to $300 through our Mystery Box promotion.
              </p>
              <div className="flex justify-center mb-8">
                <div className="w-48 h-48 sm:w-64 sm:h-64">
                  <img
                    src={faqImage}
                    alt="Crypto FAQ"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4 px-2">
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
                      <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        ) : (
          /* Desktop FAQ Layout */
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
        )}
      </section>

      {/* Chat Components */}
      {isChatBotOpen && (
        <ChatBot
          isOpen={isChatBotOpen}
          onClose={() => setIsChatBotOpen(false)}
          onContactSupport={() => {
            console.log('Contact Support clicked, currentUser:', currentUser);

            if (!currentUser) {
              alert('Please login first to contact live support');
              return;
            }

            // First open live chat, then close chatbot with delay
            setIsLiveChatOpen(true);
            setTimeout(() => {
              setIsChatBotOpen(false);
            }, 100);
          }}
        />
      )}

      {isLiveChatOpen && currentUser && (
        <LiveChat
          userId={currentUser.id}
          username={currentUser.username || currentUser.email}
          isOpen={isLiveChatOpen}
          onClose={() => setIsLiveChatOpen(false)}
        />
      )}
    </div>
  );
}