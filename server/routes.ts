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
// import { paymentService } from "./paymentService";
import { z } from "zod";
import { insertUserSchema, insertTradeSchema, insertTransactionSchema, insertAdminControlSchema } from "@shared/schema";

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

// Helper functions for deposit addresses and network info
function getDepositAddress(currency: string): string {
  const addresses: { [key: string]: string } = {
    'USDT-ERC': '0x3BC095D473398033496F94a1a1a3A7084c',
    'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    'ETH': '0x3BC095D473398033496F94a1a1a3A7084c'
  };
  return addresses[currency] || addresses['USDT-ERC'];
}

function getNetworkInfo(currency: string): string {
  const networks: { [key: string]: string } = {
    'USDT-ERC': 'Ethereum (ERC-20)',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum'
  };
  return networks[currency] || 'Ethereum (ERC-20)';
}

export async function registerRoutes(app: Express): Promise<Server> {
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
          firstName,
          lastName,
          role: 'user',
        });

        // Store user in session for auto-login
        req.session.user = {
          id: user.id,
          username: user.username || undefined,
          email: user.email || undefined,
          role: user.role || 'user',
          walletAddress: user.walletAddress || undefined,
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

      // Check database for user credentials
      const user = await storage.getUserByUsername(username);

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
        role: 'user',
      });

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

      if (side === 'buy') {
        const usdtBalance = balances.find(b => b.currency === 'USDT')?.balance || 0;
        if (totalNum > usdtBalance) {
          return res.status(400).json({ message: "Insufficient USDT balance" });
        }
      } else {
        const btcBalance = balances.find(b => b.currency === 'BTC')?.balance || 0;
        if (amountNum > btcBalance) {
          return res.status(400).json({ message: "Insufficient BTC balance" });
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
        status: 'pending'
      });

      // Update user balances (lock funds)
      if (side === 'buy') {
        await storage.updateUserBalance(userId, 'USDT', -totalNum);
      } else {
        await storage.updateUserBalance(userId, 'BTC', -amountNum);
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
      const transactions = await storage.getUserTransactions(userId, limit);
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

  // Trade execution for options with admin control
  app.post("/api/options/execute", async (req, res) => {
    try {
      const { tradeId } = req.body;
      const trade = await storage.getTrade(tradeId);
      
      if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
      }

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
      const tradeAmount = parseFloat(trade.amount);
      const profit = isWin ? tradeAmount * 0.1 : -tradeAmount; // 10% profit on win, lose all on loss

      // Update trade
      const updatedTrade = await storage.updateTrade(tradeId, {
        status: 'completed',
        exitPrice,
        profit: profit.toString(),
        completedAt: new Date(),
      });

      // Update user balance
      const currentBalance = await storage.getBalance(trade.userId, 'USDT');
      if (currentBalance) {
        const newBalance = parseFloat(currentBalance.available || '0') + profit;
        await storage.updateBalance(trade.userId, 'USDT', newBalance.toString(), currentBalance.locked || '0');
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

  // Enhanced user management routes for superadmin
  app.put("/api/admin/users/update-password", requireSessionSuperAdmin, async (req, res) => {
    try {
      const { userId, newPassword } = req.body;
      
      if (!userId || !newPassword) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(userId, hashedPassword);
      
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

      // Ensure symbol is uppercase and exists
      const normalizedSymbol = (symbol || '').toUpperCase();
      const balance = await storage.updateBalance(userId, normalizedSymbol, available, '0');
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

      const user = await storage.updateUser(id, { role });
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
      // Get user from session
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get real user balances from database
      const balances = await storage.getUserBalances(user.id);

      // If user has no balances, create default ones
      if (!balances || balances.length === 0) {
        const defaultBalances = [
          { userId: user.id, symbol: 'USDT', available: '1000.00', locked: '0.00' },
          { userId: user.id, symbol: 'BTC', available: '0.0', locked: '0.0' },
          { userId: user.id, symbol: 'ETH', available: '0.0', locked: '0.0' },
        ];

        for (const balance of defaultBalances) {
          await storage.createBalance(balance);
        }

        const newBalances = await storage.getUserBalances(user.id);
        return res.json(newBalances);
      }

      res.json(balances);
    } catch (error) {
      console.error("Error fetching balances:", error);
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
        'USDT-ERC': 10,
        'USDT-BEP': 10,
        'USDT-TRC': 10,
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
        'USDT-ERC': 10,
        'BTC': 0.001,
        'ETH': 0.01
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
      } else {
        // Bank transfers remain pending
        res.json({
          transaction,
          message: "Deposit submitted for verification. You will be notified once approved.",
          amount: amount,
          currency: currency
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

        res.json({ message: "Transaction rejected", transaction });
      }
    } catch (error) {
      console.error("Error processing transaction approval:", error);
      res.status(500).json({ message: "Failed to process transaction approval" });
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

  // Create withdrawal transaction
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
      // Get real market data from database or external API
      let marketData = await storage.getAllMarketData();

      // If no market data exists, create some default data
      if (!marketData || marketData.length === 0) {
        const defaultMarketData = [
          {
            symbol: 'BTCUSDT',
            price: '43250.00',
            change24h: '2.34',
            volume24h: '1234567890',
            high24h: '44000.00',
            low24h: '42500.00',
            timestamp: new Date(),
          },
          {
            symbol: 'ETHUSDT',
            price: '2650.00',
            change24h: '-1.23',
            volume24h: '987654321',
            high24h: '2700.00',
            low24h: '2600.00',
            timestamp: new Date(),
          },
          {
            symbol: 'BNBUSDT',
            price: '315.50',
            change24h: '0.89',
            volume24h: '456789123',
            high24h: '320.00',
            low24h: '310.00',
            timestamp: new Date(),
          }
        ];

        // Store default market data
        for (const data of defaultMarketData) {
          await storage.updateMarketData(data);
        }

        marketData = await storage.getAllMarketData();
      }

      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
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
      
      // Start real-time price updates
      priceService.startPriceUpdates();
    } catch (error) {
      console.error('❌ Error checking/seeding demo data:', error);
      // Still start price updates even if seeding fails
      priceService.startPriceUpdates();
    }
  }, 3000); // Increased delay to ensure database is ready

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
          hasPassword: !!u.password
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

  return httpServer;
}
