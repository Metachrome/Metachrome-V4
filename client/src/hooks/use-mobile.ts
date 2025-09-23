import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      // Check for mobile devices using multiple methods
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isMobileScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Consider it mobile if any of these conditions are true
      setIsMobile(isMobileUserAgent || (isMobileScreen && isTouchDevice));
    };

    // Check on mount
    checkIsMobile();

    // Check on resize
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
}
