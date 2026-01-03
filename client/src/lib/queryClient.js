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
import { QueryClient } from "@tanstack/react-query";
// Get API base URL from environment or use Vite proxy for development
var getApiBaseUrl = function () {
    // Check if we're running locally (localhost or 127.0.0.1)
    var isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '0.0.0.0';
    // Check if we're on Vercel (vercel.app domain)
    var isVercel = window.location.hostname.includes('vercel.app');
    // Check if we're on Railway (railway.app domain) - kept for compatibility
    var isRailway = window.location.hostname.includes('railway.app');
    // Check if we're on metachrome.io (production domain)
    var isMetachromeIO = window.location.hostname.includes('metachrome.io');
    console.log('🔧 API Base URL Detection:', {
        hostname: window.location.hostname,
        isLocal: isLocal,
        isVercel: isVercel,
        isRailway: isRailway,
        isMetachromeIO: isMetachromeIO,
        isProd: import.meta.env.PROD
    });
    // Production deployment on Vercel or Railway - use relative URLs
    if ((isVercel || isRailway || isMetachromeIO) || (import.meta.env.PROD && !isLocal)) {
        console.log('🌐 Using production API endpoints (relative URLs)');
        return '';
    }
    // Development or local production - use local server with same hostname
    if (isLocal) {
        console.log('🏠 Using local server endpoints');
        var hostname = window.location.hostname;
        return "http://".concat(hostname, ":3005");
    }
    // Fallback to Vite proxy
    console.log('🔄 Using Vite proxy');
    return '';
};
var API_BASE_URL = getApiBaseUrl();
// Production logging (minimal)
if (import.meta.env.DEV) {
    console.log('🔧 API Base URL:', API_BASE_URL);
}
function throwIfResNotOk(res) {
    return __awaiter(this, void 0, void 0, function () {
        var errorMessage, errorData, _a, text, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!!res.ok) return [3 /*break*/, 9];
                    errorMessage = res.statusText;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 8]);
                    return [4 /*yield*/, res.json()];
                case 2:
                    errorData = _c.sent();
                    errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
                    return [3 /*break*/, 8];
                case 3:
                    _a = _c.sent();
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, res.text()];
                case 5:
                    text = _c.sent();
                    errorMessage = text || res.statusText;
                    return [3 /*break*/, 7];
                case 6:
                    _b = _c.sent();
                    // If both fail, use status text
                    errorMessage = res.statusText;
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 8];
                case 8: throw new Error("".concat(res.status, ": ").concat(errorMessage));
                case 9: return [2 /*return*/];
            }
        });
    });
}
export function apiRequest(method, url, data) {
    return __awaiter(this, void 0, void 0, function () {
        var fullUrl, token, headers, isLoginOrRegisterRequest, res, jsonData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fullUrl = "".concat(API_BASE_URL).concat(url);
                    // Development logging only
                    if (import.meta.env.DEV) {
                        console.log("\uD83C\uDF10 API Request: ".concat(method, " ").concat(url));
                    }
                    token = localStorage.getItem('authToken');
                    headers = {};
                    if (data) {
                        headers["Content-Type"] = "application/json";
                    }
                    isLoginOrRegisterRequest = url.includes('/login') || url.includes('/register');
                    if (token && !isLoginOrRegisterRequest) {
                        headers["Authorization"] = "Bearer ".concat(token);
                        if (import.meta.env.DEV) {
                            console.log("\uD83D\uDD10 Adding Authorization header for ".concat(url, ": Bearer ").concat(token.substring(0, 30), "..."));
                        }
                    }
                    else if (import.meta.env.DEV && url.includes('/auth')) {
                        console.log("\uD83D\uDD10 NOT adding Authorization header for ".concat(url, " - token: ").concat(token ? 'exists' : 'missing'));
                    }
                    return [4 /*yield*/, fetch(fullUrl, {
                            method: method,
                            headers: headers,
                            body: data ? JSON.stringify(data) : undefined,
                            credentials: url.includes('/admin-login') ? "omit" : "include",
                        })];
                case 1:
                    res = _a.sent();
                    // Development logging only
                    if (import.meta.env.DEV && !res.ok) {
                        console.error("\uD83D\uDCE1 API Error: ".concat(res.status, " ").concat(res.statusText));
                    }
                    return [4 /*yield*/, throwIfResNotOk(res)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    jsonData = _a.sent();
                    return [2 /*return*/, jsonData];
            }
        });
    });
}
export var getQueryFn = function (_a) {
    var unauthorizedBehavior = _a.on401;
    return function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var url, token, headers, res;
        var queryKey = _b.queryKey;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    url = "".concat(API_BASE_URL).concat(queryKey.join("/"));
                    token = localStorage.getItem('authToken');
                    headers = {};
                    if (token) {
                        headers["Authorization"] = "Bearer ".concat(token);
                    }
                    return [4 /*yield*/, fetch(url, {
                            headers: headers,
                            credentials: "include",
                        })];
                case 1:
                    res = _c.sent();
                    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, throwIfResNotOk(res)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, res.json()];
                case 3: return [2 /*return*/, _c.sent()];
            }
        });
    }); };
};
export var queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn({ on401: "throw" }),
            refetchInterval: false,
            refetchOnWindowFocus: false,
            staleTime: 0, // Changed from Infinity to 0 for immediate refresh
            cacheTime: 0, // Disable caching for real-time updates
            retry: false,
        },
        mutations: {
            retry: false,
        },
    },
});
