var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect, useRef } from "react";
import { Navigation } from "../components/ui/navigation";
import { Footer } from "../components/ui/footer";
import { MobileBottomNav } from "../components/ui/mobile-bottom-nav";
import { MobileHeader } from "../components/ui/mobile-header";
import TradingViewWidget from "../components/TradingViewWidget";
import LightweightChart from "../components/LightweightChart";
import ErrorBoundary from "../components/ErrorBoundary";
import { PriceProvider, usePrice, usePriceChange, use24hStats } from "../contexts/PriceContext";
import TradeNotification from "../components/TradeNotification";
import TradeOverlay from "../components/TradeOverlay";
import { playTradeSound } from "../utils/sounds";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { useIsMobile } from '../hooks/use-mobile';
import { useMultiSymbolPrice } from '../hooks/useMultiSymbolPrice';
// Inner component that uses price context
function OptionsPageContent(_a) {
    var _this = this;
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var selectedSymbol = _a.selectedSymbol, setSelectedSymbol = _a.setSelectedSymbol;
    var user = useAuth().user;
    var _k = useWebSocket(), lastMessage = _k.lastMessage, subscribe = _k.subscribe, connected = _k.connected, sendMessage = _k.sendMessage;
    var queryClient = useQueryClient();
    var isMobile = useIsMobile();
    // Log WebSocket connection status
    useEffect(function () {
        console.log('🔌 WebSocket connection status:', connected ? 'CONNECTED' : 'DISCONNECTED');
    }, [connected]);
    // Debug WebSocket connection status
    useEffect(function () {
        console.log('🔌 WEBSOCKET STATUS:', { connected: connected, hasLastMessage: !!lastMessage });
        if (connected) {
            console.log('✅ WebSocket is connected and ready');
        }
        else {
            console.log('❌ WebSocket is NOT connected');
        }
    }, [connected, lastMessage]);
    // Use price context for synchronized price data
    var priceData = usePrice().priceData;
    var _l = usePriceChange(), changeText = _l.changeText, changeColor = _l.changeColor, isPositive = _l.isPositive;
    var _m = use24hStats(), high = _m.high, low = _m.low, volume = _m.volume;
    // Multi-symbol price data for all trading pairs
    var _o = useMultiSymbolPrice(), multiSymbolPriceData = _o.priceData, getPriceForSymbol = _o.getPriceForSymbol;
    // Chart view state - Default to TradingView to avoid red line issues
    var _p = useState('tradingview'), chartView = _p[0], setChartView = _p[1];
    // Debug user data
    console.log('🔍 OPTIONS PAGE - User data:', {
        id: user === null || user === void 0 ? void 0 : user.id,
        role: user === null || user === void 0 ? void 0 : user.role,
        verificationStatus: user === null || user === void 0 ? void 0 : user.verificationStatus,
        username: user === null || user === void 0 ? void 0 : user.username
    });
    // Debug price data from context
    console.log('💰 OPTIONS PAGE - Price from context:', priceData === null || priceData === void 0 ? void 0 : priceData.price);
    var _q = useState(""), searchTerm = _q[0], setSearchTerm = _q[1];
    var _r = useState("open"), activeTab = _r[0], setActiveTab = _r[1];
    var _s = useState("30s"), selectedDuration = _s[0], setSelectedDuration = _s[1];
    var _t = useState(100), selectedAmount = _t[0], setSelectedAmount = _t[1];
    var _u = useState(0), currentPrice = _u[0], setCurrentPrice = _u[1];
    var _v = useState(0), countdown = _v[0], setCountdown = _v[1];
    var _w = useState(false), isTrading = _w[0], setIsTrading = _w[1];
    var _x = useState([]), activeTrades = _x[0], setActiveTrades = _x[1];
    var _y = useState([]), tradeHistory = _y[0], setTradeHistory = _y[1];
    var _z = useState(null), completedTrade = _z[0], setCompletedTrade = _z[1];
    var _0 = useState(''), notificationKey = _0[0], setNotificationKey = _0[1]; // Force re-render
    // Track recent notifications to prevent duplicates
    var recentNotificationsRef = useRef(new Map());
    // Track which trades have been notified via WebSocket to prevent polling from overwriting
    var websocketNotifiedTradesRef = useRef(new Set());
    // ROBUST NOTIFICATION TRIGGER FUNCTION
    var triggerNotification = function (trade) {
        var _a;
        console.log('🔔 TRIGGER: Starting notification trigger for trade:', trade.id, 'Amount:', trade.amount);
        // CRITICAL: Validate that we have essential trade data before showing notification
        // This prevents showing incomplete notifications with default values like 100 USDT
        if (!trade.amount || trade.amount <= 0) {
            console.log('⚠️ TRIGGER: Skipping notification - invalid amount:', trade.amount);
            return;
        }
        if (!trade.id) {
            console.log('⚠️ TRIGGER: Skipping notification - no trade ID');
            return;
        }
        // CRITICAL: Check if trade is too old (more than trade duration + 30 seconds buffer)
        // This prevents showing stale notifications from previous trades
        // But allows notifications for longer duration trades (90s, 120s, etc.)
        if (trade.startTime && typeof trade.startTime === 'number') {
            var tradeAge = Date.now() - trade.startTime;
            var maxAge = (trade.duration || 30) * 1000 + 30000; // Trade duration + 30 second buffer
            if (tradeAge > maxAge) {
                console.log('⚠️ TRIGGER: Skipping notification - trade is too old:', tradeAge, 'ms (max allowed:', maxAge, 'ms)');
                return;
            }
        }
        // CRITICAL DEBUG: Log symbol information
        console.log('🔔 TRIGGER: Symbol information:', {
            symbol: trade.symbol,
            symbolType: typeof trade.symbol,
            symbolLength: (_a = trade.symbol) === null || _a === void 0 ? void 0 : _a.length,
            symbolIsUndefined: trade.symbol === undefined,
            symbolIsNull: trade.symbol === null,
            symbolIsEmpty: trade.symbol === ''
        });
        // Check for duplicate notifications within 5 seconds (but allow test messages)
        var now = Date.now();
        var isTestTrade = trade.id.includes('test-');
        var lastNotificationTime = recentNotificationsRef.current.get(trade.id);
        if (lastNotificationTime && (now - lastNotificationTime) < 5000 && !isTestTrade) {
            console.log('🔔 TRIGGER: Duplicate notification prevented for trade:', trade.id, 'Last notification was', (now - lastNotificationTime), 'ms ago');
            return;
        }
        // Record this notification
        recentNotificationsRef.current.set(trade.id, now);
        // Clean up old entries (keep only last 10 minutes)
        var tenMinutesAgo = now - (10 * 60 * 1000);
        for (var _i = 0, _b = recentNotificationsRef.current.entries(); _i < _b.length; _i++) {
            var _c = _b[_i], tradeId = _c[0], timestamp = _c[1];
            if (timestamp < tenMinutesAgo) {
                recentNotificationsRef.current.delete(tradeId);
            }
        }
        // Remove any existing DOM notifications first
        var existing = document.querySelectorAll('[data-mobile-notification="true"]');
        existing.forEach(function (el) { return el.remove(); });
        // Generate stable key based on trade ID only (not timestamp to prevent flickering)
        var stableKey = "trade-".concat(trade.id);
        setNotificationKey(stableKey);
        // Set notification directly without clearing first (prevents flickering)
        console.log('🔔 TRIGGER: About to call setCompletedTrade with:', {
            id: trade.id,
            amount: trade.amount,
            duration: trade.duration,
            status: trade.status
        });
        // Mark this trade as notified via WebSocket to prevent polling from overwriting
        websocketNotifiedTradesRef.current.add(trade.id);
        setCompletedTrade(trade);
        localStorage.setItem('completedTrade', JSON.stringify(trade));
        console.log('🔔 TRIGGER: Notification set for trade:', trade.id);
        console.log('🔔 TRIGGER: Full trade object being displayed:', JSON.stringify({
            id: trade.id,
            amount: trade.amount,
            entryPrice: trade.entryPrice,
            currentPrice: trade.currentPrice,
            status: trade.status,
            duration: trade.duration,
            profitPercentage: trade.profitPercentage
        }, null, 2));
        // Auto-hide after 25 seconds (reduced from 60 for better UX)
        setTimeout(function () {
            setCompletedTrade(null);
            localStorage.removeItem('completedTrade');
            // Clear from websocket notified set
            websocketNotifiedTradesRef.current.delete(trade.id);
        }, 25000);
    };
    // GLOBAL FUNCTION FOR CONSOLE TESTING
    useEffect(function () {
        if (typeof window !== 'undefined') {
            // Test function to simulate a real trade completion
            window.simulateRealTradeCompletion = function () {
                console.log('🎭 SIMULATING REAL TRADE COMPLETION...');
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    console.log('❌ No user logged in');
                    return;
                }
                // Create a mock trade completion message that matches the server format
                var mockTradeCompletion = {
                    type: 'trade_completed',
                    data: {
                        tradeId: 'simulated-' + Date.now(),
                        userId: user.id,
                        result: 'win',
                        exitPrice: 51000,
                        profitAmount: 10,
                        newBalance: 1000,
                        timestamp: new Date().toISOString()
                    }
                };
                console.log('🎭 Mock trade completion message:', mockTradeCompletion);
                // Manually trigger the WebSocket message handler by setting lastMessage
                // This simulates what would happen when a real WebSocket message arrives
                console.log('🎭 This should trigger the notification system...');
                // Create a test trade for the notification
                var testTrade = {
                    id: mockTradeCompletion.data.tradeId,
                    symbol: 'BTC/USDT',
                    direction: 'up',
                    amount: 100,
                    entryPrice: 50000,
                    currentPrice: 51000,
                    status: 'won',
                    duration: 30,
                    profitPercentage: 10,
                    payout: 110,
                    profit: 10
                };
                console.log('🎭 Triggering notification directly...');
                triggerNotification(testTrade);
            };
            window.testMobileNotification = function () {
                console.log('🧪 GLOBAL: Testing mobile notification from console');
                var testTrade = {
                    id: 'console-test-' + Date.now(),
                    direction: 'up',
                    amount: 100,
                    entryPrice: 50000,
                    currentPrice: 51000,
                    status: 'won',
                    payout: 110,
                    profitPercentage: 10
                };
                triggerNotification(testTrade);
            };
            // IMMEDIATE NOTIFICATION TEST
            window.testNotificationNow = function () {
                console.log('🚀 IMMEDIATE: Testing notification immediately');
                var testTrade = {
                    id: 'immediate-test-' + Date.now(),
                    symbol: 'BTC/USDT',
                    direction: 'up',
                    amount: 100,
                    entryPrice: 114420.87,
                    currentPrice: 114904.29,
                    status: 'won',
                    duration: 30,
                    profitPercentage: 10,
                    payout: 110,
                    profit: 10
                };
                console.log('🚀 IMMEDIATE: Calling triggerNotification with:', testTrade);
                triggerNotification(testTrade);
            };
            // TEST WEBSOCKET NOTIFICATION FROM SERVER
            window.testWebSocketNotification = function () { return __awaiter(_this, void 0, void 0, function () {
                var response, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log('🧪 WEBSOCKET TEST: Requesting server to send WebSocket notification');
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch('/api/test/websocket-notification', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: user === null || user === void 0 ? void 0 : user.id })
                                })];
                        case 2:
                            response = _a.sent();
                            return [4 /*yield*/, response.json()];
                        case 3:
                            result = _a.sent();
                            console.log('🧪 WEBSOCKET TEST: Server response:', result);
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _a.sent();
                            console.error('🧪 WEBSOCKET TEST: Error:', error_1);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); };
            // SIMULATE WEBSOCKET MESSAGE DIRECTLY
            window.simulateTradeCompleted = function () {
                console.log('🎭 SIMULATE: Creating fake trade_completed message');
                var fakeMessage = {
                    type: 'trade_completed',
                    data: {
                        tradeId: 'simulate-' + Date.now(),
                        userId: user === null || user === void 0 ? void 0 : user.id,
                        result: 'win',
                        exitPrice: 50000,
                        profitAmount: 10,
                        newBalance: 1000,
                        timestamp: new Date().toISOString()
                    }
                };
                console.log('🎭 SIMULATE: Fake message created:', fakeMessage);
                // Manually trigger the WebSocket effect by setting lastMessage
                // This simulates what would happen if the server sent this message
                console.log('🎭 SIMULATE: This would trigger the notification if WebSocket was working');
                // Create a test trade directly
                var simulatedTrade = {
                    id: fakeMessage.data.tradeId,
                    symbol: 'BTC/USDT',
                    direction: 'up',
                    amount: 100,
                    entryPrice: 49000,
                    currentPrice: fakeMessage.data.exitPrice,
                    status: fakeMessage.data.result === 'win' ? 'won' : 'lost',
                    duration: 30,
                    profitPercentage: 10,
                    payout: fakeMessage.data.result === 'win' ? 110 : 0,
                    profit: fakeMessage.data.profitAmount
                };
                console.log('🎭 SIMULATE: Triggering notification with simulated trade:', simulatedTrade);
                triggerNotification(simulatedTrade);
            };
            window.testDirectNotification = function () {
                console.log('🧪 GLOBAL: Creating direct DOM notification from console');
                // Remove existing
                var existing = document.querySelectorAll('[data-mobile-notification="true"]');
                existing.forEach(function (el) { return el.remove(); });
                // Test the complete flow
                var testTrade = {
                    id: 'flow-test-' + Date.now(),
                    direction: 'up',
                    amount: 100,
                    entryPrice: 50000,
                    currentPrice: 51000,
                    status: 'won',
                    payout: 110,
                    profitPercentage: 10,
                    symbol: 'BTC/USDT',
                    duration: 30,
                    profit: 10
                };
                console.log('🧪 GLOBAL: Testing complete notification flow with trade:', testTrade);
                triggerNotification(testTrade);
            };
            window.testTradeCompletion = function () {
                console.log('🧪 GLOBAL: Simulating trade completion WebSocket message');
                // Simulate a WebSocket message
                var mockMessage = {
                    type: 'trigger_mobile_notification',
                    data: {
                        tradeId: 'mock-test-' + Date.now(),
                        userId: user === null || user === void 0 ? void 0 : user.id,
                        direction: 'up',
                        amount: 100,
                        entryPrice: 50000,
                        currentPrice: 51000,
                        status: 'won',
                        payout: 110,
                        profitPercentage: 10,
                        symbol: 'BTC/USDT',
                        duration: 30
                    }
                };
                console.log('🧪 GLOBAL: Simulating WebSocket message:', mockMessage);
                // Manually trigger the useEffect by setting lastMessage
                // This simulates what would happen when a real WebSocket message arrives
            };
            window.testOldDirectNotification = function () {
                console.log('🧪 GLOBAL: Creating direct DOM notification from console');
                // Remove existing
                var existing = document.querySelectorAll('[data-mobile-notification="true"]');
                existing.forEach(function (el) { return el.remove(); });
                // Create new
                var notification = document.createElement('div');
                notification.setAttribute('data-mobile-notification', 'true');
                notification.style.cssText = "\n          position: fixed !important;\n          top: 0 !important;\n          left: 0 !important;\n          right: 0 !important;\n          bottom: 0 !important;\n          z-index: 999999999 !important;\n          background-color: rgba(0, 0, 0, 0.95) !important;\n          display: flex !important;\n          align-items: center !important;\n          justify-content: center !important;\n          padding: 16px !important;\n          visibility: visible !important;\n          opacity: 1 !important;\n          pointer-events: auto !important;\n        ";
                notification.innerHTML = "\n          <div style=\"\n            background-color: #1a1b3a;\n            border-radius: 16px;\n            padding: 20px;\n            max-width: 320px;\n            width: 90%;\n            border: 3px solid #10b981;\n            color: white;\n            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);\n            text-align: center;\n          \">\n            <div style=\"font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 16px;\">\n              \uD83C\uDF89 CONSOLE TEST SUCCESS!\n            </div>\n            <div style=\"margin-bottom: 16px; color: #9ca3af;\">\n              This notification was triggered from the browser console.\n            </div>\n            <button onclick=\"this.closest('[data-mobile-notification]').remove()\" style=\"\n              background-color: #10b981;\n              color: white;\n              border: none;\n              border-radius: 8px;\n              padding: 12px 24px;\n              font-size: 14px;\n              font-weight: bold;\n              cursor: pointer;\n              width: 100%;\n            \">\n              Close Console Test\n            </button>\n          </div>\n        ";
                document.body.appendChild(notification);
                console.log('✅ GLOBAL: Direct notification created from console');
            };
            // FORCE NOTIFICATION TEST - Bypass all React logic
            window.forceNotificationTest = function () {
                console.log('🚀 FORCE: Creating notification directly via DOM manipulation');
                // Remove any existing notifications
                var existing = document.querySelectorAll('[data-mobile-notification="true"]');
                existing.forEach(function (el) { return el.remove(); });
                // Create notification element
                var notification = document.createElement('div');
                notification.setAttribute('data-mobile-notification', 'true');
                notification.style.cssText = "\n          position: fixed;\n          top: 0;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          background: rgba(0, 0, 0, 0.8);\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          z-index: 999999;\n          font-family: Arial, sans-serif;\n        ";
                notification.innerHTML = "\n          <div style=\"\n            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);\n            border-radius: 16px;\n            padding: 24px;\n            max-width: 350px;\n            width: 90%;\n            border: 1px solid #3a3d5a;\n            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);\n            text-align: center;\n            color: white;\n          \">\n            <div style=\"font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 16px;\">\n              \uD83C\uDF89 Trade Won!\n            </div>\n            <div style=\"font-size: 12px; color: #9ca3af; margin-bottom: 16px;\">\n              Market: BTC/USDT\n            </div>\n            <div style=\"background: #2a2d47; border-radius: 8px; padding: 12px; margin-bottom: 16px; border: 1px solid #3a3d5a;\">\n              <div style=\"display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;\">\n                <span style=\"color: #9ca3af;\">Trade:</span>\n                <span style=\"color: #10b981; font-weight: bold;\">BUY UP</span>\n              </div>\n              <div style=\"display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;\">\n                <span style=\"color: #9ca3af;\">Amount:</span>\n                <span style=\"color: white; font-weight: bold;\">100 USDT</span>\n              </div>\n              <div style=\"display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;\">\n                <span style=\"color: #9ca3af;\">Entry Price:</span>\n                <span style=\"color: white; font-weight: bold;\">115,520.39</span>\n              </div>\n              <div style=\"display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;\">\n                <span style=\"color: #9ca3af;\">Close Price:</span>\n                <span style=\"color: white; font-weight: bold;\">115,904.29</span>\n              </div>\n              <div style=\"display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;\">\n                <span style=\"color: #9ca3af;\">Duration:</span>\n                <span style=\"color: white; font-weight: bold;\">30 seconds</span>\n              </div>\n              <div style=\"display: flex; justify-content: space-between; font-size: 12px;\">\n                <span style=\"color: #9ca3af;\">Profit:</span>\n                <span style=\"color: #10b981; font-weight: bold;\">+10</span>\n              </div>\n            </div>\n            <button onclick=\"this.parentElement.parentElement.remove()\" style=\"\n              background: #10b981;\n              color: white;\n              border: none;\n              border-radius: 8px;\n              padding: 12px 24px;\n              font-weight: bold;\n              cursor: pointer;\n              width: 100%;\n            \">\n              Close Notification\n            </button>\n          </div>\n        ";
                document.body.appendChild(notification);
                console.log('✅ FORCE: Notification created and added to DOM');
                // Auto-remove after 30 seconds
                setTimeout(function () {
                    if (notification.parentNode) {
                        notification.remove();
                        console.log('🗑️ FORCE: Auto-removed notification');
                    }
                }, 30000);
            };
            console.log('🧪 GLOBAL FUNCTIONS AVAILABLE:');
            console.log('- testMobileNotification() - Test React notification');
            console.log('- testDirectNotification() - Test direct DOM notification');
            console.log('- forceNotificationTest() - Force create notification (GUARANTEED TO WORK)');
        }
    }, []);
    var _1 = useState(function () {
        // Initialize from localStorage if available
        var stored = localStorage.getItem('currentTradingMode');
        return (stored === 'win' || stored === 'lose' || stored === 'normal') ? stored : 'normal';
    }), currentTradingMode = _1[0], setCurrentTradingMode = _1[1];
    var _2 = useState(false), isMobileModalOpen = _2[0], setIsMobileModalOpen = _2[1];
    var _3 = useState(null), mobileTradeData = _3[0], setMobileTradeData = _3[1];
    var priceHistoryRef = useRef([]);
    var _4 = useState(false), isLoadingHistory = _4[0], setIsLoadingHistory = _4[1];
    // Mobile trade modal function
    var showMobileTradeModal = function (data) {
        setMobileTradeData(data);
        setIsMobileModalOpen(true);
        // Force body scroll prevention
        document.body.style.overflow = 'hidden';
    };
    // Load trade history function (moved outside useEffect for reusability)
    var loadTradeHistory = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, serverTrades, formattedTrades, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    setIsLoadingHistory(true);
                    // CRITICAL FIX: Invalidate React Query cache to prevent conflicts with TransactionHistory.tsx
                    try {
                        queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user.id, "/trades")] });
                        console.log('🗑️ Invalidated React Query cache for trade history to prevent conflicts');
                    }
                    catch (error) {
                        console.error('❌ Error invalidating React Query cache:', error);
                    }
                    // Clear any existing localStorage cache to prevent conflicts
                    try {
                        localStorage.removeItem("tradeHistory_".concat(user.id));
                        console.log('🗑️ Cleared any existing localStorage trade history cache');
                    }
                    catch (error) {
                        console.error('❌ Error clearing localStorage cache:', error);
                    }
                    // Always fetch fresh data from server
                    console.log('📈 Loading fresh trade history from server (no caching)');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("/api/users/".concat(user.id, "/trades"), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    serverTrades = _a.sent();
                    console.log('📈 Loaded trade history from server:', serverTrades.length);
                    console.log('📈 Raw server trades:', serverTrades);
                    // Convert server trades to ActiveTrade format - IMPROVED FILTERING
                    console.log('📈 Raw server trades before filtering:', serverTrades);
                    formattedTrades = serverTrades
                        .filter(function (trade) {
                        // More lenient filtering - include any trade with a result
                        var hasResult = trade.result && (trade.result === 'win' || trade.result === 'lose' || trade.result === 'won' || trade.result === 'lost');
                        var notPending = trade.status !== 'pending' && trade.result !== 'pending';
                        console.log("\uD83D\uDCC8 Trade ".concat(trade.id, ": result=").concat(trade.result, ", status=").concat(trade.status, ", hasResult=").concat(hasResult, ", notPending=").concat(notPending));
                        return hasResult && notPending;
                    })
                        .map(function (trade) {
                        var entryPrice = parseFloat(trade.entry_price || '0');
                        var exitPrice = parseFloat(trade.exit_price || '0');
                        var isWon = (trade.result === 'win' || trade.result === 'won');
                        console.log("\uD83D\uDCCA Trade ".concat(trade.id, ": Entry=").concat(entryPrice, ", Exit=").concat(exitPrice, ", Status=").concat(trade.status, ", Result=").concat(trade.result));
                        // ONLY generate exit price if it's truly missing from database (should be rare)
                        if (!exitPrice || exitPrice === 0) {
                            console.log("\u26A0\uFE0F Missing exit price for trade ".concat(trade.id, ", generating consistent fallback"));
                            // Use trade ID as seed for consistent price generation
                            var seed = parseInt(trade.id.toString().slice(-6)) || 123456;
                            var seededRandom = (seed * 9301 + 49297) % 233280 / 233280; // Simple seeded random
                            // Generate realistic price movement for Bitcoin (0.01% to 0.5% max for 30-60 second trades)
                            var maxMovement = 0.005; // 0.5% maximum movement for short-term trades
                            var minMovement = 0.0001; // 0.01% minimum movement
                            var movementRange = maxMovement - minMovement;
                            var movementPercent = (seededRandom * movementRange + minMovement);
                            // Determine direction based on trade outcome and direction
                            var priceDirection = 1; // Default up
                            if (trade.direction === 'up') {
                                // For UP trades: WIN means price goes up, LOSE means price goes down
                                priceDirection = isWon ? 1 : -1;
                            }
                            else if (trade.direction === 'down') {
                                // For DOWN trades: WIN means price goes down, LOSE means price goes up
                                priceDirection = isWon ? -1 : 1;
                            }
                            // Calculate realistic exit price
                            exitPrice = entryPrice * (1 + (movementPercent * priceDirection));
                            // Ensure minimum price difference (at least $0.01 for Bitcoin)
                            var minDifference = 0.01;
                            if (Math.abs(exitPrice - entryPrice) < minDifference) {
                                exitPrice = entryPrice + (priceDirection * minDifference);
                            }
                            console.log("\u2705 Generated fallback exit price for trade ".concat(trade.id, ": ").concat(exitPrice));
                        }
                        else {
                            console.log("\u2705 Using stored exit price for trade ".concat(trade.id, ": ").concat(exitPrice));
                        }
                        var formattedTrade = {
                            id: trade.id,
                            symbol: trade.symbol || 'BTCUSDT',
                            amount: parseFloat(trade.amount),
                            direction: trade.direction,
                            duration: trade.duration || 30,
                            entryPrice: entryPrice,
                            currentPrice: exitPrice, // Use calculated realistic exit price
                            payout: isWon ? parseFloat(trade.amount) + parseFloat(trade.profit_loss || '0') : 0,
                            status: isWon ? 'won' : 'lost',
                            endTime: trade.updated_at || trade.created_at,
                            startTime: trade.created_at,
                            profit: parseFloat(trade.profit_loss || '0'),
                            profitPercentage: (function () {
                                var dur = trade.duration || 30;
                                if (dur === 30)
                                    return 10;
                                else if (dur === 60)
                                    return 15;
                                else if (dur === 90)
                                    return 20;
                                else if (dur === 120)
                                    return 25;
                                else if (dur === 180)
                                    return 30;
                                else if (dur === 240)
                                    return 50;
                                else if (dur === 300)
                                    return 75;
                                else if (dur === 600)
                                    return 100;
                                return 10;
                            })()
                        };
                        console.log("\uD83D\uDCC8 Formatted trade ".concat(trade.id, ":"), formattedTrade);
                        return formattedTrade;
                    });
                    console.log('📈 Formatted trades count:', formattedTrades.length);
                    setTradeHistory(formattedTrades);
                    // Don't cache trade history to prevent conflicts with fresh data
                    console.log('📈 Trade history loaded fresh from server (no caching):', user.id);
                    return [3 /*break*/, 5];
                case 4:
                    console.log('⚠️ Failed to load trade history from server, using cached data');
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    console.error('❌ Error loading trade history from server, using cached data:', error_2);
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoadingHistory(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Load trade history from server on component mount (no auto-refresh)
    useEffect(function () {
        loadTradeHistory();
    }, [user === null || user === void 0 ? void 0 : user.id]);
    // Sync trading mode from localStorage on mount and when it changes
    useEffect(function () {
        var syncTradingMode = function () {
            var stored = localStorage.getItem('currentTradingMode');
            if (stored && (stored === 'win' || stored === 'lose' || stored === 'normal')) {
                setCurrentTradingMode(stored);
                console.log("\uD83D\uDD04 Synced trading mode from localStorage: ".concat(stored.toUpperCase()));
            }
        };
        // Sync on mount
        syncTradingMode();
        // Listen for localStorage changes (from other tabs or WebSocket updates)
        window.addEventListener('storage', syncTradingMode);
        return function () {
            window.removeEventListener('storage', syncTradingMode);
        };
    }, []);
    // Real-time price state - NOW USING PRICE CONTEXT (SINGLE SOURCE OF TRUTH)
    // REMOVED local state - using priceData from context instead
    // const [realTimePrice, setRealTimePrice] = useState<string>('0.00');
    // const [priceChange, setPriceChange] = useState<string>('0.00%');
    // const [orderBookPrice, setOrderBookPrice] = useState<number>(166373.87);
    // Use price from context - ALL components will show SAME price
    var realTimePrice = (priceData === null || priceData === void 0 ? void 0 : priceData.price.toFixed(2)) || '0.00';
    var orderBookPrice = (priceData === null || priceData === void 0 ? void 0 : priceData.price) || 166373.87;
    // SINGLE SOURCE OF TRUTH for display price - ALWAYS use priceData from context
    // This ensures ALL numbers across the page are SYNCHRONIZED
    var displayPrice = (priceData === null || priceData === void 0 ? void 0 : priceData.price) || currentPrice || 166373.87;
    // Trading pairs data - Dynamic with real-time prices (All 17 supported currencies)
    var tradingPairs = [
        'BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'LTCUSDT', 'BNBUSDT',
        'SOLUSDT', 'TONUSDT', 'DOGEUSDT', 'ADAUSDT', 'TRXUSDT',
        'LINKUSDT', 'AVAXUSDT', 'SUIUSDT', 'SHIBUSDT',
        'BCHUSDT', 'DOTUSDT', 'XLMUSDT'
    ].map(function (rawSymbol) {
        // Get real-time price data for this symbol
        var symbolPriceData = getPriceForSymbol(rawSymbol);
        // For the currently selected symbol, use the PriceContext data (more frequent updates)
        var isCurrentSymbol = rawSymbol === selectedSymbol;
        var price = isCurrentSymbol && priceData ? priceData.price : ((symbolPriceData === null || symbolPriceData === void 0 ? void 0 : symbolPriceData.price) || 0);
        var priceChangePercent = isCurrentSymbol && priceData ?
            priceData.priceChangePercent24h :
            ((symbolPriceData === null || symbolPriceData === void 0 ? void 0 : symbolPriceData.priceChangePercent24h) || 0);
        // Format price change percentage
        var formattedChange = priceChangePercent >= 0 ?
            "+".concat(priceChangePercent.toFixed(2), "%") :
            "".concat(priceChangePercent.toFixed(2), "%");
        return {
            symbol: rawSymbol.replace('USDT', '/USDT'),
            coin: rawSymbol.replace('USDT', ''),
            rawSymbol: rawSymbol,
            price: price.toString(),
            priceChangePercent24h: formattedChange
        };
    });
    // Filter trading pairs based on search term
    var filteredTradingPairs = tradingPairs.filter(function (pair) {
        return pair.coin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pair.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    });
    // Get current selected pair data
    var currentPairData = tradingPairs.find(function (pair) { return pair.rawSymbol === selectedSymbol; }) || tradingPairs[0];
    // Handle trading pair selection
    var handlePairSelect = function (rawSymbol) {
        console.log('🔄 Selected trading pair:', rawSymbol);
        setSelectedSymbol(rawSymbol);
        // Clear search when a pair is selected
        setSearchTerm("");
    };
    // Handle symbol change from TradingView widget
    var handleTradingViewSymbolChange = function (newSymbol) {
        console.log('📈 TradingView symbol changed to:', newSymbol);
        console.log('📈 Current selected symbol:', selectedSymbol);
        console.log('📈 Available trading pairs:', tradingPairs.map(function (p) { return p.rawSymbol; }));
        // Convert TradingView symbol format to our format
        // e.g., "ETHUSDT" -> "ETHUSDT"
        var cleanSymbol = newSymbol.replace('BINANCE:', '').replace('COINBASE:', '');
        // Check if this symbol exists in our trading pairs
        var matchingPair = tradingPairs.find(function (pair) { return pair.rawSymbol === cleanSymbol; });
        if (matchingPair) {
            console.log('✅ Found matching pair:', matchingPair);
            console.log('✅ Setting selected symbol to:', cleanSymbol);
            setSelectedSymbol(cleanSymbol);
            // Clear search when symbol changes
            setSearchTerm("");
        }
        else {
            console.log('⚠️ Symbol not found in trading pairs:', cleanSymbol);
            console.log('⚠️ Available symbols:', tradingPairs.map(function (p) { return p.rawSymbol; }).join(', '));
            // Optionally, you could add the symbol to trading pairs or show a notification
        }
    };
    // Handle search with auto-selection
    var handleSearchChange = function (value) {
        setSearchTerm(value);
        // Auto-select if search matches exactly one coin
        if (value.length > 0) {
            var exactMatches = tradingPairs.filter(function (pair) {
                return pair.coin.toLowerCase() === value.toLowerCase();
            });
            if (exactMatches.length === 1) {
                console.log('🎯 Auto-selecting exact match:', exactMatches[0].rawSymbol);
                setSelectedSymbol(exactMatches[0].rawSymbol);
            }
        }
    };
    var _5 = useState({ sellOrders: [], buyOrders: [] }), orderBookData = _5[0], setOrderBookData = _5[1]; // Cache order book data
    // REMOVED: fetchBinancePrice - Now using PriceContext instead
    // Price updates are handled by PriceContext automatically
    // Update order book and price history when price changes from context
    useEffect(function () {
        if (priceData === null || priceData === void 0 ? void 0 : priceData.price) {
            var price = priceData.price;
            // Update price history for trade calculations
            priceHistoryRef.current.push(price);
            if (priceHistoryRef.current.length > 1000) {
                priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
            }
            // Generate new order book data based on current price
            var newOrderBookData = generateOrderBookData(price);
            setOrderBookData(newOrderBookData);
            console.log('📊 Price update from context:', price.toFixed(2));
            console.log('📊 Order book data generated:', {
                sellOrders: newOrderBookData.sellOrders.length,
                buyOrders: newOrderBookData.buyOrders.length,
                firstSell: newOrderBookData.sellOrders[0],
                firstBuy: newOrderBookData.buyOrders[0]
            });
        }
    }, [priceData === null || priceData === void 0 ? void 0 : priceData.price]); // Re-run when price changes
    // REMOVED: updatePriceDisplay - Price display is now handled by React rendering with priceData from context
    // REMOVED: handlePriceUpdate - Not needed anymore, price comes from PriceContext
    // Generate dynamic order book data based on current price
    var generateOrderBookData = function (basePrice) {
        var sellOrders = [];
        var buyOrders = [];
        // Generate sell orders (above current price)
        for (var i = 0; i < 8; i++) {
            var priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
            var price = basePrice + priceOffset;
            var volume_1 = (Math.random() * 2 + 0.1).toFixed(4);
            var turnover = (price * parseFloat(volume_1)).toFixed(2);
            sellOrders.push({
                price: price.toFixed(2),
                volume: volume_1,
                turnover: turnover
            });
        }
        // Generate buy orders (below current price)
        for (var i = 0; i < 8; i++) {
            var priceOffset = (i + 1) * (Math.random() * 0.5 + 0.1);
            var price = basePrice - priceOffset;
            var volume_2 = (Math.random() * 2 + 0.1).toFixed(4);
            var turnover = (price * parseFloat(volume_2)).toFixed(2);
            buyOrders.push({
                price: price.toFixed(2),
                volume: volume_2,
                turnover: turnover
            });
        }
        return { sellOrders: sellOrders, buyOrders: buyOrders };
    };
    // Fetch real market data
    var marketData = useQuery({
        queryKey: ['/api/market-data'],
        refetchInterval: 5000,
    }).data;
    // Fetch user balance with real-time sync - FIXED: Use same endpoint as Wallet page
    var userBalances = useQuery({
        queryKey: ['/api/balances'],
        enabled: !!user,
        refetchInterval: 2000, // Very fast refetch for real-time balance sync
        staleTime: 0, // Always consider data stale
        gcTime: 0, // Don't cache data (updated from cacheTime)
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response, errorText, data;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🔍 OPTIONS: Fetching balance from /api/balances for user:', user === null || user === void 0 ? void 0 : user.id, user === null || user === void 0 ? void 0 : user.username);
                        console.log('🔍 OPTIONS: Auth token:', ((_a = localStorage.getItem('authToken')) === null || _a === void 0 ? void 0 : _a.substring(0, 30)) + '...');
                        return [4 /*yield*/, fetch('/api/balances', {
                                credentials: 'include', // Important: send session cookies
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _b.sent();
                        console.log('🔍 OPTIONS: Response status:', response.status, response.statusText);
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _b.sent();
                        console.error('❌ OPTIONS: Balance API failed:', response.status, errorText);
                        throw new Error("Failed to fetch balance: ".concat(response.status, " ").concat(errorText));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _b.sent();
                        console.log('🔍 OPTIONS: Balance API response:', data);
                        return [2 /*return*/, data];
                }
            });
        }); },
    }).data;
    // Get current USDT balance - Only when user is authenticated
    var balance = 0;
    console.log('🔍 OPTIONS PAGE - User:', user === null || user === void 0 ? void 0 : user.id, 'UserBalances:', userBalances);
    if (user && userBalances && Array.isArray(userBalances)) {
        console.log('🔍 OPTIONS - RAW userBalances (array):', userBalances);
        // Format: [{ symbol: "USDT", available: "1400" }, ...]
        var usdtBalance = userBalances.find(function (b) { return b.symbol === 'USDT'; });
        balance = Number((usdtBalance === null || usdtBalance === void 0 ? void 0 : usdtBalance.available) || 0);
        console.log('🔍 OPTIONS - Using standardized array format:', balance, usdtBalance);
    }
    else if (user) {
        console.log('🔍 OPTIONS - userBalances is not in expected array format:', typeof userBalances, userBalances);
        console.log('🔍 OPTIONS - User authenticated but no balance data');
    }
    else {
        console.log('🔍 OPTIONS - No user authenticated');
    }
    // Ensure balance is a valid number
    if (isNaN(balance)) {
        console.warn('🔍 OPTIONS - Balance is NaN, setting to 0');
        balance = 0;
    }
    console.log('🔍 OPTIONS - Final balance:', balance);
    // Handle WebSocket balance updates for real-time sync
    useEffect(function () {
        var _a;
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'balance_update') {
            console.log('🔄 OPTIONS: Real-time balance update received:', lastMessage.data);
            console.log('🔄 OPTIONS: Current user ID:', user === null || user === void 0 ? void 0 : user.id, 'Update for user:', (_a = lastMessage.data) === null || _a === void 0 ? void 0 : _a.userId);
            // Aggressive cache invalidation - clear all balance-related queries
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
            queryClient.removeQueries({ queryKey: ['/api/balances'] });
            // Force immediate refetch with a small delay to ensure cache is cleared
            setTimeout(function () {
                queryClient.refetchQueries({ queryKey: ['/api/balances'] });
            }, 100);
        }
    }, [lastMessage, queryClient, user === null || user === void 0 ? void 0 : user.id]);
    // Get current BTC price from real market data
    var btcMarketData = marketData === null || marketData === void 0 ? void 0 : marketData.find(function (item) { return item.symbol === 'BTCUSDT'; });
    var realPrice = btcMarketData ? parseFloat(btcMarketData.price) : 0;
    // Ensure currentPrice is always a valid number - ALWAYS use displayPrice as primary source
    var safeCurrentPrice = displayPrice;
    // REMOVED: Initialize real-time price fetching - Now handled by PriceContext
    // Price updates are automatically managed by PriceContext provider
    // Throttled order book updates (much slower than real-time price)
    useEffect(function () {
        var updateOrderBook = function () {
            var latestPrice = safeCurrentPrice || parseFloat(realTimePrice) || 166373.87;
            // REMOVED: setOrderBookPrice - now using orderBookPrice from priceData
            // Generate new order book data
            var newOrderBookData = generateOrderBookData(latestPrice);
            setOrderBookData(newOrderBookData);
            console.log('📊 Order book updated with price:', latestPrice.toFixed(2));
        };
        updateOrderBook(); // Initial update
        var interval = setInterval(updateOrderBook, 30000); // Update every 30 seconds (very slow)
        return function () { return clearInterval(interval); };
    }, [safeCurrentPrice, realTimePrice]);
    // REMOVED: Update price display - Now handled automatically by React rendering with PriceContext
    // Price updates are reactive through priceData, changeText, and other context values
    // Update current price from real market data - RE-ENABLED (Binance is the primary source)
    useEffect(function () {
        if (realPrice > 0 && !realTimePrice) {
            setCurrentPrice(realPrice);
            // REMOVED: setOrderBookPrice - now using orderBookPrice from priceData
            // Keep price history for trade calculations
            priceHistoryRef.current.push(realPrice);
            if (priceHistoryRef.current.length > 1000) {
                priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
            }
            // Generate new order book data
            var newOrderBookData = generateOrderBookData(realPrice);
            setOrderBookData(newOrderBookData);
            console.log('📈 Real Price Update:', realPrice.toFixed(2));
        }
    }, [realPrice, realTimePrice]);
    // Subscribe to BTC price updates and balance updates via WebSocket
    useEffect(function () {
        if (connected && (user === null || user === void 0 ? void 0 : user.id)) {
            subscribe(['BTCUSDT']);
            console.log('🔌 Subscribed to BTCUSDT price updates');
            // Subscribe to balance updates for this user
            sendMessage({
                type: 'subscribe_user_balance',
                userId: user.id
            });
            console.log('🔌 Subscribed to balance updates for user:', user.id);
        }
    }, [connected, subscribe, sendMessage, user === null || user === void 0 ? void 0 : user.id]);
    // REMOVED: Fallback polling - Now handled by PriceContext
    // PriceContext automatically fetches from Binance API and provides real-time updates
    // Handle WebSocket price updates - Now using PriceContext as primary source
    useEffect(function () {
        var _a;
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'price_update' && ((_a = lastMessage.data) === null || _a === void 0 ? void 0 : _a.symbol) === 'BTCUSDT') {
            var price = parseFloat(lastMessage.data.price);
            if (price > 0) {
                setCurrentPrice(price);
                // REMOVED: setRealTimePrice and setOrderBookPrice - now using PriceContext
                priceHistoryRef.current.push(price);
                if (priceHistoryRef.current.length > 1000) {
                    priceHistoryRef.current = priceHistoryRef.current.slice(-1000);
                }
                // Generate new order book data
                var newOrderBookData = generateOrderBookData(price);
                setOrderBookData(newOrderBookData);
                console.log('📈 WebSocket Price Update:', price.toFixed(2));
            }
        }
    }, [lastMessage]);
    // Handle WebSocket balance updates for real-time sync
    useEffect(function () {
        var _a;
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'balance_update' && ((_a = lastMessage.data) === null || _a === void 0 ? void 0 : _a.userId) === (user === null || user === void 0 ? void 0 : user.id)) {
            console.log('💰 Real-time balance update received:', lastMessage.data);
            // Invalidate and refetch balance data to ensure UI sync - use correct query key
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            // Show notification for balance changes
            if (lastMessage.data.changeType !== 'trade_start') {
                console.log("\uD83D\uDCB0 Balance updated: ".concat(lastMessage.data.newBalance, " USDT (").concat(lastMessage.data.change > 0 ? '+' : '').concat(lastMessage.data.change, ")"));
            }
        }
    }, [lastMessage, user === null || user === void 0 ? void 0 : user.id, queryClient]);
    // Track processed messages to prevent duplicates
    var processedMessagesRef = useRef(new Set());
    // Handle WebSocket trade completion notifications for reliable notifications
    useEffect(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        // Skip if no message or user
        if (!lastMessage || !(user === null || user === void 0 ? void 0 : user.id))
            return;
        // Create unique message ID for deduplication
        var messageId = "".concat(lastMessage.type, "-").concat(((_a = lastMessage.data) === null || _a === void 0 ? void 0 : _a.tradeId) || ((_b = lastMessage.data) === null || _b === void 0 ? void 0 : _b.id) || 'unknown', "-").concat(((_c = lastMessage.data) === null || _c === void 0 ? void 0 : _c.userId) || 'unknown', "-").concat(((_d = lastMessage.data) === null || _d === void 0 ? void 0 : _d.timestamp) || Date.now());
        console.log('🔍 WEBSOCKET DEBUG: Checking message:', lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type, 'userId match:', ((_e = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.data) === null || _e === void 0 ? void 0 : _e.userId) === (user === null || user === void 0 ? void 0 : user.id));
        console.log('🔍 WEBSOCKET DEBUG: Message ID:', messageId);
        console.log('🔍 WEBSOCKET DEBUG: Full message:', lastMessage);
        console.log('🔍 WEBSOCKET DEBUG: Current user ID:', user === null || user === void 0 ? void 0 : user.id);
        console.log('🔍 WEBSOCKET DEBUG: Active trades count:', activeTrades.length);
        // Check if we've already processed this message (but allow manual test messages)
        var isTestMessage = messageId.includes('test-');
        if (processedMessagesRef.current.has(messageId) && !isTestMessage) {
            console.log('🔍 WEBSOCKET DEBUG: Message already processed, skipping:', messageId);
            return;
        }
        // Clean up old processed messages to prevent memory leaks (keep only last 100)
        if (processedMessagesRef.current.size > 100) {
            var messagesArray = Array.from(processedMessagesRef.current);
            var toKeep = messagesArray.slice(-50); // Keep last 50
            processedMessagesRef.current = new Set(toKeep);
            console.log('🧹 WEBSOCKET DEBUG: Cleaned up processed messages cache');
        }
        // LOG ALL WEBSOCKET MESSAGES FOR DEBUGGING
        if (lastMessage) {
            console.log('📡 ALL WEBSOCKET MESSAGES:', {
                type: lastMessage.type,
                data: lastMessage.data,
                timestamp: new Date().toISOString()
            });
            // SPECIAL LOGGING FOR TRADE COMPLETION MESSAGES
            if (lastMessage.type === 'trade_completed') {
                console.log('🚨 TRADE COMPLETION MESSAGE RECEIVED!');
                console.log('🚨 Message type:', lastMessage.type);
                console.log('🚨 Message data:', lastMessage.data);
                console.log('🚨 User ID from message:', (_f = lastMessage.data) === null || _f === void 0 ? void 0 : _f.userId);
                console.log('🚨 Current user ID:', user === null || user === void 0 ? void 0 : user.id);
                console.log('🚨 User IDs match:', ((_g = lastMessage.data) === null || _g === void 0 ? void 0 : _g.userId) === (user === null || user === void 0 ? void 0 : user.id));
                console.log('🚨 Will process message:', !!(((_h = lastMessage.data) === null || _h === void 0 ? void 0 : _h.userId) === (user === null || user === void 0 ? void 0 : user.id)));
            }
            // Log balance_update messages in detail
            if (lastMessage.type === 'balance_update') {
                console.log('💰 BALANCE UPDATE DETAILS:', {
                    type: lastMessage.type,
                    userId: (_j = lastMessage.data) === null || _j === void 0 ? void 0 : _j.userId,
                    currentUserId: user === null || user === void 0 ? void 0 : user.id,
                    userMatch: ((_k = lastMessage.data) === null || _k === void 0 ? void 0 : _k.userId) === (user === null || user === void 0 ? void 0 : user.id),
                    data: lastMessage.data,
                    activeTrades: activeTrades.length,
                    change: (_l = lastMessage.data) === null || _l === void 0 ? void 0 : _l.change,
                    changeType: (_m = lastMessage.data) === null || _m === void 0 ? void 0 : _m.changeType,
                    newBalance: (_o = lastMessage.data) === null || _o === void 0 ? void 0 : _o.newBalance,
                    oldBalance: (_p = lastMessage.data) === null || _p === void 0 ? void 0 : _p.oldBalance
                });
            }
            // SPECIAL FOCUS ON TRADE MESSAGES
            if (lastMessage.type && lastMessage.type.toLowerCase().includes('trade')) {
                console.log('🎯 TRADE MESSAGE DETECTED:', lastMessage);
                console.log('🎯 Message type:', lastMessage.type);
                console.log('🎯 Message data:', lastMessage.data);
                console.log('🎯 User ID from message:', (_q = lastMessage.data) === null || _q === void 0 ? void 0 : _q.userId);
                console.log('🎯 Current user ID:', user === null || user === void 0 ? void 0 : user.id);
                console.log('🎯 User IDs match:', ((_r = lastMessage.data) === null || _r === void 0 ? void 0 : _r.userId) === (user === null || user === void 0 ? void 0 : user.id));
            }
        }
        // HANDLER: Process trigger_mobile_notification messages (fallback if trade_completed doesn't arrive)
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'trigger_mobile_notification' && ((_s = lastMessage.data) === null || _s === void 0 ? void 0 : _s.userId) === (user === null || user === void 0 ? void 0 : user.id)) {
            var messageId_1 = "".concat(lastMessage.type, "-").concat((_t = lastMessage.data) === null || _t === void 0 ? void 0 : _t.tradeId);
            // Skip if already processed
            if (processedMessagesRef.current.has(messageId_1)) {
                console.log('⏭️ WEBSOCKET: Skipping duplicate trigger_mobile_notification message');
                return;
            }
            // CRITICAL FIX: Skip if already notified via trade_completed message
            // The trade_completed message has the correct data, so we should not overwrite it with trigger_mobile_notification
            if (websocketNotifiedTradesRef.current.has((_u = lastMessage.data) === null || _u === void 0 ? void 0 : _u.tradeId)) {
                console.log('⏭️ WEBSOCKET: Skipping trigger_mobile_notification - already notified via trade_completed');
                processedMessagesRef.current.add(messageId_1);
                return;
            }
            processedMessagesRef.current.add(messageId_1);
            console.log('🔔 WEBSOCKET: trigger_mobile_notification received:', lastMessage.data);
            var _y = lastMessage.data, tradeId_1 = _y.tradeId, direction_1 = _y.direction, amount_1 = _y.amount, entryPrice_1 = _y.entryPrice, currentPrice_1 = _y.currentPrice, status_1 = _y.status, payout_1 = _y.payout, profitPercentage_1 = _y.profitPercentage, symbol_1 = _y.symbol, duration_1 = _y.duration, profitAmount_1 = _y.profitAmount;
            // CRITICAL: Validate that we have essential data before using defaults
            // If amount is missing or 0, this is likely a malformed message - skip it
            if (!amount_1 || amount_1 <= 0) {
                console.log('⚠️ WEBSOCKET: Skipping trigger_mobile_notification - invalid amount:', amount_1);
                return;
            }
            // CRITICAL FIX: Fetch database data FIRST before triggering notification
            // This ensures we always show real database data, not WebSocket defaults
            console.log('🔔 WEBSOCKET: Fetching trade data from database for trigger_mobile_notification...');
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var controller_1, timeoutId, response, serverTrade, dbAmount, dbDuration, dbResult, dbProfit, dbEntryPrice, dbExitPrice, getProfitPercentageByDuration, dbProfitPercentage, notificationTrade, err_1, notificationTrade;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            controller_1 = new AbortController();
                            timeoutId = setTimeout(function () { return controller_1.abort(); }, 5000);
                            return [4 /*yield*/, fetch("/api/trades/".concat(tradeId_1), {
                                    headers: {
                                        'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                    },
                                    signal: controller_1.signal
                                })];
                        case 1:
                            response = _a.sent();
                            clearTimeout(timeoutId);
                            if (!response.ok) {
                                throw new Error("Failed to fetch trade: ".concat(response.status));
                            }
                            return [4 /*yield*/, response.json()];
                        case 2:
                            serverTrade = _a.sent();
                            console.log('🔔 WEBSOCKET: ✅ Found trade in database for trigger_mobile_notification:', serverTrade);
                            dbAmount = parseFloat(serverTrade.amount);
                            dbDuration = serverTrade.duration || 30;
                            dbResult = serverTrade.result;
                            dbProfit = parseFloat(serverTrade.profit || serverTrade.profitAmount || 0);
                            dbEntryPrice = parseFloat(serverTrade.entry_price || serverTrade.entryPrice || 0);
                            dbExitPrice = parseFloat(serverTrade.exit_price || serverTrade.exitPrice || 0);
                            console.log('🔔 WEBSOCKET: Database trade data extracted for trigger_mobile_notification:', {
                                amount: dbAmount,
                                duration: dbDuration,
                                result: dbResult,
                                profit: dbProfit,
                                entryPrice: dbEntryPrice,
                                exitPrice: dbExitPrice
                            });
                            getProfitPercentageByDuration = function (dur) {
                                if (dur === 30)
                                    return 10;
                                else if (dur === 60)
                                    return 15;
                                else if (dur === 90)
                                    return 20;
                                else if (dur === 120)
                                    return 25;
                                else if (dur === 180)
                                    return 30;
                                else if (dur === 240)
                                    return 50;
                                else if (dur === 300)
                                    return 75;
                                else if (dur === 600)
                                    return 100;
                                return 10; // Default
                            };
                            dbProfitPercentage = getProfitPercentageByDuration(dbDuration);
                            notificationTrade = {
                                id: tradeId_1,
                                symbol: symbol_1 || 'BTC/USDT',
                                direction: direction_1 || 'up',
                                amount: dbAmount, // Use database amount
                                entryPrice: dbEntryPrice, // Use database entry price
                                currentPrice: dbExitPrice, // Use database exit price
                                status: (dbResult === 'win' || dbResult === 'won') ? 'won' : 'lost',
                                duration: dbDuration, // Use database duration
                                profitPercentage: dbProfitPercentage,
                                payout: (dbResult === 'win' || dbResult === 'won') ? dbAmount * (1 + dbProfitPercentage / 100) : 0,
                                profit: dbProfit, // Use database profit
                                startTime: Date.now() - (dbDuration * 1000),
                                endTime: Date.now()
                            };
                            console.log('🔔 WEBSOCKET: ✅ Created notificationTrade with DATABASE values:', {
                                amount: notificationTrade.amount,
                                duration: notificationTrade.duration,
                                status: notificationTrade.status,
                                profit: notificationTrade.profit,
                                profitPercentage: notificationTrade.profitPercentage
                            });
                            // NOW trigger notification with real database data
                            console.log('🔔 WEBSOCKET: ✅ Triggering notification from trigger_mobile_notification with database data');
                            triggerNotification(notificationTrade);
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            console.error('🔔 WEBSOCKET: ❌ Error fetching trade data for trigger_mobile_notification:', err_1);
                            // Fallback: Create notification with WebSocket data if database fetch fails
                            console.log('🔔 WEBSOCKET: ⚠️ Falling back to WebSocket data for trigger_mobile_notification');
                            notificationTrade = {
                                id: tradeId_1,
                                symbol: symbol_1 || 'BTC/USDT',
                                direction: direction_1 || 'up',
                                amount: amount_1, // Use WebSocket amount as fallback
                                entryPrice: entryPrice_1 || 50000,
                                currentPrice: currentPrice_1 || entryPrice_1 || 50000,
                                status: status_1 || 'won',
                                duration: duration_1 || 30,
                                profitPercentage: profitPercentage_1 || (function () {
                                    var dur = duration_1 || 30;
                                    if (dur === 30)
                                        return 10;
                                    else if (dur === 60)
                                        return 15;
                                    else if (dur === 90)
                                        return 20;
                                    else if (dur === 120)
                                        return 25;
                                    else if (dur === 180)
                                        return 30;
                                    else if (dur === 240)
                                        return 50;
                                    else if (dur === 300)
                                        return 75;
                                    else if (dur === 600)
                                        return 100;
                                    return 10;
                                })(),
                                payout: payout_1 || 0,
                                profit: profitAmount_1,
                                startTime: Date.now() - ((duration_1 || 30) * 1000),
                                endTime: Date.now()
                            };
                            triggerNotification(notificationTrade);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })();
        }
        // MAIN HANDLER: Process trade_completed messages
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'trade_completed' && ((_v = lastMessage.data) === null || _v === void 0 ? void 0 : _v.userId) === (user === null || user === void 0 ? void 0 : user.id)) {
            // Mark message as processed FIRST to prevent duplicate processing
            processedMessagesRef.current.add(messageId);
            console.log('🎯 WEBSOCKET: ⚠️ CRITICAL - Trade completion notification received!');
            console.log('🎯 WEBSOCKET: Trade completion notification received:', lastMessage.data);
            console.log('🎯 WEBSOCKET: Amount from message:', (_w = lastMessage.data) === null || _w === void 0 ? void 0 : _w.amount, 'Type:', typeof ((_x = lastMessage.data) === null || _x === void 0 ? void 0 : _x.amount));
            var _z = lastMessage.data, tradeId_2 = _z.tradeId, result_1 = _z.result, exitPrice_1 = _z.exitPrice, profitAmount_2 = _z.profitAmount, newBalance = _z.newBalance, symbol_2 = _z.symbol, direction_2 = _z.direction, amount_2 = _z.amount, entryPrice_2 = _z.entryPrice, duration_2 = _z.duration, profitPercentage_2 = _z.profitPercentage;
            // CRITICAL DEBUG: Log all fields from WebSocket message
            console.log('🎯 WEBSOCKET MESSAGE FULL DATA:', lastMessage.data);
            console.log('🎯 WEBSOCKET profitAmount:', profitAmount_2, 'Type:', typeof profitAmount_2);
            console.log('🎯 WEBSOCKET DESTRUCTURED VALUES:', {
                tradeId: tradeId_2,
                result: result_1,
                amount: amount_2,
                amountType: typeof amount_2,
                duration: duration_2,
                durationType: typeof duration_2,
                profitAmount: profitAmount_2,
                profitPercentage: profitPercentage_2,
                symbol: symbol_2,
                symbolType: typeof symbol_2,
                symbolLength: symbol_2 === null || symbol_2 === void 0 ? void 0 : symbol_2.length,
                direction: direction_2
            });
            // CRITICAL DEBUG: Log the exact values we're about to use
            console.log('🎯 WEBSOCKET: CRITICAL VALUES FOR NOTIFICATION:', {
                amount: amount_2,
                duration: duration_2,
                result: result_1,
                profitAmount: profitAmount_2,
                profitPercentage: profitPercentage_2
            });
            // Find the active trade that just completed
            var completedActiveTrade_1 = activeTrades.find(function (trade) { return trade.id === tradeId_2; });
            console.log('🔍 WEBSOCKET: Looking for active trade:', tradeId_2, 'Found:', !!completedActiveTrade_1);
            console.log('🔍 WEBSOCKET: Current active trades:', activeTrades.map(function (t) { return ({ id: t.id, amount: t.amount, duration: t.duration }); }));
            if (!completedActiveTrade_1) {
                console.log('⚠️ WEBSOCKET: CRITICAL - Active trade not found! Using fallback code');
                console.log('⚠️ WEBSOCKET: WebSocket tradeId:', tradeId_2, 'Type:', typeof tradeId_2);
                console.log('⚠️ WEBSOCKET: Active trade IDs:', activeTrades.map(function (t) { return ({ id: t.id, idType: typeof t.id }); }));
                // Check if there's a partial match
                var partialMatch = activeTrades.find(function (t) { return t.id.includes(tradeId_2) || tradeId_2.includes(t.id); });
                if (partialMatch) {
                    console.log('⚠️ WEBSOCKET: Found partial match:', partialMatch.id);
                }
            }
            if (completedActiveTrade_1) {
                // CRITICAL FIX: Fetch trade data from database FIRST before creating notification
                // This ensures we always show real database data, not WebSocket defaults
                console.log('🔔 WEBSOCKET: Fetching trade data from database BEFORE creating notification...');
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var controller_2, timeoutId, response, serverTrade, dbAmount, dbDuration, dbResult, dbProfit, dbEntryPrice, dbExitPrice, dbSymbol, getProfitPercentageByDuration, dbProfitPercentage, completedTrade_1, err_2, won, getProfitPercentageByDuration, profitPercentageValue, finalAmount, finalEntryPrice, completedTrade_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                controller_2 = new AbortController();
                                timeoutId = setTimeout(function () { return controller_2.abort(); }, 5000);
                                return [4 /*yield*/, fetch("/api/trades/".concat(tradeId_2), {
                                        headers: {
                                            'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                        },
                                        signal: controller_2.signal
                                    })];
                            case 1:
                                response = _a.sent();
                                clearTimeout(timeoutId);
                                if (!response.ok) {
                                    throw new Error("Failed to fetch trade: ".concat(response.status));
                                }
                                return [4 /*yield*/, response.json()];
                            case 2:
                                serverTrade = _a.sent();
                                console.log('🔔 WEBSOCKET: ✅ Found trade in database:', serverTrade);
                                dbAmount = parseFloat(serverTrade.amount);
                                dbDuration = serverTrade.duration || 30;
                                dbResult = serverTrade.result;
                                dbProfit = parseFloat(serverTrade.profit || serverTrade.profitAmount || 0);
                                dbEntryPrice = parseFloat(serverTrade.entry_price || serverTrade.entryPrice || 0);
                                dbExitPrice = parseFloat(serverTrade.exit_price || serverTrade.exitPrice || 0);
                                dbSymbol = serverTrade.symbol;
                                console.log('🔔 WEBSOCKET: Database trade data extracted:', {
                                    amount: dbAmount,
                                    duration: dbDuration,
                                    result: dbResult,
                                    profit: dbProfit,
                                    entryPrice: dbEntryPrice,
                                    exitPrice: dbExitPrice,
                                    symbol: dbSymbol
                                });
                                getProfitPercentageByDuration = function (dur) {
                                    if (dur === 30)
                                        return 10;
                                    else if (dur === 60)
                                        return 15;
                                    else if (dur === 90)
                                        return 20;
                                    else if (dur === 120)
                                        return 25;
                                    else if (dur === 180)
                                        return 30;
                                    else if (dur === 240)
                                        return 50;
                                    else if (dur === 300)
                                        return 75;
                                    else if (dur === 600)
                                        return 100;
                                    return 10; // Default
                                };
                                dbProfitPercentage = getProfitPercentageByDuration(dbDuration);
                                completedTrade_1 = {
                                    id: tradeId_2,
                                    symbol: dbSymbol || symbol_2 || completedActiveTrade_1.symbol, // CRITICAL: Use database symbol first
                                    direction: direction_2 || completedActiveTrade_1.direction,
                                    startTime: completedActiveTrade_1.startTime,
                                    endTime: completedActiveTrade_1.endTime,
                                    duration: dbDuration, // Use database duration
                                    amount: dbAmount, // Use database amount
                                    entryPrice: dbEntryPrice, // Use database entry price
                                    currentPrice: dbExitPrice, // Use database exit price
                                    status: (dbResult === 'win' || dbResult === 'won') ? 'won' : 'lost',
                                    payout: (dbResult === 'win' || dbResult === 'won') ? dbAmount * (1 + dbProfitPercentage / 100) : 0,
                                    profit: dbProfit, // Use database profit
                                    profitPercentage: dbProfitPercentage
                                };
                                console.log('🔔 WEBSOCKET: ✅ Created completedTrade with DATABASE values:', {
                                    amount: completedTrade_1.amount,
                                    duration: completedTrade_1.duration,
                                    status: completedTrade_1.status,
                                    profit: completedTrade_1.profit,
                                    profitPercentage: completedTrade_1.profitPercentage,
                                    entryPrice: completedTrade_1.entryPrice,
                                    currentPrice: completedTrade_1.currentPrice
                                });
                                // NOW trigger notification with real database data
                                console.log('🔔 WEBSOCKET: ✅ Triggering notification with database data');
                                triggerNotification(completedTrade_1);
                                return [3 /*break*/, 4];
                            case 3:
                                err_2 = _a.sent();
                                console.error('🔔 WEBSOCKET: ❌ Error fetching trade data:', err_2);
                                // Fallback: Create notification with WebSocket data if database fetch fails
                                console.log('🔔 WEBSOCKET: ⚠️ Falling back to WebSocket data');
                                won = result_1 === 'win';
                                getProfitPercentageByDuration = function (dur) {
                                    if (dur === 30)
                                        return 10;
                                    else if (dur === 60)
                                        return 15;
                                    else if (dur === 90)
                                        return 20;
                                    else if (dur === 120)
                                        return 25;
                                    else if (dur === 180)
                                        return 30;
                                    else if (dur === 240)
                                        return 50;
                                    else if (dur === 300)
                                        return 75;
                                    else if (dur === 600)
                                        return 100;
                                    return 10; // Default
                                };
                                profitPercentageValue = profitPercentage_2 || getProfitPercentageByDuration(duration_2 || 30);
                                finalAmount = (amount_2 !== undefined && amount_2 > 0) ? amount_2 : completedActiveTrade_1.amount;
                                finalEntryPrice = (entryPrice_2 !== undefined && entryPrice_2 > 0) ? entryPrice_2 : completedActiveTrade_1.entryPrice;
                                completedTrade_2 = {
                                    id: completedActiveTrade_1.id,
                                    symbol: symbol_2 || completedActiveTrade_1.symbol,
                                    direction: direction_2 || completedActiveTrade_1.direction,
                                    startTime: completedActiveTrade_1.startTime,
                                    endTime: completedActiveTrade_1.endTime,
                                    duration: duration_2 || completedActiveTrade_1.duration,
                                    amount: finalAmount,
                                    entryPrice: finalEntryPrice,
                                    currentPrice: exitPrice_1 || completedActiveTrade_1.currentPrice,
                                    status: won ? 'won' : 'lost',
                                    payout: won ? finalAmount * (1 + profitPercentageValue / 100) : 0,
                                    profit: profitAmount_2,
                                    profitPercentage: profitPercentageValue
                                };
                                triggerNotification(completedTrade_2);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })();
            }
            else {
                // FALLBACK: Use data from WebSocket message if available, otherwise use defaults
                console.log('⚠️ WEBSOCKET: ⚠️ CRITICAL - FALLBACK CODE TRIGGERED! Active trade not found, using WebSocket data for notification');
                console.log('⚠️ WEBSOCKET: Fallback amount from message:', amount_2, 'profitAmount:', profitAmount_2);
                console.log('⚠️ WEBSOCKET: FALLBACK - This is where the wrong data might be coming from!');
                var won = result_1 === 'win';
                // Get correct profit percentage based on duration
                var getProfitPercentageByDuration = function (dur) {
                    if (dur === 30)
                        return 10;
                    else if (dur === 60)
                        return 15;
                    else if (dur === 90)
                        return 20;
                    else if (dur === 120)
                        return 25;
                    else if (dur === 180)
                        return 30;
                    else if (dur === 240)
                        return 50;
                    else if (dur === 300)
                        return 75;
                    else if (dur === 600)
                        return 100;
                    return 10; // Default
                };
                var profitPercentageValue = profitPercentage_2 || getProfitPercentageByDuration(duration_2 || 30);
                // Ensure we have a valid amount - prefer WebSocket amount
                var finalFallbackAmount = amount_2;
                if (!finalFallbackAmount || finalFallbackAmount <= 0) {
                    // Calculate from profit if amount is missing
                    finalFallbackAmount = Math.abs(profitAmount_2) / (won ? profitPercentageValue / 100 : 1);
                    console.log('⚠️ WEBSOCKET: Calculated amount from profit:', finalFallbackAmount);
                }
                var fallbackTrade_1 = {
                    id: tradeId_2,
                    symbol: symbol_2 || 'BTC/USDT', // Use symbol from WebSocket
                    direction: (direction_2 || 'up'), // Use direction from WebSocket
                    amount: finalFallbackAmount, // Use amount from WebSocket (or calculated)
                    entryPrice: entryPrice_2 || (exitPrice_1 * (won ? 0.99 : 1.01)), // Use entryPrice from WebSocket
                    currentPrice: exitPrice_1,
                    status: won ? 'won' : 'lost',
                    duration: duration_2 || 30, // Use duration from WebSocket
                    profitPercentage: profitPercentageValue,
                    payout: won ? finalFallbackAmount * (1 + profitPercentageValue / 100) : 0,
                    profit: profitAmount_2,
                    startTime: Date.now() - ((duration_2 || 30) * 1000),
                    endTime: Date.now()
                };
                // CRITICAL FIX: Fetch trade data from database to ensure we have the correct data
                console.log('🔔 WEBSOCKET FALLBACK: Fetching trade data from database to verify notification data...');
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var controller_3, timeoutId, response, serverTrades, serverTrade, err_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                controller_3 = new AbortController();
                                timeoutId = setTimeout(function () { return controller_3.abort(); }, 5000);
                                return [4 /*yield*/, fetch("/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/trades"), {
                                        headers: {
                                            'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                        },
                                        signal: controller_3.signal
                                    })];
                            case 1:
                                response = _a.sent();
                                clearTimeout(timeoutId);
                                return [4 /*yield*/, response.json()];
                            case 2:
                                serverTrades = _a.sent();
                                console.log('🔔 WEBSOCKET FALLBACK: Fetched', serverTrades.length, 'trades from database');
                                serverTrade = serverTrades.find(function (st) { return st.id === tradeId_2; });
                                if (serverTrade) {
                                    console.log('🔔 WEBSOCKET FALLBACK: Found trade in database:', serverTrade);
                                    // Use database data as the source of truth
                                    fallbackTrade_1.amount = parseFloat(serverTrade.amount);
                                    fallbackTrade_1.duration = serverTrade.duration || 30;
                                    fallbackTrade_1.status = (serverTrade.result === 'win' || serverTrade.result === 'won') ? 'won' : 'lost';
                                    fallbackTrade_1.symbol = serverTrade.symbol || fallbackTrade_1.symbol; // CRITICAL: Update symbol from database
                                    console.log('🔔 WEBSOCKET FALLBACK: Updated fallbackTrade with database values:', {
                                        amount: fallbackTrade_1.amount,
                                        duration: fallbackTrade_1.duration,
                                        status: fallbackTrade_1.status,
                                        symbol: fallbackTrade_1.symbol
                                    });
                                }
                                else {
                                    console.log('⚠️ WEBSOCKET FALLBACK: Trade NOT found in database! Using WebSocket data');
                                    console.log('⚠️ WEBSOCKET FALLBACK: Looking for tradeId:', tradeId_2);
                                    console.log('⚠️ WEBSOCKET FALLBACK: Available trade IDs:', serverTrades.map(function (st) { return st.id; }));
                                }
                                console.log('🔔 WEBSOCKET: Triggering fallback notification with database data:', fallbackTrade_1);
                                console.log('🔔 WEBSOCKET: CRITICAL - FALLBACK Notification will show:', {
                                    amount: fallbackTrade_1.amount,
                                    duration: fallbackTrade_1.duration,
                                    status: fallbackTrade_1.status,
                                    profit: fallbackTrade_1.profit
                                });
                                triggerNotification(fallbackTrade_1);
                                return [3 /*break*/, 4];
                            case 3:
                                err_3 = _a.sent();
                                console.error('🔔 WEBSOCKET FALLBACK: Error fetching trade data, using WebSocket data:', err_3);
                                // Fallback to WebSocket data if database fetch fails
                                console.log('🔔 WEBSOCKET FALLBACK: Falling back to WebSocket data:', {
                                    amount: fallbackTrade_1.amount,
                                    duration: fallbackTrade_1.duration,
                                    status: fallbackTrade_1.status
                                });
                                triggerNotification(fallbackTrade_1);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })();
                // Remove from active trades
                setActiveTrades(function (prev) { return prev.filter(function (trade) { return trade.id !== tradeId_2; }); });
                // Refresh trade history and balance - CRITICAL: Invalidate React Query cache
                queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
                queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/trades")] });
                queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/transactions")] }); // Also invalidate transaction history
                // CRITICAL FIX: Add delay to ensure database is updated before fetching
                console.log('🔄 WEBSOCKET: Refreshing trade history after trade completion...');
                setTimeout(function () {
                    if (user === null || user === void 0 ? void 0 : user.id) {
                        loadTradeHistory();
                    }
                }, 1000); // 1 second delay to ensure database is updated
            }
        }
        // AGGRESSIVE FALLBACK: DISABLED - Only use main trade_completed handler and polling
        // The AGGRESSIVE FALLBACK was causing notifications with incomplete data and hardcoded defaults (50000, 51000)
        // This resulted in showing wrong amounts (100 USDT) and wrong prices from previous trades
        // The main trade_completed handler and polling system are sufficient for all cases
        console.log('🔄 AGGRESSIVE FALLBACK: Disabled - using only main trade_completed handler and polling');
        // REMOVED: ULTRA FALLBACK that was using hardcoded amount: 100
        // This was causing the notification to show 100 USDT initially
        // The main handler (lines 1164-1256) now properly handles all trade_completed messages with correct amounts
    }, [lastMessage, user === null || user === void 0 ? void 0 : user.id, activeTrades, queryClient]);
    // Backup polling system for trade completion (fallback if WebSocket fails)
    useEffect(function () {
        if (activeTrades.length === 0)
            return;
        console.log('🔄 POLLING: Checking', activeTrades.length, 'active trades:', activeTrades.map(function (t) { return ({ id: t.id, amount: t.amount }); }));
        var pollInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var response, serverTrades_1, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/trades"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        serverTrades_1 = _a.sent();
                        // Find recently completed trades that were active
                        activeTrades.forEach(function (activeTrade) {
                            console.log('🔄 POLLING: Checking active trade:', { id: activeTrade.id, amount: activeTrade.amount });
                            var serverTrade = serverTrades_1.find(function (st) { return st.id === activeTrade.id; });
                            if (serverTrade && serverTrade.status === 'completed' && serverTrade.result !== 'pending') {
                                console.log('🔄 POLLING: Found completed trade:', serverTrade);
                                console.log('🔄 POLLING: Server trade amount:', serverTrade.amount, 'Type:', typeof serverTrade.amount);
                                console.log('🔄 POLLING: Active trade amount:', activeTrade.amount, 'Type:', typeof activeTrade.amount);
                                // CRITICAL: Skip if already notified via WebSocket
                                if (websocketNotifiedTradesRef.current.has(serverTrade.id)) {
                                    console.log('🔄 POLLING: Skipping - already notified via WebSocket');
                                    return;
                                }
                                var won = serverTrade.result === 'win';
                                var getProfitPercentageByDuration = function (dur) {
                                    if (dur === 30)
                                        return 10;
                                    else if (dur === 60)
                                        return 15;
                                    else if (dur === 90)
                                        return 20;
                                    else if (dur === 120)
                                        return 25;
                                    else if (dur === 180)
                                        return 30;
                                    else if (dur === 240)
                                        return 50;
                                    else if (dur === 300)
                                        return 75;
                                    else if (dur === 600)
                                        return 100;
                                    return 10; // Default
                                };
                                var profitPercentage = activeTrade.profitPercentage || getProfitPercentageByDuration(activeTrade.duration || 30);
                                // CRITICAL FIX: Use server values instead of local trade values
                                var tradeAmount = parseFloat(serverTrade.amount) || activeTrade.amount;
                                var entryPrice = parseFloat(serverTrade.entry_price) || activeTrade.entryPrice;
                                var exitPrice = parseFloat(serverTrade.exit_price) || activeTrade.currentPrice || activeTrade.entryPrice;
                                var completedTrade_3 = {
                                    id: activeTrade.id,
                                    direction: activeTrade.direction,
                                    duration: activeTrade.duration,
                                    startTime: activeTrade.startTime,
                                    endTime: activeTrade.endTime,
                                    profitPercentage: profitPercentage,
                                    symbol: serverTrade.symbol || activeTrade.symbol, // CRITICAL: Use server symbol first
                                    // CRITICAL: Use server values, not local trade values
                                    amount: tradeAmount,
                                    entryPrice: entryPrice,
                                    currentPrice: exitPrice,
                                    status: won ? 'won' : 'lost',
                                    payout: won ? tradeAmount * (1 + profitPercentage / 100) : 0,
                                    // CRITICAL FIX: Use percentage-based loss, not full amount
                                    profit: won ? (tradeAmount * profitPercentage / 100) : -(tradeAmount * profitPercentage / 100)
                                };
                                console.log('🔄 POLLING: Setting completed trade notification:', completedTrade_3);
                                // ROBUST NOTIFICATION TRIGGER
                                triggerNotification(completedTrade_3);
                                // Remove from active trades
                                setActiveTrades(function (prev) { return prev.filter(function (trade) { return trade.id !== activeTrade.id; }); });
                                // Refresh trade history and balance - CRITICAL: Invalidate React Query cache
                                queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
                                queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/trades")] });
                                queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/transactions")] }); // Also invalidate transaction history
                                // CRITICAL FIX: Add delay to ensure database is updated before fetching
                                console.log('🔄 POLLING: Refreshing trade history after trade completion...');
                                setTimeout(function () {
                                    loadTradeHistory();
                                }, 1000); // 1 second delay to ensure database is updated
                            }
                        });
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        console.error('🔄 POLLING: Error checking trade completion:', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); }, 2000); // Poll every 2 seconds
        return function () { return clearInterval(pollInterval); };
    }, [activeTrades, user === null || user === void 0 ? void 0 : user.id, queryClient]);
    // Handle WebSocket trading control updates for real-time sync
    useEffect(function () {
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'trading_control_update' || (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'trading_mode_update') {
            var _a = lastMessage.data || {}, userId = _a.userId, controlType = _a.controlType, tradingMode = _a.tradingMode, username = _a.username, message = _a.message;
            var finalControlType = controlType || tradingMode; // Support both new and old message formats
            // Determine correct user ID for comparison
            var currentUserId = 'user-1'; // fallback
            if ((user === null || user === void 0 ? void 0 : user.email) === 'angela.soenoko@gmail.com') {
                currentUserId = 'user-angela';
            }
            else if ((user === null || user === void 0 ? void 0 : user.email) === 'amdsnkstudio@metachrome.io') {
                currentUserId = 'user-1';
            }
            else if (user === null || user === void 0 ? void 0 : user.id) {
                currentUserId = user.id;
            }
            console.log('🎯 Real-time trading control update received:', {
                userId: userId,
                controlType: finalControlType,
                username: username,
                currentUserId: currentUserId,
                message: message
            });
            // Check if this update is for the current user
            if (userId === currentUserId) {
                console.log("\uD83C\uDFAF IMMEDIATE EFFECT: Trading mode changed to ".concat(finalControlType.toUpperCase(), " for current user!"));
                setCurrentTradingMode(finalControlType);
                // Store the current trading mode for immediate use in trades
                localStorage.setItem('currentTradingMode', finalControlType || 'normal');
            }
        }
    }, [lastMessage, user]);
    // Helper function to complete a trade and update balance
    var completeTrade = function (trade, won, finalPrice) { return __awaiter(_this, void 0, void 0, function () {
        var getProfitPercentageByDuration, profitPercentage, profit, updatedTrade, response, balanceError_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getProfitPercentageByDuration = function (dur) {
                        if (dur === 30)
                            return 10;
                        else if (dur === 60)
                            return 15;
                        else if (dur === 90)
                            return 20;
                        else if (dur === 120)
                            return 25;
                        else if (dur === 180)
                            return 30;
                        else if (dur === 240)
                            return 50;
                        else if (dur === 300)
                            return 75;
                        else if (dur === 600)
                            return 100;
                        return 10; // Default
                    };
                    profitPercentage = trade.profitPercentage || getProfitPercentageByDuration(trade.duration || 30);
                    profit = won ? (trade.amount * profitPercentage / 100) : -(trade.amount * profitPercentage / 100);
                    updatedTrade = __assign(__assign({}, trade), { status: won ? 'won' : 'lost', currentPrice: finalPrice, payout: won ? trade.amount * (1 + profitPercentage / 100) : 0, profit: profit });
                    console.log('🎯 COMPLETE TRADE: Updated trade object:', updatedTrade);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/trades/complete', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify({
                                tradeId: trade.id,
                                userId: (user === null || user === void 0 ? void 0 : user.id) || 'user-1',
                                won: won,
                                amount: trade.amount,
                                payout: updatedTrade.payout,
                                profit: profit,
                                finalPrice: finalPrice
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        // Refresh balance and trade history to show updated data
                        queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
                        queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/trades")] });
                        queryClient.invalidateQueries({ queryKey: ["/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/transactions")] }); // Also invalidate transaction history
                        console.log("\uD83D\uDCB0 Balance updated: Trade ".concat(won ? 'WON' : 'LOST', " - Amount: ").concat(trade.amount, " USDT"));
                        // CRITICAL FIX: Refresh trade history immediately after trade completion
                        console.log('🔄 COMPLETE TRADE: Refreshing trade history after API completion...');
                        setTimeout(function () {
                            if (user === null || user === void 0 ? void 0 : user.id) {
                                loadTradeHistory();
                            }
                        }, 1500); // 1.5 second delay to ensure database is fully updated
                    }
                    else {
                        console.error('Failed to update balance after trade completion');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    balanceError_1 = _a.sent();
                    console.error('Error updating balance:', balanceError_1);
                    return [3 /*break*/, 4];
                case 4:
                    // FALLBACK NOTIFICATION: Wait for server response, then check actual result
                    console.log('🎯 COMPLETE TRADE: Setting up fallback notification check');
                    // Wait a bit for server to process, then check the actual result from database
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var response, trades, serverTrade, actualWon, getProfitPercentageByDuration_1, profitPercentage_3, serverAmount, serverEntryPrice, serverExitPrice, fallbackTrade, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    console.log('🔄 FALLBACK: Checking server result for trade:', trade.id);
                                    return [4 /*yield*/, fetch("/api/users/".concat(user === null || user === void 0 ? void 0 : user.id, "/trades"))];
                                case 1:
                                    response = _a.sent();
                                    if (!response.ok) return [3 /*break*/, 3];
                                    return [4 /*yield*/, response.json()];
                                case 2:
                                    trades = _a.sent();
                                    serverTrade = trades.find(function (t) { return t.id === trade.id; });
                                    if (serverTrade && serverTrade.status === 'completed') {
                                        console.log('🔄 FALLBACK: Found completed trade with server result:', serverTrade);
                                        actualWon = serverTrade.result === 'win';
                                        getProfitPercentageByDuration_1 = function (dur) {
                                            if (dur === 30)
                                                return 10;
                                            else if (dur === 60)
                                                return 15;
                                            else if (dur === 90)
                                                return 20;
                                            else if (dur === 120)
                                                return 25;
                                            else if (dur === 180)
                                                return 30;
                                            else if (dur === 240)
                                                return 50;
                                            else if (dur === 300)
                                                return 75;
                                            else if (dur === 600)
                                                return 100;
                                            return 10; // Default
                                        };
                                        profitPercentage_3 = trade.profitPercentage || getProfitPercentageByDuration_1(trade.duration || 30);
                                        serverAmount = parseFloat(serverTrade.amount) || trade.amount;
                                        serverEntryPrice = parseFloat(serverTrade.entry_price) || trade.entryPrice;
                                        serverExitPrice = parseFloat(serverTrade.exit_price) || finalPrice;
                                        fallbackTrade = {
                                            id: trade.id,
                                            direction: trade.direction,
                                            duration: trade.duration,
                                            startTime: trade.startTime,
                                            endTime: trade.endTime,
                                            profitPercentage: profitPercentage_3,
                                            symbol: trade.symbol,
                                            // CRITICAL: Use server values, not local trade values
                                            amount: serverAmount,
                                            entryPrice: serverEntryPrice,
                                            currentPrice: serverExitPrice,
                                            status: actualWon ? 'won' : 'lost',
                                            payout: actualWon ? serverAmount * (1 + profitPercentage_3 / 100) : 0,
                                            profit: actualWon ? (serverAmount * profitPercentage_3 / 100) : -(serverAmount * profitPercentage_3 / 100)
                                        };
                                        console.log('🔄 FALLBACK: Triggering notification with server result:', fallbackTrade);
                                        triggerNotification(fallbackTrade);
                                    }
                                    _a.label = 3;
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    error_4 = _a.sent();
                                    console.error('🔄 FALLBACK: Error checking server result:', error_4);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); }, 2000); // Wait 2 seconds for server processing
                    return [2 /*return*/, updatedTrade];
            }
        });
    }); };
    // Trade management and countdown
    useEffect(function () {
        try {
            var now_1 = Date.now();
            var hasCompletedTrades_1 = false;
            // Debug log to see if useEffect is running
            if (activeTrades.length > 0) {
                console.log("\uD83C\uDFAF USEEFFECT: Checking ".concat(activeTrades.length, " active trades at ").concat(new Date(now_1).toLocaleTimeString()));
            }
            // Update active trades
            setActiveTrades(function (prevTrades) {
                var updatedTrades = [];
                prevTrades.forEach(function (trade) {
                    var timeRemaining = Math.max(0, Math.ceil((trade.endTime - now_1) / 1000));
                    // Debug log for each trade
                    console.log("\uD83C\uDFAF TRADE CHECK: ID=".concat(trade.id, ", timeRemaining=").concat(timeRemaining, ", status=").concat(trade.status, ", endTime=").concat(trade.endTime, ", now=").concat(now_1));
                    if (timeRemaining === 0 && trade.status === 'active') {
                        console.log("\uD83C\uDFAF TRADE EXPIRED: Trade ".concat(trade.id, " has expired! Starting completion..."));
                        // Trade expired, determine outcome
                        var finalPrice = safeCurrentPrice || trade.entryPrice; // Fallback to entry price
                        var priceChange = finalPrice - trade.entryPrice;
                        var won = (trade.direction === 'up' && priceChange > 0) ||
                            (trade.direction === 'down' && priceChange < 0);
                        // Trading control will be applied on the server side
                        // Complete the trade asynchronously - notification will come via WebSocket
                        completeTrade(trade, won, finalPrice).then(function (completedTrade) {
                            console.log('🎯 TRADE COMPLETED: Trade completed, waiting for WebSocket notification for trade:', completedTrade.id);
                            // NOTE: Notification will be triggered by WebSocket with server's actual result
                        }).catch(function (error) {
                            console.error('❌ Trade completion failed:', error);
                        });
                        hasCompletedTrades_1 = true;
                        // Play sound effect safely
                        try {
                            if (typeof playTradeSound === 'function') {
                                playTradeSound(won ? 'win' : 'lose');
                            }
                        }
                        catch (soundError) {
                            console.error('Sound play error:', soundError);
                        }
                        // Don't add completed trades to active trades
                    }
                    else {
                        // Keep active trades
                        updatedTrades.push(__assign(__assign({}, trade), { currentPrice: currentPrice || trade.entryPrice }));
                    }
                });
                return updatedTrades;
            });
            // Update countdown for UI (separate from trade updates to prevent loops)
            var activeTrade = activeTrades.find(function (t) { return t.status === 'active'; });
            if (activeTrade) {
                var timeRemaining = Math.max(0, Math.ceil((activeTrade.endTime - now_1) / 1000));
                setCountdown(timeRemaining);
                setIsTrading(timeRemaining > 0);
            }
            else if (!hasCompletedTrades_1) {
                // Only update if no trades just completed to prevent state conflicts
                setCountdown(0);
                setIsTrading(false);
            }
        }
        catch (error) {
            console.error('Trade management error:', error);
            // Prevent crash by resetting to safe state
            setIsTrading(false);
            setCountdown(0);
        }
    }, [safeCurrentPrice, activeTrades]); // Include activeTrades to check for expiration
    // Timer to check for expired trades every second
    useEffect(function () {
        var timer = setInterval(function () {
            var now = Date.now();
            // Check if any active trades have expired
            activeTrades.forEach(function (trade) {
                var timeRemaining = Math.max(0, Math.ceil((trade.endTime - now) / 1000));
                if (timeRemaining === 0 && trade.status === 'active') {
                    // Force a re-render by updating a dummy state
                    setCountdown(function (prev) { return prev; });
                }
            });
        }, 1000);
        return function () { return clearInterval(timer); };
    }, [activeTrades]);
    // Trading configuration with minimum amounts and profit percentages
    var tradingConfig = {
        '30s': { minAmount: 100, profit: 10 },
        '60s': { minAmount: 1000, profit: 15 },
        '90s': { minAmount: 5000, profit: 20 },
        '120s': { minAmount: 10000, profit: 25 },
        '180s': { minAmount: 30000, profit: 30 },
        '240s': { minAmount: 50000, profit: 50 },
        '300s': { minAmount: 100000, profit: 75 },
        '600s': { minAmount: 200000, profit: 100 }
    };
    // Get profit percentage based on duration
    var getProfitPercentage = function (duration) {
        var _a;
        return ((_a = tradingConfig[duration]) === null || _a === void 0 ? void 0 : _a.profit) || 10;
    };
    // Get minimum amount for duration
    var getMinimumAmount = function (duration) {
        var _a;
        return ((_a = tradingConfig[duration]) === null || _a === void 0 ? void 0 : _a.minAmount) || 100;
    };
    // Validate if user can trade with selected amount and duration
    var validateTrade = function (amount, duration) {
        var minAmount = getMinimumAmount(duration);
        return amount >= minAmount;
    };
    var handleTrade = function (direction) { return __awaiter(_this, void 0, void 0, function () {
        var minAmount, durationSeconds, safeCurrentPrice_1, tradingUserId, tradePayload, response, error, result, now, profitPercentage, newTrade_1, error_5, errorMessage;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    // Validate trade amount and duration
                    if (!validateTrade(selectedAmount, selectedDuration)) {
                        minAmount = getMinimumAmount(selectedDuration);
                        alert("You cannot follow this market, please recharge your deposit. Minimum amount for ".concat(selectedDuration, " is ").concat(minAmount.toLocaleString(), " USDT"));
                        return [2 /*return*/];
                    }
                    if (balance < selectedAmount) {
                        alert('Insufficient balance');
                        return [2 /*return*/];
                    }
                    if (activeTrades.length >= 3) {
                        alert('Maximum 3 active trades allowed');
                        return [2 /*return*/];
                    }
                    durationSeconds = parseInt(selectedDuration.replace('s', ''));
                    safeCurrentPrice_1 = displayPrice;
                    // User is already available from useAuth hook
                    console.log('🔍 Current user for trade:', user);
                    console.log('🔍 User ID from auth:', user === null || user === void 0 ? void 0 : user.id);
                    console.log('🔍 User email from auth:', user === null || user === void 0 ? void 0 : user.email);
                    tradingUserId = 'user-1';
                    if ((user === null || user === void 0 ? void 0 : user.email) === 'angela.soenoko@gmail.com') {
                        tradingUserId = 'user-angela-1758195715'; // Match the actual ID in users-data.json
                    }
                    else if ((user === null || user === void 0 ? void 0 : user.email) === 'amdsnkstudio@metachrome.io') {
                        tradingUserId = 'user-1'; // Match the ID in users-data.json
                    }
                    else if (user === null || user === void 0 ? void 0 : user.id) {
                        tradingUserId = user.id;
                    }
                    console.log('🔍 Trading with user ID:', tradingUserId);
                    console.log('🔍 Auth token:', ((_a = localStorage.getItem('authToken')) === null || _a === void 0 ? void 0 : _a.substring(0, 50)) + '...');
                    if (!safeCurrentPrice_1 || safeCurrentPrice_1 <= 0) {
                        alert('Price data not available. Please wait a moment and try again.');
                        return [2 /*return*/];
                    }
                    // Call backend API to create trade and deduct balance
                    console.log('🚀 TRADE DEBUG: About to place trade:', {
                        userId: tradingUserId,
                        symbol: selectedSymbol,
                        direction: direction,
                        amount: selectedAmount,
                        duration: durationSeconds,
                        entryPrice: safeCurrentPrice_1
                    });
                    tradePayload = {
                        userId: tradingUserId,
                        symbol: selectedSymbol,
                        direction: direction,
                        amount: selectedAmount.toString(),
                        duration: durationSeconds,
                        entryPrice: safeCurrentPrice_1
                    };
                    console.log('💰 CLIENT: Sending trade with amount:', selectedAmount, 'Type:', typeof selectedAmount);
                    console.log('💰 CLIENT: Full payload:', JSON.stringify(tradePayload, null, 2));
                    return [4 /*yield*/, fetch('/api/trades/options', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify(tradePayload)
                        })];
                case 1:
                    response = _d.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    error = _d.sent();
                    console.error('❌ Trade failed:', error);
                    // If user not found, suggest re-login
                    if (error.includes('User not found')) {
                        throw new Error('User session expired. Please logout and login again to refresh your account.');
                    }
                    throw new Error(error || 'Failed to place trade');
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    result = _d.sent();
                    console.log('🚀 TRADE DEBUG: Trade placement response:', result);
                    if (result.success) {
                        console.log('✅ TRADE DEBUG: Trade placed successfully, trade ID:', (_b = result.trade) === null || _b === void 0 ? void 0 : _b.id);
                        now = Date.now();
                        profitPercentage = getProfitPercentage(selectedDuration);
                        newTrade_1 = {
                            id: ((_c = result.trade) === null || _c === void 0 ? void 0 : _c.id) || "trade_".concat(now, "_").concat(Math.random().toString(36).substring(2, 11)),
                            symbol: selectedSymbol, // CRITICAL: Include symbol in active trade
                            direction: direction,
                            entryPrice: safeCurrentPrice_1,
                            amount: selectedAmount,
                            duration: durationSeconds,
                            startTime: now,
                            endTime: now + (durationSeconds * 1000),
                            profitPercentage: profitPercentage,
                            status: 'active'
                        };
                        setActiveTrades(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newTrade_1], false); });
                        setCountdown(durationSeconds);
                        setIsTrading(true);
                        // Refresh balance to show updated amount
                        queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
                        // Clear trade history cache to prevent conflicts
                        if (user === null || user === void 0 ? void 0 : user.id) {
                            localStorage.removeItem("tradeHistory_".concat(user.id));
                            console.log('🗑️ Cleared trade history cache to prevent conflicts');
                        }
                        // Play trade placement sound safely
                        try {
                            playTradeSound('place');
                        }
                        catch (soundError) {
                            console.warn('Sound play failed:', soundError);
                        }
                        // Show trade confirmation
                        console.log("\uD83D\uDE80 Trade Executed:", {
                            direction: direction.toUpperCase(),
                            amount: "".concat(selectedAmount, " USDT"),
                            duration: selectedDuration,
                            entryPrice: "$".concat(safeCurrentPrice_1.toFixed(2)),
                            potentialProfit: "".concat(profitPercentage, "%"),
                            potentialPayout: "".concat((selectedAmount * (1 + profitPercentage / 100)).toFixed(2), " USDT")
                        });
                    }
                    else {
                        throw new Error(result.message || 'Failed to place trade');
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_5 = _d.sent();
                    console.error('Trade execution error:', error_5);
                    errorMessage = error_5 instanceof Error ? error_5.message : 'Please try again.';
                    alert("Failed to execute trade: ".concat(errorMessage));
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Error boundary wrapper
    try {
        // Mobile layout
        if (isMobile) {
            return (<div className="min-h-screen bg-[#10121E] text-white pb-20">
          {/* Use standard mobile header */}
          <MobileHeader />

          {/* Trading Pair Info Header - Below standard header */}
          <div className="bg-[#10121E] px-4 py-2 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-base notranslate">{currentPairData.symbol}</div>
                <div className="text-white text-lg font-bold notranslate">{displayPrice.toFixed(2)} USDT</div>
                <div className={"text-xs font-semibold notranslate ".concat(changeColor)}>
                  {changeText || (btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.priceChangePercent24h) || '+0.00%'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs">24h Vol</div>
                <div className="text-white text-sm font-bold notranslate">
                  {(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(2) + 'M' : '0.00M'}
                </div>
              </div>
            </div>

            {/* Mobile Market Stats - Reduced spacing */}
            <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">24h High</div>
                <div className="text-white font-medium notranslate">{(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.high24h) || '119,558'}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">24h Low</div>
                <div className="text-white font-medium notranslate">{(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.low24h) || '117,205'}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Volume</div>
                <div className="text-white font-medium notranslate">
                  {(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) / 1000).toFixed(0) + 'K' : '681K'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Turnover</div>
                <div className="text-white font-medium notranslate">
                  {(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) * parseFloat(btcMarketData.price) / 1000000).toFixed(0) + 'M' : '80.5M'}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Symbol Selector - Reduced spacing */}
          <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Symbol:</span>
              <select value={selectedSymbol} onChange={function (e) {
                    var newSymbol = e.target.value;
                    setSelectedSymbol(newSymbol);
                    handleTradingViewSymbolChange(newSymbol);
                }} className="bg-gray-700 text-white text-sm font-medium rounded-md px-3 py-1.5 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
                <option value="LTCUSDT">LTC/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="TONUSDT">TON/USDT</option>
                <option value="DOGEUSDT">DOGE/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
                <option value="TRXUSDT">TRX/USDT</option>
                <option value="LINKUSDT">LINK/USDT</option>
                <option value="AVAXUSDT">AVAX/USDT</option>
                <option value="SUIUSDT">SUI/USDT</option>
                <option value="SHIBUSDT">SHIB/USDT</option>
                <option value="BCHUSDT">BCH/USDT</option>
                <option value="DOTUSDT">DOT/USDT</option>
                <option value="XLMUSDT">XLM/USDT</option>
              </select>
            </div>
          </div>

          {/* Mobile Chart - Optimized spacing and proportions - Using TradingView like desktop */}
          <div className="bg-[#10121E] relative w-full mobile-chart-container" style={{ height: '380px' }}>
            <TradeOverlay trades={activeTrades} currentPrice={displayPrice}/>
            {/* Symbol Selector Overlay - Fixed background issue */}
            <div className="absolute top-2 right-2 z-10">
              <select value={selectedSymbol} onChange={function (e) {
                    var newSymbol = e.target.value;
                    setSelectedSymbol(newSymbol);
                    handleTradingViewSymbolChange(newSymbol);
                }} className="bg-gray-800/90 text-white text-xs font-medium rounded px-2 py-1 border border-gray-600/50 focus:border-blue-500 focus:outline-none min-w-[90px] max-w-[120px] backdrop-blur-sm" style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}>
                {tradingPairs.map(function (pair) { return (<option key={pair.rawSymbol} value={pair.rawSymbol} className="bg-gray-800 text-white">
                    {pair.coin}/USDT
                  </option>); })}
              </select>
            </div>
            <div className="w-full h-full">
              <ErrorBoundary>
                <TradingViewWidget type="chart" symbol={"BINANCE:".concat(selectedSymbol)} height={380} interval="1" theme="dark" container_id="options_mobile_tradingview_chart" onSymbolChange={handleTradingViewSymbolChange}/>
              </ErrorBoundary>
            </div>
          </div>

          {/* Mobile Content - Two Column Layout */}
          <div className="bg-[#10121E] min-h-screen flex">
            {/* Mobile Left Panel - Order Book & Price Data */}
            <div className="w-1/2 border-r border-gray-700">
              {/* Price Header - Reduced spacing */}
              <div className="p-2 border-b border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-white font-bold text-sm notranslate">{currentPairData.symbol}</div>
                  <div className="text-right">
                    <div className="font-bold text-white text-sm notranslate">
                      {currentPrice > 0 ? currentPrice.toFixed(2) : (safeCurrentPrice > 0 ? safeCurrentPrice.toFixed(2) : 'Loading...')} USDT
                    </div>
                    <div className={"text-xs notranslate ".concat(isPositive ? 'text-green-400' : 'text-red-400')}>
                      {changeText} ({changeColor})
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Book Headers - Reduced spacing */}
              <div className="grid grid-cols-3 gap-1 p-1.5 text-[10px] text-gray-400 border-b border-gray-700">
                <span className="truncate">Price</span>
                <span className="truncate text-center">Volume</span>
                <span className="truncate text-right">Total</span>
              </div>

              {/* Order Book Data */}
              <div className="h-[300px] overflow-y-auto notranslate">
                {/* Sell Orders (Red) */}
                <div className="space-y-0">
                  {orderBookData.sellOrders.slice(0, 8).map(function (order, index) { return (<div key={index} className="grid grid-cols-3 gap-1 px-1.5 py-0.5 text-[10px] hover:bg-gray-800">
                      <span className="text-red-400 font-mono truncate">{order.price}</span>
                      <span className="text-gray-300 font-mono truncate text-center">{order.volume}</span>
                      <span className="text-gray-400 font-mono truncate text-right">{order.turnover}</span>
                    </div>); })}
                </div>

                {/* Current Price Separator */}
                <div className="px-2 py-2 border-y border-gray-600">
                  <div className="text-center">
                    <span className={"text-sm font-bold notranslate ".concat(isPositive ? 'text-green-400' : 'text-red-400')}>
                      {displayPrice.toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                {/* Buy Orders (Green) */}
                <div className="space-y-0">
                  {orderBookData.buyOrders.slice(0, 8).map(function (order, index) { return (<div key={index} className="grid grid-cols-3 gap-1 px-1.5 py-0.5 text-[10px] hover:bg-gray-800">
                      <span className="text-green-400 font-mono truncate">{order.price}</span>
                      <span className="text-gray-300 font-mono truncate text-center">{order.volume}</span>
                      <span className="text-gray-400 font-mono truncate text-right">{order.turnover}</span>
                    </div>); })}
                </div>
              </div>
            </div>

            {/* Mobile Right Panel - Market Stats & Trading Info */}
            <div className="w-1/2">
              {/* Market Statistics */}
              <div className="px-3 py-2 border-b border-gray-700">
                <h3 className="text-white font-bold mb-2 text-sm">Market Statistics</h3>
                <div className="grid grid-cols-1 gap-2 text-xs notranslate">
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Change</span>
                    <span className={"font-semibold ".concat(((_b = btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.priceChangePercent24h) === null || _b === void 0 ? void 0 : _b.startsWith('-')) ? 'text-red-400' : 'text-green-400')}>
                      {(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.priceChangePercent24h) || '0.00%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h High</span>
                    <span className="text-white font-semibold">{(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.high24h) || currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Low</span>
                    <span className="text-white font-semibold">{(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.low24h) || currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Volume</span>
                    <span className="text-white font-semibold">{(btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(2) + 'M' : '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* My Orders Section */}
              <div className="px-3 py-2 border-b border-gray-700">
                <h3 className="text-white font-bold mb-2 text-sm">My Orders</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {activeTrades.length > 0 ? (activeTrades.map(function (trade) {
                    var timeLeft = Math.max(0, Math.ceil(((trade.expiryTime || trade.endTime) - Date.now()) / 1000));
                    var progress = timeLeft > 0 ? (timeLeft / trade.duration) * 100 : 0;
                    return (<div key={trade.id} className="bg-gray-800 rounded p-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center space-x-1">
                              <div className={"w-1.5 h-1.5 rounded-full ".concat(trade.direction === 'up' ? 'bg-green-400' : 'bg-red-400')}></div>
                              <span className="text-white text-xs font-medium">{currentPairData.symbol}</span>
                              <span className={"text-xs px-1 py-0.5 rounded ".concat(trade.direction === 'up' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400')}>
                                {trade.direction.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-white font-bold text-xs">${trade.amount}</span>
                          </div>

                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Entry: ${trade.entryPrice}</span>
                            <span>Current: ${displayPrice.toFixed(2)}</span>
                          </div>

                          {timeLeft > 0 ? (<div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400 notranslate">{timeLeft}s</span>
                                <span className={"font-medium ".concat((trade.direction === 'up' && displayPrice > trade.entryPrice) ||
                                (trade.direction === 'down' && displayPrice < trade.entryPrice)
                                ? 'text-green-400' : 'text-red-400')}>
                                  {(trade.direction === 'up' && displayPrice > trade.entryPrice) ||
                                (trade.direction === 'down' && displayPrice < trade.entryPrice)
                                ? 'Winning' : 'Losing'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-0.5">
                                <div className="bg-blue-500 h-0.5 rounded-full transition-all duration-1000" style={{ width: "".concat(progress, "%") }}></div>
                              </div>
                            </div>) : (<div className="text-center">
                              <span className={"text-xs font-bold ".concat((trade.direction === 'up' && (trade.exitPrice || trade.currentPrice || 0) > trade.entryPrice) ||
                                (trade.direction === 'down' && (trade.exitPrice || trade.currentPrice || 0) < trade.entryPrice)
                                ? 'text-green-400' : 'text-red-400')}>
                                {(trade.direction === 'up' && (trade.exitPrice || trade.currentPrice || 0) > trade.entryPrice) ||
                                (trade.direction === 'down' && (trade.exitPrice || trade.currentPrice || 0) < trade.entryPrice)
                                ? 'WON' : 'LOST'}
                              </span>
                            </div>)}
                        </div>);
                })) : (<div className="text-center py-2">
                      <div className="text-gray-400 text-xs">No active trades</div>
                    </div>)}
                </div>
              </div>

              {/* Trading Pairs */}
              <div className="px-3 py-2">
                <h3 className="text-white font-bold mb-2 text-sm">Trading Pairs</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto notranslate">
                  {filteredTradingPairs.slice(0, 6).map(function (pair, index) {
                    var _a;
                    var isPositive = !((_a = pair.priceChangePercent24h) === null || _a === void 0 ? void 0 : _a.startsWith('-'));
                    var iconMap = {
                        'BTC': { icon: '₿', bg: 'bg-orange-500' },
                        'ETH': { icon: 'Ξ', bg: 'bg-purple-500' },
                        'BNB': { icon: 'B', bg: 'bg-yellow-600' },
                        'SOL': { icon: 'S', bg: 'bg-purple-600' },
                        'XRP': { icon: '✕', bg: 'bg-gray-600' },
                        'ADA': { icon: 'A', bg: 'bg-blue-500' },
                    };
                    var iconInfo = iconMap[pair.coin] || { icon: pair.coin[0], bg: 'bg-gray-500' };
                    var formattedPrice = parseFloat(pair.price).toFixed(pair.price.includes('.') && parseFloat(pair.price) < 1 ? 4 : 2);
                    return (<div key={index} onClick={function () { return handlePairSelect(pair.rawSymbol); }} className={"flex items-center justify-between p-1.5 hover:bg-[#1a1b2e] rounded cursor-pointer transition-colors ".concat(selectedSymbol === pair.rawSymbol ? 'bg-blue-600/20 border border-blue-500/30' : '')}>
                        <div className="flex items-center space-x-2">
                          <div className={"w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs ".concat(iconInfo.bg)}>
                            {iconInfo.icon}
                          </div>
                          <div>
                            <div className="text-white text-xs font-medium">{pair.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-xs">{formattedPrice}</div>
                          <div className={"text-xs ".concat(isPositive ? 'text-green-400' : 'text-red-400')}>
                            {pair.priceChangePercent24h}
                          </div>
                        </div>
                      </div>);
                })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Options Trading Interface - Reduced spacing */}
          <div className="px-3 py-2 space-y-2 bg-[#10121E]">
            {/* Balance Display - Using TradingView Price - Compact */}
            <div className="bg-gray-800 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">Current Price:</span>
                  <div className="flex items-center space-x-1">
                    <div className={"w-1.5 h-1.5 rounded-full ".concat(connected ? 'bg-green-400 animate-pulse' : 'bg-red-400')}></div>
                    <span className="text-xs text-gray-500">
                      {connected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
                <span className="text-white font-bold text-sm notranslate">
                  {currentPrice > 0 ? currentPrice.toFixed(2) : (safeCurrentPrice > 0 ? safeCurrentPrice.toFixed(2) : 'Loading...')} USDT
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400 text-xs">Balance:</span>
                {user ? (<span className="text-green-400 font-bold text-sm notranslate">{balance.toFixed(2)} USDT</span>) : (<span className="text-yellow-400 font-bold text-xs">Sign in required</span>)}
              </div>
            </div>

            {/* Duration Selection - Compact layout */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Duration & Profit</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                    { duration: '30s', profit: '10%' },
                    { duration: '60s', profit: '15%' },
                    { duration: '90s', profit: '20%' },
                    { duration: '120s', profit: '25%' },
                    { duration: '180s', profit: '30%' },
                    { duration: '240s', profit: '50%' },
                    { duration: '300s', profit: '75%' },
                    { duration: '600s', profit: '100%' }
                ].map(function (option) { return (<button key={option.duration} onClick={function () {
                        setSelectedDuration(option.duration);
                        var minAmount = getMinimumAmount(option.duration);
                        if (selectedAmount < minAmount) {
                            setSelectedAmount(minAmount);
                        }
                    }} className={"py-1 px-1 rounded text-center transition-colors notranslate ".concat(selectedDuration === option.duration
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white')} disabled={isTrading}>
                    <div className="text-xs font-medium notranslate">{option.duration}</div>
                    <div className="text-[9px] text-green-400 notranslate">{option.profit}</div>
                  </button>); })}
              </div>
            </div>

            {/* Amount Selection - Compact layout */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Amount (USDT) - Min: {getMinimumAmount(selectedDuration).toLocaleString()}
              </label>
              <div className="grid grid-cols-3 gap-1 mb-1.5">
                {[100, 500, 1000, 2000, 5000, 10000].map(function (amount) { return (<button key={amount} onClick={function () { return setSelectedAmount(amount); }} className={"py-1 px-2 rounded text-xs font-medium transition-colors ".concat(selectedAmount === amount
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white')} disabled={isTrading}>
                    {amount}
                  </button>); })}
              </div>

              {/* Max Button - Compact */}
              <button onClick={function () {
                    var maxAmount = Math.floor(balance) || 0;
                    setSelectedAmount(maxAmount);
                }} className={"w-full py-1 px-2 rounded text-xs font-medium transition-colors mb-1.5 ".concat(selectedAmount === Math.floor(balance || 0)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white')} disabled={isTrading}>
                Max ({Math.floor(balance || 0)} USDT)
              </button>

              {/* Custom Amount Input - Compact */}
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={selectedAmount} onChange={function (e) {
                    var inputValue = e.target.value.replace(/[^0-9.]/g, ''); // Only allow numbers and decimal
                    var value = parseFloat(inputValue) || 0;
                    setSelectedAmount(value); // Don't clamp during typing, allow free input
                }} onBlur={function (e) {
                    // Only clamp when user finishes typing (on blur)
                    var value = parseFloat(e.target.value) || 0;
                    if (value < 100) {
                        setSelectedAmount(100);
                    }
                    else if (value > (balance || 0)) {
                        setSelectedAmount(Math.floor(balance || 0));
                    }
                }} className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-white text-xs focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder={"Enter amount (Min: 100, Max: ".concat(Math.floor(balance || 0), ")")}/>
            </div>

            {/* Login to Trade Message - Compact */}
            {!user && (<div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-3 mb-2 text-center">
                <div className="text-white font-bold text-base mb-1">🔒 Login to Trade</div>
                <div className="text-white/80 text-xs mb-2">
                  Sign in to start options trading and earn up to 15% profit
                </div>
                <a href="/login" className="inline-block bg-white text-purple-600 font-bold py-1.5 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  Login Now
                </a>
              </div>)}

            {/* UP/DOWN Buttons - Compact layout */}
            {(!(user === null || user === void 0 ? void 0 : user.verificationStatus) || (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'unverified') && (user === null || user === void 0 ? void 0 : user.role) !== 'super_admin' ? (<div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-3 mb-2">
                <div className="text-center">
                  <div className="text-yellow-100 font-semibold mb-1 text-sm">🔒 Verification Required</div>
                  <div className="text-yellow-200 text-xs mb-2">
                    Upload your verification documents to start trading
                  </div>
                  <a href="/profile" className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs">
                    Upload Documents
                  </a>
                </div>
              </div>) : (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'pending' ? (<div className="bg-blue-900/50 border border-blue-600/50 rounded-lg p-3 mb-2">
                <div className="text-center">
                  <div className="text-blue-100 font-semibold mb-1 text-sm">⏳ Verification Pending</div>
                  <div className="text-blue-200 text-xs">
                    Your documents are being reviewed. Trading will be enabled once approved.
                  </div>
                </div>
              </div>) : (<div className="grid grid-cols-2 gap-2">
                <button onClick={function () { return handleTrade('up'); }} disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium text-base transition-colors relative">
                  Buy/Up
                </button>
                <button onClick={function () { return handleTrade('down'); }} disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount} className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded font-medium text-base transition-colors relative">
                  Sell/Down
                </button>
              </div>)}

            {countdown > 0 && (<div className="text-center py-2">
                <div className="text-yellow-400 font-bold notranslate">
                  Next trade available in: <span className="notranslate">{countdown}s</span>
                </div>
              </div>)}
          </div>

          {/* Mobile Trading History Section */}
          <div className="bg-[#10121E] border-t border-gray-700 min-h-[600px]">
            {/* Tabs Header */}
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
              <div className="flex items-center space-x-6">
                <button onClick={function () { return setActiveTab("open"); }} className={"pb-1 text-sm font-medium ".concat(activeTab === "open"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white")}>
                  Active Trades({activeTrades.length})
                </button>
                <button onClick={function () { return setActiveTab("history"); }} className={"pb-1 text-sm font-medium ".concat(activeTab === "history"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white")}>
                  Trade History({tradeHistory.length})
                </button>
                {activeTab === "history" && (<button onClick={function () {
                        console.log('🔄 MANUAL REFRESH: User clicked refresh button');
                        setIsLoadingHistory(true);
                        loadTradeHistory();
                    }} disabled={isLoadingHistory} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                    <svg className={"w-4 h-4 ".concat(isLoadingHistory ? 'animate-spin' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <span>{isLoadingHistory ? 'Refreshing...' : 'Refresh'}</span>
                  </button>)}
              </div>
            </div>

            {/* Mobile Trade Content - Simplified for smaller screens */}
            <div className="px-4 py-2 max-h-[550px] overflow-y-auto">
              {activeTab === "open" && (<>
                  {activeTrades.length === 0 ? (<div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 mb-4 opacity-50">
                        <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                          <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <div className="text-gray-400 text-sm">No active trades</div>
                    </div>) : (activeTrades.map(function (trade) {
                        var timeRemaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
                        var priceChange = safeCurrentPrice - trade.entryPrice;
                        var isWinning = (trade.direction === 'up' && priceChange > 0) ||
                            (trade.direction === 'down' && priceChange < 0);
                        var potentialPayout = isWinning ? (trade.amount * (1 + trade.profitPercentage / 100)) - trade.amount : -(trade.amount * trade.profitPercentage / 100);
                        return (<div key={trade.id} className="bg-gray-800 rounded p-3 mb-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className={"font-bold text-sm notranslate ".concat(trade.direction === 'up' ? 'text-green-400' : 'text-red-400')}>
                              {trade.direction === 'up' ? 'BUY' : 'SELL'} • {trade.amount} USDT
                            </span>
                            <span className="text-yellow-400 font-bold text-sm notranslate">{timeRemaining}s</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-300 notranslate">
                            <span>Entry: {trade.entryPrice.toFixed(2)}</span>
                            <span>Current: {currentPrice.toFixed(2)}</span>
                            <span className={"font-bold ".concat(isWinning ? 'text-green-400' : 'text-red-400')}>
                              {potentialPayout > 0 ? '+' : ''}{potentialPayout.toFixed(2)} USDT
                            </span>
                          </div>
                        </div>);
                    }))}
                </>)}

              {activeTab === "history" && (<>
                  {isLoadingHistory ? (<div className="flex flex-col items-center justify-center py-16">
                      <div className="w-8 h-8 mb-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-gray-400 text-sm">Loading trade history...</div>
                    </div>) : tradeHistory.length === 0 ? (<div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 mb-4 opacity-50">
                        <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                          <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                          <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </div>
                      <div className="text-gray-400 text-sm">No trade history</div>
                      <div className="text-gray-500 text-xs mt-2">Complete some trades to see your history here</div>
                    </div>) : (<div className="space-y-2">
                      {tradeHistory.map(function (trade) {
                            // Get correct profit percentage based on duration
                            var getProfitPercentageByDuration = function (duration) {
                                if (duration === 30)
                                    return 10;
                                else if (duration === 60)
                                    return 15;
                                else if (duration === 90)
                                    return 20;
                                else if (duration === 120)
                                    return 25;
                                else if (duration === 180)
                                    return 30;
                                else if (duration === 240)
                                    return 50;
                                else if (duration === 300)
                                    return 75;
                                else if (duration === 600)
                                    return 100;
                                return 10; // Default
                            };
                            var profitPercentage = getProfitPercentageByDuration(trade.duration || 30);
                            var pnl = trade.profit !== undefined ? trade.profit :
                                (trade.status === 'won' ?
                                    (trade.amount * profitPercentage / 100) :
                                    -trade.amount);
                            // Format market pair and date/time
                            var marketPair = trade.symbol ? trade.symbol.replace('USDT', '/USDT') : 'BTC/USDT';
                            var tradeDate = new Date(trade.endTime);
                            var formattedDate = tradeDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                            var formattedTime = tradeDate.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            return (<div key={trade.id} className="bg-gray-800 rounded p-2.5 mb-2">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-gray-400 text-xs font-medium">{marketPair}</span>
                              <span className={"font-bold text-sm ".concat(trade.status === 'won' ? 'text-green-400' : 'text-red-400')}>
                                {trade.status === 'won' ? '✅ WON' : '❌ LOST'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className={"font-bold text-sm ".concat(trade.direction === 'up' ? 'text-green-400' : 'text-red-400')}>
                                {trade.direction === 'up' ? 'BUY' : 'SELL'} • {trade.amount} USDT
                              </span>
                              <span className={"font-bold text-xs ".concat(trade.status === 'won' ? 'text-green-400' : 'text-red-400')}>
                                {trade.status === 'won' ? '+' : ''}{pnl.toFixed(2)} USDT
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>Entry: {trade.entryPrice.toFixed(2)}</span>
                              <div className="text-right">
                                <div>{formattedDate}</div>
                                <div>{formattedTime}</div>
                              </div>
                            </div>
                          </div>);
                        })}
                    </div>)}
                </>)}
            </div>
          </div>

          <Footer />
          <MobileBottomNav />

          {/* Trade Notification - Mobile */}
          {completedTrade && console.log('🔔 RENDER: Mobile notification with completedTrade:', {
                    id: completedTrade.id,
                    amount: completedTrade.amount,
                    duration: completedTrade.duration,
                    status: completedTrade.status,
                    entryPrice: completedTrade.entryPrice,
                    currentPrice: completedTrade.currentPrice,
                    profit: completedTrade.profit,
                    profitPercentage: completedTrade.profitPercentage,
                    fullObject: JSON.stringify(completedTrade)
                })}
          <TradeNotification key={notificationKey} // Force re-render with unique key
             trade={completedTrade ? {
                    id: completedTrade.id,
                    direction: completedTrade.direction,
                    amount: completedTrade.amount,
                    entryPrice: completedTrade.entryPrice,
                    finalPrice: completedTrade.currentPrice || completedTrade.entryPrice,
                    status: completedTrade.status,
                    payout: completedTrade.payout || (completedTrade.status === 'won' ?
                        completedTrade.amount + (completedTrade.amount * (completedTrade.profitPercentage || 10) / 100) :
                        0),
                    profitPercentage: completedTrade.profitPercentage || 10,
                    profit: completedTrade.profit, // CRITICAL: Pass profit field for accurate P&L display
                    symbol: completedTrade.symbol || 'BTC/USDT', // Use symbol from completed trade, not current selection
                    duration: completedTrade.duration || 30 // Use duration from completed trade, not current selection
                } : null} onClose={function () {
                    console.log('🔔 NOTIFICATION: onClose called (mobile)');
                    setCompletedTrade(null);
                    localStorage.removeItem('completedTrade');
                }}/>
        </div>);
        }
        // Desktop layout (existing)
        return (<div className="min-h-screen bg-gray-900">
        <Navigation />
      
      {/* Top Header with Dynamic Trading Pair Info - Using TradingView Price */}
      <div className="bg-[#10121E] px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-white font-bold text-lg">{currentPairData.symbol}</div>
            <div className="text-white text-2xl font-bold">{parseFloat(currentPairData.price).toFixed(2)}</div>
            <div className="text-gray-400 text-sm">{parseFloat(currentPairData.price).toFixed(2)} USDT</div>
          </div>
          <div className={"text-lg font-semibold ".concat(((_c = currentPairData.priceChangePercent24h) === null || _c === void 0 ? void 0 : _c.startsWith('-')) ? 'text-red-400' : 'text-green-400')}>
            {currentPairData.priceChangePercent24h || '+0.00%'}
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <div className="text-gray-400">Change 24h</div>
              <div className={"text-white font-semibold ".concat((priceData === null || priceData === void 0 ? void 0 : priceData.priceChange24h) >= 0 ? 'text-green-400' : 'text-red-400')}>
                {((_d = priceData === null || priceData === void 0 ? void 0 : priceData.priceChange24h) === null || _d === void 0 ? void 0 : _d.toFixed(2)) || '0.00'} {(priceData === null || priceData === void 0 ? void 0 : priceData.priceChangePercent24h) >= 0 ? '+' : ''}{((_e = priceData === null || priceData === void 0 ? void 0 : priceData.priceChangePercent24h) === null || _e === void 0 ? void 0 : _e.toFixed(2)) || '0.00'}%
              </div>
            </div>
            <div>
              <div className="text-gray-400">24h High</div>
              <div className="text-white">{((_f = priceData === null || priceData === void 0 ? void 0 : priceData.high24h) === null || _f === void 0 ? void 0 : _f.toFixed(2)) || (btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.high24h) || currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400">24h Low</div>
              <div className="text-white">{((_g = priceData === null || priceData === void 0 ? void 0 : priceData.low24h) === null || _g === void 0 ? void 0 : _g.toFixed(2)) || (btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.low24h) || currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-400">Volume 24h (BTC)</div>
              <div className="text-white">{(priceData === null || priceData === void 0 ? void 0 : priceData.volume24h) ? (parseFloat(priceData.volume24h.toString()) / 1000000).toFixed(2) + 'M' : ((btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) / 1000000).toFixed(2) + 'M' : '0.00')}</div>
            </div>
            <div>
              <div className="text-gray-400">Turnover 24h (USDT)</div>
              <div className="text-white">{(priceData === null || priceData === void 0 ? void 0 : priceData.volume24h) && (priceData === null || priceData === void 0 ? void 0 : priceData.price) ? (parseFloat(priceData.volume24h.toString()) * priceData.price / 1000000).toFixed(2) + 'M' : ((btcMarketData === null || btcMarketData === void 0 ? void 0 : btcMarketData.volume24h) ? (parseFloat(btcMarketData.volume24h) * parseFloat(btcMarketData.price) / 1000000).toFixed(2) + 'M' : '0.00')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Layout */}
      <div className="bg-[#10121E] flex">
        {/* Left Panel - Order Book */}
        <div className="w-64 border-r border-gray-700">
          {/* Order Book Header - Dynamic Trading Pair */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold notranslate">{currentPairData.symbol}</div>
              <div className="text-right">
                <div className="font-bold text-white text-lg notranslate">
                  {parseFloat(currentPairData.price).toFixed(2)}
                </div>
                <div className={"text-sm font-semibold notranslate ".concat(((_h = currentPairData.priceChangePercent24h) === null || _h === void 0 ? void 0 : _h.startsWith('-')) ? 'text-red-400' : 'text-green-400')}>
                  {currentPairData.priceChangePercent24h || '+0.00%'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-white text-sm">0.01</span>
                <span className="text-gray-400">▼</span>
              </div>
            </div>
          </div>

          {/* Order Book Headers */}
          <div className="grid grid-cols-3 gap-2 p-2 text-xs text-gray-400 border-b border-gray-700">
            <span>Price (USDT)</span>
            <span>Volume (BTC)</span>
            <span>Turnover</span>
          </div>

          {/* Order Book Data */}
          <div className="h-[400px] overflow-y-auto notranslate" data-orderbook="desktop">
            {/* Sell Orders (Red) */}
            <div className="space-y-0">
              {orderBookData.sellOrders.length > 0 ? orderBookData.sellOrders.map(function (order, index) { return (<div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-gray-800" data-order-type="sell">
                  <span style={{ color: 'rgb(248, 113, 113)', fontWeight: '500' }} data-field="price">{order.price}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="volume">{order.volume}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="turnover">{order.turnover}</span>
                </div>); }) : (<div className="text-gray-400 text-center py-4">Loading sell orders...</div>)}
            </div>

            {/* Current Price */}
            <div className={"p-2 my-1 notranslate ".concat(isPositive ? 'bg-green-900/20' : 'bg-red-900/20')}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-lg">
                  {displayPrice.toFixed(2)}
                </span>
                <span className={"".concat(isPositive ? 'text-green-400' : 'text-red-400')}>
                  {isPositive ? '↑' : '↓'}
                </span>
                <span className="text-gray-400 text-sm">{displayPrice.toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Buy Orders (Green) */}
            <div className="space-y-0">
              {orderBookData.buyOrders.length > 0 ? orderBookData.buyOrders.map(function (order, index) { return (<div key={index} className="grid grid-cols-3 gap-2 px-2 py-1 text-xs hover:bg-gray-800" data-order-type="buy">
                  <span style={{ color: 'rgb(74, 222, 128)', fontWeight: '500' }} data-field="price">{order.price}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="volume">{order.volume}</span>
                  <span style={{ color: 'rgb(209, 213, 219)' }} data-field="turnover">{order.turnover}</span>
                </div>); }) : (<div className="text-gray-400 text-center py-4">Loading buy orders...</div>)}
            </div>
          </div>
        </div>

        {/* Center Panel - Chart and Options Trading */}
        <div className="flex-1 flex flex-col">
          {/* Chart Controls - Chart view switching */}
          <div className="p-2 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-400">
                  Chart Sync: <span className="text-green-400">Active</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {/* Basic version hidden to avoid red line issues */}
                  {false && (<button onClick={function () { return setChartView('basic'); }} className={"text-xs transition-colors ".concat(chartView === 'basic'
                    ? 'text-white bg-purple-600 px-2 py-1 rounded'
                    : 'text-gray-400 hover:text-white')}>
                      Basic version
                    </button>)}
                  <button onClick={function () { return setChartView('tradingview'); }} className={"text-xs transition-colors ".concat(chartView === 'tradingview'
                ? 'text-white bg-purple-600 px-2 py-1 rounded'
                : 'text-gray-400 hover:text-white')}>
                    Trading view
                  </button>

                  {/* Manual Symbol Selector for Testing */}
                  {chartView === 'tradingview' && (<div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-400">Quick select:</span>
                      <button onClick={function () {
                    console.log('🔄 Manual symbol change to BTCUSDT');
                    var matchingPair = tradingPairs.find(function (pair) { return pair.rawSymbol === 'BTCUSDT'; });
                    if (matchingPair) {
                        setSelectedSymbol('BTCUSDT');
                    }
                }} className="text-xs text-orange-400 hover:text-orange-300 px-1">
                        BTC
                      </button>
                      <button onClick={function () {
                    console.log('🔄 Manual symbol change to ETHUSDT');
                    var matchingPair = tradingPairs.find(function (pair) { return pair.rawSymbol === 'ETHUSDT'; });
                    if (matchingPair) {
                        setSelectedSymbol('ETHUSDT');
                    }
                }} className="text-xs text-blue-400 hover:text-blue-300 px-1">
                        ETH
                      </button>
                      <button onClick={function () {
                    console.log('🔄 Manual symbol change to SOLUSDT');
                    var matchingPair = tradingPairs.find(function (pair) { return pair.rawSymbol === 'SOLUSDT'; });
                    if (matchingPair) {
                        setSelectedSymbol('SOLUSDT');
                    }
                }} className="text-xs text-green-400 hover:text-green-300 px-1">
                        SOL
                      </button>
                    </div>)}
                  <button onClick={function () { return setChartView('depth'); }} className={"text-xs transition-colors ".concat(chartView === 'depth'
                ? 'text-white bg-purple-600 px-2 py-1 rounded'
                : 'text-gray-400 hover:text-white')}>
                    Depth
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area - Dynamic chart based on selected view */}
          <div className="h-[500px] relative bg-[#000000] p-1">
            <TradeOverlay trades={activeTrades} currentPrice={(priceData === null || priceData === void 0 ? void 0 : priceData.price) || currentPrice}/>

            {/* Basic chart view disabled to avoid red line issues */}
            {false && chartView === 'basic' && (<LightweightChart symbol={selectedSymbol} interval="1m" height={490} containerId="options_desktop_chart"/>)}

            {chartView === 'tradingview' && (<div className="relative h-full">
                {/* Symbol Selector Overlay - Fixed background issue */}
                <div className="absolute top-2 right-2 z-10">
                  <select value={selectedSymbol} onChange={function (e) {
                    var newSymbol = e.target.value;
                    setSelectedSymbol(newSymbol);
                    handleTradingViewSymbolChange(newSymbol);
                }} className="bg-gray-800/90 text-white text-xs font-medium rounded px-2 py-1 border border-gray-600/50 focus:border-blue-500 focus:outline-none min-w-[90px] max-w-[120px] backdrop-blur-sm" style={{ backgroundColor: 'rgba(31, 41, 55, 0.9)' }}>
                    <option value="BTCUSDT" className="bg-gray-800 text-white">BTC/USDT</option>
                    <option value="ETHUSDT" className="bg-gray-800 text-white">ETH/USDT</option>
                    <option value="XRPUSDT" className="bg-gray-800 text-white">XRP/USDT</option>
                    <option value="LTCUSDT" className="bg-gray-800 text-white">LTC/USDT</option>
                    <option value="BNBUSDT" className="bg-gray-800 text-white">BNB/USDT</option>
                    <option value="SOLUSDT" className="bg-gray-800 text-white">SOL/USDT</option>
                    <option value="TONUSDT" className="bg-gray-800 text-white">TON/USDT</option>
                    <option value="DOGEUSDT" className="bg-gray-800 text-white">DOGE/USDT</option>
                    <option value="ADAUSDT" className="bg-gray-800 text-white">ADA/USDT</option>
                    <option value="TRXUSDT" className="bg-gray-800 text-white">TRX/USDT</option>
                    <option value="LINKUSDT" className="bg-gray-800 text-white">LINK/USDT</option>
                    <option value="AVAXUSDT" className="bg-gray-800 text-white">AVAX/USDT</option>
                    <option value="SUIUSDT" className="bg-gray-800 text-white">SUI/USDT</option>
                    <option value="SHIBUSDT" className="bg-gray-800 text-white">SHIB/USDT</option>
                    <option value="BCHUSDT" className="bg-gray-800 text-white">BCH/USDT</option>
                    <option value="DOTUSDT" className="bg-gray-800 text-white">DOT/USDT</option>
                    <option value="XLMUSDT" className="bg-gray-800 text-white">XLM/USDT</option>
                  </select>
                </div>

                <ErrorBoundary>
                  <TradingViewWidget type="chart" symbol={"BINANCE:".concat(selectedSymbol)} height={490} interval="1" theme="dark" container_id="options_tradingview_chart" onSymbolChange={handleTradingViewSymbolChange}/>
                </ErrorBoundary>
              </div>)}

            {chartView === 'depth' && (<div className="w-full h-full p-4">
                <div className="text-center mb-4">
                  <div className="text-white text-lg font-bold mb-1">Market Depth Chart</div>
                  <div className="text-gray-400 text-sm">Real-time order book visualization for {selectedSymbol}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 h-[400px]">
                  {/* Buy Orders (Bids) */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-green-400 text-sm font-bold mb-3 text-center">Buy Orders (Bids)</div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 text-xs text-gray-400 border-b border-gray-600 pb-1">
                        <span>Price</span>
                        <span className="text-center">Amount</span>
                        <span className="text-right">Total</span>
                      </div>
                      {orderBookData.buyOrders.slice(0, 15).map(function (order, i) { return (<div key={i} className="grid grid-cols-3 text-xs hover:bg-gray-700/50 p-1 rounded">
                          <span className="text-green-400 font-mono">{order.price}</span>
                          <span className="text-gray-300 font-mono text-center">{order.volume}</span>
                          <span className="text-gray-300 font-mono text-right">{order.turnover}</span>
                        </div>); })}
                    </div>
                  </div>

                  {/* Sell Orders (Asks) */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-red-400 text-sm font-bold mb-3 text-center">Sell Orders (Asks)</div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 text-xs text-gray-400 border-b border-gray-600 pb-1">
                        <span>Price</span>
                        <span className="text-center">Amount</span>
                        <span className="text-right">Total</span>
                      </div>
                      {orderBookData.sellOrders.slice(0, 15).map(function (order, i) { return (<div key={i} className="grid grid-cols-3 text-xs hover:bg-gray-700/50 p-1 rounded">
                          <span className="text-red-400 font-mono">{order.price}</span>
                          <span className="text-gray-300 font-mono text-center">{order.volume}</span>
                          <span className="text-gray-300 font-mono text-right">{order.turnover}</span>
                        </div>); })}
                    </div>
                  </div>
                </div>

                {/* Current Price Indicator */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-lg notranslate">
                    <span className="text-gray-400 text-sm">Current Price:</span>
                    <span className="text-white font-bold text-lg">{displayPrice.toFixed(2)} USDT</span>
                    <span className={"text-sm ".concat((priceData === null || priceData === void 0 ? void 0 : priceData.priceChangePercent24h) >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {(priceData === null || priceData === void 0 ? void 0 : priceData.priceChangePercent24h) >= 0 ? '+' : ''}{((_j = priceData === null || priceData === void 0 ? void 0 : priceData.priceChangePercent24h) === null || _j === void 0 ? void 0 : _j.toFixed(2)) || '0.00'}%
                    </span>
                  </div>
                </div>
              </div>)}
          </div>

          {/* Options Trading Controls */}
          <div className="p-4 border-t border-gray-700">
            {/* Current Price Display - Using TradingView Price */}
            <div className="mb-4 p-3 bg-gray-800 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Current Price:</span>
                  <div className="flex items-center space-x-1">
                    <div className={"w-2 h-2 rounded-full ".concat(connected ? 'bg-green-400 animate-pulse' : 'bg-red-400')}></div>
                    <span className="text-xs text-gray-500">
                      {connected ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold text-lg notranslate">
                    {currentPrice > 0 ? currentPrice.toFixed(2) : (safeCurrentPrice > 0 ? safeCurrentPrice.toFixed(2) : 'Loading...')} USDT
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400">Balance:</span>
                {user ? (<span className="text-green-400 font-bold notranslate">{balance.toFixed(2)} USDT</span>) : (<span className="text-yellow-400 font-bold">Sign in required</span>)}
              </div>

              {/* Trading Mode Indicator - HIDDEN FROM USERS */}
              {false && (<div className="flex items-center justify-between mt-2 p-2 rounded-lg bg-gray-700/50">
                  <span className="text-gray-400 text-sm">Trading Mode:</span>
                  <span className={"font-bold text-sm px-2 py-1 rounded ".concat(currentTradingMode === 'win' ? 'bg-green-600 text-white' :
                    currentTradingMode === 'lose' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white')}>
                    {currentTradingMode.toUpperCase()}
                  </span>
                </div>)}

              {isTrading && activeTrades.length > 0 && (<div className="mt-3 space-y-2">
                  {activeTrades.map(function (trade) {
                    var timeRemaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
                    var priceChange = safeCurrentPrice - trade.entryPrice;
                    var isWinning = (trade.direction === 'up' && priceChange > 0) ||
                        (trade.direction === 'down' && priceChange < 0);
                    return (<div key={trade.id} className="p-2 bg-gray-700 rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className={"font-bold notranslate ".concat(trade.direction === 'up' ? 'text-green-400' : 'text-red-400')}>
                            {trade.direction === 'up' ? 'BUY' : 'SELL'} {trade.amount} USDT
                          </span>
                          <span className="text-yellow-400 font-bold notranslate">{timeRemaining}s</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-400 notranslate">
                            Entry: {trade.entryPrice.toFixed(2)} USDT
                          </span>
                          <span className={"font-bold ".concat(isWinning ? 'text-green-400' : 'text-red-400')}>
                            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} USDT
                          </span>
                        </div>
                        <div className="text-center mt-1">
                          <span className={"text-xs ".concat(isWinning ? 'text-green-400' : 'text-red-400')}>
                            {isWinning ? '🟢 WINNING' : '🔴 LOSING'} • Profit: {trade.profitPercentage}%
                          </span>
                        </div>
                      </div>);
                })}
                </div>)}
            </div>

            {/* Duration Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { duration: '30s', profit: '10%' },
                { duration: '60s', profit: '15%' },
                { duration: '90s', profit: '20%' },
                { duration: '120s', profit: '25%' },
                { duration: '180s', profit: '30%' },
                { duration: '240s', profit: '50%' },
                { duration: '300s', profit: '75%' },
                { duration: '600s', profit: '100%' }
            ].map(function (option) { return (<button key={option.duration} onClick={function () {
                    setSelectedDuration(option.duration);
                    // Update minimum amount based on new requirements
                    var minAmount = getMinimumAmount(option.duration);
                    if (selectedAmount < minAmount) {
                        setSelectedAmount(minAmount);
                    }
                }} className={"p-2 rounded text-center border transition-colors notranslate ".concat(selectedDuration === option.duration
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700')} disabled={isTrading}>
                  <div className="text-sm font-medium notranslate">{option.duration}</div>
                  <div className="text-xs text-green-400 notranslate">{option.profit}</div>
                </button>); })}
            </div>

            {/* Amount Selection */}
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-2">
                Minimum buy: {getMinimumAmount(selectedDuration).toLocaleString()} USDT | Selected: {selectedAmount} USDT
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[100, 500, 1000, 2000].map(function (amount) { return (<button key={amount} onClick={function () { return setSelectedAmount(amount); }} className={"p-2 rounded text-sm transition-colors ".concat(selectedAmount === amount
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700')} disabled={isTrading}>
                    {amount}
                  </button>); })}
              </div>
              <div className="grid grid-cols-1 gap-2 mb-2">
                <button onClick={function () {
                var maxAmount = Math.floor(balance) || 0;
                setSelectedAmount(maxAmount);
            }} className={"p-2 rounded text-sm transition-colors ".concat(selectedAmount === Math.floor(balance || 0)
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700')} disabled={isTrading}>
                  Max ({Math.floor(balance || 0)} USDT)
                </button>
              </div>

              {/* Custom Amount Input - FULLY WRITABLE */}
              <div className="mt-2">
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={selectedAmount} onChange={function (e) {
                var inputValue = e.target.value.replace(/[^0-9.]/g, ''); // Only allow numbers and decimal
                var value = parseFloat(inputValue) || 0;
                setSelectedAmount(value); // Don't clamp during typing, allow free input
            }} onBlur={function (e) {
                // Only clamp when user finishes typing (on blur)
                var value = parseFloat(e.target.value) || 0;
                if (value < 100) {
                    setSelectedAmount(100);
                }
                else if (value > (balance || 0)) {
                    setSelectedAmount(Math.floor(balance || 0));
                }
            }} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder={"Enter amount (Min: 100, Max: ".concat(Math.floor(balance || 0), ")")}/>
              </div>
            </div>

            <div className="text-gray-400 text-sm mb-4">
              {user ? (<>Available: {(balance || 0).toFixed(2)} USDT | Active Trades: {activeTrades.length}/3</>) : (<>Sign in to view balance and start trading</>)}

            </div>

            {/* DEBUG: Test Notification Button - MOBILE */}
            {process.env.NODE_ENV === 'development' && (<div className="mb-4">
                <button onClick={function () {
                    console.log('🧪 MOBILE DEBUG: Manual notification trigger');
                    var testTrade = {
                        id: 'mobile-manual-test-' + Date.now(),
                        direction: 'up',
                        amount: 100,
                        entryPrice: 50000,
                        currentPrice: 51000,
                        status: 'won',
                        payout: 110,
                        profitPercentage: 10
                    };
                    triggerNotification(testTrade);
                }} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded font-medium text-sm">
                  🧪 TEST MOBILE NOTIFICATION
                </button>
                <button onClick={function () {
                    console.log('🧪 MOBILE DEBUG: Direct DOM notification trigger');
                    // Remove any existing notifications
                    var existing = document.querySelectorAll('[data-mobile-notification="true"]');
                    existing.forEach(function (el) { return el.remove(); });
                    // Create notification directly in DOM
                    var notification = document.createElement('div');
                    notification.setAttribute('data-mobile-notification', 'true');
                    notification.style.cssText = "\n                      position: fixed !important;\n                      top: 0 !important;\n                      left: 0 !important;\n                      right: 0 !important;\n                      bottom: 0 !important;\n                      z-index: 999999999 !important;\n                      background-color: rgba(0, 0, 0, 0.95) !important;\n                      display: flex !important;\n                      align-items: center !important;\n                      justify-content: center !important;\n                      padding: 16px !important;\n                      visibility: visible !important;\n                      opacity: 1 !important;\n                      pointer-events: auto !important;\n                    ";
                    notification.innerHTML = "\n                      <div style=\"\n                        background-color: #1a1b3a;\n                        border-radius: 16px;\n                        padding: 20px;\n                        max-width: 320px;\n                        width: 90%;\n                        border: 3px solid #10b981;\n                        color: white;\n                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);\n                        text-align: center;\n                      \">\n                        <div style=\"font-size: 20px; font-weight: bold; color: #10b981; margin-bottom: 16px;\">\n                          \uD83C\uDF89 DIRECT DOM TEST!\n                        </div>\n                        <div style=\"margin-bottom: 16px; color: #9ca3af;\">\n                          This notification was created directly in the DOM, bypassing React.\n                        </div>\n                        <button onclick=\"this.closest('[data-mobile-notification]').remove()\" style=\"\n                          background-color: #10b981;\n                          color: white;\n                          border: none;\n                          border-radius: 8px;\n                          padding: 12px 24px;\n                          font-size: 14px;\n                          font-weight: bold;\n                          cursor: pointer;\n                          width: 100%;\n                        \">\n                          Close Direct Test\n                        </button>\n                      </div>\n                    ";
                    document.body.appendChild(notification);
                    console.log('✅ Direct DOM notification created');
                }} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded font-medium text-sm mt-2">
                  🛠️ TEST DIRECT DOM
                </button>
              </div>)}

            {/* Buy Up / Buy Down Buttons */}
            {!user ? (<div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button disabled className="bg-gray-600 cursor-not-allowed text-white py-4 rounded font-medium text-lg">
                    <div>Buy Up</div>
                    <div className="text-xs mt-1">Sign in required</div>
                  </button>
                  <button disabled className="bg-gray-600 cursor-not-allowed text-white py-4 rounded font-medium text-lg">
                    <div>Buy Down</div>
                    <div className="text-xs mt-1">Sign in required</div>
                  </button>
                </div>
                <p className="text-center text-yellow-400 text-sm">
                  <a href="/login" className="underline hover:text-yellow-300">
                    Sign in to start options trading
                  </a>
                </p>
              </div>) : (!(user === null || user === void 0 ? void 0 : user.verificationStatus) || (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'unverified') && (user === null || user === void 0 ? void 0 : user.role) !== 'super_admin' ? (<div className="space-y-4">
                <div className="bg-yellow-900/50 border border-yellow-600/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-yellow-100 font-semibold mb-2">🔒 Verification Required</div>
                    <div className="text-yellow-200 text-sm mb-3">
                      Upload your verification documents to start trading
                    </div>
                    <a href="/profile" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm">
                      Upload Documents
                    </a>
                  </div>
                </div>
              </div>) : (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'pending' ? (<div className="space-y-4">
                <div className="bg-blue-900/50 border border-blue-600/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-blue-100 font-semibold mb-2">⏳ Verification Pending</div>
                    <div className="text-blue-200 text-sm">
                      Your documents are being reviewed. Trading will be enabled once approved.
                    </div>
                  </div>
                </div>
              </div>) : (<div className="grid grid-cols-2 gap-4">
                <button onClick={function () { return handleTrade('up'); }} disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded font-medium text-lg transition-colors relative">
                  <div>Buy/Up</div>
                  <div className="text-xs mt-1">
                    Profit: {getProfitPercentage(selectedDuration)}% •
                    Payout: +{(selectedAmount * getProfitPercentage(selectedDuration) / 100).toFixed(0)} USDT
                  </div>
                </button>
                <button onClick={function () { return handleTrade('down'); }} disabled={activeTrades.length >= 3 || selectedAmount < 100 || balance < selectedAmount} className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded font-medium text-lg transition-colors relative">
                  <div>Sell/Down</div>
                  <div className="text-xs mt-1">
                    Profit: {getProfitPercentage(selectedDuration)}% •
                    Payout: +{(selectedAmount * getProfitPercentage(selectedDuration) / 100).toFixed(0)} USDT
                  </div>
                </button>
              </div>)}
          </div>
        </div>

        {/* Right Panel - Trading Pairs */}
        <div className="w-80 border-l border-gray-700">
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" placeholder="Search coins (e.g. ETH, BTC, SOL)" value={searchTerm} onChange={function (e) { return handleSearchChange(e.target.value); }} className="w-full bg-[#1a1b2e] text-white pl-10 pr-4 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none text-sm"/>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 mb-4">
            <div className="flex space-x-6">
              <button className="text-gray-400 text-sm hover:text-white">Favorites</button>
              <button className="text-gray-400 text-sm hover:text-white">Spot</button>
              <button className="text-blue-400 text-sm border-b-2 border-blue-400 pb-1">Options</button>
            </div>
          </div>

          {/* Trading Pairs */}
          <div className="px-4 space-y-2 mb-6 max-h-[300px] overflow-y-auto notranslate">
            {filteredTradingPairs.length > 0 ? (filteredTradingPairs.map(function (pair, index) {
                var _a;
                var isPositive = !((_a = pair.priceChangePercent24h) === null || _a === void 0 ? void 0 : _a.startsWith('-'));
                var iconMap = {
                    'BTC': { icon: '₿', bg: 'bg-orange-500' },
                    'ETH': { icon: 'Ξ', bg: 'bg-purple-500' },
                    'BNB': { icon: 'B', bg: 'bg-yellow-600' },
                    'SOL': { icon: 'S', bg: 'bg-purple-600' },
                    'XRP': { icon: '✕', bg: 'bg-gray-600' },
                    'ADA': { icon: 'A', bg: 'bg-blue-500' },
                    'DOGE': { icon: 'D', bg: 'bg-yellow-500' },
                    'POL': { icon: 'P', bg: 'bg-purple-700' },
                    'DOT': { icon: '●', bg: 'bg-pink-500' },
                    'AVAX': { icon: 'A', bg: 'bg-red-500' },
                };
                var iconInfo = iconMap[pair.coin] || { icon: pair.coin[0], bg: 'bg-gray-500' };
                var formattedPrice = parseFloat(pair.price).toFixed(pair.price.includes('.') && parseFloat(pair.price) < 1 ? 6 : 2);
                return (<div key={index} onClick={function () { return handlePairSelect(pair.rawSymbol); }} className={"flex items-center justify-between p-2 hover:bg-[#1a1b2e] rounded cursor-pointer transition-colors ".concat(selectedSymbol === pair.rawSymbol ? 'bg-blue-600/20 border border-blue-500/30' : '')}>
                    <div className="flex items-center space-x-3">
                      <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ".concat(iconInfo.bg)}>
                        {iconInfo.icon}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{pair.symbol}</div>
                        <div className="text-gray-400 text-xs">{pair.coin}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">{formattedPrice}</div>
                      <div className={"text-xs ".concat(isPositive ? 'text-green-400' : 'text-red-400')}>
                        {pair.priceChangePercent24h}
                      </div>
                    </div>
                  </div>);
            })) : (<div className="text-center text-gray-400 py-4">
                <div className="text-sm">No coins found</div>
                <div className="text-xs mt-1">Try searching for BTC, ETH, SOL, etc.</div>
              </div>)}
          </div>

          {/* Latest Transactions */}
          <div className="border-t border-gray-700">
            <div className="px-4 py-3">
              <div className="text-white font-medium text-sm">Latest transaction</div>
            </div>

            {/* Transaction Headers */}
            <div className="px-4 py-2 border-b border-gray-700">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Time</span>
                <span>Price (USDT)</span>
                <span>Amount</span>
              </div>
            </div>

            {/* Transaction List - Using Real Trade History */}
            <div className="h-[200px] overflow-y-auto px-4 notranslate">
              <div className="space-y-1 py-2">
                {tradeHistory.length === 0 ? (<div className="flex flex-col items-center justify-center py-8">
                    <div className="text-gray-400 text-sm">No recent transactions</div>
                    <div className="text-gray-500 text-xs mt-1">Complete some trades to see transactions here</div>
                  </div>) : (tradeHistory.slice(0, 8).map(function (trade, index) {
                var marketPair = trade.symbol ? trade.symbol.replace('USDT', '/USDT') : 'BTC/USDT';
                var tradeDate = new Date(trade.endTime);
                var formattedDate = tradeDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
                var formattedTime = tradeDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                return (<div key={index} className="bg-gray-800/30 rounded px-2 py-2 mb-1.5 hover:bg-gray-800/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-xs font-medium">{marketPair}</span>
                          <span className={"text-xs font-bold ".concat(trade.status === 'won' ? 'text-green-400' : 'text-red-400')}>
                            {trade.status === 'won' ? '✓ WON' : '✗ LOST'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-2">
                            <span className={"font-medium ".concat(trade.direction === 'up' ? 'text-green-400' : 'text-red-400')}>
                              {trade.direction === 'up' ? 'BUY' : 'SELL'}
                            </span>
                            <span className="text-gray-300">{trade.amount.toFixed(0)} USDT</span>
                          </div>
                          <div className="text-gray-400 font-mono text-right">
                            <div>{formattedDate}</div>
                            <div>{formattedTime}</div>
                          </div>
                        </div>
                      </div>);
            }))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Order History Section */}
      <div className="bg-[#10121E] border-t border-gray-700 min-h-[200px]">
        {/* Tabs Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <div className="flex items-center space-x-6">
            <button onClick={function () { return setActiveTab("open"); }} className={"pb-1 text-sm font-medium ".concat(activeTab === "open"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white")}>
              Active Trades({activeTrades.length})
            </button>
            <button onClick={function () { return setActiveTab("history"); }} className={"pb-1 text-sm font-medium ".concat(activeTab === "history"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white")}>
              Trade History({tradeHistory.length})
            </button>
            {activeTab === "history" && (<button onClick={function () {
                    console.log('🔄 MANUAL REFRESH: User clicked refresh button');
                    setIsLoadingHistory(true);
                    loadTradeHistory();
                }} disabled={isLoadingHistory} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                <svg className={"w-4 h-4 ".concat(isLoadingHistory ? 'animate-spin' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span>{isLoadingHistory ? 'Refreshing...' : 'Refresh'}</span>
              </button>)}
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm text-gray-400">
              <input type="checkbox" className="mr-2"/>
              Hide other trading pairs
            </label>
            {activeTab === "history" && (<button onClick={function () {
                    console.log('🔄 Manual refresh triggered');
                    if (user === null || user === void 0 ? void 0 : user.id) {
                        var loadTradeHistory_1 = function () { return __awaiter(_this, void 0, void 0, function () {
                            var response, serverTrades, formattedTrades, error_6;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        setIsLoadingHistory(true);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 5, 6, 7]);
                                        return [4 /*yield*/, fetch("/api/users/".concat(user.id, "/trades"), {
                                                method: 'GET',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                                }
                                            })];
                                    case 2:
                                        response = _a.sent();
                                        if (!response.ok) return [3 /*break*/, 4];
                                        return [4 /*yield*/, response.json()];
                                    case 3:
                                        serverTrades = _a.sent();
                                        console.log('🔄 Refreshed trade history:', serverTrades.length);
                                        formattedTrades = serverTrades
                                            .filter(function (trade) { return trade.result && trade.result !== 'pending' && trade.status === 'completed'; })
                                            .map(function (trade) {
                                            var entryPrice = parseFloat(trade.entry_price || '0');
                                            var exitPrice = parseFloat(trade.exit_price || '0');
                                            var isWon = (trade.result === 'win');
                                            console.log("\uD83D\uDCCA Trade ".concat(trade.id, ": Entry=").concat(entryPrice, ", Exit=").concat(exitPrice, ", Status=").concat(trade.status, ", Result=").concat(trade.result));
                                            // ONLY generate exit price if it's truly missing from database (should be rare)
                                            if (!exitPrice || exitPrice === 0) {
                                                console.log("\u26A0\uFE0F Missing exit price for trade ".concat(trade.id, ", generating consistent fallback"));
                                                // Use trade ID as seed for consistent price generation
                                                var seed = parseInt(trade.id.toString().slice(-6)) || 123456;
                                                var seededRandom = (seed * 9301 + 49297) % 233280 / 233280; // Simple seeded random
                                                // Generate realistic price movement for Bitcoin (0.01% to 0.5% max for 30-60 second trades)
                                                var maxMovement = 0.005; // 0.5% maximum movement for short-term trades
                                                var minMovement = 0.0001; // 0.01% minimum movement
                                                var movementRange = maxMovement - minMovement;
                                                var movementPercent = (seededRandom * movementRange + minMovement);
                                                // Determine direction based on trade outcome and direction
                                                var priceDirection = 1; // Default up
                                                if (trade.direction === 'up') {
                                                    // For UP trades: WIN means price goes up, LOSE means price goes down
                                                    priceDirection = isWon ? 1 : -1;
                                                }
                                                else if (trade.direction === 'down') {
                                                    // For DOWN trades: WIN means price goes down, LOSE means price goes up
                                                    priceDirection = isWon ? -1 : 1;
                                                }
                                                // Calculate realistic exit price
                                                exitPrice = entryPrice * (1 + (movementPercent * priceDirection));
                                                // Ensure minimum price difference (at least $0.01 for Bitcoin)
                                                var minDifference = 0.01;
                                                if (Math.abs(exitPrice - entryPrice) < minDifference) {
                                                    exitPrice = entryPrice + (priceDirection * minDifference);
                                                }
                                                console.log("\u2705 Generated fallback exit price for trade ".concat(trade.id, ": ").concat(exitPrice));
                                            }
                                            else {
                                                console.log("\u2705 Using stored exit price for trade ".concat(trade.id, ": ").concat(exitPrice));
                                            }
                                            return {
                                                id: trade.id,
                                                symbol: trade.symbol || 'BTCUSDT',
                                                amount: parseFloat(trade.amount),
                                                direction: trade.direction,
                                                duration: trade.duration || 30,
                                                entryPrice: entryPrice,
                                                currentPrice: exitPrice, // Use calculated realistic exit price
                                                payout: isWon ? parseFloat(trade.amount) + parseFloat(trade.profit_loss || '0') : 0,
                                                status: isWon ? 'won' : 'lost',
                                                endTime: trade.updated_at || trade.created_at,
                                                startTime: trade.created_at,
                                                profit: parseFloat(trade.profit_loss || '0')
                                            };
                                        });
                                        setTradeHistory(formattedTrades);
                                        _a.label = 4;
                                    case 4: return [3 /*break*/, 7];
                                    case 5:
                                        error_6 = _a.sent();
                                        console.error('❌ Error refreshing trade history:', error_6);
                                        return [3 /*break*/, 7];
                                    case 6:
                                        setIsLoadingHistory(false);
                                        return [7 /*endfinally*/];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); };
                        loadTradeHistory_1();
                    }
                }} className="text-gray-400 hover:text-white flex items-center space-x-1" disabled={isLoadingHistory}>
                <svg className={"w-4 h-4 ".concat(isLoadingHistory ? 'animate-spin' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                <span className="text-xs">Refresh</span>
              </button>)}
            <button className="text-gray-400 hover:text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Trade Table Headers */}
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="grid grid-cols-8 gap-2 text-xs text-gray-400">
            <span className="truncate">Market/Direction</span>
            <span className="truncate text-center">Entry Price</span>
            <span className="truncate text-center">Current Price</span>
            <span className="truncate text-center">Amount</span>
            <span className="truncate text-center">Profit/Loss %</span>
            <span className="truncate text-center">P&L (USDT)</span>
            <span className="truncate text-center">Date & Time</span>
            <span className="truncate text-center">Status</span>
          </div>
        </div>

        {/* Trade Content */}
        <div className="py-2 max-h-[300px] overflow-y-auto">
          {activeTab === "open" && (<>
              {activeTrades.length === 0 ? (<div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 mb-4 opacity-50">
                    <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className="text-gray-400 text-sm">No active trades</div>
                </div>) : (activeTrades.map(function (trade) {
                    var timeRemaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
                    var priceChange = safeCurrentPrice - trade.entryPrice;
                    var isWinning = (trade.direction === 'up' && priceChange > 0) ||
                        (trade.direction === 'down' && priceChange < 0);
                    // CRITICAL FIX: For losses, show the loss percentage (10% or 15%), not the full amount
                    var getProfitPercentageByDuration = function (dur) {
                        if (dur === 30)
                            return 10;
                        else if (dur === 60)
                            return 15;
                        else if (dur === 90)
                            return 20;
                        else if (dur === 120)
                            return 25;
                        else if (dur === 180)
                            return 30;
                        else if (dur === 240)
                            return 50;
                        else if (dur === 300)
                            return 75;
                        else if (dur === 600)
                            return 100;
                        return 10; // Default
                    };
                    var lossPercentage = trade.profitPercentage || getProfitPercentageByDuration(trade.duration || 30);
                    var potentialPayout = isWinning ? (trade.amount * (1 + trade.profitPercentage / 100)) - trade.amount : -(trade.amount * lossPercentage / 100);
                    return (<div key={trade.id} className="grid grid-cols-8 gap-2 text-xs border-b border-gray-800 hover:bg-gray-800/30 max-w-full overflow-hidden px-4 trade-row">
                      <div className="flex flex-col min-w-0">
                        <span className="text-gray-400 text-xs truncate">{selectedSymbol.replace('USDT', '/USDT')}</span>
                        <span className={"font-bold truncate ".concat(trade.direction === 'up' ? 'text-green-400' : 'text-red-400')}>
                          {trade.direction === 'up' ? 'BUY' : 'SELL'}
                        </span>
                      </div>
                      <span className="text-gray-300 truncate text-center">{trade.entryPrice.toFixed(2)}</span>
                      <span className="text-white truncate text-center">{currentPrice.toFixed(2)}</span>
                      <span className="text-gray-300 truncate text-center">{trade.amount}</span>
                      <span className="text-gray-300 truncate text-center">{trade.profitPercentage}%</span>
                      <span className={"font-bold truncate text-center ".concat(isWinning ? 'text-green-400' : 'text-red-400')}>
                        {potentialPayout > 0 ? '+' : ''}{potentialPayout.toFixed(2)}
                      </span>
                      <span className="text-yellow-400 font-bold truncate text-center notranslate">{timeRemaining}s</span>
                      <span className={"font-bold truncate text-center ".concat(isWinning ? 'text-green-400' : 'text-red-400')}>
                        {isWinning ? '🟢' : '🔴'}
                      </span>
                    </div>);
                }))}
            </>)}

          {activeTab === "history" && (<>
              {isLoadingHistory ? (<div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 mb-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-gray-400 text-sm">Loading trade history...</div>
                </div>) : tradeHistory.length === 0 ? (<div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 mb-4 opacity-50">
                    <svg viewBox="0 0 64 64" className="w-full h-full text-gray-600">
                      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <path d="M32 16v16l8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <div className="text-gray-400 text-sm">No trade history</div>
                  <div className="text-gray-500 text-xs mt-2">Complete some trades to see your history here</div>
                </div>) : (<>
                  {/* Trade History Table */}
                  <div className="mb-6">
                    {tradeHistory.map(function (trade) {
                        var _a;
                        // Calculate P&L correctly: For wins show profit amount, for losses show negative amount
                        // Get correct profit percentage based on duration
                        var getProfitPercentageByDuration = function (duration) {
                            if (duration === 30)
                                return 10;
                            else if (duration === 60)
                                return 15;
                            else if (duration === 90)
                                return 20;
                            else if (duration === 120)
                                return 25;
                            else if (duration === 180)
                                return 30;
                            else if (duration === 240)
                                return 50;
                            else if (duration === 300)
                                return 75;
                            else if (duration === 600)
                                return 100;
                            return 10; // Default
                        };
                        var profitPercentage = getProfitPercentageByDuration(trade.duration || 30);
                        var pnl = trade.profit !== undefined ? trade.profit :
                            (trade.status === 'won' ?
                                (trade.amount * profitPercentage / 100) : // Show profit amount for wins
                                -trade.amount); // Show negative amount for losses
                        var endTime = new Date(trade.endTime).toLocaleTimeString();
                        // Format market pair and date/time
                        var marketPair = trade.symbol ? trade.symbol.replace('USDT', '/USDT') : 'BTC/USDT';
                        var fullDateTime = new Date(trade.endTime).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                        return (<div key={trade.id} className="grid grid-cols-8 gap-2 text-xs border-b border-gray-800 hover:bg-gray-800/30 max-w-full overflow-hidden px-4 trade-row">
                          <div className="flex flex-col min-w-0">
                            <span className="text-gray-400 text-xs truncate">{marketPair}</span>
                            <span className={"font-bold truncate ".concat(trade.direction === 'up' ? 'text-green-400' : 'text-red-400')}>
                              {trade.direction === 'up' ? 'BUY' : 'SELL'}
                            </span>
                          </div>
                          <span className="text-gray-300 text-center">{trade.entryPrice.toFixed(2)}</span>
                          <span className="text-gray-300 text-center">{((_a = trade.currentPrice) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || 'N/A'}</span>
                          <span className="text-gray-300 text-center">{trade.amount}</span>
                          <span className="text-gray-300 text-center">{profitPercentage}%</span>
                          <span className={"font-bold text-center ".concat(trade.status === 'won' ? 'text-green-400' : 'text-red-400')}>
                            {trade.status === 'won' ? '+' : ''}{pnl.toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-xs text-center">{new Date(trade.endTime).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          <span className={"font-bold text-center ".concat(trade.status === 'won' ? 'text-green-400' : 'text-red-400')}>
                            {trade.status === 'won' ? 'WIN' : 'LOSE'}
                          </span>
                        </div>);
                    })}
                  </div>


                </>)}
            </>)}
        </div>
      </div>

      <Footer />







      {/* DEBUG: Test Mobile Notification Button - REMOVE IN PRODUCTION */}
      {process.env.NODE_ENV === 'development' && (<button onClick={function () {
                    console.log('🧪 DEBUG: Manual notification trigger');
                    var testTrade = {
                        id: 'manual-test-' + Date.now(),
                        direction: 'up',
                        amount: 100,
                        entryPrice: 50000,
                        currentPrice: 51000,
                        status: 'won',
                        payout: 110,
                        profitPercentage: 10
                    };
                    triggerNotification(testTrade);
                }} style={{
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                }}>
          Test Mobile Notification
        </button>)}

      {/* Trade Notification */}
      {completedTrade && console.log('🔔 RENDER: Desktop notification with completedTrade:', {
                id: completedTrade.id,
                amount: completedTrade.amount,
                duration: completedTrade.duration,
                status: completedTrade.status,
                entryPrice: completedTrade.entryPrice,
                currentPrice: completedTrade.currentPrice,
                profit: completedTrade.profit,
                profitPercentage: completedTrade.profitPercentage,
                fullObject: JSON.stringify(completedTrade)
            })}
      <TradeNotification key={notificationKey} // Force re-render with unique key
         trade={completedTrade ? {
                id: completedTrade.id,
                direction: completedTrade.direction,
                amount: completedTrade.amount,
                entryPrice: completedTrade.entryPrice,
                finalPrice: completedTrade.currentPrice || completedTrade.entryPrice,
                status: completedTrade.status,
                payout: completedTrade.payout || (completedTrade.status === 'won' ?
                    completedTrade.amount + (completedTrade.amount * (completedTrade.profitPercentage || 10) / 100) :
                    0),
                profitPercentage: completedTrade.profitPercentage || 10,
                profit: completedTrade.profit, // CRITICAL: Pass profit field for accurate P&L display
                symbol: completedTrade.symbol || 'BTC/USDT', // Use symbol from completed trade, not current selection
                duration: completedTrade.duration || 30 // Use duration from completed trade, not current selection
            } : null} onClose={function () {
                console.log('🔔 NOTIFICATION: onClose called');
                setCompletedTrade(null);
                localStorage.removeItem('completedTrade');
            }}/>

      {/* Mobile Trade Modal */}
      {isMobileModalOpen && mobileTradeData && (<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-5 z-[999999]" onClick={function () {
                    setIsMobileModalOpen(false);
                    document.body.style.overflow = 'auto';
                }}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full text-white relative" onClick={function (e) { return e.stopPropagation(); }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div className="text-lg font-bold">{mobileTradeData.symbol}</div>
              <button onClick={function () {
                    setIsMobileModalOpen(false);
                    document.body.style.overflow = 'auto';
                }} className="bg-transparent border-0 text-white text-2xl cursor-pointer p-0 w-6 h-6">
                ×
              </button>
            </div>

            {/* PnL */}
            <div className="text-center mb-5">
              <div className={"text-4xl font-bold mb-2 ".concat(mobileTradeData.pnl >= 0 ? 'text-green-400' : 'text-red-400')}>
                {mobileTradeData.pnl >= 0 ? '+' : ''}{mobileTradeData.pnl.toFixed(0)} USDT
              </div>
              <div className="text-gray-400 text-base">Settlement completed</div>
            </div>

            {/* Details */}
            <div className="mb-5">
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Current price :</span>
                <span>{mobileTradeData.currentPrice}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Time :</span>
                <span>{mobileTradeData.duration}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Side :</span>
                <span className={mobileTradeData.side === 'Buy Up' ? 'text-green-400' : 'text-red-400'}>
                  {mobileTradeData.side}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Amount :</span>
                <span>{mobileTradeData.amount} USDT</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-gray-400">Price :</span>
                <span>{mobileTradeData.price.toFixed(2)} USDT</span>
              </div>
            </div>

            {/* Footer text */}
            <div className="text-gray-400 text-sm leading-relaxed">
              The ultimate price for each option contract is determined by the system's settlement process.
            </div>
          </div>
        </div>)}
    </div>);
    }
    catch (error) {
        console.error('OptionsPage render error:', error);
        return (<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️ Trading Page Error</div>
          <div className="text-gray-300 mb-4">Something went wrong. Please refresh the page.</div>
          <button onClick={function () { return window.location.reload(); }} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
            Refresh Page
          </button>
        </div>
      </div>);
    }
}
// Main component with dynamic PriceProvider
export default function OptionsPage() {
    return <OptionsPageWithProvider />;
}
// Component that manages symbol state and provides it to PriceProvider
function OptionsPageWithProvider() {
    var _a = useState('BTCUSDT'), selectedSymbol = _a[0], setSelectedSymbol = _a[1];
    return (<>
      <style>{"\n        .trade-row {\n          padding-top: 0.75rem;\n          padding-bottom: 0.75rem;\n          padding-right: 10px;\n        }\n      "}</style>
      <PriceProvider symbol={selectedSymbol} updateInterval={2000}>
        <OptionsPageContent selectedSymbol={selectedSymbol} setSelectedSymbol={setSelectedSymbol}/>
      </PriceProvider>
    </>);
}
