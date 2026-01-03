import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
// CSRF Token Management
var csrfTokens = new Map();
// Generate CSRF token
export function generateCSRFToken(sessionId) {
    var token = crypto.randomBytes(32).toString('hex');
    var expires = Date.now() + (60 * 60 * 1000); // 1 hour
    csrfTokens.set(sessionId, { token: token, expires: expires });
    // Clean up expired tokens
    for (var _i = 0, _a = csrfTokens.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], data = _b[1];
        if (data.expires < Date.now()) {
            csrfTokens.delete(id);
        }
    }
    return token;
}
// Verify CSRF token
export function verifyCSRFToken(sessionId, token) {
    var stored = csrfTokens.get(sessionId);
    if (!stored || stored.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(stored.token, 'hex'), Buffer.from(token, 'hex'));
}
// CSRF Protection Middleware
export function csrfProtection(req, res, next) {
    // TEMPORARILY DISABLE CSRF FOR ALL ADMIN ENDPOINTS
    if (req.method === 'GET' ||
        req.path.startsWith('/api/auth/csrf') ||
        req.path.startsWith('/api/auth/admin/login') ||
        req.path.startsWith('/api/auth/login') ||
        req.path.startsWith('/api/admin')) {
        return next();
    }
    var sessionId = req.sessionID;
    var token = req.headers['x-csrf-token'] || req.body._csrf;
    if (!sessionId || !token || !verifyCSRFToken(sessionId, token)) {
        return res.status(403).json({
            error: 'Invalid CSRF token',
            code: 'CSRF_INVALID'
        });
    }
    next();
}
// Input Sanitization Middleware
export function sanitizeInput(req, res, next) {
    var sanitizeValue = function (value) {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters
            return value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
        }
        if (typeof value === 'object' && value !== null) {
            var sanitized = Array.isArray(value) ? [] : {};
            for (var key in value) {
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
export function requestLogger(req, res, next) {
    var start = Date.now();
    var ip = req.ip || req.connection.remoteAddress;
    var userAgent = req.get('User-Agent') || 'Unknown';
    res.on('finish', function () {
        var duration = Date.now() - start;
        var logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip: ip,
            userAgent: userAgent,
            statusCode: res.statusCode,
            duration: "".concat(duration, "ms"),
            contentLength: res.get('Content-Length') || '0'
        };
        // Log suspicious activity
        if (res.statusCode >= 400 || duration > 5000) {
            console.warn('🚨 Suspicious request:', logData);
        }
        else {
            console.log('📝 Request:', "".concat(req.method, " ").concat(req.url, " - ").concat(res.statusCode, " (").concat(duration, "ms)"));
        }
    });
    next();
}
// Security Headers Middleware
export function securityHeaders(req, res, next) {
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
export var authLimiter = rateLimit({
    windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 60 * 1000, // 15 minutes in production, 1 hour in development
    max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 attempts in production, 50 in development
    message: {
        error: 'Too many authentication attempts from this IP, please try again later.',
        code: 'RATE_LIMIT_AUTH'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        console.warn("\uD83D\uDEA8 Auth rate limit exceeded for IP: ".concat(req.ip));
        res.status(429).json({
            error: 'Too many authentication attempts from this IP, please try again later.',
            code: 'RATE_LIMIT_AUTH'
        });
    }
});
export var tradingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each IP to 20 trades per minute
    message: {
        error: 'Too many trading requests, please slow down.',
        code: 'RATE_LIMIT_TRADING'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: function (req, res) {
        console.warn("\uD83D\uDEA8 Trading rate limit exceeded for IP: ".concat(req.ip));
        res.status(429).json({
            error: 'Too many trading requests, please slow down.',
            code: 'RATE_LIMIT_TRADING'
        });
    }
});
export var apiLimiter = rateLimit({
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
export var authValidation = [
    body('email').optional().isEmail().normalizeEmail(),
    body('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('password').optional().isLength({ min: 8, max: 128 }),
    body('walletAddress').optional().matches(/^0x[a-fA-F0-9]{40}$/),
];
export var tradeValidation = [
    body('symbol').isString().isLength({ min: 6, max: 10 }).matches(/^[A-Z]+$/),
    body('amount').isNumeric().custom(function (value) {
        var num = parseFloat(value);
        if (num <= 0 || num > 1000000) {
            throw new Error('Amount must be between 0 and 1,000,000');
        }
        return true;
    }),
    body('direction').isIn(['up', 'down']),
    body('duration').isInt({ min: 30, max: 3600 }),
];
export var adminValidation = [
    body('userId').isUUID(),
    body('controlType').optional().isIn(['normal', 'win', 'lose']),
    body('role').optional().isIn(['user', 'admin', 'super_admin']),
    body('isActive').optional().isBoolean(),
];
// Validation Error Handler
export function handleValidationErrors(req, res, next) {
    var errors = validationResult(req);
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
export function securityMiddleware(req, res, next) {
    // Apply security headers
    securityHeaders(req, res, function () {
        // Apply input sanitization
        sanitizeInput(req, res, function () {
            // Apply request logging
            requestLogger(req, res, next);
        });
    });
}
// Error Handler for Security Issues
export function securityErrorHandler(err, req, res, next) {
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
