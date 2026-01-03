var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
// METACHROME V2 - Production Server with Supabase Integration
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import path from 'path';
import { getUserById, getUserByUsername, createUser, updateUser, getAllUsers, createTrade, updateTrade, getAllTrades, getTradingSettings, updateTradingSettings, createTransaction, getAllTransactions, initializeDatabase } from '../lib/supabase.js';
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3000;
var JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
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
    origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3000', 'https://metachrome-v2.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
// Rate limiting
var limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
var authLimiter = rateLimit({
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
app.use(function (req, res, next) {
    console.log("".concat(new Date().toISOString(), " - ").concat(req.method, " ").concat(req.path));
    next();
});
// Authentication middleware
var authenticateToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, token, decoded, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                authHeader = req.headers['authorization'];
                token = authHeader && authHeader.split(' ')[1];
                if (!token) {
                    return [2 /*return*/, res.status(401).json({ message: 'Access token required' })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                decoded = jwt.verify(token, JWT_SECRET);
                return [4 /*yield*/, getUserById(decoded.userId)];
            case 2:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ message: 'Invalid token' })];
                }
                req.user = user;
                next();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, res.status(403).json({ message: 'Invalid token' })];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Admin authentication middleware
var requireAdmin = function (req, res, next) {
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
// Super admin authentication middleware
var requireSuperAdmin = function (req, res, next) {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Super admin access required' });
    }
    next();
};
// Health check endpoint
app.get('/api/health', function (req, res) {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Authentication routes
app.post('/api/auth/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, user, isValidPassword, token, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, username = _a.username, password = _a.password;
                if (!username || !password) {
                    return [2 /*return*/, res.status(400).json({ message: 'Username and password are required' })];
                }
                return [4 /*yield*/, getUserByUsername(username)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({ message: 'Invalid credentials' })];
                }
                return [4 /*yield*/, bcrypt.compare(password, user.password_hash)];
            case 2:
                isValidPassword = _b.sent();
                if (!isValidPassword) {
                    return [2 /*return*/, res.status(401).json({ message: 'Invalid credentials' })];
                }
                if (user.status !== 'active') {
                    return [2 /*return*/, res.status(401).json({ message: 'Account is suspended or banned' })];
                }
                // Update last login
                return [4 /*yield*/, updateUser(user.id, { last_login: new Date().toISOString() })];
            case 3:
                // Update last login
                _b.sent();
                token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
                res.json({
                    token: token,
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
                return [3 /*break*/, 5];
            case 4:
                error_2 = _b.sent();
                console.error('Login error:', error_2);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/api/auth/admin/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, user, isValidPassword, token, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, username = _a.username, password = _a.password;
                if (!username || !password) {
                    return [2 /*return*/, res.status(400).json({ message: 'Username and password are required' })];
                }
                return [4 /*yield*/, getUserByUsername(username)];
            case 1:
                user = _b.sent();
                if (!user || !['admin', 'super_admin'].includes(user.role)) {
                    return [2 /*return*/, res.status(401).json({ message: 'Invalid admin credentials' })];
                }
                return [4 /*yield*/, bcrypt.compare(password, user.password_hash)];
            case 2:
                isValidPassword = _b.sent();
                if (!isValidPassword) {
                    return [2 /*return*/, res.status(401).json({ message: 'Invalid admin credentials' })];
                }
                if (user.status !== 'active') {
                    return [2 /*return*/, res.status(401).json({ message: 'Admin account is suspended' })];
                }
                // Update last login
                return [4 /*yield*/, updateUser(user.id, { last_login: new Date().toISOString() })];
            case 3:
                // Update last login
                _b.sent();
                token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
                res.json({
                    token: token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        balance: user.balance,
                        status: user.status
                    }
                });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _b.sent();
                console.error('Admin login error:', error_3);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/api/auth/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, existingUser, hashedPassword, newUser, token, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                if (!username || !email || !password) {
                    return [2 /*return*/, res.status(400).json({ message: 'Username, email, and password are required' })];
                }
                return [4 /*yield*/, getUserByUsername(username)];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({ message: 'Username already exists' })];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 2:
                hashedPassword = _b.sent();
                return [4 /*yield*/, createUser({
                        username: username,
                        email: email,
                        password_hash: hashedPassword,
                        balance: 10000, // Starting balance
                        role: 'user',
                        status: 'active',
                        trading_mode: 'normal',
                        restrictions: []
                    })];
            case 3:
                newUser = _b.sent();
                if (!newUser) {
                    return [2 /*return*/, res.status(500).json({ message: 'Failed to create user' })];
                }
                token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '24h' });
                res.status(201).json({
                    token: token,
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
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                console.error('Registration error:', error_4);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// User routes
app.get('/api/user/profile', authenticateToken, function (req, res) {
    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        phone: req.user.phone,
        address: req.user.address,
        role: req.user.role,
        balance: req.user.balance,
        status: req.user.status,
        trading_mode: req.user.trading_mode,
        restrictions: req.user.restrictions || []
    });
});
app.put('/api/user/profile', authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, firstName, lastName, phone, address, updateData, updatedUser, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, username = _a.username, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, phone = _a.phone, address = _a.address;
                updateData = {};
                if (username !== undefined)
                    updateData.username = username;
                if (email !== undefined)
                    updateData.email = email;
                if (firstName !== undefined)
                    updateData.first_name = firstName;
                if (lastName !== undefined)
                    updateData.last_name = lastName;
                if (phone !== undefined)
                    updateData.phone = phone;
                if (address !== undefined)
                    updateData.address = address;
                return [4 /*yield*/, updateUser(req.user.id, updateData)];
            case 1:
                updatedUser = _b.sent();
                if (!updatedUser) {
                    return [2 /*return*/, res.status(500).json({ message: 'Failed to update profile' })];
                }
                res.json({
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    phone: updatedUser.phone,
                    address: updatedUser.address,
                    role: updatedUser.role,
                    balance: updatedUser.balance,
                    status: updatedUser.status,
                    trading_mode: updatedUser.trading_mode
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                console.error('Profile update error:', error_5);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Trading routes
app.get('/api/trading/settings', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getTradingSettings()];
            case 1:
                settings = _a.sent();
                res.json(settings);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Get trading settings error:', error_6);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/trading/trade', authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, symbol, amount, direction, duration, restrictions, entryPrice, expiresAt, trade, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, symbol = _a.symbol, amount = _a.amount, direction = _a.direction, duration = _a.duration;
                if (!symbol || !amount || !direction || !duration) {
                    return [2 /*return*/, res.status(400).json({ message: 'Missing required fields' })];
                }
                if (req.user.balance < amount) {
                    return [2 /*return*/, res.status(400).json({ message: 'Insufficient balance' })];
                }
                restrictions = req.user.restrictions || [];
                if (restrictions.includes('trading_disabled')) {
                    return [2 /*return*/, res.status(403).json({ message: 'Trading is disabled for your account' })];
                }
                entryPrice = Math.random() * 100 + 50;
                expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + duration);
                return [4 /*yield*/, createTrade({
                        user_id: req.user.id,
                        symbol: symbol,
                        amount: amount,
                        direction: direction,
                        duration: duration,
                        entry_price: entryPrice,
                        expires_at: expiresAt.toISOString(),
                        result: 'pending'
                    })];
            case 1:
                trade = _b.sent();
                if (!trade) {
                    return [2 /*return*/, res.status(500).json({ message: 'Failed to create trade' })];
                }
                // Deduct amount from user balance
                return [4 /*yield*/, updateUser(req.user.id, {
                        balance: req.user.balance - amount
                    })];
            case 2:
                // Deduct amount from user balance
                _b.sent();
                res.json(trade);
                return [3 /*break*/, 4];
            case 3:
                error_7 = _b.sent();
                console.error('Create trade error:', error_7);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// SUPERADMIN ROUTES - Complete functionality
app.get('/api/admin/users', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getAllUsers()];
            case 1:
                users = _a.sent();
                res.json(users);
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Get users error:', error_8);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updates, targetUser, updatedUser, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                id = req.params.id;
                updates = req.body;
                if (!(req.user.role !== 'super_admin')) return [3 /*break*/, 2];
                return [4 /*yield*/, getUserById(id)];
            case 1:
                targetUser = _a.sent();
                if (targetUser && ['admin', 'super_admin'].includes(targetUser.role)) {
                    return [2 /*return*/, res.status(403).json({ message: 'Cannot modify admin accounts' })];
                }
                // Regular admins cannot change roles
                delete updates.role;
                _a.label = 2;
            case 2: return [4 /*yield*/, updateUser(id, updates)];
            case 3:
                updatedUser = _a.sent();
                if (!updatedUser) {
                    return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                }
                res.json(updatedUser);
                return [3 /*break*/, 5];
            case 4:
                error_9 = _a.sent();
                console.error('Update user error:', error_9);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/api/admin/users', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, role, balance, trading_mode, hashedPassword, newUser, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password, role = _a.role, balance = _a.balance, trading_mode = _a.trading_mode;
                if (!username || !email || !password) {
                    return [2 /*return*/, res.status(400).json({ message: 'Username, email, and password are required' })];
                }
                // Only super admin can create admin accounts
                if (role && ['admin', 'super_admin'].includes(role) && req.user.role !== 'super_admin') {
                    return [2 /*return*/, res.status(403).json({ message: 'Cannot create admin accounts' })];
                }
                return [4 /*yield*/, bcrypt.hash(password, 10)];
            case 1:
                hashedPassword = _b.sent();
                return [4 /*yield*/, createUser({
                        username: username,
                        email: email,
                        password_hash: hashedPassword,
                        balance: balance || 10000,
                        role: role || 'user',
                        status: 'active',
                        trading_mode: trading_mode || 'normal',
                        restrictions: []
                    })];
            case 2:
                newUser = _b.sent();
                if (!newUser) {
                    return [2 /*return*/, res.status(500).json({ message: 'Failed to create user' })];
                }
                res.status(201).json(newUser);
                return [3 /*break*/, 4];
            case 3:
                error_10 = _b.sent();
                console.error('Create user error:', error_10);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/admin/trades', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var trades, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getAllTrades()];
            case 1:
                trades = _a.sent();
                res.json(trades);
                return [3 /*break*/, 3];
            case 2:
                error_11 = _a.sent();
                console.error('Get trades error:', error_11);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/admin/trades/:id', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updates, updatedTrade, trade_1, user, balanceChange, settings, setting, profitPercentage, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                id = req.params.id;
                updates = req.body;
                return [4 /*yield*/, updateTrade(id, updates)];
            case 1:
                updatedTrade = _a.sent();
                if (!updatedTrade) {
                    return [2 /*return*/, res.status(404).json({ message: 'Trade not found' })];
                }
                if (!(updates.result && updates.result !== 'pending')) return [3 /*break*/, 7];
                trade_1 = updatedTrade;
                return [4 /*yield*/, getUserById(trade_1.user_id)];
            case 2:
                user = _a.sent();
                if (!user) return [3 /*break*/, 7];
                balanceChange = 0;
                if (!(updates.result === 'win')) return [3 /*break*/, 4];
                return [4 /*yield*/, getTradingSettings()];
            case 3:
                settings = _a.sent();
                setting = settings.find(function (s) { return s.duration === trade_1.duration; });
                profitPercentage = setting ? setting.profit_percentage : 80;
                balanceChange = trade_1.amount + (trade_1.amount * profitPercentage / 100);
                _a.label = 4;
            case 4: return [4 /*yield*/, updateUser(user.id, {
                    balance: user.balance + balanceChange
                })];
            case 5:
                _a.sent();
                // Create transaction record
                return [4 /*yield*/, createTransaction({
                        user_id: user.id,
                        type: updates.result === 'win' ? 'trade_win' : 'trade_loss',
                        amount: balanceChange,
                        status: 'completed',
                        description: "Trade ".concat(updates.result, " - ").concat(trade_1.symbol, " ").concat(trade_1.direction)
                    })];
            case 6:
                // Create transaction record
                _a.sent();
                _a.label = 7;
            case 7:
                res.json(updatedTrade);
                return [3 /*break*/, 9];
            case 8:
                error_12 = _a.sent();
                console.error('Update trade error:', error_12);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
app.get('/api/admin/transactions', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transactions, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getAllTransactions()];
            case 1:
                transactions = _a.sent();
                res.json(transactions);
                return [3 /*break*/, 3];
            case 2:
                error_13 = _a.sent();
                console.error('Get transactions error:', error_13);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/admin/trading-settings', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getTradingSettings()];
            case 1:
                settings = _a.sent();
                res.json(settings);
                return [3 /*break*/, 3];
            case 2:
                error_14 = _a.sent();
                console.error('Get trading settings error:', error_14);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.put('/api/admin/trading-settings/:id', authenticateToken, requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, updates, updatedSettings, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                updates = req.body;
                return [4 /*yield*/, updateTradingSettings(id, updates)];
            case 1:
                updatedSettings = _a.sent();
                if (!updatedSettings) {
                    return [2 /*return*/, res.status(404).json({ message: 'Trading settings not found' })];
                }
                res.json(updatedSettings);
                return [3 /*break*/, 3];
            case 2:
                error_15 = _a.sent();
                console.error('Update trading settings error:', error_15);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// SUPERADMIN EXCLUSIVE ROUTES
app.post('/api/superadmin/apply-restrictions', authenticateToken, requireSuperAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, restrictions, user, currentRestrictions, newRestrictions, updatedUser, error_16;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, userId = _a.userId, restrictions = _a.restrictions;
                if (!userId || !Array.isArray(restrictions)) {
                    return [2 /*return*/, res.status(400).json({ message: 'User ID and restrictions array are required' })];
                }
                return [4 /*yield*/, getUserById(userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                }
                // Prevent restricting other admins
                if (['admin', 'super_admin'].includes(user.role)) {
                    return [2 /*return*/, res.status(403).json({ message: 'Cannot restrict admin accounts' })];
                }
                currentRestrictions = user.restrictions || [];
                newRestrictions = __spreadArray([], new Set(__spreadArray(__spreadArray([], currentRestrictions, true), restrictions, true)), true);
                return [4 /*yield*/, updateUser(userId, {
                        restrictions: newRestrictions,
                        status: newRestrictions.includes('account_suspended') ? 'suspended' : user.status
                    })];
            case 2:
                updatedUser = _b.sent();
                res.json({
                    success: true,
                    user: updatedUser,
                    message: "Applied ".concat(restrictions.length, " restriction(s) to user ").concat(user.username)
                });
                return [3 /*break*/, 4];
            case 3:
                error_16 = _b.sent();
                console.error('Apply restrictions error:', error_16);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/api/superadmin/remove-restrictions', authenticateToken, requireSuperAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, restrictions, user, currentRestrictions, restrictionsToRemove_1, newRestrictions, updatedUser, error_17;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, userId = _a.userId, restrictions = _a.restrictions;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ message: 'User ID is required' })];
                }
                return [4 /*yield*/, getUserById(userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                }
                currentRestrictions = user.restrictions || [];
                restrictionsToRemove_1 = restrictions || currentRestrictions;
                newRestrictions = currentRestrictions.filter(function (r) { return !restrictionsToRemove_1.includes(r); });
                return [4 /*yield*/, updateUser(userId, {
                        restrictions: newRestrictions,
                        status: newRestrictions.includes('account_suspended') ? 'suspended' : 'active'
                    })];
            case 2:
                updatedUser = _b.sent();
                res.json({
                    success: true,
                    user: updatedUser,
                    message: "Removed ".concat(restrictionsToRemove_1.length, " restriction(s) from user ").concat(user.username)
                });
                return [3 /*break*/, 4];
            case 3:
                error_17 = _b.sent();
                console.error('Remove restrictions error:', error_17);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/api/superadmin/control-trading-outcome', authenticateToken, requireSuperAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, tradingMode, user, updatedUser, error_18;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, userId = _a.userId, tradingMode = _a.tradingMode;
                if (!userId || !['win', 'normal', 'lose'].includes(tradingMode)) {
                    return [2 /*return*/, res.status(400).json({ message: 'Valid user ID and trading mode (win/normal/lose) are required' })];
                }
                return [4 /*yield*/, getUserById(userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'User not found' })];
                }
                return [4 /*yield*/, updateUser(userId, { trading_mode: tradingMode })];
            case 2:
                updatedUser = _b.sent();
                res.json({
                    success: true,
                    user: updatedUser,
                    message: "Set trading mode to ".concat(tradingMode, " for user ").concat(user.username)
                });
                return [3 /*break*/, 4];
            case 3:
                error_18 = _b.sent();
                console.error('Control trading outcome error:', error_18);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/superadmin/system-stats', authenticateToken, requireSuperAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users, trades, transactions, stats, error_19;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, getAllUsers()];
            case 1:
                users = _a.sent();
                return [4 /*yield*/, getAllTrades()];
            case 2:
                trades = _a.sent();
                return [4 /*yield*/, getAllTransactions()];
            case 3:
                transactions = _a.sent();
                stats = {
                    totalUsers: users.length,
                    activeUsers: users.filter(function (u) { return u.status === 'active'; }).length,
                    suspendedUsers: users.filter(function (u) { return u.status === 'suspended'; }).length,
                    bannedUsers: users.filter(function (u) { return u.status === 'banned'; }).length,
                    totalTrades: trades.length,
                    pendingTrades: trades.filter(function (t) { return t.result === 'pending'; }).length,
                    winningTrades: trades.filter(function (t) { return t.result === 'win'; }).length,
                    losingTrades: trades.filter(function (t) { return t.result === 'lose'; }).length,
                    totalTransactions: transactions.length,
                    pendingTransactions: transactions.filter(function (t) { return t.status === 'pending'; }).length,
                    totalVolume: trades.reduce(function (sum, t) { return sum + parseFloat(t.amount || 0); }, 0),
                    totalBalance: users.reduce(function (sum, u) { return sum + parseFloat(u.balance || 0); }, 0)
                };
                res.json(stats);
                return [3 /*break*/, 5];
            case 4:
                error_19 = _a.sent();
                console.error('Get system stats error:', error_19);
                res.status(500).json({ message: 'Internal server error' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    var distPath_1 = path.join(__dirname, '..', 'dist', 'public');
    app.use(express.static(distPath_1));
    app.get('*', function (req, res) {
        res.sendFile(path.join(distPath_1, 'index.html'));
    });
}
// Error handling
app.use(function (error, req, res, next) {
    console.error('Unhandled error:', error);
    res.status(500).json({ message: 'Internal server error' });
});
// Initialize database and start server
var startServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_20;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('🚀 METACHROME V2 - Production Server Starting...');
                console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
                // Initialize Supabase database
                return [4 /*yield*/, initializeDatabase()];
            case 1:
                // Initialize Supabase database
                _a.sent();
                console.log('✅ Database initialized successfully');
                app.listen(PORT, function () {
                    console.log("\uD83C\uDF10 Server running on port ".concat(PORT));
                    console.log("\uD83D\uDD17 Health check: http://localhost:".concat(PORT, "/api/health"));
                    if (process.env.NODE_ENV === 'production') {
                        console.log('🎯 Production mode - serving static files');
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_20 = _a.sent();
                console.error('❌ Failed to start server:', error_20);
                process.exit(1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
startServer();
// Graceful shutdown
process.on('SIGTERM', function () {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', function () {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});
export default app;
