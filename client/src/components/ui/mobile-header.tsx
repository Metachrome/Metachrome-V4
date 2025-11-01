import { useState, useEffect } from "react";
import { Button } from "./button";
import { useLocation, Link } from "wouter";
import { useAuth } from "../../hooks/useAuth";
import { useIsMobile } from "../../hooks/use-mobile";
import { Menu, X, UserCircle, ChevronDown, Settings, User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./dropdown-menu";
import logoImage from "../../assets/new-metachrome-logo.png";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
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
  }, [isMenuOpen]);

  if (!isMobile) {
    return null;
  }

  const handleNavigation = (path: string) => {
    // Scroll to top when navigating to a new page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLocation(path);
    setIsMenuOpen(false);
  };

  // Get user display name - prioritize name and username over wallet address
  const getUserDisplayName = () => {
    // Debug: Log user data to console
    console.log('🔍 Mobile Header User Data:', {
      user,
      walletAddress: user?.walletAddress,
      wallet_address: user?.wallet_address,
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      currentLocation: location
    });

    // First priority: Full name
    if (user?.firstName && user?.lastName) {
      console.log('🔍 Mobile Header: Showing full name');
      return `${user.firstName} ${user.lastName}`;
    }

    // Second priority: First name only
    if (user?.firstName) {
      console.log('🔍 Mobile Header: Showing first name');
      return user.firstName;
    }

    // Third priority: Username (regardless of format)
    if (user?.username) {
      console.log('🔍 Mobile Header: Showing username:', user.username);

      // For all pages, if it's a long wallet address, truncate it
      if (user.username.startsWith('0x') && user.username.length > 20) {
        const truncated = `${user.username.slice(0, 6)}...${user.username.slice(-4)}`;
        console.log('🔍 Mobile Header: Showing truncated wallet:', truncated);
        return truncated;
      }

      // For regular usernames, show as-is
      return user.username;
    }

    // Last resort: Check for wallet address in other fields
    const walletAddr = user?.walletAddress || user?.wallet_address;
    if (walletAddr && walletAddr.startsWith('0x') && walletAddr.length > 20) {
      const truncated = `${walletAddr.slice(0, 6)}...${walletAddr.slice(-4)}`;
      console.log('🔍 Mobile Header: Showing wallet from other field:', truncated);
      return truncated;
    }

    console.log('🔍 Mobile Header: Showing default Account');
    return "Account";
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-[#1A1B3A] border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={logoImage} 
            alt="METACHROME" 
            className="h-8 w-auto"
            onClick={() => handleNavigation("/")}
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* US Flag */}
          <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
            <span className="text-xs text-white">🇺🇸</span>
          </div>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white flex items-center space-x-1 max-w-[160px]"
                  >
                    <UserCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{getUserDisplayName()}</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-gray-800 border-gray-700">
                  <DropdownMenuItem
                    onClick={() => {
                      const dashboardPath = (user?.role === 'admin' || user?.role === 'super_admin')
                        ? '/admin/dashboard'
                        : '/dashboard';
                      handleNavigation(dashboardPath);
                    }}
                    className="flex items-center w-full px-2 py-2 text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleNavigation('/profile')}
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
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/signup")}
                className="text-gray-300 hover:text-white"
              >
                Sign up
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavigation("/login")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-hidden"
          onClick={() => setIsMenuOpen(false)}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => handleNavigation("/")}
                className="w-full text-left py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("/market")}
                className="w-full text-left py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded"
              >
                Market
              </button>
              <div className="w-full">
                <div className="text-gray-300 py-2 px-3 text-base font-medium">
                  Trade
                </div>
                <div className="mx-3 mb-2 space-y-2">
                  {/* SPOT Trading Option - Mobile Header */}
                  <Link href="/trade/spot">
                    <div
                      className="relative p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg cursor-pointer transform transition-transform hover:scale-105"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
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

                  {/* OPTION Trading Option - Mobile Header */}
                  <Link href="/trade/options">
                    <div
                      className="relative p-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg cursor-pointer transform transition-transform hover:scale-105"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
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
              <button
                onClick={() => handleNavigation("/wallet")}
                className="w-full text-left py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded"
              >
                Wallet
              </button>
              <button
                onClick={() => handleNavigation("/support")}
                className="w-full text-left py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded"
              >
                Support
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
