import { Button } from "./button";
import { useIsMobile } from "../../hooks/use-mobile";
import { useLocation } from "wouter";
import heroDesktopImage from "@assets/hero-desktop_1754552987909.jpg";
import heroMobileImage from "@assets/hero-mobile.jpg";

export function MobileHero() {
  const isMobile = useIsMobile();
  const [, setLocation] = useLocation();

  const handleStartTrading = () => {
    setLocation("/trade/options");
  };

  if (isMobile) {
    return (
      <section className="relative overflow-hidden bg-black">
        <div className="relative">
          <img
            src={heroMobileImage}
            alt="METACHROME Hero Banner"
            className="w-full h-auto object-cover"
            style={{ maxHeight: '300px' }}
            onError={(e) => {
              // Fallback to a solid background if image fails
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              e.currentTarget.parentElement!.style.minHeight = '300px';
            }}
          />

          {/* Mobile Start Trading Button Overlay - Left positioned under text */}
          <div className="absolute bottom-16 left-4 z-20">
            <Button
              onClick={handleStartTrading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-2.5 rounded-lg text-base font-semibold border-0 shadow-lg"
            >
              Start Trading
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Desktop hero (existing)
  return (
    <section className="relative overflow-hidden bg-black py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          <img
            src={heroDesktopImage}
            alt="METACHROME Hero Banner - We believe in the future"
            className="w-full h-auto object-contain rounded-lg"
            style={{ maxHeight: '440px' }}
          />

          {/* Start Trading Button Overlay - Left positioned under text */}
          <div className="absolute bottom-20 left-8 z-20">
            <Button
              onClick={handleStartTrading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-lg text-lg font-semibold border-0 shadow-lg"
            >
              Start Trading
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
