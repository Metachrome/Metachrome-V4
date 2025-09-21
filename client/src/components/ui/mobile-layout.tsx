import { ReactNode, useState, useEffect } from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";
import { Navigation } from "./navigation";
import { Footer } from "./footer";
import { useLocation } from "wouter";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Pages that should not have navigation/footer
  const noLayoutPages = ['/admin/login', '/trade/options', '/options', '/trade/spot'];
  const shouldShowLayout = !noLayoutPages.includes(location);

  // Check for small screen (mobile/tablet) - up to 1024px
  useEffect(() => {
    const checkScreenSize = () => {
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      setIsSmallScreen(windowWidth < 1024);
    };

    checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, []);

  // Use mobile layout for small screens (including tablets up to 1024px)
  if (isMobile || isSmallScreen) {
    return (
      <div className="min-h-screen bg-gray-900 overflow-x-hidden max-w-full relative">
        {shouldShowLayout && <MobileHeader />}
        <main className="relative pb-20 overflow-x-hidden max-w-full">
          {children}
        </main>
        {shouldShowLayout && <Footer />}
        <MobileBottomNav />
        {/* MOBILE FIX: Ensure modals can appear above mobile layout */}
        <div id="mobile-modal-root" className="relative z-[99999]" />
      </div>
    );
  }

  // Desktop layout (existing behavior)
  return (
    <div className="min-h-screen bg-gray-900">
      {shouldShowLayout && <Navigation />}
      <main>
        {children}
      </main>
      {shouldShowLayout && <Footer />}
      {/* Always include bottom nav - it will decide whether to show itself */}
      <MobileBottomNav />
    </div>
  );
}
