import { useState } from "react";
import { Button } from "./button";
import { useLocation, Link } from "wouter";
import { useAuth } from "../../hooks/useAuth";
import { useIsMobile } from "../../hooks/use-mobile";
import { Menu, X, UserCircle } from "lucide-react";
import logoImage from "../../assets/new-metachrome-logo.png";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMenuOpen(false);
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
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const dashboardPath = (user?.role === 'admin' || user?.role === 'super_admin')
                    ? '/admin/dashboard'
                    : '/dashboard';
                  handleNavigation(dashboardPath);
                }}
                className="text-gray-300 hover:text-white"
              >
                <UserCircle className="w-4 h-4 mr-1" />
                {user?.username}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-gray-300 hover:text-white"
              >
                Logout
              </Button>
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
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-64 bg-[#1A1B3A] p-4">
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
                      className="relative p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
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
                      className="relative p-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
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
