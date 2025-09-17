"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminValidation = exports.tradeValidation = exports.authValidation = exports.apiLimiter = exports.tradingLimiter = exports.authLimiter = void 0;
exports.generateCSRFToken = generateCSRFToken;
exports.verifyCSRFToken = verifyCSRFToken;
exports.csrfProtection = csrfProtection;
exports.sanitizeInput = sanitizeInput;
exports.requestLogger = requestLogger;
exports.securityHeaders = securityHeaders;
exports.handleValidationErrors = handleValidationErrors;
exports.securityMiddleware = securityMiddleware;
exports.securityErrorHandler = securityErrorHandler;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_validator_1 = require("express-validator");
const crypto_1 = __importDefault(require("crypto"));
// CSRF Token Management
const csrfTokens = new Map();
// Generate CSRF token
function generateCSRFToken(sessionId) {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour
    csrfTokens.set(sessionId, { token, expires });
    // Clean up expired tokens
    for (const [id, data] of csrfTokens.entries()) {
        if (data.expires < Date.now()) {
            csrfTokens.delete(id);
        }
    }
    return token;
}
// Verify CSRF token
function verifyCSRFToken(sessionId, token) {
    const stored = csrfTokens.get(sessionId);
    if (!stored || stored.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        return false;
    }
    return crypto_1.default.timingSafeEqual(Buffer.from(stored.token, 'hex'), Buffer.from(token, 'hex'));
}
// CSRF Protection Middleware
function csrfProtection(req, res, next) {
    // TEMPORARILY DISABLE CSRF FOR ALL ADMIN ENDPOINTS
    if (req.method === 'GET' ||
        req.path.startsWith('/api/auth/csrf') ||
        req.path.startsWith('/api/auth/admin/login') ||
        req.path.startsWith('/api/auth/login') ||
        req.path.startsWith('/api/admin')) {
        return next();
    }
    const sessionId = req.sessionID;
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!sessionId || !token || !verifyCSRFToken(sessionId, token)) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            code: 'CSRF_INVALID'
        });
    }
    next();
}
// Input Sanitization Middleware
function sanitizeInput(req, res, next) {
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters
            return value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        }
        if (typeof value === 'object' && value !== null) {
            const sanitized = Array.isArray(value) ? [] : {};
            for (const key in value) {
                sanitized[key] = sanitizeValue(value[key]);
            }
            return sanitized;
        }
        return value;
    };
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    if (req.query) {
        req.query = sanitizeValue(req.query);
    }
    if (req.params) {
        req.params = sanitizeValue(req.params);
    }
    next();
}
// Request Logging Middleware
function requestLogger(req, res, next) {
    const start = Date.now();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip,
            userAgent,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('Content-Length') || '0'
        };
        // Log suspicious activity
        if (res.statusCode >= 400 || duration > 5000) {
            console.warn('🚨 Suspicious request:', logData);
        }
        else {
            console.log('📝 Request:', `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
}
// Security Headers Middleware
function securityHeaders(req, res, next) {
    // Remove server information
    res.removeHeader('X-Powered-By');
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // HSTS for production
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
}
// Rate Limiting Configurations
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 minutes in production, 1 hour in development
    max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 attempts in production, 50 in development
    message: {
        error: 'Too many authentication attempts from this IP, please try again later.',
        code: 'RATE_LIMIT_AUTH'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`🚨 Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many authentication attempts from this IP, please try again later.',
            code: 'RATE_LIMIT_AUTH'
        });
    }
});
exports.tradingLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 trades per minute
    message: {
        error: 'Too many trading requests, please slow down.',
        code: 'RATE_LIMIT_TRADING'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`🚨 Trading rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many trading requests, please slow down.',
            code: 'RATE_LIMIT_TRADING'
        });
    }
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_API'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Input Validation Rules
exports.authValidation = [
    (0, express_validator_1.body)('email').optional().isEmail().normalizeEmail(),
    (0, express_validator_1.body)('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    (0, express_validator_1.body)('password').optional().isLength({ min: 8, max: 128 }),
    (0, express_validator_1.body)('walletAddress').optional().matches(/^0x[a-fA-F0-9]{40}$/),
];
exports.tradeValidation = [
    (0, express_validator_1.body)('symbol').isString().isLength({ min: 6, max: 10 }).matches(/^[A-Z]+$/),
    (0, express_validator_1.body)('amount').isNumeric().custom((value) => {
        const num = parseFloat(value);
        if (num <= 0 || num > 1000000) {
            throw new Error('Amount must be between 0 and 1,000,000');
        }
        return true;
    }),
    (0, express_validator_1.body)('direction').isIn(['up', 'down']),
    (0, express_validator_1.body)('duration').isInt({ min: 30, max: 3600 }),
];
exports.adminValidation = [
    (0, express_validator_1.body)('userId').isUUID(),
    (0, express_validator_1.body)('controlType').optional().isIn(['normal', 'win', 'lose']),
    (0, express_validator_1.body)('role').optional().isIn(['user', 'admin', 'super_admin']),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
];
// Validation Error Handler
function handleValidationErrors(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array(),
            code: 'VALIDATION_ERROR'
        });
    }
    next();
}
// Combined Security Middleware
function securityMiddleware(req, res, next) {
    // Apply security headers
    securityHeaders(req, res, () => {
        // Apply input sanitization
        sanitizeInput(req, res, () => {
            // Apply request logging
            requestLogger(req, res, next);
        });
    });
}
// Error Handler for Security Issues
function securityErrorHandler(err, req, res, next) {
    console.error('🚨 Security Error:', err);
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    }
    else {
        res.status(500).json({
            error: err.message,
            stack: err.stack,
            code: 'INTERNAL_ERROR'
        });
    }
}
