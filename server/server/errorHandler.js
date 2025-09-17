"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.createWalletError = exports.createTradingError = exports.createExternalApiError = exports.createDatabaseError = exports.createRateLimitError = exports.createNotFoundError = exports.createAuthorizationError = exports.createAuthenticationError = exports.createValidationError = exports.AppError = exports.ErrorType = void 0;
exports.requestIdMiddleware = requestIdMiddleware;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.notFoundHandler = notFoundHandler;
exports.setupGracefulShutdown = setupGracefulShutdown;
exports.healthCheck = healthCheck;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Error types
var ErrorType;
(function (ErrorType) {
    ErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ErrorType["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    ErrorType["NOT_FOUND_ERROR"] = "NOT_FOUND_ERROR";
    ErrorType["RATE_LIMIT_ERROR"] = "RATE_LIMIT_ERROR";
    ErrorType["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorType["EXTERNAL_API_ERROR"] = "EXTERNAL_API_ERROR";
    ErrorType["TRADING_ERROR"] = "TRADING_ERROR";
    ErrorType["WALLET_ERROR"] = "WALLET_ERROR";
    ErrorType["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// Custom error class
class AppError extends Error {
    constructor(message, type, statusCode = 500, isOperational = true, metadata) {
        super(message);
        this.type = type;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        this.metadata = metadata;
        Error.captureStackTrace(this, this.constructor);
    }
    setRequestId(requestId) {
        this.requestId = requestId;
        return this;
    }
    setUserId(userId) {
        this.userId = userId;
        return this;
    }
}
exports.AppError = AppError;
// Error factory functions
const createValidationError = (message, details) => new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, { details });
exports.createValidationError = createValidationError;
const createAuthenticationError = (message = 'Authentication required') => new AppError(message, ErrorType.AUTHENTICATION_ERROR, 401);
exports.createAuthenticationError = createAuthenticationError;
const createAuthorizationError = (message = 'Insufficient permissions') => new AppError(message, ErrorType.AUTHORIZATION_ERROR, 403);
exports.createAuthorizationError = createAuthorizationError;
const createNotFoundError = (resource) => new AppError(`${resource} not found`, ErrorType.NOT_FOUND_ERROR, 404);
exports.createNotFoundError = createNotFoundError;
const createRateLimitError = (message = 'Rate limit exceeded') => new AppError(message, ErrorType.RATE_LIMIT_ERROR, 429);
exports.createRateLimitError = createRateLimitError;
const createDatabaseError = (message, originalError) => new AppError(message, ErrorType.DATABASE_ERROR, 500, true, { originalError: originalError?.message });
exports.createDatabaseError = createDatabaseError;
const createExternalApiError = (service, message) => new AppError(`${service} API error: ${message}`, ErrorType.EXTERNAL_API_ERROR, 502);
exports.createExternalApiError = createExternalApiError;
const createTradingError = (message, tradeData) => new AppError(message, ErrorType.TRADING_ERROR, 400, true, { tradeData });
exports.createTradingError = createTradingError;
const createWalletError = (message, walletAddress) => new AppError(message, ErrorType.WALLET_ERROR, 400, true, { walletAddress });
exports.createWalletError = createWalletError;
// Logger class
class Logger {
    static formatLog(level, message, metadata) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...metadata,
        };
        return JSON.stringify(logEntry) + '\n';
    }
    static writeToFile(filename, content) {
        try {
            fs_1.default.appendFileSync(filename, content);
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }
    static error(message, error, metadata) {
        const logData = {
            message,
            error: error?.message,
            stack: error?.stack,
            type: error instanceof AppError ? error.type : 'UNKNOWN',
            ...metadata,
        };
        const logEntry = this.formatLog('ERROR', message, logData);
        this.writeToFile(this.errorLogFile, logEntry);
        // Also log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error('🚨 ERROR:', logData);
        }
    }
    static warn(message, metadata) {
        const logEntry = this.formatLog('WARN', message, metadata);
        this.writeToFile(this.errorLogFile, logEntry);
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ WARNING:', message, metadata);
        }
    }
    static info(message, metadata) {
        const logEntry = this.formatLog('INFO', message, metadata);
        this.writeToFile(this.accessLogFile, logEntry);
        if (process.env.NODE_ENV !== 'production') {
            console.log('ℹ️ INFO:', message, metadata);
        }
    }
    static trade(message, tradeData) {
        const logEntry = this.formatLog('TRADE', message, tradeData);
        this.writeToFile(this.tradeLogFile, logEntry);
        console.log('💰 TRADE:', message, tradeData);
    }
    static security(message, metadata) {
        const logEntry = this.formatLog('SECURITY', message, metadata);
        this.writeToFile(this.errorLogFile, logEntry);
        console.warn('🔒 SECURITY:', message, metadata);
    }
}
exports.Logger = Logger;
_a = Logger;
Logger.logDir = path_1.default.join(process.cwd(), 'logs');
Logger.errorLogFile = path_1.default.join(_a.logDir, 'error.log');
Logger.accessLogFile = path_1.default.join(_a.logDir, 'access.log');
Logger.tradeLogFile = path_1.default.join(_a.logDir, 'trades.log');
(() => {
    // Ensure logs directory exists
    if (!fs_1.default.existsSync(_a.logDir)) {
        fs_1.default.mkdirSync(_a.logDir, { recursive: true });
    }
})();
// Request ID middleware
function requestIdMiddleware(req, res, next) {
    req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('X-Request-ID', req.requestId);
    next();
}
// Error handling middleware
function errorHandler(err, req, res, next) {
    // Set default error values
    let statusCode = 500;
    let type = ErrorType.INTERNAL_ERROR;
    let message = 'Internal server error';
    let isOperational = false;
    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        type = err.type;
        message = err.message;
        isOperational = err.isOperational;
        // Set request and user context
        if (req.requestId)
            err.setRequestId(req.requestId);
        if (req.user?.id)
            err.setUserId(req.user.id);
    }
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        type = ErrorType.VALIDATION_ERROR;
        message = 'Validation failed';
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        type = ErrorType.VALIDATION_ERROR;
        message = 'Invalid data format';
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        type = ErrorType.AUTHENTICATION_ERROR;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        type = ErrorType.AUTHENTICATION_ERROR;
        message = 'Token expired';
    }
    // Log the error
    Logger.error(message, err, {
        requestId: req.requestId,
        userId: req.user?.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode,
        type,
    });
    // Prepare error response
    const errorResponse = {
        error: {
            type,
            message,
            timestamp: new Date().toISOString(),
            requestId: req.requestId,
        },
    };
    // Add additional details in development
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.error.stack = err.stack;
        if (err instanceof AppError && err.metadata) {
            errorResponse.error.metadata = err.metadata;
        }
    }
    // Send error response
    res.status(statusCode).json(errorResponse);
}
// Async error wrapper
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
// Not found handler
function notFoundHandler(req, res, next) {
    const error = (0, exports.createNotFoundError)(`Route ${req.originalUrl}`);
    next(error);
}
// Graceful shutdown handler
function setupGracefulShutdown() {
    const gracefulShutdown = (signal) => {
        Logger.info(`Received ${signal}, starting graceful shutdown...`);
        // Close server connections, cleanup resources, etc.
        process.exit(0);
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        Logger.error('Uncaught Exception', error);
        process.exit(1);
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        Logger.error('Unhandled Rejection', new Error(String(reason)), { promise });
        process.exit(1);
    });
}
// Health check endpoint
function healthCheck(req, res) {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
    };
    res.json(health);
}
