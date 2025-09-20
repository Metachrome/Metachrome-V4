import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../hooks/useAuth";

interface NavItem {
  path: string;
  label: string;
  normalIcon: string;
  activeIcon: string;
}

const navItems: NavItem[] = [
  {
    path: "/",
    label: "Home",
    normalIcon: "/Homeiconbar-normal.png?v=5",
    activeIcon: "/iconbar_Home-active.png?v=5"
  },
  {
    path: "/market",
    label: "Market",
    normalIcon: "/iconbar_Market-normal.png?v=5",
    activeIcon: "/iconbar_Market-active.png?v=5"
  },
  {
    path: "/trade",
    label: "Trade",
    normalIcon: "/iconbar_Trade-normal.png?v=5",
    activeIcon: "/iconbar_Trade-active.png?v=5"
  },
  {
    path: "/wallet",
    label: "Wallet",
    normalIcon: "/iconbar_Wallet-normal.png?v=5",
    activeIcon: "/iconbar_Wallet-active.png?v=5"
  },
  {
    path: "/support",
    label: "Support",
    normalIcon: "/iconbar_Support-normal.png?v=5",
    activeIcon: "/iconbar_Support-active.png?v=5"
  }
];

// Fallback emoji icons if images fail to load
const getEmojiIcon = (path: string): string => {
  switch (path) {
    case "/": return "🏠";
    case "/market": return "📈";
    case "/trade": return "💱";
    case "/wallet": return "💰";
    case "/support": return "❓";
    default: return "📱";
  }
};

export function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const [showTradeMenu, setShowTradeMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Check if we should show the navigation based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        setIsVisible(width < 1024); // Show on screens smaller than 1024px
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    if (path === "/trade") {
      setShowTradeMenu(!showTradeMenu);
    } else {
      setShowTradeMenu(false);
      setLocation(path);
    }
  };

  const handleTradeOptionClick = (tradePath: string) => {
    setShowTradeMenu(false);
    setLocation(tradePath);
  };

  return (
    <>
      {/* Trade Menu Overlay */}
      {showTradeMenu && (
        <div
          className="fixed left-0 right-0 z-[9998] bg-[#1A1B3A] border-t border-gray-700/50 backdrop-blur-lg"
          style={{
            bottom: '80px', // Position above the bottom nav
            position: 'fixed',
            left: 0,
            right: 0,
            zIndex: 9998,
            maxWidth: '100vw', // Ensure it doesn't exceed viewport width
            overflow: 'hidden' // Prevent any overflow
          }}
        >
          <div className="py-3 px-4"> {/* Reduced padding for smaller screens */}
            <h3 className="text-white font-semibold mb-2 text-sm">Trading Options</h3> {/* Smaller text */}
            <div className="space-y-1"> {/* Reduced spacing */}
              <button
                onClick={() => handleTradeOptionClick("/trade/spot")}
                className="w-full text-left py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded text-sm" // Smaller text
              >
                Spot Trading
              </button>
              <button
                onClick={() => handleTradeOptionClick("/trade/options")}
                className="w-full text-left py-2 px-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded text-sm" // Smaller text
              >
                Options Trading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation - ALWAYS VISIBLE */}
      <div
        className="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          zIndex: 99999,
          backgroundColor: '#1A1B3A',
          borderTop: '2px solid #4F46E5',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px', // Reduced padding for smaller screens
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          maxWidth: '100vw', // Ensure it doesn't exceed viewport width
          overflow: 'hidden' // Prevent any overflow
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const isHovered = hoveredItem === item.path;
          const shouldShowActive = active || isHovered;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              onTouchStart={() => setHoveredItem(item.path)}
              onTouchEnd={() => setHoveredItem(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 4px', // Reduced padding for smaller screens
                flex: '1', // Make buttons equally distribute space
                maxWidth: '20%', // Ensure 5 buttons fit (100% / 5 = 20%)
                minWidth: '0', // Allow buttons to shrink if needed
                backgroundColor: active ? 'rgba(79, 70, 229, 0.2)' : isHovered ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                borderRadius: '6px', // Slightly smaller border radius
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'scale(1.02)' : 'scale(1)' // Reduced scale to prevent overflow
              }}
            >
              <div
                className="nav-icon"
                style={{
                  width: '32px', // Reduced from 40px to 32px for smaller screens
                  height: '32px', // Reduced from 40px to 32px for smaller screens
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={shouldShowActive ? item.activeIcon : item.normalIcon}
                  alt={`${item.label} icon`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transition: 'all 0.2s ease'
                  }}
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = getEmojiIcon(item.path);
                      parent.style.fontSize = '24px';
                    }
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
