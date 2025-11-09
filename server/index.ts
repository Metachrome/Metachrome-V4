// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

console.log('🔧 Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupTestRoute } from "./test-db-connection";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import {
  securityMiddleware,
  csrfProtection,
  authLimiter,
  tradingLimiter,
  apiLimiter,
  generateCSRFToken,
  securityErrorHandler
} from "./security";
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  setupGracefulShutdown,
  healthCheck,
  Logger
} from "./errorHandler";
import { setupChatTables } from "./setup-chat-tables";
import { checkChatTables } from "./check-chat-tables";

const app = express();

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

// CORS configuration - temporarily allow all origins for debugging
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:4000'];
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
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// CSRF Token endpoint
app.get('/api/auth/csrf', (req: any, res) => {
  const token = generateCSRFToken(req.sessionID);
  res.json({ csrfToken: token });
});

// Health check endpoint
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup test route for debugging database connection
  setupTestRoute(app);

  // Setup chat system tables
  try {
    // First check if tables exist
    const checkResult = await checkChatTables();

    if (!checkResult.allTablesExist) {
      console.log('⚠️ Chat tables missing, attempting to create...');
      await setupChatTables();
      console.log('✅ Chat system tables created successfully');
    } else {
      console.log('✅ Chat system tables already exist');
      console.log(`📊 Current data: ${checkResult.counts?.conversations || 0} conversations, ${checkResult.counts?.messages || 0} messages, ${checkResult.counts?.faqs || 0} FAQs`);
    }
  } catch (error) {
    console.error('❌ Failed to setup chat tables:', error);
    console.error('❌ MANUAL ACTION REQUIRED: Run CHAT_SYSTEM_QUICK_FIX.sql in Supabase SQL Editor');
    // Continue server startup even if chat tables fail
  }

  const server = await registerRoutes(app);

  // CSRF Protection for state-changing operations (only for specific API routes)
  // Apply after routes are registered so exclusions work properly
  // Temporarily disable admin CSRF for system endpoints
  app.use('/api/trades', csrfProtection);
  app.use('/api/users', csrfProtection);
  // Note: /api/admin CSRF temporarily disabled for system endpoints

  // Setup static file serving AFTER routes but BEFORE 404 handler
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 404 handler for unmatched routes (must come after static file serving)
  app.use(notFoundHandler);

  // Enhanced error handler with comprehensive logging
  app.use(errorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3001', 10);
  const host = process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0';
  server.listen(port, host, () => {
    log(`🚀 Server running on port ${port} on ${host}`);
    log(`🛡️ Security features enabled: Rate limiting, CSRF protection, Input sanitization`);
    log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`📊 Error handling and logging system active`);

    Logger.info('Server started successfully', {
      port,
      host,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
    });
  });

  // Setup graceful shutdown handling (disabled in development to prevent SIGINT issues)
  if (process.env.NODE_ENV === 'production') {
    setupGracefulShutdown();
  } else {
    console.log('🚫 Graceful shutdown disabled in development mode');
  }
})();
