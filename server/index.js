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
var _a;
// Load environment variables first
import dotenv from "dotenv";
dotenv.config();
console.log('🔧 Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupTestRoute } from "./test-db-connection";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { securityMiddleware, csrfProtection, authLimiter, tradingLimiter, apiLimiter, generateCSRFToken } from "./security";
import { errorHandler, notFoundHandler, requestIdMiddleware, setupGracefulShutdown, healthCheck, Logger } from "./errorHandler";
import { setupChatTables } from "./setup-chat-tables";
import { checkChatTables } from "./check-chat-tables";
import { registerChatSetupRoute } from "./setup-chat-admin";
var app = express();
// Enhanced Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://replit.com", "https://s3.tradingview.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "wss:", "ws:", "https:", "http:", "https://api.binance.com", "wss://stream.binance.com"],
            frameSrc: ["'self'", "https://js.stripe.com", "https://s.tradingview.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
// Apply request ID middleware for tracking
app.use(requestIdMiddleware);
// Apply comprehensive security middleware
app.use(securityMiddleware);
// MetaMask Trust Headers - Add security headers to increase trust score
app.use(function (req, res, next) {
    // Security headers that MetaMask checks
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions Policy (formerly Feature-Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    // Web3 Platform Indicator
    res.setHeader('X-Web3-Platform', 'METACHROME');
    next();
});
// CORS configuration - temporarily allow all origins for debugging
var allowedOrigins = ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:4000'];
console.log('🔧 CORS allowed origins:', allowedOrigins);
app.use(cors({
    origin: true, // Allow all origins temporarily
    credentials: true,
}));
// Enhanced Rate limiting with specific limits for different endpoints
// NOTE: /sse/* endpoints are NOT under /api/* so they bypass rate limiting automatically
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/trades', tradingLimiter);
console.log('🛡️ Enhanced rate limiting enabled for all API endpoints');
// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for localhost, true only for HTTPS in real production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax' // Add sameSite for better compatibility
    }
}));
// Raw body middleware for Stripe webhooks (must be before JSON middleware)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
// Enhanced body parsing with security limits
app.use(express.json({
    limit: '1mb',
    verify: function (req, res, buf) {
        // Store raw body for webhook verification if needed
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
// CSRF Token endpoint
app.get('/api/auth/csrf', function (req, res) {
    var token = generateCSRFToken(req.sessionID);
    res.json({ csrfToken: token });
});
// Health check endpoint
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);
app.use(function (req, res, next) {
    var start = Date.now();
    var path = req.path;
    var capturedJsonResponse = undefined;
    var originalResJson = res.json;
    res.json = function (bodyJson) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, __spreadArray([bodyJson], args, true));
    };
    res.on("finish", function () {
        var duration = Date.now() - start;
        if (path.startsWith("/api")) {
            var logLine = "".concat(req.method, " ").concat(path, " ").concat(res.statusCode, " in ").concat(duration, "ms");
            if (capturedJsonResponse) {
                logLine += " :: ".concat(JSON.stringify(capturedJsonResponse));
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            log(logLine);
        }
    });
    next();
});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var checkResult, error_1, server, port, host;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // Setup test route for debugging database connection
                setupTestRoute(app);
                _d.label = 1;
            case 1:
                _d.trys.push([1, 6, , 7]);
                return [4 /*yield*/, checkChatTables()];
            case 2:
                checkResult = _d.sent();
                if (!!checkResult.allTablesExist) return [3 /*break*/, 4];
                console.log('⚠️ Chat tables missing, attempting to create...');
                return [4 /*yield*/, setupChatTables()];
            case 3:
                _d.sent();
                console.log('✅ Chat system tables created successfully');
                return [3 /*break*/, 5];
            case 4:
                console.log('✅ Chat system tables already exist');
                console.log("\uD83D\uDCCA Current data: ".concat(((_a = checkResult.counts) === null || _a === void 0 ? void 0 : _a.conversations) || 0, " conversations, ").concat(((_b = checkResult.counts) === null || _b === void 0 ? void 0 : _b.messages) || 0, " messages, ").concat(((_c = checkResult.counts) === null || _c === void 0 ? void 0 : _c.faqs) || 0, " FAQs"));
                _d.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                error_1 = _d.sent();
                console.error('❌ Failed to setup chat tables:', error_1);
                console.error('❌ MANUAL ACTION REQUIRED: Run CHAT_SYSTEM_QUICK_FIX.sql in Supabase SQL Editor');
                return [3 /*break*/, 7];
            case 7:
                // Register chat setup admin route (must be before registerRoutes)
                registerChatSetupRoute(app);
                return [4 /*yield*/, registerRoutes(app)];
            case 8:
                server = _d.sent();
                // CSRF Protection for state-changing operations (only for specific API routes)
                // Apply after routes are registered so exclusions work properly
                // Temporarily disable admin CSRF for system endpoints
                app.use('/api/trades', csrfProtection);
                app.use('/api/users', csrfProtection);
                if (!(app.get("env") === "development")) return [3 /*break*/, 10];
                return [4 /*yield*/, setupVite(app, server)];
            case 9:
                _d.sent();
                return [3 /*break*/, 11];
            case 10:
                serveStatic(app);
                _d.label = 11;
            case 11:
                // 404 handler for unmatched routes (must come after static file serving)
                app.use(notFoundHandler);
                // Enhanced error handler with comprehensive logging
                app.use(errorHandler);
                port = parseInt(process.env.PORT || '3001', 10);
                host = process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0';
                server.listen(port, host, function () {
                    log("\uD83D\uDE80 Server running on port ".concat(port, " on ").concat(host));
                    log("\uD83D\uDEE1\uFE0F Security features enabled: Rate limiting, CSRF protection, Input sanitization");
                    log("\uD83D\uDD12 Environment: ".concat(process.env.NODE_ENV || 'development'));
                    log("\uD83D\uDCCA Error handling and logging system active");
                    Logger.info('Server started successfully', {
                        port: port,
                        host: host,
                        environment: process.env.NODE_ENV || 'development',
                        nodeVersion: process.version,
                    });
                });
                // Setup graceful shutdown handling (disabled in development to prevent SIGINT issues)
                if (process.env.NODE_ENV === 'production') {
                    setupGracefulShutdown();
                }
                else {
                    console.log('🚫 Graceful shutdown disabled in development mode');
                }
                return [2 /*return*/];
        }
    });
}); })();
