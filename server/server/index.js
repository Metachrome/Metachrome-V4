"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables first
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log('🔧 Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const vite_1 = require("./vite");
const test_db_connection_1 = require("./test-db-connection");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const security_1 = require("./security");
const errorHandler_1 = require("./errorHandler");
const app = (0, express_1.default)();
// Enhanced Security middleware
app.use((0, helmet_1.default)({
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
app.use(errorHandler_1.requestIdMiddleware);
// Apply comprehensive security middleware
app.use(security_1.securityMiddleware);
// CORS configuration - temporarily allow all origins for debugging
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:4000'];
console.log('🔧 CORS allowed origins:', allowedOrigins);
app.use((0, cors_1.default)({
    origin: true, // Allow all origins temporarily
    credentials: true,
}));
// Enhanced Rate limiting with specific limits for different endpoints
app.use('/api', security_1.apiLimiter);
app.use('/api/auth', security_1.authLimiter);
app.use('/api/trades', security_1.tradingLimiter);
console.log('🛡️ Enhanced rate limiting enabled for all API endpoints');
// Session configuration
app.use((0, express_session_1.default)({
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
app.use('/api/webhooks/stripe', express_1.default.raw({ type: 'application/json' }));
// Enhanced body parsing with security limits
app.use(express_1.default.json({
    limit: '1mb',
    verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        req.rawBody = buf;
    }
}));
app.use(express_1.default.urlencoded({ extended: false, limit: '1mb' }));
// CSRF Token endpoint
app.get('/api/auth/csrf', (req, res) => {
    const token = (0, security_1.generateCSRFToken)(req.sessionID);
    res.json({ csrfToken: token });
});
// Health check endpoint
app.get('/health', errorHandler_1.healthCheck);
app.get('/api/health', errorHandler_1.healthCheck);
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            (0, vite_1.log)(logLine);
        }
    });
    next();
});
(async () => {
    // Setup test route for debugging database connection
    (0, test_db_connection_1.setupTestRoute)(app);
    const server = await (0, routes_1.registerRoutes)(app);
    // CSRF Protection for state-changing operations (only for specific API routes)
    // Apply after routes are registered so exclusions work properly
    // Temporarily disable admin CSRF for system endpoints
    app.use('/api/trades', security_1.csrfProtection);
    app.use('/api/users', security_1.csrfProtection);
    // Note: /api/admin CSRF temporarily disabled for system endpoints
    // Setup static file serving AFTER routes but BEFORE 404 handler
    if (app.get("env") === "development") {
        await (0, vite_1.setupVite)(app, server);
    }
    else {
        (0, vite_1.serveStatic)(app);
    }
    // 404 handler for unmatched routes (must come after static file serving)
    app.use(errorHandler_1.notFoundHandler);
    // Enhanced error handler with comprehensive logging
    app.use(errorHandler_1.errorHandler);
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 3001 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0';
    server.listen(port, host, () => {
        (0, vite_1.log)(`🚀 Server running on port ${port} on ${host}`);
        (0, vite_1.log)(`🛡️ Security features enabled: Rate limiting, CSRF protection, Input sanitization`);
        (0, vite_1.log)(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
        (0, vite_1.log)(`📊 Error handling and logging system active`);
        errorHandler_1.Logger.info('Server started successfully', {
            port,
            host,
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
        });
    });
    // Setup graceful shutdown handling (disabled in development to prevent SIGINT issues)
    if (process.env.NODE_ENV === 'production') {
        (0, errorHandler_1.setupGracefulShutdown)();
    }
    else {
        console.log('🚫 Graceful shutdown disabled in development mode');
    }
})();
