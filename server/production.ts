// METACHROME V2 - Production Server with Supabase Integration
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { 
  supabase, 
  supabaseAdmin, 
  getUserById, 
  getUserByUsername, 
  createUser, 
  updateUser, 
  getAllUsers,
  createTrade,
  updateTrade,
  getAllTrades,
  getTradingSettings,
  updateTradingSettings,
  createTransaction,
  getAllTransactions,
  initializeDatabase,
  User,
  Trade,
  Transaction,
  TradingSettings
} from '../lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:", "https:", "http:"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://metachrome-v2.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Authentication middleware
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Admin authentication middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Super admin authentication middleware
const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication routes
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is suspended or banned' });
    }

    // Update last login
    await updateUser(user.id, { last_login: new Date().toISOString() });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance,
        status: user.status,
        trading_mode: user.trading_mode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/admin/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await getUserByUsername(username);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Admin account is suspended' });
    }

    // Update last login
    await updateUser(user.id, { last_login: new Date().toISOString() });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      username,
      email,
      password_hash: hashedPassword,
      balance: 10000, // Starting balance
      role: 'user',
      status: 'active',
      trading_mode: 'normal',
      restrictions: []
    });

    if (!newUser) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        balance: newUser.balance,
        status: newUser.status,
        trading_mode: newUser.trading_mode
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User routes
app.get('/api/user/profile', authenticateToken, (req: Request, res: Response) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    balance: req.user.balance,
    status: req.user.status,
    trading_mode: req.user.trading_mode,
    restrictions: req.user.restrictions || []
  });
});

app.put('/api/user/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const updatedUser = await updateUser(req.user.id, { email });
    if (!updatedUser) {
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      balance: updatedUser.balance,
      status: updatedUser.status,
      trading_mode: updatedUser.trading_mode
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Trading routes
app.get('/api/trading/settings', async (req: Request, res: Response) => {
  try {
    const settings = await getTradingSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get trading settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/trading/trade', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { symbol, amount, direction, duration } = req.body;

    if (!symbol || !amount || !direction || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (req.user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Check if user has trading restrictions
    const restrictions = req.user.restrictions || [];
    if (restrictions.includes('trading_disabled')) {
      return res.status(403).json({ message: 'Trading is disabled for your account' });
    }

    // Get current price (mock for now)
    const entryPrice = Math.random() * 100 + 50; // Mock price between 50-150

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + duration);

    const trade = await createTrade({
      user_id: req.user.id,
      symbol,
      amount,
      direction,
      duration,
      entry_price: entryPrice,
      expires_at: expiresAt.toISOString(),
      result: 'pending'
    });

    if (!trade) {
      return res.status(500).json({ message: 'Failed to create trade' });
    }

    // Deduct amount from user balance
    await updateUser(req.user.id, { 
      balance: req.user.balance - amount 
    });

    res.json(trade);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// SUPERADMIN ROUTES - Complete functionality
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Super admin can update anything, regular admin has restrictions
    if (req.user.role !== 'super_admin') {
      // Regular admins cannot modify other admins or super admins
      const targetUser = await getUserById(id);
      if (targetUser && ['admin', 'super_admin'].includes(targetUser.role)) {
        return res.status(403).json({ message: 'Cannot modify admin accounts' });
      }

      // Regular admins cannot change roles
      delete updates.role;
    }

    const updatedUser = await updateUser(id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, balance, trading_mode } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Only super admin can create admin accounts
    if (role && ['admin', 'super_admin'].includes(role) && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Cannot create admin accounts' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      username,
      email,
      password_hash: hashedPassword,
      balance: balance || 10000,
      role: role || 'user',
      status: 'active',
      trading_mode: trading_mode || 'normal',
      restrictions: []
    });

    if (!newUser) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/trades', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const trades = await getAllTrades();
    res.json(trades);
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/admin/trades/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedTrade = await updateTrade(id, updates);
    if (!updatedTrade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // If trade result is being set, update user balance accordingly
    if (updates.result && updates.result !== 'pending') {
      const trade = updatedTrade;
      const user = await getUserById(trade.user_id);

      if (user) {
        let balanceChange = 0;

        if (updates.result === 'win') {
          // Calculate profit based on trading settings
          const settings = await getTradingSettings();
          const setting = settings.find(s => s.duration === trade.duration);
          const profitPercentage = setting ? setting.profit_percentage : 80;
          balanceChange = trade.amount + (trade.amount * profitPercentage / 100);
        }

        await updateUser(user.id, {
          balance: user.balance + balanceChange
        });

        // Create transaction record
        await createTransaction({
          user_id: user.id,
          type: updates.result === 'win' ? 'trade_win' : 'trade_loss',
          amount: balanceChange,
          status: 'completed',
          description: `Trade ${updates.result} - ${trade.symbol} ${trade.direction}`
        });
      }
    }

    res.json(updatedTrade);
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/transactions', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await getAllTransactions();
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/trading-settings', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await getTradingSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get trading settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/admin/trading-settings/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSettings = await updateTradingSettings(id, updates);
    if (!updatedSettings) {
      return res.status(404).json({ message: 'Trading settings not found' });
    }

    res.json(updatedSettings);
  } catch (error) {
    console.error('Update trading settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// SUPERADMIN EXCLUSIVE ROUTES
app.post('/api/superadmin/apply-restrictions', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, restrictions } = req.body;

    if (!userId || !Array.isArray(restrictions)) {
      return res.status(400).json({ message: 'User ID and restrictions array are required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent restricting other admins
    if (['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Cannot restrict admin accounts' });
    }

    const currentRestrictions = user.restrictions || [];
    const newRestrictions = [...new Set([...currentRestrictions, ...restrictions])];

    const updatedUser = await updateUser(userId, {
      restrictions: newRestrictions,
      status: newRestrictions.includes('account_suspended') ? 'suspended' : user.status
    });

    res.json({
      success: true,
      user: updatedUser,
      message: `Applied ${restrictions.length} restriction(s) to user ${user.username}`
    });
  } catch (error) {
    console.error('Apply restrictions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/superadmin/remove-restrictions', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, restrictions } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentRestrictions = user.restrictions || [];
    const restrictionsToRemove = restrictions || currentRestrictions; // Remove all if none specified
    const newRestrictions = currentRestrictions.filter(r => !restrictionsToRemove.includes(r));

    const updatedUser = await updateUser(userId, {
      restrictions: newRestrictions,
      status: newRestrictions.includes('account_suspended') ? 'suspended' : 'active'
    });

    res.json({
      success: true,
      user: updatedUser,
      message: `Removed ${restrictionsToRemove.length} restriction(s) from user ${user.username}`
    });
  } catch (error) {
    console.error('Remove restrictions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/superadmin/control-trading-outcome', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, tradingMode } = req.body;

    if (!userId || !['win', 'normal', 'lose'].includes(tradingMode)) {
      return res.status(400).json({ message: 'Valid user ID and trading mode (win/normal/lose) are required' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await updateUser(userId, { trading_mode: tradingMode });

    res.json({
      success: true,
      user: updatedUser,
      message: `Set trading mode to ${tradingMode} for user ${user.username}`
    });
  } catch (error) {
    console.error('Control trading outcome error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/superadmin/system-stats', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    const trades = await getAllTrades();
    const transactions = await getAllTransactions();

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length,
      bannedUsers: users.filter(u => u.status === 'banned').length,
      totalTrades: trades.length,
      pendingTrades: trades.filter(t => t.result === 'pending').length,
      winningTrades: trades.filter(t => t.result === 'win').length,
      losingTrades: trades.filter(t => t.result === 'lose').length,
      totalTransactions: transactions.length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
      totalVolume: trades.reduce((sum, t) => sum + t.amount, 0),
      totalBalance: users.reduce((sum, u) => sum + u.balance, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(express.static(distPath));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error handling
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 METACHROME V2 - Production Server Starting...');
    console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
    
    // Initialize Supabase database
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    app.listen(PORT, () => {
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      
      if (process.env.NODE_ENV === 'production') {
        console.log('🎯 Production mode - serving static files');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
