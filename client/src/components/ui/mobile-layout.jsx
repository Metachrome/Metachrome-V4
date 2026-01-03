import { useState, useEffect } from "react";
import { useIsMobile } from "../../hooks/use-mobile";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";
import { Navigation } from "./navigation";
import { Footer } from "./footer";
import { useLocation } from "wouter";
export function MobileLayout(_a) {
    var children = _a.children;
    var isMobile = useIsMobile();
    var location = useLocation()[0];
    var _b = useState(false), isSmallScreen = _b[0], setIsSmallScreen = _b[1];
    // Pages that should not have navigation/footer
    var noLayoutPages = ['/admin/login', '/trade/options', '/options', '/trade/spot', '/login', '/signup'];
    var shouldShowLayout = !noLayoutPages.includes(location);
    // Check for small screen (mobile/tablet) - up to 1024px
    useEffect(function () {
        var checkScreenSize = function () {
            var windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
            setIsSmallScreen(windowWidth < 1024);
        };
        checkScreenSize();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', checkScreenSize);
            return function () { return window.removeEventListener('resize', checkScreenSize); };
        }
    }, []);
    // Use mobile layout for small screens (including tablets up to 1024px)
    if (isMobile || isSmallScreen) {
        return (<div className="min-h-screen bg-gray-900 overflow-x-hidden max-w-full relative">
        {shouldShowLayout && <MobileHeader />}
        <main className="relative pb-20 overflow-x-hidden max-w-full">
          {children}
        </main>
        {shouldShowLayout && <Footer />}
        <MobileBottomNav />
        {/* MOBILE FIX: Ensure modals can appear above mobile layout */}
        <div id="mobile-modal-root" className="relative z-[99999]"/>
      </div>);
    }
    // Desktop layout (existing behavior)
    return (<div className="min-h-screen bg-gray-900">
      {shouldShowLayout && <Navigation />}
      <main>
        {children}
      </main>
      {shouldShowLayout && <Footer />}
      {/* Always include bottom nav - it will decide whether to show itself */}
      <MobileBottomNav />
    </div>);
}
