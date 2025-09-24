import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { ChevronDown, Menu, X, Box } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuth } from "../hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "signup">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Markets", href: "/markets" },
    { 
      name: "Trade", 
      href: "/trade",
      submenu: [
        { name: "Spot Trading", href: "/trade/spot" },
        { name: "Options Trading", href: "/trade/options" },
        { name: "USD(S)-M Futures", href: "/trade/futures" },
      ]
    },
    { name: "Wallet", href: "/wallet" },
    { name: "Support", href: "/support" },
  ];

  const openAuthModal = (type: "login" | "signup") => {
    setAuthModalType(type);
    setIsAuthModalOpen(true);
  };

  const isActivePath = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/asset/logo.png" alt="METACHROME" className="w-8 h-8" />
                <span className="text-xl font-bold text-white">METACHROME</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.submenu ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`nav-link flex items-center space-x-1 ${
                          isActivePath(item.href) ? "text-primary font-medium" : "text-muted-foreground"
                        }`}>
                          <span>{item.name}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-sm border-gray-700/50 rounded-xl shadow-2xl z-[60] overflow-hidden p-0 w-80">
                        {/* SPOT Trading Option */}
                        <Link href="/trade/spot">
                          <div className="relative p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 cursor-pointer group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-black mb-1">SPOT</h3>
                                <p className="text-sm text-black/80 leading-tight">
                                  Buy and sell crypto instantly at<br />
                                  real-time market prices.
                                </p>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <img
                                  src="/asset/trade-spot_icon.png"
                                  alt="Spot Trading"
                                  className="w-12 h-12 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        </Link>

                        {/* OPTION Trading Option */}
                        <Link href="/trade/options">
                          <div className="relative p-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 cursor-pointer group">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-black mb-1">OPTION</h3>
                                <p className="text-sm text-black/80 leading-tight">
                                  Maximize gains by predicting<br />
                                  market moves in seconds.
                                </p>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <img
                                  src="/asset/trade-option_icon.png"
                                  alt="Options Trading"
                                  className="w-12 h-12 object-contain"
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link 
                      href={item.href} 
                      className={`nav-link ${
                        isActivePath(item.href) ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <img src="https://flagcdn.com/w20/us.png" alt="English" className="w-5 h-3" />
                <span className="hidden md:block text-sm">English</span>
              </div>

              {/* Auth Buttons */}
              {isLoading ? (
                <div className="flex space-x-2">
                  <div className="w-16 h-8 bg-dark-100 rounded animate-pulse" />
                  <div className="w-16 h-8 bg-dark-100 rounded animate-pulse" />
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {user?.profileImageUrl && (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="hidden md:block text-sm">
                      {user?.firstName || user?.email || 'User'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => logout()}>
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => openAuthModal("login")}
                    className="hidden md:block"
                  >
                    Login
                  </Button>
                  <Button 
                    className="btn-primary hidden md:block"
                    onClick={() => openAuthModal("signup")}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-dark-100 py-4">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <div>
                        <div className="text-gray-300 block px-3 py-2 text-base font-medium">
                          {item.name}
                        </div>
                        <div className="mx-3 mb-2 space-y-2">
                          {/* SPOT Trading Option - Mobile Layout */}
                          <Link href="/trade/spot">
                            <div
                              className="relative p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg cursor-pointer"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h3 className="text-base font-bold text-black mb-1">SPOT</h3>
                                  <p className="text-xs text-black/80 leading-tight">
                                    Buy and sell crypto instantly at<br />
                                    real-time market prices.
                                  </p>
                                </div>
                                <div className="ml-3 flex-shrink-0">
                                  <img
                                    src="/asset/trade-spot_icon.png"
                                    alt="Spot Trading"
                                    className="w-10 h-10 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                          </Link>

                          {/* OPTION Trading Option - Mobile Layout */}
                          <Link href="/trade/options">
                            <div
                              className="relative p-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg cursor-pointer"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h3 className="text-base font-bold text-black mb-1">OPTION</h3>
                                  <p className="text-xs text-black/80 leading-tight">
                                    Maximize gains by predicting<br />
                                    market moves in seconds.
                                  </p>
                                </div>
                                <div className="ml-3 flex-shrink-0">
                                  <img
                                    src="/asset/trade-option_icon.png"
                                    alt="Options Trading"
                                    className="w-10 h-10 object-contain"
                                  />
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 rounded-md text-base font-medium ${
                          isActivePath(item.href) ? "text-primary bg-dark-100" : "text-muted-foreground"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                {!isAuthenticated && (
                  <div className="border-t border-dark-100 pt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        openAuthModal("login");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      className="btn-primary w-full"
                      onClick={() => {
                        openAuthModal("signup");
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/asset/logo.png" alt="METACHROME" className="w-8 h-8" />
                <span className="text-xl font-bold text-white">METACHROME</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                We're passionate about creating unforgettable moments. Our platform provides a seamless and transparent trading experience, with a range of exciting crypto and fiat currency options.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/trade/options" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Options Trade
                </Link>
                <Link href="/trade/spot" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Spot Trade
                </Link>
                <Link href="/markets" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Markets
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Home
                </Link>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="block text-gray-400 hover:text-purple-400 transition text-sm text-left"
                >
                  Sign Up
                </button>
                <Link href="/support" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Support
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Terms Policy
                </a>
                <a href="#" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Terms of Service
                </a>
                <a href="#" className="block text-gray-400 hover:text-purple-400 transition text-sm">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2025 <span className="font-bold text-purple-500">Metachrome</span>. All Rights Reserved</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {/* Facebook */}
              <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Twitter */}
              <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a href="#" className="text-gray-400 hover:text-purple-400 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        type={authModalType}
        onSwitchType={setAuthModalType}
      />
    </div>
  );
}
