import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Error types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  TRADING_ERROR = 'TRADING_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
  }

  setRequestId(requestId: string): this {
    (this as any).requestId = requestId;
    return this;
  }

  setUserId(userId: string): this {
    (this as any).userId = userId;
    return this;
  }
}

// Error factory functions
export const createValidationError = (message: string, details?: any) =>
  new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, { details });

export const createAuthenticationError = (message: string = 'Authentication required') =>
  new AppError(message, ErrorType.AUTHENTICATION_ERROR, 401);

export const createAuthorizationError = (message: string = 'Insufficient permissions') =>
  new AppError(message, ErrorType.AUTHORIZATION_ERROR, 403);

export const createNotFoundError = (resource: string) =>
  new AppError(`${resource} not found`, ErrorType.NOT_FOUND_ERROR, 404);

export const createRateLimitError = (message: string = 'Rate limit exceeded') =>
  new AppError(message, ErrorType.RATE_LIMIT_ERROR, 429);

export const createDatabaseError = (message: string, originalError?: Error) =>
  new AppError(message, ErrorType.DATABASE_ERROR, 500, true, { originalError: originalError?.message });

export const createExternalApiError = (service: string, message: string) =>
  new AppError(`${service} API error: ${message}`, ErrorType.EXTERNAL_API_ERROR, 502);

export const createTradingError = (message: string, tradeData?: any) =>
  new AppError(message, ErrorType.TRADING_ERROR, 400, true, { tradeData });

export const createWalletError = (message: string, walletAddress?: string) =>
  new AppError(message, ErrorType.WALLET_ERROR, 400, true, { walletAddress });

// Logger class
export class Logger {
  private static logDir = path.join(process.cwd(), 'logs');
  private static errorLogFile = path.join(this.logDir, 'error.log');
  private static accessLogFile = path.join(this.logDir, 'access.log');
  private static tradeLogFile = path.join(this.logDir, 'trades.log');

  static {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private static formatLog(level: string, message: string, metadata?: any): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...metadata,
    };
    return JSON.stringify(logEntry) + '\n';
  }

  private static writeToFile(filename: string, content: string): void {
    try {
      fs.appendFileSync(filename, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  static error(message: string, error?: Error | AppError, metadata?: any): void {
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

  static warn(message: string, metadata?: any): void {
    const logEntry = this.formatLog('WARN', message, metadata);
    this.writeToFile(this.errorLogFile, logEntry);
    
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ WARNING:', message, metadata);
    }
  }

  static info(message: string, metadata?: any): void {
    const logEntry = this.formatLog('INFO', message, metadata);
    this.writeToFile(this.accessLogFile, logEntry);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('ℹ️ INFO:', message, metadata);
    }
  }

  static trade(message: string, tradeData: any): void {
    const logEntry = this.formatLog('TRADE', message, tradeData);
    this.writeToFile(this.tradeLogFile, logEntry);
    
    console.log('💰 TRADE:', message, tradeData);
  }

  static security(message: string, metadata?: any): void {
    const logEntry = this.formatLog('SECURITY', message, metadata);
    this.writeToFile(this.errorLogFile, logEntry);
    
    console.warn('🔒 SECURITY:', message, metadata);
  }
}

// Request ID middleware
export function requestIdMiddleware(req: any, res: Response, next: NextFunction): void {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

// Error handling middleware
export function errorHandler(err: Error | AppError, req: any, res: Response, next: NextFunction): void {
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
    if (req.requestId) err.setRequestId(req.requestId);
    if (req.user?.id) err.setUserId(req.user.id);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    type = ErrorType.VALIDATION_ERROR;
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    type = ErrorType.VALIDATION_ERROR;
    message = 'Invalid data format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    type = ErrorType.AUTHENTICATION_ERROR;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
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
  const errorResponse: any = {
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
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Not found handler
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = createNotFoundError(`Route ${req.originalUrl}`);
  next(error);
}

// Graceful shutdown handler
export function setupGracefulShutdown(): void {
  const gracefulShutdown = (signal: string) => {
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
export function healthCheck(req: Request, res: Response): void {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  };
  
  res.json(health);
}
