// ⚡ CRITICAL: Intercept fetch BEFORE anything else loads
// This must be at the very top to catch TradingView widget requests
if (!(window as any).__tradingViewFetchIntercepted) {
  console.log('🔧 [MAIN] Setting up global TradingView fetch interception...');
  const originalFetch = window.fetch;
  (window as any).fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    let url = typeof input === 'string' ? input : input.toString();

    // Intercept tradingview-widget.com requests
    if (url.includes('tradingview-widget.com')) {
      console.log(`🔄 [MAIN] Intercepting TradingView widget request: ${url}`);

      // Extract the widget type and query params
      try {
        const urlObj = new URL(url, window.location.origin);
        const widgetMatch = url.match(/embed-widget\/([^/?]+)/);
        const widgetType = widgetMatch ? widgetMatch[1] : 'advanced-chart';
        const locale = urlObj.searchParams.get('locale') || 'en';

        // Redirect to our proxy
        const proxyUrl = `/api/tradingview-widget/${widgetType}?locale=${locale}`;
        console.log(`✅ [MAIN] Redirecting to proxy: ${proxyUrl}`);
        url = proxyUrl;
      } catch (e) {
        console.error('❌ [MAIN] Error parsing URL:', e);
      }
    }

    return originalFetch(url, init);
  };
  (window as any).__tradingViewFetchIntercepted = true;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "METACHROME - Advanced Crypto Trading Platform";

createRoot(document.getElementById("root")!).render(<App />);
