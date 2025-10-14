import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Menu, X, User, LogOut, Settings, UserCircle, ChevronDown } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import metachromeLogo from "../../assets/new-metachrome-logo.png";

export function Navigation() {
  const [location, setLocation] = useLocation();
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user, isAuthenticated, logout } = useAuth();

  // Get user display name - prioritize firstName + lastName, fallback to username
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    return "Account";
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/market", label: "Market" },
    {
      path: "/trade",
      label: "Trade",
      hasDropdown: true,
      dropdownItems: [
        { path: "/trade/spot", label: "Spot" },
        { path: "/trade/options", label: "Options" }
      ]
    },
    { path: "/wallet", label: "Wallet" },
    { path: "/support", label: "Support" }
  ];

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <header className="bg-[#34344E] border-b border-gray-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center">
                <img
                  src={metachromeLogo}
                  alt="METACHROME"
                  className="h-[2.6rem] w-auto"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.path} className="relative">
                {item.hasDropdown ? (
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        setHoverTimeout(null);
                      }
                      setIsTradeOpen(true);
                    }}
                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setIsTradeOpen(false);
                      }, 300); // 300ms delay before closing
                      setHoverTimeout(timeout);
                    }}
                  >
                    <button className={`text-gray-300 hover:text-white px-3 py-2 text-sm font-medium flex items-center ${
                      location.startsWith('/trade') ? 'text-white' : ''
                    }`}>
                      {item.label}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    {isTradeOpen && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-[60] overflow-hidden">
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
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.path}>
                    <span className={`text-gray-300 hover:text-white px-3 py-2 text-sm font-medium ${
                      location === item.path ? 'text-white' : ''
                    }`}>
                      {item.label}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right side buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <img src="https://flagcdn.com/w20/us.png" alt="English" className="w-5 h-3" />
              <span>English</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800">
                      <UserCircle className="w-5 h-5" />
                      <span>{getUserDisplayName()}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                    <DropdownMenuItem
                      onClick={() => {
                        // Route to admin dashboard if user is admin/super_admin, otherwise user dashboard
                        const dashboardPath = (user?.role === 'admin' || user?.role === 'super_admin')
                          ? '/admin/dashboard'
                          : '/dashboard';
                        setLocation(dashboardPath);
                      }}
                      className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLocation('/profile')}
                      className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-hidden md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 9999
            }}
          >
            <div
              className="fixed right-0 top-0 h-full w-64 bg-[#1A1B3A] p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.path}>
                    {item.hasDropdown ? (
                      <div>
                        <div className="text-gray-300 block px-3 py-2 text-base font-medium">
                          {item.label}
                        </div>
                        <div className="mx-3 mb-2 space-y-2">
                          {/* SPOT Trading Option - Mobile */}
                          <Link href="/trade/spot">
                            <div
                              className="relative p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg cursor-pointer transform transition-transform hover:scale-105"
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

                          {/* OPTION Trading Option - Mobile */}
                          <Link href="/trade/options">
                            <div
                              className="relative p-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg cursor-pointer transform transition-transform hover:scale-105"
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
                      <Link href={item.path}>
                        <div
                          className={`block px-3 py-2 text-base font-medium hover:text-white hover:bg-gray-800 ${
                            location === item.path ? 'text-purple-400' : 'text-gray-300'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </div>
                      </Link>
                    )}
                  </div>
                ))}

                {/* Mobile auth buttons */}
                <div className="pt-4 space-y-2">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-300 px-3 py-2">
                        <UserCircle className="w-4 h-4" />
                        <span>{getUserDisplayName()}</span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full text-gray-300 border-gray-700 hover:bg-gray-800 mb-2"
                        onClick={() => {
                          // Route to admin dashboard if user is admin/super_admin, otherwise user dashboard
                          const dashboardPath = (user?.role === 'admin' || user?.role === 'super_admin')
                            ? '/admin/dashboard'
                            : '/dashboard';
                          setLocation(dashboardPath);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                      <Link href="/profile">
                        <Button
                          variant="outline"
                          className="w-full text-gray-300 border-gray-700 hover:bg-gray-800 mb-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full text-gray-300 border-gray-700 hover:bg-gray-800"
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login">
                        <Button
                          variant="outline"
                          className="w-full text-gray-300 border-gray-700 hover:bg-gray-800"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-0"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}