var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import fs from 'fs';
import path from 'path';
// Error types
export var ErrorType;
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
})(ErrorType || (ErrorType = {}));
// Custom error class
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(message, type, statusCode, isOperational, metadata) {
        if (statusCode === void 0) { statusCode = 500; }
        if (isOperational === void 0) { isOperational = true; }
        var _this = _super.call(this, message) || this;
        _this.type = type;
        _this.statusCode = statusCode;
        _this.isOperational = isOperational;
        _this.timestamp = new Date();
        _this.metadata = metadata;
        Error.captureStackTrace(_this, _this.constructor);
        return _this;
    }
    AppError.prototype.setRequestId = function (requestId) {
        this.requestId = requestId;
        return this;
    };
    AppError.prototype.setUserId = function (userId) {
        this.userId = userId;
        return this;
    };
    return AppError;
}(Error));
export { AppError };
// Error factory functions
export var createValidationError = function (message, details) {
    return new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, { details: details });
};
export var createAuthenticationError = function (message) {
    if (message === void 0) { message = 'Authentication required'; }
    return new AppError(message, ErrorType.AUTHENTICATION_ERROR, 401);
};
export var createAuthorizationError = function (message) {
    if (message === void 0) { message = 'Insufficient permissions'; }
    return new AppError(message, ErrorType.AUTHORIZATION_ERROR, 403);
};
export var createNotFoundError = function (resource) {
    return new AppError("".concat(resource, " not found"), ErrorType.NOT_FOUND_ERROR, 404);
};
export var createRateLimitError = function (message) {
    if (message === void 0) { message = 'Rate limit exceeded'; }
    return new AppError(message, ErrorType.RATE_LIMIT_ERROR, 429);
};
export var createDatabaseError = function (message, originalError) {
    return new AppError(message, ErrorType.DATABASE_ERROR, 500, true, { originalError: originalError === null || originalError === void 0 ? void 0 : originalError.message });
};
export var createExternalApiError = function (service, message) {
    return new AppError("".concat(service, " API error: ").concat(message), ErrorType.EXTERNAL_API_ERROR, 502);
};
export var createTradingError = function (message, tradeData) {
    return new AppError(message, ErrorType.TRADING_ERROR, 400, true, { tradeData: tradeData });
};
export var createWalletError = function (message, walletAddress) {
    return new AppError(message, ErrorType.WALLET_ERROR, 400, true, { walletAddress: walletAddress });
};
// Logger class
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.formatLog = function (level, message, metadata) {
        var timestamp = new Date().toISOString();
        var logEntry = __assign({ timestamp: timestamp, level: level, message: message }, metadata);
        return JSON.stringify(logEntry) + '\n';
    };
    Logger.writeToFile = function (filename, content) {
        try {
            fs.appendFileSync(filename, content);
        }
        catch (error) {
            console.error('Failed to write to log file:', error);
        }
    };
    Logger.error = function (message, error, metadata) {
        var logData = __assign({ message: message, error: error === null || error === void 0 ? void 0 : error.message, stack: error === null || error === void 0 ? void 0 : error.stack, type: error instanceof AppError ? error.type : 'UNKNOWN' }, metadata);
        var logEntry = this.formatLog('ERROR', message, logData);
        this.writeToFile(this.errorLogFile, logEntry);
        // Also log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error('🚨 ERROR:', logData);
        }
    };
    Logger.warn = function (message, metadata) {
        var logEntry = this.formatLog('WARN', message, metadata);
        this.writeToFile(this.errorLogFile, logEntry);
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ WARNING:', message, metadata);
        }
    };
    Logger.info = function (message, metadata) {
        var logEntry = this.formatLog('INFO', message, metadata);
        this.writeToFile(this.accessLogFile, logEntry);
        if (process.env.NODE_ENV !== 'production') {
            console.log('ℹ️ INFO:', message, metadata);
        }
    };
    Logger.trade = function (message, tradeData) {
        var logEntry = this.formatLog('TRADE', message, tradeData);
        this.writeToFile(this.tradeLogFile, logEntry);
        console.log('💰 TRADE:', message, tradeData);
    };
    Logger.security = function (message, metadata) {
        var logEntry = this.formatLog('SECURITY', message, metadata);
        this.writeToFile(this.errorLogFile, logEntry);
        console.warn('🔒 SECURITY:', message, metadata);
    };
    var _a;
    _a = Logger;
    Logger.logDir = path.join(process.cwd(), 'logs');
    Logger.errorLogFile = path.join(_a.logDir, 'error.log');
    Logger.accessLogFile = path.join(_a.logDir, 'access.log');
    Logger.tradeLogFile = path.join(_a.logDir, 'trades.log');
    (function () {
        // Ensure logs directory exists
        if (!fs.existsSync(_a.logDir)) {
            fs.mkdirSync(_a.logDir, { recursive: true });
        }
    })();
    return Logger;
}());
export { Logger };
// Request ID middleware
export function requestIdMiddleware(req, res, next) {
    req.requestId = "req_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    res.setHeader('X-Request-ID', req.requestId);
    next();
}
// Error handling middleware
export function errorHandler(err, req, res, next) {
    var _b, _c;
    // Set default error values
    var statusCode = 500;
    var type = ErrorType.INTERNAL_ERROR;
    var message = 'Internal server error';
    var isOperational = false;
    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        type = err.type;
        message = err.message;
        isOperational = err.isOperational;
        // Set request and user context
        if (req.requestId)
            err.setRequestId(req.requestId);
        if ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)
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
        userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: statusCode,
        type: type,
    });
    // Prepare error response
    var errorResponse = {
        error: {
            type: type,
            message: message,
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
export function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
// Not found handler
export function notFoundHandler(req, res, next) {
    var error = createNotFoundError("Route ".concat(req.originalUrl));
    next(error);
}
// Graceful shutdown handler
export function setupGracefulShutdown() {
    var gracefulShutdown = function (signal) {
        Logger.info("Received ".concat(signal, ", starting graceful shutdown..."));
        // Close server connections, cleanup resources, etc.
        process.exit(0);
    };
    process.on('SIGTERM', function () { return gracefulShutdown('SIGTERM'); });
    process.on('SIGINT', function () { return gracefulShutdown('SIGINT'); });
    // Handle uncaught exceptions
    process.on('uncaughtException', function (error) {
        Logger.error('Uncaught Exception', error);
        process.exit(1);
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', function (reason, promise) {
        Logger.error('Unhandled Rejection', new Error(String(reason)), { promise: promise });
        process.exit(1);
    });
}
// Health check endpoint
export function healthCheck(req, res) {
    var health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0',
    };
    res.json(health);
}
