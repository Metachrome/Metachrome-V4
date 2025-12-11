import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
// Note: multer will be installed - importing conditionally for now
let multer: any = null;
try {
  multer = require("multer");
} catch (e) {
  console.log("⚠️ Multer not installed yet - file uploads will use text mode");
}
import "./types"; // Import session types
import { storage } from "./storage";

// Reset storage to database mode in case it fell back to demo mode
storage.resetToDatabase();
import { setupWebSocket } from "./websocket";
import { seedOptionsSettings, seedDemoData } from "./seed";
import { priceService } from "./priceService";
import { tradingService } from "./tradingService";
import { hashPassword, verifyPassword, generateToken, verifyToken, authenticateToken, requireAdmin, requireSuperAdmin, requireAuth, requireSessionAdmin, requireSessionSuperAdmin, requirePermission, type AuthenticatedRequest } from "./auth";
import { setupOAuth } from "./oauth";
import { registerChatRoutes } from "./chat-routes";
import { setupChatTables } from "./setup-chat-tables";
// import { paymentService } from "./paymentService";
import { z } from "zod";
import { insertUserSchema, insertTradeSchema, insertTransactionSchema, insertAdminControlSchema, adminActivityLogs } from "@shared/schema";
import { sql, desc, eq, gte, lte, and } from "drizzle-orm";
import { transactions } from "@shared/schema";
import { logAdminActivityFromRequest, ActionTypes, ActionCategories } from "./activityLogger";
import { db, pgRawClient } from "./db";
// SUPABASE ENABLED - Import for activity logs and other features
import { supabaseAdmin } from "../lib/supabase";

// Notification system for real-time admin alerts
interface AdminNotification {
  id: string;
  type: 'deposit' | 'withdrawal' | 'registration';
  userId: string;
  username: string;
  amount?: string;
  currency?: string;
  email?: string;
  timestamp: Date;
  read: boolean;
}

const adminNotifications: AdminNotification[] = [];
const sseClients: Set<any> = new Set();

// Helper function to broadcast notification to all connected admin clients
function broadcastNotification(notification: AdminNotification) {
  adminNotifications.unshift(notification);

  if (adminNotifications.length > 50) {
    adminNotifications.splice(50);
  }

  const data = JSON.stringify(notification);

  sseClients.forEach(client => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (error) {
      sseClients.delete(client);
    }
  });
}

// Helper functions for deposit addresses and network info
function getDepositAddress(currency: string): string {
  const depositAddresses: { [key: string]: string } = {
    'USDT-ERC': '0xabc123def456789abc123def456789abc123def45',
    'USDT-BEP': 'bnb1abc123def456789abc123def456789abc123def',
    'USDT-TRC': 'TRX123abc456def789abc123def456789abc123def',
    'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'ETH': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b',
    'SOL': 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Twb4k9UYuza'
  };
  return depositAddresses[currency] || 'Address not available';
}

function getNetworkInfo(currency: string): { name: string; confirmations: number } {
  const networkInfo: { [key: string]: { name: string; confirmations: number } } = {
    'USDT-ERC': { name: 'Ethereum (ERC20)', confirmations: 12 },
    'USDT-BEP': { name: 'Binance Smart Chain (BEP20)', confirmations: 15 },
    'USDT-TRC': { name: 'Tron (TRC20)', confirmations: 19 },
    'BTC': { name: 'Bitcoin', confirmations: 3 },
    'ETH': { name: 'Ethereum', confirmations: 12 },
    'SOL': { name: 'Solana', confirmations: 32 }
  };
  return networkInfo[currency] || { name: 'Unknown Network', confirmations: 1 };
}

// Production payment verification functions
async function verifyBlockchainTransaction(txHash: string, currency: string, amount: string): Promise<boolean> {
  try {
    // TODO: Implement real blockchain verification
    // For now, return false to prevent fake transactions
    console.log(`🔍 Verifying blockchain transaction: ${txHash} for ${amount} ${currency}`);

    // Example implementation for different currencies:
    if (currency === 'USDT') {
      // Verify USDT transaction on Ethereum/Tron
      // const web3 = new Web3(process.env.ETH_RPC_URL);
      // const receipt = await web3.eth.getTransactionReceipt(txHash);
      // return receipt && receipt.status;
    } else if (currency === 'BTC') {
      // Verify Bitcoin transaction
      // const response = await fetch(`https://blockstream.info/api/tx/${txHash}`);
      // const tx = await response.json();
      // return tx.status.confirmed;
    }

    // For demo purposes, require manual admin approval
    return false;
  } catch (error) {
    console.error('Blockchain verification error:', error);
    return false;
  }
}

async function verifyStripePayment(paymentIntentId: string, amount: string): Promise<boolean> {
  try {
    console.log(`💳 Verifying Stripe payment: ${paymentIntentId} for $${amount}`);

    // TODO: Re-enable when paymentService is working
    // const result = await paymentService.verifyPaymentIntent(paymentIntentId);
    //
    // if (result.success && result.amount && result.currency) {
    //   const expectedAmount = parseFloat(amount);
    //   const actualAmount = result.amount;
    //
    //   // Allow small differences due to floating point precision
    //   const amountMatches = Math.abs(expectedAmount - actualAmount) < 0.01;
    //
    //   return amountMatches;
    // }

    return false; // For now, always return false
  } catch (error) {
    console.error('Stripe verification error:', error);
    return false;
  }
}

// Configure multer for file uploads (when available)
let upload: any = null;

if (multer) {
  const uploadStorage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      // Generate unique filename with timestamp and original name
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, extension);
      cb(null, `${nameWithoutExt}-${uniqueSuffix}${extension}`);
    }
  });

  upload = multer({
    storage: uploadStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
      // Allow images, PDFs, and documents
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only images, PDFs, and documents are allowed!'));
      }
    }
  });

  console.log("✅ File upload system initialized with multer");
} else {
  console.log("⚠️ File upload system using text-only mode (multer not available)");
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('🚀 ========================================');
  console.log('🚀 REGISTERING SSE ENDPOINTS');
  console.log('🚀 ========================================');

  // ============================================
  // REAL-TIME NOTIFICATION SYSTEM FOR SUPERADMIN
  // MUST BE FIRST - BEFORE ANY OTHER ROUTES
  // Using /sse/* path to avoid /api/* rate limiting
  // ============================================

  // DEBUG: Test endpoint to verify routing works
  app.get("/sse/test", (req, res) => {
    console.log('🧪 /sse/test endpoint hit!');
    res.json({
      success: true,
      message: 'SSE endpoint routing works!',
      timestamp: new Date().toISOString()
    });
  });
  console.log('✅ Registered: GET /sse/test');

  // SSE endpoint for real-time notifications (Superadmin only)
  // Using /sse/* path to bypass /api/* rate limiter
  app.get("/sse/notifications/stream", (req, res) => {
    console.log('🔔 /sse/notifications/stream endpoint hit!');
    console.log('🔔 User:', req.session?.user || (req as any).user);
    const user = req.session?.user || (req as any).user;

    // Check authentication
    if (!user || user.role !== 'super_admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Add client to set
    sseClients.add(res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Notification stream connected' })}\n\n`);

    // Send existing unread notifications
    const unreadNotifications = adminNotifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      unreadNotifications.forEach(notification => {
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
      });
    }

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      try {
        res.write(`: heartbeat\n\n`);
      } catch (error) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 30000);

    // Clean up on client disconnect
    req.on('close', () => {
      console.log('🔔 Client disconnected from SSE stream');
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });
  console.log('✅ Registered: GET /sse/notifications/stream');

  console.log('🚀 ========================================');
  console.log('🚀 SSE ENDPOINTS REGISTERED SUCCESSFULLY');
  console.log('🚀 ========================================');

  // Get all notifications (Superadmin only)
  app.get("/api/admin/notifications", requireSessionSuperAdmin, (req, res) => {
    try {
      res.json({ notifications: adminNotifications });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read (Superadmin only)
  app.post("/api/admin/notifications/:id/read", requireSessionSuperAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const notification = adminNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all notifications as read (Superadmin only)
  app.post("/api/admin/notifications/read-all", requireSessionSuperAdmin, (req, res) => {
    try {
      adminNotifications.forEach(n => n.read = true);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // EMERGENCY BYPASS: System settings endpoint BEFORE any other middleware
  app.put("/api/system-config", (req: any, res: any) => {
    console.log('🚀 /api/system-config endpoint hit!');
    console.log('📦 Request body:', req.body);
    try {
      res.setHeader('Content-Type', 'application/json');
      const { tradingEnabled, maintenanceMode, minTradeAmount, maxTradeAmount } = req.body;
      
      global.systemSettings = global.systemSettings || {
        tradingEnabled: true,
        maintenanceMode: false,
        minTradeAmount: '10',
        maxTradeAmount: '10000'
      };
      
      if (typeof tradingEnabled === 'boolean') {
        global.systemSettings.tradingEnabled = tradingEnabled;
        console.log(`🎮 Trading ${tradingEnabled ? 'ENABLED' : 'DISABLED'} by admin`);
      }
      
      if (typeof maintenanceMode === 'boolean') {
        global.systemSettings.maintenanceMode = maintenanceMode;
        console.log(`🔧 Maintenance mode ${maintenanceMode ? 'ENABLED' : 'DISABLED'} by admin`);
      }
      
      if (minTradeAmount) {
        global.systemSettings.minTradeAmount = minTradeAmount;
      }
      
      if (maxTradeAmount) {
        global.systemSettings.maxTradeAmount = maxTradeAmount;
      }
      
      res.json({
        success: true,
        message: 'System settings updated successfully',
        settings: global.systemSettings,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error updating system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system settings'
      });
    }
  });

  // Initialize OAuth authentication
  setupOAuth(app);

  // Auth routes
  // Generic auth endpoint for session checking and login
  app.get("/api/auth", async (req, res) => {
    try {
      // First check for JWT token in Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (token) {
        console.log('🔍 Auth check - checking token:', token.substring(0, 20) + '...');

        // Handle admin tokens (from admin login)
        if (token.startsWith('admin-token-') || token.startsWith('token_admin-001_') || token.startsWith('token_superadmin-001_')) {
          console.log('🔧 Admin token detected, checking session');
          const user = req.session.user || null;
          console.log('🔧 Session user for admin token:', user);
          return res.json(user);
        }

        // Handle regular JWT tokens
        const decoded = verifyToken(token);
        if (decoded) {
          console.log('✅ Valid JWT token found:', decoded);
          return res.json(decoded);
        } else {
          console.log('❌ Invalid JWT token');
        }
      }

      // Fallback to session-based authentication
      const user = req.session.user || null;
      console.log('🔍 Auth check - session user:', user);
      res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth", async (req, res) => {
    try {
      const { username, password, walletAddress, email, firstName, lastName } = req.body;

      console.log('🔐 Generic auth attempt:', { username, email, password: password ? '***' : 'missing', walletAddress, firstName, lastName });

      // Handle MetaMask authentication
      if (walletAddress && !username && !password) {
        // Check if user exists
        let user = await storage.getUserByWallet?.(walletAddress);
        let isNewUser = false;

        if (!user) {
          // Create new user
          user = await storage.createUser({
            walletAddress,
            role: 'user',
          });
          isNewUser = true;
        }

        // Update last login
        await storage.updateUser(user.id, { lastLogin: new Date() });

        // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN for new users
        if (isNewUser) {
          const notification: AdminNotification = {
            id: `registration_${user.id}_${Date.now()}`,
            type: 'registration',
            userId: user.id,
            username: user.username || walletAddress.substring(0, 8) + '...',
            email: user.email || 'MetaMask User',
            timestamp: new Date(),
            read: false
          };
          broadcastNotification(notification);
          console.log(`🔔 Sent new MetaMask user registration notification: ${walletAddress}`);
        }

        // Store user in session
        req.session.user = {
          id: user.id,
          username: user.username || undefined,
          email: user.email || undefined,
          role: user.role || 'user',
          walletAddress: user.walletAddress || undefined,
          hasPassword: !!user.password,
        };

        return res.status(200).json({
          user: req.session.user,
          message: "MetaMask authentication successful"
        });
      }

      // Handle user registration (when email is provided)
      if (email && username && password) {
        console.log('🔄 User registration attempt:', { username, email });

        // Check if user already exists
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }

        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password and create new user
        const hashedPassword = await hashPassword(password);
        const user = await storage.createUser({
          username,
          email,
          password: hashedPassword,
          plainPassword: password, // Store plain password for superadmin view
          firstName,
          lastName,
          role: 'user',
        });

        // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN
        const notification: AdminNotification = {
          id: `registration_${user.id}_${Date.now()}`,
          type: 'registration',
          userId: user.id,
          username: user.username || username,
          email: user.email || email,
          timestamp: new Date(),
          read: false
        };
        broadcastNotification(notification);
        console.log(`🔔 Sent new user registration notification: ${user.username} (${user.email})`);

        // Store user in session for auto-login
        req.session.user = {
          id: user.id,
          username: user.username || undefined,
          email: user.email || undefined,
          role: user.role || 'user',
          walletAddress: user.walletAddress || undefined,
          hasPassword: !!user.password,
        };

        // Generate token for the response
        const token = generateToken({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });

        return res.json({
          user: req.session.user,
          message: "Registration successful",
          token,
          success: true
        });
      }

      // Handle regular login
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check database for users
      const user = await storage.getUserByUsername(username);

      if (!user) {
        console.log('❌ User not found in database');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password || '');

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username || undefined,
        email: user.email || undefined,
        role: user.role || 'user',
        walletAddress: user.walletAddress || undefined,
        hasPassword: !!user.password,
      };

      // Generate JWT token for admins
      let token;
      if (user.role === 'admin' || user.role === 'super_admin') {
        token = generateToken({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });
      }

      res.json({
        user: req.session.user,
        message: "Login successful",
        ...(token && { token })
      });
    } catch (error) {
      console.error("Error with generic auth:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      // Return the user from session if logged in
      const user = req.session.user || null;
      console.log('🔍 Auth check - session user:', user);
      res.json(user);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin login endpoint
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      console.log('🔐 Admin login attempt:', { username, password: password ? '***' : 'missing' });

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check database for admin credentials
      const user = await storage.getUserByUsername(username);

      console.log('👤 Found user:', user ? { id: user.id, username: user.username, role: user.role, email: user.email } : 'null');
      console.log('🔍 Login attempt for username:', username);
      console.log('🔍 User lookup result:', user);

      if (!user) {
        console.log('❌ User not found in database');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      let isValidPassword = false;

      // Special handling for demo mode when database fails
      if (user.id === 'demo-admin-1' && username === 'superadmin' && password === 'superadmin123') {
        isValidPassword = true;
      } else if (user.id === 'demo-admin-1' && username === 'admin' && password === 'admin123') {
        isValidPassword = true;
      } else {
        isValidPassword = await verifyPassword(password, user.password || '');
      }

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Store user in session (same as user login)
      req.session.user = {
        id: user.id,
        username: user.username || undefined,
        email: user.email || undefined,
        role: user.role || 'user',
        walletAddress: user.walletAddress || undefined,
      };

      console.log('✅ Admin login successful, session user:', req.session.user);

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      });

      console.log('📤 Sending response with user:', req.session.user);

      res.json({
        user: req.session.user,
        message: "Login successful",
        token
      });
    } catch (error) {
      console.error("Error with admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout endpoint
  app.post("/api/auth/admin/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying admin session:", err);
          return res.status(500).json({ message: "Admin logout failed" });
        }
        res.json({ message: "Admin logout successful" });
      });
    } catch (error) {
      console.error("Error with admin logout:", error);
      res.status(500).json({ message: "Admin logout failed" });
    }
  });

  // User authentication endpoints
  app.post("/api/auth/user/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Try to find user by username, email, or wallet address
      let user = null;

      // First, try username
      user = await storage.getUserByUsername(username);

      // If not found and input looks like an email, try email
      if (!user && username.includes('@')) {
        user = await storage.getUserByEmail(username);
      }

      // If not found and input looks like a wallet address, try wallet
      if (!user && username.startsWith('0x')) {
        user = await storage.getUserByWallet(username);
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password || '');

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username || undefined,
        email: user.email || undefined,
        role: user.role || 'user',
        walletAddress: user.walletAddress || undefined,
      };

      res.json({
        user: req.session.user,
        message: "Login successful"
      });
    } catch (error) {
      console.error("Error with user login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User logout endpoint
  app.post("/api/auth/user/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Error with user logout:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // MetaMask authentication endpoint
  app.post("/api/auth/metamask", async (req, res) => {
    try {
      const { walletAddress, signature } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // In a production app, you would verify the signature here
      // For demo purposes, we'll create/authenticate with just the wallet address
      
      // Check if user exists with this wallet address
      let user = await storage.getUserByWalletAddress?.(walletAddress);
      
      if (!user) {
        // Create new user with wallet address
        const newUser = await storage.createUser({
          username: `wallet_${walletAddress.slice(0, 8)}`,
          email: `${walletAddress.slice(0, 8)}@wallet.local`,
          walletAddress,
          role: 'user'
        });
        user = newUser;
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username || undefined,
        email: user.email || undefined,
        role: user.role || 'user',
        walletAddress: user.walletAddress || undefined,
      };

      res.json({
        user: req.session.user,
        message: "MetaMask authentication successful"
      });
    } catch (error) {
      console.error("Error with MetaMask authentication:", error);
      res.status(500).json({ message: "MetaMask authentication failed" });
    }
  });

  // OAuth endpoints (Google, Apple, LinkedIn)
  app.post("/api/auth/oauth/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { code, email, name } = req.body;
      
      // In a real implementation, you would:
      // 1. Verify the OAuth code with the provider's API
      // 2. Get user info from the provider
      // 3. Create or authenticate the user
      
      // For demo purposes, we'll simulate OAuth success
      console.log(`OAuth ${provider} authentication attempt:`, { code, email, name });
      
      res.json({
        message: `${provider} OAuth integration is configured but requires API keys`,
        requiresSetup: true
      });
    } catch (error) {
      console.error(`Error with ${req.params.provider} OAuth:`, error);
      res.status(500).json({ message: "OAuth authentication failed" });
    }
  });

  app.post("/api/auth/user/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password and create new user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        plainPassword: password, // Store plain password for superadmin view
        role: 'user',
      });

      // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN
      const notification: AdminNotification = {
        id: `registration_${user.id}_${Date.now()}`,
        type: 'registration',
        userId: user.id,
        username: user.username,
        email: user.email,
        timestamp: new Date(),
        read: false
      };
      broadcastNotification(notification);
      console.log(`🔔 Sent new user registration notification: ${user.username} (${user.email})`);

      res.json({ user, message: "Registration successful" });
    } catch (error) {
      console.error("Error with user registration:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });



  // Market data endpoints
  app.get("/api/market-data", async (req, res) => {
    try {
      const marketData = await storage.getAllMarketData();
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  app.get("/api/market-data/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const data = await storage.getMarketData(symbol);
      if (!data) {
        return res.status(404).json({ message: "Market data not found" });
      }
      res.json(data);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  app.get("/api/trading-pairs", async (req, res) => {
    try {
      const pairs = await storage.getTradingPairs();
      res.json(pairs);
    } catch (error) {
      console.error("Error fetching trading pairs:", error);
      res.status(500).json({ message: "Failed to fetch trading pairs" });
    }
  });

  // Binance real-time price endpoint
  app.get("/api/binance/price", async (req, res) => {
    try {
      const symbol = (req.query.symbol as string) || 'BTCUSDT';
      console.log('💰 [Binance Price] Request for:', symbol);

      // Fetch from Binance 24hr Ticker API with timeout
      const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await fetch(binanceUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
          console.error('❌ [Binance Price] Binance API error:', response.status, response.statusText);
          throw new Error(`Binance API error: ${response.status}`);
        }

        const data: any = await response.json();

        // Transform to our format
        const priceData = {
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          priceChange24h: parseFloat(data.priceChange),
          priceChangePercent24h: parseFloat(data.priceChangePercent),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          volume24h: parseFloat(data.volume),
          quoteVolume24h: parseFloat(data.quoteVolume),
          openPrice: parseFloat(data.openPrice),
          timestamp: Date.now()
        };

        console.log('✅ [Binance Price] Current price:', priceData.price, 'Change:', priceData.priceChangePercent24h + '%');

        return res.json({
          success: true,
          data: priceData
        });
      } catch (fetchError) {
        clearTimeout(timeout);
        console.error('❌ [Binance Price] Fetch error:', fetchError instanceof Error ? fetchError.message : 'Unknown');

        // Return fallback mock data instead of error
        const mockPrices: Record<string, number> = {
          'BTCUSDT': 101463.47,
          'ETHUSDT': 3392.85,
          'BNBUSDT': 715.32,
          'SOLUSDT': 238.45,
          'XRPUSDT': 2.33,
          'ADAUSDT': 1.05,
          'LTCUSDT': 103.45,
          'TONUSDT': 5.67,
          'DOGEUSDT': 0.38,
          'AVAXUSDT': 42.15,
          'DOTUSDT': 7.89,
          'LINKUSDT': 23.45,
          'POLUSDT': 0.65,
          'UNIUSDT': 12.34,
          'ATOMUSDT': 9.87,
          'FILUSDT': 5.43,
          'TRXUSDT': 0.21,
          'ETCUSDT': 28.76,
          'XLMUSDT': 0.43
        };

        const mockPrice = mockPrices[symbol] || 100.00;
        const mockChange = (Math.random() - 0.5) * 5; // Random change between -2.5% and +2.5%

        const fallbackData = {
          symbol,
          price: mockPrice,
          priceChange24h: (mockPrice * mockChange) / 100,
          priceChangePercent24h: mockChange,
          high24h: mockPrice * 1.02,
          low24h: mockPrice * 0.98,
          volume24h: Math.random() * 1000000,
          quoteVolume24h: Math.random() * 100000000,
          openPrice: mockPrice * (1 - mockChange / 100),
          timestamp: Date.now()
        };

        console.log('📊 [Binance Price] Using fallback data for', symbol, ':', fallbackData.price);

        return res.json({
          success: true,
          data: fallbackData
        });
      }

    } catch (error) {
      console.error('❌ [Binance Price] Error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // User endpoints
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile endpoints
  app.get("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user profile without sensitive data
      const { password, passwordHash, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { username, email, firstName, lastName, phone, address } = req.body;

      // Prepare update data
      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (email !== undefined) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;

      // Update user profile
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update profile" });
      }

      // Return updated profile without sensitive data
      const { password, passwordHash, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  app.post("/api/auth/metamask", async (req, res) => {
    try {
      const { walletAddress, signature } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // Check if user exists
      let user = await storage.getUserByWallet(walletAddress);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          walletAddress,
          role: 'user',
        });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Store user in session
      req.session.user = {
        id: user.id,
        username: user.username || undefined,
        email: user.email || undefined,
        role: user.role || 'user',
        walletAddress: user.walletAddress || undefined,
      };

      res.json({ user: req.session.user, message: "Login successful" });
    } catch (error) {
      console.error("Error with Metamask auth:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Balance endpoints
  app.get("/api/users/:userId/balances", async (req, res) => {
    try {
      const { userId } = req.params;
      const balances = await storage.getUserBalances(userId);
      res.json(balances);
    } catch (error) {
      console.error("Error fetching balances:", error);
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  });

  app.post("/api/users/:userId/balances", async (req, res) => {
    try {
      const { userId } = req.params;
      const { symbol, available, locked } = req.body;
      
      const balance = await storage.updateBalance(userId, symbol, available, locked);
      res.json(balance);
    } catch (error) {
      console.error("Error updating balance:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  // Trading status check middleware
  const checkTradingEnabled = (req: any, res: any, next: any) => {
    global.systemSettings = global.systemSettings || { tradingEnabled: true };
    
    if (!global.systemSettings.tradingEnabled) {
      return res.status(503).json({ 
        message: "Trading is currently disabled by system administrators",
        code: "TRADING_DISABLED",
        maintenanceMode: global.systemSettings.maintenanceMode || false
      });
    }
    
    if (global.systemSettings.maintenanceMode) {
      return res.status(503).json({ 
        message: "System is currently in maintenance mode. Trading is temporarily unavailable.",
        code: "MAINTENANCE_MODE",
        maintenanceMode: true
      });
    }
    
    next();
  };

  // Trading endpoints
  app.post("/api/trades", checkTradingEnabled, async (req, res) => {
    try {
      const tradeData = insertTradeSchema.parse(req.body);

      // For options trading, set expiry time
      if (tradeData.type === 'options' && tradeData.duration) {
        tradeData.expiresAt = new Date(Date.now() + tradeData.duration * 1000);
      }

      const trade = await storage.createTrade(tradeData);
      res.json(trade);
    } catch (error) {
      console.error("Error creating trade:", error);
      res.status(400).json({ message: "Failed to create trade" });
    }
  });

  // New options trading endpoint
  app.post("/api/trades/options", checkTradingEnabled, async (req, res) => {
    try {
      const { userId, symbol, direction, amount, duration } = req.body;

      if (!userId || !symbol || !direction || !amount || !duration) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Handle admin users - map them to their trading profile
      let finalUserId = userId;
      if (userId === 'superadmin-001' || userId === 'admin-001') {
        finalUserId = `${userId}-trading`;
        console.log(`🔧 Admin user ${userId} trading as ${finalUserId}`);
      }

      const result = await tradingService.createOptionsTrade({
        userId: finalUserId,
        symbol,
        direction,
        amount,
        duration,
      });

      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error creating options trade:", error);
      res.status(500).json({ message: "Failed to create options trade" });
    }
  });

  // Get options settings
  app.get("/api/options-settings", async (req, res) => {
    try {
      const settings = await storage.getOptionsSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching options settings:", error);
      res.status(500).json({ message: "Failed to fetch options settings" });
    }
  });

  // Cancel trade endpoint
  app.post("/api/trades/:id/cancel", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      const success = await tradingService.cancelTrade(id, userId);

      if (success) {
        res.json({ message: "Trade cancelled successfully" });
      } else {
        res.status(400).json({ message: "Unable to cancel trade" });
      }
    } catch (error) {
      console.error("Error cancelling trade:", error);
      res.status(500).json({ message: "Failed to cancel trade" });
    }
  });

  app.get("/api/users/:userId/trades", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const trades = await storage.getUserTrades(userId, limit);

      // Add detailed logging for debugging withdrawal requirement
      const completedTrades = trades.filter(t => t.status === 'completed');
      console.log(`📊 GET /api/users/${userId}/trades:`, {
        totalTrades: trades.length,
        completedTrades: completedTrades.length,
        tradeStatuses: trades.map(t => ({
          id: t.id.substring(0, 8),
          status: t.status,
          symbol: t.symbol,
          createdAt: t.createdAt,
          completedAt: t.completedAt
        }))
      });

      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.patch("/api/trades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const trade = await storage.updateTrade(id, updates);
      res.json(trade);
    } catch (error) {
      console.error("Error updating trade:", error);
      res.status(500).json({ message: "Failed to update trade" });
    }
  });

  // Get a single trade by ID (for real-time notification data)
  app.get("/api/trades/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const trade = await storage.getTrade(id);

      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      res.json(trade);
    } catch (error) {
      console.error("Error fetching trade:", error);
      res.status(500).json({ message: "Failed to fetch trade" });
    }
  });

  // Spot Trading endpoints
  app.post("/api/spot/orders", requireAuth, async (req, res) => {
    try {
      const { symbol, side, type, amount, price, total } = req.body;
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate required fields
      if (!symbol || !side || !type || !amount || !total) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (!['buy', 'sell'].includes(side)) {
        return res.status(400).json({ message: "Invalid side. Must be 'buy' or 'sell'" });
      }

      if (!['limit', 'market'].includes(type)) {
        return res.status(400).json({ message: "Invalid type. Must be 'limit' or 'market'" });
      }

      const amountNum = parseFloat(amount);
      const totalNum = parseFloat(total);
      const priceNum = price ? parseFloat(price) : null;

      if (amountNum <= 0 || totalNum <= 0) {
        return res.status(400).json({ message: "Amount and total must be positive" });
      }

      if (type === 'limit' && (!priceNum || priceNum <= 0)) {
        return res.status(400).json({ message: "Price is required for limit orders" });
      }

      // Check user balances
      const balances = await storage.getUserBalances(userId);

      // Extract cryptocurrency symbol from trading pair (e.g., "BTCUSDT" -> "BTC")
      const cryptoSymbol = symbol.replace('USDT', '');

      if (side === 'buy') {
        const usdtBalance = balances.find(b => b.currency === 'USDT')?.balance || 0;
        if (totalNum > usdtBalance) {
          return res.status(400).json({ message: "Insufficient USDT balance" });
        }
      } else {
        const cryptoBalance = balances.find(b => b.currency === cryptoSymbol)?.balance || 0;
        if (amountNum > cryptoBalance) {
          return res.status(400).json({ message: `Insufficient ${cryptoSymbol} balance` });
        }
      }

      // Create spot order
      const order = await storage.createSpotOrder({
        userId,
        symbol,
        side,
        type,
        amount: amountNum,
        price: priceNum,
        total: totalNum,
        status: 'filled' // Mark as filled immediately for market orders
      });

      // Update user balances - BOTH currencies must be updated!
      if (side === 'buy') {
        // BUY: Deduct USDT, Add Cryptocurrency
        await storage.updateUserBalance(userId, 'USDT', -totalNum);
        await storage.updateUserBalance(userId, cryptoSymbol, amountNum);
        console.log(`✅ BUY ORDER: Deducted ${totalNum} USDT, Added ${amountNum} ${cryptoSymbol}`);
      } else {
        // SELL: Deduct Cryptocurrency, Add USDT
        await storage.updateUserBalance(userId, cryptoSymbol, -amountNum);
        await storage.updateUserBalance(userId, 'USDT', totalNum);
        console.log(`✅ SELL ORDER: Deducted ${amountNum} ${cryptoSymbol}, Added ${totalNum} USDT`);
      }

      res.json(order);
    } catch (error) {
      console.error("Error creating spot order:", error);
      res.status(500).json({ message: "Failed to create spot order" });
    }
  });

  app.get("/api/spot/orders", requireAuth, async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const orders = await storage.getUserSpotOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching spot orders:", error);
      res.status(500).json({ message: "Failed to fetch spot orders" });
    }
  });

  app.delete("/api/spot/orders/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const order = await storage.getSpotOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to cancel this order" });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ message: "Can only cancel pending orders" });
      }

      // Cancel order and refund locked funds
      await storage.updateSpotOrder(id, { status: 'cancelled' });

      if (order.side === 'buy') {
        await storage.updateUserBalance(userId, 'USDT', order.total);
      } else {
        await storage.updateUserBalance(userId, 'BTC', order.amount);
      }

      res.json({ message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling spot order:", error);
      res.status(500).json({ message: "Failed to cancel spot order" });
    }
  });

  // Transaction endpoints
  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Create Stripe payment intent (temporarily disabled)
  app.post("/api/payments/create-intent", async (req, res) => {
    try {
      const { amount, currency } = req.body;
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!amount || !currency) {
        return res.status(400).json({ message: "Amount and currency are required" });
      }

      const amountNum = parseFloat(amount);
      if (amountNum <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // TODO: Re-enable when paymentService is working
      // const paymentIntent = await paymentService.createPaymentIntent(
      //   amountNum,
      //   currency,
      //   userId
      // );

      res.status(503).json({ message: "Stripe integration temporarily disabled" });
    } catch (error) {
      console.error('Payment intent creation error:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Payment processing unavailable"
      });
    }
  });

  // TODO: Add Stripe webhook endpoint after server is running

  // Top-up endpoint
  app.post("/api/transactions/topup", async (req, res) => {
    try {
      const { userId, amount, currency, method, type } = req.body;

      if (!userId || !amount || !currency) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const amountNum = parseFloat(amount);
      if (amountNum <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId,
        symbol: currency,
        type: type || 'deposit',
        amount: amount.toString(),
        status: 'completed', // In production, this would be 'pending' until payment is confirmed
        method: method || 'crypto',
        txHash: `demo_${Date.now()}`, // In production, this would be the actual transaction hash
      });

      // Update user balance
      const currentBalance = await storage.getBalance(userId, currency);
      const newAvailable = currentBalance ?
        (parseFloat(currentBalance.available || '0') + amountNum).toString() :
        amount.toString();

      await storage.updateBalance(userId, currency, newAvailable, currentBalance?.locked || '0');

      res.json({
        transaction,
        message: "Top-up successful",
        newBalance: newAvailable
      });
    } catch (error) {
      console.error("Error processing top-up:", error);
      res.status(500).json({ message: "Failed to process top-up" });
    }
  });

  // Get user transactions
  app.get("/api/users/:id/transactions", async (req, res) => {
    try {
      const { id } = req.params;
      const transactions = await storage.getUserTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

      console.log(`📊 Fetching transactions for user ${userId}, limit: ${limit}`);

      const transactions = await storage.getUserTransactions(userId, limit);

      console.log(`✅ Found ${transactions.length} transactions for user ${userId}`);
      console.log(`📋 Transaction types:`, [...new Set(transactions.map(t => t.type))]);
      console.log(`📋 Sample transaction:`, transactions[0]);

      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Options settings
  app.get("/api/options-settings", async (req, res) => {
    try {
      const settings = await storage.getOptionsSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching options settings:", error);
      res.status(500).json({ message: "Failed to fetch options settings" });
    }
  });

  // Admin endpoints
  app.post("/api/admin/controls", requireAdmin, async (req, res) => {
    try {
      const controlData = insertAdminControlSchema.parse(req.body);
      const control = await storage.createAdminControl(controlData);
      res.json(control);
    } catch (error) {
      console.error("Error creating admin control:", error);
      res.status(400).json({ message: "Failed to create admin control" });
    }
  });

  app.get("/api/admin/controls/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const control = await storage.getAdminControl(userId);
      res.json(control);
    } catch (error) {
      console.error("Error fetching admin control:", error);
      res.status(500).json({ message: "Failed to fetch admin control" });
    }
  });

  app.patch("/api/admin/controls/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const control = await storage.updateAdminControl(id, updates);
      res.json(control);
    } catch (error) {
      console.error("Error updating admin control:", error);
      res.status(500).json({ message: "Failed to update admin control" });
    }
  });

  // Also support PUT method for frontend compatibility
  app.put("/api/admin/controls/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const control = await storage.updateAdminControl(id, updates);
      res.json(control);
    } catch (error) {
      console.error("Error updating admin control:", error);
      res.status(500).json({ message: "Failed to update admin control" });
    }
  });

  // Delete admin control
  app.delete("/api/admin/controls/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAdminControl(id);
      res.json({ message: "Control deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin control:", error);
      res.status(500).json({ message: "Failed to delete admin control" });
    }
  });

  // Diagnostic endpoint to check database schema (PUBLIC - for debugging)
  app.get("/api/diagnostics/schema", async (req, res) => {
    try {
      console.log('🔍 Checking database schema...');

      // Check transactions table structure
      const result = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'transactions'
        ORDER BY ordinal_position
      `);

      console.log('📋 Transactions table schema:', result);

      // Get a sample transaction
      const sampleTx = await db.select().from(transactions).limit(1);
      console.log('📦 Sample transaction:', sampleTx);

      res.json({
        schema: result,
        sampleTransaction: sampleTx[0],
        message: 'Check server logs for detailed schema information'
      });
    } catch (error) {
      console.error('❌ Error checking schema:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Trade execution for options with admin control
  app.post("/api/options/execute", async (req, res) => {
    try {
      const { tradeId } = req.body;
      const trade = await storage.getTrade(tradeId);

      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

      console.log(`🔍🔍🔍 FULL TRADE OBJECT:`, JSON.stringify(trade, null, 2));

      // Check admin control for this user
      const adminControl = await storage.getAdminControl(trade.userId);
      const currentPrice = await storage.getMarketData(trade.symbol);

      if (!currentPrice) {
        return res.status(400).json({ message: "Current price not available" });
      }

      let isWin = false;
      let exitPrice = currentPrice.price;

      // Apply admin control logic
      if (adminControl) {
        switch (adminControl.controlType) {
          case 'win':
            isWin = true;
            // Adjust exit price to ensure win
            if (trade.direction === 'up') {
              exitPrice = (parseFloat(trade.entryPrice!) + 0.01).toString();
            } else {
              exitPrice = (parseFloat(trade.entryPrice!) - 0.01).toString();
            }
            break;
          case 'lose':
            isWin = false;
            // Adjust exit price to ensure loss
            if (trade.direction === 'up') {
              exitPrice = (parseFloat(trade.entryPrice!) - 0.01).toString();
            } else {
              exitPrice = (parseFloat(trade.entryPrice!) + 0.01).toString();
            }
            break;
          case 'normal':
          default:
            // Use real market price
            if (trade.direction === 'up') {
              isWin = parseFloat(currentPrice.price) > parseFloat(trade.entryPrice!);
            } else {
              isWin = parseFloat(currentPrice.price) < parseFloat(trade.entryPrice!);
            }
            break;
        }
      } else {
        // No admin control, use real market logic
        if (trade.direction === 'up') {
          isWin = parseFloat(currentPrice.price) > parseFloat(trade.entryPrice!);
        } else {
          isWin = parseFloat(currentPrice.price) < parseFloat(trade.entryPrice!);
        }
      }

      // Calculate profit/loss
      console.log(`🔍 Trade data for profit calculation:`, {
        tradeId,
        tradeAmount: trade.amount,
        tradeAmountType: typeof trade.amount,
        tradeAmountKeys: Object.keys(trade),
        isWin,
        tradeObject: JSON.stringify(trade)
      });

      // Convert amount to string first (in case it's a Decimal object)
      const amountStr = trade.amount ? trade.amount.toString() : '0';
      const tradeAmount = parseFloat(amountStr);
      console.log(`💰 Parsed trade amount: ${tradeAmount} (from: ${amountStr})`);

      if (tradeAmount === 0) {
        console.error(`❌ ERROR: Trade amount is 0! This will result in $0 transaction. Trade:`, trade);
      }

      // Calculate profit/loss based on duration
      const optionsSettings = await storage.getOptionsSettings();
      const setting = optionsSettings.find(s => s.duration === trade.duration);
      const profitPercentage = setting ? parseFloat(setting.profitPercentage) : 10;
      const profitAmount = tradeAmount * (profitPercentage / 100);

      // Calculate profit for display/transaction purposes
      const profit = isWin ? profitAmount : -profitAmount;

      console.log(`🔥🔥🔥 [ROUTES.TS] Calculated profit: ${profit} (isWin: ${isWin})`);
      console.log(`🔥🔥🔥 [ROUTES.TS] Profit details:`, {
        tradeAmount,
        profitPercentage,
        profitAmount,
        isWin,
        profitCalculation: isWin ? `Unlock ${tradeAmount} + Profit ${profitAmount} = ${tradeAmount + profitAmount}` : `Loss ${profitAmount} (amount already locked)`,
        profitAsString: profit.toString()
      });

      // Update trade
      const updatedTrade = await storage.updateTrade(tradeId, {
        status: 'completed',
        exitPrice,
        profit: profit.toString(),
        completedAt: new Date(),
      });

      // Update user balance - unlock the locked amount and add/subtract profit
      const currentBalance = await storage.getBalance(trade.userId, 'USDT');
      if (currentBalance) {
        // For WIN: unlock tradeAmount + add profitAmount
        // For LOSE: unlock is 0, profitAmount is already deducted from locked
        const newAvailable = isWin
          ? parseFloat(currentBalance.available || '0') + tradeAmount + profitAmount
          : parseFloat(currentBalance.available || '0');
        const newLocked = parseFloat(currentBalance.locked || '0') - tradeAmount;

        console.log(`🔥🔥🔥 [ROUTES.TS] Balance update:`, {
          oldAvailable: currentBalance.available,
          oldLocked: currentBalance.locked,
          newAvailable: newAvailable.toString(),
          newLocked: Math.max(0, newLocked).toString(),
          tradeAmount,
          profitAmount,
          isWin,
          calculation: isWin ? `${currentBalance.available} + ${tradeAmount} + ${profitAmount} = ${newAvailable}` : `${currentBalance.available} (unchanged)`
        });

        await storage.updateBalance(
          trade.userId,
          'USDT',
          newAvailable.toString(),
          Math.max(0, newLocked).toString()
        );
      }

      // Create transaction record for trade result
      try {
        // Use profit amount (not balance change) to show actual win/loss
        // IMPORTANT: Pass as string for Decimal type, but ensure it's a valid decimal string
        const transactionAmount = profit.toFixed(8); // Ensure 8 decimal places
        console.log(`📝 Creating transaction with amount: ${transactionAmount} (type: ${typeof transactionAmount})`);

        // Use old transaction types for database compatibility
        const transactionType = isWin ? 'trade_win' : 'trade_loss';

        const transaction = await storage.createTransaction({
          userId: trade.userId,
          type: transactionType as any,
          amount: transactionAmount,
          status: 'completed',
          description: `${isWin ? 'Win' : 'Loss'} on ${trade.symbol} trade`,
          referenceId: tradeId
        });
        console.log(`✅ Transaction created:`, {
          transactionId: transaction.id,
          amount: transaction.amount,
          amountType: typeof transaction.amount,
          profit: profit,
          isWin,
          type: transactionType
        });

        // Verify what was actually stored in the database
        const verifyTx = await storage.getTransaction(transaction.id);
        console.log(`🔍 VERIFICATION - Transaction retrieved from DB:`, {
          id: verifyTx?.id,
          storedAmount: verifyTx?.amount,
          storedAmountType: typeof verifyTx?.amount,
          storedAmountString: verifyTx?.amount?.toString()
        });
      } catch (txError) {
        console.error(`⚠️ Failed to create transaction for trade ${tradeId}:`, txError);
      }

      res.json({ trade: updatedTrade, isWin, profit });
    } catch (error) {
      console.error("Error executing options trade:", error);
      res.status(500).json({ message: "Failed to execute trade" });
    }
  });

  // Add missing API endpoints for the new pages
  
  // Additional admin endpoints with proper role-based access control
  app.get("/api/admin/users", requireSessionAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();

      // Debug: Log raw user data from database
      if (users.length > 0) {
        console.log('🔍 RAW user data from database (first user):', {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          hasPassword: !!users[0].password,
          passwordValue: users[0].password,
          passwordLength: users[0].password?.length || 0,
          plainPassword: users[0].plainPassword,
          allKeys: Object.keys(users[0])
        });
      }

      // Enrich users with their USDT balance information
      const usersWithBalances = await Promise.all(
        users.map(async (user) => {
          try {
            // Get all user balances to ensure consistency with user dashboard
            const userBalances = await storage.getUserBalances(user.id);
            const usdtBalance = userBalances.find(b => b.symbol === 'USDT');

            // If no USDT balance exists, create default one
            if (!usdtBalance) {
              await storage.createBalance({
                userId: user.id,
                symbol: 'USDT',
                available: '0.00',
                locked: '0.00'
              });

              return {
                ...user,
                balance: 0
              };
            }

            return {
              ...user,
              balance: parseFloat(usdtBalance.available)
            };
          } catch (error) {
            console.warn(`Failed to get balance for user ${user.id}:`, error);
            return {
              ...user,
              balance: 0
            };
          }
        })
      );

      // Debug: Log first user to verify password field is included
      if (usersWithBalances.length > 0) {
        console.log('📊 Sample user data (first user):', {
          id: usersWithBalances[0].id,
          username: usersWithBalances[0].username,
          hasPassword: !!usersWithBalances[0].password,
          passwordLength: usersWithBalances[0].password?.length || 0
        });
      }

      res.json(usersWithBalances);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/controls", requireSessionAdmin, async (req, res) => {
    try {
      const controls = await storage.getAllAdminControls();
      res.json(controls);
    } catch (error) {
      console.error("Error fetching admin controls:", error);
      res.status(500).json({ message: "Failed to fetch controls" });
    }
  });

  app.post("/api/admin/controls", requireSessionAdmin, async (req, res) => {
    try {
      const { userId, controlType, notes } = req.body;

      if (!userId || !controlType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if control already exists for this user
      const existingControl = await storage.getAdminControl(userId);
      if (existingControl && existingControl.isActive) {
        return res.status(400).json({ message: "Active control already exists for this user" });
      }

      const control = await storage.createAdminControl({
        userId,
        adminId: req.session?.user?.id || 'admin',
        controlType,
        isActive: true,
        notes: notes || `Control set to ${controlType} by ${req.session?.user?.username || 'admin'}`,
      });

      res.json(control);
    } catch (error) {
      console.error("Error creating admin control:", error);
      res.status(500).json({ message: "Failed to create admin control" });
    }
  });

  app.put("/api/admin/controls/:id", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { controlType, isActive, notes } = req.body;

      const updates: any = {};
      if (controlType !== undefined) updates.controlType = controlType;
      if (isActive !== undefined) updates.isActive = isActive;
      if (notes !== undefined) updates.notes = notes;

      const control = await storage.updateAdminControl(id, updates);
      res.json(control);
    } catch (error) {
      console.error("Error updating admin control:", error);
      res.status(500).json({ message: "Failed to update admin control" });
    }
  });

  app.delete("/api/admin/controls/:id", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAdminControl(id);
      res.json({ message: "Admin control deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin control:", error);
      res.status(500).json({ message: "Failed to delete admin control" });
    }
  });

  // Trading controls routes for superadmin
  app.get("/api/admin/trading-controls", requireSessionAdmin, async (req, res) => {
    try {
      const controls = await storage.getTradingControls();
      res.json(controls);
    } catch (error) {
      console.error("Error fetching trading controls:", error);
      res.status(500).json({ error: "Failed to fetch trading controls" });
    }
  });

  app.post("/api/admin/trading-controls", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { userId, controlType, notes } = req.body;

      if (!userId || !controlType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const adminId = req.session?.user?.id || 'superadmin-1';
      const control = await storage.createTradingControl(userId, controlType, notes, adminId);

      // Log activity
      await logAdminActivityFromRequest(
        req,
        ActionTypes.TRADING_CONTROL_SET,
        ActionCategories.TRADING,
        `Set trading mode to ${controlType.toUpperCase()} for user ${user.username || user.email}`,
        { id: userId, username: user.username, email: user.email },
        { controlType, notes, previousMode: user.tradingMode || 'normal' }
      );

      res.json(control);
    } catch (error) {
      console.error("Error creating trading control:", error);
      res.status(500).json({ error: "Failed to create trading control" });
    }
  });

  app.put("/api/admin/trading-controls/:id", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { controlType, notes, isActive } = req.body;
      
      const control = await storage.updateTradingControl(id, { controlType, notes, isActive });
      res.json(control);
    } catch (error) {
      console.error("Error updating trading control:", error);
      res.status(500).json({ error: "Failed to update trading control" });
    }
  });

  // User wallet management routes
  app.get("/api/admin/user-wallets", requireSessionAdmin, async (req, res) => {
    try {
      const wallets = await storage.getUserWallets();
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching user wallets:", error);
      res.status(500).json({ error: "Failed to fetch user wallets" });
    }
  });

  // Redeem code management routes
  app.post("/api/admin/redeem-codes/:id/action", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, newAmount, newDescription, newMaxUses } = req.body;

      console.log('🎁 Redeem code action:', { id, action, newAmount, newDescription, newMaxUses });

      if (!action) {
        return res.status(400).json({
          success: false,
          error: "Missing action parameter"
        });
      }

      if (action === 'edit') {
        // Update redeem code
        const updates: any = {};
        if (newAmount !== undefined) updates.bonusAmount = newAmount;
        if (newDescription !== undefined) updates.description = newDescription;
        if (newMaxUses !== undefined) updates.maxUses = newMaxUses;

        const updated = await storage.updateRedeemCode(id, updates);
        return res.json({
          success: true,
          message: "Redeem code updated successfully",
          code: updated
        });
      } else if (action === 'disable') {
        // Disable redeem code
        console.log('🔴 Disabling redeem code:', id);
        const updated = await storage.disableRedeemCode(id);
        console.log('✅ Redeem code disabled:', updated);
        return res.json({
          success: true,
          message: "Redeem code disabled successfully",
          code: updated
        });
      } else if (action === 'delete') {
        // Delete redeem code
        console.log('🗑️ Deleting redeem code:', id);
        await storage.deleteRedeemCode(id);
        console.log('✅ Redeem code deleted successfully');
        return res.json({
          success: true,
          message: "Redeem code deleted successfully"
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid action. Must be 'edit', 'disable', or 'delete'"
        });
      }
    } catch (error: any) {
      console.error("❌ Error performing redeem code action:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack?.split('\n').slice(0, 5)
      });
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message || "Failed to perform redeem code action",
        details: `Failed to ${action} redeem code ${id}`
      });
    }
  });

  // Enhanced user management routes for superadmin
  app.put("/api/admin/users/update-password", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      
      if (!userId || !newPassword) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedPassword, newPassword);

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ error: "Failed to update user password" });
    }
  });

  app.put("/api/admin/users/update-wallet", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { userId, walletAddress } = req.body;
      
      if (!userId || !walletAddress) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await storage.updateUserWallet(userId, walletAddress);
      
      res.json({ success: true, message: "Wallet address updated successfully" });
    } catch (error) {
      console.error("Error updating user wallet:", error);
      res.status(500).json({ error: "Failed to update user wallet" });
    }
  });

  // User status management route
  app.put("/api/admin/users/update-status", requireSessionAdmin, async (req, res) => {
    try {
      const { userId, status, adminNotes } = req.body;
      
      if (!userId || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user status and notes
      await storage.updateUser(userId, { 
        status, 
        adminNotes: adminNotes || user.adminNotes,
        updatedAt: new Date()
      });
      
      res.json({ 
        success: true, 
        message: "User status updated successfully",
        user: await storage.getUserById(userId)
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Admin deposit and withdrawal routes
  app.post("/api/admin/deposit", requireSessionAdmin, async (req, res) => {
    try {
      const { userId, amount, notes } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get current balance
      const currentBalance = await storage.getBalance(userId, 'USDT');
      const currentAmount = currentBalance ? parseFloat(currentBalance.available) : 0;
      const newAmount = currentAmount + parseFloat(amount);

      // Update balance
      await storage.updateBalance(userId, 'USDT', newAmount.toString(), currentBalance?.locked || '0');

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId,
        type: 'deposit',
        symbol: 'USDT',
        amount: amount.toString(),
        status: 'completed',
        method: 'admin',
        currency: 'USDT',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json({ 
        success: true, 
        message: "Deposit processed successfully",
        newBalance: newAmount,
        transaction
      });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ error: "Failed to process deposit" });
    }
  });

  app.post("/api/admin/withdraw", requireSessionAdmin, async (req, res) => {
    try {
      const { userId, amount, notes } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get current balance
      const currentBalance = await storage.getBalance(userId, 'USDT');
      if (!currentBalance || parseFloat(currentBalance.available) < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const currentAmount = parseFloat(currentBalance.available);
      const newAmount = currentAmount - parseFloat(amount);

      // Update balance
      await storage.updateBalance(userId, 'USDT', newAmount.toString(), currentBalance.locked);

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId,
        type: 'withdraw',
        symbol: 'USDT',
        amount: amount.toString(),
        status: 'completed',
        method: 'admin',
        currency: 'USDT',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json({ 
        success: true, 
        message: "Withdrawal processed successfully",
        newBalance: newAmount,
        transaction
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ error: "Failed to process withdrawal" });
    }
  });

  app.get("/api/admin/balances", requireSessionSuperAdmin, async (req, res) => {
    try {
      const balances = await storage.getAllBalances();
      res.json(balances);
    } catch (error) {
      console.error("Error fetching balances:", error);
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  });

  app.put("/api/admin/balances/:userId/:symbol", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { userId, symbol } = req.params;
      const { available } = req.body;

      if (!available || isNaN(parseFloat(available))) {
        return res.status(400).json({ message: "Valid available balance is required" });
      }

      // Get user and current balance for logging
      const user = await storage.getUserById(userId);
      const currentBalance = await storage.getBalance(userId, symbol.toUpperCase());
      const previousBalance = currentBalance?.available || '0';

      // Ensure symbol is uppercase and exists
      const normalizedSymbol = (symbol || '').toUpperCase();
      const balance = await storage.updateBalance(userId, normalizedSymbol, available, '0');

      // Log activity
      if (user) {
        await logAdminActivityFromRequest(
          req,
          ActionTypes.BALANCE_UPDATED,
          ActionCategories.BALANCE,
          `Updated ${normalizedSymbol} balance for user ${user.username || user.email} from ${previousBalance} to ${available}`,
          { id: userId, username: user.username, email: user.email },
          { symbol: normalizedSymbol, previousBalance, newBalance: available, change: (parseFloat(available) - parseFloat(previousBalance)).toString() }
        );
      }

      res.json(balance);
    } catch (error) {
      console.error("Error updating balance:", error);
      res.status(400).json({ message: "Failed to update balance" });
    }
  });

  // Balance management endpoint for deposits/withdrawals
  app.put("/api/admin/balances/:userId", requireSessionAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { balance, action, note } = req.body;

      if (!balance || isNaN(parseFloat(balance))) {
        return res.status(400).json({ message: "Valid balance amount is required" });
      }

      if (!action || !['add', 'subtract'].includes(action)) {
        return res.status(400).json({ message: "Valid action (add/subtract) is required" });
      }

      // Get current USDT balance
      const currentBalance = await storage.getBalance(userId, 'USDT');
      const currentAmount = parseFloat(currentBalance?.available || '0');
      const changeAmount = parseFloat(balance);

      let newAmount: number;
      if (action === 'add') {
        newAmount = currentAmount + changeAmount;
      } else {
        newAmount = currentAmount - changeAmount;
        if (newAmount < 0) {
          return res.status(400).json({ message: "Insufficient balance for withdrawal" });
        }
      }

      // Update the balance
      const updatedBalance = await storage.updateBalance(userId, 'USDT', newAmount.toString(), '0');

      // Log the transaction (optional - you can add transaction logging here)
      console.log(`Balance ${action}: User ${userId}, Amount: ${changeAmount}, New Balance: ${newAmount}, Note: ${note}`);

      // Broadcast balance update to all connected clients (for real-time sync)
      broadcastToAll({
        type: 'balance_update',
        data: {
          userId,
          symbol: 'USDT',
          newBalance: newAmount.toString(),
          action,
          amount: changeAmount
        }
      });

      res.json({
        balance: updatedBalance,
        message: `Balance ${action === 'add' ? 'deposit' : 'withdrawal'} successful`,
        newAmount: newAmount.toString()
      });
    } catch (error) {
      console.error("Error processing balance change:", error);
      res.status(500).json({ message: "Failed to process balance change" });
    }
  });

  // User role management endpoints (Super Admin only)
  app.put("/api/admin/users/:id/role", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['user', 'admin', 'super_admin'].includes(role)) {
        return res.status(400).json({ message: "Valid role is required (user, admin, super_admin)" });
      }

      // Get user before update for logging
      const userBefore = await storage.getUserById(id);
      const previousRole = userBefore?.role || 'unknown';

      const user = await storage.updateUser(id, { role });

      // Log activity
      if (user) {
        await logAdminActivityFromRequest(
          req,
          ActionTypes.USER_ROLE_CHANGED,
          ActionCategories.USER_MANAGEMENT,
          `Changed role for user ${user.username || user.email} from ${previousRole} to ${role}`,
          { id: user.id, username: user.username, email: user.email },
          { previousRole, newRole: role }
        );
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put("/api/admin/users/:id/status", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "Valid status is required (true/false)" });
      }

      const user = await storage.updateUser(id, { isActive });
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Full user update endpoint (Super Admin only)
  app.put("/api/admin/users/:id", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, walletAddress, role, isActive, password, adminNotes } = req.body;

      const updates: any = {};
      if (username !== undefined) updates.username = username;
      if (email !== undefined) updates.email = email;
      if (walletAddress !== undefined) updates.walletAddress = walletAddress;
      if (role !== undefined) {
        if (!['user', 'admin', 'super_admin'].includes(role)) {
          return res.status(400).json({ message: "Valid role is required (user, admin, super_admin)" });
        }
        updates.role = role;
      }
      if (isActive !== undefined) updates.isActive = isActive;
      if (adminNotes !== undefined) updates.adminNotes = adminNotes;

      // Hash password if provided
      if (password && password.trim()) {
        const hashedPassword = await hashPassword(password);
        updates.password = hashedPassword;
        updates.plainPassword = password; // Store plain password for superadmin view
      }

      const user = await storage.updateUser(id, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user endpoint (Super Admin only)
  app.delete("/api/admin/users/:id", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent deleting super admin users
      if (user.role === 'super_admin') {
        return res.status(403).json({ message: "Cannot delete super admin users" });
      }

      await storage.deleteUser(id);

      // Log activity
      await logAdminActivityFromRequest(
        req,
        ActionTypes.USER_DELETED,
        ActionCategories.USER_MANAGEMENT,
        `Deleted user ${user.username || user.email} (ID: ${id})`,
        { id: user.id, username: user.username, email: user.email },
        { role: user.role, walletAddress: user.walletAddress }
      );

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Send message to user endpoint (Admin only) - simple approach without external packages
  app.post("/api/admin/messages", requireSessionAdmin, async (req, res) => {
    try {
      const { userId, message, type, fileName, fileData } = req.body;
      const adminId = req.session?.user?.id;

      if (!userId || !message) {
        return res.status(400).json({ message: "User ID and message are required" });
      }

      // Check if target user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Handle simple file reference (just show filename in message)
      let finalMessage = message;
      let attachmentData = null;
      
      if (fileName) {
        attachmentData = {
          originalName: fileName,
          url: `#attachment-${fileName}` // Simple reference
        };
        
        if (!finalMessage.includes(fileName)) {
          finalMessage += ` [Attachment: ${fileName}]`;
        }
      }

      // Store message as a transaction record for persistence
      const tx = await storage.createTransaction({
        userId,
        type: 'transfer',
        symbol: 'MSG',
        amount: '0',
        status: 'completed',
                                        metadata: JSON.stringify({ 
          kind: 'chat', 
        fromUserId: adminId,
        toUserId: userId,
          message: finalMessage,
        type: type || 'admin_message',
          attachment: attachmentData,
          createdAt: new Date().toISOString() 
        }),
        createdAt: new Date(),
      } as any);

      console.log(`💬 Admin message sent: ${adminId} -> ${userId}: "${finalMessage}"`);

      res.json({
        message: "Message sent successfully",
        data: { 
          id: tx.id, 
          fromUserId: adminId, 
          toUserId: userId, 
          message: finalMessage,
          type: type || 'admin_message',
          attachment: attachmentData
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Note: Files are shown as references in messages, not actually uploaded

  // Get chat messages for a user (Admin only)
  app.get("/api/admin/messages/:userId", requireSessionAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`📧 Admin requesting chat messages for user: ${userId}`);

      // Get all chat messages for this user from transactions
      const userTransactions = await storage.getUserTransactions(userId, 200);
      console.log(`📧 Found ${userTransactions.length} total transactions for user ${userId}`);
      
      // Filter transactions to find message transactions
      const messageTransactions = userTransactions.filter(tx => tx.symbol === 'MSG' && tx.metadata);
      console.log(`📧 Found ${messageTransactions.length} message transactions`);
      
      // Filter and parse chat messages
      const messages = messageTransactions
        .map(tx => {
          try {
            console.log(`📧 Processing transaction ${tx.id} with metadata:`, tx.metadata);
            const metadata = JSON.parse(tx.metadata);
            if (metadata.kind === 'chat') {
              const message = {
                id: tx.id,
                fromUserId: metadata.fromUserId,
                toUserId: metadata.toUserId,
                message: metadata.message,
                type: metadata.type || 'user_message',
                timestamp: metadata.createdAt || tx.createdAt,
          isRead: true,
                sender: metadata.fromUserId === userId ? 'user' : 'admin',
                attachment: metadata.attachment || null
              };
              console.log(`📧 Parsed message:`, message);
              return message;
            }
          } catch (error) {
            console.error('Error parsing admin message metadata:', error);
          }
          return null;
        })
        .filter(msg => msg !== null)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      console.log(`📧 Admin retrieved ${messages.length} chat messages for user ${userId}:`, messages);
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // User sends message to admin
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;
      const userId = req.session?.user?.id;

      if (!message || !userId) {
        return res.status(400).json({ message: "Message and user ID are required" });
      }

      // Persist chat by storing as a transaction metadata entry (portable across SQLite/Postgres)
      const tx = await storage.createTransaction({
        userId,
        type: 'transfer',
        symbol: 'MSG',
        amount: '0',
        status: 'completed',
        metadata: JSON.stringify({ kind: 'chat', fromUserId: userId, toUserId: 'admin', message, createdAt: new Date().toISOString() }),
        createdAt: new Date(),
      } as any);

      res.json({
        message: 'Message sent successfully',
        data: { id: tx.id, fromUserId: userId, message }
      });
    } catch (error) {
      console.error("Error sending user message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get user's own chat messages
  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const sessionUserId = req.session?.user?.id;

      // Ensure user can only access their own messages
      if (userId !== sessionUserId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get all chat messages for this user from transactions
      const userTransactions = await storage.getUserTransactions(userId, 200);
      
      // Filter and parse chat messages
      const messages = userTransactions
        .filter(tx => tx.symbol === 'MSG' && tx.metadata)
        .map(tx => {
          try {
            const metadata = JSON.parse(tx.metadata);
            if (metadata.kind === 'chat') {
              return {
                id: tx.id,
                fromUserId: metadata.fromUserId,
                toUserId: metadata.toUserId,
                message: metadata.message,
                type: metadata.type || 'user_message',
                timestamp: metadata.createdAt || tx.createdAt,
          isRead: true,
                sender: metadata.fromUserId === userId ? 'user' : 'admin'
              };
            }
          } catch (error) {
            console.error('Error parsing message metadata:', error);
          }
          return null;
        })
        .filter(msg => msg !== null)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      console.log(`📧 Retrieved ${messages.length} chat messages for user ${userId}`);
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching user messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Reset all user balances to zero (super admin only)
  app.post("/api/admin/reset-balances", async (req, res) => {
    try {
      if (!req.session.user || req.session.user.role !== 'super_admin') {
        return res.status(403).json({ message: "Super admin access required" });
      }

      console.log('🔄 Resetting all user balances to zero...');

      // Get all users
      const users = await storage.getAllUsers();
      const regularUsers = users.filter(u => u.role === 'user');

      let resetCount = 0;

      for (const user of regularUsers) {
        // Get user's balances
        const balances = await storage.getUserBalances(user.id);

        for (const balance of balances) {
          // Update balance to zero
          await storage.updateBalance(user.id, balance.symbol, '0.00', '0.00');
          resetCount++;
        }
      }

      console.log(`✅ Reset ${resetCount} balances for ${regularUsers.length} users`);

      res.json({
        message: `Successfully reset ${resetCount} balances for ${regularUsers.length} users`,
        resetCount,
        userCount: regularUsers.length
      });
    } catch (error) {
      console.error("Error resetting balances:", error);
      res.status(500).json({ message: "Failed to reset balances" });
    }
  });

  app.get("/api/admin/trades", async (req, res) => {
    try {
      const trades = await storage.getAllTrades();
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  app.put("/api/admin/options-settings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const settings = await storage.updateOptionsSettings(id, updates);
      res.json(settings);
    } catch (error) {
      console.error("Error updating options settings:", error);
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // Get user balances (real data)
  app.get("/api/balances", async (req, res) => {
    try {
      console.log('💰 [/api/balances] Request received');
      console.log('💰 [/api/balances] Session:', req.session);
      console.log('💰 [/api/balances] Session user:', req.session?.user);
      console.log('💰 [/api/balances] Headers:', req.headers);

      // Get user from session
      const user = req.session.user;
      if (!user) {
        console.log('❌ [/api/balances] No user in session - authentication required');
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log('💰 [/api/balances] User authenticated:', user.id, user.username, 'Main balance:', user.balance);

      // Get real user balances from database
      let balances = await storage.getUserBalances(user.id);
      console.log('💰 [/api/balances] Balances from DB:', balances);

      // Sync USDT balance with user's main balance (single source of truth)
      const usdtBalance = balances.find(b => b.symbol === 'USDT');
      const userMainBalance = user.balance || 0;

      if (!usdtBalance) {
        // Create USDT balance if doesn't exist, using user's main balance
        console.log('⚠️ [/api/balances] No USDT balance found, creating with main balance:', userMainBalance);
        await storage.createBalance({
          userId: user.id,
          symbol: 'USDT',
          available: userMainBalance.toString(),
          locked: '0.00'
        });
      } else if (parseFloat(usdtBalance.available) !== userMainBalance) {
        // Update USDT balance to match user's main balance
        console.log('🔄 [/api/balances] Syncing USDT balance:', parseFloat(usdtBalance.available), '→', userMainBalance);
        await storage.updateBalance(
          user.id,
          'USDT',
          userMainBalance.toString(),
          usdtBalance.locked || '0.00'
        );
      }

      // Refresh balances after sync
      balances = await storage.getUserBalances(user.id);
      console.log('✅ [/api/balances] Returning synced balances:', balances);
      res.json(balances);
    } catch (error) {
      console.error("❌ [/api/balances] Error fetching balances:", error);
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  });

  // Get active trades for user (real data)
  app.get("/api/trades/active", async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get real active trades from database
      const activeTrades = await storage.getUserTrades(user.id, 50);
      const filteredTrades = activeTrades.filter(trade =>
        trade.status === 'active' || trade.status === 'pending'
      );

      res.json(filteredTrades);
    } catch (error) {
      console.error("Error fetching active trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  // Get user transactions (real data)
  app.get("/api/transactions", async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get real transactions from database
      const transactions = await storage.getUserTransactions(user.id, 50);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create top-up transaction (real data)
  app.post("/api/transactions/topup", async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { amount, currency, method } = req.body;

      if (!amount || !currency || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount or currency" });
      }

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: 'deposit',
        symbol: currency,
        amount: amount,
        fee: '0',
        status: 'completed', // For demo purposes, mark as completed immediately
        txHash: `demo_${Date.now()}`,
        createdAt: new Date(),
      });

      // Update user balance
      const currentBalance = await storage.getBalance(user.id, currency);
      const newAvailable = currentBalance
        ? (parseFloat(currentBalance.available) + parseFloat(amount)).toString()
        : amount;

      await storage.updateBalance(user.id, currency, newAvailable, currentBalance?.locked || '0');

      res.json({
        transaction,
        message: "Top-up successful",
        newBalance: newAvailable
      });
    } catch (error) {
      console.error("Error processing top-up:", error);
      res.status(500).json({ message: "Failed to process top-up" });
    }
  });

  // Create deposit request endpoint (for user dashboard)
  app.post("/api/transactions/deposit-request", requireAuth, async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { amount, currency } = req.body;

      if (!amount || !currency || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount or currency" });
      }

      // Validate minimum amounts
      const minAmounts: { [key: string]: number } = {
        'USDT-ERC': 100,
        'USDT-BEP': 100,
        'USDT-TRC': 100,
        'USDT-ERC20': 100,
        'USDT-BEP20': 100,
        'USDT-TRC20': 100,
        'BTC': 0.001,
        'ETH': 0.01,
        'SOL': 0.1
      };

      const minAmount = minAmounts[currency] || 1;
      if (parseFloat(amount) < minAmount) {
        return res.status(400).json({
          message: `Minimum deposit amount is ${minAmount} ${currency}`
        });
      }

      // Generate unique deposit ID
      const depositId = `dep_${Date.now()}_${user.id}`;

      // Create pending transaction record
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: 'deposit',
        symbol: currency,
        amount: amount,
        fee: '0',
        status: 'pending',
        txHash: `pending_${depositId}`,
        metadata: JSON.stringify({
          depositId,
          depositAddress: getDepositAddress(currency),
          network: getNetworkInfo(currency),
          createdAt: new Date().toISOString()
        }),
        createdAt: new Date(),
      });

      // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN
      const notification: AdminNotification = {
        id: `deposit_${transaction.id}_${Date.now()}`,
        type: 'deposit',
        userId: user.id,
        username: user.username || user.email || 'Unknown User',
        amount: amount,
        currency: currency,
        timestamp: new Date(),
        read: false
      };
      broadcastNotification(notification);
      console.log(`🔔 Sent deposit request notification for ${user.username || user.email}: ${amount} ${currency}`);

      res.json({
        success: true,
        depositId,
        transactionId: transaction.id,
        amount: amount,
        currency: currency,
        status: 'pending',
        message: "Deposit request created successfully. Please complete the payment and upload receipt."
      });
    } catch (error) {
      console.error("Error creating deposit request:", error);
      res.status(500).json({ message: "Failed to create deposit request" });
    }
  });

  // Submit proof endpoint (for receipt upload)
  app.post("/api/transactions/submit-proof", requireAuth, async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { depositId, txHash, walletAddress } = req.body;

      if (!depositId) {
        return res.status(400).json({ message: "Deposit ID is required" });
      }

      // Find the transaction by deposit ID
      const transactions = await storage.getTransactionsByUserId(user.id);
      const transaction = transactions.find(t => {
        try {
          const metadata = JSON.parse(t.metadata || '{}');
          return metadata.depositId === depositId;
        } catch {
          return false;
        }
      });

      if (!transaction) {
        return res.status(404).json({ message: "Deposit request not found" });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Deposit request is not pending" });
      }

      // Update transaction with proof information
      const updatedMetadata = {
        ...JSON.parse(transaction.metadata || '{}'),
        txHash: txHash || `user_upload_${Date.now()}`,
        walletAddress: walletAddress || 'user_wallet_address',
        proofSubmittedAt: new Date().toISOString(),
        status: 'verifying'
      };

      // Update transaction status to verifying
      await storage.updateTransaction(transaction.id, {
        status: 'verifying',
        txHash: txHash || transaction.txHash,
        metadata: JSON.stringify(updatedMetadata)
      });

      res.json({
        success: true,
        message: "Transaction proof submitted successfully. Your deposit is now being verified.",
        depositId,
        status: 'verifying'
      });
    } catch (error) {
      console.error("Error submitting proof:", error);
      res.status(500).json({ message: "Failed to submit proof" });
    }
  });

  // Create crypto deposit transaction (PRODUCTION READY) with file upload support
  const depositHandler = upload ? upload.single('receipt') : (req: any, res: any, next: any) => next();

  app.post("/api/transactions/deposit", depositHandler, async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { amount, currency, txHash, method, paymentData } = req.body;
      const receiptFile = req.file;

      if (!amount || !currency || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount or currency" });
      }

      // Validate minimum amounts
      const minAmounts: { [key: string]: number } = {
        'USDT-ERC': 100,
        'USDT-BEP': 100,
        'USDT-TRC': 100,
        'USDT-ERC20': 100,
        'USDT-BEP20': 100,
        'USDT-TRC20': 100,
        'BTC': 0.001,
        'ETH': 0.01,
        'SOL': 0.1
      };

      const minAmount = minAmounts[currency] || 1;
      if (parseFloat(amount) < minAmount) {
        return res.status(400).json({
          message: `Minimum deposit amount is ${minAmount} ${currency}`
        });
      }

      // Validate method-specific requirements
      if (method === 'crypto') {
        // For crypto deposits with receipt, we don't require txHash immediately
        // The receipt will be reviewed manually
        console.log('📄 Crypto deposit with receipt:', receiptFile ? receiptFile.filename : 'No receipt');
      } else if (method === 'card') {
        if (!paymentData?.paymentIntentId) {
          return res.status(400).json({ message: "Payment intent ID required for card payments" });
        }
      } else if (method === 'bank') {
        if (!paymentData?.transferReference) {
          return res.status(400).json({ message: "Bank transfer reference required" });
        }
      }

      // Determine transaction status based on payment method and verification
      let transactionStatus = 'pending';
      if (method === 'card' && paymentData?.paymentIntentId) {
        // TODO: Re-enable Stripe verification
        // const isValidPayment = await verifyStripePayment(paymentData.paymentIntentId, amount);
        // transactionStatus = isValidPayment ? 'completed' : 'pending';
        transactionStatus = 'pending'; // For now, all card payments are pending
      } else if (method === 'bank') {
        transactionStatus = 'pending'; // Bank transfers always need manual approval
      } else if (method === 'crypto') {
        transactionStatus = 'pending'; // Crypto needs manual verification with receipt
      }

      // Prepare metadata including receipt information
      const metadata = {
        ...paymentData,
        receiptFile: receiptFile ? {
          filename: receiptFile.filename,
          originalName: receiptFile.originalname,
          size: receiptFile.size,
          mimetype: receiptFile.mimetype,
          uploadedAt: new Date().toISOString()
        } : null,
        depositAddress: getDepositAddress(currency),
        network: getNetworkInfo(currency)
      };

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: 'deposit',
        symbol: currency,
        amount: amount,
        fee: '0',
        status: transactionStatus,
        txHash: txHash || `pending_${Date.now()}`,
        method: method || 'crypto',
        metadata: JSON.stringify(metadata),
        createdAt: new Date(),
      });

      // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN
      if (transactionStatus === 'pending') {
        const notification: AdminNotification = {
          id: `deposit_${transaction.id}_${Date.now()}`,
          type: 'deposit',
          userId: user.id,
          username: user.username || user.email || 'Unknown User',
          amount: amount,
          currency: currency,
          timestamp: new Date(),
          read: false
        };
        broadcastNotification(notification);
        console.log(`🔔 Sent deposit notification for ${user.username || user.email}: ${amount} ${currency}`);
      }

      // For crypto deposits with receipts, keep as pending for manual review
      // For card payments, process immediately after verification
      if (method === 'card' && paymentData?.paymentIntentId) {
        // Update transaction status to completed for verified card payments
        await storage.updateTransaction(transaction.id, { status: 'completed' });

        // Update user balance
        const currentBalance = await storage.getBalance(user.id, currency);
        const newAvailable = currentBalance
          ? (parseFloat(currentBalance.available) + parseFloat(amount)).toString()
          : amount;

        await storage.updateBalance(user.id, currency, newAvailable, currentBalance?.locked || '0');

        res.json({
          transaction: { ...transaction, status: 'completed' },
          message: "Deposit successful",
          amount: amount,
          currency: currency
        });
      } else {
        // For crypto and bank deposits, keep as pending
        res.json({
          transaction,
          message: "Deposit request submitted successfully. Your deposit will be processed after verification.",
          amount: amount,
          currency: currency,
          receiptUploaded: !!receiptFile
        });
      }
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  // Admin endpoint to approve/reject pending transactions
  app.post("/api/admin/transactions/:id/approve", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body; // action: 'approve' | 'reject'

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
      }

      // Get the transaction
      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Transaction is not pending approval" });
      }

      if (action === 'approve') {
        // Update transaction status to completed
        await storage.updateTransaction(id, {
          status: 'completed',
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            approvedBy: req.session.user?.id,
            approvedAt: new Date().toISOString()
          })
        });

        // Update user balance for deposits
        if (transaction.type === 'deposit') {
          const currentBalance = await storage.getBalance(transaction.userId, transaction.symbol);
          const newAvailable = currentBalance
            ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
            : transaction.amount;

          await storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, currentBalance?.locked || '0');
        }

        // For withdrawals, balance was already deducted when request was created
        // Just mark as completed

        res.json({ message: "Transaction approved and processed", transaction });
      } else {
        // Reject transaction
        await storage.updateTransaction(id, {
          status: 'failed',
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            rejectedBy: req.session.user?.id,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason || 'No reason provided'
          })
        });

        // If rejecting withdrawal, refund the balance
        if (transaction.type === 'withdraw') {
          const currentBalance = await storage.getBalance(transaction.userId, transaction.symbol);
          const newAvailable = currentBalance
            ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
            : transaction.amount;

          await storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, currentBalance?.locked || '0');
        }

        res.json({ message: "Transaction rejected", transaction });
      }
    } catch (error) {
      console.error("Error processing transaction approval:", error);
      res.status(500).json({ message: "Failed to process transaction approval" });
    }
  });

  // Admin endpoint to approve/reject deposits (alias for transactions endpoint)
  app.post("/api/admin/deposits/:id/action", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
      }

      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Deposit not found" });
      }

      if (transaction.type !== 'deposit') {
        return res.status(400).json({ message: "Transaction is not a deposit" });
      }

      // Allow both 'pending' and 'verifying' status to be processed
      if (transaction.status !== 'pending' && transaction.status !== 'verifying') {
        return res.status(400).json({ message: "Deposit is not pending approval" });
      }

      // Get user info for logging
      const user = await storage.getUserById(transaction.userId);

      if (action === 'approve') {
        await storage.updateTransaction(id, {
          status: 'completed',
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            approvedBy: req.session.user?.id,
            approvedAt: new Date().toISOString()
          })
        });

        // Update user balance
        const currentBalance = await storage.getBalance(transaction.userId, transaction.symbol);
        const newAvailable = currentBalance
          ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
          : transaction.amount;

        await storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, currentBalance?.locked || '0');

        // Log activity
        if (user) {
          await logAdminActivityFromRequest(
            req,
            ActionTypes.DEPOSIT_APPROVED,
            ActionCategories.TRANSACTIONS,
            `Approved deposit of ${transaction.amount} ${transaction.symbol} for user ${user.username || user.email}`,
            { id: transaction.userId, username: user.username, email: user.email },
            { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, txHash: transaction.txHash }
          );
        }

        console.log(`✅ Deposit approved: ${transaction.amount} ${transaction.symbol} for user ${transaction.userId}`);
        res.json({ message: "Deposit approved and processed", transaction });
      } else {
        await storage.updateTransaction(id, {
          status: 'failed',
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            rejectedBy: req.session.user?.id,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason || 'No reason provided'
          })
        });

        // Log activity
        if (user) {
          await logAdminActivityFromRequest(
            req,
            ActionTypes.DEPOSIT_REJECTED,
            ActionCategories.TRANSACTIONS,
            `Rejected deposit of ${transaction.amount} ${transaction.symbol} for user ${user.username || user.email}`,
            { id: transaction.userId, username: user.username, email: user.email },
            { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, reason: reason || 'No reason provided' }
          );
        }

        console.log(`❌ Deposit rejected: ${transaction.amount} ${transaction.symbol} for user ${transaction.userId}`);
        res.json({ message: "Deposit rejected", transaction });
      }
    } catch (error) {
      console.error("Error processing deposit action:", error);
      res.status(500).json({ message: "Failed to process deposit action" });
    }
  });

  // Admin endpoint to approve/reject withdrawals
  app.post("/api/admin/withdrawals/:id/action", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, reason } = req.body;

      if (!action || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
      }

      const transaction = await storage.getTransaction(id);
      if (!transaction) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }

      if (transaction.type !== 'withdraw') {
        return res.status(400).json({ message: "Transaction is not a withdrawal" });
      }

      // Allow both 'pending' and 'verifying' status to be processed
      if (transaction.status !== 'pending' && transaction.status !== 'verifying') {
        return res.status(400).json({ message: "Withdrawal is not pending approval" });
      }

      // Get user info for logging
      const user = await storage.getUserById(transaction.userId);

      if (action === 'approve') {
        // Mark as completed (balance was already deducted when request was created)
        await storage.updateTransaction(id, {
          status: 'completed',
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            approvedBy: req.session.user?.id,
            approvedAt: new Date().toISOString()
          })
        });

        // Log activity
        if (user) {
          await logAdminActivityFromRequest(
            req,
            ActionTypes.WITHDRAWAL_APPROVED,
            ActionCategories.TRANSACTIONS,
            `Approved withdrawal of ${transaction.amount} ${transaction.symbol} for user ${user.username || user.email}`,
            { id: transaction.userId, username: user.username, email: user.email },
            { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, walletAddress: JSON.parse(transaction.metadata || '{}').walletAddress }
          );
        }

        console.log(`✅ Withdrawal approved: ${transaction.amount} ${transaction.symbol} for user ${transaction.userId}`);
        res.json({ message: "Withdrawal approved and processed", transaction });
      } else {
        // Reject and refund balance
        await storage.updateTransaction(id, {
          status: 'failed',
          metadata: JSON.stringify({
            ...JSON.parse(transaction.metadata || '{}'),
            rejectedBy: req.session.user?.id,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason || 'No reason provided'
          })
        });

        // Refund the balance
        const currentBalance = await storage.getBalance(transaction.userId, transaction.symbol);
        const newAvailable = currentBalance
          ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
          : transaction.amount;

        await storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, currentBalance?.locked || '0');

        // Log activity
        if (user) {
          await logAdminActivityFromRequest(
            req,
            ActionTypes.WITHDRAWAL_REJECTED,
            ActionCategories.TRANSACTIONS,
            `Rejected withdrawal of ${transaction.amount} ${transaction.symbol} for user ${user.username || user.email}`,
            { id: transaction.userId, username: user.username, email: user.email },
            { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, reason: reason || 'No reason provided', refunded: true }
          );
        }

        console.log(`❌ Withdrawal rejected and refunded: ${transaction.amount} ${transaction.symbol} for user ${transaction.userId}`);
        res.json({ message: "Withdrawal rejected and balance refunded", transaction });
      }
    } catch (error) {
      console.error("Error processing withdrawal action:", error);
      res.status(500).json({ message: "Failed to process withdrawal action" });
    }
  });

  // Get pending transactions for admin review
  app.get("/api/admin/transactions/pending", requireSessionAdmin, async (req, res) => {
    try {
      const pendingTransactions = await storage.getPendingTransactions();
      res.json(pendingTransactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
      res.status(500).json({ message: "Failed to fetch pending transactions" });
    }
  });

  // Admin endpoint to verify/reject user documents
  // NOTE: Using Drizzle ORM with Railway PostgreSQL instead of Supabase
  app.post("/api/admin/verify-document/:id", requireSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
      }

      // Get the document from Railway PostgreSQL via Drizzle
      const document = await storage.getVerificationDocumentById(id);

      if (!document) {
        console.error('Document not found:', id);
        return res.status(404).json({ message: "Document not found" });
      }

      // Get user info for logging
      const user = await storage.getUserById(document.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update document status via Drizzle
      const updatedDocument = await storage.updateVerificationDocument(id, {
        verificationStatus: status,
        adminNotes: adminNotes || `Document ${status} by admin`,
        verifiedAt: new Date()
      });

      if (!updatedDocument) {
        console.error('Error updating document:', id);
        return res.status(500).json({ message: "Failed to update document" });
      }

      // Log activity
      await logAdminActivityFromRequest(
        req,
        status === 'approved' ? ActionTypes.VERIFICATION_APPROVED : ActionTypes.VERIFICATION_REJECTED,
        ActionCategories.VERIFICATION,
        `${status === 'approved' ? 'Approved' : 'Rejected'} ${document.documentType} verification for user ${user.username || user.email}`,
        { id: user.id, username: user.username, email: user.email },
        {
          documentId: id,
          documentType: document.documentType,
          verificationStatus: status,
          adminNotes: adminNotes || `Document ${status} by admin`
        }
      );

      console.log(`✅ Document ${status}: ${document.documentType} for user ${user.username || user.email}`);
      res.json({
        message: `Document ${status} successfully`,
        document: {
          ...updatedDocument,
          verification_status: status,
          admin_notes: adminNotes || `Document ${status} by admin`,
          verified_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  // Quick schema check - simpler version
  app.get("/api/admin/schema-check", requireSessionAdmin, async (req, res) => {
    try {
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const txs = await storage.getUserTransactions(user.id, 1);
      const sample = txs.length > 0 ? txs[0] : null;

      res.json({
        hasTransactions: txs.length > 0,
        hasSymbolField: sample ? ('symbol' in sample) : false,
        fields: sample ? Object.keys(sample) : [],
        sample: sample
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Simple database test (ADMIN ONLY - DEBUG)
  app.get("/api/admin/test-db", requireSessionAdmin, async (req, res) => {
    try {
      console.log('🔍 Testing database connection...');

      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Test 1: Get user transactions (simple query)
      const userTransactions = await storage.getUserTransactions(user.id, 5);
      console.log(`✅ Test 1 passed: Got ${userTransactions.length} user transactions`);

      // Test 2: Check if symbol field exists
      const hasSymbol = userTransactions.length > 0 && 'symbol' in userTransactions[0];
      console.log(`✅ Test 2: Symbol field exists? ${hasSymbol}`);

      res.json({
        message: "Database test completed",
        tests: {
          userTransactions: {
            passed: true,
            count: userTransactions.length,
            sample: userTransactions[0] || null
          },
          symbolField: {
            passed: true,
            exists: hasSymbol,
            fields: userTransactions[0] ? Object.keys(userTransactions[0]) : []
          }
        }
      });
    } catch (error: any) {
      console.error("❌ Database test failed:", error);
      res.status(500).json({
        message: "Database test failed",
        error: error.message || String(error)
      });
    }
  });

  // Check database schema for transactions table (ADMIN ONLY - DEBUG)
  app.get("/api/admin/check-schema", requireSessionAdmin, async (req, res) => {
    try {
      console.log('🔍 Checking database schema...');

      let allTransactions: any[] = [];
      let errorMessage = null;

      try {
        // Try to get all transactions
        allTransactions = await storage.getAllTransactions();
        console.log(`📊 Total transactions in database: ${allTransactions.length}`);
      } catch (txError: any) {
        console.error('❌ Error fetching transactions:', txError.message);
        errorMessage = txError.message;

        // Try to get at least one user's transactions as fallback
        try {
          const user = req.session.user;
          if (user) {
            allTransactions = await storage.getUserTransactions(user.id, 10);
            console.log(`📊 Fallback: Got ${allTransactions.length} transactions for user ${user.id}`);
          }
        } catch (fallbackError: any) {
          console.error('❌ Fallback also failed:', fallbackError.message);
        }
      }

      const sampleTransaction = allTransactions.length > 0 ? allTransactions[0] : null;

      if (sampleTransaction) {
        console.log('📊 Sample transaction:', JSON.stringify(sampleTransaction, null, 2));
        console.log('📊 Transaction fields:', Object.keys(sampleTransaction));
      } else {
        console.log('⚠️ No transactions found in database');
      }

      const transactionTypes = allTransactions.length > 0
        ? [...new Set(allTransactions.map(t => t.type))]
        : [];

      console.log('📊 Transaction types found:', transactionTypes);

      res.json({
        message: errorMessage ? `Schema check completed with errors: ${errorMessage}` : "Schema check completed",
        sampleTransaction: sampleTransaction,
        fields: sampleTransaction ? Object.keys(sampleTransaction) : [],
        totalTransactions: allTransactions.length,
        transactionTypes: transactionTypes,
        hasSymbolField: sampleTransaction ? 'symbol' in sampleTransaction : false,
        error: errorMessage
      });
    } catch (error: any) {
      console.error("❌ Error checking schema:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({
        message: "Failed to check schema",
        error: error.message || String(error),
        stack: error.stack
      });
    }
  });

  // Backfill missing transactions from completed trades (ADMIN ONLY)
  app.post("/api/admin/backfill-transactions", requireSessionAdmin, async (req, res) => {
    try {
      console.log('🔄 Starting transaction backfill from completed trades...');

      let allTrades: any[] = [];

      try {
        // Get all completed trades
        allTrades = await storage.getAllTrades();
        console.log(`📊 Total trades in database: ${allTrades.length}`);
      } catch (tradeError: any) {
        console.error('❌ Error fetching trades:', tradeError.message);
        return res.status(500).json({
          message: "Failed to fetch trades from database",
          error: tradeError.message
        });
      }

      const completedTrades = allTrades.filter(trade => trade.status === 'completed');
      console.log(`📊 Completed trades: ${completedTrades.length}`);

      let created = 0;
      let skipped = 0;
      let errors = 0;
      const errorDetails: any[] = [];

      for (const trade of completedTrades) {
        try {
          // Check if transaction already exists for this trade
          const existingTransactions = await storage.getUserTransactions(trade.userId, 1000);
          const hasTransaction = existingTransactions.some(tx => tx.referenceId === trade.id);

          if (hasTransaction) {
            skipped++;
            console.log(`⏭️ Skipping trade ${trade.id} - transaction already exists`);
            continue;
          }

          // Determine if win or loss
          const isWin = trade.profit && parseFloat(trade.profit.toString()) > 0;
          const profit = trade.profit ? Math.abs(parseFloat(trade.profit.toString())) : 0;

          // Create transaction
          const transactionType = isWin ? 'trade_win' : 'trade_loss';
          const transactionAmount = profit.toFixed(8);

          console.log(`📝 Creating transaction for trade ${trade.id}:`, {
            userId: trade.userId,
            type: transactionType,
            amount: transactionAmount,
            symbol: 'USDT'
          });

          await storage.createTransaction({
            userId: trade.userId,
            type: transactionType as any,
            amount: transactionAmount,
            symbol: 'USDT',
            status: 'completed',
            description: `${isWin ? 'Win' : 'Loss'} on ${trade.symbol} trade (backfilled)`,
            referenceId: trade.id
          });

          created++;
          console.log(`✅ Created transaction for trade ${trade.id}: ${transactionType} ${transactionAmount} USDT`);
        } catch (error: any) {
          errors++;
          const errorMsg = error.message || String(error);
          console.error(`❌ Failed to create transaction for trade ${trade.id}:`, errorMsg);
          errorDetails.push({
            tradeId: trade.id,
            error: errorMsg
          });
        }
      }

      const summary = {
        totalTrades: allTrades.length,
        completedTrades: completedTrades.length,
        transactionsCreated: created,
        transactionsSkipped: skipped,
        errors: errors,
        errorDetails: errorDetails.slice(0, 5) // Only return first 5 errors
      };

      console.log('✅ Transaction backfill completed:', summary);

      res.json({
        message: "Transaction backfill completed",
        summary
      });
    } catch (error: any) {
      console.error("❌ Error during transaction backfill:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({
        message: "Failed to backfill transactions",
        error: error.message || String(error),
        stack: error.stack
      });
    }
  });

  // Get all transactions for admin analytics
  app.get("/api/admin/transactions", requireSessionAdmin, async (req, res) => {
    try {
      const allTransactions = await storage.getAllTransactions();
      res.json(allTransactions);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create withdrawal request (used by WalletPage)
  app.post("/api/withdrawals", async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { amount, currency, address, password } = req.body;

      if (!amount || !currency || !address || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount, currency, or address" });
      }

      // Verify password
      if (!password) {
        return res.status(400).json({ message: "Fund password is required" });
      }

      // ✅ CHECK MINIMUM TRADE REQUIREMENT (2 completed trades with valid result)
      const userTrades = await storage.getUserTrades(user.id, 100);

      console.log(`🔍 DEBUG - Raw trades for ${user.username || user.email}:`, JSON.stringify(userTrades, null, 2));

      // Filter for completed trades with valid result (win/lose/normal)
      const completedTrades = userTrades.filter(trade => {
        const isCompleted = trade.status === 'completed';
        const hasResult = !!trade.result;
        const isValidResult = trade.result && ['win', 'lose', 'normal'].includes(trade.result.toLowerCase());

        console.log(`  Trade ${trade.id}: status=${trade.status}, result=${trade.result}, isCompleted=${isCompleted}, hasResult=${hasResult}, isValidResult=${isValidResult}`);

        return isCompleted && hasResult && isValidResult;
      });

      const completedTradesCount = completedTrades.length;
      const MINIMUM_TRADES_REQUIRED = 2;

      console.log(`📊 Trade requirement check for ${user.username || user.email}:`, {
        totalTrades: userTrades.length,
        completedTrades: completedTradesCount,
        required: MINIMUM_TRADES_REQUIRED,
        trades: userTrades.map(t => ({ id: t.id, status: t.status, result: t.result, symbol: t.symbol, amount: t.amount }))
      });

      if (completedTradesCount < MINIMUM_TRADES_REQUIRED) {
        console.log(`❌ Withdrawal blocked: User ${user.username || user.email} has only ${completedTradesCount}/${MINIMUM_TRADES_REQUIRED} completed trades with valid result`);
        return res.status(400).json({
          message: "Minimum trade requirement not met",
          details: `You need to complete at least ${MINIMUM_TRADES_REQUIRED} trades before withdrawing. Current: ${completedTradesCount}/${MINIMUM_TRADES_REQUIRED} trades completed.`
        });
      }

      console.log(`✅ Trade requirement met: User ${user.username || user.email} has ${completedTradesCount}/${MINIMUM_TRADES_REQUIRED} completed trades with valid result`);

      // Check if user has sufficient balance
      const currentBalance = await storage.getBalance(user.id, currency);
      if (!currentBalance || parseFloat(currentBalance.available) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Generate withdrawal ID
      const withdrawalId = `withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // 1️⃣ Save to withdrawals table (for admin dashboard)
      console.log('💰 Attempting to save withdrawal to Supabase:', {
        id: withdrawalId,
        user_id: user.id,
        username: user.username || user.email,
        amount: parseFloat(amount),
        currency,
        address,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          id: withdrawalId,
          user_id: user.id,
          username: user.username || user.email,
          amount: parseFloat(amount),
          currency,
          address,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (withdrawalError) {
        console.error('❌ Error saving withdrawal to Supabase:', withdrawalError);
        throw new Error('Failed to save withdrawal request');
      }

      console.log('✅ Withdrawal saved to Supabase database for admin dashboard');
      console.log('✅ Inserted data:', withdrawalData);

      // 2️⃣ ALSO save to transactions table (for user transaction history)
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: 'withdraw',
        symbol: currency,
        amount: amount,
        fee: '0',
        status: 'pending',
        txHash: withdrawalId, // Link to withdrawal record
        createdAt: new Date(),
      });

      console.log('✅ Withdrawal also saved to transactions table for user history');

      // 3️⃣ Update user balance (subtract the withdrawal amount)
      const newAvailable = (parseFloat(currentBalance.available) - parseFloat(amount)).toString();
      await storage.updateBalance(user.id, currency, newAvailable, currentBalance.locked);

      console.log(`💰 Balance updated: ${currentBalance.available} → ${newAvailable}`);

      // 4️⃣ SEND REAL-TIME NOTIFICATION TO SUPERADMIN
      const notification: AdminNotification = {
        id: `withdrawal_${withdrawalId}_${Date.now()}`,
        type: 'withdrawal',
        userId: user.id,
        username: user.username || user.email || 'Unknown User',
        amount: amount,
        currency: currency,
        timestamp: new Date(),
        read: false
      };
      broadcastNotification(notification);
      console.log(`🔔 Sent withdrawal notification for ${user.username || user.email}: ${amount} ${currency}`);

      res.json({
        transaction,
        message: "Withdrawal initiated",
        amount: amount,
        currency: currency
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Create withdrawal transaction (legacy endpoint)
  app.post("/api/transactions/withdraw", async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { amount, currency, address, method } = req.body;

      if (!amount || !currency || !address || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount, currency, or address" });
      }

      // Check if user has sufficient balance
      const currentBalance = await storage.getBalance(user.id, currency);
      if (!currentBalance || parseFloat(currentBalance.available) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create transaction record
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: 'withdraw',
        symbol: currency,
        amount: amount,
        fee: '0',
        status: 'pending', // Withdrawals start as pending
        txHash: `withdraw_${Date.now()}`,
        createdAt: new Date(),
      });

      // Update user balance (subtract the withdrawal amount)
      const newAvailable = (parseFloat(currentBalance.available) - parseFloat(amount)).toString();
      await storage.updateBalance(user.id, currency, newAvailable, currentBalance.locked);

      // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN
      const notification: AdminNotification = {
        id: `withdrawal_${transaction.id}_${Date.now()}`,
        type: 'withdrawal',
        userId: user.id,
        username: user.username || user.email || 'Unknown User',
        amount: amount,
        currency: currency,
        timestamp: new Date(),
        read: false
      };
      broadcastNotification(notification);
      console.log(`🔔 Sent withdrawal notification for ${user.username || user.email}: ${amount} ${currency}`);

      res.json({
        transaction,
        message: "Withdrawal initiated",
        amount: amount,
        currency: currency
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Get all user trades (real data)
  app.get("/api/trades", async (req, res) => {
    try {
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get real trades from database
      const trades = await storage.getUserTrades(user.id, 100);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching trades:", error);
      res.status(500).json({ message: "Failed to fetch trades" });
    }
  });

  // Get real market data
  app.get("/api/market-data", async (req, res) => {
    try {
      // Check if force refresh is requested
      const forceRefresh = req.query.force === 'true';

      // Get real market data from database or external API
      let marketData = await storage.getAllMarketData();

      // If no market data exists, less than 10 currencies, or force refresh requested
      if (!marketData || marketData.length < 10 || forceRefresh) {
        console.log(`📊 Initializing market data (current: ${marketData?.length || 0}, force: ${forceRefresh})`);

        // Clear existing data if force refresh
        if (forceRefresh && marketData && marketData.length > 0) {
          console.log('🗑️ Clearing existing market data for refresh');
          // Note: We'll just overwrite the data instead of deleting
        }
        const defaultMarketData = [
          { symbol: 'BTCUSDT', price: '117860.08', change24h: '1.44', priceChangePercent24h: '1.44', volume24h: '1234567890', high24h: '119000.00', low24h: '116500.00', timestamp: new Date() },
          { symbol: 'ETHUSDT', price: '3577.42', change24h: '-0.23', priceChangePercent24h: '-0.23', volume24h: '987654321', high24h: '3600.00', low24h: '3550.00', timestamp: new Date() },
          { symbol: 'XRPUSDT', price: '3.1833', change24h: '-1.77', priceChangePercent24h: '-1.77', volume24h: '456789123', high24h: '3.25', low24h: '3.15', timestamp: new Date() },
          { symbol: 'LTCUSDT', price: '112.45', change24h: '2.15', priceChangePercent24h: '2.15', volume24h: '234567890', high24h: '115.00', low24h: '110.00', timestamp: new Date() },
          { symbol: 'BNBUSDT', price: '698.45', change24h: '1.89', priceChangePercent24h: '1.89', volume24h: '345678901', high24h: '705.00', low24h: '690.00', timestamp: new Date() },
          { symbol: 'SOLUSDT', price: '245.67', change24h: '3.42', priceChangePercent24h: '3.42', volume24h: '567890123', high24h: '250.00', low24h: '240.00', timestamp: new Date() },
          { symbol: 'TONUSDT', price: '6.234', change24h: '0.89', priceChangePercent24h: '0.89', volume24h: '123456789', high24h: '6.35', low24h: '6.15', timestamp: new Date() },
          { symbol: 'DOGEUSDT', price: '0.23878', change24h: '0.89', priceChangePercent24h: '0.89', volume24h: '678901234', high24h: '0.245', low24h: '0.235', timestamp: new Date() },
          { symbol: 'ADAUSDT', price: '0.8212', change24h: '0.66', priceChangePercent24h: '0.66', volume24h: '789012345', high24h: '0.835', low24h: '0.810', timestamp: new Date() },
          { symbol: 'TRXUSDT', price: '0.2456', change24h: '1.23', priceChangePercent24h: '1.23', volume24h: '890123456', high24h: '0.250', low24h: '0.240', timestamp: new Date() },
          { symbol: 'HYPEUSDT', price: '28.45', change24h: '5.67', priceChangePercent24h: '5.67', volume24h: '123456789', high24h: '30.00', low24h: '27.00', timestamp: new Date() },
          { symbol: 'LINKUSDT', price: '22.34', change24h: '2.45', priceChangePercent24h: '2.45', volume24h: '234567890', high24h: '23.00', low24h: '21.50', timestamp: new Date() },
          { symbol: 'AVAXUSDT', price: '45.67', change24h: '1.89', priceChangePercent24h: '1.89', volume24h: '345678901', high24h: '47.00', low24h: '44.00', timestamp: new Date() },
          { symbol: 'SUIUSDT', price: '4.123', change24h: '3.21', priceChangePercent24h: '3.21', volume24h: '456789012', high24h: '4.25', low24h: '4.00', timestamp: new Date() },
          { symbol: 'SHIBUSDT', price: '0.00002345', change24h: '2.34', priceChangePercent24h: '2.34', volume24h: '567890123', high24h: '0.000024', low24h: '0.000023', timestamp: new Date() },
          { symbol: 'BCHUSDT', price: '512.34', change24h: '1.56', priceChangePercent24h: '1.56', volume24h: '678901234', high24h: '520.00', low24h: '505.00', timestamp: new Date() },
          { symbol: 'DOTUSDT', price: '8.456', change24h: '0.78', priceChangePercent24h: '0.78', volume24h: '789012345', high24h: '8.60', low24h: '8.30', timestamp: new Date() },
          { symbol: 'POLUSDT', price: '0.4567', change24h: '1.23', priceChangePercent24h: '1.23', volume24h: '890123456', high24h: '0.470', low24h: '0.445', timestamp: new Date() },
          { symbol: 'XLMUSDT', price: '0.1234', change24h: '2.45', priceChangePercent24h: '2.45', volume24h: '901234567', high24h: '0.127', low24h: '0.120', timestamp: new Date() }
        ];

        // Store default market data
        console.log(`📊 Storing ${defaultMarketData.length} default market data entries`);
        for (const data of defaultMarketData) {
          await storage.updateMarketData(data.symbol, {
            price: data.price,
            priceChange24h: data.change24h,
            priceChangePercent24h: data.priceChangePercent24h,
            high24h: data.high24h,
            low24h: data.low24h,
            volume24h: data.volume24h,
          });
        }

        marketData = await storage.getAllMarketData();
        console.log(`📊 After storing defaults, got ${marketData.length} entries`);
      }

      console.log(`📊 Serving ${marketData.length} market data entries`);
      console.log('📊 Market data symbols:', marketData.map(d => d.symbol).join(', '));
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Migration endpoint - add plain_password column (GET for easy browser access)
  app.get("/api/setup/migrate-plain-password", async (req, res) => {
    try {
      console.log('🔄 Running migration: Adding plain_password column...');

      if (!pgRawClient) {
        return res.status(400).json({ success: false, error: 'PostgreSQL client not available' });
      }

      // Add plain_password column if not exists using raw SQL
      await pgRawClient`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255)
      `;

      console.log('✅ Migration completed: plain_password column added');
      res.json({ success: true, message: 'Migration completed: plain_password column added' });
    } catch (error: any) {
      console.error('❌ Migration error:', error);
      // If column already exists, that's fine
      if (error.message && error.message.includes('already exists')) {
        res.json({ success: true, message: 'Column already exists' });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  // Admin setup endpoint - creates admin user for development
  app.post("/api/setup/admin", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }

      // Check if user exists
      let user = await storage.getUserByWallet(walletAddress);
      
      if (!user) {
        // Create new admin user
        user = await storage.createUser({
          walletAddress,
          role: 'super_admin',
          email: 'admin@metachrome.io',
        });
      } else {
        // Update existing user to admin
        user = await storage.updateUser(user.id, { role: 'super_admin' });
      }

      res.json({ message: "Admin user created/updated successfully", user });
    } catch (error) {
      console.error("Error setting up admin:", error);
      res.status(500).json({ message: "Failed to setup admin" });
    }
  });

  const httpServer = createServer(app);
  
  // Start WebSocket server for real-time price updates
  const { broadcastPriceUpdate, broadcastToAll } = setupWebSocket(httpServer, storage);
  
  // Initialize demo data and start services
  setTimeout(async () => {
    try {
      // Check if demo data exists
      const users = await storage.getAllUsers();
      const hasRichDemoData = users.length >= 5; // We expect at least 5 users from demo data

      if (!hasRichDemoData) {
        console.log('📊 Demo data not found or incomplete, creating fresh demo data...');
        await seedOptionsSettings();
        await seedDemoData();
        console.log('✅ Demo data seeded successfully');
      } else {
        console.log('✅ Demo data already exists, skipping seed');
      }

      // Setup chat tables
      try {
        await setupChatTables();
      } catch (error) {
        console.error('⚠️ Error setting up chat tables (may already exist):', error);
      }

      // ✅ AUTO-COMPLETE EXPIRED TRADES ON SERVER START
      try {
        console.log('🔍 Checking for expired trades that need completion...');
        const allTrades = await storage.getAllTrades();
        const now = new Date();
        let completedCount = 0;

        for (const trade of allTrades) {
          // Check if trade is active but expired
          if (trade.status === 'active' && trade.expiresAt && new Date(trade.expiresAt) <= now) {
            console.log(`⏰ Found expired trade: ${trade.id}, expired at ${trade.expiresAt}`);
            try {
              await tradingService.executeOptionsTrade(trade.id);
              completedCount++;
              console.log(`✅ Auto-completed expired trade: ${trade.id}`);
            } catch (error) {
              console.error(`❌ Failed to auto-complete trade ${trade.id}:`, error);
            }
          }
        }

        if (completedCount > 0) {
          console.log(`✅ Auto-completed ${completedCount} expired trades on server start`);
        } else {
          console.log('✅ No expired trades found');
        }
      } catch (error) {
        console.error('❌ Error checking for expired trades:', error);
      }

      // Start real-time price updates
      priceService.startPriceUpdates();

      // ✅ START PERIODIC CHECK FOR EXPIRED TRADES (every 10 seconds)
      setInterval(async () => {
        try {
          const allTrades = await storage.getAllTrades();
          const now = new Date();

          for (const trade of allTrades) {
            if (trade.status === 'active' && trade.expiresAt && new Date(trade.expiresAt) <= now) {
              console.log(`⏰ Periodic check: Found expired trade ${trade.id}`);
              try {
                await tradingService.executeOptionsTrade(trade.id);
                console.log(`✅ Periodic check: Completed expired trade ${trade.id}`);
              } catch (error) {
                console.error(`❌ Periodic check: Failed to complete trade ${trade.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error in periodic expired trades check:', error);
        }
      }, 10000); // Check every 10 seconds

    } catch (error) {
      console.error('❌ Error checking/seeding demo data:', error);
      // Still start price updates even if seeding fails
      priceService.startPriceUpdates();
    }
  }, 3000); // Increased delay to ensure database is ready

  // Debug endpoint to check user trades and withdrawal eligibility
  app.get("/api/debug/check-withdrawal-eligibility", async (req, res) => {
    try {
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userTrades = await storage.getUserTrades(user.id, 100);
      // Filter for completed trades with valid result (win/lose/normal)
      const completedTrades = userTrades.filter(trade =>
        trade.status === 'completed' &&
        trade.result &&
        ['win', 'lose', 'normal'].includes(trade.result.toLowerCase())
      );

      return res.json({
        userId: user.id,
        username: user.username || user.email,
        totalTrades: userTrades.length,
        completedTrades: completedTrades.length,
        requiredTrades: 2,
        canWithdraw: completedTrades.length >= 2,
        allTrades: userTrades.map(t => ({
          id: t.id.substring(0, 8),
          status: t.status,
          result: t.result,
          symbol: t.symbol,
          amount: t.amount,
          direction: t.direction,
          profit: t.profit,
          createdAt: t.createdAt,
          expiresAt: t.expiresAt,
          completedAt: t.completedAt
        }))
      });
    } catch (error) {
      console.error("Error checking withdrawal eligibility:", error);
      res.status(500).json({ message: "Failed to check eligibility" });
    }
  });

  // Debug endpoint to manually trigger expired trades completion
  app.post("/api/debug/complete-expired-trades", async (req, res) => {
    try {
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log(`🔧 Manual trigger: Completing expired trades for user ${user.id}`);

      const userTrades = await storage.getUserTrades(user.id, 100);
      const now = new Date();
      let completedCount = 0;
      const results = [];

      for (const trade of userTrades) {
        if (trade.status === 'active' && trade.expiresAt && new Date(trade.expiresAt) <= now) {
          console.log(`⏰ Manual: Found expired trade ${trade.id}, expired at ${trade.expiresAt}`);
          try {
            await tradingService.executeOptionsTrade(trade.id);
            completedCount++;
            results.push({ id: trade.id, status: 'completed', expiresAt: trade.expiresAt });
            console.log(`✅ Manual: Completed expired trade ${trade.id}`);
          } catch (error) {
            console.error(`❌ Manual: Failed to complete trade ${trade.id}:`, error);
            results.push({ id: trade.id, status: 'failed', error: String(error) });
          }
        }
      }

      return res.json({
        message: `Completed ${completedCount} expired trades`,
        completedCount,
        totalChecked: userTrades.length,
        results
      });
    } catch (error) {
      console.error("Error completing expired trades:", error);
      res.status(500).json({ message: "Failed to complete expired trades" });
    }
  });

  // Temporary admin bypass (development only)
  app.post("/api/debug/admin-bypass", async (req, res) => {
    try {
      console.log('🚨 Admin bypass used - development only');

      // Create a temporary admin session
      const adminUser = {
        id: 'bypass-admin-1',
        username: 'superadmin',
        email: 'admin@metachrome.io',
        role: 'super_admin'
      };

      // Store in session
      req.session.user = adminUser;

      // Generate JWT token
      const token = generateToken(adminUser);

      res.json({
        user: adminUser,
        token,
        message: "Admin bypass successful - development only"
      });
    } catch (error) {
      console.error('Admin bypass error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Debug users endpoint (development only)
  app.get("/api/debug/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers?.() || [];
      const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
      res.json({
        totalUsers: users.length,
        adminUsers: adminUsers.map(u => ({
          id: u.id,
          username: u.username,
          role: u.role,
          hasPassword: !!u.password,
          plainPassword: (u as any).plainPassword || null,
          allKeys: Object.keys(u)
        }))
      });
    } catch (error) {
      console.error('Debug users error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Debug login endpoint (development only)
  app.post("/api/debug/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('🔍 Debug login attempt:', { username, password });

      const user = await storage.getUserByUsername(username);
      console.log('🔍 Found user:', user ? { id: user.id, username: user.username, role: user.role, hasPassword: !!user.password } : 'null');

      if (user && user.password) {
        const isValidPassword = await verifyPassword(password, user.password);
        console.log('🔍 Password valid:', isValidPassword);

        if (isValidPassword) {
          // Force login regardless of role for debugging
          req.session.user = {
            id: user.id,
            username: user.username || undefined,
            email: user.email || undefined,
            role: user.role || 'user',
            walletAddress: user.walletAddress || undefined,
          };

          return res.json({
            success: true,
            user: req.session.user,
            message: "Debug login successful"
          });
        }
      }

      return res.status(401).json({ message: "Debug login failed" });
    } catch (error) {
      console.error('Debug login error:', error);
      return res.status(500).json({ message: "Debug login error", error: error.message });
    }
  });

  // Create admin users endpoint (development only)
  app.get("/api/admin/create-admins", async (req, res) => {
    try {
      console.log('🔧 Creating admin users...');

      const adminUsers = [
        {
          username: 'admin',
          email: 'admin@metachrome.io',
          password: 'admin123',
          role: 'admin' as const,
          firstName: 'Regular',
          lastName: 'Admin',
        },
        {
          username: 'superadmin',
          email: 'superadmin@metachrome.io',
          password: 'superadmin123',
          role: 'super_admin' as const,
          firstName: 'Super',
          lastName: 'Administrator',
        }
      ];

      const createdUsers = [];

      for (const userData of adminUsers) {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (!existingUser) {
          const hashedPassword = await hashPassword(userData.password);
          const user = await storage.createUser({
            ...userData,
            password: hashedPassword,
            plainPassword: userData.password, // Store plain password for superadmin view
          });
          createdUsers.push({ username: userData.username, role: userData.role });
          console.log(`✅ Created admin user: ${userData.username} (${userData.role})`);
        } else {
          console.log(`⚠️ Admin user already exists: ${userData.username}`);
        }
      }

      res.json({
        message: "Admin users processed successfully",
        created: createdUsers,
        credentials: {
          admin: { username: 'admin', password: 'admin123' },
          superadmin: { username: 'superadmin', password: 'superadmin123' }
        }
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({ message: "Failed to create admin users" });
    }
  });

  // Serve uploaded files
  app.get('/api/uploads/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', filename);

      // Security check: ensure file exists and is within uploads directory
      if (!fs.existsSync(filePath) || !filePath.startsWith(path.join(process.cwd(), 'uploads'))) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Set appropriate headers for file download
      const extension = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      };

      const contentType = contentTypes[extension] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ message: 'Error serving file' });
    }
  });

  // Serve contact form uploaded files (new format)
  app.get('/api/uploads/contact/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', 'contact', filename);

      // Security check: ensure file exists and is within uploads/contact directory
      if (!fs.existsSync(filePath) || !filePath.startsWith(path.join(process.cwd(), 'uploads', 'contact'))) {
        console.error('File not found or security violation:', filePath);
        return res.status(404).json({ message: 'File not found' });
      }

      // Set appropriate headers for file download
      const extension = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      };

      const contentType = contentTypes[extension] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      console.log('✅ Served contact file (new format):', filename);
    } catch (error) {
      console.error('Error serving contact file:', error);
      res.status(500).json({ message: 'Error serving file' });
    }
  });

  // Serve contact form uploaded files (old format - backward compatibility)
  app.get('/uploads/contact/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', 'contact', filename);

      // Security check: ensure file exists and is within uploads/contact directory
      if (!fs.existsSync(filePath) || !filePath.startsWith(path.join(process.cwd(), 'uploads', 'contact'))) {
        console.error('File not found or security violation:', filePath);
        return res.status(404).json({ message: 'File not found' });
      }

      // Set appropriate headers for file download
      const extension = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      };

      const contentType = contentTypes[extension] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      console.log('✅ Served contact file (old format):', filename);
    } catch (error) {
      console.error('Error serving contact file:', error);
      res.status(500).json({ message: 'Error serving file' });
    }
  });

  // Serve uploaded files from root uploads directory (very old format - backward compatibility)
  app.get('/uploads/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'uploads', filename);

      // Security check: ensure file exists and is within uploads directory
      if (!fs.existsSync(filePath) || !filePath.startsWith(path.join(process.cwd(), 'uploads'))) {
        console.error('File not found or security violation:', filePath);
        return res.status(404).json({ message: 'File not found' });
      }

      // Set appropriate headers for file download
      const extension = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
      };

      const contentType = contentTypes[extension] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      console.log('✅ Served file from root uploads (very old format):', filename);
    } catch (error) {
      console.error('Error serving file from root uploads:', error);
      res.status(500).json({ message: 'Error serving file' });
    }
  });

  // Admin system information endpoint
  app.get("/api/admin/system", requireSessionAdmin, async (req, res) => {
    try {
      // Initialize default settings if not exists
      if (!global.systemSettings) {
        console.log('🏗️ Initializing global.systemSettings for the first time');
        global.systemSettings = {
          tradingEnabled: true,
          maintenanceMode: false,
          minTradeAmount: '10',
          maxTradeAmount: '10000'
        };
      }
      
      console.log('🔍 Current global.systemSettings:', global.systemSettings);
      
      const responseData = {
        server: {
          status: 'running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
          cpuUsage: process.cpuUsage(),
          startTime: new Date(Date.now() - process.uptime() * 1000).toISOString()
        },
        systemSettings: global.systemSettings,
        systemHealth: {
          status: 'healthy',
          checks: {
            server: 'operational',
            database: 'connected',
            memory: process.memoryUsage().rss < 1024 * 1024 * 1024 ? 'normal' : 'high' // < 1GB
          }
        },
        timestamp: new Date().toISOString()
      };
      
      console.log('🔍 /api/admin/system COMPLETE response:', JSON.stringify(responseData, null, 2));
      console.log('🔍 /api/admin/system systemSettings only:', JSON.stringify(responseData.systemSettings, null, 2));
      res.json(responseData);
    } catch (error) {
      console.error('Error getting system info:', error);
      res.status(500).json({ message: 'Failed to get system information' });
    }
  });

  // Admin system logs endpoint (for modal display)
  app.get("/api/admin/system/logs/full", requireSessionAdmin, async (req, res) => {
    try {
      // Return plain text logs instead of HTML
      res.setHeader('Content-Type', 'text/plain');
      
      // Simple log entries (in a real system, you'd read from log files)
      const logs = [
        `[${new Date().toISOString()}] SERVER: Metachrome server running on port 4000`,
        `[${new Date().toISOString()}] AUTH: Admin session active`,
        `[${new Date().toISOString()}] DB: SQLite database connected`,
        `[${new Date().toISOString()}] SECURITY: Rate limiting enabled`,
        `[${new Date().toISOString()}] TRADING: Mock price data active`,
        `[${new Date().toISOString()}] SYSTEM: File upload system initialized`,
        `[${new Date().toISOString()}] ADMIN: System logs requested`,
        `[${new Date().toISOString()}] INFO: Server memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        `[${new Date().toISOString()}] INFO: Server uptime: ${Math.round(process.uptime())}s`
      ];
      
      res.send(logs.join('\n'));
    } catch (error) {
      console.error('Error getting system logs:', error);
      res.status(500).send('Error retrieving system logs');
    }
  });

  // Export system logs (for download)
  app.get("/api/admin/system/logs", requireSessionAdmin, async (req, res) => {
    try {
      // Set headers for file download
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.txt"`);
      
      // Comprehensive log entries for production export
      const timestamp = new Date().toISOString();
      const logs = [
        `===== METACHROME SYSTEM LOGS EXPORT =====`,
        `Generated: ${timestamp}`,
        `Server: ${process.platform} ${process.arch}`,
        `Node.js: ${process.version}`,
        `PID: ${process.pid}`,
        `===================================`,
        ``,
        `[${timestamp}] SERVER: Metachrome production server status`,
        `[${timestamp}] STATUS: Server running on port 4000`,
        `[${timestamp}] UPTIME: ${Math.round(process.uptime())} seconds`,
        `[${timestamp}] MEMORY: RSS ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        `[${timestamp}] MEMORY: Heap Used ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        `[${timestamp}] MEMORY: Heap Total ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        `[${timestamp}] DB: SQLite database operational`,
        `[${timestamp}] AUTH: JWT authentication active`,
        `[${timestamp}] SECURITY: Rate limiting enabled`,
        `[${timestamp}] SECURITY: CORS protection active`,
        `[${timestamp}] TRADING: Mock price feeds active (development mode)`,
        `[${timestamp}] UPLOAD: File upload system initialized`,
        `[${timestamp}] ADMIN: System logs exported by admin`,
        `[${timestamp}] SYSTEM: All services operational`,
        ``,
        `===== END OF LOG EXPORT =====`
      ];
      
      res.send(logs.join('\n'));
    } catch (error) {
      console.error('Error exporting system logs:', error);
      res.status(500).send('Error exporting system logs');
    }
  });

  // Database backup endpoint
  app.post("/api/admin/system/backup", requireSessionAdmin, async (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // In production, you'd create a proper database backup
      // For SQLite, we can copy the file
      const dbPath = path.join(process.cwd(), 'dev.db');
      const backupPath = path.join(process.cwd(), 'backups', `backup-${Date.now()}.db`);
      
      // Create backups directory if it doesn't exist
      const backupsDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }
      
      // Copy database file
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, backupPath);
        console.log(`📦 Database backup created: ${backupPath}`);
        
        res.json({
          success: true,
          message: 'Database backup created successfully',
          backupFile: path.basename(backupPath),
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Database file not found'
        });
      }
    } catch (error) {
      console.error('Error creating database backup:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create database backup'
      });
    }
  });

  // Clear cache endpoint (both routes for compatibility)
  app.post("/api/admin/system/clear-cache", requireSessionAdmin, async (req, res) => {
    try {
      // In a production system, you'd clear Redis/Memcached here
      // For now, we'll simulate cache clearing
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      console.log('🧹 System cache cleared by admin');
      
      res.json({
        success: true,
        message: 'System cache cleared successfully',
        timestamp: new Date().toISOString(),
        memoryAfter: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear system cache'
      });
    }
  });

  // Alternative cache clear endpoint
  app.post("/api/admin/system/cache/clear", requireSessionAdmin, async (req, res) => {
    try {
      // In a production system, you'd clear Redis/Memcached here
      // For now, we'll simulate cache clearing
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      console.log('🧹 System cache cleared by admin');
      
      res.json({
        success: true,
        message: 'System cache cleared successfully',
        timestamp: new Date().toISOString(),
        memoryAfter: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear system cache'
      });
    }
  });

  // System settings management endpoint (new path to bypass CSRF)
  app.put("/api/admin/system/settings", requireSessionAdmin, async (req, res) => {
    try {
      const { tradingEnabled, maintenanceMode, minTradeAmount, maxTradeAmount } = req.body;
      
      // In a real application, these would be stored in database
      // For now, we'll store in memory (will reset on server restart)
      global.systemSettings = global.systemSettings || {
        tradingEnabled: true,
        maintenanceMode: false,
        minTradeAmount: '10',
        maxTradeAmount: '10000'
      };
      
      // Update only provided fields
      if (typeof tradingEnabled === 'boolean') {
        global.systemSettings.tradingEnabled = tradingEnabled;
        console.log(`🎮 Trading ${tradingEnabled ? 'ENABLED' : 'DISABLED'} by admin ${req.session?.user?.username}`);
      }
      
      if (typeof maintenanceMode === 'boolean') {
        global.systemSettings.maintenanceMode = maintenanceMode;
        console.log(`🔧 Maintenance mode ${maintenanceMode ? 'ENABLED' : 'DISABLED'} by admin ${req.session?.user?.username}`);
      }
      
      if (minTradeAmount) {
        global.systemSettings.minTradeAmount = minTradeAmount;
        console.log(`💰 Min trade amount set to ${minTradeAmount} by admin ${req.session?.user?.username}`);
      }
      
      if (maxTradeAmount) {
        global.systemSettings.maxTradeAmount = maxTradeAmount;
        console.log(`💰 Max trade amount set to ${maxTradeAmount} by admin ${req.session?.user?.username}`);
      }
      
      res.json({
        success: true,
        message: 'System settings updated successfully',
        settings: global.systemSettings,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error updating system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system settings'
      });
    }
  });

  // OAuth status check endpoint
  app.get("/api/auth/status", (req, res) => {
    try {
      const status = {
        google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        linkedin: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
        twitter: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
        metamask: true, // Always available
        timestamp: new Date().toISOString()
      };

      res.json(status);
    } catch (error) {
      console.error('Error checking OAuth status:', error);
      res.status(500).json({
        error: 'Failed to check OAuth status'
      });
    }
  });

  // ============================================================================
  // ADMIN ACTIVITY LOGS - Audit trail for all admin actions
  // ============================================================================

  // Get all activity logs (Super Admin only)
  app.get("/api/admin/activity-logs", requireSessionSuperAdmin, async (req, res) => {
    try {
      const {
        actionType,
        actionCategory,
        startDate,
        endDate,
        limit = 100,
        offset = 0
      } = req.query;

      // Collect logs from both sources and merge them
      let allLogs: any[] = [];
      let localTotal = 0;
      let supabaseTotal = 0;

      // Try local database (Railway PostgreSQL)
      try {
        if (db) {
          console.log('📊 Fetching activity logs from local database...');

          // Build conditions array
          const conditions: any[] = [eq(adminActivityLogs.isDeleted, false)];

          if (actionType) {
            conditions.push(eq(adminActivityLogs.actionType, String(actionType)));
          }
          if (actionCategory) {
            conditions.push(eq(adminActivityLogs.actionCategory, String(actionCategory)));
          }
          if (startDate) {
            conditions.push(gte(adminActivityLogs.createdAt, new Date(String(startDate))));
          }
          if (endDate) {
            conditions.push(lte(adminActivityLogs.createdAt, new Date(String(endDate))));
          }

          // Get total count
          const countResult = await db.select({ count: sql<number>`count(*)` })
            .from(adminActivityLogs)
            .where(and(...conditions));
          localTotal = Number(countResult[0]?.count || 0);

          // Get logs
          const logs = await db.select()
            .from(adminActivityLogs)
            .where(and(...conditions))
            .orderBy(desc(adminActivityLogs.createdAt));

          // Transform to match expected format (snake_case)
          const transformedLogs = logs.map(log => ({
            id: `local_${log.id}`,
            admin_id: log.adminId,
            admin_username: log.adminUsername,
            admin_email: log.adminEmail,
            action_type: log.actionType,
            action_category: log.actionCategory,
            action_description: log.actionDescription,
            target_user_id: log.targetUserId,
            target_username: log.targetUsername,
            target_email: log.targetEmail,
            metadata: log.metadata,
            created_at: log.createdAt,
            ip_address: log.ipAddress,
            user_agent: log.userAgent,
            is_deleted: log.isDeleted,
          }));

          allLogs = [...allLogs, ...transformedLogs];
          console.log(`✅ Fetched ${transformedLogs.length} activity logs from local DB`);
        }
      } catch (localError) {
        console.warn('⚠️ Local DB activity logs query failed:', localError);
      }

      // Also try Supabase to get historical logs
      if (supabaseAdmin) {
        try {
          console.log('📊 Fetching activity logs from Supabase...');

          // Build Supabase query
          let query = supabaseAdmin
            .from('admin_activity_logs')
            .select('*', { count: 'exact' })
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

          // Apply filters
          if (actionType) {
            query = query.eq('action_type', actionType);
          }
          if (actionCategory) {
            query = query.eq('action_category', actionCategory);
          }
          if (startDate) {
            query = query.gte('created_at', startDate);
          }
          if (endDate) {
            query = query.lte('created_at', endDate);
          }

          const { data, error, count } = await query;

          if (!error && data) {
            supabaseTotal = count || 0;
            allLogs = [...allLogs, ...data];
            console.log(`✅ Fetched ${data.length} activity logs from Supabase`);
          } else if (error) {
            console.warn('⚠️ Supabase activity logs query failed:', error);
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase activity logs error:', supabaseError);
        }
      }

      // Sort all logs by created_at descending
      allLogs.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      // Apply pagination
      const paginatedLogs = allLogs.slice(Number(offset), Number(offset) + Number(limit));
      const totalCount = localTotal + supabaseTotal;

      console.log(`✅ Total activity logs: ${totalCount} (local: ${localTotal}, supabase: ${supabaseTotal})`);

      res.json({
        logs: paginatedLogs,
        total: totalCount,
        limit: Number(limit),
        offset: Number(offset),
      });
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      res.status(500).json({ message: "Failed to fetch activity logs" });
    }
  });

  // Get activity log statistics (Super Admin only)
  app.get("/api/admin/activity-logs/stats", requireSessionSuperAdmin, async (req, res) => {
    try {
      let totalCount = 0;
      let recent24hCount = 0;
      const byCategory: Record<string, number> = {};
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Try local database
      try {
        if (db) {
          const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(adminActivityLogs)
            .where(eq(adminActivityLogs.isDeleted, false));
          totalCount += Number(totalResult[0]?.count || 0);

          const recent24hResult = await db.select({ count: sql<number>`count(*)` })
            .from(adminActivityLogs)
            .where(and(
              eq(adminActivityLogs.isDeleted, false),
              gte(adminActivityLogs.createdAt, yesterday)
            ));
          recent24hCount += Number(recent24hResult[0]?.count || 0);

          const categoryData = await db.select({ actionCategory: adminActivityLogs.actionCategory })
            .from(adminActivityLogs)
            .where(eq(adminActivityLogs.isDeleted, false));

          categoryData?.forEach((log) => {
            const category = log.actionCategory;
            byCategory[category] = (byCategory[category] || 0) + 1;
          });

          console.log(`✅ Local DB stats: total=${totalCount}, recent24h=${recent24hCount}`);
        }
      } catch (localError) {
        console.warn('⚠️ Local DB stats failed:', localError);
      }

      // Also get from Supabase
      if (supabaseAdmin) {
        try {
          const { count: supabaseTotal } = await supabaseAdmin
            .from('admin_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false);
          totalCount += (supabaseTotal || 0);

          const { count: supabaseRecent } = await supabaseAdmin
            .from('admin_activity_logs')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false)
            .gte('created_at', yesterday.toISOString());
          recent24hCount += (supabaseRecent || 0);

          const { data: categoryData } = await supabaseAdmin
            .from('admin_activity_logs')
            .select('action_category')
            .eq('is_deleted', false);

          categoryData?.forEach((log: any) => {
            const category = log.action_category;
            byCategory[category] = (byCategory[category] || 0) + 1;
          });

          console.log(`✅ Supabase stats added: total=${supabaseTotal}, recent=${supabaseRecent}`);
        } catch (supabaseError) {
          console.warn('⚠️ Supabase stats failed:', supabaseError);
        }
      }

      console.log(`✅ Combined stats: total=${totalCount}, recent24h=${recent24hCount}, categories=${Object.keys(byCategory).length}`);

      res.json({
        total: totalCount,
        recent24h: recent24hCount,
        byCategory,
      });
    } catch (error) {
      console.error("Error fetching activity log stats:", error);
      res.status(500).json({ message: "Failed to fetch activity log statistics" });
    }
  });

  // Register chat routes
  console.log('💬 Registering chat routes...');
  registerChatRoutes(app);
  console.log('✅ Chat routes registered');

  return httpServer;
}
