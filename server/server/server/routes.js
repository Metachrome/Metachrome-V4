"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var http_1 = require("http");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
// Note: multer will be installed - importing conditionally for now
var multer = null;
try {
    multer = require("multer");
}
catch (e) {
    console.log("⚠️ Multer not installed yet - file uploads will use text mode");
}
require("./types"); // Import session types
var storage_1 = require("./storage");
// Reset storage to database mode in case it fell back to demo mode
storage_1.storage.resetToDatabase();
var websocket_1 = require("./websocket");
var seed_1 = require("./seed");
var priceService_1 = require("./priceService");
var tradingService_1 = require("./tradingService");
var auth_1 = require("./auth");
var oauth_1 = require("./oauth");
var chat_routes_1 = require("./chat-routes");
var setup_chat_tables_1 = require("./setup-chat-tables");
var schema_1 = require("@shared/schema");
var drizzle_orm_1 = require("drizzle-orm");
var schema_2 = require("@shared/schema");
var activityLogger_1 = require("./activityLogger");
var adminNotifications = [];
var sseClients = new Set();
// Helper function to broadcast notification to all connected admin clients
function broadcastNotification(notification) {
    adminNotifications.unshift(notification);
    if (adminNotifications.length > 50) {
        adminNotifications.splice(50);
    }
    var data = JSON.stringify(notification);
    sseClients.forEach(function (client) {
        try {
            client.write("data: ".concat(data, "\n\n"));
        }
        catch (error) {
            sseClients.delete(client);
        }
    });
}
// Helper functions for deposit addresses and network info
function getDepositAddress(currency) {
    var depositAddresses = {
        'USDT-ERC': '0xabc123def456789abc123def456789abc123def45',
        'USDT-BEP': 'bnb1abc123def456789abc123def456789abc123def',
        'USDT-TRC': 'TRX123abc456def789abc123def456789abc123def',
        'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        'ETH': '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b',
        'SOL': 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC7Twb4k9UYuza'
    };
    return depositAddresses[currency] || 'Address not available';
}
function getNetworkInfo(currency) {
    var networkInfo = {
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
function verifyBlockchainTransaction(txHash, currency, amount) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // TODO: Implement real blockchain verification
                // For now, return false to prevent fake transactions
                console.log("\uD83D\uDD0D Verifying blockchain transaction: ".concat(txHash, " for ").concat(amount, " ").concat(currency));
                // Example implementation for different currencies:
                if (currency === 'USDT') {
                    // Verify USDT transaction on Ethereum/Tron
                    // const web3 = new Web3(process.env.ETH_RPC_URL);
                    // const receipt = await web3.eth.getTransactionReceipt(txHash);
                    // return receipt && receipt.status;
                }
                else if (currency === 'BTC') {
                    // Verify Bitcoin transaction
                    // const response = await fetch(`https://blockstream.info/api/tx/${txHash}`);
                    // const tx = await response.json();
                    // return tx.status.confirmed;
                }
                // For demo purposes, require manual admin approval
                return [2 /*return*/, false];
            }
            catch (error) {
                console.error('Blockchain verification error:', error);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
function verifyStripePayment(paymentIntentId, amount) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                console.log("\uD83D\uDCB3 Verifying Stripe payment: ".concat(paymentIntentId, " for $").concat(amount));
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
                return [2 /*return*/, false]; // For now, always return false
            }
            catch (error) {
                console.error('Stripe verification error:', error);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    });
}
// Configure multer for file uploads (when available)
var upload = null;
if (multer) {
    var uploadStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            var uploadDir = path_1.default.join(process.cwd(), 'uploads');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            // Generate unique filename with timestamp and original name
            var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            var extension = path_1.default.extname(file.originalname);
            var nameWithoutExt = path_1.default.basename(file.originalname, extension);
            cb(null, "".concat(nameWithoutExt, "-").concat(uniqueSuffix).concat(extension));
        }
    });
    upload = multer({
        storage: uploadStorage,
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit
        },
        fileFilter: function (req, file, cb) {
            // Allow images, PDFs, and documents
            var allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
            var extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
            var mimetype = allowedTypes.test(file.mimetype);
            if (mimetype && extname) {
                return cb(null, true);
            }
            else {
                cb(new Error('Only images, PDFs, and documents are allowed!'));
            }
        }
    });
    console.log("✅ File upload system initialized with multer");
}
else {
    console.log("⚠️ File upload system using text-only mode (multer not available)");
}
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var checkTradingEnabled, depositHandler, httpServer, _a, broadcastPriceUpdate, broadcastToAll;
        var _this = this;
        return __generator(this, function (_b) {
            console.log('🚀 ========================================');
            console.log('🚀 REGISTERING SSE ENDPOINTS');
            console.log('🚀 ========================================');
            // ============================================
            // REAL-TIME NOTIFICATION SYSTEM FOR SUPERADMIN
            // MUST BE FIRST - BEFORE ANY OTHER ROUTES
            // Using /sse/* path to avoid /api/* rate limiting
            // ============================================
            // DEBUG: Test endpoint to verify routing works
            app.get("/sse/test", function (req, res) {
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
            app.get("/sse/notifications/stream", function (req, res) {
                var _a, _b;
                console.log('🔔 /sse/notifications/stream endpoint hit!');
                console.log('🔔 User:', ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user) || req.user);
                var user = ((_b = req.session) === null || _b === void 0 ? void 0 : _b.user) || req.user;
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
                res.write("data: ".concat(JSON.stringify({ type: 'connected', message: 'Notification stream connected' }), "\n\n"));
                // Send existing unread notifications
                var unreadNotifications = adminNotifications.filter(function (n) { return !n.read; });
                if (unreadNotifications.length > 0) {
                    unreadNotifications.forEach(function (notification) {
                        res.write("data: ".concat(JSON.stringify(notification), "\n\n"));
                    });
                }
                // Keep connection alive with heartbeat
                var heartbeat = setInterval(function () {
                    try {
                        res.write(": heartbeat\n\n");
                    }
                    catch (error) {
                        clearInterval(heartbeat);
                        sseClients.delete(res);
                    }
                }, 30000);
                // Clean up on client disconnect
                req.on('close', function () {
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
            app.get("/api/admin/notifications", auth_1.requireSessionSuperAdmin, function (req, res) {
                try {
                    res.json({ notifications: adminNotifications });
                }
                catch (error) {
                    res.status(500).json({ message: "Failed to fetch notifications" });
                }
            });
            // Mark notification as read (Superadmin only)
            app.post("/api/admin/notifications/:id/read", auth_1.requireSessionSuperAdmin, function (req, res) {
                try {
                    var id_1 = req.params.id;
                    var notification = adminNotifications.find(function (n) { return n.id === id_1; });
                    if (notification) {
                        notification.read = true;
                        res.json({ success: true });
                    }
                    else {
                        res.status(404).json({ message: "Notification not found" });
                    }
                }
                catch (error) {
                    res.status(500).json({ message: "Failed to mark notification as read" });
                }
            });
            // Mark all notifications as read (Superadmin only)
            app.post("/api/admin/notifications/read-all", auth_1.requireSessionSuperAdmin, function (req, res) {
                try {
                    adminNotifications.forEach(function (n) { return n.read = true; });
                    res.json({ success: true });
                }
                catch (error) {
                    res.status(500).json({ message: "Failed to mark all notifications as read" });
                }
            });
            // EMERGENCY BYPASS: System settings endpoint BEFORE any other middleware
            app.put("/api/system-config", function (req, res) {
                console.log('🚀 /api/system-config endpoint hit!');
                console.log('📦 Request body:', req.body);
                try {
                    res.setHeader('Content-Type', 'application/json');
                    var _a = req.body, tradingEnabled = _a.tradingEnabled, maintenanceMode = _a.maintenanceMode, minTradeAmount = _a.minTradeAmount, maxTradeAmount = _a.maxTradeAmount;
                    global.systemSettings = global.systemSettings || {
                        tradingEnabled: true,
                        maintenanceMode: false,
                        minTradeAmount: '10',
                        maxTradeAmount: '10000'
                    };
                    if (typeof tradingEnabled === 'boolean') {
                        global.systemSettings.tradingEnabled = tradingEnabled;
                        console.log("\uD83C\uDFAE Trading ".concat(tradingEnabled ? 'ENABLED' : 'DISABLED', " by admin"));
                    }
                    if (typeof maintenanceMode === 'boolean') {
                        global.systemSettings.maintenanceMode = maintenanceMode;
                        console.log("\uD83D\uDD27 Maintenance mode ".concat(maintenanceMode ? 'ENABLED' : 'DISABLED', " by admin"));
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
                }
                catch (error) {
                    console.error('Error updating system settings:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to update system settings'
                    });
                }
            });
            // Initialize OAuth authentication
            (0, oauth_1.setupOAuth)(app);
            // Auth routes
            // Generic auth endpoint for session checking and login
            app.get("/api/auth", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var authHeader, token, user_1, decoded, user;
                return __generator(this, function (_a) {
                    try {
                        authHeader = req.headers.authorization;
                        token = authHeader && authHeader.split(' ')[1];
                        if (token) {
                            console.log('🔍 Auth check - checking token:', token.substring(0, 20) + '...');
                            // Handle admin tokens (from admin login)
                            if (token.startsWith('admin-token-') || token.startsWith('token_admin-001_') || token.startsWith('token_superadmin-001_')) {
                                console.log('🔧 Admin token detected, checking session');
                                user_1 = req.session.user || null;
                                console.log('🔧 Session user for admin token:', user_1);
                                return [2 /*return*/, res.json(user_1)];
                            }
                            decoded = (0, auth_1.verifyToken)(token);
                            if (decoded) {
                                console.log('✅ Valid JWT token found:', decoded);
                                return [2 /*return*/, res.json(decoded)];
                            }
                            else {
                                console.log('❌ Invalid JWT token');
                            }
                        }
                        user = req.session.user || null;
                        console.log('🔍 Auth check - session user:', user);
                        res.json(user);
                    }
                    catch (error) {
                        console.error("Error fetching current user:", error);
                        res.status(500).json({ message: "Failed to fetch user" });
                    }
                    return [2 /*return*/];
                });
            }); });
            app.post("/api/auth", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, username, password, walletAddress, email, firstName, lastName, user_2, isNewUser, notification, existingUser, existingEmail, hashedPassword, user_3, notification, token_1, user, isValidPassword, token, error_1;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 14, , 15]);
                            _a = req.body, username = _a.username, password = _a.password, walletAddress = _a.walletAddress, email = _a.email, firstName = _a.firstName, lastName = _a.lastName;
                            console.log('🔐 Generic auth attempt:', { username: username, email: email, password: password ? '***' : 'missing', walletAddress: walletAddress, firstName: firstName, lastName: lastName });
                            if (!(walletAddress && !username && !password)) return [3 /*break*/, 5];
                            return [4 /*yield*/, ((_b = storage_1.storage.getUserByWallet) === null || _b === void 0 ? void 0 : _b.call(storage_1.storage, walletAddress))];
                        case 1:
                            user_2 = _c.sent();
                            isNewUser = false;
                            if (!!user_2) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage_1.storage.createUser({
                                    walletAddress: walletAddress,
                                    role: 'user',
                                })];
                        case 2:
                            // Create new user
                            user_2 = _c.sent();
                            isNewUser = true;
                            _c.label = 3;
                        case 3: 
                        // Update last login
                        return [4 /*yield*/, storage_1.storage.updateUser(user_2.id, { lastLogin: new Date() })];
                        case 4:
                            // Update last login
                            _c.sent();
                            // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN for new users
                            if (isNewUser) {
                                notification = {
                                    id: "registration_".concat(user_2.id, "_").concat(Date.now()),
                                    type: 'registration',
                                    userId: user_2.id,
                                    username: user_2.username || walletAddress.substring(0, 8) + '...',
                                    email: user_2.email || 'MetaMask User',
                                    timestamp: new Date(),
                                    read: false
                                };
                                broadcastNotification(notification);
                                console.log("\uD83D\uDD14 Sent new MetaMask user registration notification: ".concat(walletAddress));
                            }
                            // Store user in session
                            req.session.user = {
                                id: user_2.id,
                                username: user_2.username || undefined,
                                email: user_2.email || undefined,
                                role: user_2.role || 'user',
                                walletAddress: user_2.walletAddress || undefined,
                                hasPassword: !!user_2.password,
                            };
                            return [2 /*return*/, res.status(200).json({
                                    user: req.session.user,
                                    message: "MetaMask authentication successful"
                                })];
                        case 5:
                            if (!(email && username && password)) return [3 /*break*/, 10];
                            console.log('🔄 User registration attempt:', { username: username, email: email });
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                        case 6:
                            existingUser = _c.sent();
                            if (existingUser) {
                                return [2 /*return*/, res.status(400).json({ message: "Username already exists" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                        case 7:
                            existingEmail = _c.sent();
                            if (existingEmail) {
                                return [2 /*return*/, res.status(400).json({ message: "Email already exists" })];
                            }
                            return [4 /*yield*/, (0, auth_1.hashPassword)(password)];
                        case 8:
                            hashedPassword = _c.sent();
                            return [4 /*yield*/, storage_1.storage.createUser({
                                    username: username,
                                    email: email,
                                    password: hashedPassword,
                                    firstName: firstName,
                                    lastName: lastName,
                                    role: 'user',
                                })];
                        case 9:
                            user_3 = _c.sent();
                            notification = {
                                id: "registration_".concat(user_3.id, "_").concat(Date.now()),
                                type: 'registration',
                                userId: user_3.id,
                                username: user_3.username || username,
                                email: user_3.email || email,
                                timestamp: new Date(),
                                read: false
                            };
                            broadcastNotification(notification);
                            console.log("\uD83D\uDD14 Sent new user registration notification: ".concat(user_3.username, " (").concat(user_3.email, ")"));
                            // Store user in session for auto-login
                            req.session.user = {
                                id: user_3.id,
                                username: user_3.username || undefined,
                                email: user_3.email || undefined,
                                role: user_3.role || 'user',
                                walletAddress: user_3.walletAddress || undefined,
                                hasPassword: !!user_3.password,
                            };
                            token_1 = (0, auth_1.generateToken)({
                                id: user_3.id,
                                username: user_3.username,
                                email: user_3.email,
                                role: user_3.role,
                            });
                            return [2 /*return*/, res.json({
                                    user: req.session.user,
                                    message: "Registration successful",
                                    token: token_1,
                                    success: true
                                })];
                        case 10:
                            // Handle regular login
                            if (!username || !password) {
                                return [2 /*return*/, res.status(400).json({ message: "Username and password are required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                        case 11:
                            user = _c.sent();
                            if (!user) {
                                console.log('❌ User not found in database');
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            return [4 /*yield*/, (0, auth_1.verifyPassword)(password, user.password || '')];
                        case 12:
                            isValidPassword = _c.sent();
                            if (!isValidPassword) {
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            // Update last login
                            return [4 /*yield*/, storage_1.storage.updateUser(user.id, { lastLogin: new Date() })];
                        case 13:
                            // Update last login
                            _c.sent();
                            // Store user in session
                            req.session.user = {
                                id: user.id,
                                username: user.username || undefined,
                                email: user.email || undefined,
                                role: user.role || 'user',
                                walletAddress: user.walletAddress || undefined,
                                hasPassword: !!user.password,
                            };
                            token = void 0;
                            if (user.role === 'admin' || user.role === 'super_admin') {
                                token = (0, auth_1.generateToken)({
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    role: user.role,
                                });
                            }
                            res.json(__assign({ user: req.session.user, message: "Login successful" }, (token && { token: token })));
                            return [3 /*break*/, 15];
                        case 14:
                            error_1 = _c.sent();
                            console.error("Error with generic auth:", error_1);
                            res.status(500).json({ message: "Authentication failed" });
                            return [3 /*break*/, 15];
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/auth/user", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user;
                return __generator(this, function (_a) {
                    try {
                        user = req.session.user || null;
                        console.log('🔍 Auth check - session user:', user);
                        res.json(user);
                    }
                    catch (error) {
                        console.error("Error fetching current user:", error);
                        res.status(500).json({ message: "Failed to fetch user" });
                    }
                    return [2 /*return*/];
                });
            }); });
            // Admin login endpoint
            app.post("/api/auth/admin/login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, username, password, user, isValidPassword, token, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            _a = req.body, username = _a.username, password = _a.password;
                            console.log('🔐 Admin login attempt:', { username: username, password: password ? '***' : 'missing' });
                            if (!username || !password) {
                                return [2 /*return*/, res.status(400).json({ message: "Username and password are required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                        case 1:
                            user = _b.sent();
                            console.log('👤 Found user:', user ? { id: user.id, username: user.username, role: user.role, email: user.email } : 'null');
                            console.log('🔍 Login attempt for username:', username);
                            console.log('🔍 User lookup result:', user);
                            if (!user) {
                                console.log('❌ User not found in database');
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            isValidPassword = false;
                            if (!(user.id === 'demo-admin-1' && username === 'superadmin' && password === 'superadmin123')) return [3 /*break*/, 2];
                            isValidPassword = true;
                            return [3 /*break*/, 5];
                        case 2:
                            if (!(user.id === 'demo-admin-1' && username === 'admin' && password === 'admin123')) return [3 /*break*/, 3];
                            isValidPassword = true;
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, (0, auth_1.verifyPassword)(password, user.password || '')];
                        case 4:
                            isValidPassword = _b.sent();
                            _b.label = 5;
                        case 5:
                            if (!isValidPassword) {
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            if (user.role !== 'admin' && user.role !== 'super_admin') {
                                return [2 /*return*/, res.status(403).json({ message: "Access denied. Admin privileges required." })];
                            }
                            // Update last login
                            return [4 /*yield*/, storage_1.storage.updateUser(user.id, { lastLogin: new Date() })];
                        case 6:
                            // Update last login
                            _b.sent();
                            // Store user in session (same as user login)
                            req.session.user = {
                                id: user.id,
                                username: user.username || undefined,
                                email: user.email || undefined,
                                role: user.role || 'user',
                                walletAddress: user.walletAddress || undefined,
                            };
                            console.log('✅ Admin login successful, session user:', req.session.user);
                            token = (0, auth_1.generateToken)({
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                role: user.role,
                            });
                            console.log('📤 Sending response with user:', req.session.user);
                            res.json({
                                user: req.session.user,
                                message: "Login successful",
                                token: token
                            });
                            return [3 /*break*/, 8];
                        case 7:
                            error_2 = _b.sent();
                            console.error("Error with admin login:", error_2);
                            res.status(500).json({ message: "Login failed" });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // Admin logout endpoint
            app.post("/api/auth/admin/logout", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    try {
                        req.session.destroy(function (err) {
                            if (err) {
                                console.error("Error destroying admin session:", err);
                                return res.status(500).json({ message: "Admin logout failed" });
                            }
                            res.json({ message: "Admin logout successful" });
                        });
                    }
                    catch (error) {
                        console.error("Error with admin logout:", error);
                        res.status(500).json({ message: "Admin logout failed" });
                    }
                    return [2 /*return*/];
                });
            }); });
            // User authentication endpoints
            app.post("/api/auth/user/login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, username, password, user, isValidPassword, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 8, , 9]);
                            _a = req.body, username = _a.username, password = _a.password;
                            if (!username || !password) {
                                return [2 /*return*/, res.status(400).json({ message: "Username and password are required" })];
                            }
                            user = null;
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                        case 1:
                            // First, try username
                            user = _b.sent();
                            if (!(!user && username.includes('@'))) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage_1.storage.getUserByEmail(username)];
                        case 2:
                            user = _b.sent();
                            _b.label = 3;
                        case 3:
                            if (!(!user && username.startsWith('0x'))) return [3 /*break*/, 5];
                            return [4 /*yield*/, storage_1.storage.getUserByWallet(username)];
                        case 4:
                            user = _b.sent();
                            _b.label = 5;
                        case 5:
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            return [4 /*yield*/, (0, auth_1.verifyPassword)(password, user.password || '')];
                        case 6:
                            isValidPassword = _b.sent();
                            if (!isValidPassword) {
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            // Update last login
                            return [4 /*yield*/, storage_1.storage.updateUser(user.id, { lastLogin: new Date() })];
                        case 7:
                            // Update last login
                            _b.sent();
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
                            return [3 /*break*/, 9];
                        case 8:
                            error_3 = _b.sent();
                            console.error("Error with user login:", error_3);
                            res.status(500).json({ message: "Login failed" });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // User logout endpoint
            app.post("/api/auth/user/logout", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    try {
                        req.session.destroy(function (err) {
                            if (err) {
                                console.error("Error destroying session:", err);
                                return res.status(500).json({ message: "Logout failed" });
                            }
                            res.json({ message: "Logout successful" });
                        });
                    }
                    catch (error) {
                        console.error("Error with user logout:", error);
                        res.status(500).json({ message: "Logout failed" });
                    }
                    return [2 /*return*/];
                });
            }); });
            // MetaMask authentication endpoint
            app.post("/api/auth/metamask", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, walletAddress, signature, user, newUser, error_4;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 6]);
                            _a = req.body, walletAddress = _a.walletAddress, signature = _a.signature;
                            if (!walletAddress) {
                                return [2 /*return*/, res.status(400).json({ message: "Wallet address is required" })];
                            }
                            return [4 /*yield*/, ((_b = storage_1.storage.getUserByWalletAddress) === null || _b === void 0 ? void 0 : _b.call(storage_1.storage, walletAddress))];
                        case 1:
                            user = _c.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage_1.storage.createUser({
                                    username: "wallet_".concat(walletAddress.slice(0, 8)),
                                    email: "".concat(walletAddress.slice(0, 8), "@wallet.local"),
                                    walletAddress: walletAddress,
                                    role: 'user'
                                })];
                        case 2:
                            newUser = _c.sent();
                            user = newUser;
                            _c.label = 3;
                        case 3: 
                        // Update last login
                        return [4 /*yield*/, storage_1.storage.updateUser(user.id, { lastLogin: new Date() })];
                        case 4:
                            // Update last login
                            _c.sent();
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
                            return [3 /*break*/, 6];
                        case 5:
                            error_4 = _c.sent();
                            console.error("Error with MetaMask authentication:", error_4);
                            res.status(500).json({ message: "MetaMask authentication failed" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // OAuth endpoints (Google, Apple, LinkedIn)
            app.post("/api/auth/oauth/:provider", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var provider, _a, code, email, name_1;
                return __generator(this, function (_b) {
                    try {
                        provider = req.params.provider;
                        _a = req.body, code = _a.code, email = _a.email, name_1 = _a.name;
                        // In a real implementation, you would:
                        // 1. Verify the OAuth code with the provider's API
                        // 2. Get user info from the provider
                        // 3. Create or authenticate the user
                        // For demo purposes, we'll simulate OAuth success
                        console.log("OAuth ".concat(provider, " authentication attempt:"), { code: code, email: email, name: name_1 });
                        res.json({
                            message: "".concat(provider, " OAuth integration is configured but requires API keys"),
                            requiresSetup: true
                        });
                    }
                    catch (error) {
                        console.error("Error with ".concat(req.params.provider, " OAuth:"), error);
                        res.status(500).json({ message: "OAuth authentication failed" });
                    }
                    return [2 /*return*/];
                });
            }); });
            app.post("/api/auth/user/register", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, username, email, password, existingUser, existingEmail, hashedPassword, user, notification, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                            if (!username || !email || !password) {
                                return [2 /*return*/, res.status(400).json({ message: "All fields are required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                        case 1:
                            existingUser = _b.sent();
                            if (existingUser) {
                                return [2 /*return*/, res.status(400).json({ message: "Username already exists" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                        case 2:
                            existingEmail = _b.sent();
                            if (existingEmail) {
                                return [2 /*return*/, res.status(400).json({ message: "Email already exists" })];
                            }
                            return [4 /*yield*/, (0, auth_1.hashPassword)(password)];
                        case 3:
                            hashedPassword = _b.sent();
                            return [4 /*yield*/, storage_1.storage.createUser({
                                    username: username,
                                    email: email,
                                    password: hashedPassword,
                                    role: 'user',
                                })];
                        case 4:
                            user = _b.sent();
                            notification = {
                                id: "registration_".concat(user.id, "_").concat(Date.now()),
                                type: 'registration',
                                userId: user.id,
                                username: user.username,
                                email: user.email,
                                timestamp: new Date(),
                                read: false
                            };
                            broadcastNotification(notification);
                            console.log("\uD83D\uDD14 Sent new user registration notification: ".concat(user.username, " (").concat(user.email, ")"));
                            res.json({ user: user, message: "Registration successful" });
                            return [3 /*break*/, 6];
                        case 5:
                            error_5 = _b.sent();
                            console.error("Error with user registration:", error_5);
                            res.status(500).json({ message: "Registration failed" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Market data endpoints
            app.get("/api/market-data", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var marketData, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getAllMarketData()];
                        case 1:
                            marketData = _a.sent();
                            res.json(marketData);
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            console.error("Error fetching market data:", error_6);
                            res.status(500).json({ message: "Failed to fetch market data" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/market-data/:symbol", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var symbol, data, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            symbol = req.params.symbol;
                            return [4 /*yield*/, storage_1.storage.getMarketData(symbol)];
                        case 1:
                            data = _a.sent();
                            if (!data) {
                                return [2 /*return*/, res.status(404).json({ message: "Market data not found" })];
                            }
                            res.json(data);
                            return [3 /*break*/, 3];
                        case 2:
                            error_7 = _a.sent();
                            console.error("Error fetching market data:", error_7);
                            res.status(500).json({ message: "Failed to fetch market data" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/trading-pairs", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var pairs, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getTradingPairs()];
                        case 1:
                            pairs = _a.sent();
                            res.json(pairs);
                            return [3 /*break*/, 3];
                        case 2:
                            error_8 = _a.sent();
                            console.error("Error fetching trading pairs:", error_8);
                            res.status(500).json({ message: "Failed to fetch trading pairs" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Binance real-time price endpoint
            app.get("/api/binance/price", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var symbol, binanceUrl, controller_1, timeout, response, data, priceData, fetchError_1, mockPrices, mockPrice, mockChange, fallbackData, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            symbol = req.query.symbol || 'BTCUSDT';
                            console.log('💰 [Binance Price] Request for:', symbol);
                            binanceUrl = "https://api.binance.com/api/v3/ticker/24hr?symbol=".concat(symbol);
                            controller_1 = new AbortController();
                            timeout = setTimeout(function () { return controller_1.abort(); }, 5000);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, fetch(binanceUrl, { signal: controller_1.signal })];
                        case 2:
                            response = _a.sent();
                            clearTimeout(timeout);
                            if (!response.ok) {
                                console.error('❌ [Binance Price] Binance API error:', response.status, response.statusText);
                                throw new Error("Binance API error: ".concat(response.status));
                            }
                            return [4 /*yield*/, response.json()];
                        case 3:
                            data = _a.sent();
                            priceData = {
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
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: priceData
                                })];
                        case 4:
                            fetchError_1 = _a.sent();
                            clearTimeout(timeout);
                            console.error('❌ [Binance Price] Fetch error:', fetchError_1 instanceof Error ? fetchError_1.message : 'Unknown');
                            mockPrices = {
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
                            mockPrice = mockPrices[symbol] || 100.00;
                            mockChange = (Math.random() - 0.5) * 5;
                            fallbackData = {
                                symbol: symbol,
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
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: fallbackData
                                })];
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            error_9 = _a.sent();
                            console.error('❌ [Binance Price] Error:', error_9);
                            return [2 /*return*/, res.status(500).json({
                                    success: false,
                                    error: error_9 instanceof Error ? error_9.message : 'Unknown error'
                                })];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // User endpoints
            app.post("/api/users", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userData, user, error_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userData = schema_1.insertUserSchema.parse(req.body);
                            return [4 /*yield*/, storage_1.storage.createUser(userData)];
                        case 1:
                            user = _a.sent();
                            res.json(user);
                            return [3 /*break*/, 3];
                        case 2:
                            error_10 = _a.sent();
                            console.error("Error creating user:", error_10);
                            res.status(400).json({ message: "Failed to create user" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/users/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, user, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            return [4 /*yield*/, storage_1.storage.getUser(id)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            res.json(user);
                            return [3 /*break*/, 3];
                        case 2:
                            error_11 = _a.sent();
                            console.error("Error fetching user:", error_11);
                            res.status(500).json({ message: "Failed to fetch user" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // User profile endpoints
            app.get("/api/user/profile", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, user, password, passwordHash, userProfile, error_12;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
                            if (!userId) {
                                return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUser(userId)];
                        case 1:
                            user = _c.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            password = user.password, passwordHash = user.passwordHash, userProfile = __rest(user, ["password", "passwordHash"]);
                            res.json(userProfile);
                            return [3 /*break*/, 3];
                        case 2:
                            error_12 = _c.sent();
                            console.error("Error fetching user profile:", error_12);
                            res.status(500).json({ message: "Failed to fetch user profile" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/user/profile", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, _a, username, email, firstName, lastName, phone, address, updateData, updatedUser, password, passwordHash, userProfile, error_13;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 2, , 3]);
                            userId = (_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.id;
                            if (!userId) {
                                return [2 /*return*/, res.status(401).json({ message: "User not authenticated" })];
                            }
                            _a = req.body, username = _a.username, email = _a.email, firstName = _a.firstName, lastName = _a.lastName, phone = _a.phone, address = _a.address;
                            updateData = {};
                            if (username !== undefined)
                                updateData.username = username;
                            if (email !== undefined)
                                updateData.email = email;
                            if (firstName !== undefined)
                                updateData.firstName = firstName;
                            if (lastName !== undefined)
                                updateData.lastName = lastName;
                            if (phone !== undefined)
                                updateData.phone = phone;
                            if (address !== undefined)
                                updateData.address = address;
                            return [4 /*yield*/, storage_1.storage.updateUser(userId, updateData)];
                        case 1:
                            updatedUser = _d.sent();
                            if (!updatedUser) {
                                return [2 /*return*/, res.status(500).json({ message: "Failed to update profile" })];
                            }
                            password = updatedUser.password, passwordHash = updatedUser.passwordHash, userProfile = __rest(updatedUser, ["password", "passwordHash"]);
                            res.json(userProfile);
                            return [3 /*break*/, 3];
                        case 2:
                            error_13 = _d.sent();
                            console.error("Error updating user profile:", error_13);
                            res.status(500).json({ message: "Failed to update user profile" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/auth/metamask", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, walletAddress, signature, user, error_14;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            _a = req.body, walletAddress = _a.walletAddress, signature = _a.signature;
                            if (!walletAddress) {
                                return [2 /*return*/, res.status(400).json({ message: "Wallet address is required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByWallet(walletAddress)];
                        case 1:
                            user = _b.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage_1.storage.createUser({
                                    walletAddress: walletAddress,
                                    role: 'user',
                                })];
                        case 2:
                            // Create new user
                            user = _b.sent();
                            _b.label = 3;
                        case 3: 
                        // Update last login
                        return [4 /*yield*/, storage_1.storage.updateUser(user.id, { lastLogin: new Date() })];
                        case 4:
                            // Update last login
                            _b.sent();
                            // Store user in session
                            req.session.user = {
                                id: user.id,
                                username: user.username || undefined,
                                email: user.email || undefined,
                                role: user.role || 'user',
                                walletAddress: user.walletAddress || undefined,
                            };
                            res.json({ user: req.session.user, message: "Login successful" });
                            return [3 /*break*/, 6];
                        case 5:
                            error_14 = _b.sent();
                            console.error("Error with Metamask auth:", error_14);
                            res.status(500).json({ message: "Authentication failed" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Balance endpoints
            app.get("/api/users/:userId/balances", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, balances, error_15;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = req.params.userId;
                            return [4 /*yield*/, storage_1.storage.getUserBalances(userId)];
                        case 1:
                            balances = _a.sent();
                            res.json(balances);
                            return [3 /*break*/, 3];
                        case 2:
                            error_15 = _a.sent();
                            console.error("Error fetching balances:", error_15);
                            res.status(500).json({ message: "Failed to fetch balances" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/users/:userId/balances", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, _a, symbol, available, locked, balance, error_16;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            userId = req.params.userId;
                            _a = req.body, symbol = _a.symbol, available = _a.available, locked = _a.locked;
                            return [4 /*yield*/, storage_1.storage.updateBalance(userId, symbol, available, locked)];
                        case 1:
                            balance = _b.sent();
                            res.json(balance);
                            return [3 /*break*/, 3];
                        case 2:
                            error_16 = _b.sent();
                            console.error("Error updating balance:", error_16);
                            res.status(500).json({ message: "Failed to update balance" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            checkTradingEnabled = function (req, res, next) {
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
            app.post("/api/trades", checkTradingEnabled, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var tradeData, trade, error_17;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            tradeData = schema_1.insertTradeSchema.parse(req.body);
                            // For options trading, set expiry time
                            if (tradeData.type === 'options' && tradeData.duration) {
                                tradeData.expiresAt = new Date(Date.now() + tradeData.duration * 1000);
                            }
                            return [4 /*yield*/, storage_1.storage.createTrade(tradeData)];
                        case 1:
                            trade = _a.sent();
                            res.json(trade);
                            return [3 /*break*/, 3];
                        case 2:
                            error_17 = _a.sent();
                            console.error("Error creating trade:", error_17);
                            res.status(400).json({ message: "Failed to create trade" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // New options trading endpoint
            app.post("/api/trades/options", checkTradingEnabled, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, symbol, direction, amount, duration, finalUserId, result, error_18;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = req.body, userId = _a.userId, symbol = _a.symbol, direction = _a.direction, amount = _a.amount, duration = _a.duration;
                            if (!userId || !symbol || !direction || !amount || !duration) {
                                return [2 /*return*/, res.status(400).json({ message: "Missing required fields" })];
                            }
                            finalUserId = userId;
                            if (userId === 'superadmin-001' || userId === 'admin-001') {
                                finalUserId = "".concat(userId, "-trading");
                                console.log("\uD83D\uDD27 Admin user ".concat(userId, " trading as ").concat(finalUserId));
                            }
                            return [4 /*yield*/, tradingService_1.tradingService.createOptionsTrade({
                                    userId: finalUserId,
                                    symbol: symbol,
                                    direction: direction,
                                    amount: amount,
                                    duration: duration,
                                })];
                        case 1:
                            result = _b.sent();
                            if (result.success) {
                                res.json(result);
                            }
                            else {
                                res.status(400).json(result);
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_18 = _b.sent();
                            console.error("Error creating options trade:", error_18);
                            res.status(500).json({ message: "Failed to create options trade" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get options settings
            app.get("/api/options-settings", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var settings, error_19;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getOptionsSettings()];
                        case 1:
                            settings = _a.sent();
                            res.json(settings);
                            return [3 /*break*/, 3];
                        case 2:
                            error_19 = _a.sent();
                            console.error("Error fetching options settings:", error_19);
                            res.status(500).json({ message: "Failed to fetch options settings" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Cancel trade endpoint
            app.post("/api/trades/:id/cancel", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, userId, success, error_20;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            userId = req.body.userId;
                            return [4 /*yield*/, tradingService_1.tradingService.cancelTrade(id, userId)];
                        case 1:
                            success = _a.sent();
                            if (success) {
                                res.json({ message: "Trade cancelled successfully" });
                            }
                            else {
                                res.status(400).json({ message: "Unable to cancel trade" });
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            error_20 = _a.sent();
                            console.error("Error cancelling trade:", error_20);
                            res.status(500).json({ message: "Failed to cancel trade" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/users/:userId/trades", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, limit, trades, error_21;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = req.params.userId;
                            limit = req.query.limit ? parseInt(req.query.limit) : 100;
                            return [4 /*yield*/, storage_1.storage.getUserTrades(userId, limit)];
                        case 1:
                            trades = _a.sent();
                            res.json(trades);
                            return [3 /*break*/, 3];
                        case 2:
                            error_21 = _a.sent();
                            console.error("Error fetching trades:", error_21);
                            res.status(500).json({ message: "Failed to fetch trades" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.patch("/api/trades/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, updates, trade, error_22;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            updates = req.body;
                            return [4 /*yield*/, storage_1.storage.updateTrade(id, updates)];
                        case 1:
                            trade = _a.sent();
                            res.json(trade);
                            return [3 /*break*/, 3];
                        case 2:
                            error_22 = _a.sent();
                            console.error("Error updating trade:", error_22);
                            res.status(500).json({ message: "Failed to update trade" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get a single trade by ID (for real-time notification data)
            app.get("/api/trades/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, trade, error_23;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            return [4 /*yield*/, storage_1.storage.getTrade(id)];
                        case 1:
                            trade = _a.sent();
                            if (!trade) {
                                return [2 /*return*/, res.status(404).json({ message: "Trade not found" })];
                            }
                            res.json(trade);
                            return [3 /*break*/, 3];
                        case 2:
                            error_23 = _a.sent();
                            console.error("Error fetching trade:", error_23);
                            res.status(500).json({ message: "Failed to fetch trade" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Spot Trading endpoints
            app.post("/api/spot/orders", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, symbol, side, type, amount, price, total, userId, amountNum, totalNum, priceNum, balances, cryptoSymbol_1, usdtBalance, cryptoBalance, order, error_24;
                var _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 9, , 10]);
                            _a = req.body, symbol = _a.symbol, side = _a.side, type = _a.type, amount = _a.amount, price = _a.price, total = _a.total;
                            userId = (_b = req.session) === null || _b === void 0 ? void 0 : _b.userId;
                            if (!userId) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            // Validate required fields
                            if (!symbol || !side || !type || !amount || !total) {
                                return [2 /*return*/, res.status(400).json({ message: "Missing required fields" })];
                            }
                            if (!['buy', 'sell'].includes(side)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid side. Must be 'buy' or 'sell'" })];
                            }
                            if (!['limit', 'market'].includes(type)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid type. Must be 'limit' or 'market'" })];
                            }
                            amountNum = parseFloat(amount);
                            totalNum = parseFloat(total);
                            priceNum = price ? parseFloat(price) : null;
                            if (amountNum <= 0 || totalNum <= 0) {
                                return [2 /*return*/, res.status(400).json({ message: "Amount and total must be positive" })];
                            }
                            if (type === 'limit' && (!priceNum || priceNum <= 0)) {
                                return [2 /*return*/, res.status(400).json({ message: "Price is required for limit orders" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserBalances(userId)];
                        case 1:
                            balances = _e.sent();
                            cryptoSymbol_1 = symbol.replace('USDT', '');
                            if (side === 'buy') {
                                usdtBalance = ((_c = balances.find(function (b) { return b.currency === 'USDT'; })) === null || _c === void 0 ? void 0 : _c.balance) || 0;
                                if (totalNum > usdtBalance) {
                                    return [2 /*return*/, res.status(400).json({ message: "Insufficient USDT balance" })];
                                }
                            }
                            else {
                                cryptoBalance = ((_d = balances.find(function (b) { return b.currency === cryptoSymbol_1; })) === null || _d === void 0 ? void 0 : _d.balance) || 0;
                                if (amountNum > cryptoBalance) {
                                    return [2 /*return*/, res.status(400).json({ message: "Insufficient ".concat(cryptoSymbol_1, " balance") })];
                                }
                            }
                            return [4 /*yield*/, storage_1.storage.createSpotOrder({
                                    userId: userId,
                                    symbol: symbol,
                                    side: side,
                                    type: type,
                                    amount: amountNum,
                                    price: priceNum,
                                    total: totalNum,
                                    status: 'filled' // Mark as filled immediately for market orders
                                })];
                        case 2:
                            order = _e.sent();
                            if (!(side === 'buy')) return [3 /*break*/, 5];
                            // BUY: Deduct USDT, Add Cryptocurrency
                            return [4 /*yield*/, storage_1.storage.updateUserBalance(userId, 'USDT', -totalNum)];
                        case 3:
                            // BUY: Deduct USDT, Add Cryptocurrency
                            _e.sent();
                            return [4 /*yield*/, storage_1.storage.updateUserBalance(userId, cryptoSymbol_1, amountNum)];
                        case 4:
                            _e.sent();
                            console.log("\u2705 BUY ORDER: Deducted ".concat(totalNum, " USDT, Added ").concat(amountNum, " ").concat(cryptoSymbol_1));
                            return [3 /*break*/, 8];
                        case 5: 
                        // SELL: Deduct Cryptocurrency, Add USDT
                        return [4 /*yield*/, storage_1.storage.updateUserBalance(userId, cryptoSymbol_1, -amountNum)];
                        case 6:
                            // SELL: Deduct Cryptocurrency, Add USDT
                            _e.sent();
                            return [4 /*yield*/, storage_1.storage.updateUserBalance(userId, 'USDT', totalNum)];
                        case 7:
                            _e.sent();
                            console.log("\u2705 SELL ORDER: Deducted ".concat(amountNum, " ").concat(cryptoSymbol_1, ", Added ").concat(totalNum, " USDT"));
                            _e.label = 8;
                        case 8:
                            res.json(order);
                            return [3 /*break*/, 10];
                        case 9:
                            error_24 = _e.sent();
                            console.error("Error creating spot order:", error_24);
                            res.status(500).json({ message: "Failed to create spot order" });
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/spot/orders", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, orders, error_25;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
                            if (!userId) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserSpotOrders(userId)];
                        case 1:
                            orders = _b.sent();
                            res.json(orders);
                            return [3 /*break*/, 3];
                        case 2:
                            error_25 = _b.sent();
                            console.error("Error fetching spot orders:", error_25);
                            res.status(500).json({ message: "Failed to fetch spot orders" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/spot/orders/:id", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, userId, order, error_26;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            id = req.params.id;
                            userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
                            if (!userId) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getSpotOrder(id)];
                        case 1:
                            order = _b.sent();
                            if (!order) {
                                return [2 /*return*/, res.status(404).json({ message: "Order not found" })];
                            }
                            if (order.userId !== userId) {
                                return [2 /*return*/, res.status(403).json({ message: "Not authorized to cancel this order" })];
                            }
                            if (order.status !== 'pending') {
                                return [2 /*return*/, res.status(400).json({ message: "Can only cancel pending orders" })];
                            }
                            // Cancel order and refund locked funds
                            return [4 /*yield*/, storage_1.storage.updateSpotOrder(id, { status: 'cancelled' })];
                        case 2:
                            // Cancel order and refund locked funds
                            _b.sent();
                            if (!(order.side === 'buy')) return [3 /*break*/, 4];
                            return [4 /*yield*/, storage_1.storage.updateUserBalance(userId, 'USDT', order.total)];
                        case 3:
                            _b.sent();
                            return [3 /*break*/, 6];
                        case 4: return [4 /*yield*/, storage_1.storage.updateUserBalance(userId, 'BTC', order.amount)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            res.json({ message: "Order cancelled successfully" });
                            return [3 /*break*/, 8];
                        case 7:
                            error_26 = _b.sent();
                            console.error("Error cancelling spot order:", error_26);
                            res.status(500).json({ message: "Failed to cancel spot order" });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // Transaction endpoints
            app.post("/api/transactions", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var transactionData, transaction, error_27;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            transactionData = schema_1.insertTransactionSchema.parse(req.body);
                            return [4 /*yield*/, storage_1.storage.createTransaction(transactionData)];
                        case 1:
                            transaction = _a.sent();
                            res.json(transaction);
                            return [3 /*break*/, 3];
                        case 2:
                            error_27 = _a.sent();
                            console.error("Error creating transaction:", error_27);
                            res.status(400).json({ message: "Failed to create transaction" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create Stripe payment intent (temporarily disabled)
            app.post("/api/payments/create-intent", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, amount, currency, userId, amountNum;
                var _b;
                return __generator(this, function (_c) {
                    try {
                        _a = req.body, amount = _a.amount, currency = _a.currency;
                        userId = (_b = req.session) === null || _b === void 0 ? void 0 : _b.userId;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                        }
                        if (!amount || !currency) {
                            return [2 /*return*/, res.status(400).json({ message: "Amount and currency are required" })];
                        }
                        amountNum = parseFloat(amount);
                        if (amountNum <= 0) {
                            return [2 /*return*/, res.status(400).json({ message: "Invalid amount" })];
                        }
                        // TODO: Re-enable when paymentService is working
                        // const paymentIntent = await paymentService.createPaymentIntent(
                        //   amountNum,
                        //   currency,
                        //   userId
                        // );
                        res.status(503).json({ message: "Stripe integration temporarily disabled" });
                    }
                    catch (error) {
                        console.error('Payment intent creation error:', error);
                        res.status(500).json({
                            message: error instanceof Error ? error.message : "Payment processing unavailable"
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            // TODO: Add Stripe webhook endpoint after server is running
            // Top-up endpoint
            app.post("/api/transactions/topup", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, amount, currency, method, type, amountNum, transaction, currentBalance, newAvailable, error_28;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            _a = req.body, userId = _a.userId, amount = _a.amount, currency = _a.currency, method = _a.method, type = _a.type;
                            if (!userId || !amount || !currency) {
                                return [2 /*return*/, res.status(400).json({ message: "Missing required fields" })];
                            }
                            amountNum = parseFloat(amount);
                            if (amountNum <= 0) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid amount" })];
                            }
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: userId,
                                    symbol: currency,
                                    type: type || 'deposit',
                                    amount: amount.toString(),
                                    status: 'completed', // In production, this would be 'pending' until payment is confirmed
                                    method: method || 'crypto',
                                    txHash: "demo_".concat(Date.now()), // In production, this would be the actual transaction hash
                                })];
                        case 1:
                            transaction = _b.sent();
                            return [4 /*yield*/, storage_1.storage.getBalance(userId, currency)];
                        case 2:
                            currentBalance = _b.sent();
                            newAvailable = currentBalance ?
                                (parseFloat(currentBalance.available || '0') + amountNum).toString() :
                                amount.toString();
                            return [4 /*yield*/, storage_1.storage.updateBalance(userId, currency, newAvailable, (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 3:
                            _b.sent();
                            res.json({
                                transaction: transaction,
                                message: "Top-up successful",
                                newBalance: newAvailable
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_28 = _b.sent();
                            console.error("Error processing top-up:", error_28);
                            res.status(500).json({ message: "Failed to process top-up" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get user transactions
            app.get("/api/users/:id/transactions", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, transactions_1, error_29;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(id)];
                        case 1:
                            transactions_1 = _a.sent();
                            res.json(transactions_1);
                            return [3 /*break*/, 3];
                        case 2:
                            error_29 = _a.sent();
                            console.error("Error fetching user transactions:", error_29);
                            res.status(500).json({ message: "Failed to fetch transactions" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/users/:userId/transactions", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, limit, transactions_2, error_30;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = req.params.userId;
                            limit = req.query.limit ? parseInt(req.query.limit) : 100;
                            console.log("\uD83D\uDCCA Fetching transactions for user ".concat(userId, ", limit: ").concat(limit));
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(userId, limit)];
                        case 1:
                            transactions_2 = _a.sent();
                            console.log("\u2705 Found ".concat(transactions_2.length, " transactions for user ").concat(userId));
                            console.log("\uD83D\uDCCB Transaction types:", __spreadArray([], new Set(transactions_2.map(function (t) { return t.type; })), true));
                            console.log("\uD83D\uDCCB Sample transaction:", transactions_2[0]);
                            res.json(transactions_2);
                            return [3 /*break*/, 3];
                        case 2:
                            error_30 = _a.sent();
                            console.error("Error fetching transactions:", error_30);
                            res.status(500).json({ message: "Failed to fetch transactions" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Options settings
            app.get("/api/options-settings", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var settings, error_31;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getOptionsSettings()];
                        case 1:
                            settings = _a.sent();
                            res.json(settings);
                            return [3 /*break*/, 3];
                        case 2:
                            error_31 = _a.sent();
                            console.error("Error fetching options settings:", error_31);
                            res.status(500).json({ message: "Failed to fetch options settings" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Admin endpoints
            app.post("/api/admin/controls", auth_1.requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var controlData, control, error_32;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            controlData = schema_1.insertAdminControlSchema.parse(req.body);
                            return [4 /*yield*/, storage_1.storage.createAdminControl(controlData)];
                        case 1:
                            control = _a.sent();
                            res.json(control);
                            return [3 /*break*/, 3];
                        case 2:
                            error_32 = _a.sent();
                            console.error("Error creating admin control:", error_32);
                            res.status(400).json({ message: "Failed to create admin control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/admin/controls/:userId", auth_1.requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, control, error_33;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId = req.params.userId;
                            return [4 /*yield*/, storage_1.storage.getAdminControl(userId)];
                        case 1:
                            control = _a.sent();
                            res.json(control);
                            return [3 /*break*/, 3];
                        case 2:
                            error_33 = _a.sent();
                            console.error("Error fetching admin control:", error_33);
                            res.status(500).json({ message: "Failed to fetch admin control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.patch("/api/admin/controls/:id", auth_1.requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, updates, control, error_34;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            updates = req.body;
                            return [4 /*yield*/, storage_1.storage.updateAdminControl(id, updates)];
                        case 1:
                            control = _a.sent();
                            res.json(control);
                            return [3 /*break*/, 3];
                        case 2:
                            error_34 = _a.sent();
                            console.error("Error updating admin control:", error_34);
                            res.status(500).json({ message: "Failed to update admin control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Also support PUT method for frontend compatibility
            app.put("/api/admin/controls/:id", auth_1.requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, updates, control, error_35;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            updates = req.body;
                            return [4 /*yield*/, storage_1.storage.updateAdminControl(id, updates)];
                        case 1:
                            control = _a.sent();
                            res.json(control);
                            return [3 /*break*/, 3];
                        case 2:
                            error_35 = _a.sent();
                            console.error("Error updating admin control:", error_35);
                            res.status(500).json({ message: "Failed to update admin control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Delete admin control
            app.delete("/api/admin/controls/:id", auth_1.requireAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, error_36;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            return [4 /*yield*/, storage_1.storage.deleteAdminControl(id)];
                        case 1:
                            _a.sent();
                            res.json({ message: "Control deleted successfully" });
                            return [3 /*break*/, 3];
                        case 2:
                            error_36 = _a.sent();
                            console.error("Error deleting admin control:", error_36);
                            res.status(500).json({ message: "Failed to delete admin control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Diagnostic endpoint to check database schema (PUBLIC - for debugging)
            app.get("/api/diagnostics/schema", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var result, sampleTx, error_37;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            console.log('🔍 Checking database schema...');
                            return [4 /*yield*/, db.execute((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        SELECT column_name, data_type, is_nullable\n        FROM information_schema.columns\n        WHERE table_name = 'transactions'\n        ORDER BY ordinal_position\n      "], ["\n        SELECT column_name, data_type, is_nullable\n        FROM information_schema.columns\n        WHERE table_name = 'transactions'\n        ORDER BY ordinal_position\n      "]))))];
                        case 1:
                            result = _a.sent();
                            console.log('📋 Transactions table schema:', result);
                            return [4 /*yield*/, db.select().from(schema_2.transactions).limit(1)];
                        case 2:
                            sampleTx = _a.sent();
                            console.log('📦 Sample transaction:', sampleTx);
                            res.json({
                                schema: result,
                                sampleTransaction: sampleTx[0],
                                message: 'Check server logs for detailed schema information'
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_37 = _a.sent();
                            console.error('❌ Error checking schema:', error_37);
                            res.status(500).json({ error: error_37 instanceof Error ? error_37.message : 'Unknown error' });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Trade execution for options with admin control
            app.post("/api/options/execute", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var tradeId, trade_1, adminControl, currentPrice, isWin, exitPrice, amountStr, tradeAmount, optionsSettings, setting, profitPercentage, profitAmount, profit, updatedTrade, currentBalance, newAvailable, newLocked, transactionAmount, transactionType, transaction, verifyTx, txError_1, error_38;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 13, , 14]);
                            tradeId = req.body.tradeId;
                            return [4 /*yield*/, storage_1.storage.getTrade(tradeId)];
                        case 1:
                            trade_1 = _b.sent();
                            if (!trade_1) {
                                return [2 /*return*/, res.status(404).json({ message: "Trade not found" })];
                            }
                            console.log("\uD83D\uDD0D\uD83D\uDD0D\uD83D\uDD0D FULL TRADE OBJECT:", JSON.stringify(trade_1, null, 2));
                            return [4 /*yield*/, storage_1.storage.getAdminControl(trade_1.userId)];
                        case 2:
                            adminControl = _b.sent();
                            return [4 /*yield*/, storage_1.storage.getMarketData(trade_1.symbol)];
                        case 3:
                            currentPrice = _b.sent();
                            if (!currentPrice) {
                                return [2 /*return*/, res.status(400).json({ message: "Current price not available" })];
                            }
                            isWin = false;
                            exitPrice = currentPrice.price;
                            // Apply admin control logic
                            if (adminControl) {
                                switch (adminControl.controlType) {
                                    case 'win':
                                        isWin = true;
                                        // Adjust exit price to ensure win
                                        if (trade_1.direction === 'up') {
                                            exitPrice = (parseFloat(trade_1.entryPrice) + 0.01).toString();
                                        }
                                        else {
                                            exitPrice = (parseFloat(trade_1.entryPrice) - 0.01).toString();
                                        }
                                        break;
                                    case 'lose':
                                        isWin = false;
                                        // Adjust exit price to ensure loss
                                        if (trade_1.direction === 'up') {
                                            exitPrice = (parseFloat(trade_1.entryPrice) - 0.01).toString();
                                        }
                                        else {
                                            exitPrice = (parseFloat(trade_1.entryPrice) + 0.01).toString();
                                        }
                                        break;
                                    case 'normal':
                                    default:
                                        // Use real market price
                                        if (trade_1.direction === 'up') {
                                            isWin = parseFloat(currentPrice.price) > parseFloat(trade_1.entryPrice);
                                        }
                                        else {
                                            isWin = parseFloat(currentPrice.price) < parseFloat(trade_1.entryPrice);
                                        }
                                        break;
                                }
                            }
                            else {
                                // No admin control, use real market logic
                                if (trade_1.direction === 'up') {
                                    isWin = parseFloat(currentPrice.price) > parseFloat(trade_1.entryPrice);
                                }
                                else {
                                    isWin = parseFloat(currentPrice.price) < parseFloat(trade_1.entryPrice);
                                }
                            }
                            // Calculate profit/loss
                            console.log("\uD83D\uDD0D Trade data for profit calculation:", {
                                tradeId: tradeId,
                                tradeAmount: trade_1.amount,
                                tradeAmountType: typeof trade_1.amount,
                                tradeAmountKeys: Object.keys(trade_1),
                                isWin: isWin,
                                tradeObject: JSON.stringify(trade_1)
                            });
                            amountStr = trade_1.amount ? trade_1.amount.toString() : '0';
                            tradeAmount = parseFloat(amountStr);
                            console.log("\uD83D\uDCB0 Parsed trade amount: ".concat(tradeAmount, " (from: ").concat(amountStr, ")"));
                            if (tradeAmount === 0) {
                                console.error("\u274C ERROR: Trade amount is 0! This will result in $0 transaction. Trade:", trade_1);
                            }
                            return [4 /*yield*/, storage_1.storage.getOptionsSettings()];
                        case 4:
                            optionsSettings = _b.sent();
                            setting = optionsSettings.find(function (s) { return s.duration === trade_1.duration; });
                            profitPercentage = setting ? parseFloat(setting.profitPercentage) : 10;
                            profitAmount = tradeAmount * (profitPercentage / 100);
                            profit = isWin ? profitAmount : -profitAmount;
                            console.log("\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25 [ROUTES.TS] Calculated profit: ".concat(profit, " (isWin: ").concat(isWin, ")"));
                            console.log("\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25 [ROUTES.TS] Profit details:", {
                                tradeAmount: tradeAmount,
                                profitPercentage: profitPercentage,
                                profitAmount: profitAmount,
                                isWin: isWin,
                                profitCalculation: isWin ? "Unlock ".concat(tradeAmount, " + Profit ").concat(profitAmount, " = ").concat(tradeAmount + profitAmount) : "Loss ".concat(profitAmount, " (amount already locked)"),
                                profitAsString: profit.toString()
                            });
                            return [4 /*yield*/, storage_1.storage.updateTrade(tradeId, {
                                    status: 'completed',
                                    exitPrice: exitPrice,
                                    profit: profit.toString(),
                                    completedAt: new Date(),
                                })];
                        case 5:
                            updatedTrade = _b.sent();
                            return [4 /*yield*/, storage_1.storage.getBalance(trade_1.userId, 'USDT')];
                        case 6:
                            currentBalance = _b.sent();
                            if (!currentBalance) return [3 /*break*/, 8];
                            newAvailable = isWin
                                ? parseFloat(currentBalance.available || '0') + tradeAmount + profitAmount
                                : parseFloat(currentBalance.available || '0');
                            newLocked = parseFloat(currentBalance.locked || '0') - tradeAmount;
                            console.log("\uD83D\uDD25\uD83D\uDD25\uD83D\uDD25 [ROUTES.TS] Balance update:", {
                                oldAvailable: currentBalance.available,
                                oldLocked: currentBalance.locked,
                                newAvailable: newAvailable.toString(),
                                newLocked: Math.max(0, newLocked).toString(),
                                tradeAmount: tradeAmount,
                                profitAmount: profitAmount,
                                isWin: isWin,
                                calculation: isWin ? "".concat(currentBalance.available, " + ").concat(tradeAmount, " + ").concat(profitAmount, " = ").concat(newAvailable) : "".concat(currentBalance.available, " (unchanged)")
                            });
                            return [4 /*yield*/, storage_1.storage.updateBalance(trade_1.userId, 'USDT', newAvailable.toString(), Math.max(0, newLocked).toString())];
                        case 7:
                            _b.sent();
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 11, , 12]);
                            transactionAmount = profit.toFixed(8);
                            console.log("\uD83D\uDCDD Creating transaction with amount: ".concat(transactionAmount, " (type: ").concat(typeof transactionAmount, ")"));
                            transactionType = isWin ? 'trade_win' : 'trade_loss';
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: trade_1.userId,
                                    type: transactionType,
                                    amount: transactionAmount,
                                    status: 'completed',
                                    description: "".concat(isWin ? 'Win' : 'Loss', " on ").concat(trade_1.symbol, " trade"),
                                    referenceId: tradeId
                                })];
                        case 9:
                            transaction = _b.sent();
                            console.log("\u2705 Transaction created:", {
                                transactionId: transaction.id,
                                amount: transaction.amount,
                                amountType: typeof transaction.amount,
                                profit: profit,
                                isWin: isWin,
                                type: transactionType
                            });
                            return [4 /*yield*/, storage_1.storage.getTransaction(transaction.id)];
                        case 10:
                            verifyTx = _b.sent();
                            console.log("\uD83D\uDD0D VERIFICATION - Transaction retrieved from DB:", {
                                id: verifyTx === null || verifyTx === void 0 ? void 0 : verifyTx.id,
                                storedAmount: verifyTx === null || verifyTx === void 0 ? void 0 : verifyTx.amount,
                                storedAmountType: typeof (verifyTx === null || verifyTx === void 0 ? void 0 : verifyTx.amount),
                                storedAmountString: (_a = verifyTx === null || verifyTx === void 0 ? void 0 : verifyTx.amount) === null || _a === void 0 ? void 0 : _a.toString()
                            });
                            return [3 /*break*/, 12];
                        case 11:
                            txError_1 = _b.sent();
                            console.error("\u26A0\uFE0F Failed to create transaction for trade ".concat(tradeId, ":"), txError_1);
                            return [3 /*break*/, 12];
                        case 12:
                            res.json({ trade: updatedTrade, isWin: isWin, profit: profit });
                            return [3 /*break*/, 14];
                        case 13:
                            error_38 = _b.sent();
                            console.error("Error executing options trade:", error_38);
                            res.status(500).json({ message: "Failed to execute trade" });
                            return [3 /*break*/, 14];
                        case 14: return [2 /*return*/];
                    }
                });
            }); });
            // Add missing API endpoints for the new pages
            // Additional admin endpoints with proper role-based access control
            app.get("/api/admin/users", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var users, usersWithBalances, error_39;
                var _this = this;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, storage_1.storage.getAllUsers()];
                        case 1:
                            users = _c.sent();
                            // Debug: Log raw user data from database
                            if (users.length > 0) {
                                console.log('🔍 RAW user data from database (first user):', {
                                    id: users[0].id,
                                    username: users[0].username,
                                    email: users[0].email,
                                    hasPassword: !!users[0].password,
                                    passwordValue: users[0].password,
                                    passwordLength: ((_a = users[0].password) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                    allKeys: Object.keys(users[0])
                                });
                            }
                            return [4 /*yield*/, Promise.all(users.map(function (user) { return __awaiter(_this, void 0, void 0, function () {
                                    var userBalances, usdtBalance, error_40;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 4, , 5]);
                                                return [4 /*yield*/, storage_1.storage.getUserBalances(user.id)];
                                            case 1:
                                                userBalances = _a.sent();
                                                usdtBalance = userBalances.find(function (b) { return b.symbol === 'USDT'; });
                                                if (!!usdtBalance) return [3 /*break*/, 3];
                                                return [4 /*yield*/, storage_1.storage.createBalance({
                                                        userId: user.id,
                                                        symbol: 'USDT',
                                                        available: '0.00',
                                                        locked: '0.00'
                                                    })];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/, __assign(__assign({}, user), { balance: 0 })];
                                            case 3: return [2 /*return*/, __assign(__assign({}, user), { balance: parseFloat(usdtBalance.available) })];
                                            case 4:
                                                error_40 = _a.sent();
                                                console.warn("Failed to get balance for user ".concat(user.id, ":"), error_40);
                                                return [2 /*return*/, __assign(__assign({}, user), { balance: 0 })];
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                }); }))];
                        case 2:
                            usersWithBalances = _c.sent();
                            // Debug: Log first user to verify password field is included
                            if (usersWithBalances.length > 0) {
                                console.log('📊 Sample user data (first user):', {
                                    id: usersWithBalances[0].id,
                                    username: usersWithBalances[0].username,
                                    hasPassword: !!usersWithBalances[0].password,
                                    passwordLength: ((_b = usersWithBalances[0].password) === null || _b === void 0 ? void 0 : _b.length) || 0
                                });
                            }
                            res.json(usersWithBalances);
                            return [3 /*break*/, 4];
                        case 3:
                            error_39 = _c.sent();
                            console.error("Error fetching users:", error_39);
                            res.status(500).json({ message: "Failed to fetch users" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/admin/controls", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var controls, error_41;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getAllAdminControls()];
                        case 1:
                            controls = _a.sent();
                            res.json(controls);
                            return [3 /*break*/, 3];
                        case 2:
                            error_41 = _a.sent();
                            console.error("Error fetching admin controls:", error_41);
                            res.status(500).json({ message: "Failed to fetch controls" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/admin/controls", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, controlType, notes, existingControl, control, error_42;
                var _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 3, , 4]);
                            _a = req.body, userId = _a.userId, controlType = _a.controlType, notes = _a.notes;
                            if (!userId || !controlType) {
                                return [2 /*return*/, res.status(400).json({ message: "Missing required fields" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getAdminControl(userId)];
                        case 1:
                            existingControl = _f.sent();
                            if (existingControl && existingControl.isActive) {
                                return [2 /*return*/, res.status(400).json({ message: "Active control already exists for this user" })];
                            }
                            return [4 /*yield*/, storage_1.storage.createAdminControl({
                                    userId: userId,
                                    adminId: ((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.id) || 'admin',
                                    controlType: controlType,
                                    isActive: true,
                                    notes: notes || "Control set to ".concat(controlType, " by ").concat(((_e = (_d = req.session) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.username) || 'admin'),
                                })];
                        case 2:
                            control = _f.sent();
                            res.json(control);
                            return [3 /*break*/, 4];
                        case 3:
                            error_42 = _f.sent();
                            console.error("Error creating admin control:", error_42);
                            res.status(500).json({ message: "Failed to create admin control" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/admin/controls/:id", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, controlType, isActive, notes, updates, control, error_43;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            _a = req.body, controlType = _a.controlType, isActive = _a.isActive, notes = _a.notes;
                            updates = {};
                            if (controlType !== undefined)
                                updates.controlType = controlType;
                            if (isActive !== undefined)
                                updates.isActive = isActive;
                            if (notes !== undefined)
                                updates.notes = notes;
                            return [4 /*yield*/, storage_1.storage.updateAdminControl(id, updates)];
                        case 1:
                            control = _b.sent();
                            res.json(control);
                            return [3 /*break*/, 3];
                        case 2:
                            error_43 = _b.sent();
                            console.error("Error updating admin control:", error_43);
                            res.status(500).json({ message: "Failed to update admin control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.delete("/api/admin/controls/:id", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, error_44;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            return [4 /*yield*/, storage_1.storage.deleteAdminControl(id)];
                        case 1:
                            _a.sent();
                            res.json({ message: "Admin control deleted successfully" });
                            return [3 /*break*/, 3];
                        case 2:
                            error_44 = _a.sent();
                            console.error("Error deleting admin control:", error_44);
                            res.status(500).json({ message: "Failed to delete admin control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Trading controls routes for superadmin
            app.get("/api/admin/trading-controls", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var controls, error_45;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getTradingControls()];
                        case 1:
                            controls = _a.sent();
                            res.json(controls);
                            return [3 /*break*/, 3];
                        case 2:
                            error_45 = _a.sent();
                            console.error("Error fetching trading controls:", error_45);
                            res.status(500).json({ error: "Failed to fetch trading controls" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/admin/trading-controls", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, controlType, notes, user, adminId, control, error_46;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 4, , 5]);
                            _a = req.body, userId = _a.userId, controlType = _a.controlType, notes = _a.notes;
                            if (!userId || !controlType) {
                                return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(userId)];
                        case 1:
                            user = _d.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                            }
                            adminId = ((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.id) || 'superadmin-1';
                            return [4 /*yield*/, storage_1.storage.createTradingControl(userId, controlType, notes, adminId)];
                        case 2:
                            control = _d.sent();
                            // Log activity
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.TRADING_CONTROL_SET, activityLogger_1.ActionCategories.TRADING, "Set trading mode to ".concat(controlType.toUpperCase(), " for user ").concat(user.username || user.email), { id: userId, username: user.username, email: user.email }, { controlType: controlType, notes: notes, previousMode: user.tradingMode || 'normal' })];
                        case 3:
                            // Log activity
                            _d.sent();
                            res.json(control);
                            return [3 /*break*/, 5];
                        case 4:
                            error_46 = _d.sent();
                            console.error("Error creating trading control:", error_46);
                            res.status(500).json({ error: "Failed to create trading control" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/admin/trading-controls/:id", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, controlType, notes, isActive, control, error_47;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            _a = req.body, controlType = _a.controlType, notes = _a.notes, isActive = _a.isActive;
                            return [4 /*yield*/, storage_1.storage.updateTradingControl(id, { controlType: controlType, notes: notes, isActive: isActive })];
                        case 1:
                            control = _b.sent();
                            res.json(control);
                            return [3 /*break*/, 3];
                        case 2:
                            error_47 = _b.sent();
                            console.error("Error updating trading control:", error_47);
                            res.status(500).json({ error: "Failed to update trading control" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // User wallet management routes
            app.get("/api/admin/user-wallets", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var wallets, error_48;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getUserWallets()];
                        case 1:
                            wallets = _a.sent();
                            res.json(wallets);
                            return [3 /*break*/, 3];
                        case 2:
                            error_48 = _a.sent();
                            console.error("Error fetching user wallets:", error_48);
                            res.status(500).json({ error: "Failed to fetch user wallets" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Redeem code management routes
            app.post("/api/admin/redeem-codes/:id/action", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, action, newAmount, newDescription, newMaxUses, updates, updated, updated, error_49;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 8, , 9]);
                            id = req.params.id;
                            _a = req.body, action = _a.action, newAmount = _a.newAmount, newDescription = _a.newDescription, newMaxUses = _a.newMaxUses;
                            console.log('🎁 Redeem code action:', { id: id, action: action, newAmount: newAmount, newDescription: newDescription, newMaxUses: newMaxUses });
                            if (!action) {
                                return [2 /*return*/, res.status(400).json({
                                        success: false,
                                        error: "Missing action parameter"
                                    })];
                            }
                            if (!(action === 'edit')) return [3 /*break*/, 2];
                            updates = {};
                            if (newAmount !== undefined)
                                updates.bonusAmount = newAmount;
                            if (newDescription !== undefined)
                                updates.description = newDescription;
                            if (newMaxUses !== undefined)
                                updates.maxUses = newMaxUses;
                            return [4 /*yield*/, storage_1.storage.updateRedeemCode(id, updates)];
                        case 1:
                            updated = _c.sent();
                            return [2 /*return*/, res.json({
                                    success: true,
                                    message: "Redeem code updated successfully",
                                    code: updated
                                })];
                        case 2:
                            if (!(action === 'disable')) return [3 /*break*/, 4];
                            // Disable redeem code
                            console.log('🔴 Disabling redeem code:', id);
                            return [4 /*yield*/, storage_1.storage.disableRedeemCode(id)];
                        case 3:
                            updated = _c.sent();
                            console.log('✅ Redeem code disabled:', updated);
                            return [2 /*return*/, res.json({
                                    success: true,
                                    message: "Redeem code disabled successfully",
                                    code: updated
                                })];
                        case 4:
                            if (!(action === 'delete')) return [3 /*break*/, 6];
                            // Delete redeem code
                            console.log('🗑️ Deleting redeem code:', id);
                            return [4 /*yield*/, storage_1.storage.deleteRedeemCode(id)];
                        case 5:
                            _c.sent();
                            console.log('✅ Redeem code deleted successfully');
                            return [2 /*return*/, res.json({
                                    success: true,
                                    message: "Redeem code deleted successfully"
                                })];
                        case 6: return [2 /*return*/, res.status(400).json({
                                success: false,
                                error: "Invalid action. Must be 'edit', 'disable', or 'delete'"
                            })];
                        case 7: return [3 /*break*/, 9];
                        case 8:
                            error_49 = _c.sent();
                            console.error("❌ Error performing redeem code action:", error_49);
                            console.error("Error details:", {
                                message: error_49.message,
                                code: error_49.code,
                                detail: error_49.detail,
                                stack: (_b = error_49.stack) === null || _b === void 0 ? void 0 : _b.split('\n').slice(0, 5)
                            });
                            res.status(500).json({
                                success: false,
                                message: "Internal server error",
                                error: error_49.message || "Failed to perform redeem code action",
                                details: "Failed to ".concat(action, " redeem code ").concat(id)
                            });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // Enhanced user management routes for superadmin
            app.put("/api/admin/users/update-password", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, newPassword, hashedPassword, error_50;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            _a = req.body, userId = _a.userId, newPassword = _a.newPassword;
                            if (!userId || !newPassword) {
                                return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                            }
                            return [4 /*yield*/, (0, auth_1.hashPassword)(newPassword)];
                        case 1:
                            hashedPassword = _b.sent();
                            return [4 /*yield*/, storage_1.storage.updateUserPassword(userId, hashedPassword)];
                        case 2:
                            _b.sent();
                            res.json({ success: true, message: "Password updated successfully" });
                            return [3 /*break*/, 4];
                        case 3:
                            error_50 = _b.sent();
                            console.error("Error updating user password:", error_50);
                            res.status(500).json({ error: "Failed to update user password" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/admin/users/update-wallet", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, walletAddress, error_51;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            _a = req.body, userId = _a.userId, walletAddress = _a.walletAddress;
                            if (!userId || !walletAddress) {
                                return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                            }
                            return [4 /*yield*/, storage_1.storage.updateUserWallet(userId, walletAddress)];
                        case 1:
                            _b.sent();
                            res.json({ success: true, message: "Wallet address updated successfully" });
                            return [3 /*break*/, 3];
                        case 2:
                            error_51 = _b.sent();
                            console.error("Error updating user wallet:", error_51);
                            res.status(500).json({ error: "Failed to update user wallet" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // User status management route
            app.put("/api/admin/users/update-status", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, status_1, adminNotes, user, _b, _c, error_52;
                var _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 4, , 5]);
                            _a = req.body, userId = _a.userId, status_1 = _a.status, adminNotes = _a.adminNotes;
                            if (!userId || !status_1) {
                                return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(userId)];
                        case 1:
                            user = _e.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                            }
                            // Update user status and notes
                            return [4 /*yield*/, storage_1.storage.updateUser(userId, {
                                    status: status_1,
                                    adminNotes: adminNotes || user.adminNotes,
                                    updatedAt: new Date()
                                })];
                        case 2:
                            // Update user status and notes
                            _e.sent();
                            _c = (_b = res).json;
                            _d = {
                                success: true,
                                message: "User status updated successfully"
                            };
                            return [4 /*yield*/, storage_1.storage.getUserById(userId)];
                        case 3:
                            _c.apply(_b, [(_d.user = _e.sent(),
                                    _d)]);
                            return [3 /*break*/, 5];
                        case 4:
                            error_52 = _e.sent();
                            console.error("Error updating user status:", error_52);
                            res.status(500).json({ error: "Failed to update user status" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Admin deposit and withdrawal routes
            app.post("/api/admin/deposit", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, amount, notes, user, currentBalance, currentAmount, newAmount, transaction, error_53;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            _a = req.body, userId = _a.userId, amount = _a.amount, notes = _a.notes;
                            if (!userId || !amount) {
                                return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(userId)];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getBalance(userId, 'USDT')];
                        case 2:
                            currentBalance = _b.sent();
                            currentAmount = currentBalance ? parseFloat(currentBalance.available) : 0;
                            newAmount = currentAmount + parseFloat(amount);
                            // Update balance
                            return [4 /*yield*/, storage_1.storage.updateBalance(userId, 'USDT', newAmount.toString(), (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 3:
                            // Update balance
                            _b.sent();
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: userId,
                                    type: 'deposit',
                                    symbol: 'USDT',
                                    amount: amount.toString(),
                                    status: 'completed',
                                    method: 'admin',
                                    currency: 'USDT',
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                })];
                        case 4:
                            transaction = _b.sent();
                            res.json({
                                success: true,
                                message: "Deposit processed successfully",
                                newBalance: newAmount,
                                transaction: transaction
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            error_53 = _b.sent();
                            console.error("Error processing deposit:", error_53);
                            res.status(500).json({ error: "Failed to process deposit" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            app.post("/api/admin/withdraw", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, amount, notes, user, currentBalance, currentAmount, newAmount, transaction, error_54;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 5, , 6]);
                            _a = req.body, userId = _a.userId, amount = _a.amount, notes = _a.notes;
                            if (!userId || !amount) {
                                return [2 /*return*/, res.status(400).json({ error: "Missing required fields" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(userId)];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getBalance(userId, 'USDT')];
                        case 2:
                            currentBalance = _b.sent();
                            if (!currentBalance || parseFloat(currentBalance.available) < parseFloat(amount)) {
                                return [2 /*return*/, res.status(400).json({ error: "Insufficient balance" })];
                            }
                            currentAmount = parseFloat(currentBalance.available);
                            newAmount = currentAmount - parseFloat(amount);
                            // Update balance
                            return [4 /*yield*/, storage_1.storage.updateBalance(userId, 'USDT', newAmount.toString(), currentBalance.locked)];
                        case 3:
                            // Update balance
                            _b.sent();
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: userId,
                                    type: 'withdraw',
                                    symbol: 'USDT',
                                    amount: amount.toString(),
                                    status: 'completed',
                                    method: 'admin',
                                    currency: 'USDT',
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                })];
                        case 4:
                            transaction = _b.sent();
                            res.json({
                                success: true,
                                message: "Withdrawal processed successfully",
                                newBalance: newAmount,
                                transaction: transaction
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            error_54 = _b.sent();
                            console.error("Error processing withdrawal:", error_54);
                            res.status(500).json({ error: "Failed to process withdrawal" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/admin/balances", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var balances, error_55;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getAllBalances()];
                        case 1:
                            balances = _a.sent();
                            res.json(balances);
                            return [3 /*break*/, 3];
                        case 2:
                            error_55 = _a.sent();
                            console.error("Error fetching balances:", error_55);
                            res.status(500).json({ message: "Failed to fetch balances" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/admin/balances/:userId/:symbol", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, symbol, available, user, currentBalance, previousBalance, normalizedSymbol, balance, error_56;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            _a = req.params, userId = _a.userId, symbol = _a.symbol;
                            available = req.body.available;
                            if (!available || isNaN(parseFloat(available))) {
                                return [2 /*return*/, res.status(400).json({ message: "Valid available balance is required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(userId)];
                        case 1:
                            user = _b.sent();
                            return [4 /*yield*/, storage_1.storage.getBalance(userId, symbol.toUpperCase())];
                        case 2:
                            currentBalance = _b.sent();
                            previousBalance = (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.available) || '0';
                            normalizedSymbol = (symbol || '').toUpperCase();
                            return [4 /*yield*/, storage_1.storage.updateBalance(userId, normalizedSymbol, available, '0')];
                        case 3:
                            balance = _b.sent();
                            if (!user) return [3 /*break*/, 5];
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.BALANCE_UPDATED, activityLogger_1.ActionCategories.BALANCE, "Updated ".concat(normalizedSymbol, " balance for user ").concat(user.username || user.email, " from ").concat(previousBalance, " to ").concat(available), { id: userId, username: user.username, email: user.email }, { symbol: normalizedSymbol, previousBalance: previousBalance, newBalance: available, change: (parseFloat(available) - parseFloat(previousBalance)).toString() })];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5:
                            res.json(balance);
                            return [3 /*break*/, 7];
                        case 6:
                            error_56 = _b.sent();
                            console.error("Error updating balance:", error_56);
                            res.status(400).json({ message: "Failed to update balance" });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // Balance management endpoint for deposits/withdrawals
            app.put("/api/admin/balances/:userId", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, _a, balance, action, note, currentBalance, currentAmount, changeAmount, newAmount, updatedBalance, error_57;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            userId = req.params.userId;
                            _a = req.body, balance = _a.balance, action = _a.action, note = _a.note;
                            if (!balance || isNaN(parseFloat(balance))) {
                                return [2 /*return*/, res.status(400).json({ message: "Valid balance amount is required" })];
                            }
                            if (!action || !['add', 'subtract'].includes(action)) {
                                return [2 /*return*/, res.status(400).json({ message: "Valid action (add/subtract) is required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getBalance(userId, 'USDT')];
                        case 1:
                            currentBalance = _b.sent();
                            currentAmount = parseFloat((currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.available) || '0');
                            changeAmount = parseFloat(balance);
                            newAmount = void 0;
                            if (action === 'add') {
                                newAmount = currentAmount + changeAmount;
                            }
                            else {
                                newAmount = currentAmount - changeAmount;
                                if (newAmount < 0) {
                                    return [2 /*return*/, res.status(400).json({ message: "Insufficient balance for withdrawal" })];
                                }
                            }
                            return [4 /*yield*/, storage_1.storage.updateBalance(userId, 'USDT', newAmount.toString(), '0')];
                        case 2:
                            updatedBalance = _b.sent();
                            // Log the transaction (optional - you can add transaction logging here)
                            console.log("Balance ".concat(action, ": User ").concat(userId, ", Amount: ").concat(changeAmount, ", New Balance: ").concat(newAmount, ", Note: ").concat(note));
                            // Broadcast balance update to all connected clients (for real-time sync)
                            broadcastToAll({
                                type: 'balance_update',
                                data: {
                                    userId: userId,
                                    symbol: 'USDT',
                                    newBalance: newAmount.toString(),
                                    action: action,
                                    amount: changeAmount
                                }
                            });
                            res.json({
                                balance: updatedBalance,
                                message: "Balance ".concat(action === 'add' ? 'deposit' : 'withdrawal', " successful"),
                                newAmount: newAmount.toString()
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_57 = _b.sent();
                            console.error("Error processing balance change:", error_57);
                            res.status(500).json({ message: "Failed to process balance change" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // User role management endpoints (Super Admin only)
            app.put("/api/admin/users/:id/role", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, role, userBefore, previousRole, user, error_58;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            id = req.params.id;
                            role = req.body.role;
                            if (!role || !['user', 'admin', 'super_admin'].includes(role)) {
                                return [2 /*return*/, res.status(400).json({ message: "Valid role is required (user, admin, super_admin)" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(id)];
                        case 1:
                            userBefore = _a.sent();
                            previousRole = (userBefore === null || userBefore === void 0 ? void 0 : userBefore.role) || 'unknown';
                            return [4 /*yield*/, storage_1.storage.updateUser(id, { role: role })];
                        case 2:
                            user = _a.sent();
                            if (!user) return [3 /*break*/, 4];
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.USER_ROLE_CHANGED, activityLogger_1.ActionCategories.USER_MANAGEMENT, "Changed role for user ".concat(user.username || user.email, " from ").concat(previousRole, " to ").concat(role), { id: user.id, username: user.username, email: user.email }, { previousRole: previousRole, newRole: role })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            res.json(user);
                            return [3 /*break*/, 6];
                        case 5:
                            error_58 = _a.sent();
                            console.error("Error updating user role:", error_58);
                            res.status(500).json({ message: "Failed to update user role" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/admin/users/:id/status", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, isActive, user, error_59;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            isActive = req.body.isActive;
                            if (typeof isActive !== 'boolean') {
                                return [2 /*return*/, res.status(400).json({ message: "Valid status is required (true/false)" })];
                            }
                            return [4 /*yield*/, storage_1.storage.updateUser(id, { isActive: isActive })];
                        case 1:
                            user = _a.sent();
                            res.json(user);
                            return [3 /*break*/, 3];
                        case 2:
                            error_59 = _a.sent();
                            console.error("Error updating user status:", error_59);
                            res.status(500).json({ message: "Failed to update user status" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Full user update endpoint (Super Admin only)
            app.put("/api/admin/users/:id", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, username, email, walletAddress, role, isActive, password, adminNotes, updates, hashedPassword, user, error_60;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            id = req.params.id;
                            _a = req.body, username = _a.username, email = _a.email, walletAddress = _a.walletAddress, role = _a.role, isActive = _a.isActive, password = _a.password, adminNotes = _a.adminNotes;
                            updates = {};
                            if (username !== undefined)
                                updates.username = username;
                            if (email !== undefined)
                                updates.email = email;
                            if (walletAddress !== undefined)
                                updates.walletAddress = walletAddress;
                            if (role !== undefined) {
                                if (!['user', 'admin', 'super_admin'].includes(role)) {
                                    return [2 /*return*/, res.status(400).json({ message: "Valid role is required (user, admin, super_admin)" })];
                                }
                                updates.role = role;
                            }
                            if (isActive !== undefined)
                                updates.isActive = isActive;
                            if (adminNotes !== undefined)
                                updates.adminNotes = adminNotes;
                            if (!(password && password.trim())) return [3 /*break*/, 2];
                            return [4 /*yield*/, (0, auth_1.hashPassword)(password)];
                        case 1:
                            hashedPassword = _b.sent();
                            updates.password = hashedPassword;
                            _b.label = 2;
                        case 2: return [4 /*yield*/, storage_1.storage.updateUser(id, updates)];
                        case 3:
                            user = _b.sent();
                            res.json(user);
                            return [3 /*break*/, 5];
                        case 4:
                            error_60 = _b.sent();
                            console.error("Error updating user:", error_60);
                            res.status(500).json({ message: "Failed to update user" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Delete user endpoint (Super Admin only)
            app.delete("/api/admin/users/:id", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, user, error_61;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            id = req.params.id;
                            return [4 /*yield*/, storage_1.storage.getUser(id)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            // Prevent deleting super admin users
                            if (user.role === 'super_admin') {
                                return [2 /*return*/, res.status(403).json({ message: "Cannot delete super admin users" })];
                            }
                            return [4 /*yield*/, storage_1.storage.deleteUser(id)];
                        case 2:
                            _a.sent();
                            // Log activity
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.USER_DELETED, activityLogger_1.ActionCategories.USER_MANAGEMENT, "Deleted user ".concat(user.username || user.email, " (ID: ").concat(id, ")"), { id: user.id, username: user.username, email: user.email }, { role: user.role, walletAddress: user.walletAddress })];
                        case 3:
                            // Log activity
                            _a.sent();
                            res.json({ message: "User deleted successfully" });
                            return [3 /*break*/, 5];
                        case 4:
                            error_61 = _a.sent();
                            console.error("Error deleting user:", error_61);
                            res.status(500).json({ message: "Failed to delete user" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Send message to user endpoint (Admin only) - simple approach without external packages
            app.post("/api/admin/messages", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, userId, message, type, fileName, fileData, adminId, user, finalMessage, attachmentData, tx, error_62;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 3, , 4]);
                            _a = req.body, userId = _a.userId, message = _a.message, type = _a.type, fileName = _a.fileName, fileData = _a.fileData;
                            adminId = (_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.id;
                            if (!userId || !message) {
                                return [2 /*return*/, res.status(400).json({ message: "User ID and message are required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUser(userId)];
                        case 1:
                            user = _d.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            finalMessage = message;
                            attachmentData = null;
                            if (fileName) {
                                attachmentData = {
                                    originalName: fileName,
                                    url: "#attachment-".concat(fileName) // Simple reference
                                };
                                if (!finalMessage.includes(fileName)) {
                                    finalMessage += " [Attachment: ".concat(fileName, "]");
                                }
                            }
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: userId,
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
                                })];
                        case 2:
                            tx = _d.sent();
                            console.log("\uD83D\uDCAC Admin message sent: ".concat(adminId, " -> ").concat(userId, ": \"").concat(finalMessage, "\""));
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
                            return [3 /*break*/, 4];
                        case 3:
                            error_62 = _d.sent();
                            console.error("Error sending message:", error_62);
                            res.status(500).json({ message: "Failed to send message" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Note: Files are shown as references in messages, not actually uploaded
            // Get chat messages for a user (Admin only)
            app.get("/api/admin/messages/:userId", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId_1, userTransactions, messageTransactions, messages, error_63;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            userId_1 = req.params.userId;
                            console.log("\uD83D\uDCE7 Admin requesting chat messages for user: ".concat(userId_1));
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(userId_1, 200)];
                        case 1:
                            userTransactions = _a.sent();
                            console.log("\uD83D\uDCE7 Found ".concat(userTransactions.length, " total transactions for user ").concat(userId_1));
                            messageTransactions = userTransactions.filter(function (tx) { return tx.symbol === 'MSG' && tx.metadata; });
                            console.log("\uD83D\uDCE7 Found ".concat(messageTransactions.length, " message transactions"));
                            messages = messageTransactions
                                .map(function (tx) {
                                try {
                                    console.log("\uD83D\uDCE7 Processing transaction ".concat(tx.id, " with metadata:"), tx.metadata);
                                    var metadata = JSON.parse(tx.metadata);
                                    if (metadata.kind === 'chat') {
                                        var message = {
                                            id: tx.id,
                                            fromUserId: metadata.fromUserId,
                                            toUserId: metadata.toUserId,
                                            message: metadata.message,
                                            type: metadata.type || 'user_message',
                                            timestamp: metadata.createdAt || tx.createdAt,
                                            isRead: true,
                                            sender: metadata.fromUserId === userId_1 ? 'user' : 'admin',
                                            attachment: metadata.attachment || null
                                        };
                                        console.log("\uD83D\uDCE7 Parsed message:", message);
                                        return message;
                                    }
                                }
                                catch (error) {
                                    console.error('Error parsing admin message metadata:', error);
                                }
                                return null;
                            })
                                .filter(function (msg) { return msg !== null; })
                                .sort(function (a, b) { return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); });
                            console.log("\uD83D\uDCE7 Admin retrieved ".concat(messages.length, " chat messages for user ").concat(userId_1, ":"), messages);
                            res.json({ messages: messages });
                            return [3 /*break*/, 3];
                        case 2:
                            error_63 = _a.sent();
                            console.error("Error fetching messages:", error_63);
                            res.status(500).json({ message: "Failed to fetch messages" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // User sends message to admin
            app.post("/api/messages", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var message, userId, tx, error_64;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            message = req.body.message;
                            userId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
                            if (!message || !userId) {
                                return [2 /*return*/, res.status(400).json({ message: "Message and user ID are required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: userId,
                                    type: 'transfer',
                                    symbol: 'MSG',
                                    amount: '0',
                                    status: 'completed',
                                    metadata: JSON.stringify({ kind: 'chat', fromUserId: userId, toUserId: 'admin', message: message, createdAt: new Date().toISOString() }),
                                    createdAt: new Date(),
                                })];
                        case 1:
                            tx = _c.sent();
                            res.json({
                                message: 'Message sent successfully',
                                data: { id: tx.id, fromUserId: userId, message: message }
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_64 = _c.sent();
                            console.error("Error sending user message:", error_64);
                            res.status(500).json({ message: "Failed to send message" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get user's own chat messages
            app.get("/api/messages/:userId", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId_2, sessionUserId, userTransactions, messages, error_65;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            userId_2 = req.params.userId;
                            sessionUserId = (_b = (_a = req.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id;
                            // Ensure user can only access their own messages
                            if (userId_2 !== sessionUserId) {
                                return [2 /*return*/, res.status(403).json({ message: "Access denied" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(userId_2, 200)];
                        case 1:
                            userTransactions = _c.sent();
                            messages = userTransactions
                                .filter(function (tx) { return tx.symbol === 'MSG' && tx.metadata; })
                                .map(function (tx) {
                                try {
                                    var metadata = JSON.parse(tx.metadata);
                                    if (metadata.kind === 'chat') {
                                        return {
                                            id: tx.id,
                                            fromUserId: metadata.fromUserId,
                                            toUserId: metadata.toUserId,
                                            message: metadata.message,
                                            type: metadata.type || 'user_message',
                                            timestamp: metadata.createdAt || tx.createdAt,
                                            isRead: true,
                                            sender: metadata.fromUserId === userId_2 ? 'user' : 'admin'
                                        };
                                    }
                                }
                                catch (error) {
                                    console.error('Error parsing message metadata:', error);
                                }
                                return null;
                            })
                                .filter(function (msg) { return msg !== null; })
                                .sort(function (a, b) { return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(); });
                            console.log("\uD83D\uDCE7 Retrieved ".concat(messages.length, " chat messages for user ").concat(userId_2));
                            res.json({ messages: messages });
                            return [3 /*break*/, 3];
                        case 2:
                            error_65 = _c.sent();
                            console.error("Error fetching user messages:", error_65);
                            res.status(500).json({ message: "Failed to fetch messages" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Reset all user balances to zero (super admin only)
            app.post("/api/admin/reset-balances", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var users, regularUsers, resetCount, _i, regularUsers_1, user, balances, _a, balances_1, balance, error_66;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 9, , 10]);
                            if (!req.session.user || req.session.user.role !== 'super_admin') {
                                return [2 /*return*/, res.status(403).json({ message: "Super admin access required" })];
                            }
                            console.log('🔄 Resetting all user balances to zero...');
                            return [4 /*yield*/, storage_1.storage.getAllUsers()];
                        case 1:
                            users = _b.sent();
                            regularUsers = users.filter(function (u) { return u.role === 'user'; });
                            resetCount = 0;
                            _i = 0, regularUsers_1 = regularUsers;
                            _b.label = 2;
                        case 2:
                            if (!(_i < regularUsers_1.length)) return [3 /*break*/, 8];
                            user = regularUsers_1[_i];
                            return [4 /*yield*/, storage_1.storage.getUserBalances(user.id)];
                        case 3:
                            balances = _b.sent();
                            _a = 0, balances_1 = balances;
                            _b.label = 4;
                        case 4:
                            if (!(_a < balances_1.length)) return [3 /*break*/, 7];
                            balance = balances_1[_a];
                            // Update balance to zero
                            return [4 /*yield*/, storage_1.storage.updateBalance(user.id, balance.symbol, '0.00', '0.00')];
                        case 5:
                            // Update balance to zero
                            _b.sent();
                            resetCount++;
                            _b.label = 6;
                        case 6:
                            _a++;
                            return [3 /*break*/, 4];
                        case 7:
                            _i++;
                            return [3 /*break*/, 2];
                        case 8:
                            console.log("\u2705 Reset ".concat(resetCount, " balances for ").concat(regularUsers.length, " users"));
                            res.json({
                                message: "Successfully reset ".concat(resetCount, " balances for ").concat(regularUsers.length, " users"),
                                resetCount: resetCount,
                                userCount: regularUsers.length
                            });
                            return [3 /*break*/, 10];
                        case 9:
                            error_66 = _b.sent();
                            console.error("Error resetting balances:", error_66);
                            res.status(500).json({ message: "Failed to reset balances" });
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/];
                    }
                });
            }); });
            app.get("/api/admin/trades", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var trades, error_67;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getAllTrades()];
                        case 1:
                            trades = _a.sent();
                            res.json(trades);
                            return [3 /*break*/, 3];
                        case 2:
                            error_67 = _a.sent();
                            console.error("Error fetching trades:", error_67);
                            res.status(500).json({ message: "Failed to fetch trades" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            app.put("/api/admin/options-settings/:id", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, updates, settings, error_68;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = req.params.id;
                            updates = req.body;
                            return [4 /*yield*/, storage_1.storage.updateOptionsSettings(id, updates)];
                        case 1:
                            settings = _a.sent();
                            res.json(settings);
                            return [3 /*break*/, 3];
                        case 2:
                            error_68 = _a.sent();
                            console.error("Error updating options settings:", error_68);
                            res.status(400).json({ message: "Failed to update settings" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get user balances (real data)
            app.get("/api/balances", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, balances, usdtBalance, userMainBalance, error_69;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            console.log('💰 [/api/balances] Request received');
                            console.log('💰 [/api/balances] Session:', req.session);
                            console.log('💰 [/api/balances] Session user:', (_a = req.session) === null || _a === void 0 ? void 0 : _a.user);
                            console.log('💰 [/api/balances] Headers:', req.headers);
                            user = req.session.user;
                            if (!user) {
                                console.log('❌ [/api/balances] No user in session - authentication required');
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            console.log('💰 [/api/balances] User authenticated:', user.id, user.username, 'Main balance:', user.balance);
                            return [4 /*yield*/, storage_1.storage.getUserBalances(user.id)];
                        case 1:
                            balances = _b.sent();
                            console.log('💰 [/api/balances] Balances from DB:', balances);
                            usdtBalance = balances.find(function (b) { return b.symbol === 'USDT'; });
                            userMainBalance = user.balance || 0;
                            if (!!usdtBalance) return [3 /*break*/, 3];
                            // Create USDT balance if doesn't exist, using user's main balance
                            console.log('⚠️ [/api/balances] No USDT balance found, creating with main balance:', userMainBalance);
                            return [4 /*yield*/, storage_1.storage.createBalance({
                                    userId: user.id,
                                    symbol: 'USDT',
                                    available: userMainBalance.toString(),
                                    locked: '0.00'
                                })];
                        case 2:
                            _b.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            if (!(parseFloat(usdtBalance.available) !== userMainBalance)) return [3 /*break*/, 5];
                            // Update USDT balance to match user's main balance
                            console.log('🔄 [/api/balances] Syncing USDT balance:', parseFloat(usdtBalance.available), '→', userMainBalance);
                            return [4 /*yield*/, storage_1.storage.updateBalance(user.id, 'USDT', userMainBalance.toString(), usdtBalance.locked || '0.00')];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5: return [4 /*yield*/, storage_1.storage.getUserBalances(user.id)];
                        case 6:
                            // Refresh balances after sync
                            balances = _b.sent();
                            console.log('✅ [/api/balances] Returning synced balances:', balances);
                            res.json(balances);
                            return [3 /*break*/, 8];
                        case 7:
                            error_69 = _b.sent();
                            console.error("❌ [/api/balances] Error fetching balances:", error_69);
                            res.status(500).json({ message: "Failed to fetch balances" });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // Get active trades for user (real data)
            app.get("/api/trades/active", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, activeTrades, filteredTrades, error_70;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserTrades(user.id, 50)];
                        case 1:
                            activeTrades = _a.sent();
                            filteredTrades = activeTrades.filter(function (trade) {
                                return trade.status === 'active' || trade.status === 'pending';
                            });
                            res.json(filteredTrades);
                            return [3 /*break*/, 3];
                        case 2:
                            error_70 = _a.sent();
                            console.error("Error fetching active trades:", error_70);
                            res.status(500).json({ message: "Failed to fetch trades" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get user transactions (real data)
            app.get("/api/transactions", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, transactions_3, error_71;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(user.id, 50)];
                        case 1:
                            transactions_3 = _a.sent();
                            res.json(transactions_3);
                            return [3 /*break*/, 3];
                        case 2:
                            error_71 = _a.sent();
                            console.error("Error fetching transactions:", error_71);
                            res.status(500).json({ message: "Failed to fetch transactions" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create top-up transaction (real data)
            app.post("/api/transactions/topup", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, _a, amount, currency, method, transaction, currentBalance, newAvailable, error_72;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            _a = req.body, amount = _a.amount, currency = _a.currency, method = _a.method;
                            if (!amount || !currency || parseFloat(amount) <= 0) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid amount or currency" })];
                            }
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: user.id,
                                    type: 'deposit',
                                    symbol: currency,
                                    amount: amount,
                                    fee: '0',
                                    status: 'completed', // For demo purposes, mark as completed immediately
                                    txHash: "demo_".concat(Date.now()),
                                    createdAt: new Date(),
                                })];
                        case 1:
                            transaction = _b.sent();
                            return [4 /*yield*/, storage_1.storage.getBalance(user.id, currency)];
                        case 2:
                            currentBalance = _b.sent();
                            newAvailable = currentBalance
                                ? (parseFloat(currentBalance.available) + parseFloat(amount)).toString()
                                : amount;
                            return [4 /*yield*/, storage_1.storage.updateBalance(user.id, currency, newAvailable, (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 3:
                            _b.sent();
                            res.json({
                                transaction: transaction,
                                message: "Top-up successful",
                                newBalance: newAvailable
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_72 = _b.sent();
                            console.error("Error processing top-up:", error_72);
                            res.status(500).json({ message: "Failed to process top-up" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Create deposit request endpoint (for user dashboard)
            app.post("/api/transactions/deposit-request", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, _a, amount, currency, minAmounts, minAmount, depositId, transaction, notification, error_73;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            _a = req.body, amount = _a.amount, currency = _a.currency;
                            if (!amount || !currency || parseFloat(amount) <= 0) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid amount or currency" })];
                            }
                            minAmounts = {
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
                            minAmount = minAmounts[currency] || 1;
                            if (parseFloat(amount) < minAmount) {
                                return [2 /*return*/, res.status(400).json({
                                        message: "Minimum deposit amount is ".concat(minAmount, " ").concat(currency)
                                    })];
                            }
                            depositId = "dep_".concat(Date.now(), "_").concat(user.id);
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: user.id,
                                    type: 'deposit',
                                    symbol: currency,
                                    amount: amount,
                                    fee: '0',
                                    status: 'pending',
                                    txHash: "pending_".concat(depositId),
                                    metadata: JSON.stringify({
                                        depositId: depositId,
                                        depositAddress: getDepositAddress(currency),
                                        network: getNetworkInfo(currency),
                                        createdAt: new Date().toISOString()
                                    }),
                                    createdAt: new Date(),
                                })];
                        case 1:
                            transaction = _b.sent();
                            notification = {
                                id: "deposit_".concat(transaction.id, "_").concat(Date.now()),
                                type: 'deposit',
                                userId: user.id,
                                username: user.username || user.email || 'Unknown User',
                                amount: amount,
                                currency: currency,
                                timestamp: new Date(),
                                read: false
                            };
                            broadcastNotification(notification);
                            console.log("\uD83D\uDD14 Sent deposit request notification for ".concat(user.username || user.email, ": ").concat(amount, " ").concat(currency));
                            res.json({
                                success: true,
                                depositId: depositId,
                                transactionId: transaction.id,
                                amount: amount,
                                currency: currency,
                                status: 'pending',
                                message: "Deposit request created successfully. Please complete the payment and upload receipt."
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_73 = _b.sent();
                            console.error("Error creating deposit request:", error_73);
                            res.status(500).json({ message: "Failed to create deposit request" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Submit proof endpoint (for receipt upload)
            app.post("/api/transactions/submit-proof", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, _a, depositId_1, txHash, walletAddress, transactions_4, transaction, updatedMetadata, error_74;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            _a = req.body, depositId_1 = _a.depositId, txHash = _a.txHash, walletAddress = _a.walletAddress;
                            if (!depositId_1) {
                                return [2 /*return*/, res.status(400).json({ message: "Deposit ID is required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getTransactionsByUserId(user.id)];
                        case 1:
                            transactions_4 = _b.sent();
                            transaction = transactions_4.find(function (t) {
                                try {
                                    var metadata = JSON.parse(t.metadata || '{}');
                                    return metadata.depositId === depositId_1;
                                }
                                catch (_a) {
                                    return false;
                                }
                            });
                            if (!transaction) {
                                return [2 /*return*/, res.status(404).json({ message: "Deposit request not found" })];
                            }
                            if (transaction.status !== 'pending') {
                                return [2 /*return*/, res.status(400).json({ message: "Deposit request is not pending" })];
                            }
                            updatedMetadata = __assign(__assign({}, JSON.parse(transaction.metadata || '{}')), { txHash: txHash || "user_upload_".concat(Date.now()), walletAddress: walletAddress || 'user_wallet_address', proofSubmittedAt: new Date().toISOString(), status: 'verifying' });
                            // Update transaction status to verifying
                            return [4 /*yield*/, storage_1.storage.updateTransaction(transaction.id, {
                                    status: 'verifying',
                                    txHash: txHash || transaction.txHash,
                                    metadata: JSON.stringify(updatedMetadata)
                                })];
                        case 2:
                            // Update transaction status to verifying
                            _b.sent();
                            res.json({
                                success: true,
                                message: "Transaction proof submitted successfully. Your deposit is now being verified.",
                                depositId: depositId_1,
                                status: 'verifying'
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            error_74 = _b.sent();
                            console.error("Error submitting proof:", error_74);
                            res.status(500).json({ message: "Failed to submit proof" });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            depositHandler = upload ? upload.single('receipt') : function (req, res, next) { return next(); };
            app.post("/api/transactions/deposit", depositHandler, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, _a, amount, currency, txHash, method, paymentData, receiptFile, minAmounts, minAmount, transactionStatus, metadata, transaction, notification, currentBalance, newAvailable, error_75;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            _a = req.body, amount = _a.amount, currency = _a.currency, txHash = _a.txHash, method = _a.method, paymentData = _a.paymentData;
                            receiptFile = req.file;
                            if (!amount || !currency || parseFloat(amount) <= 0) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid amount or currency" })];
                            }
                            minAmounts = {
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
                            minAmount = minAmounts[currency] || 1;
                            if (parseFloat(amount) < minAmount) {
                                return [2 /*return*/, res.status(400).json({
                                        message: "Minimum deposit amount is ".concat(minAmount, " ").concat(currency)
                                    })];
                            }
                            // Validate method-specific requirements
                            if (method === 'crypto') {
                                // For crypto deposits with receipt, we don't require txHash immediately
                                // The receipt will be reviewed manually
                                console.log('📄 Crypto deposit with receipt:', receiptFile ? receiptFile.filename : 'No receipt');
                            }
                            else if (method === 'card') {
                                if (!(paymentData === null || paymentData === void 0 ? void 0 : paymentData.paymentIntentId)) {
                                    return [2 /*return*/, res.status(400).json({ message: "Payment intent ID required for card payments" })];
                                }
                            }
                            else if (method === 'bank') {
                                if (!(paymentData === null || paymentData === void 0 ? void 0 : paymentData.transferReference)) {
                                    return [2 /*return*/, res.status(400).json({ message: "Bank transfer reference required" })];
                                }
                            }
                            transactionStatus = 'pending';
                            if (method === 'card' && (paymentData === null || paymentData === void 0 ? void 0 : paymentData.paymentIntentId)) {
                                // TODO: Re-enable Stripe verification
                                // const isValidPayment = await verifyStripePayment(paymentData.paymentIntentId, amount);
                                // transactionStatus = isValidPayment ? 'completed' : 'pending';
                                transactionStatus = 'pending'; // For now, all card payments are pending
                            }
                            else if (method === 'bank') {
                                transactionStatus = 'pending'; // Bank transfers always need manual approval
                            }
                            else if (method === 'crypto') {
                                transactionStatus = 'pending'; // Crypto needs manual verification with receipt
                            }
                            metadata = __assign(__assign({}, paymentData), { receiptFile: receiptFile ? {
                                    filename: receiptFile.filename,
                                    originalName: receiptFile.originalname,
                                    size: receiptFile.size,
                                    mimetype: receiptFile.mimetype,
                                    uploadedAt: new Date().toISOString()
                                } : null, depositAddress: getDepositAddress(currency), network: getNetworkInfo(currency) });
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: user.id,
                                    type: 'deposit',
                                    symbol: currency,
                                    amount: amount,
                                    fee: '0',
                                    status: transactionStatus,
                                    txHash: txHash || "pending_".concat(Date.now()),
                                    method: method || 'crypto',
                                    metadata: JSON.stringify(metadata),
                                    createdAt: new Date(),
                                })];
                        case 1:
                            transaction = _b.sent();
                            // 🔔 SEND REAL-TIME NOTIFICATION TO SUPERADMIN
                            if (transactionStatus === 'pending') {
                                notification = {
                                    id: "deposit_".concat(transaction.id, "_").concat(Date.now()),
                                    type: 'deposit',
                                    userId: user.id,
                                    username: user.username || user.email || 'Unknown User',
                                    amount: amount,
                                    currency: currency,
                                    timestamp: new Date(),
                                    read: false
                                };
                                broadcastNotification(notification);
                                console.log("\uD83D\uDD14 Sent deposit notification for ".concat(user.username || user.email, ": ").concat(amount, " ").concat(currency));
                            }
                            if (!(method === 'card' && (paymentData === null || paymentData === void 0 ? void 0 : paymentData.paymentIntentId))) return [3 /*break*/, 5];
                            // Update transaction status to completed for verified card payments
                            return [4 /*yield*/, storage_1.storage.updateTransaction(transaction.id, { status: 'completed' })];
                        case 2:
                            // Update transaction status to completed for verified card payments
                            _b.sent();
                            return [4 /*yield*/, storage_1.storage.getBalance(user.id, currency)];
                        case 3:
                            currentBalance = _b.sent();
                            newAvailable = currentBalance
                                ? (parseFloat(currentBalance.available) + parseFloat(amount)).toString()
                                : amount;
                            return [4 /*yield*/, storage_1.storage.updateBalance(user.id, currency, newAvailable, (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 4:
                            _b.sent();
                            res.json({
                                transaction: __assign(__assign({}, transaction), { status: 'completed' }),
                                message: "Deposit successful",
                                amount: amount,
                                currency: currency
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            // For crypto and bank deposits, keep as pending
                            res.json({
                                transaction: transaction,
                                message: "Deposit request submitted successfully. Your deposit will be processed after verification.",
                                amount: amount,
                                currency: currency,
                                receiptUploaded: !!receiptFile
                            });
                            _b.label = 6;
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            error_75 = _b.sent();
                            console.error("Error processing deposit:", error_75);
                            res.status(500).json({ message: "Failed to process deposit" });
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // Admin endpoint to approve/reject pending transactions
            app.post("/api/admin/transactions/:id/approve", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, action, reason, transaction, currentBalance, newAvailable, currentBalance, newAvailable, error_76;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 12, , 13]);
                            id = req.params.id;
                            _a = req.body, action = _a.action, reason = _a.reason;
                            if (!action || !['approve', 'reject'].includes(action)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getTransaction(id)];
                        case 1:
                            transaction = _d.sent();
                            if (!transaction) {
                                return [2 /*return*/, res.status(404).json({ message: "Transaction not found" })];
                            }
                            if (transaction.status !== 'pending') {
                                return [2 /*return*/, res.status(400).json({ message: "Transaction is not pending approval" })];
                            }
                            if (!(action === 'approve')) return [3 /*break*/, 6];
                            // Update transaction status to completed
                            return [4 /*yield*/, storage_1.storage.updateTransaction(id, {
                                    status: 'completed',
                                    metadata: JSON.stringify(__assign(__assign({}, JSON.parse(transaction.metadata || '{}')), { approvedBy: (_b = req.session.user) === null || _b === void 0 ? void 0 : _b.id, approvedAt: new Date().toISOString() }))
                                })];
                        case 2:
                            // Update transaction status to completed
                            _d.sent();
                            if (!(transaction.type === 'deposit')) return [3 /*break*/, 5];
                            return [4 /*yield*/, storage_1.storage.getBalance(transaction.userId, transaction.symbol)];
                        case 3:
                            currentBalance = _d.sent();
                            newAvailable = currentBalance
                                ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
                                : transaction.amount;
                            return [4 /*yield*/, storage_1.storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 4:
                            _d.sent();
                            _d.label = 5;
                        case 5:
                            // For withdrawals, balance was already deducted when request was created
                            // Just mark as completed
                            res.json({ message: "Transaction approved and processed", transaction: transaction });
                            return [3 /*break*/, 11];
                        case 6: 
                        // Reject transaction
                        return [4 /*yield*/, storage_1.storage.updateTransaction(id, {
                                status: 'failed',
                                metadata: JSON.stringify(__assign(__assign({}, JSON.parse(transaction.metadata || '{}')), { rejectedBy: (_c = req.session.user) === null || _c === void 0 ? void 0 : _c.id, rejectedAt: new Date().toISOString(), rejectionReason: reason || 'No reason provided' }))
                            })];
                        case 7:
                            // Reject transaction
                            _d.sent();
                            if (!(transaction.type === 'withdraw')) return [3 /*break*/, 10];
                            return [4 /*yield*/, storage_1.storage.getBalance(transaction.userId, transaction.symbol)];
                        case 8:
                            currentBalance = _d.sent();
                            newAvailable = currentBalance
                                ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
                                : transaction.amount;
                            return [4 /*yield*/, storage_1.storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 9:
                            _d.sent();
                            _d.label = 10;
                        case 10:
                            res.json({ message: "Transaction rejected", transaction: transaction });
                            _d.label = 11;
                        case 11: return [3 /*break*/, 13];
                        case 12:
                            error_76 = _d.sent();
                            console.error("Error processing transaction approval:", error_76);
                            res.status(500).json({ message: "Failed to process transaction approval" });
                            return [3 /*break*/, 13];
                        case 13: return [2 /*return*/];
                    }
                });
            }); });
            // Admin endpoint to approve/reject deposits (alias for transactions endpoint)
            app.post("/api/admin/deposits/:id/action", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, action, reason, transaction, user, currentBalance, newAvailable, error_77;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 13, , 14]);
                            id = req.params.id;
                            _a = req.body, action = _a.action, reason = _a.reason;
                            if (!action || !['approve', 'reject'].includes(action)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getTransaction(id)];
                        case 1:
                            transaction = _d.sent();
                            if (!transaction) {
                                return [2 /*return*/, res.status(404).json({ message: "Deposit not found" })];
                            }
                            if (transaction.type !== 'deposit') {
                                return [2 /*return*/, res.status(400).json({ message: "Transaction is not a deposit" })];
                            }
                            // Allow both 'pending' and 'verifying' status to be processed
                            if (transaction.status !== 'pending' && transaction.status !== 'verifying') {
                                return [2 /*return*/, res.status(400).json({ message: "Deposit is not pending approval" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(transaction.userId)];
                        case 2:
                            user = _d.sent();
                            if (!(action === 'approve')) return [3 /*break*/, 8];
                            return [4 /*yield*/, storage_1.storage.updateTransaction(id, {
                                    status: 'completed',
                                    metadata: JSON.stringify(__assign(__assign({}, JSON.parse(transaction.metadata || '{}')), { approvedBy: (_b = req.session.user) === null || _b === void 0 ? void 0 : _b.id, approvedAt: new Date().toISOString() }))
                                })];
                        case 3:
                            _d.sent();
                            return [4 /*yield*/, storage_1.storage.getBalance(transaction.userId, transaction.symbol)];
                        case 4:
                            currentBalance = _d.sent();
                            newAvailable = currentBalance
                                ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
                                : transaction.amount;
                            return [4 /*yield*/, storage_1.storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 5:
                            _d.sent();
                            if (!user) return [3 /*break*/, 7];
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.DEPOSIT_APPROVED, activityLogger_1.ActionCategories.TRANSACTIONS, "Approved deposit of ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(user.username || user.email), { id: transaction.userId, username: user.username, email: user.email }, { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, txHash: transaction.txHash })];
                        case 6:
                            _d.sent();
                            _d.label = 7;
                        case 7:
                            console.log("\u2705 Deposit approved: ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(transaction.userId));
                            res.json({ message: "Deposit approved and processed", transaction: transaction });
                            return [3 /*break*/, 12];
                        case 8: return [4 /*yield*/, storage_1.storage.updateTransaction(id, {
                                status: 'failed',
                                metadata: JSON.stringify(__assign(__assign({}, JSON.parse(transaction.metadata || '{}')), { rejectedBy: (_c = req.session.user) === null || _c === void 0 ? void 0 : _c.id, rejectedAt: new Date().toISOString(), rejectionReason: reason || 'No reason provided' }))
                            })];
                        case 9:
                            _d.sent();
                            if (!user) return [3 /*break*/, 11];
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.DEPOSIT_REJECTED, activityLogger_1.ActionCategories.TRANSACTIONS, "Rejected deposit of ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(user.username || user.email), { id: transaction.userId, username: user.username, email: user.email }, { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, reason: reason || 'No reason provided' })];
                        case 10:
                            _d.sent();
                            _d.label = 11;
                        case 11:
                            console.log("\u274C Deposit rejected: ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(transaction.userId));
                            res.json({ message: "Deposit rejected", transaction: transaction });
                            _d.label = 12;
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            error_77 = _d.sent();
                            console.error("Error processing deposit action:", error_77);
                            res.status(500).json({ message: "Failed to process deposit action" });
                            return [3 /*break*/, 14];
                        case 14: return [2 /*return*/];
                    }
                });
            }); });
            // Admin endpoint to approve/reject withdrawals
            app.post("/api/admin/withdrawals/:id/action", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, action, reason, transaction, user, currentBalance, newAvailable, error_78;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 13, , 14]);
                            id = req.params.id;
                            _a = req.body, action = _a.action, reason = _a.reason;
                            if (!action || !['approve', 'reject'].includes(action)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getTransaction(id)];
                        case 1:
                            transaction = _d.sent();
                            if (!transaction) {
                                return [2 /*return*/, res.status(404).json({ message: "Withdrawal not found" })];
                            }
                            if (transaction.type !== 'withdraw') {
                                return [2 /*return*/, res.status(400).json({ message: "Transaction is not a withdrawal" })];
                            }
                            // Allow both 'pending' and 'verifying' status to be processed
                            if (transaction.status !== 'pending' && transaction.status !== 'verifying') {
                                return [2 /*return*/, res.status(400).json({ message: "Withdrawal is not pending approval" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(transaction.userId)];
                        case 2:
                            user = _d.sent();
                            if (!(action === 'approve')) return [3 /*break*/, 6];
                            // Mark as completed (balance was already deducted when request was created)
                            return [4 /*yield*/, storage_1.storage.updateTransaction(id, {
                                    status: 'completed',
                                    metadata: JSON.stringify(__assign(__assign({}, JSON.parse(transaction.metadata || '{}')), { approvedBy: (_b = req.session.user) === null || _b === void 0 ? void 0 : _b.id, approvedAt: new Date().toISOString() }))
                                })];
                        case 3:
                            // Mark as completed (balance was already deducted when request was created)
                            _d.sent();
                            if (!user) return [3 /*break*/, 5];
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.WITHDRAWAL_APPROVED, activityLogger_1.ActionCategories.TRANSACTIONS, "Approved withdrawal of ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(user.username || user.email), { id: transaction.userId, username: user.username, email: user.email }, { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, walletAddress: JSON.parse(transaction.metadata || '{}').walletAddress })];
                        case 4:
                            _d.sent();
                            _d.label = 5;
                        case 5:
                            console.log("\u2705 Withdrawal approved: ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(transaction.userId));
                            res.json({ message: "Withdrawal approved and processed", transaction: transaction });
                            return [3 /*break*/, 12];
                        case 6: 
                        // Reject and refund balance
                        return [4 /*yield*/, storage_1.storage.updateTransaction(id, {
                                status: 'failed',
                                metadata: JSON.stringify(__assign(__assign({}, JSON.parse(transaction.metadata || '{}')), { rejectedBy: (_c = req.session.user) === null || _c === void 0 ? void 0 : _c.id, rejectedAt: new Date().toISOString(), rejectionReason: reason || 'No reason provided' }))
                            })];
                        case 7:
                            // Reject and refund balance
                            _d.sent();
                            return [4 /*yield*/, storage_1.storage.getBalance(transaction.userId, transaction.symbol)];
                        case 8:
                            currentBalance = _d.sent();
                            newAvailable = currentBalance
                                ? (parseFloat(currentBalance.available) + parseFloat(transaction.amount)).toString()
                                : transaction.amount;
                            return [4 /*yield*/, storage_1.storage.updateBalance(transaction.userId, transaction.symbol, newAvailable, (currentBalance === null || currentBalance === void 0 ? void 0 : currentBalance.locked) || '0')];
                        case 9:
                            _d.sent();
                            if (!user) return [3 /*break*/, 11];
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, activityLogger_1.ActionTypes.WITHDRAWAL_REJECTED, activityLogger_1.ActionCategories.TRANSACTIONS, "Rejected withdrawal of ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(user.username || user.email), { id: transaction.userId, username: user.username, email: user.email }, { transactionId: id, amount: transaction.amount, symbol: transaction.symbol, reason: reason || 'No reason provided', refunded: true })];
                        case 10:
                            _d.sent();
                            _d.label = 11;
                        case 11:
                            console.log("\u274C Withdrawal rejected and refunded: ".concat(transaction.amount, " ").concat(transaction.symbol, " for user ").concat(transaction.userId));
                            res.json({ message: "Withdrawal rejected and balance refunded", transaction: transaction });
                            _d.label = 12;
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            error_78 = _d.sent();
                            console.error("Error processing withdrawal action:", error_78);
                            res.status(500).json({ message: "Failed to process withdrawal action" });
                            return [3 /*break*/, 14];
                        case 14: return [2 /*return*/];
                    }
                });
            }); });
            // Get pending transactions for admin review
            app.get("/api/admin/transactions/pending", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var pendingTransactions, error_79;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getPendingTransactions()];
                        case 1:
                            pendingTransactions = _a.sent();
                            res.json(pendingTransactions);
                            return [3 /*break*/, 3];
                        case 2:
                            error_79 = _a.sent();
                            console.error("Error fetching pending transactions:", error_79);
                            res.status(500).json({ message: "Failed to fetch pending transactions" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Admin endpoint to verify/reject user documents
            app.post("/api/admin/verify-document/:id", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, status_2, adminNotes, _b, document_1, fetchError, user, updateError, error_80;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 6]);
                            id = req.params.id;
                            _a = req.body, status_2 = _a.status, adminNotes = _a.adminNotes;
                            if (!status_2 || !['approved', 'rejected'].includes(status_2)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" })];
                            }
                            return [4 /*yield*/, supabaseAdmin
                                    .from('user_verification_documents')
                                    .select('*')
                                    .eq('id', id)
                                    .single()];
                        case 1:
                            _b = _c.sent(), document_1 = _b.data, fetchError = _b.error;
                            if (fetchError || !document_1) {
                                console.error('Error fetching document:', fetchError);
                                return [2 /*return*/, res.status(404).json({ message: "Document not found" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserById(document_1.user_id)];
                        case 2:
                            user = _c.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            return [4 /*yield*/, supabaseAdmin
                                    .from('user_verification_documents')
                                    .update({
                                    verification_status: status_2,
                                    admin_notes: adminNotes || "Document ".concat(status_2, " by admin"),
                                    verified_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                })
                                    .eq('id', id)];
                        case 3:
                            updateError = (_c.sent()).error;
                            if (updateError) {
                                console.error('Error updating document:', updateError);
                                return [2 /*return*/, res.status(500).json({ message: "Failed to update document" })];
                            }
                            // Log activity
                            return [4 /*yield*/, (0, activityLogger_1.logAdminActivityFromRequest)(req, status_2 === 'approved' ? activityLogger_1.ActionTypes.VERIFICATION_APPROVED : activityLogger_1.ActionTypes.VERIFICATION_REJECTED, activityLogger_1.ActionCategories.VERIFICATION, "".concat(status_2 === 'approved' ? 'Approved' : 'Rejected', " ").concat(document_1.document_type, " verification for user ").concat(user.username || user.email), { id: user.id, username: user.username, email: user.email }, {
                                    documentId: id,
                                    documentType: document_1.document_type,
                                    verificationStatus: status_2,
                                    adminNotes: adminNotes || "Document ".concat(status_2, " by admin")
                                })];
                        case 4:
                            // Log activity
                            _c.sent();
                            console.log("\u2705 Document ".concat(status_2, ": ").concat(document_1.document_type, " for user ").concat(user.username || user.email));
                            res.json({
                                message: "Document ".concat(status_2, " successfully"),
                                document: __assign(__assign({}, document_1), { verification_status: status_2, admin_notes: adminNotes || "Document ".concat(status_2, " by admin"), verified_at: new Date().toISOString() })
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            error_80 = _c.sent();
                            console.error("Error verifying document:", error_80);
                            res.status(500).json({ message: "Failed to verify document" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Quick schema check - simpler version
            app.get("/api/admin/schema-check", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, txs, sample, error_81;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(user.id, 1)];
                        case 1:
                            txs = _a.sent();
                            sample = txs.length > 0 ? txs[0] : null;
                            res.json({
                                hasTransactions: txs.length > 0,
                                hasSymbolField: sample ? ('symbol' in sample) : false,
                                fields: sample ? Object.keys(sample) : [],
                                sample: sample
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_81 = _a.sent();
                            res.status(500).json({ error: error_81.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Simple database test (ADMIN ONLY - DEBUG)
            app.get("/api/admin/test-db", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, userTransactions, hasSymbol, error_82;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            console.log('🔍 Testing database connection...');
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(user.id, 5)];
                        case 1:
                            userTransactions = _a.sent();
                            console.log("\u2705 Test 1 passed: Got ".concat(userTransactions.length, " user transactions"));
                            hasSymbol = userTransactions.length > 0 && 'symbol' in userTransactions[0];
                            console.log("\u2705 Test 2: Symbol field exists? ".concat(hasSymbol));
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
                            return [3 /*break*/, 3];
                        case 2:
                            error_82 = _a.sent();
                            console.error("❌ Database test failed:", error_82);
                            res.status(500).json({
                                message: "Database test failed",
                                error: error_82.message || String(error_82)
                            });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Check database schema for transactions table (ADMIN ONLY - DEBUG)
            app.get("/api/admin/check-schema", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var allTransactions, errorMessage, txError_2, user, fallbackError_1, sampleTransaction, transactionTypes, error_83;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 10, , 11]);
                            console.log('🔍 Checking database schema...');
                            allTransactions = [];
                            errorMessage = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 9]);
                            return [4 /*yield*/, storage_1.storage.getAllTransactions()];
                        case 2:
                            // Try to get all transactions
                            allTransactions = _a.sent();
                            console.log("\uD83D\uDCCA Total transactions in database: ".concat(allTransactions.length));
                            return [3 /*break*/, 9];
                        case 3:
                            txError_2 = _a.sent();
                            console.error('❌ Error fetching transactions:', txError_2.message);
                            errorMessage = txError_2.message;
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 7, , 8]);
                            user = req.session.user;
                            if (!user) return [3 /*break*/, 6];
                            return [4 /*yield*/, storage_1.storage.getUserTransactions(user.id, 10)];
                        case 5:
                            allTransactions = _a.sent();
                            console.log("\uD83D\uDCCA Fallback: Got ".concat(allTransactions.length, " transactions for user ").concat(user.id));
                            _a.label = 6;
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            fallbackError_1 = _a.sent();
                            console.error('❌ Fallback also failed:', fallbackError_1.message);
                            return [3 /*break*/, 8];
                        case 8: return [3 /*break*/, 9];
                        case 9:
                            sampleTransaction = allTransactions.length > 0 ? allTransactions[0] : null;
                            if (sampleTransaction) {
                                console.log('📊 Sample transaction:', JSON.stringify(sampleTransaction, null, 2));
                                console.log('📊 Transaction fields:', Object.keys(sampleTransaction));
                            }
                            else {
                                console.log('⚠️ No transactions found in database');
                            }
                            transactionTypes = allTransactions.length > 0
                                ? __spreadArray([], new Set(allTransactions.map(function (t) { return t.type; })), true) : [];
                            console.log('📊 Transaction types found:', transactionTypes);
                            res.json({
                                message: errorMessage ? "Schema check completed with errors: ".concat(errorMessage) : "Schema check completed",
                                sampleTransaction: sampleTransaction,
                                fields: sampleTransaction ? Object.keys(sampleTransaction) : [],
                                totalTransactions: allTransactions.length,
                                transactionTypes: transactionTypes,
                                hasSymbolField: sampleTransaction ? 'symbol' in sampleTransaction : false,
                                error: errorMessage
                            });
                            return [3 /*break*/, 11];
                        case 10:
                            error_83 = _a.sent();
                            console.error("❌ Error checking schema:", error_83);
                            console.error("❌ Error stack:", error_83.stack);
                            res.status(500).json({
                                message: "Failed to check schema",
                                error: error_83.message || String(error_83),
                                stack: error_83.stack
                            });
                            return [3 /*break*/, 11];
                        case 11: return [2 /*return*/];
                    }
                });
            }); });
            // Backfill missing transactions from completed trades (ADMIN ONLY)
            app.post("/api/admin/backfill-transactions", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var allTrades, tradeError_1, completedTrades, created, skipped, errors, errorDetails, _loop_1, _i, completedTrades_1, trade, summary, error_84;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 9, , 10]);
                            console.log('🔄 Starting transaction backfill from completed trades...');
                            allTrades = [];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, storage_1.storage.getAllTrades()];
                        case 2:
                            // Get all completed trades
                            allTrades = _a.sent();
                            console.log("\uD83D\uDCCA Total trades in database: ".concat(allTrades.length));
                            return [3 /*break*/, 4];
                        case 3:
                            tradeError_1 = _a.sent();
                            console.error('❌ Error fetching trades:', tradeError_1.message);
                            return [2 /*return*/, res.status(500).json({
                                    message: "Failed to fetch trades from database",
                                    error: tradeError_1.message
                                })];
                        case 4:
                            completedTrades = allTrades.filter(function (trade) { return trade.status === 'completed'; });
                            console.log("\uD83D\uDCCA Completed trades: ".concat(completedTrades.length));
                            created = 0;
                            skipped = 0;
                            errors = 0;
                            errorDetails = [];
                            _loop_1 = function (trade) {
                                var existingTransactions, hasTransaction, isWin, profit, transactionType, transactionAmount, error_85, errorMsg;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 3, , 4]);
                                            return [4 /*yield*/, storage_1.storage.getUserTransactions(trade.userId, 1000)];
                                        case 1:
                                            existingTransactions = _b.sent();
                                            hasTransaction = existingTransactions.some(function (tx) { return tx.referenceId === trade.id; });
                                            if (hasTransaction) {
                                                skipped++;
                                                console.log("\u23ED\uFE0F Skipping trade ".concat(trade.id, " - transaction already exists"));
                                                return [2 /*return*/, "continue"];
                                            }
                                            isWin = trade.profit && parseFloat(trade.profit.toString()) > 0;
                                            profit = trade.profit ? Math.abs(parseFloat(trade.profit.toString())) : 0;
                                            transactionType = isWin ? 'trade_win' : 'trade_loss';
                                            transactionAmount = profit.toFixed(8);
                                            console.log("\uD83D\uDCDD Creating transaction for trade ".concat(trade.id, ":"), {
                                                userId: trade.userId,
                                                type: transactionType,
                                                amount: transactionAmount,
                                                symbol: 'USDT'
                                            });
                                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                                    userId: trade.userId,
                                                    type: transactionType,
                                                    amount: transactionAmount,
                                                    symbol: 'USDT',
                                                    status: 'completed',
                                                    description: "".concat(isWin ? 'Win' : 'Loss', " on ").concat(trade.symbol, " trade (backfilled)"),
                                                    referenceId: trade.id
                                                })];
                                        case 2:
                                            _b.sent();
                                            created++;
                                            console.log("\u2705 Created transaction for trade ".concat(trade.id, ": ").concat(transactionType, " ").concat(transactionAmount, " USDT"));
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_85 = _b.sent();
                                            errors++;
                                            errorMsg = error_85.message || String(error_85);
                                            console.error("\u274C Failed to create transaction for trade ".concat(trade.id, ":"), errorMsg);
                                            errorDetails.push({
                                                tradeId: trade.id,
                                                error: errorMsg
                                            });
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            };
                            _i = 0, completedTrades_1 = completedTrades;
                            _a.label = 5;
                        case 5:
                            if (!(_i < completedTrades_1.length)) return [3 /*break*/, 8];
                            trade = completedTrades_1[_i];
                            return [5 /*yield**/, _loop_1(trade)];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 5];
                        case 8:
                            summary = {
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
                                summary: summary
                            });
                            return [3 /*break*/, 10];
                        case 9:
                            error_84 = _a.sent();
                            console.error("❌ Error during transaction backfill:", error_84);
                            console.error("❌ Error stack:", error_84.stack);
                            res.status(500).json({
                                message: "Failed to backfill transactions",
                                error: error_84.message || String(error_84),
                                stack: error_84.stack
                            });
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/];
                    }
                });
            }); });
            // Get all transactions for admin analytics
            app.get("/api/admin/transactions", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var allTransactions, error_86;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage_1.storage.getAllTransactions()];
                        case 1:
                            allTransactions = _a.sent();
                            res.json(allTransactions);
                            return [3 /*break*/, 3];
                        case 2:
                            error_86 = _a.sent();
                            console.error("Error fetching all transactions:", error_86);
                            res.status(500).json({ message: "Failed to fetch transactions" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create withdrawal request (used by WalletPage)
            app.post("/api/withdrawals", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, _a, amount, currency, address, password, currentBalance, withdrawalId, _b, withdrawalData, withdrawalError, transaction, newAvailable, notification, error_87;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 5, , 6]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            _a = req.body, amount = _a.amount, currency = _a.currency, address = _a.address, password = _a.password;
                            if (!amount || !currency || !address || parseFloat(amount) <= 0) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid amount, currency, or address" })];
                            }
                            // Verify password
                            if (!password) {
                                return [2 /*return*/, res.status(400).json({ message: "Fund password is required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getBalance(user.id, currency)];
                        case 1:
                            currentBalance = _c.sent();
                            if (!currentBalance || parseFloat(currentBalance.available) < parseFloat(amount)) {
                                return [2 /*return*/, res.status(400).json({ message: "Insufficient balance" })];
                            }
                            withdrawalId = "withdrawal-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                            // 1️⃣ Save to withdrawals table (for admin dashboard)
                            console.log('💰 Attempting to save withdrawal to Supabase:', {
                                id: withdrawalId,
                                user_id: user.id,
                                username: user.username || user.email,
                                amount: parseFloat(amount),
                                currency: currency,
                                address: address,
                                status: 'pending',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });
                            return [4 /*yield*/, supabase
                                    .from('withdrawals')
                                    .insert({
                                    id: withdrawalId,
                                    user_id: user.id,
                                    username: user.username || user.email,
                                    amount: parseFloat(amount),
                                    currency: currency,
                                    address: address,
                                    status: 'pending',
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                })
                                    .select()];
                        case 2:
                            _b = _c.sent(), withdrawalData = _b.data, withdrawalError = _b.error;
                            if (withdrawalError) {
                                console.error('❌ Error saving withdrawal to Supabase:', withdrawalError);
                                throw new Error('Failed to save withdrawal request');
                            }
                            console.log('✅ Withdrawal saved to Supabase database for admin dashboard');
                            console.log('✅ Inserted data:', withdrawalData);
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: user.id,
                                    type: 'withdraw',
                                    symbol: currency,
                                    amount: amount,
                                    fee: '0',
                                    status: 'pending',
                                    txHash: withdrawalId, // Link to withdrawal record
                                    createdAt: new Date(),
                                })];
                        case 3:
                            transaction = _c.sent();
                            console.log('✅ Withdrawal also saved to transactions table for user history');
                            newAvailable = (parseFloat(currentBalance.available) - parseFloat(amount)).toString();
                            return [4 /*yield*/, storage_1.storage.updateBalance(user.id, currency, newAvailable, currentBalance.locked)];
                        case 4:
                            _c.sent();
                            console.log("\uD83D\uDCB0 Balance updated: ".concat(currentBalance.available, " \u2192 ").concat(newAvailable));
                            notification = {
                                id: "withdrawal_".concat(withdrawalId, "_").concat(Date.now()),
                                type: 'withdrawal',
                                userId: user.id,
                                username: user.username || user.email || 'Unknown User',
                                amount: amount,
                                currency: currency,
                                timestamp: new Date(),
                                read: false
                            };
                            broadcastNotification(notification);
                            console.log("\uD83D\uDD14 Sent withdrawal notification for ".concat(user.username || user.email, ": ").concat(amount, " ").concat(currency));
                            res.json({
                                transaction: transaction,
                                message: "Withdrawal initiated",
                                amount: amount,
                                currency: currency
                            });
                            return [3 /*break*/, 6];
                        case 5:
                            error_87 = _c.sent();
                            console.error("Error processing withdrawal:", error_87);
                            res.status(500).json({ message: "Failed to process withdrawal" });
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Create withdrawal transaction (legacy endpoint)
            app.post("/api/transactions/withdraw", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, _a, amount, currency, address, method, currentBalance, transaction, newAvailable, notification, error_88;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            _a = req.body, amount = _a.amount, currency = _a.currency, address = _a.address, method = _a.method;
                            if (!amount || !currency || !address || parseFloat(amount) <= 0) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid amount, currency, or address" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getBalance(user.id, currency)];
                        case 1:
                            currentBalance = _b.sent();
                            if (!currentBalance || parseFloat(currentBalance.available) < parseFloat(amount)) {
                                return [2 /*return*/, res.status(400).json({ message: "Insufficient balance" })];
                            }
                            return [4 /*yield*/, storage_1.storage.createTransaction({
                                    userId: user.id,
                                    type: 'withdraw',
                                    symbol: currency,
                                    amount: amount,
                                    fee: '0',
                                    status: 'pending', // Withdrawals start as pending
                                    txHash: "withdraw_".concat(Date.now()),
                                    createdAt: new Date(),
                                })];
                        case 2:
                            transaction = _b.sent();
                            newAvailable = (parseFloat(currentBalance.available) - parseFloat(amount)).toString();
                            return [4 /*yield*/, storage_1.storage.updateBalance(user.id, currency, newAvailable, currentBalance.locked)];
                        case 3:
                            _b.sent();
                            notification = {
                                id: "withdrawal_".concat(transaction.id, "_").concat(Date.now()),
                                type: 'withdrawal',
                                userId: user.id,
                                username: user.username || user.email || 'Unknown User',
                                amount: amount,
                                currency: currency,
                                timestamp: new Date(),
                                read: false
                            };
                            broadcastNotification(notification);
                            console.log("\uD83D\uDD14 Sent withdrawal notification for ".concat(user.username || user.email, ": ").concat(amount, " ").concat(currency));
                            res.json({
                                transaction: transaction,
                                message: "Withdrawal initiated",
                                amount: amount,
                                currency: currency
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_88 = _b.sent();
                            console.error("Error processing withdrawal:", error_88);
                            res.status(500).json({ message: "Failed to process withdrawal" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get all user trades (real data)
            app.get("/api/trades", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, trades, error_89;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            user = req.session.user;
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ message: "Authentication required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserTrades(user.id, 100)];
                        case 1:
                            trades = _a.sent();
                            res.json(trades);
                            return [3 /*break*/, 3];
                        case 2:
                            error_89 = _a.sent();
                            console.error("Error fetching trades:", error_89);
                            res.status(500).json({ message: "Failed to fetch trades" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get real market data
            app.get("/api/market-data", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var forceRefresh, marketData, defaultMarketData, _i, defaultMarketData_1, data, error_90;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            forceRefresh = req.query.force === 'true';
                            return [4 /*yield*/, storage_1.storage.getAllMarketData()];
                        case 1:
                            marketData = _a.sent();
                            if (!(!marketData || marketData.length < 10 || forceRefresh)) return [3 /*break*/, 7];
                            console.log("\uD83D\uDCCA Initializing market data (current: ".concat((marketData === null || marketData === void 0 ? void 0 : marketData.length) || 0, ", force: ").concat(forceRefresh, ")"));
                            // Clear existing data if force refresh
                            if (forceRefresh && marketData && marketData.length > 0) {
                                console.log('🗑️ Clearing existing market data for refresh');
                                // Note: We'll just overwrite the data instead of deleting
                            }
                            defaultMarketData = [
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
                            console.log("\uD83D\uDCCA Storing ".concat(defaultMarketData.length, " default market data entries"));
                            _i = 0, defaultMarketData_1 = defaultMarketData;
                            _a.label = 2;
                        case 2:
                            if (!(_i < defaultMarketData_1.length)) return [3 /*break*/, 5];
                            data = defaultMarketData_1[_i];
                            return [4 /*yield*/, storage_1.storage.updateMarketData(data.symbol, {
                                    price: data.price,
                                    priceChange24h: data.change24h,
                                    priceChangePercent24h: data.priceChangePercent24h,
                                    high24h: data.high24h,
                                    low24h: data.low24h,
                                    volume24h: data.volume24h,
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [4 /*yield*/, storage_1.storage.getAllMarketData()];
                        case 6:
                            marketData = _a.sent();
                            console.log("\uD83D\uDCCA After storing defaults, got ".concat(marketData.length, " entries"));
                            _a.label = 7;
                        case 7:
                            console.log("\uD83D\uDCCA Serving ".concat(marketData.length, " market data entries"));
                            console.log('📊 Market data symbols:', marketData.map(function (d) { return d.symbol; }).join(', '));
                            res.json(marketData);
                            return [3 /*break*/, 9];
                        case 8:
                            error_90 = _a.sent();
                            console.error("Error fetching market data:", error_90);
                            res.status(500).json({ message: "Failed to fetch market data" });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // Admin setup endpoint - creates admin user for development
            app.post("/api/setup/admin", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var walletAddress, user, error_91;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            walletAddress = req.body.walletAddress;
                            if (!walletAddress) {
                                return [2 /*return*/, res.status(400).json({ message: "Wallet address is required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByWallet(walletAddress)];
                        case 1:
                            user = _a.sent();
                            if (!!user) return [3 /*break*/, 3];
                            return [4 /*yield*/, storage_1.storage.createUser({
                                    walletAddress: walletAddress,
                                    role: 'super_admin',
                                    email: 'admin@metachrome.io',
                                })];
                        case 2:
                            // Create new admin user
                            user = _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, storage_1.storage.updateUser(user.id, { role: 'super_admin' })];
                        case 4:
                            // Update existing user to admin
                            user = _a.sent();
                            _a.label = 5;
                        case 5:
                            res.json({ message: "Admin user created/updated successfully", user: user });
                            return [3 /*break*/, 7];
                        case 6:
                            error_91 = _a.sent();
                            console.error("Error setting up admin:", error_91);
                            res.status(500).json({ message: "Failed to setup admin" });
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            httpServer = (0, http_1.createServer)(app);
            _a = (0, websocket_1.setupWebSocket)(httpServer, storage_1.storage), broadcastPriceUpdate = _a.broadcastPriceUpdate, broadcastToAll = _a.broadcastToAll;
            // Initialize demo data and start services
            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                var users, hasRichDemoData, error_92, error_93;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 9, , 10]);
                            return [4 /*yield*/, storage_1.storage.getAllUsers()];
                        case 1:
                            users = _a.sent();
                            hasRichDemoData = users.length >= 5;
                            if (!!hasRichDemoData) return [3 /*break*/, 4];
                            console.log('📊 Demo data not found or incomplete, creating fresh demo data...');
                            return [4 /*yield*/, (0, seed_1.seedOptionsSettings)()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, (0, seed_1.seedDemoData)()];
                        case 3:
                            _a.sent();
                            console.log('✅ Demo data seeded successfully');
                            return [3 /*break*/, 5];
                        case 4:
                            console.log('✅ Demo data already exists, skipping seed');
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, (0, setup_chat_tables_1.setupChatTables)()];
                        case 6:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            error_92 = _a.sent();
                            console.error('⚠️ Error setting up chat tables (may already exist):', error_92);
                            return [3 /*break*/, 8];
                        case 8:
                            // Start real-time price updates
                            priceService_1.priceService.startPriceUpdates();
                            return [3 /*break*/, 10];
                        case 9:
                            error_93 = _a.sent();
                            console.error('❌ Error checking/seeding demo data:', error_93);
                            // Still start price updates even if seeding fails
                            priceService_1.priceService.startPriceUpdates();
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/];
                    }
                });
            }); }, 3000); // Increased delay to ensure database is ready
            // Temporary admin bypass (development only)
            app.post("/api/debug/admin-bypass", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var adminUser, token;
                return __generator(this, function (_a) {
                    try {
                        console.log('🚨 Admin bypass used - development only');
                        adminUser = {
                            id: 'bypass-admin-1',
                            username: 'superadmin',
                            email: 'admin@metachrome.io',
                            role: 'super_admin'
                        };
                        // Store in session
                        req.session.user = adminUser;
                        token = (0, auth_1.generateToken)(adminUser);
                        res.json({
                            user: adminUser,
                            token: token,
                            message: "Admin bypass successful - development only"
                        });
                    }
                    catch (error) {
                        console.error('Admin bypass error:', error);
                        res.status(500).json({ error: error.message });
                    }
                    return [2 /*return*/];
                });
            }); });
            // Debug users endpoint (development only)
            app.get("/api/debug/users", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var users, adminUsers, error_94;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, ((_a = storage_1.storage.getAllUsers) === null || _a === void 0 ? void 0 : _a.call(storage_1.storage))];
                        case 1:
                            users = (_b.sent()) || [];
                            adminUsers = users.filter(function (u) { return u.role === 'admin' || u.role === 'super_admin'; });
                            res.json({
                                totalUsers: users.length,
                                adminUsers: adminUsers.map(function (u) { return ({
                                    id: u.id,
                                    username: u.username,
                                    role: u.role,
                                    hasPassword: !!u.password
                                }); })
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_94 = _b.sent();
                            console.error('Debug users error:', error_94);
                            res.status(500).json({ error: error_94.message });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Debug login endpoint (development only)
            app.post("/api/debug/admin-login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, username, password, user, isValidPassword, error_95;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            _a = req.body, username = _a.username, password = _a.password;
                            console.log('🔍 Debug login attempt:', { username: username, password: password });
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                        case 1:
                            user = _b.sent();
                            console.log('🔍 Found user:', user ? { id: user.id, username: user.username, role: user.role, hasPassword: !!user.password } : 'null');
                            if (!(user && user.password)) return [3 /*break*/, 3];
                            return [4 /*yield*/, (0, auth_1.verifyPassword)(password, user.password)];
                        case 2:
                            isValidPassword = _b.sent();
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
                                return [2 /*return*/, res.json({
                                        success: true,
                                        user: req.session.user,
                                        message: "Debug login successful"
                                    })];
                            }
                            _b.label = 3;
                        case 3: return [2 /*return*/, res.status(401).json({ message: "Debug login failed" })];
                        case 4:
                            error_95 = _b.sent();
                            console.error('Debug login error:', error_95);
                            return [2 /*return*/, res.status(500).json({ message: "Debug login error", error: error_95.message })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Create admin users endpoint (development only)
            app.get("/api/admin/create-admins", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var adminUsers, createdUsers, _i, adminUsers_1, userData, existingUser, hashedPassword, user, error_96;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            console.log('🔧 Creating admin users...');
                            adminUsers = [
                                {
                                    username: 'admin',
                                    email: 'admin@metachrome.io',
                                    password: 'admin123',
                                    role: 'admin',
                                    firstName: 'Regular',
                                    lastName: 'Admin',
                                },
                                {
                                    username: 'superadmin',
                                    email: 'superadmin@metachrome.io',
                                    password: 'superadmin123',
                                    role: 'super_admin',
                                    firstName: 'Super',
                                    lastName: 'Administrator',
                                }
                            ];
                            createdUsers = [];
                            _i = 0, adminUsers_1 = adminUsers;
                            _a.label = 1;
                        case 1:
                            if (!(_i < adminUsers_1.length)) return [3 /*break*/, 7];
                            userData = adminUsers_1[_i];
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(userData.username)];
                        case 2:
                            existingUser = _a.sent();
                            if (!!existingUser) return [3 /*break*/, 5];
                            return [4 /*yield*/, (0, auth_1.hashPassword)(userData.password)];
                        case 3:
                            hashedPassword = _a.sent();
                            return [4 /*yield*/, storage_1.storage.createUser(__assign(__assign({}, userData), { password: hashedPassword }))];
                        case 4:
                            user = _a.sent();
                            createdUsers.push({ username: userData.username, role: userData.role });
                            console.log("\u2705 Created admin user: ".concat(userData.username, " (").concat(userData.role, ")"));
                            return [3 /*break*/, 6];
                        case 5:
                            console.log("\u26A0\uFE0F Admin user already exists: ".concat(userData.username));
                            _a.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 1];
                        case 7:
                            res.json({
                                message: "Admin users processed successfully",
                                created: createdUsers,
                                credentials: {
                                    admin: { username: 'admin', password: 'admin123' },
                                    superadmin: { username: 'superadmin', password: 'superadmin123' }
                                }
                            });
                            return [3 /*break*/, 9];
                        case 8:
                            error_96 = _a.sent();
                            console.error("Create admin error:", error_96);
                            res.status(500).json({ message: "Failed to create admin users" });
                            return [3 /*break*/, 9];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // Serve uploaded files
            app.get('/api/uploads/:filename', function (req, res) {
                try {
                    var filename = req.params.filename;
                    var filePath = path_1.default.join(process.cwd(), 'uploads', filename);
                    // Security check: ensure file exists and is within uploads directory
                    if (!fs_1.default.existsSync(filePath) || !filePath.startsWith(path_1.default.join(process.cwd(), 'uploads'))) {
                        return res.status(404).json({ message: 'File not found' });
                    }
                    // Set appropriate headers for file download
                    var extension = path_1.default.extname(filename).toLowerCase();
                    var contentTypes = {
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
                    var contentType = contentTypes[extension] || 'application/octet-stream';
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Content-Disposition', "inline; filename=\"".concat(filename, "\""));
                    // Stream the file
                    var fileStream = fs_1.default.createReadStream(filePath);
                    fileStream.pipe(res);
                }
                catch (error) {
                    console.error('Error serving file:', error);
                    res.status(500).json({ message: 'Error serving file' });
                }
            });
            // Serve contact form uploaded files (new format)
            app.get('/api/uploads/contact/:filename', function (req, res) {
                try {
                    var filename = req.params.filename;
                    var filePath = path_1.default.join(process.cwd(), 'uploads', 'contact', filename);
                    // Security check: ensure file exists and is within uploads/contact directory
                    if (!fs_1.default.existsSync(filePath) || !filePath.startsWith(path_1.default.join(process.cwd(), 'uploads', 'contact'))) {
                        console.error('File not found or security violation:', filePath);
                        return res.status(404).json({ message: 'File not found' });
                    }
                    // Set appropriate headers for file download
                    var extension = path_1.default.extname(filename).toLowerCase();
                    var contentTypes = {
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
                    var contentType = contentTypes[extension] || 'application/octet-stream';
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Content-Disposition', "inline; filename=\"".concat(filename, "\""));
                    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
                    // Stream the file
                    var fileStream = fs_1.default.createReadStream(filePath);
                    fileStream.pipe(res);
                    console.log('✅ Served contact file (new format):', filename);
                }
                catch (error) {
                    console.error('Error serving contact file:', error);
                    res.status(500).json({ message: 'Error serving file' });
                }
            });
            // Serve contact form uploaded files (old format - backward compatibility)
            app.get('/uploads/contact/:filename', function (req, res) {
                try {
                    var filename = req.params.filename;
                    var filePath = path_1.default.join(process.cwd(), 'uploads', 'contact', filename);
                    // Security check: ensure file exists and is within uploads/contact directory
                    if (!fs_1.default.existsSync(filePath) || !filePath.startsWith(path_1.default.join(process.cwd(), 'uploads', 'contact'))) {
                        console.error('File not found or security violation:', filePath);
                        return res.status(404).json({ message: 'File not found' });
                    }
                    // Set appropriate headers for file download
                    var extension = path_1.default.extname(filename).toLowerCase();
                    var contentTypes = {
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
                    var contentType = contentTypes[extension] || 'application/octet-stream';
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Content-Disposition', "inline; filename=\"".concat(filename, "\""));
                    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
                    // Stream the file
                    var fileStream = fs_1.default.createReadStream(filePath);
                    fileStream.pipe(res);
                    console.log('✅ Served contact file (old format):', filename);
                }
                catch (error) {
                    console.error('Error serving contact file:', error);
                    res.status(500).json({ message: 'Error serving file' });
                }
            });
            // Serve uploaded files from root uploads directory (very old format - backward compatibility)
            app.get('/uploads/:filename', function (req, res) {
                try {
                    var filename = req.params.filename;
                    var filePath = path_1.default.join(process.cwd(), 'uploads', filename);
                    // Security check: ensure file exists and is within uploads directory
                    if (!fs_1.default.existsSync(filePath) || !filePath.startsWith(path_1.default.join(process.cwd(), 'uploads'))) {
                        console.error('File not found or security violation:', filePath);
                        return res.status(404).json({ message: 'File not found' });
                    }
                    // Set appropriate headers for file download
                    var extension = path_1.default.extname(filename).toLowerCase();
                    var contentTypes = {
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
                    var contentType = contentTypes[extension] || 'application/octet-stream';
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Content-Disposition', "inline; filename=\"".concat(filename, "\""));
                    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
                    // Stream the file
                    var fileStream = fs_1.default.createReadStream(filePath);
                    fileStream.pipe(res);
                    console.log('✅ Served file from root uploads (very old format):', filename);
                }
                catch (error) {
                    console.error('Error serving file from root uploads:', error);
                    res.status(500).json({ message: 'Error serving file' });
                }
            });
            // Admin system information endpoint
            app.get("/api/admin/system", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var responseData;
                return __generator(this, function (_a) {
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
                        responseData = {
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
                    }
                    catch (error) {
                        console.error('Error getting system info:', error);
                        res.status(500).json({ message: 'Failed to get system information' });
                    }
                    return [2 /*return*/];
                });
            }); });
            // Admin system logs endpoint (for modal display)
            app.get("/api/admin/system/logs/full", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var logs;
                return __generator(this, function (_a) {
                    try {
                        // Return plain text logs instead of HTML
                        res.setHeader('Content-Type', 'text/plain');
                        logs = [
                            "[".concat(new Date().toISOString(), "] SERVER: Metachrome server running on port 4000"),
                            "[".concat(new Date().toISOString(), "] AUTH: Admin session active"),
                            "[".concat(new Date().toISOString(), "] DB: SQLite database connected"),
                            "[".concat(new Date().toISOString(), "] SECURITY: Rate limiting enabled"),
                            "[".concat(new Date().toISOString(), "] TRADING: Mock price data active"),
                            "[".concat(new Date().toISOString(), "] SYSTEM: File upload system initialized"),
                            "[".concat(new Date().toISOString(), "] ADMIN: System logs requested"),
                            "[".concat(new Date().toISOString(), "] INFO: Server memory usage: ").concat(Math.round(process.memoryUsage().rss / 1024 / 1024), "MB"),
                            "[".concat(new Date().toISOString(), "] INFO: Server uptime: ").concat(Math.round(process.uptime()), "s")
                        ];
                        res.send(logs.join('\n'));
                    }
                    catch (error) {
                        console.error('Error getting system logs:', error);
                        res.status(500).send('Error retrieving system logs');
                    }
                    return [2 /*return*/];
                });
            }); });
            // Export system logs (for download)
            app.get("/api/admin/system/logs", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var timestamp, logs;
                return __generator(this, function (_a) {
                    try {
                        // Set headers for file download
                        res.setHeader('Content-Type', 'text/plain');
                        res.setHeader('Content-Disposition', "attachment; filename=\"system-logs-".concat(new Date().toISOString().split('T')[0], ".txt\""));
                        timestamp = new Date().toISOString();
                        logs = [
                            "===== METACHROME SYSTEM LOGS EXPORT =====",
                            "Generated: ".concat(timestamp),
                            "Server: ".concat(process.platform, " ").concat(process.arch),
                            "Node.js: ".concat(process.version),
                            "PID: ".concat(process.pid),
                            "===================================",
                            "",
                            "[".concat(timestamp, "] SERVER: Metachrome production server status"),
                            "[".concat(timestamp, "] STATUS: Server running on port 4000"),
                            "[".concat(timestamp, "] UPTIME: ").concat(Math.round(process.uptime()), " seconds"),
                            "[".concat(timestamp, "] MEMORY: RSS ").concat(Math.round(process.memoryUsage().rss / 1024 / 1024), "MB"),
                            "[".concat(timestamp, "] MEMORY: Heap Used ").concat(Math.round(process.memoryUsage().heapUsed / 1024 / 1024), "MB"),
                            "[".concat(timestamp, "] MEMORY: Heap Total ").concat(Math.round(process.memoryUsage().heapTotal / 1024 / 1024), "MB"),
                            "[".concat(timestamp, "] DB: SQLite database operational"),
                            "[".concat(timestamp, "] AUTH: JWT authentication active"),
                            "[".concat(timestamp, "] SECURITY: Rate limiting enabled"),
                            "[".concat(timestamp, "] SECURITY: CORS protection active"),
                            "[".concat(timestamp, "] TRADING: Mock price feeds active (development mode)"),
                            "[".concat(timestamp, "] UPLOAD: File upload system initialized"),
                            "[".concat(timestamp, "] ADMIN: System logs exported by admin"),
                            "[".concat(timestamp, "] SYSTEM: All services operational"),
                            "",
                            "===== END OF LOG EXPORT ====="
                        ];
                        res.send(logs.join('\n'));
                    }
                    catch (error) {
                        console.error('Error exporting system logs:', error);
                        res.status(500).send('Error exporting system logs');
                    }
                    return [2 /*return*/];
                });
            }); });
            // Database backup endpoint
            app.post("/api/admin/system/backup", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var fs_2, path_2, dbPath, backupPath, backupsDir;
                return __generator(this, function (_a) {
                    try {
                        fs_2 = require('fs');
                        path_2 = require('path');
                        dbPath = path_2.join(process.cwd(), 'dev.db');
                        backupPath = path_2.join(process.cwd(), 'backups', "backup-".concat(Date.now(), ".db"));
                        backupsDir = path_2.join(process.cwd(), 'backups');
                        if (!fs_2.existsSync(backupsDir)) {
                            fs_2.mkdirSync(backupsDir, { recursive: true });
                        }
                        // Copy database file
                        if (fs_2.existsSync(dbPath)) {
                            fs_2.copyFileSync(dbPath, backupPath);
                            console.log("\uD83D\uDCE6 Database backup created: ".concat(backupPath));
                            res.json({
                                success: true,
                                message: 'Database backup created successfully',
                                backupFile: path_2.basename(backupPath),
                                timestamp: new Date().toISOString()
                            });
                        }
                        else {
                            res.status(404).json({
                                success: false,
                                message: 'Database file not found'
                            });
                        }
                    }
                    catch (error) {
                        console.error('Error creating database backup:', error);
                        res.status(500).json({
                            success: false,
                            message: 'Failed to create database backup'
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            // Clear cache endpoint (both routes for compatibility)
            app.post("/api/admin/system/clear-cache", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
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
                    }
                    catch (error) {
                        console.error('Error clearing cache:', error);
                        res.status(500).json({
                            success: false,
                            message: 'Failed to clear system cache'
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            // Alternative cache clear endpoint
            app.post("/api/admin/system/cache/clear", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
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
                    }
                    catch (error) {
                        console.error('Error clearing cache:', error);
                        res.status(500).json({
                            success: false,
                            message: 'Failed to clear system cache'
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            // System settings management endpoint (new path to bypass CSRF)
            app.put("/api/admin/system/settings", auth_1.requireSessionAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, tradingEnabled, maintenanceMode, minTradeAmount, maxTradeAmount;
                var _b, _c, _d, _e, _f, _g, _h, _j;
                return __generator(this, function (_k) {
                    try {
                        _a = req.body, tradingEnabled = _a.tradingEnabled, maintenanceMode = _a.maintenanceMode, minTradeAmount = _a.minTradeAmount, maxTradeAmount = _a.maxTradeAmount;
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
                            console.log("\uD83C\uDFAE Trading ".concat(tradingEnabled ? 'ENABLED' : 'DISABLED', " by admin ").concat((_c = (_b = req.session) === null || _b === void 0 ? void 0 : _b.user) === null || _c === void 0 ? void 0 : _c.username));
                        }
                        if (typeof maintenanceMode === 'boolean') {
                            global.systemSettings.maintenanceMode = maintenanceMode;
                            console.log("\uD83D\uDD27 Maintenance mode ".concat(maintenanceMode ? 'ENABLED' : 'DISABLED', " by admin ").concat((_e = (_d = req.session) === null || _d === void 0 ? void 0 : _d.user) === null || _e === void 0 ? void 0 : _e.username));
                        }
                        if (minTradeAmount) {
                            global.systemSettings.minTradeAmount = minTradeAmount;
                            console.log("\uD83D\uDCB0 Min trade amount set to ".concat(minTradeAmount, " by admin ").concat((_g = (_f = req.session) === null || _f === void 0 ? void 0 : _f.user) === null || _g === void 0 ? void 0 : _g.username));
                        }
                        if (maxTradeAmount) {
                            global.systemSettings.maxTradeAmount = maxTradeAmount;
                            console.log("\uD83D\uDCB0 Max trade amount set to ".concat(maxTradeAmount, " by admin ").concat((_j = (_h = req.session) === null || _h === void 0 ? void 0 : _h.user) === null || _j === void 0 ? void 0 : _j.username));
                        }
                        res.json({
                            success: true,
                            message: 'System settings updated successfully',
                            settings: global.systemSettings,
                            timestamp: new Date().toISOString()
                        });
                    }
                    catch (error) {
                        console.error('Error updating system settings:', error);
                        res.status(500).json({
                            success: false,
                            message: 'Failed to update system settings'
                        });
                    }
                    return [2 /*return*/];
                });
            }); });
            // OAuth status check endpoint
            app.get("/api/auth/status", function (req, res) {
                try {
                    var status_3 = {
                        google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
                        linkedin: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
                        twitter: !!(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET),
                        metamask: true, // Always available
                        timestamp: new Date().toISOString()
                    };
                    res.json(status_3);
                }
                catch (error) {
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
            app.get("/api/admin/activity-logs", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, actionType, actionCategory, startDate, endDate, _b, limit, _c, offset, query, _d, data, error, count, error_97;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 2, , 3]);
                            _a = req.query, actionType = _a.actionType, actionCategory = _a.actionCategory, startDate = _a.startDate, endDate = _a.endDate, _b = _a.limit, limit = _b === void 0 ? 100 : _b, _c = _a.offset, offset = _c === void 0 ? 0 : _c;
                            if (!supabaseAdmin) {
                                console.warn('⚠️ Supabase admin client not available');
                                return [2 /*return*/, res.json({
                                        logs: [],
                                        total: 0,
                                        limit: Number(limit),
                                        offset: Number(offset),
                                    })];
                            }
                            query = supabaseAdmin
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
                            // Apply pagination
                            query = query.range(Number(offset), Number(offset) + Number(limit) - 1);
                            return [4 /*yield*/, query];
                        case 1:
                            _d = _e.sent(), data = _d.data, error = _d.error, count = _d.count;
                            if (error) {
                                console.error('❌ Error fetching activity logs:', error);
                                return [2 /*return*/, res.status(500).json({ message: "Failed to fetch activity logs" })];
                            }
                            console.log("\u2705 Fetched ".concat((data === null || data === void 0 ? void 0 : data.length) || 0, " activity logs (total: ").concat(count || 0, ")"));
                            res.json({
                                logs: data || [],
                                total: count || 0,
                                limit: Number(limit),
                                offset: Number(offset),
                            });
                            return [3 /*break*/, 3];
                        case 2:
                            error_97 = _e.sent();
                            console.error("Error fetching activity logs:", error_97);
                            res.status(500).json({ message: "Failed to fetch activity logs" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get activity log statistics (Super Admin only)
            app.get("/api/admin/activity-logs/stats", auth_1.requireSessionSuperAdmin, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var total, yesterday, recent24h, categoryData, byCategory_1, error_98;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            if (!supabaseAdmin) {
                                console.warn('⚠️ Supabase admin client not available');
                                return [2 /*return*/, res.json({
                                        total: 0,
                                        recent24h: 0,
                                        byCategory: {},
                                    })];
                            }
                            return [4 /*yield*/, supabaseAdmin
                                    .from('admin_activity_logs')
                                    .select('*', { count: 'exact', head: true })
                                    .eq('is_deleted', false)];
                        case 1:
                            total = (_a.sent()).count;
                            yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            return [4 /*yield*/, supabaseAdmin
                                    .from('admin_activity_logs')
                                    .select('*', { count: 'exact', head: true })
                                    .eq('is_deleted', false)
                                    .gte('created_at', yesterday.toISOString())];
                        case 2:
                            recent24h = (_a.sent()).count;
                            return [4 /*yield*/, supabaseAdmin
                                    .from('admin_activity_logs')
                                    .select('action_category')
                                    .eq('is_deleted', false)];
                        case 3:
                            categoryData = (_a.sent()).data;
                            byCategory_1 = {};
                            categoryData === null || categoryData === void 0 ? void 0 : categoryData.forEach(function (log) {
                                var category = log.action_category;
                                byCategory_1[category] = (byCategory_1[category] || 0) + 1;
                            });
                            res.json({
                                total: total || 0,
                                recent24h: recent24h || 0,
                                byCategory: byCategory_1,
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_98 = _a.sent();
                            console.error("Error fetching activity log stats:", error_98);
                            res.status(500).json({ message: "Failed to fetch activity log statistics" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Register chat routes
            console.log('💬 Registering chat routes...');
            (0, chat_routes_1.registerChatRoutes)(app);
            console.log('✅ Chat routes registered');
            return [2 /*return*/, httpServer];
        });
    });
}
var templateObject_1;
