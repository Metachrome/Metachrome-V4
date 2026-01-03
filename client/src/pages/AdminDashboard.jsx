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
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from '../components/admin/NotificationBell';
import ChatManagement from '../components/admin/ChatManagement';
import ChatNotificationBadge from '../components/admin/ChatNotificationBadge';
import ActivityLogsContent from '../components/admin/ActivityLogsContent';
import { Users, TrendingUp, DollarSign, Activity, Settings, Shield, Eye, EyeOff, Edit, Plus, BarChart3, MessageSquare, CheckCircle, XCircle, ArrowUp, ArrowDown, Target, Trash2, FileCheck, Gift, PlayCircle, Minus, Key, Wallet } from 'lucide-react';
// Helper function to safely parse balance values
var parseBalance = function (balance) {
    if (typeof balance === 'number') {
        return balance;
    }
    if (typeof balance === 'string') {
        // Remove any formatting and parse as float
        var cleaned = balance.replace(/[^0-9.-]/g, '');
        var parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};
// Helper function to format balance for display
var formatBalance = function (balance) {
    var numericBalance = parseBalance(balance);
    // Round to 2 decimal places to avoid floating point precision issues
    var rounded = Math.round(numericBalance * 100) / 100;
    return rounded.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};
// Helper function to calculate total balance safely
var calculateTotalBalance = function (users) {
    return users.reduce(function (sum, user) {
        var balance = parseBalance(user.balance);
        return sum + balance;
    }, 0);
};
// Helper function to calculate total portfolio value (USDT only with auto-conversion)
var calculateTotalPortfolioValue = function (users) {
    return users.reduce(function (sum, user) {
        var usdtBalance = parseBalance(user.balance);
        // All crypto is auto-converted to USDT, so total = USDT balance
        return sum + usdtBalance;
    }, 0);
};
// Helper function to extract currency from transaction description
var extractCurrencyFromDescription = function (transaction) {
    if (transaction.symbol)
        return transaction.symbol;
    if (transaction.currency)
        return transaction.currency;
    // Parse currency from description for withdrawals
    if (transaction.type === 'withdrawal' && transaction.description) {
        var match = transaction.description.match(/- (BTC|ETH|USDT|SOL|USDT-ERC20|USDT-TRC20|USDT-BEP20)/);
        if (match)
            return match[1];
    }
    // Default to USDT for other transactions
    return 'USDT';
};
// Helper function to format transaction amount with currency
var formatTransactionAmount = function (transaction) {
    var currency = extractCurrencyFromDescription(transaction);
    // Convert to number if it's a string, then format
    var amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
    return "".concat(amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }), " ").concat(currency);
};
export default function WorkingAdminDashboard() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f;
    var user = useAuth().user;
    var _g = useState([]), users = _g[0], setUsers = _g[1];
    var _h = useState([]), trades = _h[0], setTrades = _h[1];
    var _j = useState([]), transactions = _j[0], setTransactions = _j[1];
    var _k = useState({ deposits: [], withdrawals: [], total: 0 }), pendingRequests = _k[0], setPendingRequests = _k[1];
    var _l = useState(null), systemStats = _l[0], setSystemStats = _l[1];
    var _m = useState(false), loading = _m[0], setLoading = _m[1];
    var _o = useState([]), pendingVerifications = _o[0], setPendingVerifications = _o[1];
    var _p = useState(null), verificationStats = _p[0], setVerificationStats = _p[1];
    var _q = useState([]), redeemCodes = _q[0], setRedeemCodes = _q[1];
    var _r = useState(null), redeemStats = _r[0], setRedeemStats = _r[1];
    var _s = useState(false), showCreateCodeModal = _s[0], setShowCreateCodeModal = _s[1];
    var _t = useState(false), showEditCodeModal = _t[0], setShowEditCodeModal = _t[1];
    var _u = useState(null), editingCode = _u[0], setEditingCode = _u[1];
    var _v = useState({
        code: '',
        bonusAmount: '',
        maxUses: '',
        description: ''
    }), newRedeemCode = _v[0], setNewRedeemCode = _v[1];
    var _w = useState({
        username: '',
        email: '',
        password: '',
        balance: 10000,
        role: 'user',
        trading_mode: 'normal'
    }), newUser = _w[0], setNewUser = _w[1];
    // Super Admin specific states
    var _x = useState(false), showDepositModal = _x[0], setShowDepositModal = _x[1];
    var _y = useState(false), showWithdrawalModal = _y[0], setShowWithdrawalModal = _y[1];
    var _z = useState(false), showPasswordModal = _z[0], setShowPasswordModal = _z[1];
    var _0 = useState(false), showWalletModal = _0[0], setShowWalletModal = _0[1];
    var _1 = useState(null), selectedUserForAction = _1[0], setSelectedUserForAction = _1[1];
    var _2 = useState(''), depositAmount = _2[0], setDepositAmount = _2[1];
    var _3 = useState(''), withdrawalAmount = _3[0], setWithdrawalAmount = _3[1];
    var _4 = useState(''), newPassword = _4[0], setNewPassword = _4[1];
    var _5 = useState(''), newWalletAddress = _5[0], setNewWalletAddress = _5[1];
    var _6 = useState([]), walletHistory = _6[0], setWalletHistory = _6[1];
    // Receipt viewer state
    var _7 = useState(null), selectedReceipt = _7[0], setSelectedReceipt = _7[1];
    // Search and filter states
    var _8 = useState(''), userSearchTerm = _8[0], setUserSearchTerm = _8[1];
    var _9 = useState('overview'), activeTab = _9[0], setActiveTab = _9[1];
    // Password visibility state - track which user passwords are visible
    var _10 = useState(new Set()), visiblePasswords = _10[0], setVisiblePasswords = _10[1];
    // Real-time polling states
    var _11 = useState(true), isPolling = _11[0], setIsPolling = _11[1];
    var _12 = useState(new Date()), lastUpdateTime = _12[0], setLastUpdateTime = _12[1];
    var _13 = useState(false), hasNewData = _13[0], setHasNewData = _13[1];
    // Get current user role - with fallback for admin access
    var currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    var authToken = localStorage.getItem('authToken') || '';
    // Check if user is super admin through multiple methods
    var isSuperAdmin = currentUser.role === 'super_admin' ||
        currentUser.role === 'superadmin' ||
        currentUser.username === 'superadmin' ||
        authToken.includes('superadmin') ||
        authToken.includes('admin-session-superadmin');
    console.log('🔧 Current user:', currentUser);
    console.log('🔧 Auth token:', authToken.substring(0, 30) + '...');
    console.log('🔧 Current user role:', currentUser.role);
    console.log('🔧 Is Super Admin:', isSuperAdmin);
    console.log('🔧 Role check details:', {
        role: currentUser.role,
        username: currentUser.username,
        isSuper: currentUser.role === 'super_admin',
        isSuperadmin: currentUser.role === 'superadmin',
        isUsernameSuper: currentUser.username === 'superadmin',
        tokenHasSuper: authToken.includes('superadmin'),
        tokenHasAdminSession: authToken.includes('admin-session-superadmin'),
        finalResult: isSuperAdmin
    });
    // Force refresh transactions with aggressive cache busting
    var forceRefreshTransactions = function () { return __awaiter(_this, void 0, void 0, function () {
        var cacheNames, timestamp, randomId, superRandomId, url, transactionsRes, transactionsData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log('🔄 FORCE refreshing transactions with aggressive cache busting...');
                    if (!('serviceWorker' in navigator && 'caches' in window)) return [3 /*break*/, 3];
                    return [4 /*yield*/, caches.keys()];
                case 1:
                    cacheNames = _a.sent();
                    return [4 /*yield*/, Promise.all(cacheNames.map(function (name) { return caches.delete(name); }))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    timestamp = Date.now();
                    randomId = Math.random().toString(36).substring(7);
                    superRandomId = Math.random().toString(36).substring(2, 15);
                    url = "/api/admin/transactions?_t=".concat(timestamp, "&_r=").concat(randomId, "&_bust=").concat(Date.now(), "&_force=").concat(superRandomId, "&_nocache=").concat(Math.random());
                    console.log('🔄 Force fetching from URL:', url);
                    return [4 /*yield*/, fetch(url, {
                            method: 'GET',
                            headers: {
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0',
                                'X-Requested-With': 'XMLHttpRequest',
                                'If-None-Match': '*',
                                'X-Force-Refresh': 'true'
                            },
                            cache: 'no-store'
                        })];
                case 4:
                    transactionsRes = _a.sent();
                    if (!transactionsRes.ok) return [3 /*break*/, 6];
                    return [4 /*yield*/, transactionsRes.json()];
                case 5:
                    transactionsData = _a.sent();
                    console.log('💰 FORCE refreshed transactions:', transactionsData.length, 'transactions');
                    console.log('💰 First 3 transaction IDs:', transactionsData.slice(0, 3).map(function (t) { return t.id; }));
                    // Force React to re-render by creating a new array reference
                    setTransactions(__spreadArray([], transactionsData, true));
                    return [2 /*return*/, true];
                case 6:
                    console.error('❌ Failed to force refresh transactions:', transactionsRes.status);
                    return [2 /*return*/, false];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error('❌ Force refresh error:', error_1);
                    return [2 /*return*/, false];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Refresh transactions only
    var refreshTransactions = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, forceRefreshTransactions()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    // Fetch all data with improved error handling
    var fetchData = function () { return __awaiter(_this, void 0, void 0, function () {
        var hasErrors, timestamp, cacheHeaders, usersRes, usersData, error_2, tradesRes, tradesData, tradesArray, error_3, transactionsRes, transactionsData, error_4, statsRes, statsData, error_5, pendingRes, pendingData, error_6, verificationsRes, verificationsData, totalDocs, stats, stats, fallbackRes, fallbackData, stats, fallbackError_1, error_7, redeemCodesRes, redeemCodesData, codesWithHistory, historyRes, historyData, allRedemptions_1, historyError_1, error_8, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    hasErrors = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 56, 57, 58]);
                    console.log('🔄 Fetching all data...');
                    timestamp = Date.now();
                    cacheHeaders = {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    };
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, fetch("/api/admin/users?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 3:
                    usersRes = _a.sent();
                    if (!usersRes.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, usersRes.json()];
                case 4:
                    usersData = _a.sent();
                    console.log('👥 Users loaded:', usersData);
                    // Debug: Check if password field exists
                    if (usersData.length > 0) {
                        console.log('🔍 First user password check:', {
                            hasPassword: !!usersData[0].password,
                            passwordValue: usersData[0].password,
                            passwordType: typeof usersData[0].password
                        });
                    }
                    setUsers(usersData);
                    return [3 /*break*/, 6];
                case 5:
                    console.error('❌ Failed to fetch users:', usersRes.status);
                    hasErrors = true;
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.error('❌ Users fetch error:', error_2);
                    hasErrors = true;
                    return [3 /*break*/, 8];
                case 8:
                    _a.trys.push([8, 13, , 14]);
                    return [4 /*yield*/, fetch("/api/admin/live-trades?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 9:
                    tradesRes = _a.sent();
                    if (!tradesRes.ok) return [3 /*break*/, 11];
                    return [4 /*yield*/, tradesRes.json()];
                case 10:
                    tradesData = _a.sent();
                    console.log('🔴 Live trades loaded:', tradesData);
                    tradesArray = tradesData.trades || tradesData;
                    setTrades(tradesArray);
                    return [3 /*break*/, 12];
                case 11:
                    console.error('❌ Failed to fetch trades:', tradesRes.status);
                    hasErrors = true;
                    _a.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_3 = _a.sent();
                    console.error('❌ Trades fetch error:', error_3);
                    hasErrors = true;
                    return [3 /*break*/, 14];
                case 14:
                    _a.trys.push([14, 19, , 20]);
                    return [4 /*yield*/, fetch("/api/admin/transactions?_t=".concat(timestamp, "&_r=").concat(Math.random()), {
                            headers: __assign(__assign({}, cacheHeaders), { 'X-Requested-With': 'XMLHttpRequest', 'If-None-Match': '*' })
                        })];
                case 15:
                    transactionsRes = _a.sent();
                    if (!transactionsRes.ok) return [3 /*break*/, 17];
                    return [4 /*yield*/, transactionsRes.json()];
                case 16:
                    transactionsData = _a.sent();
                    console.log('💰 Transactions loaded:', transactionsData.length, 'transactions');
                    setTransactions(transactionsData);
                    return [3 /*break*/, 18];
                case 17:
                    console.error('❌ Failed to fetch transactions:', transactionsRes.status);
                    hasErrors = true;
                    _a.label = 18;
                case 18: return [3 /*break*/, 20];
                case 19:
                    error_4 = _a.sent();
                    console.error('❌ Transactions fetch error:', error_4);
                    hasErrors = true;
                    return [3 /*break*/, 20];
                case 20:
                    _a.trys.push([20, 25, , 26]);
                    return [4 /*yield*/, fetch("/api/admin/stats?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 21:
                    statsRes = _a.sent();
                    if (!statsRes.ok) return [3 /*break*/, 23];
                    return [4 /*yield*/, statsRes.json()];
                case 22:
                    statsData = _a.sent();
                    console.log('📊 Stats loaded:', statsData);
                    setSystemStats(statsData);
                    return [3 /*break*/, 24];
                case 23:
                    console.error('❌ Failed to fetch stats:', statsRes.status);
                    hasErrors = true;
                    _a.label = 24;
                case 24: return [3 /*break*/, 26];
                case 25:
                    error_5 = _a.sent();
                    console.error('❌ Stats fetch error:', error_5);
                    hasErrors = true;
                    return [3 /*break*/, 26];
                case 26:
                    _a.trys.push([26, 31, , 32]);
                    return [4 /*yield*/, fetch("/api/admin/pending-requests?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 27:
                    pendingRes = _a.sent();
                    if (!pendingRes.ok) return [3 /*break*/, 29];
                    return [4 /*yield*/, pendingRes.json()];
                case 28:
                    pendingData = _a.sent();
                    console.log('🔔 Pending requests loaded:', pendingData);
                    setPendingRequests(pendingData);
                    return [3 /*break*/, 30];
                case 29:
                    console.error('❌ Failed to fetch pending requests:', pendingRes.status);
                    hasErrors = true;
                    _a.label = 30;
                case 30: return [3 /*break*/, 32];
                case 31:
                    error_6 = _a.sent();
                    console.error('❌ Pending requests fetch error:', error_6);
                    hasErrors = true;
                    return [3 /*break*/, 32];
                case 32:
                    _a.trys.push([32, 42, , 43]);
                    return [4 /*yield*/, fetch("/api/admin/pending-verifications-enhanced?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 33:
                    verificationsRes = _a.sent();
                    if (!verificationsRes.ok) return [3 /*break*/, 35];
                    return [4 /*yield*/, verificationsRes.json()];
                case 34:
                    verificationsData = _a.sent();
                    console.log('📄 Enhanced pending verifications loaded:', verificationsData);
                    // Use the enhanced response format
                    if (verificationsData.enhanced) {
                        setPendingVerifications(verificationsData.pending || []);
                        console.log("\uD83D\uDCC4 Set ".concat(verificationsData.pendingCount || 0, " pending verifications"));
                        console.log("\uD83D\uDCC4 Total documents in database: ".concat(verificationsData.totalCount || 0));
                        totalDocs = verificationsData.total || [];
                        stats = {
                            pending: totalDocs.filter(function (v) { return v.verification_status === 'pending'; }).length,
                            approved: totalDocs.filter(function (v) { return v.verification_status === 'approved'; }).length,
                            rejected: totalDocs.filter(function (v) { return v.verification_status === 'rejected'; }).length,
                            total: totalDocs.length
                        };
                        setVerificationStats(stats);
                    }
                    else {
                        // Fallback to regular response format
                        setPendingVerifications(verificationsData);
                        stats = {
                            pending: verificationsData.filter(function (v) { return v.verification_status === 'pending'; }).length,
                            approved: verificationsData.filter(function (v) { return v.verification_status === 'approved'; }).length,
                            rejected: verificationsData.filter(function (v) { return v.verification_status === 'rejected'; }).length,
                            total: verificationsData.length
                        };
                        setVerificationStats(stats);
                    }
                    return [3 /*break*/, 41];
                case 35:
                    console.error('❌ Failed to fetch enhanced pending verifications:', verificationsRes.status);
                    _a.label = 36;
                case 36:
                    _a.trys.push([36, 40, , 41]);
                    return [4 /*yield*/, fetch("/api/admin/pending-verifications?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 37:
                    fallbackRes = _a.sent();
                    if (!fallbackRes.ok) return [3 /*break*/, 39];
                    return [4 /*yield*/, fallbackRes.json()];
                case 38:
                    fallbackData = _a.sent();
                    setPendingVerifications(fallbackData);
                    stats = {
                        pending: fallbackData.filter(function (v) { return v.verification_status === 'pending'; }).length,
                        approved: fallbackData.filter(function (v) { return v.verification_status === 'approved'; }).length,
                        rejected: fallbackData.filter(function (v) { return v.verification_status === 'rejected'; }).length,
                        total: fallbackData.length
                    };
                    setVerificationStats(stats);
                    _a.label = 39;
                case 39: return [3 /*break*/, 41];
                case 40:
                    fallbackError_1 = _a.sent();
                    console.error('❌ Fallback verification fetch error:', fallbackError_1);
                    hasErrors = true;
                    return [3 /*break*/, 41];
                case 41: return [3 /*break*/, 43];
                case 42:
                    error_7 = _a.sent();
                    console.error('❌ Enhanced pending verifications fetch error:', error_7);
                    hasErrors = true;
                    return [3 /*break*/, 43];
                case 43:
                    _a.trys.push([43, 54, , 55]);
                    return [4 /*yield*/, fetch("/api/admin/redeem-codes?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 44:
                    redeemCodesRes = _a.sent();
                    if (!redeemCodesRes.ok) return [3 /*break*/, 52];
                    return [4 /*yield*/, redeemCodesRes.json()];
                case 45:
                    redeemCodesData = _a.sent();
                    console.log('🎁 Redeem codes loaded:', redeemCodesData);
                    codesWithHistory = redeemCodesData.codes || [];
                    _a.label = 46;
                case 46:
                    _a.trys.push([46, 50, , 51]);
                    return [4 /*yield*/, fetch("/api/admin/redeem-codes-usage-all?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 47:
                    historyRes = _a.sent();
                    if (!historyRes.ok) return [3 /*break*/, 49];
                    return [4 /*yield*/, historyRes.json()];
                case 48:
                    historyData = _a.sent();
                    allRedemptions_1 = historyData.data || [];
                    // Group redemptions by code
                    codesWithHistory = codesWithHistory.map(function (code) { return (__assign(__assign({}, code), { redemptions: allRedemptions_1.filter(function (r) { return r.code === code.code; }) })); });
                    console.log('🎁 Codes with redemption history:', codesWithHistory);
                    _a.label = 49;
                case 49: return [3 /*break*/, 51];
                case 50:
                    historyError_1 = _a.sent();
                    console.log('⚠️ Could not fetch redemption history:', historyError_1);
                    return [3 /*break*/, 51];
                case 51:
                    setRedeemCodes(codesWithHistory);
                    setRedeemStats(redeemCodesData.stats || {});
                    return [3 /*break*/, 53];
                case 52:
                    console.error('❌ Failed to fetch redeem codes:', redeemCodesRes.status);
                    hasErrors = true;
                    _a.label = 53;
                case 53: return [3 /*break*/, 55];
                case 54:
                    error_8 = _a.sent();
                    console.error('❌ Redeem codes fetch error:', error_8);
                    hasErrors = true;
                    return [3 /*break*/, 55];
                case 55:
                    // Only show error if there were actual failures
                    if (hasErrors) {
                        toast({
                            title: "Warning",
                            description: "Some data failed to load. Check console for details.",
                            variant: "destructive"
                        });
                    }
                    else {
                        console.log('✅ All data loaded successfully');
                    }
                    return [3 /*break*/, 58];
                case 56:
                    error_9 = _a.sent();
                    console.error('❌ Unexpected error fetching data:', error_9);
                    toast({
                        title: "Error",
                        description: "Unexpected error occurred while loading data",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 58];
                case 57:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 58: return [2 /*return*/];
            }
        });
    }); };
    // Silent background fetch (no loading state, no error toasts)
    var silentFetchData = function () { return __awaiter(_this, void 0, void 0, function () {
        var timestamp, cacheHeaders, hasNewData_1, usersRes, usersData, error_10, pendingRes, pendingData, error_11, transactionsRes, transactionsData, error_12, tradesRes, tradesData, tradesArray, error_13, error_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 22, , 23]);
                    timestamp = Date.now();
                    cacheHeaders = {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    };
                    hasNewData_1 = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/admin/users?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 2:
                    usersRes = _a.sent();
                    if (!usersRes.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, usersRes.json()];
                case 3:
                    usersData = _a.sent();
                    if (JSON.stringify(usersData) !== JSON.stringify(users)) {
                        setUsers(usersData);
                        hasNewData_1 = true;
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_10 = _a.sent();
                    console.log('⚠️ Silent users fetch failed');
                    return [3 /*break*/, 6];
                case 6:
                    _a.trys.push([6, 10, , 11]);
                    return [4 /*yield*/, fetch("/api/admin/pending-requests?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 7:
                    pendingRes = _a.sent();
                    if (!pendingRes.ok) return [3 /*break*/, 9];
                    return [4 /*yield*/, pendingRes.json()];
                case 8:
                    pendingData = _a.sent();
                    if (JSON.stringify(pendingData) !== JSON.stringify(pendingRequests)) {
                        setPendingRequests(pendingData);
                        hasNewData_1 = true;
                    }
                    _a.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_11 = _a.sent();
                    console.log('⚠️ Silent pending requests fetch failed');
                    return [3 /*break*/, 11];
                case 11:
                    _a.trys.push([11, 15, , 16]);
                    return [4 /*yield*/, fetch("/api/admin/transactions?_t=".concat(timestamp, "&_r=").concat(Math.random()), {
                            headers: __assign(__assign({}, cacheHeaders), { 'X-Requested-With': 'XMLHttpRequest', 'If-None-Match': '*' })
                        })];
                case 12:
                    transactionsRes = _a.sent();
                    if (!transactionsRes.ok) return [3 /*break*/, 14];
                    return [4 /*yield*/, transactionsRes.json()];
                case 13:
                    transactionsData = _a.sent();
                    if (JSON.stringify(transactionsData) !== JSON.stringify(transactions)) {
                        setTransactions(transactionsData);
                        hasNewData_1 = true;
                    }
                    _a.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_12 = _a.sent();
                    console.log('⚠️ Silent transactions fetch failed');
                    return [3 /*break*/, 16];
                case 16:
                    _a.trys.push([16, 20, , 21]);
                    return [4 /*yield*/, fetch("/api/admin/live-trades?_t=".concat(timestamp), {
                            headers: cacheHeaders
                        })];
                case 17:
                    tradesRes = _a.sent();
                    if (!tradesRes.ok) return [3 /*break*/, 19];
                    return [4 /*yield*/, tradesRes.json()];
                case 18:
                    tradesData = _a.sent();
                    tradesArray = tradesData.trades || tradesData;
                    if (JSON.stringify(tradesArray) !== JSON.stringify(trades)) {
                        setTrades(tradesArray);
                        hasNewData_1 = true;
                    }
                    _a.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    error_13 = _a.sent();
                    console.log('⚠️ Silent trades fetch failed');
                    return [3 /*break*/, 21];
                case 21:
                    // Update last update time silently if new data
                    if (hasNewData_1) {
                        setLastUpdateTime(new Date());
                        setHasNewData(true);
                        // Auto-hide notification after 5 seconds
                        setTimeout(function () { return setHasNewData(false); }, 5000);
                    }
                    return [3 /*break*/, 23];
                case 22:
                    error_14 = _a.sent();
                    console.log('⚠️ Silent fetch error:', error_14);
                    return [3 /*break*/, 23];
                case 23: return [2 /*return*/];
            }
        });
    }); };
    // Create new user
    var createUser = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, userData, error_15;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!newUser.username || !newUser.email || !newUser.password) {
                        toast({
                            title: "Error",
                            description: "Please fill in all required fields",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    console.log('👤 Creating user:', newUser);
                    return [4 /*yield*/, fetch('/api/admin/users', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(newUser)
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    userData = _a.sent();
                    console.log('✅ User created:', userData);
                    toast({
                        title: "Success",
                        description: "User ".concat(userData.username, " created successfully!")
                    });
                    // Reset form
                    setNewUser({
                        username: '',
                        email: '',
                        password: '',
                        balance: 10000,
                        role: 'user',
                        trading_mode: 'normal'
                    });
                    // Refresh data
                    fetchData();
                    return [3 /*break*/, 5];
                case 4: throw new Error('Failed to create user');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_15 = _a.sent();
                    console.error('❌ Error creating user:', error_15);
                    toast({
                        title: "Error",
                        description: "Failed to create user",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Update trading mode
    var updateTradingMode = function (userId, mode) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_16;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('🎯 Updating trading mode:', userId, mode);
                    return [4 /*yield*/, fetch('/api/admin/trading-controls', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ userId: userId, controlType: mode })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    console.log('✅ Trading mode updated:', result);
                    toast({
                        title: "Success",
                        description: "Trading mode updated to ".concat(mode.toUpperCase()),
                        duration: 2000
                    });
                    // Update local state immediately for instant UI feedback
                    setUsers(function (prevUsers) { return prevUsers.map(function (user) {
                        return user.id === userId ? __assign(__assign({}, user), { trading_mode: mode }) : user;
                    }); });
                    // Don't call fetchData() immediately to avoid overriding the local state
                    // The auto-refresh will pick up any server-side changes in 5 seconds
                    console.log("\uD83C\uDFAF Trading mode for user ".concat(userId, " updated to ").concat(mode.toUpperCase(), " in UI"));
                    return [3 /*break*/, 4];
                case 3: throw new Error('Failed to update trading mode');
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_16 = _a.sent();
                    console.error('❌ Error updating trading mode:', error_16);
                    toast({
                        title: "Error",
                        description: "Failed to update trading mode",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Manual trade control
    var controlTrade = function (tradeId, action) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('🎮 Controlling trade:', tradeId, action);
                    return [4 /*yield*/, fetch("/api/admin/trades/".concat(tradeId, "/control"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ action: action })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    console.log('✅ Trade controlled:', result);
                    toast({
                        title: "Trade Controlled",
                        description: "Trade set to ".concat(action.toUpperCase())
                    });
                    // Update local state
                    setTrades(trades.map(function (trade) {
                        return trade.id === tradeId ? __assign(__assign({}, trade), { result: action }) : trade;
                    }));
                    // Refresh data
                    fetchData();
                    return [3 /*break*/, 4];
                case 3: throw new Error('Failed to control trade');
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_17 = _a.sent();
                    console.error('❌ Error controlling trade:', error_17);
                    toast({
                        title: "Error",
                        description: "Failed to control trade",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Delete trade function
    var deleteTrade = function (tradeId) { return __awaiter(_this, void 0, void 0, function () {
        var originalTrades, response, result, error, error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('🗑️ Deleting trade:', tradeId);
                    originalTrades = __spreadArray([], trades, true);
                    setTrades(function (prev) { return prev.filter(function (t) { return t.id !== tradeId; }); });
                    return [4 /*yield*/, fetch("/api/admin/trades/".concat(tradeId), {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    console.log('✅ Trade deleted:', result);
                    toast({
                        title: "Trade Deleted",
                        description: result.message || "Trade deleted successfully",
                        duration: 3000
                    });
                    // Refresh data to ensure consistency
                    fetchData();
                    return [3 /*break*/, 5];
                case 3:
                    // If deletion failed, restore original state
                    console.log('🗑️ Delete failed, restoring original state...');
                    setTrades(originalTrades);
                    return [4 /*yield*/, response.text()];
                case 4:
                    error = _a.sent();
                    throw new Error(error || 'Failed to delete trade');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_18 = _a.sent();
                    console.error('❌ Error deleting trade:', error_18);
                    // Restore original state on error
                    setTrades(function (prev) { return __spreadArray([], trades, true); });
                    toast({
                        title: "Error",
                        description: error_18 instanceof Error ? error_18.message : "Failed to delete trade",
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Modal state
    var _14 = useState(false), showUserModal = _14[0], setShowUserModal = _14[1];
    var _15 = useState(false), showEditModal = _15[0], setShowEditModal = _15[1];
    var _16 = useState(null), selectedUser = _16[0], setSelectedUser = _16[1];
    var _17 = useState({}), editFormData = _17[0], setEditFormData = _17[1];
    // Debug effect to track editFormData changes
    useEffect(function () {
        console.log('📊 Edit form data updated:', editFormData);
    }, [editFormData]);
    // User action handlers
    var handleUserView = function (user) {
        console.log('👁️ Viewing user:', user);
        setSelectedUser(user);
        setShowUserModal(true);
    };
    var handleUserEdit = function (user) {
        console.log('✏️ Editing user:', user);
        setSelectedUser(user);
        var formData = {
            username: user.username,
            email: user.email,
            balance: user.balance,
            trading_mode: user.trading_mode,
            role: user.role,
            status: user.status,
            wallet_address: user.wallet_address || ''
        };
        console.log('📝 Setting edit form data:', formData);
        setEditFormData(formData);
        setShowEditModal(true);
    };
    var handleSaveUserEdit = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/admin/users/".concat(selectedUser.id), {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('token'))
                            },
                            body: JSON.stringify(editFormData)
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        toast({
                            title: "Success",
                            description: "User updated successfully"
                        });
                        setShowEditModal(false);
                        // Force refresh with delay to ensure server has processed the change
                        setTimeout(function () {
                            fetchData();
                        }, 100);
                    }
                    else {
                        throw new Error('Failed to update user');
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_19 = _a.sent();
                    console.error('❌ Error updating user:', error_19);
                    toast({
                        title: "Error",
                        description: "Failed to update user",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
        var response, error_20;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Are you sure you want to delete user \"".concat(user.username, "\"? This action cannot be undone."))) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/admin/users/".concat(user.id), {
                            method: 'DELETE',
                            headers: {
                                'Authorization': "Bearer ".concat(localStorage.getItem('token'))
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        toast({
                            title: "Success",
                            description: "User \"".concat(user.username, "\" deleted successfully")
                        });
                        // Force refresh with delay to ensure server has processed the change
                        setTimeout(function () {
                            fetchData();
                        }, 100);
                    }
                    else {
                        throw new Error('Failed to delete user');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_20 = _a.sent();
                    console.error('❌ Error deleting user:', error_20);
                    toast({
                        title: "Error",
                        description: "Failed to delete user",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // ===== SUPER ADMIN FUNCTIONS =====
    // Process deposit
    var handleDeposit = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserForAction || !depositAmount)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/superadmin/deposit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserForAction.id,
                                amount: Number(depositAmount),
                                note: "Admin deposit for ".concat(selectedUserForAction.username)
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    toast({
                        title: "Success",
                        description: result.message
                    });
                    setDepositAmount('');
                    setShowDepositModal(false);
                    // Force refresh with delay to ensure server has processed the change
                    setTimeout(function () {
                        fetchData();
                    }, 100);
                    return [3 /*break*/, 5];
                case 4: throw new Error('Failed to process deposit');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_21 = _a.sent();
                    toast({
                        title: "Error",
                        description: "Failed to process deposit",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Process withdrawal
    var handleWithdrawal = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_22;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserForAction || !withdrawalAmount)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, fetch('/api/superadmin/withdrawal', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserForAction.id,
                                amount: Number(withdrawalAmount),
                                note: "Admin withdrawal for ".concat(selectedUserForAction.username)
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    toast({
                        title: "Success",
                        description: result.message
                    });
                    setWithdrawalAmount('');
                    setShowWithdrawalModal(false);
                    // Force refresh with delay to ensure server has processed the change
                    setTimeout(function () {
                        fetchData();
                    }, 100);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    error = _a.sent();
                    throw new Error(error.error || 'Failed to process withdrawal');
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_22 = _a.sent();
                    toast({
                        title: "Error",
                        description: error_22.message || "Failed to process withdrawal",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Change password
    var handlePasswordChange = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_23;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserForAction || !newPassword)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, fetch('/api/superadmin/change-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserForAction.id,
                                newPassword: newPassword
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    toast({
                        title: "Success",
                        description: result.message
                    });
                    setNewPassword('');
                    setShowPasswordModal(false);
                    // Force refresh with delay to ensure server has processed the change
                    setTimeout(function () {
                        fetchData();
                    }, 100);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    error = _a.sent();
                    throw new Error(error.error || 'Failed to change password');
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_23 = _a.sent();
                    toast({
                        title: "Error",
                        description: error_23.message || "Failed to change password",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Update wallet address
    var handleWalletUpdate = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_24;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserForAction)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, fetch('/api/superadmin/update-wallet', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserForAction.id,
                                walletAddress: newWalletAddress
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    toast({
                        title: "Success",
                        description: result.message
                    });
                    // Update the selectedUserForAction with the new wallet address
                    setSelectedUserForAction(__assign(__assign({}, selectedUserForAction), { wallet_address: newWalletAddress }));
                    // Update the users list to reflect the change
                    setUsers(function (prevUsers) {
                        return prevUsers.map(function (user) {
                            return user.id === selectedUserForAction.id
                                ? __assign(__assign({}, user), { wallet_address: newWalletAddress }) : user;
                        });
                    });
                    setNewWalletAddress('');
                    // Refresh wallet history to show the updated history
                    loadWalletHistory(selectedUserForAction.id);
                    // Don't close the modal immediately so user can see the updated address
                    // setShowWalletModal(false);
                    // Force refresh with delay to ensure server has processed the change
                    setTimeout(function () {
                        fetchData();
                    }, 100);
                    return [3 /*break*/, 5];
                case 4: throw new Error('Failed to update wallet address');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_24 = _a.sent();
                    toast({
                        title: "Error",
                        description: "Failed to update wallet address",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Load wallet history
    var loadWalletHistory = function (userId) { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_25;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch("/api/superadmin/wallet-history/".concat(userId))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setWalletHistory(data.history || []);
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_25 = _a.sent();
                    console.error('Failed to load wallet history:', error_25);
                    setWalletHistory([]);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Approve/Reject deposit
    var handleDepositAction = function (depositId, action, reason) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_26;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Pause polling during action
                    setIsPolling(false);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    console.log('🏦 Deposit action:', depositId, action, reason);
                    return [4 /*yield*/, fetch("/api/admin/deposits/".concat(depositId, "/action"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify({ action: action, reason: reason })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    toast({
                        title: "Deposit ".concat(action === 'approve' ? 'Approved' : 'Rejected'),
                        description: result.message || "Deposit ".concat(action, "d successfully"),
                        duration: 3000
                    });
                    fetchData(); // Refresh all data
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    error = _a.sent();
                    throw new Error(error || 'Failed to process deposit');
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_26 = _a.sent();
                    console.error('Failed to process deposit:', error_26);
                    toast({
                        title: "Error",
                        description: error_26 instanceof Error ? error_26.message : "Failed to process deposit",
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 9];
                case 8:
                    // Resume polling after action
                    setIsPolling(true);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Handle withdrawal actions
    var handleWithdrawalAction = function (withdrawalId, action, reason) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_27;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Pause polling during action
                    setIsPolling(false);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    console.log('💰 Withdrawal action:', withdrawalId, action, reason);
                    return [4 /*yield*/, fetch("/api/admin/withdrawals/".concat(withdrawalId, "/action"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify({ action: action, reason: reason })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    toast({
                        title: "Withdrawal ".concat(action === 'approve' ? 'Approved' : 'Rejected'),
                        description: result.message || "Withdrawal ".concat(action, "d successfully"),
                        duration: 3000
                    });
                    fetchData(); // Refresh all data
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    error = _a.sent();
                    throw new Error(error || 'Failed to process withdrawal');
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_27 = _a.sent();
                    console.error('Failed to process withdrawal:', error_27);
                    toast({
                        title: "Error",
                        description: error_27 instanceof Error ? error_27.message : "Failed to process withdrawal",
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 9];
                case 8:
                    // Resume polling after action
                    setIsPolling(true);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Handle document verification actions
    var handleDocumentAction = function (documentId, action, reason) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_28;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('📄 Document action:', documentId, action, reason);
                    return [4 /*yield*/, fetch("/api/admin/verify-document/".concat(documentId), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify({
                                status: action === 'approve' ? 'approved' : 'rejected',
                                adminNotes: reason || "Document ".concat(action, "d by admin")
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    toast({
                        title: "Document ".concat(action === 'approve' ? 'Approved' : 'Rejected'),
                        description: result.message || "Document ".concat(action, "d successfully"),
                        duration: 3000
                    });
                    fetchData(); // Refresh all data
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.text()];
                case 4:
                    error = _a.sent();
                    throw new Error(error || 'Failed to process document');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_28 = _a.sent();
                    console.error('Failed to process document:', error_28);
                    toast({
                        title: "Error",
                        description: error_28 instanceof Error ? error_28.message : "Failed to process document",
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Handle transaction deletion
    var handleDeleteTransaction = function (transactionId) { return __awaiter(_this, void 0, void 0, function () {
        var originalTransactions, response, result, refreshSuccess, error, error_29;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log('🗑️ Deleting transaction:', transactionId);
                    console.log('🗑️ Current transactions count before deletion:', transactions.length);
                    originalTransactions = __spreadArray([], transactions, true);
                    setTransactions(function (prev) { return prev.map(function (t) {
                        return t.id === transactionId ? __assign(__assign({}, t), { deleting: true }) : t;
                    }); });
                    return [4 /*yield*/, fetch("/api/admin/transactions/".concat(transactionId), {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    console.log('🗑️ Delete response:', result);
                    // Immediately refresh from server
                    console.log('🔄 Immediately refreshing transactions after successful deletion...');
                    return [4 /*yield*/, refreshTransactions()];
                case 3:
                    refreshSuccess = _a.sent();
                    if (refreshSuccess) {
                        toast({
                            title: "Transaction Deleted",
                            description: result.message || "Transaction deleted successfully",
                            duration: 3000
                        });
                    }
                    else {
                        // If refresh failed, manually remove from state
                        setTransactions(function (prev) { return prev.filter(function (t) { return t.id !== transactionId; }); });
                        toast({
                            title: "Transaction Deleted",
                            description: "Transaction deleted (manual update)",
                            duration: 3000
                        });
                    }
                    return [3 /*break*/, 6];
                case 4:
                    // If deletion failed, restore original state
                    console.log('🗑️ Delete failed, restoring original state...');
                    setTransactions(originalTransactions);
                    return [4 /*yield*/, response.text()];
                case 5:
                    error = _a.sent();
                    throw new Error(error || 'Failed to delete transaction');
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_29 = _a.sent();
                    console.error('Failed to delete transaction:', error_29);
                    // Restore original state on error
                    console.log('🗑️ Error occurred, restoring original state...');
                    setTransactions(function (prev) { return prev.filter(function (t) { return !t.deleting; }); });
                    toast({
                        title: "Error",
                        description: error_29 instanceof Error ? error_29.message : "Failed to delete transaction",
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // View receipt in popup
    var viewReceipt = function (filename) {
        var receiptUrl = "/api/admin/receipt/".concat(filename, "/view");
        window.open(receiptUrl, 'receiptViewer', 'width=800,height=600,scrollbars=yes,resizable=yes');
    };
    // Handle redeem code actions
    var handleRedeemCodeAction = function (codeId, action) { return __awaiter(_this, void 0, void 0, function () {
        var codeToEdit, response, result, error, error_30;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('🎁 Redeem code action:', codeId, action);
                    if (action === 'edit') {
                        codeToEdit = redeemCodes.find(function (code) { return code.id === codeId || code.code === codeId; });
                        if (codeToEdit) {
                            setEditingCode(codeToEdit);
                            setShowEditCodeModal(true);
                        }
                        else {
                            toast({
                                title: "Error",
                                description: "Code not found",
                                variant: "destructive"
                            });
                        }
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch("/api/admin/redeem-codes/".concat(codeId, "/action"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify({ action: action })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    toast({
                        title: "Code ".concat(action === 'disable' ? 'Disabled' : 'Deleted'),
                        description: result.message || "Code ".concat(action, "d successfully"),
                        duration: 3000
                    });
                    // Force refresh with delay to ensure server has processed the change
                    setTimeout(function () {
                        fetchData();
                    }, 100);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.text()];
                case 4:
                    error = _a.sent();
                    throw new Error(error || "Failed to ".concat(action, " code"));
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_30 = _a.sent();
                    console.error("Failed to ".concat(action, " redeem code:"), error_30);
                    toast({
                        title: "Error",
                        description: error_30 instanceof Error ? error_30.message : "Failed to ".concat(action, " code"),
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Edit existing redeem code
    var handleEditRedeemCode = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_31;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!editingCode || !editingCode.bonus_amount) {
                        toast({
                            title: "Missing Information",
                            description: "Please fill in bonus amount",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch("/api/admin/redeem-codes/".concat(editingCode.id, "/action"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify({
                                action: 'edit',
                                newAmount: parseFloat(editingCode.bonus_amount),
                                newDescription: editingCode.description,
                                newMaxUses: editingCode.max_uses ? parseInt(editingCode.max_uses) : null
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    toast({
                        title: "Code Updated",
                        description: "Redeem code ".concat(editingCode.code, " updated successfully"),
                        duration: 3000
                    });
                    setShowEditCodeModal(false);
                    setEditingCode(null);
                    fetchData(); // Refresh all data
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.text()];
                case 4:
                    error = _a.sent();
                    throw new Error(error || 'Failed to update code');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_31 = _a.sent();
                    console.error('Failed to update redeem code:', error_31);
                    toast({
                        title: "Error",
                        description: error_31 instanceof Error ? error_31.message : "Failed to update code",
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Create new redeem code
    var handleCreateRedeemCode = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_32;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    if (!newRedeemCode.code || !newRedeemCode.bonusAmount) {
                        toast({
                            title: "Missing Information",
                            description: "Please fill in code and bonus amount",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch('/api/admin/redeem-codes', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                            },
                            body: JSON.stringify({
                                code: newRedeemCode.code.toUpperCase(),
                                bonusAmount: parseFloat(newRedeemCode.bonusAmount),
                                maxUses: newRedeemCode.maxUses ? parseInt(newRedeemCode.maxUses) : null,
                                description: newRedeemCode.description || "Bonus code for ".concat(newRedeemCode.bonusAmount, " USDT")
                            })
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    toast({
                        title: "Code Created",
                        description: "Redeem code ".concat(newRedeemCode.code, " created successfully"),
                        duration: 3000
                    });
                    setShowCreateCodeModal(false);
                    setNewRedeemCode({ code: '', bonusAmount: '', maxUses: '', description: '' });
                    fetchData(); // Refresh all data
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, response.text()];
                case 4:
                    error = _a.sent();
                    throw new Error(error || 'Failed to create code');
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_32 = _a.sent();
                    console.error('Failed to create redeem code:', error_32);
                    toast({
                        title: "Error",
                        description: error_32 instanceof Error ? error_32.message : "Failed to create code",
                        variant: "destructive",
                        duration: 5000
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Toggle password visibility for a specific user
    var togglePasswordVisibility = function (userId) {
        setVisiblePasswords(function (prev) {
            var newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            }
            else {
                newSet.add(userId);
            }
            return newSet;
        });
    };
    var openSuperAdminModal = function (user, action) {
        console.log('🔧 Opening super admin modal:', action, 'for user:', user.username);
        setSelectedUserForAction(user);
        setNewWalletAddress(user.wallet_address || '');
        switch (action) {
            case 'deposit':
                setShowDepositModal(true);
                break;
            case 'withdrawal':
                setShowWithdrawalModal(true);
                break;
            case 'password':
                setShowPasswordModal(true);
                break;
            case 'wallet':
                setShowWalletModal(true);
                loadWalletHistory(user.id); // Load wallet history when opening wallet modal
                break;
        }
    };
    // Real-time updates with smart polling
    useEffect(function () {
        // Initial data load
        fetchData();
        // Set up smart polling - only when enabled
        var pollInterval = null;
        if (isPolling) {
            pollInterval = setInterval(function () {
                console.log('🔄 AUTO-REFRESH: Silent polling for new data...');
                silentFetchData(); // Use silent fetch to avoid loading state
            }, 15000); // Poll every 15 seconds (not too aggressive)
        }
        // Cleanup interval on unmount
        return function () {
            if (pollInterval) {
                clearInterval(pollInterval);
                console.log('🔄 AUTO-REFRESH: Polling stopped');
            }
        };
    }, [isPolling]); // Re-run when polling state changes
    var getTradingModeBadge = function (mode) {
        var colors = {
            win: 'bg-green-600',
            normal: 'bg-blue-600',
            lose: 'bg-red-600'
        };
        var safeMode = mode || 'normal';
        return (<Badge className={"".concat(colors[safeMode], " text-white")}>
        {safeMode.toUpperCase()}
      </Badge>);
    };
    var getTimeRemaining = function (expiresAt) {
        var now = Date.now();
        var expiry = new Date(expiresAt).getTime();
        var remaining = Math.max(0, expiry - now);
        return Math.floor(remaining / 1000);
    };
    return (<>
      <style>{"\n        .admin-table-container {\n          scrollbar-width: thin;\n          scrollbar-color: #6b7280 #374151;\n        }\n        .admin-table-container::-webkit-scrollbar {\n          height: 8px;\n        }\n        .admin-table-container::-webkit-scrollbar-track {\n          background: #374151;\n          border-radius: 4px;\n        }\n        .admin-table-container::-webkit-scrollbar-thumb {\n          background: #6b7280;\n          border-radius: 4px;\n        }\n        .admin-table-container::-webkit-scrollbar-thumb:hover {\n          background: #9ca3af;\n        }\n      "}</style>
      <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-purple-500"/>
              <div>
                <h1 className="text-2xl font-bold text-white">METACHROME Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Complete Trading Platform Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Real-time Notification Bell */}
              {(user === null || user === void 0 ? void 0 : user.role) === 'super_admin' && <NotificationBell onTabChange={setActiveTab}/>}

              {/* Real-time Status Indicator */}
              <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600">
                <div className={"w-2 h-2 rounded-full ".concat(isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-500')}/>
                <div className="text-xs text-gray-400">
                  <div className="font-medium">
                    {isPolling ? 'Live Updates' : 'Paused'}
                  </div>
                  <div className="text-[10px]">
                    {lastUpdateTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(user === null || user === void 0 ? void 0 : user.username) ? user.username.substring(0, 2).toUpperCase() : 'SA'}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">{(user === null || user === void 0 ? void 0 : user.username) || 'superadmin'}</div>
                  <div className="text-gray-400 text-xs">
                    {(user === null || user === void 0 ? void 0 : user.role) === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto bg-gray-800 border-gray-700 scrollbar-hide gap-2 p-2">
            <TabsTrigger value="overview" className="flex-shrink-0 px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2"/>
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-shrink-0 px-4 py-2">
              <Users className="w-4 h-4 mr-2"/>
              Users
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex-shrink-0 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2"/>
              Trades
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-shrink-0 px-4 py-2">
              <DollarSign className="w-4 h-4 mr-2"/>
              Transactions
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-shrink-0 px-4 py-2">
              <Shield className="w-4 h-4 mr-2"/>
              Pending Requests
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex-shrink-0 px-4 py-2">
              <FileCheck className="w-4 h-4 mr-2"/>
              Verification
            </TabsTrigger>
            <TabsTrigger value="redeem-codes" className="flex-shrink-0 px-4 py-2">
              <Gift className="w-4 h-4 mr-2"/>
              Redeem Codes
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex-shrink-0 px-4 py-2">
              <Settings className="w-4 h-4 mr-2"/>
              Controls
            </TabsTrigger>
            <TabsTrigger value="support" className="flex-shrink-0 px-4 py-2">
              <MessageSquare className="w-4 h-4 mr-2"/>
              Support
              <ChatNotificationBadge />
            </TabsTrigger>
            <TabsTrigger value="activity-logs" className="flex-shrink-0 px-4 py-2">
              <Activity className="w-4 h-4 mr-2"/>
              Activity Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white">
                        {(systemStats === null || systemStats === void 0 ? void 0 : systemStats.totalUsers) || users.length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Trades</p>
                      <p className="text-3xl font-bold text-white">
                        {Array.isArray(trades) ? trades.filter(function (t) { return t.result === 'pending'; }).length : 0}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-200"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Volume</p>
                      <p className="text-3xl font-bold text-white">
                        ${trades.reduce(function (sum, t) { return sum + parseFloat(t.amount || 0); }, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-200"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total Balance</p>
                      <p className="text-3xl font-bold text-white">
                        {calculateTotalBalance(users).toLocaleString()} USDT
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-200"/>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 bg-blue-600 hover:bg-blue-700">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-2"/>
                      <div className="text-sm">Manage Users</div>
                    </div>
                  </Button>
                  <Button className="h-20 bg-green-600 hover:bg-green-700">
                    <div className="text-center">
                      <Activity className="w-6 h-6 mx-auto mb-2"/>
                      <div className="text-sm">Monitor Trades</div>
                    </div>
                  </Button>
                  <Button className="h-20 bg-purple-600 hover:bg-purple-700" onClick={function () { return window.location.href = '/admin/test'; }}>
                    <div className="text-center">
                      <Settings className="w-6 h-6 mx-auto mb-2"/>
                      <div className="text-sm">Test Features</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-white">
                        {Array.isArray(users) ? users.filter(function (u) { return u.status === 'active'; }).length : 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Total Platform Balance</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-green-400">
                          {calculateTotalBalance(users).toLocaleString()} USDT
                        </p>
                        <p className="text-sm text-gray-400">
                          All crypto auto-converted to USDT
                        </p>
                      </div>
                      <div className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                        💱 Unified USDT balance system
                      </div>
                    </div>
                    <Wallet className="w-8 h-8 text-purple-500"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Controlled Users</p>
                      <p className="text-2xl font-bold text-white">
                        {Array.isArray(users) ? users.filter(function (u) { return u.trading_mode !== 'normal'; }).length : 0}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500"/>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create User Form */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5"/>
                  <span>Create New User</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Add new users to the trading platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <Input placeholder="Username" value={newUser.username} onChange={function (e) { return setNewUser(__assign(__assign({}, newUser), { username: e.target.value })); }} className="bg-gray-700 border-gray-600 text-white"/>
                  <Input placeholder="Email" type="email" value={newUser.email} onChange={function (e) { return setNewUser(__assign(__assign({}, newUser), { email: e.target.value })); }} className="bg-gray-700 border-gray-600 text-white"/>
                  <Input placeholder="Password" type="password" value={newUser.password} onChange={function (e) { return setNewUser(__assign(__assign({}, newUser), { password: e.target.value })); }} className="bg-gray-700 border-gray-600 text-white"/>
                  <Input placeholder="Balance" type="number" value={newUser.balance} onChange={function (e) { return setNewUser(__assign(__assign({}, newUser), { balance: Number(e.target.value) })); }} className="bg-gray-700 border-gray-600 text-white"/>
                  <Select value={newUser.role} onValueChange={function (value) { return setNewUser(__assign(__assign({}, newUser), { role: value })); }}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      {/* Only superadmin can create admin or super_admin users */}
                      {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin' && (<>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={createUser} className="w-full bg-purple-600 hover:bg-purple-700">
                    Create User
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage all platform users and their trading settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="mb-4">
                  <Input placeholder="Search users by username, email, or ID..." value={userSearchTerm} onChange={function (e) { return setUserSearchTerm(e.target.value); }} className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"/>
                </div>

                <div className="border border-gray-700 rounded-lg overflow-x-auto admin-table-container" style={{ maxWidth: '100%' }}>
                  <Table className="w-full" style={{ minWidth: '1400px' }}>
                    <TableHeader>
                      <TableRow className="bg-gray-700">
                        <TableHead className="text-gray-300 min-w-[200px]">User</TableHead>
                        <TableHead className="text-gray-300 min-w-[250px]">Email</TableHead>
                        {isSuperAdmin && <TableHead className="text-gray-300 min-w-[150px]">Password</TableHead>}
                        <TableHead className="text-gray-300 min-w-[120px]">Balance</TableHead>
                        <TableHead className="text-gray-300 min-w-[100px]">Role</TableHead>
                        <TableHead className="text-gray-300 min-w-[100px]">Status</TableHead>
                        <TableHead className="text-gray-300 min-w-[120px]">Trading Mode</TableHead>
                        <TableHead className="text-gray-300 min-w-[400px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(users) ? (<>
                          {console.log('📊 Rendering users table with', users.length, 'users')}
                          {users
                .filter(function (user) {
                var _a, _b, _c;
                // Hide superadmin users if current user is admin (not superadmin)
                if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'admin' && (user.role === 'super_admin' || user.role === 'superadmin')) {
                    return false;
                }
                if (!userSearchTerm)
                    return true;
                var searchLower = userSearchTerm.toLowerCase();
                return (((_a = user.username) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchLower)) ||
                    ((_b = user.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchLower)) ||
                    ((_c = user.id) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(searchLower)));
            })
                .sort(function (a, b) {
                // Sort by created_at in descending order (newest first)
                var dateA = new Date(a.created_at || 0).getTime();
                var dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            })
                .map(function (user) {
                var _a;
                return (<TableRow key={user.id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-white font-medium truncate" title={user.username}>
                                  {user.username.length > 20 ? "".concat(user.username.slice(0, 20), "...") : user.username}
                                </div>
                                <div className="text-gray-400 text-sm">ID: {user.id ? user.id.slice(0, 8) : 'N/A'}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="truncate" title={user.email}>
                              {user.email.length > 30 ? "".concat(user.email.slice(0, 30), "...") : user.email}
                            </div>
                          </TableCell>
                          {isSuperAdmin && (<TableCell className="text-white">
                              <div className="flex items-center space-x-2">
                                {/* Check if wallet user (starts with 0x) */}
                                {((_a = user.username) === null || _a === void 0 ? void 0 : _a.startsWith('0x')) ? (<span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                                    🔐 Wallet Login
                                  </span>) : user.password_plain ? (<>
                                    <span className="font-mono text-sm break-all text-green-400" style={{ wordBreak: 'break-all', maxWidth: '200px' }} title={visiblePasswords.has(user.id) ? user.password_plain : 'Click eye to reveal'}>
                                      {visiblePasswords.has(user.id)
                                ? user.password_plain
                                : '••••••••'}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={function () { return togglePasswordVisibility(user.id); }} className="text-gray-400 hover:text-white h-6 w-6 p-0 flex-shrink-0" title={visiblePasswords.has(user.id) ? "Hide password" : "Show password"}>
                                      {visiblePasswords.has(user.id) ? (<EyeOff className="w-3 h-3"/>) : (<Eye className="w-3 h-3"/>)}
                                    </Button>
                                  </>) : (<span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-1 rounded" title="Reset password via edit to make it viewable">
                                    ⚠️ Reset to view
                                  </span>)}
                              </div>
                            </TableCell>)}
                          <TableCell className="text-white">
                            <div className="space-y-1">
                              <div className="font-medium text-green-400">
                                {formatBalance(user.balance)} USDT
                              </div>
                              <div className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-700">
                                💱 Auto-converts all crypto deposits to USDT
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select value={user.trading_mode} onValueChange={function (value) {
                        return updateTradingMode(user.id, value);
                    }}>
                              <SelectTrigger className="w-24 bg-gray-700 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="win">
                                  <span className="text-green-600 font-bold">WIN</span>
                                </SelectItem>
                                <SelectItem value="normal">
                                  <span className="text-blue-600 font-bold">NORMAL</span>
                                </SelectItem>
                                <SelectItem value="lose">
                                  <span className="text-red-600 font-bold">LOSE</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="min-w-[300px]">
                            <div className="flex items-center space-x-1 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={function () {
                        console.log('🔍 View button clicked for user:', user.username);
                        handleUserView(user);
                    }} className="text-gray-400 hover:text-white" title="View User Details">
                                <Eye className="w-4 h-4"/>
                              </Button>
                              <Button variant="ghost" size="sm" onClick={function () {
                        console.log('✏️ Edit button clicked for user:', user.username);
                        handleUserEdit(user);
                    }} className="text-gray-400 hover:text-white" title="Edit User">
                                <Edit className="w-4 h-4"/>
                              </Button>

                              {/* Admin and Super Admin Buttons */}
                              {((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'admin' || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin') && (<>
                                  {/* Deposit and Withdrawal buttons - available for both superadmin and admin */}
                                  <Button variant="ghost" size="sm" onClick={function () {
                            console.log('💰 Deposit button clicked for user:', user.username);
                            openSuperAdminModal(user, 'deposit');
                        }} className="text-green-400 hover:text-green-300" title="Deposit Money">
                                    <Plus className="w-4 h-4"/>
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={function () {
                            console.log('💸 Withdrawal button clicked for user:', user.username);
                            openSuperAdminModal(user, 'withdrawal');
                        }} className="text-red-400 hover:text-red-300" title="Withdraw Money">
                                    <Minus className="w-4 h-4"/>
                                  </Button>

                                  {/* Password button - available for both superadmin and admin */}
                                  <Button variant="ghost" size="sm" onClick={function () { return openSuperAdminModal(user, 'password'); }} className="text-blue-400 hover:text-blue-300" title="Change Password">
                                    <Key className="w-4 h-4"/>
                                  </Button>

                                  {/* Wallet button - only for superadmin */}
                                  {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin' && (<Button variant="ghost" size="sm" onClick={function () { return openSuperAdminModal(user, 'wallet'); }} className="text-purple-400 hover:text-purple-300" title="Update Wallet Address">
                                      <Wallet className="w-4 h-4"/>
                                    </Button>)}
                                  {/* Delete button - admin can delete users, but not superadmin or themselves */}
                                  {(function () {
                            // Superadmin can delete any user except themselves
                            if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin') {
                                return user.id !== currentUser.id ? (<Button variant="ghost" size="sm" onClick={function () { return handleDeleteUser(user); }} className="text-red-500 hover:text-red-400 border border-red-500" title="Delete User">
                                          <Trash2 className="w-4 h-4"/>
                                        </Button>) : null;
                            }
                            // Admin can delete regular users only (not superadmin, not themselves)
                            if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'admin') {
                                return user.role === 'user' && user.id !== currentUser.id ? (<Button variant="ghost" size="sm" onClick={function () { return handleDeleteUser(user); }} className="text-red-500 hover:text-red-400 border border-red-500" title="Delete User">
                                          <Trash2 className="w-4 h-4"/>
                                        </Button>) : null;
                            }
                            return null;
                        })()}
                                </>)}
                            </div>
                          </TableCell>
                        </TableRow>);
            })}
                        </>) : []}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades" className="space-y-6">
            {/* Trading Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Trades</p>
                      <p className="text-3xl font-bold text-white">
                        {Array.isArray(trades) ? trades.filter(function (t) { return t.result === 'pending'; }).length : 0}
                      </p>
                    </div>
                    <PlayCircle className="w-8 h-8 text-green-200"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Win Rate</p>
                      <p className="text-3xl font-bold text-white">
                        {(systemStats === null || systemStats === void 0 ? void 0 : systemStats.winRate) || 0}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-200"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Volume</p>
                      <p className="text-3xl font-bold text-white">
                        ${trades.reduce(function (sum, t) { return sum + parseFloat(t.amount || 0); }, 0).toLocaleString()}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-200"/>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total P&L</p>
                      <p className="text-3xl font-bold text-white">
                        ${(function () {
            var totalProfit = (systemStats === null || systemStats === void 0 ? void 0 : systemStats.totalProfit) || 0;
            var totalLoss = (systemStats === null || systemStats === void 0 ? void 0 : systemStats.totalLoss) || 0;
            var totalPnL = totalProfit - totalLoss;
            return totalPnL.toLocaleString();
        })()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-200"/>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Trading Monitor */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Activity className="w-5 h-5"/>
                      <span>Live Trading Monitor</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Real-time trading activity with manual controls
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">Live</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-700">
                        <TableHead className="text-gray-300">Trade ID</TableHead>
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Symbol</TableHead>
                        <TableHead className="text-gray-300">Direction</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Duration</TableHead>
                        <TableHead className="text-gray-300">Entry Price</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Time Left</TableHead>
                        <TableHead className="text-gray-300">Control</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(trades) ? trades.slice(0, 10).map(function (trade) {
            var secondsLeft = getTimeRemaining(trade.expires_at);
            return (<TableRow key={trade.id} className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell>
                              <div className="text-white font-mono text-sm">
                                {trade.id ? trade.id.slice(0, 8) : 'N/A'}...
                              </div>
                            </TableCell>
                            <TableCell className="text-white">
                              {trade.username || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-white font-medium">{trade.symbol}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {trade.direction === 'up' ? (<ArrowUp className="w-4 h-4 text-green-500"/>) : (<ArrowDown className="w-4 h-4 text-red-500"/>)}
                                <span className="text-white">{trade.direction === 'up' ? 'BUY' : 'SELL'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">{trade.amount.toLocaleString()} USDT</TableCell>
                            <TableCell className="text-white">{trade.duration}s</TableCell>
                            <TableCell className="text-white font-mono">{trade.entry_price} USDT</TableCell>
                            <TableCell>
                              <Badge variant={trade.result === 'win' ? 'default' :
                    trade.result === 'lose' ? 'destructive' :
                        'secondary'}>
                                {trade.result || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {trade.result === 'pending' ? (<span className={"text-sm font-medium ".concat(secondsLeft <= 10 ? 'text-red-400' : 'text-yellow-400')}>
                                  {secondsLeft}s
                                </span>) : (<span className="text-gray-400 text-sm">Completed</span>)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                {trade.result === 'pending' ? (<>
                                    <Button variant="ghost" size="sm" onClick={function () { return controlTrade(trade.id, 'win'); }} className="text-green-400 hover:text-green-300" title="Force Win">
                                      <CheckCircle className="w-4 h-4"/>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={function () { return controlTrade(trade.id, 'lose'); }} className="text-red-400 hover:text-red-300" title="Force Lose">
                                      <XCircle className="w-4 h-4"/>
                                    </Button>
                                  </>) : null}
                                <Button variant="ghost" size="sm" onClick={function () { return deleteTrade(trade.id); }} className="text-gray-400 hover:text-red-400" title="Delete Trade">
                                  <Trash2 className="w-4 h-4"/>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>);
        }) : []}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Financial Transactions</CardTitle>
                    <CardDescription className="text-gray-400">
                      Monitor all financial transactions
                    </CardDescription>
                  </div>
                  <Button onClick={function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, error_33;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!confirm('Fix all pending trade transactions? This will mark them as completed.'))
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, fetch('/api/admin/fix-pending-trade-transactions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 2:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        if (!response.ok) return [3 /*break*/, 5];
                        alert("\u2705 Fixed ".concat(data.summary.updated, " pending trade transactions"));
                        return [4 /*yield*/, loadData()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        alert("\u274C Error: ".concat(data.message));
                        _a.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_33 = _a.sent();
                        console.error('Error fixing pending transactions:', error_33);
                        alert('❌ Failed to fix pending transactions');
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); }} className="bg-blue-600 hover:bg-blue-700">
                    Fix Pending Trade Transactions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Debug Info Panel */}
                <div className="bg-gray-800 border border-yellow-500 rounded-lg p-4 mb-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">🐛 Debug Info</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>React State Count: <span className="text-white font-mono">{transactions.length}</span></div>
                    <div>First 3 IDs: <span className="text-white font-mono text-xs">
                      {transactions.slice(0, 3).map(function (t) { return t.id.slice(0, 8); }).join(', ')}
                    </span></div>
                    <div>Last Updated: <span className="text-white font-mono">{new Date().toLocaleTimeString()}</span></div>
                    <div>Pending Trade Txns: <span className="text-white font-mono">
                      {transactions.filter(function (t) { return (t.type === 'trade_win' || t.type === 'trade_loss') && t.status === 'pending'; }).length}
                    </span></div>
                  </div>
                </div>

                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-700">
                        <TableHead className="text-gray-300">Transaction ID</TableHead>
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(transactions) ? transactions.map(function (transaction) {
            var _a;
            return (<TableRow key={transaction.id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell>
                            <div className="text-white font-mono text-sm">
                              {transaction.id ? transaction.id.slice(0, 8) : 'N/A'}...
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {((_a = transaction.users) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            {formatTransactionAmount(transaction)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="destructive" onClick={function () { return handleDeleteTransaction(transaction.id); }} disabled={transaction.deleting} className="bg-red-600 hover:bg-red-700 disabled:opacity-50">
                              {transaction.deleting ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>) : (<Trash2 className="w-4 h-4"/>)}
                            </Button>
                          </TableCell>
                        </TableRow>);
        }) : []}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Controls</CardTitle>
                <CardDescription className="text-gray-400">
                  Platform-wide controls and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Trading Controls</h3>
                    <div className="space-y-3">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Enable All Trading
                      </Button>
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                        Pause Trading
                      </Button>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Emergency Stop
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Market Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Price Feed:</span>
                        <Badge className="bg-green-600">Live</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Auto Mode:</span>
                        <Badge className="bg-blue-600">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Manual Override:</span>
                        <Badge variant="outline">Ready</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Server:</span>
                        <Badge className="bg-green-600">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Database:</span>
                        <Badge className="bg-green-600">Connected</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">WebSocket:</span>
                        <Badge className="bg-green-600">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Deposits */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-400"/>
                    <span>Pending Deposits</span>
                    <Badge variant="secondary" className="ml-2">
                      {((_a = pendingRequests === null || pendingRequests === void 0 ? void 0 : pendingRequests.deposits) === null || _a === void 0 ? void 0 : _a.length) || 0}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Review and approve user deposit requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {((_b = pendingRequests === null || pendingRequests === void 0 ? void 0 : pendingRequests.deposits) === null || _b === void 0 ? void 0 : _b.length) === 0 ? (<div className="text-center py-8 text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No pending deposits</p>
                      </div>) : ((_c = pendingRequests === null || pendingRequests === void 0 ? void 0 : pendingRequests.deposits) === null || _c === void 0 ? void 0 : _c.map(function (deposit) {
            var _a, _b;
            return (<div key={deposit.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{deposit.username}</p>
                              <p className="text-sm text-gray-400">Balance: {deposit.user_balance} USDT</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-400">
                                {deposit.amount} {deposit.currency}
                              </p>
                              <p className="text-sm text-gray-400">{deposit.currency} Network</p>
                            </div>
                          </div>

                          {deposit.tx_hash && (<div className="text-sm">
                              <p className="text-gray-400">Transaction Hash:</p>
                              <p className="text-blue-400 font-mono break-all">{deposit.tx_hash}</p>
                            </div>)}

                          {deposit.receipt && (<div className="text-sm">
                              <p className="text-gray-400 mb-2">Receipt:</p>
                              <div className="bg-gray-600 rounded-lg p-3">
                                {((_a = deposit.receipt.mimetype) === null || _a === void 0 ? void 0 : _a.startsWith('image/')) ? (<div className="space-y-2">
                                    <img src={deposit.receipt.url} alt="Transaction Receipt" className="max-w-full h-32 object-contain rounded border border-gray-500" onError={function (e) {
                            e.currentTarget.style.display = 'none';
                            var nextElement = e.currentTarget.nextElementSibling;
                            if (nextElement)
                                nextElement.style.display = 'block';
                        }}/>
                                    <div style={{ display: 'none' }} className="text-red-400 text-xs">
                                      Failed to load image
                                    </div>
                                    <a href={deposit.receipt.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs underline">
                                      View Full Size
                                    </a>
                                  </div>) : (<div className="space-y-1">
                                    <p className="text-white text-xs">{deposit.receipt.originalName}</p>
                                    <p className="text-gray-400 text-xs">
                                      {deposit.receipt.mimetype} • {Math.round(deposit.receipt.size / 1024)}KB
                                    </p>
                                    <a href={deposit.receipt.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs underline">
                                      Download File
                                    </a>
                                  </div>)}
                              </div>
                            </div>)}

                          <div className="text-sm text-gray-400">
                            <p>Requested: {new Date(deposit.created_at).toLocaleString()}</p>
                            <p>Status: <span className="text-yellow-400">{deposit.status}</span></p>
                          </div>

                          {/* Receipt Display */}
                          {deposit.receiptUploaded && deposit.receiptViewUrl && (<div className="bg-gray-600 rounded-lg p-3">
                              <p className="text-sm text-gray-300 mb-2">📄 Receipt Uploaded:</p>
                              <div className="flex items-center space-x-2">
                                <Button onClick={function () { var _a; return viewReceipt(((_a = deposit.receiptFile) === null || _a === void 0 ? void 0 : _a.filename) || ''); }} variant="outline" size="sm" className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white">
                                  View Receipt
                                </Button>
                                {((_b = deposit.receiptFile) === null || _b === void 0 ? void 0 : _b.originalname) && (<span className="text-xs text-gray-400">
                                    {deposit.receiptFile.originalname}
                                  </span>)}
                              </div>
                            </div>)}

                          <div className="flex space-x-2">
                            <Button onClick={function () { return handleDepositAction(deposit.id, 'approve'); }} className="bg-green-600 hover:bg-green-700 flex-1" size="sm">
                              <Shield className="w-4 h-4 mr-2"/>
                              Approve
                            </Button>
                            <Button onClick={function () { return handleDepositAction(deposit.id, 'reject', 'Invalid transaction proof'); }} variant="destructive" className="flex-1" size="sm">
                              Reject
                            </Button>
                          </div>
                        </div>);
        }))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Withdrawals */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-red-400"/>
                    <span>Pending Withdrawals</span>
                    <Badge variant="secondary" className="ml-2">
                      {((_d = pendingRequests === null || pendingRequests === void 0 ? void 0 : pendingRequests.withdrawals) === null || _d === void 0 ? void 0 : _d.length) || 0}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Review and approve user withdrawal requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {((_e = pendingRequests === null || pendingRequests === void 0 ? void 0 : pendingRequests.withdrawals) === null || _e === void 0 ? void 0 : _e.length) === 0 ? (<div className="text-center py-8 text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No pending withdrawals</p>
                      </div>) : ((_f = pendingRequests === null || pendingRequests === void 0 ? void 0 : pendingRequests.withdrawals) === null || _f === void 0 ? void 0 : _f.map(function (withdrawal) { return (<div key={withdrawal.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{withdrawal.username}</p>
                              <div className="text-sm space-y-1">
                                <p className="text-green-400 font-medium">Balance: {withdrawal.user_balance} USDT</p>
                                <p className="text-blue-400 text-xs">
                                  💱 Unified USDT balance (auto-converted)
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-400">
                                {withdrawal.amount} {withdrawal.currency}
                              </p>
                              <p className="text-sm text-gray-400">{withdrawal.currency} Network</p>
                            </div>
                          </div>

                          <div className="text-sm">
                            <p className="text-gray-400">Wallet Address:</p>
                            <p className="text-blue-400 font-mono break-all">{withdrawal.wallet_address}</p>
                          </div>

                          <div className="text-sm text-gray-400">
                            <p>Requested: {new Date(withdrawal.created_at).toLocaleString()}</p>
                            <p>Status: <span className="text-yellow-400">{withdrawal.status}</span></p>
                          </div>

                          <div className="bg-green-900/20 border border-green-700 rounded p-3 my-3">
                            <div className="text-green-400 text-xs font-medium flex items-center mb-1">
                              <span className="mr-2">✅</span>
                              Withdrawal Processing
                            </div>
                            <div className="text-green-300 text-xs">
                              Approving this withdrawal will deduct <span className="font-bold text-red-400">{withdrawal.amount} USDT</span> from the user's unified USDT balance.
                              Simple and instant processing with auto-conversion system.
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button onClick={function () { return handleWithdrawalAction(withdrawal.id, 'approve'); }} className="bg-green-600 hover:bg-green-700 flex-1" size="sm">
                              <Shield className="w-4 h-4 mr-2"/>
                              Approve
                            </Button>
                            <Button onClick={function () { return handleWithdrawalAction(withdrawal.id, 'reject', 'Insufficient verification'); }} variant="destructive" className="flex-1" size="sm">
                              Reject
                            </Button>
                          </div>
                        </div>); }))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Document Verification</CardTitle>
                <CardDescription className="text-gray-400">
                  Review and approve user verification documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Verification Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {(verificationStats === null || verificationStats === void 0 ? void 0 : verificationStats.pending) || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Pending Review</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {(verificationStats === null || verificationStats === void 0 ? void 0 : verificationStats.approved) || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Approved</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">
                        {(verificationStats === null || verificationStats === void 0 ? void 0 : verificationStats.rejected) || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Rejected</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-400">
                        {(verificationStats === null || verificationStats === void 0 ? void 0 : verificationStats.total) || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Total Documents</div>
                    </div>
                  </div>

                  {/* Pending Documents Table */}
                  <div className="border border-gray-700 rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-700">
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Document Type</TableHead>
                          <TableHead className="text-gray-300">Submitted</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingVerifications.length === 0 ? (<TableRow className="border-gray-700">
                            <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                              No pending verification documents
                            </TableCell>
                          </TableRow>) : (pendingVerifications
            .filter(function (doc) { return doc.verification_status === 'pending'; })
            .map(function (doc) {
            var _a, _b, _c, _d, _e;
            return (<TableRow key={doc.id} className="border-gray-700">
                                <TableCell className="text-white">
                                  {((_a = doc.users) === null || _a === void 0 ? void 0 : _a.email) || ((_b = doc.users) === null || _b === void 0 ? void 0 : _b.username) || 'Unknown User'}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {((_c = doc.document_type) === null || _c === void 0 ? void 0 : _c.replace('_', ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); })) || 'Unknown Type'}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {doc.created_at ? new Date(doc.created_at).toLocaleString() : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                  <Badge className={doc.verification_status === 'pending' ? 'bg-yellow-600' :
                    doc.verification_status === 'approved' ? 'bg-green-600' :
                        doc.verification_status === 'rejected' ? 'bg-red-600' :
                            'bg-gray-600'}>
                                    {((_d = doc.verification_status) === null || _d === void 0 ? void 0 : _d.charAt(0).toUpperCase()) + ((_e = doc.verification_status) === null || _e === void 0 ? void 0 : _e.slice(1)) || 'Unknown'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={function () { return window.open(doc.document_url, 'docViewer', 'width=800,height=600'); }}>
                                      <Eye className="w-4 h-4 mr-1"/>
                                      View
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={function () { return handleDocumentAction(doc.id, 'approve'); }}>
                                      <CheckCircle className="w-4 h-4 mr-1"/>
                                      Approve
                                    </Button>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={function () { return handleDocumentAction(doc.id, 'reject', 'Document review required'); }}>
                                      <XCircle className="w-4 h-4 mr-1"/>
                                      Reject
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>);
        }))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redeem Codes Tab */}
          <TabsContent value="redeem-codes" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Redeem Code Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Create and manage promotional redeem codes
                    </CardDescription>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={function () { return setShowCreateCodeModal(true); }}>
                    <Plus className="w-4 h-4 mr-2"/>
                    Create Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Code Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {(redeemStats === null || redeemStats === void 0 ? void 0 : redeemStats.activeCodes) || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Active Codes</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {(redeemStats === null || redeemStats === void 0 ? void 0 : redeemStats.totalRedeemed) || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Total Redeemed</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {(redeemStats === null || redeemStats === void 0 ? void 0 : redeemStats.bonusDistributed) || 0} USDT
                      </div>
                      <div className="text-gray-400 text-sm">Bonus Distributed</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {(redeemStats === null || redeemStats === void 0 ? void 0 : redeemStats.usageRate) || 0}%
                      </div>
                      <div className="text-gray-400 text-sm">Usage Rate</div>
                    </div>
                  </div>

                  {/* Redeem Codes Table */}
                  <div className="border border-gray-700 rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-700">
                          <TableHead className="text-gray-300">Code</TableHead>
                          <TableHead className="text-gray-300">Bonus Amount</TableHead>
                          <TableHead className="text-gray-300">Usage</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Created</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redeemCodes.length === 0 ? (<TableRow className="border-gray-700">
                            <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                              No redeem codes found
                            </TableCell>
                          </TableRow>) : (redeemCodes.map(function (code) {
            var _a, _b;
            return (<TableRow key={code.id} className="border-gray-700">
                              <TableCell className="text-white font-mono">{code.code}</TableCell>
                              <TableCell className="text-green-400">{code.bonus_amount} USDT</TableCell>
                              <TableCell className="text-gray-300">
                                {code.used_count || 0} / {code.max_uses || '∞'}
                              </TableCell>
                              <TableCell>
                                <Badge className={code.status === 'active' ? 'bg-green-600' :
                    code.status === 'disabled' ? 'bg-red-600' :
                        'bg-gray-600'}>
                                  {((_a = code.status) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) + ((_b = code.status) === null || _b === void 0 ? void 0 : _b.slice(1)) || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {code.created_at ? new Date(code.created_at).toLocaleDateString() : 'Unknown'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" className="border-gray-600" onClick={function () { return handleRedeemCodeAction(code.code || code.id, 'edit'); }}>
                                    <Edit className="w-4 h-4 mr-1"/>
                                    Edit
                                  </Button>
                                  <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={function () { return handleRedeemCodeAction(code.code || code.id, 'disable'); }} disabled={code.status === 'disabled' || !code.is_active}>
                                    Disable
                                  </Button>
                                  <Button size="sm" className="bg-gray-600 hover:bg-gray-700" onClick={function () { return handleRedeemCodeAction(code.code || code.id, 'delete'); }}>
                                    <Trash2 className="w-4 h-4"/>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>);
        }))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* User Redemption History */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">User Redemption History</h3>
                    <div className="border border-gray-700 rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-700">
                            <TableHead className="text-gray-300">Code</TableHead>
                            <TableHead className="text-gray-300">User</TableHead>
                            <TableHead className="text-gray-300">Amount</TableHead>
                            <TableHead className="text-gray-300">Redeemed Date</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Trades Progress</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(function () {
            // Collect all redemptions from all codes and sort by date (newest first)
            var allRedemptions = redeemCodes.flatMap(function (code) {
                return (code.redemptions || []).map(function (r) { return (__assign(__assign({}, r), { codeInfo: code })); });
            }).sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
            if (allRedemptions.length === 0) {
                return (<TableRow className="border-gray-700">
                                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                                    No redemptions yet
                                  </TableCell>
                                </TableRow>);
            }
            return allRedemptions.map(function (redemption, idx) { return (<TableRow key={"redemption-".concat(idx)} className="border-gray-700">
                                <TableCell className="text-white font-mono">{redemption.code}</TableCell>
                                <TableCell className="text-blue-400">{redemption.user}</TableCell>
                                <TableCell className="text-green-400">{redemption.amount} USDT</TableCell>
                                <TableCell className="text-gray-300">
                                  {new Date(redemption.date).toLocaleDateString()} {new Date(redemption.date).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                  <Badge className={redemption.status === 'completed' ? 'bg-green-600' :
                    redemption.status === 'pending_trades' ? 'bg-yellow-600' :
                        'bg-gray-600'}>
                                    {redemption.status === 'completed' ? 'Completed' : 'Pending Trades'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {redemption.tradesCompleted}/{redemption.tradesRequired}
                                </TableCell>
                              </TableRow>); });
        })()}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <ChatManagement />
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity-logs" className="space-y-6">
            <ActivityLogsContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">👤 User Details</h3>
              <Button variant="ghost" size="sm" onClick={function () { return setShowUserModal(false); }} className="text-gray-400 hover:text-white">
                ✕
              </Button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Username:</span>
                <span className="text-white font-medium">{selectedUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{selectedUser.email}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance Details:</span>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">USDT Balance</span>
                    <span className="text-white font-bold">{formatBalance(selectedUser.balance)} USDT</span>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                    <div className="text-blue-400 text-xs font-medium flex items-center mb-2">
                      <span className="mr-2">💱</span>
                      Auto-Conversion System
                    </div>
                    <div className="text-blue-300 text-xs space-y-1">
                      <div>• All cryptocurrency deposits (BTC, ETH, SOL, etc.) are automatically converted to USDT</div>
                      <div>• Real-time conversion rates with minimal fees (0.1-0.2%)</div>
                      <div>• Unified balance system - only USDT is stored</div>
                      <div>• Withdrawals are processed directly from USDT balance</div>
                    </div>
                  </div>
                  <div className="bg-green-900/20 border border-green-700 rounded p-2">
                    <div className="text-green-400 text-xs font-medium flex items-center">
                      <span className="mr-2">✅</span>
                      Benefits
                    </div>
                    <div className="text-green-300 text-xs mt-1">
                      • Simplified balance management • No conversion delays • Instant withdrawals
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-white">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white">{selectedUser.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trading Mode:</span>
                <span className="text-white font-medium">{(selectedUser.trading_mode || 'normal').toUpperCase()}</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Wallet Address:</span>
                  <div className="flex-1 ml-3">
                    {selectedUser.wallet_address ? (<div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="text-white font-mono text-xs bg-gray-700 px-2 py-1 rounded break-all flex-1">
                            {selectedUser.wallet_address}
                          </span>
                          <Button variant="ghost" size="sm" onClick={function () { return navigator.clipboard.writeText(selectedUser.wallet_address || ''); }} className="text-gray-400 hover:text-white p-1 flex-shrink-0" title="Copy address">
                            📋
                          </Button>
                        </div>
                        {isSuperAdmin && (<Button variant="outline" size="sm" onClick={function () {
                        setShowUserModal(false);
                        openSuperAdminModal(selectedUser, 'wallet');
                    }} className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white text-xs">
                            🏦 Manage
                          </Button>)}
                      </div>) : (<div className="space-y-2">
                        <span className="text-gray-500 italic text-sm">Not set</span>
                        {isSuperAdmin && (<Button variant="outline" size="sm" onClick={function () {
                        setShowUserModal(false);
                        openSuperAdminModal(selectedUser, 'wallet');
                    }} className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white text-xs">
                            🏦 Set Address
                          </Button>)}
                      </div>)}
                  </div>
                </div>
              </div>

              {/* Phone Number Section */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Phone Number:</span>
                  <div className="flex-1 ml-3 text-right">
                    {selectedUser.phone ? (<span className="text-white font-mono text-sm">{selectedUser.phone}</span>) : (<span className="text-gray-500 italic text-sm">Not set</span>)}
                  </div>
                </div>
              </div>

              {/* Withdrawal Address Section */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Withdrawal Address:</span>
                  <div className="flex-1 ml-3">
                    {selectedUser.address ? (<div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="text-white text-sm bg-gray-700 px-2 py-1 rounded break-all flex-1">
                            {selectedUser.address}
                          </span>
                          <Button variant="ghost" size="sm" onClick={function () { return navigator.clipboard.writeText(selectedUser.address || ''); }} className="text-gray-400 hover:text-white p-1 flex-shrink-0" title="Copy withdrawal address">
                            📋
                          </Button>
                        </div>
                      </div>) : (<span className="text-gray-500 italic text-sm">Not set</span>)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-gray-700 pt-3">
                <span className="text-gray-400">Created:</span>
                <span className="text-white">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="text-white">
                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 pt-4 border-t border-gray-700">
              <div className="flex justify-end">
                <Button onClick={function () { return setShowUserModal(false); }} className="bg-purple-600 hover:bg-purple-700">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>)}

      {/* User Edit Modal */}
      {showEditModal && selectedUser && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">⚙️ Edit User</h3>
              <Button variant="ghost" size="sm" onClick={function () { return setShowEditModal(false); }} className="text-gray-400 hover:text-white">
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Username</label>
                <Input value={editFormData.username || ''} onChange={function (e) {
                console.log('🔄 Username changed:', e.target.value);
                setEditFormData(__assign(__assign({}, editFormData), { username: e.target.value }));
            }} className="bg-gray-700 border-gray-600 text-white w-full focus:ring-2 focus:ring-blue-500" placeholder="Enter username" autoComplete="off" disabled={false} readOnly={false}/>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Email</label>
                <Input type="email" value={editFormData.email || ''} onChange={function (e) {
                console.log('📧 Email changed:', e.target.value);
                setEditFormData(__assign(__assign({}, editFormData), { email: e.target.value }));
            }} className="bg-gray-700 border-gray-600 text-white w-full focus:ring-2 focus:ring-blue-500" placeholder="Enter email" autoComplete="off" disabled={false} readOnly={false}/>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Balance</label>
                <Input type="number" value={editFormData.balance || 0} onChange={function (e) {
                console.log('💰 Balance changed:', e.target.value);
                setEditFormData(__assign(__assign({}, editFormData), { balance: Number(e.target.value) }));
            }} className="bg-gray-700 border-gray-600 text-white w-full focus:ring-2 focus:ring-blue-500" placeholder="Enter balance" step="0.01" min="0" disabled={false} readOnly={false}/>
              </div>

              {/* Wallet Address Section - Only for superadmin */}
              {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin' && (<div>
                  <label className="text-gray-400 text-sm block mb-1">Wallet Address</label>
                  <Input value={editFormData.wallet_address || ''} onChange={function (e) {
                    console.log('🔄 Wallet address changed:', e.target.value);
                    setEditFormData(__assign(__assign({}, editFormData), { wallet_address: e.target.value }));
                }} placeholder="Enter wallet address (0x...)" className="bg-gray-700 border-gray-600 text-white"/>
                </div>)}

              <div>
                <label className="text-gray-400 text-sm block mb-1">Trading Mode</label>
                <Select value={editFormData.trading_mode} onValueChange={function (value) { return setEditFormData(__assign(__assign({}, editFormData), { trading_mode: value })); }}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-full">
                    <SelectValue placeholder="Select trading mode"/>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="win" className="text-white hover:bg-gray-600">
                      <span className="text-green-400 font-bold">WIN</span>
                    </SelectItem>
                    <SelectItem value="normal" className="text-white hover:bg-gray-600">
                      <span className="text-blue-400 font-bold">NORMAL</span>
                    </SelectItem>
                    <SelectItem value="lose" className="text-white hover:bg-gray-600">
                      <span className="text-red-400 font-bold">LOSE</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Role</label>
                <Select value={editFormData.role} onValueChange={function (value) { return setEditFormData(__assign(__assign({}, editFormData), { role: value })); }}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-full">
                    <SelectValue placeholder="Select role"/>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="user" className="text-white hover:bg-gray-600">User</SelectItem>
                    {/* Only superadmin can set admin or super_admin roles */}
                    {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin' && (<>
                        <SelectItem value="admin" className="text-white hover:bg-gray-600">Admin</SelectItem>
                        <SelectItem value="superadmin" className="text-white hover:bg-gray-600">Super Admin</SelectItem>
                      </>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Status</label>
                <Select value={editFormData.status} onValueChange={function (value) { return setEditFormData(__assign(__assign({}, editFormData), { status: value })); }}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-full">
                    <SelectValue placeholder="Select status"/>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="active" className="text-white hover:bg-gray-600">Active</SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-gray-600">Inactive</SelectItem>
                    <SelectItem value="suspended" className="text-white hover:bg-gray-600">Suspended</SelectItem>
                    <SelectItem value="banned" className="text-white hover:bg-gray-600">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={function () { return setShowEditModal(false); }}>
                Cancel
              </Button>
              <Button onClick={handleSaveUserEdit} className="bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
            </div>
          </div>
        </div>)}

      {/* Admin and Super Admin Modals */}
      {((currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'admin' || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin') && (<>
          {/* Deposit Modal */}
          {showDepositModal && selectedUserForAction && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">💰 Deposit to</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Amount ($)</label>
                    <Input type="number" value={depositAmount} onChange={function (e) { return setDepositAmount(e.target.value); }} placeholder="Enter deposit amount" className="bg-gray-700 border-gray-600 text-white"/>
                  </div>
                  <div className="text-sm text-gray-400">
                    Current Balance: {formatBalance(selectedUserForAction.balance)} USDT
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={function () { return setShowDepositModal(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeposit} className="bg-green-600 hover:bg-green-700">
                    Process Deposit
                  </Button>
                </div>
              </div>
            </div>)}

          {/* Withdrawal Modal */}
          {showWithdrawalModal && selectedUserForAction && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">💸 Withdraw from</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Amount ($)</label>
                    <Input type="number" value={withdrawalAmount} onChange={function (e) { return setWithdrawalAmount(e.target.value); }} placeholder="Enter withdrawal amount" className="bg-gray-700 border-gray-600 text-white"/>
                  </div>
                  <div className="text-sm text-gray-400">
                    Current Balance: {formatBalance(selectedUserForAction.balance)} USDT
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={function () { return setShowWithdrawalModal(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleWithdrawal} className="bg-red-600 hover:bg-red-700">
                    Process Withdrawal
                  </Button>
                </div>
              </div>
            </div>)}

          {/* Password Change Modal */}
          {showPasswordModal && selectedUserForAction && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">🔑 Change Password for</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">New Password</label>
                    <Input type="password" value={newPassword} onChange={function (e) { return setNewPassword(e.target.value); }} placeholder="Enter new password" className="bg-gray-700 border-gray-600 text-white"/>
                  </div>
                  <div className="text-sm text-yellow-400">
                    ⚠️ This will immediately change the user's login password
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={function () { return setShowPasswordModal(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange} className="bg-blue-600 hover:bg-blue-700">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>)}

          {/* Wallet Address Modal - Only for superadmin */}
          {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin' && showWalletModal && selectedUserForAction && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">🏦 Manage Wallet for</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Current Wallet Info */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Current Wallet Address</h4>
                    <div className="text-sm">
                      {selectedUserForAction.wallet_address ? (<div className="flex items-start space-x-2">
                          <span className="font-mono text-green-400 bg-gray-800 px-2 py-1 rounded break-all flex-1 text-xs">
                            {selectedUserForAction.wallet_address}
                          </span>
                          <Button variant="ghost" size="sm" onClick={function () { return navigator.clipboard.writeText(selectedUserForAction.wallet_address || ''); }} className="text-gray-400 hover:text-white p-1 flex-shrink-0" title="Copy address">
                            📋
                          </Button>
                        </div>) : (<span className="text-gray-400 italic">No wallet address set</span>)}
                    </div>
                  </div>

                  {/* New Wallet Address Input */}
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">New Wallet Address</label>
                    <Input value={newWalletAddress} onChange={function (e) { return setNewWalletAddress(e.target.value); }} placeholder="Enter new wallet address" className="bg-gray-700 border-gray-600 text-white"/>
                  </div>

                  {/* Previous Wallet Addresses */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Previous Wallet Addresses</h4>
                    {walletHistory.length > 0 ? (<div className="space-y-2 max-h-40 overflow-y-auto">
                        {Array.isArray(walletHistory) ? walletHistory.map(function (wallet, index) { return (<div key={index} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-mono text-sm text-gray-300">
                                {wallet.address ? "".concat(wallet.address.slice(0, 10), "...").concat(wallet.address.slice(-8)) : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Changed: {new Date(wallet.changed_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" onClick={function () { return setNewWalletAddress(wallet.address); }} className="text-blue-400 hover:text-blue-300 text-xs" title="Use this address">
                                Use
                              </Button>
                              <Button variant="ghost" size="sm" onClick={function () { return navigator.clipboard.writeText(wallet.address); }} className="text-gray-400 hover:text-white p-1" title="Copy address">
                                📋
                              </Button>
                            </div>
                          </div>); }) : []}
                      </div>) : (<div className="bg-gray-700 p-3 rounded text-center">
                        <div className="text-gray-400 text-sm">No previous wallet addresses found</div>
                      </div>)}
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded">
                    <div className="text-yellow-400 text-sm">
                      ⚠️ Changing the wallet address will move the current address to history
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={function () { return setShowWalletModal(false); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleWalletUpdate} className="bg-purple-600 hover:bg-purple-700" disabled={!newWalletAddress || newWalletAddress === selectedUserForAction.wallet_address}>
                    Update Wallet
                  </Button>
                </div>
              </div>
            </div>)}
        </>)}

      {/* Receipt Viewer Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={function () { return setSelectedReceipt(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Receipt: {selectedReceipt === null || selectedReceipt === void 0 ? void 0 : selectedReceipt.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {selectedReceipt && (<img src={selectedReceipt.url} alt="Receipt" className="max-w-full max-h-[70vh] object-contain rounded-lg" onError={function (e) {
                console.error('Failed to load receipt image');
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVjZWlwdCBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
            }}/>)}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Redeem Code Modal */}
      {showCreateCodeModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🎁 Create Redeem Code</h3>
              <Button variant="ghost" size="sm" onClick={function () { return setShowCreateCodeModal(false); }} className="text-gray-400 hover:text-white">
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Code *</label>
                <Input value={newRedeemCode.code} onChange={function (e) { return setNewRedeemCode(__assign(__assign({}, newRedeemCode), { code: e.target.value.toUpperCase() })); }} placeholder="e.g., BONUS100" className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Bonus Amount (USDT) *</label>
                <Input type="number" value={newRedeemCode.bonusAmount} onChange={function (e) { return setNewRedeemCode(__assign(__assign({}, newRedeemCode), { bonusAmount: e.target.value })); }} placeholder="100" className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Max Uses (optional)</label>
                <Input type="number" value={newRedeemCode.maxUses} onChange={function (e) { return setNewRedeemCode(__assign(__assign({}, newRedeemCode), { maxUses: e.target.value })); }} placeholder="Leave empty for unlimited" className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Description (optional)</label>
                <Input value={newRedeemCode.description} onChange={function (e) { return setNewRedeemCode(__assign(__assign({}, newRedeemCode), { description: e.target.value })); }} placeholder="Bonus code description" className="bg-gray-700 border-gray-600 text-white"/>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={function () { return setShowCreateCodeModal(false); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateRedeemCode} className="bg-purple-600 hover:bg-purple-700">
                Create Code
              </Button>
            </div>
          </div>
        </div>)}

      {/* Edit Redeem Code Modal */}
      {showEditCodeModal && editingCode && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">✏️ Edit Redeem Code</h3>
              <Button variant="ghost" size="sm" onClick={function () {
                setShowEditCodeModal(false);
                setEditingCode(null);
            }} className="text-gray-400 hover:text-white">
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Code
                </label>
                <input type="text" value={editingCode.code} disabled className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white opacity-50 cursor-not-allowed"/>
                <p className="text-xs text-gray-400 mt-1">Code cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bonus Amount (USDT)
                </label>
                <input type="number" step="0.01" value={editingCode.bonus_amount} onChange={function (e) { return setEditingCode(__assign(__assign({}, editingCode), { bonus_amount: e.target.value })); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Uses (optional)
                </label>
                <input type="number" value={editingCode.max_uses || ''} onChange={function (e) { return setEditingCode(__assign(__assign({}, editingCode), { max_uses: e.target.value })); }} placeholder="Unlimited" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <input type="text" value={editingCode.description || ''} onChange={function (e) { return setEditingCode(__assign(__assign({}, editingCode), { description: e.target.value })); }} placeholder="Code description" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"/>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={function () {
                setShowEditCodeModal(false);
                setEditingCode(null);
            }}>
                Cancel
              </Button>
              <Button onClick={handleEditRedeemCode} className="bg-blue-600 hover:bg-blue-700">
                Update Code
              </Button>
            </div>
          </div>
        </div>)}

      </div>
    </>);
}
