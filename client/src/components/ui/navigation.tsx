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
                      <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-[60]">
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link key={dropdownItem.path} href={dropdownItem.path}>
                            <div className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer">
                              {dropdownItem.label}
                            </div>
                          </Link>
                        ))}
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
                      <span>{user?.username || 'User'}</span>
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
          <div className="md:hidden border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.path}>
                  {item.hasDropdown ? (
                    <div>
                      <div className="text-gray-300 block px-3 py-2 text-base font-medium">
                        {item.label}
                      </div>
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link key={dropdownItem.path} href={dropdownItem.path}>
                          <div
                            className="text-gray-400 block px-6 py-2 text-sm hover:text-white hover:bg-gray-800"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {dropdownItem.label}
                          </div>
                        </Link>
                      ))}
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
                      <span>{user?.username || 'User'}</span>
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
        )}
      </div>
    </header>
  );
}