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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "../lib/queryClient";
import { useWebSocket } from "./useWebSocket";
export function useAuth() {
    var _this = this;
    var queryClient = useQueryClient();
    var lastMessage = useWebSocket().lastMessage;
    var _a = useQuery({
        queryKey: ["/api/auth"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var urlParams, urlToken, urlUser, authToken, response, error_1, storedUser, userData, error_2, storedUser, storedUser, userData, demoUser, adminUser, storedUser, userData, storedUser, userData, response, userData, error_3, is401Error, authToken_1, storedUser;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        urlParams = new URLSearchParams(window.location.search);
                        urlToken = urlParams.get('token');
                        urlUser = urlParams.get('user');
                        if (urlToken && urlUser) {
                            console.log("🔍 Found OAuth token in URL, storing locally");
                            localStorage.setItem('authToken', urlToken);
                            localStorage.setItem('user', decodeURIComponent(urlUser));
                            // Clean up URL
                            window.history.replaceState({}, document.title, window.location.pathname);
                            return [2 /*return*/, JSON.parse(decodeURIComponent(urlUser))];
                        }
                        authToken = localStorage.getItem('authToken');
                        console.log("🔍 useAuth queryFn - Auth token:", (authToken === null || authToken === void 0 ? void 0 : authToken.substring(0, 20)) + '...');
                        if (!authToken) {
                            console.log("No auth token found");
                            return [2 /*return*/, null];
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 13, , 14]);
                        if (!authToken.startsWith('user-session-')) return [3 /*break*/, 5];
                        console.log("Found user session token, fetching fresh user data from API");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, apiRequest("GET", "/api/auth/user")];
                    case 3:
                        response = _d.sent();
                        console.log("User session API response:", response);
                        // Update localStorage with fresh data
                        localStorage.setItem('user', JSON.stringify(response));
                        return [2 /*return*/, response];
                    case 4:
                        error_1 = _d.sent();
                        console.log("API call failed, falling back to stored user data:", error_1);
                        storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            console.log("Using fallback stored user data");
                            return [2 /*return*/, JSON.parse(storedUser)];
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        if (!authToken.startsWith('admin-session-')) return [3 /*break*/, 9];
                        console.log("Making API request for admin user");
                        _d.label = 6;
                    case 6:
                        _d.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, apiRequest("GET", "/api/auth")];
                    case 7:
                        userData = _d.sent();
                        console.log("Admin user query response:", userData);
                        return [2 /*return*/, userData];
                    case 8:
                        error_2 = _d.sent();
                        console.log("Admin API call failed, falling back to stored user data:", error_2);
                        storedUser = localStorage.getItem('user');
                        if (storedUser) {
                            console.log("Using fallback stored user data");
                            return [2 /*return*/, JSON.parse(storedUser)];
                        }
                        return [3 /*break*/, 9];
                    case 9:
                        // For admin tokens (admin-token-), use stored user data
                        if (authToken.startsWith('admin-token-')) {
                            console.log("🔧 Found admin-token, using stored user data");
                            storedUser = localStorage.getItem('user');
                            if (storedUser) {
                                userData = JSON.parse(storedUser);
                                console.log("🔧 Admin-token user data:", userData);
                                return [2 /*return*/, userData];
                            }
                        }
                        // For demo tokens, get from localStorage
                        if (authToken.startsWith('demo-token-')) {
                            demoUser = localStorage.getItem('demoUser');
                            if (demoUser) {
                                console.log("Found demo user in localStorage");
                                return [2 /*return*/, JSON.parse(demoUser)];
                            }
                        }
                        // For admin tokens, get from localStorage
                        if (authToken === 'mock-admin-token') {
                            adminUser = localStorage.getItem('user');
                            if (adminUser) {
                                console.log("Found admin user in localStorage");
                                return [2 /*return*/, JSON.parse(adminUser)];
                            }
                        }
                        // For mock JWT tokens (admin login), use stored user data
                        if (authToken && (authToken.startsWith('mock-jwt-token') || authToken === 'mock-jwt-token')) {
                            console.log("Found mock JWT token, using stored user data");
                            storedUser = localStorage.getItem('user');
                            if (storedUser) {
                                userData = JSON.parse(storedUser);
                                console.log("Mock JWT user data:", userData);
                                return [2 /*return*/, userData];
                            }
                        }
                        // For admin tokens (new format), use stored user data
                        if (authToken && (authToken.startsWith('token_admin-001_') || authToken.startsWith('token_superadmin-001_'))) {
                            console.log("🔧 Found admin token, using stored user data");
                            storedUser = localStorage.getItem('user');
                            if (storedUser) {
                                userData = JSON.parse(storedUser);
                                console.log("🔧 Admin token user data:", userData);
                                return [2 /*return*/, userData];
                            }
                        }
                        if (!(authToken && !authToken.startsWith('demo-token-') && !authToken.startsWith('admin-session-') && !authToken.startsWith('admin-token-') && !authToken.startsWith('mock-jwt-token') && authToken !== 'mock-jwt-token' && !authToken.startsWith('token_admin-001_') && !authToken.startsWith('token_superadmin-001_'))) return [3 /*break*/, 12];
                        console.log("Making API request for JWT token user");
                        return [4 /*yield*/, apiRequest("GET", "/api/auth")];
                    case 10:
                        response = _d.sent();
                        return [4 /*yield*/, response.json()];
                    case 11:
                        userData = _d.sent();
                        console.log("JWT user query response:", userData);
                        return [2 /*return*/, userData];
                    case 12:
                        console.log("🔍 No matching token pattern found");
                        return [2 /*return*/, null];
                    case 13:
                        error_3 = _d.sent();
                        console.log("🔴 Auth query error:", error_3);
                        is401Error = ((_a = error_3 === null || error_3 === void 0 ? void 0 : error_3.response) === null || _a === void 0 ? void 0 : _a.status) === 401 || ((_b = error_3 === null || error_3 === void 0 ? void 0 : error_3.message) === null || _b === void 0 ? void 0 : _b.includes('401')) || ((_c = error_3 === null || error_3 === void 0 ? void 0 : error_3.message) === null || _c === void 0 ? void 0 : _c.includes('User not found'));
                        if (is401Error) {
                            console.log("❌ 401 Unauthorized - User not found or deleted. Clearing auth data.");
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('demoUser');
                            localStorage.removeItem('user');
                            return [2 /*return*/, null];
                        }
                        authToken_1 = localStorage.getItem('authToken');
                        if (authToken_1 && (authToken_1.startsWith('mock-jwt-token') || authToken_1 === 'mock-jwt-token' || authToken_1 === 'mock-admin-token' || authToken_1.startsWith('token_admin-001_') || authToken_1.startsWith('token_superadmin-001_') || authToken_1.startsWith('admin-token-') || authToken_1.startsWith('user-session-'))) {
                            storedUser = localStorage.getItem('user');
                            if (storedUser) {
                                console.log("Auth query failed, but using stored user data for token:", authToken_1.substring(0, 20) + '...');
                                return [2 /*return*/, JSON.parse(storedUser)];
                            }
                        }
                        // Only clear token for real auth failures, not API errors
                        if (error_3.message && error_3.message.includes('401')) {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('demoUser');
                            localStorage.removeItem('user');
                        }
                        return [2 /*return*/, null];
                    case 14: return [2 /*return*/];
                }
            });
        }); },
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    }), user = _a.data, isLoading = _a.isLoading, error = _a.error;
    var userLoginMutation = useMutation({
        mutationFn: function (credentials) { return __awaiter(_this, void 0, void 0, function () {
            var response, data, error_4, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, apiRequest("POST", "/api/auth", credentials)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 3:
                        error_4 = _a.sent();
                        console.error("Login error:", error_4);
                        message = "Login failed";
                        if (error_4.message) {
                            if (error_4.message.includes("401")) {
                                message = "Invalid username or password";
                            }
                            else if (error_4.message.includes("400")) {
                                message = "Username and password are required";
                            }
                            else if (error_4.message.includes("500")) {
                                message = "Server error. Please try again later.";
                            }
                            else {
                                message = error_4.message;
                            }
                        }
                        throw new Error(message);
                    case 4: return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function (data) {
            // Store the token in localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            queryClient.setQueryData(["/api/auth"], data.user);
            queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
        },
    });
    var adminLoginMutation = useMutation({
        mutationFn: function (credentials) { return __awaiter(_this, void 0, void 0, function () {
            var endpoint, isLocal, isVercel, baseUrl, fullUrl, response, data, error_5, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        endpoint = "/api/admin/login";
                        isLocal = window.location.hostname === 'localhost' ||
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname === '0.0.0.0';
                        isVercel = window.location.hostname.includes('vercel.app');
                        baseUrl = isLocal ? 'http://127.0.0.1:3005' : '';
                        fullUrl = "".concat(baseUrl).concat(endpoint);
                        console.log('🔧 Login Debug Info:', {
                            isLocal: isLocal,
                            isVercel: isVercel,
                            isProd: import.meta.env.PROD,
                            hostname: window.location.hostname,
                            endpoint: endpoint,
                            baseUrl: baseUrl,
                            fullUrl: fullUrl
                        });
                        return [4 /*yield*/, fetch(fullUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(credentials),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Admin login error:", error_5);
                        message = "Admin login failed";
                        if (error_5.message) {
                            if (error_5.message.includes("401")) {
                                message = "Invalid admin credentials";
                            }
                            else if (error_5.message.includes("403")) {
                                message = "Access denied. Admin privileges required.";
                            }
                            else if (error_5.message.includes("400")) {
                                message = "Username and password are required";
                            }
                            else if (error_5.message.includes("500")) {
                                message = "Server error. Please try again later.";
                            }
                            else {
                                message = error_5.message;
                            }
                        }
                        throw new Error(message);
                    case 4: return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function (data) {
            console.log('🔧 Admin login success:', data);
            // Store the token in localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            // Store user data
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            queryClient.setQueryData(["/api/auth"], data.user);
            queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
        },
    });
    var logoutMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Try to call logout endpoint
                        return [4 /*yield*/, apiRequest("POST", "/api/auth?action=logout")];
                    case 1:
                        // Try to call logout endpoint
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.warn("Logout API failed, continuing with local cleanup:", error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            // Always clear local state regardless of API response
            queryClient.setQueryData(["/api/auth"], null);
            queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
            // Clear any stored auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.clear();
            // Force redirect to home page
            window.location.href = "/";
        },
        onError: function () {
            // Even if logout fails, clear local state and redirect
            queryClient.setQueryData(["/api/auth/user"], null);
            queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.clear();
            window.location.href = "/";
        },
    });
    var registerMutation = useMutation({
        mutationFn: function (userData) { return __awaiter(_this, void 0, void 0, function () {
            var response, error_7, fallbackResponse, result, fallbackError_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        return [4 /*yield*/, apiRequest("POST", "/api/auth", userData)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 2:
                        error_7 = _a.sent();
                        console.warn('Main auth endpoint failed, trying fallback:', error_7);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, apiRequest("POST", "/api/auth/user/register", {
                                username: userData.username,
                                email: userData.email,
                                password: userData.password
                            })];
                    case 4:
                        fallbackResponse = _a.sent();
                        result = fallbackResponse;
                        // Add a note that firstName/lastName weren't saved
                        if (userData.firstName || userData.lastName) {
                            console.warn('Note: firstName and lastName were not saved due to fallback endpoint limitations');
                        }
                        return [2 /*return*/, result];
                    case 5:
                        fallbackError_1 = _a.sent();
                        console.error('Both registration endpoints failed:', fallbackError_1);
                        errorMessage = (fallbackError_1 === null || fallbackError_1 === void 0 ? void 0 : fallbackError_1.message) || (fallbackError_1 === null || fallbackError_1 === void 0 ? void 0 : fallbackError_1.error) || 'Registration failed. Please try again.';
                        throw new Error(errorMessage);
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function (data) {
            // Store the token in localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            // Store user data for user-session tokens
            if (data.user && data.token && data.token.startsWith('user-session-')) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            queryClient.setQueryData(["/api/auth"], data.user);
            queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
        },
    });
    var metamaskLoginMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/auth", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response]; // apiRequest already returns parsed JSON
                }
            });
        }); },
        onSuccess: function (data) {
            // Store the token in localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            // Store user data for user-session tokens
            if (data.user && data.token && data.token.startsWith('user-session-')) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            queryClient.setQueryData(["/api/auth"], data.user);
            queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
        },
    });
    // Force refresh auth state
    var refreshAuth = function () {
        console.log("🔄 Force refreshing auth state");
        queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
        queryClient.refetchQueries({ queryKey: ["/api/auth"] });
    };
    // Listen for verification status updates via WebSocket
    useEffect(function () {
        if (lastMessage && lastMessage.type === 'verification_status_updated') {
            var userId = lastMessage.userId, verification_status = lastMessage.verification_status, message = lastMessage.message, forceRefresh = lastMessage.forceRefresh;
            // Check if this update is for the current user
            if (user && user.id === userId) {
                console.log('🔔 Verification status updated:', verification_status);
                // Force refresh user data to get updated verification status
                if (forceRefresh) {
                    // Clear any cached user data
                    localStorage.removeItem('user');
                    // Force a complete refresh of auth data
                    queryClient.removeQueries({ queryKey: ["/api/auth"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
                    queryClient.refetchQueries({ queryKey: ["/api/auth"] });
                    console.log('🔄 Forced complete refresh of user data');
                }
                else {
                    // Regular refresh
                    refreshAuth();
                }
                // Show notification to user
                if (typeof window !== 'undefined' && 'Notification' in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('Account Verification Update', {
                            body: message,
                            icon: '/favicon.ico'
                        });
                    }
                }
                // Also show a console message for debugging
                console.log('🎉 Verification status update:', message);
            }
        }
    }, [lastMessage, user, refreshAuth, queryClient]);
    return {
        user: user,
        isLoading: isLoading,
        isAuthenticated: !!user,
        error: error,
        userLogin: userLoginMutation.mutateAsync,
        adminLogin: adminLoginMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        metamaskLogin: metamaskLoginMutation.mutateAsync,
        refreshAuth: refreshAuth,
        isUserLoginPending: userLoginMutation.isPending,
        isAdminLoginPending: adminLoginMutation.isPending,
        isLogoutPending: logoutMutation.isPending,
        isRegisterPending: registerMutation.isPending,
        isMetamaskLoginPending: metamaskLoginMutation.isPending,
    };
}
