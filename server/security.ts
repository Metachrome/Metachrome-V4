import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult, param, query } from 'express-validator';
import crypto from 'crypto';

// CSRF Token Management
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate CSRF token
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
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
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored || stored.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(stored.token, 'hex'),
    Buffer.from(token, 'hex')
  );
}

// CSRF Protection Middleware
export function csrfProtection(req: any, res: Response, next: NextFunction) {
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
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
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
export function requestLogger(req: Request, res: Response, next: NextFunction) {
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
    } else {
      console.log('📝 Request:', `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    }
  });

  next();
}

// Security Headers Middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
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
export const authLimiter = rateLimit({
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

export const tradingLimiter = rateLimit({
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

export const apiLimiter = rateLimit({
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
export const authValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('username').optional().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').optional().isLength({ min: 8, max: 128 }),
  body('walletAddress').optional().matches(/^0x[a-fA-F0-9]{40}$/),
];

export const tradeValidation = [
  body('symbol').isString().isLength({ min: 6, max: 10 }).matches(/^[A-Z]+$/),
  body('amount').isNumeric().custom((value) => {
    const num = parseFloat(value);
    if (num <= 0 || num > 1000000) {
      throw new Error('Amount must be between 0 and 1,000,000');
    }
    return true;
  }),
  body('direction').isIn(['up', 'down']),
  body('duration').isInt({ min: 30, max: 3600 }),
];

export const adminValidation = [
  body('userId').isUUID(),
  body('controlType').optional().isIn(['normal', 'win', 'lose']),
  body('role').optional().isIn(['user', 'admin', 'super_admin']),
  body('isActive').optional().isBoolean(),
];

// Validation Error Handler
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
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
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
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
export function securityErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('🚨 Security Error:', err);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      code: 'INTERNAL_ERROR'
    });
  }
}
