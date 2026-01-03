var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// ⚡ CRITICAL: Intercept fetch AND XHR BEFORE anything else loads
// This must be at the very top to catch TradingView widget requests
if (!window.__tradingViewFetchIntercepted) {
    console.log('🔧 [MAIN] Setting up global TradingView fetch + XHR interception...');
    // Intercept fetch
    var originalFetch_1 = window.fetch;
    window.fetch = function (input, init) {
        var url = typeof input === 'string' ? input : input.toString();
        // Intercept tradingview-widget.com requests
        if (url.includes('tradingview-widget.com')) {
            console.log("\uD83D\uDD04 [MAIN] Intercepting fetch: ".concat(url));
            // Extract the widget type and query params
            try {
                var urlObj = new URL(url, window.location.origin);
                var widgetMatch = url.match(/embed-widget\/([^/?]+)/);
                var widgetType = widgetMatch ? widgetMatch[1] : 'advanced-chart';
                var locale = urlObj.searchParams.get('locale') || 'en';
                // Redirect to our proxy
                var proxyUrl = "/api/tradingview-widget/".concat(widgetType, "?locale=").concat(locale);
                console.log("\u2705 [MAIN] Fetch redirected to proxy: ".concat(proxyUrl));
                url = proxyUrl;
            }
            catch (e) {
                console.error('❌ [MAIN] Error parsing URL:', e);
            }
        }
        return originalFetch_1(url, init);
    };
    // Intercept XMLHttpRequest (XHR) - TradingView might use this instead of fetch
    var originalOpen_1 = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var urlStr = typeof url === 'string' ? url : url.toString();
        if (urlStr.includes('tradingview-widget.com')) {
            console.log("\uD83D\uDD04 [MAIN] Intercepting XHR: ".concat(urlStr));
            try {
                var urlObj = new URL(urlStr, window.location.origin);
                var widgetMatch = urlStr.match(/embed-widget\/([^/?]+)/);
                var widgetType = widgetMatch ? widgetMatch[1] : 'advanced-chart';
                var locale = urlObj.searchParams.get('locale') || 'en';
                var proxyUrl = "/api/tradingview-widget/".concat(widgetType, "?locale=").concat(locale);
                console.log("\u2705 [MAIN] XHR redirected to proxy: ".concat(proxyUrl));
                urlStr = proxyUrl;
            }
            catch (e) {
                console.error('❌ [MAIN] Error parsing XHR URL:', e);
            }
        }
        return originalOpen_1.call.apply(originalOpen_1, __spreadArray([this, method, urlStr], args, false));
    };
    window.__tradingViewFetchIntercepted = true;
}
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Set the document title
document.title = "METACHROME - Advanced Crypto Trading Platform";
createRoot(document.getElementById("root")).render(<App />);
