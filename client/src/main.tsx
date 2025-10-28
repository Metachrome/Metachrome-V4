// ⚡ CRITICAL: Intercept fetch AND XHR BEFORE anything else loads
// This must be at the very top to catch TradingView widget requests
if (!(window as any).__tradingViewFetchIntercepted) {
  console.log('🔧 [MAIN] Setting up global TradingView fetch + XHR interception...');

  // Intercept fetch
  const originalFetch = window.fetch;
  (window as any).fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    let url = typeof input === 'string' ? input : input.toString();

    // Intercept tradingview-widget.com requests
    if (url.includes('tradingview-widget.com')) {
      console.log(`🔄 [MAIN] Intercepting fetch: ${url}`);

      // Extract the widget type and query params
      try {
        const urlObj = new URL(url, window.location.origin);
        const widgetMatch = url.match(/embed-widget\/([^/?]+)/);
        const widgetType = widgetMatch ? widgetMatch[1] : 'advanced-chart';
        const locale = urlObj.searchParams.get('locale') || 'en';

        // Redirect to our proxy
        const proxyUrl = `/api/tradingview-widget/${widgetType}?locale=${locale}`;
        console.log(`✅ [MAIN] Fetch redirected to proxy: ${proxyUrl}`);
        url = proxyUrl;
      } catch (e) {
        console.error('❌ [MAIN] Error parsing URL:', e);
      }
    }

    return originalFetch(url, init);
  };

  // Intercept XMLHttpRequest (XHR) - TradingView might use this instead of fetch
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
    let urlStr = typeof url === 'string' ? url : url.toString();

    if (urlStr.includes('tradingview-widget.com')) {
      console.log(`🔄 [MAIN] Intercepting XHR: ${urlStr}`);

      try {
        const urlObj = new URL(urlStr, window.location.origin);
        const widgetMatch = urlStr.match(/embed-widget\/([^/?]+)/);
        const widgetType = widgetMatch ? widgetMatch[1] : 'advanced-chart';
        const locale = urlObj.searchParams.get('locale') || 'en';

        const proxyUrl = `/api/tradingview-widget/${widgetType}?locale=${locale}`;
        console.log(`✅ [MAIN] XHR redirected to proxy: ${proxyUrl}`);
        urlStr = proxyUrl;
      } catch (e) {
        console.error('❌ [MAIN] Error parsing XHR URL:', e);
      }
    }

    return originalOpen.call(this, method, urlStr, ...args);
  };

  (window as any).__tradingViewFetchIntercepted = true;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "METACHROME - Advanced Crypto Trading Platform";

createRoot(document.getElementById("root")!).render(<App />);
